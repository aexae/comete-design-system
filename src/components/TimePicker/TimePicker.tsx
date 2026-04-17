// TimePicker — Comète Design System
// Sélecteur d'heure : deux modes (saisie / non-editable) selon isEditable.
// Dans les deux modes, cliquer sur le champ OU l'icône ouvre le drum picker.
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import {
  TimeField as AriaTimeField,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  DialogTrigger,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
  useLocale,
} from "react-aria-components";
import { Time } from "@internationalized/date";
import { Button } from "../Button/Button.js";
import { TimeDrumPicker } from "../Calendar/TimeDrumPicker.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./TimePicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TimePickerAppearance = InputContainerAppearance;

export interface TimePickerProps<T extends TimeValue = TimeValue>
  extends Omit<AriaTimeFieldProps<T>, "className" | "style" | "children" | "granularity"> {
  /** Apparence visuelle. @default "default" */
  appearance?: TimePickerAppearance;
  /** Taille compacte (padding réduit). @default false */
  isCompact?: boolean;
  /** Affiche le segment des secondes. @default false */
  showSeconds?: boolean;
  /**
   * Mode saisie : affiche des segments éditables + icône horloge.
   * Quand `false`, affiche l'heure formatée + bouton horloge ouvrant un popover
   * avec une liste scrollable de créneaux horaires.
   * @default true
   */
  isEditable?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Helpers

/** Formate un TimeValue en chaîne localisée HH:MM ou HH:MM:SS. */
function formatTime(
  time: TimeValue,
  locale: string,
  showSeconds: boolean,
): string {
  const date = new Date(2000, 0, 1, time.hour, time.minute, time.second);
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
  }).format(date);
}

// -----------------------------------------------------------------------
// Composant

/**
 * TimePicker — Comète Design System
 *
 * Champ de saisie d'heure avec deux modes :
 *
 * **Saisie** (`isEditable={true}`, défaut) :
 * ```
 * [ 14 : 30 ] 🕐
 * ```
 * Segments éditables (heures/minutes) + icône horloge.
 * Cliquer sur le champ ou l'icône ouvre le drum picker.
 *
 * **Non-editable** (`isEditable={false}`) :
 * ```
 * 14:30 🕐(popover)
 * ```
 * Heure formatée + bouton horloge ouvrant le drum picker.
 *
 * ```tsx
 * import { TimePicker } from "@naxit/comete-design-system";
 * import { Time } from "@internationalized/date";
 *
 * <TimePicker defaultValue={new Time(9, 30)} />
 * <TimePicker isEditable={false} defaultValue={new Time(9, 30)} />
 * ```
 */
export function TimePicker<T extends TimeValue = TimeValue>({
  appearance = "default",
  isCompact = false,
  showSeconds = false,
  isEditable = true,
  className,
  ...ariaProps
}: TimePickerProps<T>): ReactElement {
  if (isEditable) {
    return (
      <EditableTimePicker
        appearance={appearance}
        isCompact={isCompact}
        showSeconds={showSeconds}
        className={className}
        ariaProps={ariaProps}
      />
    );
  }

  const {
    value,
    defaultValue,
    onChange,
    isDisabled,
    isInvalid,
    "aria-label": ariaLabelProp,
  } = ariaProps as AriaTimeFieldProps<T>;

  return (
    <NonEditableTimePicker
      appearance={appearance}
      isCompact={isCompact}
      className={className}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as ((value: TimeValue) => void) | undefined}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      aria-label={ariaLabelProp}
    />
  );
}

TimePicker.displayName = "TimePicker";

// -----------------------------------------------------------------------
// Mode éditable — segments éditables + icône horloge → popover drum picker

function EditableTimePicker<T extends TimeValue = TimeValue>({
  appearance,
  isCompact,
  showSeconds,
  className,
  ariaProps,
}: {
  appearance: TimePickerAppearance;
  isCompact: boolean;
  showSeconds: boolean;
  className?: string;
  ariaProps: Omit<AriaTimeFieldProps<T>, "className" | "style" | "children" | "granularity">;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Traque la valeur courante pour la synchroniser avec le drum picker
  const [currentValue, setCurrentValue] = useState<TimeValue | null>(
    () => ariaProps.value ?? ariaProps.defaultValue ?? null,
  );

  // Sync si la valeur contrôlée change depuis l'extérieur
  useEffect(() => {
    if (ariaProps.value !== undefined) {
      setCurrentValue(ariaProps.value as TimeValue);
    }
  }, [ariaProps.value]);

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

  // Intercepte onChange de AriaTimeField pour tracker la valeur locale
  const handleFieldChange = useCallback(
    (newValue: TimeValue | null) => {
      if (!newValue) return;
      setCurrentValue(newValue);
      const onChangeProp = ariaProps.onChange as
        | ((value: TimeValue) => void)
        | undefined;
      onChangeProp?.(newValue);
    },
    [ariaProps.onChange],
  );

  // Quand le drum picker change, met à jour la valeur locale + appelle onChange
  const handleDrumChange = useCallback(
    (newTime: Time) => {
      setCurrentValue(newTime);
      const onChangeProp = ariaProps.onChange as
        | ((value: TimeValue) => void)
        | undefined;
      onChangeProp?.(newTime);
    },
    [ariaProps.onChange],
  );

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
    <AriaTimeField
      className={[styles.timePicker, className].filter(Boolean).join(" ")}
      granularity={showSeconds ? "second" : "minute"}
      {...ariaProps}
      value={currentValue as T | null}
      defaultValue={undefined}
      onChange={handleFieldChange}
    >
      {({ isDisabled, isInvalid }) => (
        <div ref={containerRef}>
          <InputContainer
            appearance={appearance}
            isCompact={isCompact}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
          >
            <div
              className={styles.editableContent}
            >
              <AriaDateInput className={styles.timeInput}>
                {(segment) => (
                  <AriaDateSegment className={styles.segment} segment={segment} />
                )}
              </AriaDateInput>

              <Button
                appearance="subtle"
                iconBefore="Schedule"
                className={styles.clockButton}
                isDisabled={isDisabled}
                aria-label="Ouvrir le sélecteur d'heure"
                onPress={isDisabled ? undefined : openPopover}
              />
            </div>
          </InputContainer>

          {isOpen && (
            <div ref={popoverRef} className={styles.drumPopover}>
              <TimeDrumPicker
                value={currentValue}
                onChange={handleDrumChange}
                isDisabled={isDisabled}
                hourCycle={ariaProps.hourCycle}
              />
            </div>
          )}
        </div>
      )}
    </AriaTimeField>
  );
}

// -----------------------------------------------------------------------
// Mode non-editable — heure formatée + bouton horloge → popover drum picker

function NonEditableTimePicker({
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
  appearance: TimePickerAppearance;
  isCompact: boolean;
  className?: string;
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  "aria-label"?: string;
}): ReactElement {
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  // État interne pour le mode non contrôlé
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TimeValue>(
    () => value ?? defaultValue ?? new Time(0, 0),
  );
  const resolvedValue = (isControlled ? value : internalValue) as TimeValue;

  const formattedTime = formatTime(resolvedValue, locale, false);

  // -- Popover state --
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeSelect = (newTime: Time) => {
    if (!isControlled) setInternalValue(newTime);
    onChange?.(newTime);
  };

  const rootClassNames = [styles.timePicker, className]
    .filter(Boolean)
    .join(" ");

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Heure : ${formattedTime}`}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      onClick={() => {
        if (!isDisabled) setIsOpen(true);
      }}
    >
      <InputContainer
        appearance={appearance}
        isCompact={isCompact}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        <div className={styles.content}>
          <span className={styles.timeDisplay}>{formattedTime}</span>

          <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
              appearance="subtle"
              iconBefore="Schedule"
              className={styles.clockButton}
              isDisabled={isDisabled}
              aria-label="Ouvrir le sélecteur d'heure"
            />
            <Popover
              triggerRef={containerRef}
              placement="bottom start"
              shouldFlip={false}
              className={styles.popover}
            >
              <AriaDialog className={styles.dialog}>
                <TimeDrumPicker
                  value={resolvedValue}
                  onChange={handleTimeSelect}
                  isDisabled={isDisabled}
                />
              </AriaDialog>
            </Popover>
          </DialogTrigger>
        </div>
      </InputContainer>
    </div>
  );
}
