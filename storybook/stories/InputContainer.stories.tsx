// InputContainer — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { InputContainerAppearance } from "@aexae/comete-design-system/components";
import { InputContainer } from "@aexae/comete-design-system/components";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/InputContainer",
  component: InputContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("0-0") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "subtle"] satisfies InputContainerAppearance[],
    },
    density: {
      control: "select",
      options: ["compact", "default", "touch"],
      description: "Densité — hauteur/padding/radius (échelle partagée avec Button).",
    },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  args: {
    appearance: "default",
    density: "default",
    isDisabled: false,
    isInvalid: false,
  },
} satisfies Meta<typeof InputContainer>;

export default meta;
type Story = StoryObj<typeof InputContainer>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  render: (args) => (
    <InputContainer {...args}>
      <input
        type="text"
        placeholder="Placeholder"
        style={{ border: "none", outline: "none", background: "transparent", padding: "8px", width: 240 }}
      />
    </InputContainer>
  ),
};

export const Subtle: Story = {
  args: { appearance: "subtle" },
  render: (args) => (
    <InputContainer {...args}>
      <input
        type="text"
        placeholder="Placeholder"
        style={{ border: "none", outline: "none", background: "transparent", padding: "8px", width: 240 }}
      />
    </InputContainer>
  ),
};

export const Compact: Story = {
  args: { density: "compact" },
  render: (args) => (
    <InputContainer {...args}>
      <input
        type="text"
        placeholder="Placeholder"
        style={{ border: "none", outline: "none", background: "transparent", padding: "8px", width: 240 }}
      />
    </InputContainer>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <InputContainer {...args}>
      <input
        type="text"
        placeholder="Placeholder"
        disabled
        style={{ border: "none", outline: "none", background: "transparent", padding: "8px", width: 240 }}
      />
    </InputContainer>
  ),
};

export const Invalid: Story = {
  args: { isInvalid: true },
  render: (args) => (
    <InputContainer {...args}>
      <input
        type="text"
        defaultValue="Invalid value"
        style={{ border: "none", outline: "none", background: "transparent", padding: "8px", width: 240 }}
      />
    </InputContainer>
  ),
};
