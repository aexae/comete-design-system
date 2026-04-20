// YearPicker — Comète Design System
// Sélecteur d'année : deux modes (navigation / saisie) selon isEditable.
import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
import { Dialog as AriaDialog, DialogTrigger } from "react-aria-components";
import { Button } from "../Button/Button.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./YearPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type YearPickerAppearance = InputContainerAppearance;

export interface YearPickerProps {
  /** Année sélectionnée. */
  year?: number;
  /** Callback appelé à chaque changement d'année. */
  onChange?: (year: number) => void;
  /**
   * Mode saisie : affiche un champ texte + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton année.
   * @default true
   */
  isEditable?: boolean;
  /** Apparence visuelle. @default "default" */
  appearance?: YearPickerAppearance;
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
 * YearPicker — Comète Design System
 *
 * Sélecteur d'année unique avec deux modes :
 *
 * **Navigation** (`isEditable={false}`, défaut) :
 * ```
 * < 2025 ▼ >
 * ```
 * Chevrons ←/→ pour ±1, bouton année ouvre le calendar.
 *
 * **Saisie** (`isEditable={true}`) :
 * ```
 * [ 2025 ] 📅
 * ```
 * Champ texte éditable + icône calendrier ouvre le calendar.
 *
 * ```tsx
 * import { YearPicker } from "@naxit/comete-design-system";
 *
 * <YearPicker year={2025} onChange={(y) => console.log(y)} />
 * <YearPicker year={2025} isEditable onChange={(y) => console.log(y)} />
 * ```
 */
export function YearPicker({
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
}: YearPickerProps): ReactElement {
  const currentYear = today(getLocalTimeZone()).year;
  const resolvedYear = year ?? currentYear;

  // Ref du conteneur pour positionner le popover sous le champ entier
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Handlers navigation mode --

  const handlePrev = () => {
    if (isDisabled) return;
    onChange?.(resolvedYear - 1);
  };

  const handleNext = () => {
    if (isDisabled) return;
    onChange?.(resolvedYear + 1);
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

  const handleYearSelect = (date: CalendarDate) => {
    onChange?.(date.year);
    setIsOpen(false);
  };

  // -- Handler editable input --

  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputValue(String(resolvedYear));
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // -- Calendar value --

  const calendarValue = new CalendarDate(resolvedYear, 1, 1);

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Sélecteur d'année : ${resolvedYear}`}
      data-invalid={isInvalid || undefined}
    >
      <InputContainer isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        {isEditable ? (
          /* ---- Mode saisie : input + icône calendrier ---- */
          <div className={styles.content}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.yearInput}
              value={isInputFocused ? inputValue : String(resolvedYear)}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={() => !isDisabled && setIsOpen(true)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
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
              aria-label="Ouvrir le sélecteur d'années"
            />
            {isOpen && (
              <div className={styles.calendarDropdown}>
                <Calendar
                  appearance="year"
                  value={calendarValue}
                  onChange={handleYearSelect}
                  isDisabled={isDisabled}
                />
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : chevrons + bouton année ---- */
          <div className={styles.content}>
            <Button
              appearance="subtle"
              iconBefore="ChevronLeft"
              className={styles.chevronButton}
              isDisabled={isDisabled}
              onPress={handlePrev}
              aria-label="Année précédente"
            />

            <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
              <Button
                appearance="subtle"
                iconAfter="ArrowDropDown"
                className={styles.yearButton}
                isDisabled={isDisabled}
                aria-label={`Année : ${resolvedYear}`}
              >
                {resolvedYear}
              </Button>
              <Popover
                triggerRef={containerRef}
                placement="bottom start"
                shouldFlip={false}
              >
                <AriaDialog className={styles.dialog}>
                  <Calendar
                    appearance="year"
                    value={calendarValue}
                    onChange={handleYearSelect}
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
              aria-label="Année suivante"
            />
          </div>
        )}
      </InputContainer>
    </div>
  );
}

YearPicker.displayName = "YearPicker";
