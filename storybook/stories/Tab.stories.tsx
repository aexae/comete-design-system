// Tab (code part) — stories Storybook
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@aexae/comete-design-system/components";
import type { IconName } from "@naxit/comete-icons";
import { iconRegistry } from "@naxit/comete-icons";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Icon options (from registry — always in sync)

const ICON_NAMES = Object.keys(iconRegistry).sort() as IconName[];
const ICON_OPTIONS: Array<IconName | "none"> = ["none", ...ICON_NAMES];

// -----------------------------------------------------------------------
// Types pour les args (Figma code part props)

interface TabStoryArgs {
  label: string;
  iconBefore: IconName | "none";
  iconAfter: IconName | "none";
  isDisabled: boolean;
  isSelected: boolean;
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Tabs/Tab",
  tags: ["autodocs"],
  decorators: [
    (Story: () => React.JSX.Element) => (
      <>
        <style>{".tab-story-no-border { border-bottom: none !important; }"}</style>
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("5107:63424"),
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Texte du tab",
    },
    iconBefore: {
      control: "select",
      options: ICON_OPTIONS,
      description: "Icône avant le label",
      name: "<Icon> before",
    },
    iconAfter: {
      control: "select",
      options: ICON_OPTIONS,
      description: "Icône après le label",
      name: "<Icon> after",
    },
    isDisabled: {
      control: "boolean",
      description: "Tab désactivé",
    },
    isSelected: {
      control: "boolean",
      description: "Tab sélectionné",
    },
  },
  args: {
    label: "Tab",
    iconBefore: "none",
    iconAfter: "none",
    isDisabled: false,
    isSelected: false,
  },
} satisfies Meta<TabStoryArgs>;

export default meta;
type Story = StoryObj<TabStoryArgs>;

// -----------------------------------------------------------------------
// Render

function TabStory(args: TabStoryArgs) {
  return (
    <Tabs
      selectedKey={args.isSelected ? "tab" : "none"}
      disabledKeys={args.isDisabled ? ["tab"] : []}
    >
      <TabList className="tab-story-no-border">
        <Tab
          id="tab"
          iconBefore={args.iconBefore !== "none" ? args.iconBefore : undefined}
          iconAfter={args.iconAfter !== "none" ? args.iconAfter : undefined}
        >
          {args.label}
        </Tab>
      </TabList>
      <TabPanel id="tab" />
      <TabPanel id="none" />
    </Tabs>
  );
}

// -----------------------------------------------------------------------
// Stories — state = default

/** state=default, isSelected=false */
export const Default: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("5107:63425") },
  },
  render: TabStory,
};


// -----------------------------------------------------------------------
// Stories — state = selected

/** state=default, isSelected=true */
export const Selected: Story = {
  args: { isSelected: true },
  parameters: {
    design: { type: "figma", url: figmaUrl("5107:63427") },
  },
  render: TabStory,
};

// -----------------------------------------------------------------------
// Stories — state = disabled

/** state=disabled, isSelected=false */
export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: {
    design: { type: "figma", url: figmaUrl("6156:1453") },
  },
  render: TabStory,
};

// -----------------------------------------------------------------------
// All states

/** Tous les états côte à côte. */
export const AllStates: Story = {
  name: "All states",
  render: () => (
    <Tabs selectedKey="selected" disabledKeys={["disabled"]}>
      <TabList>
        <Tab id="default">Default</Tab>
        <Tab id="selected">Selected</Tab>
        <Tab id="disabled">Disabled</Tab>
        <Tab id="with-icon" iconBefore="Star">With icon</Tab>
      </TabList>
      <TabPanel id="default" />
      <TabPanel id="selected" />
      <TabPanel id="disabled" />
      <TabPanel id="with-icon" />
    </Tabs>
  ),
};
