// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "storybook/test";
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
      description: { component: "La navigation latérale affiche la structure hiérarchique de l'application dans un panneau vertical permanent ou repliable. Elle permet de naviguer entre les sections et sous-sections tout en visualisant la position courante." },
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

/**
 * **Peek au survol** — la SideNav est repliée ; survoler le `SideNav.Trigger`
 * (dans le header) la rouvre temporairement : elle POUSSE le contenu vers la
 * droite (pas d'overlay). Le `play` survole le Trigger pour figer l'état peek.
 */
export const Peek: Story = {
  name: "Peek (survol du Trigger)",
  args: { initialCollapsed: true },
  render: (args) => (
    <MainCouranteShell nav={<MainCouranteNav />} initialCollapsed={args.initialCollapsed} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: /navigation/i }));
  },
};

/**
 * **Logo surdimensionné** — vérifie la contrainte de `SideNav.Header` : un logo
 * de 160px fourni au slot est mis à l'échelle (hauteur bornée à ~40px), sans
 * casser la hauteur de l'en-tête.
 */
export const OversizedLogo: Story = {
  name: "Logo surdimensionné (contrainte)",
  parameters: { controls: { disable: true } },
  render: () => (
    <MainCouranteShell
      nav={<MainCouranteNav />}
      logo={
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "var(--radius200)",
            background: "var(--background-neutral-bold-default)",
          }}
        />
      }
    />
  ),
};

/**
 * **Pied de marque** — `SideNav.Footer` affiche un logo discret (opacité
 * réduite), centré en bas ; l'opacité remonte au survol. Visible ici au bas de
 * la navigation déployée.
 */
export const BrandFooter: Story = {
  name: "Pied de marque",
  parameters: { controls: { disable: true } },
  render: () => <MainCouranteShell nav={<MainCouranteNav />} />,
};
