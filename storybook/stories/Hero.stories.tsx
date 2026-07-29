// Hero — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hero, Stack } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
    docs: {
      description: { component: "Le hero est une section d'accroche pleine largeur placée en haut de page pour capter l'attention. Il combine généralement un titre, une description et une illustration ou un appel à l'action." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <Hero size="small" as="h2">
                    Donnez vie à vos données.
                  </Hero>
                ),
                caption: "Accroche forte en tête de page ou de section.",
              }}
              dontExample={{
                example: (
                  <Hero size="xxlarge" as="h2">
                    Paramètres du compte
                  </Hero>
                ),
                caption: "Ne pas l'utiliser pour un titre de section standard.",
              }}
              when={[
                "Titre d'accroche de grande taille en tête de page ou de section (landing, en-tête éditorial).",
                "Quand une hiérarchie typographique forte est recherchée.",
              ]}
              avoid={[
                "Un titre de section standard → Heading.",
                "Du corps de texte → Text.",
                "Un bloc d'état pleine page → InformativeState.",
              ]}
              best={[
                "Une seule accroche Hero par vue ; choisir la taille selon le niveau (h1/h2) et l'espace.",
                "Texte court et percutant ; respecter la hiérarchie sémantique (`as` h1/h2).",
              ]}
              accessibility={[
                "Respecter le niveau sémantique (`as` h1/h2) dans la hiérarchie de titres.",
                "Une seule accroche Hero par vue.",
              ]}
            />
          }
        />
      ),
    },
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

export const Inverted: Story = {
  args: {
    color: "inverted",
    size: "large",
    children: "Texte inversé sur fond sombre",
  },
  render: (args) => (
    <div style={{ background: "var(--background-neutral-bold-default)", padding: 32, borderRadius: 8 }}>
      <Hero {...args} />
    </div>
  ),
};

export const Align: Story = {
  render: () => (
    <Stack gap="300" style={{ width: 800 }}>
      <Hero size="small" align="start" style={{ border: "1px solid var(--border-default)" }}>Aligné à gauche</Hero>
      <Hero size="small" align="center" style={{ border: "1px solid var(--border-default)" }}>Centré</Hero>
      <Hero size="small" align="end" style={{ border: "1px solid var(--border-default)" }}>Aligné à droite</Hero>
    </Stack>
  ),
};

export const Italic: Story = {
  args: {
    italic: true,
    size: "large",
    children: "Donnez vie à vos données.",
  },
};

export const MaxLines: Story = {
  args: {
    maxLines: 2,
    size: "small",
    children:
      "Un titre d’accroche très long qui dépasse largement la largeur disponible et se retrouve tronqué proprement après deux lignes avec des points de suspension.",
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Hero {...args} />
    </div>
  ),
};
