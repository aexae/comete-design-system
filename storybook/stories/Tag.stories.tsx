// Tag — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag, Cluster, Stack } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2984:15878") },
    docs: {
      description: {
        component:
          "Étiquette compacte pour catégoriser, filtrer ou identifier du contenu. Supporte 7 apparences × 3 styles × 2 formes, avec des slots optionnels avant/après le label et un bouton de suppression.",
      },
    },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["neutral", "brand", "success", "warning", "critical", "information", "accent"],
    },
    tagStyle: {
      control: "inline-radio",
      options: ["bold", "subtle", "outlined"],
    },
    shape: {
      control: "inline-radio",
      options: ["square", "rounded"],
    },
    isDisabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    label: "Tag",
    appearance: "neutral",
    tagStyle: "bold",
    shape: "rounded",
    isDisabled: false,
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof Tag>;

// -----------------------------------------------------------------------
// Stories

/** Tag par défaut : neutral, bold, rounded. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2991:38480") } },
};

/** Toutes les apparences en style bold + rounded. */
export const AllAppearances: Story = {
  name: "All appearances",
  parameters: { design: { type: "figma", url: figmaUrl("466:3917") } },
  render: () => (
    <Cluster gap="100">
      <Tag label="Neutral" appearance="neutral" />
      <Tag label="Brand" appearance="brand" />
      <Tag label="Success" appearance="success" />
      <Tag label="Warning" appearance="warning" />
      <Tag label="Critical" appearance="critical" />
      <Tag label="Information" appearance="information" />
      <Tag label="Accent" appearance="accent" />
    </Cluster>
  ),
};

/** Comparaison des 3 styles : bold, subtle, outlined. */
export const AllStyles: Story = {
  name: "All styles",
  render: () => (
    <Stack gap="200">
      <Cluster gap="100">
        <Tag label="Bold" tagStyle="bold" />
        <Tag label="Bold" tagStyle="bold" appearance="brand" />
        <Tag label="Bold" tagStyle="bold" appearance="success" />
        <Tag label="Bold" tagStyle="bold" appearance="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Subtle" tagStyle="subtle" />
        <Tag label="Subtle" tagStyle="subtle" appearance="brand" />
        <Tag label="Subtle" tagStyle="subtle" appearance="success" />
        <Tag label="Subtle" tagStyle="subtle" appearance="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Outlined" tagStyle="outlined" />
        <Tag label="Outlined" tagStyle="outlined" appearance="brand" />
        <Tag label="Outlined" tagStyle="outlined" appearance="success" />
        <Tag label="Outlined" tagStyle="outlined" appearance="critical" />
      </Cluster>
    </Stack>
  ),
};

/** Comparaison des 2 formes : square vs rounded. */
export const Shapes: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Square" shape="square" />
      <Tag label="Rounded" shape="rounded" />
      <Tag label="Square" shape="square" appearance="brand" />
      <Tag label="Rounded" shape="rounded" appearance="brand" />
    </Cluster>
  ),
};

/** Tag avec bouton de suppression (×). */
export const Removable: Story = {
  args: {
    label: "Ile de France",
    appearance: "neutral",
    tagStyle: "subtle",
  },
  render: (args) => (
    <Tag {...args} onRemove={() => undefined} />
  ),
};

/** Tag avec pastille de couleur avant le label. */
export const WithElemBefore: Story = {
  name: "With elem before",
  render: () => (
    <Cluster gap="100">
      <Tag
        label="En ligne"
        appearance="success"
        tagStyle="subtle"
        elemBefore={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--background-success-bold-default)" }} />
        }
      />
      <Tag
        label="Hors ligne"
        appearance="critical"
        tagStyle="subtle"
        elemBefore={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--background-critical-bold-default)" }} />
        }
      />
    </Cluster>
  ),
};

/** Tags interactifs (avec onPress). */
export const Interactive: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Cliquez-moi" appearance="brand" onPress={() => undefined} />
      <Tag label="Filtrer" appearance="neutral" tagStyle="outlined" onPress={() => undefined} />
    </Cluster>
  ),
};

/** Tags désactivés. */
export const Disabled: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Bold" isDisabled />
      <Tag label="Subtle" tagStyle="subtle" isDisabled />
      <Tag label="Outlined" tagStyle="outlined" isDisabled />
      <Tag label="Brand" appearance="brand" isDisabled />
    </Cluster>
  ),
};

/** Matrice complète : 7 apparences × 3 styles en rounded. */
export const FullMatrix: Story = {
  name: "Full matrix",
  parameters: { design: { type: "figma", url: figmaUrl("2984:15878") } },
  render: () => {
    const appearances = ["neutral", "brand", "success", "warning", "critical", "information", "accent"] as const;
    const tagStyles = ["bold", "subtle", "outlined"] as const;
    return (
      <Stack gap="200">
        {tagStyles.map((s) => (
          <Stack key={s} gap="075">
            <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xxs)", color: "var(--text-subtlest)", textTransform: "uppercase" }}>
              {s}
            </span>
            <Cluster gap="100">
              {appearances.map((a) => (
                <Tag key={`${s}-${a}`} label={a} appearance={a} tagStyle={s} />
              ))}
            </Cluster>
          </Stack>
        ))}
      </Stack>
    );
  },
};
