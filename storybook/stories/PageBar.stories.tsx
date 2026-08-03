// Page.Bar — stories isolées du sous-composant
//
// Barre de page unifiée (remplace TopNav + Page.Header). En usage réel, le
// consommateur ne passe QUE `title` — la variante (large/compact) est choisie
// par le gabarit selon le breakpoint. Les stories forcent `size` uniquement
// pour afficher chaque variante de façon déterministe (indépendante de la
// largeur du canvas Storybook).
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { within, expect } from "storybook/test";
import {
  Page,
  Avatar,
  Button,
  SearchField,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const meta = {
  title: "Layout/Page/Bar",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "La barre de page unifie le titre, la navigation et les actions globales dans un seul bandeau en haut de la page. Elle bascule automatiquement entre une variante large et une variante compacte épinglée selon la largeur d'écran, et remplace l'ancien duo TopNav + Page.Header." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Barre de page unifiée (titre + navigation + actions), remplace TopNav + Page.Header.",
                "Quand une barre responsive unique (large ⇄ compacte épinglée) est souhaitée.",
              ]}
              avoid={[
                "Un en-tête de titre seul → `Page.Bar` sans `leading` (pas de composant séparé).",
                "La navigation latérale → SideNav.",
              ]}
              best={[
                "Ne passer que `title` en usage réel ; laisser le gabarit choisir la variante selon le breakpoint.",
                "Une seule affordance de navigation dans `leading` (hamburger ou retour).",
              ]}
              accessibility={[
                "Le titre porte le `h1` ; le titre tronqué garde un nom accessible complet.",
                "Les actions `trailing` icône seule ont un `aria-label`.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4559:6656") },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof Page>;

// -----------------------------------------------------------------------
// Helpers

/** Actions globales type d'une Page.Bar : notifications, réglages, avatar. */
function BarActions() {
  return (
    <>
      <Button appearance="subtle" iconBefore="Notifications" aria-label="Notifications" />
      <Button appearance="subtle" iconBefore="Settings" aria-label="Réglages" />
      <Avatar size="medium" initials="AC" />
    </>
  );
}

/** Cadre borné + contenu long, pour visualiser l'épinglage (sticky) de la compacte. */
function ScrollFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        height: 420,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius200)",
      }}
    >
      {children}
    </div>
  );
}

function Gutters({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingInline: "var(--space300)" }}>{children}</div>
  );
}

const barFiller = Array.from({ length: 24 }, (_, i) => (
  <p
    key={i}
    style={{
      margin: "0 0 var(--space200)",
      fontFamily: "var(--font-family-primary)",
      fontSize: "var(--font-size-ui-s)",
      color: "var(--text-default)",
    }}
  >
    Ligne de contenu {i + 1}
  </p>
));

// -----------------------------------------------------------------------
// Stories

/**
 * **Bar — large** : titre 32px + actions globales (notifications, réglages,
 * avatar). Variante desktop/tablette.
 */
export const Large: Story = {
  render: () => (
    <Gutters>
      <Page globalActions={<BarActions />}>
        <Page.Bar size="large" title="Accueil" />
        <Page.Body>
          <p>Contenu de la page…</p>
        </Page.Body>
      </Page>
    </Gutters>
  ),
  // Le titre est rendu dans un `<h1>` unique (repère de titre de page).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const h1s = canvas.getAllByRole("heading", { level: 1 });
    await expect(h1s).toHaveLength(1);
    await expect(h1s[0]).toHaveTextContent("Accueil");
  },
};

/**
 * **Bar — page racine, responsive** : une **seule** affordance de navigation
 * dans `leading` — ici le menu hamburger (un `<SideNav.Trigger />` en contexte
 * réel). Aucune `size` forcée : le titre suit la **largeur de la Page** via
 * `@container`.
 *
 * 👉 Redimensionne le cadre (poignée en bas à droite) : sous 768px la barre
 * passe compacte (épinglée, titre tronqué), au-dessus elle repasse large.
 *
 * NB : en contexte réel, l'app n'affiche le hamburger que lorsque la SideNav
 * est repliée (desktop persistante ⇒ pas de hamburger). Ici il est toujours
 * montré pour la démo.
 */
export const RootResponsive: Story = {
  name: "Root page (responsive)",
  render: () => (
    <div
      style={{
        resize: "horizontal",
        overflow: "hidden",
        width: 1000,
        maxWidth: "100%",
        minWidth: 320,
        height: 420,
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius200)",
      }}
    >
      <Page globalActions={<BarActions />} style={{ height: "100%" }}>
        <Page.Bar
          title="Accueil"
          leading={
            <Button appearance="subtle" iconBefore="Menu" aria-label="Ouvrir le menu" />
          }
        />
        <Page.Body>{barFiller}</Page.Body>
      </Page>
    </div>
  ),
};

/**
 * **Bar — compacte (épinglée)** : barre 56px `sticky` en haut ; le contenu
 * défile dessous, la barre reste visible.
 */
export const Compact: Story = {
  name: "Compact (pinned)",
  render: () => (
    <ScrollFrame>
      <Page globalActions={<BarActions />} style={{ height: "100%" }}>
        <Page.Bar
          size="compact"
          title="Fiche agent"
          leading={
            <Button appearance="subtle" iconBefore="ChevronLeft" aria-label="Retour" />
          }
        />
        <Page.Body>{barFiller}</Page.Body>
      </Page>
    </ScrollFrame>
  ),
  // Les zones `leading` (retour) et `trailing` (actions globales injectées par
  // le layout Page) sont bien rendues de part et d'autre du titre.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // leading
    await expect(canvas.getByRole("button", { name: "Retour" })).toBeInTheDocument();
    // trailing (globalActions)
    await expect(
      canvas.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Réglages" })).toBeInTheDocument();
  },
};

/**
 * **Bar — titre long tronqué** (compacte) : le titre s'ellipse sur une ligne
 * sans pousser les actions trailing.
 */
export const LongTitle: Story = {
  name: "Long title (ellipsis)",
  render: () => (
    <ScrollFrame>
      <Page globalActions={<BarActions />} style={{ height: "100%" }}>
        <Page.Bar
          size="compact"
          title="Un titre de page extrêmement long qui doit être tronqué avec une ellipse quand l'espace disponible n'est pas suffisant"
        />
        <Page.Body>{barFiller}</Page.Body>
      </Page>
    </ScrollFrame>
  ),
  // En compact, le titre long est tronqué (ellipsis sur une ligne) tout en
  // conservant son nom accessible complet.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const h1 = canvas.getByRole("heading", { level: 1 });
    // Contrat de troncature : ellipsis sur une seule ligne.
    const cs = getComputedStyle(h1);
    await expect(cs.textOverflow).toBe("ellipsis");
    await expect(cs.whiteSpace).toBe("nowrap");
    await expect(cs.overflowX).toBe("hidden");
    // Le contenu déborde réellement (titre plus large que la boîte visible).
    await expect(h1.scrollWidth).toBeGreaterThan(h1.clientWidth);
    // Nom accessible complet préservé malgré la coupe visuelle.
    await expect(h1).toHaveTextContent(
      "Un titre de page extrêmement long qui doit être tronqué",
    );
  },
};

/**
 * **Bar — avec Toolbar** : variante responsive (le consommateur ne passe que
 * `title`). La Toolbar est composée par le gabarit, inchangée.
 */
export const WithToolbar: Story = {
  name: "With toolbar",
  render: () => (
    <Gutters>
      <Page globalActions={<BarActions />}>
        <Page.Bar size="large" title="Agents" />
        <Page.Toolbar
          start={
            <SearchField aria-label="Rechercher" placeholder="Rechercher un agent…" />
          }
          end={<Button color="comete" iconBefore="Add">Nouvel agent</Button>}
        />
        <Page.Body>
          <p>Liste des agents…</p>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/**
 * **Bar — sans Toolbar** : page de détail ou de réglages, barre seule.
 */
export const WithoutToolbar: Story = {
  name: "Without toolbar",
  render: () => (
    <Gutters>
      <Page globalActions={<Avatar size="medium" initials="AC" />}>
        <Page.Bar
          size="large"
          title="Paramètres du compte"
        />
        <Page.Body>
          <p>Contenu de la page…</p>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};
