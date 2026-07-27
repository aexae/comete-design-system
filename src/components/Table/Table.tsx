// Table — Comète Design System
// Table composable à la MUI. Rend un `<table>` HTML sémantique et propage
// la densité (compact/default/touch) aux cellules descendantes via le
// contexte `Density` — chaque `TableCell` / `TableHeaderCell` ajuste sa
// hauteur, son padding et son typographie en conséquence.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { Select } from "../Select/index.js";
import {
  DensityProvider,
  useDensity,
  type Density,
} from "../../contexts/DensityContext.js";
import styles from "./Table.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TableAlign = "left" | "center" | "right";

/**
 * État de tri d'une colonne :
 * - `default`     — colonne non triée (icône double flèche)
 * - `ascending`   — tri croissant (flèche haut)
 * - `descending`  — tri décroissant (flèche bas)
 */
export type TableSortDirection = "default" | "ascending" | "descending";

export interface TableProps {
  /**
   * Densité — impacte la hauteur des lignes, le padding des cellules et
   * la typographie. Si non fournie, hérite d'un `DensityProvider`, sinon
   * `"default"`.
   */
  density?: Density;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Contenu : `TableHead` + `TableBody` (et éventuellement `TableFooter`). */
  children: ReactNode;
  /** Label accessible du tableau. */
  "aria-label"?: string;
  /** ID d'un élément qui labellise le tableau. */
  "aria-labelledby"?: string;
}

export interface TableHeadProps {
  /** Contenu : un ou plusieurs `TableRow` qui contiennent des `TableHeaderCell`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface TableBodyProps {
  /** Contenu : les `TableRow` du corps du tableau. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface TableRowProps {
  /**
   * Marque la ligne comme sélectionnée (état visuel + `aria-selected`).
   * @default false
   */
  isSelected?: boolean;
  /** Contenu : `TableCell` ou `TableHeaderCell`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Handler `onClick` optionnel pour rendre la ligne cliquable. */
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
}

export interface TableCellProps {
  /**
   * Alignement du contenu.
   * @default "left"
   */
  align?: TableAlign;
  /**
   * Largeur fixe de la colonne (en px). Utilisé comme `width` sur la
   * première cellule d'une colonne — le browser applique la largeur à
   * toute la colonne.
   */
  width?: number;
  /** Contenu de la cellule. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /**
   * `colSpan` HTML natif — étend la cellule sur plusieurs colonnes.
   */
  colSpan?: number;
}

export interface TableHeaderCellProps extends TableCellProps {
  /**
   * Rend la colonne triable — clic sur l'en-tête change le tri.
   * L'indicateur (`UnfoldMore` / `KeyboardArrowUp` / `KeyboardArrowDown`)
   * s'affiche automatiquement selon `sortDirection`.
   * @default false
   */
  isSortable?: boolean;
  /** Direction courante du tri. @default "default" */
  sortDirection?: TableSortDirection;
  /**
   * Callback appelé quand on clique sur un en-tête `isSortable`. La cellule
   * cycle : `default` → `ascending` → `descending` → `default`. Le parent
   * décide du nouvel état à appliquer.
   */
  onSortChange?: (nextDirection: TableSortDirection) => void;
}

export interface TablePaginationLabelInfo {
  /** Index (1-based) de la première ligne visible. */
  from: number;
  /** Index (1-based) de la dernière ligne visible. */
  to: number;
  /** Nombre total de lignes. */
  count: number;
}

export interface TableViewProps {
  /**
   * Contenu du header (slot libre) — titre, filtres, `SearchField`,
   * boutons, etc. Non rendu si absent.
   */
  header?: ReactNode;
  /**
   * Contenu du footer (slot libre) — `TablePagination`, actions bulk, etc.
   * Non rendu si absent.
   */
  footer?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Le `<Table>` à encadrer. */
  children: ReactNode;
}

export interface TablePaginationProps {
  /** Nombre total de lignes du dataset. */
  count: number;
  /** Page courante (0-indexée). */
  page: number;
  /** Nombre de lignes par page. */
  rowsPerPage: number;
  /**
   * Options pour le sélecteur "lignes par page".
   * @default [10, 25, 50]
   */
  rowsPerPageOptions?: number[];
  /** Callback quand la page change (nouvelle page 0-indexée). */
  onPageChange: (nextPage: number) => void;
  /**
   * Callback quand le nombre de lignes par page change. Si non fourni, le
   * sélecteur "lignes par page" n'est pas affiché.
   */
  onRowsPerPageChange?: (nextRowsPerPage: number) => void;
  /** Libellé "lignes par page". @default "Lignes par page :" */
  labelRowsPerPage?: string;
  /** Fonction rendant le libellé "N-M sur Total". */
  labelDisplayedRows?: (info: TablePaginationLabelInfo) => string;
  /** Densité — hérite du parent `Table` par défaut. */
  density?: Density;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Helpers internes

/**
 * Retourne la direction de tri suivante dans le cycle
 * `default → ascending → descending → default`.
 */
function nextSortDirection(current: TableSortDirection): TableSortDirection {
  if (current === "default") return "ascending";
  if (current === "ascending") return "descending";
  return "default";
}

// -----------------------------------------------------------------------
// Table (root)

/**
 * Table — Comète Design System
 *
 * Table HTML sémantique composable, avec support de densité, de tri
 * et d'états ligne (hover, selected).
 *
 * ```tsx
 * <Table density="compact" aria-label="Utilisateurs">
 *   <TableHead>
 *     <TableRow>
 *       <TableHeaderCell isSortable sortDirection={sort} onSortChange={setSort}>
 *         Nom
 *       </TableHeaderCell>
 *       <TableHeaderCell>Statut</TableHeaderCell>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     {rows.map((r) => (
 *       <TableRow key={r.id} isSelected={r.id === selectedId}>
 *         <TableCell>{r.name}</TableCell>
 *         <TableCell><Tag label={r.status} /></TableCell>
 *       </TableRow>
 *     ))}
 *   </TableBody>
 * </Table>
 * ```
 */
function TableRoot({
  density,
  className,
  style,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: TableProps): ReactElement {
  const effectiveDensity = useDensity(density);
  const tableEl = (
    <table
      className={[styles.table, className].filter(Boolean).join(" ")}
      style={style}
      data-density={effectiveDensity}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </table>
  );
  // Wrappe dans un DensityProvider explicite pour que les cellules qui
  // liraient elles-mêmes le contexte (rare, mais possible) voient la
  // même valeur que ce qu'on projette via data-density.
  return density ? (
    <DensityProvider density={density}>{tableEl}</DensityProvider>
  ) : (
    tableEl
  );
}

TableRoot.displayName = "Table";

// -----------------------------------------------------------------------
// TableHead / TableBody

/** TableHead — `<thead>` contenant les `TableRow` d'en-tête. */
export function TableHead({
  children,
  className,
  style,
}: TableHeadProps): ReactElement {
  return (
    <thead
      className={[styles.head, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </thead>
  );
}

TableHead.displayName = "TableHead";

/** TableBody — `<tbody>` contenant les lignes de données. */
export function TableBody({
  children,
  className,
  style,
}: TableBodyProps): ReactElement {
  return (
    <tbody
      className={[styles.body, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </tbody>
  );
}

TableBody.displayName = "TableBody";

// -----------------------------------------------------------------------
// TableRow

/**
 * TableRow — une ligne de tableau. Applique hover + selected via
 * data-attributes ; le `onClick` optionnel rend la ligne cliquable
 * (souvent utilisé pour ouvrir un panel détail).
 */
export function TableRow({
  isSelected = false,
  children,
  className,
  style,
  onClick,
}: TableRowProps): ReactElement {
  return (
    <tr
      className={[styles.row, className].filter(Boolean).join(" ")}
      style={style}
      data-selected={isSelected || undefined}
      data-clickable={onClick ? "true" : undefined}
      aria-selected={isSelected || undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

TableRow.displayName = "TableRow";

// -----------------------------------------------------------------------
// TableCell — cellule de données `<td>`

/**
 * TableCell — cellule de contenu (`<td>`). Padding et taille de police
 * ajustés selon la densité du tableau parent.
 */
export function TableCell({
  align = "left",
  width,
  children,
  className,
  style,
  colSpan,
}: TableCellProps): ReactElement {
  const mergedStyle: CSSProperties = width !== undefined ? { ...style, width } : (style ?? {});
  return (
    <td
      className={[styles.cell, className].filter(Boolean).join(" ")}
      style={mergedStyle}
      data-align={align}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

TableCell.displayName = "TableCell";

// -----------------------------------------------------------------------
// TableHeaderCell — cellule d'en-tête `<th>` avec support de tri

/**
 * TableHeaderCell — cellule d'en-tête (`<th scope="col">`).
 * Peut être triable (`isSortable`) : dans ce cas, un icône de tri s'affiche
 * après le label et la cellule devient cliquable — le clic cycle
 * default → ascending → descending → default via `onSortChange`.
 */
export function TableHeaderCell({
  align = "left",
  width,
  children,
  className,
  style,
  colSpan,
  isSortable = false,
  sortDirection = "default",
  onSortChange,
}: TableHeaderCellProps): ReactElement {
  const mergedStyle: CSSProperties = width !== undefined ? { ...style, width } : (style ?? {});

  const handleClick = () => {
    if (!isSortable || !onSortChange) return;
    onSortChange(nextSortDirection(sortDirection));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTableCellElement> = (e) => {
    if (!isSortable || !onSortChange) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSortChange(nextSortDirection(sortDirection));
    }
  };

  // Icône d'indicateur — `UnfoldMore` par défaut (double flèche), flèche
  // simple quand un tri est actif.
  const sortIcon =
    sortDirection === "ascending"
      ? "KeyboardArrowUp"
      : sortDirection === "descending"
        ? "KeyboardArrowDown"
        : "UnfoldMore";

  const ariaSort: React.AriaAttributes["aria-sort"] =
    !isSortable
      ? undefined
      : sortDirection === "ascending"
        ? "ascending"
        : sortDirection === "descending"
          ? "descending"
          : "none";

  return (
    <th
      scope="col"
      className={[styles.headerCell, className].filter(Boolean).join(" ")}
      style={mergedStyle}
      data-align={align}
      data-sortable={isSortable || undefined}
      data-sort-direction={isSortable ? sortDirection : undefined}
      aria-sort={ariaSort}
      colSpan={colSpan}
      tabIndex={isSortable ? 0 : undefined}
      role={isSortable ? "columnheader" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.headerContent}>
        <span className={styles.headerLabel}>{children}</span>
        {isSortable && (
          <span className={styles.headerSortIcon} aria-hidden="true">
            <Icon icon={sortIcon} size={16} />
          </span>
        )}
      </span>
    </th>
  );
}

TableHeaderCell.displayName = "TableHeaderCell";

// -----------------------------------------------------------------------
// TablePagination — contrôles de pagination (rows-per-page + prev/next)

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function defaultLabelDisplayedRows({
  from,
  to,
  count,
}: TablePaginationLabelInfo): string {
  return `${from}–${to} sur ${count}`;
}

/**
 * TablePagination — Contrôles de pagination pour un `Table`. À rendre
 * en dessous du `<Table>`. Contrôlé — le parent gère `page` et
 * `rowsPerPage` et applique lui-même la découpe du dataset.
 *
 * ```tsx
 * <Table>...</Table>
 * <TablePagination
 *   count={rows.length}
 *   page={page}
 *   rowsPerPage={rowsPerPage}
 *   onPageChange={setPage}
 *   onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
 * />
 * ```
 */
export function TablePagination({
  count,
  page,
  rowsPerPage,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  onPageChange,
  onRowsPerPageChange,
  labelRowsPerPage = "Lignes par page :",
  labelDisplayedRows = defaultLabelDisplayedRows,
  density,
  className,
  style,
}: TablePaginationProps): ReactElement {
  const effectiveDensity = useDensity(density);
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);
  const canPrev = page > 0;
  const canNext = page < lastPage;

  const rowsPerPageItems = rowsPerPageOptions.map((n) => ({
    value: String(n),
    label: String(n),
  }));

  return (
    <div
      className={[styles.pagination, className].filter(Boolean).join(" ")}
      style={style}
      data-density={effectiveDensity}
      role="navigation"
      aria-label="Pagination"
    >
      {onRowsPerPageChange && (
        <div className={styles.paginationRowsPerPage}>
          <span className={styles.paginationLabel}>{labelRowsPerPage}</span>
          <Select
            aria-label={labelRowsPerPage}
            items={rowsPerPageItems}
            value={String(rowsPerPage)}
            onChange={(v) => {
              if (v !== null) onRowsPerPageChange(Number(v));
            }}
            density={effectiveDensity}
          />
        </div>
      )}
      <span className={styles.paginationLabel}>
        {labelDisplayedRows({ from, to, count })}
      </span>
      <div className={styles.paginationControls}>
        <Button
          appearance="subtle"
          density="compact"
          iconBefore="ChevronLeft"
          aria-label="Page précédente"
          isDisabled={!canPrev}
          onPress={() => onPageChange(page - 1)}
        />
        <Button
          appearance="subtle"
          density="compact"
          iconBefore="ChevronRight"
          aria-label="Page suivante"
          isDisabled={!canNext}
          onPress={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  );
}

TablePagination.displayName = "TablePagination";

// -----------------------------------------------------------------------
// TableView — wrapper de mise en page (header + table + footer)

/**
 * TableView — Conteneur qui encadre une `<Table>` avec un header optionnel
 * (toolbar : titre, filtres, boutons) et un footer optionnel (pagination,
 * actions bulk). Ne gère aucune logique — c'est un slot layout uniquement.
 * Exposé aussi en tant que `Table.View`.
 *
 * ```tsx
 * <Table.View
 *   header={<><Text weight="medium">Sites</Text><Spacer /><SearchField /></>}
 *   footer={<TablePagination count={7} page={0} rowsPerPage={10} onPageChange={…} />}
 * >
 *   <Table density="compact">...</Table>
 * </Table.View>
 * ```
 */
export function TableView({
  header,
  footer,
  className,
  style,
  children,
}: TableViewProps): ReactElement {
  return (
    <div
      className={[styles.view, className].filter(Boolean).join(" ")}
      style={style}
      data-has-footer={footer ? "true" : undefined}
    >
      {header && <div className={styles.viewHeader}>{header}</div>}
      <div className={styles.viewContent}>{children}</div>
      {footer && <div className={styles.viewFooter}>{footer}</div>}
    </div>
  );
}

TableView.displayName = "TableView";

// -----------------------------------------------------------------------
// Compound API — expose `Table.View` en plus de l'export nommé `TableView`.

/**
 * Type du composant composé `Table`. Explicite (plutôt que `typeof TableRoot`)
 * pour que `typeof Table` reste nommable côté consommateur — sinon TS4023
 * (« name 'TableRoot' … cannot be named ») remonte dans les stories/apps.
 */
export interface TableComponent {
  (props: TableProps): ReactElement;
  displayName?: string;
  /** Vue haut niveau avec en-tête, pagination et gestion du tri. */
  View: typeof TableView;
}

export const Table: TableComponent = Object.assign(TableRoot, { View: TableView });
