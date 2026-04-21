// ButtonGroup — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroup } from "@naxit/comete-design-system/components";
import { Button } from "@naxit/comete-design-system/components";

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
        <Button spacing="compact">Annuler</Button>
        <Button spacing="compact" color="brand">Confirmer</Button>
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
