// DatePicker — Comète Design System
// Sélecteur de date : deux modes (navigation / saisie) selon isEditable.
import { useRef, useState, type ReactElement } from "react";
import {
  DatePicker as AriaDatePicker,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Group as AriaGroup,
  Dialog as AriaDialog,
  DialogTrigger,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  useLocale,
} from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { Button } from "../Button/Button.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./DatePicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type DatePickerAppearance = InputContainerAppearance;

export interface DatePickerProps<T extends DateValue = DateValue>
  extends Omit<AriaDatePickerProps<T>, "className" | "style" | "children"> {
  /** Apparence visuelle. @default "default" */
  appearance?: DatePickerAppearance;
  /** Taille compacte (padding réduit). @default false */
  isCompact?: boolean;
  /**
   * Mode saisie : affiche un champ segmenté + icône calendrier.
   * Quand `false`, affiche les chevrons ←/→ + bouton date formatée.
   * @default true
   */
  isEditable?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Helpers

function formatDateLong(date: CalendarDate, locale: string): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(jsDate);
}

// -----------------------------------------------------------------------
// Composant

/**
 * DatePicker — Comète Design System
 *
 * Sélecteur de date avec deux modes :
 *
 * **Navigation** (`isEditable={false}`, défaut) :
 * ```
 * < Vendredi 3 avril 2026 ▼ >
 * ```
 * Chevrons ←/→ pour ±1 jour, bouton date ouvre le calendrier.
 *
 * **Saisie** (`isEditable={true}`) :
 * ```
 * [ jj / mm / aaaa ] 📅
 * ```
 * Champ segmenté éditable + icône calendrier.
 *
 * ```tsx
 * import { DatePicker } from "@naxit/comete-design-system";
 * import { today, getLocalTimeZone } from "@internationalized/date";
 *
 * <DatePicker defaultValue={today(getLocalTimeZone())} />
 * <DatePicker isEditable defaultValue={today(getLocalTimeZone())} />
 * ```
 */
export function DatePicker<T extends DateValue = DateValue>({
  appearance = "default",
  isCompact = false,
  isEditable = true,
  className,
  ...ariaProps
}: DatePickerProps<T>): ReactElement {
  if (isEditable) {
    return (
      <EditableDatePicker
        appearance={appearance}
        isCompact={isCompact}
        className={className}
        {...ariaProps}
      />
    );
  }

  return (
    <NavigationDatePicker
      appearance={appearance}
      isCompact={isCompact}
      className={className}
      {...ariaProps}
    />
  );
}

DatePicker.displayName = "DatePicker";

// -----------------------------------------------------------------------
// Mode saisie (isEditable=true) — AriaDatePicker avec segments

function EditableDatePicker<T extends DateValue = DateValue>({
  appearance,
  isCompact,
  className,
  ...ariaProps
}: {
  appearance: DatePickerAppearance;
  isCompact: boolean;
  className?: string;
} & Omit<AriaDatePickerProps<T>, "className" | "style" | "children">): ReactElement {
  return (
    <AriaDatePicker
      className={[styles.datePicker, className].filter(Boolean).join(" ")}
      {...ariaProps}
    >
      {({ isDisabled, isInvalid }) => (
        <>
          <AriaGroup>
            <InputContainer
              appearance={appearance}
              isCompact={isCompact}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
            >
              <AriaDateInput className={styles.dateInput}>
                {(segment) => (
                  <AriaDateSegment className={styles.segment} segment={segment} />
                )}
              </AriaDateInput>
              <Button
                variant="subtle"
                iconBefore="CalendarMonth"
                className={styles.calendarButton}
                isDisabled={isDisabled}
              />
            </InputContainer>
          </AriaGroup>
          <Popover placement="bottom start" shouldFlip={false} className={styles.popover}>
            <AriaDialog className={styles.dialog}>
              <Calendar appearance="date" />
            </AriaDialog>
          </Popover>
        </>
      )}
    </AriaDatePicker>
  );
}

// -----------------------------------------------------------------------
// Mode navigation (isEditable=false) — chevrons + bouton date

function NavigationDatePicker<T extends DateValue = DateValue>({
  appearance,
  isCompact,
  className,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  isInvalid = false,
  "aria-label": ariaLabel,
}: {
  appearance: DatePickerAppearance;
  isCompact: boolean;
  className?: string;
} & Omit<AriaDatePickerProps<T>, "className" | "style" | "children">): ReactElement {
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  // État interne pour le mode non contrôlé
  const todayDate = today(getLocalTimeZone());
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDate>(
    () => (value ?? defaultValue ?? todayDate) as CalendarDate,
  );
  const resolvedValue = (isControlled ? value : internalValue) as CalendarDate;

  const formattedDate = formatDateLong(resolvedValue, locale);

  // -- Popover state --
  const [isOpen, setIsOpen] = useState(false);

  const updateValue = (newDate: CalendarDate) => {
    if (!isControlled) setInternalValue(newDate);
    (onChange as ((value: CalendarDate) => void) | undefined)?.(newDate);
  };

  const handlePrev = () => {
    if (isDisabled) return;
    updateValue(resolvedValue.subtract({ days: 1 }));
  };

  const handleNext = () => {
    if (isDisabled) return;
    updateValue(resolvedValue.add({ days: 1 }));
  };

  const handleCalendarSelect = (date: DateValue) => {
    updateValue(date as CalendarDate);
    setIsOpen(false);
  };

  const rootClassNames = [styles.datePicker, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Date : ${formattedDate}`}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <InputContainer
        appearance={appearance}
        isCompact={isCompact}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        <div className={styles.navigationContent}>
          <Button
            variant="subtle"
            iconBefore="ChevronLeft"
            className={styles.chevronButton}
            isDisabled={isDisabled}
            onPress={handlePrev}
            aria-label="Jour précédent"
          />

          <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
              variant="subtle"
              iconAfter="ArrowDropDown"
              className={styles.dateButton}
              isDisabled={isDisabled}
              aria-label={formattedDate}
            >
              {formattedDate}
            </Button>
            <Popover
              triggerRef={containerRef}
              placement="bottom start"
              shouldFlip={false}
              className={styles.popover}
            >
              <AriaDialog className={styles.dialog}>
                <Calendar
                  appearance="date"
                  value={resolvedValue}
                  onChange={handleCalendarSelect}
                  isDisabled={isDisabled}
                />
              </AriaDialog>
            </Popover>
          </DialogTrigger>

          <Button
            variant="subtle"
            iconBefore="ChevronRight"
            className={styles.chevronButton}
            isDisabled={isDisabled}
            onPress={handleNext}
            aria-label="Jour suivant"
          />
        </div>
      </InputContainer>
    </div>
  );
}
