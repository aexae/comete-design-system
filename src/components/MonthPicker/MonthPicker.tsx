// MonthPicker — Comète Design System
// Sélecteur de mois : deux modes (saisie / navigation) × (single / range).
import { useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
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
import styles from "./MonthPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type MonthPickerAppearance = InputContainerAppearance;

/** Props communes aux deux variantes. */
interface MonthPickerBaseProps {
  /**
   * Mode saisie : affiche des champs texte + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton mois/année
   * (ou, en range, les deux boutons mois cliquables).
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
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Label accessible. */
  "aria-label"?: string;
}

/** Props du mode simple (sélection d'un mois unique). */
export interface SingleMonthPickerProps extends MonthPickerBaseProps {
  /** @default false */
  isRange?: false;
  /** Mois sélectionné (1-12). */
  month?: number;
  /** Année sélectionnée. */
  year?: number;
  /** Callback appelé à chaque changement de mois/année. */
  onChange?: (month: number, year: number) => void;
}

/** Props du mode plage (sélection d'une plage de mois). */
export interface RangeMonthPickerProps extends MonthPickerBaseProps {
  /** Active la sélection de plage. */
  isRange: true;
  /** Mois de début (1-12). */
  startMonth?: number;
  /** Année de début. */
  startYear?: number;
  /** Mois de fin (1-12). */
  endMonth?: number;
  /** Année de fin. */
  endYear?: number;
  /**
   * Nombre de calendriers affichés dans le popover.
   * @default 2
   */
  calendars?: 1 | 2;
  /** Callback appelé à chaque changement de plage. */
  onChange?: (
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ) => void;
}

/** Union discriminée — TypeScript infère le bon type selon `isRange`. */
export type MonthPickerProps = SingleMonthPickerProps | RangeMonthPickerProps;

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
// Dispatcher

/**
 * MonthPicker — Comète Design System
 *
 * Sélecteur de mois avec deux modes d'interaction × deux modes de sélection.
 *
 * **Modes d'interaction** :
 * - **Saisie** (`isEditable={true}`, défaut) : champs texte éditables + icône calendrier.
 * - **Navigation** (`isEditable={false}`) : chevrons ←/→ + bouton mois/année (single)
 *   ou deux boutons mois cliquables + calendrier (range).
 *
 * **Modes de sélection** :
 * - **Simple** (`isRange={false}`, défaut) : un seul mois.
 * - **Plage** (`isRange={true}`) : deux mois (start/end) séparés par `→`.
 *
 * ```tsx
 * // Mois unique
 * <MonthPicker month={6} year={2025} onChange={(m, y) => ...} />
 *
 * // Plage de mois
 * <MonthPicker
 *   isRange
 *   startMonth={8} startYear={2025}
 *   endMonth={11} endYear={2025}
 *   onChange={(sm, sy, em, ey) => ...}
 * />
 * ```
 */
export function MonthPicker(props: MonthPickerProps): ReactElement {
  if (props.isRange) {
    return <RangeMonthPicker {...props} />;
  }
  return <SingleMonthPicker {...props} />;
}

MonthPicker.displayName = "MonthPicker";

// -----------------------------------------------------------------------
// Single (isRange=false) — logique d'origine

function SingleMonthPicker({
  month,
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: Omit<SingleMonthPickerProps, "isRange">): ReactElement {
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
      style={style}
    >
      <InputContainer
        appearance={appearance}
        isBorderless={!isEditable}
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

// -----------------------------------------------------------------------
// Range (isRange=true)

function RangeMonthPicker({
  startMonth,
  startYear,
  endMonth,
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
}: Omit<RangeMonthPickerProps, "isRange">): ReactElement {
  const { locale } = useLocale();
  const todayDate = today(getLocalTimeZone());

  const resolvedStartMonth = startMonth ?? todayDate.month;
  const resolvedStartYear = startYear ?? todayDate.year;
  const resolvedEndMonth = endMonth ?? todayDate.month;
  const resolvedEndYear = endYear ?? todayDate.year;

  // Plage inversée (start > end) : force isInvalid pour signaler l'état.
  // Cet état survient pendant l'intermédiaire (premier clic avant le second)
  // ou si le consommateur passe des props incohérentes.
  const isInverted =
    monthToOrdinal(resolvedStartMonth, resolvedStartYear) >
    monthToOrdinal(resolvedEndMonth, resolvedEndYear);
  const effectiveInvalid = isInvalid || isInverted;

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

  // -- Handler : mise à jour immédiate au premier clic (start seul) --
  // Pas de swap : on veut que le champ start reflète exactement le mois cliqué,
  // même si temporairement start > end. Le second clic committera la plage
  // finale avec swap si nécessaire.
  const handleIntermediateStart = (date: CalendarDate) => {
    onChange?.(
      date.month,
      date.year,
      resolvedEndMonth,
      resolvedEndYear,
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

  // -- Calendar helper --

  const renderCalendar = () =>
    calendars === 2 ? (
      <Calendar
        appearance="month"
        isRange
        calendars={2}
        value={rangeValue}
        onChange={handleRangeSelect}
        onIntermediateStart={handleIntermediateStart}
        isDisabled={isDisabled}
      />
    ) : (
      <Calendar
        appearance="month"
        isRange
        value={rangeValue}
        onChange={handleRangeSelect}
        onIntermediateStart={handleIntermediateStart}
        isDisabled={isDisabled}
      />
    );

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={
        ariaLabel ?? `Plage de mois : ${startLabel} à ${endLabel}`
      }
      data-disabled={isDisabled || undefined}
      data-invalid={effectiveInvalid || undefined}
      style={style}
    >
      <InputContainer
        isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={effectiveInvalid}
      >
        {isEditable ? (
          /* ---- Mode saisie : inputs + icône calendrier ---- */
          <div className={styles.content}>
            <input
              type="text"
              className={styles.rangeInput}
              value={startFocused ? startInput : startLabel}
              onChange={(e) => setStartInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onFocus={handleStartFocus}
              onBlur={handleStartBlur}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Mois de début : ${startLabel}`}
            />

            <span className={styles.rangeSeparator} aria-hidden="true">
              →
            </span>

            <input
              type="text"
              className={styles.rangeInput}
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
              <div className={styles.calendarDropdown}>{renderCalendar()}</div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : boutons mois + icône calendrier ---- */
          <>
            <div className={styles.rangeValue}>
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
                    {renderCalendar()}
                  </AriaDialog>
                </Popover>
              </DialogTrigger>

              <span className={styles.rangeSeparator} aria-hidden="true">
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
                    {renderCalendar()}
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
                  {renderCalendar()}
                </AriaDialog>
              </Popover>
            </DialogTrigger>
          </>
        )}
      </InputContainer>
    </div>
  );
}
