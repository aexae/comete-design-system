// ToggleButtonGroup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ToggleButtonGroup,
  ToggleButton,
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
  title: "Components/ToggleButtonGroup",
  component: ToggleButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le groupe de boutons bascule permet de sélectionner une ou plusieurs options dans un ensemble compact de boutons. Il convient aux filtres, aux changements de vue et aux options mutuellement exclusives ou cumulatives." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <ToggleButtonGroup
                    selectionMode="single"
                    defaultSelectedKeys={["list"]}
                    aria-label="Vue"
                  >
                    <ToggleButton id="list">Liste</ToggleButton>
                    <ToggleButton id="grid">Grille</ToggleButton>
                    <ToggleButton id="board">Tableau</ToggleButton>
                  </ToggleButtonGroup>
                ),
                caption: "Sélection segmentée parmi quelques options visibles.",
              }}
              dontExample={{
                example: (
                  <ToggleButtonGroup selectionMode="single" aria-label="Statut">
                    <ToggleButton id="a">Nouveau</ToggleButton>
                    <ToggleButton id="b">En cours</ToggleButton>
                    <ToggleButton id="c">En attente</ToggleButton>
                    <ToggleButton id="d">Résolu</ToggleButton>
                    <ToggleButton id="e">Fermé</ToggleButton>
                    <ToggleButton id="f">Archivé</ToggleButton>
                  </ToggleButtonGroup>
                ),
                caption: "Ne pas l'utiliser pour un grand nombre d'options.",
              }}
              when={[
                "Choisir parmi un petit nombre d'options visibles en permanence (alignement, vue liste/grille, filtre rapide).",
                "Sélection unique (`single`) ou multiple (`multiple`) avec retour visuel immédiat, sans validation.",
              ]}
              avoid={[
                "Un choix dans un formulaire soumis → RadioGroup (single) ou CheckboxGroup (multiple).",
                "Déclencher des actions plutôt que sélectionner un état → ButtonGroup.",
                "Un grand nombre d'options → Select.",
              ]}
              best={[
                "2 à 5 options courtes, idéalement avec icône ; toujours un `aria-label` sur le groupe.",
                "Garder au moins une option sélectionnée en mode `single` (`defaultSelectedKeys`).",
              ]}
              accessibility={[
                "Toujours un `aria-label` décrivant le groupe.",
                "Navigation au clavier ; l'état sélectionné ne repose pas uniquement sur la couleur.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("6027:765"),
    },
  },
  argTypes: {
    selectionMode: {
      control: "select",
      options: ["single", "multiple"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof ToggleButtonGroup>;

// -----------------------------------------------------------------------
// Stories

/** Groupe de boutons toggle par défaut en mode sélection unique. */
export const Default: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("5221:11710") },
  },
  render: (args) => (
    <ToggleButtonGroup
      key={`${args.selectionMode}-${args.size}`}
      {...args}
      aria-label="Options"
      defaultSelectedKeys={["option1"]}
    >
      <ToggleButton id="option1">Option 1</ToggleButton>
      <ToggleButton id="option2">Option 2</ToggleButton>
      <ToggleButton id="option3">Option 3</ToggleButton>
      <ToggleButton id="option4">Option 4</ToggleButton>
    </ToggleButtonGroup>
  ),
  args: {
    selectionMode: "single",
    size: "medium",
  },
};

/** Taille small. */
export const Small: Story = {
  args: { size: "small" },
  render: (args) => (
    <ToggleButtonGroup
      {...args}
      aria-label="Options"
      defaultSelectedKeys={["a"]}
    >
      <ToggleButton id="a">Option A</ToggleButton>
      <ToggleButton id="b">Option B</ToggleButton>
      <ToggleButton id="c">Option C</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Taille large. */
export const Large: Story = {
  args: { size: "large" },
  render: (args) => (
    <ToggleButtonGroup
      {...args}
      aria-label="Options"
      defaultSelectedKeys={["a"]}
    >
      <ToggleButton id="a">Option A</ToggleButton>
      <ToggleButton id="b">Option B</ToggleButton>
      <ToggleButton id="c">Option C</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Comparaison des trois tailles. */
export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <ToggleButtonGroup aria-label="Small" size="small" defaultSelectedKeys={["a"]}>
        <ToggleButton id="a">Small</ToggleButton>
        <ToggleButton id="b">Option</ToggleButton>
        <ToggleButton id="c">Toggle</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup aria-label="Medium" size="medium" defaultSelectedKeys={["a"]}>
        <ToggleButton id="a">Medium</ToggleButton>
        <ToggleButton id="b">Option</ToggleButton>
        <ToggleButton id="c">Toggle</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup aria-label="Large" size="large" defaultSelectedKeys={["a"]}>
        <ToggleButton id="a">Large</ToggleButton>
        <ToggleButton id="b">Option</ToggleButton>
        <ToggleButton id="c">Toggle</ToggleButton>
      </ToggleButtonGroup>
    </div>
  ),
};

/** Avec un bouton pré-sélectionné. */
export const Selected: Story = {
  args: { selectionMode: "single", defaultSelectedKeys: ["center"] },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Alignment">
      <ToggleButton id="left">Left</ToggleButton>
      <ToggleButton id="center">Center</ToggleButton>
      <ToggleButton id="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Mode sélection multiple. */
export const Multiple: Story = {
  name: "Multiple selection",
  args: { selectionMode: "multiple", defaultSelectedKeys: ["bold", "italic"] },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Formatting">
      <ToggleButton id="bold">Bold</ToggleButton>
      <ToggleButton id="italic">Italic</ToggleButton>
      <ToggleButton id="underline">Underline</ToggleButton>
      <ToggleButton id="strikethrough">Strikethrough</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Tous les boutons du groupe sont désactivés. */
export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Options">
      <ToggleButton id="a">Option A</ToggleButton>
      <ToggleButton id="b">Option B</ToggleButton>
      <ToggleButton id="c">Option C</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Un bouton individuel désactivé dans le groupe. */
export const IndividualDisabled: Story = {
  name: "Individual disabled",
  args: { selectionMode: "single" },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Options" defaultSelectedKeys={["a"]}>
      <ToggleButton id="a">Option A</ToggleButton>
      <ToggleButton id="b" isDisabled>
        Option B
      </ToggleButton>
      <ToggleButton id="c">Option C</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Avec des icônes avant le label. */
export const WithIconBefore: Story = {
  name: "Icon before",
  args: { selectionMode: "single" },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="View" defaultSelectedKeys={["list"]}>
      <ToggleButton id="list" iconBefore="List">
        List
      </ToggleButton>
      <ToggleButton id="table" iconBefore="DataTable">
        Table
      </ToggleButton>
      <ToggleButton id="Home" iconBefore="Home">
        Home
      </ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Avec des icônes après le label. */
export const WithIconAfter: Story = {
  name: "Icon after",
  args: { selectionMode: "single" },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Sort" defaultSelectedKeys={["asc"]}>
      <ToggleButton id="asc" iconAfter="ArrowDropUp">
        Ascending
      </ToggleButton>
      <ToggleButton id="desc" iconAfter="ArrowDropDown">
        Descending
      </ToggleButton>
    </ToggleButtonGroup>
  ),
};

/**
 * Icônes seules — chaque bouton ne contient qu'une icône, le label étant
 * porté par `aria-label` pour l'accessibilité.
 */
export const IconsOnly: Story = {
  name: "Icons only",
  args: { selectionMode: "single" },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Text alignment" defaultSelectedKeys={["left"]}>
      <ToggleButton id="left" iconBefore="FormatAlignLeft" aria-label="Align left" />
      <ToggleButton id="center" iconBefore="FormatAlignCenter" aria-label="Align center" />
      <ToggleButton id="right" iconBefore="FormatAlignRight" aria-label="Align right" />
      <ToggleButton id="justify" iconBefore="FormatAlignJustify" aria-label="Justify" />
    </ToggleButtonGroup>
  ),
};

/** Avec un badge sur certains boutons. */
export const WithBadge: Story = {
  name: "With badge",
  args: { selectionMode: "single" },
  render: (args) => (
    <ToggleButtonGroup {...args} aria-label="Filters" defaultSelectedKeys={["all"]}>
      <ToggleButton id="all" badge="128">
        All
      </ToggleButton>
      <ToggleButton id="active" badge="24">
        Active
      </ToggleButton>
      <ToggleButton id="archived">Archived</ToggleButton>
    </ToggleButtonGroup>
  ),
};

