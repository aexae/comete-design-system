// SideNav — story principale (composition complète)
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, waitFor } from "storybook/test";
import { SideNav, Logo, Page } from "@aexae/comete-design-system/components";
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
      description: {
        component:
          "La navigation latérale affiche la structure hiérarchique de l'application dans un panneau vertical permanent ou repliable. Elle permet de naviguer entre les sections et sous-sections tout en visualisant la position courante.\n\n" +
          "**Règles par plateforme** — le DS ne pose aucune media query, l'app choisit le mode :\n\n" +
          "- **App mobile** : pas de SideNav ; la **BottomNav** porte seule la navigation.\n" +
          "- **Mobile navigateur web** (< 768 px) : la SideNav passe **par-dessus** le viewport (`isOverlay`, mode `hidden` ⇄ `expanded`), elle ne pousse jamais le contenu.\n" +
          "- **Tablette et desktop** : elle se réduit en **rail de 80 px** (`mode=\"rail\"`) et ne disparaît **jamais** ; le rail ne s'agrandit pas au survol — on le déploie par le bouton de bascule ou `Ctrl/Cmd+Shift+E`.",
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
  argTypes: {
    initialCollapsed: { control: "boolean" },
  },
  args: { initialCollapsed: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** SideNav autonome : `SideNav.Provider` + `SideNav` (Header + corps + Footer),
 *  hors contexte de Page. C'est l'élément `<SideNav>` qui porte la largeur de 240px.
 *  Déployée par défaut. */
export const Default: Story = {
  render: () => (
    <SideNav.Provider>
      {/* `.sidenav` fait `height: 100%` → le parent doit avoir une hauteur définie. */}
      <div style={{ display: "flex", height: "100vh" }}>
        <SideNav>
          <SideNav.Header
            logo={<Logo product="cafe" format="icon" />}
            companyName="Pro Sécurité"
            description="Main Courante"
          />
          <MainCouranteNav />
          <SideNav.Footer>
            <SideNav.FooterBrand>
              <Logo size={14} />
            </SideNav.FooterBrand>
          </SideNav.Footer>
        </SideNav>
      </div>
    </SideNav.Provider>
  ),
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

/** Mode réduit : la SideNav est totalement invisible. Le Trigger dans
 *  `Page.Bar.leading` permet de rouvrir (click) ou de peek (hover). */
export const Collapsed: Story = {
  args: { initialCollapsed: true },
  render: (args) => (
    <MainCouranteShell nav={<MainCouranteNav />} initialCollapsed={args.initialCollapsed} />
  ),
  // Le Trigger déplie / replie la navigation : son `aria-expanded` reflète
  // l'état (false = replié, true = déployé) et bascule à chaque clic.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /navigation/i });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
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
  render: () => (
    <SideNav.Provider defaultMode="rail">
      <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--black-4)" }}>
        <SideNav>
          <SideNav.Header
            logo={<Logo product="cafe" format="icon" />}
            companyName="Pro Sécurité"
            description="Main Courante"
          />
          <MainCouranteNav />
          <SideNav.Footer>
            <SideNav.FooterBrand>
              <Logo size={24} product="link" appearance="neutral" format="icon" />
            </SideNav.FooterBrand>
          </SideNav.Footer>
        </SideNav>
        <main style={{ flex: 1, padding: "var(--space300)" }}>
          <p>Contenu principal</p>
        </main>
      </div>
    </SideNav.Provider>
  ),
};

// Test (masqué du sidebar) : le `play` ne se rejoue pas à l'ouverture de la story.
export const RailInteractions: Story = {
  tags: ["!dev"],
  render: Rail.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const container = () => canvasElement.querySelector("nav")?.parentElement as HTMLElement;
    const nav = () => canvasElement.querySelector("nav") as HTMLElement;

    await step("rail de 80 px, libellé visible sous l'icône", async () => {
      await expect(Math.round(container().getBoundingClientRect().width)).toBe(80);
      await expect(canvas.getByText("Agents")).toBeVisible();
    });

    await step("ne s'agrandit PAS au survol", async () => {
      await userEvent.hover(nav());
      await new Promise((r) => setTimeout(r, 400)); // au-delà des anciens délais de peek
      await expect(Math.round(container().getBoundingClientRect().width)).toBe(80);
      await expect(Math.round(nav().getBoundingClientRect().width)).toBe(80);
      await expect(nav()).not.toHaveAttribute("data-peeking");
    });

    await step("se déploie par le bouton de bascule", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Déployer la navigation" }));
      // La largeur s'anime (transition) : on attend la valeur finale.
      await waitFor(() => expect(Math.round(container().getBoundingClientRect().width)).toBe(240));
    });
  },
};

/**
 * **Mobile navigateur web** — la SideNav passe **par-dessus** le viewport
 * (`isOverlay`) et ne pousse jamais le contenu. Le hamburger (`SideNav.Trigger`)
 * l'ouvre ; elle se referme à Échap, au clic sur un item ou en dehors.
 * (En **app mobile**, pas de SideNav : la BottomNav porte seule la navigation.)
 */
function MobileOverlayDemo() {
  return (
    <SideNav.Provider isOverlay defaultMode="hidden">
      <div
        style={{
          width: 390,
          height: 640,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--black-4)",
        }}
      >
        <Page.Bar title="Accueil" leading={<SideNav.Trigger />} />
        <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
          <SideNav>
            <SideNav.Header
              logo={<Logo product="cafe" format="icon" />}
              companyName="Pro Sécurité"
              description="Main Courante"
            />
            <MainCouranteNav />
          </SideNav>
          <Page.Body>
            <p>Contenu principal</p>
          </Page.Body>
        </div>
      </div>
    </SideNav.Provider>
  );
}

export const MobileOverlay: Story = {
  name: "Mobile web (overlay)",
  parameters: { layout: "centered" },
  render: () => <MobileOverlayDemo />,
};

export const MobileOverlayInteractions: Story = {
  tags: ["!dev"],
  render: () => <MobileOverlayDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const main = () => canvasElement.querySelector("main") as HTMLElement;
    const nav = () => canvasElement.querySelector("nav") as HTMLElement;
    const trigger = () => canvas.getByRole("button", { name: /navigation/i });
    const mainLeft = main().getBoundingClientRect().left;
    const isOpen = () => nav().hasAttribute("data-peeking");

    await step("fermée au départ", async () => {
      await expect(isOpen()).toBe(false);
      await expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    await step("s'ouvre par-dessus le contenu, sans le pousser", async () => {
      await userEvent.click(trigger());
      await expect(isOpen()).toBe(true);
      await expect(main().getBoundingClientRect().left).toBe(mainLeft);
      await expect(Math.round(nav().parentElement!.getBoundingClientRect().width)).toBe(0);
    });

    await step("se referme avec Échap", async () => {
      await userEvent.keyboard("{Escape}");
      await expect(isOpen()).toBe(false);
    });

    await step("se referme au clic sur un item", async () => {
      await userEvent.click(trigger());
      await expect(isOpen()).toBe(true);
      // `findByRole` : la nav apparaît en fondu (visibility passe à visible à la
      // 1re image de la transition) — on attend qu'elle soit accessible.
      const link = await canvas.findByRole("link", { name: "Agents" });
      link.addEventListener("click", (e) => e.preventDefault(), { once: true });
      await userEvent.click(link);
      await expect(isOpen()).toBe(false);
    });

    await step("se referme au clic en dehors", async () => {
      await userEvent.click(trigger());
      await expect(isOpen()).toBe(true);
      await userEvent.click(main());
      await expect(isOpen()).toBe(false);
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
