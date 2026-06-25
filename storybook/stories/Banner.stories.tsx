// Banner — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "@aexae/comete-design-system/components";
import type { BannerAppearance } from "@aexae/comete-design-system/components";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Banner",
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4559-5335") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["warning", "critical", "announcement", "success", "information"] satisfies BannerAppearance[],
    },
    children: { control: "text" },
  },
  args: {
    appearance: "warning",
    children: LOREM,
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof Banner>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5188") } },
};

export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5188") } },
  args: { appearance: "warning", children: LOREM },
};

export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5336") } },
  args: { appearance: "critical", children: LOREM },
};

export const Announcement: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("6675-45620") } },
  args: { appearance: "announcement", children: LOREM },
};

export const Success: Story = {
  args: { appearance: "success", children: LOREM },
};

export const Information: Story = {
  args: { appearance: "information", children: LOREM },
};

export const AllAppearances: Story = {
  name: "All appearances",
  parameters: { design: { type: "figma", url: figmaUrl("4559-5335") } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Banner appearance="warning">{LOREM}</Banner>
      <Banner appearance="critical">{LOREM}</Banner>
      <Banner appearance="announcement">{LOREM}</Banner>
      <Banner appearance="success">{LOREM}</Banner>
      <Banner appearance="information">{LOREM}</Banner>
    </div>
  ),
};
