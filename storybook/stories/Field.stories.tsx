// Field — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { FieldMessageType } from "@aexae/comete-design-system/components";
import { Field, TextField } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Habiller un contrôle de formulaire avec un label, une aide et un message d'erreur cohérents.",
                "Autour de TextField, Select, DatePicker… pour uniformiser la structure de champ.",
                "Uniformiser l'apparence et le comportement de tous les champs d'un formulaire.",
              ]}
              avoid={[
                "Un contrôle sans label visible → aria-label directement.",
                "Un message global → Banner/SectionMessage.",
                "Le cadre visuel seul → InputContainer.",
              ]}
              best={[
                "Toujours associer un label explicite ; `messageType` `critical`/`success`/`neutral` selon l'état.",
                "`isRequired` pour signaler l'obligation ; garder le message concis.",
                "Ne pas utiliser le placeholder comme substitut du label — il disparaît à la saisie.",
              ]}
              accessibility={[
                "Le label est associé au contrôle (clic sur le label → focus) et le message lié via aria.",
                "`isRequired` et l'état d'erreur sont annoncés aux lecteurs d'écran.",
              ]}
            />
          }
        />
      ),
    },
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
