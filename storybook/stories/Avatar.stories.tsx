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

const meta: Meta<AvatarProps> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    appearance: {
      control: "select",
      options: ["square", "rounded"],
    },
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
    icon: { control: "select", options: ["none", "Person", "Home", "Star"] },
  },
  args: {
    appearance: "rounded",
    size: "medium",
    initials: "AB",
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
  args: { icon: "Person", initials: undefined, size: "xlarge" },
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
// Sizes

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
      {(
        ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"] as const
      ).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};
