// ButtonGroup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroup } from "@aexae/comete-design-system/components";
import { Button } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <ButtonGroup aria-label="Actions">
                    <Button appearance="subtle">Annuler</Button>
                    <Button color="brand">Confirmer</Button>
                  </ButtonGroup>
                ),
                caption: "2 à 3 actions liées, action principale à droite.",
              }}
              dontExample={{
                example: (
                  <ButtonGroup aria-label="Actions">
                    <Button appearance="subtle">Exporter</Button>
                    <Button appearance="subtle">Partager</Button>
                    <Button appearance="subtle">Dupliquer</Button>
                    <Button appearance="subtle">Archiver</Button>
                    <Button appearance="subtle">Supprimer</Button>
                  </ButtonGroup>
                ),
                caption: "Ne pas aligner une longue liste d'actions.",
              }}
              when={[
                "Regrouper 2 à 3 actions liées d'une même zone (pied de formulaire, barre d'actions, dialogue).",
                "Aligner et espacer des boutons de façon cohérente sans gérer le gap manuellement.",
              ]}
              avoid={[
                "Une longue liste d'actions → préférer un Menu (overflow) plutôt qu'une rangée de boutons.",
                "Des boutons sans lien fonctionnel entre eux → les disposer via un layout (Cluster/Stack).",
                "Une sélection segmentée (un seul actif à la fois) → ToggleButtonGroup.",
              ]}
              best={[
                "Ordre recommandé : action principale (`contained`) à droite, secondaires (`outlined`/`subtle`) à gauche.",
                "Une seule action principale par groupe ; fournir un `aria-label` décrivant le groupe.",
              ]}
              accessibility={[
                "Fournir un `aria-label` décrivant le groupe d'actions.",
                "Une seule action principale par groupe pour guider la décision.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4608:17266") },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// -----------------------------------------------------------------------
// Stories

export const OneButton: Story = {
  name: "1 bouton",
  parameters: { design: { type: "figma", url: figmaUrl("4608:17255") } },
  render: () => (
    <ButtonGroup>
      <Button color="brand">Confirmer</Button>
    </ButtonGroup>
  ),
};

export const TwoButtons: Story = {
  name: "2 boutons",
  parameters: { design: { type: "figma", url: figmaUrl("4608:17267") } },
  render: () => (
    <ButtonGroup aria-label="Actions">
      <Button>Annuler</Button>
      <Button color="brand">Confirmer</Button>
    </ButtonGroup>
  ),
};

export const ThreeButtons: Story = {
  name: "3 boutons",
  parameters: { design: { type: "figma", url: figmaUrl("4608:17280") } },
  render: () => (
    <ButtonGroup aria-label="Actions du formulaire">
      <Button appearance="subtle">Annuler</Button>
      <Button appearance="outlined" color="brand">Enregistrer en brouillon</Button>
      <Button color="brand">Publier</Button>
    </ButtonGroup>
  ),
};

export const MixedVariants: Story = {
  name: "Variantes mixtes",
  parameters: { design: { type: "figma", url: figmaUrl("4608:17266") } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ButtonGroup>
        <Button appearance="outlined">Annuler</Button>
        <Button appearance="contained" color="brand">Confirmer</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button appearance="contained" color="default">Exporter</Button>
        <Button appearance="contained" color="critical">Supprimer</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button appearance="subtle">Ignorer</Button>
        <Button appearance="subtle" color="brand">Enregistrer</Button>
        <Button appearance="subtle" color="critical">Rejeter</Button>
      </ButtonGroup>
    </div>
  ),
};

/** Toutes les densités de bouton supportées dans un groupe. */
export const AllSpacings: Story = {
  name: "Toutes les densités",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <ButtonGroup aria-label="Actions default">
        <Button>Annuler</Button>
        <Button color="brand">Confirmer</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Actions compact">
        <Button density="compact">Annuler</Button>
        <Button density="compact" color="brand">Confirmer</Button>
      </ButtonGroup>
    </div>
  ),
};

/** Groupe avec icônes avant/après le label. */
export const WithIcons: Story = {
  name: "Avec icônes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <ButtonGroup aria-label="Navigation">
        <Button appearance="outlined" iconBefore="ChevronLeft">Précédent</Button>
        <Button color="brand" iconAfter="ChevronRight">Suivant</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Actions">
        <Button appearance="subtle" iconBefore="Download">Télécharger</Button>
        <Button appearance="subtle" iconBefore="IosShare">Partager</Button>
        <Button appearance="subtle" color="critical" iconBefore="Delete">Supprimer</Button>
      </ButtonGroup>
    </div>
  ),
};
