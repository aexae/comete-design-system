// ToggleButtonGroup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ToggleButtonGroup,
  ToggleButton,
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
  title: "Components/ToggleButtonGroup",
  component: ToggleButtonGroup,
  tags: ["autodocs"],
  parameters: {
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
      key={args.selectionMode}
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
  },
};

/** Avec un bouton pré-sélectionné. */
export const Selected: Story = {
  render: () => (
    <ToggleButtonGroup
      aria-label="Alignment"
      selectionMode="single"
      defaultSelectedKeys={["center"]}
    >
      <ToggleButton id="left">Left</ToggleButton>
      <ToggleButton id="center">Center</ToggleButton>
      <ToggleButton id="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Mode sélection multiple. */
export const Multiple: Story = {
  render: () => (
    <ToggleButtonGroup
      aria-label="Formatting"
      selectionMode="multiple"
      defaultSelectedKeys={["bold", "italic"]}
    >
      <ToggleButton id="bold">Bold</ToggleButton>
      <ToggleButton id="italic">Italic</ToggleButton>
      <ToggleButton id="underline">Underline</ToggleButton>
      <ToggleButton id="strikethrough">Strikethrough</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Tous les boutons du groupe sont désactivés. */
export const Disabled: Story = {
  render: () => (
    <ToggleButtonGroup aria-label="Options" isDisabled>
      <ToggleButton id="a">Option A</ToggleButton>
      <ToggleButton id="b">Option B</ToggleButton>
      <ToggleButton id="c">Option C</ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Un bouton individuel désactivé dans le groupe. */
export const IndividualDisabled: Story = {
  name: "Individual disabled",
  render: () => (
    <ToggleButtonGroup
      aria-label="Options"
      selectionMode="single"
      defaultSelectedKeys={["a"]}
    >
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
  render: () => (
    <ToggleButtonGroup
      aria-label="View"
      selectionMode="single"
      defaultSelectedKeys={["list"]}
    >
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
  render: () => (
    <ToggleButtonGroup
      aria-label="Sort"
      selectionMode="single"
      defaultSelectedKeys={["asc"]}
    >
      <ToggleButton id="asc" iconAfter="ArrowDropUp">
        Ascending
      </ToggleButton>
      <ToggleButton id="desc" iconAfter="ArrowDropDown">
        Descending
      </ToggleButton>
    </ToggleButtonGroup>
  ),
};

/** Avec un badge sur certains boutons. */
export const WithBadge: Story = {
  name: "With badge",
  render: () => (
    <ToggleButtonGroup
      aria-label="Filters"
      selectionMode="single"
      defaultSelectedKeys={["all"]}
    >
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

