// Coquille applicative partagée par les stories SideNav.
// Reproduit le template réel de l'app : SideNav permanente pleine hauteur (marque
// Pro Sécurité + slot de navigation + footer comète link) à gauche, et la Page
// (Page.Bar "Tableau de bord" + contenu de Layout/Page) à droite. Fichier NON indexé par Storybook (pas
// de suffixe .stories).
import { cloneElement, isValidElement, useState, type ReactNode } from "react";
import {
  SideNav,
  Page,
  Logo,
  type SideNavMode,
} from "@aexae/comete-design-system/components";

/** Pied de marque Link de la coquille : le composant bascule logo / icône selon le mode. */
export function AppFooterBrand() {
  return (
    <SideNav.FooterBrand rail={<Logo size={16} product="link" appearance="neutral" format="icon" />}>
      <Logo size={10} product="link" appearance="neutral" format="logo" />
    </SideNav.FooterBrand>
  );
}

/** Sous-titre de l'en-tête : l'espace de l'app (ici manager), jamais un titre de section. */
export const APP_SPACE_LABEL = "Espace manager";

/**
 * Navigation réelle de l'espace manager (cf. `navConfig` de la webapp) : tableau de bord,
 * agents, sites, pointages. Le nom de l'espace se lit dans l'en-tête (`APP_SPACE_LABEL`). La MCE n'y figure pas : c'est un autre produit.
 */
export function AppNav() {
  return (
    <SideNav.Section>
      <SideNav.Item label="Tableau de bord" iconBefore="Dashboard" isSelected href="/" />
      <SideNav.Item label="Agents" iconBefore="Group" href="/agents" />
      <SideNav.Item label="Sites" iconBefore="Site" href="/sites" />
      <SideNav.Item label="Pointages" iconBefore="Clockings" href="/pointages" />
    </SideNav.Section>
  );
}

/**
 * Contenu de page NEUTRE, pour les stories de la SideNav elle-même : une page
 * vide, sur fond neutre. Un contenu réaliste (cartes, messages) attire l'œil et
 * rend la nav illisible comme sujet ; ici la seule chose qui se voit, c'est
 * la navigation et la place qu'elle prend (elle pousse le contenu ≥ 1200 px,
 * passe par-dessus en Drawer en dessous). À placer dans un `Page`, sous une
 * `Page.Bar`.
 */
export function DemoPageContent({ isLoading = false }: { isLoading?: boolean }) {
  return <Page.Body isLoading={isLoading} />;
}

/** Classe posée sur l'en-tête ou le pied masqués par `SideNavOnly focus`. */
const FOCUS_HIDDEN = "sb-sidenav-focus-hidden";

/**
 * La SideNav SEULE, pour les stories d'un de ses sous-composants.
 *
 * La navigation est montrée entière — marque, corps, pied — parce qu'une
 * pièce de nav se juge dans la nav : l'alignement des icônes, la largeur
 * utile, le rythme vertical ne se voient qu'en contexte.
 *
 * Ce qui disparaît est la PAGE : `Page.Bar` et contenu de démonstration
 * n'apprennent rien sur un `SideNav.Item` et occupent les trois quarts de la
 * vignette. Le gabarit applicatif complet (`AppShell`) reste pour
 * les stories de la SideNav elle-même.
 */
export function SideNavOnly({
  nav,
  mode = "expanded",
  logo = <Logo product="cafe" format="icon" />,
  header,
  footer,
  height,
  focus,
}: {
  /** Corps de la navigation. */
  nav: ReactNode;
  mode?: SideNavMode;
  logo?: ReactNode;
  /** En-tête personnalisé (remplace `SideNav.Header`). */
  header?: ReactNode;
  /** Pied personnalisé (remplace le `SideNav.Footer` par défaut). */
  footer?: ReactNode;
  /** Hauteur du cadre. @default "100vh" */
  height?: string | number;
  /**
   * Ne rend visible QUE cette partie de la nav : les deux autres sont masquées
   * (`visibility: hidden`) mais gardent leur place. La nav conserve donc toute sa hauteur
   * et la partie montrée reste à son emplacement réel (en-tête en haut, pied en bas, corps
   * entre les deux) : on identifie où elle se trouve.
   */
  focus?: "header" | "body" | "footer";
}) {
  const [current, setCurrent] = useState<SideNavMode>(mode);
  // `SideNav` range ses enfants par TYPE (Header, Footer, le reste) : on ne peut donc pas les
  // envelopper. Header et Footer reçoivent une classe qui les masque ; le corps, un conteneur
  // `display: contents` (qui n'ajoute aucune boîte) en `visibility: hidden`.
  const maskUnless = (part: "header" | "footer", el: ReactNode) =>
    focus && focus !== part && isValidElement<{ className?: string }>(el)
      ? cloneElement(el, { className: [el.props.className, FOCUS_HIDDEN].filter(Boolean).join(" ") })
      : el;
  return (
    <SideNav.Provider mode={current} onModeChange={setCurrent}>
      <div style={{ display: "flex", height: height ?? "100vh" }}>
        {focus && <style>{`.${FOCUS_HIDDEN} { visibility: hidden; }`}</style>}
        <SideNav>
          {maskUnless(
            "header",
            header ?? (
              <SideNav.Header
                logo={logo}
                companyName="Pro Sécurité"
                description={APP_SPACE_LABEL}
              />
            ),
          )}
          {focus && focus !== "body" ? (
            <div style={{ display: "contents", visibility: "hidden" }}>{nav}</div>
          ) : (
            nav
          )}
          {maskUnless(
            "footer",
            footer ?? (
              <SideNav.Footer>
                <AppFooterBrand />
              </SideNav.Footer>
            ),
          )}
        </SideNav>
      </div>
    </SideNav.Provider>
  );
}

export interface AppShellProps {
  /** Corps de la navigation (sections réelles, skeleton ou état vide). */
  nav: ReactNode;
  /** Contenu principal de la page. @default <DemoPageContent /> */
  body?: ReactNode;
  /** Affiche le squelette de chargement dans le contenu par défaut (ignoré si `body` est fourni). */
  isPageLoading?: boolean;
  /** Mode initial de la navigation. @default "expanded" */
  mode?: SideNavMode;
  /** Logo de marque passé à `SideNav.Header` (défaut : logo icône Comète). */
  logo?: ReactNode;
  /** En-tête de nav personnalisé (remplace `SideNav.Header`). */
  header?: ReactNode;
  /** Pied de nav personnalisé (remplace le `SideNav.Footer` par défaut). */
  footer?: ReactNode;
  /** Titre de la `Page.Bar`. @default "Tableau de bord" */
  title?: string;
  /**
   * Hauteur du gabarit. @default "100vh"
   *
   * À borner pour une story qui doit montrer le défilement interne de la
   * nav : à pleine hauteur de fenêtre, un grand écran affiche tout le
   * contenu et l'ascenseur ne paraît jamais.
   */
  height?: string | number;
}

/**
 * Template applicatif : `Page.Bar` pleine largeur + SideNav
 * permanente (marque + `nav` + footer) + contenu. `nav` remplit le corps de la
 * navigation — on y branche les sections réelles, un skeleton ou un état vide.
 */
export function AppShell({
  nav,
  isPageLoading = false,
  body = <DemoPageContent isLoading={isPageLoading} />,
  mode = "expanded",
  logo = <Logo product="cafe" format="icon" />,
  header,
  footer,
  title = "Tableau de bord",
  height = "100vh",
}: AppShellProps) {
  const [current, setCurrent] = useState<SideNavMode>(mode);
  return (
    <SideNav.Provider mode={current} onModeChange={setCurrent}>
      {/* La SideNav occupe toute la hauteur de la page ; la Page (Bar + contenu)
          prend le reste et défile seule. */}
      <div style={{ display: "flex", height }}>
        <SideNav>
          {header ?? (
            <SideNav.Header
              logo={logo}
              companyName="Pro Sécurité"
              description={APP_SPACE_LABEL}
            />
          )}
          {nav}
          {footer ?? (
            <SideNav.Footer>
              <AppFooterBrand />
            </SideNav.Footer>
          )}
        </SideNav>
        <Page globalActions={null} style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Page.Bar title={title} />
          {body}
        </Page>
      </div>
    </SideNav.Provider>
  );
}
