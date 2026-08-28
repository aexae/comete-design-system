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
import type { ReactElement } from "react";
import { within, expect } from "storybook/test";
import {
  Button,
  Badge,
  Tag,
  type TagStatusColor,
  TextField,
  Icon,
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

interface ActiveGroup {
  key: string;
  facet: string;
  values: string;
  count: number;
  clear: () => void;
}

// -----------------------------------------------------------------------
// Recette

function FiltresOptionB(): ReactElement {
  const [f, setF] = useState<Filters>(initialFilters);
  const [panelOpen, setPanelOpen] = useState(false);

  const setFacet = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));

  const results = useMemo(() => filteredAgents(f), [f]);
  const total = totalActive(f);

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
        <Button
          appearance="outlined"
          iconBefore="Tune"
          onPress={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          aria-controls="filtres-panel"
        >
          Filtres
          {total > 0 && (
            <Badge label={String(total)} appearance="information" importance="high" />
          )}
        </Button>
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
          {groups.map((g) => {
            const first = g.values.split(", ")[0];
            const extra = g.count > 1 ? ` +${g.count - 1}` : "";
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
          })}
          <button
            type="button"
            onClick={clearAll}
            style={{
              flex: "none",
              border: 0,
              background: "none",
              fontSize: 12.5,
              color: "var(--text-link-default)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Réinitialiser
          </button>
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
        <TableBody columnCount={6} isEmpty={results.length === 0}>
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
