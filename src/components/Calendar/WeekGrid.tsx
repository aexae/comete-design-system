// WeekGrid — Comète Design System (interne)
// Grille de sélection de semaine : interaction hover/focus/sélection au niveau de la ligne.
import { useState, type ReactElement, type CSSProperties } from "react";
import type { RangeValue, DateValue } from "react-aria-components";
import {
  type CalendarDate,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  getWeeksInMonth,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
import { FocusRing } from "../FocusRing/index.js";
import { MainHeader } from "./MainHeader.js";
import { MonthCalendar } from "./MonthCalendar.js";
import styles from "./WeekGrid.module.css";
import calStyles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Utilitaires internes

/**
 * Calcule le numéro de semaine ISO 8601.
 * Basé sur le jeudi (index 3) de la semaine pour rester dans l'année ISO.
 */
function getISOWeekNumber(date: CalendarDate): number {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const dayNum = d.getUTCDay() || 7; // 1=Lun … 7=Dim
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // avancer au jeudi
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface WeekData {
  weekNumber: number;
  /** 7 jours de la semaine (lun → dim). */
  days: CalendarDate[];
  weekStart: CalendarDate;
  weekEnd: CalendarDate;
  /** Vrai pour les jours hors du mois affiché. */
  isOutsideMonth: boolean[];
}

/** Génère les semaines du mois affiché (6 lignes maximum). */
function getWeeksForMonth(month: CalendarDate, locale: string): WeekData[] {
  const numWeeks = getWeeksInMonth(month, locale);
  const monthStart = startOfMonth(month);
  const firstWeekStart = startOfWeek(monthStart, locale);

  return Array.from({ length: numWeeks }, (_, i) => {
    const weekStart = firstWeekStart.add({ weeks: i });
    const weekEnd = endOfWeek(weekStart, locale);
    const days = Array.from(
      { length: 7 },
      (_, d) => weekStart.add({ days: d })
    );
    const isOutsideMonth = days.map(
      (d) => d.month !== month.month || d.year !== month.year
    );
    // NOTE: On utilise le jeudi (index 3) pour déterminer le numéro ISO correct.
    const weekNumber = getISOWeekNumber(days[3] ?? weekStart);
    return { weekNumber, days, weekStart, weekEnd, isOutsideMonth };
  });
}

/** Retourne les labels d'une seule lettre des jours (ex : "L", "M"…) pour la locale donnée. */
function getDayLabels(locale: string): string[] {
  // NOTE: On utilise le lundi 5 jan 2026 comme point de départ — semaine ISO complète.
  const monday = new Date(2026, 0, 5);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return new Intl.DateTimeFormat(locale, { weekday: "narrow" })
      .format(d)
      .toUpperCase();
  });
}

/** Formate le mois et l'année pour l'en-tête de navigation. */
function formatMonthYear(month: CalendarDate, locale: string): string {
  const d = new Date(month.year, month.month - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(d);
}

type WeekRowState =
  | "selected"
  | "range-start"
  | "range-part"
  | "range-end";

function getRowState(
  weekStart: CalendarDate,
  weekEnd: CalendarDate,
  value?: RangeValue<CalendarDate>
): WeekRowState | undefined {
  if (!value) return undefined;
  const { start, end } = value;

  const matchesStart =
    weekStart.year === start.year &&
    weekStart.month === start.month &&
    weekStart.day === start.day;
  const matchesEnd =
    weekEnd.year === end.year &&
    weekEnd.month === end.month &&
    weekEnd.day === end.day;

  if (matchesStart && matchesEnd) return "selected";
  if (matchesStart) return "range-start";
  if (matchesEnd) return "range-end";
  if (weekStart.compare(start) > 0 && weekEnd.compare(end) < 0) return "range-part";
  return undefined;
}

// -----------------------------------------------------------------------
// Types publics (utilisés par le composant Calendar unifié)

export interface WeekGridProps {
  /** Plage sélectionnée (mode contrôlé). */
  value?: RangeValue<CalendarDate>;
  /** Valeur initiale (mode non contrôlé). */
  defaultValue?: RangeValue<CalendarDate>;
  /** Callback à chaque sélection — la plage est toujours une semaine ISO complète. */
  onChange?: (range: RangeValue<CalendarDate>) => void;
  /**
   * Callback appelé dès le premier clic en mode `period` (avant validation).
   * Reçoit le lundi de la semaine cliquée.
   */
  onIntermediateStart?: (weekStart: CalendarDate) => void;
  /** Locale BCP 47 pour le premier jour de semaine et les noms de jours. @default "fr-FR" */
  locale?: string;
  /** Désactive le composant. */
  isDisabled?: boolean;
  /** Valeur minimale (non utilisée pour la sélection de ligne, réservée à l'affichage futur). */
  minValue?: DateValue;
  /** Valeur maximale. */
  maxValue?: DateValue;
  /**
   * Mode de sélection :
   * - "week"   : un clic sélectionne une semaine unique (défaut)
   * - "period" : premier clic = semaine de début, deuxième clic = semaine de fin
   */
  mode?: "week" | "period";
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Label accessible. */
  "aria-label"?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * WeekGrid — sélecteur de semaine (interne).
 *
 * Affiche une grille par mois avec numéro de semaine et interaction
 * hover/focus/sélection au niveau de la ligne entière.
 * Le bouton heading permet de remonter au sélecteur de mois (drill-up).
 */
export function WeekGrid({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  locale = "fr-FR",
  isDisabled = false,
  mode = "week",
  className,
  "aria-label": ariaLabel,
}: WeekGridProps): ReactElement {
  const todayDate = today(getLocalTimeZone()) as unknown as CalendarDate;
  const initialMonth = value?.start ?? defaultValue?.start ?? todayDate;

  const [displayedMonth, setDisplayedMonth] = useState<CalendarDate>(
    startOfMonth(initialMonth) as unknown as CalendarDate
  );

  // Niveau d'affichage : "week" = grille de semaines, "month" = MonthCalendar drill-up.
  const [drillLevel, setDrillLevel] = useState<"week" | "month">("week");

  // État interne pour le mode non contrôlé
  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);

  // État de sélection en cours pour mode="period"
  // Première semaine cliquée en attente du deuxième clic.
  const [pending, setPending] = useState<RangeValue<CalendarDate> | undefined>(
    undefined
  );
  // Semaine survolée pendant la sélection d'une période.
  const [hovered, setHovered] = useState<RangeValue<CalendarDate> | undefined>(
    undefined
  );

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  // Valeur affichée : en mode "period" avec une sélection en cours,
  // on affiche la prévisualisation (pending + hover) plutôt que la valeur confirmée.
  const displayValue = ((): RangeValue<CalendarDate> | undefined => {
    if (mode !== "period" || !pending) return resolvedValue;
    if (!hovered) return pending;
    // Prévisualisation : de la semaine la plus tôt à la semaine la plus tard.
    const start =
      pending.start.compare(hovered.start) <= 0 ? pending.start : hovered.start;
    const end =
      pending.end.compare(hovered.end) >= 0 ? pending.end : hovered.end;
    return { start, end };
  })();

  const handleSelect = (weekStart: CalendarDate, weekEnd: CalendarDate) => {
    if (isDisabled) return;

    if (mode === "period") {
      if (!pending) {
        // Premier clic — mémoriser la semaine de début.
        setPending({ start: weekStart, end: weekEnd });
        setHovered(undefined);
        onIntermediateStart?.(weekStart);
      } else {
        // Deuxième clic — confirmer la plage finale.
        const start =
          pending.start.compare(weekStart) <= 0 ? pending.start : weekStart;
        const end =
          pending.end.compare(weekEnd) >= 0 ? pending.end : weekEnd;
        const range: RangeValue<CalendarDate> = { start, end };
        setPending(undefined);
        setHovered(undefined);
        if (!controlled) setInternalValue(range);
        onChange?.(range);
      }
      return;
    }

    // mode="week" — sélection directe d'une semaine unique.
    const range: RangeValue<CalendarDate> = { start: weekStart, end: weekEnd };
    if (!controlled) setInternalValue(range);
    onChange?.(range);
  };

  const handleHover = (weekStart: CalendarDate, weekEnd: CalendarDate) => {
    if (mode === "period" && pending) {
      setHovered({ start: weekStart, end: weekEnd });
    }
  };

  const handleHoverLeave = () => {
    if (mode === "period" && pending) {
      setHovered(undefined);
    }
  };

  const handlePrev = () =>
    setDisplayedMonth((m) => m.subtract({ months: 1 }));
  const handleNext = () =>
    setDisplayedMonth((m) => m.add({ months: 1 }));

  // Drill-up vers le sélecteur de mois.
  const handleDrillUp = () => setDrillLevel("month");

  // Drill-down depuis le sélecteur de mois.
  const handleMonthSelect = (month: CalendarDate) => {
    setDisplayedMonth(startOfMonth(month) as unknown as CalendarDate);
    setDrillLevel("week");
  };

  // En mode drill-up : afficher le sélecteur de mois.
  if (drillLevel === "month") {
    return (
      <MonthCalendar
        defaultValue={displayedMonth}
        isDisabled={isDisabled}
        className={className}
        onChange={handleMonthSelect}
      />
    );
  }

  const weeks = getWeeksForMonth(displayedMonth, locale);
  const dayLabels = getDayLabels(locale);
  const heading = formatMonthYear(displayedMonth, locale);

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "Choisir une semaine"}
      className={[calStyles.calendar, styles.weekCalendar, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={isDisabled || undefined}
      // NOTE: data-selecting indique qu'un premier clic a été fait en mode période.
      // Permet d'afficher un curseur "crosshair" ou autre feedback visuel CSS.
      data-selecting={mode === "period" && pending ? true : undefined}
    >
      <MainHeader
        label={heading}
        onPrev={handlePrev}
        onNext={handleNext}
        onHeadingPress={handleDrillUp}
        isDisabled={isDisabled}
      />

      <WeekPanel
        weeks={weeks}
        dayLabels={dayLabels}
        value={displayValue}
        isDisabled={isDisabled}
        onSelect={handleSelect}
        onHover={handleHover}
        onHoverLeave={handleHoverLeave}
        todayDate={todayDate}
      />
    </div>
  );
}

// -----------------------------------------------------------------------
// Panel de grille (interne) — en-têtes de colonnes + lignes de semaines

function WeekPanel({
  weeks,
  dayLabels,
  value,
  isDisabled,
  onSelect,
  onHover,
  onHoverLeave,
  todayDate,
}: {
  weeks: WeekData[];
  dayLabels: string[];
  value?: RangeValue<CalendarDate>;
  isDisabled: boolean;
  onSelect: (start: CalendarDate, end: CalendarDate) => void;
  onHover: (start: CalendarDate, end: CalendarDate) => void;
  onHoverLeave: () => void;
  todayDate: CalendarDate;
}) {
  return (
    <>
      {/* En-têtes des colonnes */}
      <div className={styles.weekHeaderRow} aria-hidden="true">
        <span className={styles.weekHeaderNum}>S</span>
        {/* NOTE: spacer pour aligner avec la colonne divider des lignes de données */}
        <span aria-hidden="true" />
        {dayLabels.map((label, i) => (
          <span key={i} className={[calStyles.headerCell, styles.weekHeaderDay].join(" ")}>
            {label}
          </span>
        ))}
      </div>

      {/* Grille des semaines */}
      <div role="grid" className={styles.weekGrid}>
        {weeks.map((week) => (
          <WeekRow
            key={`${week.weekNumber}-${week.weekStart.toString()}`}
            week={week}
            value={value}
            isDisabled={isDisabled}
            onSelect={onSelect}
            onHover={onHover}
            onHoverLeave={onHoverLeave}
            todayDate={todayDate}
          />
        ))}
      </div>
    </>
  );
}

// -----------------------------------------------------------------------
// Ligne de semaine (interne)

function WeekRow({
  week,
  value,
  isDisabled,
  onSelect,
  onHover,
  onHoverLeave,
  todayDate,
}: {
  week: WeekData;
  value?: RangeValue<CalendarDate>;
  isDisabled: boolean;
  onSelect: (start: CalendarDate, end: CalendarDate) => void;
  onHover: (start: CalendarDate, end: CalendarDate) => void;
  onHoverLeave: () => void;
  todayDate: CalendarDate;
}) {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const rowState = getRowState(week.weekStart, week.weekEnd, value);
  const isCurrentWeek =
    todayDate.compare(week.weekStart) >= 0 &&
    todayDate.compare(week.weekEnd) <= 0;
  // NOTE: Une ligne dont tous les jours sont hors du mois visible est désactivée
  // pour éviter une sélection de semaine entièrement dans un autre mois.
  const allOutside = week.isOutsideMonth.every(Boolean);
  const rowDisabled = isDisabled || allOutside;

  const handleClick = () => {
    if (rowDisabled) return;
    onSelect(week.weekStart, week.weekEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocusVisible(e.currentTarget.matches(":focus-visible"));
  };

  return (
    <div
      role="row"
      className={styles.weekRow}
      data-state={rowState}
      data-current-week={isCurrentWeek || undefined}
      data-disabled={rowDisabled || undefined}
      tabIndex={rowDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={() => setIsFocusVisible(false)}
      onMouseEnter={() => {
        if (!rowDisabled) onHover(week.weekStart, week.weekEnd);
      }}
      onMouseLeave={onHoverLeave}
    >
      {/* Numéro de semaine */}
      <span
        role="rowheader"
        className={styles.weekNumberCell}
        aria-label={`Semaine ${week.weekNumber}`}
      >
        {week.weekNumber}
      </span>

      {/* Séparateur visuel semaine / jours */}
      <span className={styles.weekDivider} aria-hidden="true" />

      {/* Jours */}
      {week.days.map((day, i) => {
        const isOutside = week.isOutsideMonth[i] ?? false;
        const isToday =
          day.year === todayDate.year &&
          day.month === todayDate.month &&
          day.day === todayDate.day;
        return (
          <span
            key={i}
            role="gridcell"
            className={styles.weekDayCell}
            data-outside-month={isOutside || undefined}
            data-today={isToday || undefined}
            aria-label={`${day.day} ${day.month} ${day.year}`}
          >
            <span className={styles.weekDayText}>{day.day}</span>
            {isToday && (
              <span className={styles.todayIndicator} aria-hidden="true" />
            )}
          </span>
        );
      })}

      {/* FocusRing sur la ligne entière */}
      {isFocusVisible && <FocusRing borderRadius={6} position="inside" />}
    </div>
  );
}

// -----------------------------------------------------------------------
// Double grille de semaines liée (calendars=2) — interne

/**
 * DualWeekGrid — deux mois consécutifs côte à côte, sélection de plage en deux clics.
 *
 * Navigation : ← seul à gauche, → seul à droite.
 * Sélection : premier clic = semaine de début, deuxième clic = semaine de fin.
 * Prévisualisation : hover entre les deux clics.
 * Le bouton heading permet de remonter au sélecteur de mois (drill-up).
 */
export function DualWeekGrid({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  locale = "fr-FR",
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
  // NOTE: mode est ignoré — DualWeekGrid est toujours en mode "period".
  mode: _mode,
}: WeekGridProps): ReactElement {
  const todayDate = today(getLocalTimeZone()) as unknown as CalendarDate;
  const initialMonth = value?.start ?? defaultValue?.start ?? todayDate;

  const [leftMonth, setLeftMonth] = useState<CalendarDate>(
    startOfMonth(initialMonth) as unknown as CalendarDate
  );
  // Le panel droit affiche toujours le mois suivant le panel gauche.
  const rightMonth = leftMonth.add({ months: 1 }) as unknown as CalendarDate;

  // Niveau d'affichage : "week" = grilles de semaines, "month" = MonthCalendar drill-up (simple).
  const [drillLevel, setDrillLevel] = useState<"week" | "month">("week");
  // Panel ayant déclenché le drill-up : détermine quel panel est mis à jour au retour.
  const [drilledPanel, setDrilledPanel] = useState<"left" | "right">("left");

  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);
  const [pending, setPending] = useState<RangeValue<CalendarDate> | undefined>(
    undefined
  );
  const [hovered, setHovered] = useState<RangeValue<CalendarDate> | undefined>(
    undefined
  );

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  const displayValue = ((): RangeValue<CalendarDate> | undefined => {
    if (!pending) return resolvedValue;
    if (!hovered) return pending;
    const start =
      pending.start.compare(hovered.start) <= 0 ? pending.start : hovered.start;
    const end =
      pending.end.compare(hovered.end) >= 0 ? pending.end : hovered.end;
    return { start, end };
  })();

  const handleSelect = (weekStart: CalendarDate, weekEnd: CalendarDate) => {
    if (isDisabled) return;
    if (!pending) {
      setPending({ start: weekStart, end: weekEnd });
      setHovered(undefined);
      onIntermediateStart?.(weekStart);
    } else {
      const start =
        pending.start.compare(weekStart) <= 0 ? pending.start : weekStart;
      const end =
        pending.end.compare(weekEnd) >= 0 ? pending.end : weekEnd;
      const range: RangeValue<CalendarDate> = { start, end };
      setPending(undefined);
      setHovered(undefined);
      if (!controlled) setInternalValue(range);
      onChange?.(range);
    }
  };

  const handleHover = (weekStart: CalendarDate, weekEnd: CalendarDate) => {
    if (pending) setHovered({ start: weekStart, end: weekEnd });
  };

  const handleHoverLeave = () => {
    if (pending) setHovered(undefined);
  };

  // Drill-up vers un sélecteur de mois simple (1 clic).
  // Le panel cliqué détermine quel panel est mis à jour au retour.
  const handleDrillUp = (panel: "left" | "right") => {
    setDrilledPanel(panel);
    setDrillLevel("month");
  };

  // Drill-down depuis le sélecteur de mois simple :
  // - panel gauche → leftMonth = sélection, rightMonth = sélection + 1 (automatique)
  // - panel droit  → rightMonth = sélection, leftMonth = sélection - 1
  const handleMonthSelect = (month: CalendarDate) => {
    const newLeft = drilledPanel === "right"
      ? startOfMonth(month.subtract({ months: 1 })) as unknown as CalendarDate
      : startOfMonth(month) as unknown as CalendarDate;
    setLeftMonth(newLeft);
    setDrillLevel("week");
  };

  // En mode drill-up : afficher un sélecteur de mois simple.
  // Initialisé sur le mois du panel ayant déclenché le drill-up.
  if (drillLevel === "month") {
    const pivotMonth = drilledPanel === "right" ? rightMonth : leftMonth;
    return (
      <MonthCalendar
        defaultValue={pivotMonth}
        isDisabled={isDisabled}
        className={className}
        onChange={handleMonthSelect}
      />
    );
  }

  const leftWeeks = getWeeksForMonth(leftMonth, locale);
  const rightWeeks = getWeeksForMonth(rightMonth, locale);
  const dayLabels = getDayLabels(locale);

  const sharedPanel = {
    dayLabels,
    value: displayValue,
    isDisabled,
    onSelect: handleSelect,
    onHover: handleHover,
    onHoverLeave: handleHoverLeave,
    todayDate,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "Choisir une période de semaines"}
      className={[calStyles.dualCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      data-selecting={pending ? true : undefined}
    >
      {/* Panel gauche */}
      <div className={[calStyles.calendar, styles.weekCalendar].join(" ")}>
        <MainHeader
          label={formatMonthYear(leftMonth, locale)}
          onPrev={() => setLeftMonth((m) => m.subtract({ months: 1 }))}
          hideNext
          onHeadingPress={() => handleDrillUp("left")}
          isDisabled={isDisabled}
        />
        <WeekPanel weeks={leftWeeks} {...sharedPanel} />
      </div>

      {/* Panel droit */}
      <div className={[calStyles.calendar, styles.weekCalendar].join(" ")}>
        <MainHeader
          label={formatMonthYear(rightMonth, locale)}
          hidePrev
          onNext={() => setLeftMonth((m) => m.add({ months: 1 }))}
          onHeadingPress={() => handleDrillUp("right")}
          isDisabled={isDisabled}
        />
        <WeekPanel weeks={rightWeeks} {...sharedPanel} />
      </div>
    </div>
  );
}
