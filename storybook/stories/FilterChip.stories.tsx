// FilterChip / FilterChipRow — stories du pattern « filtres rapides » (chips).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterChip } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { FilterBar } from "./_filterDemo";

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
                "Panneau complet : Drawer à droite en desktop, en bas (bottom sheet) en mobile. Liste défilante, scrollbar au survol.",
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
 * **Mobile** : viewport téléphone. La rangée passe en scroll horizontal, le
 * panneau d'une facette s'ouvre en **bottom sheet** (`Drawer size="auto"`) en
 * différé, et le **panneau complet** s'ouvre lui aussi en bas (bouton
 * « Filtres »), liste défilante à scrollbar révélée au survol.
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
