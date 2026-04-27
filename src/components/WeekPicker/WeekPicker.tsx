// WeekPicker — Comète Design System
// Sélecteur de semaine ISO : deux modes (saisie / navigation) × (single / range).
import { useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  startOfWeek,
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
import styles from "./WeekPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type WeekPickerAppearance = InputContainerAppearance;

/** Props communes aux deux variantes. */
interface WeekPickerBaseProps {
  /**
   * Mode saisie : affiche un champ texte + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton semaine formaté
   * (single) ou les deux boutons semaine cliquables + calendrier (range).
   * @default true
   */
  isEditable?: boolean;
  /** Apparence visuelle. @default "default" */
  appearance?: WeekPickerAppearance;
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

/** Props du mode simple (sélection d'une semaine unique). */
export interface SingleWeekPickerProps extends WeekPickerBaseProps {
  /** @default false */
  isRange?: false;
  /** Numéro de semaine ISO (1-53). */
  week?: number;
  /** Année ISO de la semaine. */
  year?: number;
  /** Callback appelé à chaque changement de semaine. */
  onChange?: (week: number, year: number) => void;
}

/** Props du mode plage (sélection d'une plage de semaines). */
export interface RangeWeekPickerProps extends WeekPickerBaseProps {
  /** Active la sélection de plage. */
  isRange: true;
  /** Semaine ISO de début (1-53). */
  startWeek?: number;
  /** Année ISO de la semaine de début. */
  startYear?: number;
  /** Semaine ISO de fin (1-53). */
  endWeek?: number;
  /** Année ISO de la semaine de fin. */
  endYear?: number;
  /** Callback appelé à chaque changement de plage. */
  onChange?: (
    startWeek: number,
    startYear: number,
    endWeek: number,
    endYear: number,
  ) => void;
}

/** Union discriminée — TypeScript infère le bon type selon `isRange`. */
export type WeekPickerProps = SingleWeekPickerProps | RangeWeekPickerProps;

// -----------------------------------------------------------------------
// Helpers ISO 8601

/** Calcule le numéro de semaine ISO 8601 pour une date. */
function getISOWeekNumber(date: CalendarDate): number {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const dayNum = d.getUTCDay() || 7; // 1=Lun … 7=Dim
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // avancer au jeudi
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Calcule l'année ISO de la semaine (peut différer de l'année calendaire). */
function getISOWeekYear(date: CalendarDate): number {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/** Retourne le lundi de la semaine ISO donnée. */
function getMondayOfISOWeek(week: number, year: number): CalendarDate {
  // Le 4 janvier est toujours dans la semaine ISO 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // 1=Lun … 7=Dim
  // Lundi de la semaine 1
  const mondayW1 = new Date(jan4.getTime());
  mondayW1.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));
  // Ajouter (week - 1) * 7 jours
  mondayW1.setUTCDate(mondayW1.getUTCDate() + (week - 1) * 7);
  return new CalendarDate(
    mondayW1.getUTCFullYear(),
    mondayW1.getUTCMonth() + 1,
    mondayW1.getUTCDate(),
  );
}

/** Formate une date en DD/MM/YYYY. */
function formatShortDate(date: CalendarDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date.year, date.month - 1, date.day));
}

/** Formate le label complet semaine : `Sem. 28 • 07/07/25 - 13/07/25`. */
function formatWeekLabel(
  week: number,
  weekStart: CalendarDate,
  weekEnd: CalendarDate,
  locale: string,
): string {
  const start = formatShortDate(weekStart, locale);
  const end = formatShortDate(weekEnd, locale);
  return `Sem. ${week} \u2022 ${start} - ${end}`;
}

/** Formate le label court (semaine + début) : `Sem. 28 • 07/07/25`. */
function formatWeekLabelShort(
  week: number,
  weekStart: CalendarDate,
  locale: string,
): string {
  const start = formatShortDate(weekStart, locale);
  return `Sem. ${week} \u2022 ${start}`;
}

/**
 * Parse une chaîne DD/MM/YY ou DD/MM/YYYY en CalendarDate.
 * Retourne `null` si le format est invalide.
 */
function parseDateString(input: string): CalendarDate | null {
  const trimmed = input.trim();
  // Accepter DD/MM/YY et DD/MM/YYYY
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  // Année sur 2 chiffres → 2000+
  if (year < 100) year += 2000;
  // Validation basique
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  try {
    return new CalendarDate(year, month, day);
  } catch {
    return null;
  }
}

/**
 * Parse la saisie utilisateur.
 * Accepte :
 *  - Un numéro de semaine seul : "28", "S28", "Sem. 28", "sem 28"
 *  - Une date DD/MM/YY ou DD/MM/YYYY : "07/07/25", "07/07/2025"
 *  - Le format complet : "Sem. 28 • 07/07/25 - 13/07/25"
 * Retourne `{ week, year }` ou `null`.
 */
function parseInput(
  input: string,
  currentYear: number,
): { week: number; year: number } | null {
  const trimmed = input.trim();

  // 1) Format complet "Sem. 28 • ..." → extraire le numéro
  const fullMatch = trimmed.match(/^[Ss](?:em\.?\s*)(\d{1,2})\s*[•·]/);
  if (fullMatch?.[1]) {
    const wk = parseInt(fullMatch[1], 10);
    if (wk >= 1 && wk <= 53) return { week: wk, year: currentYear };
  }

  // 2) Numéro de semaine seul : "28", "S28", "Sem. 28", "sem28"
  const weekMatch = trimmed.match(/^[Ss](?:em\.?\s*)?(\d{1,2})$/);
  if (weekMatch?.[1]) {
    const wk = parseInt(weekMatch[1], 10);
    if (wk >= 1 && wk <= 53) return { week: wk, year: currentYear };
  }

  // 3) Juste un nombre : "28"
  const numMatch = trimmed.match(/^(\d{1,2})$/);
  if (numMatch?.[1]) {
    const wk = parseInt(numMatch[1], 10);
    if (wk >= 1 && wk <= 53) return { week: wk, year: currentYear };
  }

  // 4) Date DD/MM/YY — prendre la première date trouvée dans la chaîne
  const dateMatch = trimmed.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateMatch?.[1]) {
    const parsed = parseDateString(dateMatch[1]);
    if (parsed) {
      return {
        week: getISOWeekNumber(parsed),
        year: getISOWeekYear(parsed),
      };
    }
  }

  return null;
}

/** Compare deux semaines (year * 53 + week). */
function weekToOrdinal(week: number, year: number): number {
  return year * 53 + week;
}

// -----------------------------------------------------------------------
// Dispatcher

/**
 * WeekPicker — Comète Design System
 *
 * Sélecteur de semaine ISO avec deux modes d'interaction × deux modes de sélection.
 *
 * **Modes d'interaction** :
 * - **Saisie** (`isEditable={true}`, défaut) : champ texte + icône calendrier.
 * - **Navigation** (`isEditable={false}`) : chevrons ←/→ + bouton semaine (single)
 *   ou deux boutons semaine cliquables + calendrier (range).
 *
 * **Modes de sélection** :
 * - **Simple** (`isRange={false}`, défaut) : une seule semaine.
 * - **Plage** (`isRange={true}`) : deux semaines (start/end) séparées par `→`.
 *
 * ```tsx
 * // Semaine unique
 * <WeekPicker week={28} year={2025} onChange={(w, y) => ...} />
 *
 * // Plage de semaines
 * <WeekPicker
 *   isRange
 *   startWeek={28} startYear={2025}
 *   endWeek={32} endYear={2025}
 *   onChange={(sw, sy, ew, ey) => ...}
 * />
 * ```
 */
export function WeekPicker(props: WeekPickerProps): ReactElement {
  if (props.isRange) {
    return <RangeWeekPicker {...props} />;
  }
  return <SingleWeekPicker {...props} />;
}

WeekPicker.displayName = "WeekPicker";

// -----------------------------------------------------------------------
// Single (isRange=false)

function SingleWeekPicker({
  week,
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: Omit<SingleWeekPickerProps, "isRange">): ReactElement {
  const { locale } = useLocale();
  const todayDate = today(getLocalTimeZone());

  const currentWeek = getISOWeekNumber(todayDate);
  const currentYear = getISOWeekYear(todayDate);

  const resolvedWeek = week ?? currentWeek;
  const resolvedYear = year ?? currentYear;

  // Compute week boundaries
  const monday = getMondayOfISOWeek(resolvedWeek, resolvedYear);
  const sunday = monday.add({ days: 6 });

  // Ref du conteneur pour positionner le popover sous le champ entier
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Calendar value (week range) --

  const calendarValue: RangeValue<CalendarDate> = {
    start: monday,
    end: sunday,
  };

  // -- Handlers navigation mode --

  const handlePrev = () => {
    if (isDisabled) return;
    const prevMonday = monday.subtract({ days: 7 });
    const prevWeek = getISOWeekNumber(prevMonday);
    const prevYear = getISOWeekYear(prevMonday);
    onChange?.(prevWeek, prevYear);
  };

  const handleNext = () => {
    if (isDisabled) return;
    const nextMonday = monday.add({ days: 7 });
    const nextWeek = getISOWeekNumber(nextMonday);
    const nextYear = getISOWeekYear(nextMonday);
    onChange?.(nextWeek, nextYear);
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

  const handleWeekSelect = (range: RangeValue<CalendarDate>) => {
    const weekStart = startOfWeek(range.start, locale);
    const wk = getISOWeekNumber(weekStart);
    const yr = getISOWeekYear(weekStart);
    onChange?.(wk, yr);
    setIsOpen(false);
  };

  // -- Derived --

  const weekLabel = formatWeekLabel(resolvedWeek, monday, sunday, locale);

  // -- État local pour le champ de saisie --
  const [inputValue, setInputValue] = useState(weekLabel);
  // Synchroniser l'input quand la valeur contrôlée change
  const prevLabelRef = useRef(weekLabel);
  if (prevLabelRef.current !== weekLabel) {
    prevLabelRef.current = weekLabel;
    setInputValue(weekLabel);
  }

  /** Valide la saisie : numéro de semaine ou date → résout la semaine ISO. */
  const commitInput = () => {
    const result = parseInput(inputValue, resolvedYear);
    if (result) {
      onChange?.(result.week, result.year);
    }
    // Toujours rétablir l'affichage formaté
    setInputValue(weekLabel);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInput();
    }
  };

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Sélecteur de semaine : ${weekLabel}`}
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
          /* ---- Mode saisie : "Sem. 28 • 07/07/25 - 13/07/25" + calendrier ---- */
          <div className={styles.content}>
            <input
              type="text"
              className={styles.weekInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={() => !isDisabled && setIsOpen(true)}
              onBlur={commitInput}
              onKeyDown={handleInputKeyDown}
              disabled={isDisabled}
              aria-label={`Semaine ${resolvedWeek} : ${weekLabel}`}
            />

            <Button
              appearance="subtle"
              iconBefore="CalendarMonth"
              className={styles.calendarButton}
              isDisabled={isDisabled}
              onPress={() => !isDisabled && setIsOpen((o) => !o)}
              aria-label="Ouvrir le sélecteur de semaine"
            />
            {isOpen && (
              <div className={styles.calendarDropdown}>
                <Calendar
                  appearance="week"
                  value={calendarValue}
                  onChange={handleWeekSelect}
                  isDisabled={isDisabled}
                />
              </div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : chevrons + bouton semaine ---- */
          <div className={styles.navigationContent}>
            <Button
              appearance="subtle"
              iconBefore="ChevronLeft"
              className={styles.chevronButton}
              isDisabled={isDisabled}
              onPress={handlePrev}
              aria-label="Semaine précédente"
            />

            <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
              <Button
                appearance="subtle"
                iconAfter="ArrowDropDown"
                className={styles.weekButton}
                isDisabled={isDisabled}
                aria-label={`Semaine : ${weekLabel}`}
              >
                {weekLabel}
              </Button>
              <Popover
                triggerRef={containerRef}
                placement="bottom start"
                shouldFlip={false}
              >
                <AriaDialog className={styles.dialog}>
                  <Calendar
                    appearance="week"
                    value={calendarValue}
                    onChange={handleWeekSelect}
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
              aria-label="Semaine suivante"
            />
          </div>
        )}
      </InputContainer>
    </div>
  );
}

// -----------------------------------------------------------------------
// Range (isRange=true)

function RangeWeekPicker({
  startWeek,
  startYear,
  endWeek,
  endYear,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: Omit<RangeWeekPickerProps, "isRange">): ReactElement {
  const { locale } = useLocale();
  const todayDate = today(getLocalTimeZone());

  const currentWeek = getISOWeekNumber(todayDate);
  const currentYear = getISOWeekYear(todayDate);

  const resolvedStartWeek = startWeek ?? currentWeek;
  const resolvedStartYear = startYear ?? currentYear;
  const resolvedEndWeek = endWeek ?? currentWeek;
  const resolvedEndYear = endYear ?? currentYear;

  // Plage inversée (start > end) : force isInvalid.
  const isInverted =
    weekToOrdinal(resolvedStartWeek, resolvedStartYear) >
    weekToOrdinal(resolvedEndWeek, resolvedEndYear);
  const effectiveInvalid = isInvalid || isInverted;

  // Bornes dates (lundi début → dimanche fin)
  const startMonday = getMondayOfISOWeek(resolvedStartWeek, resolvedStartYear);
  const endMonday = getMondayOfISOWeek(resolvedEndWeek, resolvedEndYear);
  const endSunday = endMonday.add({ days: 6 });

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

  // -- Helper : commit range (auto-swap if start > end) --

  const commitRange = (
    sw: number,
    sy: number,
    ew: number,
    ey: number,
  ) => {
    if (weekToOrdinal(sw, sy) > weekToOrdinal(ew, ey)) {
      onChange?.(ew, ey, sw, sy);
    } else {
      onChange?.(sw, sy, ew, ey);
    }
  };

  // -- Handler calendar range selection --
  // Le Calendar appearance="week" retourne une plage de jours. On extrait la
  // semaine ISO du lundi de la plage de début, et celle du lundi de la plage
  // de fin.

  const handleRangeSelect = (range: RangeValue<CalendarDate>) => {
    const startOfStart = startOfWeek(range.start, locale);
    const startOfEnd = startOfWeek(range.end, locale);
    commitRange(
      getISOWeekNumber(startOfStart),
      getISOWeekYear(startOfStart),
      getISOWeekNumber(startOfEnd),
      getISOWeekYear(startOfEnd),
    );
  };

  // -- Handler : mise à jour immédiate au premier clic (start seul) --
  // Pas de swap pour respecter la semaine cliquée exactement (même si start > end
  // temporairement). Le second clic committera la plage finale avec swap.
  const handleIntermediateStart = (weekStart: CalendarDate) => {
    onChange?.(
      getISOWeekNumber(weekStart),
      getISOWeekYear(weekStart),
      resolvedEndWeek,
      resolvedEndYear,
    );
  };

  // -- Editable input state --

  // Format range : toujours "Sem. X • date de début" (pas la plage complète,
  // sinon le libellé devient trop long côte à côte).
  const startLabel = formatWeekLabelShort(
    resolvedStartWeek,
    startMonday,
    locale,
  );
  const endLabel = formatWeekLabelShort(resolvedEndWeek, endMonday, locale);

  const [startInput, setStartInput] = useState(startLabel);
  const [endInput, setEndInput] = useState(endLabel);

  // Synchroniser l'input quand la valeur contrôlée change
  const prevStartRef = useRef(startLabel);
  if (prevStartRef.current !== startLabel) {
    prevStartRef.current = startLabel;
    setStartInput(startLabel);
  }
  const prevEndRef = useRef(endLabel);
  if (prevEndRef.current !== endLabel) {
    prevEndRef.current = endLabel;
    setEndInput(endLabel);
  }

  const commitStartInput = () => {
    const result = parseInput(startInput, resolvedStartYear);
    if (result) {
      commitRange(
        result.week,
        result.year,
        resolvedEndWeek,
        resolvedEndYear,
      );
    }
    // Toujours rétablir l'affichage formaté
    setStartInput(startLabel);
  };

  const commitEndInput = () => {
    const result = parseInput(endInput, resolvedEndYear);
    if (result) {
      commitRange(
        resolvedStartWeek,
        resolvedStartYear,
        result.week,
        result.year,
      );
    }
    setEndInput(endLabel);
  };

  const handleStartInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitStartInput();
    }
  };

  const handleEndInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEndInput();
    }
  };

  // -- Calendar value (range de dates : lundi début → dimanche fin) --

  const calendarValue: RangeValue<CalendarDate> = {
    start: startMonday,
    end: endSunday,
  };

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  const renderCalendar = () => (
    <Calendar
      appearance="week"
      mode="period"
      value={calendarValue}
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
        ariaLabel ?? `Plage de semaines : ${startLabel} à ${endLabel}`
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
          <div className={styles.content}>
            <input
              type="text"
              className={styles.weekInput}
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onBlur={commitStartInput}
              onKeyDown={handleStartInputKeyDown}
              disabled={isDisabled}
              aria-label={`Semaine de début : ${startLabel}`}
            />

            <span className={styles.rangeSeparator} aria-hidden="true">
              →
            </span>

            <input
              type="text"
              className={styles.weekInput}
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              onClick={() => !isDisabled && setOpenPopover("range")}
              onBlur={commitEndInput}
              onKeyDown={handleEndInputKeyDown}
              disabled={isDisabled}
              aria-label={`Semaine de fin : ${endLabel}`}
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
              aria-label="Ouvrir le sélecteur de semaine"
            />
            {openPopover === "range" && (
              <div className={styles.calendarDropdown}>{renderCalendar()}</div>
            )}
          </div>
        ) : (
          /* ---- Mode navigation : boutons semaine + icône calendrier ---- */
          <>
            <div className={styles.rangeValue}>
              {/* Bouton semaine de début */}
              <DialogTrigger
                isOpen={openPopover === "start"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "start" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.weekButton}
                  isDisabled={isDisabled}
                  aria-label={`Semaine de début : ${startLabel}`}
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

              {/* Bouton semaine de fin */}
              <DialogTrigger
                isOpen={openPopover === "end"}
                onOpenChange={(open) =>
                  setOpenPopover(open ? "end" : null)
                }
              >
                <Button
                  appearance="subtle"
                  className={styles.weekButton}
                  isDisabled={isDisabled}
                  aria-label={`Semaine de fin : ${endLabel}`}
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
                aria-label="Ouvrir le sélecteur de semaine"
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
