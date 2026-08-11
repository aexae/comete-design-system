// Table — Comète Design System
// Table composable à la MUI. Rend un `<table>` HTML sémantique et propage
// la densité (compact/default/touch) aux cellules descendantes via le
// contexte `Density` — chaque `TableCell` / `TableHeaderCell` ajuste sa
// hauteur, son padding et son typographie en conséquence.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Children, cloneElement, createContext, isValidElement, useContext } from "react";
import { VisuallyHidden } from "react-aria-components";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { Select } from "../Select/index.js";
import { Skeleton } from "../Skeleton/index.js";
import { DataStateMessage } from "../_states/DataStateMessage.js";
import {
  DensityProvider,
  useDensity,
  type Density,
} from "../../contexts/DensityContext.js";
import styles from "./Table.module.css";

// `process` n'est pas typé ici (le DS build avec `types: []`, sans @types/node).
// Déclaration locale minimale : le bundler du consommateur (Vite/webpack/Next)
// remplace `process.env.NODE_ENV` par une constante à la compilation.
declare const process: { env: { NODE_ENV?: string } };

// -----------------------------------------------------------------------
// Types publics

export type TableAlign = "left" | "center" | "right";

/**
 * Seuil de masquage responsive d'une colonne, exprimé en largeur du
 * **container** de la table (pas du viewport). Valeurs alignées sur la source
 * unique `BREAKPOINTS` (src/tokens/breakpoints.ts) :
 * - `sm` — masquée sous 600px de container ;
 * - `md` — masquée sous 900px ;
 * - `lg` — masquée sous 1200px.
 */
export type TableHideBelow = "sm" | "md" | "lg";

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
  /**
   * Rend l'en-tête (`thead`) **collant** en haut de la zone de défilement
   * (`position: sticky`) — l'en-tête reste visible pendant le scroll du corps.
   * À combiner avec `maxHeight`. @default false
   */
  stickyHeader?: boolean;
  /**
   * Borne la hauteur du tableau et le rend **défilant** : le tableau est
   * enveloppé dans un conteneur de défilement à hauteur maximale. Nombre =
   * pixels ; string = valeur CSS (ex. `"70vh"`).
   */
  maxHeight?: number | string;
  /**
   * Active les **colonnes responsives** (`hideBelow`) : enveloppe le tableau
   * dans un *query container* (`container-type: inline-size`) que les cellules
   * `hideBelow` interrogent. À poser dès qu'une cellule utilise `hideBelow`.
   *
   * ⚠️ Le query container doit vivre dans un **contexte de largeur définie**
   * (flux bloc, colonne flex/grid, largeur explicite) — pas dans un parent
   * *shrink-to-fit* (ex. centrage `width: max-content`), où la containment le
   * ferait s'effondrer. Sans `responsive`, le tableau est rendu tel quel (aucun
   * conteneur, aucun impact de mise en page). @default false
   */
  responsive?: boolean;
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
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /**
   * Nombre de colonnes du tableau — nécessaire pour l'empan (`colSpan`) des
   * états vide/erreur et pour le nombre de cellules des lignes skeleton.
   * @default 1
   */
  columnCount?: number;
  /**
   * Affiche des lignes de chargement (skeleton) à la place du contenu.
   * Priorité : `error` > `isLoading` > `isEmpty` > `isNoResults` > `children`.
   */
  isLoading?: boolean;
  /** Nombre de lignes skeleton affichées quand `isLoading`. @default 5 */
  skeletonRows?: number;
  /** Affiche l'état vide (aucune donnée du tout) à la place du contenu. */
  isEmpty?: boolean;
  /**
   * Affiche l'état « aucun résultat » (une recherche/un filtre ne renvoie
   * rien) à la place du contenu — distinct de `isEmpty` (aucune donnée du
   * tout) : le libellé invite à ajuster la recherche plutôt qu'à créer.
   */
  isNoResults?: boolean;
  /**
   * État d'erreur. Falsy = pas d'erreur ; `true` = message générique ;
   * une chaîne = message d'erreur personnalisé.
   */
  error?: boolean | string;
  /** Callback "Réessayer" — affiche un bouton dans l'état d'erreur. */
  onRetry?: () => void;
  /** Titre de l'état vide (sinon libellé par défaut). */
  emptyTitle?: string;
  /** Description de l'état vide (sinon libellé par défaut). */
  emptyDescription?: string;
  /** Slot pour remplacer entièrement le contenu de l'état vide. */
  emptyState?: ReactNode;
  /** Titre de l'état « aucun résultat » (sinon libellé par défaut). */
  noResultsTitle?: string;
  /** Description de l'état « aucun résultat » (sinon libellé par défaut). */
  noResultsDescription?: string;
  /**
   * Action de l'état « aucun résultat » (typiquement « Réinitialiser les
   * filtres »). Rendue sous la description.
   */
  noResultsAction?: ReactNode;
  /** Slot pour remplacer entièrement le contenu de l'état « aucun résultat ». */
  noResultsState?: ReactNode;
  /** Slot pour remplacer entièrement le contenu de l'état d'erreur. */
  errorState?: ReactNode;
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
  /**
   * Rend la ligne cliquable en **navigation**. La cellule primaire (première
   * `TableCell`, ou celle marquée `isRowAnchor`) rend son contenu dans un vrai
   * `<a href>` : focusable, activable au clavier, annoncé par les lecteurs
   * d'écran, et compatible Ctrl/⌘+clic et clic molette (nouvel onglet). Le clic
   * sur le reste de la ligne délègue à ce lien. Exclusif avec `onPress`.
   */
  href?: string;
  /**
   * Rend la ligne cliquable en **action** (ouvrir un panneau latéral, etc.).
   * La cellule primaire rend son contenu dans un vrai `<button>`. Exclusif avec
   * `href` — pour une navigation, toujours préférer `href` (ne pas priver
   * l'utilisateur du Ctrl+clic / nouvel onglet).
   */
  onPress?: () => void;
  /**
   * @deprecated Utiliser `href` (navigation) ou `onPress` (action). Le
   * `onClick` posé sur le `<tr>` ne crée ni rôle, ni ordre de tabulation, ni
   * gestion clavier : la ligne cliquable reste invisible au clavier et aux
   * lecteurs d'écran. Conservé temporairement pour compatibilité ; ignoré si
   * `href`/`onPress` est fourni.
   */
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
  /**
   * Masque la colonne en dessous d'une largeur de **container** (dégradation
   * desktop → tablette, via container queries — jamais de media query
   * viewport). Voir {@link TableHideBelow}. Nécessite la prop `responsive` sur
   * la `Table` (qui établit le query container).
   *
   * **Contrainte compositionnelle** : à poser sur la cellule d'en-tête ET sur
   * chaque cellule du corps de la MÊME colonne (sinon décalage). Ne jamais
   * poser sur la colonne de sélection ni la colonne d'actions. Une info
   * masquée doit rester atteignable (ligne cliquable vers le détail, ou vue
   * cartes) ; sous ~600px de container, préférer une liste compacte (`List`)
   * à une table compressée.
   */
  hideBelow?: TableHideBelow;
  /**
   * Désigne cette cellule comme **ancre de ligne** : quand la `TableRow` parente
   * porte `href`/`onPress`, c'est le contenu de CETTE cellule qui devient le
   * vrai `<a>`/`<button>` focusable. Par défaut (aucune cellule marquée), la
   * **première** `TableCell` de la ligne fait office d'ancre. Sans `href`/`onPress`
   * sur la ligne, la prop est sans effet.
   */
  isRowAnchor?: boolean;
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
  /**
   * Colonne d'actions (boutons de ligne) : l'en-tête n'a pas de libellé
   * visible mais conserve un **nom accessible** (rendu masqué visuellement),
   * au lieu d'un placeholder vide (`&nbsp;`) inaccessible. Le nom accessible
   * vient des `children` (sinon « Actions »). Aligné au centre par défaut.
   * @default false
   */
  isActionColumn?: boolean;
}

export interface TableSelectionBarProps {
  /**
   * Nombre de lignes sélectionnées. Pilote le libellé pluralisé. La barre ne
   * rend rien quand `count` vaut 0 (elle apparaît dès qu'il y a une sélection).
   */
  count: number;
  /** Actions groupées (boutons) affichées à droite (supprimer, exporter…). */
  children?: ReactNode;
  /**
   * Callback de désélection globale — rend un bouton « Tout désélectionner »
   * avant les actions.
   */
  onClear?: () => void;
  /**
   * Libellé personnalisé (reçoit le compte). Par défaut :
   * « N ligne(s) sélectionnée(s) ».
   */
  label?: (count: number) => string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
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
  stickyHeader = false,
  maxHeight,
  responsive = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: TableProps): ReactElement {
  const effectiveDensity = useDensity(density);
  const tableEl = (
    <table
      className={[styles.table, className].filter(Boolean).join(" ")}
      style={style}
      data-density={effectiveDensity}
      data-sticky-header={stickyHeader || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </table>
  );
  // Le tableau n'est enveloppé QUE s'il y a une raison :
  // - `responsive` → query container (`container-type`) pour les colonnes
  //   `hideBelow` (largeur du container, pas du viewport) ;
  // - `maxHeight` → conteneur de défilement borné (l'en-tête collant se colle
  //   relativement à lui).
  // Sinon la table est rendue telle quelle : aucun wrapper, donc AUCUN impact
  // de mise en page (une containment inline-size s'effondrerait en contexte
  // shrink-to-fit, ex. `layout: centered`).
  const wrapperClasses = [
    responsive ? styles.queryContainer : undefined,
    maxHeight !== undefined ? styles.scrollContainer : undefined,
  ].filter(Boolean);
  const framed =
    wrapperClasses.length > 0 ? (
      <div
        className={wrapperClasses.join(" ")}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        {tableEl}
      </div>
    ) : (
      tableEl
    );
  // Wrappe dans un DensityProvider explicite pour que les cellules qui
  // liraient elles-mêmes le contexte (rare, mais possible) voient la
  // même valeur que ce qu'on projette via data-density.
  return density ? (
    <DensityProvider density={density}>{framed}</DensityProvider>
  ) : (
    framed
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

/**
 * TableBody — `<tbody>` contenant les lignes de données.
 *
 * Gère nativement les états de chargement / vide / aucun résultat / erreur :
 * passer `isLoading`, `isEmpty`, `isNoResults` ou `error` affiche l'état
 * correspondant à la place des lignes, sans que le consommateur ait à les
 * composer. `isEmpty` = aucune donnée du tout ; `isNoResults` = une
 * recherche/un filtre ne renvoie rien. Fournir `columnCount` pour que l'empan
 * et les lignes skeleton couvrent toutes les colonnes.
 */
export function TableBody({
  children,
  className,
  style,
  columnCount = 1,
  isLoading = false,
  skeletonRows = 5,
  isEmpty = false,
  isNoResults = false,
  error = false,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyState,
  noResultsTitle,
  noResultsDescription,
  noResultsAction,
  noResultsState,
  errorState,
}: TableBodyProps): ReactElement {
  const bodyClassName = [styles.body, className].filter(Boolean).join(" ");

  // Priorité : erreur > chargement > vide > aucun résultat > contenu.
  let content: ReactNode;
  if (error) {
    content = (
      <tr>
        <td colSpan={columnCount} className={styles.stateCell}>
          {errorState ?? (
            <DataStateMessage
              kind="error"
              description={typeof error === "string" ? error : undefined}
              onRetry={onRetry}
            />
          )}
        </td>
      </tr>
    );
  } else if (isLoading) {
    content = Array.from({ length: skeletonRows }, (_, rowIndex) => (
      <tr key={rowIndex} className={styles.row}>
        {Array.from({ length: Math.max(1, columnCount) }, (_, colIndex) => (
          <td key={colIndex} className={styles.cell}>
            <Skeleton height={16} radius={4} aria-label="Chargement…" />
          </td>
        ))}
      </tr>
    ));
  } else if (isEmpty) {
    content = (
      <tr>
        <td colSpan={columnCount} className={styles.stateCell}>
          {emptyState ?? (
            <DataStateMessage
              kind="empty"
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </td>
      </tr>
    );
  } else if (isNoResults) {
    content = (
      <tr>
        <td colSpan={columnCount} className={styles.stateCell}>
          {noResultsState ?? (
            <DataStateMessage
              kind="noResults"
              title={noResultsTitle}
              description={noResultsDescription}
              actions={noResultsAction}
            />
          )}
        </td>
      </tr>
    );
  } else {
    content = children;
  }

  return (
    <tbody className={bodyClassName} style={style}>
      {content}
    </tbody>
  );
}

TableBody.displayName = "TableBody";

// -----------------------------------------------------------------------
// TableRow

/**
 * Contexte interne : une `TableRow` cliquable (`href`/`onPress`) transmet sa
 * cible d'ouverture à la `TableCell` qui fait office d'ancre. `null` quand la
 * ligne n'est pas interactive.
 */
interface RowAnchorContextValue {
  href?: string;
  onPress?: () => void;
}
const RowAnchorContext = createContext<RowAnchorContextValue | null>(null);

/**
 * TableRow — une ligne de tableau. Applique hover + selected via
 * data-attributes. `href` (navigation) ou `onPress` (action) rend la ligne
 * cliquable de façon accessible : l'élément focusable réel (un vrai
 * `<a>`/`<button>`) vit DANS la cellule primaire, pas sur le `<tr>` — la
 * sémantique de table est préservée pour les lecteurs d'écran. Le clic sur le
 * reste de la ligne est un confort souris qui délègue à cet élément.
 */
export function TableRow({
  isSelected = false,
  children,
  className,
  style,
  href,
  onPress,
  onClick,
}: TableRowProps): ReactElement {
  const isInteractive = href !== undefined || onPress !== undefined;

  if (process.env.NODE_ENV !== "production") {
    if (href !== undefined && onPress !== undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        "TableRow : `href` et `onPress` sont mutuellement exclusifs — " +
          "`href` (navigation) l'emporte.",
      );
    }
    if (onClick) {
      // eslint-disable-next-line no-console
      console.warn(
        isInteractive
          ? "TableRow : `onClick` est déprécié et ignoré quand `href`/`onPress` " +
              "est fourni — n'en garder qu'un."
          : "TableRow : `onClick` est déprécié — préférez `href` (navigation) ou " +
              "`onPress` (action) pour une ligne cliquable accessible au clavier.",
      );
    }
  }

  // Ancre = la TableCell marquée `isRowAnchor`, sinon la première TableCell.
  // On l'injecte par clonage (prop publique → type-safe) quand aucune n'est
  // marquée. Déterministe (pas de compteur de rendu).
  let renderedChildren: ReactNode = children;
  if (isInteractive) {
    const array = Children.toArray(children);
    let firstCell = -1;
    let explicitAnchor = -1;
    let explicitCount = 0;
    array.forEach((child, i) => {
      if (isValidElement(child) && child.type === TableCell) {
        if (firstCell === -1) firstCell = i;
        if ((child.props as TableCellProps).isRowAnchor) {
          explicitCount += 1;
          if (explicitAnchor === -1) explicitAnchor = i;
        }
      }
    });
    const anchorIdx = explicitAnchor !== -1 ? explicitAnchor : firstCell;

    if (process.env.NODE_ENV !== "production") {
      if (anchorIdx === -1) {
        // eslint-disable-next-line no-console
        console.warn(
          "TableRow : `href`/`onPress` posé mais aucune `TableCell` éligible " +
            "comme ancre (ligne vide ou cellule 100 % custom) — la ligne ne " +
            "sera pas activable au clavier.",
        );
      }
      if (explicitCount > 1) {
        // eslint-disable-next-line no-console
        console.warn(
          "TableRow : plusieurs cellules `isRowAnchor` — seule la première " +
            "est utilisée comme ancre.",
        );
      }
    }

    if (anchorIdx !== -1 && explicitAnchor === -1) {
      renderedChildren = array.map((child, i) =>
        i === anchorIdx && isValidElement(child)
          ? cloneElement(child as ReactElement<TableCellProps>, {
              isRowAnchor: true,
            })
          : child,
      );
    }
  }

  // Clic de confort sur la ligne : délègue à l'ancre. Ignore les clics sur un
  // interactif interne (l'ancre elle-même, la checkbox de sélection, un bouton
  // d'action) pour ne pas double-déclencher.
  const handleRowClick: React.MouseEventHandler<HTMLTableRowElement> = (e) => {
    if (
      (e.target as Element).closest(
        'a,button,input,select,textarea,label,[role="menuitem"],[role="checkbox"]',
      )
    ) {
      return;
    }
    e.currentTarget
      .querySelector<HTMLElement>("[data-row-anchor]")
      ?.click();
  };

  return (
    <tr
      className={[styles.row, className].filter(Boolean).join(" ")}
      style={style}
      data-selected={isSelected || undefined}
      data-clickable={isInteractive || onClick ? "true" : undefined}
      aria-selected={isSelected || undefined}
      onClick={isInteractive ? handleRowClick : onClick}
    >
      <RowAnchorContext.Provider value={isInteractive ? { href, onPress } : null}>
        {renderedChildren}
      </RowAnchorContext.Provider>
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
  hideBelow,
  isRowAnchor = false,
}: TableCellProps): ReactElement {
  const mergedStyle: CSSProperties = width !== undefined ? { ...style, width } : (style ?? {});
  const rowAnchor = useContext(RowAnchorContext);

  // Cellule primaire d'une ligne cliquable → son contenu devient le vrai
  // élément focusable. `<a href>` pour la navigation (href l'emporte si les
  // deux sont fournis), sinon `<button>` pour l'action. Hérite du style texte
  // de la cellule (pas d'apparence de lien bleu) ; c'est la ligne l'affordance.
  const asAnchor = isRowAnchor && rowAnchor !== null;
  let content: ReactNode = children;
  if (asAnchor && rowAnchor.href !== undefined) {
    content = (
      <a href={rowAnchor.href} className={styles.rowAnchor} data-row-anchor="">
        {children}
      </a>
    );
  } else if (asAnchor && rowAnchor.onPress !== undefined) {
    content = (
      <button
        type="button"
        className={styles.rowAnchor}
        data-row-anchor=""
        onClick={rowAnchor.onPress}
      >
        {children}
      </button>
    );
  }

  return (
    <td
      className={[styles.cell, className].filter(Boolean).join(" ")}
      style={mergedStyle}
      data-align={align}
      data-hide-below={hideBelow}
      colSpan={colSpan}
    >
      {content}
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
  isActionColumn = false,
  hideBelow,
}: TableHeaderCellProps): ReactElement {
  const mergedStyle: CSSProperties = width !== undefined ? { ...style, width } : (style ?? {});
  // Colonne d'actions : centrée par défaut (l'alignement par défaut "left"
  // n'a pas de sens pour une colonne d'icônes d'action).
  const resolvedAlign: TableAlign =
    isActionColumn && align === "left" ? "center" : align;

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
      data-align={resolvedAlign}
      data-hide-below={hideBelow}
      data-sortable={isSortable || undefined}
      data-sort-direction={isSortable ? sortDirection : undefined}
      aria-sort={ariaSort}
      colSpan={colSpan}
      tabIndex={isSortable ? 0 : undefined}
      role={isSortable ? "columnheader" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isActionColumn ? (
        // Pas de libellé visible, mais un nom accessible (masqué visuellement)
        // — jamais de placeholder vide inaccessible.
        <VisuallyHidden>{children ?? "Actions"}</VisuallyHidden>
      ) : (
        <span className={styles.headerContent}>
          <span className={styles.headerLabel}>{children}</span>
          {isSortable && (
            <span className={styles.headerSortIcon} aria-hidden="true">
              <Icon icon={sortIcon} size={16} />
            </span>
          )}
        </span>
      )}
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
// TableSelectionBar

/**
 * TableSelectionBar — barre d'actions contextuelle affichée au-dessus du
 * tableau quand des lignes sont sélectionnées (« N lignes sélectionnées » +
 * actions groupées). Ne rend rien quand `count` vaut 0.
 *
 * ```tsx
 * <Table.SelectionBar count={selected.size} onClear={() => setSelected(new Set())}>
 *   <Button appearance="subtle" iconBefore="Delete">Supprimer</Button>
 * </Table.SelectionBar>
 * <Table aria-label="…">…</Table>
 * ```
 */
export function TableSelectionBar({
  count,
  children,
  onClear,
  label,
  className,
  style,
}: TableSelectionBarProps): ReactElement | null {
  if (count <= 0) return null;

  const text = label
    ? label(count)
    : `${count} ligne${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""}`;

  return (
    <div
      className={[styles.selectionBar, className].filter(Boolean).join(" ")}
      style={style}
      role="region"
      aria-label="Actions de sélection"
    >
      {/* aria-live : le changement du nombre de lignes sélectionnées est
          annoncé aux lecteurs d'écran. */}
      <span className={styles.selectionBarCount} aria-live="polite">
        {text}
      </span>
      {(onClear || children) && (
        <div className={styles.selectionBarActions}>
          {onClear && (
            <Button appearance="subtle" onPress={onClear}>
              Tout désélectionner
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

TableSelectionBar.displayName = "TableSelectionBar";

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
  /** Barre d'actions contextuelle « N lignes sélectionnées ». */
  SelectionBar: typeof TableSelectionBar;
}

export const Table: TableComponent = Object.assign(TableRoot, {
  View: TableView,
  SelectionBar: TableSelectionBar,
});
