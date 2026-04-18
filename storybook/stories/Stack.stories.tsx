// Stack — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Card } from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Primitive de layout flex 1D. Empile des éléments verticalement (par défaut) ou horizontalement avec un espacement uniforme issu des tokens `--space*`.",
      },
    },
  },
  argTypes: {
    direction: {
      control: "inline-radio",
      options: ["column", "row"],
    },
    gap: {
      control: "select",
      options: [
        "0",
        "050",
        "100",
        "150",
        "200",
        "300",
        "400",
        "600",
        "800",
      ],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    wrap: { control: "boolean" },
  },
  args: {
    direction: "column",
    gap: "200",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof Stack>;

// -----------------------------------------------------------------------
// Helpers

function Item({ children }: { children: React.ReactNode }) {
  return <Card appearance="neutral">{children}</Card>;
}

// -----------------------------------------------------------------------
// Stories

/** Empilement vertical par défaut. */
export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Item>Item 1</Item>
      <Item>Item 2</Item>
      <Item>Item 3</Item>
    </Stack>
  ),
};

/** Ligne horizontale avec alignement center et justification between. */
export const Horizontal: Story = {
  args: {
    direction: "row",
    gap: "100",
    align: "center",
    justify: "between",
  },
  render: (args) => (
    <Stack {...args}>
      <Item>Gauche</Item>
      <Item>Centre</Item>
      <Item>Droite</Item>
    </Stack>
  ),
};

/** Empilement vertical avec gap large entre blocs. */
export const LargeGap: Story = {
  name: "Large gap",
  args: { direction: "column", gap: "600" },
  render: (args) => (
    <Stack {...args}>
      <Item>Section A</Item>
      <Item>Section B</Item>
      <Item>Section C</Item>
    </Stack>
  ),
};

/** Ligne horizontale avec wrap activé — utile quand les enfants dépassent. */
export const HorizontalWrap: Story = {
  name: "Horizontal with wrap",
  args: { direction: "row", gap: "100", wrap: true },
  render: (args) => (
    <Stack {...args}>
      {Array.from({ length: 12 }, (_, i) => (
        <Item key={i}>Item {i + 1}</Item>
      ))}
    </Stack>
  ),
};

/** Stacks imbriqués : row dans column pour construire un header de page. */
export const Nested: Story = {
  name: "Nested (page header)",
  render: () => (
    <Stack gap="300">
      <Stack direction="row" align="center" justify="between">
        <Item>Page title</Item>
        <Stack direction="row" gap="100">
          <Item>Action 1</Item>
          <Item>Action 2</Item>
        </Stack>
      </Stack>
      <Stack direction="row" gap="100">
        <Item>Search</Item>
        <Item>Filter</Item>
      </Stack>
    </Stack>
  ),
};
