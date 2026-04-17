// MenuItem — stories Storybook (Figma code part)
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Menu,
  MenuItem,
} from "@naxit/comete-design-system/components";
import type { IconName } from "@naxit/comete-icons";
import { iconRegistry } from "@naxit/comete-icons";

// -----------------------------------------------------------------------
// Icon options (from registry — always in sync)

const ICON_NAMES = Object.keys(iconRegistry).sort() as IconName[];
const ICON_OPTIONS: Array<IconName | "none"> = ["none", ...ICON_NAMES];

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Types pour les args (Figma code part props)

interface MenuItemStoryArgs {
  title: string;
  descriptionText: string;
  description: boolean;
  iconBefore: IconName | "none";
  iconAfter: IconName | "none";
  slotAfter: boolean;
  isDisabled: boolean;
  isSelected: boolean;
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Menu/MenuItem",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4711:15205"),
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Texte principal de l'item",
    },
    descriptionText: {
      control: "text",
      name: "description (text)",
      description: "Texte secondaire sous le titre",
    },
    description: {
      control: "boolean",
      description: "Afficher la description",
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
    slotAfter: {
      control: "boolean",
      description: "Afficher le slot après (raccourci clavier)",
    },
    isDisabled: {
      control: "boolean",
      description: "Item désactivé",
    },
    isSelected: {
      control: "boolean",
      description: "Item sélectionné",
    },
  },
  args: {
    title: "Title",
    descriptionText: "Description",
    description: true,
    iconBefore: "Star" as IconName,
    iconAfter: "ChevronRight" as IconName,
    slotAfter: false,
    isDisabled: false,
    isSelected: false,
  },
} satisfies Meta<MenuItemStoryArgs>;

export default meta;
type Story = StoryObj<MenuItemStoryArgs>;

// -----------------------------------------------------------------------
// Render

function MenuItemStory(args: MenuItemStoryArgs) {
  return (
    <div style={{ width: 360 }}>
      <Menu
        aria-label="Menu"
        mode={args.isSelected ? "select-multiple" : "default"}
        selectedKeys={args.isSelected ? new Set(["item"]) : undefined}
      >
        <MenuItem
          id="item"
          isDisabled={args.isDisabled}
          iconBefore={args.iconBefore !== "none" ? args.iconBefore : undefined}
          iconAfter={args.iconAfter !== "none" ? args.iconAfter : undefined}
          description={args.description ? args.descriptionText : undefined}
          slotAfter={args.slotAfter ? <kbd>⌘K</kbd> : undefined}
        >
          {args.title}
        </MenuItem>
      </Menu>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** État par défaut. */
export const Default: Story = {
  args: {
    description: true,
    iconBefore: "Star" as IconName,
    isSelected: false,
    descriptionText: "Description",
    slotAfter: false,
    isDisabled: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:15206") },
  },

  render: MenuItemStory
};

/** État sélectionné. */
export const Selected: Story = {
  args: { isSelected: true },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:15213") },
  },
  render: MenuItemStory,
};

/** État désactivé. */
export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:15264") },
  },
  render: MenuItemStory,
};

/** Tous les états côte à côte. */
export const AllStates: Story = {
  name: "All states",
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      {[
        { label: "Default", disabled: false, selected: false },
        { label: "Selected", disabled: false, selected: true },
        { label: "Disabled", disabled: true, selected: false },
      ].map(({ label, disabled, selected }) => (
        <div key={label} style={{ width: 280 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-subtlest)" }}>
            {label}
          </span>
          <Menu
            aria-label={label}
            mode={selected ? "select-multiple" : "default"}
            selectedKeys={selected ? new Set(["item"]) : undefined}
          >
            <MenuItem
              id="item"
              iconBefore="Star"
              iconAfter="ChevronRight"
              description="Description"
              isDisabled={disabled}
            >
              Option
            </MenuItem>
          </Menu>
        </div>
      ))}
    </div>
  ),
};
