// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
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
 * (dans le header) l'affiche en **overlay glissant** par-dessus le contenu.
 * Le contenu principal (« Contenu principal », à droite) **ne bouge pas** : le
 * container garde une largeur de 0. Le `play` survole le Trigger pour figer
 * l'overlay, puis vérifie que le contenu n'a pas été décalé.
 */
export const Peek: Story = {
  name: "Peek (survol du Trigger)",
  args: { initialCollapsed: true },
  render: (args) => (
    <MainCouranteShell nav={<MainCouranteNav />} initialCollapsed={args.initialCollapsed} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvasElement.querySelector("main");
    const container = canvasElement.querySelector("nav")?.parentElement;
    const mainLeftBefore = main?.getBoundingClientRect().left;

    await userEvent.hover(canvas.getByRole("button", { name: /navigation/i }));

    // Overlay (pas push) : le contenu principal n'a pas changé de position…
    await expect(main?.getBoundingClientRect().left).toBe(mainLeftBefore);
    // …et le container ne réserve toujours aucune largeur.
    await expect(container?.getBoundingClientRect().width).toBe(0);
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
        <img
          alt="Logo 160×160"
          width={160}
          height={160}
          src={`data:image/svg+xml,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="24" fill="#334155"/></svg>',
          )}`}
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

/**
 * **Défilement interne** — beaucoup d'entrées : seul le corps (sections +
 * items) défile, tandis que le header (marque) et le footer (comète link)
 * restent épinglés. Réduis la hauteur du canvas pour voir le scroll apparaître.
 */
export const Scrollable: Story = {
  name: "Scroll (contenu long)",
  parameters: { controls: { disable: true } },
  render: () => (
    <MainCouranteShell
      nav={
        <>
          <SideNav.Section title="Manager">
            <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
            <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
            <SideNav.Item label="Sites" iconBefore="Site" href="/sites" />
            <SideNav.Item label="Pointages" iconBefore="Clockings" href="/pointages" />
            <SideNav.Item label="Plannings" iconBefore="CalendarMonth" href="/plannings" />
            <SideNav.Item label="Vacations" iconBefore="EventAvailable" href="/vacations" />
          </SideNav.Section>
          <SideNav.Divider />
          <SideNav.Section title="MCE">
            <SideNav.Item label="MCE" iconBefore="MenuBook" href="/mce" />
            <SideNav.Item label="Formulaires" iconBefore="FormEdit" href="/forms" />
            <SideNav.Item label="Rapports" iconBefore="Assignment" href="/reports" />
            <SideNav.Item label="Anomalies" iconBefore="Warning" href="/issues" />
          </SideNav.Section>
          <SideNav.Divider />
          <SideNav.Section title="Administration">
            <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
            <SideNav.Item label="Droits" iconBefore="ManageAccounts" href="/permissions" />
            <SideNav.Item label="Licences" iconBefore="Key" href="/licences" />
            <SideNav.Item label="Facturation" iconBefore="Payments" href="/billing" />
            <SideNav.Item label="Intégrations" iconBefore="Extension" href="/integrations" />
            <SideNav.Item label="Journaux" iconBefore="Description" href="/logs" />
            <SideNav.Item label="Paramètres" iconBefore="Settings" href="/settings" />
          </SideNav.Section>
        </>
      }
    />
  ),
};
