// CheckboxGroup — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, CheckboxGroup } from "@aexae/comete-design-system/components";
import { fn } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("11:309") },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    "aria-label": "Préférences",
    onChange: fn(),
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

// -----------------------------------------------------------------------

/** Groupe par défaut. */
export const Default: Story = {
  render: (args) => (
    <CheckboxGroup {...args}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
      <Checkbox value="c" label="Option C" />
    </CheckboxGroup>
  ),
};

/** Avec sélection initiale. */
export const WithSelection: Story = {
  name: "With selection",
  render: (args) => (
    <CheckboxGroup {...args} defaultValue={["a", "c"]}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
      <Checkbox value="c" label="Option C" />
    </CheckboxGroup>
  ),
};

/** Groupe invalide. */
export const Invalid: Story = {
  render: (args) => (
    <CheckboxGroup {...args} isInvalid>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

/** Groupe désactivé. */
export const Disabled: Story = {
  render: (args) => (
    <CheckboxGroup {...args} isDisabled defaultValue={["a"]}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

/** Sélection contrôlée. */
function ControlledDemo() {
  const [value, setValue] = useState<string[]>(["a"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CheckboxGroup aria-label="Préférences" value={value} onChange={setValue}>
        <Checkbox value="a" label="Option A" />
        <Checkbox value="b" label="Option B" />
        <Checkbox value="c" label="Option C" />
      </CheckboxGroup>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Sélection : {value.length > 0 ? value.join(", ") : "aucune"}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: { controls: { disable: true } },
};
