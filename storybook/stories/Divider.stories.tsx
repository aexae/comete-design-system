// Divider — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Séparer visuellement deux groupes de contenu (sections d'une liste, blocs d'un formulaire).",
                "orientation horizontal (entre blocs empilés) ou vertical (entre éléments d'une ligne).",
              ]}
              avoid={[
                "Créer de l'espace → utiliser le gap d'un Stack/Cluster plutôt qu'un divider.",
                "Encadrer un bloc → une bordure (Card).",
                "Rythmer toute une page de traits → alléger.",
              ]}
              best={[
                "Utiliser avec parcimonie ; préférer l'espacement quand une séparation implicite suffit.",
                "orientation cohérente avec la direction du contenu voisin.",
              ]}
              accessibility={[
                "Décoratif par défaut (aria-hidden) ; un séparateur porteur de sens prend role=\"separator\".",
                "Ne pas remplacer une structure de titres par des dividers.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("442:3941") },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    className: { control: "text" },
  },
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof Divider>;

// -----------------------------------------------------------------------
// Stories

/** Séparateur horizontal (par défaut). */
export const Horizontal: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("102:2324") } },
  render: (args) => (
    <div style={{ inlineSize: "240px" }}>
      <Divider {...args} />
    </div>
  ),
};

/** Séparateur vertical — doit être placé dans un conteneur avec une hauteur définie. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  parameters: { design: { type: "figma", url: figmaUrl("197:962") } },
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        blockSize: "60px",
      }}
    >
      <Divider {...args} />
    </div>
  ),
};

/** Exemple : séparation entre deux blocs de contenu. */
export const BetweenContent: Story = {
  name: "Between content",
  render: () => (
    <div
      style={{
        inlineSize: "240px",
        fontFamily: "var(--font-family-primary)",
        fontSize: "var(--font-size-ui-sm)",
        color: "var(--text-default)",
      }}
    >
      <p style={{ margin: 0 }}>Première section</p>
      <Divider />
      <p style={{ margin: 0 }}>Seconde section</p>
    </div>
  ),
};

/** Exemple : séparation entre deux éléments alignés horizontalement. */
export const BetweenInline: Story = {
  name: "Between inline items",
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        blockSize: "24px",
        fontFamily: "var(--font-family-primary)",
        fontSize: "var(--font-size-ui-sm)",
        color: "var(--text-default)",
      }}
    >
      <span>Élément A</span>
      <Divider orientation="vertical" />
      <span>Élément B</span>
      <Divider orientation="vertical" />
      <span>Élément C</span>
    </div>
  ),
};
