// BottomNavAction — bouton d'action central (FAB) de la BottomNav
import type { ReactElement } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./BottomNavAction.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavActionProps {
  /** Nom de l'icône issu de @naxit/comete-icons. */
  icon: IconName;
  /**
   * Libellé accessible — **obligatoire** : le FAB n'a pas de texte visible.
   */
  "aria-label": string;
  /**
   * Indique que l'action a ouvert un panneau/tiroir. L'icône pivote de 45°
   * (ex. `+` → `×`) pour signaler que le prochain tap referme. Mappe sur
   * `aria-expanded="true"`. Par défaut false.
   */
  isOpen?: boolean;
  /** Callback déclenché au clic/tap. */
  onPress?: () => void;
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNav.Action — bouton d'action central (FAB) de la BottomNav.
 *
 * Bouton rond de 56px, centré et **surélevé** (il dépasse au-dessus de la
 * barre), détaché du fond par un anneau (« cradle »). L'icône **pivote de 45°**
 * quand `isOpen` est vrai (`+` → `×`) pour signaler que le prochain tap referme.
 *
 * **Règle de composition (obligatoire)** : la `<BottomNav>` qui contient une
 * `BottomNav.Action` doit avoir **exactement 2 `BottomNavItem` de chaque côté**
 * (2 + Action + 2). La barre réserve automatiquement l'emplacement central ;
 * la position de l'Action parmi les enfants n'a pas d'importance.
 *
 * ```tsx
 * <BottomNav>
 *   <BottomNavItem label="Accueil" icon="Home" isSelected />
 *   <BottomNavItem label="Agenda" icon="CalendarMonth" />
 *   <BottomNav.Action icon="Add" aria-label="Créer" isOpen={open} onPress={toggle} />
 *   <BottomNavItem label="Alertes" icon="Notifications" />
 *   <BottomNavItem label="Profil" icon="Person" />
 * </BottomNav>
 * ```
 */
export function BottomNavAction({
  icon,
  "aria-label": ariaLabel,
  isOpen = false,
  onPress,
}: BottomNavActionProps): ReactElement {
  const handlePress: AriaButtonProps["onPress"] = onPress
    ? () => { onPress(); }
    : undefined;

  return (
    <>
      {/* Anneau (cradle) derrière le FAB — voir BottomNavAction.module.css */}
      <span aria-hidden className={styles.actionCradle} />
      <AriaButton
        className={styles.action}
        aria-label={ariaLabel}
        aria-expanded={isOpen ? true : undefined}
        onPress={handlePress}
      >
        {({ isFocusVisible }) => (
          <>
            <span className={styles.actionIcon}>
              <Icon icon={icon} size={28} appearance="filled" color="inverted" />
            </span>
            {isFocusVisible && <FocusRing borderRadius="round" position="inside" />}
          </>
        )}
      </AriaButton>
    </>
  );
}

BottomNavAction.displayName = "BottomNav.Action";
