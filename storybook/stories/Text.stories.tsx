// Text — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, Stack } from "@aexae/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4726:54750") },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["large", "medium", "small", "xsmall"],
    },
    weight: {
      control: "inline-radio",
      options: ["regular", "medium", "bold"],
    },
    color: {
      control: "select",
      options: [
        "default", "subtle", "subtlest", "disabled", "inverted",
        "brand", "accentPurple", "accentTeal", "accentTurquoise", "accentMagenta", "accentBlueGrey", "success", "information", "warning", "critical", "link",
      ],
    },
    align: {
      control: "inline-radio",
      options: [undefined, "start", "center", "end"],
    },
    underline: { control: "boolean" },
    italic: { control: "boolean" },
    maxLines: { control: { type: "number", min: 1, max: 10 } },
    as: { control: "select", options: ["p", "span", "strong", "em", "label", "div"] },
    children: { control: "text" },
  },
  args: {
    size: "medium",
    weight: "regular",
    color: "default",
    underline: false,
    italic: false,
    children: "Le texte de corps structure le contenu et guide l'utilisateur à travers l'interface.",
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

export const Playground: Story = {};

const SIZES = ["large", "medium", "small", "xsmall"] as const;
const WEIGHTS = ["regular", "medium", "bold"] as const;

export const AllSizes: Story = {
  render: () => (
    <Stack gap="200">
      {SIZES.map((s) => (
        <Text key={s} size={s}>
          {s} — Le texte de corps structure le contenu.
        </Text>
      ))}
    </Stack>
  ),
};

export const AllWeights: Story = {
  render: () => (
    <Stack gap="200">
      {WEIGHTS.map((w) => (
        <Text key={w} weight={w}>
          {w} — Le texte de corps structure le contenu.
        </Text>
      ))}
    </Stack>
  ),
};

export const SizeWeightMatrix: Story = {
  render: () => (
    <Stack gap="300">
      {SIZES.map((s) => (
        <Stack key={s} gap="100">
          {WEIGHTS.map((w) => (
            <Text key={`${s}-${w}`} size={s} weight={w}>
              {s}/{w} — Le texte de corps structure le contenu.
            </Text>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

const COLOR_OPTIONS = [
  "default", "subtle", "subtlest", "disabled", "brand",
  "accentPurple", "accentTeal", "accentTurquoise", "accentMagenta", "accentBlueGrey",
  "success", "information", "warning", "critical", "link",
] as const;

export const Colors: Story = {
  render: () => (
    <Stack gap="100">
      {COLOR_OPTIONS.map((c) => (
        <Text key={c} color={c}>
          color=&quot;{c}&quot; — Exemple de texte avec cette couleur.
        </Text>
      ))}
      <div style={{ background: "var(--background-neutral-bold-default)", padding: 12, borderRadius: 8 }}>
        <Text color="inverted">
          color=&quot;inverted&quot; — Texte inversé sur fond sombre.
        </Text>
      </div>
    </Stack>
  ),
};

export const UnderlineAndItalic: Story = {
  render: () => (
    <Stack gap="200">
      <Text>Normal</Text>
      <Text underline>Underline</Text>
      <Text italic>Italic</Text>
      <Text underline italic>Underline + Italic</Text>
      <Text weight="medium" underline>Medium Underline</Text>
      <Text weight="medium" underline color="subtle">Medium Underline Subtle</Text>
    </Stack>
  ),
};

export const MaxLines: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Stack gap="200">
        <Text maxLines={1}>
          Ce texte est tronqué à 1 ligne. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Text maxLines={2}>
          Ce texte est tronqué à 2 lignes. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris.
        </Text>
        <Text maxLines={3}>
          Ce texte est tronqué à 3 lignes. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Text>
      </Stack>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Stack gap="200">
        <Text align="start">align=&quot;start&quot;</Text>
        <Text align="center">align=&quot;center&quot;</Text>
        <Text align="end">align=&quot;end&quot;</Text>
      </Stack>
    </div>
  ),
};

export const AsOverride: Story = {
  render: () => (
    <Stack gap="200">
      <Text>Paragraphe par défaut (&lt;p&gt;)</Text>
      <Text as="span">Inline (&lt;span&gt;)</Text>
      <Text as="strong">Strong (&lt;strong&gt;)</Text>
      <Text as="em">Emphasis (&lt;em&gt;)</Text>
      <Text as="label">Label (&lt;label&gt;)</Text>
    </Stack>
  ),
};
