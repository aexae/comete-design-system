// ProgressIndicator — stories Storybook
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ProgressIndicator,
} from "@aexae/comete-design-system/components";
import type {
  ProgressIndicatorAppearance,
  ProgressIndicatorProps,
  ProgressIndicatorSize,
  ProgressIndicatorSpacing,
} from "@aexae/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Interactive render (controlled state)

function InteractiveProgressIndicator(props: ProgressIndicatorProps) {
  const [selected, setSelected] = useState(props.selectedIndex ?? 0);
  useEffect(() => {
    setSelected(props.selectedIndex ?? 0);
  }, [props.selectedIndex]);
  return (
    <ProgressIndicator
      {...props}
      selectedIndex={selected}
      onChange={setSelected}
    />
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4713:10171"),
    },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: [
        "default",
        "neutral",
        "help",
        "inverted",
      ] satisfies ProgressIndicatorAppearance[],
      description: "Apparence visuelle des points",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"] satisfies ProgressIndicatorSize[],
      description: "Taille des points",
    },
    spacing: {
      control: "select",
      options: [
        "comfortable",
        "cozy",
        "compact",
      ] satisfies ProgressIndicatorSpacing[],
      description: "Espacement entre les points",
    },
    selectedIndex: {
      control: { type: "number", min: 0, max: 9 },
      description: "Index du point selectionne (0-based)",
    },
    total: {
      control: { type: "number", min: 1, max: 10 },
      description: "Nombre total de points",
    },
  },
  args: {
    appearance: "default",
    size: "medium",
    spacing: "comfortable",
    selectedIndex: 0,
    total: 5,
  },
  render: InteractiveProgressIndicator,
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof ProgressIndicator>;

// -----------------------------------------------------------------------
// Stories

/** Etat par defaut: medium, comfortable, 5 points, cliquable. */
export const Default: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("4713:10876") },
  },
};

/** Apparence neutral (point sélectionné en neutral-bold). */
export const Neutral: Story = {
  args: { appearance: "neutral" },
  parameters: {
    design: { type: "figma", url: figmaUrl("4713:10822") },
  },
};

/** Apparence help (accent). */
export const Help: Story = {
  args: { appearance: "help" },
  parameters: {
    design: { type: "figma", url: figmaUrl("4713:10768") },
  },
};

/** Apparence inverted (pour fonds sombres). */
export const Inverted: Story = {
  args: { appearance: "inverted" },
  parameters: {
    backgrounds: { default: "dark" },
    design: { type: "figma", url: figmaUrl("4713:10710") },
  },
};

/** Espacement cozy. */
export const SpacingCozy: Story = {
  name: "Spacing cozy",
  args: { spacing: "cozy" },
  parameters: {
    design: { type: "figma", url: figmaUrl("4713:10920") },
  },
};

/** Espacement compact. */
export const SpacingCompact: Story = {
  name: "Spacing compact",
  args: { spacing: "compact" },
  parameters: {
    design: { type: "figma", url: figmaUrl("4713:10926") },
  },
};

/** Avec boutons de navigation avant et apres. */
export const WithNavigationButtons: Story = {
  name: "With navigation buttons",
  render: (args) => {
    const total = args.total ?? 5;
    const [selected, setSelected] = useState(args.selectedIndex ?? 0);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space300)",
        }}
      >
        <Button
          appearance="outlined"
          color="default"
          onPress={() => setSelected((prev) => Math.max(0, prev - 1))}
          isDisabled={selected === 0}
        >
          Precedent
        </Button>
        <ProgressIndicator
          {...args}
          selectedIndex={selected}
          onChange={setSelected}
        />
        <Button
          appearance="contained"
          color="brand"
          onPress={() =>
            setSelected((prev) => Math.min(total - 1, prev + 1))
          }
          isDisabled={selected === total - 1}
        >
          Suivant
        </Button>
      </div>
    );
  },
};

// -----------------------------------------------------------------------

/** Toutes les apparences cote a cote. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <InteractiveProgressIndicator {...args} appearance="default" />
      <InteractiveProgressIndicator {...args} appearance="neutral" />
      <InteractiveProgressIndicator {...args} appearance="help" />
      <div
        style={{
          backgroundColor: "var(--background-accent-purple-bold-default)",
          padding: "var(--space200)",
          borderRadius: "var(--radius100)",
        }}
      >
        <InteractiveProgressIndicator {...args} appearance="inverted" />
      </div>
    </div>
  ),
};

/** Toutes les tailles cote a cote. */
export const AllSizes: Story = {
  name: "All sizes",
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <InteractiveProgressIndicator {...args} size="small" />
      <InteractiveProgressIndicator {...args} size="medium" />
      <InteractiveProgressIndicator {...args} size="large" />
    </div>
  ),
};
