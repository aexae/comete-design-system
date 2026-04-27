// YearPicker — Comète Design System
// Sélecteur d'année : deux modes (saisie / navigation) × (single / range).
import { useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
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
import styles from "./YearPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type YearPickerAppearance = InputContainerAppearance;

/** Props communes aux deux variantes. */
interface YearPickerBaseProps {
  /**
   * Mode saisie : affiche un champ texte + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton année (single)
   * ou les deux boutons année cliquables + calendrier (range).
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
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Label accessible. */
  "aria-label"?: string;
}

/** Props du mode simple (sélection d'une année unique). */
export interface SingleYearPickerProps extends YearPickerBaseProps {
  /** @default false */
  isRange?: false;
  /** Année sélectionnée. */
  year?: number;
  /** Callback appelé à chaque changement d'année. */
  onChange?: (year: number) => void;
}

/** Props du mode plage (sélection d'une plage d'années). */
export interface RangeYearPickerProps extends YearPickerBaseProps {
  /** Active la sélection de plage. */
  isRange: true;
  /** Année de début. */
  startYear?: number;
  /** Année de fin. */
  endYear?: number;
  /**
   * Nombre de calendriers affichés dans le popover.
   * @default 2
   */
  calendars?: 1 | 2;
  /** Callback appelé à chaque changement de plage. */
  onChange?: (startYear: number, endYear: number) => void;
}

/** Union discriminée — TypeScript infère le bon type selon `isRange`. */
export type YearPickerProps = SingleYearPickerProps | RangeYearPickerProps;

// -----------------------------------------------------------------------
// Dispatcher

/**
 * YearPicker — Comète Design System
 *
 * Sélecteur d'année avec deux modes d'interaction × deux modes de sélection.
 *
 * **Modes d'interaction** :
 * - **Saisie** (`isEditable={true}`, défaut) : champ texte + icône calendrier.
 * - **Navigation** (`isEditable={false}`) : chevrons ←/→ + bouton année (single)
 *   ou deux boutons année cliquables + calendrier (range).
 *
 * **Modes de sélection** :
 * - **Simple** (`isRange={false}`, défaut) : une seule année.
 * - **Plage** (`isRange={true}`) : deux années (start/end) séparées par `→`.
 *
 * ```tsx
 * // Année unique
 * <YearPicker year={2025} onChange={(y) => ...} />
 *
 * // Plage d'années
 * <YearPicker
 *   isRange
 *   startYear={2023}
 *   endYear={2025}
 *   onChange={(sy, ey) => ...}
 * />
 * ```
 */
export function YearPicker(props: YearPickerProps): ReactElement {
  if (props.isRange) {
    return <RangeYearPicker {...props} />;
  }
  return <SingleYearPicker {...props} />;
}

YearPicker.displayName = "YearPicker";

// -----------------------------------------------------------------------
// Single (isRange=false)

function SingleYearPicker({
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: Omit<SingleYearPickerProps, "isRange">): ReactElement {
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
      style={style}
    >
      <InputContainer isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        onContainerClick={() => {
          if (isDisabled || !isEditable) return;
          setIsOpen(true);
          const input = containerRef.current?.querySelector<HTMLInputElement>("input");
          input?.focus();
          input?.select();
        }}
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

// -----------------------------------------------------------------------
// Range (isRange=true)

function RangeYearPicker({
  startYear,
  endYear,
  calendars = 2,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: Omit<RangeYearPickerProps, "isRange">): ReactElement {
  const currentYear = today(getLocalTimeZone()).year;

  const resolvedStart = startYear ?? currentYear;
  const resolvedEnd = endYear ?? currentYear;

  // Plage inversée (start > end) : force isInvalid.
  const isInverted = resolvedStart > resolvedEnd;
  const effectiveInvalid = isInvalid || isInverted;

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

  // -- Handlers calendar selection --

  const handleStartYearSelect = (date: CalendarDate) => {
    commitRange(date.year, resolvedEnd);
  };

  const handleEndYearSelect = (date: CalendarDate) => {
    commitRange(resolvedStart, date.year);
  };

  const handleRangeSelect = (range: RangeValue<CalendarDate>) => {
    commitRange(range.start.year, range.end.year);
  };

  // -- Handler : mise à jour immédiate au premier clic (start seul) --
  // Pas de swap pour respecter l'année cliquée exactement (même si start > end
  // temporairement). Le second clic committera la plage finale avec swap.
  const handleIntermediateStart = (date: CalendarDate) => {
    onChange?.(date.year, resolvedEnd);
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
    start: startValue,
    end: endValue,
  };

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  // -- Calendar helpers --

  const renderRangeCalendar = () => (
    <Calendar
      appearance="year"
      isRange
      calendars={2}
      value={rangeValue}
      onChange={handleRangeSelect}
      onIntermediateStart={handleIntermediateStart}
      isDisabled={isDisabled}
    />
  );

  const renderSingleStartCalendar = () => (
    <Calendar
      appearance="year"
      value={startValue}
      onChange={handleStartYearSelect}
      isDisabled={isDisabled}
    />
  );

  const renderSingleEndCalendar = () => (
    <Calendar
      appearance="year"
      value={endValue}
      onChange={handleEndYearSelect}
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
      data-invalid={effectiveInvalid || undefined}
      style={style}
    >
      <InputContainer isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={effectiveInvalid}
      >
        {isEditable ? (
          /* ---- Mode saisie : inputs + icône calendrier ---- */
          <div className={styles.rangeValue}>
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

            <span className={styles.rangeSeparator} aria-hidden="true">
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
                {calendars === 2 ? renderRangeCalendar() : renderSingleStartCalendar()}
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : boutons année + icône calendrier ---- */
          <>
            <div className={styles.rangeValue}>
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
                    {calendars === 2 ? renderRangeCalendar() : renderSingleStartCalendar()}
                  </AriaDialog>
                </Popover>
              </DialogTrigger>

              <span className={styles.rangeSeparator} aria-hidden="true">
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
                    {calendars === 2 ? renderRangeCalendar() : renderSingleEndCalendar()}
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
                  {calendars === 2 ? renderRangeCalendar() : renderSingleStartCalendar()}
                </AriaDialog>
              </Popover>
            </DialogTrigger>
          </>
        )}
      </InputContainer>
    </div>
  );
}
