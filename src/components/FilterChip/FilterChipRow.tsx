// FilterChipRow — Comète Design System
// Rangée de filtres rapides : chips épinglées (toujours visibles) + chips
// temporaires (facettes non épinglées qui deviennent visibles dès qu'elles ont
// une valeur active) + bouton « Filtres » ouvrant le panneau complet (Drawer).
//
// Invariant : la rangée montre TOUJOURS tout ce qui filtre la liste — jamais de
// filtre actif caché. Une facette non épinglée mais active apparaît comme chip
// temporaire ; elle disparaît quand elle est effacée.
import { Fragment, type ReactElement, type ReactNode } from "react";
import { Button } from "../Button/Button.js";
import { Badge } from "../Badge/Badge.js";
import styles from "./FilterChipRow.module.css";

// `process` n'est pas typé ici (le DS build avec `types: []`, sans @types/node).
// Déclaration locale minimale : le bundler du consommateur remplace
// `process.env.NODE_ENV` par une constante à la compilation.
declare const process: { env: { NODE_ENV?: string } };

export interface FilterChipRowFacet {
  /** Identifiant unique de la facette (clé de rendu). */
  id: string;
  /**
   * Facette épinglée : toujours visible dans la rangée. Sinon « temporaire » :
   * visible seulement quand elle est active.
   */
  isPinned?: boolean;
  /**
   * La facette a ≥ 1 valeur active. Pilote l'apparition des chips temporaires
   * (une facette non épinglée n'apparaît que si `isActive`).
   */
  isActive?: boolean;
  /** L'élément `<FilterChip>` à rendre pour cette facette. */
  chip: ReactNode;
}

export interface FilterChipRowProps {
  /** Facettes de la rangée. Les épinglées sont rendues dans cet ordre. */
  facets: FilterChipRowFacet[];
  /**
   * Total de valeurs actives, toutes facettes confondues (y compris épinglées
   * et facettes sans chip) — affiché en badge sur le bouton « Filtres ».
   */
  totalActiveCount?: number;
  /**
   * Ouvre le panneau de filtres complet (Drawer D13). Le bouton « Filtres »
   * n'est rendu que si ce callback est fourni.
   */
  onOpenAll?: () => void;
  /** Libellé du bouton d'ouverture du panneau complet. @default "Filtres" */
  filtersLabel?: string;
  /** Classe CSS additionnelle sur la rangée. */
  className?: string;
}

/** Nombre maximal de facettes épinglées recommandé (au-delà → panneau complet). */
const MAX_PINNED = 4;

/**
 * FilterChipRow — Comète Design System
 *
 * ```tsx
 * <FilterChipRow
 *   facets={[
 *     { id: "sites", isPinned: true, isActive: sites.length > 0, chip: <FilterChip … /> },
 *     { id: "statut", isActive: statut.length > 0, chip: <FilterChip … /> },
 *   ]}
 *   totalActiveCount={total}
 *   onOpenAll={openDrawer}
 * />
 * ```
 */
export function FilterChipRow({
  facets,
  totalActiveCount = 0,
  onOpenAll,
  filtersLabel = "Filtres",
  className,
}: FilterChipRowProps): ReactElement {
  const pinned = facets.filter((f) => f.isPinned);

  if (process.env.NODE_ENV !== "production" && pinned.length > MAX_PINNED) {
    // eslint-disable-next-line no-console
    console.warn(
      `FilterChipRow : ${pinned.length} facettes épinglées, ${MAX_PINNED} au ` +
        `maximum recommandé. Au-delà, laissez les facettes moins fréquentes ` +
        `au panneau complet (Drawer).`,
    );
  }

  // Épinglées (dans l'ordre) puis temporaires (non épinglées mais actives).
  const temporary = facets.filter((f) => !f.isPinned && f.isActive);
  const visible = [...pinned, ...temporary];

  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")}>
      <div className={styles.row}>
        {/* Fragment (sans nœud DOM) : les chips restent enfants directs de
            `.row` pour que le ResizeObserver de FilterChip mesure bien la
            rangée comme conteneur. */}
        {visible.map((f) => (
          <Fragment key={f.id}>{f.chip}</Fragment>
        ))}
        {onOpenAll && (
          <Button
            appearance="outlined"
            iconBefore="Tune"
            onPress={onOpenAll}
            className={styles.filtersButton}
          >
            {filtersLabel}
            {totalActiveCount > 0 && (
              <Badge
                label={String(totalActiveCount)}
                appearance="information"
                importance="high"
              />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

FilterChipRow.displayName = "FilterChipRow";
