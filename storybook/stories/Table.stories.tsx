// Table — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TablePagination,
  TableRow,
  Tag,
  type TableSortDirection,
} from "@aexae/comete-design-system/components";

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
    layout: "padded",
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
              <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} />
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
                <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} />
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
          <TableHeaderCell width={60} align="center">
            {/* Colonne d'actions — pas de label pour ne pas encombrer
                l'entête ; l'aria-label du bouton d'action décrit l'intention. */}
            &nbsp;
          </TableHeaderCell>
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
              <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} />
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
            <TableHeaderCell width={60} align="center">
              &nbsp;
            </TableHeaderCell>
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
        {selected.size > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space150)",
              padding: "var(--space100) var(--space150)",
              background: "var(--background-selected-subtlest-default)",
              borderRadius: "var(--radius050)",
            }}
          >
            <span
              style={{
                color: "var(--text-default)",
                fontSize: "var(--font-size-ui-xs)",
              }}
            >
              {selected.size} ligne{selected.size > 1 ? "s" : ""} sélectionnée
              {selected.size > 1 ? "s" : ""}
            </span>
            <Button appearance="subtle" density="compact" iconBefore="Delete">
              Supprimer
            </Button>
            <Button
              appearance="subtle"
              density="compact"
              onPress={() => setSelected(new Set())}
            >
              Effacer
            </Button>
          </div>
        )}
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
  render: (args) => {
    // REASON: en HTML les `background` sur <thead>/<tr> ne sont pas peints —
    // seules les cellules <th>/<td> peignent. Pour un header sticky, on
    // rend chaque <th> collant ET on lui donne un background solide, sinon
    // les lignes du body transparaissent en scroll.
    const stickyHeaderStyle = {
      position: "sticky" as const,
      top: 0,
      zIndex: 1,
      background: "var(--background-surface-default)",
    };
    return (
      <div
        style={{
          maxHeight: 400,
          overflow: "auto",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-100)",
        }}
      >
        <Table {...args} aria-label="Large dataset — 200 lignes">
          <TableHead>
            <TableRow>
              <TableHeaderCell width={80} style={stickyHeaderStyle}>
                #
              </TableHeaderCell>
              <TableHeaderCell style={stickyHeaderStyle}>Title</TableHeaderCell>
              <TableHeaderCell style={stickyHeaderStyle}>Status</TableHeaderCell>
              <TableHeaderCell style={stickyHeaderStyle}>User</TableHeaderCell>
              <TableHeaderCell style={stickyHeaderStyle}>Key</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {LARGE_DATASET.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} />
                </TableCell>
                <TableCell>{r.user}</TableCell>
                <TableCell>{r.key}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
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
                  <Tag label={r.status} appearance={STATUS_APPEARANCE[r.status]} />
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

