// Blanket — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Blanket } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Blanket",
  component: Blanket,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Assombrir/masquer l'arrière-plan derrière un overlay (modale, drawer, menu plein écran).",
                "Capter le clic extérieur pour fermer l'overlay (onClick).",
              ]}
              avoid={[
                "Un contenu de dialogue → ModalDialog (qui gère déjà son scrim).",
                "Un simple fond coloré → un style de conteneur.",
              ]}
              best={[
                "Utiliser conjointement avec l'overlay qu'il accompagne ; gérer focus/scroll au niveau de l'overlay.",
                "Fermer l'overlay au clic sur le Blanket quand l'action est réversible.",
              ]}
              accessibility={[
                "Rendre l'arrière-plan inerte quand le Blanket est actif (focus piégé dans l'overlay).",
                "Fermeture au clic et à Échap quand l'action est réversible.",
              ]}
            />
          }
        />
      ),
    },
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
