// Code — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3211:58477") },
  },
  argTypes: {
    children: { control: "text" },
    className: { control: "text" },
  },
  args: {
    children: "Jours de congé payés",
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof Code>;

// -----------------------------------------------------------------------
// Stories

/** Fragment de code inline par défaut. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3212:58769") } },
};

/** Code court. */
export const Short: Story = {
  args: { children: "font-size" },
};

/** Code dans du texte. */
export const InlineWithText: Story = {
  name: "Inline with text",
  render: () => (
    <p
      style={{
        fontFamily: "var(--font-family-primary)",
        fontSize: "var(--font-size-ui-xs)",
        lineHeight: "var(--line-height-ui-xs)",
        color: "var(--text-default)",
        margin: 0,
      }}
    >
      La propriété <Code>font-size</Code> accepte des valeurs en{" "}
      <Code>rem</Code> ou en <Code>px</Code>.
    </p>
  ),
};
