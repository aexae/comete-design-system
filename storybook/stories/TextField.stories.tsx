// TextField + Field — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  TextField,
  Icon,
  Stack,
  type TextFieldAppearance,
} from "@naxit/comete-design-system/components";
import { fn } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3232:15140") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "subtle"] satisfies TextFieldAppearance[],
    },
    isCompact: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
    placeholder: { control: "text" },
    className: { control: "text" },
    isClearable: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
  args: {
    "aria-label": "Champ texte",
    placeholder: "Placeholder",
    onChange: fn(),
    isClearable: true,
    isLoading: false,
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof TextField>;

// -----------------------------------------------------------------------
// Stories

/** TextField default. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("14:975") } },
};

/** TextField subtle (bordure basse uniquement). */
export const Subtle: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3499:77572") } },
  args: { appearance: "subtle" },
};

/** TextField compact. */
export const Compact: Story = {
  args: { isCompact: true },
};

/** Focus — auto-focus pour tester la bordure bleue et le focus ring. */
export const Focused: Story = {
  args: { autoFocus: true, placeholder: "Ce champ a le focus" },
  render: (args) => (
    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 24 }}>
      <Field label="Default focus">
        <TextField {...args} />
      </Field>
      <Field label="Sans focus (pour comparaison)">
        <TextField aria-label="Sans focus" placeholder="Pas de focus" />
      </Field>
    </div>
  ),
};

/** TextField invalid. */
export const Invalid: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("398:3720") } },
  args: { isInvalid: true, defaultValue: "Value" },
};

/** TextField disabled. */
export const Disabled: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2881:47347") } },
  args: { isDisabled: true, defaultValue: "Value" },
};

/** TextField dans un Field avec label et message. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: () => (
    <div style={{ width: 280 }}>
      <Field label="Email" isRequired>
        <TextField aria-label="Email" placeholder="nom@example.com" type="email" />
      </Field>
    </div>
  ),
};

/** Field avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: () => (
    <div style={{ width: 280 }}>
      <Field
        label="Email"
        isRequired
        message="Ce champ est requis"
        messageType="critical"
      >
        <TextField
          aria-label="Email"
          placeholder="nom@example.com"
          type="email"
          isInvalid
        />
      </Field>
    </div>
  ),
};

/** Field avec message de succès. */
export const FieldSuccess: Story = {
  name: "Field success",
  render: () => (
    <div style={{ width: 280 }}>
      <Field label="Email" message="Adresse valide" messageType="success">
        <TextField aria-label="Email" defaultValue="axel@example.com" type="email" />
      </Field>
    </div>
  ),
};

/** Avec bouton clear. */
export const Clearable: Story = {
  args: { isClearable: true, defaultValue: "Field value" },
};

/** Avec spinner de chargement. */
export const Loading: Story = {
  args: { isLoading: true, isClearable: true, defaultValue: "Field value" },
};

/**
 * Avec icône elemBefore. L'icône hérite automatiquement de l'état disabled
 * via InputContext (color="disabled" quand le champ est disabled).
 */
export const WithElemBefore: Story = {
  name: "With elemBefore",
  render: (args) => (
    <div style={{ width: 280 }}>
      <Stack gap="200">
        <Field label="Enabled">
          <TextField
            {...args}
            placeholder="Rechercher…"
            elemBefore={<Icon icon="EditorSearch" />}
          />
        </Field>
        <Field label="Disabled">
          <TextField
            {...args}
            placeholder="Rechercher…"
            elemBefore={<Icon icon="EditorSearch" />}
            isDisabled
          />
        </Field>
        <Field label="Disabled — color explicite (opt-out)">
          <TextField
            {...args}
            placeholder="Rechercher…"
            elemBefore={<Icon icon="EditorSearch" color="brand" />}
            isDisabled
          />
        </Field>
      </Stack>
    </div>
  ),
};

/** Toutes les apparences × états. */
export const AllStates: Story = {
  name: "All states",
  render: () => {
    const appearances: TextFieldAppearance[] = ["default", "subtle"];
    const col = { width: 200 };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {appearances.map((a) => (
          <div key={a} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-subtlest)",
              }}
            >
              appearance={a}
            </span>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={col}>
                <Field label="Default">
                  <TextField aria-label="Default" appearance={a} placeholder="Placeholder" />
                </Field>
              </div>
              <div style={col}>
                <Field label="Filled">
                  <TextField aria-label="Filled" appearance={a} defaultValue="Value" />
                </Field>
              </div>
              <div style={col}>
                <Field label="Typing (clearable)">
                  <TextField aria-label="Typing" appearance={a} defaultValue="Value" isClearable />
                </Field>
              </div>
              <div style={col}>
                <Field label="Loading">
                  <TextField aria-label="Loading" appearance={a} defaultValue="Value" isLoading isClearable />
                </Field>
              </div>
              <div style={col}>
                <Field label="Invalid" message="Error message" messageType="critical">
                  <TextField aria-label="Invalid" appearance={a} defaultValue="Value" isInvalid />
                </Field>
              </div>
              <div style={col}>
                <Field label="Disabled">
                  <TextField aria-label="Disabled" appearance={a} defaultValue="Value" isDisabled />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
};
