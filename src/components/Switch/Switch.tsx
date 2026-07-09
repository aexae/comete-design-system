// Switch — Comète Design System
// Interrupteur on/off accessible avec 4 apparences sémantiques
// (default, success, warning, critical) + état intermédiaire.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./Switch.module.css";

// -----------------------------------------------------------------------
// Types publics

/**
 * Apparence sémantique de l'interrupteur — colore le rail et,
 * pour `success` / `warning` / `critical`, ajoute une icône dans le pouce
 * pour renforcer visuellement l'intention.
 */
export type SwitchAppearance =
  | "default"
  | "success"
  | "warning"
  | "critical";

export interface SwitchProps
  extends Omit<
    AriaSwitchProps,
    "className" | "style" | "children" | "isSelected" | "defaultSelected"
  > {
  /** État coché (contrôlé). */
  isChecked?: boolean;
  /** État coché initial (non contrôlé). */
  defaultChecked?: boolean;
  /**
   * Rend visuellement un état intermédiaire (pouce transformé en
   * petite barre horizontale). Non porté par React Aria — géré uniquement
   * au niveau visuel via `data-indeterminate`.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * Apparence sémantique. @default "default"
   */
  appearance?: SwitchAppearance;
  /** Label rendu à droite de l'interrupteur. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Glyphes internes — indicateurs inline fidèles au design Figma.
// Rendus dans le pouce (viewBox 16×16, fill currentColor piloté par le CSS).
// Non issus de comete-icons car le design utilise un « ! » nu (absent du set).

/** Coche (apparence success). */
function GlyphCheck(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.41251 7.98752L6.96251 11.5375L12.5875 5.88752L11.1875 4.46252L6.93751 8.71252L4.81251 6.58752L3.41251 7.98752Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Point d'exclamation nu (apparences warning / critical). */
function GlyphExclamation(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 12C8.28333 12 8.52083 11.9042 8.7125 11.7125C8.90417 11.5208 9 11.2833 9 11C9 10.7167 8.90417 10.4792 8.7125 10.2875C8.52083 10.0958 8.28333 10 8 10C7.71667 10 7.47917 10.0958 7.2875 10.2875C7.09583 10.4792 7 10.7167 7 11C7 11.2833 7.09583 11.5208 7.2875 11.7125C7.47917 11.9042 7.71667 12 8 12ZM7 9H9V4H7V9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Retourne le glyphe à afficher dans le pouce pour cette apparence dans
 * l'état courant, ou `null`. Le design distingue :
 * - `default` : jamais de glyphe
 * - `success` : coche uniquement quand coché (confirmation positive)
 * - `warning` / `critical` : « ! » toujours visible (rappel constant)
 * - `indeterminate` : jamais de glyphe (le pouce devient un dash 12×2)
 */
function renderGlyph(
  appearance: SwitchAppearance,
  isSelected: boolean,
  isIndeterminate: boolean,
): ReactElement | null {
  if (isIndeterminate || appearance === "default") return null;
  if (appearance === "success") return isSelected ? <GlyphCheck /> : null;
  return <GlyphExclamation />;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Switch — Comète Design System
 *
 * Interrupteur binaire accessible (React Aria). Idéal pour une préférence
 * on/off à effet immédiat (contrairement à Checkbox qui nécessite typiquement
 * une soumission de formulaire).
 *
 * ```tsx
 * <Switch defaultChecked>Notifications</Switch>
 * <Switch appearance="success" isChecked={enabled} onChange={setEnabled}>
 *   Auto-save
 * </Switch>
 * ```
 */
export function Switch({
  isChecked,
  defaultChecked,
  isIndeterminate = false,
  appearance = "default",
  children,
  className,
  style,
  isDisabled,
  ...ariaProps
}: SwitchProps): ReactElement {
  return (
    <AriaSwitch
      {...ariaProps}
      isSelected={isChecked}
      defaultSelected={defaultChecked}
      isDisabled={isDisabled}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
    >
      {({ isSelected, isFocusVisible }) => (
        <>
          {children && <span className={styles.label}>{children}</span>}
          <span
            className={styles.track}
            data-appearance={appearance}
            data-indeterminate={isIndeterminate || undefined}
            data-selected={isSelected || undefined}
            data-disabled={isDisabled || undefined}
          >
            <span className={styles.thumb}>
              {renderGlyph(appearance, isSelected, isIndeterminate)}
            </span>
            {isFocusVisible && <FocusRing borderRadius="round" position="outside" />}
          </span>
        </>
      )}
    </AriaSwitch>
  );
}

Switch.displayName = "Switch";
