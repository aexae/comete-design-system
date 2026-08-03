// Page.Toolbar — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Page,
  Avatar,
  Button,
  ButtonGroup,
  SearchField,
  Badge,
  Cluster,
  Divider,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { FilterBar } from "./_filterDemo";
import css from "./Page.stories.module.css";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function Gutters({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingInline: "var(--space300)" }}>{children}</div>
  );
}

const meta = {
  title: "Layout/Page/Toolbar",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "La barre d'outils regroupe, sous l'en-tête, les commandes agissant sur le contenu de la page : recherche et filtres d'un côté, actions groupées de l'autre. Elle est particulièrement adaptée aux pages de listing (tableaux, collections)." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Barre d'outils sous l'en-tête : recherche (`search`), filtres (`start`), actions (`end`).",
                "Pour les pages de listing nécessitant recherche, filtres et actions groupées.",
              ]}
              avoid={[
                "Les actions propres à une ligne → actions dans la Table ou la List.",
                "La navigation entre sections → Tabs.",
              ]}
              best={[
                "Mettre la recherche dans `search`, les filtres dans `start`, les actions dans `end`.",
                "Sous le breakpoint, réduire les boutons en icône seule (`collapseLabel`) et laisser la recherche se comprimer — la barre reste sur une seule ligne.",
              ]}
              accessibility={[
                "Chaque champ de recherche a un label (`aria-label`).",
                "Les boutons réduits en icône seule conservent un `aria-label` explicite.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4559:6522") },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof Page>;

// -----------------------------------------------------------------------
// Stories

/**
 * **Toolbar — Complète** : recherche (`search`), filtres (`start`) et actions
 * (`end`). Pattern standard des pages de listing, aligné sur la maquette Figma.
 * La barre reste sur **une seule ligne** : sous le breakpoint du conteneur
 * (`page`, ~768px), « Filtres » et l'action primaire se réduisent en icône
 * seule (`collapseLabel`, `shape="square"`), « Exporter » est masqué (repli dans
 * « ⋯ ») et la recherche se comprime — jamais de seconde rangée.
 */
export const Full: Story = {
  name: "Full (search + filters + actions)",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          search={<SearchField aria-label="Rechercher" placeholder="Rechercher" />}
          start={
            <Button collapseLabel shape="square" iconBefore="Tune" aria-label="Filtres">
              Filtres
            </Button>
          }
          end={
            <ButtonGroup>
              <Button
                color="comete"
                iconBefore="Add"
                collapseLabel
                shape="square"
                aria-label="Nouvel agent"
              >
                Nouvel agent
              </Button>
              <Button className={css["hideUnderCompact"]}>Exporter</Button>
              <Button shape="square" iconBefore="MoreHoriz" aria-label="Plus d'actions" />
            </ButtonGroup>
          }
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Toolbar — Start seul** : recherche sans actions à droite.
 * Pour les pages avec une barre de recherche simple (main courante, logs…).
 */
export const SearchOnly: Story = {
  name: "Search only",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Main courante" />
        <Page.Toolbar
          search={<SearchField aria-label="Rechercher" placeholder="Rechercher une entrée…" />}
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Toolbar — End seul** : actions sans recherche.
 * Pour les pages de détail avec des actions en barre (exporter, modifier…).
 */
export const ActionsOnly: Story = {
  name: "Actions only",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Planning du site" />
        <Page.Toolbar
          end={
            <ButtonGroup>
              <Button color="comete" iconBefore="Add">Créer une vacation</Button>
              <Button appearance="subtle" iconBefore="Download">Exporter PDF</Button>
            </ButtonGroup>
          }
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Toolbar — Absente** : la toolbar est optionnelle. Certaines pages
 * (détail, réglages, formulaire) composent Header + Body sans `Page.Toolbar`.
 */
export const None: Story = {
  name: "None (sans toolbar)",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Paramètres du compte"
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Page.Body>
          <Cluster gap="200">
            <Badge label="En ligne" appearance="success" />
            <Badge label="Admin" appearance="accentPurple" />
          </Cluster>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/**
 * **Toolbar — Filtres appliqués** : sous la barre, la rangée de filtres rapides
 * est composée avec le composant **`FilterChip`** (via `FilterChipRow`). Chaque
 * chip affiche la valeur (1 sélection) ou le compteur (≥ 2) et s'efface via sa
 * croix ; le bouton « Filtres » de la rangée ouvre le **panneau complet**
 * (Drawer). Voir la story dédiée `Components/FilterChip` pour tout le détail.
 */
export const WithActiveFilters: Story = {
  name: "With active filters",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          search={<SearchField aria-label="Rechercher" placeholder="Rechercher" />}
          end={
            <ButtonGroup>
              <Button
                color="comete"
                iconBefore="Add"
                collapseLabel
                shape="square"
                aria-label="Nouvel agent"
              >
                Nouvel agent
              </Button>
            </ButtonGroup>
          }
        />
        {/* Rangée de filtres rapides = composant FilterChip / FilterChipRow.
            Alignée sur la toolbar/recherche via la gouttière de page. */}
        <div style={{ paddingInline: "var(--page-gutter)" }}>
          <FilterBar initial={{ sites: ["idf", "paris", "lyon"], types: ["intrusion"] }} />
        </div>
        <Divider />
      </Page>
    </Gutters>
  ),
};
