// DropIndicator — Comète Design System
// Indicateur visuel de zone de dépôt pour les interactions drag & drop.
import type { ReactElement } from "react";
import styles from "./DropIndicator.module.css";

// -----------------------------------------------------------------------
// Types publics

export type DropIndicatorOrientation = "horizontal" | "vertical";
export type DropIndicatorAppearance = "round" | "angle";
export type DropIndicatorSide = "start" | "end" | "both";

export interface DropIndicatorProps {
  /** Orientation de l'indicateur. @default "horizontal" */
  orientation?: DropIndicatorOrientation;
  /** Forme des extrémités : cercle ou triangle rentrant. @default "round" */
  appearance?: DropIndicatorAppearance;
  /** Côté(s) affichant la forme d'extrémité. @default "both" */
  side?: DropIndicatorSide;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * DropIndicator — Comète Design System
 *
 * Indicateur visuel affiché lors d'une opération de drag & drop pour
 * signaler la zone de dépôt. Composé d'une ligne avec des marqueurs
 * aux extrémités (cercles ou triangles rentrants).
 *
 * ```tsx
 * import { DropIndicator } from "@naxit/comete-design-system";
 *
 * <DropIndicator />
 * <DropIndicator appearance="angle" side="start" />
 * ```
 */
export function DropIndicator({
  orientation = "horizontal",
  appearance = "round",
  side = "both",
  className,
  style,
}: DropIndicatorProps): ReactElement {
  const classNames = [
    styles.dropIndicator,
    orientation === "vertical" ? styles.vertical : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const capClass = appearance === "round" ? styles.circle : styles.angle;
  const showStart = side === "start" || side === "both";
  const showEnd = side === "end" || side === "both";

  return (
    <div className={classNames} role="separator" aria-orientation={orientation} style={style}>
      {showStart && <div className={capClass} />}
      <div className={styles.line} />
      {showEnd && <div className={capClass} />}
    </div>
  );
}

DropIndicator.displayName = "DropIndicator";
