// Grid — Comète Design System
// Primitive de layout : grille CSS responsive (12 colonnes par défaut)
// avec valeurs par breakpoint mobile / tablet / desktop.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { StackGap } from "../Stack/Stack.js";
import styles from "./Grid.module.css";

// -----------------------------------------------------------------------
// Types publics

/**
 * Valeur responsive — scalaire (appliqué à tous les breakpoints) ou objet
 * par breakpoint. Les valeurs omises héritent du breakpoint inférieur.
 *
 * Breakpoints :
 * - `mobile`  — par défaut (< 600px)
 * - `tablet`  — ≥ 600px
 * - `desktop` — ≥ 1200px
 */
export type GridResponsive<T> =
  | T
  | {
      mobile?: T;
      tablet?: T;
      desktop?: T;
    };

export interface GridProps {
  /** Nombre de colonnes. @default 12 */
  columns?: GridResponsive<number>;
  /** Espacement global entre cellules (row et column). @default "0" */
  gap?: StackGap;
  /** Espacement vertical entre lignes (override `gap`). */
  rowGap?: StackGap;
  /** Espacement horizontal entre colonnes (override `gap`). */
  columnGap?: StackGap;
  /** Contenu de la grille. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

export interface GridColProps {
  /** Nombre de colonnes occupées. @default 1 */
  span?: GridResponsive<number>;
  /** Colonne de départ (1-indexée). */
  start?: GridResponsive<number>;
  /** Contenu de la cellule. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Helpers

function isResponsiveObject<T>(
  value: GridResponsive<T> | undefined,
): value is { mobile?: T; tablet?: T; desktop?: T } {
  return typeof value === "object" && value !== null;
}

function responsiveVars(
  prefix: string,
  value: GridResponsive<number> | undefined,
): CSSProperties {
  if (value === undefined) return {};
  const vars: Record<string, string | number> = {};
  if (isResponsiveObject(value)) {
    if (value.mobile !== undefined) vars[`--_${prefix}-mobile`] = value.mobile;
    if (value.tablet !== undefined) vars[`--_${prefix}-tablet`] = value.tablet;
    if (value.desktop !== undefined)
      vars[`--_${prefix}-desktop`] = value.desktop;
  } else {
    vars[`--_${prefix}-mobile`] = value;
  }
  return vars as CSSProperties;
}

// -----------------------------------------------------------------------
// Grid

/**
 * Grid — Comète Design System
 *
 * Primitive de layout CSS Grid. Par défaut, une grille 12 colonnes qui
 * s'adapte aux breakpoints `mobile` / `tablet` / `desktop`.
 *
 * ```tsx
 * import { Grid } from "@naxit/comete-design-system";
 *
 * // 12 colonnes par défaut, gap standard
 * <Grid gap="200">
 *   <Grid.Col span={6}>Gauche</Grid.Col>
 *   <Grid.Col span={6}>Droite</Grid.Col>
 * </Grid>
 *
 * // Nombre de colonnes responsive
 * <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="300">
 *   {items.map(...)}
 * </Grid>
 * ```
 */
export function Grid({
  columns = 12,
  gap = "0",
  rowGap,
  columnGap,
  children,
  className,
}: GridProps): ReactElement {
  const style = {
    ...responsiveVars("grid-cols", columns),
    "--_grid-row-gap": `var(--space${rowGap ?? gap})`,
    "--_grid-column-gap": `var(--space${columnGap ?? gap})`,
  } as CSSProperties;

  const classNames = [styles.grid, className].filter(Boolean).join(" ");

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}

Grid.displayName = "Grid";

// -----------------------------------------------------------------------
// Grid.Col

/**
 * Grid.Col — cellule d'une `<Grid>`. Occupe `span` colonnes et peut démarrer
 * à une colonne précise via `start`. Les deux props acceptent une valeur
 * responsive (scalaire ou `{ mobile, tablet, desktop }`).
 */
function GridCol({
  span = 1,
  start,
  children,
  className,
}: GridColProps): ReactElement {
  const style = {
    ...responsiveVars("col-span", span),
    ...responsiveVars("col-start", start),
  } as CSSProperties;

  const hasStart = start !== undefined;
  const classNames = [
    styles.col,
    hasStart ? styles.hasStart : undefined,
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

GridCol.displayName = "Grid.Col";

Grid.Col = GridCol;
