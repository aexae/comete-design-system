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
  Badge,
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
// La recette (jamais le composant Drawer) décide du régime selon la largeur.
// Critère unique : « la liste reste-t-elle visible ? »
//   ≥ 1600 → rail poussé à droite (non modal, liste visible → immédiat)
//   1024–1600 → drawer superposé à droite (modal, liste couverte → différé)
//   < 1024 → bottom sheet (modal, différé)
// Un seul seuil décide la MODALITÉ (1600) ; 1024 ne choisit que le placement.

type Regime = "rail" | "drawer" | "sheet";

const RAIL_MQ = "(min-width: 1600px)";
const DESKTOP_MQ = "(min-width: 1024px)";
const RAIL_STORAGE_KEY = "comete-filters-rail-open";

function computeRegime(): Regime {
  if (typeof window === "undefined") return "rail";
  if (window.matchMedia(RAIL_MQ).matches) return "rail";
  if (window.matchMedia(DESKTOP_MQ).matches) return "drawer";
  return "sheet";
}

function useFilterRegime(): Regime {
  // Init SYNCHRONE (corrige le flash de premier rendu). Deux seuils.
  const [regime, setRegime] = useState<Regime>(computeRegime);
  useEffect(() => {
    const mqs = [window.matchMedia(RAIL_MQ), window.matchMedia(DESKTOP_MQ)];
    const update = () => setRegime(computeRegime());
    update();
    mqs.forEach((mq) => mq.addEventListener("change", update));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update));
  }, []);
  return regime;
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
// Panneau modal DIFFÉRÉ, partagé par le drawer superposé (droite) et le bottom
// sheet (bas) : même formulaire, pied « Tout effacer » + « Voir N résultats ».

function DeferredPanel({
  placement,
  size,
  swipeable = false,
  id,
  isOpen,
  onClose,
  draft,
  onDraftFacet,
  onClearAll,
  onApply,
  resultCount,
}: {
  placement: "right" | "bottom";
  size: string;
  swipeable?: boolean;
  id: string;
  isOpen: boolean;
  onClose: () => void;
  draft: Applied;
  onDraftFacet: (id: FacetId, values: string[]) => void;
  onClearAll: () => void;
  onApply: () => void;
  resultCount: number;
}): ReactElement {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement={placement}
      swipeable={swipeable}
      size={size}
      id={id}
      aria-label="Filtres"
    >
      <DrawerHeader onClose={onClose}>Filtres</DrawerHeader>
      <DrawerBody>
        <PanelSections value={draft} onFacet={onDraftFacet} />
      </DrawerBody>
      <DrawerFooter>
        <div className={css["footerActions"]}>
          <Button appearance="subtle" onPress={onClearAll}>
            Tout effacer
          </Button>
          <Button color="comete" onPress={onApply}>
            Voir {resultCount} résultats
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}

// -----------------------------------------------------------------------
// Recette

function FiltersRecipe({ forceRegime }: { forceRegime?: Regime } = {}): ReactElement {
  const autoRegime = useFilterRegime();
  const regime = forceRegime ?? autoRegime;
  const isRail = regime === "rail";

  const [q, setQ] = useState("");
  const [applied, setApplied] = useState<Applied>({});
  const [draft, setDraft] = useState<Applied>({}); // brouillon modal (différé)
  const [panelOpen, setPanelOpen] = useState(false); // drawer/sheet (modal)
  // Rail : repliable, état mémorisé pour la session (recette, pas composant).
  const [railOpen, setRailOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(RAIL_STORAGE_KEY) !== "false";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(RAIL_STORAGE_KEY, String(railOpen));
    } catch {
      /* sessionStorage indisponible : état gardé en mémoire seulement */
    }
  }, [railOpen]);

  const setFacet = (id: FacetId, values: string[]) =>
    setApplied((prev) => ({ ...prev, [id]: values }));
  const setDraftFacet = (id: FacetId, values: string[]) =>
    setDraft((prev) => ({ ...prev, [id]: values }));

  // « Filtres » : rail → replie/déplie ; drawer/sheet → ouvre (brouillon amorcé
  // sur l'état appliqué courant).
  const openAll = () => {
    if (isRail) setRailOpen((o) => !o);
    else {
      setDraft(applied);
      setPanelOpen(true);
    }
  };

  // Panneau actif du régime courant, pour lier le bouton « Filtres »
  // (aria-expanded / aria-controls). aria-controls n'est posé que si le panneau
  // est monté (il l'est seulement quand ouvert).
  const panelId = isRail
    ? "filters-rail"
    : regime === "drawer"
      ? "filters-drawer"
      : "filters-sheet";
  const panelIsOpen = isRail ? railOpen : panelOpen;

  const results = applyFilters(DATA, applied, q);
  const total = countAll(applied);

  // Annonce du nombre de résultats TEMPORISÉE (~1,5 s) : une rafale de clics ne
  // produit qu'une seule annonce finale (sinon un lecteur d'écran se coupe à
  // chaque changement et l'utilisateur n'entend aucun total). Séparée du
  // compteur visuel, qui lui se met à jour immédiatement.
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const n = results.length;
    const id = setTimeout(
      () => setAnnounced(`${n} résultat${n > 1 ? "s" : ""}`),
      1500,
    );
    return () => clearTimeout(id);
  }, [results.length]);

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
      {/* Compteur VISUEL immédiat (pas de aria-live : l'annonce est temporisée). */}
      <div className={css["resCount"]}>
        {results.length} résultat{results.length > 1 ? "s" : ""} · Août 2026
      </div>
      {/* Annonce lecteur d'écran temporisée. */}
      <div className={css["srOnly"]} role="status" aria-live="polite">
        {announced}
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
        start={
          // Le bouton « Filtres » vit dans la toolbar, à côté de la recherche
          // (slot `start`). C'est LUI qui porte aria-expanded/aria-controls
          // (le bouton interne de FilterChipRow ne l'expose pas).
          <Button
            appearance="outlined"
            iconBefore="Tune"
            onPress={openAll}
            aria-expanded={panelIsOpen}
            aria-controls={panelIsOpen ? panelId : undefined}
          >
            Filtres
            {total > 0 && (
              <Badge label={String(total)} appearance="information" importance="high" />
            )}
          </Button>
        }
      />

      {/* Chips des filtres actifs SOUS la toolbar (× par facette). Masqués quand
          le RAIL est ouvert : le rail montre et édite déjà les mêmes facettes →
          les chips (avec leur popover) feraient doublon (deux commandes pour une
          chose). Ils réapparaissent rail replié / en drawer / en sheet, où il
          n'y a pas de panneau persistant. */}
      {!(isRail && railOpen) && <FilterChipRow facets={rowFacets} />}

      <div className={css["body"]}>
        {resultsTable}
        {isRail && (
          // ≥ 1600px : RAIL non modal, enfant flex → la liste se reflow à côté
          // (jamais recouverte). Application IMMÉDIATE (édite `applied`), pas de
          // bouton « Appliquer » : le résultat se voit à côté.
          <Drawer
            isOpen={railOpen}
            onOpenChange={setRailOpen}
            isModal={false}
            placement="right"
            size="var(--filters-panel-width)"
            id="filters-rail"
            aria-label="Filtres"
            // Le rail s'étire sur la hauteur de `.body` (shell à hauteur de
            // viewport, cf. .module.css) → header + body défilant + pied TOUJOURS
            // dans l'écran. `.nonModal` (align-self: stretch) fait le travail,
            // aucun style inline nécessaire.
          >
            <DrawerHeader onClose={() => setRailOpen(false)}>Filtres</DrawerHeader>
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

      {/* 1024–1600 : drawer superposé (modal, à droite) ; < 1024 : bottom sheet.
          Les deux COUVRENT la liste → application DIFFÉRÉE, pied « Voir N ». */}
      {regime === "drawer" && (
        <DeferredPanel
          placement="right"
          size="var(--filters-panel-width)"
          id="filters-drawer"
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          draft={draft}
          onDraftFacet={setDraftFacet}
          onClearAll={() => setDraft({})}
          onApply={() => {
            setApplied(draft);
            setPanelOpen(false);
          }}
          resultCount={applyFilters(DATA, draft, q).length}
        />
      )}
      {regime === "sheet" && (
        <DeferredPanel
          placement="bottom"
          size="85vh"
          swipeable
          id="filters-sheet"
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          draft={draft}
          onDraftFacet={setDraftFacet}
          onClearAll={() => setDraft({})}
          onApply={() => {
            setApplied(draft);
            setPanelOpen(false);
          }}
          resultCount={applyFilters(DATA, draft, q).length}
        />
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
          "**Le critère unique : la liste reste-t-elle visible ?** Il produit trois " +
          "régimes (jamais formulés « desktop vs mobile » — c'est cette formulation qui " +
          "avait engendré cinq variantes) :\n" +
          "- **≥ 1600px** — rail poussé à droite, en flux, la liste se reflow à côté " +
          "(visible) → **non modal**, application **immédiate**, pas de bouton « Appliquer » " +
          "(le résultat se voit à côté).\n" +
          "- **1024–1600px** — drawer superposé à droite (couvre la liste) → **modal**, " +
          "application **différée**, pied `Voir N résultats`.\n" +
          "- **< 1024px** — bottom sheet (couvre la liste) → **modal**, différée, pied.\n\n" +
          "Un seul seuil décide la **modalité** (1600) ; 1024 ne choisit que le placement " +
          "(droite vs bas). Le rail est **à droite** dans les trois cas (à gauche il " +
          "entrerait en collision avec le mode `peeking` de la SideNav).\n\n" +
          "**Une seule région poussante par axe** : le rail de filtres pousse ; un panneau " +
          "de détail (inspecteur de ligne, D16) **se superpose** — deux régions poussantes " +
          "sur le même axe écraseraient le tableau.\n\n" +
          "**Le rail rétrécit le tableau** : `Table responsive` (container queries) + " +
          "`hideBelow` sur les colonnes secondaires. Selon la largeur du conteneur : " +
          "≥1200px les 6 colonnes ; 900–1200px les colonnes de confort (Profil, Horaires) " +
          "tombent → 4 ; <900px les colonnes de contexte (Site, Prestation) aussi → 2 " +
          "(Agent + Statut, jamais masquées). Donc **deux à quatre colonnes repliées** " +
          "selon la largeur, jamais de scroll horizontal (dépendance D9).\n\n" +
          "**a11y** : Échap ne ferme PAS le rail (non modal) mais ferme drawer/sheet ; " +
          "focus non volé à l'ouverture du rail ; WCAG 3.2.2 (l'application immédiate ne " +
          "recharge pas, ne déplace pas le focus, ne referme pas la facette) ; annonce " +
          "`aria-live` **temporisée** du nombre de résultats. `FilterChipRow` porte les " +
          "chips actifs (× par facette) et le bouton « Filtres » (badge de total) via " +
          "`onOpenAll` / `totalActiveCount`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * **Acceptation D9 (§5)** — le rail rétrécit le tableau : rail **ouvert**, les
 * colonnes secondaires se replient (container queries + `hideBelow`), **sans
 * scroll horizontal** ; rail **fermé**, elles reviennent. Régime rail forcé,
 * conteneur ~1280px pour rendre le repli visible sans dépendre du viewport.
 */
// Sonde d'acceptation D9 paramétrée par largeur : régime rail forcé, conteneur
// fixe → une bande de colonnes précise. Un palier = une story (6 / 4 / 2).
function railTierStory(wrapperWidth: number, band: "wide" | "mid" | "narrow"): Story {
  return {
    parameters: { controls: { disable: true }, layout: "fullscreen" },
    render: () => (
      <div style={{ width: wrapperWidth }}>
        <FiltersRecipe forceRegime="rail" />
      </div>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await wait(250);
      if (!canvasElement.querySelector("#filters-rail")) {
        await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
        await wait(250);
      }
      await expect(canvasElement.querySelector("#filters-rail")).not.toBeNull();

      const results = canvasElement.querySelector<HTMLElement>('[class*="results"]');
      const cw = results ? results.clientWidth : 0;
      const visible = [...canvasElement.querySelectorAll("thead th")].filter(
        (th) => getComputedStyle(th).display !== "none",
      ).length;
      const expectedByWidth = cw >= 1200 ? 6 : cw >= 900 ? 4 : 2;

      // Le conteneur tombe bien dans la bande visée…
      if (band === "wide") {
        await expect(cw).toBeGreaterThanOrEqual(1200);
      } else if (band === "mid") {
        await expect(cw).toBeGreaterThanOrEqual(900);
        await expect(cw).toBeLessThan(1200);
      } else {
        await expect(cw).toBeLessThan(900);
      }
      // …et le nombre de colonnes visibles correspond exactement, sans scroll H.
      await expect(visible).toBe(expectedByWidth);
      await expect(results!.scrollWidth <= results!.clientWidth + 1).toBe(true);
    },
  };
}

/** §5 acceptation — ≥1200px de conteneur : les 6 colonnes, zéro scroll H. */
export const RailCols6: Story = {
  name: "Rail — large (6 colonnes)",
  ...railTierStory(1760, "wide"),
};
/** §5 acceptation — 900–1200px : colonnes de confort repliées (4). */
export const RailCols4: Story = {
  name: "Rail — moyen (4 colonnes)",
  ...railTierStory(1480, "mid"),
};
/** §5 acceptation — <900px : confort + contexte repliés (2 : Agent + Statut). */
export const RailCols2: Story = {
  name: "Rail — étroit (2 colonnes)",
  ...railTierStory(1240, "narrow"),
};

export const Filtres: Story = {
  name: "Filtres — 3 régimes (selon la largeur de fenêtre)",
  render: () => <FiltersRecipe />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Régime-agnostique : le rail est ouvert par défaut ; drawer/sheet
    // s'ouvrent via « Filtres ». On vérifie juste que le panneau expose bien
    // les facettes (le comportement par régime est couvert par les stories
    // dédiées RailColumnsCollapse / RailA11y).
    const panelOf = () =>
      document.body.querySelector<HTMLElement>('[aria-label="Filtres"]');
    if (!panelOf()) {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
      await new Promise((r) => setTimeout(r, 150));
    }
    const panel = panelOf();
    await expect(panel).not.toBeNull();
    await expect(
      within(panel as HTMLElement).getByRole("checkbox", { name: "Ronde" }),
    ).toBeInTheDocument();
  },
};

/**
 * **A11y du rail non modal (§6)** — régime rail forcé. Play : focus non volé à
 * l'ouverture ; WCAG 3.2.2 (cocher garde la case cochée ET au focus, panneau
 * pas refermé, seule la liste change) ; pas de piège à focus (Tab sort du rail) ;
 * Échap ne ferme PAS le rail.
 */
export const RailA11y: Story = {
  name: "Rail — a11y (WCAG 3.2.2, pas de piège, Échap)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ width: 1280 }}>
      <FiltersRecipe forceRegime="rail" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await wait(200);
    if (!canvasElement.querySelector("#filters-rail")) {
      await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
      await wait(250);
    }
    const rail = canvasElement.querySelector<HTMLElement>("#filters-rail");
    await expect(rail).not.toBeNull();
    const railEl = rail as HTMLElement;

    // Focus NON volé à l'ouverture (contrairement au modal).
    await expect(railEl.contains(document.activeElement)).toBe(false);

    const count = () =>
      Number(
        /\d+/.exec(
          canvasElement.querySelector('[class*="resCount"]')?.textContent ?? "0",
        )?.[0] ?? "0",
      );

    // WCAG 3.2.2 : cocher une case au clavier → reste cochée + gardée au focus,
    // le rail ne se ferme pas, seule la liste change.
    const before = count();
    const cb = within(railEl).getByRole("checkbox", { name: "Vacation" });
    cb.focus();
    await userEvent.keyboard(" ");
    await wait(80);
    await expect(cb).toBeChecked();
    await expect(cb).toHaveFocus();
    await expect(canvasElement.querySelector("#filters-rail")).not.toBeNull();
    await expect(count()).toBeLessThan(before);

    // Pied « Tout effacer » ÉPINGLÉ et visible dans le rail (pas repoussé hors
    // écran) : son bas ne dépasse pas celui du rail, et il est dans le viewport.
    const clearBtn = within(railEl).getByRole("button", { name: "Tout effacer" });
    const cbr = clearBtn.getBoundingClientRect();
    const rbr = railEl.getBoundingClientRect();
    await expect(cbr.height).toBeGreaterThan(0);
    await expect(Math.round(cbr.bottom)).toBeLessThanOrEqual(Math.round(rbr.bottom) + 1);
    await expect(cbr.bottom).toBeLessThanOrEqual(window.innerHeight + 1);

    // Pas de piège à focus : depuis le dernier focusable du rail, Tab en sort.
    clearBtn.focus();
    await expect(clearBtn).toHaveFocus();
    await userEvent.tab();
    await expect(railEl.contains(document.activeElement)).toBe(false);

    // Échap ne ferme PAS le rail (non modal).
    await userEvent.keyboard("{Escape}");
    await wait(120);
    await expect(canvasElement.querySelector("#filters-rail")).not.toBeNull();
  },
};

/**
 * **Contre-exemple modal (§6)** — régime drawer forcé : le drawer superposé se
 * ferme sur Échap (inverse du rail). Piège à focus + voile fournis par React
 * Aria (déjà couverts par Drawer.test).
 */
export const ModalEscapeCloses: Story = {
  name: "Drawer superposé — Échap ferme (contre-exemple)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ width: 1280 }}>
      <FiltersRecipe forceRegime="drawer" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await wait(150);
    await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
    await wait(300);
    const drawer = document.body.querySelector<HTMLElement>('#filters-drawer[role="dialog"]');
    await expect(drawer).not.toBeNull();

    // #4 — le VOILE couvre bien le tableau (modal en apparence, pas seulement en
    // comportement) : elementFromPoint sur une cellule renvoie le voile.
    const blanket = document.body.querySelector<HTMLElement>(
      '[class*="overlay"]:not([class*="overlayTransparent"])',
    );
    await expect(blanket).not.toBeNull();
    const cell = canvas.getByText("DUPONT Marie");
    const cr = cell.getBoundingClientRect();
    const atCell = document.elementFromPoint(
      Math.round(cr.left + cr.width / 2),
      Math.round(cr.top + cr.height / 2),
    );
    await expect(
      atCell === blanket || (blanket as HTMLElement).contains(atCell as Node),
    ).toBe(true);

    // #5 — le pied ne chevauche pas le body (flex siblings) : footer.top ≥ body.bottom.
    const body = drawer!.querySelector<HTMLElement>('[class*="body"]');
    const footer = drawer!.querySelector<HTMLElement>('[class*="footer"]');
    await expect(
      Math.round(footer!.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(Math.round(body!.getBoundingClientRect().bottom) - 1);

    // Échap ferme (inverse du rail).
    await userEvent.keyboard("{Escape}");
    await wait(300);
    await expect(document.body.querySelector("#filters-drawer")).toBeNull();
  },
};
