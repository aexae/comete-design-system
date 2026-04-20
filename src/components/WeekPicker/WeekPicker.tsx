// WeekPicker — Comète Design System
// Sélecteur de semaine : deux modes (navigation / saisie) selon isEditable.
import { useEffect, useRef, useState, type ReactElement } from "react";
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

export interface WeekPickerProps {
  /** Numéro de semaine ISO (1-53). */
  week?: number;
  /** Année ISO de la semaine. */
  year?: number;
  /** Callback appelé à chaque changement de semaine. */
  onChange?: (week: number, year: number) => void;
  /**
   * Mode saisie : affiche des champs texte (semaine / année) + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton semaine formaté.
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
  /** Label accessible. */
  "aria-label"?: string;
}

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

/** Formate le label semaine navigation : "Sem. 28 • 07/07/25 - 13/07/25". */
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

// -----------------------------------------------------------------------
// Composant

/**
 * WeekPicker — Comète Design System
 *
 * Sélecteur de semaine ISO avec deux modes :
 *
 * **Navigation** (`isEditable={false}`) :
 * ```
 * < Sem. 28 • 07/07/25 - 13/07/25 ▼ >
 * ```
 * Chevrons ←/→ pour ±1 semaine, bouton ouvre le calendar.
 *
 * **Saisie** (`isEditable={true}`, défaut) :
 * ```
 * [ 07/07/2025 - 13/07/2025 ] 📅
 * ```
 * Plage de dates affichée + icône calendrier ouvre le calendar.
 *
 * ```tsx
 * import { WeekPicker } from "@naxit/comete-design-system";
 *
 * <WeekPicker week={28} year={2025} onChange={(w, y) => console.log(w, y)} />
 * ```
 */
export function WeekPicker({
  week,
  year,
  onChange,
  isEditable = true,
  appearance = "default",
  isInvalid = false,
  isDisabled = false,
  className,
  "aria-label": ariaLabel,
}: WeekPickerProps): ReactElement {
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
    >
      <InputContainer isBorderless={!isEditable}
        appearance={appearance}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
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

WeekPicker.displayName = "WeekPicker";
