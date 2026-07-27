// SearchField — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField, Field, Stack } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: <SearchField placeholder="Rechercher un agent…" />,
                caption: "Recherche/filtre, avec icône et bouton d'effacement.",
              }}
              dontExample={{
                example: <SearchField placeholder="Adresse e-mail" />,
                caption:
                  "Ne pas l'utiliser pour saisir une donnée de formulaire.",
              }}
              when={[
                "Filtrer ou rechercher dans un contenu (liste, tableau, page).",
                "Quand on veut les conventions DS prêtes à l'emploi : icône de recherche, bouton clear, placeholder « Rechercher ».",
              ]}
              avoid={[
                "Une saisie de donnée de formulaire → TextField.",
                "Un filtre à choix finis → Select ou ToggleButtonGroup.",
              ]}
              best={[
                "Placeholder décrivant la portée (« Rechercher un agent… ») ; `density=\"compact\"` dans une toolbar.",
                "Débouncer la recherche côté application ; conserver le focus après effacement.",
              ]}
              accessibility={[
                "Le champ expose un rôle de recherche ; garder un placeholder décrivant la portée.",
                "Conserver le focus dans le champ après effacement.",
              ]}
            />
          }
        />
      ),
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
