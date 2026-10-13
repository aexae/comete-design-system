// Pagination — Comète Design System
// Navigation entre pages : précédente / pages numérotées avec ellipses / suivante.
// Composant autonome (liste, galerie, résultats…) ; `TablePagination` le compose
// avec « résultats par page » et la plage affichée.
import type { CSSProperties, ReactElement } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../Icon/index.js";
import { useDensity, type Density } from "../../contexts/DensityContext.js";
import styles from "./Pagination.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface PaginationProps {
  /** Page courante (0-indexée). */
  page: number;
  /** Nombre total de pages. */
  pageCount: number;
  /** Callback quand la page change (nouvelle page 0-indexée). */
  onPageChange: (nextPage: number) => void;
  /** Densité — taille des boutons (28 / 32 / 40 px). Hérite d'un `DensityProvider`. */
  density?: Density;
  /** Nom accessible du repère de navigation. @default "Pagination" */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

/** Élément de la liste de pages : un numéro (1-based) ou une ellipse (début / fin). */
export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

// -----------------------------------------------------------------------
// Logique des pages

/**
 * Pages à afficher (7 emplacements au plus, largeur stable) : `1 2 3 4 5 … N` près
 * du début, `1 … N-4 … N` près de la fin, `1 … c-1 c c+1 … N` au milieu.
 * `current` et le résultat sont 1-based.
 */
export function getPageItems(current: number, total: number): PaginationItem[] {
  const MAX = 7;
  if (total <= MAX) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis-end", total];
  if (current >= total - 3) {
    return [1, "ellipsis-start", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total];
}

// -----------------------------------------------------------------------
// Composant

/**
 * Pagination — navigation entre pages. Contrôlée : le parent gère `page`.
 *
 * - « précédente » / « suivante » (désactivées aux extrémités) encadrent une liste de
 *   pages numérotées : la première, la dernière et les voisines de la courante sont
 *   toujours atteignables, « … » marque les pages masquées ;
 * - la page courante est pleine et porte `aria-current="page"` ;
 * - rien n'est rendu quand il n'y a qu'une page ou moins.
 *
 * ```tsx
 * <Pagination page={page} pageCount={10} onPageChange={setPage} />
 * ```
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  density,
  "aria-label": ariaLabel = "Pagination",
  className,
  style,
}: PaginationProps): ReactElement | null {
  const effectiveDensity = useDensity(density);
  if (pageCount <= 1) return null;

  const current = Math.min(Math.max(page, 0), pageCount - 1);
  const canPrev = current > 0;
  const canNext = current < pageCount - 1;

  return (
    <nav
      className={[styles.pagination, className].filter(Boolean).join(" ")}
      style={style}
      data-density={effectiveDensity}
      aria-label={ariaLabel}
    >
      <AriaButton
        className={styles.button}
        aria-label="Page précédente"
        isDisabled={!canPrev}
        onPress={() => onPageChange(current - 1)}
      >
        <span className={styles.icon} aria-hidden="true">
          <Icon icon="ChevronLeft" size={20} />
        </span>
      </AriaButton>

      {getPageItems(current + 1, pageCount).map((item) =>
        typeof item === "string" ? (
          <span key={item} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <AriaButton
            key={item}
            className={styles.button}
            aria-label={`Page ${item}`}
            aria-current={item === current + 1 ? "page" : undefined}
            onPress={() => {
              if (item !== current + 1) onPageChange(item - 1);
            }}
          >
            {item}
          </AriaButton>
        ),
      )}

      <AriaButton
        className={styles.button}
        aria-label="Page suivante"
        isDisabled={!canNext}
        onPress={() => onPageChange(current + 1)}
      >
        <span className={styles.icon} aria-hidden="true">
          <Icon icon="ChevronRight" size={20} />
        </span>
      </AriaButton>
    </nav>
  );
}

Pagination.displayName = "Pagination";
