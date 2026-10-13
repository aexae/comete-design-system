// Coquille applicative "Main Courante" partagée par les stories SideNav.
// Reproduit le template réel de l'app : Page.Bar "Accueil" pleine largeur,
// SideNav permanente (marque Pro Sécurité + slot de navigation + footer comète
// link) et Page.Body avec un vrai contenu. Fichier NON indexé par Storybook (pas
// de suffixe .stories).
import { useState, type ReactNode } from "react";
import {
  SideNav,
  Page,
  Logo,
  Heading,
  Text,
  Stack,
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
 * Contenu de page de démonstration : de quoi VOIR que la nav pousse le contenu
 * (tablette / desktop) ou passe par-dessus (Drawer, mobile web).
 */
export function DemoPageContent() {
  return (
    <Stack gap="300" padding="300">
      <Stack gap="050">
        <Heading size="medium" as="h2">Tableau de bord</Heading>
        <Text color="subtle">Synthèse de l’activité des sites sur la semaine en cours.</Text>
      </Stack>
      <Grid gap="200">
        {[
          ["Agents en poste", "148"],
          ["Vacations non pourvues", "7"],
          ["Anomalies à traiter", "12"],
          ["Sites actifs", "36"],
        ].map(([label, value]) => (
          <Grid.Col key={label} span={{ mobile: 12, tablet: 6, desktop: 3 }}>
            <Card>
              <Stack gap="050" padding="200">
                <Text size="small" color="subtle">{label}</Text>
                <Heading size="large" as="div">{value}</Heading>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Text>
        Le contenu occupe toute la place restante : la navigation latérale est permanente
        (déployée ou en rail), elle pousse le contenu et ne le recouvre jamais sur
        tablette et desktop.
      </Text>
    </Stack>
  );
}

export interface MainCouranteShellProps {
  /** Corps de la navigation (sections réelles, skeleton ou état vide). */
  nav: ReactNode;
  /** Contenu principal de la page. @default <DemoPageContent /> */
  body?: ReactNode;
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
  body = <DemoPageContent />,
  mode = "expanded",
  logo = <Logo product="cafe" format="icon" />,
  header,
  footer,
  title = "Accueil",
}: MainCouranteShellProps) {
  const [current, setCurrent] = useState<SideNavMode>(mode);
  return (
    <SideNav.Provider mode={current} onModeChange={setCurrent}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "var(--black-4)",
        }}
      >
        {/* Header pleine largeur — jamais recouvert par la nav */}
        <Page.Bar title={title} />

        {/* Zone sous le header : SideNav + contenu côte à côte */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
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
          <Page.Body>{body}</Page.Body>
        </div>
      </div>
    </SideNav.Provider>
  );
}
