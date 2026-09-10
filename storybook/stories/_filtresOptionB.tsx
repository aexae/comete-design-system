// Helper de story partagé — recette « Filtres option B ». PAS un export du DS
// (rien dans src/components/, rien dans l'index public) : données, logique et
// composants d'UI réutilisés par la story `FiltresOptionB` ET la story
// `Layout/Page/Toolbar`, pour une popup STRICTEMENT identique dans les deux.
//
// Zéro CSS local ici : les deux seules classes non-inlinables (scrollbar fine,
// override d'état d'un Button texte) sont fournies par le consommateur via
// `scrollClassName` / `textActionClassName` — elles vivent dans le module CSS
// des stories, pas dans ce helper (critère D11).
import { useEffect, useRef, useState, type ReactElement } from "react";
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
  Divider,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  List,
  ListHead,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
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

// Sélection initiale de la maquette — pensée pour exposer les CAS DURS d'emblée :
// - `secteur` = 7 valeurs, la 1re étant le libellé TRÈS LONG → le tag prouve à
//   la fois la troncature (1re valeur) ET l'overflow multi (« +6 ») ;
// - `cdiOnly` (facette « Périmètre et contrats ») = réservée au manager :
//   bascule le rôle et ce critère disparaît des tags ET des résultats.
export function initialFilters(): Filters {
  return {
    ...emptyFilters(),
    societe: ["Comète Sécurité"],
    secteur: [
      "Zone industrialo-portuaire et plateformes logistiques multimodales du Grand Ouest",
      "Événementiel",
      "Industrie",
      "Portuaire",
      "Nucléaire",
      "Aéroportuaire",
      "Ferroviaire",
    ],
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

// Secteurs d'activité — CAS DUR « facette à ~60 options » : liste longue (bien
// au-delà des valeurs réellement portées par les agents) → le volet droit
// défile et la mini-recherche du popover devient indispensable pour retrouver
// une option. Les secteurs sans agent correspondant ressortent à 0 (option
// désactivée), comme n'importe quelle option morte. Inclut un libellé TRÈS LONG
// (cas dur « troncature du tag »).
const SECTEURS = [
  "Administrations publiques",
  "Aéroportuaire",
  "Agroalimentaire",
  "Ambassades / Consulats",
  "Assurances",
  "Automobile",
  "Banque / Finance",
  "Bijouterie / Joaillerie",
  "BTP / Chantiers",
  "Câbles et réseaux",
  "Centres commerciaux",
  "Centres de données",
  "Chimie / Pétrochimie",
  "Cinémas / Théâtres",
  "Cliniques privées",
  "Collectivités territoriales",
  "Concerts / Festivals",
  "Data centers",
  "Défense / Armement",
  "Distribution / Retail",
  "Édition / Presse",
  "Énergie / Utilities",
  "Enseignement supérieur",
  "Entrepôts frigorifiques",
  "Événementiel",
  "Ferroviaire",
  "Grande distribution",
  "Hôpitaux / Santé",
  "Hôtellerie / Restauration",
  "Immobilier / Property",
  "Industrie",
  "Industrie pharmaceutique",
  "Laboratoires de recherche",
  "Logistique / Entrepôts",
  "Luxe / Boutiques",
  "Maritime / Croisières",
  "Mines / Carrières",
  "Musées / Culture",
  "Nucléaire",
  "Parcs d'attractions",
  "Ports de plaisance",
  "Portuaire",
  "Sièges sociaux",
  "Sites classés Seveso",
  "Sites pétroliers et gaziers",
  "Stades / Arénas",
  "Stations d'épuration",
  "Télécommunications",
  "Tertiaire / Bureaux",
  "Transports",
  "Transports en commun urbains",
  "Universités / Écoles",
  "Zones commerciales",
  "Zones franches",
  "Zone industrialo-portuaire et plateformes logistiques multimodales du Grand Ouest",
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

/**
 * Filtres EFFECTIFS pour un rôle : les facettes que le rôle ne gère pas ne
 * sont **pas appliquées** — ni dans le popover, ni en tag, ni dans les
 * résultats. (On ne masque jamais un filtre appliqué : ce serait une liste
 * filtrée sans explication ni moyen de l'enlever.) `nameQuery` (la recherche)
 * n'est pas une facette et reste toujours actif.
 */
export function effectiveFilters(f: Filters, role?: Role): Filters {
  const visible = new Set(facetsForRole(role).map((d) => d.key));
  const out: Filters = { ...f };
  MULTI_KEYS.forEach((k) => {
    if (!visible.has(k)) out[k] = [];
  });
  if (!visible.has("perimetre")) {
    out.sousTraitants = false;
    out.cdiOnly = false;
  }
  if (!visible.has("dispo")) out.dispoMode = "tous";
  return out;
}

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
        {/* CAS DUR « plage de dates » : une plage Du → Au (deux DatePicker),
            plus une plage horaire début → fin. */}
        <div style={{ display: "flex", gap: "var(--space150)", flexWrap: "wrap", alignItems: "flex-end" }}>
          <DatePicker aria-label="Du (date de début)" defaultValue={parseDate("2026-08-20")} />
          <DatePicker aria-label="Au (date de fin)" defaultValue={parseDate("2026-08-27")} />
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
// Bascule popover ↔ feuille : le déclencheur `collapseLabel` du Button se réduit
// en icône seule sous `@container (max-width: 767px)`, en réagissant au conteneur
// ancêtre le plus proche (ex. la `Page`, qui déclare `container: … / inline-size`).
// On observe CE MÊME conteneur pour rendre, dès que le bouton devient une icône,
// une feuille (bottom sheet) au lieu du popover — comme la recette mobile. Sans
// conteneur ancêtre ou sans ResizeObserver (SSR, tests), on reste en popover.

function useTriggerCollapsed(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setCollapsed(false);
      return undefined;
    }
    const start = ref.current;
    if (!start || typeof ResizeObserver === "undefined" || typeof getComputedStyle === "undefined") {
      return undefined;
    }
    // Conteneur ancêtre le plus proche établissant un contexte de requête
    // conteneur (`container-type` ≠ `normal`) — celui que résout le `@container`
    // du Button. Aucun → le bouton ne se replie jamais → on reste en popover.
    let el: HTMLElement | null = start.parentElement;
    let container: HTMLElement | null = null;
    while (el) {
      const ct = getComputedStyle(el).containerType;
      if (ct && ct !== "normal") {
        container = el;
        break;
      }
      el = el.parentElement;
    }
    if (!container) {
      setCollapsed(false);
      return undefined;
    }
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      // Le Button se replie à `max-width: 767px` → largeur conteneur < 768.
      setCollapsed(width > 0 && width < 768);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [ref, enabled]);
  return collapsed;
}

// -----------------------------------------------------------------------
// FiltresPanel — bouton « Filtres » + panneau. Desktop (bouton large) : popover
// à deux volets. Compact (bouton réduit en icône seule) : feuille (bottom sheet)
// en drill-down, comme la recette mobile — MÊME source (`FiltresSheet`). C'EST la
// popup partagée. `scrollClassName` / `textActionClassName` viennent du CSS de
// la story (scrollbar fine + bouton texte sans soulignement).

export function FiltresPanel({
  filters,
  onChange,
  views,
  onSaveView,
  onDeleteView,
  role,
  collapseLabel,
  scrollClassName,
  textActionClassName,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  views: SavedView[];
  onSaveView: (name: string) => void;
  /** Supprimer un filtre enregistré (croix de la feuille compacte). Absent =
   *  pas de suppression proposée. Sans effet en popover (les vues y vivent
   *  dans l'action `SavedSearchesMenu` voisine). */
  onDeleteView?: (id: string) => void;
  /** Rôle courant : filtre les facettes visibles (déclaratif). Absent = toutes. */
  role?: Role;
  /** Replie le déclencheur en icône seule (carré) sous le breakpoint conteneur
   *  — pour les toolbars responsive. L'`aria-label` reste « Filtres ». Dès que
   *  le bouton est réduit en icône, le panneau s'ouvre en feuille (bottom sheet)
   *  au lieu du popover (comme la recette mobile). */
  collapseLabel?: boolean;
  scrollClassName?: string;
  textActionClassName?: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string>("societe");
  const [query, setQuery] = useState("");
  const [savingName, setSavingName] = useState<string | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  // Dès que le déclencheur `collapseLabel` se réduit en icône seule → feuille.
  const collapsed = useTriggerCollapsed(rootRef, !!collapseLabel);

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

  const label = total > 0 ? `Filtres, ${total} critère${total > 1 ? "s" : ""} actif${total > 1 ? "s" : ""}` : "Filtres";
  // `managed` = chemin feuille : c'est nous qui ouvrons (onPress) ; en popover
  // c'est le DialogTrigger de Popup qui gère le press.
  const triggerBtn = (managed: boolean): ReactElement => (
    <Button
      appearance="outlined"
      iconBefore="Tune"
      {...(collapseLabel ? { collapseLabel: true, shape: "square" as const } : {})}
      aria-label={label}
      {...(managed ? { onPress: () => setOpen(true), "aria-haspopup": "dialog" as const, "aria-expanded": open } : {})}
    >
      Filtres
      {total > 0 && <Badge label={String(total)} appearance="information" importance="high" />}
    </Button>
  );

  // Compact (icône seule) → feuille (bottom sheet), drill-down, comme le mobile.
  if (collapseLabel && collapsed) {
    return (
      <span ref={rootRef} style={{ display: "inline-flex" }}>
        {triggerBtn(true)}
        <FiltresSheet
          filters={filters}
          onChange={onChange}
          views={views}
          onSaveView={onSaveView}
          onApplyView={(v) => onChange(v.filters)}
          {...(onDeleteView ? { onDeleteView } : {})}
          role={role}
          isOpen={open}
          onOpenChange={setOpen}
          scrollClassName={scrollClassName}
          textActionClassName={textActionClassName}
        />
      </span>
    );
  }

  return (
    <span ref={rootRef} style={{ display: "inline-flex" }}>
    <Popup
      isOpen={open}
      onOpenChange={setOpen}
      placement="bottom-left"
      style={{ width: 720, maxWidth: "calc(100vw - 32px)", maxHeight: "min(calc(100vh - 24px), 520px)", overflow: "hidden" }}
      trigger={triggerBtn(false)}
    >
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: "none", padding: "var(--space200) var(--space200) var(--space150)" }}>
          <SearchField
            aria-label="Rechercher dans les filtres"
            placeholder="Rechercher un critère (société, secteur, diplôme…)"
            value={query}
            onChange={setQuery}
          />
        </div>
        {/* Les deux volets : hauteur RAISONNABLE et bornée (jamais tout le
            viewport). Le popover reste à la taille de son contenu ; le
            débordement (facette à ~60 options) défile DANS le volet droit, pas
            dans le popover. S'adapte vers le bas sur petit écran. */}
        <div style={{ display: "flex", height: "min(380px, calc(100vh - 220px))", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Volet gauche : liste des facettes. */}
          <ul
            aria-label="Facettes"
            className={scrollClassName}
            style={{
              flex: "none",
              width: 232,
              minHeight: 0,
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
          <div className={scrollClassName} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "var(--space200)" }}>
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
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "var(--space150)", padding: "var(--space150) var(--space200)", borderTop: "1px solid var(--border-subtle)" }}>
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
    </span>
  );
}

// -----------------------------------------------------------------------
// FiltresSheet — panneau de filtres en FEUILLE (bottom sheet), drill-down. C'EST
// la feuille partagée : la recette mobile ET FiltresPanel compact la rendent à
// l'identique (source unique). Ouverture contrôlée (`isOpen` / `onOpenChange`) ;
// le déclencheur est rendu par l'appelant. Zéro CSS local (D11) : seules la
// scrollbar fine (`scrollClassName`) et le bouton texte sans soulignement
// (`textActionClassName`) viennent du CSS de la story ; tout le reste est inline.

export function FiltresSheet({
  filters,
  onChange,
  views,
  onSaveView,
  onApplyView,
  onDeleteView,
  role,
  isOpen,
  onOpenChange,
  scrollClassName,
  textActionClassName,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  views: SavedView[];
  onSaveView: (name: string) => void;
  /** Appliquer un filtre enregistré. La feuille se ferme ensuite (choix fait). */
  onApplyView: (view: SavedView) => void;
  /** Supprimer un filtre enregistré. Absent = pas de croix de suppression. */
  onDeleteView?: (id: string) => void;
  /** Rôle courant : filtre les facettes visibles (déclaratif). Absent = toutes. */
  role?: Role;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scrollClassName?: string;
  textActionClassName?: string;
}): ReactElement {
  const [facet, setFacet] = useState<string | null>(null);
  const [showViews, setShowViews] = useState(false);
  const [savingName, setSavingName] = useState<string | null>(null);
  // Recherche locale dans une catégorie à liste longue (ex. « Secteurs »).
  const [optionQuery, setOptionQuery] = useState("");

  const visibleFacets = facetsForRole(role);
  const patch = (p: Partial<Filters>) => onChange({ ...filters, ...p });
  const toggleMulti = (key: MultiKey, value: string) => {
    const has = filters[key].includes(value);
    onChange({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] });
  };
  const clearAll = () => onChange(emptyFilters());

  const results = filteredAgents(filters);
  const total = totalActive(filters);
  // Filtre enregistré actuellement appliqué (si les filtres courants
  // correspondent à un enregistrement) : son nom s'affiche sur la ligne.
  const appliedView = total > 0 ? views.find((v) => sameFilters(v.filters, filters)) : undefined;
  const detailDef = facet ? (visibleFacets.find((d) => d.key === facet) ?? null) : null;

  const openFacet = (key: string) => {
    setOptionQuery("");
    setFacet(key);
  };
  const resetDrill = () => {
    setFacet(null);
    setShowViews(false);
    setSavingName(null);
    setOptionQuery("");
  };
  const applyView = (v: SavedView) => {
    onApplyView(v);
    resetDrill();
    onOpenChange(false);
  };
  const saveView = () => {
    const name = (savingName ?? "").trim();
    if (!name) return;
    onSaveView(name);
    setSavingName(null);
  };

  // En-tête de la feuille : le chevron retour occupe un emplacement réservé dans
  // les vues détail / recherches → le titre part de la même colonne partout.
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

  const optionControls = (def: FacetDef): ReactElement => {
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
          {/* CAS DUR « plage de dates » : une plage Du → Au (deux DatePicker),
              plus une plage horaire début → fin. */}
          <div style={{ display: "flex", gap: "var(--space150)", flexWrap: "wrap", alignItems: "flex-end" }}>
            <DatePicker aria-label="Du (date de début)" defaultValue={parseDate("2026-08-20")} />
            <DatePicker aria-label="Au (date de fin)" defaultValue={parseDate("2026-08-27")} />
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
    const query = optionQuery.trim().toLowerCase();
    const shown = searchable && query ? domain.filter((v) => v.toLowerCase().includes(query)) : domain;
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
            const n = optionCount(filters, key, value);
            const checked = filters[key].includes(value);
            return (
              <div key={value} style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <Checkbox isChecked={checked} isDisabled={n === 0 && !checked} onChange={() => toggleMulti(key, value)} label={value} />
                </span>
                <span style={{ flex: "none", fontSize: "var(--font-size-ui-xs)", color: "var(--text-subtlest)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
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
    if (d.kind === "dispo") return filters.dispoMode === "tous" ? "" : (DISPO_MODES.find((m) => m.id === filters.dispoMode)?.label ?? "");
    if (d.kind === "multi" && facetCount(filters, d.key) === 1) return filters[d.key as MultiKey][0] ?? "";
    return "";
  };

  // Styles inline (D11) repris des classes de la recette mobile : libellé de
  // facette prioritaire (ne rétrécit pas), valeur en fin de ligne qui se tronque.
  const facetLabelStyle = { flex: "none", fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-s)", lineHeight: "var(--line-height-ui-s)", color: "var(--text-default)", whiteSpace: "nowrap" } as const;
  const facetTrailingStyle = { flex: "0 1 auto", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "var(--space100)", minWidth: 0, color: "var(--text-subtlest)" } as const;
  const facetValueStyle = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--font-size-ui-s)", color: "var(--text-subtlest)" } as const;
  // `textTransform: none` en inline bat le `.head` du DS (capitales) sans classe.
  const sectionTitleStyle = { textTransform: "none" } as const;

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetDrill();
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
          <Button appearance="link" className={textActionClassName} onPress={clearAll} isDisabled={total === 0}>
            Réinitialiser
          </Button>
        ) : null}
      </DrawerHeader>

      <Divider />

      <DrawerBody className={scrollClassName}>
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
                    {onDeleteView ? (
                      <ListItemSecondaryAction>
                        <Button appearance="subtle" iconBefore="Close" aria-label={`Supprimer ${v.name}`} onPress={() => onDeleteView(v.id)} />
                      </ListItemSecondaryAction>
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          )
        ) : savingName !== null ? (
          // Enregistrement : vue FOCALISÉE — seuls le champ et ses deux actions
          // sont présents/actifs. Facettes, pied « Voir N » et « Réinitialiser »
          // disparaissent le temps de nommer l'enregistrement.
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
          // Colonne flex : l'espace autour du filet entre les deux groupes est
          // porté par le `gap` (une valeur, un endroit), jamais par une marge.
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space150)" }}>
            {/* Bloc « enregistrement » : action + collection. */}
            <List aria-label="Filtres enregistrés">
              <ListHead isFlush style={sectionTitleStyle}>Enregistrement</ListHead>
              <ListItemButton isFlush onPress={() => setSavingName("")} isDisabled={total === 0}>
                <ListItemText primary="Enregistrer ces filtres" />
              </ListItemButton>
              <ListItemButton isFlush onPress={() => setShowViews(true)}>
                <span style={facetLabelStyle}>Filtres enregistrés</span>
                <span style={facetTrailingStyle}>
                  {appliedView ? <span style={facetValueStyle}>{appliedView.name}</span> : null}
                  <Icon icon="ChevronRight" color="subtlest" />
                </span>
              </ListItemButton>
            </List>

            <Divider />

            {/* Facettes — libellé prioritaire, valeur en fin de ligne tronquée. */}
            <List aria-label="Critères">
              <ListHead isFlush style={sectionTitleStyle}>Critères</ListHead>
              {visibleFacets.map((d) => {
                const c = facetCount(filters, d.key);
                const val = facetValue(d);
                return (
                  <ListItemButton key={d.key} isFlush onPress={() => openFacet(d.key)}>
                    <span style={facetLabelStyle}>{d.label}</span>
                    <span style={facetTrailingStyle}>
                      {val ? (
                        <span style={facetValueStyle}>{val}</span>
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
          <Button appearance="contained" color="comete" onPress={() => onOpenChange(false)} style={{ width: "100%" }}>
            Voir {results.length} agent{results.length > 1 ? "s" : ""}
          </Button>
        </DrawerFooter>
      ) : null}
    </Drawer>
  );
}

// -----------------------------------------------------------------------
// SavedSearchesMenu — « Filtres enregistrés » (action à droite de la barre).

export function SavedSearchesMenu({
  views,
  current,
  onApply,
  onDelete,
}: {
  views: SavedView[];
  /** Filtres courants — pour marquer l'enregistrement APPLIQUÉ (le cas échéant). */
  current: Filters;
  onApply: (v: SavedView) => void;
  onDelete: (id: string) => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  // L'enregistrement appliqué = celui dont les filtres correspondent aux filtres
  // courants (sameFilters). Aucun si l'utilisateur a modifié depuis.
  const applied = views.find((v) => sameFilters(v.filters, current));
  return (
    <MenuTrigger isOpen={open} onOpenChange={setOpen}>
      <Button appearance="outlined">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space075)" }}>
          {/* Bookmark REMPLI quand un enregistrement est appliqué, et son nom
              affiché sur le déclencheur — « lequel est sélectionné » d'un coup d'œil. */}
          <Icon icon="Bookmark" appearance={applied ? "filled" : "outlined"} size={18} />
          {applied ? applied.name : "Filtres enregistrés"}
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
                const isApplied = applied?.id === v.id;
                return (
                  <MenuItem
                    key={v.id}
                    id={v.id}
                    // Indicateur d'état : bookmark REMPLI = appliqué, contour = non.
                    elemBefore={<Icon icon="Bookmark" appearance={isApplied ? "filled" : "outlined"} size={18} />}
                    description={isApplied ? `Appliqué · ${n} critère${n > 1 ? "s" : ""}` : `${n} critère${n > 1 ? "s" : ""}`}
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
    // Format DOCUMENTÉ du tag : « Facette : 1re valeur » (1 valeur) ou
    // « Facette : 1re valeur +N » (≥ 2 ; N = valeurs restantes). La 1re valeur
    // se TRONQUE (ellipsis) si elle est longue — le « +N » et la croix restent
    // toujours lisibles (flex: none). Le tag est borné (maxWidth) pour qu'un
    // libellé long ne pousse jamais le reste de la rangée hors écran.
    const first = g.values.split(", ")[0] ?? "";
    const extra = g.count - 1;
    return (
      <span
        key={g.key}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space075)",
          height: 28,
          maxWidth: 260,
          padding: "0 var(--space075) 0 var(--space150)",
          borderRadius: "var(--radius-round)",
          background: "var(--background-brand-subtlest-default)",
          color: "var(--text-brand)",
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        <span style={{ flex: "none", opacity: 0.65 }}>{g.facet} :</span>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{first}</span>
        {extra > 0 && <span style={{ flex: "none" }}>+{extra}</span>}
        <button
          type="button"
          onClick={g.clear}
          aria-label={`Retirer ${g.facet}`}
          style={{ flex: "none", display: "inline-flex", padding: 4, border: 0, background: "none", borderRadius: "var(--radius-round)", cursor: "pointer", color: "inherit", opacity: 0.7 }}
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
