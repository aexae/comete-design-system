// QuickActions — stories Storybook (menu d'actions rapides du FAB)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { within, screen, userEvent, expect, waitFor, fn } from "storybook/test";
import { QuickActions, type QuickAction } from "@aexae/comete-design-system/components";
import type { IconName } from "@aexae/comete-icons";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { QuickActionsDemo } from "./_quickActionsDemo";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/BottomNav/QuickActions",
  component: QuickActions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Le menu d'actions rapides du FAB (`BottomNav.Action`) — pattern « speed dial » : des **pastilles flottantes** au-dessus d'un voile, une par action (pastille d'icône circulaire à gauche, libellé à droite). Le composant rend **uniquement la couche flottante** ; le déclencheur reste le FAB, qui garde sa rotation en croix et son `aria-expanded`.\n\n" +
          "**Règle de couleur (ADR 0002 — « une couleur, un sens »).** La couleur porte la **nature** de l'action, jamais son identité. `tone` reprend la palette sémantique des autres composants (`Button` `color`, `Badge` `appearance`) : `comete` (défaut), `critical`, `warning`, `success`, `information` — sans restriction de type. Le **garde-fou est sur la composition** : en développement, un avertissement est émis au-delà de **deux tons distincts** dans un même menu ou de **plus d'une** action `critical` ; le composant rend quand même. La couleur ne va que sur la **pastille d'icône**, jamais sur la rangée : des rangées pleines saturées s'aplatissent sur un voile sombre en forte luminosité, et en deutéranopie un rouge et un vert pleins se confondent ; avec une pastille teintée, le libellé continue de porter l'information.\n\n" +
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
                "**Couleur = nature, pas identité** : ne pas donner une teinte à chaque action pour la rendre reconnaissable — l'icône et le verbe distinguent. Au plus **deux tons distincts** et **une seule** action `critical` par menu (avertissement en développement).",
                "La couleur reste sur la **pastille d'icône** ; la rangée est toujours neutre (surface) — le libellé porte l'information.",
                "Une rangée = un libellé, rien d'autre : pas de seconde ligne de description.",
                "Pas de bouton « Fermer » : le FAB pivote en croix et le voile est touchable ; Échap ferme aussi.",
                "Pas de `z-index` sur la barre basse : le FAB y resterait prisonnier sous le voile. Le FAB remonte de lui-même au-dessus du voile quand il est ouvert ; son contour reste sous le voile, avec la barre.",
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

/** Nombre maximal de pastilles réglables (le plafond du composant). */
const SLOTS = [1, 2, 3, 4, 5] as const;

const TONES = ["comete", "critical", "warning", "success", "information"] as const;

/** Icônes proposées dans les controls (n'importe quel nom d'icône reste possible via le code). */
const ICON_OPTIONS = [
  "Campaign", "Patrol", "Report", "Scanner", "Camera", "Add", "EventNote", "MenuBook", "FormEdit",
  "Notifications", "Warning", "CheckCircle", "Send", "Call", "Mic", "LocationOn", "Star", "Flag",
] as const satisfies readonly IconName[];

/**
 * Args du bac à sable — un control PAR pastille (`label1`, `icon1`, `tone1`… jusqu'à 5) et le
 * nombre de pastilles affichées. Les pastilles au-delà de `count` sont masquées dans le panneau.
 */
type PlaygroundArgs = {
  count: number;
  menuOpen: boolean;
} & Record<`label${1 | 2 | 3 | 4 | 5}`, string> &
  Record<`icon${1 | 2 | 3 | 4 | 5}`, IconName> &
  Record<`tone${1 | 2 | 3 | 4 | 5}`, (typeof TONES)[number]>;

const PLAYGROUND_ARGTYPES = Object.fromEntries([
  [
    "count",
    {
      name: "Nombre de pastilles",
      description: "De 2 à 5 (le plafond : au-delà, plus de place entre le FAB et la barre de page).",
      control: { type: "range", min: 2, max: 5, step: 1 },
      table: { category: "Menu" },
    },
  ],
  [
    "menuOpen",
    {
      name: "Menu ouvert",
      description: "Ouvre / ferme la couche. Synchronisé avec le « + » : le toucher bascule aussi ce control.",
      control: "boolean",
      table: { category: "Menu" },
    },
  ],
  ...SLOTS.flatMap((n) => {
    const cat = { category: `Pastille ${n}` };
    // Les pastilles 3 à 5 n'apparaissent dans le panneau que si `count` les affiche.
    const cond = n > 2 ? { if: { arg: "count", gte: n } } : {};
    return [
      [`label${n}`, { name: "Texte", control: "text", table: cat, ...cond }],
      [`icon${n}`, { name: "Icône", control: "select", options: ICON_OPTIONS, table: cat, ...cond }],
      [
        `tone${n}`,
        {
          name: "Couleur (ton)",
          description: "Nature de l'action, pas son identité : plus de 2 tons distincts ou plus d'un `critical` → avertissement en console.",
          control: "inline-radio",
          options: TONES,
          table: cat,
          ...cond,
        },
      ],
    ];
  }),
]);

const PLAYGROUND_ARGS: PlaygroundArgs = {
  count: 2,
  // Fermé par défaut : on ouvre avec le « + » ou le control « Menu ouvert ».
  menuOpen: false,
  // Pastilles 1 et 2 : les actions du FAB de l'agent en MCE (libellés de Link).
  label1: "Déclarer un évènement",
  icon1: "Campaign",
  tone1: "comete",
  label2: "Démarrer une ronde",
  icon2: "Patrol",
  tone2: "comete",
  // Pastilles 3 à 5 : emplacements libres, à renommer dans les controls.
  label3: "Action 3",
  icon3: "Camera",
  tone3: "comete",
  label4: "Action 4",
  icon4: "Send",
  tone4: "comete",
  label5: "Action 5",
  icon5: "Flag",
  tone5: "comete",
};

/** Reconstruit la liste d'actions à partir des controls. */
function actionsFromArgs(args: PlaygroundArgs): Omit<QuickAction, "onPress">[] {
  return SLOTS.slice(0, args.count).map((n) => ({
    id: `slot${n}`,
    label: args[`label${n}`],
    icon: args[`icon${n}`],
    tone: args[`tone${n}`],
  }));
}

// -----------------------------------------------------------------------
// Stories — la couche est plein écran : viewport mobile pour que voile, pastilles et FAB
// s'alignent.

/**
 * Les actions du FAB de l'agent en MCE (libellés de Link) : « Déclarer un évènement » et
 * « Démarrer une ronde ». Deux entrées, toutes du ton par défaut — MCE n'a aucune notion de
 * gravité ; c'est l'icône et le verbe qui distinguent, pas la couleur. Touche le « + » pour ouvrir.
 *
 * **Bac à sable** : un control par pastille (texte, icône, ton) et le nombre de pastilles — règle-les
 * dans le panneau « Controls » ; « Menu ouvert » ouvre / ferme la couche (et suit le « + »).
 */
export const Default: StoryObj<PlaygroundArgs> = {
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: {
    // Les props du composant (isOpen, actions…) ne sont pas réglables ici : on ne montre que les controls du bac à sable.
    controls: { exclude: ["isOpen", "onOpenChange", "actions", "aria-label"] },
  },
  argTypes: PLAYGROUND_ARGTYPES,
  args: PLAYGROUND_ARGS,
  render: function PlaygroundStory(args) {
    // `menuOpen` est l'état réel de la couche : le « + » le met à jour dans le panneau Controls.
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return (
      <QuickActionsDemo
        open={args.menuOpen}
        onOpenChange={(menuOpen) => updateArgs({ menuOpen })}
        actions={actionsFromArgs(args)}
      />
    );
  },
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

    await step("les deux rangées sont du ton par défaut, porté par la pastille d'icône", async () => {
      for (const name of ["Déclarer un évènement", "Démarrer une ronde"]) {
        const row = screen.getByRole("button", { name });
        await expect(row.querySelector("[data-tone]")).toHaveAttribute("data-tone", "comete");
      }
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
      await expect(onAction).toHaveBeenCalledWith("patrol");
      await waitFor(() => expect(dialog()).toBeNull());
    });
  },
};
