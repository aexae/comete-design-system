// Page.Body — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import { fn } from "storybook/test";
import {
  Page,
  Avatar,
  Button,
  ButtonGroup,
  SearchField,
  TextField,
  Stack,
  Grid,
  Card,
  Text,
  Tag,
  Icon,
  Cluster,
  Badge,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import {
  FiltresPanel,
  ActiveFilterTags,
  SavedSearchesMenu,
  emptyFilters,
  useSavedViews,
  type Filters,
} from "./_filtresOptionB";
import css from "./Page.stories.module.css";
import filtresCss from "./FiltresOptionB.stories.module.css";

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
  title: "Layout/Page/Body",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Le corps de page est la zone de contenu principale, placée sous l'en-tête et la barre d'outils. Il accueille le contenu métier — grilles de cartes, colonnes ou tableaux — dans un flux vertical cohérent avec les marges du gabarit." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Zone de contenu principale d'une Page, sous l'en-tête et la toolbar.",
                "Pour héberger le contenu métier (grille de cartes, colonnes, tableau…).",
              ]}
              avoid={[
                "L'en-tête de page → Page.Bar.",
                "La barre d'actions et de recherche → Page.Toolbar.",
              ]}
              best={[
                "Composer le contenu avec Grid/Stack ; garder des gouttières cohérentes.",
                "Adapter la mise en page au type de contenu (grille, 2 colonnes, pleine largeur).",
              ]}
              accessibility={[
                "Correspond au repère `main` de la page ; un seul par page.",
                "Ordre de lecture et de tabulation cohérent avec la mise en page.",
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
// Stories

/**
 * **Body — Grid layout** : contenu organisé en grille responsive.
 * Pattern le plus courant pour les Homes et les pages de listing cards.
 */
export const GridLayout: Story = {
  name: "Grid layout",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <AgentsChrome />
        <Page.Body>
          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
            {Array.from({ length: 9 }, (_, i) => (
              <Grid.Col key={i}>
                <Card appearance="outlined">
                  <div style={{ padding: "var(--space200)", width: "100%" }}>
                    <Stack gap="050">
                      <strong style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", color: "var(--text-default)" }}>
                        Agent {i + 1}
                      </strong>
                      <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xxs)", color: "var(--text-subtlest)" }}>
                        Description courte
                      </span>
                    </Stack>
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

/**
 * **Body — Sidebar + content** : layout 2 colonnes avec sidebar et contenu.
 * Pattern des fiches détail (agent, site, client…). La sidebar passe
 * au-dessus du contenu en mobile.
 */
export const SidebarLayout: Story = {
  name: "Sidebar layout",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <Page.Bar
          title="Fiche agent"
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Page.Body>
          <Grid gap="300">
            <Grid.Col span={{ mobile: 12, tablet: 5, desktop: 4 }}>
              <Stack gap="200">
                <Card appearance="outlined">
                  <Stack padding="100" gap="100">
                    <Stack direction="row" gap="100" align="center" grow>
                      <Avatar size="medium" initials="DM" />
                      <Text weight="medium">DUPONT Marie</Text>
                      <div style={{ flexGrow: 1}}></div>
                      <Tag label="Conforme" elemBefore={<Icon icon="AwardStar" size={16} color="success" />} color="success" />
                    </Stack>
                    <Stack direction="row" gap="200" grow>
                      <Stack direction="row" gap="025" grow>
                        <Icon icon="Numbers" color="subtle" size={16} />
                        <Text>MAT-0001</Text>
                      </Stack>
                      <Text size="small" color="subtle">Contrat{' '}
                        <Text as="span" weight="medium" size="small">151.67</Text></Text>
                      <Text size="small" color="subtle">Delta{' '}
                        <Text as="span" weight="medium" size="small" color="success">151.67</Text>
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ mobile: 12, tablet: 7, desktop: 8 }}>
              <Card appearance="outlined">
                <div style={{ padding: "var(--space200)", width: "100%", minHeight: 300 }}>
                  <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", color: "var(--text-subtlest)" }}>
                    Contenu principal (planning, documents, historique…)
                  </span>
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/**
 * **Body — Full width** : contenu en pleine largeur, sans sidebar.
 * Pattern des pages de listing en tableau (utilisateurs, permissions…).
 */
export const FullWidth: Story = {
  name: "Full width",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <Page.Bar title="Utilisateurs" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          start={<TextField aria-label="Rechercher" placeholder="Rechercher un utilisateur…" />}
          end={<Button color="comete" iconBefore="PersonAdd">Inviter</Button>}
        />
        <Page.Body>
          <Stack gap="200">
            <Cluster gap="075">
              <Badge label="Tous" appearance="information" importance="high" />
              <Badge label="Administrateur" appearance="neutral" importance="medium" />
              <Badge label="Manager" appearance="neutral" importance="medium" />
              <Badge label="Agent" appearance="neutral" importance="medium" />
            </Cluster>
            <Card appearance="outlined">
              <div style={{ padding: "var(--space200)", width: "100%", minHeight: 200 }}>
                <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", color: "var(--text-subtlest)" }}>
                  Tableau de données en pleine largeur
                </span>
              </div>
            </Card>
          </Stack>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

// -----------------------------------------------------------------------
// États natifs (chargement / vide / erreur)
//
// Page.Body gère nativement les états : passer `isLoading`, `isEmpty` ou
// `error`. On garde le même contexte « Agents » (Header + Toolbar) que les
// autres stories ; seul le corps change d'état.

/**
 * En-tête + toolbar communs (contexte « Agents »). Reprend la composition
 * canonique de `Layout/Page/Toolbar → Full` : recherche dans `search`, bouton
 * « Filtres » (recette option B, popover deux volets) dans `filters`, et
 * actions dans `end`. Le popover est le composant partagé `_filtresOptionB` —
 * la barre est donc strictement identique à celle des stories `Page` et
 * `Page/Toolbar`.
 */
function AgentsChrome() {
  const [f, setF] = useState<Filters>(emptyFilters);
  const { views, save, remove } = useSavedViews();
  return (
    <>
      <Page.Bar title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
      <Page.Toolbar
        search={
          <SearchField
            aria-label="Rechercher un agent"
            placeholder="Rechercher un agent"
            value={f.nameQuery}
            onChange={(v) => setF({ ...f, nameQuery: v })}
          />
        }
        filters={
          <FiltresPanel
            filters={f}
            onChange={setF}
            views={views}
            onSaveView={(name) => save(name, f)}
            scrollClassName={filtresCss["scroll"]}
            textActionClassName={filtresCss["textAction"]}
          />
        }
        end={
          <Cluster gap="100">
            <SavedSearchesMenu views={views} current={f} onApply={(v) => setF(v.filters)} onDelete={remove} />
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
          </Cluster>
        }
      />
      {/* Tags des critères actifs, sous la barre (façon option B). */}
      <div style={{ paddingInline: "var(--page-gutter)" }}>
        <ActiveFilterTags filters={f} onChange={setF} textActionClassName={filtresCss["textAction"]} />
      </div>
    </>
  );
}

/** **Chargement** — squelette de contenu via `isLoading`. */
export const LoadingState: Story = {
  name: "Loading",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <AgentsChrome />
        <Page.Body isLoading />
      </Page>
    </Gutters>
  ),
};

/** **Vide** — état vide natif via `isEmpty` (illustration + message). */
export const EmptyState: Story = {
  name: "Empty",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <AgentsChrome />
        <Page.Body
          isEmpty
          emptyTitle="Aucun agent"
          emptyDescription="Ajoutez un premier agent pour commencer."
        />
      </Page>
    </Gutters>
  ),
};

/** **Erreur** — état erreur natif via `error` + bouton « Réessayer » (`onRetry`). */
const onRetry = fn();
export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <AgentsChrome />
        <Page.Body error="Le chargement des agents a échoué." onRetry={onRetry} />
      </Page>
    </Gutters>
  ),
};
