import { useState, useCallback } from "react";
import { Avatar, Button, Text } from "@aexae/comete-design-system";
import type { AvatarProps } from "@aexae/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// ----------------------------------------------------------------------
// Figma design URLs — public file, addon-designs embeds

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";

/** Builds a Figma URL with a specific node ID for the addon-designs panel */
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// ----------------------------------------------------------------------
// Icon mapping — IconName n'est pas sérialisable dans args,
// Storybook résout la clé string en valeur avant de la passer au composant.

const ICON_OPTIONS = ["none", "Person", "Home", "Star"];
const ICON_MAPPING: Record<string, string | undefined> = {
  none: undefined,
  Person: "Person",
  Home: "Home",
  Star: "Star",
};

// ----------------------------------------------------------------------

const meta: Meta<AvatarProps> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: {
        type: "select",
        labels: {
          xsmall: "xsmall (16px)",
          small: "small (24px)",
          medium: "medium (32px)",
          large: "large (40px)",
          xlarge: "xlarge (64px)",
          xxlarge: "xxlarge (96px)",
          xxxlarge: "xxxlarge (128px)",
        },
      },
      options: ["xsmall", "small", "medium", "large", "xlarge", "xxlarge", "xxxlarge"],
    },
    color: {
      control: "select",
      options: [
        "neutral",
        "comete",
        "accentPurple",
        "accentTeal",
        "accentTurquoise",
        "accentMagenta",
        "accentBlueGrey",
      ],
      description:
        "Couleur catégorielle — identifie, ne juge pas. Sans effet sur une photo.",
    },
    isDisabled: { control: "boolean" },
    isSelected: { control: "boolean" },
    src: { control: "text" },
    alt: { control: "text" },
    initials: { control: "text" },
    icon: {
      control: "select",
      options: ICON_OPTIONS,
      mapping: ICON_MAPPING,
    },
    notification: { control: "number" },
    presence: { control: "boolean" },
  },
  args: {
    size: "medium",
    initials: "AB",
    icon: "none" as unknown as undefined,
  },
  render: (args) => {
    // Quand une icône est sélectionnée, on retire les initiales
    // pour respecter la priorité du composant (photo > initials > icon).
    const resolvedArgs =
      args.icon != null ? { ...args, initials: undefined } : args;
    return <Avatar {...resolvedArgs} />;
  },
  parameters: {
    docs: {
      description: { component: "Les avatars représentent visuellement un utilisateur ou une entité par une photo, des initiales ou une icône. Ils identifient rapidement les personnes dans les listes, commentaires et en-têtes de profil." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <div style={{ display: "flex", gap: 12 }}>
                    <Avatar initials="AB" />
                    <Avatar initials="CD" />
                  </div>
                ),
                caption: "Photo ou initiales (2 max) pour représenter une personne.",
              }}
              dontExample={{
                example: <Avatar initials="ALICE" />,
                caption: "Ne pas dépasser deux initiales.",
              }}
              when={[
                "Représenter une personne ou une entité par une photo, des initiales ou une icône.",
                "Afficher un statut de présence ou un compteur de notifications greffé.",
              ]}
              avoid={[
                "Plusieurs personnes → AvatarGroup.",
                "Un logo de marque/produit → Logo.",
                "Une icône décorative → Icon.",
              ]}
              best={[
                "Priorité photo > initiales > icône ; toujours un `alt`/`aria-label` décrivant la personne.",
                "Taille cohérente avec le contexte ; presence/notification avec parcimonie.",
              ]}
              accessibility={[
                "Toujours un `alt`/`aria-label` décrivant la personne représentée.",
                "Une icône purement décorative dans l'avatar reste ignorée des lecteurs d'écran.",
              ]}
            />
          }
        />
      ),
    },
    design: {
      type: "figma",
      url: figmaUrl("2745:15527"),
    },
  },
};

export default meta;
type Story = StoryObj<AvatarProps>;

// ----------------------------------------------------------------------
// Content types

export const WithInitials: Story = {
  args: { initials: "AB", size: "xlarge" },
  parameters: {
    design: { type: "figma", url: figmaUrl("2745:15477") },
  },
};

export const WithPhoto: Story = {
  args: {
    src: "https://i.pravatar.cc/128",
    alt: "Alice",
    size: "xlarge",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("2745:16083") },
  },
};

export const WithIcon: Story = {
  args: { icon: "Person" as unknown as undefined, size: "xlarge" },
  parameters: {
    design: { type: "figma", url: figmaUrl("2739:5312") },
  },
};

// ----------------------------------------------------------------------
// States

export const Selected: Story = {
  args: { isSelected: true, size: "xlarge" },
};

export const Disabled: Story = {
  args: { isDisabled: true, size: "xlarge" },
};

// ----------------------------------------------------------------------
// Interactive mode

export const Interactive: Story = {
  args: {
    initials: "AB",
    size: "large",
    onPress: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    void expect(args.onPress).toHaveBeenCalledOnce();
  },
};

// ----------------------------------------------------------------------
// Badges

export const WithNotification: Story = {
  args: { initials: "AB", size: "xlarge", notification: 3 },
  parameters: {
    design: { type: "figma", url: figmaUrl("2726:20433") },
  },
};

export const WithPresence: Story = {
  args: {
    src: "https://i.pravatar.cc/128",
    alt: "Alice",
    size: "xlarge",
    presence: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("2726:20433") },
  },
};

// ----------------------------------------------------------------------
// Loading flow demo

type FlowStep = "icon" | "initials" | "image";

const FLOW_STEPS: { key: FlowStep; label: string }[] = [
  { key: "icon", label: "Icône (fallback)" },
  { key: "initials", label: "Initiales" },
  { key: "image", label: "Image" },
];

function LoadingFlowDemo() {
  const [step, setStep] = useState<FlowStep>("icon");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [initials, setInitials] = useState<string | undefined>(undefined);

  const runFlow = useCallback(() => {
    setStep("icon");
    setPhotoUrl(undefined);
    setInitials(undefined);

    setTimeout(() => {
      setStep("initials");
      setInitials("AB");
    }, 1500);

    setTimeout(() => {
      setStep("image");
      setPhotoUrl(`https://i.pravatar.cc/128?t=${Date.now()}`);
    }, 3000);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <Avatar size="xxxlarge" initials={initials} src={photoUrl} alt="Demo" />
      <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
        {FLOW_STEPS.map(({ key, label }, i) => (
          <span key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: step === key ? "var(--text-selected)" : "var(--text-subtle)",
                fontWeight: step === key ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
              }}
            >
              {label}
            </span>
            {i < FLOW_STEPS.length - 1 && (
              <span style={{ color: "var(--text-subtlest)" }}>→</span>
            )}
          </span>
        ))}
      </div>
      <Button onPress={runFlow} appearance="outlined">
        Relancer le flow
      </Button>
    </div>
  );
}

/** Démonstration du flow de chargement : Icône (fallback) → Initiales → Image (1.5s entre chaque étape). */
export const LoadingFlow: Story = {
  render: () => <LoadingFlowDemo />,
  parameters: { controls: { disable: true } },
};

// ----------------------------------------------------------------------
// Sizes

const SIZE_PX: Record<string, number> = {
  xsmall: 16,
  small: 24,
  medium: 32,
  large: 40,
  xlarge: 64,
  xxlarge: 96,
  xxxlarge: 128,
};

// ----------------------------------------------------------------------
// Couleurs catégorielles

const COULEURS = [
  { color: "neutral", initials: "NE" },
  { color: "comete", initials: "CO" },
  { color: "accentPurple", initials: "PU" },
  { color: "accentTeal", initials: "TE" },
  { color: "accentTurquoise", initials: "TU" },
  { color: "accentMagenta", initials: "MA" },
  { color: "accentBlueGrey", initials: "BG" },
] as const;

/**
 * Les sept couleurs. Elles sont **catégorielles** : un avatar identifie, il
 * ne juge pas. La couleur y distingue une personne, un fil, une équipe — elle
 * ne dit jamais « tout va bien » ni « attention », ce qui relève de
 * `presence`, de `notification` ou d'un `Tag` à côté (ADR 0002).
 *
 * Sur une photo la couleur ne se voit pas : l'image couvre le fond.
 */
export const Couleurs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {COULEURS.map(({ color, initials }) => (
        <div
          key={color}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <Avatar size="large" color={color} initials={initials} />
          <Text size="xsmall" color="subtlest">
            {color}
          </Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * **Fil de discussion** — le cas qui motive ces couleurs.
 *
 * Chaque interlocuteur reçoit une teinte, et le **nom de l'auteur reprend la
 * même** : `Avatar color="accentPurple"` et `Text color="accentPurple"`
 * pointent sur le même jeton `--text-accent-purple`. L'œil relie le message à
 * son auteur sans relire le nom.
 *
 * La teinte n'est qu'un **repère visuel** : elle ne doit jamais être le seul
 * moyen de savoir qui parle — le nom reste écrit, et les initiales le
 * redisent.
 */
export const FilDeDiscussion: Story = {
  name: "Fil de discussion",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 440 }}>
      {([
        { color: "accentPurple", initials: "MB", nom: "MARTIN Bob",
          message: "Ronde du secteur nord terminée, rien à signaler." },
        { color: "accentTeal", initials: "CA", nom: "CHEN Alice",
          message: "Reçu. Tu peux enchaîner sur l'entrepôt 2 ?" },
        { color: "accentPurple", initials: "MB", nom: "MARTIN Bob",
          message: "J'y suis dans dix minutes." },
      ] as const).map(({ color, initials, nom, message }, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <Avatar size="medium" color={color} initials={initials} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Text size="small" weight="bold" color={color}>
              {nom}
            </Text>
            <Text size="small">{message}</Text>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => {
    const resolvedArgs =
      args.icon != null ? { ...args, initials: undefined } : args;
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        {(
          ["xsmall", "small", "medium", "large", "xlarge", "xxlarge", "xxxlarge"] as const
        ).map((size) => (
          <div
            key={size}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar {...resolvedArgs} size={size} />
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>
              {size} ({SIZE_PX[size]}px)
            </span>
          </div>
        ))}
      </div>
    );
  },
};
