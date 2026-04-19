// Hero — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hero, Stack } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const SIZES = [
  "xxlarge", "xlarge", "large", "medium", "small", "xsmall", "xxsmall",
] as const;

type HeroSize = (typeof SIZES)[number];

const SIZE_LABELS: Record<HeroSize, string> = {
  xxlarge: "xxlarge (h1) — 96px bold",
  xlarge: "xlarge (h1) — 80px bold",
  large: "large (h1) — 72px bold",
  medium: "medium (h1) — 64px semibold",
  small: "small (h2) — 56px semibold",
  xsmall: "xsmall (h2) — 48px semibold",
  xxsmall: "xxsmall (h2) — 40px semibold",
};

const meta = {
  title: "Components/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: figmaUrl("4726:54750") },
    docs: {
      description: {
        component:
          "Texte d'accroche à très grande échelle. Réservé aux pages marketing, dashboards de métriques clés ou écrans de bienvenue. 7 tailles, 1 poids fixe par taille.",
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
    children: "Donnez vie à vos données.",
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

export const Playground: Story = {};

export const AllSizes: Story = {
  render: () => (
    <Stack gap="300">
      {SIZES.map((s) => (
        <Hero key={s} size={s}>
          {SIZE_LABELS[s]}
        </Hero>
      ))}
    </Stack>
  ),
};

export const Inverse: Story = {
  render: () => (
    <div style={{ background: "var(--background-neutral-bold-default)", padding: 32, borderRadius: 8 }}>
      <Hero size="large" color="inverse">
        Texte inversé sur fond sombre
      </Hero>
    </div>
  ),
};
