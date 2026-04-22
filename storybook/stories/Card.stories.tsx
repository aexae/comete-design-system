// Card — stories Storybook
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  CardDrag,
  CardAppearance,
  CardColor,
} from "@naxit/comete-design-system/components";
import {
  Card,
  Stack,
  Heading,
  Text,
  Icon,
  Tag,
  Cluster,
  Divider,
} from "@naxit/comete-design-system/components";
import { expect, fn, userEvent, within } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Constants

const ALL_COLORS: CardColor[] = ["neutral", "brand", "success", "warning", "critical", "information", "accent", "client"];
const ALL_APPEARANCES: CardAppearance[] = ["outlined", "subtle", "bold"];

// -----------------------------------------------------------------------
// Helpers

function CC({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "var(--space200)", minWidth: 180 }}>{children}</div>;
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
      options: ALL_APPEARANCES,
    },
    color: {
      control: "select",
      options: ALL_COLORS,
    },
    className: { control: "text" },
    onPress: { action: "onPress" },
    onDrag: { action: "onDrag" },
    onDragEnd: { action: "onDragEnd" },
    isDisabled: { control: "boolean" },
    isSelected: { control: "boolean" },
  },
  args: {
    drag: "none",
    appearance: "outlined",
    color: "neutral",
    children: (
      <CC>
        <Stack gap="075">
          <Heading size="xsmall" as="span">Titre de la carte</Heading>
          <Text size="small" as="span" color="subtlest">Description secondaire</Text>
        </Stack>
      </CC>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

// -----------------------------------------------------------------------
// Stories

/** Carte outlined statique (non-actionnable). */
export const Default: Story = {};

/** Carte avec fond subtil. */
export const Subtle: Story = {
  args: { appearance: "subtle" },
};

/** Carte avec fond bold (texte inversé). */
export const Bold: Story = {
  args: { appearance: "bold", color: "brand" },
};

/** Carte cliquable avec hover, press et focus ring. Vérifie que onPress est appelé au clic. */
export const Actionable: Story = {
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

/** Carte sélectionnée (anneau focus ring). */
export const Selected: Story = {
  args: { isSelected: true },
};

/** Carte désactivée (tokens disabled sur bordure/fond/texte/icônes). */
export const Disabled: Story = {
  args: { isDisabled: true },
};

/** Poignée de drag en haut. */
export const DragTop: Story = {
  name: "Drag top",
  args: { drag: "top", appearance: "subtle", onDrag: fn(), onDragEnd: fn() },
};

/** Poignée de drag à gauche. */
export const DragLeft: Story = {
  name: "Drag left",
  args: { drag: "left", appearance: "subtle", onDrag: fn(), onDragEnd: fn() },
};

// -----------------------------------------------------------------------
// Couleurs × apparences

/** Toutes les couleurs pour chaque apparence. */
export const AllColors: Story = {
  name: "All colors",
  render: () => (
    <Stack gap="400">
      {ALL_APPEARANCES.map((a) => (
        <Stack key={a} gap="200">
          <Text size="small" weight="medium" as="span" color="subtlest">
            appearance=&quot;{a}&quot;
          </Text>
          <Cluster gap="150">
            {ALL_COLORS.map((c) => (
              <Card key={`${a}-${c}`} appearance={a} color={c}>
                <CC>
                  <Stack gap="050">
                    <Heading size="xsmall" as="span">{c}</Heading>
                    <Text size="small" as="span" color="subtlest">{a}</Text>
                  </Stack>
                </CC>
              </Card>
            ))}
          </Cluster>
        </Stack>
      ))}
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// États

/** Tous les états (default, actionable, selected, disabled, drag) par apparence. */
export const States: Story = {
  name: "States",
  render: () => {
    const states: { label: string; props: Partial<React.ComponentProps<typeof Card>> }[] = [
      { label: "Default", props: {} },
      { label: "Actionable", props: { onPress: () => {} } },
      { label: "Selected", props: { isSelected: true } },
      { label: "Disabled", props: { isDisabled: true } },
    ];

    return (
      <Stack gap="400">
        {ALL_APPEARANCES.map((a) => (
          <Stack key={a} gap="150">
            <Text size="small" weight="medium" as="span" color="subtlest">
              appearance=&quot;{a}&quot;
            </Text>
            <Cluster gap="150" align="start">
              {states.map((s) => (
                <Stack key={`${a}-${s.label}`} gap="075" align="center">
                  <Card appearance={a} color="neutral" {...s.props}>
                    <CC>
                      <Stack gap="050">
                        <Heading size="xsmall" as="span">{s.label}</Heading>
                        <Text size="small" as="span" color="subtlest">{a}</Text>
                      </Stack>
                    </CC>
                  </Card>
                  <Text size="xsmall" as="span" color="subtlest">{s.label}</Text>
                </Stack>
              ))}
            </Cluster>
          </Stack>
        ))}
      </Stack>
    );
  },
};

// -----------------------------------------------------------------------
// Composition réaliste

/** Carte avec contenu riche (icône, tags, divider). */
export const RichContent: Story = {
  name: "Rich content",
  render: () => (
    <Cluster gap="200" align="start">
      <Card appearance="outlined" color="neutral" onPress={() => {}}>
        <CC>
          <Stack gap="150">
            <Cluster justify="between" align="center">
              <Heading size="xsmall" as="span">Carrefour Market</Heading>
              <Tag label="Actif" color="success" />
            </Cluster>
            <Text size="small" as="span" color="subtlest">Vindémia Distribution</Text>
            <Divider />
            <Stack direction="row" gap="075" align="center">
              <Icon icon="LocationOn" size={16} color="subtlest" />
              <Text size="small" as="span" color="subtlest">Ile de France</Text>
            </Stack>
          </Stack>
        </CC>
      </Card>

      <Card appearance="bold" color="brand">
        <CC>
          <Stack gap="100" align="center">
            <Icon icon="Star" size={24} />
            <Heading size="small" as="span">Upgrade</Heading>
            <Text size="small" as="span">Passez au plan Pro</Text>
          </Stack>
        </CC>
      </Card>
    </Cluster>
  ),
};

// -----------------------------------------------------------------------
// Play function — navigation clavier

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
