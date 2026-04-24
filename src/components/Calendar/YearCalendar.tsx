// YearCalendar — Comète Design System
import { useState, type CSSProperties } from "react";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { CalendarCell } from "./CalendarCell.js";
import { MainHeader } from "./MainHeader.js";
import styles from "./YearCalendar.module.css";
import calStyles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface YearCalendarProps {
  /**
   * Année sélectionnée — représentée par un CalendarDate quelconque de l'année
   * (seul year est utilisé).
   */
  value?: CalendarDate;
  /** Valeur initiale non contrôlée. */
  defaultValue?: CalendarDate;
  /**
   * Appelé à chaque sélection.
   * Le CalendarDate passé a toujours month=1, day=1.
   */
  onChange?: (date: CalendarDate) => void;
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// NOTE: La grille affiche 20 ans (4 colonnes × 5 lignes), centrée sur une
// décennie de 20 ans : 2020–2039, 2040–2059, etc.
export const GRID_SIZE = 20;

export function decadeStart(year: number): number {
  return Math.floor(year / GRID_SIZE) * GRID_SIZE;
}

// -----------------------------------------------------------------------
// Composant

/**
 * YearCalendar — Comète Design System
 *
 * Sélecteur d'année : grille 4 × 5 affichant 20 années consécutives.
 * Navigation par plage de 20 ans (boutons précédent / suivant).
 * Niveau max de drill-up — le bouton heading n'est pas interactif.
 *
 * ```tsx
 * import { CalendarDate } from "@internationalized/date";
 *
 * <YearCalendar
 *   defaultValue={new CalendarDate(2026, 1, 1)}
 *   onChange={(date) => console.log(date.year)}
 * />
 * ```
 *
 * @param value        - Année sélectionnée (contrôlé)
 * @param defaultValue - Année sélectionnée par défaut
 * @param onChange     - Callback à chaque sélection
 * @param isDisabled   - Désactive le composant
 */
export function YearCalendar({
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  className,
}: YearCalendarProps) {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value ?? defaultValue)?.year ?? todayDate.year;

  const [rangeStart, setRangeStart] = useState(() => decadeStart(initialYear));

  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDate | undefined>(
    defaultValue
  );
  const resolvedYear = controlled ? value?.year : internalValue?.year;

  const handleSelect = (year: number) => {
    if (isDisabled) return;
    const date = new CalendarDate(year, 1, 1);
    if (!controlled) setInternalValue(date);
    onChange?.(date);
  };

  const handlePrev = () => setRangeStart((s) => s - GRID_SIZE);
  const handleNext = () => setRangeStart((s) => s + GRID_SIZE);
  const rangeEnd = rangeStart + GRID_SIZE - 1;

  return (
    <div
      role="group"
      aria-label={`Choisir une année — ${rangeStart}–${rangeEnd}`}
      className={[calStyles.calendar, styles.yearCalendar, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={isDisabled || undefined}
    >
      {/* NOTE: YearCalendar est le niveau max — heading non interactif (pas de onHeadingPress). */}
      <MainHeader
        label={`${rangeStart}–${rangeEnd}`}
        onPrev={handlePrev}
        onNext={handleNext}
        isDisabled={isDisabled}
      />

      {/* Grille 4 × 5 */}
      <div className={styles.yearGrid} role="grid">
        {Array.from({ length: 5 }, (_, row) => (
          <div key={row} role="row" className={styles.yearRow}>
            {Array.from({ length: 4 }, (_, col) => {
              const year = rangeStart + row * 4 + col;
              const isSelected = resolvedYear === year;
              const isToday = todayDate.year === year;

              return (
                <CalendarCell
                  key={year}
                  size="lg"
                  isSelected={isSelected}
                  isToday={isToday}
                  isDisabled={isDisabled}
                  aria-label={String(year)}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(year)}
                >
                  {year}
                </CalendarCell>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
