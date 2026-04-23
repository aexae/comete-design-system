// Page — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Page,
  Button,
  ButtonGroup,
  TextField,
  Avatar,
  Breadcrumbs,
  BreadcrumbItem,
  Grid,
  Card,
  Cluster,
  Badge,
  Stack,
  Divider,
} from "@naxit/comete-design-system/components";

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
              <TextField aria-label="Rechercher" placeholder="Rechercher" />
              <Button appearance="subtle" iconBefore="Settings">
                Filtres
              </Button>
            </>
          }
          end={
            <ButtonGroup>
              <Button iconBefore="Add">Nouvel agent</Button>
              <Button appearance="subtle">Exporter</Button>
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

/** Avec breadcrumbs au-dessus du titre. */
export const WithBreadcrumbs: Story = {
  name: "With breadcrumbs",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Martin Dupont"
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbItem label="Manager" href="/manager" />
              <BreadcrumbItem label="Agents" href="/manager/agents" />
              <BreadcrumbItem label="Martin Dupont" isCurrent />
            </Breadcrumbs>
          }
          trailing={
            <Button appearance="subtle" iconBefore="Person">
              Profil
            </Button>
          }
        />
        <Page.Body>
          <Card appearance="outlined">
            <div style={{ padding: "var(--space300)" }}>
              Contenu détail agent
            </div>
          </Card>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/** Sans toolbar — page de détail ou formulaire. */
export const WithoutToolbar: Story = {
  name: "Without toolbar",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Paramètres du compte"
          trailing={<Avatar initials="AC" />}
        />
        <Page.Body>
          <Cluster gap="200">
            <Badge label="En ligne" appearance="success" />
            <Badge label="Admin" appearance="accent" />
          </Cluster>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};

/** Toolbar seule (start uniquement). */
export const ToolbarStartOnly: Story = {
  name: "Toolbar — start only",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Main courante" />
        <Page.Toolbar
          start={
            <TextField
              aria-label="Rechercher"
              placeholder="Rechercher une entrée"
            />
          }
        />
        <Page.Body>
          <p>Résultats…</p>
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

// =======================================================================
// Page.Header — variantes isolées
// =======================================================================

/**
 * **Header — Desktop** : titre + avatar trailing.
 * Pattern standard pour les pages principales (Agents, Sites, Pointages…).
 * Le trailing est aligné à droite et ne rétrécit pas.
 */
export const HeaderDesktop: Story = {
  name: "Header — desktop",
  parameters: { design: { type: "figma", url: figmaUrl("4559:6522") } },
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Agents"
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Header — Avec actions** : titre + boutons d'action + avatar.
 * Utilisé quand la page propose des actions principales (Modifier, Archiver…).
 */
export const HeaderWithActions: Story = {
  name: "Header — with actions",
  parameters: { design: { type: "figma", url: figmaUrl("4559:6522") } },
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Accueil"
          trailing={
            <Stack direction="row" gap="100" align="center">
              <Button appearance="subtle" spacing="compact" iconBefore="ChevronLeft" aria-label="Mois précédent" />
              <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", fontWeight: 500, color: "var(--text-default)", whiteSpace: "nowrap" }}>
                Avril 2026
              </span>
              <Button appearance="subtle" spacing="compact" iconBefore="ChevronRight" aria-label="Mois suivant" />
              <Avatar size="medium" initials="AC" />
            </Stack>
          }
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Header — Breadcrumbs + titre entité** : fil d'Ariane au-dessus du titre.
 * Pattern des pages de détail (Fiche agent, Fiche site…).
 * Le breadcrumb donne le contexte de navigation et permet de remonter.
 */
export const HeaderWithBreadcrumbsAndTrailing: Story = {
  name: "Header — breadcrumbs + trailing",
  parameters: { design: { type: "figma", url: figmaUrl("4559:6522") } },
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Fiche agent"
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbItem label="Espace manager" href="#" />
              <BreadcrumbItem label="Agents" href="#" />
              <BreadcrumbItem label="Fiche agent" isCurrent />
            </Breadcrumbs>
          }
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Header — Minimal** : titre seul, sans breadcrumbs ni trailing.
 * Pour les pages simples (paramètres, profil, onboarding…).
 */
export const HeaderMinimal: Story = {
  name: "Header — minimal",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Paramètres" />
        <Divider />
      </Page>
    </Gutters>
  ),
};

// =======================================================================
// Page.Toolbar — variantes isolées
// =======================================================================

/**
 * **Toolbar — Complète** : recherche + filtres (start) et actions (end).
 * Pattern standard des pages de listing. Le start contient la recherche et les
 * filtres, le end contient les actions principales. Les deux zones wrap
 * automatiquement quand la largeur est insuffisante.
 */
export const ToolbarFull: Story = {
  name: "Toolbar — full (search + filters + actions)",
  parameters: { design: { type: "figma", url: figmaUrl("4559:6522") } },
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          start={
            <Stack direction="row" gap="100" align="center">
              <TextField aria-label="Rechercher" placeholder="Rechercher un agent…" />
              <Button appearance="subtle" iconBefore="FilterList">Filtres</Button>
            </Stack>
          }
          end={
            <ButtonGroup>
              <Button color="brand" iconBefore="Add">Nouvel agent</Button>
              <Button appearance="subtle" iconBefore="Download">Exporter</Button>
              <Button appearance="subtle" iconBefore="MoreHoriz" aria-label="Plus" />
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
export const ToolbarStartOnlySearch: Story = {
  name: "Toolbar — search only",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Main courante" />
        <Page.Toolbar
          start={<TextField aria-label="Rechercher" placeholder="Rechercher une entrée…" />}
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
export const ToolbarEndOnly: Story = {
  name: "Toolbar — actions only",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Planning du site" />
        <Page.Toolbar
          end={
            <ButtonGroup>
              <Button color="brand" iconBefore="Add">Créer une vacation</Button>
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
 * **Toolbar — Filtres actifs avec badges**.
 * Après application de filtres, la toolbar montre les filtres actifs
 * sous forme de badges avec un bouton de réinitialisation.
 */
export const ToolbarWithActiveFilters: Story = {
  name: "Toolbar — with active filters",
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
          end={
            <ButtonGroup>
              <Button color="brand" iconBefore="Add">Nouvel agent</Button>
            </ButtonGroup>
          }
        />
        <Stack gap="100" direction="row" align="center">
          <Cluster gap="075">
            <Badge label="Ile de France" appearance="neutral" importance="medium" />
            <Badge label="CDI" appearance="neutral" importance="medium" />
            <Badge label="Agent N3E3" appearance="neutral" importance="medium" />
          </Cluster>
          <Button appearance="link" spacing="compact">Réinitialiser</Button>
        </Stack>
        <Divider />
      </Page>
    </Gutters>
  ),
};

// =======================================================================
// Page.Body — variantes isolées
// =======================================================================

/**
 * **Body — Grid layout** : contenu organisé en grille responsive.
 * Pattern le plus courant pour les Homes et les pages de listing cards.
 */
export const BodyGridLayout: Story = {
  name: "Body — grid layout",
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
          end={<Button color="brand" iconBefore="Add">Nouvel agent</Button>}
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
export const BodySidebarLayout: Story = {
  name: "Body — sidebar layout",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Fiche agent"
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbItem label="Agents" href="#" />
              <BreadcrumbItem label="Fiche agent" isCurrent />
            </Breadcrumbs>
          }
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Page.Body>
          <Grid gap="300">
            <Grid.Col span={{ mobile: 12, tablet: 5, desktop: 4 }}>
              <Card appearance="outlined">
                <div style={{ padding: "var(--space300)", width: "100%" }}>
                  <Stack gap="100" align="center">
                    <Avatar size="xlarge" initials="DM" />
                    <strong style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-m)", color: "var(--text-default)" }}>
                      DUPONT Marie
                    </strong>
                    <Cluster gap="075">
                      <Badge label="CDI" appearance="success" importance="medium" />
                      <Badge label="Agent" appearance="neutral" importance="medium" />
                    </Cluster>
                  </Stack>
                </div>
              </Card>
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
export const BodyFullWidth: Story = {
  name: "Body — full width",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Utilisateurs" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          start={<TextField aria-label="Rechercher" placeholder="Rechercher un utilisateur…" />}
          end={<Button color="brand" iconBefore="PersonAdd">Inviter</Button>}
        />
        <Page.Body>
          <Stack gap="200">
            <Cluster gap="075">
              <Badge label="Tous" appearance="primary" importance="high" />
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
