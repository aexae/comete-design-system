// Helper de story partagé — recette « Filtres option B ». PAS un export du DS
// (rien dans src/components/, rien dans l'index public) : données, logique et
// composants d'UI réutilisés par la story `FiltresOptionB` ET la story
// `Layout/Page/Toolbar`, pour une popup STRICTEMENT identique dans les deux.
//
// Zéro CSS local ici : les deux seules classes non-inlinables (scrollbar fine,
// override d'état d'un Button texte) sont fournies par le consommateur via
// `scrollClassName` / `textActionClassName` — elles vivent dans le module CSS
// des stories, pas dans ce helper (critère D11).
import { useRef, useState, type ReactElement } from "react";
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
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuSection,
  MenuItem,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  DatePicker,
  TimePicker,
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

/** Rôle courant de l'utilisateur (pilote la visibilité déclarative des facettes). */
export type Role = "manager" | "partenaire" | "client";

export interface FacetDef {
  key: string;
  label: string;
  kind: FacetKind;
  /**
   * Rôles qui voient cette facette. Absent = tous les rôles. La visibilité par
   * rôle est ainsi **déclarative sur la facette** : le composant d'affichage
   * filtre `FACET_DEFS` sur ce champ, sans jamais tester `isPartner` /
   * `isManager` en dur (critère du recensement — le masquage vivait surtout
   * dans les filtres).
   */
  roles?: Role[];
}

export const FACET_DEFS: FacetDef[] = [
  { key: "societe", label: "Société / Agence", kind: "multi" },
  { key: "secteur", label: "Secteurs", kind: "multi" },
  { key: "habilitation", label: "Habilitations", kind: "multi" },
  { key: "formalite", label: "Formalités", kind: "multi" },
  { key: "equipement", label: "Équipements", kind: "multi" },
  { key: "diplome", label: "Diplômes", kind: "multi" },
  // Emplois : masqué au partenaire (sous-traitance) — réservé manager + client.
  { key: "emploi", label: "Emplois", kind: "multi", roles: ["manager", "client"] },
  { key: "langue", label: "Langues", kind: "multi" },
  // Périmètre et contrats (sous-traitants / CDI) : décision interne → manager seul.
  { key: "perimetre", label: "Périmètre et contrats", kind: "switches", roles: ["manager"] },
  { key: "dispo", label: "Disponibilités", kind: "dispo" },
];

/** Facettes visibles pour un rôle (source déclarative, sans littéral de rôle). */
export const facetsForRole = (role?: Role): FacetDef[] =>
  role == null ? FACET_DEFS : FACET_DEFS.filter((d) => !d.roles || d.roles.includes(role));

export const MULTI_KEYS = [
  "societe",
  "secteur",
  "habilitation",
  "formalite",
  "equipement",
  "diplome",
  "emploi",
  "langue",
] as const;
export type MultiKey = (typeof MULTI_KEYS)[number];

export interface Agent {
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

export const AGENTS: Agent[] = (
  [
    ["DUPONT Marie", "Comète Sécurité", "Événementiel", "SST", "Complètes", "Radio", "CQP APS", "Agent de sécurité", "Français", "CDI", false, "planifies"],
    ["MARTIN Bob", "Comète Sécurité", "Industrie", "H0B0", "Pièce manquante", "Véhicule", "SSIAP 1", "Agent SSIAP", "Français", "CDI", false, "non"],
    ["CHEN Alice", "Comète Sécurité", "Événementiel", "SST", "Complètes", "Radio", "SSIAP 2", "Chef de poste", "Anglais", "CDI", false, "disponibles"],
    ["CLAIRE Sophie", "Agence Lyon", "Centres commerciaux", "Palpation", "Complètes", "Chien", "CQP APS", "Agent cynophile", "Français", "Vacataire", false, "disponibles"],
    ["BARDET Romain", "Sous-traitant Vigilis", "Logistique / Entrepôts", "SST", "Pièce manquante", "Radio", "CQP APS", "Agent de sécurité", "Espagnol", "CDD", true, "planifies"],
    ["BENOIT Armand", "Agence Lyon", "Tertiaire / Bureaux", "H0B0", "Complètes", "Véhicule", "SSIAP 1", "Agent SSIAP", "Français", "CDI", false, "planifies"],
    ["BERNARD Alex", "Comète Sécurité", "Industrie", "SST", "Complètes", "Radio", "CQP APS", "Agent de sécurité", "Anglais", "Vacataire", false, "non"],
    ["ORSAL Guillaume", "Agence Lyon", "Événementiel", "SST", "Complètes", "Véhicule", "SSIAP 2", "Chef de poste", "Français", "CDI", false, "disponibles"],
    ["COCHARD Cédric", "Sous-traitant Vigilis", "Transports", "Palpation", "Pièce manquante", "Radio", "CQP APS", "Agent de sécurité", "Portugais", "CDD", true, "non"],
    ["ARMAND Fred", "Comète Sécurité", "Centres commerciaux", "Palpation", "Complètes", "Chien", "CQP APS", "Agent cynophile", "Français", "CDI", false, "planifies"],
    ["BELLANGER Georgie", "Agence Lyon", "Grande distribution", "SST", "Complètes", "Radio", "SSIAP 1", "Agent SSIAP", "Anglais", "Vacataire", false, "disponibles"],
    ["ANAIS Alfred", "Comète Sécurité", "Hôpitaux / Santé", "H0B0", "Complètes", "Véhicule", "SSIAP 2", "Chef de poste", "Français", "CDI", false, "planifies"],
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

export const DISPO_MODES = [
  { id: "tous", label: "Tous" },
  { id: "planifies", label: "Planifiés en août 2026" },
  { id: "non", label: "Non planifiés en août 2026" },
  { id: "disponibles", label: "Disponibles" },
] as const;

export const DISPO_TAG: Record<Agent["dispo"], { label: string; color: TagStatusColor }> = {
  planifies: { label: "Planifié", color: "information" },
  non: { label: "Non planifié", color: "warning" },
  disponibles: { label: "Disponible", color: "success" },
};

// -----------------------------------------------------------------------
// État de filtre + logique (comptes vivants).

export interface Filters {
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

export function emptyFilters(): Filters {
  const f = { sousTraitants: false, cdiOnly: false, dispoMode: "tous", nameQuery: "" } as Filters;
  MULTI_KEYS.forEach((k) => {
    f[k] = [];
  });
  return f;
}

// Sélection initiale de la maquette (pour montrer tags + comptes d'emblée).
export function initialFilters(): Filters {
  return {
    ...emptyFilters(),
    societe: ["Comète Sécurité", "Agence Lyon"],
    secteur: ["Événementiel", "Industrie"],
    habilitation: ["SST"],
    formalite: ["Complètes"],
    equipement: ["Radio", "Véhicule"],
    diplome: ["SSIAP 2"],
    cdiOnly: true,
  };
}

export function match(a: Agent, f: Filters): boolean {
  if (!f.sousTraitants && a.sousTraitant) return false;
  if (f.cdiOnly && a.contrat !== "CDI") return false;
  if (f.dispoMode !== "tous" && a.dispo !== f.dispoMode) return false;
  if (f.nameQuery && !a.nom.toLowerCase().includes(f.nameQuery.toLowerCase())) return false;
  return MULTI_KEYS.every((k) => !f[k].length || f[k].includes(a[k]));
}

export const filteredAgents = (f: Filters): Agent[] => AGENTS.filter((a) => match(a, f));

// Match en ignorant une facette (comptes qui ne s'effondrent pas quand on
// coche plusieurs valeurs de la même facette).
function matchExcept(a: Agent, f: Filters, skip: MultiKey): boolean {
  if (!f.sousTraitants && a.sousTraitant) return false;
  if (f.cdiOnly && a.contrat !== "CDI") return false;
  if (f.dispoMode !== "tous" && a.dispo !== f.dispoMode) return false;
  return MULTI_KEYS.every((k) => k === skip || !f[k].length || f[k].includes(a[k]));
}

export const optionCount = (f: Filters, key: MultiKey, value: string): number =>
  AGENTS.filter((a) => a[key] === value && matchExcept(a, f, key)).length;

// Secteurs d'activité — liste longue (bien au-delà des valeurs réellement
// portées par les agents) : elle justifie une barre de recherche dans la
// catégorie « Secteurs » sur mobile. Les secteurs sans agent correspondant
// ressortent à 0 (option désactivée), comme n'importe quelle option morte.
const SECTEURS = [
  "Aéroportuaire",
  "Banque / Finance",
  "BTP / Chantiers",
  "Centres commerciaux",
  "Data centers",
  "Distribution / Retail",
  "Événementiel",
  "Grande distribution",
  "Hôpitaux / Santé",
  "Industrie",
  "Logistique / Entrepôts",
  "Luxe / Boutiques",
  "Musées / Culture",
  "Nucléaire",
  "Portuaire",
  "Tertiaire / Bureaux",
  "Transports",
  "Universités / Écoles",
];

export const DOMAINS = MULTI_KEYS.reduce(
  (acc, key) => {
    acc[key] = key === "secteur"
      ? SECTEURS
      : [...new Set(AGENTS.map((a) => a[key]))].sort((x, y) => x.localeCompare(y, "fr"));
    return acc;
  },
  {} as Record<MultiKey, string[]>,
);

export function facetCount(f: Filters, key: string): number {
  if (key === "perimetre") return (f.sousTraitants ? 1 : 0) + (f.cdiOnly ? 1 : 0);
  if (key === "dispo") return f.dispoMode === "tous" ? 0 : 1;
  return (f[key as MultiKey] ?? []).length;
}

export const totalActive = (f: Filters): number =>
  FACET_DEFS.reduce((n, d) => n + facetCount(f, d.key), 0);

interface ActiveGroup {
  key: string;
  facet: string;
  values: string;
  count: number;
  clear: () => void;
}

export interface SavedView {
  id: string;
  name: string;
  filters: Filters;
}

// Groupes de valeurs actives (sert aux tags des filtres appliqués).
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

// Deux jeux de filtres identiques ? (sert à marquer une recherche déjà
// enregistrée — icône bookmark pleine.)
export function sameFilters(a: Filters, b: Filters): boolean {
  if (a.cdiOnly !== b.cdiOnly || a.sousTraitants !== b.sousTraitants || a.dispoMode !== b.dispoMode) return false;
  return MULTI_KEYS.every((k) => {
    const x = [...a[k]].sort();
    const y = [...b[k]].sort();
    return x.length === y.length && x.every((v, i) => v === y[i]);
  });
}

export const INITIAL_VIEWS: SavedView[] = [
  { id: "v-seed-1", name: "SSIAP 2 disponibles", filters: { ...emptyFilters(), diplome: ["SSIAP 2"], dispoMode: "disponibles" } },
  { id: "v-seed-2", name: "Cynophiles secteur Nord et Est", filters: { ...emptyFilters(), secteur: ["Nord", "Est"], emploi: ["Agent cynophile"] } },
  { id: "v-seed-3", name: "Formalités incomplètes", filters: { ...emptyFilters(), formalite: ["Pièce manquante"] } },
];

export const initialsOf = (nom: string): string =>
  nom
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

// -----------------------------------------------------------------------
// Contrôles d'options d'une facette (volet droit du popover / de la feuille).

function OptionControls({ def, filters, onChange }: { def: FacetDef; filters: Filters; onChange: (f: Filters) => void }): ReactElement {
  const patch = (p: Partial<Filters>) => onChange({ ...filters, ...p });
  const toggleMulti = (key: MultiKey, value: string) => {
    const has = filters[key].includes(value);
    onChange({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] });
  };
  if (def.kind === "switches") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
        <Switch isChecked={filters.sousTraitants} onChange={(v) => patch({ sousTraitants: v })}>
          Inclure les sous-traitants
        </Switch>
        <Switch isChecked={filters.cdiOnly} onChange={(v) => patch({ cdiOnly: v })}>
          CDI uniquement
        </Switch>
      </div>
    );
  }
  if (def.kind === "dispo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
        <RadioGroup aria-label="Disponibilités" value={filters.dispoMode} onChange={(v) => patch({ dispoMode: v })}>
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
        const n = optionCount(filters, key, value);
        const checked = filters[key].includes(value);
        return (
          <div key={value} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
            <Checkbox isChecked={checked} isDisabled={n === 0 && !checked} onChange={() => toggleMulti(key, value)} label={value} />
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------
// FiltresPanel — bouton « Filtres » + popover à deux volets (desktop). C'EST la
// popup partagée. `scrollClassName` / `textActionClassName` viennent du CSS de
// la story (scrollbar fine + bouton texte sans soulignement).

export function FiltresPanel({
  filters,
  onChange,
  views,
  onSaveView,
  role,
  scrollClassName,
  textActionClassName,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  views: SavedView[];
  onSaveView: (name: string) => void;
  /** Rôle courant : filtre les facettes visibles (déclaratif). Absent = toutes. */
  role?: Role;
  scrollClassName?: string;
  textActionClassName?: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string>("societe");
  const [query, setQuery] = useState("");
  const [savingName, setSavingName] = useState<string | null>(null);

  const toggleMulti = (key: MultiKey, value: string) => {
    const has = filters[key].includes(value);
    onChange({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] });
  };
  const clearAll = () => onChange(emptyFilters());

  // Visibilité par rôle, DÉCLARATIVE : on filtre `FACET_DEFS` sur le champ
  // `roles` de chaque facette — aucun test de rôle codé en dur ici.
  const visibleFacets = facetsForRole(role);
  const visibleMultiKeys = MULTI_KEYS.filter((k) => visibleFacets.some((d) => d.key === k));

  const total = totalActive(filters);
  const isCurrentSaved = total > 0 && views.some((v) => sameFilters(v.filters, filters));
  const curDef = visibleFacets.find((d) => d.key === cat) ?? visibleFacets[0];
  const q = query.trim().toLowerCase();
  const searchHits = q
    ? visibleMultiKeys.flatMap((k) =>
        DOMAINS[k].filter((v) => v.toLowerCase().includes(q)).map((v) => ({ key: k, value: v })),
      )
    : [];
  const saveView = () => {
    const name = (savingName ?? "").trim();
    if (!name) return;
    onSaveView(name);
    setSavingName(null);
  };

  return (
    <Popup
      isOpen={open}
      onOpenChange={setOpen}
      placement="bottom-left"
      style={{ width: 720, maxWidth: "calc(100vw - 32px)" }}
      trigger={
        <Button
          appearance="outlined"
          iconBefore="Tune"
          aria-label={total > 0 ? `Filtres, ${total} critère${total > 1 ? "s" : ""} actif${total > 1 ? "s" : ""}` : "Filtres"}
        >
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
            className={scrollClassName}
            style={{
              flex: "none",
              width: 232,
              margin: 0,
              padding: "var(--space100)",
              listStyle: "none",
              overflowY: "auto",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            {visibleFacets.map((d) => {
              const c = facetCount(filters, d.key);
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
                    {c > 0 && <Badge label={String(c)} appearance="information" importance="high" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Volet droit : options de la facette courante, ou résultats de recherche. */}
          <div className={scrollClassName} style={{ flex: 1, overflowY: "auto", padding: "var(--space200)" }}>
            {q ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
                <p style={{ margin: "0 0 var(--space100)", fontSize: 12, color: "var(--text-subtlest)" }}>
                  {searchHits.length} résultat{searchHits.length > 1 ? "s" : ""} pour « {query.trim()} »
                </p>
                {searchHits.map(({ key, value }) => {
                  const n = optionCount(filters, key, value);
                  const facetLabel = FACET_DEFS.find((d) => d.key === key)!.label;
                  return (
                    <div key={`${key}:${value}`} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
                      <Checkbox isChecked={filters[key].includes(value)} isDisabled={n === 0 && !filters[key].includes(value)} onChange={() => toggleMulti(key, value)} label={value} />
                      <span style={{ fontSize: 11.5, color: "var(--text-subtlest)" }}>{facetLabel}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <OptionControls def={curDef} filters={filters} onChange={onChange} />
            )}
          </div>
        </div>

        {/* Pied : enregistrer / compteur / réinitialiser. */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space150)", padding: "var(--space150) var(--space200)", borderTop: "1px solid var(--border-subtle)" }}>
          {savingName === null ? (
            <>
              {isCurrentSaved ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space075)", padding: "0 var(--space075)", fontSize: 13.5, fontWeight: 600, color: "var(--text-default)" }}>
                  <Icon icon="Bookmark" appearance="filled" size={18} />
                  Filtres enregistrés
                </span>
              ) : (
                <Button appearance="link" className={textActionClassName} onPress={() => setSavingName("")} isDisabled={total === 0}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space075)" }}>
                    <Icon icon="Bookmark" size={18} />
                    Enregistrer ces filtres
                  </span>
                </Button>
              )}
              <div style={{ flex: 1 }} />
              <Button appearance="subtle" onPress={clearAll} isDisabled={total === 0}>
                Réinitialiser
              </Button>
              <Button appearance="contained" color="comete" onPress={() => setOpen(false)}>
                Voir les résultats
              </Button>
            </>
          ) : (
            <>
              <div style={{ flex: 1, maxWidth: 260 }}>
                <TextField aria-label="Nom de l'enregistrement" placeholder="Nom de l'enregistrement" value={savingName} onChange={setSavingName} />
              </div>
              <Button appearance="contained" color="comete" onPress={saveView} isDisabled={!savingName.trim()}>
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
  );
}

// -----------------------------------------------------------------------
// SavedSearchesMenu — « Filtres enregistrés » (action à droite de la barre).

export function SavedSearchesMenu({
  views,
  onApply,
  onDelete,
}: {
  views: SavedView[];
  onApply: (v: SavedView) => void;
  onDelete: (id: string) => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <MenuTrigger isOpen={open} onOpenChange={setOpen}>
      <Button appearance="outlined" iconAfter="KeyboardArrowDown">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space075)" }}>
          <Icon icon="Bookmark" size={18} />
          Filtres enregistrés
        </span>
      </Button>
      <MenuPopover width={320}>
        <Menu
          aria-label="Filtres enregistrés"
          onAction={(key) => {
            const v = views.find((x) => x.id === key);
            if (v) onApply(v);
          }}
        >
          <MenuSection title="Filtres enregistrés">
            {views.length === 0 ? (
              <MenuItem id="__empty" isDisabled>
                Aucun filtre enregistré
              </MenuItem>
            ) : (
              views.map((v) => {
                const n = totalActive(v.filters);
                return (
                  <MenuItem
                    key={v.id}
                    id={v.id}
                    description={`${n} filtre${n > 1 ? "s" : ""} appliqué${n > 1 ? "s" : ""}`}
                    elemAfter={
                      <Button appearance="subtle" iconBefore="Close" aria-label={`Supprimer ${v.name}`} onPress={() => onDelete(v.id)} />
                    }
                  >
                    {v.name}
                  </MenuItem>
                );
              })
            )}
          </MenuSection>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

// -----------------------------------------------------------------------
// ActiveFilterTags — tags des filtres actifs, groupés par catégorie, sous la
// barre. `textActionClassName` = « Réinitialiser » (bouton texte discret).

export function ActiveFilterTags({
  filters,
  onChange,
  textActionClassName,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  textActionClassName?: string;
}): ReactElement | null {
  const [chipsExpanded, setChipsExpanded] = useState(false);
  const setFacet = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const clearAll = () => onChange(emptyFilters());
  const total = totalActive(filters);

  const groups: ActiveGroup[] = groupsOf(filters).map((g) => ({
    ...g,
    clear: () => {
      if (g.key === "cdi") setFacet({ cdiOnly: false });
      else if (g.key === "st") setFacet({ sousTraitants: false });
      else if (g.key === "dispo") setFacet({ dispoMode: "tous" });
      else setFacet({ [g.key]: [] });
    },
  }));

  const MAX_CHIPS = 4;
  const visibleGroups = chipsExpanded ? groups : groups.slice(0, MAX_CHIPS);
  const hiddenCount = groups.length - visibleGroups.length;

  const renderChip = (g: ActiveGroup): ReactElement => {
    // 1 valeur → la valeur ; ≥ 2 → seulement le nombre (« Facette : 2 »).
    const shown = g.count === 1 ? g.values.split(", ")[0] : String(g.count);
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
        <span>{shown}</span>
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

  if (total === 0) return null;
  return (
    <div
      role="group"
      aria-label="Filtres actifs"
      style={{ display: "flex", alignItems: "center", gap: "var(--space075)", minHeight: 40, flexWrap: "wrap" }}
    >
      <span style={{ flex: "none", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-subtlest)" }}>Filtres</span>
      {visibleGroups.map(renderChip)}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setChipsExpanded(true)}
          aria-label={`Afficher ${hiddenCount} filtre${hiddenCount > 1 ? "s" : ""} de plus`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 28,
            padding: "0 var(--space150)",
            borderRadius: "var(--radius-round)",
            border: 0,
            background: "var(--background-brand-subtlest-default)",
            color: "var(--text-brand)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          +{hiddenCount}
        </button>
      )}
      <Button appearance="link" className={textActionClassName} onPress={clearAll}>
        Réinitialiser
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------
// ResultsTable — tableau des agents filtrés.

export function ResultsTable({ filters }: { filters: Filters }): ReactElement {
  const results = filteredAgents(filters);
  return (
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
          <Button appearance="outlined" onPress={() => undefined}>
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
  );
}

// Ref util partagé (compteur de vues sauvegardées) — pratique pour les
// consommateurs qui gèrent l'état `views`.
export function useSavedViews(initial: SavedView[] = INITIAL_VIEWS) {
  const [views, setViews] = useState<SavedView[]>(initial);
  const seq = useRef(0);
  const save = (name: string, filters: Filters) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    seq.current += 1;
    setViews((vs) => [...vs, { id: `v-${seq.current}`, name: trimmed, filters }]);
  };
  const remove = (id: string) => setViews((vs) => vs.filter((v) => v.id !== id));
  return { views, setViews, save, remove };
}
