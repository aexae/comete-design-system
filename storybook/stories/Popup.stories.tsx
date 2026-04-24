// Popup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popup, Button } from "@naxit/comete-design-system/components";
import type { PopupPlacement } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const PLACEMENTS: PopupPlacement[] = [
  "top-left",
  "top",
  "top-right",
  "bottom-left",
  "bottom",
  "bottom-right",
  "left-top",
  "left",
  "left-bottom",
  "right-top",
  "right",
  "right-bottom",
];

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
    placement: "bottom-left",
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

/** Popup bottom-left (par défaut). */
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

/** Popup top-left. */
export const TopLeft: Story = {
  name: "Top left",
  parameters: { design: { type: "figma", url: figmaUrl("3255:9382") } },
  render: () => (
    <div style={{ paddingTop: 120 }}>
      <Popup trigger={<Button>Top left</Button>} placement="top-left">
        <p style={{ margin: 0 }}>Popup en haut à gauche</p>
      </Popup>
    </div>
  ),
};

/** Popup bottom-right. */
export const BottomRight: Story = {
  name: "Bottom right",
  parameters: { design: { type: "figma", url: figmaUrl("3255:9412") } },
  render: () => (
    <Popup trigger={<Button>Bottom right</Button>} placement="bottom-right">
      <p style={{ margin: 0 }}>Popup en bas à droite</p>
    </Popup>
  ),
};

/** Tous les placements — disposés spatialement comme MUI. */
export const AllPlacements: Story = {
  name: "All placements",
  parameters: { layout: "fullscreen" },
  render: () => {
    const cell = (p: PopupPlacement) => (
      <Popup key={p} trigger={<Button appearance="subtle">{p}</Button>} placement={p}>
        <p style={{ margin: 0, whiteSpace: "nowrap" }}>{p}</p>
      </Popup>
    );
    const e = <div />;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, auto)",
          justifyContent: "center",
          alignItems: "center",
          gap: "var(--space200)",
          padding: "120px 80px",
        }}
      >
        {/* Row 1 : top */}
        {e}
        {cell("top-left")}
        {cell("top")}
        {cell("top-right")}
        {e}

        {/* Row 2 : left-top / right-top */}
        {cell("left-top")}
        {e}{e}{e}
        {cell("right-top")}

        {/* Row 3 : left / right */}
        {cell("left")}
        {e}{e}{e}
        {cell("right")}

        {/* Row 4 : left-bottom / right-bottom */}
        {cell("left-bottom")}
        {e}{e}{e}
        {cell("right-bottom")}

        {/* Row 5 : bottom */}
        {e}
        {cell("bottom-left")}
        {cell("bottom")}
        {cell("bottom-right")}
        {e}
      </div>
    );
  },
};
