// Popover — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "@naxit/comete-design-system/components";
import { Button } from "@naxit/comete-design-system/components";
import { DialogTrigger, Dialog } from "react-aria-components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3704:70994") },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

// -----------------------------------------------------------------------
// Stories

/** Popover par défaut avec DialogTrigger. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3247:9516") } },
  render: () => (
    <DialogTrigger>
      <Button>Ouvrir le popover</Button>
      <Popover>
        <Dialog
          aria-label="Informations"
          style={{ padding: "var(--space200)", outline: "none" }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-family-primary)",
              fontSize: "var(--font-size-ui-xs)",
              lineHeight: "var(--line-height-ui-xs)",
              color: "var(--text-default)",
            }}
          >
            Contenu du popover
          </p>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
};

/** Popover avec contenu riche. */
export const RichContent: Story = {
  name: "Rich content",
  render: () => (
    <DialogTrigger>
      <Button>Détails</Button>
      <Popover>
        <Dialog
          aria-label="Détails"
          style={{ padding: "var(--space200)", outline: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-family-primary)",
              color: "var(--text-default)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-ui-s)",
                fontWeight: 600,
                lineHeight: "var(--line-height-ui-s)",
              }}
            >
              Titre
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "var(--font-size-ui-xs)",
                lineHeight: "var(--line-height-ui-xs)",
                color: "var(--text-subtle)",
              }}
            >
              Description détaillée du contenu affiché dans le popover.
            </p>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
};
