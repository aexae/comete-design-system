// FilterChip / FilterChipRow — stories du pattern « filtres rapides » (chips).
import { useState, type ReactElement } from "react";
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
  Drawer,
  Button,
  Heading,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// -----------------------------------------------------------------------
// Facettes de démo

interface Option {
  value: string;
  label: string;
}
interface FacetDef {
  id: string;
  label: string;
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
];
const TYPES: Option[] = [
  { value: "intrusion", label: "Intrusion" },
  { value: "incendie", label: "Incendie" },
  { value: "ronde", label: "Ronde" },
];
const DATES: Option[] = [
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "custom", label: "Personnalisé…" },
];
const STATUTS: Option[] = [
  { value: "ouvert", label: "Ouvert" },
  { value: "clos", label: "Clos" },
];
const PRIORITES: Option[] = [
  { value: "haute", label: "Haute" },
  { value: "basse", label: "Basse" },
];
const AGENTS: Option[] = [
  { value: "a1", label: "Agent 1" },
  { value: "a2", label: "Agent 2" },
];

const FACETS: FacetDef[] = [
  { id: "sites", label: "Sites", multi: true, pinned: true, options: SITES },
  { id: "types", label: "Types", multi: true, pinned: true, options: TYPES },
  { id: "dates", label: "Dates", multi: false, pinned: true, options: DATES },
  { id: "statut", label: "Statut", multi: true, pinned: false, options: STATUTS },
  { id: "priorite", label: "Priorité", multi: false, pinned: false, options: PRIORITES },
  { id: "agent", label: "Agent", multi: true, pinned: false, options: AGENTS },
];

type Applied = Record<string, string[]>;
const countAll = (applied: Applied) =>
  Object.values(applied).reduce((n, v) => n + v.length, 0);

// -----------------------------------------------------------------------
// FacetChip — une facette contrôlée. Gère instant (applique dans onChange) ou
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

  // Source des cases : brouillon en différé, appliqué en instantané.
  const groupValue = isDeferred ? draft : applied;
  const onGroupChange = isDeferred ? setDraft : onApplied;

  // Libellé de la valeur unique (dérivé de l'appliqué).
  const valueLabel =
    applied.length === 1
      ? facet.options.find((o) => o.value === applied[0])?.label
      : undefined;

  const content = facet.multi ? (
    <CheckboxGroup aria-label={facet.label} value={groupValue} onChange={onGroupChange}>
      {facet.options.map((o) => (
        <Checkbox key={o.value} value={o.value} label={o.label} />
      ))}
    </CheckboxGroup>
  ) : (
    <RadioGroup
      aria-label={facet.label}
      value={groupValue[0] ?? ""}
      onChange={(v) => onGroupChange(v ? [v] : [])}
    >
      {facet.options.map((o) => (
        <Radio key={o.value} value={o.value} label={o.label} />
      ))}
    </RadioGroup>
  );

  return (
    <FilterChip
      label={facet.label}
      count={applied.length}
      valueLabel={valueLabel}
      applyMode={mode}
      isOpen={open}
      onOpenChange={(next) => {
        if (next && isDeferred) setDraft(applied); // pré-remplit le brouillon
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
// Panneau complet (mock D13) — permet d'activer TOUTES les facettes, y compris
// non épinglées : c'est ainsi qu'une chip temporaire apparaît.

function AllFiltersDrawer({
  applied,
  onApplied,
  isOpen,
  onOpenChange,
}: {
  applied: Applied;
  onApplied: (id: string, values: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const secondary = FACETS.filter((f) => !f.pinned);
  const activeIds = secondary
    .filter((f) => (applied[f.id]?.length ?? 0) > 0)
    .map((f) => f.id);
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="right"
      size="narrow"
      aria-label="Tous les filtres"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)", padding: "var(--space300)" }}>
        <Heading size="small" as="h2">
          Tous les filtres
        </Heading>
        <CheckboxGroup
          aria-label="Facettes secondaires"
          value={activeIds}
          onChange={(ids) => {
            secondary.forEach((f) => {
              const nowActive = ids.includes(f.id);
              const wasActive = (applied[f.id]?.length ?? 0) > 0;
              if (nowActive && !wasActive) onApplied(f.id, [f.options[0].value]);
              if (!nowActive && wasActive) onApplied(f.id, []);
            });
          }}
        >
          {secondary.map((f) => (
            <Checkbox key={f.id} value={f.id} label={f.label} />
          ))}
        </CheckboxGroup>
        <Button color="comete" onPress={() => onOpenChange(false)}>
          Fermer
        </Button>
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
          "Filtres rapides façon listing : une rangée de chips, une chip par facette. Complète le panneau de filtres complet (Drawer) — les chips couvrent les 2–4 facettes les plus utilisées.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Exposer les 2–4 facettes les plus fréquentes en accès direct (au-delà : le Drawer complet).",
                "Listings où le Drawer complet ralentit les filtrages courants.",
              ]}
              avoid={[
                "Plus de 4 facettes épinglées — un `console.warn` le signale en dev.",
                "Une chip par valeur sélectionnée : une chip = une facette (valeur unique affichée, sinon compteur).",
                "Des libellés de facette longs : viser 1 mot.",
              ]}
              best={[
                "Règle d'affichage : 0 valeur → chevron ; 1 → « Label : Valeur » ; ≥ 2 → « Label (n) ».",
                "Invariant : la rangée montre TOUJOURS tout ce qui filtre — une facette non épinglée mais active apparaît en chip temporaire (jamais de filtre actif caché).",
                "Application : instantanée en popover (desktop), différée en bottom sheet (mobile) — surchargeable via `applyMode`.",
                "La croix (×) efface toute la facette ; le bouton « Filtres » porte le total et ouvre le panneau complet.",
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
 * (« Types : Intrusion »), « Dates » vide (chevron). Bouton « Filtres » à droite.
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
    // Appliqué sans « Appliquer » → la chip devient active (croix présente)…
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Effacer le filtre Types" }),
      ).toBeInTheDocument(),
    );
    // …et il n'y a pas de bouton « Appliquer », le panneau reste ouvert.
    await expect(body.queryByRole("button", { name: "Appliquer" })).not.toBeInTheDocument();
    await expect(body.getByRole("dialog")).toBeInTheDocument();
  },
};

/**
 * **Chips temporaires** : 6 facettes, 3 épinglées. Activer une facette
 * secondaire dans le panneau complet fait apparaître sa chip ; l'effacer la
 * fait disparaître — la rangée reflète toujours l'état de filtrage.
 */
export const TemporaryChips: Story = {
  name: "Chips temporaires (play)",
  render: () => <FilterBar mode="instant" initial={{ sites: ["idf"] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Pas de chip « Priorité » au départ (facette secondaire inactive).
    await expect(canvas.queryByRole("button", { name: /Priorité/ })).not.toBeInTheDocument();

    // Ouvrir le panneau complet, activer « Priorité », fermer.
    await userEvent.click(canvas.getByRole("button", { name: /Filtres/ }));
    await userEvent.click(await body.findByRole("checkbox", { name: "Priorité" }));
    await userEvent.click(body.getByRole("button", { name: "Fermer" }));

    // La chip temporaire « Priorité » apparaît dans la rangée…
    const tempChip = await canvas.findByRole("button", { name: /^Priorité/ });
    await expect(tempChip).toBeInTheDocument();

    // …puis on l'efface → elle disparaît.
    await userEvent.click(canvas.getByRole("button", { name: "Effacer le filtre Priorité" }));
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: /^Priorité/ })).not.toBeInTheDocument(),
    );
  },
};

/**
 * **Mobile** : viewport téléphone. La rangée passe en scroll horizontal (fondu
 * à droite) et le panneau d'une facette s'ouvre en **bottom sheet**
 * (`Drawer size="auto"`, hauteur cadrée sur le contenu) en mode différé.
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
