// Pagination — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { Pagination } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "La pagination permet de naviguer entre les pages d'une liste ou d'un tableau : précédente / suivante encadrent des pages numérotées, avec « … » pour les pages masquées. Pour un tableau, `TablePagination` la compose avec « Résultats par page » et la plage affichée.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Un jeu de résultats découpé en pages (tableau, liste, galerie).",
                "Quand l'utilisateur doit pouvoir atteindre directement la première, la dernière ou une page voisine.",
              ]}
              avoid={[
                "Un défilement continu ou un « Voir plus » → pas de pagination.",
                "Moins de deux pages : le composant ne rend rien.",
              ]}
              best={[
                "Toujours afficher la plage et le total à côté (« 1 à 25 sur 248 ») — `TablePagination` le fait.",
                "Garder le même nombre d'emplacements (7 au plus) : la barre ne bouge pas quand on change de page.",
              ]}
              accessibility={[
                "Repère `nav` nommé (`aria-label`, « Pagination » par défaut) ; nommer chaque instance s'il y en a plusieurs sur la page.",
                "La page courante porte `aria-current=\"page\"` ; chaque bouton a un nom (« Page 3 », « Page suivante »).",
                "Précédente / suivante sont désactivées aux extrémités, jamais masquées.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
  },
  argTypes: {
    page: { control: { type: "number", min: 0 } },
    pageCount: { control: { type: "number", min: 0 } },
    density: { control: "inline-radio", options: ["compact", "default", "touch"] },
    onPageChange: { action: "pageChange" },
  },
  args: { page: 0, pageCount: 10 },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof Pagination>;

// -----------------------------------------------------------------------
// Stories

/** Pagination contrôlée — clique les pages, les flèches ou joue avec les contrôles. */
export const Default: Story = {
  render: function DefaultStory(args) {
    const [page, setPage] = useState(args.page);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** Peu de pages (≤ 7) : toutes sont affichées, sans ellipse. */
export const FewPages: Story = {
  name: "Few pages",
  args: { pageCount: 5 },
  render: function FewPagesStory(args) {
    const [page, setPage] = useState(2);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** Beaucoup de pages : 7 emplacements, la barre garde sa largeur d'une page à l'autre. */
export const ManyPages: Story = {
  name: "Many pages",
  args: { pageCount: 50 },
  render: function ManyPagesStory(args) {
    const [page, setPage] = useState(24);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** Trois densités — la taille des boutons suit celle du composant parent. */
export const Densities: Story = {
  parameters: { controls: { disable: true } },
  render: function DensitiesStory() {
    const [page, setPage] = useState(3);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space200)" }}>
        {(["compact", "default", "touch"] as const).map((density) => (
          <Pagination
            key={density}
            density={density}
            aria-label={`Pagination ${density}`}
            page={page}
            pageCount={12}
            onPageChange={setPage}
          />
        ))}
      </div>
    );
  },
};

// Test (masqué du sidebar) : navigation précédente / suivante / page directe.
export const Interactions: Story = {
  tags: ["!dev"],
  render: function InteractionsStory() {
    const [page, setPage] = useState(0);
    return <Pagination page={page} pageCount={10} onPageChange={setPage} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = () => canvas.getByRole("button", { current: "page" });

    await expect(current()).toHaveAccessibleName("Page 1");
    await expect(canvas.getByRole("button", { name: "Page précédente" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "Page suivante" }));
    await expect(current()).toHaveAccessibleName("Page 2");

    await userEvent.click(canvas.getByRole("button", { name: "Page 4" }));
    await expect(current()).toHaveAccessibleName("Page 4");

    await userEvent.click(canvas.getByRole("button", { name: "Page 10" }));
    await expect(current()).toHaveAccessibleName("Page 10");
    await expect(canvas.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  },
};
