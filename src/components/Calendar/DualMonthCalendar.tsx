// DualMonthCalendar — Comète Design System (interne)
// Double sélecteur de mois (calendars=2) : deux années consécutives liées, sélection de plage.
import { useState, type ReactElement, type CSSProperties } from "react";
import type { RangeValue } from "react-aria-components";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { CalendarCell } from "./CalendarCell.js";
import { MainHeader } from "./MainHeader.js";
import { getMonthLabels } from "./MonthCalendar.js";
import { YearCalendar } from "./YearCalendar.js";
import styles from "./MonthCalendar.module.css";
import calStyles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface DualMonthCalendarProps {
  /** Plage sélectionnée (mode contrôlé). */
  value?: RangeValue<CalendarDate>;
  /** Valeur initiale (mode non contrôlé). */
  defaultValue?: RangeValue<CalendarDate>;
  /** Callback à chaque sélection de plage. */
  onChange?: (range: RangeValue<CalendarDate>) => void;
  /**
   * Callback appelé dès le premier clic de la plage (avant validation).
   * Utile pour mettre à jour le champ de saisie du picker immédiatement,
   * sans attendre le deuxième clic.
   */
  onIntermediateStart?: (date: CalendarDate) => void;
  /**
   * Locale BCP 47 pour les noms de mois.
   * @default "fr-FR"
   */
  locale?: string;
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Utilitaire — état de plage d'une cellule (year, month)

/**
 * Retourne les props d'état de plage pour une cellule mois/année donnée.
 * La comparaison est faite au niveau year+month (day normalisé à 1).
 */
function getMonthCellRangeState(
  year: number,
  month: number,
  range?: RangeValue<CalendarDate>
): {
  isSelected?: true;
  isSelectionStart?: true;
  isSelectionEnd?: true;
  isRangePart?: true;
} {
  if (!range) return {};
  const cell = new CalendarDate(year, month, 1);
  const start = new CalendarDate(range.start.year, range.start.month, 1);
  const end = new CalendarDate(range.end.year, range.end.month, 1);
  const atStart = cell.compare(start) === 0;
  const atEnd = cell.compare(end) === 0;
  if (atStart && atEnd) return { isSelected: true };
  if (atStart) return { isSelectionStart: true };
  if (atEnd) return { isSelectionEnd: true };
  if (cell.compare(start) > 0 && cell.compare(end) < 0) return { isRangePart: true };
  return {};
}

// -----------------------------------------------------------------------
// Panel de grille — 12 mois sans espacement (continuité visuelle de la plage)

function MonthPanel({
  year,
  monthLabels,
  displayRange,
  todayYear,
  todayMonth,
  isDisabled,
  onSelect,
  onHover,
  onHoverLeave,
}: {
  year: number;
  monthLabels: string[];
  displayRange?: RangeValue<CalendarDate>;
  todayYear: number;
  todayMonth: number;
  isDisabled: boolean;
  onSelect: (date: CalendarDate) => void;
  onHover: (date: CalendarDate) => void;
  onHoverLeave: () => void;
}): ReactElement {
  return (
    <div className={styles.monthGrid} role="grid">
      {Array.from({ length: 4 }, (_, row) => (
        <div key={row} role="row" className={styles.dualMonthRow}>
          {Array.from({ length: 3 }, (_, col) => {
            const month = row * 3 + col + 1;
            const cellState = getMonthCellRangeState(year, month, displayRange);
            const isToday = todayYear === year && todayMonth === month;
            const label = monthLabels[month - 1] ?? "";
            return (
              <CalendarCell
                key={month}
                size="lg"
                {...cellState}
                isToday={isToday}
                isDisabled={isDisabled}
                aria-label={`${label} ${year}`}
                aria-selected={
                  cellState.isSelected ||
                  cellState.isSelectionStart ||
                  cellState.isSelectionEnd ||
                  undefined
                }
                onClick={() => onSelect(new CalendarDate(year, month, 1))}
                onMouseEnter={() => onHover(new CalendarDate(year, month, 1))}
                onMouseLeave={onHoverLeave}
              >
                {label}
              </CalendarCell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// MonthRangeCalendar — single calendar, range selection (isRange=true, calendars=1)

export interface MonthRangeCalendarProps {
  /** Plage sélectionnée (mode contrôlé). */
  value?: RangeValue<CalendarDate>;
  /** Valeur initiale (mode non contrôlé). */
  defaultValue?: RangeValue<CalendarDate>;
  /** Callback à chaque sélection de plage. */
  onChange?: (range: RangeValue<CalendarDate>) => void;
  /**
   * Callback appelé dès le premier clic de la plage (avant validation).
   */
  onIntermediateStart?: (date: CalendarDate) => void;
  locale?: string;
  isDisabled?: boolean;
  className?: string;
}

/**
 * MonthRangeCalendar — Comète Design System (interne)
 *
 * Sélecteur de plage de mois sur un seul calendrier (une année).
 * Deux clics : premier = début, deuxième = fin.
 * Prévisualisation au survol entre les deux clics.
 */
export function MonthRangeCalendar({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  locale = "fr-FR",
  isDisabled = false,
  className,
}: MonthRangeCalendarProps): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value?.start ?? defaultValue?.start)?.year ?? todayDate.year;

  const [displayYear, setDisplayYear] = useState(initialYear);
  const [drillLevel, setDrillLevel] = useState<"month" | "year">("month");

  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);
  const [pending, setPending] = useState<CalendarDate | undefined>(undefined);
  const [hovered, setHovered] = useState<CalendarDate | undefined>(undefined);

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  const displayRange = ((): RangeValue<CalendarDate> | undefined => {
    if (!pending) return resolvedValue;
    const anchor = pending;
    const target = hovered ?? pending;
    const start = anchor.compare(target) <= 0 ? anchor : target;
    const end = anchor.compare(target) >= 0 ? anchor : target;
    return { start, end };
  })();

  const handleSelect = (date: CalendarDate) => {
    if (isDisabled) return;
    if (!pending) {
      setPending(date);
      setHovered(undefined);
      onIntermediateStart?.(date);
    } else {
      const start = pending.compare(date) <= 0 ? pending : date;
      const end = pending.compare(date) >= 0 ? pending : date;
      const range: RangeValue<CalendarDate> = { start, end };
      setPending(undefined);
      setHovered(undefined);
      if (!controlled) setInternalValue(range);
      onChange?.(range);
    }
  };

  const handleHover = (date: CalendarDate) => {
    if (pending) setHovered(date);
  };

  const handleHoverLeave = () => {
    if (pending) setHovered(undefined);
  };

  const handleDrillUp = () => setDrillLevel("year");
  const handleYearSelect = (date: CalendarDate) => {
    setDisplayYear(date.year);
    setDrillLevel("month");
  };

  if (drillLevel === "year") {
    return (
      <YearCalendar
        defaultValue={new CalendarDate(displayYear, 1, 1)}
        isDisabled={isDisabled}
        className={className}
        onChange={handleYearSelect}
      />
    );
  }

  const monthLabels = getMonthLabels(locale);

  return (
    <div
      role="group"
      aria-label={`Choisir une période — ${displayYear}`}
      className={[calStyles.calendar, styles.monthCalendar, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={isDisabled || undefined}
      data-selecting={pending ? true : undefined}
    >
      <MainHeader
        label={String(displayYear)}
        onPrev={() => setDisplayYear((y) => y - 1)}
        onNext={() => setDisplayYear((y) => y + 1)}
        onHeadingPress={handleDrillUp}
        isDisabled={isDisabled}
      />
      <MonthPanel
        year={displayYear}
        monthLabels={monthLabels}
        displayRange={displayRange}
        todayYear={todayDate.year}
        todayMonth={todayDate.month}
        isDisabled={isDisabled}
        onSelect={handleSelect}
        onHover={handleHover}
        onHoverLeave={handleHoverLeave}
      />
    </div>
  );
}

// -----------------------------------------------------------------------
// Composant principal

/**
 * DualMonthCalendar — Comète Design System (interne)
 *
 * Deux années consécutives côte à côte.
 * Sélection de plage en deux clics avec prévisualisation au survol.
 * Navigation : ← sur le panel gauche, → sur le panel droit.
 * Le bouton heading permet de remonter au sélecteur d'année (drill-up).
 *
 * @param value        - Plage sélectionnée (contrôlé)
 * @param defaultValue - Plage initiale (non contrôlé)
 * @param onChange     - Callback à chaque sélection
 * @param locale       - Locale BCP 47 pour les noms de mois
 * @param isDisabled   - Désactive le composant
 */
// -----------------------------------------------------------------------
// DualMonthSingleCalendar — calendars=2, sélection simple (pas de plage)

/**
 * DualMonthSingleCalendar — Comète Design System (interne)
 *
 * Deux années consécutives côte à côte avec sélection d'un mois unique.
 * Réutilise MonthPanel avec un faux range mono-point pour l'affichage.
 */
export function DualMonthSingleCalendar({
  value,
  defaultValue,
  onChange,
  locale = "fr-FR",
  isDisabled = false,
  className,
}: {
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onChange?: (date: CalendarDate) => void;
  locale?: string;
  isDisabled?: boolean;
  className?: string;
}): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value ?? defaultValue)?.year ?? todayDate.year;

  const [leftYear, setLeftYear] = useState(initialYear);
  const rightYear = leftYear + 1;

  const [drillLevel, setDrillLevel] = useState<"month" | "year">("month");
  const [drilledPanel, setDrilledPanel] = useState<"left" | "right">("left");

  const [internalValue, setInternalValue] = useState<CalendarDate | undefined>(
    defaultValue
  );

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  // Faux range mono-point pour réutiliser MonthPanel (isSelected quand start===end).
  const displayRange = resolvedValue
    ? {
        start: new CalendarDate(resolvedValue.year, resolvedValue.month, 1),
        end: new CalendarDate(resolvedValue.year, resolvedValue.month, 1),
      }
    : undefined;

  const handleSelect = (date: CalendarDate) => {
    if (isDisabled) return;
    if (!controlled) setInternalValue(date);
    onChange?.(date);
  };

  const handleDrillUp = (panel: "left" | "right") => {
    setDrilledPanel(panel);
    setDrillLevel("year");
  };

  const handleYearSelect = (date: CalendarDate) => {
    if (drilledPanel === "right") {
      setLeftYear(date.year - 1);
    } else {
      setLeftYear(date.year);
    }
    setDrillLevel("month");
  };

  const monthLabels = getMonthLabels(locale);

  const sharedPanel = {
    monthLabels,
    displayRange,
    todayYear: todayDate.year,
    todayMonth: todayDate.month,
    isDisabled,
    onSelect: handleSelect,
    onHover: () => {},
    onHoverLeave: () => {},
  };

  if (drillLevel === "year") {
    const pivotYear = drilledPanel === "right" ? rightYear : leftYear;
    return (
      <YearCalendar
        defaultValue={new CalendarDate(pivotYear, 1, 1)}
        isDisabled={isDisabled}
        className={className}
        onChange={handleYearSelect}
      />
    );
  }

  return (
    <div
      className={[calStyles.dualCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
    >
      <div className={[calStyles.calendar, styles.monthCalendar].join(" ")}>
        <MainHeader
          label={String(leftYear)}
          onPrev={() => setLeftYear((y) => y - 1)}
          hideNext
          onHeadingPress={() => handleDrillUp("left")}
          isDisabled={isDisabled}
        />
        <MonthPanel year={leftYear} {...sharedPanel} />
      </div>
      <div className={[calStyles.calendar, styles.monthCalendar].join(" ")}>
        <MainHeader
          label={String(rightYear)}
          hidePrev
          onNext={() => setLeftYear((y) => y + 1)}
          onHeadingPress={() => handleDrillUp("right")}
          isDisabled={isDisabled}
        />
        <MonthPanel year={rightYear} {...sharedPanel} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Composant principal

export function DualMonthCalendar({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  locale = "fr-FR",
  isDisabled = false,
  className,
}: DualMonthCalendarProps): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value?.start ?? defaultValue?.start)?.year ?? todayDate.year;

  // Panel gauche = année N, panel droit = année N+1.
  const [leftYear, setLeftYear] = useState(initialYear);
  const rightYear = leftYear + 1;

  // Niveau d'affichage : "month" = grilles de mois, "year" = sélecteur d'année (drill-up).
  const [drillLevel, setDrillLevel] = useState<"month" | "year">("month");
  // Panel ayant déclenché le drill-up : détermine quel panel est mis à jour au retour.
  const [drilledPanel, setDrilledPanel] = useState<"left" | "right">("left");

  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);
  // Première cellule cliquée en attente du deuxième clic.
  const [pending, setPending] = useState<CalendarDate | undefined>(undefined);
  // Cellule survolée pendant la sélection.
  const [hovered, setHovered] = useState<CalendarDate | undefined>(undefined);

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  // Plage affichée : prévisualisation quand pending est défini.
  const displayRange = ((): RangeValue<CalendarDate> | undefined => {
    if (!pending) return resolvedValue;
    const anchor = pending;
    const target = hovered ?? pending;
    const start = anchor.compare(target) <= 0 ? anchor : target;
    const end = anchor.compare(target) >= 0 ? anchor : target;
    return { start, end };
  })();

  const handleSelect = (date: CalendarDate) => {
    if (isDisabled) return;
    if (!pending) {
      setPending(date);
      setHovered(undefined);
      onIntermediateStart?.(date);
    } else {
      const start = pending.compare(date) <= 0 ? pending : date;
      const end = pending.compare(date) >= 0 ? pending : date;
      const range: RangeValue<CalendarDate> = { start, end };
      setPending(undefined);
      setHovered(undefined);
      if (!controlled) setInternalValue(range);
      onChange?.(range);
    }
  };

  const handleHover = (date: CalendarDate) => {
    if (pending) setHovered(date);
  };

  const handleHoverLeave = () => {
    if (pending) setHovered(undefined);
  };

  // Drill-up vers le sélecteur d'année (sélection simple — 1 clic).
  // Le panel cliqué détermine quel panel sera mis à jour au retour.
  const handleDrillUp = (panel: "left" | "right") => {
    setDrilledPanel(panel);
    setDrillLevel("year");
  };

  // Drill-down depuis le sélecteur d'année :
  // - panel gauche → leftYear = sélection, rightYear = sélection + 1 (automatique)
  // - panel droit  → rightYear = sélection, leftYear = sélection - 1
  const handleYearSelect = (date: CalendarDate) => {
    if (drilledPanel === "right") {
      setLeftYear(date.year - 1);
    } else {
      setLeftYear(date.year);
    }
    setDrillLevel("month");
  };

  const monthLabels = getMonthLabels(locale);

  const sharedPanel = {
    monthLabels,
    displayRange,
    todayYear: todayDate.year,
    todayMonth: todayDate.month,
    isDisabled,
    onSelect: handleSelect,
    onHover: handleHover,
    onHoverLeave: handleHoverLeave,
  };

  // En mode drill-up : afficher un sélecteur d'année simple (1 clic).
  // Initialisé sur l'année du panel ayant déclenché le drill-up.
  if (drillLevel === "year") {
    const pivotYear = drilledPanel === "right" ? rightYear : leftYear;
    return (
      <YearCalendar
        defaultValue={new CalendarDate(pivotYear, 1, 1)}
        isDisabled={isDisabled}
        className={className}
        onChange={handleYearSelect}
      />
    );
  }

  return (
    <div
      className={[calStyles.dualCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      data-selecting={pending ? true : undefined}
    >
      {/* Panel gauche — année N */}
      <div className={[calStyles.calendar, styles.monthCalendar].join(" ")}>
        <MainHeader
          label={String(leftYear)}
          onPrev={() => setLeftYear((y) => y - 1)}
          hideNext
          onHeadingPress={() => handleDrillUp("left")}
          isDisabled={isDisabled}
        />
        <MonthPanel year={leftYear} {...sharedPanel} />
      </div>

      {/* Panel droit — année N+1 */}
      <div className={[calStyles.calendar, styles.monthCalendar].join(" ")}>
        <MainHeader
          label={String(rightYear)}
          hidePrev
          onNext={() => setLeftYear((y) => y + 1)}
          onHeadingPress={() => handleDrillUp("right")}
          isDisabled={isDisabled}
        />
        <MonthPanel year={rightYear} {...sharedPanel} />
      </div>
    </div>
  );
}
