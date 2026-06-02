// Radio — Comète Design System
// Bouton radio accessible avec label et description optionnels.
import type { ReactElement } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioProps as AriaRadioProps,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";
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
      <span className={styles.indicator}>
        <span className={styles.iconWrapper}>
          {/* SVG plutôt que `border` + dot CSS : garantit un cercle
              parfaitement rond à n'importe quel niveau de zoom (les
              arcs CSS sont rasterisés en polygones, le stroke SVG est
              un vrai arc à toute échelle). */}
          <svg
            className={styles.svg}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            shapeRendering="geometricPrecision"
            aria-hidden="true"
          >
            {/* Anneau : r=6 + strokeWidth=2 → stroke de radius 5 à 7,
                soit un anneau visible de 14px de diamètre dont le bord
                extérieur touche la viewBox. */}
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Dot intérieur : r=3 → diamètre 6px, 2px de gap entre
                le bord du dot (r=3) et le bord intérieur de l'anneau
                (r=5). Scale(0/1) animé via CSS, transform-origin
                center pour scaler depuis le centre. */}
            <circle
              className={styles.dot}
              cx="7"
              cy="7"
              r="3"
              fill="currentColor"
            />
          </svg>
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
    </AriaRadio>
  );
}

Radio.displayName = "Radio";
