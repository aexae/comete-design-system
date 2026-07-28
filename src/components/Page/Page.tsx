// Page — Comète Design System
// Gabarit de page : wrapper structurel + sous-composants pour le header,
// la toolbar et le body. S'appuie sur le Figma "❖ Page header" et sur la
// décomposition de la vue Page layout (node 4319:15827).
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Skeleton } from "../Skeleton/index.js";
import { DataStateMessage } from "../_states/DataStateMessage.js";
import styles from "./Page.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface PageProps {
  /** Sections de la page (typiquement Page.Bar / Page.Toolbar / Page.Body). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Style inline additionnel. */
  style?: CSSProperties;
}

/**
 * Variante d'affichage de la `Page.Bar`.
 * - `large` — titre proéminent (32px), pour desktop/tablette.
 * - `compact` — barre de 56px épinglée en haut (sticky), titre tronqué.
 *
 * Omise, la variante est **responsive** : compact sous 768px, large au-dessus.
 * Les écrans consommateurs ne devraient normalement pas la forcer.
 */
export type PageBarSize = "large" | "compact";

export interface PageBarProps {
  /**
   * Titre principal de la page (rendu dans un `<h1>`).
   * Peut être un string ou du JSX pour des titres composés.
   */
  title: ReactNode;
  /**
   * Zone unique à gauche du titre. Une seule affordance de navigation à la
   * fois (jamais deux) :
   * - **page racine** → menu hamburger (typiquement `<SideNav.Trigger />`) ;
   * - **page de détail** → bouton retour, qui *remplace* le hamburger.
   *
   * La visibilité du hamburger est **pilotée par l'app** : elle ne le rend que
   * lorsque la SideNav est repliée (elle gère déjà cet état via son propre
   * breakpoint). Sur desktop, SideNav persistante ⇒ pas de hamburger ici.
   */
  leading?: ReactNode;
  /**
   * Zone d'actions globales alignée à droite du titre : notifications,
   * réglages, avatar utilisateur. Reste visible grâce au `flex-shrink: 0`.
   */
  trailing?: ReactNode;
  /**
   * Force la variante d'affichage. Par défaut (omise), la variante est choisie
   * automatiquement selon le breakpoint (compact < 768px, large ≥ 768px).
   */
  size?: PageBarSize;
  /** Classe CSS additionnelle. */
  className?: string;
}

export interface PageHeaderProps {
  /**
   * Titre principal de la page (rendu dans un `<h1>`).
   * Peut être un string ou du JSX pour des titres composés.
   */
  title: ReactNode;
  /**
   * Zone alignée à gauche du titre. Typiquement utilisée pour héberger
   * un `<SideNav.Trigger />` discret quand la SideNav est cachée.
   */
  leading?: ReactNode;
  /**
   * Zone d'actions alignée à droite du titre (avatar utilisateur,
   * boutons d'action rapides, menu "…"). Sur mobile, reste visible à
   * droite du titre grâce au `flex-shrink: 0`.
   */
  trailing?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

export interface PageToolbarProps {
  /**
   * Zone de contrôles à gauche (recherche, filtres, segment de tabs,
   * compteurs). Les enfants wrap si la largeur est insuffisante.
   */
  start?: ReactNode;
  /**
   * Zone d'actions à droite (boutons primaires, ButtonGroup, menu "…").
   * Repoussée via `margin-left: auto` tant que les deux zones tiennent
   * sur une ligne.
   */
  end?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

export interface PageBodyProps {
  /** Contenu principal de la page. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /**
   * Affiche un squelette de contenu (skeleton) à la place des enfants.
   * Priorité : `error` > `isLoading` > `isEmpty` > `children`.
   */
  isLoading?: boolean;
  /** Affiche l'état vide (aucune donnée) à la place des enfants. */
  isEmpty?: boolean;
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
  /** Slot pour remplacer entièrement le contenu de l'état d'erreur. */
  errorState?: ReactNode;
}

// -----------------------------------------------------------------------
// Composant principal

/**
 * Page — Comète Design System
 *
 * Gabarit de page : container flex vertical qui compose un `Page.Header`,
 * un `Page.Toolbar` optionnel et un `Page.Body` extensible. S'utilise
 * typiquement dans le slot principal d'une AppShell.
 *
 * ```tsx
 * import { Page, Button } from "@aexae/comete-design-system";
 *
 * <Page>
 *   <Page.Header
 *     title="Agents"
 *     trailing={<UserAvatar />}
 *   />
 *   <Page.Toolbar
 *     start={<><SearchField /><Button>Filtres</Button></>}
 *     end={<Button appearance="contained" color="brand">Nouvel agent</Button>}
 *   />
 *   <Page.Body>
 *     {/* Liste, tableau, formulaire… *\/}
 *   </Page.Body>
 * </Page>
 * ```
 */
export function Page({ children, className, style }: PageProps): ReactElement {
  const classNames = [styles.page, className].filter(Boolean).join(" ");
  return <div className={classNames} style={style}>{children}</div>;
}

Page.displayName = "Page";

// -----------------------------------------------------------------------
// Page.Bar

/**
 * Page.Bar — barre de page unifiée (fusion de TopNav + Page.Header).
 *
 * Trois zones : `leading` (une seule affordance nav — hamburger OU retour),
 * `title` (obligatoire, rendu en `<h1>`) et `trailing` (actions globales :
 * notifications, réglages, avatar).
 *
 * Le titre est **responsive** selon la largeur de la Page (via `@container`),
 * sans que le consommateur ne passe `size` : `compact` (barre 56px épinglée,
 * titre tronqué) sous 768px, `large` (titre 32px) au-dessus. `size` permet de
 * forcer une variante si besoin.
 *
 * ```tsx
 * <Page>
 *   <Page.Bar
 *     title="Accueil"
 *     leading={<SideNav.Trigger />}
 *     trailing={
 *       <>
 *         <Button appearance="subtle" iconBefore="Notifications" aria-label="Notifications" />
 *         <Button appearance="subtle" iconBefore="Settings" aria-label="Réglages" />
 *         <Avatar size="medium" initials="AC" />
 *       </>
 *     }
 *   />
 *   <Page.Toolbar start={<SearchField />} end={<Button color="brand">Nouveau</Button>} />
 *   <Page.Body>…</Page.Body>
 * </Page>
 * ```
 */
function PageBar({
  title,
  leading,
  trailing,
  size,
  className,
}: PageBarProps): ReactElement {
  const sizeClass =
    size === "large" ? styles.large : size === "compact" ? styles.compact : undefined;
  const classNames = [styles.bar, sizeClass, className].filter(Boolean).join(" ");
  return (
    <header className={classNames}>
      {leading !== undefined && <div className={styles.leading}>{leading}</div>}
      <h1 className={styles.barTitle}>{title}</h1>
      {trailing !== undefined && (
        <div className={styles.trailing}>{trailing}</div>
      )}
    </header>
  );
}

PageBar.displayName = "Page.Bar";

// -----------------------------------------------------------------------
// Page.Header

/**
 * Page.Header — titre de page et actions trailing.
 * Le titre est rendu dans un `<h1>` pour la hiérarchie sémantique.
 *
 * @deprecated Utiliser `Page.Bar` (fusion de TopNav + Page.Header). `Page.Header`
 * reste disponible pour rétro-compatibilité mais sera retiré dans une version
 * ultérieure.
 */
function PageHeader({
  title,
  leading,
  trailing,
  className,
}: PageHeaderProps): ReactElement {
  const classNames = [styles.header, className].filter(Boolean).join(" ");
  return (
    <header className={classNames}>
      <div className={styles.titleRow}>
        {leading !== undefined && (
          <div className={styles.leading}>{leading}</div>
        )}
        <h1 className={styles.title}>{title}</h1>
        {trailing !== undefined && (
          <div className={styles.trailing}>{trailing}</div>
        )}
      </div>
    </header>
  );
}

PageHeader.displayName = "Page.Header";

// -----------------------------------------------------------------------
// Page.Toolbar

/**
 * Page.Toolbar — ligne d'outils de page (recherche, filtres, actions).
 * `start` est poussé à gauche, `end` aligné à droite.
 */
function PageToolbar({
  start,
  end,
  className,
}: PageToolbarProps): ReactElement {
  const classNames = [styles.toolbar, className].filter(Boolean).join(" ");
  return (
    <div className={classNames}>
      {start !== undefined && (
        <div className={styles.toolbarStart}>{start}</div>
      )}
      {end !== undefined && <div className={styles.toolbarEnd}>{end}</div>}
    </div>
  );
}

PageToolbar.displayName = "Page.Toolbar";

// -----------------------------------------------------------------------
// Page.Body

/**
 * Page.Body — contenu principal de la page. Occupe tout l'espace vertical
 * restant et devient scrollable si nécessaire.
 */
function PageBody({
  children,
  className,
  isLoading = false,
  isEmpty = false,
  error = false,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyState,
  errorState,
}: PageBodyProps): ReactElement {
  const classNames = [styles.body, className].filter(Boolean).join(" ");

  // Priorité : erreur > chargement > vide > contenu.
  let content: ReactNode;
  if (error) {
    content = (
      <div className={styles.bodyState}>
        {errorState ?? (
          <DataStateMessage
            kind="error"
            description={typeof error === "string" ? error : undefined}
            onRetry={onRetry}
          />
        )}
      </div>
    );
  } else if (isLoading) {
    content = (
      <div className={styles.bodySkeleton} role="status" aria-label="Chargement…">
        <Skeleton height={28} width={240} radius={4} aria-label="" />
        <Skeleton height={180} radius={8} aria-label="" />
        <Skeleton height={180} radius={8} aria-label="" />
      </div>
    );
  } else if (isEmpty) {
    content = (
      <div className={styles.bodyState}>
        {emptyState ?? (
          <DataStateMessage
            kind="empty"
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </div>
    );
  } else {
    content = children;
  }

  return <main className={classNames}>{content}</main>;
}

PageBody.displayName = "Page.Body";

Page.Bar = PageBar;
Page.Header = PageHeader;
Page.Toolbar = PageToolbar;
Page.Body = PageBody;
