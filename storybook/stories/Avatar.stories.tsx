import { useState, useCallback } from "react";
import { Avatar, Button } from "@naxit/comete-design-system";
import type { AvatarProps } from "@naxit/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

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
          xlarge: "xlarge (96px)",
          xxlarge: "xxlarge (128px)",
        },
      },
      options: ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"],
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
      <Avatar size="xxlarge" initials={initials} src={photoUrl} alt="Demo" />
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
      <Button onPress={runFlow} variant="outlined" size="medium">
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
// Avatar Group

/** Photos disponibles pour le groupe. */
const AVAILABLE_PHOTOS = [
  { src: "https://i.pravatar.cc/128?img=3", alt: "Alice" },
  { src: "https://i.pravatar.cc/128?img=4", alt: "Bob" },
  { src: "https://i.pravatar.cc/128?img=5", alt: "Carol" },
  { src: "https://i.pravatar.cc/128?img=8", alt: "Dan" },
  { src: "https://i.pravatar.cc/128?img=9", alt: "Eve" },
  { src: "https://i.pravatar.cc/128?img=11", alt: "Frank" },
  { src: "https://i.pravatar.cc/128?img=12", alt: "Grace" },
  { src: "https://i.pravatar.cc/128?img=14", alt: "Hugo" },
];

const AVAILABLE_INITIALS = ["AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP"];

/** Border width per avatar size (in px). */
const SIZE_BORDER: Record<string, number> = {
  xsmall: 1,
  small: 1.5,
  medium: 2,
  large: 2,
  xlarge: 3,
  xxlarge: 4,
};

/** Tokens de spacing disponibles — clé lisible → variable CSS. */
const SPACING_OPTIONS = [
  "space050 (4px)",
  "space075 (6px)",
  "space100 (8px)",
  "space125 (10px)",
  "space150 (12px)",
  "space200 (16px)",
  "space250 (20px)",
  "space300 (24px)",
  "space350 (28px)",
  "space400 (32px)",
];

const SPACING_MAPPING: Record<string, string> = {
  "space050 (4px)": "var(--space050)",
  "space075 (6px)": "var(--space075)",
  "space100 (8px)": "var(--space100)",
  "space125 (10px)": "var(--space125)",
  "space150 (12px)": "var(--space150)",
  "space200 (16px)": "var(--space200)",
  "space250 (20px)": "var(--space250)",
  "space300 (24px)": "var(--space300)",
  "space350 (28px)": "var(--space350)",
  "space400 (32px)": "var(--space400)",
};

type AvatarGroupContent = "photo" | "initials" | "icon";

interface AvatarGroupArgs {
  /** Nombre d'avatars affichés dans le groupe. */
  count: number;
  /** Nombre d'avatars supplémentaires (compteur +N). 0 = pas de compteur. */
  overflow: number;
  /** Contenu des avatars du groupe. */
  content: AvatarGroupContent;
  /** Token de spacing pour le chevauchement. */
  spacing: string;
  /** Taille des avatars. */
  size: AvatarProps["size"];
}

export const AvatarGroup: StoryObj<AvatarGroupArgs> = {
  argTypes: {
    count: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Nombre d'avatars affichés",
    },
    overflow: {
      control: { type: "number", min: 0 },
      description: "Nombre d'avatars supplémentaires (+N)",
    },
    content: {
      control: "select",
      options: ["photo", "initials", "icon"],
      description: "Type de contenu des avatars",
    },
    spacing: {
      control: "select",
      options: SPACING_OPTIONS,
      mapping: SPACING_MAPPING,
      description: "Token de spacing pour le chevauchement",
    },
    size: {
      control: "select",
      options: ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"],
    },
    // Masquer les argTypes du meta qui ne s'appliquent pas à AvatarGroup
    ...(Object.fromEntries(
      [
        "src",
        "alt",
        "initials",
        "icon",
        "isDisabled",
        "isSelected",
        "notification",
        "presence",
        "onPress",
      ].map((key) => [key, { table: { disable: true } }]),
    ) as Record<string, { table: { disable: true } }>),
  },
  args: {
    count: 3,
    overflow: 2,
    content: "photo",
    spacing: "space100 (8px)" as unknown as string,
    size: "large",
  },
  render: (args) => {
    const {
      count,
      overflow,
      content,
      spacing,
      size = "medium",
    } = args as unknown as AvatarGroupArgs;

    const total = count + (overflow > 0 ? 1 : 0);
    const border = SIZE_BORDER[size] ?? 2;

    /** Génère les props de contenu pour un avatar à l'index i. */
    const contentProps = (i: number): Partial<AvatarProps> => {
      switch (content) {
        case "photo": {
          const photo = AVAILABLE_PHOTOS[i % AVAILABLE_PHOTOS.length];
          return photo ? { src: photo.src, alt: photo.alt } : {};
        }
        case "initials":
          return { initials: AVAILABLE_INITIALS[i % AVAILABLE_INITIALS.length] };
        case "icon":
          return { icon: "Person" };
      }
    };

    /** Style commun pour le wrapper de chaque avatar dans le groupe. */
    const wrapperStyle = (i: number): React.CSSProperties => ({
      marginLeft: i === 0 ? 0 : `calc(-1 * ${spacing})`,
      zIndex: total - i,
      borderRadius: "50%",
      boxShadow: `0 0 0 ${border}px var(--border-invisible, #fff)`,
      position: "relative",
      lineHeight: 0,
    });

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={wrapperStyle(i)}>
            <Avatar
              {...contentProps(i)}
              size={size}
            />
          </div>
        ))}
        {overflow > 0 && (
          <div style={wrapperStyle(count)}>
            <Avatar
              initials={`+${overflow}`}
              size={size}
            />
          </div>
        )}
      </div>
    );
  },
};

// ----------------------------------------------------------------------
// Sizes

const SIZE_PX: Record<string, number> = {
  xsmall: 16,
  small: 24,
  medium: 32,
  large: 40,
  xlarge: 96,
  xxlarge: 128,
};

export const AllSizes: Story = {
  render: (args) => {
    const resolvedArgs =
      args.icon != null ? { ...args, initials: undefined } : args;
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        {(
          ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"] as const
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
