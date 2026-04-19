// Text — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, Stack } from "@naxit/comete-design-system/components";
import type {
  TextType,
  HeroVariant,
  HeadingVariant,
  BodyVariant,
  CodeVariant,
  TextColor,
  TextAlign,
} from "@naxit/comete-design-system/components";
import type { CSSProperties, ReactElement } from "react";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Variant lists per type — with default HTML tag label

const HERO_VARIANTS: { value: HeroVariant; label: string }[] = [
  { value: "xxl", label: "xxl (h1)" },
  { value: "xxl-semibold", label: "xxl-semibold (h1)" },
  { value: "xl", label: "xl (h1)" },
  { value: "xl-semibold", label: "xl-semibold (h1)" },
  { value: "l", label: "l (h1)" },
  { value: "l-semibold", label: "l-semibold (h1)" },
  { value: "m", label: "m (h1)" },
  { value: "m-bold", label: "m-bold (h1)" },
  { value: "s", label: "s (h2)" },
  { value: "s-bold", label: "s-bold (h2)" },
  { value: "xs", label: "xs (h2)" },
  { value: "xs-bold", label: "xs-bold (h2)" },
  { value: "xxs", label: "xxs (h2)" },
  { value: "xxs-bold", label: "xxs-bold (h2)" },
];

const HEADING_VARIANTS: { value: HeadingVariant; label: string }[] = [
  { value: "xxl", label: "xxl (h1)" },
  { value: "xxl-bold", label: "xxl-bold (h1)" },
  { value: "xl", label: "xl (h2)" },
  { value: "xl-bold", label: "xl-bold (h2)" },
  { value: "l", label: "l (h3)" },
  { value: "l-bold", label: "l-bold (h3)" },
  { value: "m", label: "m (h4)" },
  { value: "m-bold", label: "m-bold (h4)" },
  { value: "s", label: "s (h5)" },
  { value: "s-bold", label: "s-bold (h5)" },
  { value: "xs", label: "xs (h6)" },
  { value: "xs-bold", label: "xs-bold (h6)" },
  { value: "xxs", label: "xxs (h6)" },
  { value: "xxs-bold", label: "xxs-bold (h6)" },
];

const BODY_VARIANTS: { value: BodyVariant; label: string }[] = [
  { value: "l", label: "l (p)" },
  { value: "l-medium", label: "l-medium (p)" },
  { value: "l-bold", label: "l-bold (p)" },
  { value: "m", label: "m (p)" },
  { value: "m-medium", label: "m-medium (p)" },
  { value: "m-bold", label: "m-bold (p)" },
  { value: "s", label: "s (p)" },
  { value: "s-medium", label: "s-medium (p)" },
  { value: "s-bold", label: "s-bold (p)" },
  { value: "xs", label: "xs (p)" },
  { value: "xs-bold", label: "xs-bold (p)" },
  { value: "label", label: "label (span)" },
];

const CODE_VARIANTS: { value: CodeVariant; label: string }[] = [
  { value: "value", label: "value (code)" },
  { value: "operator", label: "operator (code)" },
  { value: "label", label: "label (code)" },
];

const VARIANT_MAP: Record<TextType, { value: string; label: string }[]> = {
  hero: HERO_VARIANTS,
  heading: HEADING_VARIANTS,
  body: BODY_VARIANTS,
  code: CODE_VARIANTS,
};

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
          "Composant typographique unifié. Applique automatiquement le style de texte et la balise HTML sémantique correspondant au type + variante. Couvre les 44 styles Comète : Hero, Heading, Body, Label et Code.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["hero", "heading", "body", "code"] satisfies TextType[],
    },
    variant: {
      control: "select",
      options: BODY_VARIANTS.map((v) => v.value),
      mapping: Object.fromEntries(BODY_VARIANTS.map((v) => [v.label, v.value])),
      labels: Object.fromEntries(
        [...HERO_VARIANTS, ...HEADING_VARIANTS, ...BODY_VARIANTS, ...CODE_VARIANTS]
          .map((v) => [v.value, v.label]),
      ),
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
    type: "body",
    variant: "m",
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
        <Text key={v.value} type="hero" variant={v.value}>
          {v.label}
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
        <Text key={v.value} type="heading" variant={v.value}>
          {v.label} — Titre de section
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
        <Text key={v.value} type="body" variant={v.value}>
          {v.label} — Le texte de corps structure le contenu et guide l&apos;utilisateur.
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
      <Text type="code" variant="value">value (code) — const theme = useTheme();</Text>
      <Text type="code" variant="operator">operator (code) — =&gt; &#123;&#125; [] ()</Text>
      <Text type="code" variant="label">label (code) — function Component()</Text>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Underline & Italic

export const UnderlineAndItalic: Story = {
  render: () => (
    <Stack gap="200">
      <Text type="body" variant="m">Normal</Text>
      <Text type="body" variant="m" underline>Underline</Text>
      <Text type="body" variant="m" italic>Italic</Text>
      <Text type="body" variant="m" underline italic>Underline + Italic</Text>
      <Text type="body" variant="m-medium" underline>Medium Underline</Text>
      <Text type="body" variant="m-medium" underline color="subtle">Medium Underline Subtle</Text>
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
        <Text key={c} type="body" variant="m" color={c}>
          color=&quot;{c}&quot; — Exemple de texte avec cette couleur.
        </Text>
      ))}
      <div style={{ background: "var(--background-neutral-bold-default)", padding: 12, borderRadius: 8 }}>
        <Text type="body" variant="m" color="inverted">
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
        <Text type="body" variant="m" align="left">
          align=&quot;left&quot;
        </Text>
        <Text type="body" variant="m" align="center">
          align=&quot;center&quot;
        </Text>
        <Text type="body" variant="m" align="right">
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
      <Text type="heading" variant="xxl" as="h2">
        heading xxl rendu en &lt;h2&gt;
      </Text>
      <Text type="body" variant="m" as="span">
        body m rendu en &lt;span&gt; (inline)
      </Text>
      <Text type="heading" variant="l" as="label">
        heading l rendu en &lt;label&gt;
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

function TypeSection({ type, sample }: { type: TextType; sample: string }): ReactElement {
  const variants = VARIANT_MAP[type];
  return (
    <div style={css.section}>
      <div style={css.sectionTitle}>{type}</div>
      {variants.map((v) => (
        <div key={v.value} style={css.row}>
          <span style={css.variantLabel}>{v.label}</span>
          {/* @ts-expect-error — variant is correctly constrained per type at runtime */}
          <Text type={type} variant={v.value}>{sample}</Text>
        </div>
      ))}
    </div>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <TypeSection type="hero" sample="Donnez vie à vos données." />
      <TypeSection type="heading" sample="Titre de section" />
      <TypeSection type="body" sample="Le texte de corps structure le contenu et guide l'utilisateur à travers l'interface." />
      <TypeSection type="code" sample="const theme = useTheme();" />
    </div>
  ),
};
