// Text — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, Stack } from "@naxit/comete-design-system/components";
import type { TextVariant, TextColor, TextAlign } from "@naxit/comete-design-system/components";
import type { CSSProperties, ReactElement } from "react";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Variant lists

const ALL_VARIANTS: TextVariant[] = [
  "hero-xxl", "hero-xxl-semibold", "hero-xl", "hero-xl-semibold",
  "hero-l", "hero-l-semibold", "hero-m", "hero-m-bold",
  "hero-s", "hero-s-bold", "hero-xs", "hero-xs-bold",
  "hero-xxs", "hero-xxs-bold",
  "heading-xxl", "heading-xxl-bold", "heading-xl", "heading-xl-bold",
  "heading-l", "heading-l-bold", "heading-m", "heading-m-bold",
  "heading-s", "heading-s-bold", "heading-xs", "heading-xs-bold",
  "heading-xxs", "heading-xxs-bold",
  "body-l", "body-l-medium", "body-l-bold",
  "body-m", "body-m-medium", "body-m-bold",
  "body-s", "body-s-medium", "body-s-bold",
  "body-xs", "body-xs-bold",
  "label",
  "code-value", "code-operator", "code-label",
];

const HERO_VARIANTS: TextVariant[] = [
  "hero-xxl", "hero-xxl-semibold", "hero-xl", "hero-xl-semibold",
  "hero-l", "hero-l-semibold", "hero-m", "hero-m-bold",
  "hero-s", "hero-s-bold", "hero-xs", "hero-xs-bold",
  "hero-xxs", "hero-xxs-bold",
];

const HEADING_VARIANTS: TextVariant[] = [
  "heading-xxl", "heading-xxl-bold", "heading-xl", "heading-xl-bold",
  "heading-l", "heading-l-bold", "heading-m", "heading-m-bold",
  "heading-s", "heading-s-bold", "heading-xs", "heading-xs-bold",
  "heading-xxs", "heading-xxs-bold",
];

const BODY_VARIANTS: TextVariant[] = [
  "body-l", "body-l-medium", "body-l-bold",
  "body-m", "body-m-medium", "body-m-bold",
  "body-s", "body-s-medium", "body-s-bold",
  "body-xs", "body-xs-bold",
  "label",
];

const CODE_VARIANTS: TextVariant[] = ["code-value", "code-operator", "code-label"];

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: figmaUrl("4726:54750") },
    docs: {
      description: {
        component:
          "Composant typographique unifié. Applique automatiquement le style de texte et la balise HTML sémantique correspondant à la variante choisie. Couvre les 44 styles Comète : Hero, Heading, Body, Label et Code.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ALL_VARIANTS,
    },
    color: {
      control: "select",
      options: [
        "default", "subtle", "subtlest", "disabled", "inverted",
        "brand", "accent", "success", "information", "warning", "critical", "link",
      ] satisfies TextColor[],
    },
    align: {
      control: "inline-radio",
      options: [undefined, "left", "center", "right"] as (TextAlign | undefined)[],
    },
    underline: { control: "boolean" },
    italic: { control: "boolean" },
    as: { control: "text" },
    children: { control: "text" },
  },
  args: {
    variant: "body-m",
    color: "default",
    underline: false,
    italic: false,
    children: "Le texte de corps structure le contenu et guide l'utilisateur à travers l'interface.",
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Playground

export const Playground: Story = {};

// -----------------------------------------------------------------------
// Hero

export const Hero: Story = {
  render: () => (
    <Stack gap="300">
      {HERO_VARIANTS.map((v) => (
        <Text key={v} variant={v}>
          {v}
        </Text>
      ))}
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Heading

export const Heading: Story = {
  render: () => (
    <Stack gap="200">
      {HEADING_VARIANTS.map((v) => (
        <Text key={v} variant={v}>
          {v} — Titre de section
        </Text>
      ))}
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Body

export const Body: Story = {
  render: () => (
    <Stack gap="200">
      {BODY_VARIANTS.map((v) => (
        <Text key={v} variant={v}>
          {v} — Le texte de corps structure le contenu et guide l&apos;utilisateur.
        </Text>
      ))}
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Code

export const Code: Story = {
  render: () => (
    <Stack gap="200">
      <Text variant="code-value">code-value — const theme = useTheme();</Text>
      <Text variant="code-operator">code-operator — =&gt; &#123;&#125; [] ()</Text>
      <Text variant="code-label">code-label — function Component()</Text>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Underline & Italic

export const UnderlineAndItalic: Story = {
  render: () => (
    <Stack gap="200">
      <Text variant="body-m">Normal</Text>
      <Text variant="body-m" underline>Underline</Text>
      <Text variant="body-m" italic>Italic</Text>
      <Text variant="body-m" underline italic>Underline + Italic</Text>
      <Text variant="body-m-medium" underline>Medium Underline</Text>
      <Text variant="body-m-medium" underline color="subtle">Medium Underline Subtle</Text>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Colors

const COLOR_OPTIONS: TextColor[] = [
  "default", "subtle", "subtlest", "disabled", "brand", "accent",
  "success", "information", "warning", "critical", "link",
];

export const Colors: Story = {
  render: () => (
    <Stack gap="100">
      {COLOR_OPTIONS.map((c) => (
        <Text key={c} variant="body-m" color={c}>
          color=&quot;{c}&quot; — Exemple de texte avec cette couleur.
        </Text>
      ))}
      <div style={{ background: "var(--background-neutral-bold-default)", padding: 12, borderRadius: 8 }}>
        <Text variant="body-m" color="inverted">
          color=&quot;inverted&quot; — Texte inversé sur fond sombre.
        </Text>
      </div>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Alignment

export const Alignment: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Stack gap="200">
        <Text variant="body-m" align="left">
          align=&quot;left&quot;
        </Text>
        <Text variant="body-m" align="center">
          align=&quot;center&quot;
        </Text>
        <Text variant="body-m" align="right">
          align=&quot;right&quot;
        </Text>
      </Stack>
    </div>
  ),
};

// -----------------------------------------------------------------------
// Override avec as

export const AsOverride: Story = {
  render: () => (
    <Stack gap="200">
      <Text variant="heading-xxl" as="h2">
        heading-xxl rendu en &lt;h2&gt;
      </Text>
      <Text variant="body-m" as="span">
        body-m rendu en &lt;span&gt; (inline)
      </Text>
      <Text variant="heading-l" as="label">
        heading-l rendu en &lt;label&gt;
      </Text>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Full matrix

const css = {
  section: { marginBottom: 40 } satisfies CSSProperties,
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--text-subtlest)",
    marginBottom: 16,
    borderBottom: "1px solid var(--border-subtle)",
    paddingBottom: 8,
  } satisfies CSSProperties,
  row: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    alignItems: "baseline",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid var(--border-subtle)",
  } satisfies CSSProperties,
  variantLabel: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "var(--text-subtlest)",
  } satisfies CSSProperties,
};

function VariantRow({ variant, sample }: { variant: TextVariant; sample: string }): ReactElement {
  return (
    <div style={css.row}>
      <span style={css.variantLabel}>{variant}</span>
      <Text variant={variant}>{sample}</Text>
    </div>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <div style={css.section}>
        <div style={css.sectionTitle}>Hero</div>
        {HERO_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} sample="Donnez vie à vos données." />
        ))}
      </div>
      <div style={css.section}>
        <div style={css.sectionTitle}>Heading</div>
        {HEADING_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} sample="Titre de section" />
        ))}
      </div>
      <div style={css.section}>
        <div style={css.sectionTitle}>Body</div>
        {BODY_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} sample="Le texte de corps structure le contenu et guide l'utilisateur à travers l'interface." />
        ))}
      </div>
      <div style={css.section}>
        <div style={css.sectionTitle}>Code</div>
        {CODE_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} sample="const theme = useTheme();" />
        ))}
      </div>
    </div>
  ),
};
