// ButtonGroup — Comète Design System
import type { ReactElement, ReactNode } from "react";
import styles from "./ButtonGroup.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface ButtonGroupProps {
  /**
   * Libellé accessible du groupe.
   * Recommandé quand plusieurs groupes coexistent dans le même contexte.
   */
  "aria-label"?: string;
  /** Éléments Button à regrouper. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * ButtonGroup — Comète Design System
 *
 * Regroupe un ensemble de `Button` liés dans un layout horizontal.
 * Rend un `div[role="group"]` avec un gap de `var(--space100)`.
 *
 * ```tsx
 * <ButtonGroup aria-label="Actions">
 *   <Button appearance="contained" color="default">Annuler</Button>
 *   <Button appearance="contained" color="brand">Confirmer</Button>
 * </ButtonGroup>
 * ```
 *
 * @param aria-label - Libellé accessible du groupe
 * @param children   - Éléments Button
 */
export function ButtonGroup({
  "aria-label": ariaLabel,
  children,
  className,
  style,
}: ButtonGroupProps): ReactElement {
  return (
    <div role="group" aria-label={ariaLabel} className={[styles.group, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}

ButtonGroup.displayName = "ButtonGroup";
