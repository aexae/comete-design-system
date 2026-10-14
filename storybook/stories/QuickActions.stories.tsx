// QuickActions — stories Storybook (menu d'actions rapides du FAB)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, screen, userEvent, expect, waitFor, fn } from "storybook/test";
import { QuickActions } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { QuickActionsDemo, MCE_QUICK_ACTIONS } from "./_quickActionsDemo";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/QuickActions",
  component: QuickActions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Le menu d'actions rapides du FAB (`BottomNav.Action`) — pattern « speed dial » : des **pastilles flottantes** au-dessus d'un voile, une par action (libellé à gauche, pastille d'icône circulaire à droite). Le composant rend **uniquement la couche flottante** ; le déclencheur reste le FAB, qui garde sa rotation en croix et son `aria-expanded`.\n\n" +
          "**Règle de couleur (ADR 0002 — « une couleur, un sens »).** La couleur porte la **nature** de l'action, jamais son identité : `tone=\"critical\"` (signalement) ou `tone=\"default\"`, et **aucun autre ton** — pas de vert, pas de violet, pas une teinte par action. Elle ne va que sur la **pastille d'icône**, jamais sur la rangée : des rangées pleines saturées s'aplatissent sur un voile sombre en forte luminosité, et en deutéranopie un rouge et un vert pleins se confondent ; avec une pastille teintée, le libellé continue de porter l'information.\n\n" +
          "**Pourquoi un composant :** voile, piège de focus, fermeture à Échap, retour du focus sur le déclencheur et apparition décalée sont du comportement — pas une recette à réassembler avec `Button` et un `div` absolu.",
      },
      // Couche plein écran : rendue dans un iframe pour ne pas recouvrir la documentation.
      story: { inline: false, iframeHeight: 640 },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Proposer 2 à 5 **actions rapides** de création depuis le FAB : signaler, scanner, démarrer, créer.",
                "Quand chaque action se résume à un libellé court et se lance en un tap.",
              ]}
              avoid={[
                "Une action qui a besoin d'être **expliquée** : ce n'est pas une action rapide, c'est une entrée de tiroir → `Drawer`.",
                "Plus de 5 actions : plus de place entre le FAB et la barre de page → un tiroir.",
                "Des **destinations** secondaires → item « Plus » (popup ou page), pas le FAB.",
              ]}
              best={[
                "**Couleur = nature, pas identité** : `critical` uniquement pour un signalement ; tout le reste en `default`. Jamais une teinte par action.",
                "La couleur reste sur la **pastille d'icône** ; la rangée est toujours neutre (surface) — le libellé porte l'information.",
                "Une rangée = un libellé, rien d'autre : pas de seconde ligne de description.",
                "Pas de bouton « Fermer » : le FAB pivote en croix et le voile est touchable ; Échap ferme aussi.",
                "Pas de `z-index` sur la barre basse : le FAB y resterait prisonnier sous le voile. Le FAB et son socle remontent d'eux-mêmes quand il est ouvert.",
              ]}
              accessibility={[
                "La couche est un dialogue nommé (`aria-label`, « Actions rapides » par défaut) : le focus y est piégé, Échap ferme, et le focus **revient sur le FAB** à la fermeture.",
                "Le FAB porte `aria-expanded` tant que la couche est ouverte.",
                "La couleur ne porte jamais seule l'information : chaque rangée a un libellé texte.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
  },
  args: { isOpen: false, onOpenChange: fn(), actions: [] },
} satisfies Meta<typeof QuickActions>;

export default meta;
type Story = StoryObj<typeof QuickActions>;

// -----------------------------------------------------------------------
// Stories — la couche est plein écran : viewport mobile pour que voile, pastilles et FAB
// s'alignent.

/** Barre basse + FAB + `QuickActions` : touche le « + » pour ouvrir. */
export const Default: Story = {
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { controls: { disable: true } },
  render: () => <QuickActionsDemo />,
};

/** Trois actions seulement. */
export const ThreeActions: Story = {
  name: "Three actions",
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { controls: { disable: true } },
  render: () => <QuickActionsDemo actions={MCE_QUICK_ACTIONS.slice(0, 3)} />,
};

/** Cinq actions — le plafond. Au-delà : avertissement en développement, tiroir recommandé. */
export const FiveActions: Story = {
  name: "Five actions (plafond)",
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { controls: { disable: true } },
  render: () => (
    <QuickActionsDemo
      actions={[
        ...MCE_QUICK_ACTIONS,
        { id: "photo", icon: "Camera", label: "Prendre une photo", tone: "default" },
      ]}
    />
  ),
};

// Test (masqué du sidebar) : ouverture, focus piégé, Échap, retour du focus, action.
const onAction = fn();

export const Interactions: Story = {
  tags: ["!dev"],
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => <QuickActionsDemo onAction={onAction} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const fab = () => canvas.getByRole("button", { name: "Actions rapides", hidden: true });
    const dialog = () => screen.queryByRole("dialog", { name: "Actions rapides" });
    onAction.mockClear();

    await step("fermé au départ, FAB sans aria-expanded", async () => {
      await expect(dialog()).toBeNull();
      await expect(fab()).not.toHaveAttribute("aria-expanded");
    });

    await step("le FAB ouvre la couche : aria-expanded, focus piégé dedans", async () => {
      const trigger = fab();
      await userEvent.click(trigger);
      const d = await screen.findByRole("dialog", { name: "Actions rapides" });
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await waitFor(() => expect(d.contains(document.activeElement)).toBe(true));
    });

    await step("la rangée critique et les rangées par défaut portent leur ton sur la pastille", async () => {
      const critical = screen.getByRole("button", { name: "Signaler une anomalie" });
      const normal = screen.getByRole("button", { name: "Scanner un équipement" });
      await expect(critical.querySelector("[data-tone]")).toHaveAttribute("data-tone", "critical");
      await expect(normal.querySelector("[data-tone]")).toHaveAttribute("data-tone", "default");
    });

    await step("Échap referme et le focus revient sur le FAB", async () => {
      const trigger = fab();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(dialog()).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
      await expect(trigger).not.toHaveAttribute("aria-expanded");
    });

    await step("le FAB referme aussi la couche (sans la rouvrir)", async () => {
      await userEvent.click(fab());
      await screen.findByRole("dialog", { name: "Actions rapides" });
      await userEvent.click(fab());
      await waitFor(() => expect(dialog()).toBeNull());
    });

    await step("le choix d'une action la déclenche et ferme la couche", async () => {
      await userEvent.click(fab());
      await userEvent.click(await screen.findByRole("button", { name: "Démarrer une ronde" }));
      await expect(onAction).toHaveBeenCalledWith("round");
      await waitFor(() => expect(dialog()).toBeNull());
    });
  },
};
