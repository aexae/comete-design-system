// Card — stories Storybook
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  CardDrag,
  CardAppearance,
  CardColor,
} from "@naxit/comete-design-system/components";
import { Card, Stack, Text, Heading, Divider, Icon, Bleed } from "@naxit/comete-design-system/components";
import { expect, fn, userEvent, within } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Helpers

function CardContent({ label = "Contenu" }: { label?: string }) {
  return (
    <div style={{ padding: 16, width: 200, maxWidth: "100%", boxSizing: "border-box" }}>
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

function Row({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <Stack direction="row" gap="150" align="center">
      <Icon icon={icon as never} color="subtlest" />
      <Stack gap="0">
        <Text size="small" weight="medium" as="span">{label}</Text>
        {value && <Text size="small" color="subtle" as="span">{value}</Text>}
      </Stack>
    </Stack>
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
    drag: {
      control: "select",
      options: ["none", "top", "left"] satisfies CardDrag[],
    },
    appearance: {
      control: "select",
      options: ["outlined", "default"] satisfies CardAppearance[],
    },
    color: {
      control: "select",
      options: ["neutral", "brand", "success", "warning", "critical", "information", "accent", "sunken", "raised"] satisfies CardColor[],
    },
    className: { control: "text" },
    onPress: { action: "onPress" },
    onDrag: { action: "onDrag" },
    onDragEnd: { action: "onDragEnd" },
  },
  args: {
    drag: "none",
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
  args: { onPress: fn() },
};

/** Poignée de drag en haut. */
export const DragTop: Story = {
  name: "Drag top",
  parameters: { design: { type: "figma", url: figmaUrl("5467:27893") } },
  args: {
    drag: "top",
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
    drag: "left",
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
  args: { onPress: fn() },
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
  args: { onPress: fn() },
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

/** Bleed — cartes débordant du padding parent (pattern mobile). */
export const BleedExample: Story = {
  name: "Bleed",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ maxWidth: 375, margin: "0 auto", background: "var(--background-surface-elevation-sunken-default)", minHeight: "100vh" }}>
      <Stack padding="200" gap="200">
        <Heading size="medium" as="span">Profil</Heading>
        <Text color="subtle">Les cartes débordent du padding via le composant Bleed.</Text>

        <Bleed inline="200">
          <Card appearance="outlined">
            <Stack padding="200" gap="150">
              <Row icon="Person" label="Nom" value="DUPONT Marie" />
              <Divider />
              <Row icon="Mail" label="E-mail" value="marie.dupont@mail.com" />
              <Divider />
              <Row icon="LocationOn" label="Secteur" value="Ile de France" />
            </Stack>
          </Card>
        </Bleed>

        <Text size="xsmall" weight="medium" color="subtlest">ACTIONS</Text>

        <Bleed inline="200">
          <Card appearance="outlined">
            <Stack padding="200" gap="150">
              <Row icon="Newspaper" label="Documents" />
              <Divider />
              <Row icon="CalendarMonth" label="Planning site" />
              <Divider />
              <Row icon="History" label="Main courante" />
            </Stack>
          </Card>
        </Bleed>
      </Stack>
    </div>
  ),
};

// -----------------------------------------------------------------------

/** Toutes les combinaisons appearance × drag/actionable. */
export const AllVariants: Story = {
  name: "All variants",
  parameters: { design: { type: "figma", url: figmaUrl("5467:27892") } },
  render: () => {
    const appearances: CardAppearance[] = ["outlined", "default"];
    const columns: { label: string; drag: CardDrag; actionable: boolean }[] = [
      { label: "default", drag: "none", actionable: false },
      { label: "actionable", drag: "none", actionable: true },
      { label: "drag top", drag: "top", actionable: false },
      { label: "drag left", drag: "left", actionable: false },
    ];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${String(columns.length)}, 1fr)`,
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Header row */}
        <div />
        {columns.map((col) => (
          <span
            key={col.label}
            style={{
              fontSize: 12,
              color: "var(--text-subtlest)",
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            {col.label}
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
            {columns.map((col) => (
              <Card
                key={`${a}-${col.label}`}
                appearance={a}
                drag={col.drag}
                onPress={col.actionable ? () => {} : undefined}
              >
                <CardContent label={col.label} />
              </Card>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  },
};
