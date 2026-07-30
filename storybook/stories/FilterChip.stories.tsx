// FilterChip — stories du pattern « filtres rapides » (chips façon listing).
import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, waitFor } from "storybook/test";
import {
  FilterChip,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import css from "./FilterChip.stories.module.css";

// -----------------------------------------------------------------------
// Données de démo

const SITES = [
  { value: "idf", label: "Île-de-France" },
  { value: "paris", label: "Paris Centre" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
];
const TYPES = [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "interim", label: "Intérim" },
];
const DATES = [
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "custom", label: "Personnalisé…" },
];

// -----------------------------------------------------------------------
// Facettes contrôlées — l'état des valeurs appliquées est remonté au parent
// (row), le brouillon (draft) reste local à la chip jusqu'à « Appliquer ».

interface MultiFacetProps {
  label: string;
  options: { value: string; label: string }[];
  applied: string[];
  onAppliedChange: (values: string[]) => void;
  defaultOpen?: boolean;
}

function MultiFacet({
  label,
  options,
  applied,
  onAppliedChange,
  defaultOpen = false,
}: MultiFacetProps): ReactElement {
  const [draft, setDraft] = useState<string[]>(applied);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <FilterChip
      label={label}
      count={applied.length}
      isOpen={open}
      onOpenChange={(next) => {
        if (next) setDraft(applied); // pré-coche la sélection appliquée
        setOpen(next);
      }}
      onApply={() => {
        onAppliedChange(draft);
        setOpen(false);
      }}
      onReset={() => setDraft([])}
      onClear={() => onAppliedChange([])}
    >
      <CheckboxGroup aria-label={label} value={draft} onChange={setDraft}>
        {options.map((o) => (
          <Checkbox key={o.value} value={o.value} label={o.label} />
        ))}
      </CheckboxGroup>
    </FilterChip>
  );
}

interface SingleFacetProps extends Omit<MultiFacetProps, "defaultOpen"> {
  defaultOpen?: boolean;
}

function SingleFacet({
  label,
  options,
  applied,
  onAppliedChange,
  defaultOpen = false,
}: SingleFacetProps): ReactElement {
  const [draft, setDraft] = useState<string>(applied[0] ?? "");
  const [open, setOpen] = useState(defaultOpen);
  return (
    <FilterChip
      label={label}
      count={applied.length}
      isOpen={open}
      onOpenChange={(next) => {
        if (next) setDraft(applied[0] ?? "");
        setOpen(next);
      }}
      onApply={() => {
        onAppliedChange(draft ? [draft] : []);
        setOpen(false);
      }}
      onReset={() => setDraft("")}
      onClear={() => onAppliedChange([])}
    >
      <RadioGroup aria-label={label} value={draft} onChange={setDraft}>
        {options.map((o) => (
          <Radio key={o.value} value={o.value} label={o.label} />
        ))}
      </RadioGroup>
    </FilterChip>
  );
}

// -----------------------------------------------------------------------
// Rangée de filtres — Sites (multi), Types (multi), Dates (simple)

type Applied = { sites: string[]; types: string[]; dates: string[] };

function FilterRow({
  initial = { sites: [], types: [], dates: [] },
  openFacet,
}: {
  initial?: Applied;
  openFacet?: keyof Applied;
}): ReactElement {
  const [applied, setApplied] = useState<Applied>(initial);
  const set = (key: keyof Applied) => (values: string[]) =>
    setApplied((prev) => ({ ...prev, [key]: values }));
  const total = applied.sites.length + applied.types.length + applied.dates.length;

  return (
    <div className={css["frame"]}>
      <div className={css["row"]}>
        <MultiFacet
          label="Sites"
          options={SITES}
          applied={applied.sites}
          onAppliedChange={set("sites")}
          defaultOpen={openFacet === "sites"}
        />
        <MultiFacet
          label="Types"
          options={TYPES}
          applied={applied.types}
          onAppliedChange={set("types")}
          defaultOpen={openFacet === "types"}
        />
        <SingleFacet
          label="Dates"
          options={DATES}
          applied={applied.dates}
          onAppliedChange={set("dates")}
          defaultOpen={openFacet === "dates"}
        />
        {total > 0 && (
          <Button
            appearance="link"
            density="compact"
            onPress={() => setApplied({ sites: [], types: [], dates: [] })}
          >
            Tout effacer
          </Button>
        )}
      </div>
    </div>
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
          "Filtres rapides façon listing : une rangée de chips sous la toolbar, une chip par facette. Complète le Drawer de filtres complet — les chips couvrent les 2–4 facettes les plus utilisées, le Drawer reste l'accès à tout.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Exposer les 2–4 facettes les plus fréquentes (mesurées à l'usage) en accès direct.",
                "Listings avec facettes multiples où le Drawer complet ralentit les filtrages courants.",
              ]}
              avoid={[
                "Mettre TOUTES les facettes en chips — au-delà de 2–4, ça devient illisible : garder le Drawer.",
                "Une chip par valeur sélectionnée : une chip = une facette, les valeurs sont agrégées en compteur (pas le pattern Tag-par-valeur).",
                "Des libellés de facette longs : viser 1 mot (« Sites », « Types », « Dates »).",
              ]}
              best={[
                "Chip active = surbrillance + compteur + croix ; la croix efface toute la facette d'un coup.",
                "Appliquer explicitement (bouton « Appliquer »), pas au fil de l'eau.",
                "Chips et Drawer partagent le même état : appliquer dans l'un se reflète dans l'autre.",
                "Sous 480px : rangée en scroll horizontal et panneau en bottom sheet.",
              ]}
              accessibility={[
                "La chip est un bouton `aria-haspopup=\"dialog\"` + `aria-expanded` ; le compteur est annoncé (« Sites, 3 filtres actifs »).",
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
 * **Rangée de filtres** : « Sites » actif (3 valeurs, surbrillance + compteur +
 * croix), « Types » (multi) et « Dates » (simple) inactifs. Le lien « Tout
 * effacer » apparaît dès qu'au moins une facette est active.
 */
export const Row: Story = {
  name: "Rangée (1 active, 2 inactives)",
  render: () => <FilterRow initial={{ sites: ["idf", "paris", "lyon"], types: [], dates: [] }} />,
};

/**
 * **Panneau ouvert** (pré-ouvert pour capture) : le popover de « Types » montre
 * les options (checkboxes) et le pied « Réinitialiser » / « Appliquer ».
 */
export const PanelOpen: Story = {
  name: "Panneau ouvert (popover)",
  render: () => (
    <FilterRow initial={{ sites: ["idf", "paris", "lyon"], types: [], dates: [] }} openFacet="types" />
  ),
};

/**
 * **Mobile** : sous 480px la rangée passe en scroll horizontal (fondu à droite)
 * et le panneau s'ouvre en **bottom sheet** (Drawer) au lieu du popover.
 */
export const Mobile: Story = {
  name: "Mobile (scroll + bottom sheet)",
  globals: { viewport: { value: "iphonex", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ width: 320, padding: "var(--space200)" }}>
      <FilterRow
        initial={{ sites: ["idf", "paris", "lyon"], types: ["cdi"], dates: [] }}
        openFacet="sites"
      />
    </div>
  ),
};

/**
 * **Interactions** : ouvrir → cocher → Appliquer (la chip devient active avec
 * son compteur), puis croix (retour à l'état inactif).
 *
 * NB : la fermeture par **Échap** / **clic hors zone** (sans appliquer) est
 * fournie par `Popup`/`Drawer` (react-aria) et vérifiée manuellement ; elle
 * n'est pas rejouée ici car le dismiss react-aria ne réagit qu'aux événements
 * clavier de confiance, non aux frappes synthétiques du test runner.
 */
export const Interactions: Story = {
  name: "Interactions (play)",
  render: () => <FilterRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // 1. Ouvrir « Types », cocher CDD, Appliquer → chip active « Types, 1… ».
    await userEvent.click(canvas.getByRole("button", { name: "Types" }));
    await userEvent.click(await body.findByRole("checkbox", { name: "CDD" }));
    await userEvent.click(await body.findByRole("button", { name: "Appliquer" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Types, 1 filtre actif" }),
      ).toBeInTheDocument(),
    );

    // 2. Croix → la facette redevient inactive (toutes les valeurs effacées).
    await userEvent.click(
      canvas.getByRole("button", { name: "Effacer le filtre Types" }),
    );
    await expect(canvas.getByRole("button", { name: "Types" })).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Effacer le filtre Types" }),
    ).not.toBeInTheDocument();
  },
};
