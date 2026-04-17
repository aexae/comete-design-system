// Badge — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { BadgeAppearance, BadgeImportance } from "@naxit/comete-design-system/components";
import { Badge } from "@naxit/comete-design-system/components";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("341-2448") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: [
        "neutral",
        "primary",
        "primary-inverted",
        "critical",
        "success",
        "warning",
        "accent",
      ] satisfies BadgeAppearance[],
    },
    importance: {
      control: "select",
      options: ["high", "medium", "low"] satisfies BadgeImportance[],
    },
    label: { control: "text" },
    cutoutBorder: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: {
    appearance: "neutral",
    importance: "high",
    label: "Badge",
    cutoutBorder: false,
    isDisabled: false,
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("582-27488") } },
};

export const LowImportance: Story = {
  name: "Low importance (dot)",
  parameters: {
    design: { type: "figma", url: figmaUrl("2952-14713") },
    docs: {
      source: {
        code: `<Badge appearance="neutral" importance="low" />
<Badge appearance="primary" importance="low" />
<Badge appearance="critical" importance="low" />
<Badge appearance="success" importance="low" />
<Badge appearance="warning" importance="low" />
<Badge appearance="accent" importance="low" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {(["neutral", "primary", "critical", "success", "warning", "accent"] as BadgeAppearance[]).map(
        (appearance) => (
          <Badge key={appearance} appearance={appearance} importance="low" />
        )
      )}
    </div>
  ),
};

export const MediumImportance: Story = {
  name: "Medium importance",
  parameters: { design: { type: "figma", url: figmaUrl("2951-14451") } },
  args: { importance: "medium", label: "24" },
};

export const HighImportance: Story = {
  name: "High importance",
  parameters: { design: { type: "figma", url: figmaUrl("582-27488") } },
  args: { importance: "high", label: "24" },
};

export const WithCutoutBorder: Story = {
  name: "Cutout border",
  parameters: {
    design: { type: "figma", url: figmaUrl("2953-6891") },
    docs: {
      source: {
        code: `// Le cutoutBorder ajoute un anneau blanc autour du badge
// → utile quand le badge est superposé à un avatar ou un fond coloré.
<Badge appearance="critical" importance="high" label="99" cutoutBorder />`,
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        padding: 24,
        background: "var(--background-neutral-bold-default)",
        borderRadius: 12,
      }}
    >
      {(["neutral", "primary", "critical", "success", "warning", "accent"] as BadgeAppearance[]).map(
        (appearance) => (
          <Badge key={appearance} appearance={appearance} importance="high" label="99" cutoutBorder />
        )
      )}
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("2953-7040") },
    docs: {
      source: {
        code: `<Badge appearance="neutral" importance="high" label="Disabled" isDisabled />
<Badge appearance="primary" importance="medium" label="Disabled" isDisabled />
<Badge appearance="critical" importance="low" isDisabled />`,
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Badge appearance="neutral" importance="high" label="Disabled" isDisabled />
      <Badge appearance="primary" importance="medium" label="Disabled" isDisabled />
      <Badge appearance="critical" importance="low" isDisabled />
    </div>
  ),
};

export const AllAppearances: Story = {
  name: "All appearances",
  parameters: {
    design: { type: "figma", url: figmaUrl("341-2448") },
    docs: {
      source: {
        code: `// Chaque appearance décline les 3 niveaux d'importance (high / medium / low).
<Badge appearance="neutral" importance="high" label="High" />
<Badge appearance="neutral" importance="medium" label="Medium" />
<Badge appearance="neutral" importance="low" />

// Autres appearances disponibles :
// "primary" | "primary-inverted" | "critical" | "success" | "warning" | "accent"`,
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(
        [
          "neutral",
          "primary",
          "primary-inverted",
          "critical",
          "success",
          "warning",
          "accent",
        ] as const
      ).map((appearance) => (
        <div key={appearance} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Badge appearance={appearance} importance="high" label="High" />
          <Badge appearance={appearance} importance="medium" label="Medium" />
          <Badge appearance={appearance} importance="low" />
          <span style={{ marginLeft: 24, width: 120, fontSize: 12, color: "var(--text-subtle)", fontFamily: "monospace" }}>
            {appearance}
          </span>
        </div>
      ))}
    </div>
  ),
};
