// DualYearCalendar — Comète Design System (interne)
// Double sélecteur d'année (calendars=2) : deux plages de 20 ans consécutives, sélection de plage.
import { useState, type ReactElement, type CSSProperties } from "react";
import type { RangeValue } from "react-aria-components";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { CalendarCell } from "./CalendarCell.js";
import { MainHeader } from "./MainHeader.js";
import { GRID_SIZE, decadeStart } from "./YearCalendar.js";
import styles from "./YearCalendar.module.css";
import calStyles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface DualYearCalendarProps {
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
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Utilitaire — état de plage d'une cellule (year)

/**
 * Retourne les props d'état de plage pour une cellule année donnée.
 */
function getYearCellRangeState(
  year: number,
  range?: RangeValue<CalendarDate>
): {
  isSelected?: true;
  isSelectionStart?: true;
  isSelectionEnd?: true;
  isRangePart?: true;
} {
  if (!range) return {};
  const startYear = range.start.year;
  const endYear = range.end.year;
  const atStart = year === startYear;
  const atEnd = year === endYear;
  if (atStart && atEnd) return { isSelected: true };
  if (atStart) return { isSelectionStart: true };
  if (atEnd) return { isSelectionEnd: true };
  if (year > startYear && year < endYear) return { isRangePart: true };
  return {};
}

// -----------------------------------------------------------------------
// Panel de grille — 20 années sans espacement (continuité visuelle de la plage)

function YearPanel({
  rangeStart,
  todayYear,
  displayRange,
  isDisabled,
  onSelect,
  onHover,
  onHoverLeave,
}: {
  rangeStart: number;
  todayYear: number;
  displayRange?: RangeValue<CalendarDate>;
  isDisabled: boolean;
  onSelect: (year: number) => void;
  onHover: (year: number) => void;
  onHoverLeave: () => void;
}): ReactElement {
  return (
    <div className={styles.yearGrid} role="grid">
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} role="row" className={styles.dualYearRow}>
          {Array.from({ length: 4 }, (_, col) => {
            const year = rangeStart + row * 4 + col;
            const cellState = getYearCellRangeState(year, displayRange);
            const isToday = todayYear === year;
            return (
              <CalendarCell
                key={year}
                size="lg"
                {...cellState}
                isToday={isToday}
                isDisabled={isDisabled}
                aria-label={String(year)}
                aria-selected={
                  cellState.isSelected ||
                  cellState.isSelectionStart ||
                  cellState.isSelectionEnd ||
                  undefined
                }
                onClick={() => onSelect(year)}
                onMouseEnter={() => onHover(year)}
                onMouseLeave={onHoverLeave}
              >
                {year}
              </CalendarCell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// DualYearSingleCalendar — calendars=2, sélection simple (pas de plage)

/**
 * DualYearSingleCalendar — Comète Design System (interne)
 *
 * Deux plages de 20 ans consécutives côte à côte avec sélection d'une année unique.
 * Réutilise YearPanel avec un faux range mono-point pour l'affichage.
 */
export function DualYearSingleCalendar({
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  className,
}: {
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onChange?: (date: CalendarDate) => void;
  isDisabled?: boolean;
  className?: string;
}): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value ?? defaultValue)?.year ?? todayDate.year;

  const [leftRangeStart, setLeftRangeStart] = useState(() =>
    decadeStart(initialYear)
  );
  const rightRangeStart = leftRangeStart + GRID_SIZE;

  const [internalValue, setInternalValue] = useState<CalendarDate | undefined>(
    defaultValue
  );

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  // Faux range mono-point pour réutiliser YearPanel (isSelected quand start===end).
  const displayRange = resolvedValue
    ? {
        start: new CalendarDate(resolvedValue.year, 1, 1),
        end: new CalendarDate(resolvedValue.year, 1, 1),
      }
    : undefined;

  const handleSelect = (year: number) => {
    if (isDisabled) return;
    const date = new CalendarDate(year, 1, 1);
    if (!controlled) setInternalValue(date);
    onChange?.(date);
  };

  const leftEnd = leftRangeStart + GRID_SIZE - 1;
  const rightEnd = rightRangeStart + GRID_SIZE - 1;

  const sharedPanel = {
    todayYear: todayDate.year,
    displayRange,
    isDisabled,
    onSelect: handleSelect,
    onHover: () => {},
    onHoverLeave: () => {},
  };

  return (
    <div
      className={[calStyles.dualCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
    >
      <div className={[calStyles.calendar, styles.yearCalendar].join(" ")}>
        <MainHeader
          label={`${leftRangeStart}–${leftEnd}`}
          onPrev={() => setLeftRangeStart((s) => s - GRID_SIZE)}
          hideNext
          isDisabled={isDisabled}
        />
        <YearPanel rangeStart={leftRangeStart} {...sharedPanel} />
      </div>
      <div className={[calStyles.calendar, styles.yearCalendar].join(" ")}>
        <MainHeader
          label={`${rightRangeStart}–${rightEnd}`}
          hidePrev
          onNext={() => setLeftRangeStart((s) => s + GRID_SIZE)}
          isDisabled={isDisabled}
        />
        <YearPanel rangeStart={rightRangeStart} {...sharedPanel} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// YearRangeCalendar — single calendar, range selection (isRange=true, calendars=1)

export interface YearRangeCalendarProps {
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
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

/**
 * YearRangeCalendar — Comète Design System (interne)
 *
 * Sélecteur de plage d'années sur un seul calendrier (20 ans).
 * Deux clics : premier = début, deuxième = fin.
 * Prévisualisation au survol entre les deux clics.
 */
export function YearRangeCalendar({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  isDisabled = false,
  className,
}: YearRangeCalendarProps): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value?.start ?? defaultValue?.start)?.year ?? todayDate.year;

  const [rangeStart, setRangeStart] = useState(() => decadeStart(initialYear));

  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);
  const [pending, setPending] = useState<number | undefined>(undefined);
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  const displayRange = ((): RangeValue<CalendarDate> | undefined => {
    if (pending === undefined) return resolvedValue;
    const anchor = pending;
    const target = hovered ?? pending;
    const startYear = Math.min(anchor, target);
    const endYear = Math.max(anchor, target);
    return {
      start: new CalendarDate(startYear, 1, 1),
      end: new CalendarDate(endYear, 1, 1),
    };
  })();

  const handleSelect = (year: number) => {
    if (isDisabled) return;
    if (pending === undefined) {
      setPending(year);
      setHovered(undefined);
      onIntermediateStart?.(new CalendarDate(year, 1, 1));
    } else {
      const startYear = Math.min(pending, year);
      const endYear = Math.max(pending, year);
      const range: RangeValue<CalendarDate> = {
        start: new CalendarDate(startYear, 1, 1),
        end: new CalendarDate(endYear, 1, 1),
      };
      setPending(undefined);
      setHovered(undefined);
      if (!controlled) setInternalValue(range);
      onChange?.(range);
    }
  };

  const handleHover = (year: number) => {
    if (pending !== undefined) setHovered(year);
  };

  const handleHoverLeave = () => {
    if (pending !== undefined) setHovered(undefined);
  };

  const rangeEnd = rangeStart + GRID_SIZE - 1;

  return (
    <div
      role="group"
      aria-label={`Choisir une période — ${rangeStart}–${rangeEnd}`}
      className={[calStyles.calendar, styles.yearCalendar, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={isDisabled || undefined}
      data-selecting={pending !== undefined ? true : undefined}
    >
      <MainHeader
        label={`${rangeStart}–${rangeEnd}`}
        onPrev={() => setRangeStart((s) => s - GRID_SIZE)}
        onNext={() => setRangeStart((s) => s + GRID_SIZE)}
        isDisabled={isDisabled}
      />
      <YearPanel
        rangeStart={rangeStart}
        todayYear={todayDate.year}
        displayRange={displayRange}
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
 * DualYearCalendar — Comète Design System (interne)
 *
 * Deux plages de 20 ans consécutives côte à côte.
 * Sélection de plage d'années en deux clics avec prévisualisation au survol.
 * Navigation : ← sur le panel gauche (−20 ans), → sur le panel droit (+20 ans).
 * Niveau max de drill-up — heading non interactif.
 *
 * @param value        - Plage sélectionnée (contrôlé)
 * @param defaultValue - Plage initiale (non contrôlé)
 * @param onChange     - Callback à chaque sélection
 * @param isDisabled   - Désactive le composant
 */
export function DualYearCalendar({
  value,
  defaultValue,
  onChange,
  onIntermediateStart,
  isDisabled = false,
  className,
}: DualYearCalendarProps): ReactElement {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value?.start ?? defaultValue?.start)?.year ?? todayDate.year;

  // Panel gauche commence à la plage de 20 ans de l'année initiale.
  // Panel droit = plage suivante (+ GRID_SIZE).
  const [leftRangeStart, setLeftRangeStart] = useState(() =>
    decadeStart(initialYear)
  );
  const rightRangeStart = leftRangeStart + GRID_SIZE;

  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | undefined
  >(defaultValue);
  // Première année cliquée en attente du deuxième clic.
  const [pending, setPending] = useState<number | undefined>(undefined);
  // Année survolée pendant la sélection.
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue;

  // Plage affichée : prévisualisation quand pending est défini.
  const displayRange = ((): RangeValue<CalendarDate> | undefined => {
    if (pending === undefined) return resolvedValue;
    const anchor = pending;
    const target = hovered ?? pending;
    const startYear = Math.min(anchor, target);
    const endYear = Math.max(anchor, target);
    return {
      start: new CalendarDate(startYear, 1, 1),
      end: new CalendarDate(endYear, 1, 1),
    };
  })();

  const handleSelect = (year: number) => {
    if (isDisabled) return;
    if (pending === undefined) {
      setPending(year);
      setHovered(undefined);
      onIntermediateStart?.(new CalendarDate(year, 1, 1));
    } else {
      const startYear = Math.min(pending, year);
      const endYear = Math.max(pending, year);
      const range: RangeValue<CalendarDate> = {
        start: new CalendarDate(startYear, 1, 1),
        end: new CalendarDate(endYear, 1, 1),
      };
      setPending(undefined);
      setHovered(undefined);
      if (!controlled) setInternalValue(range);
      onChange?.(range);
    }
  };

  const handleHover = (year: number) => {
    if (pending !== undefined) setHovered(year);
  };

  const handleHoverLeave = () => {
    if (pending !== undefined) setHovered(undefined);
  };

  const leftEnd = leftRangeStart + GRID_SIZE - 1;
  const rightEnd = rightRangeStart + GRID_SIZE - 1;

  const sharedPanel = {
    todayYear: todayDate.year,
    displayRange,
    isDisabled,
    onSelect: handleSelect,
    onHover: handleHover,
    onHoverLeave: handleHoverLeave,
  };

  return (
    <div
      className={[calStyles.dualCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      data-selecting={pending !== undefined ? true : undefined}
    >
      {/* Panel gauche — NOTE: niveau max, heading non interactif */}
      <div className={[calStyles.calendar, styles.yearCalendar].join(" ")}>
        <MainHeader
          label={`${leftRangeStart}–${leftEnd}`}
          onPrev={() => setLeftRangeStart((s) => s - GRID_SIZE)}
          hideNext
          isDisabled={isDisabled}
        />
        <YearPanel rangeStart={leftRangeStart} {...sharedPanel} />
      </div>

      {/* Panel droit — NOTE: niveau max, heading non interactif */}
      <div className={[calStyles.calendar, styles.yearCalendar].join(" ")}>
        <MainHeader
          label={`${rightRangeStart}–${rightEnd}`}
          hidePrev
          onNext={() => setLeftRangeStart((s) => s + GRID_SIZE)}
          isDisabled={isDisabled}
        />
        <YearPanel rangeStart={rightRangeStart} {...sharedPanel} />
      </div>
    </div>
  );
}
