// Tabs — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("5107:63005"),
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// -----------------------------------------------------------------------
// Stories

/** Tabs par défaut avec 7 onglets comme sur le Figma. */
export const Default: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("5107:63570") },
  },
  render: () => (
    <Tabs>
      <TabList>
        <Tab id="tab1">Tab</Tab>
        <Tab id="tab2">Tab</Tab>
        <Tab id="tab3">Tab</Tab>
        <Tab id="tab4">Tab</Tab>
        <Tab id="tab5">Tab</Tab>
        <Tab id="tab6">Tab</Tab>
        <Tab id="tab7">Tab</Tab>
      </TabList>
      <TabPanel id="tab1" />
      <TabPanel id="tab2" />
      <TabPanel id="tab3" />
      <TabPanel id="tab4" />
      <TabPanel id="tab5" />
      <TabPanel id="tab6" />
      <TabPanel id="tab7" />
    </Tabs>
  ),
};

/** Avec un onglet désactivé. */
export const Disabled: Story = {
  name: "Disabled tab",
  render: () => (
    <Tabs disabledKeys={["tab3"]}>
      <TabList>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
        <Tab id="tab4">Tab 4</Tab>
      </TabList>
      <TabPanel id="tab1">Content 1</TabPanel>
      <TabPanel id="tab2">Content 2</TabPanel>
      <TabPanel id="tab3">Content 3</TabPanel>
      <TabPanel id="tab4">Content 4</TabPanel>
    </Tabs>
  ),
};

/** Avec des icônes avant le label. */
export const IconsBefore: Story = {
  name: "IconBefore",
  render: () => (
    <Tabs>
      <TabList>
        <Tab id="tab1" iconBefore="Home">Accueil</Tab>
        <Tab id="tab2" iconBefore="Person">Profil</Tab>
        <Tab id="tab3" iconBefore="Settings">Paramètres</Tab>
      </TabList>
      <TabPanel id="tab1">Contenu accueil</TabPanel>
      <TabPanel id="tab2">Contenu profil</TabPanel>
      <TabPanel id="tab3">Contenu paramètres</TabPanel>
    </Tabs>
  ),
};

/** Avec des icônes après le label. */
export const IconsAfter: Story = {
  name: "IconAfter",
  render: () => (
    <Tabs>
      <TabList>
        <Tab id="tab1" iconAfter="ChevronRight">Tab 1</Tab>
        <Tab id="tab2" iconAfter="ChevronRight">Tab 2</Tab>
        <Tab id="tab3" iconAfter="ChevronRight">Tab 3</Tab>
      </TabList>
      <TabPanel id="tab1">Content 1</TabPanel>
      <TabPanel id="tab2">Content 2</TabPanel>
      <TabPanel id="tab3">Content 3</TabPanel>
    </Tabs>
  ),
};

/** Avec du contenu dans les panneaux. */
export const Content: Story = {
  render: () => (
    <Tabs>
      <TabList>
        <Tab id="details">Détails</Tab>
        <Tab id="activity">Activité</Tab>
        <Tab id="settings">Paramètres</Tab>
      </TabList>
      <TabPanel id="details">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu du panneau Détails.</p>
        </div>
      </TabPanel>
      <TabPanel id="activity">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu du panneau Activité.</p>
        </div>
      </TabPanel>
      <TabPanel id="settings">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu du panneau Paramètres.</p>
        </div>
      </TabPanel>
    </Tabs>
  ),
};
