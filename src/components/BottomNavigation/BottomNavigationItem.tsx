// BottomNavigationItem — item individuel de la BottomNavigation
import type { ReactElement } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { Badge } from "../Badge/index.js";
import styles from "./BottomNavigationItem.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavigationItemProps {
  /** Libellé affiché sous l'icône. */
  label: string;
  /** Nom de l'icône issu de @naxit/comete-icons. La variante (filled/outlined) et la couleur sont gérées automatiquement selon isSelected. */
  icon: IconName;
  /** Indique si cet item est l'élément de navigation actif. Par défaut false. */
  isSelected?: boolean;
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
 *
 * ```tsx
 * // Item sélectionné (page courante)
 * <BottomNavigationItem label="Accueil" icon="Home" isSelected onClick={() => nav("/")} />
 *
 * // Item avec badge de notification
 * <BottomNavigationItem label="Messages" icon="Chat" badge="3" onClick={handleOpen} />
 * ```
 *
 * @param label      - Texte affiché sous l'icône
 * @param icon       - Composant icône de @naxit/comete-icons
 * @param isSelected - État actif de l'item (fond coloré, icône filled, texte en gras)
 * @param badge      - Texte du badge de notification sur l'icône
 * @param onClick    - Handler de clic
 */
export function BottomNavigationItem({
  label,
  icon,
  isSelected = false,
  badge,
  onClick,
}: BottomNavigationItemProps): ReactElement {
  return (
    <button
      type="button"
      className={`${styles.item} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
      aria-current={isSelected ? "page" : undefined}
    >
      <span className={styles.content}>
        <span className={styles.iconWrapper}>
          <Icon
            icon={icon}
            size={24}
            appearance={isSelected ? "filled" : "outlined"}
            color={isSelected ? "selected" : "subtle"}
          />
          {badge !== undefined && (
            <span className={styles.badge}>
              <Badge appearance="critical" importance="high" label={badge} cutoutBorder />
            </span>
          )}
        </span>
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}
