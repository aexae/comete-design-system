// Page — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Page,
  Button,
  ButtonGroup,
  Avatar,
  Grid,
  Card,
  SearchField,
  SectionMessage,
} from "@aexae/comete-design-system/components";
import { expect, within } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { DeviceFrame } from "./_deviceFrame";
import css from "./Page.stories.module.css";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Page",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le composant page structure la mise en page globale en organisant l'en-tête, le contenu principal et les barres latérales. Il gère les points de rupture et assure une disposition cohérente sur tous les écrans." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Structurer la coquille d'une page applicative (Page.Header + Page.Body) de façon cohérente.",
                "Quand on veut un gabarit standard réutilisable pour toutes les pages.",
              ]}
              avoid={[
                "Un simple bloc de contenu → Stack/Grid.",
                "La navigation globale → SideNav/TopNav (à composer avec Page).",
                "Des exemples de composition complets → voir PageTemplates.",
              ]}
              best={[
                "Composer Page.Header/Body ; laisser la navigation vivre autour selon le layout.",
                "Réutiliser le même gabarit sur toutes les pages pour la cohérence.",
              ]}
              accessibility={[
                "Structurer avec des repères (`header`, `main`) et un seul `h1`.",
                "Ordre de tabulation cohérent avec la mise en page.",
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

function Gutters({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingInline: "var(--space300)", minHeight: "100vh" }}>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Gabarit complet avec header, toolbar et body (cas typique listing). */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4559:6522") } },
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Agents"
          trailing={<Avatar initials="AC" />}
        />
        <Page.Toolbar
          start={
            <>
              <SearchField aria-label="Rechercher" placeholder="Rechercher" />
              <Button iconBefore="Tune">Filtres</Button>
            </>
          }
          end={
            <ButtonGroup>
              <Button color="comete" iconBefore="Add">Nouvel agent</Button>
              <Button>Exporter</Button>
            </ButtonGroup>
          }
        />
        <Page.Body>
          <SectionMessage appearance="information" style={{ marginBottom: 16}}>
            Message d&apos;accueil (texte par défaut)
          </SectionMessage>
          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
            {Array.from({ length: 9 }, (_, i) => (
              <Grid.Col key={i}>
                <Card appearance="outlined">
                  <div style={{ padding: "var(--space200)" }}>
                    <strong>Agent {i + 1}</strong>
                    <p style={{ margin: "var(--space100) 0 0" }}>
                      Description courte
                    </p>
                  </div>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/** Titre très long — ellipsize proprement. */
export const LongTitle: Story = {
  name: "Long title (ellipsis)",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Un titre de page extrêmement long qui doit être tronqué avec une ellipse quand l'espace disponible n'est pas suffisant"
          trailing={<Avatar initials="AC" />}
        />
        <Page.Body>
          <p>Contenu…</p>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

// -----------------------------------------------------------------------
// Page complète responsive — le layout porte les actions globales
//
// La responsivité est pilotée par le VRAI viewport (addon Storybook), pas par
// un cadre à largeur fixe : Grid réagit au viewport, Page.Bar au @container et
// Page.Toolbar wrappe. Un simple div étroit laisserait Grid en mode desktop.

/**
 * Page de listing complète. La page **ne passe aucun `trailing`** : le trio
 * global (notifications, réglages, avatar) est injecté par le layout `Page`.
 * `Page.Toolbar` : `start` = recherche + filtres, `end` = action primaire +
 * secondaire + menu débordement. Sous le breakpoint du conteneur : « Filtres »
 * passe en **icône seule** (`collapseLabel`, `aria-label` conservé), « Exporter »
 * est **masqué** (replié dans « ⋯ ») et l'action **primaire** garde son libellé.
 * `Page.Body` = grille de cartes responsive.
 */
function ListingPage({ leading }: { leading?: React.ReactNode }) {
  return (
    <Page style={{ minHeight: "100vh" }}>
      <Page.Bar title="Agents" leading={leading} />
      <Page.Toolbar
        start={
          <>
            <SearchField aria-label="Rechercher" placeholder="Rechercher un agent…" />
            {/* Secondaire gris (contained défaut) + icône Tune ; icône seule sous compact */}
            <Button collapseLabel iconBefore="Tune" aria-label="Filtres">
              Filtres
            </Button>
          </>
        }
        end={
          <ButtonGroup>
            {/* Action primaire — comète (navy), garde son libellé */}
            <Button color="comete" iconBefore="Add">
              Nouvel agent
            </Button>
            {/* Action secondaire — gris ; masquée sous compact (repliée dans « ⋯ ») */}
            <Button className={css["hideUnderCompact"]}>Exporter</Button>
            {/* Menu débordement — gris, icône seule */}
            <Button iconBefore="MoreHoriz" aria-label="Plus d'actions" />
          </ButtonGroup>
        }
      />
      <Page.Body>
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
          {Array.from({ length: 9 }, (_, i) => (
            <Grid.Col key={i}>
              <Card appearance="outlined">
                <div style={{ padding: "var(--space200)" }}>
                  <strong>Agent {i + 1}</strong>
                  <p style={{ margin: "var(--space100) 0 0" }}>Description courte</p>
                </div>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Page.Body>
    </Page>
  );
}

const HAMBURGER = (
  <Button appearance="subtle" iconBefore="Menu" aria-label="Ouvrir le menu" />
);

// -----------------------------------------------------------------------
// Pages « nues » — cibles des iframes des cadres device. Masquées de la sidebar
// et des docs (!dev, !autodocs) : on ne les consulte qu'à travers un cadre.

export const FullPageDesktopRaw: Story = {
  name: "Full page — desktop (raw)",
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ListingPage />,
};

export const FullPageTabletRaw: Story = {
  name: "Full page — tablette (raw)",
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ListingPage leading={HAMBURGER} />,
};

export const FullPageMobileRaw: Story = {
  name: "Full page — mobile (raw)",
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <ListingPage leading={HAMBURGER} />,
  // a11y : tout bouton réduit en icône seule DOIT conserver un aria-label.
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // « Exporter » est masqué sous compact (repli dans « ⋯ ») → non vérifié ici.
    for (const name of ["Filtres", "Plus d'actions", "Ouvrir le menu"]) {
      void expect(canvas.getByRole("button", { name })).toHaveAttribute(
        "aria-label",
        name,
      );
    }
  },
};

// -----------------------------------------------------------------------
// Cadres device — UN cadre par story (chaque iframe = un vrai viewport)

/** Desktop — cadre fenêtre 1280 : 3 colonnes, barre large, pas de hamburger. */
export const FullPageDesktop: Story = {
  name: "Full page — desktop",
  parameters: { controls: { disable: true }, layout: "centered" },
  render: () => (
    <DeviceFrame
      storyId="layout-page--full-page-desktop-raw"
      width={1280}
      height={760}
      scale={0.5}
      variant="browser"
      label="Desktop ≥ 1024"
      note="Grille 3 colonnes · barre large · toolbar sur une ligne · pas de hamburger."
    />
  ),
};

/** Tablette — cadre fenêtre 768 : 2 colonnes, barre large, hamburger visible. */
export const FullPageTablet: Story = {
  name: "Full page — tablette",
  parameters: { controls: { disable: true }, layout: "centered" },
  render: () => (
    <DeviceFrame
      storyId="layout-page--full-page-tablet-raw"
      width={768}
      height={720}
      scale={0.55}
      variant="browser"
      label="Tablette 768"
      note="Grille 2 colonnes · barre large · hamburger visible."
    />
  ),
};

/** Mobile — cadre téléphone 375 : 1 colonne, barre compacte épinglée, toolbar qui wrappe, boutons secondaires en icône seule. */
export const FullPageMobile: Story = {
  name: "Full page — mobile",
  parameters: { controls: { disable: true }, layout: "centered" },
  render: () => (
    <DeviceFrame
      storyId="layout-page--full-page-mobile-raw"
      width={375}
      height={720}
      scale={0.8}
      variant="phone"
      label="Mobile 375"
      note="Grille 1 colonne · barre compacte épinglée · Filtres en icône seule · Exporter masqué (⋯) · hamburger."
    />
  ),
};

// -----------------------------------------------------------------------
// Contrat : action primaire contained/comete (fond non transparent)

/**
 * Garde-fou du rendu de l'action primaire : `contained` + `color="comete"` doit
 * produire un **fond non transparent** (bleu comète). Fige le bug « bouton gris »
 * observé quand le build/les tokens sont désynchronisés (rename brand → comete).
 */
export const PrimaryActionContract: Story = {
  name: "Primary action button (contract)",
  parameters: { controls: { disable: true }, layout: "centered" },
  render: () => (
    <Button appearance="contained" color="comete" iconBefore="Add">
      Nouvel agent
    </Button>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: "Nouvel agent" });
    const bg = window.getComputedStyle(btn).backgroundColor;
    // Fond réellement peint : ni transparent, ni rgba(..., 0).
    void expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    void expect(bg).not.toBe("transparent");
  },
};

// -----------------------------------------------------------------------
// Contrat de scroll — fige le comportement sticky (régression)

/**
 * Contrat de scroll (variante **compacte** forcée) : seule la `Page.Bar` est
 * épinglée (`position: sticky`) ; la `Page.Toolbar` défile avec le contenu. La
 * play function vérifie ce contrat pour éviter une régression.
 */
export const StickyBarBehaviour: Story = {
  name: "Sticky bar behaviour (compact)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Page style={{ height: 360, overflow: "auto" }}>
      <Page.Bar
        size="compact"
        title="Agents"
        leading={<Button appearance="subtle" iconBefore="Menu" aria-label="Ouvrir le menu" />}
      />
      <Page.Toolbar
        start={<SearchField aria-label="Rechercher" placeholder="Rechercher…" />}
        end={
          <Button appearance="contained" color="comete" iconBefore="Add">
            Nouvel agent
          </Button>
        }
      />
      <Page.Body>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} style={{ margin: "var(--space100) 0" }}>
            Ligne de contenu {i + 1}
          </p>
        ))}
      </Page.Body>
    </Page>
  ),
  play: ({ canvasElement }) => {
    const bar = canvasElement.querySelector("header");
    const toolbar = canvasElement.querySelector<HTMLElement>("[class*='toolbar']");
    void expect(bar).not.toBeNull();
    void expect(toolbar).not.toBeNull();
    if (!bar || !toolbar) return;
    // La barre compacte est épinglée en haut…
    void expect(window.getComputedStyle(bar).position).toBe("sticky");
    // …la toolbar ne l'est pas (elle défile avec le contenu).
    void expect(window.getComputedStyle(toolbar).position).not.toBe("sticky");
  },
};
