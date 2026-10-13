// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { within, userEvent, expect, waitFor } from "storybook/test";
import { SideNav, Logo, Page, Button, Drawer } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { MainCouranteShell, MainCouranteNav, DemoPageContent } from "./_appShell";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const meta: Meta = {
  title: "Navigation/SideNav",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "La navigation latérale affiche la structure hiérarchique de l'application dans un panneau vertical permanent (déployé ou en rail). Elle permet de naviguer entre les sections et sous-sections tout en visualisant la position courante.\n\n" +
          "**Règles par plateforme** — le DS ne pose aucune media query, l'app choisit le mode :\n\n" +
          "- **App mobile** : pas de SideNav ; la **BottomNav** porte seule la navigation.\n" +
          "- **Mobile navigateur web** (< 768 px) : la SideNav s'affiche dans un **`Drawer` à gauche**, par-dessus le viewport ; elle ne pousse jamais le contenu.\n" +
          "- **Tablette et desktop** : elle est **permanente** : déployée (240 px) ou réduite en **rail de 80 px** (`mode=\"rail\"`), elle ne disparaît **jamais** ; elle ne s'agrandit **jamais au survol** — on le déploie par le bouton de bascule ou `Ctrl/Cmd+Shift+E`.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Navigation principale persistante d'une application, sur le côté (sections, rubriques).",
                "Quand la hiérarchie de navigation est riche et bénéficie d'un rail réduit (80 px) sur tablette et desktop.",
              ]}
              avoid={[
                "Une navigation d'app mobile → BottomNav (pas de SideNav en app mobile).",
                "Faire disparaître la navigation sur tablette / desktop : elle se réduit en rail de 80 px, jamais en `hidden`.",
                "Une barre supérieure globale (marque, compte, actions) → Page.Bar.",
                "Naviguer entre vues d'une même page → Tabs.",
              ]}
              best={[
                "Structurer avec SideNavSection/Item ; un seul item actif reflétant la route courante.",
                "Prévoir le rail (80 px : icône + libellé court) ; garder l'ordre stable entre les pages.",
              ]}
              accessibility={[
                "Repère de navigation (`nav`) avec un libellé ; un seul item courant (`aria-current`).",
                "Utilisable au clavier ; en rail, le libellé court reste visible et le libellé complet est en tooltip.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Default** — template applicatif : `Page.Bar` pleine largeur + SideNav permanente
 * (`SideNav.Provider` + `SideNav` : Header + corps + Footer) + contenu de page. La nav
 * est déployée (240 px) et **pousse** le contenu ; le bouton de l'en-tête la réduit en
 * rail (`Ctrl/Cmd+Shift+E`).
 */
export const Default: Story = {
  render: () => <MainCouranteShell nav={<MainCouranteNav />} />,
  // Navigation clavier : Tab passe d'un item à l'autre, Enter active l'item
  // focalisé. La navigation réelle (href) est interceptée pour ne pas quitter
  // la story.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let clickedLink: HTMLAnchorElement | null = null;
    const onClickCapture = (e: Event) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor) {
        clickedLink = anchor;
        e.preventDefault();
      }
    };
    canvasElement.addEventListener("click", onClickCapture, true);
    try {
      // Tab entre dans la nav → d'abord le bouton de bascule de l'en-tête…
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name: "Réduire la navigation" })).toHaveFocus();
      // …puis le premier item.
      await userEvent.tab();
      const accueil = canvas.getByRole("link", { name: "Accueil" });
      await expect(accueil).toHaveFocus();
      // Tab suivant → item suivant (déplacement clavier entre items).
      await userEvent.tab();
      const agents = canvas.getByRole("link", { name: "Agents" });
      await expect(agents).toHaveFocus();
      // Enter active l'item focalisé (clic synthétisé sur le lien).
      await userEvent.keyboard("{Enter}");
      await expect(clickedLink).toBe(agents);
    } finally {
      canvasElement.removeEventListener("click", onClickCapture, true);
    }
    // Nettoyage : retirer le focus clavier pour ne pas laisser d'anneau de
    // focus dans le snapshot visuel (baseline = story au repos).
    (document.activeElement as HTMLElement | null)?.blur();
  },
};

/**
 * **Rail (80 px)** — tablette et desktop. La navigation se réduit à un rail de
 * 80 px (icône 24 px + libellé court dessous) et ne disparaît jamais. Le rail est
 * **fixe** : il ne s'agrandit pas au survol ; on le déploie par le bouton de
 * bascule de l'en-tête ou `Ctrl/Cmd+Shift+E`.
 */
export const Rail: Story = {
  name: "Rail (80 px)",
  parameters: { design: { type: "figma", url: figmaUrl("17480:10191") } },
  render: () => <MainCouranteShell nav={<MainCouranteNav />} mode="rail" />,
};

// Test (masqué du sidebar) : le `play` ne se rejoue pas à l'ouverture de la story.
export const RailInteractions: Story = {
  tags: ["!dev"],
  render: Rail.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const container = () => canvasElement.querySelector("nav")?.parentElement as HTMLElement;
    const nav = () => canvasElement.querySelector("nav") as HTMLElement;
    const main = () => canvasElement.querySelector("main") as HTMLElement;

    await step("rail de 80 px, libellé visible sous l'icône", async () => {
      await expect(Math.round(container().getBoundingClientRect().width)).toBe(80);
      await expect(canvas.getByText("Agents")).toBeVisible();
    });

    await step("ne s'agrandit PAS au survol (le contenu ne bouge pas)", async () => {
      const mainLeft = main().getBoundingClientRect().left;
      await userEvent.hover(nav());
      await new Promise((r) => setTimeout(r, 400));
      await expect(Math.round(container().getBoundingClientRect().width)).toBe(80);
      await expect(Math.round(nav().getBoundingClientRect().width)).toBe(80);
      await expect(main().getBoundingClientRect().left).toBe(mainLeft);
    });

    await step("se déploie par le bouton de bascule", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Déployer la navigation" }));
      // La largeur s'anime (transition) : on attend la valeur finale.
      await waitFor(() => expect(Math.round(container().getBoundingClientRect().width)).toBe(240));
    });
  },
};

/**
 * **Mobile navigateur web (< 768 px)** — la SideNav s'affiche dans un **`Drawer` à
 * gauche** : elle passe **par-dessus** le contenu (voile cliquable) et ne le pousse
 * jamais. Le hamburger de la `Page.Bar` l'ouvre ; elle se referme au voile, à Échap ou
 * au choix d'une rubrique. Pas de rail sur mobile : `showToggle={false}` retire le
 * bouton de bascule de l'en-tête. (En **app mobile**, pas de SideNav : la BottomNav
 * porte seule la navigation.)
 */
function MobileWebDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Page globalActions={null} style={{ minHeight: "100vh" }}>
        <Page.Bar
          title="Accueil"
          leading={
            <Button
              appearance="subtle"
              color="subtlest"
              iconBefore="Menu"
              aria-label="Ouvrir la navigation"
              aria-expanded={isOpen}
              onPress={() => setIsOpen(true)}
            />
          }
        />
        <DemoPageContent />
      </Page>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="left"
        size="240px"
        aria-label="Navigation principale"
      >
        <SideNav.Provider>
          {/* Un clic sur une rubrique ferme le Drawer (navigation). Le conteneur
              donne toute la hauteur du Drawer à la nav. */}
          <div
            style={{ height: "100%" }}
            onClickCapture={(e) => { if ((e.target as HTMLElement).closest("a")) setIsOpen(false); }}
          >
            <SideNav>
              <SideNav.Header
                logo={<Logo product="cafe" format="icon" />}
                companyName="Pro Sécurité"
                description="Main Courante"
                showToggle={false}
              />
              <MainCouranteNav />
              <SideNav.Footer>
                <SideNav.FooterBrand>
                  <Logo size={14} product="link" appearance="neutral" format="logo" />
                </SideNav.FooterBrand>
              </SideNav.Footer>
            </SideNav>
          </div>
        </SideNav.Provider>
      </Drawer>
    </>
  );
}

export const MobileWeb: Story = {
  name: "Mobile web (Drawer left)",
  // Viewport mobile réel : le Drawer (portal + position: fixed) prend la taille d'un téléphone.
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <MobileWebDemo />,
};

export const MobileWebInteractions: Story = {
  tags: ["!dev"],
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => <MobileWebDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const hamburger = () => canvas.getByRole("button", { name: "Ouvrir la navigation" });
    const drawer = () => document.querySelector('[role="dialog"]');

    await step("fermé au départ, contenu visible", async () => {
      await expect(drawer()).toBeNull();
      await expect(canvas.getByText("Agent 1")).toBeVisible();
    });

    await step("le hamburger ouvre la nav dans un Drawer, par-dessus le contenu", async () => {
      await userEvent.click(hamburger());
      await waitFor(() => expect(drawer()).not.toBeNull());
      const dialog = within(drawer() as HTMLElement);
      await expect(dialog.getByRole("link", { name: "Agents" })).toBeInTheDocument();
      // Pas de rail sur mobile : aucun bouton de bascule dans l'en-tête.
      await expect(dialog.queryByRole("button", { name: /navigation/i })).toBeNull();
    });

    await step("se referme avec Échap", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(drawer()).toBeNull());
    });

    await step("se referme au choix d'une rubrique", async () => {
      await userEvent.click(hamburger());
      await waitFor(() => expect(drawer()).not.toBeNull());
      const link = within(drawer() as HTMLElement).getByRole("link", { name: "Agents" });
      link.addEventListener("click", (e) => e.preventDefault(), { once: true });
      await userEvent.click(link);
      await waitFor(() => expect(drawer()).toBeNull());
    });
  },
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
      isPageLoading
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
 * **Pied de marque** — `SideNav.FooterBrand` (dans `SideNav.Footer`) affiche un
 * logo discret (opacité réduite), centré en bas ; l'opacité remonte au survol.
 * Visible ici au bas de la navigation déployée.
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
  // Contenu long : le premier ET le dernier item restent focusables au clavier
  // (aucun item n'est piégé hors de l'ordre de tabulation par le défilement).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");
    const first = links[0];
    const last = links[links.length - 1];
    first.focus();
    await expect(first).toHaveFocus();
    await expect(first).toHaveTextContent("Accueil");
    last.focus();
    await expect(last).toHaveFocus();
    await expect(last).toHaveTextContent("Paramètres");
    // Nettoyage : rendre le focus et remettre le défilement en haut pour ne
    // pas altérer le snapshot visuel (baseline = liste non défilée).
    (document.activeElement as HTMLElement | null)?.blur();
    let scroller: HTMLElement | null = last;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
      scroller = scroller.parentElement;
    }
    if (scroller) scroller.scrollTop = 0;
  },
};
