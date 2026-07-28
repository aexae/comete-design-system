// SectionMessage — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  SectionMessage,
} from "@aexae/comete-design-system/components";
import type { SectionMessageAppearance } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const APPEARANCES: SectionMessageAppearance[] = [
  "information",
  "success",
  "warning",
  "critical",
  "accentPurple",
  "accentTeal",
  "accentTurquoise",
  "accentMagenta",
  "accentBlueGrey",
];

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/SectionMessage",
  component: SectionMessage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le message de section affiche une information contextuelle, un avertissement ou une confirmation à l'intérieur d'une zone de contenu. Il se décline en plusieurs niveaux de sévérité pour adapter le ton au message." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <SectionMessage appearance="critical" title="Import échoué">
                    3 lignes n&apos;ont pas pu être importées.
                  </SectionMessage>
                ),
                caption:
                  "Message contextuel, dans le flux, près de l'élément concerné.",
              }}
              dontExample={{
                example: (
                  <SectionMessage appearance="warning" title="Maintenance">
                    L&apos;application sera indisponible ce soir.
                  </SectionMessage>
                ),
                caption: "Ne pas l'utiliser pour un message global à toute l'app.",
              }}
              when={[
                "Signaler une information contextuelle rattachée à une section ou un formulaire (aide, erreur locale, succès).",
                "Message inline persistant, dans le flux, à proximité de ce qu'il concerne.",
              ]}
              avoid={[
                "Un message global sur toute l'app → Banner.",
                "Un retour transitoire → Snackbar.",
                "Une interruption bloquante → ModalDialog.",
              ]}
              best={[
                "Titre court + explication ; apparence sémantique cohérente avec la gravité.",
                "Placer au plus près de l'élément concerné ; au plus une action principale.",
              ]}
              accessibility={[
                "L'apparence sémantique complète le texte, elle ne le remplace pas.",
                "Une action au plus, accessible au clavier.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2867-18456") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: APPEARANCES,
    },
    title: { control: "text" },
    children: { control: "text" },
  },
  args: {
    appearance: "information",
    title: "Titre",
    children: LOREM,
  },
} satisfies Meta<typeof SectionMessage>;

export default meta;
type Story = StoryObj<typeof SectionMessage>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
};

export const Information: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
  args: { appearance: "information" },
};

export const Success: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-287") } },
  args: { appearance: "success" },
};

export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-293") } },
  args: { appearance: "warning" },
};

export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("107-299") } },
  args: { appearance: "critical" },
};

export const AccentPurple: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2071-8328") } },
  args: { appearance: "accentPurple" },
};

export const WithActions: Story = {
  name: "With actions",
  parameters: { design: { type: "figma", url: figmaUrl("107-281") } },
  render: (args) => (
    <SectionMessage
      {...args}
      actions={
        <>
          <Button appearance="link" density="compact">
            Action link
          </Button>
          <Button appearance="link" density="compact">
            Action link
          </Button>
        </>
      }
    />
  ),
  args: { appearance: "information", title: "Titre", children: LOREM },
};

export const WithoutTitle: Story = {
  name: "Without title",
  args: { appearance: "information", title: undefined, children: LOREM },
};

export const WithoutIcon: Story = {
  name: "Without icon",
  args: {
    appearance: "information",
    title: "Titre",
    icon: null,
    children: LOREM,
  },
};

export const AllAppearances: Story = {
  name: "All appearances",
  parameters: { design: { type: "figma", url: figmaUrl("2867-18456") } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      {APPEARANCES.map((appearance) => (
        <SectionMessage key={appearance} appearance={appearance} title="Titre">
          {LOREM}
        </SectionMessage>
      ))}
    </div>
  ),
};

export const AllAppearancesWithActions: Story = {
  name: "All appearances with actions",
  parameters: { design: { type: "figma", url: figmaUrl("2867-18456") } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 500,
      }}
    >
      {APPEARANCES.map((appearance) => (
        <SectionMessage
          key={appearance}
          appearance={appearance}
          title="Titre"
          actions={
            <>
              <Button appearance="link" density="compact">
                Action link
              </Button>
              <Button appearance="link" density="compact">
                Action link
              </Button>
            </>
          }
        >
          {LOREM}
        </SectionMessage>
      ))}
    </div>
  ),
};
