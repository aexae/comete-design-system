import { useState } from "react";
import { AvatarGroup } from "@naxit/comete-design-system";
import type { AvatarGroupProps, AvatarGroupItem } from "@naxit/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

// ----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// ----------------------------------------------------------------------
// Sample data

const PHOTO_ITEMS: AvatarGroupItem[] = [
  { key: "alice", src: "https://i.pravatar.cc/128?img=3", alt: "Alice", name: "Alice Martin" },
  { key: "bob", src: "https://i.pravatar.cc/128?img=4", alt: "Bob", name: "Bob Dupont" },
  { key: "carol", src: "https://i.pravatar.cc/128?img=5", alt: "Carol", name: "Carol Lefèvre" },
  { key: "dan", src: "https://i.pravatar.cc/128?img=8", alt: "Dan", name: "Dan Moreau" },
  { key: "eve", src: "https://i.pravatar.cc/128?img=9", alt: "Eve", name: "Eve Bernard" },
];

const INITIALS_ITEMS: AvatarGroupItem[] = [
  { key: "a", initials: "AB", name: "Alexandre Da Costa" },
  { key: "b", initials: "CD", name: "Aurore Leblois" },
  { key: "c", initials: "EF", name: "David Relut" },
  { key: "d", initials: "GH", name: "Guillaume Orsal" },
  { key: "e", initials: "IJ", name: "Mohamed Bechir" },
];

// ----------------------------------------------------------------------

const meta: Meta<AvatarGroupProps> = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["display", "navigate", "select"],
    },
    size: {
      control: "select",
      options: ["xsmall", "small", "medium", "large", "xlarge", "xxlarge", "xxxlarge"],
    },
    borderColor: { control: "color" },
  },
  args: {
    items: PHOTO_ITEMS.slice(0, 3),
    size: "large",
    mode: "display",
  },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2726:20433"),
    },
  },
};

export default meta;
type Story = StoryObj<AvatarGroupProps>;

// ----------------------------------------------------------------------
// Display mode (default)

/** Affichage simple sans interaction. */
export const Display: Story = {};

/** Affichage avec initiales. */
export const WithInitials: Story = {
  args: { items: INITIALS_ITEMS.slice(0, 3) },
};

/** Avec overflow : le "+N" est visible mais non interactif en mode display. */
export const DisplayWithOverflow: Story = {
  args: {
    items: PHOTO_ITEMS.slice(0, 3),
    overflowItems: PHOTO_ITEMS.slice(3),
  },
};

// ----------------------------------------------------------------------
// Navigate mode

/** Mode navigate : chaque avatar est cliquable (hover, press, focus). */
export const Navigate: Story = {
  args: {
    mode: "navigate",
    items: PHOTO_ITEMS.slice(0, 3),
    onItemPress: fn(),
  },
};

function NavigateOverflowDemo() {
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarGroup
        items={PHOTO_ITEMS.slice(0, 3)}
        overflowItems={PHOTO_ITEMS.slice(3)}
        mode="navigate"
        size="large"
        onItemPress={(item) => setLastClicked(item.name ?? item.key ?? "")}
      />
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Dernier clic : {lastClicked ?? "aucun"}
      </p>
    </div>
  );
}

/** Mode navigate avec overflow : le "+N" ouvre un menu de navigation. */
export const NavigateWithOverflow: Story = {
  render: () => <NavigateOverflowDemo />,
  parameters: { controls: { disable: true } },
};

// ----------------------------------------------------------------------
// Select mode

function SelectDemo() {
  const [selected, setSelected] = useState<string[]>(["alice"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarGroup
        items={PHOTO_ITEMS.slice(0, 3)}
        mode="select"
        size="large"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Sélection : {selected.length > 0 ? selected.join(", ") : "aucune"}
      </p>
    </div>
  );
}

/** Mode select : cliquer sur un avatar toggle sa sélection. */
export const Select: Story = {
  render: () => <SelectDemo />,
  parameters: { controls: { disable: true } },
};

function SelectOverflowDemo() {
  const [selected, setSelected] = useState<string[]>(["alice"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarGroup
        items={PHOTO_ITEMS.slice(0, 2)}
        overflowItems={PHOTO_ITEMS.slice(2)}
        mode="select"
        size="large"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Sélection : {selected.length > 0 ? selected.join(", ") : "aucune"}
      </p>
    </div>
  );
}

/** Mode select avec overflow : le "+N" ouvre un menu avec checkboxes. */
export const SelectWithOverflow: Story = {
  render: () => <SelectOverflowDemo />,
  parameters: { controls: { disable: true } },
};

// ----------------------------------------------------------------------
// Sizes

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(
        ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"] as const
      ).map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-subtle)", width: 120 }}>
            {size}
          </span>
          <AvatarGroup items={PHOTO_ITEMS.slice(0, 3)} overflowItems={PHOTO_ITEMS.slice(3)} size={size} />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ----------------------------------------------------------------------
// All modes

export const AllModes: Story = {
  name: "All modes",
  render: () => {
    const modes = ["display", "navigate", "select"] as const;
    const labelStyle = { fontFamily: "monospace", fontSize: 12, color: "var(--text-subtlest)", width: 100 };
    return (
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px 24px", alignItems: "center" }}>
        {modes.map((mode) => (
          <ModeRow key={mode} mode={mode} labelStyle={labelStyle} />
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

function ModeRow({ mode, labelStyle }: { mode: "display" | "navigate" | "select"; labelStyle: React.CSSProperties }) {
  const [selected, setSelected] = useState<string[]>(["alice"]);
  return (
    <>
      <span style={labelStyle}>{mode}</span>
      <AvatarGroup
        items={PHOTO_ITEMS.slice(0, 3)}
        overflowItems={PHOTO_ITEMS.slice(3)}
        mode={mode}
        size="large"
        onItemPress={mode === "navigate" ? () => {} : undefined}
        selectedKeys={mode === "select" ? selected : undefined}
        onSelectionChange={mode === "select" ? setSelected : undefined}
      />
    </>
  );
}
