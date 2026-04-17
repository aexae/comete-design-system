// Card — stories Storybook
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  CardVariant,
  CardAppearance,
} from "@naxit/comete-design-system/components";
import { Card } from "@naxit/comete-design-system/components";
import { expect, fn, userEvent, within } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Helpers

function CardContent({ label = "Contenu" }: { label?: string }) {
  return (
    <div style={{ padding: 16, width: 200 }}>
      <p
        style={{
          margin: 0,
          color: "var(--text-default)",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          color: "var(--text-subtlest)",
          fontSize: 12,
        }}
      >
        Description
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("5467:27892") },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "drag-top",
        "drag-left",
        "actionable",
      ] satisfies CardVariant[],
    },
    appearance: {
      control: "select",
      options: ["outlined", "neutral"] satisfies CardAppearance[],
    },
    className: { control: "text" },
    onPress: { action: "onPress" },
    onDrag: { action: "onDrag" },
    onDragEnd: { action: "onDragEnd" },
  },
  args: {
    variant: "default",
    appearance: "outlined",
    children: <CardContent />,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

// -----------------------------------------------------------------------
// Stories

/** Carte statique par défaut. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("5760:6007") } },
};

/** Apparence neutral (fond grisé). */
export const Neutral: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("5467:28520") } },
  args: { appearance: "neutral" },
};

/** Carte cliquable avec hover, press et focus ring. */
export const Actionable: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("5467:28780") } },
  args: { variant: "actionable", onPress: fn() },
};

/** Poignée de drag en haut. */
export const DragTop: Story = {
  name: "Drag top",
  parameters: { design: { type: "figma", url: figmaUrl("5467:27893") } },
  args: {
    variant: "drag-top",
    appearance: "neutral",
    onDrag: fn(),
    onDragEnd: fn(),
  },
};

/** Poignée de drag à gauche. */
export const DragLeft: Story = {
  name: "Drag left",
  parameters: { design: { type: "figma", url: figmaUrl("5467:28754") } },
  args: {
    variant: "drag-left",
    appearance: "neutral",
    onDrag: fn(),
    onDragEnd: fn(),
  },
};

// -----------------------------------------------------------------------
// Play functions — tests d'interaction

/** Vérifie que onPress est appelé au clic. */
export const PressInteraction: Story = {
  name: "Press interaction",
  args: { variant: "actionable", onPress: fn() },
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onPress?: () => void };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Vérifie la navigation clavier (Enter). */
export const KeyboardNavigation: Story = {
  name: "Keyboard navigation",
  args: { variant: "actionable", onPress: fn() },
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onPress?: () => void };
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("button");
    card.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

// -----------------------------------------------------------------------

/** Toutes les combinaisons appearance × variant. */
export const AllVariants: Story = {
  name: "All variants",
  parameters: { design: { type: "figma", url: figmaUrl("5467:27892") } },
  render: () => {
    const appearances: CardAppearance[] = ["outlined", "neutral"];
    const variants: CardVariant[] = [
      "default",
      "actionable",
      "drag-top",
      "drag-left",
    ];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${String(variants.length)}, 1fr)`,
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Header row */}
        <div />
        {variants.map((v) => (
          <span
            key={v}
            style={{
              fontSize: 12,
              color: "var(--text-subtlest)",
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            {v}
          </span>
        ))}

        {/* Data rows */}
        {appearances.map((a) => (
          <React.Fragment key={a}>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-subtlest)",
                fontFamily: "monospace",
              }}
            >
              {a}
            </span>
            {variants.map((v) => (
              <Card
                key={`${a}-${v}`}
                appearance={a}
                variant={v}
                onPress={v === "actionable" ? () => {} : undefined}
              >
                <CardContent label={v} />
              </Card>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  },
};
