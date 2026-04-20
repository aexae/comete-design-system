// YearRangePicker — Comète Design System
// Sélecteur de plage d'années : deux modes (navigation / saisie) selon isEditable.
import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
import { Dialog as AriaDialog, DialogTrigger } from "react-aria-components";
import type { RangeValue } from "react-aria-components";
import { Button } from "../Button/Button.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./YearRangePicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type YearRangePickerAppearance = InputContainerAppearance;

export interface YearRangePickerProps {
  /** Année de début sélectionnée. */
  startYear?: number;
  /** Année de fin sélectionnée. */
  endYear?: number;
  /**
   * Nombre de calendriers affichés dans les popovers.
   * @default 2
   */
  calendars?: 1 | 2;
  /** Callback appelé à chaque changement de plage. */
  onChange?: (startYear: number, endYear: number) => void;
  /**
   * Mode saisie : affiche des inputs texte + icône calendrier.
   * Quand `false`, affiche les boutons année cliquables.
   * @default true
   */
  isEditable?: boolean;
  /** Apparence visuelle. @default "default" */
  appearance?: YearRangePickerAppearance;
  /** Marque le champ comme invalide. */
  isInvalid?: boolean;
  /** Désactive le composant. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Label accessible. */
  "aria-label"?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * YearRangePicker — Comète Design System
 *
 * Sélecteur de plage d'années avec deux modes :
 *
 * **Navigation** (`isEditable={false}`, défaut) :
 * ```
 * [ 2023 ] → [ 2025 ] 📅
 * ```
 * Boutons année cliquables + icône calendrier.
 *
 * **Saisie** (`isEditable={true}`) :
 * ```
 * [ input ] → [ input ] 📅
 * ```
 * Champs texte éditables + icône calendrier.
 *
 * ```tsx
 * import { YearRangePicker } from "@naxit/comete-design-system";
 *
 * <YearRangePicker
 *   startYear={2023}
 *   endYear={2025}
 *   onChange={(start, end) => console.log(start, end)}
 * />
 * ```
 */
export function YearRangePicker({
  startYear,
  endYear,
  calendars = 2,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
}: YearRangePickerProps): ReactElement {
  const currentYear = today(getLocalTimeZone()).year;

  const resolvedStart = startYear ?? currentYear;
  const resolvedEnd = endYear ?? currentYear;

  // Ref du conteneur pour positionner tous les popovers sous le champ entier
  const containerRef = useRef<HTMLDivElement>(null);

  // Popover open state — un seul popover ouvert à la fois
  const [openPopover, setOpenPopover] = useState<
    "start" | "end" | "range" | null
  >(null);

  // Close dropdown on click outside or Escape (editable mode only)
  useEffect(() => {
    if (!openPopover || !isEditable) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopover(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPopover, isEditable]);

  // -- Helper : commit new range (auto-swap if start > end) --

  const commitRange = (newStart: number, newEnd: number) => {
    const [s, e] =
      newStart > newEnd ? [newEnd, newStart] : [newStart, newEnd];
    onChange?.(s, e);
  };

  // -- Handlers calendar selection (ne ferment PAS le popover) --

  const handleStartYearSelect = (date: CalendarDate) => {
    commitRange(date.year, resolvedEnd);
  };

  const handleEndYearSelect = (date: CalendarDate) => {
    commitRange(resolvedStart, date.year);
  };

  const handleRangeSelect = (range: RangeValue<CalendarDate>) => {
    commitRange(range.start.year, range.end.year);
  };

  // -- Editable input state --

  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);

  const handleStartInputFocus = () => {
    setStartInput(String(resolvedStart));
    setStartFocused(true);
  };

  const handleStartInputBlur = () => {
    setStartFocused(false);
    const parsed = parseInt(startInput, 10);
    if (!isNaN(parsed)) {
      commitRange(parsed, resolvedEnd);
    }
  };

  const handleEndInputFocus = () => {
    setEndInput(String(resolvedEnd));
    setEndFocused(true);
  };

  const handleEndInputBlur = () => {
    setEndFocused(false);
    const parsed = parseInt(endInput, 10);
    if (!isNaN(parsed)) {
      commitRange(resolvedStart, parsed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // -- Calendar values --

  const startValue = new CalendarDate(resolvedStart, 1, 1);
  const endValue = new CalendarDate(resolvedEnd, 1, 1);
  const rangeValue: RangeValue<CalendarDate> = {
    start: new CalendarDate(resolvedStart, 1, 1),
    end: new CalendarDate(resolvedEnd, 1, 1),
  };

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  // -- Dual calendar helper --

  const renderDualCalendar = () => (
    <Calendar
      appearance="year"
      isRange
      calendars={2}
      value={rangeValue}
      onChange={handleRangeSelect}
      isDisabled={isDisabled}
    />
  );

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={
        ariaLabel ?? `Plage d'années : ${resolvedStart} à ${resolvedEnd}`
      }
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <InputContainer isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        {isEditable ? (
          /* ---- Mode saisie : inputs + icône calendrier ---- */
          <div className={styles.yearValue}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.yearInput}
              value={startFocused ? startInput : String(resolvedStart)}
              onChange={(e) => setStartInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onFocus={handleStartInputFocus}
              onBlur={handleStartInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Année de début : ${resolvedStart}`}
            />

            <span className={styles.separator} aria-hidden="true">
              →
            </span>

            <input
              type="text"
              inputMode="numeric"
              className={styles.yearInput}
              value={endFocused ? endInput : String(resolvedEnd)}
              onChange={(e) => setEndInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onFocus={handleEndInputFocus}
              onBlur={handleEndInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Année de fin : ${resolvedEnd}`}
            />

            <Button
              appearance="subtle"
              iconBefore="CalendarMonth"
              className={styles.calendarButton}
              isDisabled={isDisabled}
              onPress={() =>
                !isDisabled &&
                setOpenPopover((o) => (o === "range" ? null : "range"))
              }
              aria-label="Ouvrir le sélecteur d'années"
            />
            {openPopover === "range" && (
              <div className={styles.calendarDropdown}>
                {calendars === 2 ? (
                  renderDualCalendar()
                ) : (
                  <Calendar
                    appearance="year"
                    value={startValue}
                    onChange={handleStartYearSelect}
                    isDisabled={isDisabled}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : boutons année + icône calendrier ---- */
          <>
            <div className={styles.yearValue}>
              {/* Bouton année de début */}
              <DialogTrigger
                isOpen={openPopover === "start"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "start" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.yearButton}
                  isDisabled={isDisabled}
                  aria-label={`Année de début : ${resolvedStart}`}
                >
                  {resolvedStart}
                </Button>
                <Popover
                  triggerRef={containerRef}
                  placement="bottom start"
                  shouldFlip={false}
                >
                  <AriaDialog className={styles.dialog}>
                    {calendars === 2 ? (
                      renderDualCalendar()
                    ) : (
                      <Calendar
                        appearance="year"
                        value={startValue}
                        onChange={handleStartYearSelect}
                        isDisabled={isDisabled}
                      />
                    )}
                  </AriaDialog>
                </Popover>
              </DialogTrigger>

              <span className={styles.separator} aria-hidden="true">
                →
              </span>

              {/* Bouton année de fin */}
              <DialogTrigger
                isOpen={openPopover === "end"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "end" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.yearButton}
                  isDisabled={isDisabled}
                  aria-label={`Année de fin : ${resolvedEnd}`}
                >
                  {resolvedEnd}
                </Button>
                <Popover
                  triggerRef={containerRef}
                  placement="bottom start"
                  shouldFlip={false}
                >
                  <AriaDialog className={styles.dialog}>
                    {calendars === 2 ? (
                      renderDualCalendar()
                    ) : (
                      <Calendar
                        appearance="year"
                        value={endValue}
                        onChange={handleEndYearSelect}
                        isDisabled={isDisabled}
                      />
                    )}
                  </AriaDialog>
                </Popover>
              </DialogTrigger>
            </div>

            {/* Bouton calendrier */}
            <DialogTrigger
              isOpen={openPopover === "range"}
              onOpenChange={(open) => setOpenPopover(open ? "range" : null)}
            >
              <Button
                appearance="subtle"
                iconBefore="CalendarMonth"
                className={styles.calendarButton}
                isDisabled={isDisabled}
                aria-label="Ouvrir le sélecteur d'années"
              />
              <Popover
                triggerRef={containerRef}
                placement="bottom start"
                shouldFlip={false}
              >
                <AriaDialog className={styles.dialog}>
                  {calendars === 2 ? (
                    renderDualCalendar()
                  ) : (
                    <Calendar
                      appearance="year"
                      value={startValue}
                      onChange={handleStartYearSelect}
                      isDisabled={isDisabled}
                    />
                  )}
                </AriaDialog>
              </Popover>
            </DialogTrigger>
          </>
        )}
      </InputContainer>
    </div>
  );
}

YearRangePicker.displayName = "YearRangePicker";
