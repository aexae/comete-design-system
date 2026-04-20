// Page — Comète Design System
// Gabarit de page : wrapper structurel + sous-composants pour le header,
// la toolbar et le body. S'appuie sur le Figma "❖ Page header" et sur la
// décomposition de la vue Page layout (node 4319:15827).
import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./Page.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface PageProps {
  /** Sections de la page (typiquement Page.Header / Page.Toolbar / Page.Body). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Style inline additionnel. */
  style?: CSSProperties;
}

export interface PageHeaderProps {
  /**
   * Titre principal de la page (rendu dans un `<h1>`).
   * Peut être un string ou du JSX pour des titres composés.
   */
  title: ReactNode;
  /**
   * Zone optionnelle affichée au-dessus du titre (breadcrumbs, fil
   * d'ariane, indicateurs…). Ne porte aucune marge : le PageHeader gère
   * l'espacement vertical.
   */
  breadcrumbs?: ReactNode;
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
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
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
 * import { Page, Button, Breadcrumbs } from "@naxit/comete-design-system";
 *
 * <Page>
 *   <Page.Header
 *     title="Agents"
 *     breadcrumbs={<Breadcrumbs>...</Breadcrumbs>}
 *     trailing={<UserAvatar />}
 *   />
 *   <Page.Toolbar
 *     start={<><SearchField /><Button>Filtres</Button></>}
 *     end={<Button appearance="primary">Nouvel agent</Button>}
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
// Page.Header

/**
 * Page.Header — titre de page, breadcrumbs optionnels et actions trailing.
 * Le titre est rendu dans un `<h1>` pour la hiérarchie sémantique.
 */
function PageHeader({
  title,
  breadcrumbs,
  trailing,
  className,
}: PageHeaderProps): ReactElement {
  const classNames = [styles.header, className].filter(Boolean).join(" ");
  return (
    <header className={classNames}>
      {breadcrumbs !== undefined && (
        <div className={styles.breadcrumbs}>{breadcrumbs}</div>
      )}
      <div className={styles.titleRow}>
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
function PageBody({ children, className }: PageBodyProps): ReactElement {
  const classNames = [styles.body, className].filter(Boolean).join(" ");
  return <main className={classNames}>{children}</main>;
}

PageBody.displayName = "Page.Body";

Page.Header = PageHeader;
Page.Toolbar = PageToolbar;
Page.Body = PageBody;
