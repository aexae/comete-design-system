// FocusRing — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { FocusRing } from "@aexae/comete-design-system/components";
import type { FocusRingBorderRadius, FocusRingPosition } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Decorator — conteneur position: relative nécessaire pour l'overlay

function WithContainer({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "inline-flex", gap: 32, padding: 32, flexWrap: "wrap" }}>
      {children}
    </div>
  );
}

function Box({
  borderRadius,
  position,
  label,
}: {
  borderRadius: FocusRingBorderRadius;
  position: FocusRingPosition;
  label: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          position: "relative",
          width: 64,
          height: 32,
          background: "var(--background-neutral-subtler-default)",
          borderRadius: borderRadius === "round" ? "1024px" : `${borderRadius}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FocusRing borderRadius={borderRadius} position={position} />
      </div>
      <span style={{ fontSize: 11, color: "var(--text-subtlest)", fontFamily: "monospace" }}>
        {label}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/FocusRing",
  component: FocusRing,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Ajouter un anneau de focus cohérent autour d'un élément interactif personnalisé.",
                "Quand un composant sur mesure doit adopter le focus visible du DS.",
              ]}
              avoid={[
                "Un composant standard → il gère déjà son focus (Button, TextField…).",
                "Un effet décoratif → un style de bordure.",
                "Masquer le focus → jamais (accessibilité).",
              ]}
              best={[
                "Réserver aux éléments interactifs personnalisés ; borderRadius/position alignés sur la cible.",
                "Ne jamais supprimer le focus visible ; s'appuyer sur focus-visible.",
              ]}
              accessibility={[
                "Ne jamais supprimer le focus visible ; s'appuyer sur `:focus-visible`.",
                "L'anneau doit rester visible sur tous les fonds (contraste suffisant).",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3134:45684") },
  },
  argTypes: {
    borderRadius: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6, 8, 12, "round"] satisfies FocusRingBorderRadius[],
    },
    position: {
      control: "select",
      options: ["outside", "inside"] satisfies FocusRingPosition[],
    },
  },
  args: {
    borderRadius: 4,
    position: "outside",
  },
} satisfies Meta<typeof FocusRing>;

export default meta;
type Story = StoryObj<typeof FocusRing>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3134:45684") } },
  render: (args) => (
    <div style={{ position: "relative", width: 64, height: 32, background: "var(--background-neutral-subtler-default)", borderRadius: 4 }}>
      <FocusRing {...args} />
    </div>
  ),
};

export const AllRadiiOutside: Story = {
  name: "All radii — outside",
  parameters: { design: { type: "figma", url: figmaUrl("3134:45684") } },
  render: () => (
    <WithContainer>
      {([1, 2, 3, 4, 5, 6, 8, 12, "round"] as FocusRingBorderRadius[]).map((r) => (
        <Box key={r} borderRadius={r} position="outside" label={`cr=${r}`} />
      ))}
    </WithContainer>
  ),
};

export const AllRadiiInside: Story = {
  name: "All radii — inside",
  parameters: { design: { type: "figma", url: figmaUrl("3134:45684") } },
  render: () => (
    <WithContainer>
      {([1, 2, 3, 4, 5, 6, 8, 12, "round"] as FocusRingBorderRadius[]).map((r) => (
        <Box key={r} borderRadius={r} position="inside" label={`cr=${r}`} />
      ))}
    </WithContainer>
  ),
};
