// SectionMessage — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  SectionMessage,
} from "@naxit/comete-design-system/components";
import type { SectionMessageAppearance } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const APPEARANCES: SectionMessageAppearance[] = [
  "information",
  "success",
  "warning",
  "critical",
  "discovery",
];

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/SectionMessage",
  component: SectionMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2867-18456") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: APPEARANCES,
    },
    title: { control: "text" },
    children: { control: "text" },
  },
  args: {
    appearance: "information",
    title: "Titre",
    children: LOREM,
  },
} satisfies Meta<typeof SectionMessage>;

export default meta;
type Story = StoryObj<typeof SectionMessage>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
};

export const Information: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
  args: { appearance: "information" },
};

export const Success: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-287") } },
  args: { appearance: "success" },
};

export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-293") } },
  args: { appearance: "warning" },
};

export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-299") } },
  args: { appearance: "critical" },
};

export const Discovery: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2071-8328") } },
  args: { appearance: "discovery" },
};

export const WithActions: Story = {
  name: "With actions",
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
  render: (args) => (
    <SectionMessage
      {...args}
      actions={
        <>
          <Button appearance="link" spacing="compact">
            Action link
          </Button>
          <Button appearance="link" spacing="compact">
            Action link
          </Button>
        </>
      }
    />
  ),
  args: { appearance: "information", title: "Titre", children: LOREM },
};

export const WithoutTitle: Story = {
  name: "Without title",
  args: { appearance: "information", title: undefined, children: LOREM },
};

export const WithoutIcon: Story = {
  name: "Without icon",
  args: {
    appearance: "information",
    title: "Titre",
    icon: null,
    children: LOREM,
  },
};

export const AllAppearances: Story = {
  name: "All appearances",
  parameters: { design: { type: "figma", url: figmaUrl("2867-18456") } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      {APPEARANCES.map((appearance) => (
        <SectionMessage key={appearance} appearance={appearance} title="Titre">
          {LOREM}
        </SectionMessage>
      ))}
    </div>
  ),
};

export const AllAppearancesWithActions: Story = {
  name: "All appearances with actions",
  parameters: { design: { type: "figma", url: figmaUrl("2867-18456") } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      {APPEARANCES.map((appearance) => (
        <SectionMessage
          key={appearance}
          appearance={appearance}
          title="Titre"
          actions={
            <>
              <Button appearance="link" spacing="compact">
                Action link
              </Button>
              <Button appearance="link" spacing="compact">
                Action link
              </Button>
            </>
          }
        >
          {LOREM}
        </SectionMessage>
      ))}
    </div>
  ),
};
