// Cluster — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Badge } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Cluster",
  component: Cluster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le cluster dispose ses éléments enfants sur un axe horizontal avec retour à la ligne automatique et espacement régulier. Il est idéal pour aligner des tags, badges ou boutons dont le nombre peut varier." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Aligner horizontalement des éléments de tailles variées qui passent à la ligne si besoin (tags, chips, actions).",
                "Quand le nombre d'éléments est variable et doit s'enrouler proprement.",
              ]}
              avoid={[
                "Un empilement strict sans retour à la ligne → Stack (row).",
                "Une grille régulière en colonnes → Grid.",
                "Un alignement pixel-perfect d'une seule ligne → Stack row.",
              ]}
              best={[
                "gap (+ rowGap/columnGap si besoin) via tokens ; align/justify pour le placement.",
                "Idéal pour des listes de Tag/Badge/Button dont le nombre varie.",
              ]}
              accessibility={[
                "Layout sans sémantique : garder un ordre DOM logique pour le clavier.",
                "Le retour à la ligne ne doit pas casser l'ordre de lecture.",
              ]}
            />
          }
        />
      ),
    },
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["050", "100", "150", "200", "300", "400"],
    },
    rowGap: {
      control: "select",
      options: [undefined, "050", "100", "150", "200", "300", "400"],
    },
    columnGap: {
      control: "select",
      options: [undefined, "050", "100", "150", "200", "300", "400"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
  },
  args: {
    gap: "100",
    align: "center",
    justify: "start",
  },
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof Cluster>;

// -----------------------------------------------------------------------
// Stories

/** Cluster par défaut avec une série de badges. */
export const Default: Story = {
  render: (args) => (
    <Cluster {...args}>
      <Badge appearance="neutral" label="React" />
      <Badge appearance="neutral" label="TypeScript" />
      <Badge appearance="neutral" label="CSS Modules" />
      <Badge appearance="neutral" label="React Aria" />
      <Badge appearance="neutral" label="Vitest" />
    </Cluster>
  ),
};

/** Beaucoup d'éléments — démontre le wrap automatique. */
export const WithWrap: Story = {
  name: "With wrap (many items)",
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <Cluster {...args}>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} appearance="neutral" label={`Tag ${i + 1}`} />
        ))}
      </Cluster>
    </div>
  ),
};

/** Gaps indépendants : lignes très espacées, colonnes serrées. */
export const IndependentGaps: Story = {
  name: "Independent row/column gaps",
  args: { rowGap: "300", columnGap: "050" },
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <Cluster {...args}>
        {Array.from({ length: 12 }, (_, i) => (
          <Badge key={i} appearance="neutral" label={`Tag ${i + 1}`} />
        ))}
      </Cluster>
    </div>
  ),
};

/** Justification à droite — typique d'un footer d'actions. */
export const JustifyEnd: Story = {
  name: "Justify end",
  args: { justify: "end" },
  render: (args) => (
    <Cluster {...args}>
      <Badge appearance="neutral" label="Annuler" />
      <Badge appearance="accentPurple" label="Confirmer" />
    </Cluster>
  ),
};
