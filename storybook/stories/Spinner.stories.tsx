// Spinner — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Spinner } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { Labeled, LabeledRow } from "./_labeled";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const SIZES = ["xsmall", "small", "medium", "large", "xlarge"] as const;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: [...SIZES, "fill"] },
    appearance: { control: "select", options: ["inherit", "inverted", "comete"] },
    "aria-label": { control: "text" },
    decorative: { control: "boolean" },
  },
  args: {
    size: "medium",
    appearance: "inherit",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Le spinner, en forme de comète, signale un chargement dont la durée est inconnue. Il reprend la couleur du texte parent (`inherit`), s’affiche en clair sur fond foncé (`inverted`) ou reprend le dégradé jaune du logo (`comete`).",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: <Button isLoading>Enregistrer</Button>,
                caption: "Dans un bouton, le spinner remplace le contenu à la taille de l'icône.",
              }}
              dontExample={{
                example: <Spinner size="xlarge" />,
                caption: "Ne pas bloquer une page entière avec un grand spinner sans contexte.",
              }}
              when={[
                "Attente courte et de durée inconnue (envoi, recherche, chargement d'options).",
                "Chargement d'une zone localisée (bouton, champ, panneau).",
              ]}
              avoid={[
                "Une progression mesurable → ProgressBar.",
                "La structure du contenu à venir est connue → Skeleton.",
              ]}
              best={[
                "Choisir la taille selon le contexte : `small` dans un champ, `medium` dans un panneau, `large` pour une zone.",
                '`appearance="inverted"` sur fond foncé.',
              ]}
              accessibility={[
                "Le spinner est une région `status` annoncée avec son `aria-label` (« Chargement » par défaut).",
                "`decorative` le masque quand le parent annonce déjà l'état.",
                "Avec `prefers-reduced-motion`, la rotation ralentit sans s'arrêter.",
              ]}
            />
          }
        />
      ),
    },
    design: {
      type: "figma",
      url: figmaUrl("3499:129936"),
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

/** Spinner par défaut (medium, couleur héritée). */
export const Default: Story = {};

/** Toutes les tailles. */
export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <LabeledRow gap={40} align="center">
      {SIZES.map((size) => (
        <Labeled key={size} label={size}>
          <Spinner size={size} />
        </Labeled>
      ))}
    </LabeledRow>
  ),
};

/** Apparence inverted sur fond foncé. */
export const Inverted: Story = {
  args: { appearance: "inverted" },
  render: (args) => (
    <div
      style={{
        display: "inline-flex",
        padding: 16,
        borderRadius: 8,
        background: "var(--background-neutral-bold-default)",
      }}
    >
      <Spinner {...args} />
    </div>
  ),
};

/** Dégradé jaune du logo Comète, sur fond clair et sur fond foncé. */
export const Comete: Story = {
  args: { appearance: "comete" },
  render: (args) => (
    <LabeledRow gap={24} align="center">
      {(
        [
          ["fond clair", "var(--background-default-default)"],
          ["fond foncé", "var(--background-neutral-bold-default)"],
        ] as const
      ).map(([label, background]) => (
        <Labeled key={label} label={label}>
          <div style={{ display: "inline-flex", padding: 16, borderRadius: 8, background }}>
            <Spinner {...args} size="large" />
          </div>
        </Labeled>
      ))}
    </LabeledRow>
  ),
};

/** Couleur héritée du texte parent. */
export const InheritColor: Story = {
  render: () => (
    <span style={{ color: "var(--text-critical-default)", display: "inline-flex" }}>
      <Spinner size="small" />
    </span>
  ),
};

/** Dans un Button : taille d'icône de chaque densité (16 / 24 / 32). */
export const InButton: Story = {
  render: () => (
    <LabeledRow gap={24} align="center">
      {(["compact", "default", "touch"] as const).map((density) => (
        <Labeled key={density} label={density}>
          <Button isLoading density={density} appearance="contained" color="comete">
            Enregistrer
          </Button>
        </Labeled>
      ))}
    </LabeledRow>
  ),
};
