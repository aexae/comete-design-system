// ModalDialog — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ModalDialog,
  Button,
  ButtonGroup,
  type ModalDialogAppearance,
  type ModalDialogWidth,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/ModalDialog",
  component: ModalDialog,
  tags: ["autodocs"],
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "warning", "critical"] satisfies ModalDialogAppearance[],
    },
    width: {
      control: "select",
      options: ["xsmall", "small", "medium", "large", "xlarge"] satisfies ModalDialogWidth[],
    },
    isDismissable: { control: "boolean" },
  },
  args: {
    title: "Modal title",
    appearance: "default",
    width: "medium",
    isDismissable: true,
  },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4613:36336") },
  },
} satisfies Meta<typeof ModalDialog>;

export default meta;
type Story = StoryObj<typeof ModalDialog>;

// -----------------------------------------------------------------------
// Helper

function ModalStory({
  appearance = "default",
  width = "medium",
  showClose = false,
}: {
  appearance?: ModalDialogAppearance;
  width?: ModalDialogWidth;
  showClose?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const confirmColor =
    appearance === "critical"
      ? "critical"
      : appearance === "warning"
        ? "warning"
        : "brand";

  return (
    <>
      <Button onPress={() => { setIsOpen(true); }}>Ouvrir la modale</Button>
      <ModalDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Confirmer l'action"
        appearance={appearance}
        width={width}
        onClose={showClose ? () => { setIsOpen(false); } : undefined}
        footer={
          <ButtonGroup>
            <Button variant="subtle" onPress={() => { setIsOpen(false); }}>
              Annuler
            </Button>
            <Button color={confirmColor} onPress={() => { setIsOpen(false); }}>
              Confirmer
            </Button>
          </ButtonGroup>
        }
      >
        <p style={{ margin: 0 }}>
          Êtes-vous sûr de vouloir effectuer cette action ? Cette opération ne
          peut pas être annulée.
        </p>
      </ModalDialog>
    </>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Modale par défaut. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7280") } },
  render: (args) => <ModalStory appearance={args.appearance} width={args.width} />,
};

/** Modale warning. */
export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7324") } },
  render: () => <ModalStory appearance="warning" />,
};

/** Modale critical. */
export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7370") } },
  render: () => <ModalStory appearance="critical" />,
};

/** Modale xsmall. */
export const XSmall: Story = {
  name: "Width xsmall",
  render: () => <ModalStory width="xsmall" />,
};

/** Modale xlarge. */
export const XLarge: Story = {
  name: "Width xlarge",
  render: () => <ModalStory width="xlarge" />,
};

/** Avec bouton close. */
export const WithClose: Story = {
  name: "With close button",
  render: () => <ModalStory showClose />,
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: () => {
    const appearances: ModalDialogAppearance[] = ["default", "warning", "critical"];
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {appearances.map((a) => (
          <ModalStory key={a} appearance={a} />
        ))}
      </div>
    );
  },
};
