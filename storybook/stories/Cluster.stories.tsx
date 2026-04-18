// Cluster — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Badge } from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Cluster",
  component: Cluster,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Primitive de layout flex-wrap horizontal. Idéal pour grouper des éléments hétérogènes qui doivent wrapper sur plusieurs lignes : tags, chips, actions, filtres, breadcrumbs.",
      },
    },
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
      <Badge appearance="accent" label="Confirmer" />
    </Cluster>
  ),
};
