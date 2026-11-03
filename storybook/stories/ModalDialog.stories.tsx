// ModalDialog — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ModalDialog,
  Button,
  ButtonGroup,
  type ModalDialogAppearance,
  type ModalDialogWidth,
} from "@aexae/comete-design-system/components";
import { expect } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/ModalDialog",
  component: ModalDialog,
  tags: ["autodocs"],
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "warning", "critical"] satisfies ModalDialogAppearance[],
    },
    width: {
      control: "select",
      options: ["xsmall", "small", "medium", "large", "xlarge"] satisfies ModalDialogWidth[],
    },
    isDismissable: { control: "boolean" },
  },
  args: {
    title: "Modal title",
    appearance: "default",
    width: "medium",
    isDismissable: true,
  },
  parameters: {
    docs: {
      description: { component: "La modale est une fenêtre superposée qui interrompt le flux principal pour demander une confirmation, afficher un formulaire ou présenter un contenu critique. Elle bloque l'interaction avec la page sous-jacente jusqu'à sa fermeture." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <ModalStory
                    title="Supprimer l'élément ?"
                    appearance="critical"
                  />
                ),
                caption: "Décision courte ou confirmation, actions explicites.",
              }}
              dontExample={{
                example: <ModalStory title="Modifier le profil complet" />,
                caption:
                  "Ne pas y loger un long formulaire ou un flux en plusieurs étapes.",
              }}
              when={[
                "Interrompre le flux pour une tâche courte ou une décision nécessitant l'attention (confirmation, formulaire bref).",
                "Quand l'utilisateur doit agir ou annuler avant de continuer.",
              ]}
              avoid={[
                "Un contenu long ou un formulaire étendu → Drawer ou une page dédiée.",
                "Un message non bloquant → Snackbar (transitoire) ou Banner/SectionMessage (inline).",
                "Un petit complément contextuel ancré à un élément → Popover.",
              ]}
              best={[
                "Titre clair + actions explicites en pied (ButtonGroup, action principale à droite).",
                "`appearance=\"critical\"` pour une action destructrice ; `isDismissable` sauf décision obligatoire.",
              ]}
              accessibility={[
                "Focus piégé dans la modale ; Échap ferme ; focus rendu au déclencheur à la fermeture.",
                "Titre relié via aria (`aria-labelledby`) ; le contenu de fond est rendu inerte.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4613:36336") },
  },
} satisfies Meta<typeof ModalDialog>;

export default meta;
type Story = StoryObj<typeof ModalDialog>;

// -----------------------------------------------------------------------
// Helper

function ModalStory({
  appearance = "default",
  width = "medium",
  showClose = false,
  isDismissable,
  title = "Confirmer l'action",
}: {
  appearance?: ModalDialogAppearance;
  width?: ModalDialogWidth;
  showClose?: boolean;
  isDismissable?: boolean;
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const confirmColor =
    appearance === "critical"
      ? "critical"
      : appearance === "warning"
        ? "warning"
        : "comete";

  return (
    <>
      <Button onPress={() => { setIsOpen(true); }}>Ouvrir la modale</Button>
      <ModalDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        isDismissable={isDismissable}
        appearance={appearance}
        width={width}
        onClose={showClose ? () => { setIsOpen(false); } : undefined}
        footer={
          <ButtonGroup>
            <Button appearance="subtle" onPress={() => { setIsOpen(false); }}>
              Annuler
            </Button>
            <Button color={confirmColor} onPress={() => { setIsOpen(false); }}>
              Confirmer
            </Button>
          </ButtonGroup>
        }
      >
        <p style={{ margin: 0 }}>
          Êtes-vous sûr de vouloir effectuer cette action ? Cette opération ne
          peut pas être annulée.
        </p>
      </ModalDialog>
    </>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Modale par défaut. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7280") } },
  render: (args) => <ModalStory appearance={args.appearance} width={args.width} isDismissable={args.isDismissable} title={args.title} />,
};

/** Modale warning. */
export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7324") } },
  args: { appearance: "warning" },
  render: (args) => <ModalStory {...args} />,
};

/** Modale critical. */
export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4616:7370") } },
  args: { appearance: "critical" },
  render: (args) => <ModalStory {...args} />,
};

/** Modale xsmall. */
export const XSmall: Story = {
  name: "Width xsmall",
  args: { width: "xsmall" },
  render: (args) => <ModalStory {...args} />,
};

/** Modale xlarge. */
export const XLarge: Story = {
  name: "Width xlarge",
  args: { width: "xlarge" },
  render: (args) => <ModalStory {...args} />,
};

/** Avec bouton close. */
export const WithClose: Story = {
  name: "With close button",
  render: (args) => <ModalStory {...args} showClose />,
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: () => {
    const appearances: ModalDialogAppearance[] = ["default", "warning", "critical"];
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {appearances.map((a) => (
          <ModalStory key={a} appearance={a} />
        ))}
      </div>
    );
  },
};

/**
 * Corps long : le contenu défile, le header et le footer restent en place.
 *
 * Le corps est un `ScrollArea` (`visibility="auto"`, ombres de débordement) :
 * l'ascenseur flotte au-dessus du contenu et s'estompe au repos, où ce sont
 * les fondus haut et bas qui disent qu'il reste du contenu.
 */
export const ScrollableBody: Story = {
  name: "Scrollable body",
  parameters: { controls: { disable: true } },
  render: () => (
    <ModalDialog
      isOpen
      onOpenChange={() => undefined}
      title="Contenu long"
      footer={
        <ButtonGroup>
          <Button appearance="subtle">Annuler</Button>
          <Button color="comete">Confirmer</Button>
        </ButtonGroup>
      }
    >
      {Array.from({ length: 40 }, (_, i) => (
        <p key={i}>
          Ligne {i + 1} — contenu qui déborde largement la hauteur de la modale.
        </p>
      ))}
    </ModalDialog>
  ),
  play: async () => {
    // La modale est portalisée dans document.body.
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');
    await expect(dialog).not.toBeNull();

    // Le corps est un `ScrollArea` : sa racine tient la place dans la colonne,
    // et c'est le viewport qu'elle contient qui défile.
    const body = dialog!.querySelector<HTMLElement>('[class*="body"]');
    const viewport = body?.querySelector<HTMLElement>('[class*="viewport"]');
    const footer = dialog!.querySelector<HTMLElement>('[class*="footer"]');
    await expect(viewport).not.toBeNull();
    await expect(footer).not.toBeNull();

    await expect(getComputedStyle(body!).minHeight).toBe("0px");
    await expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
    // L'ascenseur est rendu : il ne vole aucun couloir au contenu.
    await expect(viewport!.offsetWidth - viewport!.clientWidth).toBe(0);
    // Le footer reste dans les limites du dialog (pas poussé dehors).
    const dRect = dialog!.getBoundingClientRect();
    const fRect = footer!.getBoundingClientRect();
    await expect(Math.round(fRect.bottom)).toBeLessThanOrEqual(Math.round(dRect.bottom) + 1);
  },
};
