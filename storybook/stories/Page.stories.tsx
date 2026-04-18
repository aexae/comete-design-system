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
    docs: {
      description: {
        component:
          "Gabarit de page : wrapper flex vertical avec sous-composants `Page.Header` (titre + breadcrumbs + trailing), `Page.Toolbar` (start + end) et `Page.Body` (contenu scrollable).",
      },
    },
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
          trailing={<Avatar size="small" initials="AC" />}
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
          trailing={<Avatar size="small" initials="AC" />}
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
          trailing={<Avatar size="small" initials="AC" />}
        />
        <Page.Body>
          <p>Contenu…</p>
        </Page.Body>
      </Page>
    </Gutters>
  ),
};
