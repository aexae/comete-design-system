// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { within, userEvent, expect, waitFor } from "storybook/test";
import { SideNav, Logo, Page, Button, Drawer } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { MainCouranteShell, MainCouranteNav, DemoPageContent, SideNavOnly } from "./_appShell";

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
          "**Règles par contexte et largeur** — le DS ne pose aucune media query, l'app choisit le mode. Trois axes **indépendants** (voir plus bas) : ici, le composant de navigation.\n\n" +
          "| Largeur | Web | Application |\n| --- | --- | --- |\n" +
          "| ≤ 768 px | hamburger + `Drawer` à gauche | **BottomNav** |\n" +
          "| 769 à 1199 px | hamburger + `Drawer` à gauche | **SideNav** |\n" +
          "| ≥ 1200 px | **SideNav** persistante, déployée (240 px) ou rail (80 px) | **SideNav** |\n\n" +
          "Le web bascule à **1200 px**, l'application à **768 px** : deux seuils différents, assumés. Sur le web, la SideNav n'est persistante qu'en desktop ; en dessous elle s'affiche dans un **`Drawer` à gauche**, par-dessus le viewport, et ne pousse jamais le contenu. Elle ne s'agrandit **jamais au survol** : on la déploie par le bouton de bascule ou `Ctrl/Cmd+Shift+E`.\n\n" +
          "**Conséquence acceptée** : à 1024 px (un iPad en paysage), l'application affiche une **SideNav** et Safari un **hamburger + `Drawer`**. Même appareil, même orientation, deux navigations : c'est la conséquence mécanique de deux seuils, pas un défaut. Si l'écart gêne en usage réel, ce cas concret servira à rouvrir la règle.\n\n" +
          "**Les deux autres axes, indépendants de la navigation.** La variante de `Page.Bar` suit la largeur de la **Page** (container query, seuil 768 px), pas celle du viewport. La densité et la taille des cibles suivent le **pointeur** (`pointer: coarse`), jamais une largeur : « tablette = tactile » ne veut pas dire « tablette = interface de téléphone ».\n\n" +
          "**Écarté** : un rail de 80 px sur mobile web (310 px de contenu à 390 px, 240 px au minimum exigé par WCAG 1.4.10 Reflow) ; décider sur la plateforme seule, ou sur le pointeur seul ; une barre basse sur le web mobile (sur iOS, la barre d'adresse de Safari est déjà en bas).",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Navigation principale, sur le côté (sections, rubriques). Sur le WEB, persistante en desktop seulement (≥ 1200 px) : en dessous, elle devient un Drawer qu'on ouvre. Dans l'APPLICATION, dès 769 px.",
                "Quand la hiérarchie de navigation est riche et bénéficie d'un rail réduit (80 px) — web ≥ 1200 px, application ≥ 769 px.",
              ]}
              avoid={[
                "Une navigation d'application à 768 px et moins → BottomNav (pas de SideNav sous 769 px dans l'application).",
                "Faire disparaître la navigation sur desktop : elle se réduit en rail de 80 px, jamais complètement. Sur le web sous 1200 px en revanche, il n'y a pas de nav permanente : hamburger + Drawer.",
                "Un rail de 80 px sur mobile web, ou une barre basse sur le web mobile.",
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
 * **Rail (80 px)** — desktop uniquement (≥ 1200 px). La navigation se réduit à un rail de
 * 80 px (icône 24 px + libellé court dessous) et ne disparaît jamais. Le rail est
 * **fixe** : il ne s'agrandit pas au survol ; on le déploie par le bouton de
 * bascule de l'en-tête ou `Ctrl/Cmd+Shift+E`.
 */
export const Rail: Story = {
  name: "Rail (80 px, desktop)",
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
 * **Web sous 1200 px (mobile et tablette en navigateur)** — la SideNav s'affiche dans un **`Drawer` à
 * gauche** : elle passe **par-dessus** le contenu (voile cliquable) et ne le pousse
 * jamais. Le hamburger de la `Page.Bar` l'ouvre ; elle se referme au voile, à Échap ou
 * au choix d'une rubrique. Pas de rail sur mobile : `showToggle={false}` retire le
 * bouton de bascule de l'en-tête. (Dans l'**application** à 768 px et moins, pas de
 * SideNav : la BottomNav porte seule la navigation ; dès 769 px, c'est la SideNav.)
 */
function MobileWebDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Page globalActions={null} style={{ height: "100vh", overflowY: "auto" }}>
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

/**
 * **Application tablet, landscape** (1024 × 768) — dans l'application, la SideNav prend le
 * relais de la BottomNav dès 769 px. Ici en rail (80 px), tablette tournée : c'est un outil
 * de back-office, assis, qui garde la largeur pour le contenu. Navigation seule, sans page
 * autour : la variante de `Page.Bar` selon la largeur de la Page se montre dans la doc de
 * `Page.Bar`.
 */
export const ApplicationTabletLandscape: Story = {
  name: "Application tablet, landscape",
  globals: { viewport: { value: "cometeTabletManager", isRotated: true } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <SideNavOnly nav={<MainCouranteNav />} mode="rail" />,
};

/**
 * **Web tablet, landscape** (1024 × 768) — en navigateur, le seuil de la SideNav
 * persistante est 1200 px : à 1024 px, hamburger + `Drawer`. C'est l'écart assumé avec
 * l'application, où le même iPad en paysage reçoit la SideNav en rail (story
 * « Application tablet, landscape »).
 */
export const WebTabletLandscape: Story = {
  name: "Web tablet, landscape",
  globals: { viewport: { value: "cometeTabletManager", isRotated: true } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <MobileWebDemo />,
};

/**
 * **Web tablet, portrait** (768 × 1024) — en navigateur, la tablette portrait n'a pas la
 * largeur d'un rail ET d'un contenu confortable : hamburger + `Drawer` à gauche, comme sur
 * mobile web.
 */
export const WebTabletPortrait: Story = {
  name: "Web tablet, portrait",
  globals: { viewport: { value: "cometeTabletManager", isRotated: false } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <MobileWebDemo />,
};

export const MobileWeb: Story = {
  name: "Mobile and tablet (Drawer left)",
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
 * **Chargement** — les rubriques de navigation chargent : la marque
 * (`SideNav.Header`) et le pied restent, seul le corps est en skeleton
 * (3 groupes calqués sur Manager / MCE / Administration).
 *
 * Sans la page : le sujet est l'état de chargement de la NAV, et un contenu
 * de démonstration à côté ne ferait que détourner le regard.
 */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SideNavOnly
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
 * **Vide** — aucune rubrique n'est accessible : la marque et le pied restent,
 * le corps affiche l'état vide (`SideNav.Empty`).
 *
 * Sans la page, pour la même raison que la story de chargement.
 */
export const Empty: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SideNavOnly
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
 * **Défilement interne** — beaucoup d'entrées : seul le corps (sections +
 * items) défile, tandis que le header (marque) et le footer (comète link)
 * restent épinglés. Réduis la hauteur du canvas pour voir le scroll apparaître.
 */
export const Scrollable: Story = {
  name: "Scroll (long content)",
  parameters: { controls: { disable: true } },
  render: () => (
    // Deux leviers, parce qu'un seul ne suffit pas. La hauteur est bornée :
    // à 100vh, un grand écran affiche tout et l'ascenseur ne paraît jamais.
    // 720px reste une hauteur d'écran plausible — la nav garde ses
    // proportions au lieu d'être réduite à un moignon. Et les entrées sont
    // nombreuses : avec dix de plus que l'écran, le pouce est court et le
    // défilement porte sur une vraie distance, ce qui est le propos.
    //
    // Bornée sur le GABARIT et non par un décorateur : sinon la nav garde sa
    // hauteur et se fait rogner, pied compris.
    <MainCouranteShell
      height={720}
      nav={
        <>
            <SideNav.Section title="Manager">
              <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
              <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
              <SideNav.Item label="Sites" iconBefore="Site" href="/sites" />
              <SideNav.Item label="Pointages" iconBefore="Clockings" href="/pointages" />
              <SideNav.Item label="Plannings" iconBefore="CalendarMonth" href="/plannings" />
              <SideNav.Item label="Vacations" iconBefore="EventAvailable" href="/vacations" />
              <SideNav.Item label="Équipes" iconBefore="Group" href="/equipes" />
              <SideNav.Item label="Secteurs" iconBefore="LocationOn" href="/secteurs" />
              <SideNav.Item label="Contrats" iconBefore="Description" href="/contrats" />
              <SideNav.Item label="Absences" iconBefore="EventBusy" href="/absences" />
              <SideNav.Item label="Remplacements" iconBefore="SwapVert" href="/remplacements" />
              <SideNav.Item label="Astreintes" iconBefore="Alarm" href="/astreintes" />
            </SideNav.Section>
            <SideNav.Divider />
            <SideNav.Section title="MCE">
              <SideNav.Item label="MCE" iconBefore="MenuBook" href="/mce" />
              <SideNav.Item label="Formulaires" iconBefore="FormEdit" href="/forms" />
              <SideNav.Item label="Rapports" iconBefore="Assignment" href="/reports" />
              <SideNav.Item label="Anomalies" iconBefore="Warning" href="/issues" />
              <SideNav.Item label="Mains courantes" iconBefore="EditNote" href="/mains-courantes" />
              <SideNav.Item label="Rondes" iconBefore="Autorenew" href="/rondes" />
              <SideNav.Item label="Incidents" iconBefore="EmergencyHome" href="/incidents" />
              <SideNav.Item label="Consignes" iconBefore="Shield" href="/consignes" />
              <SideNav.Item label="Clés" iconBefore="Key" href="/cles" />
              <SideNav.Item label="Véhicules" iconBefore="DirectionsCar" href="/vehicules" />
            </SideNav.Section>
            <SideNav.Divider />
            <SideNav.Section title="Administration" shortTitle="Admin">
              <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
              <SideNav.Item label="Droits" iconBefore="ManageAccounts" href="/permissions" />
              <SideNav.Item label="Licences" iconBefore="Key" href="/licences" />
              <SideNav.Item label="Facturation" iconBefore="Payments" href="/billing" />
              <SideNav.Item label="Intégrations" iconBefore="Extension" href="/integrations" />
              <SideNav.Item label="Journaux" iconBefore="Description" href="/logs" />
              <SideNav.Item label="Paramètres" iconBefore="Settings" href="/settings" />
              <SideNav.Item label="Import" iconBefore="UploadFile" href="/import" />
              <SideNav.Item label="Export" iconBefore="Download" href="/export" />
              <SideNav.Item label="Archives" iconBefore="Archive" href="/archives" />
              <SideNav.Item label="Audit" iconBefore="FolderManaged" href="/audit" />
              <SideNav.Item label="Notifications" iconBefore="Notifications" href="/notifications" />
              <SideNav.Item label="Modèles" iconBefore="Category" href="/modeles" />
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
    await expect(last).toHaveTextContent("Modèles");
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
