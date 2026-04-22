// BottomNavigationItem — item individuel de la BottomNavigation
import type { ReactElement } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import type { IconName, IconColor } from "@naxit/comete-icons";
import { Icon, type IconAppearance } from "../Icon/index.js";
import { Badge } from "../Badge/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./BottomNavigationItem.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavigationItemProps {
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
 * BottomNavigationItem — Comète Design System
 *
 * Item individuel de la BottomNavigation.
 * Affiche une icône et un libellé, avec un indicateur visuel lorsqu'il est sélectionné.
 * Gère les états hover, pressed, focus (via FocusRing) et disabled via React Aria.
 *
 * ```tsx
 * // Item sélectionné (page courante)
 * <BottomNavigationItem label="Accueil" icon="Home" isSelected onClick={() => nav("/")} />
 *
 * // Item avec badge de notification
 * <BottomNavigationItem label="Messages" icon="Chat" badge="3" onClick={handleOpen} />
 *
 * // Item qui ouvre un popup (état visuel distinct du selected)
 * <BottomNavigationItem label="Créer" icon="Add" isOpen={popupOpen} onClick={togglePopup} />
 *
 * // Item désactivé
 * <BottomNavigationItem label="Admin" icon="Settings" isDisabled />
 * ```
 *
 * @param label      - Texte affiché sous l'icône
 * @param icon       - Nom de l'icône issu de @naxit/comete-icons
 * @param isSelected - État actif de l'item (fond coloré subtlest, icône filled, texte coloré)
 * @param isOpen     - Item qui ouvre un popup (aria-expanded, fond bold, texte inversé)
 * @param isDisabled - État désactivé
 * @param badge      - Texte du badge de notification sur l'icône
 * @param onClick    - Handler de clic
 */
export function BottomNavigationItem({
  label,
  icon,
  isSelected = false,
  isOpen = false,
  isDisabled = false,
  badge,
  onClick,
}: BottomNavigationItemProps): ReactElement {
  // Icon color & variant selon l'état
  // Priority : disabled > open/selected > default
  const iconColor: IconColor = isDisabled
    ? "disabled"
    : isSelected || isOpen
      ? "selected"
      : "subtlest";
  const iconAppearance: IconAppearance = isSelected || isOpen ? "filled" : "outlined";

  // Quand l'item ouvre un popup (isOpen), l'icône se transforme en croix
  // (pattern FAB — Cancel = close universel), quelle que soit la prop `icon`.
  const resolvedIcon: IconName = isOpen ? "Cancel" : icon;

  // Badge cutout color : doit correspondre au fond de l'item dans chaque état.
  // Via variable CSS appliquée par le CSS module selon les data-attributes.
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
              <Icon
                icon={resolvedIcon}
                size={isOpen ? 32 : 24}
                appearance={iconAppearance}
                color={iconColor}
              />
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

BottomNavigationItem.displayName = "BottomNavigationItem";
