// Bleed — Comète Design System
// Primitive de layout : fait déborder un enfant au-delà de son conteneur.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { StackGap } from "../Stack/Stack.js";
import styles from "./Bleed.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BleedProps {
  /** Débordement horizontal relatif (compense le padding inline du parent). */
  inline?: StackGap;
  /** Débordement vertical relatif (compense le padding block du parent). */
  block?: StackGap;
  /**
   * Pleine largeur : traverse les gouttières de Page (`--page-gutter`).
   * Fonctionne quand l'élément occupe toute la largeur du contenu de Page
   * (enfant direct de Page.Body, ou dans un Stack/Grid.Col span=12).
   * @default false
   */
  isFull?: boolean;
  /** Contenu à faire déborder. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Bleed — Comète Design System
 *
 * Primitive de layout qui fait déborder son contenu au-delà de
 * son conteneur. Deux modes :
 *
 * - **Relatif** (`inline`/`block`) : compense le padding du parent direct.
 * - **Full** (`isFull`) : traverse les gouttières de `<Page>` via
 *   la CSS custom property `--page-gutter`. CSS pur, pas de JS.
 *
 * ```tsx
 * import { Page, Bleed, Stack, Card } from "@naxit/comete-design-system";
 *
 * // Relatif — compense le padding parent
 * <Stack padding="200" gap="200">
 *   <Bleed inline="200">
 *     <Card>Déborde du padding</Card>
 *   </Bleed>
 * </Stack>
 *
 * // Full — traverse les gouttières de Page
 * <Page>
 *   <Page.Body>
 *     <Bleed isFull>
 *       <Card color="sunken">Edge-to-edge dans la zone de contenu</Card>
 *     </Bleed>
 *   </Page.Body>
 * </Page>
 * ```
 */
export function Bleed({
  inline,
  block,
  isFull = false,
  children,
  className,
}: BleedProps): ReactElement {
  const style = {
    ...(inline !== undefined &&
      !isFull && {
        "--_bleed-inline": `var(--space${inline})`,
      }),
    ...(block !== undefined && {
      "--_bleed-block": `var(--space${block})`,
    }),
  } as CSSProperties;

  const classNames = [
    styles.bleed,
    isFull ? styles.full : undefined,
    !isFull && inline !== undefined ? styles.inline : undefined,
    block !== undefined ? styles.block : undefined,
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

Bleed.displayName = "Bleed";
