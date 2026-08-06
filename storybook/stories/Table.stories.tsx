// Table — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { within, userEvent, expect, fn } from "storybook/test";
import {
  Avatar,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
// Colonnes responsives (hideBelow) + recette de repli téléphone (Table → List)

type MceStatus = "Actif" | "Pause" | "Hors ligne";

// D12 — mapping statut → couleur sémantique du Tag (démonstration vivante ;
// le tableau de correspondance de référence vit dans la story du Tag).
const STATUS_TAG_COLOR: Record<MceStatus, "success" | "warning" | "neutral"> = {
  Actif: "success",
  Pause: "warning",
  "Hors ligne": "neutral",
};

interface MceRow {
  id: string;
  agent: string;
  status: MceStatus;
  site: string;
  type: string;
  day: "Aujourd'hui" | "Hier";
  time: string;
  phone: string;
}

const MCE_ROWS: MceRow[] = [
  { id: "1", agent: "DUPONT Marie", status: "Actif", site: "Tour Nord", type: "Ronde", day: "Aujourd'hui", time: "14:05", phone: "06 12 34 56 78" },
  { id: "2", agent: "MARTIN Bob", status: "Pause", site: "Entrepôt B", type: "Vacation", day: "Aujourd'hui", time: "13:40", phone: "06 22 33 44 55" },
  { id: "3", agent: "CHEN Alice", status: "Actif", site: "Site Est", type: "Ronde", day: "Aujourd'hui", time: "13:58", phone: "06 98 76 54 32" },
  { id: "4", agent: "CLAIRE Sophie", status: "Hors ligne", site: "Tour Sud", type: "Intervention", day: "Hier", time: "22:10", phone: "06 11 22 33 44" },
];

/** Libellé « dernière ronde » complet (table) : jour + heure. */
const fullRound = (r: MceRow) => `${r.day} ${r.time}`;
/**
 * Libellé compact (liste) : l'heure seule aujourd'hui ; pour un jour antérieur
 * on note UNIQUEMENT le jour (« Hier »), pas l'heure — « 22:10 » seul
 * laisserait croire à quelque chose de récent, et l'heure exacte de la veille
 * n'apporte rien en vue compacte.
 */
const compactRound = (r: MceRow) =>
  r.day === "Aujourd'hui" ? r.time : r.day;

/** Tag de statut coloré (D12) réutilisé par les deux stories responsives. */
function StatusTag({ status }: { status: MceStatus }) {
  return (
    <Tag
      label={status}
      color={STATUS_TAG_COLOR[status]}
      appearance="subtle"
      shape="rounded"
    />
  );
}

/** Une instance de table responsive rendue à une largeur de container donnée. */
function ResponsiveTable({ width }: { width: number }) {
  return (
    // flexShrink:0 → la largeur de démo est honorée (le container query dépend
    // de cette largeur exacte ; sans ça un canvas étroit rétrécirait la table).
    <div style={{ width, flexShrink: 0 }}>
      <Text size="small" color="subtle" as="p">{`Container ${width}px`}</Text>
      <Table
        aria-label={`Agents — container ${width}px`}
        style={{ width: "100%" }}
        responsive
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Agent</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell hideBelow="md">Site</TableHeaderCell>
            <TableHeaderCell hideBelow="md">Type</TableHeaderCell>
            <TableHeaderCell hideBelow="lg">Dernière ronde</TableHeaderCell>
            <TableHeaderCell hideBelow="lg">Téléphone</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {MCE_ROWS.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.agent}</TableCell>
              <TableCell>
                <StatusTag status={r.status} />
              </TableCell>
              <TableCell hideBelow="md">{r.site}</TableCell>
              <TableCell hideBelow="md">{r.type}</TableCell>
              <TableCell hideBelow="lg">{fullRound(r)}</TableCell>
              <TableCell hideBelow="lg">{r.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * **Colonnes responsives** — priorité de colonnes via `hideBelow` (container
 * queries). Mêmes 6 colonnes rendues à **trois largeurs de container** dans un
 * seul canvas (1100 / 900 / 600) → 6 / 4 / 2 colonnes, SANS changer de
 * viewport : c'est l'avantage des container queries. « Agent » et « Statut »
 * (identifiant + donnée clé) n'ont jamais de `hideBelow` ; « Site »/« Type »
 * sont en `md` ; « Dernière ronde »/« Téléphone » (confort) en `lg`. Les tags
 * de statut illustrent le mapping couleur (D12) : Actif → success, Pause →
 * warning, Hors ligne → neutral.
 *
 * À **600px il ne reste que 2 colonnes étirées** (grand vide à droite) : c'est
 * la **limite** de la dégradation par colonnes — sous ~600px de container, ne
 * pas garder une table à 2 colonnes mais **basculer en liste compacte** (voir
 * la story *Table → List* et les guidelines).
 */
export const ResponsiveColumns: Story = {
  name: "Responsive columns (hideBelow)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space300)",
        alignItems: "flex-start",
        flexWrap: "wrap",
        padding: "var(--space200)",
      }}
    >
      {[1100, 900, 600].map((w) => (
        <ResponsiveTable key={w} width={w} />
      ))}
    </div>
  ),
  // À 900px de container : les colonnes `lg` sont masquées (display:none via
  // container query), les `md` restent visibles, et chaque ligne du corps
  // expose le MÊME nombre de cellules visibles que l'en-tête (invariant
  // header/lignes). 900 est choisi dans la bande [768, 1024) — 700 y était
  // équivalent mais ne montre pas que `md` reste visible.
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table", {
      name: /container 900px/,
    });

    const lgCells = Array.from(table.querySelectorAll('[data-hide-below="lg"]'));
    await expect(lgCells.length).toBeGreaterThan(0);
    for (const c of lgCells) {
      await expect(getComputedStyle(c).display).toBe("none");
    }
    for (const c of Array.from(table.querySelectorAll('[data-hide-below="md"]'))) {
      await expect(getComputedStyle(c).display).not.toBe("none");
    }

    const visibleCount = (row: Element) =>
      [...row.children].filter((c) => getComputedStyle(c).display !== "none")
        .length;
    const headerVisible = visibleCount(table.querySelector("thead tr") as Element);
    await expect(headerVisible).toBe(4); // 2 essentielles + 2 md
    for (const r of Array.from(table.querySelectorAll("tbody tr"))) {
      await expect(visibleCount(r)).toBe(headerVisible);
    }
  },
};

/**
 * **Table → List (repli téléphone)** — la MÊME donnée en **table** (large,
 * toutes colonnes) et en **liste compacte** (étroit). Sous ~600px de
 * container, on ne compresse pas la table : on passe en `List` (agent en
 * primary, site · type en secondary, heure + tag de statut en trailing) — le
 * pattern Main courante mobile. C'est la recette que les écrans copient ;
 * les cartes restent la vue alternative, pas le repli par défaut.
 *
 * Points de fidélité :
 * - **Fraîcheur** : la méta compacte affiche l'heure seule aujourd'hui, et
 *   **uniquement le jour** pour un jour antérieur (« Hier », pas « 22:10 » —
 *   sinon on croit que c'est récent ; l'heure de la veille n'apporte rien ici).
 * - **Alignement** : trailing sur une grille constante (heure calée à droite,
 *   statut en colonne fixe) → pas de zigzag des heures malgré la largeur
 *   variable des tags. La troncature des noms/site longs est assurée par
 *   `ListItemText` (ellipsis).
 * - **Tri / sélection** (plus d'en-têtes en liste) : le tri passe dans un
 *   contrôle « Trier par » au-dessus de la liste ; la sélection multiple par
 *   case par ligne ou appui long — à brancher sur le futur hook de sélection
 *   (hors périmètre de cette recette).
 *
 * Recette de mise en page uniquement — pour la navigation vers le détail
 * (lignes cliquables), voir la story `Clickable rows`.
 */
export const TableToListRecipe: Story = {
  name: "Table → List (repli téléphone)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space400)",
        alignItems: "flex-start",
        flexWrap: "wrap",
        padding: "var(--space200)",
      }}
    >
      <div style={{ width: 820, flexShrink: 0 }}>
        <Text size="small" color="subtle" as="p">Large — table</Text>
        <Table aria-label="Agents — table (large)" style={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Agent</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Site</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Dernière ronde</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MCE_ROWS.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.agent}</TableCell>
                <TableCell>
                  <StatusTag status={r.status} />
                </TableCell>
                <TableCell>{r.site}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{fullRound(r)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div style={{ width: 360, flexShrink: 0 }}>
        <Text size="small" color="subtle" as="p">Étroit — liste compacte</Text>
        <List aria-label="Agents — liste compacte">
          {MCE_ROWS.map((r) => (
            <ListItem key={r.id}>
              <ListItemText primary={r.agent} secondary={`${r.site} · ${r.type}`} />
              <ListItemSecondaryAction>
                {/* Grille constante : heure (calée à droite) puis statut
                    (colonne de largeur fixe) → l'heure reste alignée d'une
                    ligne à l'autre malgré la largeur variable des tags. */}
                <span className={css["trailing"]}>
                  <span className={css["trailingTime"]}>{compactRound(r)}</span>
                  <span className={css["trailingStatus"]}>
                    <StatusTag status={r.status} />
                  </span>
                </span>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  ),
};
