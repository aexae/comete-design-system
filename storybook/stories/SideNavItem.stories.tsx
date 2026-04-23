// SideNav.Item — stories avec props exposées dans les controls
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNavItem } from "@naxit/comete-design-system/components";
import type { SideNavItemProps } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function NavContext({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 240, background: "var(--background-surface-default)", padding: "var(--space075) var(--space100)" }}>
      {children}
    </div>
  );
}

const meta = {
  title: "Navigation/SideNav/Item",
  component: SideNavItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4277:13347") },
  },
  decorators: [
    (Story) => (
      <NavContext>
        <Story />
      </NavContext>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    iconBefore: { control: "text" },
    iconAfter: { control: "text" },
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Accueil",
    iconBefore: "Home",
    isSelected: false,
    isDisabled: false,
  },
} satisfies Meta<SideNavItemProps>;

export default meta;
type Story = StoryObj<SideNavItemProps>;

/** État par défaut. */
export const Default: Story = {
  parameters: { docs: { source: { code: `<SideNav.Item label="Accueil" iconBefore="Home" href="/home" />` } } },
};

/** Item sélectionné (indicateur bleu + icône filled). */
export const Selected: Story = {
  args: { isSelected: true },
  parameters: { docs: { source: { code: `<SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />` } } },
};

/** Item désactivé. */
export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: { docs: { source: { code: `<SideNav.Item label="Expérimental" iconBefore="Extension" isDisabled />` } } },
};

/** Avec description et icône après. */
export const WithDescription: Story = {
  name: "With description",
  args: {
    label: "Accueil",
    description: "Vue d'ensemble du système",
    iconBefore: "Home",
    iconAfter: "ChevronRight",
  },
  parameters: { docs: { source: { code: `<SideNav.Item\n  label="Accueil"\n  description="Vue d'ensemble"\n  iconBefore="Home"\n  iconAfter="ChevronRight"\n  href="/"\n/>` } } },
};

/** Sans icône. */
export const WithoutIcon: Story = {
  name: "Without icon",
  args: { iconBefore: undefined, label: "Profil" },
  parameters: { docs: { source: { code: `<SideNav.Item label="Profil" href="/profile" />` } } },
};

/** Tous les états côte à côte. */
export const AllStates: Story = {
  name: "All states",
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Item label="Default" iconBefore="Home" />\n<SideNav.Item label="Selected" iconBefore="Home" isSelected />\n<SideNav.Item label="Disabled" iconBefore="Extension" isDisabled />`,
      },
    },
  },
  render: () => (
    <>
      <SideNavItem label="Default" iconBefore="Home" />
      <SideNavItem label="Selected" iconBefore="Home" isSelected />
      <SideNavItem label="Disabled" iconBefore="Extension" isDisabled />
      <SideNavItem label="With description" iconBefore="Docs" description="Fichiers et dossiers" iconAfter="ChevronRight" />
      <SideNavItem label="Selected + description" iconBefore="Settings" description="Paramètres avancés" isSelected iconAfter="ChevronRight" />
    </>
  ),
};
