// TimePicker — Comète Design System
// Sélecteur d'heure : deux modes (saisie / non-editable) selon isEditable.
// Dans les deux modes, cliquer sur le champ OU l'icône ouvre le drum picker.
import { useCallback, useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
import {
  TimeField as AriaTimeField,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  DialogTrigger,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
} from "react-aria-components";
import { Time } from "@internationalized/date";
import { Button } from "../Button/Button.js";
import { TimeDrumPicker } from "../Calendar/TimeDrumPicker.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Popover } from "../Popover/Popover.js";
import { useHoverIntent } from "../../hooks/useHoverIntent.js";
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
  /**
   * En mode éditable, affiche une icône close (×) à la place de l'icône horloge
   * quand le champ a le focus et qu'une heure est saisie. Cliquer dessus vide la valeur.
   * @default true
   */
  isClearable?: boolean;
  /** Callback appelé quand l'utilisateur clique sur le bouton clear. */
  onClear?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Helpers

/**
 * Formate un TimeValue en HH:MM[:SS] avec suffixe AM/PM si hourCycle=12.
 * Reproduit le format affiché par les segments react-aria en mode éditable.
 */
function formatTime(
  time: TimeValue,
  showSeconds: boolean,
  hourCycle?: 12 | 24,
): string {
  let hour = time.hour;
  let suffix = "";

  if (hourCycle === 12) {
    suffix = ` ${hour >= 12 ? "PM" : "AM"}`;
    hour = hour % 12 || 12;
  }

  const hh = String(hour).padStart(2, "0");
  const mm = String(time.minute).padStart(2, "0");
  if (!showSeconds) return `${hh}:${mm}${suffix}`;
  const ss = String(time.second).padStart(2, "0");
  return `${hh}:${mm}:${ss}${suffix}`;
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
  isClearable = true,
  onClear,
  className,
  style,
  ...ariaProps
}: TimePickerProps<T>): ReactElement {
  if (isEditable) {
    return (
      <EditableTimePicker
        appearance={appearance}
        isCompact={isCompact}
        showSeconds={showSeconds}
        isClearable={isClearable}
        onClear={onClear}
        className={className}
        style={style}
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
    hourCycle,
    "aria-label": ariaLabelProp,
  } = ariaProps as AriaTimeFieldProps<T>;

  return (
    <NonEditableTimePicker
      appearance={appearance}
      isCompact={isCompact}
      showSeconds={showSeconds}
      className={className}
      style={style}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as ((value: TimeValue) => void) | undefined}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      hourCycle={hourCycle}
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
  isClearable,
  onClear,
  className,
  style,
  ariaProps,
}: {
  appearance: TimePickerAppearance;
  isCompact: boolean;
  showSeconds: boolean;
  isClearable: boolean;
  onClear?: () => void;
  className?: string;
  style?: CSSProperties;
  ariaProps: Omit<AriaTimeFieldProps<T>, "className" | "style" | "children" | "granularity">;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { isHovered, isHoverSuppressed, onMouseEnter, onMouseLeave, suppress } =
    useHoverIntent();

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

  // Vide la valeur. Ne change pas l'état du popover. Replace le focus sur le
  // premier segment pour que l'utilisateur puisse continuer à saisir.
  const handleClear = useCallback(() => {
    setCurrentValue(null);
    const onChangeProp = ariaProps.onChange as
      | ((value: TimeValue | null) => void)
      | undefined;
    onChangeProp?.(null);
    onClear?.();
    suppress();
    requestAnimationFrame(() => {
      const segment = containerRef.current?.querySelector<HTMLElement>(
        "[data-type]:not([data-type='literal'])",
      );
      segment?.focus();
    });
  }, [ariaProps.onChange, onClear, suppress]);

  // Clic sur le padding de l'InputContainer → ouvre le popover + focus premier segment
  const handleContainerClick = useCallback(() => {
    if (ariaProps.isDisabled) return;
    setIsOpen(true);
    const segment = containerRef.current?.querySelector<HTMLElement>("[data-type]:not([data-type='literal'])");
    segment?.focus();
  }, [ariaProps.isDisabled]);

  // Ouvre le popover au clic sur les segments
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-type], [class*='timeInput']")) {
        if (!ariaProps.isDisabled) setIsOpen(true);
      }
    };

    el.addEventListener("pointerdown", handlePointerDown, true);
    return () => el.removeEventListener("pointerdown", handlePointerDown, true);
  }, [ariaProps.isDisabled]);

  // Tracking robuste du focus-within (les segments react-aria ne bubblent pas
  // toujours le blur synthétique fiablement).
  useEffect(() => {
    const update = () => {
      setIsFocused(
        !!containerRef.current?.contains(document.activeElement),
      );
    };
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

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

  // Fermer le popover + blur du segment focus en cliquant à l'extérieur.
  // Always-on : blur explicite même quand le popover est déjà fermé, pour
  // que le bouton clear disparaisse quand on clique sur une zone non-
  // focusable (padding de page).
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      const active = document.activeElement as HTMLElement | null;
      if (active && containerRef.current?.contains(active)) {
        active.blur();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Escape ferme le popover (pas de blur, on reste éditable)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AriaTimeField
      className={[styles.timePicker, className].filter(Boolean).join(" ")}
      style={style}
      granularity={showSeconds ? "second" : "minute"}
      {...(ariaProps as AriaTimeFieldProps<T> & { shouldForceLeadingZeros?: boolean })}
      shouldForceLeadingZeros
      value={currentValue as T | null}
      defaultValue={undefined}
      onChange={handleFieldChange}
    >
      {({ isDisabled, isInvalid }) => {
        const hasValue = currentValue !== null;
        const showClear =
          isClearable && hasValue && !isDisabled && (isFocused || isHovered);
        return (
        <div
          ref={containerRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          data-suppress-hover={isHoverSuppressed || undefined}
        >
          <InputContainer
            appearance={appearance}
            isCompact={isCompact}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            onContainerClick={handleContainerClick}
          >
            <div
              className={styles.editableContent}
            >
              <AriaDateInput className={styles.timeInput}>
                {(segment) => (
                  <AriaDateSegment className={styles.segment} segment={segment}>
                    {/* REASON: custom placeholder par type ("HH"/"MM"/"SS")
                        au lieu du défaut RAC "––". Le segment.text est utilisé
                        normalement quand une valeur est saisie. */}
                    {({ isPlaceholder, text }) =>
                      isPlaceholder
                        ? segment.type === "hour"
                          ? "HH"
                          : segment.type === "minute"
                            ? "MM"
                            : segment.type === "second"
                              ? "SS"
                              : text
                        : text
                    }
                  </AriaDateSegment>
                )}
              </AriaDateInput>

              {showClear ? (
                <Button
                  // REASON: key distincte → unmount/mount propre au swap.
                  // Sans key, React reuse l'instance et préserve l'état hover
                  // de useHover (data-hovered) — le bouton horloge qui apparaît
                  // après un clear hériterait du hover du bouton X.
                  key="clear"
                  appearance="subtle"
                  iconBefore="CloseSmallFaded"
                  className={styles.clockButton}
                  aria-label="Effacer"
                  onPress={handleClear}
                  // REASON: empêcher le blur du segment pendant le click. Sans
                  // ça, le mousedown sur le bouton transfert le focus → segment
                  // blur → showClear=false → le bouton disparaît mid-click →
                  // onPress ne se déclenche jamais.
                  onPointerDown={(e) => e.preventDefault()}
                />
              ) : (
                <Button
                  key="clock"
                  appearance="subtle"
                  iconBefore="Schedule"
                  className={styles.clockButton}
                  isDisabled={isDisabled}
                  aria-label="Ouvrir le sélecteur d'heure"
                  onPress={isDisabled ? undefined : openPopover}
                  // REASON: cf. DatePicker — neutralise visuellement le hover
                  // du bouton horloge qui apparaît sous le curseur après clear.
                  style={isHoverSuppressed ? { backgroundColor: "transparent" } : undefined}
                />
              )}
            </div>
          </InputContainer>

          {isOpen && (
            <div ref={popoverRef} className={styles.drumPopover}>
              <TimeDrumPicker
                value={currentValue}
                onChange={handleDrumChange}
                isDisabled={isDisabled}
                hourCycle={ariaProps.hourCycle}
                showSeconds={showSeconds}
              />
            </div>
          )}
        </div>
        );
      }}
    </AriaTimeField>
  );
}

// -----------------------------------------------------------------------
// Mode non-editable — heure formatée + bouton horloge → popover drum picker

function NonEditableTimePicker({
  appearance,
  isCompact,
  showSeconds = false,
  className,
  style,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  isInvalid = false,
  hourCycle,
  "aria-label": ariaLabel,
}: {
  appearance: TimePickerAppearance;
  isCompact: boolean;
  showSeconds?: boolean;
  className?: string;
  style?: CSSProperties;
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  hourCycle?: 12 | 24;
  "aria-label"?: string;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  // État interne pour le mode non contrôlé
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<TimeValue>(
    () => value ?? defaultValue ?? new Time(0, 0),
  );
  const resolvedValue = (isControlled ? value : internalValue) as TimeValue;

  const formattedTime = formatTime(resolvedValue, showSeconds, hourCycle);

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
      style={style}
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
            >
              <AriaDialog className={styles.dialog}>
                <TimeDrumPicker
                  value={resolvedValue}
                  onChange={handleTimeSelect}
                  isDisabled={isDisabled}
                  hourCycle={hourCycle}
                  showSeconds={showSeconds}
                />
              </AriaDialog>
            </Popover>
          </DialogTrigger>
        </div>
      </InputContainer>
    </div>
  );
}
