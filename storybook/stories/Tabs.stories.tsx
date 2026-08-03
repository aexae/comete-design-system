// Tabs — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
    docs: {
      description: { component: "Les onglets organisent le contenu en panneaux alternatifs accessibles depuis une barre de navigation horizontale. Ils permettent de basculer entre des vues liées sans quitter la page." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <Tabs>
                    <TabList aria-label="Sections">
                      <Tab id="d">Détails</Tab>
                      <Tab id="a">Activité</Tab>
                      <Tab id="s">Paramètres</Tab>
                    </TabList>
                    <TabPanel id="d">Détails de l&apos;entité.</TabPanel>
                    <TabPanel id="a">Journal d&apos;activité.</TabPanel>
                    <TabPanel id="s">Réglages.</TabPanel>
                  </Tabs>
                ),
                caption: "Naviguer entre quelques vues de même niveau.",
              }}
              dontExample={{
                example: (
                  <Tabs>
                    <TabList aria-label="Trop d'onglets">
                      {Array.from({ length: 8 }, (_, i) => (
                        <Tab key={i} id={`t${i}`}>
                          Onglet {i + 1}
                        </Tab>
                      ))}
                    </TabList>
                    {Array.from({ length: 8 }, (_, i) => (
                      <TabPanel key={i} id={`t${i}`}>
                        Contenu {i + 1}
                      </TabPanel>
                    ))}
                  </Tabs>
                ),
                caption: "Ne pas multiplier les onglets.",
              }}
              when={[
                "Naviguer entre des vues de même niveau au sein d'un même contexte (détails / activité / paramètres).",
                "Quand le contenu de chaque onglet est indépendant et consulté alternativement.",
              ]}
              avoid={[
                "Empiler des sections repliables consultables ensemble → Accordion.",
                "Une étape séquentielle obligatoire → Stepper.",
                "Une navigation entre pages/routes → SideNav/Page.Bar.",
                "Déclencher une action ponctuelle → Button.",
              ]}
              best={[
                "Libellés courts ; un onglet actif par défaut ; éviter un trop grand nombre d'onglets (préférer un regroupement).",
                "Ne pas imbriquer des Tabs dans des Tabs ; garder l'état d'onglet stable à la navigation.",
              ]}
              accessibility={[
                "`TabList` porte un `aria-label` ; navigation au clavier par les flèches.",
                "Associer chaque `Tab` (id) à son `TabPanel` correspondant.",
                "L'état actif ne doit pas être porté par la seule couleur.",
              ]}
            />
          }
        />
      ),
    },
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
      <TabPanel id="tab1">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu accueil</p>
        </div>
      </TabPanel>
      <TabPanel id="tab2">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu profil</p>
        </div>
      </TabPanel>
      <TabPanel id="tab3">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu paramètres</p>
        </div>
      </TabPanel>
    </Tabs>
  ),
};

/** Avec des icônes après le label. */
export const IconsAfter: Story = {
  name: "IconAfter",
  render: () => (
    <Tabs>
      <TabList>
        <Tab id="tab1" iconAfter="KeyboardArrowDown">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel id="tab1">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu 1</p>
        </div>
      </TabPanel>
      <TabPanel id="tab2">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu 2</p>
        </div>
      </TabPanel>
      <TabPanel id="tab3">
        <div style={{ padding: "16px", backgroundColor: "var(--background-neutral-subtlest-default)" }}>
          <p>Contenu 3</p>
        </div>
      </TabPanel>
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
