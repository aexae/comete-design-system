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
 * ET l'action **primaire** passent en **icône seule** (`collapseLabel` : « + »
 * pour « Nouvel agent », `aria-label` conservé) et « Exporter » est **masqué**
 * (replié dans « ⋯ »). Les icônes seules de la toolbar sont **squared**
 * (`shape="square"`) pour rester alignées sur les boutons à label.
 * `Page.Body` = grille de cartes responsive.
 */
function ListingPage({ leading }: { leading?: React.ReactNode }) {
  return (
    <Page style={{ minHeight: "100vh" }}>
      <Page.Bar title="Agents" leading={leading} />
      <Page.Toolbar
        start={
          <>
            {/* Placeholder court (Figma « Rechercher ») + min-width : le
                placeholder ne doit JAMAIS être tronqué, même en mobile. */}
            <SearchField
              aria-label="Rechercher"
              placeholder="Rechercher"
              style={{ minWidth: 160 }}
            />
            {/* Secondaire gris (contained neutral, Figma) + icône avant ;
                icône seule (squared, alignée sur la toolbar) sous compact */}
            <Button collapseLabel shape="square" iconBefore="Tune" aria-label="Filtres">
              Filtres
            </Button>
          </>
        }
        end={
          <ButtonGroup>
            {/* Action primaire — comète (navy) ; en compact, se réduit en
                icône seule « + » (squared) pour libérer la place */}
            <Button
              color="comete"
              iconBefore="Add"
              collapseLabel
              shape="square"
              aria-label="Nouvel agent"
            >
              Nouvel agent
            </Button>
            {/* Action secondaire — gris ; masquée sous compact (repliée dans « ⋯ ») */}
            <Button className={css["hideUnderCompact"]}>Exporter</Button>
            {/* Menu débordement — gris, icône seule squared (alignée sur les
                boutons à label de la toolbar, pas ronde) */}
            <Button shape="square" iconBefore="MoreHoriz" aria-label="Plus d'actions" />
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

/**
 * **Full page — responsive.** Une seule story : changer le viewport via la
 * barre d'outils Storybook (desktop / tablette / mobile) fait réagir la vraie
 * page — Grid (media queries), Page.Bar (`@container` : large ⇄ compacte
 * épinglée) et Page.Toolbar (wrap, « Filtres » en icône seule ronde,
 * « Exporter » replié dans « ⋯ »). Le placeholder « Rechercher » n'est jamais
 * tronqué (min-width sur le champ). Le hamburger est montré en permanence pour
 * la démo — en contexte réel, l'app ne le rend que SideNav repliée.
 */
export const FullPage: Story = {
  name: "Full page (responsive)",
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
