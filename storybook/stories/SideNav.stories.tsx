// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SideNav } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { MainCouranteShell, MainCouranteNav } from "./_appShell";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

type StoryArgs = { initialCollapsed: boolean };

const meta: Meta<StoryArgs> = {
  title: "Navigation/SideNav",
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Navigation principale persistante d'une application, sur le côté (sections, rubriques).",
                "Quand la hiérarchie de navigation est riche et bénéficie d'un mode replié (collapse).",
              ]}
              avoid={[
                "Une navigation d'app mobile → BottomNav.",
                "Une barre supérieure globale (marque, compte, actions) → TopNav.",
                "Naviguer entre vues d'une même page → Tabs.",
              ]}
              best={[
                "Structurer avec SideNavSection/Item ; un seul item actif reflétant la route courante.",
                "Prévoir l'état replié (icônes + tooltips) ; garder l'ordre stable entre les pages.",
              ]}
              accessibility={[
                "Repère de navigation (`nav`) avec un libellé ; un seul item courant (`aria-current`).",
                "Utilisable au clavier ; en mode replié, chaque icône garde un nom accessible.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  argTypes: {
    initialCollapsed: { control: "boolean" },
  },
  args: { initialCollapsed: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Composition complète : SideNav.Provider + SideNav + Page avec Trigger
 *  dans Page.Header.leading. Expanded par défaut. */
export const Default: Story = {
  render: (args) => (
    <MainCouranteShell nav={<MainCouranteNav />} initialCollapsed={args.initialCollapsed} />
  ),
};

/** Mode réduit : la SideNav est totalement invisible. Le Trigger dans
 *  `Page.Header.leading` permet de rouvrir (click) ou de peek (hover). */
export const Collapsed: Story = {
  args: { initialCollapsed: true },
  render: (args) => (
    <MainCouranteShell nav={<MainCouranteNav />} initialCollapsed={args.initialCollapsed} />
  ),
};

/**
 * **Chargement** — même template, mais les rubriques de navigation chargent :
 * la marque (SideNav.Header) et le footer restent, seul le corps est en
 * skeleton (3 groupes calqués sur Manager / MCE / Administration).
 */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <MainCouranteShell
      nav={
        <>
          <SideNav.Skeleton count={4} />
          <SideNav.Divider />
          <SideNav.Skeleton count={2} />
          <SideNav.Divider />
          <SideNav.Skeleton count={3} />
        </>
      }
    />
  ),
};

/**
 * **Vide** — même template, mais aucune rubrique n'est accessible : la marque
 * et le footer restent, le corps affiche l'état vide (`SideNav.Empty`).
 */
export const Empty: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <MainCouranteShell
      nav={
        <SideNav.Empty
          icon="Search"
          title="Aucune rubrique"
          description="Aucune rubrique n'est accessible pour votre profil."
        />
      }
    />
  ),
};
