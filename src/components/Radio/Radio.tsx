// Radio — Comète Design System
// Bouton radio accessible avec label et description optionnels.
import type { ReactElement } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioProps as AriaRadioProps,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
import { FocusRing } from "../FocusRing/FocusRing.js";
import styles from "./Radio.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface RadioProps
  extends Omit<AriaRadioProps, "className" | "style" | "children"> {
  /** Texte du label. */
  label?: string;
  /** Texte d'aide affiché sous le label. */
  description?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

export interface RadioGroupProps
  extends Omit<AriaRadioGroupProps, "className" | "style" | "children"> {
  /** Radio items. */
  children: React.ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composants

/**
 * RadioGroup — Comète Design System
 *
 * Groupe de boutons radio mutuellement exclusifs.
 *
 * ```tsx
 * <RadioGroup value={value} onChange={setValue} aria-label="Choix">
 *   <Radio value="a" label="Option A" />
 *   <Radio value="b" label="Option B" />
 * </RadioGroup>
 * ```
 */
export function RadioGroup({
  children,
  className,
  style,
  ...ariaProps
}: RadioGroupProps): ReactElement {
  return (
    <AriaRadioGroup
      className={[styles.group, className].filter(Boolean).join(" ")}
      style={style}
      {...ariaProps}
    >
      {children}
    </AriaRadioGroup>
  );
}

RadioGroup.displayName = "RadioGroup";

/**
 * Radio — Comète Design System
 *
 * Bouton radio accessible avec label et description optionnels.
 * Doit être utilisé à l'intérieur d'un `RadioGroup`.
 *
 * ```tsx
 * <Radio value="option-a" label="Option A" description="Description" />
 * ```
 */
export function Radio({
  label,
  description,
  className,
  style,
  ...ariaProps
}: RadioProps): ReactElement {
  return (
    <AriaRadio
      className={[styles.radio, className].filter(Boolean).join(" ")}
      style={style}
      {...ariaProps}
    >
      {({ isFocusVisible }) => (
        <>
          <span className={styles.indicator}>
            <span className={styles.iconWrapper}>
              <span className={styles.icon}></span>
              {isFocusVisible && (
                <FocusRing borderRadius="round" position="outside" offset={1} />
              )}
            </span>
          </span>
          {(label !== undefined || description !== undefined) && (
            <span className={styles.labelGroup}>
              {label !== undefined && (
                <span className={styles.label}>{label}</span>
              )}
              {description !== undefined && (
                <span className={styles.description}>{description}</span>
              )}
            </span>
          )}
        </>
      )}
    </AriaRadio>
  );
}

Radio.displayName = "Radio";
