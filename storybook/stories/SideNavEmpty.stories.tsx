// SideNav.Empty — état vide de la navigation latérale
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SideNavEmpty, Button } from "@aexae/comete-design-system/components";
import type { SideNavEmptyProps } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { MainCouranteShell } from "./_appShell";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const meta = {
  title: "Navigation/SideNav/Empty",
  component: SideNavEmpty,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Quand la navigation ne contient aucune entrée (droits restreints, recherche sans résultat, espace vierge).",
                "À rendre à la place des SideNav.Section / SideNav.Item.",
              ]}
              avoid={[
                "Laisser une colonne vide sans explication → toujours un message.",
                "Un état vide verbeux : rester concis, la colonne est étroite (~240px).",
              ]}
              best={[
                "Message court + `action` pour débloquer l'utilisateur (demander l'accès, réinitialiser un filtre).",
                "Garder la marque (SideNav.Header) et le footer réels ; seul le corps affiche l'état vide.",
              ]}
              accessibility={[
                "Texte explicite décrivant pourquoi c'est vide et la suite possible.",
                "L'action éventuelle est un contrôle focusable avec un libellé clair.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  decorators: [
    (Story) => <MainCouranteShell nav={<Story />} />,
  ],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
  },
  args: {
    title: "Aucune rubrique",
    description: "Aucune rubrique n'est accessible pour votre profil.",
    icon: undefined,
  },
} satisfies Meta<SideNavEmptyProps>;

export default meta;
type Story = StoryObj<SideNavEmptyProps>;

/** État vide dans le template réel : titre + description, sans icône. */
export const Default: Story = {};

/** Avec icône illustrative pour poser le contexte. */
export const WithIcon: Story = {
  name: "With icon",
  args: {
    icon: "Search",
    title: "Aucune rubrique",
    description: "Aucune rubrique n'est accessible pour votre profil.",
  },
};

/** Accès restreint, avec une action pour débloquer l'utilisateur. */
export const WithAction: Story = {
  name: "With action",
  args: {
    icon: "Lock",
    title: "Accès restreint",
    description: "Aucune section n'est disponible pour votre profil.",
    action: (
      <Button appearance="subtle" density="compact">
        Demander l&apos;accès
      </Button>
    ),
  },
};
