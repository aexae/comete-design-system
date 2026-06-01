// InformativeState — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InformativeState,
  Illustration,
  ButtonGroup,
  Button,
} from "@aexae/comete-design-system/components";
import type { IllustrationName } from "@naxit/comete-illustrations";
import { illustrationRegistry } from "@naxit/comete-illustrations";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Illustration options (from registry — always in sync)

const ILLUSTRATION_NAMES = Object.keys(illustrationRegistry).sort() as IllustrationName[];

// -----------------------------------------------------------------------
// Story args — match Figma properties

interface InformativeStateStoryArgs {
  /** Figma: image (boolean) */
  image: boolean;
  /** Figma: slot {imageURL} (instance swap) */
  illustration: IllustrationName;
  /** Figma: description (boolean) */
  description: boolean;
  /** Figma: description text */
  descriptionText: string;
  /** Figma: actions (boolean) */
  actions: boolean;
  /** Figma: title text */
  title: string;
  /** Extra: primary action label */
  primaryAction: string;
  /** Extra: secondary action label (empty = hidden) */
  secondaryAction: string;
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/InformativeState",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4775:13731"),
    },
  },
  argTypes: {
    // Figma order: title → description (bool) → description text → image → slot {imageURL} → actions
    title: {
      control: "text",
      description: "Titre principal",
    },
    description: {
      control: "boolean",
      description: "Afficher la description",
    },
    descriptionText: {
      control: "text",
      description: "Texte de description",
      name: "description text",
      if: { arg: "description" },
    },
    image: {
      control: "boolean",
      description: "Afficher l'illustration",
    },
    illustration: {
      control: "select",
      options: ILLUSTRATION_NAMES,
      description: "Illustration a afficher",
      name: "slot {imageURL}",
      if: { arg: "image" },
    },
    actions: {
      control: "boolean",
      description: "Afficher les boutons d'action",
    },
    primaryAction: {
      control: "text",
      description: "Label du bouton principal",
      name: "primaryAction label",
      if: { arg: "actions" },
    },
    secondaryAction: {
      control: "text",
      description: "Label du bouton secondaire (vide = masque)",
      name: "secondaryAction label",
      if: { arg: "actions" },
    },
  },
  args: {
    title: "Créer un élément",
    description: true,
    descriptionText: "Description",
    image: true,
    illustration: ILLUSTRATION_NAMES[0],
    actions: true,
    primaryAction: "Primary action",
    secondaryAction: "",
  },
} satisfies Meta<InformativeStateStoryArgs>;

export default meta;
type Story = StoryObj<InformativeStateStoryArgs>;

// -----------------------------------------------------------------------
// Render

function InformativeStateStory(args: InformativeStateStoryArgs) {
  const imageSlot = args.image ? (
    <Illustration illustration={args.illustration} size={128} />
  ) : undefined;

  const actionsSlot = args.actions ? (
    <ButtonGroup>
      {args.secondaryAction && (
        <Button appearance="outlined" color="default">
          {args.secondaryAction}
        </Button>
      )}
      <Button appearance="contained" color="brand">
        {args.primaryAction}
      </Button>
    </ButtonGroup>
  ) : undefined;

  return (
    <InformativeState
      title={args.title}
      description={args.description ? args.descriptionText : undefined}
      image={imageSlot}
      actions={actionsSlot}
    />
  );
}

// -----------------------------------------------------------------------
// Stories

/** Etat par defaut avec illustration, titre, description et action. */
export const Default: Story = {
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Sans illustration. */
export const WithoutImage: Story = {
  name: "Without image",
  args: { image: false },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Sans description. */
export const WithoutDescription: Story = {
  name: "Without description",
  args: { description: false },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Sans actions. */
export const WithoutActions: Story = {
  name: "Without actions",
  args: { actions: false },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Titre seul. */
export const TitleOnly: Story = {
  name: "Title only",
  args: { image: false, description: false, actions: false },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Avec deux boutons d'action. */
export const WithTwoActions: Story = {
  name: "With two actions",
  args: {
    primaryAction: "Créer",
    secondaryAction: "Annuler",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:13732") },
  },
  render: InformativeStateStory,
};

/** Etat d'erreur avec illustration ConnexionError. */
export const Error: Story = {
  args: {
    title: "Erreur de chargement",
    illustration: "ConnexionError" as IllustrationName,
    actions: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("5624:2764") },
  },
  render: InformativeStateStory,
};

/** Etat vide avec illustration Empty. */
export const Empty: Story = {
  args: {
    illustration: "Empty" as IllustrationName,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4775:14145") },
  },
  render: InformativeStateStory,
};

/** Toutes les variantes de contenu. */
export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      <InformativeState
        title="Complet"
        description="Illustration, description et action."
        image={<Illustration illustration="Empty" size={128} />}
        actions={
          <ButtonGroup aria-label="Actions — Complet">
            <Button color="brand">Action</Button>
          </ButtonGroup>
        }
      />
      <InformativeState
        title="Sans illustration"
        description="Description et action uniquement."
        actions={
          <ButtonGroup aria-label="Actions — Sans illustration">
            <Button color="brand">Action</Button>
          </ButtonGroup>
        }
      />
      <InformativeState
        title="Sans description"
        image={<Illustration illustration="Empty" size={128} />}
        actions={
          <ButtonGroup aria-label="Actions — Sans description">
            <Button color="brand">Action</Button>
          </ButtonGroup>
        }
      />
      <InformativeState title="Titre seul" />
      <InformativeState
        title="Erreur"
        description="Impossible de charger les données."
        image={<Illustration illustration="ConnexionError" size={128} />}
      />
      <InformativeState
        title="Vide"
        description="Aucun élément à afficher."
        image={<Illustration illustration="Empty" size={128} />}
        actions={
          <ButtonGroup aria-label="Actions — Vide">
            <Button appearance="subtle">Annuler</Button>
            <Button color="brand">Créer</Button>
          </ButtonGroup>
        }
      />
    </div>
  ),
};
