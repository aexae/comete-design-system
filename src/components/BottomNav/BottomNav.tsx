// BottomNav — barre de navigation fixe en bas d'écran (mobile)
import { type ReactElement, type ReactNode, useLayoutEffect, useRef } from "react";
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
 * Un indicateur de fond glisse d'un item à l'autre lors du changement de
 * sélection, plutôt qu'un fondu sur chaque item individuel.
 *
 * ```tsx
 * <BottomNav>
 *   <BottomNavItem label="Accueil" icon="Home" isSelected />
 *   <BottomNavItem label="Recherche" icon="Search" />
 *   <BottomNavItem label="Messages" icon="Chat" badge="3" />
 *   <BottomNavItem label="Profil" icon="Person" />
 * </BottomNav>
 * ```
 *
 * @param children - Items de navigation (BottomNavItem)
 */
export function BottomNav({ children, className }: BottomNavProps): ReactElement {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const active = nav.querySelector<HTMLElement>(
      "[data-selected], [aria-expanded=\"true\"]",
    );

    if (!active) {
      indicator.style.opacity = "0";
      return;
    }

    // Disable transition on first position to avoid a slide from (0,0)
    if (!indicator.dataset["ready"]) {
      indicator.style.transition = "none";
    }

    indicator.style.left = `${active.offsetLeft}px`;
    indicator.style.top = `${active.offsetTop}px`;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.opacity = "1";

    if (!indicator.dataset["ready"]) {
      // Force reflow to apply position, then re-enable CSS transitions
      indicator.getBoundingClientRect();
      indicator.style.transition = "";
      indicator.dataset["ready"] = "1";
    }
  });

  return (
    <nav ref={navRef} className={[styles.nav, className].filter(Boolean).join(" ")}>
      <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
      {children}
    </nav>
  );
}
