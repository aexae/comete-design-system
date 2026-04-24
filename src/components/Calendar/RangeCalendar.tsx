// RangeCalendar — Comète Design System
import {
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  CalendarCell as AriaCalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  Button as AriaButton,
  type DateValue,
} from "react-aria-components";
import { Icon } from "../Icon/index.js";
import { CalendarCell as CometeCalendarCell } from "./CalendarCell.js";
import styles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface RangeCalendarProps<T extends DateValue>
  extends Omit<AriaRangeCalendarProps<T>, "className" | "style"> {
  /** Classe CSS additionnelle sur le conteneur. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * RangeCalendar — Comète Design System
 *
 * Sélecteur de plage de dates basé sur React Aria.
 * Affiche les états range-start, range-part et range-end.
 *
 * ```tsx
 * import { CalendarDate } from "@internationalized/date";
 *
 * <RangeCalendar
 *   defaultValue={{
 *     start: new CalendarDate(2024, 3, 10),
 *     end: new CalendarDate(2024, 3, 20),
 *   }}
 *   onChange={({ start, end }) => console.log(start, end)}
 * />
 * ```
 *
 * @param value        - Plage sélectionnée (contrôlé)
 * @param defaultValue - Plage sélectionnée par défaut
 * @param onChange     - Callback à chaque sélection
 * @param minValue     - Date minimale
 * @param maxValue     - Date maximale
 * @param isDisabled   - Désactive tout le calendrier
 */
export function RangeCalendar<T extends DateValue>({
  className,
  ...props
}: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar
      {...props}
      className={[styles.calendar, className].filter(Boolean).join(" ")}
    >
      <RangeCalendarHeader />
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

// -----------------------------------------------------------------------
// Header interne

function RangeCalendarHeader() {
  return (
    <header className={styles.header}>
      <AriaButton slot="previous" className={styles.navButton}>
        <Icon icon="ChevronLeft" size={20} appearance="filled" />
      </AriaButton>
      <Heading className={styles.heading} />
      <AriaButton slot="next" className={styles.navButton}>
        <Icon icon="ChevronRight" size={20} appearance="filled" />
      </AriaButton>
    </header>
  );
}
