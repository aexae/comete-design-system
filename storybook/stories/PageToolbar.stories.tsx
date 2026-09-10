// Page.Toolbar — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import { within, screen, userEvent, expect, waitFor } from "storybook/test";
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
import {
  FiltresPanel,
  ActiveFilterTags,
  SavedSearchesMenu,
  initialFilters,
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
                "Barre d'outils sous l'en-tête : recherche (`search`), bouton « Filtres » (`filters`), vues/compteurs (`start`), actions (`end`).",
                "Pour les pages de listing nécessitant recherche, filtres et actions groupées.",
              ]}
              avoid={[
                "Les actions propres à une ligne → actions dans la Table ou la List.",
                "La navigation entre sections → Tabs.",
              ]}
              best={[
                "Mettre la recherche dans `search`, le bouton « Filtres » dans `filters`, les vues dans `start`, les actions dans `end` — tout sur une seule ligne.",
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
 * **Toolbar — Complète** : recherche + **bouton « Filtres »** (recette option B,
 * popover deux volets) + actions, **tout sur une seule ligne**. Le bouton vit
 * dans le slot `filters` de `Page.Toolbar` ; les tags des critères actifs se
 * posent sous la barre. La popup est **strictement identique** à la story
 * `Recipes/Filtres` (composant partagé `_filtresOptionB`). Sous le breakpoint
 * du conteneur, l'action primaire se réduit en icône seule et « Exporter » se
 * masque.
 */
export const Full: Story = {
  name: "Full (search + filters + actions)",
  render: function FullToolbar() {
    // La recette « Filtres » (option B) vit DANS la barre : bouton « Filtres »
    // dans le slot `filters`, recherche + actions sur la même ligne. Tags des
    // critères actifs sous la barre. Popup partagée avec Recipes/Filtres.
    const [f, setF] = useState<Filters>(initialFilters);
    const { views, save, remove } = useSavedViews();
    return (
      <Gutters>
        <Page globalActions={null}>
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
                <SavedSearchesMenu views={views} onApply={(v) => setF(v.filters)} onDelete={remove} />
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
          <Divider />
        </Page>
      </Gutters>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Le bouton « Filtres » vit DANS la barre ; son badge = nb de critères actifs.
    const filtres = () => canvas.getByRole("button", { name: /^Filtres,/ });
    await expect(filtres()).toHaveTextContent("10");
    // Il ouvre le popover à deux volets (facettes / options) — la recette option B.
    await userEvent.click(filtres());
    const dialog = within(await screen.findByRole("dialog"));
    await expect(dialog.getByRole("button", { name: /^Diplômes/ })).toBeInTheDocument();
    // Facette « Diplômes » → cocher « CQP APS » ajoute un critère (badge 10 → 11).
    await userEvent.click(dialog.getByRole("button", { name: /^Diplômes/ }));
    await userEvent.click(dialog.getByRole("checkbox", { name: "CQP APS" }));
    await waitFor(() => expect(filtres()).toHaveTextContent("11"));
    // « Réinitialiser » (pied du popover) vide tout → la rangée de tags disparaît.
    await userEvent.click(dialog.getByRole("button", { name: "Réinitialiser" }));
    await waitFor(() => expect(canvas.queryByRole("group", { name: "Filtres actifs" })).toBeNull());
  },
};

/**
 * **Toolbar — Recherche + filtres (sans actions)** : recherche et **bouton
 * « Filtres »** (recette option B, popover deux volets) dans le slot `filters`,
 * sans actions à droite. Pour les pages de listing en consultation (main
 * courante, logs…). La popup est la même que la story `Recipes/Filtres`.
 */
export const SearchOnly: Story = {
  name: "Search only",
  render: function SearchOnlyToolbar() {
    const [f, setF] = useState<Filters>(() => ({ ...emptyFilters(), secteur: ["Événementiel"] }));
    const { views, save } = useSavedViews();
    return (
      <Gutters>
        <Page globalActions={null}>
          <Page.Bar title="Main courante" />
          <Page.Toolbar
            search={
              <SearchField
                aria-label="Rechercher"
                placeholder="Rechercher une entrée…"
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
          />
          {/* Tags des critères actifs, sous la barre (façon option B). */}
          <div style={{ paddingInline: "var(--page-gutter)" }}>
            <ActiveFilterTags filters={f} onChange={setF} textActionClassName={filtresCss["textAction"]} />
          </div>
          <Divider />
        </Page>
      </Gutters>
    );
  },
};

/**
 * **Toolbar — End seul** : actions sans recherche.
 * Pour les pages de détail avec des actions en barre (exporter, modifier…).
 */
export const ActionsOnly: Story = {
  name: "Actions only",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <Page.Bar title="Planning du site" />
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
 * (détail, réglages, formulaire) composent Bar + Body sans `Page.Toolbar`.
 */
export const None: Story = {
  name: "None (sans toolbar)",
  render: () => (
    <Gutters>
      <Page globalActions={null}>
        <Page.Bar
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
 * **Toolbar — Filtres appliqués** : plusieurs critères déjà posés. Le badge du
 * bouton **« Filtres »** (slot `filters`) reflète leur nombre, et les **tags
 * actifs** sous la barre les rappellent — groupés par catégorie, surplus sous
 * « +N », « Réinitialiser » pour tout vider. Même popup (recette option B) que
 * `Recipes/Filtres`.
 */
export const WithActiveFilters: Story = {
  name: "With active filters",
  render: function WithActiveFiltersToolbar() {
    const [f, setF] = useState<Filters>(initialFilters);
    const { views, save } = useSavedViews();
    return (
      <Gutters>
        <Page globalActions={null}>
          <Page.Bar title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
          <Page.Toolbar
            search={
              <SearchField
                aria-label="Rechercher"
                placeholder="Rechercher"
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
          {/* Tags des critères actifs, sous la barre (façon option B). */}
          <div style={{ paddingInline: "var(--page-gutter)" }}>
            <ActiveFilterTags filters={f} onChange={setF} textActionClassName={filtresCss["textAction"]} />
          </div>
          <Divider />
        </Page>
      </Gutters>
    );
  },
};
