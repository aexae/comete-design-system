// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav, Logo } from "@naxit/comete-design-system/components";

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

const meta = {
  title: "Navigation/SideNav",
  component: SideNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  args: { children: null as unknown as ReactNode },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Composition complète : Header, Sections, Items, Dividers, Footer. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SideNav>
          <SideNav.Header
            logo={<Logo format="icon" />}
            companyName="Pro Sécurité"
            description="Main Courante"
          />
          <SideNav.Section title="Manager">
            <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
            <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
            <SideNav.Item label="Sites" iconBefore="LocationOn" href="/sites" />
          </SideNav.Section>
          <SideNav.Divider />
          <SideNav.Section title="Administration">
            <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
            <SideNav.Item label="Permissions" iconBefore="ManageAccounts" href="/permissions" />
          </SideNav.Section>
          <SideNav.Footer>
            <Logo />
          </SideNav.Footer>
        </SideNav>`,
      },
    },
  },
  render: () => (
    <Wrapper>
      <SideNav>
        <SideNav.Header
          logo={<Logo product="cafe" format="icon" />}
          companyName="Pro Sécurité"
          description="Main Courante"
        />
        <SideNav.Section title="Manager">
          <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
          <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
          <SideNav.Item label="Sites" iconBefore="LocationOn" href="/sites" />
          <SideNav.Item label="Pointages" iconBefore="Schedule" href="/pointages" isDisabled />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="MCE">
          <SideNav.Item label="Main courante" iconBefore="EditNote" href="/mce" />
          <SideNav.Item label="Formulaires" iconBefore="FormEdit" href="/forms" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="Administration">
          <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
          <SideNav.Item label="Droits & permissions" iconBefore="ManageAccounts" href="/permissions" />
          <SideNav.Item label="Licences" iconBefore="Key" href="/licences" />
        </SideNav.Section>
        <SideNav.Footer>
          <Logo size={14} product="link" appearance="neutral" />
        </SideNav.Footer>
      </SideNav>
    </Wrapper>
  ),
};
