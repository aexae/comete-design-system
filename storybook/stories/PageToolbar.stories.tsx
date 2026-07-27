// Page.Toolbar — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Page,
  Avatar,
  Button,
  ButtonGroup,
  TextField,
  Stack,
  Badge,
  Cluster,
  Divider,
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
  title: "Layout/Page/Toolbar",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Barre d'outils sous l'en-tête : recherche et filtres (`start`), actions (`end`).",
                "Pour les pages de listing nécessitant recherche, filtres et actions groupées.",
              ]}
              avoid={[
                "Les actions propres à une ligne → actions dans la Table ou la List.",
                "La navigation entre sections → Tabs.",
              ]}
              best={[
                "Regrouper recherche + filtres dans `start`, actions principales dans `end`.",
                "Laisser les deux zones passer à la ligne quand la largeur est insuffisante.",
              ]}
              accessibility={[
                "Chaque champ de recherche a un label (`aria-label`).",
                "Les boutons icône seule ont un `aria-label` explicite.",
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
 * **Toolbar — Complète** : recherche + filtres (start) et actions (end).
 * Pattern standard des pages de listing. Le start contient la recherche et les
 * filtres, le end contient les actions principales. Les deux zones wrap
 * automatiquement quand la largeur est insuffisante.
 */
export const Full: Story = {
  name: "Full (search + filters + actions)",
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
export const SearchOnly: Story = {
  name: "Search only",
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
export const ActionsOnly: Story = {
  name: "Actions only",
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
 * **Toolbar — Filtres actifs avec badges**.
 * Après application de filtres, la toolbar montre les filtres actifs
 * sous forme de badges avec un bouton de réinitialisation.
 */
export const WithActiveFilters: Story = {
  name: "With active filters",
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
          <Button appearance="link" density="compact">Réinitialiser</Button>
        </Stack>
        <Divider />
      </Page>
    </Gutters>
  ),
};
