// Skeleton — Comète Design System
// Placeholder de chargement affichant la silhouette d'un contenu à venir.
import type { CSSProperties, ReactElement } from "react";
import styles from "./Skeleton.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Forme du skeleton. */
export type SkeletonShape = "rectangle" | "circle";

export interface SkeletonProps {
  /**
   * Forme du skeleton.
   * - "rectangle" — angles arrondis (radius050 par défaut, ou via `radius`)
   * - "circle"    — entièrement arrondi (radius-round), `width` = `height`
   * @default "rectangle"
   */
  shape?: SkeletonShape;
  /** Largeur (CSS valide : nombre = px, ou string). @default "100%" */
  width?: number | string;
  /** Hauteur (CSS valide : nombre = px, ou string). @default 20 */
  height?: number | string;
  /** Border-radius personnalisé (rectangle uniquement). */
  radius?: number | string;
  /** Label accessible pour les lecteurs d'écran. @default "Chargement…" */
  "aria-label"?: string;
  /**
   * Décoratif : masque le skeleton aux lecteurs d'écran (`aria-hidden`) et
   * n'émet **aucune** région live. À utiliser quand plusieurs skeletons sont
   * regroupés sous une **seule** région d'état parente, pour éviter les
   * annonces redondantes. @default false
   */
  decorative?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Skeleton — Comète Design System
 *
 * Placeholder de chargement affichant la silhouette d'un contenu à venir.
 * Compose plusieurs Skeleton pour reproduire la structure d'une carte,
 * d'un avatar, d'un paragraphe, etc.
 *
 * ```tsx
 * import { Skeleton } from "@aexae/comete-design-system";
 *
 * <Skeleton width={240} height={20} />
 * <Skeleton shape="circle" width={48} />
 * <Skeleton width="100%" height={200} radius={8} />
 * ```
 */
export function Skeleton({
  shape = "rectangle",
  width = "100%",
  height = 20,
  radius,
  "aria-label": ariaLabel = "Chargement…",
  decorative = false,
  className,
  style: styleProp,
}: SkeletonProps): ReactElement {
  const isCircle = shape === "circle";

  // NOTE: cercle = width forcée à height (carré), border-radius natif via classe
  const resolvedWidth = isCircle ? height : width;

  const style: CSSProperties = {
    width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth,
    height: typeof height === "number" ? `${height}px` : height,
    ...styleProp,
  };

  if (!isCircle && radius !== undefined) {
    style.borderRadius = typeof radius === "number" ? `${radius}px` : radius;
  }

  const classNames = [
    styles.skeleton,
    isCircle ? styles.circle : styles.rectangle,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={style}
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
      aria-busy={decorative ? undefined : true}
      aria-live={decorative ? undefined : "polite"}
      aria-label={decorative ? undefined : ariaLabel}
    />
  );
}

Skeleton.displayName = "Skeleton";
