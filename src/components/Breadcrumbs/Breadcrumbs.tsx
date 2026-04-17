// Breadcrumbs — fil d'Ariane indiquant la position dans la hiérarchie de navigation
import type { ReactElement, ReactNode } from "react";
import styles from "./Breadcrumbs.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BreadcrumbsProps {
  /** Items de navigation — utiliser des composants <BreadcrumbItem>. */
  children: ReactNode;
  /** Label accessible de la navigation. Par défaut : "Fil d'Ariane". */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Fil d'Ariane indiquant la hiérarchie de navigation jusqu'à la page courante.
 * Contient des éléments <BreadcrumbItem>.
 *
 * @param children   - Items de navigation (BreadcrumbItem)
 * @param aria-label - Nom accessible de la nav (défaut : "Fil d'Ariane")
 */
export function Breadcrumbs({
  children,
  "aria-label": ariaLabel = "Fil d'Ariane",
  className,
}: BreadcrumbsProps): ReactElement {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className={styles.list}>{children}</ol>
    </nav>
  );
}
