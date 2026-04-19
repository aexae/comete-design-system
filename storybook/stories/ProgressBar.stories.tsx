// ProgressBar — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ProgressBar,
  type ProgressBarAppearance,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    appearance: {
      control: "select",
      options: [
        "auto",
        "critical",
        "warning",
        "information",
        "brand",
        "success",
      ] satisfies (ProgressBarAppearance | "auto")[],
    },
    showLabel: {
      control: "boolean",
    },
  },
  args: {
    value: 50,
    appearance: "auto",
    showLabel: true,
  },
  parameters: {
    layout: "padded",
    design: { type: "figma", url: figmaUrl("5794:3853") },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof ProgressBar>;

// -----------------------------------------------------------------------
// Stories

/** Barre de progression par défaut à 50 % (auto → warning). */
export const Default: Story = {};

/** Barre vide (0 %, auto → critical). */
export const Empty: Story = {
  args: { value: 0 },
};

/** Barre pleine (100 %, auto → success). */
export const Full: Story = {
  args: { value: 100 },
};

/** Sans label textuel. */
export const NoLabel: Story = {
  args: { value: 60, showLabel: false },
};

/** Apparence critique (≤ 20 %). */
export const Critical: Story = {
  args: { value: 15 },
};

/** Apparence warning (21–69 %). */
export const Warning: Story = {
  args: { value: 55 },
};

/** Apparence information (70–99 %). */
export const Information: Story = {
  args: { value: 80 },
};

/** Apparence success (100 %). */
export const Success: Story = {
  args: { value: 100 },
};

/** Apparence brand forcée manuellement. */
export const Brand: Story = {
  args: { value: 60, appearance: "brand" },
};

/** Toutes les étapes de 0 à 100 (apparence auto). */
export const AllSteps: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 300 }}>
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
        <ProgressBar key={v} value={v} />
      ))}
    </div>
  ),
  parameters: {
    design: { type: "figma", url: figmaUrl("5794:3858") },
  },
};
