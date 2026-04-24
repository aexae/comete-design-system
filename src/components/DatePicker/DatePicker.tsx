// DatePicker — Comète Design System
// Sélecteur de date : deux modes (navigation / saisie) selon isEditable.
import { useCallback, useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
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
  /** Styles inline additionnels. */
  style?: CSSProperties;
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
  style,
  ...ariaProps
}: DatePickerProps<T>): ReactElement {
  if (isEditable) {
    return (
      <EditableDatePicker
        appearance={appearance}
        isCompact={isCompact}
        className={className}
        style={style}
        {...ariaProps}
      />
    );
  }

  return (
    <NavigationDatePicker
      appearance={appearance}
      isCompact={isCompact}
      className={className}
      style={style}
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
  style,
  ...ariaProps
}: {
  appearance: DatePickerAppearance;
  isCompact: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<AriaDatePickerProps<T>, "className" | "style" | "children">): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Traque la valeur courante pour synchroniser le calendrier
  const [currentValue, setCurrentValue] = useState<DateValue | null>(
    () => ariaProps.value ?? ariaProps.defaultValue ?? null,
  );

  // Sync si la valeur contrôlée change depuis l'extérieur
  useEffect(() => {
    if (ariaProps.value !== undefined) {
      setCurrentValue(ariaProps.value as DateValue);
    }
  }, [ariaProps.value]);

  // Intercepte onChange pour tracker la valeur locale
  const handleFieldChange = useCallback(
    (newValue: DateValue | null) => {
      if (!newValue) return;
      setCurrentValue(newValue);
      const onChangeProp = ariaProps.onChange as
        | ((value: DateValue) => void)
        | undefined;
      onChangeProp?.(newValue);
    },
    [ariaProps.onChange],
  );

  // Quand le calendrier change, met à jour la valeur locale + appelle onChange
  const handleCalendarChange = useCallback(
    (newDate: DateValue) => {
      setCurrentValue(newDate);
      const onChangeProp = ariaProps.onChange as
        | ((value: DateValue) => void)
        | undefined;
      onChangeProp?.(newDate);
    },
    [ariaProps.onChange],
  );

  const openPopover = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Ouvre le popover au clic sur le champ (capture phase pour intercepter
  // avant que React Aria ne stoppe la propagation sur les segments)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerDown = () => {
      if (!ariaProps.isDisabled) setIsOpen(true);
    };

    el.addEventListener("pointerdown", handlePointerDown, true);
    return () => el.removeEventListener("pointerdown", handlePointerDown, true);
  }, [ariaProps.isDisabled]);

  // Fermer le popover en cliquant à l'extérieur ou avec Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AriaDatePicker
      className={[styles.datePicker, className].filter(Boolean).join(" ")}
      style={style}
      {...ariaProps}
      value={currentValue as T | null}
      defaultValue={undefined}
      onChange={handleFieldChange}
    >
      {({ isDisabled, isInvalid }) => (
        <div ref={containerRef}>
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
                appearance="subtle"
                iconBefore="CalendarMonth"
                className={styles.calendarButton}
                isDisabled={isDisabled}
                aria-label="Ouvrir le calendrier"
                onPress={isDisabled ? undefined : openPopover}
              />
            </InputContainer>
          </AriaGroup>

          {isOpen && (
            <div ref={popoverRef} role="dialog" className={styles.calendarPopover}>
              <Calendar
                key={currentValue ? `${currentValue.year}-${currentValue.month}` : "empty"}
                appearance="date"
                value={currentValue ?? undefined}
                onChange={handleCalendarChange}
              />
            </div>
          )}
        </div>
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
  style,
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
  style?: CSSProperties;
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
      style={style}
    >
      <InputContainer
        appearance={appearance}
        isBorderless
        isCompact={isCompact}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        <div className={styles.navigationContent}>
          <Button
            appearance="subtle"
            iconBefore="ChevronLeft"
            className={styles.chevronButton}
            isDisabled={isDisabled}
            onPress={handlePrev}
            aria-label="Jour précédent"
          />

          <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
              appearance="subtle"
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
            appearance="subtle"
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
