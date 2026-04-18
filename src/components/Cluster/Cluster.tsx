// Cluster — Comète Design System
// Primitive de layout : flex-wrap horizontal pour groupes d'éléments hétérogènes
// (chips, tags, boutons…) avec gestion séparée des gaps colonne/ligne.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { StackGap } from "../Stack/Stack.js";
import styles from "./Cluster.module.css";

// -----------------------------------------------------------------------
// Types publics

export type ClusterAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type ClusterJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface ClusterProps {
  /** Espacement global entre enfants (row et column). @default "100" */
  gap?: StackGap;
  /** Espacement vertical entre les lignes (override `gap`). */
  rowGap?: StackGap;
  /** Espacement horizontal entre colonnes (override `gap`). */
  columnGap?: StackGap;
  /** Alignement transversal des enfants (align-items). @default "center" */
  align?: ClusterAlign;
  /** Justification principale (justify-content). @default "start" */
  justify?: ClusterJustify;
  /** Contenu du cluster. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Cluster — Comète Design System
 *
 * Primitive de layout flex-wrap horizontal. Idéal pour grouper des
 * éléments hétérogènes qui doivent wraper sur plusieurs lignes :
 * tags, chips, actions, filtres, breadcrumbs…
 *
 * ```tsx
 * import { Cluster } from "@naxit/comete-design-system";
 *
 * <Cluster gap="100" align="center">
 *   <Badge>React</Badge>
 *   <Badge>TypeScript</Badge>
 *   <Badge>CSS Modules</Badge>
 * </Cluster>
 *
 * // Gaps indépendants
 * <Cluster rowGap="200" columnGap="100">
 *   {tags.map(...)}
 * </Cluster>
 * ```
 */
export function Cluster({
  gap = "100",
  rowGap,
  columnGap,
  align = "center",
  justify = "start",
  children,
  className,
}: ClusterProps): ReactElement {
  const style = {
    "--_cluster-row-gap": `var(--space${rowGap ?? gap})`,
    "--_cluster-column-gap": `var(--space${columnGap ?? gap})`,
  } as CSSProperties;

  const classNames = [
    styles.cluster,
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}

Cluster.displayName = "Cluster";
