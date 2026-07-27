// Banner — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "@aexae/comete-design-system/components";
import type { BannerAppearance } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Banner",
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <Banner appearance="warning">
                    Maintenance prévue ce soir de 22h à minuit.
                  </Banner>
                ),
                caption: "Message global, pleine largeur, en haut de page.",
              }}
              dontExample={{
                example: (
                  <Banner appearance="information">
                    3 fichiers n&apos;ont pas pu être importés dans ce tableau.
                  </Banner>
                ),
                caption:
                  "Ne pas l'utiliser pour un message limité à une section.",
              }}
              when={[
                "Communiquer un message global concernant toute la page/l'app (maintenance, quota, annonce).",
                "Message persistant pleine largeur, placé en haut du contenu.",
              ]}
              avoid={[
                "Un message lié à une section précise → SectionMessage.",
                "Un retour transitoire après action → Snackbar.",
                "Une décision bloquante → ModalDialog.",
              ]}
              best={[
                "Un message concis + au plus une action ; apparence sémantique adaptée (`critical`/`warning`/`information`…).",
                "Un seul Banner à la fois ; le placer avant le contenu principal.",
              ]}
              accessibility={[
                "Annoncer le message via aria-live selon l'urgence (`assertive` pour `critical`).",
                "L'apparence sémantique ne doit pas être le seul indicateur — garder un texte explicite.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4559-5335") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["warning", "critical", "announcement", "success", "information"] satisfies BannerAppearance[],
    },
    children: { control: "text" },
  },
  args: {
    appearance: "warning",
    children: LOREM,
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof Banner>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5188") } },
};

export const Warning: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5188") } },
  args: { appearance: "warning", children: LOREM },
};

export const Critical: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559-5336") } },
  args: { appearance: "critical", children: LOREM },
};

export const Announcement: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("6675-45620") } },
  args: { appearance: "announcement", children: LOREM },
};

export const Success: Story = {
  args: { appearance: "success", children: LOREM },
};

export const Information: Story = {
  args: { appearance: "information", children: LOREM },
};

export const AllAppearances: Story = {
  name: "All appearances",
  parameters: { design: { type: "figma", url: figmaUrl("4559-5335") } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Banner appearance="warning">{LOREM}</Banner>
      <Banner appearance="critical">{LOREM}</Banner>
      <Banner appearance="announcement">{LOREM}</Banner>
      <Banner appearance="success">{LOREM}</Banner>
      <Banner appearance="information">{LOREM}</Banner>
    </div>
  ),
};
