// Heading — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading, Stack } from "@aexae/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const SIZES = [
  "xxlarge", "xlarge", "large", "medium", "small", "xsmall", "xxsmall",
] as const;

type HeadingSize = (typeof SIZES)[number];

const SIZE_LABELS: Record<HeadingSize, string> = {
  xxlarge: "xxlarge (h1)",
  xlarge: "xlarge (h1)",
  large: "large (h2)",
  medium: "medium (h3)",
  small: "small (h4)",
  xsmall: "xsmall (h5)",
  xxsmall: "xxsmall (h6)",
};

const meta = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4726:54750") },
  },
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
      labels: SIZE_LABELS,
    },
    color: {
      control: "inline-radio",
      options: ["default", "inverted"],
    },
    align: {
      control: "inline-radio",
      options: [undefined, "start", "center", "end"],
    },
    italic: { control: "boolean" },
    noWrap: { control: "boolean" },
    maxLines: { control: { type: "number", min: 1 } },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "div", "span"],
    },
    children: { control: "text" },
  },
  args: {
    size: "large",
    color: "default",
    children: "Titre de section",
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

export const Playground: Story = {};

export const AllSizes: Story = {
  render: () => (
    <Stack gap="200">
      {SIZES.map((s) => (
        <Heading key={s} size={s}>
          {SIZE_LABELS[s]} — Titre de section
        </Heading>
      ))}
    </Stack>
  ),
};

export const AsOverride: Story = {
  render: () => (
    <Stack gap="200">
      <Heading size="xxlarge" as="h2">
        xxlarge rendu en &lt;h2&gt;
      </Heading>
      <Heading size="medium" as="div">
        medium rendu en &lt;div&gt;
      </Heading>
    </Stack>
  ),
};

export const Inverted: Story = {
  render: () => (
    <div style={{ background: "var(--background-neutral-bold-default)", padding: 24, borderRadius: 8 }}>
      <Heading size="large" color="inverted">
        Titre inversé sur fond sombre
      </Heading>
    </div>
  ),
};

export const Align: Story = {
  render: () => (
    <Stack gap="300" style={{ width: 400 }}>
      <Heading size="medium" align="start" style={{ border: "1px solid var(--border-default)" }}>Aligné à gauche</Heading>
      <Heading size="medium" align="center" style={{ border: "1px solid var(--border-default)" }}>Centré</Heading>
      <Heading size="medium" align="end" style={{ border: "1px solid var(--border-default)" }}>Aligné à droite</Heading>
    </Stack>
  ),
};

export const Italic: Story = {
  render: () => (
    <Heading size="large" italic>
      Titre en italique
    </Heading>
  ),
};

export const MaxLines: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Heading size="medium" maxLines={2}>
        Un titre de section particulièrement long qui dépasse la largeur disponible
        et se retrouve tronqué proprement après deux lignes avec une ellipse.
      </Heading>
    </div>
  ),
};
