// WeekCalendar — Comète Design System
import { useState, type CSSProperties } from "react";
import {
  RangeCalendar as AriaRangeCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  Button as AriaButton,
  type DateValue,
} from "react-aria-components";
import type { RangeValue } from "react-aria-components";
import { startOfWeek, endOfWeek } from "@internationalized/date";
import { type CalendarDate } from "@internationalized/date";
import { Icon } from "../Icon/index.js";
import { CalendarCell as CometeCalendarCell } from "./CalendarCell.js";
import styles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface WeekCalendarProps {
  /** Plage représentant la semaine sélectionnée (lundi–dimanche). */
  value?: RangeValue<CalendarDate>;
  /** Valeur initiale non contrôlée. */
  defaultValue?: RangeValue<CalendarDate>;
  /**
   * Appelé à chaque sélection d'une nouvelle semaine.
   * La plage passée représente toujours une semaine complète (lun–dim).
   */
  onChange?: (range: RangeValue<CalendarDate>) => void;
  /**
   * Locale BCP 47 utilisée pour déterminer le premier jour de la semaine.
   * @default "fr-FR"
   */
  locale?: string;
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Valeur minimale sélectionnable. */
  minValue?: DateValue;
  /** Valeur maximale sélectionnable. */
  maxValue?: DateValue;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Accessible label. */
  "aria-label"?: string;
}

// -----------------------------------------------------------------------
// Utilitaire — calcule les bornes lun/dim à partir d'une date quelconque

function weekRange(
  date: CalendarDate,
  locale: string
): RangeValue<CalendarDate> {
  // NOTE: startOfWeek/endOfWeek retournent AnyCalendarDate ; le cast est sûr
  // car l'entrée est un CalendarDate (calendrier grégorien proleptic).
  return {
    start: startOfWeek(date, locale) as unknown as CalendarDate,
    end: endOfWeek(date, locale) as unknown as CalendarDate,
  };
}

// -----------------------------------------------------------------------
// Composant

/**
 * WeekCalendar — Comète Design System
 *
 * Sélecteur de semaine complète. Basé sur React Aria `RangeCalendar`
 * avec snapping automatique sur les bornes lundi–dimanche.
 *
 * Sélection en deux clics : le résultat est toujours la plage
 * couvrant les semaines contenant chaque clic (ex : click sur Mar 4 et
 * Jeu 13 → sélectionne Lun 3 – Dim 16).
 *
 * @param value        - Semaine sélectionnée (contrôlé)
 * @param defaultValue - Semaine sélectionnée par défaut
 * @param onChange     - Callback avec la semaine complète (lun–dim)
 * @param locale       - Locale BCP 47 pour le premier jour de semaine
 * @param isDisabled   - Désactive le composant
 */
export function WeekCalendar({
  value,
  defaultValue,
  onChange,
  locale = "fr-FR",
  isDisabled,
  minValue,
  maxValue,
  className,
  "aria-label": ariaLabel,
}: WeekCalendarProps) {
  // État interne pour le mode non contrôlé
  const [internalValue, setInternalValue] = useState<
    RangeValue<CalendarDate> | null
  >(defaultValue ?? null);

  const controlled = value !== undefined;
  const resolvedValue = controlled ? value : internalValue ?? undefined;

  const handleChange = (range: RangeValue<DateValue>) => {
    const snapped: RangeValue<CalendarDate> = {
      start: weekRange(range.start as CalendarDate, locale).start,
      end: weekRange(range.end as CalendarDate, locale).end,
    };
    if (!controlled) setInternalValue(snapped);
    onChange?.(snapped);
  };

  return (
    <AriaRangeCalendar
      value={resolvedValue}
      onChange={handleChange}
      isDisabled={isDisabled}
      minValue={minValue}
      maxValue={maxValue}
      aria-label={ariaLabel ?? "Choisir une semaine"}
      className={[styles.calendar, className].filter(Boolean).join(" ")}
    >
      <header className={styles.header}>
        <AriaButton slot="previous" className={styles.navButton}>
          <Icon icon="ChevronLeft" size={20} appearance="filled" />
        </AriaButton>
        <Heading className={styles.heading} />
        <AriaButton slot="next" className={styles.navButton}>
          <Icon icon="ChevronRight" size={20} appearance="filled" />
        </AriaButton>
      </header>
      <CalendarGrid className={styles.grid}>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className={styles.headerCell}>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <AriaCalendarCell date={date} className={styles.ariaDateCell}>
              {({ formattedDate, isFocusVisible, isHovered, isPressed, isSelected, isSelectionStart, isSelectionEnd, isToday, isDisabled, isUnavailable, isOutsideMonth }) => (
                <CometeCalendarCell
                  interactive={false}
                  isSelected={isSelected}
                  isSelectionStart={isSelectionStart}
                  isSelectionEnd={isSelectionEnd}
                  isRangePart={isSelected && !isSelectionStart && !isSelectionEnd}
                  isToday={isToday}
                  isHovered={isHovered}
                  isPressed={isPressed}
                  isDisabled={isDisabled}
                  isUnavailable={isUnavailable}
                  isOutsideMonth={isOutsideMonth}
                  isFocusVisible={isFocusVisible}
                >
                  {formattedDate}
                </CometeCalendarCell>
              )}
            </AriaCalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </AriaRangeCalendar>
  );
}
