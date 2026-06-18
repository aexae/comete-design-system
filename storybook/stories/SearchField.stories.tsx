// SearchField — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField, Field, Stack } from "@aexae/comete-design-system/components";

const meta = {
  title: "Components/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Champ de recherche standardisé. Encapsule TextField avec les conventions du DS : icône `EditorSearch`, clearable, placeholder et aria-label par défaut.",
      },
    },
  },
  argTypes: {
    appearance: { control: "inline-radio", options: ["default", "subtle"] },
    density: {
      control: "select",
      options: ["compact", "default", "touch"],
      description: "Densité — hauteur/padding/radius (échelle partagée avec Button).",
    },
    isDisabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Rechercher",
    density: "default",
    isDisabled: false,
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof SearchField>;

/** SearchField par défaut. */
export const Default: Story = {};

/** Avec un placeholder personnalisé. */
export const CustomPlaceholder: Story = {
  name: "Custom placeholder",
  args: { placeholder: "Rechercher un agent…" },
  decorators: [(Story) => <div style={{ width: 300 }}><Story /></div>],
};

/** Mode compact pour les toolbars. */
export const Compact: Story = {
  args: { density: "compact" },
};

/** Apparence subtle (bordure basse uniquement). */
export const Subtle: Story = {
  args: { appearance: "subtle" },
};

/** Désactivé. */
export const Disabled: Story = {
  args: { isDisabled: true },
};

/** Dans un Field avec label. Les controls density et isDisabled fonctionnent. */
export const InField: Story = {
  render: (args) => (
    <Field label="Recherche">
      <SearchField placeholder="Rechercher un site…" {...args} />
    </Field>
  ),
};

/** Toutes les variantes. */
export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ width: 300 }}>
    <Stack gap="200">
      <SearchField placeholder="Default" />
      <SearchField placeholder="Compact" density="compact" />
      <SearchField placeholder="Subtle" appearance="subtle" />
      <SearchField placeholder="Disabled" isDisabled />
    </Stack>
    </div>
  ),
};
