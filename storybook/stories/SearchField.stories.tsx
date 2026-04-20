// SearchField — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField, Field, Stack } from "@naxit/comete-design-system/components";

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
    isCompact: { control: "boolean" },
    isDisabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Rechercher",
    isCompact: false,
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
};

/** Mode compact pour les toolbars. */
export const Compact: Story = {
  args: { isCompact: true },
};

/** Apparence subtle (bordure basse uniquement). */
export const Subtle: Story = {
  args: { appearance: "subtle" },
};

/** Désactivé. */
export const Disabled: Story = {
  args: { isDisabled: true },
};

/** Dans un Field avec label. */
export const InField: Story = {
  render: () => (
    <Field label="Recherche">
      <SearchField placeholder="Rechercher un site…" />
    </Field>
  ),
};

/** Toutes les variantes. */
export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <Stack gap="200">
      <SearchField placeholder="Default" />
      <SearchField placeholder="Compact" isCompact />
      <SearchField placeholder="Subtle" appearance="subtle" />
      <SearchField placeholder="Disabled" isDisabled />
    </Stack>
  ),
};
