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
import { useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { within, screen, userEvent, waitFor, expect } from "storybook/test";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import { parseDate, Time } from "@internationalized/date";
import css from "./FiltresOptionB.stories.module.css";
import {
  Button,
  Badge,
  Tag,
  SearchField,
  TextField,
  Icon,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  DatePicker,
  TimePicker,
  Avatar,
  Divider,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  List,
  ListHead,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemTrailing,
  ListItemSecondaryAction,
} from "@aexae/comete-design-system/components";
import {
  FiltresPanel,
  SavedSearchesMenu,
  ActiveFilterTags,
  ResultsTable,
  useSavedViews,
  initialFilters,
  emptyFilters,
  filteredAgents,
  totalActive,
  sameFilters,
  optionCount,
  facetCount,
  DOMAINS,
  DISPO_MODES,
  DISPO_TAG,
  FACET_DEFS,
  INITIAL_VIEWS,
  initialsOf,
  AGENTS,
  facetsForRole,
  type Filters,
  type FacetDef,
  type MultiKey,
  type SavedView,
  type Role,
} from "./_filtresOptionB";

// -----------------------------------------------------------------------
// Recette — desktop : chrome de page (Page.Bar + Page.Toolbar) composant la
// recette « Filtres » partagée (_filtresOptionB). MÊME popup que la story
// Layout/Page/Toolbar → source unique.

function FiltresOptionB({ role }: { role?: Role }): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const { views, save, remove } = useSavedViews();
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
        <SavedSearchesMenu views={views} onApply={(v) => setF(v.filters)} onDelete={remove} />
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
  const [facet, setFacet] = useState<string | null>(null);
  const [showViews, setShowViews] = useState(false);
  const [views, setViews] = useState<SavedView[]>(INITIAL_VIEWS);
  const [savingName, setSavingName] = useState<string | null>(null);
  // Recherche locale dans une catégorie à liste longue (ex. « Secteurs »).
  const [optionQuery, setOptionQuery] = useState("");
  const viewSeq = useRef(0);

  const openFacet = (key: string) => {
    setOptionQuery("");
    setFacet(key);
  };

  const patch = (p: Partial<Filters>) => setF((prev) => ({ ...prev, ...p }));
  const toggleMulti = (key: MultiKey, value: string) =>
    setF((prev) => {
      const has = prev[key].includes(value);
      return { ...prev, [key]: has ? prev[key].filter((v) => v !== value) : [...prev[key], value] };
    });
  const clearAll = () => setF(emptyFilters());

  const results = useMemo(() => filteredAgents(f), [f]);
  const total = totalActive(f);
  // Filtre enregistré actuellement appliqué (si les filtres courants
  // correspondent à un enregistrement) : son nom s'affiche sur la ligne.
  const appliedView = total > 0 ? views.find((v) => sameFilters(v.filters, f)) : undefined;
  const detailDef = facet ? (FACET_DEFS.find((d) => d.key === facet) ?? null) : null;

  const closeFilter = () => {
    setFilterOpen(false);
    setFacet(null);
    setShowViews(false);
    setSavingName(null);
    setOptionQuery("");
  };
  const applyView = (v: SavedView) => {
    setF(v.filters);
    closeFilter();
  };
  const deleteView = (id: string) => setViews((vs) => vs.filter((v) => v.id !== id));
  const saveView = () => {
    const name = (savingName ?? "").trim();
    if (!name) return;
    viewSeq.current += 1;
    setViews((vs) => [...vs, { id: `vm-${viewSeq.current}`, name, filters: f }]);
    setSavingName(null);
  };

  const optionControls = (def: FacetDef): ReactElement => {
    if (def.kind === "switches") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
          <Switch isChecked={f.sousTraitants} onChange={(v) => patch({ sousTraitants: v })}>
            Inclure les sous-traitants
          </Switch>
          <Switch isChecked={f.cdiOnly} onChange={(v) => patch({ cdiOnly: v })}>
            CDI uniquement
          </Switch>
        </div>
      );
    }
    if (def.kind === "dispo") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
          <RadioGroup aria-label="Disponibilités" value={f.dispoMode} onChange={(v) => patch({ dispoMode: v })}>
            {DISPO_MODES.map((m) => (
              <Radio key={m.id} value={m.id} label={m.label} />
            ))}
          </RadioGroup>
          <div style={{ display: "flex", gap: "var(--space150)", flexWrap: "wrap" }}>
            <DatePicker aria-label="Date" defaultValue={parseDate("2026-08-20")} />
            <TimePicker aria-label="Heure de début" defaultValue={new Time(18, 0)} />
            <TimePicker aria-label="Heure de fin" defaultValue={new Time(23, 0)} />
          </div>
        </div>
      );
    }
    const key = def.key as MultiKey;
    const domain = DOMAINS[key];
    // Liste longue → barre de recherche pour filtrer les options par texte.
    const searchable = domain.length > 8;
    const q = optionQuery.trim().toLowerCase();
    const shown = searchable && q ? domain.filter((v) => v.toLowerCase().includes(q)) : domain;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space150)" }}>
        {searchable ? (
          <SearchField
            aria-label={`Rechercher dans ${def.label}`}
            placeholder="Rechercher"
            value={optionQuery}
            onChange={setOptionQuery}
          />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
          {shown.map((value) => {
            const n = optionCount(f, key, value);
            const checked = f[key].includes(value);
            return (
              <div key={value} className={css["optionRow"]}>
                <span className={css["optionMain"]}>
                  <Checkbox isChecked={checked} isDisabled={n === 0 && !checked} onChange={() => toggleMulti(key, value)} label={value} />
                </span>
                <span className={css["optionCount"]}>{n}</span>
              </div>
            );
          })}
          {shown.length === 0 ? (
            <p style={{ padding: "var(--space200) 0", textAlign: "center", color: "var(--text-subtlest)", fontSize: 13 }}>Aucune option ne correspond.</p>
          ) : null}
        </div>
      </div>
    );
  };

  const facetValue = (d: FacetDef): string => {
    if (d.kind === "dispo") return f.dispoMode === "tous" ? "" : DISPO_MODES.find((m) => m.id === f.dispoMode)!.label;
    if (d.kind === "multi" && facetCount(f, d.key) === 1) return f[d.key as MultiKey][0];
    return "";
  };

  // En-tête de la feuille : le chevron retour occupe un emplacement réservé
  // dans les DEUX vues (racine sans retour, détail/recherches avec) → le titre
  // commence au même x partout (§5).
  const back = () => {
    if (showViews) {
      setShowViews(false);
      setSavingName(null);
    } else {
      setFacet(null);
      setOptionQuery("");
    }
  };
  const sheetTitle = showViews
    ? "Filtres enregistrés"
    : savingName !== null
      ? "Enregistrer ces filtres"
      : detailDef
        ? detailDef.label
        : "Filtres";

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
          onPress={() => {
            setFacet(null);
            setFilterOpen(true);
          }}
        >
          {total > 0 && <Badge label={String(total)} appearance="information-inverted" importance="high" />}
        </Button>
      </div>

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

      {/* Feuille de filtres — Drawer swipeable (placement bas), drill-down.
          `size="auto"` → la feuille épouse son contenu, bornée à 85dvh (§3) ;
          le corps défile au-delà. Le retrait horizontal et la barre de
          défilement thématisée viennent des sous-composants DS eux-mêmes
          (DrawerHeader / DrawerBody / DrawerFooter, tous en `--space300`) :
          les lignes `ListItemButton isFlush` s'alignent sur le padding du
          corps (§1), le titre part de la même colonne (§5). */}
      <Drawer
        isOpen={filterOpen}
        onOpenChange={(o) => {
          setFilterOpen(o);
          if (!o) {
            setFacet(null);
            setShowViews(false);
            setSavingName(null);
          }
        }}
        placement="bottom"
        swipeable
        size="auto"
        style={{ maxHeight: "85dvh" }}
        aria-label="Filtres"
      >
        <DrawerHeader>
          {/* Chevron retour dans les vues détail / recherches (drill-down). */}
          {showViews || detailDef ? (
            <Button appearance="subtle" iconBefore="ChevronLeft" aria-label="Retour" onPress={back} />
          ) : null}
          <strong style={{ flex: 1, minWidth: 0, fontSize: "var(--font-size-ui-m)", fontWeight: "var(--font-weight-semibold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sheetTitle}</strong>
          {!showViews && savingName === null ? (
            <Button appearance="link" className={css["textAction"]} onPress={clearAll} isDisabled={total === 0}>
              Réinitialiser
            </Button>
          ) : null}
        </DrawerHeader>

        <Divider />

          <DrawerBody className={css["scroll"]}>
            {showViews ? (
              views.length === 0 ? (
                <p style={{ padding: "var(--space300) 0", textAlign: "center", color: "var(--text-subtlest)", fontSize: 13 }}>Aucun filtre enregistré.</p>
              ) : (
                <List aria-label="Filtres enregistrés">
                  {views.map((v) => {
                    const n = totalActive(v.filters);
                    return (
                      <ListItemButton key={v.id} onPress={() => applyView(v)}>
                        <ListItemText primary={v.name} secondary={`${n} filtre${n > 1 ? "s" : ""} appliqué${n > 1 ? "s" : ""}`} />
                        <ListItemSecondaryAction>
                          <Button appearance="subtle" iconBefore="Close" aria-label={`Supprimer ${v.name}`} onPress={() => deleteView(v.id)} />
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    );
                  })}
                </List>
              )
            ) : savingName !== null ? (
              // Enregistrement : vue FOCALISÉE — seuls le champ et ses deux
              // actions sont présents/actifs. Facettes, pied « Voir N » et
              // « Réinitialiser » disparaissent le temps de nommer l'enregistrement.
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)", paddingBlock: "var(--space100)" }}>
                <TextField aria-label="Nom de l'enregistrement" placeholder="Nom de l'enregistrement" value={savingName} onChange={setSavingName} />
                <div style={{ display: "flex", gap: "var(--space100)" }}>
                  <Button appearance="contained" color="comete" onPress={saveView} isDisabled={!savingName.trim()} style={{ flex: 1 }}>
                    Enregistrer
                  </Button>
                  <Button appearance="subtle" onPress={() => setSavingName(null)} style={{ flex: 1 }}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : detailDef ? (
              optionControls(detailDef)
            ) : (
              // Colonne flex : l'espace autour du filet entre les deux groupes
              // est porté par le `gap` (une valeur, un endroit), jamais par une
              // marge sur le filet.
              <div className={css["rootGroups"]}>
                {/* Bloc « enregistrement » : action + collection.
                    Aucun picto (§2) → texte aligné sur la colonne unique. */}
                <List aria-label="Filtres enregistrés">
                  <ListHead isFlush className={css["sectionTitle"]}>Enregistrement</ListHead>
                  <ListItemButton isFlush onPress={() => setSavingName("")} isDisabled={total === 0}>
                    <ListItemText primary="Enregistrer ces filtres" />
                  </ListItemButton>
                  <ListItemButton isFlush onPress={() => setShowViews(true)}>
                    {/* Même patron que les facettes : libellé prioritaire
                        (`flex: none`), le nom appliqué tronque avant lui (§4). */}
                    <span className={css["facetLabel"]}>Filtres enregistrés</span>
                    {/* Pas de badge : on laisse apparaître le nom du filtre
                        enregistré appliqué, quand il y en a un. */}
                    <span className={css["facetTrailing"]}>
                      {appliedView ? <span className={css["facetValue"]}>{appliedView.name}</span> : null}
                      <Icon icon="ChevronRight" color="subtlest" />
                    </span>
                  </ListItemButton>
                </List>

                {/* Filet — de bord à bord de la colonne de contenu (il vit dans
                    le padding du DrawerBody, même retrait que le reste) ;
                    l'espace autour vient du `gap`, pas d'une marge. */}
                <Divider />

                {/* Facettes — libellé en ListItemText (flex:1 base 0) : c'est la
                    VALEUR qui se tronque en premier, pas le libellé (§4 racine). */}
                <List aria-label="Critères">
                  <ListHead isFlush className={css["sectionTitle"]}>Critères</ListHead>
                  {FACET_DEFS.map((d) => {
                    const c = facetCount(f, d.key);
                    const val = facetValue(d);
                    return (
                      <ListItemButton key={d.key} isFlush onPress={() => openFacet(d.key)}>
                        <span className={css["facetLabel"]}>{d.label}</span>
                        <span className={css["facetTrailing"]}>
                          {val ? (
                            <span className={css["facetValue"]}>{val}</span>
                          ) : c > 0 ? (
                            <Badge label={String(c)} appearance="information" importance="high" />
                          ) : null}
                          <Icon icon="ChevronRight" color="subtlest" />
                        </span>
                      </ListItemButton>
                    );
                  })}
                </List>
              </div>
            )}
          </DrawerBody>

          {/* Pied masqué pendant l'enregistrement : aucun autre élément actif. */}
          {savingName === null ? (
            <DrawerFooter>
              <Button appearance="contained" color="comete" onPress={closeFilter} style={{ width: "100%" }}>
                Voir {results.length} agent{results.length > 1 ? "s" : ""}
              </Button>
            </DrawerFooter>
          ) : null}
      </Drawer>
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

    await step("cocher une facette vide réduit (ou maintient) les résultats", async () => {
      const dialog = within(screen.getByRole("dialog"));
      const before = rowCount();
      await userEvent.click(dialog.getByRole("button", { name: "Langues" }));
      const cb = dialog.getByRole("checkbox", { name: "Français" });
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
