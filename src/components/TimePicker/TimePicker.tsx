// TimePicker — Comète Design System
// Sélecteur d'heure : deux modes (saisie / non-editable) selon isEditable.
import { useRef, useState, type ReactElement } from "react";
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
import { Calendar } from "../Calendar/Calendar.js";
import { Icon } from "../Icon/Icon.js";
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
 *
 * **Non-editable** (`isEditable={false}`) :
 * ```
 * 14:30 🕐(popover)
 * ```
 * Heure formatée + bouton horloge ouvrant une liste scrollable de créneaux.
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
      <AriaTimeField
        className={[styles.timePicker, className].filter(Boolean).join(" ")}
        granularity={showSeconds ? "second" : "minute"}
        {...ariaProps}
      >
        {({ isDisabled, isInvalid }) => (
          <InputContainer
            appearance={appearance}
            isCompact={isCompact}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
          >
            <AriaDateInput className={styles.timeInput}>
              {(segment) => (
                <AriaDateSegment className={styles.segment} segment={segment} />
              )}
            </AriaDateInput>
            <Icon
              icon="Schedule"
              size={24}
              color={isDisabled ? "disabled" : "default"}
              className={styles.clockIcon}
            />
          </InputContainer>
        )}
      </AriaTimeField>
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
// Mode non-editable — heure formatée + bouton horloge → popover avec liste

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
    setIsOpen(false);
  };

  const rootClassNames = [styles.timePicker, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassNames}
      ref={containerRef}
      aria-label={ariaLabel ?? `Heure : ${formattedTime}`}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
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
              variant="subtle"
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
                <Calendar
                  appearance="time"
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
