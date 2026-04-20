// MonthRangePicker — Comète Design System
// Sélecteur de plage de mois : champs texte "Mois Année" + calendrier.
import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  useLocale,
} from "react-aria-components";
import type { RangeValue } from "react-aria-components";
import { Button } from "../Button/Button.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./MonthRangePicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type MonthRangePickerAppearance = InputContainerAppearance;

export interface MonthRangePickerProps {
  /** Mois de début (1-12). */
  startMonth?: number;
  /** Année de début. */
  startYear?: number;
  /** Mois de fin (1-12). */
  endMonth?: number;
  /** Année de fin. */
  endYear?: number;
  /** Callback appelé à chaque changement de plage. */
  onChange?: (
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ) => void;
  /**
   * Mode saisie : affiche des inputs texte + icône calendrier.
   * Quand `false`, affiche les boutons mois cliquables.
   * @default true
   */
  isEditable?: boolean;
  /** Apparence visuelle. @default "default" */
  appearance?: MonthRangePickerAppearance;
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
// Helpers

/** Capitalise la première lettre d'une chaîne. */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Formate "Mois Année" avec majuscule (ex: "Août 2025"). */
function formatMonthYear(
  month: number,
  year: number,
  locale: string,
): string {
  return capitalize(
    new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1)),
  );
}

/**
 * Parse une chaîne "Mois Année" (ex: "Août 2025", "août 2025", "08 2025", "08/2025").
 * Retourne `{ month, year }` ou `null`.
 */
function parseMonthYear(
  input: string,
  locale: string,
): { month: number; year: number } | null {
  const trimmed = input.trim();

  // Format numérique : "08 2025", "08/2025", "8/2025"
  const numMatch = trimmed.match(/^(\d{1,2})\s*[/\s]\s*(\d{4})$/);
  if (numMatch?.[1] && numMatch[2]) {
    const m = parseInt(numMatch[1], 10);
    const y = parseInt(numMatch[2], 10);
    if (m >= 1 && m <= 12) return { month: m, year: y };
  }

  // Format texte : "Août 2025" — matcher le nom du mois dans la locale
  for (let m = 1; m <= 12; m++) {
    const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(
      new Date(2000, m - 1, 1),
    );
    if (trimmed.toLowerCase().startsWith(monthName.toLowerCase())) {
      const rest = trimmed.slice(monthName.length).trim();
      const yearMatch = rest.match(/^(\d{4})$/);
      if (yearMatch?.[1]) {
        return { month: m, year: parseInt(yearMatch[1], 10) };
      }
    }
  }

  return null;
}

/** Compare deux mois (year * 12 + month) pour ordonner. */
function monthToOrdinal(month: number, year: number): number {
  return year * 12 + month;
}

// -----------------------------------------------------------------------
// Composant

/**
 * MonthRangePicker — Comète Design System
 *
 * Sélecteur de plage de mois :
 * ```
 * [ Août 2025 → Novembre 2025 ] 📅
 * ```
 * Champs texte éditables + icône calendrier ouvrant un DualMonthCalendar.
 *
 * ```tsx
 * import { MonthRangePicker } from "@naxit/comete-design-system";
 *
 * <MonthRangePicker
 *   startMonth={8} startYear={2025}
 *   endMonth={11} endYear={2025}
 *   onChange={(sm, sy, em, ey) => console.log(sm, sy, em, ey)}
 * />
 * ```
 */
export function MonthRangePicker({
  startMonth,
  startYear,
  endMonth,
  endYear,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
}: MonthRangePickerProps): ReactElement {
  const { locale } = useLocale();
  const todayDate = today(getLocalTimeZone());

  const resolvedStartMonth = startMonth ?? todayDate.month;
  const resolvedStartYear = startYear ?? todayDate.year;
  const resolvedEndMonth = endMonth ?? todayDate.month;
  const resolvedEndYear = endYear ?? todayDate.year;

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

  // -- Helper : commit range (auto-swap if start > end) --

  const commitRange = (
    sm: number,
    sy: number,
    em: number,
    ey: number,
  ) => {
    if (monthToOrdinal(sm, sy) > monthToOrdinal(em, ey)) {
      onChange?.(em, ey, sm, sy);
    } else {
      onChange?.(sm, sy, em, ey);
    }
  };

  // -- Handler calendar range selection --

  const handleRangeSelect = (range: RangeValue<CalendarDate>) => {
    commitRange(
      range.start.month,
      range.start.year,
      range.end.month,
      range.end.year,
    );
  };

  // -- Editable input state --

  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);

  const startLabel = formatMonthYear(
    resolvedStartMonth,
    resolvedStartYear,
    locale,
  );
  const endLabel = formatMonthYear(
    resolvedEndMonth,
    resolvedEndYear,
    locale,
  );

  const handleStartFocus = () => {
    setStartInput(startLabel);
    setStartFocused(true);
  };

  const handleStartBlur = () => {
    setStartFocused(false);
    const parsed = parseMonthYear(startInput, locale);
    if (parsed) {
      commitRange(
        parsed.month,
        parsed.year,
        resolvedEndMonth,
        resolvedEndYear,
      );
    }
  };

  const handleEndFocus = () => {
    setEndInput(endLabel);
    setEndFocused(true);
  };

  const handleEndBlur = () => {
    setEndFocused(false);
    const parsed = parseMonthYear(endInput, locale);
    if (parsed) {
      commitRange(
        resolvedStartMonth,
        resolvedStartYear,
        parsed.month,
        parsed.year,
      );
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // -- Calendar values --

  const startValue = new CalendarDate(resolvedStartYear, resolvedStartMonth, 1);
  const endValue = new CalendarDate(resolvedEndYear, resolvedEndMonth, 1);
  const rangeValue: RangeValue<CalendarDate> = {
    start: startValue,
    end: endValue,
  };

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  // -- Dual calendar helper --

  const renderDualCalendar = () => (
    <Calendar
      appearance="month"
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
        ariaLabel ??
        `Plage de mois : ${startLabel} à ${endLabel}`
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
          <div className={styles.content}>
            <input
              type="text"
              className={styles.monthInput}
              value={startFocused ? startInput : startLabel}
              onChange={(e) => setStartInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onFocus={handleStartFocus}
              onBlur={handleStartBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Mois de début : ${startLabel}`}
            />

            <span className={styles.separator} aria-hidden="true">
              →
            </span>

            <input
              type="text"
              className={styles.monthInput}
              value={endFocused ? endInput : endLabel}
              onChange={(e) => setEndInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onFocus={handleEndFocus}
              onBlur={handleEndBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Mois de fin : ${endLabel}`}
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
              aria-label="Ouvrir le sélecteur de mois"
            />
            {openPopover === "range" && (
              <div className={styles.calendarDropdown}>
                {renderDualCalendar()}
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : boutons mois cliquables + icône calendrier ---- */
          <>
            <div className={styles.monthValue}>
              {/* Bouton mois de début */}
              <DialogTrigger
                isOpen={openPopover === "start"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "start" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.monthButton}
                  isDisabled={isDisabled}
                  aria-label={`Mois de début : ${startLabel}`}
                >
                  {startLabel}
                </Button>
                <Popover
                  triggerRef={containerRef}
                  placement="bottom start"
                  shouldFlip={false}
                >
                  <AriaDialog className={styles.dialog}>
                    {renderDualCalendar()}
                  </AriaDialog>
                </Popover>
              </DialogTrigger>

              <span className={styles.separator} aria-hidden="true">
                →
              </span>

              {/* Bouton mois de fin */}
              <DialogTrigger
                isOpen={openPopover === "end"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "end" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.monthButton}
                  isDisabled={isDisabled}
                  aria-label={`Mois de fin : ${endLabel}`}
                >
                  {endLabel}
                </Button>
                <Popover
                  triggerRef={containerRef}
                  placement="bottom start"
                  shouldFlip={false}
                >
                  <AriaDialog className={styles.dialog}>
                    {renderDualCalendar()}
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
                aria-label="Ouvrir le sélecteur de mois"
              />
              <Popover
                triggerRef={containerRef}
                placement="bottom start"
                shouldFlip={false}
              >
                <AriaDialog className={styles.dialog}>
                  {renderDualCalendar()}
                </AriaDialog>
              </Popover>
            </DialogTrigger>
          </>
        )}
      </InputContainer>
    </div>
  );
}

MonthRangePicker.displayName = "MonthRangePicker";
