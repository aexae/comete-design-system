// Field — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { FieldMessageType } from "@aexae/comete-design-system/components";
import { Field, TextField } from "@aexae/comete-design-system/components";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("0-0") },
  },
  argTypes: {
    label: { control: "text" },
    isRequired: { control: "boolean" },
    message: { control: "text" },
    messageType: {
      control: "select",
      options: ["neutral", "critical", "success"] satisfies FieldMessageType[],
    },
  },
  args: {
    label: "Label",
    isRequired: false,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <Field {...args}>
        <TextField aria-label="Default" placeholder="Placeholder" />
      </Field>
    </div>
  ),
};

export const Required: Story = {
  args: { isRequired: true },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Field {...args}>
        <TextField aria-label="Required" placeholder="Placeholder" />
      </Field>
    </div>
  ),
};

export const WithMessage: Story = {
  name: "With message",
  args: { message: "Texte d'aide", messageType: "neutral" },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Field {...args}>
        <TextField aria-label="With message" placeholder="Placeholder" />
      </Field>
    </div>
  ),
};

export const Critical: Story = {
  args: { message: "Ce champ est obligatoire", messageType: "critical", isRequired: true },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Field {...args}>
        <TextField aria-label="Critical" placeholder="Placeholder" isInvalid />
      </Field>
    </div>
  ),
};

export const Success: Story = {
  args: { message: "Adresse valide", messageType: "success" },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Field {...args}>
        <TextField aria-label="Success" defaultValue="axel@example.com" />
      </Field>
    </div>
  ),
};
