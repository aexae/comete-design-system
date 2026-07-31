// FilterChip / FilterChipRow — stories du pattern « filtres rapides » (chips).
import { useEffect, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, waitFor } from "storybook/test";
import {
  FilterChip,
  FilterChipRow,
  type FilterChipRowFacet,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Drawer,
  Button,
  Icon,
  Heading,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import css from "./FilterChip.stories.module.css";

// -----------------------------------------------------------------------
// Facettes de démo

interface Option {
  value: string;
  label: string;
}
interface FacetDef {
  id: string;
  /** Libellé court affiché sur la chip. */
  label: string;
  /** Libellé long affiché dans le panneau complet (défaut : `label`). */
  panelLabel?: string;
  /** Multi (checkboxes) ou simple (radios). */
  multi: boolean;
  /** Épinglée (toujours visible) ou temporaire (visible si active). */
  pinned: boolean;
  options: Option[];
}

const SITES: Option[] = [
  { value: "idf", label: "Île-de-France" },
  { value: "paris", label: "Paris Centre" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "lille", label: "Lille" },
  { value: "nantes", label: "Nantes" },
  { value: "toulouse", label: "Toulouse" },
  { value: "nice", label: "Nice" },
  { value: "strasbourg", label: "Strasbourg" },
  { value: "rennes", label: "Rennes" },
  { value: "grenoble", label: "Grenoble" },
  { value: "montpellier", label: "Montpellier" },
  { value: "dijon", label: "Dijon" },
  { value: "angers", label: "Angers" },
  { value: "reims", label: "Reims" },
  { value: "tours", label: "Tours" },
  { value: "brest", label: "Brest" },
];
const TYPES: Option[] = [
  { value: "intrusion", label: "Intrusion" },
  { value: "incendie", label: "Incendie" },
  { value: "ronde", label: "Ronde" },
];
// Propositions de date — exactement celles de la maquette MCE.
const DATES: Option[] = [
  { value: "hier", label: "Hier" },
  { value: "semaine", label: "Cette semaine" },
  { value: "7j", label: "Les 7 derniers jours" },
  { value: "30j", label: "Les 30 derniers jours" },
  { value: "mois", label: "Ce mois" },
  { value: "mois-dernier", label: "Le mois dernier" },
];
const STATUTS: Option[] = [
  { value: "ouvert", label: "Ouvert" },
  { value: "cloture", label: "Clôturé" },
];
const IMPORTANCE: Option[] = [
  { value: "haute", label: "Haute" },
  { value: "moyenne", label: "Moyenne" },
  { value: "basse", label: "Basse" },
];
const GROUPES: Option[] = [
  { value: "g1", label: "Groupe A" },
  { value: "g2", label: "Groupe B" },
  { value: "g3", label: "Groupe C" },
];
const AGENTS: Option[] = [
  { value: "a1", label: "Agent 1" },
  { value: "a2", label: "Agent 2" },
];
// Liste longue (> 15) pour démontrer le défilement du panneau.
const MANY_SITES: Option[] = Array.from({ length: 22 }, (_, i) => ({
  value: `s${i + 1}`,
  label: `Site ${i + 1}`,
}));

const FACETS: FacetDef[] = [
  { id: "sites", label: "Sites", multi: true, pinned: true, options: SITES },
  { id: "types", label: "Types", panelLabel: "Types d'évènements", multi: true, pinned: true, options: TYPES },
  { id: "dates", label: "Date", multi: false, pinned: true, options: DATES },
  { id: "statut", label: "Statut", multi: false, pinned: false, options: STATUTS },
  { id: "importance", label: "Importance", multi: true, pinned: false, options: IMPORTANCE },
  { id: "groupes", label: "Groupes", multi: true, pinned: false, options: GROUPES },
  { id: "agents", label: "Agents", multi: true, pinned: false, options: AGENTS },
];

type Applied = Record<string, string[]>;
const countAll = (applied: Applied) =>
  Object.values(applied).reduce((n, v) => n + v.length, 0);

/** Détecte un viewport étroit (mobile) — le panneau complet s'ouvre alors en bas. */
function useIsNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

// Contenu de la facette Date — « Période personnalisée » (plage) + « Période »
// en radios, exactement comme la maquette MCE.
function DateFacetContent({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space075)" }}>
        <span style={{ fontSize: "var(--font-size-ui-xs)", color: "var(--text-subtle)" }}>
          Période personnalisée
        </span>
        <TextField
          aria-label="Période personnalisée"
          placeholder="JJ/MM/AAAA – JJ/MM/AAAA"
          isReadOnly
          elemAfter={<Icon icon="CalendarMonth" size={20} color="subtle" />}
        />
      </div>
      <RadioGroup aria-label="Période" value={value} onChange={onChange}>
        {options.map((o) => (
          <Radio key={o.value} value={o.value} label={o.label} />
        ))}
      </RadioGroup>
    </div>
  );
}

// Icône « retour » de la vue détail — SVG fourni par le design (chevron fin),
// `currentColor` pour hériter de la couleur du bouton.
function BackIcon(): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m7.442 11.161 7.344-7.356a1.186 1.186 0 1 1 1.677 1.678L9.95 12.009l6.558 6.512A1.186 1.186 0 0 1 14.83 20.2l-7.388-7.342a1.2 1.2 0 0 1 0-1.694z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Contenu d'une facette. Multi → recherche + « Tout sélectionner » + cases ;
// simple → radios ; date → contenu dédié. Partagé par la chip (popover) et le
// détail du panneau complet.
function FacetContent({
  facet,
  value,
  onChange,
}: {
  facet: FacetDef;
  value: string[];
  onChange: (values: string[]) => void;
}): ReactElement {
  const [query, setQuery] = useState("");

  if (facet.id === "dates") {
    return (
      <DateFacetContent
        value={value[0] ?? ""}
        onChange={(v) => onChange(v ? [v] : [])}
        options={facet.options}
      />
    );
  }

  if (!facet.multi) {
    return (
      <RadioGroup
        aria-label={facet.label}
        value={value[0] ?? ""}
        onChange={(v) => onChange(v ? [v] : [])}
      >
        {facet.options.map((o) => (
          <Radio key={o.value} value={o.value} label={o.label} />
        ))}
      </RadioGroup>
    );
  }

  const filtered = query.trim()
    ? facet.options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : facet.options;
  const allValues = facet.options.map((o) => o.value);
  const allSelected = allValues.length > 0 && value.length === allValues.length;
  const partiallySelected = value.length > 0 && !allSelected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space150)" }}>
      <TextField
        aria-label={`Rechercher : ${facet.label}`}
        placeholder={facet.label}
        value={query}
        onChange={setQuery}
        elemAfter={<Icon icon="Search" size={20} color="subtle" />}
      />
      <Checkbox
        label="Tout sélectionner"
        isChecked={allSelected}
        isIndeterminate={partiallySelected}
        onChange={(checked) => onChange(checked ? allValues : [])}
      />
      <CheckboxGroup aria-label={facet.label} value={value} onChange={onChange}>
        {filtered.map((o) => (
          <Checkbox key={o.value} value={o.value} label={o.label} />
        ))}
      </CheckboxGroup>
    </div>
  );
}

// -----------------------------------------------------------------------
// FacetChip — une facette contrôlée. Instant (applique dans onChange) ou
// différé (brouillon + Appliquer) selon `mode`.

function FacetChip({
  facet,
  applied,
  onApplied,
  mode,
  defaultOpen = false,
}: {
  facet: FacetDef;
  applied: string[];
  onApplied: (values: string[]) => void;
  mode: "instant" | "deferred";
  defaultOpen?: boolean;
}): ReactElement {
  const [draft, setDraft] = useState<string[]>(applied);
  const [open, setOpen] = useState(defaultOpen);
  const isDeferred = mode === "deferred";

  const groupValue = isDeferred ? draft : applied;
  const onGroupChange = isDeferred ? setDraft : onApplied;

  const valueLabel =
    applied.length === 1
      ? facet.options.find((o) => o.value === applied[0])?.label
      : undefined;

  const content = (
    <FacetContent facet={facet} value={groupValue} onChange={onGroupChange} />
  );

  return (
    <FilterChip
      label={facet.label}
      count={applied.length}
      valueLabel={valueLabel}
      applyMode={mode}
      isOpen={open}
      onOpenChange={(next) => {
        if (next && isDeferred) setDraft(applied);
        setOpen(next);
      }}
      onApply={
        isDeferred
          ? () => {
              onApplied(draft);
              setOpen(false);
            }
          : undefined
      }
      onReset={() => (isDeferred ? setDraft([]) : onApplied([]))}
      canReset={isDeferred ? draft.length > 0 : undefined}
      onClear={() => onApplied([])}
    >
      {content}
    </FilterChip>
  );
}

// -----------------------------------------------------------------------
// Panneau complet (mock D13) — vrai MAÎTRE-DÉTAIL façon maquette MCE.
// Maître : liste des facettes (libellé + valeurs en toutes lettres + chevron).
// Détail : clic sur une facette → vue dédiée (retour ←, titre, recherche,
// options). Droite en desktop, bas (bottom sheet) en mobile.

function AllFiltersDrawer({
  applied,
  onApplied,
  onClearAll,
  isOpen,
  onOpenChange,
}: {
  applied: Applied;
  onApplied: (id: string, values: string[]) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const isNarrow = useIsNarrowViewport();
  const [detailId, setDetailId] = useState<string | null>(null);
  // À la fermeture, on repart toujours de la vue maître.
  useEffect(() => {
    if (!isOpen) setDetailId(null);
  }, [isOpen]);

  const detailFacet = detailId ? FACETS.find((f) => f.id === detailId) ?? null : null;

  // Résumé de la ligne maître : les valeurs sélectionnées EN TOUTES LETTRES.
  const summaryText = (f: FacetDef): string | null => {
    const vals = applied[f.id] ?? [];
    if (vals.length === 0) return null;
    return vals
      .map((v) => f.options.find((o) => o.value === v)?.label)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement={isNarrow ? "bottom" : "right"}
      size={isNarrow ? "85vh" : "narrow"}
      aria-label="Filtres"
    >
      <div className={css["panel"]}>
        {detailFacet ? (
          <>
            <div className={css["header"]}>
              <button
                type="button"
                className={css["backButton"]}
                aria-label="Retour"
                onClick={() => setDetailId(null)}
              >
                <BackIcon />
              </button>
              <Heading size="small" as="h2" className={css["headerTitle"]}>
                {detailFacet.panelLabel ?? detailFacet.label}
              </Heading>
            </div>

            <div className={css["detailBody"]}>
              <FacetContent
                facet={detailFacet}
                value={applied[detailFacet.id] ?? []}
                onChange={(v) => onApplied(detailFacet.id, v)}
              />
            </div>

            <div className={css["footer"]}>
              <div className={css["footerActions"]}>
                <Button appearance="outlined" onPress={() => onApplied(detailFacet.id, [])}>
                  Effacer
                </Button>
                <Button color="comete" onPress={() => setDetailId(null)}>
                  Appliquer
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={css["header"]}>
              <Heading size="small" as="h2" className={css["headerTitle"]}>
                Filtres
              </Heading>
              <Button
                appearance="subtle"
                iconBefore="Close"
                aria-label="Fermer"
                onPress={() => onOpenChange(false)}
              />
            </div>

            <div className={css["list"]}>
              {FACETS.map((f) => {
                const summary = summaryText(f);
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={css["row"]}
                    onClick={() => setDetailId(f.id)}
                  >
                    <span className={css["rowLabel"]}>{f.panelLabel ?? f.label}</span>
                    {summary && <span className={css["rowValue"]}>{summary}</span>}
                    <Icon icon="ChevronRight" size={20} color="subtle" />
                  </button>
                );
              })}
            </div>

            <div className={css["footer"]}>
              <div>
                <Checkbox label="Mémoriser mes filtres" />
                <div className={css["memorizeDescription"]}>
                  Retrouvez cette sélection à votre prochaine visite.
                </div>
              </div>
              <div className={css["footerActions"]}>
                <Button appearance="outlined" onPress={onClearAll}>
                  Effacer les filtres
                </Button>
                <Button color="comete" onPress={() => onOpenChange(false)}>
                  Appliquer
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

// -----------------------------------------------------------------------
// FilterBar — rangée + panneau complet, état partagé.

function FilterBar({
  initial = {},
  mode = "instant",
  openFacet,
  openAll = false,
}: {
  initial?: Applied;
  mode?: "instant" | "deferred";
  openFacet?: string;
  openAll?: boolean;
}): ReactElement {
  const [applied, setApplied] = useState<Applied>(initial);
  const [drawerOpen, setDrawerOpen] = useState(openAll);
  const setFacet = (id: string, values: string[]) =>
    setApplied((prev) => ({ ...prev, [id]: values }));

  const rowFacets: FilterChipRowFacet[] = FACETS.map((f) => ({
    id: f.id,
    isPinned: f.pinned,
    isActive: (applied[f.id]?.length ?? 0) > 0,
    chip: (
      <FacetChip
        facet={f}
        applied={applied[f.id] ?? []}
        onApplied={(v) => setFacet(f.id, v)}
        mode={mode}
        defaultOpen={openFacet === f.id}
      />
    ),
  }));

  return (
    <>
      <FilterChipRow
        facets={rowFacets}
        totalActiveCount={countAll(applied)}
        onOpenAll={() => setDrawerOpen(true)}
      />
      <AllFiltersDrawer
        applied={applied}
        onApplied={setFacet}
        onClearAll={() => setApplied({})}
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Filtres rapides façon listing : une rangée de chips (une par facette) doublée d'un panneau complet (Drawer). Les chips couvrent les 2–4 facettes les plus utilisées ; le panneau complet donne accès à toutes les facettes.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Exposer les 2–4 facettes les plus fréquentes en accès direct (au-delà : le panneau complet).",
                "Listings où le panneau complet ralentit les filtrages courants.",
              ]}
              avoid={[
                "Plus de 4 facettes épinglées — un `console.warn` le signale en dev.",
                "Une chip par valeur sélectionnée : une chip = une facette (valeur unique affichée, sinon compteur).",
                "Des libellés de facette longs sur la chip : viser 1 mot.",
              ]}
              best={[
                "Règle d'affichage : 0 valeur → chevron ; 1 → « Label : Valeur » ; ≥ 2 → « Label (n) ».",
                "Invariant : la rangée montre TOUJOURS tout ce qui filtre — une facette non épinglée mais active apparaît en chip temporaire (jamais de filtre actif caché).",
                "Application : instantanée en popover (desktop), différée en bottom sheet (mobile) — surchargeable via `applyMode`.",
                "Panneau complet : Drawer à droite en desktop, en bas (bottom sheet) en mobile. Liste défilante, scrollbar visible.",
              ]}
              accessibility={[
                "La chip est un bouton `aria-haspopup=\"dialog\"` + `aria-expanded` ; le compteur/valeur est annoncé.",
                "La croix est une cible distincte au clavier (`aria-label=\"Effacer le filtre Sites\"`).",
              ]}
            />
          }
        />
      ),
    },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof FilterChip>;

// -----------------------------------------------------------------------
// Stories

/**
 * **Rangée** : 3 facettes épinglées illustrant la règle valeur/compteur —
 * « Sites » avec 3 valeurs (compteur), « Types » avec 1 valeur
 * (« Types : Intrusion »), « Date » vide (chevron). Bouton « Filtres » à droite.
 */
export const Row: Story = {
  name: "Rangée (valeur / compteur)",
  render: () => (
    <FilterBar mode="instant" initial={{ sites: ["idf", "paris", "lyon"], types: ["intrusion"] }} />
  ),
};

/**
 * **Panneau ouvert** (pré-ouvert pour capture) : popover de « Types » avec ses
 * options et le pied « Réinitialiser » (mode instantané → pas d'« Appliquer »).
 */
export const PanelOpen: Story = {
  name: "Panneau ouvert (popover)",
  render: () => (
    <FilterBar mode="instant" initial={{ sites: ["idf", "paris", "lyon"] }} openFacet="types" />
  ),
};

/**
 * **Application instantanée** : en popover, cocher une option applique
 * immédiatement (pas de bouton « Appliquer ») et le panneau reste ouvert.
 */
export const InstantApply: Story = {
  name: "Application instantanée (play)",
  render: () => <FilterBar mode="instant" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Types" }));
    await userEvent.click(await body.findByRole("checkbox", { name: "Intrusion" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Effacer le filtre Types" }),
      ).toBeInTheDocument(),
    );
    await expect(body.queryByRole("button", { name: "Appliquer" })).not.toBeInTheDocument();
    await expect(body.getByRole("dialog")).toBeInTheDocument();
  },
};

/**
 * **Chips temporaires** : 6 facettes secondaires en plus des épinglées. Activer
 * une facette dans le panneau complet fait apparaître sa chip temporaire ;
 * l'effacer la fait disparaître — la rangée reflète toujours l'état de filtrage.
 */
export const TemporaryChips: Story = {
  name: "Chips temporaires (play)",
  render: () => <FilterBar mode="instant" initial={{ sites: ["idf"] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Pas de chip « Groupes » au départ (facette secondaire inactive).
    await expect(canvas.queryByRole("button", { name: /Groupes/ })).not.toBeInTheDocument();

    // Ouvrir le panneau complet → maître, naviguer vers le détail « Groupes »,
    // cocher une valeur, revenir (Appliquer) puis fermer (Appliquer).
    await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
    await userEvent.click(await body.findByRole("button", { name: "Groupes" }));
    await userEvent.click(await body.findByRole("checkbox", { name: "Groupe A" }));
    await userEvent.click(await body.findByRole("button", { name: "Appliquer" })); // détail → maître
    await userEvent.click(await body.findByRole("button", { name: "Appliquer" })); // maître → fermé

    // La chip temporaire « Groupes » apparaît dans la rangée…
    const tempChip = await canvas.findByRole("button", { name: /^Groupes/ });
    await expect(tempChip).toBeInTheDocument();

    // …puis on l'efface → elle disparaît.
    await userEvent.click(canvas.getByRole("button", { name: "Effacer le filtre Groupes" }));
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: /^Groupes/ })).not.toBeInTheDocument(),
    );
  },
};

/**
 * **Liste longue (> 15 options)** : le panneau de la facette se plafonne et
 * défile, avec une scrollbar visible (indispensable sur mobile pour signaler
 * qu'il y a plus de contenu). Ici « Sites » compte 22 options.
 */
export const ManyOptions: Story = {
  name: "Liste longue (scroll)",
  render: function ManyOptionsStory() {
    const [applied, setApplied] = useState<string[]>([]);
    const [open, setOpen] = useState(true);
    return (
      <FilterChip
        label="Sites"
        count={applied.length}
        applyMode="instant"
        isOpen={open}
        onOpenChange={setOpen}
        onReset={() => setApplied([])}
        onClear={() => setApplied([])}
      >
        <CheckboxGroup aria-label="Sites" value={applied} onChange={setApplied}>
          {MANY_SITES.map((o) => (
            <Checkbox key={o.value} value={o.value} label={o.label} />
          ))}
        </CheckboxGroup>
      </FilterChip>
    );
  },
};

/**
 * **Mobile** : viewport téléphone. La rangée passe en scroll horizontal (fondu
 * à droite), le panneau d'une facette s'ouvre en **bottom sheet**
 * (`Drawer size="auto"`) en différé, et le **panneau complet** s'ouvre lui aussi
 * en bas (bouton « Filtres »), liste défilante à scrollbar visible.
 */
export const Mobile: Story = {
  name: "Mobile (scroll + bottom sheet)",
  globals: { viewport: { value: "iphonex", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ padding: "var(--space200)" }}>
      <FilterBar
        mode="deferred"
        initial={{ sites: ["idf", "paris", "lyon"], types: ["intrusion"] }}
        openFacet="sites"
      />
    </div>
  ),
};
