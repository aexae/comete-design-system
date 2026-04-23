// BottomNav — barre de navigation fixe en bas d'écran (mobile)
import type { ReactElement, ReactNode } from "react";
import styles from "./BottomNav.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BottomNavProps {
  /** Items de navigation — utiliser des composants <BottomNavItem>. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * BottomNav — Comète Design System
 *
 * Barre de navigation fixe affichée en bas d'écran sur mobile.
 * Contient des éléments `<BottomNavItem>` représentant les sections principales.
 *
 * Le fond de sélection utilise un fade-in/fade-out sur chaque item
 * individuel lors du changement de sélection.
 *
 * ```tsx
 * <BottomNav>
 *   <BottomNavItem label="Accueil" icon="Home" isSelected />
 *   <BottomNavItem label="Recherche" icon="Search" />
 *   <BottomNavItem label="Messages" icon="Chat" badge="3" />
 *   <BottomNavItem label="Profil" icon="Person" />
 * </BottomNav>
 * ```
 */
export function BottomNav({ children, className }: BottomNavProps): ReactElement {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(" ")}>
      {children}
    </nav>
  );
}
