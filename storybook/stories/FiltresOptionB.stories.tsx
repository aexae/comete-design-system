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
import { parseDate, Time } from "@internationalized/date";
import {
  Button,
  Badge,
  Tag,
  type TagStatusColor,
  SearchField,
  TextField,
  Icon,
  Popup,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  DatePicker,
  TimePicker,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemTrailing,
  ListItemSecondaryAction,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@aexae/comete-design-system/components";

// -----------------------------------------------------------------------
// Modèle : facettes + agents (données de la maquette).

type FacetKind = "multi" | "switches" | "dispo";
interface FacetDef {
  key: string;
  label: string;
  kind: FacetKind;
}

const FACET_DEFS: FacetDef[] = [
  { key: "societe", label: "Société / Agence", kind: "multi" },
  { key: "secteur", label: "Secteurs", kind: "multi" },
  { key: "habilitation", label: "Habilitations", kind: "multi" },
  { key: "formalite", label: "Formalités", kind: "multi" },
  { key: "equipement", label: "Équipements", kind: "multi" },
  { key: "diplome", label: "Diplômes", kind: "multi" },
  { key: "emploi", label: "Emplois", kind: "multi" },
  { key: "langue", label: "Langues", kind: "multi" },
  { key: "perimetre", label: "Périmètre et contrats", kind: "switches" },
  { key: "dispo", label: "Disponibilités", kind: "dispo" },
];

const MULTI_KEYS = [
  "societe",
  "secteur",
  "habilitation",
  "formalite",
  "equipement",
  "diplome",
  "emploi",
  "langue",
] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

interface Agent {
  nom: string;
  societe: string;
  secteur: string;
  habilitation: string;
  formalite: string;
  equipement: string;
  diplome: string;
  emploi: string;
  langue: string;
  contrat: string;
  sousTraitant: boolean;
  dispo: "planifies" | "non" | "disponibles";
}

const AGENTS: Agent[] = (
  [
    ["DUPONT Marie", "Comète Sécurité", "Nord", "SST", "Complètes", "Radio", "CQP APS", "Agent de sécurité", "Français", "CDI", false, "planifies"],
    ["MARTIN Bob", "Comète Sécurité", "Est", "H0B0", "Pièce manquante", "Véhicule", "SSIAP 1", "Agent SSIAP", "Français", "CDI", false, "non"],
    ["CHEN Alice", "Comète Sécurité", "Nord", "SST", "Complètes", "Radio", "SSIAP 2", "Chef de poste", "Anglais", "CDI", false, "disponibles"],
    ["CLAIRE Sophie", "Agence Lyon", "Sud", "Palpation", "Complètes", "Chien", "CQP APS", "Agent cynophile", "Français", "Vacataire", false, "disponibles"],
    ["BARDET Romain", "Sous-traitant Vigilis", "Est", "SST", "Pièce manquante", "Radio", "CQP APS", "Agent de sécurité", "Espagnol", "CDD", true, "planifies"],
    ["BENOIT Armand", "Agence Lyon", "Sud", "H0B0", "Complètes", "Véhicule", "SSIAP 1", "Agent SSIAP", "Français", "CDI", false, "planifies"],
    ["BERNARD Alex", "Comète Sécurité", "Ouest", "SST", "Complètes", "Radio", "CQP APS", "Agent de sécurité", "Anglais", "Vacataire", false, "non"],
    ["ORSAL Guillaume", "Agence Lyon", "Sud", "SST", "Complètes", "Véhicule", "SSIAP 2", "Chef de poste", "Français", "CDI", false, "disponibles"],
    ["COCHARD Cédric", "Sous-traitant Vigilis", "Nord", "Palpation", "Pièce manquante", "Radio", "CQP APS", "Agent de sécurité", "Portugais", "CDD", true, "non"],
    ["ARMAND Fred", "Comète Sécurité", "Est", "Palpation", "Complètes", "Chien", "CQP APS", "Agent cynophile", "Français", "CDI", false, "planifies"],
    ["BELLANGER Georgie", "Agence Lyon", "Ouest", "SST", "Complètes", "Radio", "SSIAP 1", "Agent SSIAP", "Anglais", "Vacataire", false, "disponibles"],
    ["ANAIS Alfred", "Comète Sécurité", "Nord", "H0B0", "Complètes", "Véhicule", "SSIAP 2", "Chef de poste", "Français", "CDI", false, "planifies"],
  ] as const
).map((r) => ({
  nom: r[0],
  societe: r[1],
  secteur: r[2],
  habilitation: r[3],
  formalite: r[4],
  equipement: r[5],
  diplome: r[6],
  emploi: r[7],
  langue: r[8],
  contrat: r[9],
  sousTraitant: r[10],
  dispo: r[11],
}));

const DISPO_MODES = [
  { id: "tous", label: "Tous" },
  { id: "planifies", label: "Planifiés en août 2026" },
  { id: "non", label: "Non planifiés en août 2026" },
  { id: "disponibles", label: "Disponibles" },
] as const;

const DISPO_TAG: Record<Agent["dispo"], { label: string; color: TagStatusColor }> = {
  planifies: { label: "Planifié", color: "information" },
  non: { label: "Non planifié", color: "warning" },
  disponibles: { label: "Disponible", color: "success" },
};

// -----------------------------------------------------------------------
// État de filtre + logique (comptes vivants).

interface Filters {
  societe: string[];
  secteur: string[];
  habilitation: string[];
  formalite: string[];
  equipement: string[];
  diplome: string[];
  emploi: string[];
  langue: string[];
  sousTraitants: boolean;
  cdiOnly: boolean;
  dispoMode: string;
  nameQuery: string;
}

function emptyFilters(): Filters {
  const f = { sousTraitants: false, cdiOnly: false, dispoMode: "tous", nameQuery: "" } as Filters;
  MULTI_KEYS.forEach((k) => {
    f[k] = [];
  });
  return f;
}

// Sélection initiale de la maquette (pour montrer tags + comptes d'emblée).
function initialFilters(): Filters {
  return {
    ...emptyFilters(),
    societe: ["Comète Sécurité", "Agence Lyon"],
    secteur: ["Nord", "Sud"],
    habilitation: ["SST"],
    formalite: ["Complètes"],
    equipement: ["Radio", "Véhicule"],
    diplome: ["SSIAP 2"],
    cdiOnly: true,
  };
}

function match(a: Agent, f: Filters): boolean {
  if (!f.sousTraitants && a.sousTraitant) return false;
  if (f.cdiOnly && a.contrat !== "CDI") return false;
  if (f.dispoMode !== "tous" && a.dispo !== f.dispoMode) return false;
  if (f.nameQuery && !a.nom.toLowerCase().includes(f.nameQuery.toLowerCase())) return false;
  return MULTI_KEYS.every((k) => !f[k].length || f[k].includes(a[k]));
}

const filteredAgents = (f: Filters): Agent[] => AGENTS.filter((a) => match(a, f));

// Match en ignorant une facette (comptes qui ne s'effondrent pas quand on
// coche plusieurs valeurs de la même facette).
function matchExcept(a: Agent, f: Filters, skip: MultiKey): boolean {
  if (!f.sousTraitants && a.sousTraitant) return false;
  if (f.cdiOnly && a.contrat !== "CDI") return false;
  if (f.dispoMode !== "tous" && a.dispo !== f.dispoMode) return false;
  return MULTI_KEYS.every((k) => k === skip || !f[k].length || f[k].includes(a[k]));
}

const optionCount = (f: Filters, key: MultiKey, value: string): number =>
  AGENTS.filter((a) => a[key] === value && matchExcept(a, f, key)).length;

const DOMAINS = MULTI_KEYS.reduce(
  (acc, key) => {
    acc[key] = [...new Set(AGENTS.map((a) => a[key]))].sort((x, y) => x.localeCompare(y, "fr"));
    return acc;
  },
  {} as Record<MultiKey, string[]>,
);

function facetCount(f: Filters, key: string): number {
  if (key === "perimetre") return (f.sousTraitants ? 1 : 0) + (f.cdiOnly ? 1 : 0);
  if (key === "dispo") return f.dispoMode === "tous" ? 0 : 1;
  return (f[key as MultiKey] ?? []).length;
}

const totalActive = (f: Filters): number =>
  FACET_DEFS.reduce((n, d) => n + facetCount(f, d.key), 0);

interface ActiveGroup {
  key: string;
  facet: string;
  values: string;
  count: number;
  clear: () => void;
}

interface SavedView {
  id: string;
  name: string;
  filters: Filters;
}

// Résumé « valeurs · valeurs » d'une recherche enregistrée (sous-titre).
function viewSummary(filters: Filters): string {
  return groupsOf(filters)
    .map((g) => g.values)
    .join(" · ");
}

// Groupes de valeurs actives (sert aux tags et au résumé des vues).
function groupsOf(f: Filters): { key: string; facet: string; values: string; count: number }[] {
  const out: { key: string; facet: string; values: string; count: number }[] = [];
  MULTI_KEYS.forEach((k) => {
    if (!f[k].length) return;
    const d = FACET_DEFS.find((x) => x.key === k)!;
    out.push({ key: k, facet: d.label, values: f[k].join(", "), count: f[k].length });
  });
  if (f.cdiOnly) out.push({ key: "cdi", facet: "Contrat", values: "CDI uniquement", count: 1 });
  if (f.sousTraitants) out.push({ key: "st", facet: "Périmètre", values: "Sous-traitants inclus", count: 1 });
  if (f.dispoMode !== "tous") {
    const m = DISPO_MODES.find((x) => x.id === f.dispoMode)!;
    out.push({ key: "dispo", facet: "Disponibilité", values: m.label, count: 1 });
  }
  return out;
}

const INITIAL_VIEWS: SavedView[] = [
  { id: "v-seed-1", name: "SSIAP 2 disponibles", filters: { ...emptyFilters(), diplome: ["SSIAP 2"], dispoMode: "disponibles" } },
  { id: "v-seed-2", name: "Cynophiles secteur Nord et Est", filters: { ...emptyFilters(), secteur: ["Nord", "Est"], emploi: ["Agent cynophile"] } },
  { id: "v-seed-3", name: "Formalités incomplètes", filters: { ...emptyFilters(), formalite: ["Pièce manquante"] } },
];

const initialsOf = (nom: string): string =>
  nom
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

// -----------------------------------------------------------------------
// Recette — desktop

function FiltresOptionB(): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cat, setCat] = useState<string>("societe");
  const [query, setQuery] = useState("");
  const [views, setViews] = useState<SavedView[]>(INITIAL_VIEWS);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [savingName, setSavingName] = useState<string | null>(null);
  const viewSeq = useRef(0);

  const setFacet = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));
  const toggleMulti = (key: MultiKey, value: string) =>
    setF((prev) => {
      const has = prev[key].includes(value);
      return { ...prev, [key]: has ? prev[key].filter((v) => v !== value) : [...prev[key], value] };
    });

  const results = useMemo(() => filteredAgents(f), [f]);
  const total = totalActive(f);

  const curDef = FACET_DEFS.find((d) => d.key === cat) ?? FACET_DEFS[0];
  const q = query.trim().toLowerCase();
  const searchHits = q
    ? MULTI_KEYS.flatMap((k) =>
        DOMAINS[k].filter((v) => v.toLowerCase().includes(q)).map((v) => ({ key: k, value: v })),
      )
    : [];

  const groups: ActiveGroup[] = useMemo(() => {
    return groupsOf(f).map((g) => ({
      ...g,
      clear: () => {
        if (g.key === "cdi") setFacet({ cdiOnly: false });
        else if (g.key === "st") setFacet({ sousTraitants: false });
        else if (g.key === "dispo") setFacet({ dispoMode: "tous" });
        else setFacet({ [g.key]: [] });
      },
    }));
  }, [f]);

  const clearAll = () => setF(emptyFilters());

  const MAX_CHIPS = 4;
  const visibleGroups = groups.slice(0, MAX_CHIPS);
  const overflowGroups = groups.slice(MAX_CHIPS);

  const applyView = (v: SavedView) => {
    setF(v.filters);
    setViewsOpen(false);
    setPanelOpen(false);
  };
  const deleteView = (id: string) => setViews((vs) => vs.filter((v) => v.id !== id));
  const saveView = () => {
    const name = (savingName ?? "").trim();
    if (!name) return;
    viewSeq.current += 1;
    setViews((vs) => [...vs, { id: `v-${viewSeq.current}`, name, filters: f }]);
    setSavingName(null);
  };

  // Contrôles d'options d'une facette (partagés desktop / mobile).
  const optionControls = (def: FacetDef): ReactElement => {
    if (def.kind === "switches") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
          <Switch isChecked={f.sousTraitants} onChange={(v) => setFacet({ sousTraitants: v })}>
            Inclure les sous-traitants
          </Switch>
          <Switch isChecked={f.cdiOnly} onChange={(v) => setFacet({ cdiOnly: v })}>
            CDI uniquement
          </Switch>
        </div>
      );
    }
    if (def.kind === "dispo") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
          <RadioGroup aria-label="Disponibilités" value={f.dispoMode} onChange={(v) => setFacet({ dispoMode: v })}>
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
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
        {DOMAINS[key].map((value) => {
          const n = optionCount(f, key, value);
          const checked = f[key].includes(value);
          return (
            <div key={value} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
              <Checkbox isChecked={checked} isDisabled={n === 0 && !checked} onChange={() => toggleMulti(key, value)} label={value} />
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChip = (g: ActiveGroup): ReactElement => {
    const first = g.values.split(", ")[0];
    const extra = g.count > 1 ? `+${g.count - 1}` : "";
    return (
      <span
        key={g.key}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space075)",
          height: 28,
          padding: "0 var(--space075) 0 var(--space150)",
          borderRadius: "var(--radius-round)",
          background: "var(--background-brand-subtlest-default)",
          color: "var(--text-brand)",
          fontSize: 12.5,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ opacity: 0.65 }}>{g.facet} :</span>
        <span>{first}</span>
        {extra && <span style={{ fontWeight: 600, opacity: 0.75 }}>{extra}</span>}
        <button
          type="button"
          onClick={g.clear}
          aria-label={`Retirer ${g.facet}`}
          style={{ display: "inline-flex", padding: 4, border: 0, background: "none", borderRadius: "var(--radius-round)", cursor: "pointer", color: "inherit", opacity: 0.7 }}
        >
          <Icon icon="Close" size={12} />
        </button>
      </span>
    );
  };

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
            onChange={(v) => setFacet({ nameQuery: v })}
          />
        </div>
        <Popup
          isOpen={panelOpen}
          onOpenChange={setPanelOpen}
          placement="bottom-left"
          style={{ width: 720, maxWidth: "calc(100vw - 32px)" }}
          trigger={
            <Button appearance="outlined" iconBefore="Tune">
              Filtres
              {total > 0 && <Badge label={String(total)} appearance="information" importance="high" />}
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "var(--space200) var(--space200) var(--space150)" }}>
              <SearchField
                aria-label="Rechercher dans les filtres"
                placeholder="Rechercher un critère (société, secteur, diplôme…)"
                value={query}
                onChange={setQuery}
              />
            </div>
            <div style={{ display: "flex", height: 380, borderTop: "1px solid var(--border-subtle)" }}>
              {/* Volet gauche : liste des facettes. */}
              <ul
                aria-label="Facettes"
                style={{
                  flex: "none",
                  width: 232,
                  margin: 0,
                  padding: "var(--space100)",
                  listStyle: "none",
                  overflowY: "auto",
                  borderRight: "1px solid var(--border-subtle)",
                  background: "var(--background-surface-elevation-sunken-default)",
                }}
              >
                {FACET_DEFS.map((d) => {
                  const c = facetCount(f, d.key);
                  const active = !q && d.key === cat;
                  return (
                    <li key={d.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setCat(d.key);
                        }}
                        aria-current={active || undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space100)",
                          width: "100%",
                          padding: "0 var(--space150)",
                          height: 40,
                          border: 0,
                          borderRadius: "var(--radius100)",
                          background: active ? "var(--background-brand-subtlest-default)" : "none",
                          color: active ? "var(--text-brand)" : "var(--text-default)",
                          fontSize: 13.5,
                          fontWeight: active ? 600 : 500,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ flex: 1 }}>{d.label}</span>
                        {c > 0 && <Badge label={String(c)} appearance={active ? "information" : "neutral"} importance="high" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Volet droit : options de la facette courante, ou résultats de recherche. */}
              <div style={{ flex: 1, overflowY: "auto", padding: "var(--space200)" }}>
                {q ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
                    <p style={{ margin: "0 0 var(--space100)", fontSize: 12, color: "var(--text-subtlest)" }}>
                      {searchHits.length} résultat{searchHits.length > 1 ? "s" : ""} pour « {query.trim()} »
                    </p>
                    {searchHits.map(({ key, value }) => {
                      const n = optionCount(f, key, value);
                      const facetLabel = FACET_DEFS.find((d) => d.key === key)!.label;
                      return (
                        <div key={`${key}:${value}`} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
                          <Checkbox isChecked={f[key].includes(value)} isDisabled={n === 0 && !f[key].includes(value)} onChange={() => toggleMulti(key, value)} label={value} />
                          <span style={{ fontSize: 11.5, color: "var(--text-subtlest)" }}>{facetLabel}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  optionControls(curDef)
                )}
              </div>
            </div>

            {/* Pied : enregistrer / compteur / réinitialiser. */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space150)", padding: "var(--space150) var(--space200)", borderTop: "1px solid var(--border-subtle)" }}>
              {savingName === null ? (
                <>
                  <Button appearance="link" iconBefore="Bookmark" onPress={() => setSavingName("")} isDisabled={total === 0}>
                    Enregistrer cette recherche
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Button appearance="subtle" onPress={clearAll} isDisabled={total === 0}>
                    Réinitialiser
                  </Button>
                  <Button appearance="contained" onPress={() => setPanelOpen(false)}>
                    Voir les résultats
                  </Button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, maxWidth: 260 }}>
                    <TextField aria-label="Nom de la recherche" placeholder="Nom de la recherche" value={savingName} onChange={setSavingName} />
                  </div>
                  <Button appearance="contained" onPress={saveView} isDisabled={!savingName.trim()}>
                    Enregistrer
                  </Button>
                  <Button appearance="subtle" onPress={() => setSavingName(null)}>
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>
        </Popup>

        <div style={{ flex: 1 }} />

        {/* Recherches enregistrées — action à droite, éloignée de la recherche. */}
        <Popup
          isOpen={viewsOpen}
          onOpenChange={setViewsOpen}
          placement="bottom-right"
          trigger={
            <Button appearance="outlined" iconBefore="Bookmark" iconAfter="ArrowDropDown">
              Recherches
            </Button>
          }
        >
          <div style={{ width: 320, padding: "var(--space075)" }}>
            <div style={{ padding: "var(--space150) var(--space150) var(--space075)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-subtlest)" }}>
              Recherches enregistrées
            </div>
            {views.length === 0 ? (
              <p style={{ margin: 0, padding: "var(--space200)", textAlign: "center", fontSize: 13, color: "var(--text-subtlest)" }}>Aucune recherche enregistrée.</p>
            ) : (
              <List aria-label="Recherches enregistrées">
                {views.map((v) => (
                  <ListItemButton key={v.id} onPress={() => applyView(v)}>
                    <ListItemText primary={v.name} secondary={viewSummary(v.filters)} />
                    <ListItemSecondaryAction>
                      <span style={{ fontSize: 12.5, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{filteredAgents(v.filters).length}</span>
                      <Button appearance="subtle" iconBefore="Close" aria-label={`Supprimer ${v.name}`} onPress={() => deleteView(v.id)} />
                    </ListItemSecondaryAction>
                  </ListItemButton>
                ))}
              </List>
            )}
          </div>
        </Popup>
      </div>

      {/* Tags des filtres actifs, regroupés par catégorie. */}
      {total > 0 && (
        <div
          role="group"
          aria-label="Filtres actifs"
          style={{ display: "flex", alignItems: "center", gap: "var(--space075)", minHeight: 40, flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "var(--space100)" }}
        >
          <span style={{ flex: "none", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-subtlest)" }}>Filtres</span>
          {visibleGroups.map(renderChip)}
          {overflowGroups.length > 0 && (
            <Popup
              placement="bottom-left"
              trigger={
                <Button
                  appearance="subtle"
                  aria-label={`Afficher ${overflowGroups.length} filtre${overflowGroups.length > 1 ? "s" : ""} de plus`}
                >
                  +{overflowGroups.length}
                </Button>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)", padding: "var(--space150)", maxWidth: 320 }}>{overflowGroups.map(renderChip)}</div>
            </Popup>
          )}
          <div style={{ flex: 1 }} />
          <Button appearance="link" onPress={clearAll}>
            Réinitialiser
          </Button>
        </div>
      )}

      {/* Tableau des résultats. */}
      <Table aria-label="Agents">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Agent</TableHeaderCell>
            <TableHeaderCell>Société / Agence</TableHeaderCell>
            <TableHeaderCell>Secteur</TableHeaderCell>
            <TableHeaderCell>Diplôme</TableHeaderCell>
            <TableHeaderCell>Contrat</TableHeaderCell>
            <TableHeaderCell>Disponibilité</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody
          columnCount={6}
          isNoResults={results.length === 0}
          noResultsTitle="Aucun agent ne correspond"
          noResultsDescription="Ajustez ou réinitialisez les filtres pour élargir la recherche."
          noResultsAction={
            <Button appearance="outlined" onPress={clearAll}>
              Réinitialiser les filtres
            </Button>
          }
        >
          {results.map((a) => (
            <TableRow key={a.nom}>
              <TableCell>{a.nom}</TableCell>
              <TableCell>{a.societe}</TableCell>
              <TableCell>{a.secteur}</TableCell>
              <TableCell>{a.diplome}</TableCell>
              <TableCell>{a.contrat}</TableCell>
              <TableCell>
                <Tag label={DISPO_TAG[a.dispo].label} color={DISPO_TAG[a.dispo].color} appearance="subtle" shape="rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// -----------------------------------------------------------------------
// Recette — mobile (liste + panneau de filtres en drill-down).

function FiltresOptionBMobile(): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [facet, setFacet] = useState<string | null>(null);

  const patch = (p: Partial<Filters>) => setF((prev) => ({ ...prev, ...p }));
  const toggleMulti = (key: MultiKey, value: string) =>
    setF((prev) => {
      const has = prev[key].includes(value);
      return { ...prev, [key]: has ? prev[key].filter((v) => v !== value) : [...prev[key], value] };
    });
  const clearAll = () => setF(emptyFilters());

  const results = useMemo(() => filteredAgents(f), [f]);
  const total = totalActive(f);
  const detailDef = facet ? (FACET_DEFS.find((d) => d.key === facet) ?? null) : null;

  const closeFilter = () => {
    setFilterOpen(false);
    setFacet(null);
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
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
        {DOMAINS[key].map((value) => {
          const n = optionCount(f, key, value);
          const checked = f[key].includes(value);
          return (
            <div key={value} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
              <Checkbox isChecked={checked} isDisabled={n === 0 && !checked} onChange={() => toggleMulti(key, value)} label={value} />
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const facetValue = (d: FacetDef): string => {
    if (d.kind === "dispo") return f.dispoMode === "tous" ? "" : DISPO_MODES.find((m) => m.id === f.dispoMode)!.label;
    if (d.kind === "multi" && facetCount(f, d.key) === 1) return f[d.key as MultiKey][0];
    return "";
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space075)",
    padding: "var(--space200) var(--space100) var(--space150)",
    borderBottom: "1px solid var(--border-subtle)",
  } as const;

  return (
    <div style={{ padding: "var(--space400)", display: "flex", justifyContent: "center", background: "var(--background-surface-elevation-sunken-default)", minHeight: "100vh", boxSizing: "border-box" }}>
      <div
        style={{
          position: "relative",
          width: 390,
          height: 780,
          overflow: "hidden",
          borderRadius: 40,
          border: "10px solid var(--background-neutral-bold-default)",
          background: "var(--background-default)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-family-primary)",
          color: "var(--text-default)",
          boxShadow: "var(--elevation-large)",
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
              setFilterOpen(true);
              setFacet(null);
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

        {/* Panneau de filtres en drill-down (dans le cadre). */}
        <div
          role="dialog"
          aria-label="Filtres"
          aria-hidden={!filterOpen}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 25,
            background: "var(--background-surface-elevation-overlay-default)",
            display: "flex",
            flexDirection: "column",
            transform: filterOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 220ms ease",
            visibility: filterOpen ? "visible" : "hidden",
          }}
        >
          {detailDef === null ? (
            <>
              <div style={headerStyle}>
                <Button appearance="subtle" iconBefore="Close" aria-label="Fermer" onPress={closeFilter} />
                <strong style={{ flex: 1, fontSize: 18 }}>Filtres</strong>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <List isBordered aria-label="Facettes">
                  {FACET_DEFS.map((d) => {
                    const c = facetCount(f, d.key);
                    const val = facetValue(d);
                    return (
                      <ListItemButton key={d.key} onPress={() => setFacet(d.key)}>
                        <ListItemText primary={d.label} />
                        <ListItemTrailing>
                          {val ? (
                            <span style={{ color: "var(--text-subtlest)", fontSize: 14 }}>{val}</span>
                          ) : c > 0 ? (
                            <Badge label={String(c)} appearance="information" importance="high" />
                          ) : null}
                          <Icon icon="ChevronRight" color="subtlest" />
                        </ListItemTrailing>
                      </ListItemButton>
                    );
                  })}
                </List>
              </div>
            </>
          ) : (
            <>
              <div style={headerStyle}>
                <Button appearance="subtle" iconBefore="ChevronLeft" aria-label="Retour" onPress={() => setFacet(null)} />
                <strong style={{ flex: 1, fontSize: 18 }}>{detailDef.label}</strong>
                <Button appearance="subtle" iconBefore="Close" aria-label="Fermer" onPress={closeFilter} />
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "var(--space200)" }}>{optionControls(detailDef)}</div>
            </>
          )}

          {/* Pied : réinitialiser + voir les résultats. */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space100)", padding: "var(--space150) var(--space200) var(--space200)", borderTop: "1px solid var(--border-subtle)" }}>
            <Button appearance="link" onPress={clearAll} isDisabled={total === 0}>
              Réinitialiser
            </Button>
            <div style={{ flex: 1 }} />
            <Button appearance="contained" onPress={closeFilter}>
              Voir {results.length} agent{results.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta + stories

const meta = {
  title: "Recipes/Filtres option B",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Recette « Filtres — option B » (maquette Claude Design). Panneau unique : " +
          "desktop = recherche + bouton Filtres (popover à deux volets), recherches " +
          "enregistrées en action à droite, tags actifs regroupés par catégorie (+N) et " +
          "tableau ; mobile = liste d'agents + panneau de filtres en drill-down (liste des " +
          "facettes → détail). Comptes vivants, mini-recherche transversale, recherches " +
          "enregistrées. 100 % composants + tokens du design system.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const OptionB: Story = {
  name: "Desktop",
  render: () => <FiltresOptionB />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rowCount = () => canvasElement.querySelectorAll("tbody tr").length;

    await step("état initial : panneau fermé, tableau filtré", async () => {
      const filtresBtn = canvas.getByRole("button", { name: /Filtres/ });
      await expect(filtresBtn).toHaveAttribute("aria-expanded", "false");
      await expect(rowCount()).toBeGreaterThan(0);
      await expect(rowCount()).toBeLessThan(AGENTS.length);
    });

    await step("ouvrir le panneau à deux volets", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
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
      await waitFor(() => expect(canvas.getByRole("button", { name: /Filtres/ })).toHaveAttribute("aria-expanded", "false"));
    });
  },
};

export const Mobile: Story = {
  render: () => <FiltresOptionBMobile />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ouvrir le panneau de filtres", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
      await waitFor(() => expect(canvas.getByRole("dialog", { name: "Filtres" })).toBeVisible());
    });

    await step("drill-down dans une facette puis retour", async () => {
      const panel = within(canvas.getByRole("dialog", { name: "Filtres" }));
      await userEvent.click(panel.getByRole("button", { name: /Langues/ }));
      await waitFor(() => expect(panel.getByRole("checkbox", { name: "Français" })).toBeInTheDocument());
      await userEvent.click(panel.getByRole("button", { name: "Retour" }));
      await waitFor(() => expect(panel.getByRole("button", { name: /Langues/ })).toBeInTheDocument());
    });

    await step("« Voir N agents » ferme le panneau", async () => {
      const panel = within(canvas.getByRole("dialog", { name: "Filtres" }));
      await userEvent.click(panel.getByRole("button", { name: /Voir \d+ agent/ }));
      await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Filtres" })).toBeNull());
    });
  },
};
