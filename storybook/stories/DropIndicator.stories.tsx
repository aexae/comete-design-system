// DropIndicator — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DropIndicator,
  type DropIndicatorOrientation,
  type DropIndicatorAppearance,
  type DropIndicatorSide,
} from "@aexae/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/DropIndicator",
  component: DropIndicator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"] satisfies DropIndicatorOrientation[],
    },
    appearance: {
      control: "select",
      options: ["round", "angle"] satisfies DropIndicatorAppearance[],
    },
    side: {
      control: "select",
      options: ["start", "end", "both"] satisfies DropIndicatorSide[],
    },
  },
  args: {
    orientation: "horizontal",
    appearance: "round",
    side: "both",
  },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("6284:794") },
  },
} satisfies Meta<typeof DropIndicator>;

export default meta;
type Story = StoryObj<typeof DropIndicator>;

// -----------------------------------------------------------------------
// Stories

/** Indicateur horizontal avec cercles (par défaut). */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("6284:1095") } },
  render: (args) => (
    <div style={{ width: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Indicateur avec triangles rentrants. */
export const Angle: Story = {
  args: { appearance: "angle" },
  render: (args) => (
    <div style={{ width: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Triangle uniquement côté start. */
export const AngleStart: Story = {
  name: "Angle — start only",
  args: { appearance: "angle", side: "start" },
  render: (args) => (
    <div style={{ width: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Cercle uniquement côté end. */
export const RoundEnd: Story = {
  name: "Round — end only",
  args: { side: "end" },
  render: (args) => (
    <div style={{ width: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Indicateur vertical. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ height: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Vertical avec triangles. */
export const VerticalAngle: Story = {
  name: "Vertical angle",
  args: { orientation: "vertical", appearance: "angle" },
  render: (args) => (
    <div style={{ height: 120 }}>
      <DropIndicator {...args} />
    </div>
  ),
};

/** Démo entre deux blocs (contexte drag & drop). */
export const InContainer: Story = {
  name: "In container",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 300,
        padding: 16,
        border: "1px dashed var(--border-default)",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          height: 48,
          background: "var(--background-neutral-subtlest-default)",
          borderRadius: 4,
        }}
      />
      <DropIndicator />
      <div
        style={{
          height: 48,
          background: "var(--background-neutral-subtlest-default)",
          borderRadius: 4,
        }}
      />
    </div>
  ),
};

/** Toutes les combinaisons. */
export const AllVariants: Story = {
  name: "All variants",
  render: () => {
    const appearances: DropIndicatorAppearance[] = ["round", "angle"];
    const sides: DropIndicatorSide[] = ["both", "start", "end"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 300 }}>
        {appearances.map((a) =>
          sides.map((s) => (
            <div key={`${a}-${s}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "var(--text-subtlest)",
                }}
              >
                appearance={a} side={s}
              </span>
              <DropIndicator appearance={a} side={s} />
            </div>
          ))
        )}
      </div>
    );
  },
};
