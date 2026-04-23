// BottomNavItem — item individuel de la BottomNav
import type { ReactElement } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import type { IconName, IconColor } from "@naxit/comete-icons";
import { Icon, type IconAppearance } from "../Icon/index.js";
import { Badge } from "../Badge/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./BottomNavItem.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavItemProps {
  /** Libellé affiché sous l'icône. */
  label: string;
  /** Nom de l'icône issu de @naxit/comete-icons. La variante (filled/outlined) et la couleur sont gérées automatiquement. */
  icon: IconName;
  /** Indique si cet item est l'élément de navigation actif. Par défaut false. */
  isSelected?: boolean;
  /**
   * Indique que l'item ouvre un popup/menu actuellement affiché.
   * Mappe sur `aria-expanded="true"` et applique un style visuellement distinct
   * de `isSelected` (fond plus foncé, texte inversé).
   * Par défaut false.
   */
  isOpen?: boolean;
  /** État désactivé — l'item n'est plus interactif. Par défaut false. */
  isDisabled?: boolean;
  /** Badge affiché en surimpression de l'icône (ex : nombre de notifications). */
  badge?: string;
  /** Callback déclenché lors d'un clic sur l'item. */
  onClick?: () => void;
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNavItem — Comète Design System
 *
 * Item individuel de la BottomNav.
 * Gère les états hover, pressed, focus (via FocusRing) et disabled via React Aria.
 * Utilise un cross-fade avec rotation pour la transition vers l'icône Cancel
 * lorsque `isOpen` est true.
 */
export function BottomNavItem({
  label,
  icon,
  isSelected = false,
  isOpen = false,
  isDisabled = false,
  badge,
  onClick,
}: BottomNavItemProps): ReactElement {
  // Source icon: apparence au repos (fermé)
  const sourceColor: IconColor = isDisabled
    ? "disabled"
    : isSelected
      ? "selected"
      : "subtlest";
  const sourceAppearance: IconAppearance = isSelected ? "filled" : "outlined";

  // Close icon: apparence quand le popup est ouvert
  const closeColor: IconColor = isDisabled ? "disabled" : "selected";

  const handlePress: AriaButtonProps["onPress"] = onClick ? () => { onClick(); } : undefined;

  return (
    <AriaButton
      className={styles.item}
      onPress={handlePress}
      isDisabled={isDisabled}
      data-selected={isSelected || undefined}
      aria-current={isSelected ? "page" : undefined}
      aria-expanded={isOpen ? true : undefined}
    >
      {({ isFocusVisible }) => (
        <>
          <span className={styles.content}>
            <span className={styles.iconWrapper}>
              <span className={styles.iconSource}>
                <Icon
                  icon={icon}
                  size={24}
                  appearance={sourceAppearance}
                  color={sourceColor}
                />
              </span>
              <span className={styles.iconClose}>
                <Icon
                  icon="Cancel"
                  size={24}
                  appearance="filled"
                  color={closeColor}
                />
              </span>
              {badge !== undefined && (
                <span className={styles.badge}>
                  <Badge
                    appearance="critical"
                    importance="high"
                    label={badge}
                    cutoutBorder
                    isDisabled={isDisabled}
                  />
                </span>
              )}
            </span>
            {!isOpen && <span className={styles.label}>{label}</span>}
          </span>
          {isFocusVisible && <FocusRing borderRadius="round" position="inside" />}
        </>
      )}
    </AriaButton>
  );
}

BottomNavItem.displayName = "BottomNavItem";
