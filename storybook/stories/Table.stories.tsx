// Table — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { within, userEvent, expect, fn } from "storybook/test";
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  List,
  ListItemButton,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TablePagination,
  TableRow,
  Tag,
  Text,
  type TableSortDirection,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import css from "./Table.stories.module.css";

// -----------------------------------------------------------------------
// Figma links

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Les tableaux organisent des données structurées en lignes et colonnes pour faciliter la comparaison et l'analyse. Ils supportent le tri, la pagination et la sélection pour manipuler de grands jeux de données." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <>
            <GuidelinesFlat
              doExample={{
                example: (
                  <Table aria-label="Projets">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Projet</TableHeaderCell>
                        <TableHeaderCell>Statut</TableHeaderCell>
                        <TableHeaderCell>Responsable</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Alpha</TableCell>
                        <TableCell>
                          <Tag label="Actif" appearance="subtle" />
                        </TableCell>
                        <TableCell>John Doe</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Beta</TableCell>
                        <TableCell>
                          <Tag label="En attente" appearance="subtle" />
                        </TableCell>
                        <TableCell>Jane Smith</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ),
                caption: "Comparer des données sur plusieurs colonnes.",
              }}
              dontExample={{
                example: (
                  <Table aria-label="Agents">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Agent</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>John Doe</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jane Smith</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Alice Chen</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ),
                caption: "Ne pas l'utiliser pour une seule colonne.",
              }}
              when={[
                "Afficher des données tabulaires comparables sur plusieurs colonnes (listes d'entités, rapports).",
                "Quand l'utilisateur doit trier, scanner ou comparer des lignes entre elles.",
                "Associer TablePagination pour les grands jeux de données et Table.View pour un en-tête (toolbar) + pied.",
              ]}
              avoid={[
                "Une seule dimension d'information par ligne → préférer List.",
                "De la mise en page générale → utiliser Grid ou Stack.",
              ]}
              best={[
                "Aligner les nombres à droite (`align=\"right\"`) et le texte à gauche.",
                "Colonnes triables via `isSortable` + `aria-sort` ; densité `compact` pour les vues denses.",
                "Le divider bas disparaît quand un footer/pagination est présent (géré par Table.View).",
                "Responsive (`hideBelow`, container queries) : `<Table responsive>` (établit le query container ; requiert une largeur définie, pas un parent shrink-to-fit). Priorisez — identifiant + donnée clé toujours visibles (jamais de `hideBelow`), colonnes de contexte en `md`, colonnes de confort en `lg`. Poser `hideBelow` sur l'en-tête ET chaque cellule de la même colonne.",
                "Une info masquée doit rester accessible : ligne cliquable vers le détail, ou vue cartes. Le tri d'une colonne masquée reste actif côté données — au consommateur de décider s'il le réinitialise.",
                "Sous ~600px de container, ne compressez PAS la table : passez en liste compacte (`List` : titre en primary, site/méta en secondary, tag de statut + heure en trailing — le pattern Main courante mobile). Une table à 2 colonnes tronquées rend moins service qu'une ligne de liste dense. Les cartes sont la vue alternative (bascule liste/cartes), pas le repli par défaut. La story *Responsive columns* montre cette limite (600px = 2 colonnes étirées) ; la story *Table → List* montre le repli.",
                "En liste (repli étroit), il n'y a plus d'en-têtes : le tri passe dans un contrôle « Trier par » au-dessus de la liste ; la sélection multiple par case par ligne ou appui long (à brancher sur le hook de sélection).",
                "Statut → couleur (D12) : Actif → success, Pause → warning, Hors ligne → neutral. En méta compacte, l'heure seule aujourd'hui, et uniquement le jour (« Hier ») pour un jour antérieur — pour ne pas fausser la fraîcheur.",
              ]}
              accessibility={[
                "En-têtes de colonnes (TableHeaderCell) reliés aux cellules ; navigation au clavier.",
                "`align=\"right\"` pour les nombres ; l'état de tri est annoncé (`aria-sort`).",
                "Jamais de `hideBelow` sur la colonne de sélection ni la colonne d'actions (elles restent toujours visibles).",
              ]}
            />
            <ResponsiveDocSection />
            </>
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4765:3311") },
  },
  argTypes: {
    density: {
      control: "select",
      options: ["compact", "default", "touch"],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof Table>;

// -----------------------------------------------------------------------
// Données de démo

interface Row {
  id: string;
  title: string;
  status: "Actif" | "En attente" | "Suspendu";
  user: string;
  key: string;
}

const ROWS: Row[] = [
  { id: "1", title: "Alpha project", status: "Actif", user: "John Doe", key: "CODE-001" },
  { id: "2", title: "Beta launch", status: "En attente", user: "Jane Smith", key: "CODE-002" },
  { id: "3", title: "Gamma release", status: "Actif", user: "Alice Chen", key: "CODE-003" },
  { id: "4", title: "Delta review", status: "Suspendu", user: "Bob Martin", key: "CODE-004" },
  { id: "5", title: "Epsilon deploy", status: "Actif", user: "Sophie Claire", key: "CODE-005" },
];

const STATUS_APPEARANCE: Record<Row["status"], "subtle" | "bold"> = {
  Actif: "subtle",
  "En attente": "subtle",
  Suspendu: "subtle",
};

// -----------------------------------------------------------------------
// Stories

/** Table basique — en-tête + 5 lignes. */
export const Default: Story = {
  render: (args) => (
    <Table {...args} aria-label="Projets">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Key</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.title}</TableCell>
            <TableCell>
              <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} shape="rounded" />
            </TableCell>
            <TableCell>{r.user}</TableCell>
            <TableCell>{r.key}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Colonnes triables — clic sur l'en-tête cycle default → asc → desc. */
export const Sortable: Story = {
  render: function SortableStory(args) {
    type Column = "title" | "status" | "user" | "key";
    const [sortColumn, setSortColumn] = useState<Column | null>("title");
    const [direction, setDirection] = useState<TableSortDirection>("ascending");

    const onSortChange = (col: Column) => (next: TableSortDirection) => {
      if (next === "default") {
        setSortColumn(null);
        setDirection("default");
      } else {
        setSortColumn(col);
        setDirection(next);
      }
    };

    const sorted = useMemo(() => {
      if (!sortColumn || direction === "default") return ROWS;
      const copy = [...ROWS];
      copy.sort((a, b) => {
        const av = a[sortColumn];
        const bv = b[sortColumn];
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return direction === "ascending" ? cmp : -cmp;
      });
      return copy;
    }, [sortColumn, direction]);

    const dir = (col: Column): TableSortDirection =>
      sortColumn === col ? direction : "default";

    return (
      <Table {...args} aria-label="Projets triés">
        <TableHead>
          <TableRow>
            <TableHeaderCell
              isSortable
              sortDirection={dir("title")}
              onSortChange={onSortChange("title")}
            >
              Title
            </TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("status")}
              onSortChange={onSortChange("status")}
            >
              Status
            </TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("user")}
              onSortChange={onSortChange("user")}
            >
              User
            </TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("key")}
              onSortChange={onSortChange("key")}
            >
              Key
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.title}</TableCell>
              <TableCell>
                <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} shape="rounded" />
              </TableCell>
              <TableCell>{r.user}</TableCell>
              <TableCell>{r.key}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * Sélection multiple — checkbox par ligne + checkbox `select all` dans
 * l'en-tête. L'état `isSelected` sur `TableRow` donne le fond visuel
 * de sélection.
 */
export const WithSelection: Story = {
  name: "With selection",
  render: function SelectionStory(args) {
    const [selected, setSelected] = useState<Set<string>>(new Set(["1", "3"]));
    const allSelected = selected.size === ROWS.length;
    const someSelected = selected.size > 0 && !allSelected;

    const toggleOne = (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const toggleAll = () => {
      if (allSelected) setSelected(new Set());
      else setSelected(new Set(ROWS.map((r) => r.id)));
    };

    return (
      <Table {...args} aria-label="Sélection multiple">
        <TableHead>
          <TableRow>
            <TableHeaderCell width={40}>
              <Checkbox
                aria-label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                isChecked={allSelected}
                isIndeterminate={someSelected}
                onChange={toggleAll}
              />
            </TableHeaderCell>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>User</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROWS.map((r) => {
            const isSelected = selected.has(r.id);
            return (
              <TableRow key={r.id} isSelected={isSelected}>
                <TableCell>
                  <Checkbox
                    aria-label={`Sélectionner ${r.title}`}
                    isChecked={isSelected}
                    onChange={() => toggleOne(r.id)}
                  />
                </TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Tag
                    label={r.status}
                    appearance={STATUS_APPEARANCE[r.status]}
                    shape="rounded"
                  />
                </TableCell>
                <TableCell>{r.user}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  },
};

/**
 * Cellules riches — Avatar + texte, Tag de statut, colonne d'actions
 * (bouton icône) alignée à droite avec largeur fixe.
 */
export const RichCells: Story = {
  name: "Rich cells",
  render: (args) => (
    <Table {...args} aria-label="Membres">
      <TableHead>
        <TableRow>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Key</TableHeaderCell>
          {/* Colonne d'actions : pas de libellé visible mais un nom accessible
              (« Actions »), au lieu d'un placeholder vide inaccessible. */}
          <TableHeaderCell width={60} isActionColumn>Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space100)",
                }}
              >
                <Avatar
                  size="medium"
                  initials={r.user
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                />
                {r.user}
              </span>
            </TableCell>
            <TableCell>
              <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} shape="rounded" />
            </TableCell>
            <TableCell>{r.key}</TableCell>
            <TableCell align="center">
              <Button
                appearance="subtle"
                density="compact"
                iconBefore="MoreVert"
                aria-label={`Actions pour ${r.title}`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Lignes cliquables — chaque ligne appelle `onClick` (typiquement pour
 * ouvrir un détail dans un panel latéral). Le hover est plus prononcé
 * et le curseur passe en pointer.
 */
export const ClickableRows: Story = {
  name: "Clickable rows",
  render: function ClickableStory(args) {
    const [openedRow, setOpenedRow] = useState<string | null>(null);
    return (
      <div>
        <Table {...args} aria-label="Lignes cliquables">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Key</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow
                key={r.id}
                isSelected={openedRow === r.id}
                onClick={() =>
                  setOpenedRow((prev) => (prev === r.id ? null : r.id))
                }
              >
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Tag
                    label={r.status}
                    appearance={STATUS_APPEARANCE[r.status]}
                    shape="rounded"
                  />
                </TableCell>
                <TableCell>{r.user}</TableCell>
                <TableCell>{r.key}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p
          style={{
            marginTop: "var(--space200)",
            color: "var(--text-subtle)",
            fontSize: "var(--font-size-ui-xs)",
          }}
        >
          Ligne ouverte :{" "}
          <strong>
            {openedRow ? ROWS.find((r) => r.id === openedRow)?.title : "(aucune)"}
          </strong>
        </p>
      </div>
    );
  },
};

/**
 * Densité — 3 niveaux (compact / default / touch) impactent la hauteur
 * de ligne. À contrôler via le toolbar Storybook `args.density`.
 */
export const DensityCompact: Story = {
  name: "Density — compact",
  args: { density: "compact" },
  render: Default.render,
};

export const DensityTouch: Story = {
  name: "Density — touch",
  args: { density: "touch" },
  render: Default.render,
};

/** Alignement de colonne — left (défaut), center, right. */
export const Alignment: Story = {
  render: (args) => (
    <Table {...args} aria-label="Alignements">
      <TableHead>
        <TableRow>
          <TableHeaderCell align="left">Left</TableHeaderCell>
          <TableHeaderCell align="center">Center</TableHeaderCell>
          <TableHeaderCell align="right">Right</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell align="left">Alpha</TableCell>
          <TableCell align="center">42</TableCell>
          <TableCell align="right">1 234,56 €</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Beta</TableCell>
          <TableCell align="center">7</TableCell>
          <TableCell align="right">99,00 €</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Gamma</TableCell>
          <TableCell align="center">128</TableCell>
          <TableCell align="right">2 500,00 €</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/**
 * Combinaison complète — sélection + tri + actions par ligne + colonnes
 * de largeurs variées. Représentatif d'une page « liste » typique.
 */
export const AllInOne: Story = {
  name: "All-in-one",
  render: function AllInOneStory(args) {
    type Column = "title" | "user" | "key";
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [sortColumn, setSortColumn] = useState<Column | null>(null);
    const [direction, setDirection] = useState<TableSortDirection>("default");

    const onSortChange = (col: Column) => (next: TableSortDirection) => {
      if (next === "default") {
        setSortColumn(null);
        setDirection("default");
      } else {
        setSortColumn(col);
        setDirection(next);
      }
    };

    const sorted = useMemo(() => {
      if (!sortColumn || direction === "default") return ROWS;
      const copy = [...ROWS];
      copy.sort((a, b) => {
        const cmp = a[sortColumn] < b[sortColumn] ? -1 : 1;
        return direction === "ascending" ? cmp : -cmp;
      });
      return copy;
    }, [sortColumn, direction]);

    const dir = (col: Column): TableSortDirection =>
      sortColumn === col ? direction : "default";

    const allSelected = selected.size === ROWS.length;
    const someSelected = selected.size > 0 && !allSelected;

    return (
      <Table {...args} aria-label="Utilisateurs">
        <TableHead>
          <TableRow>
            <TableHeaderCell width={40}>
              <Checkbox
                aria-label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                isChecked={allSelected}
                isIndeterminate={someSelected}
                onChange={() =>
                  setSelected(
                    allSelected ? new Set() : new Set(ROWS.map((r) => r.id)),
                  )
                }
              />
            </TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("title")}
              onSortChange={onSortChange("title")}
            >
              Title
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("user")}
              onSortChange={onSortChange("user")}
            >
              User
            </TableHeaderCell>
            <TableHeaderCell
              isSortable
              sortDirection={dir("key")}
              onSortChange={onSortChange("key")}
              align="right"
            >
              Key
            </TableHeaderCell>
            <TableHeaderCell width={60} isActionColumn>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r) => {
            const isSelected = selected.has(r.id);
            return (
              <TableRow key={r.id} isSelected={isSelected}>
                <TableCell>
                  <Checkbox
                    aria-label={`Sélectionner ${r.title}`}
                    isChecked={isSelected}
                    onChange={() => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(r.id)) next.delete(r.id);
                        else next.add(r.id);
                        return next;
                      });
                    }}
                  />
                </TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Tag
                    label={r.status}
                    appearance={STATUS_APPEARANCE[r.status]}
                    shape="rounded"
                  />
                </TableCell>
                <TableCell>{r.user}</TableCell>
                <TableCell align="right">{r.key}</TableCell>
                <TableCell align="center">
                  <Button
                    appearance="subtle"
                    density="compact"
                    iconBefore="MoreVert"
                    aria-label={`Actions pour ${r.title}`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  },
};

/**
 * Sélection multiple avec toolbar contextuelle — pattern d'action bar
 * par-dessus la table quand des lignes sont sélectionnées (compte du
 * nombre de lignes + actions bulk).
 */
export const SelectionToolbar: Story = {
  name: "Selection toolbar",
  render: function ToolbarStory(args) {
    const [selected, setSelected] = useState<Set<string>>(new Set(["1", "2"]));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space150)" }}>
        <Table.SelectionBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
        >
          <Button appearance="subtle" iconBefore="Delete">
            Supprimer
          </Button>
        </Table.SelectionBar>
        <Table {...args} aria-label="Table avec toolbar">
          <TableHead>
            <TableRow>
              <TableHeaderCell width={40}>
                <Checkbox
                  aria-label="Tout sélectionner"
                  isChecked={selected.size === ROWS.length}
                  isIndeterminate={
                    selected.size > 0 && selected.size < ROWS.length
                  }
                  onChange={() =>
                    setSelected(
                      selected.size === ROWS.length
                        ? new Set()
                        : new Set(ROWS.map((r) => r.id)),
                    )
                  }
                />
              </TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ROWS.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <TableRow key={r.id} isSelected={isSelected}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Sélectionner ${r.title}`}
                      isChecked={isSelected}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(r.id)) next.delete(r.id);
                          else next.add(r.id);
                          return next;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    <Tag
                      label={r.status}
                      appearance={STATUS_APPEARANCE[r.status]}
                      shape="rounded"
                    />
                  </TableCell>
                  <TableCell>{r.user}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  },
};

// -----------------------------------------------------------------------
// Dataset large — utilisé par Virtualized et WithPagination

interface LargeRow {
  id: number;
  title: string;
  status: Row["status"];
  user: string;
  key: string;
}

const USERS = ["John Doe", "Jane Smith", "Alice Chen", "Bob Martin", "Sophie Claire"];
const STATUSES: Row["status"][] = ["Actif", "En attente", "Suspendu"];

const LARGE_DATASET: LargeRow[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  title: `Projet ${String(i + 1).padStart(3, "0")}`,
  status: STATUSES[i % STATUSES.length],
  user: USERS[i % USERS.length],
  key: `CODE-${String(i + 1).padStart(4, "0")}`,
}));

/**
 * Virtualized — équivalent Comète de l'exemple MUI "Virtualized Table".
 * 200 lignes rendues dans un container scrollable à hauteur fixe, avec un
 * `<thead>` sticky. Pas de librairie externe : le browser gère la fenêtre
 * de rendu. Pour un vrai windowing, brancher `react-virtuoso` ou
 * `react-window` par-dessus les mêmes primitives `TableRow` / `TableCell`.
 */
export const Virtualized: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4765:3311") } },
  render: (args) => (
    // En-tête collant + hauteur bornée gérés nativement par la Table
    // (`stickyHeader` + `maxHeight`) — plus de wrapper ni de styles inline.
    <Table
      {...args}
      aria-label="Large dataset — 200 lignes"
      stickyHeader
      maxHeight={400}
    >
      <TableHead>
        <TableRow>
          <TableHeaderCell width={80}>#</TableHeaderCell>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Key</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {LARGE_DATASET.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.id}</TableCell>
            <TableCell>{r.title}</TableCell>
            <TableCell>
              <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} shape="rounded" />
            </TableCell>
            <TableCell>{r.user}</TableCell>
            <TableCell>{r.key}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * WithPagination — 200 lignes découpées par `TablePagination`. Le parent
 * garde l'état `page` / `rowsPerPage` et slice le dataset lui-même.
 */
export const WithPagination: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4765:3311") } },
  render: function WithPaginationStory(args) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paged = useMemo(
      () => LARGE_DATASET.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
      [page, rowsPerPage],
    );

    return (
      <div>
        <Table {...args} aria-label="Projets paginés">
          <TableHead>
            <TableRow>
              <TableHeaderCell width={80}>#</TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Key</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} shape="rounded" />
                </TableCell>
                <TableCell>{r.user}</TableCell>
                <TableCell>{r.key}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          count={LARGE_DATASET.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
          }}
        />
      </div>
    );
  },
};

// -----------------------------------------------------------------------
// États natifs (chargement / vide / erreur)
//
// Le consommateur ne compose pas ces états à la main : il passe `isLoading`,
// `isEmpty` ou `error` à `TableBody` (+ `columnCount` pour l'empan). Priorité :
// error > isLoading > isEmpty > children.

const noop = () => undefined;

/**
 * En-tête commun aux stories d'états — mêmes colonnes que la story
 * `WithPagination` (colonne `#` + Title / Status / User / Key).
 */
function StatesHead() {
  return (
    <TableHead>
      <TableRow>
        <TableHeaderCell width={80}>#</TableHeaderCell>
        <TableHeaderCell>Title</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell>User</TableHeaderCell>
        <TableHeaderCell>Key</TableHeaderCell>
      </TableRow>
    </TableHead>
  );
}

/**
 * **Chargement** — même gabarit qu'un listing paginé (5 colonnes + footer de
 * pagination) : la coquille reste en place, seules les lignes passent en
 * skeleton via `isLoading`.
 */
export const LoadingState: Story = {
  name: "Loading",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 640 }}>
      <Table aria-label="Projets (chargement)" style={{ width: "100%" }}>
        <StatesHead />
        <TableBody isLoading columnCount={5} skeletonRows={10} />
      </Table>
      <TablePagination
        count={200}
        page={0}
        rowsPerPage={10}
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={noop}
        onRowsPerPageChange={noop}
      />
    </div>
  ),
};

/** **Vide** — état vide natif via `isEmpty` (illustration + message), sur le même gabarit. */
export const EmptyState: Story = {
  name: "Empty",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 640 }}>
      <Table aria-label="Projets (vide)" style={{ width: "100%" }}>
        <StatesHead />
        <TableBody
          isEmpty
          columnCount={5}
          emptyTitle="Aucun projet"
          emptyDescription="Créez un premier projet pour commencer."
        />
      </Table>
    </div>
  ),
};

/**
 * **Aucun résultat** — une recherche/un filtre ne renvoie rien (`isNoResults`),
 * distinct de l'état vide (aucune donnée du tout) : le libellé invite à ajuster
 * la recherche, avec une action « Réinitialiser les filtres ».
 */
export const NoResultsState: Story = {
  name: "No results",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 640 }}>
      <Table aria-label="Projets (aucun résultat)" style={{ width: "100%" }}>
        <StatesHead />
        <TableBody
          isNoResults
          columnCount={5}
          noResultsAction={
            <Button appearance="subtle" iconBefore="Autorenew">
              Réinitialiser les filtres
            </Button>
          }
        />
      </Table>
    </div>
  ),
};

/** **Erreur** — état erreur natif via `error` + bouton « Réessayer » (`onRetry`), sur le même gabarit. */
const onRetry = fn();
export const ErrorState: Story = {
  name: "Error",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 640 }}>
      <Table aria-label="Projets (erreur)" style={{ width: "100%" }}>
        <StatesHead />
        <TableBody
          columnCount={5}
          error="Le chargement des projets a échoué."
          onRetry={onRetry}
        />
      </Table>
    </div>
  ),
  // Le bouton « Réessayer » de l'état d'erreur déclenche le callback `onRetry`.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onRetry.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Réessayer" }));
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};

// -----------------------------------------------------------------------
// Main Courante — jeu d'événements pour la recette de repli téléphone
// (Table → List). Éprouve la recette : noms longs (ellipsis), « Ronde »
// répétés (l'heure discrimine), fraîcheur aujourd'hui/hier/avant-hier/plus
// ancien, statuts variés + lignes sans statut, sites de longueurs variées.

type EventStatus = "En cours" | "Planifiée" | "Terminée" | "Absent";

const EVENT_STATUS_COLOR: Record<
  EventStatus,
  "success" | "information" | "neutral" | "critical"
> = {
  "En cours": "success",
  Planifiée: "information",
  Terminée: "neutral",
  Absent: "critical",
};

interface McEvent {
  id: string;
  agent: string;
  type: string;
  site: string;
  /** 0 = aujourd'hui, 1 = hier, 2 = avant-hier, ≥ 3 = plus ancien (`shortDate`). */
  dayOffset: 0 | 1 | 2 | 3 | 4;
  time: string;
  /** Requis quand `dayOffset` ≥ 3 (ex. « 02/08 »). */
  shortDate?: string;
  /**
   * Statut de l'événement. **Optionnel** : une entrée de main courante peut
   * n'avoir AUCUN statut (log informationnel) — ce n'est pas une donnée
   * manquante. L'emplacement du tag reste réservé (alignement), simplement vide.
   */
  statut?: EventStatus;
}

const MC_EVENTS: McEvent[] = [
  { id: "1", agent: "DUPONT Marie", type: "Ronde", site: "Hall d'accueil", dayOffset: 0, time: "14:05", statut: "En cours" },
  { id: "2", agent: "MARTIN Bob", type: "Ronde", site: "Quai de livraison Nord", dayOffset: 0, time: "13:40", statut: "En cours" },
  { id: "3", agent: "CHEN Alice", type: "Ronde", site: "Parking souterrain niveau -2", dayOffset: 0, time: "13:12" },
  { id: "4", agent: "NGUYEN Paul", type: "Intrusion détectée en zone de stockage réfrigérée", site: "Entrepôt frigorifique B", dayOffset: 0, time: "12:58", statut: "En cours" },
  { id: "5", agent: "CLAIRE Sophie", type: "Contrôle d'accès", site: "Tourniquet Est", dayOffset: 0, time: "11:30", statut: "Terminée" },
  { id: "6", agent: "DIALLO Amadou", type: "Levée de doute", site: "Local technique", dayOffset: 0, time: "10:15", statut: "Terminée" },
  { id: "7", agent: "PETIT Léa", type: "Ouverture de site", site: "Siège — Bâtiment principal", dayOffset: 0, time: "06:02", statut: "Terminée" },
  { id: "8", agent: "MOREAU Hugo", type: "Ronde", site: "Toiture terrasse", dayOffset: 1, time: "22:40", statut: "En cours" },
  { id: "9", agent: "GARCIA Inès", type: "Vérification alarme incendie déclenchée cuisine collective", site: "Réfectoire", dayOffset: 1, time: "21:05", statut: "Absent" },
  { id: "10", agent: "ROUX Théo", type: "Contrôle d'accès", site: "Hall", dayOffset: 1, time: "18:20" },
  { id: "11", agent: "FONTAINE Sarah", type: "Fermeture de site", site: "Plateforme logistique Sud-Est — Bâtiment C", dayOffset: 1, time: "19:45", statut: "Terminée" },
  { id: "12", agent: "LEROY Marc", type: "Ronde", site: "Zone parking visiteurs", dayOffset: 2, time: "23:10", statut: "Terminée" },
  { id: "13", agent: "BONNET Julie", type: "Intervention", site: "Poste de garde", dayOffset: 2, time: "03:30", statut: "Absent" },
  { id: "14", agent: "GIRARD Yanis", type: "Vacation de nuit planifiée", site: "Site Est", dayOffset: 3, time: "08:00", shortDate: "02/08", statut: "Planifiée" },
  { id: "15", agent: "LAMBERT Nour", type: "Maintenance préventive du système de vidéosurveillance périmétrique", site: "Datacenter", dayOffset: 4, time: "09:15", shortDate: "01/08", statut: "Planifiée" },
  { id: "16", agent: "FAURE Camille", type: "Ouverture de site", site: "Annexe", dayOffset: 0, time: "05:58", statut: "Terminée" },
];

/**
 * Heure/jour compact (liste) : heure seule aujourd'hui ; « Hier » /
 * « Avant-hier » ; date courte au-delà. Jamais l'heure seule pour un jour
 * passé (fraîcheur — « 22:10 » sans jour laisserait croire à du récent).
 */
const compactWhen = (e: McEvent) =>
  e.dayOffset === 0
    ? e.time
    : e.dayOffset === 1
      ? "Hier"
      : e.dayOffset === 2
        ? "Avant-hier"
        : (e.shortDate ?? e.time);

/** Tag de statut d'événement — rien si l'événement n'a pas de statut. */
function EventStatusTag({ statut }: { statut?: EventStatus }) {
  if (!statut) return null;
  return (
    <Tag
      label={statut}
      color={EVENT_STATUS_COLOR[statut]}
      appearance="subtle"
      shape="rounded"
    />
  );
}

/** Initiales de l'agent pour l'avatar (« DUPONT Marie » → « DM »). */
const agentInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Action Storybook « ouvrir le détail » — partagée par les items de liste. */
const onOpenDetail = fn();

/**
 * **Table → List (repli téléphone)** — sous ~600px de container, on ne compresse
 * pas la table : on bascule en `List`. Cette recette montre le **résultat du
 * repli** sur la donnée `MC_EVENTS` — la liste compacte « Main courante mobile »
 * (type d'événement en primary, site en secondary ; avatar + heure + tag de
 * statut + chevron en trailing).
 *
 * Points de fidélité :
 * - **Espacement sans filet** : `List gap="150"` — la séparation des lignes se
 *   fait par l'air, pas par des dividers.
 * - **Trailing uniforme** (contrepartie du sans-divider) : anatomie identique
 *   sur toutes les lignes — `[avatar] [heure] · [statut] · [chevron]` sur une
 *   grille à colonnes fixes. L'**emplacement du statut est réservé même sans
 *   statut** (colonne de largeur fixe, calée sur « Terminée ») ; un événement
 *   sans statut = *aucun statut* (log informationnel), pas une donnée manquante
 *   → emplacement vide. Les **chevrons sont alignés au pixel** et centrés sur la
 *   hauteur totale de l'item ; hauteur d'item constante (primary/secondary en
 *   ellipsis, 2 lignes).
 * - **Fraîcheur** : heure seule aujourd'hui ; « Hier » / « Avant-hier » ; date
 *   courte au-delà (jamais l'heure seule pour un jour passé).
 * - **Cas éprouvés** : noms d'événements longs (ellipsis), « Ronde » répétés
 *   (l'heure discrimine), sites de longueurs variées, statuts variés + lignes
 *   sans statut.
 *
 * Clic vers le détail : `ListItemButton` (vrai bouton, clavier + focus natifs),
 * `onPress` (action Storybook), chevron **décoratif** en fin de ligne.
 *
 * **Guideline** : si les lignes de la table (large) sont cliquables, les items du
 * repli liste le sont aussi — **même destination, même geste** ; jamais le hover
 * comme seul signal.
 */
export const TableToListRecipe: Story = {
  name: "Table → List (repli téléphone)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ width: 360, padding: "var(--space200)" }}>
      <Text size="small" color="subtle" as="p">Étroit — liste compacte (cliquable)</Text>
      <List aria-label="Main courante — liste compacte" gap="150">
        {MC_EVENTS.map((e) => (
          // Ligne cliquable = ListItemButton (bouton natif, clavier + focus).
          <ListItemButton key={e.id} onPress={() => { onOpenDetail(e.id); }}>
            {/* Infos importantes : type (titre) + site (sous-titre). En fill
                (flex:1) → pousse le trailing à droite. */}
            <ListItemText primary={e.type} secondary={e.site} />
            {/* Trailing DANS le bouton (frère flex du texte, pas un
                ListItemSecondaryAction absolu) → texte en fill. Bloc vertical :
                avatar + heure AU-DESSUS du statut ; chevron décoratif à droite.
                Ligne de statut réservée (min-height) même sans tag. */}
            <span className={css["trailing"]}>
              <span className={css["trailingStack"]}>
                <span className={css["trailingWhen"]}>
                  <Avatar size="xsmall" initials={agentInitials(e.agent)} />
                  {compactWhen(e)}
                </span>
                <span className={css["trailingStatus"]}>
                  <EventStatusTag statut={e.statut} />
                </span>
              </span>
              <Icon
                icon="ChevronRight"
                color="subtle"
                size={16}
                className={css["trailingChevron"]}
              />
            </span>
          </ListItemButton>
        ))}
      </List>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");

    // 1) Clic sur un item → l'action « ouvrir le détail » est appelée.
    onOpenDetail.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: /Toiture terrasse/ }));
    await expect(onOpenDetail).toHaveBeenCalledOnce();

    const spread = (values: number[]) =>
      Math.max(...values) - Math.min(...values);

    // 2) Tous les chevrons ont le même x (colonnes fixes du trailing).
    const chevronX = Array.from(
      list.querySelectorAll('[class*="trailingChevron"]'),
    ).map((c) => c.getBoundingClientRect().x);
    await expect(chevronX.length).toBe(MC_EVENTS.length);
    await expect(spread(chevronX)).toBeLessThanOrEqual(1);

    // 3) Hauteur d'item constante malgré le contenu variable.
    const heights = Array.from(list.querySelectorAll("li")).map(
      (li) => li.getBoundingClientRect().height,
    );
    await expect(spread(heights)).toBeLessThanOrEqual(1);
  },
};

// -----------------------------------------------------------------------
// Section de doc « Comportement responsive » — injectée dans l'onglet
// Guidelines (à côté de GuidelinesFlat) via le meta. Texte + tableau
// breakpoint → comportement. Illustré par la recette « Table → List
// (repli téléphone) ».

const RESPONSIVE_DOC_ROWS: Array<{
  bp: string;
  preset: string;
  comportement: string;
}> = [
  { bp: "≥ 1024px", preset: "Desktop exploitation (1440)", comportement: "Toutes les colonnes (Agent, Statut, Site, Début, Fin)." },
  { bp: "768 – 1024px", preset: "Tablette manager (768)", comportement: "Colonnes de confort masquées (hideBelow=\"lg\", ex. Fin)." },
  { bp: "480 – 768px", preset: "—", comportement: "Colonnes de contexte aussi masquées (hideBelow=\"md\", ex. Site/Début)." },
  { bp: "< ~600px", preset: "Mobile agent (375)", comportement: "Repli en liste compacte (List) plutôt qu'une table comprimée." },
];

function ResponsiveDocSection(): ReactNode {
  const cellStyle = {
    padding: "var(--space150) var(--space200)",
    borderBottom: "1px solid var(--border-subtle)",
    fontFamily: "var(--font-family-primary)",
    fontSize: "var(--font-size-ui-xs)",
    lineHeight: "var(--line-height-ui-m)",
    color: "var(--text-default)",
    textAlign: "start" as const,
    verticalAlign: "top" as const,
  };
  return (
    <section style={{ maxWidth: 760, paddingTop: "var(--space400)" }}>
      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space100)",
          margin: 0,
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-s)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--text-default)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--text-information)",
            display: "inline-block",
          }}
        />
        Comportement responsive
      </h3>
      <p
        style={{
          margin: "var(--space150) 0 var(--space200)",
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          lineHeight: "var(--line-height-ui-m)",
          color: "var(--text-subtle)",
        }}
      >
        La dégradation est pilotée par <strong>container queries</strong> (la
        largeur du conteneur de la table, pas le viewport) : poser{" "}
        <code>responsive</code> sur la <code>Table</code> puis <code>hideBelow</code>{" "}
        (<code>&quot;sm&quot;</code>/<code>&quot;md&quot;</code>/
        <code>&quot;lg&quot;</code>) sur l&apos;en-tête ET chaque cellule d&apos;une
        colonne. Les identifiants et la donnée clé ne sont jamais masqués ; sous
        ~600px on bascule en liste compacte. Les presets viewport « Mobile agent
        / Tablette manager / Desktop exploitation » (barre d&apos;outils Viewport)
        permettent d&apos;éprouver chaque palier ; la recette{" "}
        <em>Table → List (repli téléphone)</em> illustre le repli en liste.
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius200)",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: "var(--font-weight-semibold)", background: "var(--background-neutral-subtlest-default)" }}>
              Largeur de container
            </th>
            <th style={{ ...cellStyle, fontWeight: "var(--font-weight-semibold)", background: "var(--background-neutral-subtlest-default)" }}>
              Preset viewport
            </th>
            <th style={{ ...cellStyle, fontWeight: "var(--font-weight-semibold)", background: "var(--background-neutral-subtlest-default)" }}>
              Comportement
            </th>
          </tr>
        </thead>
        <tbody>
          {RESPONSIVE_DOC_ROWS.map((row) => (
            <tr key={row.bp}>
              <td style={cellStyle}>{row.bp}</td>
              <td style={cellStyle}>{row.preset}</td>
              <td style={cellStyle}>{row.comportement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
