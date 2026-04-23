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
// Morph SVG — Add (+ → × par rotation 45°)
// Path issu de @naxit/comete-icons svgData3 (outlined/default 24×24).

function AddMorphSvg(): ReactElement {
  return (
    <svg
      className={styles.morphIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g className={styles.addCross}>
        <path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" fill="currentColor" />
      </g>
    </svg>
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNavItem — Comète Design System
 *
 * Item individuel de la BottomNav.
 * Les icônes Add et MoreHoriz disposent d'une animation morph SVG qui
 * transite visuellement vers le Cancel icon lorsque `isOpen` est true.
 * Les autres icônes utilisent un cross-fade standard.
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
  const isMorphIcon = icon === "Add" || icon === "MoreHoriz";

  // Source icon: apparence au repos (fermé) — non-morph uniquement
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
      data-morph={isMorphIcon || undefined}
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
                  size={32}
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
            <span className={styles.label}>{label}</span>
          </span>
          {isFocusVisible && <FocusRing borderRadius="round" position="inside" />}
        </>
      )}
    </AriaButton>
  );
}

BottomNavItem.displayName = "BottomNavItem";
