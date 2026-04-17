// Checkbox — Comète Design System
// Case à cocher accessible avec label et description optionnels.
import type { ReactElement } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { FocusRing } from "../FocusRing/FocusRing.js";
import styles from "./Checkbox.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface CheckboxProps
  extends Omit<
    AriaCheckboxProps,
    "className" | "style" | "children" | "isSelected" | "defaultSelected"
  > {
  /** État coché (contrôlé). */
  isChecked?: boolean;
  /** État coché initial (non contrôlé). */
  defaultChecked?: boolean;
  /** Texte du label. */
  label?: string;
  /** Texte d'aide affiché sous le label. */
  description?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Icônes inline — fidèles au design Figma (14×14 dans un viewBox 16×16)

function IconUnchecked() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconChecked() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect width="16" height="16" rx="2.5" fill="currentColor" />
      <path
        className={styles.innerMark}
        d="M6.5 11.5L3.5 8.5L4.75 7.25L6.5 9L11.25 4.25L12.5 5.5L6.5 11.5Z"
      />
    </svg>
  );
}

function IconIndeterminate() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect width="16" height="16" rx="2.5" fill="currentColor" />
      <rect className={styles.innerMark} x="4" y="7" width="8" height="2" rx="0.5" />
    </svg>
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * Checkbox — Comète Design System
 *
 * Case à cocher accessible avec trois états visuels :
 * unchecked, checked et indeterminate.
 * Supporte la validation (isInvalid), le required et le disabled.
 *
 * ```tsx
 * import { Checkbox } from "@naxit/comete-design-system";
 *
 * <Checkbox label="Accepter les conditions" isRequired />
 * ```
 */
export function Checkbox({
  label,
  description,
  isRequired,
  isChecked,
  defaultChecked,
  className,
  ...ariaProps
}: CheckboxProps): ReactElement {
  return (
    <AriaCheckbox
      className={[styles.checkbox, className].filter(Boolean).join(" ")}
      isRequired={isRequired}
      isSelected={isChecked}
      defaultSelected={defaultChecked}
      {...ariaProps}
    >
      {({ isSelected, isIndeterminate, isFocusVisible }) => (
        <>
          <span className={styles.indicator}>
            <span className={styles.iconWrapper}>
              {isFocusVisible && <FocusRing borderRadius={2} position="inside" />}
              {isIndeterminate ? (
                <IconIndeterminate />
              ) : isSelected ? (
                <IconChecked />
              ) : (
                <IconUnchecked />
              )}
            </span>
          </span>
          {(label !== undefined || description !== undefined) && (
            <span className={styles.labelGroup}>
              {label !== undefined && (
                <span className={styles.labelRow}>
                  <span className={styles.label}>{label}</span>
                  {isRequired && (
                    <span className={styles.required}>*</span>
                  )}
                </span>
              )}
              {description !== undefined && (
                <span className={styles.description}>{description}</span>
              )}
            </span>
          )}
        </>
      )}
    </AriaCheckbox>
  );
}

Checkbox.displayName = "Checkbox";
