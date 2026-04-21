// TopNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TopNav,
  Logo,
  Button,
  Avatar,
  SideNav,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/TopNav",
  component: TopNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4323:3313") },
  },
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

/** Desktop/tablet : logo + nom + actions. Réduire le viewport pour voir le mode mobile. */
export const Default: Story = {
  render: () => (
    <TopNav logo={<Logo />} appName="Pro Sécurité" title="Tableau de bord">
      <Button iconBefore="Search" appearance="subtle" spacing="compact" />
      <Avatar initials="AC" size="small" />
    </TopNav>
  ),
};

/** Mobile avec back button. Réduire le viewport sous 600px. */
export const WithBack: Story = {
  render: () => (
    <TopNav
      logo={<Logo />}
      appName="Pro Sécurité"
      title="Détail agent"
      onBack={() => window.history.back()}
    >
      <Button iconBefore="Search" appearance="subtle" spacing="compact" />
      <Avatar initials="AC" size="small" />
    </TopNav>
  ),
};

/** Sans logo ni titre — actions seules. */
export const ActionsOnly: Story = {
  render: () => (
    <TopNav>
      <Button iconBefore="Search" appearance="subtle" spacing="compact" />
      <Button iconBefore="Notifications" appearance="subtle" spacing="compact" />
      <Avatar initials="JD" size="small" />
    </TopNav>
  ),
};

/** Combiné avec un SideNav dans un layout complet. */
export const FullLayout: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopNav logo={<Logo />} appName="Pro Sécurité" title="Accueil">
        <Button iconBefore="Search" appearance="subtle" spacing="compact" />
        <Avatar initials="AC" size="small" />
      </TopNav>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SideNav>
          <SideNav.Item label="Tableau de bord" icon="Dashboard" isSelected href="/" />
          <SideNav.Item label="Agents" icon="Agent" href="/agents" />
          <SideNav.Item label="Sites" icon="LocationOn" href="/sites" />
        </SideNav>
        <main style={{ flex: 1, padding: "var(--space200)", overflowY: "auto" }}>
          <h1>Contenu principal</h1>
        </main>
      </div>
    </div>
  ),
};
