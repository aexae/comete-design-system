// Heading — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading, Stack } from "@naxit/comete-design-system/components";

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
    layout: "padded",
    design: { type: "figma", url: figmaUrl("4726:54750") },
    docs: {
      description: {
        component:
          "Titre sémantique pour structurer le contenu. Chaque `size` mappe automatiquement vers une balise h1–h6. 7 tailles, 1 poids fixe (semibold) par taille.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
      labels: SIZE_LABELS,
    },
    color: {
      control: "inline-radio",
      options: ["default", "inverse"],
    },
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

export const Inverse: Story = {
  render: () => (
    <div style={{ background: "var(--background-neutral-bold-default)", padding: 24, borderRadius: 8 }}>
      <Heading size="large" color="inverse">
        Titre inversé sur fond sombre
      </Heading>
    </div>
  ),
};
