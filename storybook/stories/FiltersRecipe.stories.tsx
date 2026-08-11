// Recette Filtres (D13) — panneau persistant non modal (desktop, la liste se
// reflow à côté, application immédiate) OU bottom sheet (mobile, application
// différée « Voir N résultats »). Le MÊME formulaire de facettes des deux côtés.
// FilterChipRow câblé (chips actifs par facette + bouton « Filtres » via
// onOpenAll/totalActiveCount). Données réalistes (vacations).
//
// La recette (pas le composant) décide desktop/mobile via un matchMedia local.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { within, userEvent, expect } from "storybook/test";
import {
  Page,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Tag,
  type TagStatusColor,
  type TableHideBelow,
  FilterChip,
  FilterChipRow,
  type FilterChipRowFacet,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Checkbox,
  CheckboxGroup,
  TextField,
  Icon,
} from "@aexae/comete-design-system/components";
import css from "./FiltersRecipe.stories.module.css";

// -----------------------------------------------------------------------
// Données (vacations) — réalistes, déterministes.

interface Opt {
  value: string;
  label: string;
  desc?: string;
}
interface Facet {
  id: FacetId;
  label: string;
  options: Opt[];
  searchable?: boolean;
}
type FacetId = "sites" | "prest" | "profils" | "statuts";

const SITE_NAMES = [
  "Auchan Drive",
  "Les Jardins de la Roseraie",
  "Imperial Palace",
  "Tour Nord",
  "Entrepôt B",
  "Site Est",
  "Mairie de Merville",
  "Galerie Comète",
];
const SITES: Opt[] = SITE_NAMES.map((s) => ({ value: s, label: s }));
const PREST: Opt[] = ["Ronde", "Vacation", "Intervention", "Événementiel", "Sûreté"].map(
  (s) => ({ value: s, label: s }),
);
const PROFILS: Opt[] = ["ADS", "SSIAP1", "SSIAP2", "ADS CYNO"].map((s) => ({
  value: s,
  label: s,
}));
const STATUTS: Opt[] = [
  { value: "anomalie", label: "Avec anomalies", desc: "PDS en retard ou hors zone" },
  { value: "encours", label: "En cours", desc: "PDS validées" },
  { value: "terminee", label: "Terminées", desc: "PDS et FDS validées" },
  { value: "nonaffectee", label: "Non affectées" },
];

const FACETS: Facet[] = [
  { id: "sites", label: "Sites", options: SITES, searchable: true },
  { id: "prest", label: "Prestations", options: PREST },
  { id: "profils", label: "Profils", options: PROFILS },
  { id: "statuts", label: "Statut", options: STATUTS },
];

const STATUT_TAG: Record<string, { label: string; color: TagStatusColor }> = {
  anomalie: { label: "Anomalie", color: "critical" },
  encours: { label: "En cours", color: "information" },
  terminee: { label: "Terminée", color: "success" },
  nonaffectee: { label: "Non affectée", color: "warning" },
};

interface Vac {
  id: string;
  agent: string;
  site: string;
  prest: string;
  profil: string;
  statut: string;
  horaires: string;
}
const DATA: Vac[] = [
  { id: "1", agent: "DUPONT Marie", site: "Tour Nord", prest: "Ronde", profil: "ADS", statut: "encours", horaires: "07:00 – 19:00" },
  { id: "2", agent: "MARTIN Bob", site: "Entrepôt B", prest: "Vacation", profil: "SSIAP1", statut: "anomalie", horaires: "09:00 – 21:00" },
  { id: "3", agent: "CHEN Alice", site: "Imperial Palace", prest: "Sûreté", profil: "SSIAP2", statut: "terminee", horaires: "06:00 – 18:00" },
  { id: "4", agent: "CLAIRE Sophie", site: "Auchan Drive", prest: "Ronde", profil: "ADS CYNO", statut: "encours", horaires: "20:00 – 08:00" },
  { id: "5", agent: "BARDET Romain", site: "Site Est", prest: "Intervention", profil: "ADS", statut: "nonaffectee", horaires: "12:00 – 00:00" },
  { id: "6", agent: "BENOIT Armand", site: "Galerie Comète", prest: "Événementiel", profil: "SSIAP1", statut: "terminee", horaires: "10:00 – 22:00" },
  { id: "7", agent: "BERNARD Alex", site: "Mairie de Merville", prest: "Vacation", profil: "ADS", statut: "anomalie", horaires: "08:00 – 20:00" },
  { id: "8", agent: "ORSAL Guillaume", site: "Les Jardins de la Roseraie", prest: "Ronde", profil: "SSIAP2", statut: "encours", horaires: "19:00 – 07:00" },
  { id: "9", agent: "COCHARD Cédric", site: "Tour Nord", prest: "Sûreté", profil: "ADS", statut: "terminee", horaires: "07:30 – 19:30" },
  { id: "10", agent: "ARMAND Fred", site: "Entrepôt B", prest: "Intervention", profil: "ADS CYNO", statut: "nonaffectee", horaires: "13:00 – 01:00" },
  { id: "11", agent: "BELLANGER Georgie", site: "Imperial Palace", prest: "Vacation", profil: "SSIAP1", statut: "encours", horaires: "06:30 – 18:30" },
  { id: "12", agent: "ANAIS Alfred", site: "Galerie Comète", prest: "Ronde", profil: "ADS", statut: "anomalie", horaires: "21:00 – 09:00" },
];

// Colonnes du tableau + priorités responsives (container queries via `responsive`
// sur Table). Agent (identité) et Statut (état) ne sont JAMAIS masqués ; Profil
// et Horaires (confort) partent en premiers (`lg`), Site et Prestation (contexte)
// ensuite (`md`). Ouvrir le panneau rétrécit `.results` → les colonnes tombent.
const COLUMNS: Array<{
  key: keyof Vac;
  label: string;
  hideBelow?: TableHideBelow;
  render?: (r: Vac) => ReactNode;
}> = [
  { key: "agent", label: "Agent" },
  { key: "site", label: "Site", hideBelow: "md" },
  { key: "prest", label: "Prestation", hideBelow: "md" },
  { key: "profil", label: "Profil", hideBelow: "lg" },
  {
    key: "statut",
    label: "Statut",
    render: (r) => (
      <Tag
        label={STATUT_TAG[r.statut]?.label ?? r.statut}
        color={STATUT_TAG[r.statut]?.color}
        appearance="subtle"
        shape="rounded"
      />
    ),
  },
  { key: "horaires", label: "Horaires", hideBelow: "lg" },
];

type Applied = Partial<Record<FacetId, string[]>>;
const countAll = (a: Applied) => Object.values(a).reduce((n, v) => n + (v?.length ?? 0), 0);

function applyFilters(data: Vac[], applied: Applied, q: string): Vac[] {
  const query = q.trim().toLowerCase();
  return data.filter(
    (r) =>
      (!query || `${r.agent} ${r.site}`.toLowerCase().includes(query)) &&
      (!applied.sites?.length || applied.sites.includes(r.site)) &&
      (!applied.prest?.length || applied.prest.includes(r.prest)) &&
      (!applied.profils?.length || applied.profils.includes(r.profil)) &&
      (!applied.statuts?.length || applied.statuts.includes(r.statut)),
  );
}

// -----------------------------------------------------------------------
// La recette décide desktop/mobile — JAMAIS le composant Drawer.

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

// -----------------------------------------------------------------------
// Contenu d'une facette (multi) — mini-recherche pour les facettes longues,
// « Tout sélectionner », cases. Partagé par le popover de la chip ET le panneau.

function FacetOptions({
  facet,
  value,
  onChange,
}: {
  facet: Facet;
  value: string[];
  onChange: (values: string[]) => void;
}): ReactElement {
  const [query, setQuery] = useState("");
  const opts =
    facet.searchable && query.trim()
      ? facet.options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : facet.options;
  const allValues = facet.options.map((o) => o.value);
  const allSelected = allValues.length > 0 && value.length === allValues.length;
  const partial = value.length > 0 && !allSelected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space150)" }}>
      {facet.searchable && (
        <TextField
          aria-label={`Rechercher : ${facet.label}`}
          placeholder="Rechercher un site"
          value={query}
          onChange={setQuery}
          elemAfter={<Icon icon="Search" size={20} color="subtle" />}
        />
      )}
      <Checkbox
        label="Tout sélectionner"
        isChecked={allSelected}
        isIndeterminate={partial}
        onChange={(checked) => onChange(checked ? allValues : [])}
      />
      <CheckboxGroup aria-label={facet.label} value={value} onChange={onChange}>
        {opts.map((o) => (
          <Checkbox
            key={o.value}
            value={o.value}
            label={o.desc ? `${o.label} — ${o.desc}` : o.label}
          />
        ))}
      </CheckboxGroup>
    </div>
  );
}

// Sections de facettes empilées (le « même formulaire » desktop + mobile).
function PanelSections({
  value,
  onFacet,
}: {
  value: Applied;
  onFacet: (id: FacetId, values: string[]) => void;
}): ReactElement {
  return (
    <>
      {FACETS.map((f) => {
        const vals = value[f.id] ?? [];
        return (
          <div key={f.id} className={css["section"]}>
            <div className={css["sectionHead"]}>
              <span className={css["sectionTitle"]}>{f.label}</span>
              {vals.length > 0 && (
                <Button appearance="subtle" onPress={() => onFacet(f.id, [])}>
                  Effacer
                </Button>
              )}
            </div>
            <FacetOptions facet={f} value={vals} onChange={(v) => onFacet(f.id, v)} />
          </div>
        );
      })}
    </>
  );
}

// Une chip = une facette (popover desktop / sheet mobile gérés par FilterChip).
function FacetChip({
  facet,
  applied,
  onApplied,
}: {
  facet: Facet;
  applied: string[];
  onApplied: (values: string[]) => void;
}): ReactElement {
  const valueLabel =
    applied.length === 1
      ? facet.options.find((o) => o.value === applied[0])?.label
      : undefined;
  return (
    <FilterChip
      label={facet.label}
      count={applied.length}
      valueLabel={valueLabel}
      onClear={() => onApplied([])}
    >
      <FacetOptions facet={facet} value={applied} onChange={onApplied} />
    </FilterChip>
  );
}

// -----------------------------------------------------------------------
// Recette

function FiltersRecipe(): ReactElement {
  const isDesktop = useIsDesktop();
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState<Applied>({});
  const [draft, setDraft] = useState<Applied>({}); // brouillon mobile (différé)
  const [panelOpen, setPanelOpen] = useState(true); // desktop : ouvert par défaut

  const setFacet = (id: FacetId, values: string[]) =>
    setApplied((prev) => ({ ...prev, [id]: values }));
  const setDraftFacet = (id: FacetId, values: string[]) =>
    setDraft((prev) => ({ ...prev, [id]: values }));

  const results = applyFilters(DATA, applied, q);
  const total = countAll(applied);

  const rowFacets: FilterChipRowFacet[] = FACETS.map((f) => ({
    id: f.id,
    isPinned: false,
    isActive: (applied[f.id]?.length ?? 0) > 0,
    chip: (
      <FacetChip
        facet={f}
        applied={applied[f.id] ?? []}
        onApplied={(v) => setFacet(f.id, v)}
      />
    ),
  }));

  const resultsTable = (
    <div className={css["results"]}>
      <div className={css["resCount"]} aria-live="polite">
        {results.length} résultat{results.length > 1 ? "s" : ""} · Août 2026
      </div>
      <Table responsive aria-label="Vacations">
        <TableHead>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableHeaderCell key={c.key} hideBelow={c.hideBelow}>
                {c.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody columnCount={COLUMNS.length} isEmpty={results.length === 0}>
          {results.map((r) => (
            <TableRow key={r.id}>
              {COLUMNS.map((c) => (
                <TableCell key={c.key} hideBelow={c.hideBelow}>
                  {c.render ? c.render(r) : String(r[c.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className={css["layout"]}>
      <Page.Toolbar
        search={
          <TextField
            aria-label="Rechercher"
            placeholder="Rechercher un agent ou un site"
            value={q}
            onChange={setQ}
            elemAfter={<Icon icon="Search" size={20} color="subtle" />}
          />
        }
      />

      <FilterChipRow
        facets={rowFacets}
        totalActiveCount={total}
        onOpenAll={() => setPanelOpen((o) => (isDesktop ? !o : true))}
      />

      <div className={css["body"]}>
        {resultsTable}
        {isDesktop && (
          // Panneau PERSISTANT non modal : enfant flex → les résultats se
          // reflow à côté. Application IMMÉDIATE (on voit la liste changer).
          <Drawer
            isOpen={panelOpen}
            onOpenChange={setPanelOpen}
            isModal={false}
            placement="right"
            size="var(--filters-panel-width)"
            id="filters-panel"
            aria-label="Filtres"
          >
            <DrawerHeader onClose={() => setPanelOpen(false)}>Filtres</DrawerHeader>
            <DrawerBody>
              <PanelSections value={applied} onFacet={setFacet} />
            </DrawerBody>
            <DrawerFooter>
              <Button appearance="subtle" onPress={() => setApplied({})}>
                Tout effacer
              </Button>
            </DrawerFooter>
          </Drawer>
        )}
      </div>

      {!isDesktop && (
        // Bottom sheet MODAL : recouvre la liste → application DIFFÉRÉE, le pied
        // porte l'action explicite « Voir N résultats ».
        <Drawer
          isOpen={panelOpen}
          onOpenChange={(open) => {
            if (open) setDraft(applied);
            setPanelOpen(open);
          }}
          placement="bottom"
          swipeable
          size="85vh"
          id="filters-panel"
          aria-label="Filtres"
        >
          <DrawerHeader onClose={() => setPanelOpen(false)}>Filtres</DrawerHeader>
          <DrawerBody>
            <PanelSections value={draft} onFacet={setDraftFacet} />
          </DrawerBody>
          <DrawerFooter>
            <div className={css["footerActions"]}>
              <Button appearance="subtle" onPress={() => setDraft({})}>
                Tout effacer
              </Button>
              <Button
                color="comete"
                onPress={() => {
                  setApplied(draft);
                  setPanelOpen(false);
                }}
              >
                Voir {applyFilters(DATA, draft, q).length} résultats
              </Button>
            </div>
          </DrawerFooter>
        </Drawer>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Recipes/Filtres",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Recette filtres (D13) — à copier par les écrans, le contenu des facettes " +
          "étant du métier (pas du DS).\n\n" +
          "**Application asymétrique, volontaire.** Desktop : le panneau persistant et " +
          "la liste sont visibles ensemble → application **immédiate**, on voit le " +
          "résultat changer, pas de bouton « Appliquer ». Mobile : le bottom sheet " +
          "**couvre** la liste → application **différée**, le pied porte « Voir N résultats ».\n\n" +
          "**Échap** ne ferme PAS le panneau persistant (il n'est pas modal) ; il ferme " +
          "le bottom sheet. Le focus n'est pas volé à l'ouverture du panneau persistant.\n\n" +
          "**a11y** : une région `aria-live` annonce le nombre de résultats ; le panneau " +
          "est atteignable au clavier après la toolbar, avant la liste (flux : filtrer → " +
          "lire les résultats). `FilterChipRow` porte les chips actifs (× par facette) et " +
          "le bouton « Filtres » (badge de total) via `onOpenAll` / `totalActiveCount`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Filtres: Story = {
  name: "Panneau persistant (desktop) / bottom sheet (mobile)",
  render: () => <FiltersRecipe />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Desktop (viewport ≥ 1024) : le panneau est une <section> region en flux,
    // sans voile.
    const panel = canvasElement.querySelector("#filters-panel");
    await expect(panel).not.toBeNull();
    await expect((panel as HTMLElement).tagName).toBe("SECTION");
    await expect(
      document.body.querySelector('[class*="overlay"]:not([class*="overlayTransparent"])'),
    ).toBeNull();

    // Échap ne ferme pas le panneau persistant.
    await userEvent.keyboard("{Escape}");
    await expect(canvasElement.querySelector("#filters-panel")).not.toBeNull();

    // Application immédiate : cocher une prestation réduit les résultats
    // (région aria-live mise à jour).
    const count = () => {
      const live = canvasElement.querySelector('[aria-live="polite"]');
      return Number(/\d+/.exec(live?.textContent ?? "0")?.[0] ?? "0");
    };
    const before = count();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Ronde" }));
    await expect(count()).toBeLessThan(before);
  },
};
