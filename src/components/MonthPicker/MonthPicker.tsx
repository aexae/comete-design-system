// MonthPicker — Comète Design System
// Sélecteur de mois : deux modes (navigation / saisie) selon isEditable.
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
import { Button } from "../Button/Button.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./MonthPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type MonthPickerAppearance = InputContainerAppearance;

export interface MonthPickerProps {
  /** Mois sélectionné (1-12). */
  month?: number;
  /** Année sélectionnée. */
  year?: number;
  /** Callback appelé à chaque changement de mois/année. */
  onChange?: (month: number, year: number) => void;
  /**
   * Mode saisie : affiche des champs texte + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton mois/année.
   * @default true
   */
  isEditable?: boolean;
  /** Apparence visuelle. @default "default" */
  appearance?: MonthPickerAppearance;
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

/** Formate le nom du mois en toutes lettres avec majuscule (ex: "Juin"). */
function formatMonthLong(month: number, locale: string): string {
  return capitalize(
    new Intl.DateTimeFormat(locale, { month: "long" }).format(
      new Date(2000, month - 1, 1),
    ),
  );
}

/** Formate "Mois Année" avec majuscule (ex: "Juin 2025"). */
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

// -----------------------------------------------------------------------
// Composant

/**
 * MonthPicker — Comète Design System
 *
 * Sélecteur de mois unique avec deux modes :
 *
 * **Navigation** (`isEditable={false}`) :
 * ```
 * < Juin 2025 ▼ >
 * ```
 * Chevrons ←/→ pour ±1 mois, bouton mois/année ouvre le calendar.
 *
 * **Saisie** (`isEditable={true}`, défaut) :
 * ```
 * [ 06 / 2025 ] 📅
 * ```
 * Champs texte éditables + icône calendrier ouvre le calendar.
 *
 * ```tsx
 * import { MonthPicker } from "@naxit/comete-design-system";
 *
 * <MonthPicker month={6} year={2025} onChange={(m, y) => console.log(m, y)} />
 * ```
 */
export function MonthPicker({
  month,
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
}: MonthPickerProps): ReactElement {
  const { locale } = useLocale();
  const todayDate = today(getLocalTimeZone());
  const currentMonth = todayDate.month;
  const currentYear = todayDate.year;

  const resolvedMonth = month ?? currentMonth;
  const resolvedYear = year ?? currentYear;

  // Ref du conteneur pour positionner le popover sous le champ entier
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Handlers navigation mode --

  const handlePrev = () => {
    if (isDisabled) return;
    if (resolvedMonth === 1) {
      onChange?.(12, resolvedYear - 1);
    } else {
      onChange?.(resolvedMonth - 1, resolvedYear);
    }
  };

  const handleNext = () => {
    if (isDisabled) return;
    if (resolvedMonth === 12) {
      onChange?.(1, resolvedYear + 1);
    } else {
      onChange?.(resolvedMonth + 1, resolvedYear);
    }
  };

  // -- Popover state --

  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown on click outside or Escape (editable mode only)
  useEffect(() => {
    if (!isOpen || !isEditable) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isEditable]);

  // -- Handler calendar selection --

  const handleMonthSelect = (date: CalendarDate) => {
    onChange?.(date.month, date.year);
    setIsOpen(false);
  };

  // -- Editable input state --

  const [monthInput, setMonthInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [monthFocused, setMonthFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);

  const handleMonthInputFocus = () => {
    setMonthInput(String(resolvedMonth).padStart(2, "0"));
    setMonthFocused(true);
  };

  const handleMonthInputBlur = () => {
    setMonthFocused(false);
    const parsed = parseInt(monthInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
      onChange?.(parsed, resolvedYear);
    }
  };

  const handleYearInputFocus = () => {
    setYearInput(String(resolvedYear));
    setYearFocused(true);
  };

  const handleYearInputBlur = () => {
    setYearFocused(false);
    const parsed = parseInt(yearInput, 10);
    if (!isNaN(parsed)) {
      onChange?.(resolvedMonth, parsed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // -- Calendar value --

  const calendarValue = new CalendarDate(resolvedYear, resolvedMonth, 1);

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  const formattedLabel = formatMonthYear(resolvedMonth, resolvedYear, locale);

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Sélecteur de mois : ${formattedLabel}`}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <InputContainer
        appearance={appearance}
        isBorderless={!isEditable}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        {isEditable ? (
          /* ---- Mode saisie : inputs mois/année + icône calendrier ---- */
          <div className={styles.content}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.monthInput}
              value={
                monthFocused
                  ? monthInput
                  : String(resolvedMonth).padStart(2, "0")
              }
              onChange={(e) => setMonthInput(e.target.value)}
              onClick={() => !isDisabled && setIsOpen(true)}
              onFocus={handleMonthInputFocus}
              onBlur={handleMonthInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Mois : ${formatMonthLong(resolvedMonth, locale)}`}
            />

            <span className={styles.separator} aria-hidden="true">
              /
            </span>

            <input
              type="text"
              inputMode="numeric"
              className={styles.yearInput}
              value={yearFocused ? yearInput : String(resolvedYear)}
              onChange={(e) => setYearInput(e.target.value)}
              onClick={() => !isDisabled && setIsOpen(true)}
              onFocus={handleYearInputFocus}
              onBlur={handleYearInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Année : ${resolvedYear}`}
            />

            <Button
              appearance="subtle"
              iconBefore="CalendarMonth"
              className={styles.calendarButton}
              isDisabled={isDisabled}
              onPress={() => !isDisabled && setIsOpen((o) => !o)}
              aria-label="Ouvrir le sélecteur de mois"
            />
            {isOpen && (
              <div className={styles.calendarDropdown}>
                <Calendar
                  appearance="month"
                  value={calendarValue}
                  onChange={handleMonthSelect}
                  isDisabled={isDisabled}
                />
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : chevrons + bouton mois/année ---- */
          <div className={styles.content}>
            <Button
              appearance="subtle"
              iconBefore="ChevronLeft"
              className={styles.chevronButton}
              isDisabled={isDisabled}
              onPress={handlePrev}
              aria-label="Mois précédent"
            />

            <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
              <Button
                appearance="subtle"
                iconAfter="ArrowDropDown"
                className={styles.monthButton}
                isDisabled={isDisabled}
                aria-label={`Mois : ${formattedLabel}`}
              >
                {formattedLabel}
              </Button>
              <Popover
                triggerRef={containerRef}
                placement="bottom start"
                shouldFlip={false}
              >
                <AriaDialog className={styles.dialog}>
                  <Calendar
                    appearance="month"
                    value={calendarValue}
                    onChange={handleMonthSelect}
                    isDisabled={isDisabled}
                  />
                </AriaDialog>
              </Popover>
            </DialogTrigger>

            <Button
              appearance="subtle"
              iconBefore="ChevronRight"
              className={styles.chevronButton}
              isDisabled={isDisabled}
              onPress={handleNext}
              aria-label="Mois suivant"
            />
          </div>
        )}
      </InputContainer>
    </div>
  );
}

MonthPicker.displayName = "MonthPicker";
