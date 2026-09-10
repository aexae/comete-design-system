// Recette « Filtres — option B » (portée depuis la maquette Claude Design
// « Filtres option B »). Panneau unique de filtres :
// - Desktop = recherche + bouton Filtres (popover à deux volets) ; les
//   recherches enregistrées sont une action à droite de la barre ; tags actifs
//   groupés par catégorie (+N) sous la toolbar ; tableau de résultats.
// - Mobile = liste d'agents + panneau de filtres en drill-down (liste des
//   facettes → détail d'une facette).
//
// Transposée 100 % sur les composants + tokens du repo : SearchField, Popup,
// Checkbox, Switch, RadioGroup/Radio, DatePicker, TimePicker, Table, Tag,
// Badge, Button, Icon, Avatar, List (+ItemButton/Text/Avatar/Trailing/
// SecondaryAction). La logique (comptes vivants, mini-recherche, vues
// enregistrées) vient du DCLogic de la maquette.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { within, screen, userEvent, waitFor, expect } from "storybook/test";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import css from "./FiltresOptionB.stories.module.css";
import {
  Button,
  Badge,
  Tag,
  SearchField,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemTrailing,
} from "@aexae/comete-design-system/components";
import {
  FiltresPanel,
  FiltresSheet,
  SavedSearchesMenu,
  ActiveFilterTags,
  ResultsTable,
  useSavedViews,
  initialFilters,
  filteredAgents,
  totalActive,
  DISPO_TAG,
  initialsOf,
  AGENTS,
  facetsForRole,
  effectiveFilters,
  type Filters,
  type Role,
} from "./_filtresOptionB";

// -----------------------------------------------------------------------
// Recette — desktop : chrome de page (Page.Bar + Page.Toolbar) composant la
// recette « Filtres » partagée (_filtresOptionB). MÊME popup que la story
// Layout/Page/Toolbar → source unique.

function FiltresOptionB({ role }: { role?: Role }): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const { views, save, remove } = useSavedViews();
  // Le rôle change → on NEUTRALISE (n'applique plus) les facettes qu'il ne gère
  // pas : elles disparaissent des tags ET des résultats, pas seulement du
  // popover. Visible sans ouvrir le panneau.
  useEffect(() => {
    setF((prev) => effectiveFilters(prev, role));
  }, [role]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space300)",
        padding: "var(--space400)",
        fontFamily: "var(--font-family-primary)",
        color: "var(--text-default)",
        background: "var(--background-default)",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Toolbar : recherche + Filtres à gauche ; Recherches (action) à droite. */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
        <div style={{ width: 260, flex: "none" }}>
          <SearchField
            aria-label="Rechercher un agent"
            placeholder="Rechercher un agent"
            value={f.nameQuery}
            onChange={(v) => setF({ ...f, nameQuery: v })}
          />
        </div>
        <FiltresPanel
          filters={f}
          onChange={setF}
          views={views}
          onSaveView={(name) => save(name, f)}
          role={role}
          scrollClassName={css["scroll"]}
          textActionClassName={css["textAction"]}
        />
        <div style={{ flex: 1 }} />
        <SavedSearchesMenu views={views} current={f} onApply={(v) => setF(v.filters)} onDelete={remove} />
      </div>

      <ActiveFilterTags filters={f} onChange={setF} textActionClassName={css["textAction"]} />

      <ResultsTable filters={f} />
    </div>
  );
}

// -----------------------------------------------------------------------
// Recette — mobile (liste + panneau de filtres en drill-down).

function FiltresOptionBMobile(): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const { views, save, remove } = useSavedViews();

  const patch = (p: Partial<Filters>) => setF((prev) => ({ ...prev, ...p }));
  const results = useMemo(() => filteredAgents(f), [f]);
  const total = totalActive(f);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "var(--background-default)",
        color: "var(--text-default)",
        fontFamily: "var(--font-family-primary)",
        boxSizing: "border-box",
      }}
    >
      {/* En-tête. */}
      <div style={{ padding: "var(--space300) var(--space200) var(--space150)" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Agents</h2>
      </div>

      {/* Recherche + Filtres. */}
      <div style={{ display: "flex", gap: "var(--space100)", padding: "0 var(--space200) var(--space150)" }}>
        <div style={{ flex: 1 }}>
          <SearchField aria-label="Rechercher un agent" placeholder="Rechercher" value={f.nameQuery} onChange={(v) => patch({ nameQuery: v })} />
        </div>
        <Button
          appearance={total > 0 ? "contained" : "outlined"}
          iconBefore="Tune"
          aria-label={total > 0 ? `Filtres, ${total} critère${total > 1 ? "s" : ""} actif${total > 1 ? "s" : ""}` : "Filtres"}
          aria-haspopup="dialog"
          aria-expanded={filterOpen}
          onPress={() => setFilterOpen(true)}
        >
          {total > 0 && <Badge label={String(total)} appearance="information-inverted" importance="high" />}
        </Button>
      </div>

      {/* Pas de rangée de tags en mobile : les critères actifs sont portés par le
          badge du bouton Filtres et la feuille (drill-down). La rangée « FILTRES :
          … » est une affordance desktop uniquement. */}

      {/* Liste des agents. */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {results.length === 0 ? (
          <p style={{ padding: "var(--space400) var(--space200)", textAlign: "center", color: "var(--text-subtlest)", fontSize: 13 }}>Aucun agent ne correspond.</p>
        ) : (
          <List isBordered aria-label="Liste des agents">
            {results.map((a) => (
              <ListItem key={a.nom}>
                <ListItemAvatar>
                  <Avatar initials={initialsOf(a.nom)} alt={a.nom} />
                </ListItemAvatar>
                <ListItemText primary={a.nom} secondary={`${a.societe} · ${a.diplome}`} />
                <ListItemTrailing>
                  <Tag label={DISPO_TAG[a.dispo].label} color={DISPO_TAG[a.dispo].color} appearance="subtle" shape="rounded" />
                </ListItemTrailing>
              </ListItem>
            ))}
          </List>
        )}
      </div>

      {/* Feuille de filtres — MÊME source que FiltresPanel compact (FiltresSheet).
          Bottom sheet swipeable, drill-down facettes + filtres enregistrés. */}
      <FiltresSheet
        filters={f}
        onChange={setF}
        views={views}
        onSaveView={(name) => save(name, f)}
        onApplyView={(v) => setF(v.filters)}
        onDeleteView={remove}
        isOpen={filterOpen}
        onOpenChange={setFilterOpen}
        scrollClassName={css["scroll"]}
        textActionClassName={css["textAction"]}
      />
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta + stories

// Viewports proposés : les presets minimaux du DS + un défaut téléphone
// 390 × 844 (iPhone 12/13/14) sélectionné par les stories mobiles.
const VIEWPORTS = {
  ...MINIMAL_VIEWPORTS,
  phone390: {
    name: "Téléphone (390 × 844)",
    styles: { width: "390px", height: "844px" },
    type: "mobile" as const,
  },
};

const meta = {
  title: "Recipes/Filtres",
  parameters: {
    layout: "fullscreen",
    viewport: { options: VIEWPORTS },
    docs: {
      description: {
        component:
          "Recette « Filtres » (maquette Claude Design). Panneau unique : " +
          "desktop = recherche + bouton Filtres (popover à deux volets), filtres " +
          "enregistrés en action à droite, tags actifs regroupés par catégorie (+N) et " +
          "tableau ; mobile = liste d'agents + panneau de filtres en drill-down (liste des " +
          "facettes → détail, recherche dans les catégories longues). Comptes vivants, " +
          "mini-recherche transversale, filtres enregistrés. 100 % composants + tokens du design system.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Stories affichées : sans `play`, pour être utilisables immédiatement à
// l'ouverture (aucune interaction rejouée automatiquement au montage).
export const Desktop: Story = {
  // Rôle courant : filtre les facettes visibles dans le popover (déclaratif).
  // Bascule le contrôle pour voir deux jeux de facettes issus des MÊMES
  // définitions — manager voit « Périmètre et contrats » et « Emplois », pas le
  // partenaire.
  argTypes: {
    role: { name: "Rôle", control: "inline-radio", options: ["manager", "partenaire", "client"] },
  },
  args: { role: "manager" },
  render: (args) => <FiltresOptionB role={(args as { role?: Role }).role} />,
};

export const Mobile: Story = {
  globals: { viewport: { value: "phone390" } },
  render: () => <FiltresOptionBMobile />,
};

// Stories de test (interactions) — masquées du sidebar via `!dev`, mais
// exécutées par le test-runner (vitest/CI). Elles portent les `play`
// functions pour que les interactions ne se rejouent PAS à l'ouverture des
// stories visibles ci-dessus.
export const DesktopInteractions: Story = {
  tags: ["!dev"],
  render: () => <FiltresOptionB />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rowCount = () => canvasElement.querySelectorAll("tbody tr").length;

    await step("état initial : panneau fermé, tableau filtré", async () => {
      const filtresBtn = canvas.getByRole("button", { name: /Filtres,/ });
      await expect(filtresBtn).toHaveAttribute("aria-expanded", "false");
      await expect(rowCount()).toBeGreaterThan(0);
      await expect(rowCount()).toBeLessThan(AGENTS.length);
    });

    await step("ouvrir le panneau à deux volets", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres,/ }));
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
      const dialog = within(screen.getByRole("dialog"));
      await expect(dialog.getByRole("button", { name: "Langues" })).toBeInTheDocument();
    });

    await step("cocher une option ACTIVE (compte > 0) réduit ou maintient les résultats", async () => {
      const dialog = within(screen.getByRole("dialog"));
      const before = rowCount();
      await userEvent.click(dialog.getByRole("button", { name: "Langues" }));
      // « Anglais » a un compte vivant > 0 sur la sélection initiale (option
      // activée) ; « Français » y ressort à 0 → désactivée, non cochable.
      const cb = dialog.getByRole("checkbox", { name: "Anglais" });
      await userEvent.click(cb);
      await expect(cb).toBeChecked();
      await waitFor(() => expect(rowCount()).toBeLessThanOrEqual(before));
    });

    await step("fermer le panneau avec Échap", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.getByRole("button", { name: /Filtres,/ })).toHaveAttribute("aria-expanded", "false"));
    });

    await step("rôles déclaratifs : deux rôles → deux jeux de facettes, sans littéral", async () => {
      // Mêmes définitions FACET_DEFS → jeux différents selon le rôle (le point
      // du recensement : le masquage vivait surtout dans les FILTRES).
      const manager = facetsForRole("manager").map((d) => d.key);
      const partenaire = facetsForRole("partenaire").map((d) => d.key);
      await expect(manager).not.toEqual(partenaire);
      await expect(manager.length).toBeGreaterThan(partenaire.length);
      await expect(manager).toContain("perimetre"); // réservé manager…
      await expect(partenaire).not.toContain("perimetre"); // …masqué au partenaire
      await expect(partenaire).not.toContain("emploi"); // réservé manager + client
      // Aucun littéral de rôle dans le composant d'AFFICHAGE : la visibilité
      // vient du champ `roles`, jamais d'un test en dur.
      await expect(/isPartner|isManager|role_code/.test(FiltresPanel.toString())).toBe(false);
    });
  },
};

export const MobileInteractions: Story = {
  tags: ["!dev"],
  globals: { viewport: { value: "phone390" } },
  render: () => <FiltresOptionBMobile />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // Le Drawer est rendu dans un portail (hors canvas) → requêtes via document.
    const drawer = () => within(screen.getByRole("dialog", { name: "Filtres" }));

    await step("ouvrir la feuille de filtres", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres,/ }));
      await waitFor(() => expect(screen.getByRole("dialog", { name: "Filtres" })).toBeInTheDocument());
    });

    await step("enregistrer les filtres courants", async () => {
      await userEvent.click(drawer().getByRole("button", { name: /Enregistrer ces filtres/ }));
      await userEvent.type(drawer().getByRole("textbox", { name: "Nom de l'enregistrement" }), "Mes filtres");
      await userEvent.click(drawer().getByRole("button", { name: "Enregistrer" }));
      // De retour à la racine : les filtres courants correspondent désormais à
      // l'enregistrement créé → son nom apparaît sur la ligne « Filtres
      // enregistrés » (pas de badge, pas de compte).
      await waitFor(() => expect(drawer().getByText("Mes filtres")).toBeInTheDocument());
    });

    await step("drill-down dans une facette puis retour", async () => {
      await userEvent.click(drawer().getByRole("button", { name: /Langues/ }));
      await waitFor(() => expect(drawer().getByRole("checkbox", { name: "Français" })).toBeInTheDocument());
      await userEvent.click(drawer().getByRole("button", { name: "Retour" }));
      await waitFor(() => expect(drawer().getByRole("button", { name: /Langues/ })).toBeInTheDocument());
    });

    await step("« Voir N agents » ferme la feuille", async () => {
      await userEvent.click(drawer().getByRole("button", { name: /Voir \d+ agent/ }));
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Filtres" })).toBeNull());
    });
  },
};
