// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { SideNav, Logo, useSideNav } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

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

function SideNavFooterLogo() {
  const { isCollapsed } = useSideNav();
  return <Logo size={isCollapsed ? 24 : 14} product="link" appearance="neutral" format={isCollapsed ? "icon" : "default"} />;
}

function SideNavContent() {
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
      <SideNav.Footer>
        <SideNavFooterLogo />
      </SideNav.Footer>
    </>
  );
}

const meta = {
  title: "Navigation/SideNav",
  component: SideNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  argTypes: {
    isCollapsed: { control: "boolean" },
  },
  args: { children: null as unknown as ReactNode, isCollapsed: false },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Composition complète avec bouton collapse/expand dans le Header. */
export const Default: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(args.isCollapsed ?? false);
    return (
      <Wrapper>
        <SideNav isCollapsed={collapsed} onCollapsedChange={setCollapsed}>
          <SideNav.Header
            logo={<Logo product="cafe" format="icon" />}
            companyName="Pro Sécurité"
            description="Main Courante"
          />
          <SideNavContent />
        </SideNav>
      </Wrapper>
    );
  },
};

/** Mode réduit : cliquer sur le bouton expand pour revenir à la vue complète. */
export const Collapsed: Story = {
  args: { isCollapsed: true },
  render: (args) => {
    const [collapsed, setCollapsed] = useState(args.isCollapsed ?? true);
    return (
      <Wrapper>
        <SideNav isCollapsed={collapsed} onCollapsedChange={setCollapsed}>
          <SideNav.Header
            logo={<Logo product="cafe" format="icon" />}
            companyName="Pro Sécurité"
            description="Main Courante"
          />
          <SideNavContent />
        </SideNav>
      </Wrapper>
    );
  },
};
