// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SideNav, Page, Logo, useSideNav } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

/** Composition complète : Page.Header en haut sur toute la largeur (au-dessus
 *  de tout structurellement), puis SideNav + Page.Body dans une zone flex en
 *  dessous. Comme la SideNav vit dans cette zone, son overlay en peek ne
 *  recouvre jamais le Page.Header — le Trigger reste cliquable. */
function Layout({ initialCollapsed }: { initialCollapsed: boolean }) {
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
        {/* Header au-dessus, pleine largeur — jamais recouvert par la nav */}
        <Page.Header
          title="Accueil"
          leading={<SideNav.Trigger />}
        />

        {/* Zone sous le header : SideNav + contenu côte à côte */}
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <SideNav>
            <SideNav.Header
              logo={<Logo product="cafe" format="icon" />}
              companyName="Pro Sécurité"
              description="Main Courante"
            />
            <SideNavContent />
          </SideNav>
          <Page.Body>
            <p>Contenu principal</p>
          </Page.Body>
        </div>
      </div>
    </SideNav.Provider>
  );
}

function SideNavFooterLogo() {
  const { isCollapsed } = useSideNav();
  return <Logo size={isCollapsed ? 24 : 14} product="link" appearance="neutral" format={isCollapsed ? "icon" : "logo"} />;
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

type StoryArgs = { initialCollapsed: boolean };

const meta: Meta<StoryArgs> = {
  title: "Navigation/SideNav",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  argTypes: {
    initialCollapsed: { control: "boolean" },
  },
  args: { initialCollapsed: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Composition complète : SideNav.Provider + SideNav + Page avec Trigger
 *  dans Page.Header.leading. Expanded par défaut. */
export const Default: Story = {
  render: (args) => <Layout initialCollapsed={args.initialCollapsed} />,
};

/** Mode réduit : la SideNav est totalement invisible. Le Trigger dans
 *  `Page.Header.leading` permet de rouvrir (click) ou de peek (hover). */
export const Collapsed: Story = {
  args: { initialCollapsed: true },
  render: (args) => <Layout initialCollapsed={args.initialCollapsed} />,
};
