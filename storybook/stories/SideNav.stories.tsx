// SideNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav, Logo } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/SideNav",
  component: SideNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  args: {
    children: null as unknown as ReactNode,
  },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Helpers

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {children}
      <div style={{ flex: 1, padding: "var(--space200)" }}>
        <p>Contenu principal</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  render: () => (
    <Wrapper>
      <SideNav>
        <SideNav.Header
          logo={<Logo />}
          appName="Pro Sécurité"
          subtitle="Main Courante"
        />
        <SideNav.Section title="Manager">
          <SideNav.Item label="Tableau de bord" icon="Dashboard" isSelected href="/" />
          <SideNav.Item label="Agents" icon="Agent" href="/agents" />
          <SideNav.Item label="Sites" icon="LocationOn" href="/sites" />
          <SideNav.Item label="Pointages" icon="Schedule" href="/pointages" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="MCE">
          <SideNav.Item label="Main courante" icon="EditNote" href="/mce" />
          <SideNav.Item label="Formulaires" icon="FormEdit" href="/forms" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="Administration">
          <SideNav.Item label="Utilisateurs" icon="Group" href="/users" />
          <SideNav.Item label="Droits & permissions" icon="ManageAccounts" href="/permissions" />
          <SideNav.Item label="Licences" icon="Key" href="/licences" />
        </SideNav.Section>
        <SideNav.Footer>
          <Logo />
        </SideNav.Footer>
      </SideNav>
    </Wrapper>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <Wrapper>
      <SideNav>
        <SideNav.Header appName="Mon Application" />
        <SideNav.Item
          label="Accueil"
          description="Vue d'ensemble"
          icon="Home"
          iconAfter="ChevronRight"
          isSelected
          href="/"
        />
        <SideNav.Item
          label="Documents"
          description="Fichiers et dossiers"
          icon="Docs"
          iconAfter="ChevronRight"
          href="/docs"
        />
        <SideNav.Item
          label="Archives"
          description="Éléments archivés"
          icon="Archive"
          iconAfter="ChevronRight"
          href="/archives"
        />
      </SideNav>
    </Wrapper>
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <Wrapper>
      <SideNav>
        <SideNav.Header appName="Config" />
        <SideNav.Item label="Général" icon="Settings" isSelected href="/general" />
        <SideNav.Item label="Avancé" icon="DisplaySettings" href="/advanced" />
        <SideNav.Item label="Expérimental" icon="Extension" isDisabled href="/experimental" />
      </SideNav>
    </Wrapper>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Wrapper>
      <SideNav>
        <SideNav.Item label="Accueil" icon="Home" isSelected />
        <SideNav.Item label="Recherche" icon="Search" />
        <SideNav.Item label="Favoris" icon="Star" />
      </SideNav>
    </Wrapper>
  ),
};
