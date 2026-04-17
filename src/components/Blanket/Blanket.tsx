// Blanket — overlay plein écran semi-transparent (derrière modales, drawers, etc.)
import type { ReactElement } from "react";
import styles from "./Blanket.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BlanketProps {
  /** Callback déclenché lors d'un clic sur l'overlay (ex : fermer la modale). */
  onClick?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Blanket — Comète Design System
 *
 * Overlay plein écran semi-transparent affiché derrière les composants modaux
 * (modales, drawers…). Bloque l'interaction avec le contenu sous-jacent.
 *
 * ```tsx
 * // Overlay simple
 * <Blanket />
 *
 * // Overlay cliquable (ex : fermer une modale au clic)
 * <Blanket onClick={() => setOpen(false)} />
 * ```
 *
 * @param onClick - Appelé quand l'utilisateur clique sur l'overlay
 */
export function Blanket({ onClick, className }: BlanketProps): ReactElement {
  return (
    <div
      className={[styles.blanket, className].filter(Boolean).join(" ")}
      role="presentation"
      onClick={onClick}
    />
  );
}
