import { useState } from "react";
import { Radio, RadioGroup } from "@naxit/comete-design-system";
import type { RadioGroupProps } from "@naxit/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";

// ----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// ----------------------------------------------------------------------

const meta: Meta<RadioGroupProps> = {
  title: "Components/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    "aria-label": "Choix",
  },
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("3704:73901"),
    },
  },
};

export default meta;
type Story = StoryObj<RadioGroupProps>;

// ----------------------------------------------------------------------

/** Groupe de radios par défaut. */
export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Avec description sur chaque option. */
export const WithDescription: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="monthly">
      <Radio value="monthly" label="Mensuel" description="Facturé chaque mois" />
      <Radio value="yearly" label="Annuel" description="Facturé une fois par an (–20 %)" />
    </RadioGroup>
  ),
};

/** État invalide. */
export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args} isInvalid>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Groupe désactivé. */
export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args} isDisabled defaultValue="b">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Option individuelle désactivée. */
export const IndividualDisabled: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" isDisabled />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Sélection contrôlée. */
function ControlledDemo() {
  const [value, setValue] = useState("a");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RadioGroup aria-label="Choix" value={value} onChange={setValue}>
        <Radio value="a" label="Option A" />
        <Radio value="b" label="Option B" />
        <Radio value="c" label="Option C" />
      </RadioGroup>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Valeur : {value}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: { controls: { disable: true } },
};

/** Toutes les combinaisons d'états. */
export const AllStates: Story = {
  render: () => {
    const labelStyle = {
      fontFamily: "monospace",
      fontSize: 12,
      color: "var(--text-subtlest)",
      width: 140,
    };
    return (
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px 24px", alignItems: "start" }}>
        <span style={labelStyle}>default</span>
        <RadioGroup aria-label="default" defaultValue="a">
          <Radio value="a" label="Selected" />
          <Radio value="b" label="Unselected" />
        </RadioGroup>

        <span style={labelStyle}>invalid</span>
        <RadioGroup aria-label="invalid" isInvalid defaultValue="a">
          <Radio value="a" label="Selected" />
          <Radio value="b" label="Unselected" />
        </RadioGroup>

        <span style={labelStyle}>disabled</span>
        <RadioGroup aria-label="disabled" isDisabled defaultValue="a">
          <Radio value="a" label="Selected" />
          <Radio value="b" label="Unselected" />
        </RadioGroup>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    design: { type: "figma", url: figmaUrl("3704:73886") },
  },
};
