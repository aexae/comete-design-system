// RadioGroup — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "@aexae/comete-design-system/components";
import { fn } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3704:73901") },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    "aria-label": "Choix",
    onChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// -----------------------------------------------------------------------

/** Groupe par défaut. */
export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Avec sélection initiale. */
export const WithSelection: Story = {
  name: "With selection",
  render: (args) => (
    <RadioGroup {...args} defaultValue="b">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Groupe invalide. */
export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args} isInvalid>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Groupe désactivé. */
export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args} isDisabled defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
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
