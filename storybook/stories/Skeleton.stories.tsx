// Skeleton — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@aexae/comete-design-system/components";
import type { ReactElement } from "react";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["rectangle", "circle"],
    },
    width: { control: "text" },
    height: { control: "text" },
    radius: { control: "text" },
    "aria-label": { control: "text" },
  },
  args: {
    shape: "rectangle",
    width: 192,
    height: 20,
  },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("9198-44257"),
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories de base

/** Skeleton par défaut (rectangle 192×20). */
export const Default: Story = {};

/** Forme circulaire — utile pour les avatars. */
export const Circle: Story = {
  args: { shape: "circle", height: 48 },
};

/** Bloc avec radius personnalisé (image, vignette). */
export const Block: Story = {
  args: { width: 320, height: 200, radius: 8 },
};

// -----------------------------------------------------------------------
// Exemples d'usage — reproduits depuis le sticker sheet Figma

/** Avatars circulaires de différentes tailles. */
export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <Skeleton shape="circle" height={48} />
      <Skeleton shape="circle" height={32} />
      <Skeleton shape="circle" height={24} />
      <Skeleton shape="circle" height={16} />
    </div>
  ),
};

/** Carrés (icônes / vignettes) de différentes tailles. */
export const Squares: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <Skeleton width={48} height={48} />
      <Skeleton width={32} height={32} />
      <Skeleton width={24} height={24} />
      <Skeleton width={16} height={16} />
    </div>
  ),
};

/** Liste : icône + ligne de texte. */
export const IconList: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ListLine textWidth={112} />
      <ListLine textWidth={200} />
      <ListLine textWidth={160} />
    </div>
  ),
};

function ListLine({ textWidth }: { textWidth: number }): ReactElement {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Skeleton width={20} height={20} />
      <Skeleton width={textWidth} height={12} />
    </div>
  );
}

/** Avatar + paragraphe (carte utilisateur, commentaire…). */
export const AvatarParagraph: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Skeleton width={48} height={48} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width={240} height={20} />
        <Skeleton width={160} height={20} />
      </div>
    </div>
  ),
};

/** Titre + paragraphe (article, fiche détail…). */
export const TitleParagraph: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Skeleton width={272} height={40} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton width={368} height={16} />
        <Skeleton width={344} height={16} />
        <Skeleton width={152} height={16} />
      </div>
    </div>
  ),
};

/** Image / média (vignette, hero…). */
export const Image: Story = {
  render: () => <Skeleton width={320} height={200} radius={8} />,
};

// -----------------------------------------------------------------------
// All appearances — reproduction complète des exemples Figma

const labelStyle = {
  fontSize: 12,
  color: "var(--text-subtlest)",
  fontFamily: "monospace",
} as const;

/** Toutes les apparences d'usage du Skeleton. */
export const AllAppearances: Story = {
  name: "All appearances",
  parameters: {
    design: { type: "figma", url: figmaUrl("9198-44265") },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "32px 32px",
        alignItems: "center",
      }}
    >
      <span style={labelStyle}>avatar</span>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <Skeleton shape="circle" height={48} />
        <Skeleton shape="circle" height={32} />
        <Skeleton shape="circle" height={24} />
        <Skeleton shape="circle" height={16} />
      </div>

      <span style={labelStyle}>square</span>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <Skeleton width={48} height={48} />
        <Skeleton width={32} height={32} />
        <Skeleton width={24} height={24} />
        <Skeleton width={16} height={16} />
      </div>

      <span style={labelStyle}>icon list</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ListLine textWidth={112} />
        <ListLine textWidth={200} />
        <ListLine textWidth={160} />
      </div>

      <span style={labelStyle}>avatar + paragraph</span>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Skeleton width={48} height={48} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width={240} height={20} />
          <Skeleton width={160} height={20} />
        </div>
      </div>

      <span style={labelStyle}>title + paragraph</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Skeleton width={272} height={40} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton width={368} height={16} />
          <Skeleton width={344} height={16} />
          <Skeleton width={152} height={16} />
        </div>
      </div>

      <span style={labelStyle}>image</span>
      <Skeleton width={320} height={200} radius={8} />
    </div>
  ),
};
