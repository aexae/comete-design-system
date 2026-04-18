// Stack — Comète Design System
// Primitive de layout : flex container 1D avec gap, alignement et wrap.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./Stack.module.css";

// -----------------------------------------------------------------------
// Types publics

/**
 * Espacement entre les enfants, exprimé en suffixe du token `--space{N}`.
 * Ex: `"200"` → `var(--space200)` (16px).
 */
export type StackGap =
  | "0"
  | "025"
  | "050"
  | "075"
  | "100"
  | "125"
  | "150"
  | "200"
  | "250"
  | "300"
  | "350"
  | "400"
  | "500"
  | "600"
  | "800"
  | "1000"
  | "1200"
  | "1600";

export type StackDirection = "row" | "column";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface StackProps {
  /** Direction du flex container. @default "column" */
  direction?: StackDirection;
  /** Espacement entre enfants (token `--space{N}`). @default "0" */
  gap?: StackGap;
  /** Alignement transversal des enfants (align-items). @default "stretch" */
  align?: StackAlign;
  /** Justification principale des enfants (justify-content). @default "start" */
  justify?: StackJustify;
  /** Autoriser le wrap des enfants. @default false */
  wrap?: boolean;
  /** Contenu du stack. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Stack — Comète Design System
 *
 * Primitive de layout flex 1D. S'utilise pour empiler des éléments
 * verticalement (par défaut) ou horizontalement avec un espacement
 * uniforme issu des tokens `--space*`.
 *
 * ```tsx
 * import { Stack } from "@naxit/comete-design-system";
 *
 * // Empilement vertical
 * <Stack gap="200">
 *   <p>Item 1</p>
 *   <p>Item 2</p>
 * </Stack>
 *
 * // Ligne horizontale avec alignement
 * <Stack direction="row" gap="100" align="center" justify="between">
 *   <Title />
 *   <Actions />
 * </Stack>
 * ```
 */
export function Stack({
  direction = "column",
  gap = "0",
  align = "stretch",
  justify = "start",
  wrap = false,
  children,
  className,
}: StackProps): ReactElement {
  const style = {
    "--_stack-gap": `var(--space${gap})`,
  } as CSSProperties;

  const classNames = [
    styles.stack,
    styles[direction],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    wrap ? styles.wrap : undefined,
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

Stack.displayName = "Stack";
