// FocusRing — anneau de focus positionné en overlay dans un conteneur parent
import type { CSSProperties, ReactElement } from "react";
import styles from "./FocusRing.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Rayon de coin disponibles, correspondant aux variantes Figma. */
export type FocusRingBorderRadius = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | "round";

/** Position de l'anneau par rapport au bord du conteneur parent. */
export type FocusRingPosition = "outside" | "inside";

export interface FocusRingProps {
  /**
   * Rayon des coins en px, ou "round" pour un cercle parfait.
   * Doit correspondre au border-radius du composant ciblé.
   * Par défaut : 0 (coins droits).
   */
  borderRadius?: FocusRingBorderRadius;
  /**
   * "outside" : anneau 2px à l'extérieur du composant ciblé.
   * "inside"  : anneau 2px à l'intérieur du bord du composant ciblé.
   * Par défaut : "outside".
   */
  position?: FocusRingPosition;
}

// -----------------------------------------------------------------------
// Utilitaire

const RADIUS_MAP: Record<FocusRingBorderRadius, string> = {
  1: "var(--radius0125)",
  2: "var(--radius025)",
  3: "var(--radius0375)",
  4: "var(--radius050)",
  5: "var(--radius0625)",
  6: "var(--radius075)",
  8: "var(--radius100)",
  12: "var(--radius150)",
  round: "var(--radius-round)",
};

// -----------------------------------------------------------------------
// Composant

/**
 * FocusRing — Comète Design System
 *
 * Overlay visuel indiquant le focus clavier sur un élément interactif.
 * Doit être rendu à l'intérieur d'un conteneur `position: relative`.
 * Le parent est responsable de n'afficher ce composant que lors d'un focus clavier.
 *
 * ```tsx
 * // Anneau extérieur (par défaut) avec coins arrondis de 4px
 * {isFocusVisible && <FocusRing borderRadius={4} />}
 *
 * // Anneau intérieur (ex : à l'intérieur d'un bouton)
 * {isFocusVisible && <FocusRing borderRadius={4} position="inside" />}
 *
 * // Anneau circulaire (ex : autour d'un Avatar rond)
 * {isFocusVisible && <FocusRing borderRadius="round" />}
 * ```
 *
 * @param borderRadius - Rayon des coins, à faire correspondre au composant ciblé
 * @param position     - "outside" (par défaut) ou "inside"
 */
export function FocusRing({
  borderRadius = 2,
  position = "outside",
}: FocusRingProps): ReactElement {
  const radius = RADIUS_MAP[borderRadius];

  const style: CSSProperties = {
    borderRadius: radius,
  };

  return (
    <span
      className={`${styles.ring} ${styles[position]}`}
      style={style}
      aria-hidden="true"
    />
  );
}
