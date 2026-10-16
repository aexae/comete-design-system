// TablePager — Comète Design System
// Sous-composant de `Table` : navigation entre pages (précédente / pages numérotées
// avec ellipses / suivante). Exposé aussi en `Table.Pager`. `TablePagination` le
// compose avec « résultats par page » et la plage affichée.
import type { CSSProperties, ReactElement } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../Icon/index.js";
import { useDensity, type Density } from "../../contexts/DensityContext.js";
import styles from "./TablePager.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface TablePagerProps {
  /** Page courante (0-indexée). */
  page: number;
  /** Nombre total de pages. */
  pageCount: number;
  /** Callback quand la page change (nouvelle page 0-indexée). */
  onPageChange: (nextPage: number) => void;
  /**
   * Nombre d'emplacements de pages numérotées affichés (largeur stable) :
   * - `7` (défaut) — `1 2 3 4 5 … N`, `1 … c-1 c c+1 … N`, `1 … N-4 … N` ;
   * - `5` — `1 2 3 … N`, `1 … c … N`, `1 … N-2 N-1 N` ;
   * - `3` — fenêtre glissante de trois pages autour de la courante, bornée par des points de
   *   suspension là où des pages sont masquées (`1 2 3 …`, `… 4 5 6 …`, `… 10 11 12`), pour
   *   les barres étroites ; première / dernière via précédente / suivante.
   * @default 7
   */
  visiblePages?: 3 | 5 | 7;
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
export type TablePagerItem = number | "ellipsis-start" | "ellipsis-end";

// -----------------------------------------------------------------------
// Logique des pages

/**
 * Pages à afficher (`slots` emplacements au plus, largeur stable). `current` et le
 * résultat sont 1-based. Avec 7 emplacements : `1 2 3 4 5 … N` près du début,
 * `1 … N-4 … N` près de la fin, `1 … c-1 c c+1 … N` au milieu — les pages intermédiaires
 * sont masquées par des points de suspension quand le volume est important. Avec 3 : fenêtre
 * de trois pages consécutives centrée sur la courante, avec « … » du côté où des pages sont
 * masquées.
 */
export function getPageItems(current: number, total: number, slots: 3 | 5 | 7 = 7): TablePagerItem[] {
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

  if (slots === 3) {
    const start = Math.min(Math.max(current - 1, 1), total - 2);
    const end = start + 2;
    return [
      ...(start > 1 ? (["ellipsis-start"] as const) : []),
      start,
      start + 1,
      end,
      ...(end < total ? (["ellipsis-end"] as const) : []),
    ];
  }

  // 5 ou 7 : première et dernière toujours là, deux ellipses au plus.
  const siblings = Math.floor((slots - 5) / 2);
  if (current <= slots - 3) {
    return [...Array.from({ length: slots - 2 }, (_, i) => i + 1), "ellipsis-end", total];
  }
  if (current >= total - slots + 4) {
    return [
      1,
      "ellipsis-start",
      ...Array.from({ length: slots - 2 }, (_, i) => total - slots + 3 + i),
    ];
  }
  return [
    1,
    "ellipsis-start",
    ...Array.from({ length: 2 * siblings + 1 }, (_, i) => current - siblings + i),
    "ellipsis-end",
    total,
  ];
}

// -----------------------------------------------------------------------
// Composant

/**
 * TablePager — navigation entre pages (sous-composant de `Table`, aussi `Table.Pager`).
 * Contrôlée : le parent gère `page`.
 *
 * - « précédente » / « suivante » (désactivées aux extrémités) encadrent une liste de
 *   pages numérotées : la première, la dernière et les voisines de la courante sont
 *   toujours atteignables, « … » marque les pages masquées ;
 * - la page courante est pleine et porte `aria-current="page"` ;
 * - rien n'est rendu quand il n'y a qu'une page ou moins.
 *
 * ```tsx
 * <Table.Pager page={page} pageCount={10} onPageChange={setPage} />
 * ```
 */
export function TablePager({
  page,
  pageCount,
  onPageChange,
  visiblePages = 7,
  density,
  "aria-label": ariaLabel = "Pagination",
  className,
  style,
}: TablePagerProps): ReactElement | null {
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

      {getPageItems(current + 1, pageCount, visiblePages).map((item) =>
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

TablePager.displayName = "TablePager";
