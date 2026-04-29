// DatePicker — Comète Design System
// Sélecteur de date : deux modes (navigation / saisie) selon isEditable
// + single vs range via isRange.
import { useCallback, useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
import {
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Group as AriaGroup,
  Dialog as AriaDialog,
  DialogTrigger,
  type DatePickerProps as AriaDatePickerProps,
  type DateRangePickerProps as AriaDateRangePickerProps,
  type DateValue,
  type RangeValue,
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

/** Props communes à tous les modes. */
interface DatePickerBaseProps {
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

/** Props pour le mode simple (sélection d'une date unique). */
export interface SingleDatePickerProps<T extends DateValue = DateValue>
  extends DatePickerBaseProps,
    Omit<AriaDatePickerProps<T>, "className" | "style" | "children"> {
  /** @default false */
  isRange?: false;
}

/** Props pour le mode plage (sélection de deux dates start/end). */
export interface RangeDatePickerProps<T extends DateValue = DateValue>
  extends DatePickerBaseProps,
    Omit<AriaDateRangePickerProps<T>, "className" | "style" | "children"> {
  /** Active la sélection de plage. */
  isRange: true;
}

/** Union discriminée — TypeScript infère le bon type selon `isRange`. */
export type DatePickerProps<T extends DateValue = DateValue> =
  | SingleDatePickerProps<T>
  | RangeDatePickerProps<T>;

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
 * Sélecteur de date avec deux modes d'interaction et deux modes de sélection.
 *
 * **Modes d'interaction** :
 * - **Saisie** (`isEditable={true}`, défaut) : champ segmenté éditable (`JJ/MM/AAAA`)
 *   + icône calendrier qui ouvre le popover.
 * - **Navigation** (`isEditable={false}`) : chevrons ←/→ pour ±1 jour, bouton
 *   date qui ouvre le calendrier.
 *
 * **Modes de sélection** :
 * - **Simple** (`isRange={false}`, défaut) : une seule date.
 * - **Plage** (`isRange={true}`) : deux dates (start/end) séparées par `–`.
 *
 * ```tsx
 * import { DatePicker } from "@naxit/comete-design-system";
 * import { today, getLocalTimeZone } from "@internationalized/date";
 *
 * // Date unique saisie
 * <DatePicker defaultValue={today(getLocalTimeZone())} />
 *
 * // Plage de dates saisies
 * <DatePicker isRange defaultValue={{ start, end }} />
 * ```
 */
export function DatePicker<T extends DateValue = DateValue>(
  props: DatePickerProps<T>,
): ReactElement {
  const appearance = props.appearance ?? "default";
  const isCompact = props.isCompact ?? false;
  const isEditable = props.isEditable ?? true;
  const { className, style } = props;

  // Mode plage — isRange=true (uniquement en mode saisie pour l'instant)
  if (props.isRange) {
    const {
      isRange: _r,
      appearance: _a,
      isCompact: _c,
      isEditable: _e,
      className: _cn,
      style: _st,
      ...ariaProps
    } = props;
    const common = { appearance, isCompact, className, style };
    return <EditableDateRangePicker {...common} {...ariaProps} />;
  }

  // Mode simple — isRange=false (défaut)
  const {
    isRange: _r,
    appearance: _a,
    isCompact: _c,
    isEditable: _e,
    className: _cn,
    style: _st,
    ...ariaProps
  } = props;
  const common = { appearance, isCompact, className, style };
  return isEditable ? (
    <EditableDatePicker {...common} {...ariaProps} />
  ) : (
    <NavigationDatePicker {...common} {...ariaProps} />
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

  // Clic sur le padding de l'InputContainer → ouvre le popover + focus premier segment
  const handleContainerClick = useCallback(() => {
    if (ariaProps.isDisabled) return;
    setIsOpen(true);
    // Focus le premier segment (curseur au début pour les champs formatés)
    const segment = containerRef.current?.querySelector<HTMLElement>("[data-type]:not([data-type='literal'])");
    segment?.focus();
  }, [ariaProps.isDisabled]);

  // Ouvre le popover au clic sur les segments (capture phase pour intercepter
  // avant que React Aria ne stoppe la propagation sur les segments)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Ne réagir que sur les segments ou le date input, pas sur le padding
      if (target.closest("[data-type], [class*='dateInput']")) {
        if (!ariaProps.isDisabled) setIsOpen(true);
      }
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
              onContainerClick={handleContainerClick}
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

// -----------------------------------------------------------------------
// Mode plage saisie (isRange + isEditable=true) — AriaDateRangePicker
// avec deux DateInput (slot="start" / slot="end") + tiret de séparation.

function EditableDateRangePicker<T extends DateValue = DateValue>({
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
} & Omit<AriaDateRangePickerProps<T>, "className" | "style" | "children">): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [currentValue, setCurrentValue] = useState<RangeValue<DateValue> | null>(
    () => (ariaProps.value ?? ariaProps.defaultValue ?? null) as RangeValue<DateValue> | null,
  );

  useEffect(() => {
    if (ariaProps.value !== undefined) {
      setCurrentValue(ariaProps.value as RangeValue<DateValue>);
    }
  }, [ariaProps.value]);

  const handleFieldChange = useCallback(
    (newValue: RangeValue<DateValue> | null) => {
      if (!newValue) return;
      setCurrentValue(newValue);
      const onChangeProp = ariaProps.onChange as
        | ((value: RangeValue<DateValue>) => void)
        | undefined;
      onChangeProp?.(newValue);
    },
    [ariaProps.onChange],
  );

  const handleCalendarChange = useCallback(
    (newRange: RangeValue<DateValue>) => {
      setCurrentValue(newRange);
      const onChangeProp = ariaProps.onChange as
        | ((value: RangeValue<DateValue>) => void)
        | undefined;
      onChangeProp?.(newRange);
    },
    [ariaProps.onChange],
  );

  const openPopover = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Clic sur le padding de l'InputContainer → ouvre le popover + focus premier segment
  const handleContainerClick = useCallback(() => {
    if (ariaProps.isDisabled) return;
    setIsOpen(true);
    const segment = containerRef.current?.querySelector<HTMLElement>("[data-type]:not([data-type='literal'])");
    segment?.focus();
  }, [ariaProps.isDisabled]);

  // Ouverture au clic sur les segments (capture — intercepte avant les segments)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-type], [class*='dateInput']")) {
        if (!ariaProps.isDisabled) setIsOpen(true);
      }
    };
    el.addEventListener("pointerdown", handlePointerDown, true);
    return () => el.removeEventListener("pointerdown", handlePointerDown, true);
  }, [ariaProps.isDisabled]);

  // Fermeture au clic extérieur ou Escape
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
    <AriaDateRangePicker
      className={[styles.datePicker, className].filter(Boolean).join(" ")}
      style={style}
      {...ariaProps}
      value={currentValue as RangeValue<T> | null}
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
              onContainerClick={handleContainerClick}
            >
              <AriaDateInput slot="start" className={styles.dateInput}>
                {(segment) => (
                  <AriaDateSegment className={styles.segment} segment={segment} />
                )}
              </AriaDateInput>
              <span aria-hidden="true" className={styles.rangeSeparator}>
                –
              </span>
              <AriaDateInput slot="end" className={styles.dateInput}>
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
                key={currentValue
                  ? `${currentValue.start.year}-${currentValue.start.month}`
                  : "empty"}
                appearance="date"
                isRange
                value={currentValue ?? undefined}
                onChange={handleCalendarChange}
              />
            </div>
          )}
        </div>
      )}
    </AriaDateRangePicker>
  );
}
