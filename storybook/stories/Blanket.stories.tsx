// Blanket — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Blanket } from "@aexae/comete-design-system/components";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Blanket",
  component: Blanket,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("3065:21773") },
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Blanket>;

export default meta;
type Story = StoryObj<typeof Blanket>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3065:21773") } },
};

export const WithClickHandler: Story = {
  name: "With click handler",
  parameters: { design: { type: "figma", url: figmaUrl("3065:21773") } },
  args: { onClick: () => alert("Blanket clicked") },
};
