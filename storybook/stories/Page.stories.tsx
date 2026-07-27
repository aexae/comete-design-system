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
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
