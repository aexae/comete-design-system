// useTableSelection — Comète Design System
// Hook de sélection de lignes pour Table. La sélection composable existe déjà
// côté rendu (TableRow isSelected + Checkbox + Table.SelectionBar) ; ce hook
// supprime le boilerplate d'ÉTAT que chaque consommateur réécrivait à
// l'identique : l'ensemble des clés sélectionnées, le toggle d'une ligne, le
// « tout sélectionner » et l'état indeterminate.
//
// Périmètre de « tout sélectionner » = la PAGE COURANTE : `toggleAll`,
// `isAllSelected` et `isSomeSelected` portent sur les `keys` fournies (les
// lignes actuellement affichées). Les clés sélectionnées d'autres pages
// persistent dans la sélection ; seul `clear()` vide tout.
import { useCallback, useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

export interface UseTableSelectionOptions<K = string> {
  /**
   * Clés des lignes **actuellement sélectionnables** (typiquement la page
   * affichée). Pilotent `isAllSelected` / `isSomeSelected` / `toggleAll` — le
   * périmètre de « tout sélectionner » est cette page. Les clés d'autres pages
   * déjà sélectionnées restent dans la sélection ; `clear()` vide tout.
   */
  keys: Iterable<K>;
  /** Sélection initiale (mode non contrôlé). @default [] */
  defaultSelectedKeys?: Iterable<K>;
  /**
   * Sélection contrôlée. Si fournie, le hook est **contrôlé** : il ne conserve
   * aucun état interne et notifie chaque changement via `onSelectionChange`
   * (au parent de réappliquer la nouvelle sélection).
   */
  selectedKeys?: Iterable<K>;
  /** Appelé à chaque changement, avec la nouvelle sélection complète. */
  onSelectionChange?: (keys: Set<K>) => void;
}

/** Props à étaler sur la `Checkbox` d'en-tête (« tout sélectionner »). */
export interface TableSelectAllCheckboxProps {
  isChecked: boolean;
  isIndeterminate: boolean;
  onChange: () => void;
  "aria-label": string;
}

/** Props à étaler sur la `Checkbox` d'une ligne. */
export interface TableRowCheckboxProps {
  isChecked: boolean;
  onChange: () => void;
  "aria-label": string;
}

/**
 * Props à étaler sur `TableRow` pour rendre **toute la ligne** cliquable
 * (bascule la sélection). Amélioration pointeur : la `Checkbox` reste le
 * contrôle clavier ; le `onClick` ignore les clics venant d'un contrôle
 * interactif (case, bouton, lien) pour éviter un double toggle.
 */
export interface TableRowClickProps {
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
}

export interface UseTableSelectionResult<K = string> {
  /** Ensemble des clés sélectionnées (toutes pages confondues). */
  selectedKeys: Set<K>;
  /** Nombre de clés sélectionnées. */
  selectedCount: number;
  /** Vrai si `key` est sélectionnée. */
  isSelected: (key: K) => boolean;
  /** Bascule la sélection d'une ligne. */
  toggle: (key: K) => void;
  /** Sélectionne une ligne (idempotent). */
  select: (key: K) => void;
  /** Désélectionne une ligne (idempotent). */
  deselect: (key: K) => void;
  /** Vrai si TOUTES les `keys` (page courante) sont sélectionnées (≥ 1). */
  isAllSelected: boolean;
  /**
   * Vrai si une partie seulement des `keys` (page courante) est sélectionnée
   * → à brancher sur `isIndeterminate` de la Checkbox d'en-tête.
   */
  isSomeSelected: boolean;
  /** Bascule la page courante : tout sélectionner ↔ tout désélectionner. */
  toggleAll: () => void;
  /** Sélectionne toutes les `keys` de la page courante (idempotent). */
  selectAll: () => void;
  /** Vide entièrement la sélection (toutes pages). */
  clear: () => void;
  /** Props prêtes à étaler sur la Checkbox d'en-tête. */
  getSelectAllProps: () => TableSelectAllCheckboxProps;
  /** Props prêtes à étaler sur la Checkbox d'une ligne. */
  getRowCheckboxProps: (key: K, label?: string) => TableRowCheckboxProps;
  /**
   * Props prêtes à étaler sur `TableRow` pour rendre toute la ligne cliquable
   * (bascule la sélection). À combiner avec `getRowCheckboxProps` sur la case :
   * les clics sur la case (ou tout contrôle interactif) sont ignorés par le
   * `onClick` de ligne → pas de double toggle.
   */
  getRowClickProps: (key: K) => TableRowClickProps;
}

/**
 * Gère l'état de sélection de lignes d'un `Table` (contrôlé ou non), avec
 * « tout sélectionner » à périmètre page courante et état indeterminate.
 *
 * ```tsx
 * const sel = useTableSelection({ keys: pageRows.map((r) => r.id) });
 *
 * <Table.SelectionBar count={sel.selectedCount} onClear={sel.clear}>…</Table.SelectionBar>
 * <Table aria-label="Agents">
 *   <TableHead>
 *     <TableRow>
 *       <TableHeaderCell><Checkbox {...sel.getSelectAllProps()} /></TableHeaderCell>
 *       …
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     {pageRows.map((r) => (
 *       <TableRow key={r.id} isSelected={sel.isSelected(r.id)}>
 *         <TableCell><Checkbox {...sel.getRowCheckboxProps(r.id, r.name)} /></TableCell>
 *         …
 *       </TableRow>
 *     ))}
 *   </TableBody>
 * </Table>
 * ```
 */
export function useTableSelection<K = string>(
  options: UseTableSelectionOptions<K>,
): UseTableSelectionResult<K> {
  const { keys, defaultSelectedKeys, selectedKeys, onSelectionChange } = options;

  const isControlled = selectedKeys !== undefined;
  const [internal, setInternal] = useState<Set<K>>(
    () => new Set(defaultSelectedKeys ?? []),
  );

  // Source de vérité : la prop en mode contrôlé, l'état interne sinon.
  const current = useMemo<Set<K>>(
    () => (isControlled ? new Set(selectedKeys) : internal),
    [isControlled, selectedKeys, internal],
  );

  // Clés de la page courante (périmètre de « tout sélectionner »).
  const pageKeys = useMemo<K[]>(() => Array.from(keys), [keys]);
  const selectedOnPage = pageKeys.reduce(
    (n, k) => (current.has(k) ? n + 1 : n),
    0,
  );
  const isAllSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
  const isSomeSelected = selectedOnPage > 0 && !isAllSelected;

  // Applique une nouvelle sélection : met à jour l'état interne (mode non
  // contrôlé) puis notifie systématiquement le parent.
  const commit = useCallback(
    (next: Set<K>) => {
      if (!isControlled) setInternal(next);
      onSelectionChange?.(next);
    },
    [isControlled, onSelectionChange],
  );

  const isSelected = useCallback((key: K) => current.has(key), [current]);

  const toggle = useCallback(
    (key: K) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      commit(next);
    },
    [current, commit],
  );

  const select = useCallback(
    (key: K) => {
      if (current.has(key)) return;
      const next = new Set(current);
      next.add(key);
      commit(next);
    },
    [current, commit],
  );

  const deselect = useCallback(
    (key: K) => {
      if (!current.has(key)) return;
      const next = new Set(current);
      next.delete(key);
      commit(next);
    },
    [current, commit],
  );

  const selectAll = useCallback(() => {
    const next = new Set(current);
    for (const k of pageKeys) next.add(k);
    commit(next);
  }, [current, pageKeys, commit]);

  const clear = useCallback(() => {
    commit(new Set());
  }, [commit]);

  const toggleAll = useCallback(() => {
    const next = new Set(current);
    if (isAllSelected) {
      // Ne désélectionne QUE les clés de la page courante (préserve les autres).
      for (const k of pageKeys) next.delete(k);
    } else {
      for (const k of pageKeys) next.add(k);
    }
    commit(next);
  }, [isAllSelected, current, pageKeys, commit]);

  const getSelectAllProps = useCallback(
    (): TableSelectAllCheckboxProps => ({
      isChecked: isAllSelected,
      isIndeterminate: isSomeSelected,
      onChange: toggleAll,
      "aria-label": isAllSelected ? "Tout désélectionner" : "Tout sélectionner",
    }),
    [isAllSelected, isSomeSelected, toggleAll],
  );

  const getRowCheckboxProps = useCallback(
    (key: K, label?: string): TableRowCheckboxProps => ({
      isChecked: current.has(key),
      onChange: () => toggle(key),
      "aria-label": label ?? "Sélectionner la ligne",
    }),
    [current, toggle],
  );

  const getRowClickProps = useCallback(
    (key: K): TableRowClickProps => ({
      onClick: (event) => {
        // Laisse les contrôles interactifs (case à cocher, bouton, lien) gérer
        // leur propre clic → évite le double toggle quand on clique la case.
        const target = event.target as HTMLElement | null;
        if (target?.closest('input,button,a,label,[role="checkbox"]')) return;
        toggle(key);
      },
    }),
    [toggle],
  );

  return {
    selectedKeys: current,
    selectedCount: current.size,
    isSelected,
    toggle,
    select,
    deselect,
    isAllSelected,
    isSomeSelected,
    toggleAll,
    selectAll,
    clear,
    getSelectAllProps,
    getRowCheckboxProps,
    getRowClickProps,
  };
}
