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
          xlarge: "xlarge (64px)",
          xxlarge: "xxlarge (96px)",
          xxxlarge: "xxxlarge (128px)",
        },
      },
      options: ["xsmall", "small", "medium", "large", "xlarge", "xxlarge", "xxxlarge"],
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
