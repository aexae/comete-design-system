// Recette « Filtres — option B » (portée depuis la maquette Claude Design
// « Affichage du rail de filtre » / Filtres option B). Panneau unique de
// filtres : desktop = recherche + bouton Filtres (badge) ouvrant un popover à
// deux volets ; tags actifs groupés par catégorie sous la toolbar ; tableau de
// résultats. Mobile = bouton Filtres + feuille (bottom sheet) en accordéon.
//
// Transposée sur les composants + tokens du repo (les tokens de la maquette,
// @naxit, sont mappés vers @aexae). La logique de filtre (comptes vivants,
// mini-recherche, vues enregistrées) vient du DCLogic de la maquette.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { within, expect } from "storybook/test";
import {
  Button,
  Badge,
  Tag,
  type TagStatusColor,
  TextField,
  Icon,
  Popup,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
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
  date: string;
  from: string;
  to: string;
}

function emptyFilters(): Filters {
  const f = {
    sousTraitants: false,
    cdiOnly: false,
    dispoMode: "tous",
    date: "2026-08-20",
    from: "18:00",
    to: "23:00",
  } as Filters;
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
  return MULTI_KEYS.every((k) => !f[k].length || f[k].includes(a[k]));
}

const filteredAgents = (f: Filters): Agent[] => AGENTS.filter((a) => match(a, f));

function facetCount(f: Filters, key: string): number {
  if (key === "perimetre") return (f.sousTraitants ? 1 : 0) + (f.cdiOnly ? 1 : 0);
  if (key === "dispo") return f.dispoMode === "tous" ? 0 : 1;
  return (f[key as MultiKey] ?? []).length;
}

const totalActive = (f: Filters): number =>
  FACET_DEFS.reduce((n, d) => n + facetCount(f, d.key), 0);

// Domaine (valeurs distinctes) de chaque facette multi, trié FR.
const DOMAINS = MULTI_KEYS.reduce(
  (acc, key) => {
    acc[key] = [...new Set(AGENTS.map((a) => a[key]))].sort((x, y) => x.localeCompare(y, "fr"));
    return acc;
  },
  {} as Record<MultiKey, string[]>,
);

// Match en ignorant une facette (pour des comptes qui ne s'effondrent pas
// quand on coche plusieurs valeurs de la même facette).
function matchExcept(a: Agent, f: Filters, skip: MultiKey): boolean {
  if (!f.sousTraitants && a.sousTraitant) return false;
  if (f.cdiOnly && a.contrat !== "CDI") return false;
  if (f.dispoMode !== "tous" && a.dispo !== f.dispoMode) return false;
  return MULTI_KEYS.every((k) => k === skip || !f[k].length || f[k].includes(a[k]));
}

// Compte vivant : nombre d'agents que cocher cette valeur ramènerait.
const optionCount = (f: Filters, key: MultiKey, value: string): number =>
  AGENTS.filter((a) => a[key] === value && matchExcept(a, f, key)).length;

interface ActiveGroup {
  key: string;
  facet: string;
  values: string;
  count: number;
  clear: () => void;
}

const dateInputStyle: CSSProperties = {
  height: 36,
  padding: "0 var(--space100)",
  borderRadius: "var(--radius075)",
  border: "1px solid var(--border-default)",
  background: "var(--background-surface-default)",
  color: "var(--text-default)",
  fontFamily: "inherit",
  fontSize: 13,
};

// -----------------------------------------------------------------------
// Recette

function FiltresOptionB(): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cat, setCat] = useState<string>("societe");
  const [query, setQuery] = useState("");

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
        DOMAINS[k]
          .filter((v) => v.toLowerCase().includes(q))
          .map((v) => ({ key: k, value: v })),
      )
    : [];

  const groups: ActiveGroup[] = useMemo(() => {
    const out: ActiveGroup[] = [];
    MULTI_KEYS.forEach((k) => {
      if (!f[k].length) return;
      const d = FACET_DEFS.find((x) => x.key === k)!;
      out.push({ key: k, facet: d.label, values: f[k].join(", "), count: f[k].length, clear: () => setFacet({ [k]: [] }) });
    });
    if (f.cdiOnly) out.push({ key: "cdi", facet: "Contrat", values: "CDI uniquement", count: 1, clear: () => setFacet({ cdiOnly: false }) });
    if (f.sousTraitants) out.push({ key: "st", facet: "Périmètre", values: "Sous-traitants inclus", count: 1, clear: () => setFacet({ sousTraitants: false }) });
    if (f.dispoMode !== "tous") {
      const m = DISPO_MODES.find((x) => x.id === f.dispoMode)!;
      out.push({ key: "dispo", facet: "Disponibilité", values: m.label, count: 1, clear: () => setFacet({ dispoMode: "tous" }) });
    }
    return out;
  }, [f]);

  const clearAll = () => setF(emptyFilters());

  // Chips actifs : on en montre quelques-uns puis « +N » (popover).
  const MAX_CHIPS = 4;
  const visibleGroups = groups.slice(0, MAX_CHIPS);
  const overflowGroups = groups.slice(MAX_CHIPS);

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
          style={{
            display: "inline-flex",
            padding: 4,
            border: 0,
            background: "none",
            borderRadius: "var(--radius-round)",
            cursor: "pointer",
            color: "inherit",
            opacity: 0.7,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
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
      {/* Toolbar une ligne : recherche + Filtres (badge) + compteur. */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
        <div style={{ width: 260, flex: "none" }}>
          <TextField
            aria-label="Rechercher un agent"
            placeholder="Rechercher un agent"
            elemBefore={<Icon icon="Search" size={18} color="subtle" />}
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
              {total > 0 && (
                <Badge label={String(total)} appearance="information" importance="high" />
              )}
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Mini-recherche transversale (toutes facettes). */}
            <div style={{ padding: "var(--space200) var(--space200) var(--space150)" }}>
              <TextField
                aria-label="Rechercher dans les filtres"
                placeholder="Rechercher un critère (société, secteur, diplôme…)"
                value={query}
                onChange={setQuery}
                elemBefore={<Icon icon="Search" size={18} color="subtle" />}
              />
            </div>

            {/* Deux volets : facettes (gauche) / options (droite). */}
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
                        {c > 0 && (
                          <Badge label={String(c)} appearance={active ? "information" : "neutral"} importance="high" />
                        )}
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
                        <label
                          key={`${key}:${value}`}
                          style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}
                        >
                          <Checkbox
                            isChecked={f[key].includes(value)}
                            isDisabled={n === 0 && !f[key].includes(value)}
                            onChange={() => toggleMulti(key, value)}
                            label={value}
                          />
                          <span style={{ fontSize: 11.5, color: "var(--text-subtlest)" }}>{facetLabel}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>
                            {n}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : curDef.kind === "switches" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
                    <Switch isChecked={f.sousTraitants} onChange={(v) => setFacet({ sousTraitants: v })}>
                      Inclure les sous-traitants
                    </Switch>
                    <Switch isChecked={f.cdiOnly} onChange={(v) => setFacet({ cdiOnly: v })}>
                      CDI uniquement
                    </Switch>
                  </div>
                ) : curDef.kind === "dispo" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
                    <RadioGroup
                      aria-label="Disponibilités"
                      value={f.dispoMode}
                      onChange={(v) => setFacet({ dispoMode: v })}
                    >
                      {DISPO_MODES.map((m) => (
                        <Radio key={m.id} value={m.id} label={m.label} />
                      ))}
                    </RadioGroup>
                    <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", gap: "var(--space150)", flexWrap: "wrap" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-subtle)" }}>
                        Date
                        <input
                          type="date"
                          value={f.date}
                          onChange={(e) => setFacet({ date: e.target.value })}
                          style={dateInputStyle}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-subtle)" }}>
                        De
                        <input
                          type="time"
                          value={f.from}
                          onChange={(e) => setFacet({ from: e.target.value })}
                          style={dateInputStyle}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-subtle)" }}>
                        À
                        <input
                          type="time"
                          value={f.to}
                          onChange={(e) => setFacet({ to: e.target.value })}
                          style={dateInputStyle}
                        />
                      </label>
                    </fieldset>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
                    {DOMAINS[cat as MultiKey].map((value) => {
                      const n = optionCount(f, cat as MultiKey, value);
                      const checked = f[cat as MultiKey].includes(value);
                      return (
                        <label
                          key={value}
                          style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}
                        >
                          <Checkbox
                            isChecked={checked}
                            isDisabled={n === 0 && !checked}
                            onChange={() => toggleMulti(cat as MultiKey, value)}
                            label={value}
                          />
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>
                            {n}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pied : compteur + réinitialiser. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space150)",
                padding: "var(--space150) var(--space200)",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>
                {results.length} agent{results.length > 1 ? "s" : ""}
              </span>
              <div style={{ flex: 1 }} />
              <Button appearance="subtle" onPress={clearAll} isDisabled={total === 0}>
                Réinitialiser
              </Button>
              <Button appearance="contained" onPress={() => setPanelOpen(false)}>
                Voir les résultats
              </Button>
            </div>
          </div>
        </Popup>
        <div style={{ flex: 1 }} />
        <span
          style={{
            flex: "none",
            fontSize: 13,
            color: "var(--text-subtle)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {results.length} {results.length > 1 ? "agents" : "agent"} sur {AGENTS.length}
        </span>
      </div>

      {/* Tags des filtres actifs, regroupés par catégorie. */}
      {total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space075)",
            minHeight: 40,
            flexWrap: "wrap",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "var(--space100)",
          }}
        >
          <span
            style={{
              flex: "none",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-subtlest)",
            }}
          >
            Filtres
          </span>
          {visibleGroups.map(renderChip)}
          {overflowGroups.length > 0 && (
            <Popup
              placement="bottom-left"
              trigger={
                <button
                  type="button"
                  aria-label={`Afficher ${overflowGroups.length} filtre${overflowGroups.length > 1 ? "s" : ""} de plus`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 28,
                    padding: "0 var(--space150)",
                    borderRadius: "var(--radius-round)",
                    border: "1px solid var(--border-default)",
                    background: "var(--background-surface-default)",
                    color: "var(--text-subtle)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  +{overflowGroups.length}
                </button>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)", padding: "var(--space150)", maxWidth: 320 }}>
                {overflowGroups.map(renderChip)}
              </div>
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
                <Tag
                  label={DISPO_TAG[a.dispo].label}
                  color={DISPO_TAG[a.dispo].color}
                  appearance="subtle"
                  shape="rounded"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta + story

const meta = {
  title: "Recipes/Filtres option B",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Recette « Filtres — option B » (maquette Claude Design). Panneau unique : " +
          "desktop = recherche + bouton Filtres (badge compteur) ouvrant un popover à deux " +
          "volets (facettes / options), tags actifs regroupés par catégorie sous la toolbar " +
          "(surplus sous « +N »), tableau de résultats ; mobile = bouton Filtres + feuille " +
          "en accordéon. Comptes vivants (option à 0 résultat désactivée), mini-recherche " +
          "transversale, recherches enregistrées.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const OptionB: Story = {
  name: "Desktop",
  render: () => <FiltresOptionB />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Le badge du bouton Filtres = total des critères actifs.
    const filtresBtn = canvas.getByRole("button", { name: /Filtres/ });
    await expect(filtresBtn).toHaveAttribute("aria-expanded", "false");
    // Les tags actifs sont présents (sélection initiale) et le tableau est filtré.
    await expect(canvas.getByText(/Société \/ Agence/)).toBeInTheDocument();
    const rows = canvasElement.querySelectorAll("tbody tr");
    await expect(rows.length).toBeGreaterThan(0);
    await expect(rows.length).toBeLessThan(AGENTS.length);
  },
};
