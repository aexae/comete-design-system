// Recette « Recherche globale » — stories
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { fn } from "storybook/test";
import {
  Page,
  Button,
  ButtonGroup,
  Card,
  Cluster,
  Grid,
  SearchField,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { PageGlobalActions } from "./_pageChrome";
import {
  GlobalSearchDialog,
  GlobalSearchSheet,
  useGlobalSearch,
} from "./_rechercheGlobale";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function Gutters({ children }: { children: ReactNode }) {
  return <div style={{ paddingInline: "var(--space300)" }}>{children}</div>;
}

const onOpenHit = fn();

const meta = {
  title: "Recipes/Recherche globale",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "La loupe de la barre de page ouvre une PAGE de recherche : le champ vit dans le slot `search` de la `Page.Toolbar`, les résultats groupés par famille dans le `Page.Body`. Aucune surface flottante, aucun voile — le résultat est une adresse, donc partageable et navigable.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Chercher à travers plusieurs familles d'objets à la fois (agents, sites, vacations, documents).",
                "Atteindre une destination enfouie derrière un menu « Plus » sans la parcourir.",
              ]}
              avoid={[
                "Filtrer la liste affichée → la recherche de la `Page.Toolbar`, qui nomme sa cible (« Rechercher un agent »).",
                "Une surface flottante au-dessus du contenu : une recherche globale produit une page, pas un calque.",
              ]}
              best={[
                "Placer la loupe AVANT les notifications dans `globalActions` : la recherche est choisie, la notification est subie.",
                "Indexer aussi les destinations de navigation — c'est ce qui rend atteignable une page cachée derrière un « Plus ».",
                "Nommer les deux recherches différemment : « Rechercher dans toute l'application » contre « Rechercher un agent ».",
              ]}
              accessibility={[
                "Le champ est dans un `<form role=\"search\">` : la validation au clavier est native.",
                "Le champ n'est jamais rendu dans le slot `title` de la `Page.Bar`, qui est un `<h1>`.",
                "Chaque section de résultats est une `List` nommée (`aria-label`), annoncée avec son nombre de résultats.",
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
// Coquille de démonstration : page de listing ⇄ page de résultats

function SearchableAgentsPage({
  leading,
  isTouch,
}: {
  leading?: ReactNode;
  /**
   * Mise en page **tactile : mobile ET tablette** — feuille `Drawer` au lieu
   * de la modale.
   *
   * Le discriminant est le **type de pointeur**, pas la largeur : une
   * tablette en paysage à 1280 px reste tactile. Les seuils de `Grid`
   * (`BREAKPOINTS.sm` 600px, desktop 1200px) sont des seuils de MISE EN
   * PAGE et ne s'appliquent pas ici.
   *
   * La prop est **pilotée par la story** : aucune détection d'environnement
   * n'est faite ici. Une application la déduirait de
   * `window.matchMedia("(pointer: coarse)")`, jamais d'une largeur.
   */
  isTouch?: boolean;
}) {
  const search = useGlobalSearch();

  // Le trio global, dans l'ordre retenu : loupe, notifications, avatar. La
  // loupe remplace l'ancien bouton « Réglages » — les préférences sont une
  // destination, et la recherche globale sait y mener.
  const globalActions = (
    <PageGlobalActions onSearch={search.open} isSearching={search.isSearching} />
  );

  return (
    <Page globalActions={globalActions}>
      {/* La surface dépend du format : feuille `Drawer` au doigt (convention
          du DS en tactile, comme la recette Filtres), modale au clavier.
          Dans les deux cas le contenu de la page reste en place derrière. */}
      {isTouch ? (
        <GlobalSearchSheet
          isOpen={search.isSearching}
          query={search.query}
          onQueryChange={search.setQuery}
          onClose={search.close}
          onOpenHit={onOpenHit}
        />
      ) : (
        <GlobalSearchDialog
          isOpen={search.isSearching}
          query={search.query}
          onQueryChange={search.setQuery}
          onClose={search.close}
          onOpenHit={onOpenHit}
        />
      )}
      <Page.Bar title="Agents" leading={leading} />
      <Page.Toolbar
        search={
          <SearchField
            aria-label="Rechercher un agent"
            placeholder="Rechercher un agent"
          />
        }
        end={
          <Cluster gap="100">
            <ButtonGroup>
              <Button color="comete" iconBefore="Add">
                Nouvel agent
              </Button>
            </ButtonGroup>
          </Cluster>
        }
      />
      <Page.Body>
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
          {Array.from({ length: 6 }, (_, i) => (
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

// -----------------------------------------------------------------------
// Stories

/**
 * **Desktop** — la loupe est la première des actions globales. Au clic, la page
 * de recherche remplace le listing : champ dans la toolbar, résultats groupés
 * dans le corps. Essayez `mar`, `nord`, `droits` ou `zzz` (sans résultat).
 *
 * Les deux recherches ne portent jamais le même mot : celle du listing dit
 * « Rechercher un agent », celle-ci « Rechercher dans toute l'application ».
 */
export const Desktop: Story = {
  render: () => (
    <Gutters>
      <SearchableAgentsPage />
    </Gutters>
  ),
};

/**
 * **Tactile, mobile** — la feuille `Drawer` monte du bas et occupe tout
 * l'écran : le champ dans son en-tête, les résultats dans son corps. Pas de
 * raccourcis clavier au pied, pas de `esc` — une croix à la place.
 */
export const TactileMobile: Story = {
  name: "Touch (mobile)",
  // Viewport mobile RÉEL, pas un cadre CSS : le `Drawer` se portalise en
  // `position: fixed` et ignorerait un faux téléphone en div. Même parti pris
  // que la story « Mobile et tablette » de la SideNav.
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => (
    <SearchableAgentsPage
      isTouch
      leading={
        <Button appearance="subtle" iconBefore="Menu" aria-label="Ouvrir le menu" />
      }
    />
  ),
};

/**
 * **Tactile, tablette** — c'est cette story qui porte la règle : une tablette
 * reçoit la **feuille**, pas la modale, et **aucun raccourci clavier**, alors
 * même qu'elle est plus large que le seuil `BREAKPOINTS.sm` et qu'en paysage
 * elle dépasse le seuil desktop.
 *
 * Le discriminant est le **type de pointeur**, pas la largeur. Sans cette
 * story, rien ne distinguerait la règle d'un simple seuil de mise en page.
 */
export const TactileTablette: Story = {
  name: "Touch (tablet)",
  globals: { viewport: { value: "cometeTabletManager", isRotated: false } },
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => (
    <SearchableAgentsPage
      isTouch
      leading={
        <Button appearance="subtle" iconBefore="Menu" aria-label="Ouvrir le menu" />
      }
    />
  ),
};
