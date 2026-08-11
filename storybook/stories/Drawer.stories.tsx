// Drawer — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerProvider,
  Button,
  type DrawerPlacement,
  type DrawerSize,
  type DrawerStacking,
} from "@aexae/comete-design-system/components";
import { within, userEvent, expect } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <DrawerProvider>
        <Story />
      </DrawerProvider>
    ),
  ],
  argTypes: {
    placement: {
      control: "select",
      options: ["left", "right", "top", "bottom"] satisfies DrawerPlacement[],
    },
    size: {
      control: "select",
      options: ["narrow", "medium", "wide", "extended", "full"] satisfies DrawerSize[],
    },
    stacking: {
      control: "select",
      options: ["overlay", "push"] satisfies DrawerStacking[],
    },
    swipeable: { control: "boolean" },
  },
  args: {
    placement: "left",
    size: "medium",
    stacking: "overlay",
    swipeable: false,
  },
  parameters: {
    docs: {
      description: { component: "Le drawer est un panneau latéral qui coulisse depuis le bord de l'écran pour afficher du contenu secondaire ou des actions contextuelles. Il préserve le contexte de la page principale tout en offrant un espace dédié." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <DrawerProvider>
                    <DrawerStory placement="right" />
                  </DrawerProvider>
                ),
                caption:
                  "Tâche secondaire dans un panneau latéral, sans quitter la page.",
              }}
              dontExample={{
                example: (
                  <DrawerProvider>
                    <DrawerStory placement="right" />
                  </DrawerProvider>
                ),
                caption: "Ne pas l'utiliser pour une décision courte et bloquante.",
              }}
              when={[
                "Afficher un panneau latéral pour une tâche secondaire sans quitter le contexte (détails, filtres, édition).",
                "Contenu moyen à long, éventuellement empilé (stacking) ou poussant le contenu (push).",
              ]}
              avoid={[
                "Une décision courte et bloquante → ModalDialog.",
                "Un petit complément ancré à un déclencheur → Popover.",
                "Le contenu principal de la page → une vue/route dédiée.",
              ]}
              best={[
                "Structurer avec DrawerHeader/Body/Footer ; placement à droite par défaut pour les détails.",
                "Une action de fermeture toujours visible ; largeur (`size`) adaptée à la densité du contenu.",
              ]}
              accessibility={[
                "Focus déplacé dans le Drawer à l'ouverture, rendu au déclencheur à la fermeture ; Échap ferme.",
                "Fournir un titre (`aria-label`/`aria-labelledby`) décrivant le panneau.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("5088:14152") },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof Drawer>;

// -----------------------------------------------------------------------
// Story helper

function DrawerStory({
  placement = "left",
  size = "medium",
  stacking = "overlay",
  swipeable = false,
}: {
  placement?: DrawerPlacement;
  size?: DrawerSize | (string & {});
  stacking?: DrawerStacking;
  swipeable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button onPress={() => setIsOpen(true)}>
        Ouvrir le drawer ({placement}, {size})
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size={size}
        stacking={stacking}
        swipeable={swipeable}
        aria-label="Drawer exemple"
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Drawer {placement}
        </DrawerHeader>
        <DrawerBody>
          <p style={{ marginBottom: 16 }}>
            Placement : <strong>{placement}</strong> — Size : <strong>{size}</strong>
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          {Array.from({ length: 10 }, (_, i) => (
            <p key={i} style={{ marginTop: 12 }}>
              Paragraphe {i + 1} — contenu scrollable pour tester le body overflow.
            </p>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <Button appearance="subtle" onPress={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onPress={() => setIsOpen(false)}>
            Confirmer
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Drawer par défaut (left, medium). */
export const Default: Story = {
  render: (args) => (
    <DrawerStory
      placement={args.placement}
      size={args.size}
      stacking={args.stacking}
      swipeable={args.swipeable}
    />
  ),
};

/** Les 4 placements. */
export const Placements: Story = {
  name: "All placements",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 24 }}>
      {(["left", "right", "top", "bottom"] satisfies DrawerPlacement[]).map((p) => (
        <PlacementDemo key={p} placement={p} />
      ))}
    </div>
  ),
};

function PlacementDemo({ placement }: { placement: DrawerPlacement }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>{placement}</Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size="narrow"
        aria-label={`Drawer ${placement}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          {placement}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer {placement}</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Tous les presets de taille. */
export const Sizes: Story = {
  name: "Size presets",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 24 }}>
      {(["narrow", "medium", "wide", "extended", "full"] satisfies DrawerSize[]).map((s) => (
        <SizeDemo key={s} size={s} />
      ))}
    </div>
  ),
};

function SizeDemo({ size }: { size: DrawerSize }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>{size}</Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="right"
        size={size}
        aria-label={`Drawer ${size}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Size: {size}
        </DrawerHeader>
        <DrawerBody>
          <p>Ce drawer utilise la taille &quot;{size}&quot;.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Fullscreen. */
export const Fullscreen: Story = {
  args: { size: "full" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onPress={() => setIsOpen(true)}>Fullscreen</Button>
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          size={args.size}
          placement={args.placement}
          swipeable={args.swipeable}
          aria-label="Drawer fullscreen"
        >
          <DrawerHeader onClose={() => setIsOpen(false)}>Fullscreen</DrawerHeader>
          <DrawerBody>
            <p>Ce drawer occupe 100% de l&apos;écran.</p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  },
};

/** Structure complète : Header + Body + Footer. */
export const WithStructure: Story = {
  name: "With structure",
  args: { placement: "right", size: "wide" },
  render: (args) => (
    <DrawerStory
      placement={args.placement}
      size={args.size}
      stacking={args.stacking}
      swipeable={args.swipeable}
    />
  ),
};

/** Drawers stackés en mode overlay — chaque drawer peut en ouvrir un autre. */
export const StackedOverlay: Story = {
  name: "Stacked (overlay)",
  render: (args) => {
    return (
      <div style={{ padding: 24 }}>
        <StackableDrawer
          depth={1}
          placement={args.placement ?? "left"}
          size={args.size ?? "medium"}
        />
      </div>
    );
  },
};

function StackableDrawer({
  depth,
  placement,
  size,
}: {
  depth: number;
  placement: DrawerPlacement;
  size: DrawerSize | (string & {});
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>
        {depth === 1 ? "Ouvrir le drawer" : `Empiler drawer ${depth}`}
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size={size}
        aria-label={`Drawer ${depth}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Drawer {depth}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer de niveau {depth}.</p>
          <div style={{ marginTop: 16 }}>
            <StackableDrawer depth={depth + 1} placement={placement} size={size} />
          </div>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Drawers stackés en mode push — chaque drawer peut en empiler un autre qui pousse tous les précédents. */
export const StackedPush: Story = {
  name: "Stacked (push)",
  render: (args) => {
    return (
      <div style={{ padding: 24 }}>
        <PushableDrawer
          depth={1}
          placement={args.placement ?? "left"}
          size={args.size ?? "medium"}
        />
      </div>
    );
  },
};

function PushableDrawer({
  depth,
  placement,
  size,
}: {
  depth: number;
  placement: DrawerPlacement;
  size: DrawerSize | (string & {});
}) {
  const [isOpen, setIsOpen] = useState(false);
  // First drawer uses its own size; subsequent pushers use "narrow" to make room
  const thisSize = depth === 1 ? size : "narrow";
  const stacking = depth === 1 ? "overlay" : "push";

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>
        {depth === 1 ? "Ouvrir le drawer" : `Empiler drawer ${depth} (push)`}
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size={thisSize}
        stacking={stacking}
        aria-label={`Drawer ${depth}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Drawer {depth}{depth > 1 ? " (push)" : ""}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer de niveau {depth}.</p>
          <div style={{ marginTop: 16 }}>
            <PushableDrawer depth={depth + 1} placement={placement} size={size} />
          </div>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Swipeable (mobile). */
export const Swipeable: Story = {
  args: { swipeable: true, placement: "bottom" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onPress={() => setIsOpen(true)}>Ouvrir (swipeable)</Button>
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          placement={args.placement}
          size={args.size}
          swipeable={args.swipeable}
          aria-label="Drawer swipeable"
        >
          <DrawerHeader onClose={() => setIsOpen(false)}>
            Swipeable drawer
          </DrawerHeader>
          <DrawerBody>
            <p>Glissez vers le bas pour fermer.</p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  },
};

/**
 * **Panneau persistant (non modal).** `isModal={false}` (left/right) : le panneau
 * vit **dans le flux**, la liste se reflow à côté (elle n'est jamais recouverte),
 * sans voile ni piège à focus ; Échap ne le ferme pas. À comparer au Drawer
 * **modal** (dessous) : la même action recouvre la liste (voile + piège à focus).
 * C'est au consommateur de placer le panneau dans un conteneur flex.
 */
export const PersistentRight: Story = {
  name: "Persistent (non modal, right)",
  parameters: { controls: { disable: true } },
  render: function PersistentStory() {
    const [nonModalOpen, setNonModalOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const List = () => (
      <ul
        style={{
          flex: 1,
          minWidth: 0,
          margin: 0,
          paddingLeft: "var(--space300)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space100)",
        }}
      >
        {["Tour Nord", "Entrepôt B", "Site Est", "Galerie Comète", "Mairie de Merville"].map(
          (s) => (
            <li key={s}>{s}</li>
          ),
        )}
      </ul>
    );
    const frame = {
      display: "flex",
      gap: "var(--space200)",
      marginTop: "var(--space150)",
      alignItems: "stretch",
      border: "1px dashed var(--border-subtle)",
      padding: "var(--space150)",
      minHeight: 160,
    } as const;
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <p style={{ marginBottom: "var(--space100)", fontWeight: 600 }}>
            Non modal — la liste se reflow à côté
          </p>
          <Button
            onPress={() => setNonModalOpen((o) => !o)}
            aria-expanded={nonModalOpen}
            aria-controls="persistent-panel"
          >
            {nonModalOpen ? "Replier le panneau" : "Déplier le panneau"}
          </Button>
          <div style={frame}>
            <List />
            <Drawer
              isOpen={nonModalOpen}
              onOpenChange={setNonModalOpen}
              isModal={false}
              placement="right"
              size="280px"
              id="persistent-panel"
              aria-label="Panneau persistant"
            >
              <DrawerHeader onClose={() => setNonModalOpen(false)}>Détails</DrawerHeader>
              <DrawerBody>
                <p>
                  Ce panneau occupe sa place : la liste se réduit à côté, elle
                  n&apos;est jamais recouverte. Échap ne le ferme pas.
                </p>
              </DrawerBody>
            </Drawer>
          </div>
        </div>

        <div>
          <p style={{ marginBottom: "var(--space100)", fontWeight: 600 }}>
            Modal — recouvre la liste (voile + piège à focus)
          </p>
          <Button onPress={() => setModalOpen(true)}>Ouvrir en modal</Button>
          <div style={frame}>
            <List />
          </div>
          <Drawer
            isOpen={modalOpen}
            onOpenChange={setModalOpen}
            placement="right"
            size="narrow"
            aria-label="Panneau modal"
          >
            <DrawerHeader onClose={() => setModalOpen(false)}>Détails (modal)</DrawerHeader>
            <DrawerBody>
              <p>Voile, piège à focus, Échap et clic extérieur ferment.</p>
            </DrawerBody>
          </Drawer>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("le panneau non modal est une region, sans voile", async () => {
      const panel = canvasElement.querySelector("#persistent-panel");
      await expect(panel).not.toBeNull();
      await expect((panel as HTMLElement).tagName).toBe("SECTION");
      // aucun voile (overlay) dans le document pour le panneau non modal
      await expect(
        document.body.querySelector('[class*="overlay"]:not([class*="overlayTransparent"])'),
      ).toBeNull();
    });

    await step("Tab ne piège pas le focus dans le panneau", async () => {
      const closeBtn = canvas.getByRole("button", { name: "Fermer" });
      closeBtn.focus();
      await expect(closeBtn).toHaveFocus();
      // Plusieurs Tab finissent par sortir du panneau (pas de piège).
      const panel = canvasElement.querySelector("#persistent-panel") as HTMLElement;
      for (let i = 0; i < 6; i++) await userEvent.tab();
      await expect(panel.contains(document.activeElement)).toBe(false);
    });

    await step("Échap ne ferme pas le panneau persistant", async () => {
      await userEvent.keyboard("{Escape}");
      await expect(canvasElement.querySelector("#persistent-panel")).not.toBeNull();
    });
  },
};
