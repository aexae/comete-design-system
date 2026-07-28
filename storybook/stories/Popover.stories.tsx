// Popover — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "@aexae/comete-design-system/components";
import { Button } from "@aexae/comete-design-system/components";
import { DialogTrigger, Dialog } from "react-aria-components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le popover affiche un contenu riche dans un panneau flottant ancré à un élément déclencheur. Contrairement au tooltip, il peut contenir des éléments interactifs et reste ouvert jusqu'à fermeture explicite." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <DialogTrigger>
                    <Button>Détails</Button>
                    <Popover>
                      <Dialog
                        aria-label="Détails"
                        style={{ padding: "var(--space200)", outline: "none", maxWidth: 240 }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "var(--font-family-primary)",
                            fontSize: "var(--font-size-ui-xs)",
                            color: "var(--text-default)",
                          }}
                        >
                          Complément d&apos;information court et ciblé.
                        </p>
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                ),
                caption: "Complément contextuel court, ancré au déclencheur.",
              }}
              dontExample={{
                example: (
                  <DialogTrigger>
                    <Button>Ouvrir</Button>
                    <Popover>
                      <Dialog
                        aria-label="Formulaire"
                        style={{ padding: "var(--space200)", outline: "none", maxWidth: 240 }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "var(--font-family-primary)",
                            fontSize: "var(--font-size-ui-xs)",
                            color: "var(--text-default)",
                          }}
                        >
                          Un formulaire long ou une liste d&apos;actions n&apos;a pas sa place ici.
                        </p>
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                ),
                caption: "Ne pas y loger un formulaire long ou une liste d'actions.",
              }}
              when={[
                "Afficher un complément contextuel riche ancré à un déclencheur (détails, mini-formulaire, aide).",
                "Quand le contenu peut être interactif et se ferme au clic extérieur (via DialogTrigger).",
              ]}
              avoid={[
                "Une liste d'actions → Menu.",
                "Une décision bloquante → ModalDialog ; un panneau étendu → Drawer.",
                "Un simple libellé au survol → un tooltip.",
              ]}
              best={[
                "Contenu court et focalisé ; `aria-label` sur le Dialog ; ancrer près du déclencheur.",
                "Éviter d'imbriquer des overlays ; fermer au clic extérieur et à Échap.",
              ]}
              accessibility={[
                "Le déclencheur porte `aria-expanded` ; le focus entre dans le popover à l'ouverture.",
                "Fermeture au clic extérieur et à Échap ; `aria-label` sur le Dialog.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3704:70994") },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

// -----------------------------------------------------------------------
// Stories

/** Popover par défaut avec DialogTrigger. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3247:9516") } },
  render: () => (
    <DialogTrigger>
      <Button>Ouvrir le popover</Button>
      <Popover>
        <Dialog
          aria-label="Informations"
          style={{ padding: "var(--space200)", outline: "none" }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-family-primary)",
              fontSize: "var(--font-size-ui-xs)",
              lineHeight: "var(--line-height-ui-xs)",
              color: "var(--text-default)",
            }}
          >
            Contenu du popover
          </p>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
};

/** Popover avec contenu riche. */
export const RichContent: Story = {
  name: "Rich content",
  render: () => (
    <DialogTrigger>
      <Button>Détails</Button>
      <Popover>
        <Dialog
          aria-label="Détails"
          style={{ padding: "var(--space200)", outline: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-family-primary)",
              color: "var(--text-default)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-ui-s)",
                fontWeight: 600,
                lineHeight: "var(--line-height-ui-s)",
              }}
            >
              Titre
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "var(--font-size-ui-xs)",
                lineHeight: "var(--line-height-ui-xs)",
                color: "var(--text-subtle)",
              }}
            >
              Description détaillée du contenu affiché dans le popover.
            </p>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
};
