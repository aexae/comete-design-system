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
 * Barre de navigation fixe affichée en bas d'écran sur mobile.
 * Contient des éléments <BottomNavigationItem> représentant les sections principales.
 *
 * @param children - Items de navigation (BottomNavigationItem)
 */
export function BottomNavigation({ children, className }: BottomNavigationProps): ReactElement {
  return <nav className={[styles.nav, className].filter(Boolean).join(" ")}>{children}</nav>;
}
