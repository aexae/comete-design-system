// Code — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
    docs: {
      description: { component: "Le composant code affiche des extraits de code source ou des valeurs techniques dans une police à chasse fixe. Il distingue visuellement le contenu technique du reste du texte." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Mettre en évidence un fragment technique inline (nom de variable, valeur, raccourci, clé).",
                "Quand un texte doit se distinguer comme du code au sein d'une phrase.",
                "Documentation technique inline (noms de props, valeurs de tokens, raccourcis clavier).",
              ]}
              avoid={[
                "Un bloc de code multi-lignes → un bloc de code dédié.",
                "Simplement mettre en gras → Text weight bold.",
                "Un badge de statut → Tag/Badge.",
              ]}
              best={[
                "Réserver aux vrais fragments techniques ; garder le contenu court.",
                "Intégrer dans le flux de Text pour la lisibilité.",
                "Ne pas mélanger texte normal et code dans un même Tag ou Badge — réserver Code au contexte textuel.",
              ]}
              accessibility={[
                "Rendu via `<code>` — sémantique de code inline préservée.",
                "Réserver aux vrais fragments techniques, pas à de la mise en évidence.",
              ]}
            />
          }
        />
      ),
    },
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
