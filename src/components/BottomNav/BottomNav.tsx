// BottomNav — barre de navigation fixe en bas d'écran (mobile)
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { BottomNavAction } from "./BottomNavAction.js";
import styles from "./BottomNav.module.css";

// `process` n'est pas typé ici (le DS build avec `types: []`, sans @types/node).
// Déclaration locale minimale : le bundler du consommateur (Vite/webpack/Next)
// remplace `process.env.NODE_ENV` par une constante à la compilation.
declare const process: { env: { NODE_ENV?: string } };

// Nombre maximal d'items de navigation recommandé (hors <BottomNav.Action>).
const MAX_ITEMS = 5;

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavProps {
  /**
   * Items de navigation (`<BottomNavItem>`) et, optionnellement, UNE
   * `<BottomNav.Action>` (bouton d'action central). Voir la règle de
   * composition dans la JSDoc du composant.
   */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
  /**
   * Nom accessible du repère de navigation (`<nav>`). Utile quand plusieurs
   * `<nav>` coexistent, pour que les lecteurs d'écran les distinguent.
   * @default "Navigation principale"
   */
  "aria-label"?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNav — Comète Design System
 *
 * Barre de navigation fixe affichée en bas d'écran sur mobile. Contient des
 * `<BottomNavItem>` représentant les sections principales.
 *
 * Peut aussi recevoir UNE `<BottomNav.Action>` (bouton d'action central / FAB).
 * Dans ce cas la barre **réserve automatiquement l'emplacement central** et la
 * règle de composition est : **exactement 2 `<BottomNavItem>` de chaque côté**
 * (2 + Action + 2). La position de l'Action parmi les enfants n'a pas
 * d'importance — elle est extraite et rendue en surimpression, centrée.
 *
 * ```tsx
 * <BottomNav>
 *   <BottomNavItem label="Accueil" icon="Home" isSelected />
 *   <BottomNavItem label="Recherche" icon="Search" />
 *   <BottomNav.Action icon="Add" aria-label="Créer" onPress={…} />
 *   <BottomNavItem label="Messages" icon="Chat" badge="3" />
 *   <BottomNavItem label="Profil" icon="Person" />
 * </BottomNav>
 * ```
 */
export function BottomNav({
  children,
  className,
  style,
  "aria-label": ariaLabel = "Navigation principale",
}: BottomNavProps): ReactElement {
  const all = Children.toArray(children);
  const action = all.find(
    (child) => isValidElement(child) && child.type === BottomNavAction,
  );
  const items = all.filter(
    (child) => !(isValidElement(child) && child.type === BottomNavAction),
  );

  if (process.env.NODE_ENV !== "production" && items.length > MAX_ITEMS) {
    // eslint-disable-next-line no-console
    console.warn(
      `BottomNav : ${items.length} items de navigation reçus, ${MAX_ITEMS} au ` +
        `maximum recommandé. Réservez le débordement à un menu « Plus ». ` +
        `La <BottomNav.Action> ne compte pas.`,
    );
  }

  // Avec une Action : items répartis (2 + spacer central + 2), Action en overlay.
  const mid = Math.ceil(items.length / 2);
  const content: ReactNode = action ? (
    <>
      {items.slice(0, mid)}
      <span aria-hidden className={styles.spacer} />
      {/* Action centrale : placée au milieu du flux DOM pour que l'ordre de
          lecture (lecteur d'écran) corresponde à sa position visuelle. Elle est
          en position absolue (overlay), donc l'ordre n'affecte pas la mise en page. */}
      {action}
      {items.slice(mid)}
    </>
  ) : (
    children
  );

  return (
    <nav aria-label={ariaLabel} className={[styles.nav, className].filter(Boolean).join(" ")} style={style}>
      {content}
    </nav>
  );
}

BottomNav.Action = BottomNavAction;
