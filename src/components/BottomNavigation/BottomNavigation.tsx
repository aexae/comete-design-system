// BottomNavigation — barre de navigation fixe en bas d'écran (mobile)
import type { ReactElement, ReactNode } from "react";
import styles from "./BottomNavigation.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavigationProps {
  /** Items de navigation — utiliser des composants <BottomNavigationItem>. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNavigation — Comète Design System
 *
 * Barre de navigation fixe affichée en bas d'écran sur mobile.
 * Contient des éléments `<BottomNavigationItem>` représentant les sections principales.
 *
 * ```tsx
 * <BottomNavigation>
 *   <BottomNavigationItem label="Accueil" icon="Home" isSelected />
 *   <BottomNavigationItem label="Recherche" icon="Search" />
 *   <BottomNavigationItem label="Messages" icon="Chat" badge="3" />
 *   <BottomNavigationItem label="Profil" icon="Person" />
 * </BottomNavigation>
 * ```
 *
 * @param children - Items de navigation (BottomNavigationItem)
 */
export function BottomNavigation({ children, className }: BottomNavigationProps): ReactElement {
  return <nav className={[styles.nav, className].filter(Boolean).join(" ")}>{children}</nav>;
}
