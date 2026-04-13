import { Avatar } from "@naxit/comete-design-system";
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
      control: "select",
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
// Appearances

export const Square: Story = {
  args: { appearance: "square", initials: "AB", size: "xlarge" },
  parameters: {
    design: { type: "figma", url: figmaUrl("2745:15477") },
  },
};

export const Rounded: Story = {
  args: { appearance: "rounded", initials: "AB", size: "xlarge" },
  parameters: {
    design: { type: "figma", url: figmaUrl("2745:15627") },
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

export const InteractiveDisabled: Story = {
  args: {
    initials: "AB",
    size: "large",
    isDisabled: true,
    onPress: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    void expect(args.onPress).not.toHaveBeenCalled();
  },
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
