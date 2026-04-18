// Divider — Comète Design System
// Séparateur visuel accessible, horizontal ou vertical.
import type { ReactElement } from "react";
import { Separator } from "react-aria-components";
import styles from "./Divider.module.css";

// -----------------------------------------------------------------------
// Types publics

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  /** Orientation du séparateur. Par défaut : "horizontal". */
  orientation?: DividerOrientation;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Divider — Comète Design System
 *
 * Séparateur visuel, horizontal (par défaut) ou vertical,
 * utilisé pour délimiter des sections de contenu.
 * Basé sur `Separator` de React Aria (role="separator").
 *
 * ```tsx
 * import { Divider } from "@naxit/comete-design-system";
 *
 * // Horizontal
 * <Divider />
 *
 * // Vertical — dans un conteneur flex/grid avec hauteur définie
 * <Divider orientation="vertical" />
 * ```
 */
export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps): ReactElement {
  return (
    <Separator
      orientation={orientation}
      className={[styles.divider, styles[orientation], className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

Divider.displayName = "Divider";
