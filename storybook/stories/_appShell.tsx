// Coquille applicative "Main Courante" partagée par les stories SideNav.
// Reproduit le template réel de l'app : Page.Header "Accueil" + trigger,
// SideNav (marque Pro Sécurité + slot de navigation + footer comète link) et
// Page.Body. Fichier NON indexé par Storybook (pas de suffixe .stories).
import { useState, type ReactNode } from "react";
import {
  SideNav,
  Page,
  Logo,
  useSideNav,
} from "@aexae/comete-design-system/components";

function FooterLogo() {
  const { isCollapsed } = useSideNav();
  return (
    <Logo
      size={isCollapsed ? 24 : 14}
      product="link"
      appearance="neutral"
      format={isCollapsed ? "icon" : "logo"}
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

export interface MainCouranteShellProps {
  /** Corps de la navigation (sections réelles, skeleton ou état vide). */
  nav: ReactNode;
  /** Contenu principal de la page. */
  body?: ReactNode;
  /** SideNav repliée au départ. @default false */
  initialCollapsed?: boolean;
  /** Logo de marque passé à `SideNav.Header` (défaut : logo icône Comète). */
  logo?: ReactNode;
}

/**
 * Template applicatif "Main Courante" : header pleine largeur + SideNav
 * (marque + `nav` + footer) + contenu. `nav` remplit le corps de la
 * navigation — on y branche les sections réelles, un skeleton ou un état vide.
 */
export function MainCouranteShell({
  nav,
  body = <p>Contenu principal</p>,
  initialCollapsed = false,
  logo = <Logo product="cafe" format="icon" />,
}: MainCouranteShellProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  return (
    <SideNav.Provider isCollapsed={collapsed} onCollapsedChange={setCollapsed}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "var(--black-4)",
        }}
      >
        {/* Header pleine largeur — jamais recouvert par la nav */}
        <Page.Header title="Accueil" leading={<SideNav.Trigger />} />

        {/* Zone sous le header : SideNav + contenu côte à côte */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
          <SideNav>
            <SideNav.Header
              logo={logo}
              companyName="Pro Sécurité"
              description="Main Courante"
            />
            {nav}
            <SideNav.Footer>
              <FooterLogo />
            </SideNav.Footer>
          </SideNav>
          <Page.Body>{body}</Page.Body>
        </div>
      </div>
    </SideNav.Provider>
  );
}
