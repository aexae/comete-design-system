// List — Comète Design System
// Liste verticale composable (style MUI). Le composant `List` est une simple
// coquille `<ul>` ; le contenu réel est porté par les sous-composants
// (`ListItem`, `ListItemButton`, `ListHead`, `ListItemIcon`,
// `ListItemText`, `ListItemAvatar`, `ListItemSecondaryAction`). Seul
// `ListItemButton` introduit une affordance cliquable (React Aria Button).
import { Children, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import styles from "./List.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface ListProps {
  /**
   * Densité de la liste. `dense` réduit le padding vertical des items —
   * pratique pour des listes denses (paramètres, résultats de recherche).
   * @default false
   */
  isDense?: boolean;
  /**
   * Encadre la liste d'une bordure subtle + border-radius. Utile en
   * autonome (paramètres, cards) ; à désactiver quand la List est déjà
   * intégrée dans un container qui porte sa propre bordure (Card, Menu…).
   * @default false
   */
  isBordered?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Enfants : `ListHead`, `ListItem`, `ListItemButton`. */
  children: ReactNode;
  /** Label accessible de la liste (utile quand il n'y a pas de `ListHead`). */
  "aria-label"?: string;
  /** ID d'un élément qui labellise la liste. */
  "aria-labelledby"?: string;
}

export interface ListHeadProps {
  /** Texte du sous-titre de section. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface ListItemProps {
  /**
   * Marque l'item comme sélectionné (état visuel). N'a aucun effet
   * d'interaction — pour un item cliquable utiliser `ListItemButton`.
   * @default false
   */
  isSelected?: boolean;
  /** Désactive visuellement l'item. @default false */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Contenu de l'item (en général : `ListItemIcon`/`ListItemAvatar` +
   *  `ListItemText` + actions à droite). */
  children: ReactNode;
}

export interface ListItemButtonProps
  extends Omit<AriaButtonProps, "className" | "style" | "children"> {
  /** Marque l'item comme sélectionné (état visuel + `aria-current`). */
  isSelected?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Contenu de l'item — typiquement icône + texte. */
  children: ReactNode;
}

export interface ListItemIconProps {
  /** Icône à afficher (typiquement un `<Icon>`). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface ListItemTextProps {
  /**
   * Texte principal. Si omis, on peut passer le contenu via `children`
   * pour un format libre (paragraphes, badges, etc.).
   */
  primary?: ReactNode;
  /** Texte secondaire (description), affiché plus petit et en couleur sourde. */
  secondary?: ReactNode;
  /**
   * Autorise le texte à passer à la ligne au lieu de tronquer à l'ellipse.
   * Utile pour les listes avec descriptions longues (3-line layout MUI).
   * @default false
   */
  wrap?: boolean;
  /** Alternative à `primary` pour un contenu libre. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface ListItemAvatarProps {
  /** Avatar à afficher (typiquement un `<Avatar>`). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface ListItemSecondaryActionProps {
  /**
   * Action(s) affichée(s) à droite de l'item (Button, Checkbox, Switch…).
   * Positionnée en absolute pour ne pas dépendre du flex du parent et
   * pour être extraite du contenu cliquable de `ListItemButton`.
   */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Composant principal

/**
 * List — Comète Design System
 *
 * Liste verticale composable. La sémantique HTML est un `<ul>` ;
 * chaque `ListItem`/`ListItemButton`/`ListHead` rend un `<li>`.
 *
 * ```tsx
 * <List aria-label="Notifications">
 *   <ListHead>Aujourd'hui</ListHead>
 *   <ListItem>
 *     <ListItemIcon><Icon icon="Notifications" /></ListItemIcon>
 *     <ListItemText primary="Message reçu" secondary="il y a 5 min" />
 *   </ListItem>
 *   <ListItemButton onPress={() => navigate("/settings")}>
 *     <ListItemIcon><Icon icon="Settings" /></ListItemIcon>
 *     <ListItemText primary="Paramètres" />
 *   </ListItemButton>
 * </List>
 * ```
 */
export function List({
  isDense = false,
  isBordered = false,
  className,
  style,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: ListProps): ReactElement {
  return (
    <ul
      className={[styles.list, className].filter(Boolean).join(" ")}
      style={style}
      data-dense={isDense || undefined}
      data-bordered={isBordered || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </ul>
  );
}

List.displayName = "List";

// -----------------------------------------------------------------------
// ListHead — sous-titre de section

/**
 * ListHead — en-tête de section dans une `List`.
 *
 * Rendu en `<li role="presentation">` pour ne pas casser la sémantique
 * de liste (les lecteurs d'écran annoncent les items adjacents, pas le
 * head lui-même).
 */
export function ListHead({
  children,
  className,
  style,
}: ListHeadProps): ReactElement {
  return (
    <li
      className={[styles.head, className].filter(Boolean).join(" ")}
      style={style}
      role="presentation"
    >
      {children}
    </li>
  );
}

ListHead.displayName = "ListHead";

// -----------------------------------------------------------------------
// ListItem — item non-interactif

/**
 * ListItem — un item de liste statique (non-cliquable).
 *
 * Pour un item interactif (clic, sélection), utiliser `ListItemButton`.
 */
export function ListItem({
  isSelected = false,
  isDisabled = false,
  className,
  style,
  children,
}: ListItemProps): ReactElement {
  return (
    <li
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={style}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      aria-current={isSelected ? "true" : undefined}
    >
      {children}
    </li>
  );
}

ListItem.displayName = "ListItem";

// -----------------------------------------------------------------------
// Helper interne — sépare `<ListItemSecondaryAction>` du reste des enfants
// pour pouvoir le rendre HORS du `<button>` de `ListItemButton`. Éviter les
// éléments interactifs imbriqués (Switch/Checkbox à l'intérieur d'un button).

function splitSecondaryAction(children: ReactNode): {
  main: ReactNode[];
  secondary: ReactElement | null;
} {
  const main: ReactNode[] = [];
  let secondary: ReactElement | null = null;
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === ListItemSecondaryAction) {
      secondary = child;
    } else {
      main.push(child);
    }
  });
  return { main, secondary };
}

// -----------------------------------------------------------------------
// ListItemButton — item interactif

/**
 * ListItemButton — un item de liste cliquable, géré via React Aria
 * (`Button` de `react-aria-components`).
 *
 * Pourquoi `<button>` plutôt que `<a>` ? Pour un comportement uniforme
 * en SPA. Si le besoin d'un lien `href` apparaît, on peut étendre la
 * prop pour rendre un `<a>` quand `href` est défini (à la `Button`).
 */
export function ListItemButton({
  isSelected = false,
  className,
  style,
  children,
  ...ariaProps
}: ListItemButtonProps): ReactElement {
  // Sépare une éventuelle `<ListItemSecondaryAction>` du contenu principal
  // afin de la rendre en sœur du `<button>` — sinon un Switch/Checkbox
  // dans l'action déclencherait aussi l'onPress du bouton parent.
  const { main, secondary } = splitSecondaryAction(children);
  return (
    <li className={styles.itemButtonWrapper}>
      <AriaButton
        {...ariaProps}
        className={[styles.item, styles.itemButton, className]
          .filter(Boolean)
          .join(" ")}
        style={style}
        data-selected={isSelected || undefined}
        aria-current={isSelected ? "true" : undefined}
      >
        {main}
      </AriaButton>
      {secondary}
    </li>
  );
}

ListItemButton.displayName = "ListItemButton";

// -----------------------------------------------------------------------
// ListItemIcon — wrapper d'icône

/**
 * ListItemIcon — slot d'icône au début d'un item.
 *
 * Largeur minimale fixe (32px) pour aligner verticalement les textes
 * sur plusieurs items, qu'ils aient ou non une icône de tailles
 * différentes.
 */
export function ListItemIcon({
  children,
  className,
  style,
}: ListItemIconProps): ReactElement {
  return (
    <span
      className={[styles.itemIcon, className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

ListItemIcon.displayName = "ListItemIcon";

// -----------------------------------------------------------------------
// ListItemText — slot texte (primary + secondary)

/**
 * ListItemText — slot texte d'un item. Affiche `primary` en couleur
 * `text-default` et `secondary` en couleur `text-subtle` plus petit.
 *
 * Alternative : utiliser `children` pour un contenu libre.
 */
export function ListItemText({
  primary,
  secondary,
  wrap = false,
  children,
  className,
  style,
}: ListItemTextProps): ReactElement {
  return (
    <span
      className={[styles.itemText, className].filter(Boolean).join(" ")}
      style={style}
      data-wrap={wrap || undefined}
    >
      {primary !== undefined && (
        <span className={styles.itemTextPrimary}>{primary}</span>
      )}
      {secondary !== undefined && (
        <span className={styles.itemTextSecondary}>{secondary}</span>
      )}
      {children}
    </span>
  );
}

ListItemText.displayName = "ListItemText";

// -----------------------------------------------------------------------
// ListItemAvatar — wrapper d'avatar

/**
 * ListItemAvatar — slot avatar au début d'un item. Largeur fixe pour
 * aligner les textes sur plusieurs items.
 */
export function ListItemAvatar({
  children,
  className,
  style,
}: ListItemAvatarProps): ReactElement {
  return (
    <span
      className={[styles.itemAvatar, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </span>
  );
}

ListItemAvatar.displayName = "ListItemAvatar";

// -----------------------------------------------------------------------
// ListItemSecondaryAction — action à droite (Button, Switch, Checkbox…)

/**
 * ListItemSecondaryAction — slot d'action à droite d'un item.
 *
 * Positionnée en `position: absolute` par rapport au `<li>` parent pour :
 * (1) ne pas dépendre du flow flex de l'item ;
 * (2) permettre à `ListItemButton` de l'extraire du contenu cliquable
 *     (rendue en sœur du `<button>` plutôt qu'à l'intérieur) — évite
 *     l'imbrication d'éléments interactifs (Switch/Checkbox → Button).
 *
 * ```tsx
 * <ListItemButton onPress={openSettings}>
 *   <ListItemIcon><Icon icon="Notifications" /></ListItemIcon>
 *   <ListItemText primary="Notifications" />
 *   <ListItemSecondaryAction>
 *     <Switch isSelected onChange={toggle} />
 *   </ListItemSecondaryAction>
 * </ListItemButton>
 * ```
 */
export function ListItemSecondaryAction({
  children,
  className,
  style,
}: ListItemSecondaryActionProps): ReactElement {
  return (
    <span
      className={[styles.itemSecondaryAction, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </span>
  );
}

ListItemSecondaryAction.displayName = "ListItemSecondaryAction";
