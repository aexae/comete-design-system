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
  },
  argTypes: {
    color: {
      control: "select",
      options: ["neutral", "brand", "success", "warning", "critical", "information", "accentPurple"],
    },
    appearance: {
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
    color: "neutral",
    appearance: "subtle",
    shape: "square",
    isDisabled: false,
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof Tag>;

// -----------------------------------------------------------------------
// Stories

/** Tag par défaut : neutral, subtle, square. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2991:38480") } },
};

/** Toutes les couleurs en style subtle + square. */
export const AllColors: Story = {
  name: "All colors",
  parameters: { design: { type: "figma", url: figmaUrl("466:3917") } },
  render: () => (
    <Cluster gap="100">
      <Tag label="Neutral" color="neutral" />
      <Tag label="Brand" color="brand" />
      <Tag label="Success" color="success" />
      <Tag label="Warning" color="warning" />
      <Tag label="Critical" color="critical" />
      <Tag label="Information" color="information" />
      <Tag label="Accent" color="accentPurple" />
    </Cluster>
  ),
};

/** Comparaison des 3 apparences : bold, subtle, outlined. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: () => (
    <Stack gap="200">
      <Cluster gap="100">
        <Tag label="Bold" appearance="bold" />
        <Tag label="Bold" appearance="bold" color="brand" />
        <Tag label="Bold" appearance="bold" color="success" />
        <Tag label="Bold" appearance="bold" color="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Subtle" appearance="subtle" />
        <Tag label="Subtle" appearance="subtle" color="brand" />
        <Tag label="Subtle" appearance="subtle" color="success" />
        <Tag label="Subtle" appearance="subtle" color="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Outlined" appearance="outlined" />
        <Tag label="Outlined" appearance="outlined" color="brand" />
        <Tag label="Outlined" appearance="outlined" color="success" />
        <Tag label="Outlined" appearance="outlined" color="critical" />
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
      <Tag label="Square" shape="square" color="brand" />
      <Tag label="Rounded" shape="rounded" color="brand" />
    </Cluster>
  ),
};

/** Tag avec bouton de suppression. */
export const Removable: Story = {
  args: {
    label: "Ile de France",
    color: "neutral",
    appearance: "subtle",
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
        color="success"
        appearance="subtle"
        elemBefore={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--background-success-bold-default)" }} />
        }
      />
      <Tag
        label="Hors ligne"
        color="critical"
        appearance="subtle"
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
      <Tag label="Cliquez-moi" color="brand" onPress={() => undefined} />
      <Tag label="Filtrer" color="neutral" appearance="outlined" onPress={() => undefined} />
    </Cluster>
  ),
};

/** Tag removable avec focus ring sur le bouton. */
export const RemovableFocusRing: Story = {
  name: "Removable — focus ring",
  parameters: { design: { type: "figma", url: figmaUrl("2991:38494") } },
  render: () => (
    <Cluster gap="100">
      <Tag label="Neutral" onRemove={() => undefined} />
      <Tag label="Brand" color="brand" onRemove={() => undefined} />
      <Tag label="Success" color="success" appearance="subtle" onRemove={() => undefined} />
      <Tag label="Outlined" appearance="outlined" onRemove={() => undefined} />
    </Cluster>
  ),
};

/** Tags désactivés. */
export const Disabled: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Bold" appearance="bold" isDisabled />
      <Tag label="Subtle" appearance="subtle" isDisabled />
      <Tag label="Outlined" appearance="outlined" isDisabled />
      <Tag label="Brand" color="brand" isDisabled />
    </Cluster>
  ),
};

/** Matrice complète : 7 couleurs × 3 apparences × 2 shapes. */
export const FullMatrix: Story = {
  name: "Full matrix",
  parameters: { design: { type: "figma", url: figmaUrl("2984:15878") } },
  render: () => {
    const colors = ["neutral", "brand", "success", "warning", "critical", "information", "accentPurple"] as const;
    const appearances = ["bold", "subtle", "outlined"] as const;
    const shapes = ["square", "rounded"] as const;
    return (
      <Stack gap="400">
        {shapes.map((shape) => (
          <Stack key={shape} gap="200">
            <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", fontWeight: 600, color: "var(--text-default)" }}>
              {shape}
            </span>
            {appearances.map((a) => (
              <Stack key={a} gap="075">
                <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xxs)", color: "var(--text-subtlest)", textTransform: "uppercase" }}>
                  {a}
                </span>
                <Cluster gap="100">
                  {colors.map((c) => (
                    <Tag key={`${shape}-${a}-${c}`} label={c} color={c} appearance={a} shape={shape} />
                  ))}
                </Cluster>
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    );
  },
};
