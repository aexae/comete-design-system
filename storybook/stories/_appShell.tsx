// Coquille applicative "Main Courante" partagée par les stories SideNav.
// Reproduit le template réel de l'app : SideNav permanente pleine hauteur (marque
// Pro Sécurité + slot de navigation + footer comète link) à gauche, et la Page
// (Page.Bar "Accueil" + contenu de Layout/Page) à droite. Fichier NON indexé par Storybook (pas
// de suffixe .stories).
import { useState, type ReactNode } from "react";
import {
  SideNav,
  Page,
  Logo,
  SectionMessage,
  Grid,
  Card,
  useSideNav,
  type SideNavMode,
} from "@aexae/comete-design-system/components";

function FooterLogo() {
  const { mode } = useSideNav();
  const isRail = mode === "rail";
  return (
    <Logo
      size={isRail ? 24 : 14}
      product="link"
      appearance="neutral"
      format={isRail ? "icon" : "logo"}
    />
  );
}

/** Sections de navigation réelles (Manager / MCE / Administration). */
export function MainCouranteNav() {
  return (
    <>
      <SideNav.Section title="Manager">
        <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
        <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
        <SideNav.Item label="Sites" iconBefore="Site" href="/sites" />
        <SideNav.Item label="Pointages" iconBefore="Clockings" href="/pointages" isDisabled />
      </SideNav.Section>
      <SideNav.Divider />
      <SideNav.Section title="MCE">
        <SideNav.Item label="MCE" iconBefore="MenuBook" href="/mce" />
        <SideNav.Item label="Formulaires" iconBefore="FormEdit" href="/forms" />
      </SideNav.Section>
      <SideNav.Divider />
      <SideNav.Section title="Administration">
        <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
        <SideNav.Item label="Droits" iconBefore="ManageAccounts" href="/permissions" />
        <SideNav.Item label="Licences" iconBefore="Key" href="/licences" />
      </SideNav.Section>
    </>
  );
}

/**
 * Contenu de page de démonstration — repris de `Layout/Page › Default` (message
 * d'accueil + grille de cartes) : de quoi VOIR que la nav pousse le contenu
 * (tablette / desktop) ou passe par-dessus (Drawer, mobile web). À placer dans
 * un `Page`, sous une `Page.Bar`.
 */
export function DemoPageContent({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <Page.Body isLoading={isLoading}>
      <SectionMessage appearance="information" style={{ marginBottom: 16 }}>
        Message d&apos;accueil (texte par défaut)
      </SectionMessage>
      <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
        {Array.from({ length: 9 }, (_, i) => (
          <Grid.Col key={i}>
            <Card appearance="outlined">
              <div style={{ padding: "var(--space200)" }}>
                <strong>Agent {i + 1}</strong>
                <p style={{ margin: "var(--space100) 0 0" }}>Description courte</p>
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Page.Body>
  );
}

export interface MainCouranteShellProps {
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
  /** Titre de la `Page.Bar`. @default "Accueil" */
  title?: string;
}

/**
 * Template applicatif "Main Courante" : `Page.Bar` pleine largeur + SideNav
 * permanente (marque + `nav` + footer) + contenu. `nav` remplit le corps de la
 * navigation — on y branche les sections réelles, un skeleton ou un état vide.
 */
export function MainCouranteShell({
  nav,
  isPageLoading = false,
  body = <DemoPageContent isLoading={isPageLoading} />,
  mode = "expanded",
  logo = <Logo product="cafe" format="icon" />,
  header,
  footer,
  title = "Accueil",
}: MainCouranteShellProps) {
  const [current, setCurrent] = useState<SideNavMode>(mode);
  return (
    <SideNav.Provider mode={current} onModeChange={setCurrent}>
      {/* La SideNav occupe toute la hauteur de la page ; la Page (Bar + contenu)
          prend le reste et défile seule. */}
      <div style={{ display: "flex", height: "100vh" }}>
        <SideNav>
          {header ?? (
            <SideNav.Header
              logo={logo}
              companyName="Pro Sécurité"
              description="Main Courante"
            />
          )}
          {nav}
          {footer ?? (
            <SideNav.Footer>
              <SideNav.FooterBrand>
                <FooterLogo />
              </SideNav.FooterBrand>
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
