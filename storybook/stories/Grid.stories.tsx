// Grid — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid, Card } from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    gap: {
      control: "select",
      options: ["0", "050", "100", "150", "200", "300", "400", "600"],
    },
    rowGap: {
      control: "select",
      options: [undefined, "0", "050", "100", "200", "300"],
    },
    columnGap: {
      control: "select",
      options: [undefined, "0", "050", "100", "200", "300"],
    },
  },
  args: { gap: "200" },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof Grid>;

// -----------------------------------------------------------------------
// Helpers

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <Card appearance="subtle">
      <div
        style={{
          padding: "var(--space200)",
          textAlign: "center",
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-sm)",
          color: "var(--text-default)",
        }}
      >
        {children}
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Grille 12 colonnes par défaut : 2 cellules de 6 + 3 cellules de 4. */
export const Default: Story = {
  render: (args) => (
    <Grid {...args}>
      <Grid.Col span={6}>
        <Cell>span 6</Cell>
      </Grid.Col>
      <Grid.Col span={6}>
        <Cell>span 6</Cell>
      </Grid.Col>
      <Grid.Col span={4}>
        <Cell>span 4</Cell>
      </Grid.Col>
      <Grid.Col span={4}>
        <Cell>span 4</Cell>
      </Grid.Col>
      <Grid.Col span={4}>
        <Cell>span 4</Cell>
      </Grid.Col>
    </Grid>
  ),
};

/** Nombre de colonnes responsive : 1 col mobile → 2 tablet → 4 desktop. */
export const ResponsiveColumns: Story = {
  name: "Responsive columns",
  args: { gap: "200" },
  render: (args) => (
    <Grid {...args} columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Grid.Col key={i}>
          <Cell>Item {i + 1}</Cell>
        </Grid.Col>
      ))}
    </Grid>
  ),
};

/** Span responsive : 12 mobile → 6 tablet → 3 desktop. */
export const ResponsiveSpan: Story = {
  name: "Responsive span",
  args: { gap: "200" },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 4 }, (_, i) => (
        <Grid.Col key={i} span={{ mobile: 12, tablet: 6, desktop: 3 }}>
          <Cell>Item {i + 1}</Cell>
        </Grid.Col>
      ))}
    </Grid>
  ),
};

/** Start explicite : un élément commence à la colonne 4. */
export const WithStart: Story = {
  name: "With start (offset)",
  args: { gap: "200" },
  render: (args) => (
    <Grid {...args}>
      <Grid.Col span={3}>
        <Cell>1 → 3</Cell>
      </Grid.Col>
      <Grid.Col span={6} start={4}>
        <Cell>4 → 9 (start=4)</Cell>
      </Grid.Col>
      <Grid.Col span={3}>
        <Cell>10 → 12</Cell>
      </Grid.Col>
    </Grid>
  ),
};

/** Gaps row et column indépendants. */
export const IndependentGaps: Story = {
  name: "Independent row/column gaps",
  args: { rowGap: "400", columnGap: "100" },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 8 }, (_, i) => (
        <Grid.Col key={i} span={3}>
          <Cell>Item {i + 1}</Cell>
        </Grid.Col>
      ))}
    </Grid>
  ),
};

/** Layout asymétrique : sidebar 3 + main 9. */
export const SidebarLayout: Story = {
  name: "Sidebar layout",
  args: { gap: "300" },
  render: (args) => (
    <Grid {...args}>
      <Grid.Col span={{ mobile: 12, tablet: 3 }}>
        <Cell>Sidebar</Cell>
      </Grid.Col>
      <Grid.Col span={{ mobile: 12, tablet: 9 }}>
        <Cell>Main content</Cell>
      </Grid.Col>
    </Grid>
  ),
};
