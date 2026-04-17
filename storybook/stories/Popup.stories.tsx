// Popup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popup, Button } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const PLACEMENTS = [
  "top start",
  "top",
  "top end",
  "bottom start",
  "bottom",
  "bottom end",
  "left",
  "right",
  "start",
  "end",
] as const;

const meta = {
  title: "Components/Popup",
  component: Popup,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: PLACEMENTS,
      description: "Position du popover par rapport au trigger",
    },
    offset: {
      control: { type: "number", min: 0, max: 32, step: 2 },
      description: "Décalage vertical en px",
    },
  },
  args: {
    placement: "bottom start",
    offset: 4,
  },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3247:5981") },
  },
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof Popup>;

// -----------------------------------------------------------------------
// Stories

/** Popup bottom-start (par défaut). */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3255:9400") } },
  render: (args) => (
    <Popup trigger={<Button>Ouvrir</Button>} placement={args.placement} offset={args.offset}>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-default)",
        }}
      >
        Contenu du popup
      </p>
    </Popup>
  ),
};

/** Popup top-start. */
export const TopStart: Story = {
  name: "Top start",
  parameters: { design: { type: "figma", url: figmaUrl("3255:9382") } },
  render: () => (
    <div style={{ paddingTop: 120 }}>
      <Popup trigger={<Button>Top start</Button>} placement="top start">
        <p style={{ margin: 0 }}>Popup en haut à gauche</p>
      </Popup>
    </div>
  ),
};

/** Popup bottom-end. */
export const BottomEnd: Story = {
  name: "Bottom end",
  parameters: { design: { type: "figma", url: figmaUrl("3255:9412") } },
  render: () => (
    <Popup trigger={<Button>Bottom end</Button>} placement="bottom end">
      <p style={{ margin: 0 }}>Popup en bas à droite</p>
    </Popup>
  ),
};

/** Tous les placements. */
export const AllPlacements: Story = {
  name: "All placements",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
        padding: 120,
      }}
    >
      {PLACEMENTS.map((p) => (
        <Popup key={p} trigger={<Button>{p}</Button>} placement={p}>
          <p style={{ margin: 0, whiteSpace: "nowrap" }}>{p}</p>
        </Popup>
      ))}
    </div>
  ),
};
