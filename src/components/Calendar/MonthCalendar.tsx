// MonthCalendar — Comète Design System
import { useState, type CSSProperties } from "react";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { CalendarCell } from "./CalendarCell.js";
import { MainHeader } from "./MainHeader.js";
import { YearCalendar } from "./YearCalendar.js";
import styles from "./MonthCalendar.module.css";
import calStyles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface MonthCalendarProps {
  /**
   * Mois sélectionné — représenté par un CalendarDate quelconque du mois
   * (seuls year et month sont utilisés).
   */
  value?: CalendarDate;
  /** Valeur initiale non contrôlée. */
  defaultValue?: CalendarDate;
  /**
   * Appelé à chaque sélection.
   * Le CalendarDate passé a toujours day=1.
   */
  onChange?: (date: CalendarDate) => void;
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
// Utilitaire — noms de mois localisés (ex : "janv.", "févr."…)

export function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(
      new Date(2000, i, 1)
    )
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * MonthCalendar — Comète Design System
 *
 * Sélecteur de mois : grille 3 × 4 affichant les 12 mois de l'année.
 * Navigation par année (boutons précédent / suivant).
 * Le bouton heading permet de remonter au sélecteur d'année (drill-up).
 *
 * ```tsx
 * import { CalendarDate } from "@internationalized/date";
 *
 * <MonthCalendar
 *   defaultValue={new CalendarDate(2026, 3, 1)}
 *   onChange={(date) => console.log(date.year, date.month)}
 * />
 * ```
 *
 * @param value        - Mois sélectionné (contrôlé)
 * @param defaultValue - Mois sélectionné par défaut
 * @param onChange     - Callback à chaque sélection
 * @param locale       - Locale BCP 47 pour les noms de mois
 * @param isDisabled   - Désactive le composant
 */
export function MonthCalendar({
  value,
  defaultValue,
  onChange,
  locale = "fr-FR",
  isDisabled = false,
  className,
}: MonthCalendarProps) {
  const todayDate = today(getLocalTimeZone());
  const initialYear = (value ?? defaultValue)?.year ?? todayDate.year;

  const [displayYear, setDisplayYear] = useState(initialYear);
  // Niveau d'affichage : "month" = grille de mois, "year" = sélecteur d'année (drill-up).
  const [drillLevel, setDrillLevel] = useState<"month" | "year">("month");

  const controlled = value !== undefined;
  const selectedYear = controlled ? value?.year : undefined;
  const selectedMonth = controlled ? value?.month : undefined;

  // Non-controlled internal selection
  const [internalValue, setInternalValue] = useState<CalendarDate | undefined>(
    defaultValue
  );
  const resolvedYear = controlled ? value?.year : internalValue?.year;
  const resolvedMonth = controlled ? value?.month : internalValue?.month;

  const monthLabels = getMonthLabels(locale);

  const handleSelect = (month: number) => {
    if (isDisabled) return;
    const date = new CalendarDate(displayYear, month, 1);
    if (!controlled) setInternalValue(date);
    onChange?.(date);
  };

  const handlePrev = () => setDisplayYear((y) => y - 1);
  const handleNext = () => setDisplayYear((y) => y + 1);

  // Drill-up vers la sélection d'année — on conserve displayYear comme pivot.
  const handleDrillUp = () => setDrillLevel("year");

  // Drill-down depuis la sélection d'année : on met à jour displayYear et on revient.
  const handleYearSelect = (date: CalendarDate) => {
    setDisplayYear(date.year);
    setDrillLevel("month");
  };

  // En mode drill-up : afficher le sélecteur d'année à la place de la grille de mois.
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

  return (
    <div
      role="group"
      aria-label={`Choisir un mois — ${displayYear}`}
      className={[calStyles.calendar, styles.monthCalendar, className]
        .filter(Boolean)
        .join(" ")}
      data-disabled={isDisabled || undefined}
    >
      <MainHeader
        label={String(displayYear)}
        onPrev={handlePrev}
        onNext={handleNext}
        onHeadingPress={handleDrillUp}
        isDisabled={isDisabled}
      />

      {/* Grille 3 × 4 */}
      <div className={styles.monthGrid} role="grid">
        {Array.from({ length: 4 }, (_, row) => (
          <div key={row} role="row" className={styles.monthRow}>
            {Array.from({ length: 3 }, (_, col) => {
              const month = row * 3 + col + 1;
              const isSelected =
                (controlled ? selectedYear : resolvedYear) === displayYear &&
                (controlled ? selectedMonth : resolvedMonth) === month;
              const isToday =
                todayDate.year === displayYear && todayDate.month === month;

              return (
                <CalendarCell
                  key={month}
                  size="lg"
                  isSelected={isSelected}
                  isToday={isToday}
                  isDisabled={isDisabled}
                  aria-label={`Mois ${month}`}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(month)}
                >
                  {monthLabels[month - 1] ?? ""}
                </CalendarCell>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
