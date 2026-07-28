// Page.Body — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Page,
  Avatar,
  Button,
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
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Zone de contenu principale d'une Page, sous l'en-tête et la toolbar.",
                "Pour héberger le contenu métier (grille de cartes, colonnes, tableau…).",
              ]}
              avoid={[
                "L'en-tête de page → Page.Header.",
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
      <Page>
        <Page.Header title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          start={
            <Stack direction="row" gap="100" align="center">
              <TextField aria-label="Rechercher" placeholder="Rechercher…" />
              <Button appearance="subtle" iconBefore="FilterList">Filtres</Button>
            </Stack>
          }
          end={<Button color="comete" iconBefore="Add">Nouvel agent</Button>}
        />
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
      <Page>
        <Page.Header
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
      <Page>
        <Page.Header title="Utilisateurs" trailing={<Avatar size="medium" initials="AC" />} />
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
