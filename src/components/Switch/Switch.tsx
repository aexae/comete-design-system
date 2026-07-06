// Switch — Comète Design System
// Interrupteur on/off accessible avec 4 apparences sémantiques
// (default, success, warning, critical) + état intermédiaire.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from "react-aria-components";
import { Icon } from "../Icon/index.js";
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
// Icônes internes — dérivées de l'apparence

const APPEARANCE_ICON: Record<SwitchAppearance, "Check" | "Warning" | null> = {
  default: null,
  success: "Check",
  warning: "Warning",
  critical: "Warning",
};

/**
 * Détermine si l'icône doit être visible pour cette apparence dans l'état
 * courant. Le design distingue :
 * - `default` : jamais d'icône
 * - `success` : icône uniquement quand coché (confirmation positive)
 * - `warning` / `critical` : icône toujours visible (rappel constant)
 * - `indeterminate` : jamais d'icône (le pouce devient un dash 12×2)
 */
function shouldShowIcon(
  appearance: SwitchAppearance,
  isSelected: boolean,
  isIndeterminate: boolean,
): boolean {
  if (isIndeterminate) return false;
  if (appearance === "default") return false;
  if (appearance === "success") return isSelected;
  return true;
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
  const iconName = APPEARANCE_ICON[appearance];

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
          <span
            className={styles.track}
            data-appearance={appearance}
            data-indeterminate={isIndeterminate || undefined}
            data-selected={isSelected || undefined}
            data-disabled={isDisabled || undefined}
          >
            <span className={styles.thumb}>
              {iconName && shouldShowIcon(appearance, isSelected, isIndeterminate) && (
                <Icon icon={iconName} size={12} />
              )}
            </span>
          </span>
          {children && <span className={styles.label}>{children}</span>}
          {isFocusVisible && <FocusRing borderRadius="round" position="outside" />}
        </>
      )}
    </AriaSwitch>
  );
}

Switch.displayName = "Switch";
