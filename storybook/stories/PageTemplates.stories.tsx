// Page layout templates — modern composition examples for developers
//
// IMPORTANT — Banner vs SectionMessage:
//   • Banner       → global alert, ABOVE the page layout (outside Page.Body)
//   • SectionMessage → contextual message INSIDE the page content

import { useEffect, useState } from "react";
import { parseDate } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, screen, userEvent, expect, waitFor } from "storybook/test";
import type { IconName } from "@aexae/comete-design-system/components";
import {
  Page,
  Grid,
  Card,
  Stack,
  Cluster,
  Button,
  ButtonGroup,
  TextField,
  SearchField,
  Field,
  Avatar,
  Badge,
  IconTile,
  Tag,
  Text,
  Heading,
  Divider,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  SectionMessage,
  DrawerProvider,
  MonthPicker,
  DatePicker,
  Banner,
  SideNav,
  Logo,
  useSideNav,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TablePagination,
  TableSelectionBar,
  Checkbox,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemTrailing,
} from "@aexae/comete-design-system/components";
import { useTableSelection } from "@aexae/comete-design-system/hooks";
import css from "./PageTemplates.module.css";
import {
  FiltresPanel,
  ActiveFilterTags,
  SavedSearchesMenu,
  useSavedViews,
  emptyFilters,
  type Filters,
} from "./_filtresOptionB";
import filtresCss from "./FiltresOptionB.stories.module.css";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Layout grid overlay (like Figma "Show layout grid")

function GridOverlay() {
  return (
    <div className={css["gridOverlay"]}>
      <div className={css["gridOverlayInner"]}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={css["gridOverlayCol"]} />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Templates/Page layouts",
  component: Page,
  tags: ["autodocs"],
  argTypes: {
    showGrid: {
      control: "boolean",
      description: "Affiche la grille 12 colonnes (comme Figma Layout Grid)",
      table: { category: "Debug" },
    },
  },
  args: { showGrid: false },
  decorators: [
    (Story, context) => (
      <DrawerProvider>
        {context.args["showGrid"] && <GridOverlay />}
        <Story />
      </DrawerProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15827") },
    docs: {
      description: {
        component:
          "Exemples de compositions de page complètes (listes, détails, tableaux de bord) assemblées à partir des composants du DS. Utilisez ces gabarits comme point de départ à copier/adapter, en composant Page avec SideNav/Page.Bar, Grid, Card, etc. Rappel : Banner au-dessus du layout (alerte globale), SectionMessage à l'intérieur du contenu.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// -----------------------------------------------------------------------
// Helpers

function CC({ children, padding = "var(--space200)" }: { children: React.ReactNode; padding?: string }) {
  return <div style={{ padding, flex: 1, minWidth: 0 }}>{children}</div>;
}

function PropRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <Stack direction="row" gap="100" align="start">
      <Icon icon={icon} size={20}  />
      <Stack gap="0">
        <Text size="small" as="span" color="subtlest">{label}</Text>
        <Text as="span">{value}</Text>
      </Stack>
    </Stack>
  );
}

function MetricTile({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: "success" | "critical" | "warning" }) {
  return (
    <div className={css["metricTile"]}>
      <Stack gap="025">
        <Text size="small" as="span" color="subtlest">{label}</Text>
        <Text size="large" weight="bold" as="span" color={highlight}>
          {value}
          {unit && <Text size="small" as="span" color="subtlest"> {unit}</Text>}
        </Text>
      </Stack>
    </div>
  );
}

function KpiTile({ icon, iconColor = "default", value, label, trend, trendUp }: {
  icon: IconName; iconColor?: "default" | "success" | "critical" | "warning" | "information";
  value: string; label: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <Card appearance="outlined">
      <CC>
        <Stack gap="150">
          <Cluster justify="between" align="center">
            <div className={css["iconPuck"]}><Icon icon={icon} color={iconColor} /></div>
            {trend != null && (
              <Text size="small" weight="medium" as="span" color={trendUp === true ? "success" : trendUp === false ? "critical" : "subtlest"}>
                {trend}
              </Text>
            )}
          </Cluster>
          <Stack gap="0">
            <Heading size="xlarge" as="span">{value}</Heading>
            <Text size="small" as="span" color="subtlest">{label}</Text>
          </Stack>
        </Stack>
      </CC>
    </Card>
  );
}

function ProgressRow({ icon, label, current, total }: { icon: IconName; label: string; current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <Stack gap="075">
      <Cluster justify="between" align="center">
        <Stack direction="row" gap="075" align="center">
          <Icon icon={icon} />
          <Text as="span">{label}</Text>
        </Stack>
        <Heading size="xsmall" as="span">{current}/{total}</Heading>
      </Cluster>
      <div className={css["progressTrack"]}>
        <div className={css["progressFill"]} style={{
          width: `${Math.max(pct, 2)}%`,
          background: pct < 25 ? "var(--background-critical-bold-default)" : pct < 75 ? "var(--background-warning-bold-default)" : "var(--background-success-bold-default)",
        }} />
      </div>
    </Stack>
  );
}

// Petit tableau « maison » (div grid) pour les gabarits secondaires (Settings).
// Renommé pour libérer `TableRow` au profit du composant Table du DS (recette D10).
function MiniTableRow({ cells, isHeader }: { cells: React.ReactNode[]; isHeader?: boolean }) {
  return (
    <div
      className={css["tableRow"]}
      data-header={isHeader ? "" : undefined}
      style={{ display: "grid", gridTemplateColumns: `2fr repeat(${cells.length - 1}, 1fr)` }}
    >
      {cells.map((cell, i) => <span key={i} className={css["tableCell"]}>{cell}</span>)}
    </div>
  );
}

// -----------------------------------------------------------------------
// 1. COLLECTION

const AGENTS = [
  { initials: "DM", name: "DUPONT Marie", mat: "150", contrat: "151.67", heures: "151.67", delta: "0.00", status: "success" as const },
  { initials: "MJ", name: "MARTIN Jean", mat: "A752", contrat: "", heures: "", delta: "", status: "neutral" as const },
  { initials: "BS", name: "BERNARD Sophie", mat: "0012", contrat: "151.67", heures: "140.00", delta: "-11.67", status: "critical" as const },
  { initials: "PL", name: "PETIT Luc", mat: "260", contrat: "151.67", heures: "151.67", delta: "0.00", status: "success" as const },
  { initials: "RC", name: "ROBERT Camille", mat: "88", contrat: "", heures: "", delta: "", status: "neutral" as const },
  { initials: "RA", name: "RICHARD Alain", mat: "274", contrat: "151.67", heures: "160.00", delta: "+8.33", status: "critical" as const },
  { initials: "MC", name: "MOREAU Claire", mat: "119", contrat: "151.67", heures: "151.67", delta: "0.00", status: "success" as const },
];

/**
 * **Base** — Structure de base : Banner + SideNav + Page (avec Page.Bar).
 *
 * - Banner globale en haut du viewport
 * - SideNav à gauche (avec collapse/expand)
 * - Page.Bar + Page.Body dans la zone principale (le SideNav.Trigger vit dans le
 *   `leading` de la Page.Bar ; les actions globales via `Page globalActions`)
 */
export const Base: Story = {
  name: "Base (Banner + SideNav + Page.Bar)",
  parameters: { design: { type: "figma", url: figmaUrl("4319:15827") } },
  render: function BaseStory() {
    const [collapsed, setCollapsed] = useState(false);

    function FooterLogo() {
      const { isCollapsed } = useSideNav();
      return <Logo size={14} product="link" appearance="neutral" format={isCollapsed ? "icon" : "logo"} />;
    }

    return (
      <SideNav.Provider isCollapsed={collapsed} onCollapsedChange={setCollapsed}>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Banner globale — pleine largeur, au-dessus de tout */}
        <Banner appearance="warning">
          <Text grow>Mise à jour planifiée le 28 avril à 22h.</Text>
          <Button appearance="link" isInline>En savoir plus</Button>
        </Banner>

        {/* Zone principale : SideNav + contenu côte à côte. La nav en
            peek (overlay absolute) ne déborde QUE dans cette zone. */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
          {/* SideNav */}
          <SideNav>
            <SideNav.Header
              logo={<Logo product="link" format="icon" />}
              companyName="Comète Link"
              description="Main Courante"
            />
            <SideNav.Section title="Manager">
              <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="#" />
              <SideNav.Item label="Agents" iconBefore="Agent" href="#" />
              <SideNav.Item label="Sites" iconBefore="LocationOn" href="#" />
              <SideNav.Item label="Pointages" iconBefore="Schedule" href="#" isDisabled />
            </SideNav.Section>
            <SideNav.Divider />
            <SideNav.Section title="MCE">
              <SideNav.Item label="Main courante" iconBefore="EditNote" href="#" />
              <SideNav.Item label="Formulaires" iconBefore="FormEdit" href="#" />
            </SideNav.Section>
            <SideNav.Divider />
            <SideNav.Section title="Administration">
              <SideNav.Item label="Utilisateurs" iconBefore="Group" href="#" />
              <SideNav.Item label="Droits" iconBefore="ManageAccounts" href="#" />
              <SideNav.Item label="Licences" iconBefore="Key" href="#" />
            </SideNav.Section>
            <SideNav.Footer>
              <FooterLogo />
            </SideNav.Footer>
          </SideNav>

          {/* Page — wrapper en flex column pour propager une hauteur définie
              jusqu'à la Page.Body (sinon un enfant en height:100% ne se résout pas). */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Page
              globalActions={
                <>
                  <Button appearance="subtle" density="compact" iconBefore="Notifications" aria-label="Notifications" />
                  <Avatar size="medium" initials="AC" />
                </>
              }
              style={{ flex: 1, minHeight: 0 }}
            >
              <Page.Bar title="Accueil" leading={<SideNav.Trigger />} />
              <Page.Toolbar
                search={
                  <SearchField
                    aria-label="Rechercher"
                    placeholder="Rechercher…"
                    density="compact"
                  />
                }
                end={
                  <Button color="comete" iconBefore="Add">
                    Nouveau
                  </Button>
                }
              />
              <Page.Body>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    background: "var(--background-neutral-subtlest-default)",
                    borderRadius: "var(--radius200)",
                  }}
                >
                  <Text as="span" color="subtle">
                    Contenu de la page
                  </Text>
                </div>
              </Page.Body>
            </Page>
          </div>
        </div>
      </div>
      </SideNav.Provider>
    );
  },
};

// -----------------------------------------------------------------------
// 1. COLLECTION
// Recette « Liste » standard (D10) réintégrée sur la barre de filtres option B.
// Visibilité par rôle DÉCLARATIVE : chaque colonne / action porte son `roles`
// (une source par élément) ; aucun `if (isPartner)` dans l'affichage.
type Role = "manager" | "partenaire" | "client";
type SortDir = "default" | "ascending" | "descending";
type Agent = (typeof AGENTS)[number];

interface AgentColumn {
  id: string;
  header: string;
  roles: Role[];
  align?: "left" | "right";
  hideBelow?: "sm" | "md" | "lg";
  sortable?: boolean;
  sortValue?: (a: Agent) => string | number;
  cell: (a: Agent) => React.ReactNode;
}
const AGENT_COLUMNS: AgentColumn[] = [
  { id: "agent", header: "Agent", roles: ["manager", "partenaire", "client"], sortable: true, sortValue: (a) => a.name,
    cell: (a) => <Cluster gap="075" align="center"><Avatar size="xsmall" initials={a.initials} /><Text as="span">{a.name}</Text></Cluster> },
  // Matricule et Heures ne sont pas exposés au partenaire (sous-traitance) —
  // via `roles`, pas via un test de rôle dans la cellule.
  { id: "mat", header: "Matricule", roles: ["manager", "client"], hideBelow: "md", cell: (a) => a.mat },
  { id: "contrat", header: "Contrat", roles: ["manager", "partenaire", "client"], align: "right", hideBelow: "md", cell: (a) => a.contrat || "—" },
  { id: "heures", header: "Heures", roles: ["manager", "client"], align: "right", hideBelow: "lg", cell: (a) => a.heures || "—" },
  { id: "delta", header: "Delta", roles: ["manager", "client"], align: "right", sortable: true, sortValue: (a) => parseFloat(a.delta || "0"),
    cell: (a) => a.delta ? <Text size="small" weight="bold" as="span" color={a.status === "success" ? "success" : "critical"}>{a.delta}</Text> : <Text as="span" color="subtlest">—</Text> },
];

interface AgentAction { id: string; label: string; icon: IconName; primary?: boolean; roles: Role[]; }
const AGENT_ACTIONS: AgentAction[] = [
  { id: "new", label: "Nouvel agent", icon: "Add", primary: true, roles: ["manager"] },
  { id: "export", label: "Exporter", icon: "Download", roles: ["manager", "partenaire", "client"] },
];


// -----------------------------------------------------------------------
// Cœur partagé (§0bis.A) : Table du DS + quatre états + sélection + repli
// téléphone + lignes interactives. Factorisé pour être réutilisé par les DEUX
// formes — « Liste » (page) et « Liste de section ». Présentationnel : toutes
// les données arrivent déjà filtrées / triées / paginées par l'appelant.
interface AgentTableCoreProps {
  ariaLabel: string;
  cols: AgentColumn[];
  columnCount: number;
  state: string;
  pageAgents: Agent[];
  totalCount: number;
  sel: ReturnType<typeof useTableSelection<string>>;
  sort: { col: string; dir: SortDir };
  onSort: (s: { col: string; dir: SortDir }) => void;
  page: number;
  onPageChange: (p: number) => void;
  /** Pagination façon story Table « With pagination » : lignes/page pilotables. */
  rowsPerPage: number;
  onRowsPerPageChange: (n: number) => void;
  rowsPerPageOptions: number[];
  /** « Tout effacer » de l'état « aucun résultat » (remet filtres + vue). */
  onClearFilters?: () => void;
  /** Liste de section : « aucun résultat » en UNE ligne (variante compacte, §4). */
  compactEmpty?: boolean;
}

function AgentTableCore({
  ariaLabel,
  cols,
  columnCount,
  state,
  pageAgents,
  totalCount,
  sel,
  sort,
  onSort,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions,
  onClearFilters,
  compactEmpty = false,
}: AgentTableCoreProps): React.ReactElement {
  const isData = state === "data";
  // Repli téléphone : ce que la liste compacte montre dérive des MÊMES colonnes
  // déclaratives (aucun littéral de rôle).
  const showMat = cols.some((c) => c.id === "mat");
  const showDelta = cols.some((c) => c.id === "delta");
  const compactSecondary = (a: Agent): string | undefined =>
    [showMat ? `Mat. ${a.mat}` : null, a.contrat ? `${a.contrat} h` : null]
      .filter(Boolean)
      .join(" · ") || undefined;

  if (compactEmpty && state === "noResults") {
    return (
      <Text size="small" as="p" color="subtlest">
        Aucun résultat pour cette section.
      </Text>
    );
  }

  return (
    <>
      {/* Sélection active → barre contextuelle ; sinon le compteur de résultats.
          Masqués hors état « données ». */}
      {isData &&
        (sel.selectedCount > 0 ? (
          <TableSelectionBar count={sel.selectedCount} onClear={sel.clear}>
            <Button appearance="subtle" iconBefore="Download">Exporter la sélection</Button>
          </TableSelectionBar>
        ) : (
          <Text size="small" as="span" color="subtlest">{totalCount} agents</Text>
        ))}

      {/* Repli responsive (§5) : Table du DS sur desktop, liste compacte sur
          téléphone (motif TableToListRecipe). Même bascule à 599px. */}
      <div className={css["tableDesktopOnly"]}>
        <Table responsive aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              <TableHeaderCell><Checkbox {...sel.getSelectAllProps()} /></TableHeaderCell>
              {cols.map((c) => (
                <TableHeaderCell
                  key={c.id}
                  align={c.align}
                  hideBelow={c.hideBelow}
                  isSortable={c.sortable}
                  sortDirection={sort.col === c.id ? sort.dir : "default"}
                  onSortChange={c.sortable ? (next) => onSort({ col: c.id, dir: next }) : undefined}
                >
                  {c.header}
                </TableHeaderCell>
              ))}
              <TableHeaderCell width={60} isActionColumn>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody
            columnCount={columnCount}
            skeletonRows={rowsPerPage}
            isLoading={state === "loading"}
            isEmpty={state === "empty"}
            emptyTitle="Aucun agent"
            emptyDescription="Ajoutez un premier agent pour le voir apparaître ici."
            isNoResults={state === "noResults"}
            noResultsTitle="Aucun résultat"
            noResultsDescription="Aucun agent ne correspond aux filtres actifs."
            noResultsAction={<Button appearance="subtle" onPress={onClearFilters}>Tout effacer</Button>}
            error={state === "error"}
            onRetry={() => undefined}
          >
            {isData
              ? pageAgents.map((a) => (
                  // Table sélectionnable : le clic sur TOUTE la ligne coche la case
                  // (getRowClickProps). Le bouton d'actions (MoreVert) garde la
                  // PRIORITÉ — getRowClickProps ignore les contrôles interactifs
                  // (comme la story Table « All-in-one »).
                  <TableRow key={a.mat} isSelected={sel.isSelected(a.mat)} {...sel.getRowClickProps(a.mat)}>
                    <TableCell><Checkbox {...sel.getRowCheckboxProps(a.mat, a.name)} /></TableCell>
                    {cols.map((c) => (
                      <TableCell key={c.id} align={c.align} hideBelow={c.hideBelow}>
                        {c.cell(a)}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Button appearance="subtle" density="compact" iconBefore="MoreVert" aria-label={`Actions pour ${a.name}`} />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {/* Repli téléphone : liste compacte cliquable (PAS des cartes, §9). */}
      {isData && (
        <div className={css["listMobileOnly"]}>
          <List aria-label={`${ariaLabel} — liste compacte`} gap="150">
            {pageAgents.map((a) => (
              <ListItemButton
                key={a.mat}
                onPress={() => {
                  window.location.hash = `/agents/${a.mat}`;
                }}
              >
                <ListItemAvatar>
                  <Avatar size="small" initials={a.initials} />
                </ListItemAvatar>
                <ListItemText primary={a.name} secondary={compactSecondary(a)} lineClamp={2} />
                {showDelta && a.delta ? (
                  <ListItemTrailing>
                    <Text size="small" weight="bold" as="span" color={a.status === "success" ? "success" : "critical"}>
                      {a.delta}
                    </Text>
                  </ListItemTrailing>
                ) : null}
              </ListItemButton>
            ))}
          </List>
        </div>
      )}

      {isData && (
        <TablePagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </>
  );
}

/**
 * **Collection** — recette « Liste » standard (D10), barre de filtres **option B**.
 *
 * `Table` du DS **dé-encartée**, **une seule** toolbar (recherche + bouton
 * **« Filtres »** option B dans le slot `filters` : popover deux volets / feuille
 * en compact — fermé par défaut — + **« Filtres enregistrés »**), tags des
 * critères actifs sous la barre (masqués en compact), tri, **pagination façon
 * recette « With pagination »** (lignes par page 5/10/25). Table **sélectionnable**
 * (recette « All-in-one ») : le clic de ligne coche la case, le bouton d'actions
 * de la ligne garde la **priorité** sur le clic.
 * Colonnes et actions **déclaratives par rôle** (`roles`). **Une facette est
 * câblée** au tableau — « Types de contrats » réduit réellement la liste
 * (compteur + tag + « Réinitialiser ») ; les autres restent démonstratives.
 */
export const Collection: Story = {
  name: "Collection (liste + filtres)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  argTypes: {
    // Client non proposé : la page Agents n'existe pas dans sa navigation.
    role: { name: "Rôle", control: "inline-radio", options: ["manager", "partenaire"] },
    // États de la liste : données, sélection active (barre de sélection), et les
    // quatre placeholders du Table (chargement / vide / aucun résultat / erreur).
    state: { name: "État", control: "inline-radio", options: ["data", "selection", "loading", "empty", "noResults", "error"] },
  },
  args: { role: "manager", state: "data" },
  render: function CollectionStory(args) {
    const role = (args as { role?: Role }).role ?? "manager";
    const stateArg = (args as { state?: string }).state ?? "data";
    const [f, setF] = useState<Filters>(emptyFilters);
    const { views, save, remove } = useSavedViews();
    const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: "agent", dir: "default" });
    const [page, setPage] = useState(0);
    // Pagination façon story Table « With pagination » : lignes/page pilotables.
    const [rowsPerPage, setRowsPerPage] = useState(5);
    // Sélection CONTRÔLÉE : l'état « selection » pré-sélectionne deux lignes pour
    // illustrer la barre de sélection (TableSelectionBar) ; les clics dans la
    // table restent interactifs via `onSelectionChange`.
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
    useEffect(() => {
      setSelectedKeys(stateArg === "selection" ? new Set(AGENTS.slice(0, 2).map((a) => a.mat)) : new Set());
    }, [stateArg]);

    const cols = AGENT_COLUMNS.filter((c) => c.roles.includes(role));
    const actions = AGENT_ACTIONS.filter((a) => a.roles.includes(role));

    // Filtrage LIVE (état « data ») : recherche (nom) + UNE facette câblée au
    // modèle du tableau — « Types de contrats » (option B `contrat`) : dès qu'un
    // type est coché, on ne garde que les agents sous contrat (colonne Contrat
    // renseignée). Les AUTRES facettes option B restent démonstratives (tags
    // actifs, sans filtrer ce tableau : modèles distincts). La boucle est ainsi
    // complète — cocher → liste réduite → compteur + tag → « Réinitialiser » remet
    // — et « aucun résultat » devient atteignable par une recherche sans
    // correspondance, pas seulement via le contrôle « État ».
    const needle = f.nameQuery.trim().toLowerCase();
    const live = AGENTS
      .filter((a) => (needle ? a.name.toLowerCase().includes(needle) : true))
      .filter((a) => (f.contrat.length > 0 ? a.contrat !== "" : true));
    const sorted = [...live].sort((a, b) => {
      if (sort.dir === "default") return 0;
      const c = AGENT_COLUMNS.find((x) => x.id === sort.col);
      if (!c?.sortValue) return 0;
      const va = c.sortValue(a), vb = c.sortValue(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === "ascending" ? cmp : -cmp;
    });
    const pageAgents = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const sel = useTableSelection({
      keys: pageAgents.map((a) => a.mat),
      selectedKeys,
      onSelectionChange: setSelectedKeys,
    });
    const columnCount = cols.length + 2; // +1 sélection, +1 colonne d'actions
    // Le contrôle « État » force loading / empty / error ; « selection » montre la
    // barre de sélection sur des données ; sinon l'état découle du filtrage réel
    // (data, ou noResults si le filtrage vide la liste).
    const state = stateArg === "selection"
      ? "data"
      : stateArg === "data"
        ? (sorted.length === 0 ? "noResults" : "data")
        : stateArg;
    const reset = () => {
      setF(emptyFilters());
      setPage(0);
    };

    return (
      <Page globalActions={null}>
        <Page.Bar title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          search={
            <div className={css["searchWrapper"]}>
              <SearchField
                aria-label="Rechercher un agent"
                placeholder="Rechercher…"
                density="compact"
                value={f.nameQuery}
                onChange={(v) => { setF({ ...f, nameQuery: v }); setPage(0); }}
              />
            </div>
          }
          filters={
            <FiltresPanel
              filters={f}
              onChange={setF}
              views={views}
              onSaveView={(name) => save(name, f)}
              role={role}
              collapseLabel
              scrollClassName={filtresCss["scroll"]}
              textActionClassName={filtresCss["textAction"]}
            />
          }
          end={
            <Cluster gap="100">
              {/* Filtres enregistrés : appliquer / supprimer un jeu de critères. */}
              <SavedSearchesMenu views={views} current={f} onApply={(v) => setF(v.filters)} onDelete={remove} />
              <ButtonGroup>
                {actions.map((a) =>
                  a.primary
                    ? <Button key={a.id} color="comete" iconBefore={a.icon} collapseLabel shape="square" aria-label={a.label}>{a.label}</Button>
                    : <Button key={a.id} appearance="subtle" iconBefore={a.icon} className={css["hideOnMobile"]}>{a.label}</Button>
                )}
                <Button appearance="subtle" iconBefore="MoreHoriz" aria-label="Plus d'actions" />
              </ButtonGroup>
            </Cluster>
          }
        />
        {/* Tags des critères actifs, sous la barre — masqués sous le breakpoint
            compact (badge + feuille en mobile). */}
        <div className={css["hideBlockUnderCompact"]} style={{ paddingInline: "var(--page-gutter)" }}>
          <ActiveFilterTags filters={f} onChange={setF} textActionClassName={filtresCss["textAction"]} />
        </div>
        <Page.Body>
          <AgentTableCore
            ariaLabel="Liste des agents"
            cols={cols}
            columnCount={columnCount}
            state={state}
            pageAgents={pageAgents}
            totalCount={sorted.length}
            sel={sel}
            sort={sort}
            onSort={setSort}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            onClearFilters={reset}
          />
        </Page.Body>
      </Page>
    );
  },
  // Aucun `play` ici : la recette s'ouvre AU REPOS (filtres fermés, aucun focus,
  // aucune animation d'ouverture/fermeture). Les interactions sont testées dans
  // la story « Collection — interactions » ci-dessous.
};

const collectionPlay: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("rôles déclaratifs : colonnes & actions (mêmes défs, deux jeux)", async () => {
      const colsFor = (r: Role) => AGENT_COLUMNS.filter((c) => c.roles.includes(r)).map((c) => c.id);
      await expect(colsFor("manager")).not.toEqual(colsFor("partenaire"));
      await expect(colsFor("manager").length).toBeGreaterThan(colsFor("partenaire").length);
      await expect(AGENT_ACTIONS.filter((a) => a.roles.includes("manager")).length).toBeGreaterThan(
        AGENT_ACTIONS.filter((a) => a.roles.includes("partenaire")).length,
      );
      const headerText = Array.from(canvasElement.querySelectorAll("th")).map((th) => (th.textContent ?? "").trim()).filter(Boolean);
      await expect(headerText).toEqual(["Agent", "Matricule", "Contrat", "Heures", "Delta", "Actions"]);
      // Aucun littéral de rôle dans l'affichage (cœur + cellules).
      const displaySource = [AgentTableCore.toString(), ...AGENT_COLUMNS.map((c) => c.cell.toString())].join("\n");
      await expect(/isPartner|isManager|role_code/.test(displaySource)).toBe(false);
    });

    await step("toolbar : entrée unique « Filtres » + accès aux filtres enregistrés", async () => {
      // Une seule entrée vers le panneau de filtres (le bouton « Filtres »)…
      await expect(canvas.getAllByRole("button", { name: /^Filtres(,|$)/ })).toHaveLength(1);
      const toolbarEl = canvasElement.querySelector<HTMLElement>('[class*="toolbar"]');
      await expect(toolbarEl).not.toBeNull();
      if (toolbarEl) {
        await expect(within(toolbarEl).getByRole("button", { name: /^Filtres(,|$)/ })).toBeInTheDocument();
        // …et le bouton « Filtres enregistrés » pour appliquer un jeu enregistré.
        await expect(within(toolbarEl).getByRole("button", { name: "Filtres enregistrés" })).toBeInTheDocument();
      }
    });

    await step("recherche sans correspondance → « aucun résultat » atteignable", async () => {
      // Fait AVANT d'ouvrir le panneau (aucun overlay) : la recherche de niveau
      // page filtre réellement le jeu — un terme sans correspondance vide la
      // liste et déclenche l'état « aucun résultat » du Table (interactif, pas
      // seulement via le contrôle « État »).
      const search = canvas.getByRole("searchbox", { name: /Rechercher un agent/ });
      await userEvent.type(search, "zzzz");
      // La liste se vide (l'agent de tête disparaît) → état « aucun résultat ».
      await waitFor(() => expect(canvas.queryByText("DUPONT Marie")).toBeNull());
      await expect(await canvas.findByText(/Aucun résultat/)).toBeInTheDocument();
      await userEvent.clear(search);
      await waitFor(() => expect(canvas.getByText("7 agents")).toBeInTheDocument());
    });

    await step("pagination (style story « With pagination ») : 5 lignes / page sur 7", async () => {
      // La table pagine comme la recette Table « With pagination » :
      // 7 agents, 5 par page → l'en-tête + 5 lignes de données côté desktop.
      const desktopTable = canvasElement.querySelector<HTMLElement>('[class*="tableDesktopOnly"]');
      await expect(desktopTable).not.toBeNull();
      if (desktopTable) {
        await expect(within(desktopTable).getAllByRole("row")).toHaveLength(1 + 5);
      }
    });

    await step("table sélectionnable : le clic de ligne coche la case ; le bouton d'actions garde la priorité", async () => {
      // Comme la recette Table « All-in-one » : getRowClickProps câble le clic de
      // ligne sur la sélection, mais ignore les contrôles interactifs (le bouton
      // d'actions a donc la priorité et ne modifie pas la sélection).
      const desktopTable = within(canvasElement.querySelector<HTMLElement>('[class*="tableDesktopOnly"]') as HTMLElement);
      const row = desktopTable.getByText("DUPONT Marie").closest("tr") as HTMLElement;
      const rowCheckbox = within(row).getByRole("checkbox");
      await expect(rowCheckbox).not.toBeChecked();
      // Clic sur la cellule du nom (zone non interactive) → la ligne coche la case.
      await userEvent.click(within(row).getByText("DUPONT Marie"));
      await expect(rowCheckbox).toBeChecked();
      // Clic sur le bouton d'actions de la ligne → priorité au bouton : la
      // sélection ne change pas (la case reste cochée).
      await userEvent.click(within(row).getByRole("button", { name: /Actions pour DUPONT Marie/ }));
      await expect(rowCheckbox).toBeChecked();
      // Reclic sur la ligne → décoche (remise à zéro avant l'étape suivante).
      await userEvent.click(within(row).getByText("DUPONT Marie"));
      await expect(rowCheckbox).not.toBeChecked();
    });

    // Étape ouvrant le panneau EN DERNIER : rien après elle ne dépend de la page
    // (le panneau — popover large / feuille compacte — recouvre la toolbar).
    await step("facette câblée « Types de contrats » : la boucle complète (option B)", async () => {
      await expect(canvas.getByText("7 agents")).toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: /^Filtres(,|$)/ }));
      await screen.findByRole("dialog");
      const dialog = () => within(screen.getByRole("dialog"));
      // Aller à « Types de contrats » puis cocher « CDI ».
      await userEvent.click(dialog().getByRole("button", { name: /Types de contrats/ }));
      await userEvent.click(dialog().getByRole("checkbox", { name: "CDI" }));
      // La liste se réduit (agents sous contrat) → le compteur change.
      await waitFor(() => expect(canvas.getByText("5 agents")).toBeInTheDocument());
      // Un tag actif apparaît sous la barre : il affiche la VALEUR seule (« CDI »,
      // sans préfixe de facette) ; le contexte « Types de contrats » reste porté
      // par l'aria-label de la croix de retrait (lecteurs d'écran).
      const activeFilters = within(canvas.getByRole("group", { name: "Filtres actifs" }));
      await expect(activeFilters.getByText("CDI")).toBeInTheDocument();
      await expect(activeFilters.getByRole("button", { name: "Retirer Types de contrats" })).toBeInTheDocument();
      // « Réinitialiser » (pied du panneau) remet tout.
      await userEvent.click(dialog().getByRole("button", { name: "Réinitialiser" }));
      await waitFor(() => expect(canvas.getByText("7 agents")).toBeInTheDocument());
      // La recette se REPOSE filtres fermés : on referme le panneau via son
      // déclencheur (toggle) pour que l'état au repos de la story ne laisse
      // jamais le panneau ouvert.
      await userEvent.click(canvas.getByRole("button", { name: /^Filtres(,|$)/ }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
};

/**
 * **Collection — interactions** : même recette que « Collection », avec la
 * fonction play qui exerce rôles, filtres, recherche, pagination et sélection.
 * Séparée pour que la recette principale reste au repos (rien ne s'ouvre ni ne
 * se referme à l'affichage).
 */
export const CollectionInteractions: Story = {
  ...Collection,
  name: "Collection — interactions (tests)",
  play: collectionPlay,
};

// -----------------------------------------------------------------------
// 1bis. LISTE DE SECTION — la liste posée DANS une fiche (fiche site), À PLAT
// (aucune Card). La fiche garde sa Page.Bar ; l'en-tête (sélecteur de site +
// actions + infos) et la section « Vacations du jour » sont posés SUR LE FOND,
// séparés par le rythme vertical. La section porte ses PROPRES contrôles
// (recherche + date + Télécharger), jamais une SECONDE Page.Toolbar.

interface Vacation {
  id: string;
  start: string;
  end: string;
  moment: "jour" | "nuit";
  pause?: string;
  agent?: string;
  profil: string;
  activite: string;
}

const VACATIONS: Vacation[] = [
  { id: "v1", start: "09:45", end: "17:45", moment: "jour", pause: "Pause 30 min", profil: "Gardiennage", activite: "SSIAP1" },
  { id: "v2", start: "09:45", end: "17:45", moment: "jour", pause: "Pause 30 min", profil: "Gardiennage", activite: "SSIAP1" },
  { id: "v3", start: "09:45", end: "17:45", moment: "jour", pause: "Pause 30 min", profil: "Gardiennage", activite: "SSIAP1" },
  { id: "v4", start: "10:00", end: "18:00", moment: "jour", profil: "SSIAP1", activite: "SSIAP1" },
];

const SITE_INFO: Array<{ label: string; value: string; muted?: boolean }> = [
  { label: "Client", value: "Centre commercial Grand Large" },
  { label: "Société", value: "Alpha" },
  { label: "Agence", value: "Non renseignée", muted: true },
  { label: "Secteur", value: "Secteur-site non défini", muted: true },
  { label: "Téléphone", value: "Non renseigné", muted: true },
  { label: "Téléphone PTI", value: "Non renseigné", muted: true },
];

const SITE_ADDRESS = ["Rue Duparc", "97490 Sainte-Clotilde"];

const CONTACTS: Array<{ initials: string; name: string; role: string }> = [
  { initials: "JB", name: "JERÔME BAILLIF", role: "Responsable côté exploitation" },
  { initials: "RG", name: "REMOND GUENRICK", role: "Responsable côté client" },
];

/**
 * Section « Vacations du jour » : contrôles de SECTION (filtre + navigateur de
 * date + Télécharger) + bandeau d'alerte « sans agent affecté » + `Table` du DS
 * **dé-encartée** avec une colonne d'action « Affecter ». Contrôles au niveau
 * section, jamais une seconde Page.Toolbar ; posée sur le fond (aucune Card).
 */
function VacationsSection(): React.ReactElement {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? VACATIONS.filter((v) => `${v.profil} ${v.activite} ${v.agent ?? ""}`.toLowerCase().includes(needle))
    : VACATIONS;
  return (
    <Stack gap="200">
      {/* Contrôles de SECTION sur UNE SEULE ligne (flex-wrap: nowrap) — pas une
          Page.Toolbar. La recherche se comprime ; date + téléchargement restent. */}
      <Cluster justify="between" align="center" gap="150" style={{ flexWrap: "nowrap" }}>
        <div className={css["searchWrapper"]}>
          <SearchField density="compact" placeholder="Filtrer les vacations" aria-label="Filtrer les vacations" value={q} onChange={setQ} />
        </div>
        <Cluster gap="100" align="center" style={{ flexWrap: "nowrap", flex: "none" }}>
          {/* Navigateur de jour (chevrons ← date → ) : DatePicker en mode navigation. */}
          <DatePicker isEditable={false} defaultValue={parseDate("2026-09-14")} aria-label="Jour des vacations" />
          <Button appearance="subtle" shape="square" iconBefore="Download" aria-label="Télécharger" />
        </Cluster>
      </Cluster>

      {/* Table du DS dé-encartée (aucun Card autour) + colonne d'action. */}
      <Table aria-label="Vacations du jour">
        <TableHead>
          <TableRow>
            <TableHeaderCell isSortable sortDirection="ascending" onSortChange={() => undefined}>Horaires</TableHeaderCell>
            <TableHeaderCell>Agent</TableHeaderCell>
            <TableHeaderCell hideBelow="md">Profil</TableHeaderCell>
            <TableHeaderCell>Activité</TableHeaderCell>
            <TableHeaderCell align="right" hideBelow="lg">PP</TableHeaderCell>
            <TableHeaderCell align="right" hideBelow="lg">PDS</TableHeaderCell>
            <TableHeaderCell align="right" hideBelow="lg">FDS</TableHeaderCell>
            <TableHeaderCell align="right"> </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody
          columnCount={8}
          isNoResults={rows.length === 0}
          noResultsTitle="Aucune vacation"
          noResultsDescription="Aucune vacation ne correspond à la recherche."
        >
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Stack gap="0">
                  <Cluster gap="075" align="center">
                    <Text as="span" weight="medium">{v.start}</Text>
                    <Icon icon={v.moment === "jour" ? "WbSunny" : "DarkMode"} size={16} color={v.moment === "jour" ? "warning" : "subtlest"} />
                    <Text as="span" weight="medium">{v.end}</Text>
                  </Cluster>
                  {v.pause ? <Text size="small" as="span" color="subtlest">{v.pause}</Text> : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Cluster gap="075" align="center">
                  <Avatar size="small" icon="Person" />
                  <Text as="span" color="subtle">Non affecté</Text>
                </Cluster>
              </TableCell>
              <TableCell hideBelow="md">{v.profil}</TableCell>
              <TableCell><Tag label={v.activite} appearance="subtle" shape="rounded" /></TableCell>
              <TableCell align="right" hideBelow="lg"><Text as="span" color="subtlest">—</Text></TableCell>
              <TableCell align="right" hideBelow="lg"><Text as="span" color="subtlest">—</Text></TableCell>
              <TableCell align="right" hideBelow="lg"><Text as="span" color="subtlest">—</Text></TableCell>
              <TableCell align="right">
                <Button appearance="subtle" shape="square" iconBefore="PersonAdd" aria-label={`Affecter un agent (${v.start}–${v.end})`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

/**
 * **Liste de section (fiche site)** — la liste posée DANS une fiche, **à plat
 * (aucune Card)**, en deux colonnes.
 *
 * La fiche garde sa `Page.Bar` (« Sites / Fiche site », `Breadcrumbs`). À
 * **gauche** : les régions descriptives posées sur le fond — **Informations**,
 * **Adresse** (+ « Voir sur la carte ») et **Contacts**. À **droite** : des
 * **onglets** (Vacations du jour / Consignes et documents / Main courante) ; la
 * liste vit dans « Vacations du jour » avec ses **propres contrôles** (filtre +
 * navigateur de date + Télécharger), un **bandeau d'alerte** et une `Table`
 * dé-encartée — jamais une seconde `Page.Toolbar`.
 */
export const ListeDeSection: Story = {
  name: "Liste de section (fiche site)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  render: function FicheSiteStory() {
    return (
      <Page
        globalActions={
          <>
            <Button appearance="subtle" density="compact" iconBefore="Search" aria-label="Rechercher" />
            <Avatar size="medium" initials="A" />
          </>
        }
      >
        <Page.Bar
          size="compact"
          title="Fiche site"
          leading={<Button appearance="subtle" iconBefore="ChevronLeft" aria-label="Retour aux sites" />}
        />
        <Page.Body>
          <Grid gap="400">
            {/* COLONNE GAUCHE — régions descriptives posées sur le fond. */}
            <Grid.Col span={{ mobile: 12, tablet: 4, desktop: 3 }}>
              <Stack gap="300">
                {/* Informations */}
                <Stack gap="150">
                  <Heading size="xsmall" as="h2">Informations</Heading>
                  <Stack gap="100">
                    {SITE_INFO.map((r) => (
                      <div key={r.label} style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "var(--space150)", alignItems: "baseline" }}>
                        <Text size="small" as="span" color="subtlest">{r.label}</Text>
                        <span style={{ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.value}>
                          <Text as="span" weight="medium" color={r.muted ? "subtlest" : undefined}>{r.value}</Text>
                        </span>
                      </div>
                    ))}
                  </Stack>
                </Stack>

                <Divider />

                {/* Adresse (sans carte) + accès « Voir sur la carte ». */}
                <Stack gap="100">
                  <Heading size="xsmall" as="h2">Adresse</Heading>
                  <Stack gap="0">
                    {SITE_ADDRESS.map((line) => (
                      <Text key={line} as="span">{line}</Text>
                    ))}
                  </Stack>
                  <Cluster>
                    <Button appearance="subtle" density="compact" iconBefore="LocationOn">Voir sur la carte</Button>
                  </Cluster>
                </Stack>

                <Divider />

                {/* Contacts — déplacés ici (à gauche), plus un onglet. */}
                <Stack gap="150">
                  <Heading size="xsmall" as="h2">Contacts</Heading>
                  {CONTACTS.map((c) => (
                    <Cluster key={c.name} gap="100" align="center">
                      <Avatar size="small" initials={c.initials} alt={c.name} />
                      <Stack gap="0">
                        <Text as="span" weight="medium">{c.name}</Text>
                        <Text size="small" as="span" color="subtlest">{c.role}</Text>
                      </Stack>
                    </Cluster>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>

            {/* COLONNE DROITE — onglets + liste des vacations. */}
            <Grid.Col span={{ mobile: 12, tablet: 8, desktop: 9 }}>
              <Tabs>
                <TabList>
                  <Tab id="vacations">
                    Vacations du jour <Badge label={String(VACATIONS.length)} appearance="neutral" importance="medium" />
                  </Tab>
                  <Tab id="consignes">Consignes et documents</Tab>
                  <Tab id="maincourante">Main courante</Tab>
                </TabList>
                <TabPanel id="vacations">
                  <div style={{ paddingTop: "var(--space300)" }}>
                    <VacationsSection />
                  </div>
                </TabPanel>
                <TabPanel id="consignes">
                  <div style={{ paddingTop: "var(--space300)" }}>
                    <SectionMessage appearance="information">
                      {"Aucune consigne ni document pour ce site."}
                    </SectionMessage>
                  </div>
                </TabPanel>
                <TabPanel id="maincourante">
                  <div style={{ paddingTop: "var(--space300)" }}>
                    <SectionMessage appearance="information">
                      {"Aucune entrée de main courante pour aujourd'hui."}
                    </SectionMessage>
                  </div>
                </TabPanel>
              </Tabs>
            </Grid.Col>
          </Grid>
        </Page.Body>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // La fiche garde sa Page.Bar, mais AUCUNE surface de niveau page pour la
    // liste : ni segment de vues (radios), ni bouton « Filtres ».
    await expect(canvas.queryByRole("radio")).toBeNull();
    await expect(canvas.queryByRole("button", { name: /^Filtres(,|$)/ })).toBeNull();

    // Colonne GAUCHE : Informations + Adresse (+ carte) + Contacts.
    await expect(canvas.getByRole("heading", { name: "Informations" })).toBeInTheDocument();
    await expect(canvas.getByText("Alpha")).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Adresse" })).toBeInTheDocument();
    await expect(canvas.getByText(/Sainte-Clotilde/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Voir sur la carte" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Contacts" })).toBeInTheDocument();
    await expect(canvas.getByText("JERÔME BAILLIF")).toBeInTheDocument();
    // Contacts n'est PLUS un onglet (déplacé à gauche).
    await expect(canvas.queryByRole("tab", { name: /Contacts/ })).toBeNull();

    // Onglets conservés (droite) : Vacations / Consignes / Main courante.
    await expect(canvas.getByRole("tab", { name: /Vacations du jour/ })).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: /Consignes/ })).toBeInTheDocument();
    await expect(canvas.getByRole("tab", { name: /Main courante/ })).toBeInTheDocument();

    // Section « Vacations du jour » : contrôles + tableau dé-encarté (plus de
    // bandeau d'alerte jaune).
    await expect(canvas.getByRole("button", { name: "Télécharger" })).toBeInTheDocument();
    const headerText = Array.from(canvasElement.querySelectorAll("th")).map((th) => (th.textContent ?? "").trim()).filter(Boolean);
    await expect(headerText).toEqual(["Horaires", "Agent", "Profil", "Activité", "PP", "PDS", "FDS"]);
    await expect(canvas.getAllByText("Gardiennage").length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getAllByText("Non affecté").length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getAllByRole("button", { name: /Affecter un agent/ }).length).toBe(VACATIONS.length);

    // Filtre de SECTION : un terme sans correspondance → « aucune vacation ».
    const search = canvas.getByRole("searchbox", { name: /Filtrer les vacations/ });
    await userEvent.type(search, "zzzz");
    await expect(await canvas.findByText(/Aucune vacation ne correspond/)).toBeInTheDocument();
  },
};

// -----------------------------------------------------------------------
// 1ter. GUIDELINES — « Anatomie d'un écran de liste » (§7)

const ANATOMIE: Array<{ n: string; el: string; note: string }> = [
  { n: "1", el: "Banner", note: "Alerte globale, au-dessus du layout, hors de Page.Body. À l'intérieur du contenu, c'est SectionMessage — jamais l'inverse." },
  { n: "2", el: "SideNav", note: "À gauche, avec son Provider et son repli ; le SideNav.Trigger vit dans Page.Bar.leading (cf. story Base)." },
  { n: "3", el: "Page.Bar", note: "Titre de l'écran, fil d'Ariane, action primaire." },
  { n: "4", el: "Page.Toolbar — une seule par écran", note: "search = recherche ; filters = le bouton « Filtres » (recette option B : popover deux volets / feuille en compact) ; end = les actions de page." },
  { n: "5", el: "Rangée de tags des critères actifs", note: "Sous la toolbar (desktop) : les critères posés, groupés par catégorie, « Réinitialiser ». En compact/mobile elle s'efface — le badge du bouton « Filtres » et la feuille portent les critères. L'unique entrée vers les filtres est le bouton « Filtres » de la toolbar." },
  { n: "6", el: "Table", note: "responsive, hideBelow sur les colonnes secondaires, tri, pagination, sélection, lignes interactives." },
];

// Prose gardée en constantes (apostrophes hors JSX — règle react/no-unescaped-entities).
const G_TITLE = "Anatomie d'un écran de liste";
const G_INTRO =
  "Premier gabarit de page (D10). La recette fixe la structure et le comportement ; elle laisse au produit le choix des colonnes, des vues et des facettes.";
const G_SIX = "Les six éléments, dans l'ordre";
const G_D16_TITLE = "Le clic de ligne — doctrine D16";
const G_D16 =
  "Navigation quand l'objet a une page à lui : href sur la cellule primaire + isRowAnchor (les modificateurs Ctrl/⌘+clic et clic-milieu doivent marcher). Modale : réservée à la confirmation, pas à la consultation.";
const G_TOOLBAR_TITLE = "Une seule toolbar de niveau page par écran";
const G_TOOLBAR =
  "Une liste de section porte ses contrôles réduits au niveau section, jamais une seconde Page.Toolbar. Ce que la recette ne décide pas : quelles colonnes, quelles vues, quelles facettes — ça appartient au produit, écran par écran.";

const RULES: Array<{ title: string; body: string }> = [
  {
    title: "Vues ou filtres ?",
    body: "Les états de travail (anomalies, en cours, terminé, mes documents…) sont des VUES dans la barre d'outils. Les critères (sites, prestations, profils…) sont des FILTRES, dans le bouton « Filtres » (option B). Un état ne descend jamais dans le panneau de filtres.",
  },
  {
    title: "L'élévation est pour ce qui flotte, pas pour ce qui est posé",
    body: "Un popover, une feuille, un panneau superposé : élévation légitime. Une section, une rangée de tags, un tableau : sur le fond, délimités par l'espacement et un filet.",
  },
  {
    title: "Une liste vit à deux niveaux",
    body: "En PAGE, elle porte le chrome (Page.Bar, Page.Toolbar) et la surface de contrôle complète (recherche, bouton Filtres, filtres enregistrés, tags actifs). En LISTE DE SECTION (dans une fiche), la fiche garde sa Page.Bar mais AUCUNE surface de niveau page pour la liste : chaque section porte ses propres contrôles (recherche, date, actions), posés sur le fond — aucune Card, jamais une seconde Page.Toolbar.",
  },
  {
    title: "La visibilité par rôle est déclarative, à la source",
    body: "Chaque colonne / facette / action porte son roles: [...] ; l'affichage ne garde que les éléments dont roles inclut le rôle courant. Un composant d'affichage ne teste JAMAIS isPartner / isManager en dur.",
  },
  {
    title: "Rythme inter-sections",
    body: "La séparation entre deux sections d'une fiche vient du rythme vertical et de la hiérarchie typographique, jamais d'un fond ni d'une carte : espacement vertical ≥ --space500 entre deux sections consécutives ; titre de section en Heading size=small (un cran sous le titre de la fiche) ; ordre imposé dans chaque section : en-tête → tableau → pagination.",
  },
];

/**
 * **Guidelines** — anatomie d'un écran de liste (D10, §7).
 *
 * La recette décide de la STRUCTURE et du COMPORTEMENT ; elle ne décide pas
 * quelles colonnes, quelles vues ni quelles facettes — ça appartient au produit.
 */
export const Guidelines: Story = {
  name: "Guidelines (anatomie)",
  parameters: { design: { type: "figma", url: figmaUrl("4319:15827") } },
  render: () => (
    <Page globalActions={null}>
      <Page.Body>
        <div style={{ maxWidth: 820 }}>
          <Stack gap="400">
            <Stack gap="100">
              <Heading size="large" as="h1">{G_TITLE}</Heading>
              <Text color="subtle">{G_INTRO}</Text>
            </Stack>

            <Divider />

            <Stack gap="200">
              <Heading size="small" as="h2">{G_SIX}</Heading>
              <Stack gap="150">
                {ANATOMIE.map((r) => (
                  <Cluster key={r.n} gap="150" align="start">
                    <Badge label={r.n} appearance="information" importance="medium" />
                    <Stack gap="025">
                      <Text weight="medium" as="span">{r.el}</Text>
                      <Text size="small" as="span" color="subtle">{r.note}</Text>
                    </Stack>
                  </Cluster>
                ))}
              </Stack>
            </Stack>

            <Stack gap="100">
              <Heading size="small" as="h2">{G_D16_TITLE}</Heading>
              <Text color="subtle">{G_D16}</Text>
            </Stack>

            <Stack gap="100">
              <Heading size="small" as="h2">{G_TOOLBAR_TITLE}</Heading>
              <Text color="subtle">{G_TOOLBAR}</Text>
            </Stack>

            <Divider />

            <Stack gap="200">
              {RULES.map((rule) => (
                <SectionMessage key={rule.title} appearance="information" title={rule.title}>
                  {rule.body}
                </SectionMessage>
              ))}
            </Stack>
          </Stack>
        </div>
      </Page.Body>
    </Page>
  ),
};

// -----------------------------------------------------------------------
// 2. ENTITY

/**
 * **Entity** — Fiche détail avec sidebar profil + contenu tabs.
 *
 * - Actions (Modifier, Archiver) dans la sidebar, sous le profil
 * - `SectionMessage` pour les messages contextuels (pas Banner)
 */
export const Entity: Story = {
  name: "Entity (fiche détail)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  render: () => (
      <Page globalActions={null}>
        <Page.Bar
          title="Entité"
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Page.Body>
          <Grid gap="300">
            <Grid.Col span={{ mobile: 12, tablet: 5, desktop: 4 }}>
              <Stack gap="200">
                <Stack gap="200">
                  <Stack direction="row" gap="200" align="center">
                    <Avatar size="xlarge" initials="DM" />
                    <Stack align="start" gap="050">
                      <Stack>
                        <Heading size="medium" as="span">DUPONT Marie</Heading>
                      </Stack>
                      <Tag elemBefore={<Icon icon="AwardStar" size={16} color="success" />} label="Conforme" color="success"  />
                    </Stack>
                  </Stack>
                  <Text size="large">Agent de sureté</Text>
                  <Stack gap="050">
                    <Stack direction="row" gap="100" align="center">
                      <Icon icon="LabelImportant" size={20} color="subtlest" />
                      <Text as="span" weight="medium">MAT0001</Text>
                    </Stack>
                    <Stack direction="row" gap="100" align="center">
                      <Icon icon="CorporateFlare" size={20} color="subtlest" />
                      <Text as="span">Pro sécurité</Text>
                    </Stack>
                    <Stack direction="row" gap="100" align="center">
                      <Icon icon="Email" size={20} color="subtlest" />
                      <Text as="span">marie.dupont@mail.com</Text>
                    </Stack>
                    <Stack direction="row" gap="100" align="center">
                      <Icon icon="LocationOn" size={20} color="subtlest" />
                      <Text as="span">Ile de France</Text>
                    </Stack>
                    <Stack direction="row" gap="100" align="center">
                      <Icon icon="School" size={20} color="subtlest" />
                      <Text as="span">Niveau 3, Échelon 3</Text>
                    </Stack>
                  </Stack>

                  <Card appearance="subtle" color="neutral">
                    <Stack padding="200" gap="150">
                      <Stack direction="row" gap="100" align="center">
                        <IconTile icon="CalendarClock" appearance="success" size="small" />
                        <Text as="span">WWWW1</Text>
                      </Stack>
                      <Divider />
                      <Stack direction="row" gap="100" align="center">
                        <IconTile icon="School" appearance="information" size="small" />
                        <Text as="span">WWWW</Text>
                      </Stack>
                    </Stack>
                  </Card>                  
                  <Cluster gap="100" justify="center">
                    <Button appearance="contained" iconBefore="CalendarMonth" color="comete" >Planning</Button>
                    <Button appearance="contained" iconBefore="Newspaper">Documents</Button>
                    <Button appearance="contained" iconBefore="History">Rapports</Button>
                  </Cluster>
                </Stack>
                <Divider />
                <Stack gap="150">
                  <PropRow icon="Mail" label="E-mail" value="marie.dupont@mail.com" />
                  <PropRow icon="Badge" label="Matricule" value="150" />
                  <PropRow icon="BusinessCenter" label="Société" value="AEXAE" />
                  <PropRow icon="LocationOn" label="Secteur" value="Ile de France" />
                  <PropRow icon="School" label="Qualification" value="Agent N3E3" />
                </Stack>
                <Divider />
                <Cluster gap="100">
                  <Button appearance="subtle" iconBefore="Edit">Modifier</Button>
                  <Button appearance="subtle" color="critical" iconBefore="Archive">Archiver</Button>
                </Cluster>

                <Card appearance="outlined">
                  <CC>
                    <Stack gap="200">
                      <Heading size="small" as="span">Chiffres clés — Avril 2026</Heading>
                      <div className={css["metricsGrid"]}>
                        <MetricTile label="Contrat" value="151.67" unit="h" />
                        <MetricTile label="Heures pay." value="151.67" unit="h" />
                        <MetricTile label="Indispo +" value="0.00" unit="h" />
                        <MetricTile label="Indispo −" value="0.00" unit="h" />
                        <div className={css["metricsGridFull"]}>
                          <MetricTile label="Delta" value="0.00" unit="h" highlight="success" />
                        </div>
                      </div>
                    </Stack>
                  </CC>
                </Card>

              </Stack>
            </Grid.Col>

            <Grid.Col span={{ mobile: 12, tablet: 7, desktop: 8 }}>
              <Card appearance="outlined">
                <div className={css["cardColumn"]}>
                  <Tabs>
                    <div style={{ padding: "var(--space200) var(--space200) 0" }}>
                      <TabList>
                        <Tab id="planning">Planning</Tab>
                        <Tab id="documents">Documents</Tab>
                        <Tab id="historique">Historique</Tab>
                      </TabList>
                    </div>
                    <TabPanel id="planning">
                      <CC>
                        <Stack gap="200">
                          <Cluster justify="between" align="center">
                            <MonthPicker month={4} year={2026} isEditable={false} aria-label="Mois du planning" />
                            <Button appearance="subtle" iconBefore="Download">Exporter</Button>
                          </Cluster>
                          <SectionMessage appearance="warning" title="Aucune planification">
                            {"Aucune vacation n'est planifiée pour avril 2026."}
                          </SectionMessage>
                          <div className={css["placeholder"]} style={{ height: 300 }}>Calendrier de planification</div>
                        </Stack>
                      </CC>
                    </TabPanel>
                    <TabPanel id="documents">
                      <CC>
                        <Stack gap="200">
                          <Cluster justify="between" align="center">
                            <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: 300 }}>
                              <SearchField placeholder="Rechercher un document…" />
                            </div>
                            <Button appearance="subtle" iconBefore="UploadFile">Importer</Button>
                          </Cluster>
                          <Card appearance="subtle">
                            <CC padding="var(--space300)">
                              <Stack gap="100" align="center">
                                <Icon icon="Newspaper" />
                                <Text color="subtlest" align="center">Aucun document pour cet agent.</Text>
                                <Button appearance="subtle" iconBefore="UploadFile">Importer un document</Button>
                              </Stack>
                            </CC>
                          </Card>
                        </Stack>
                      </CC>
                    </TabPanel>
                    <TabPanel id="historique">
                      <CC>
                        <Stack gap="150">
                          {[
                            { date: "17/04/2026", action: "Contrat modifié", user: "A. Cremont" },
                            { date: "15/04/2026", action: "Document ajouté : Attestation SST", user: "M. Dupont" },
                            { date: "01/04/2026", action: "Planification avril créée", user: "Système" },
                            { date: "28/03/2026", action: "Fiche agent mise à jour", user: "A. Cremont" },
                          ].map((e, i) => (
                            <Stack key={i} direction="row" gap="200" align="start">
                              <Text size="small" as="span" color="subtlest">{e.date}</Text>
                              <Stack gap="0">
                                <Text as="span">{e.action}</Text>
                                <Text size="small" as="span" color="subtlest">{e.user}</Text>
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      </CC>
                    </TabPanel>
                  </Tabs>
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        </Page.Body>
      </Page>
  ),
};

// -----------------------------------------------------------------------
// 3. Home

/**
 * **Home** — Vue d'ensemble avec KPIs, activité et résumés.
 *
 * - Greeting card avec actions rapides
 * - KPI tiles avec trends
 * - Activité + Couverture — 2 colonnes dès tablet
 * - Sites en cards responsives
 */
export const Home: Story = {
  name: "Home (Accueil)",
  parameters: { design: { type: "figma", url: figmaUrl("4587:24160") } },
  render: () => (
      <Page globalActions={null}>
        <Page.Bar
          title="Accueil"
          trailing={
            <Stack direction="row" gap="150" align="center">
              <Button appearance="subtle" density="compact" iconBefore="ChevronLeft" aria-label="Précédent" />
              <Text weight="medium" as="span">Avril 2026</Text>
              <Button appearance="subtle" density="compact" iconBefore="ChevronRight" aria-label="Suivant" />
              <Avatar size="medium" initials="AC" />
            </Stack>
          }
        />
        <Page.Body>
          <Stack gap="400">
            {/* Greeting */}
            <Card appearance="subtle">
              <CC padding="var(--space300)">
                <Stack gap="200">
                  <Stack gap="050">
                    <Heading size="xlarge" as="span">Bonjour Axel</Heading>
                    <Text as="span" color="subtle">{"Vous avez 3 alertes et 30 vacations non affectées ce mois-ci."}</Text>
                  </Stack>
                  <Cluster gap="100">
                    <Button color="comete" iconBefore="CalendarMonth">Planifier</Button>
                    <Button appearance="outlined" iconBefore="PersonAdd">Ajouter un agent</Button>
                    <Button appearance="outlined" iconBefore="Download">Exporter</Button>
                  </Cluster>
                </Stack>
              </CC>
            </Card>

            {/* KPIs */}
            <Grid columns={{ mobile: 2, tablet: 4 }} gap="200">
              <Grid.Col><KpiTile icon="CalendarMonth" iconColor="success" value="42" label="Vacations affectées" trend="+12%" trendUp /></Grid.Col>
              <Grid.Col><KpiTile icon="LocationOn" iconColor="warning" value="3" label="Alertes" trend="+2" trendUp={false} /></Grid.Col>
              <Grid.Col><KpiTile icon="Schedule" iconColor="information" value="1" label="Retards" trend="−1" trendUp /></Grid.Col>
              <Grid.Col><KpiTile icon="Warning" iconColor="critical" value="0" label="PDS manquées" trend="0" /></Grid.Col>
            </Grid>

            {/* Activity + Coverage */}
            <Grid gap="300">
              <Grid.Col span={{ mobile: 12, tablet: 7 }}>
                <Card appearance="outlined">
                  <CC>
                    <Stack gap="200">
                      <Cluster justify="between" align="center">
                        <Heading size="small" as="span">Activité récente</Heading>
                        <Button appearance="link" density="compact">Tout voir</Button>
                      </Cluster>
                      <Divider />
                      {[
                        { icon: "Newspaper" as IconName, title: "Mise à jour v1.8.0", sub: "Nouvelles fonctionnalités", date: "Aujourd'hui", bold: true },
                        { icon: "Warning" as IconName, title: "Maintenance le 25/04", sub: "Indisponible de 2h à 4h", date: "Il y a 2j", bold: true },
                        { icon: "Newspaper" as IconName, title: "Export PDF disponible", sub: "Depuis la fiche site", date: "Il y a 7j", bold: false },
                        { icon: "Group" as IconName, title: "3 agents ajoutés", sub: "LEROY, GARNIER, SIMON", date: "22/03", bold: false },
                      ].map((item, i) => (
                        <Stack key={i} direction="row" gap="150" align="start">
                          <div className={css["activityIcon"]}><Icon icon={item.icon} /></div>
                          <Stack gap="0">
                            <Text weight={item.bold ? "medium" : "regular"} as="span">{item.title}</Text>
                            <Text size="small" as="span" color="subtlest">{item.sub}</Text>
                          </Stack>
                          <span style={{ marginLeft: "auto", flexShrink: 0 }}>
                            <Text size="small" as="span" color="subtlest">{item.date}</Text>
                          </span>
                        </Stack>
                      ))}
                    </Stack>
                  </CC>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ mobile: 12, tablet: 5 }}>
                <Card appearance="outlined">
                  <CC>
                    <Stack gap="200">
                      <Cluster justify="between" align="center">
                        <Heading size="small" as="span">Couverture</Heading>
                        <Text size="small" as="span" color="subtlest">Avril 2026</Text>
                      </Cluster>
                      <Divider />
                      <ProgressRow icon="Group" label="Agents" current={1} total={140} />
                      <ProgressRow icon="BusinessCenter" label="Sites" current={3} total={65} />
                      <ProgressRow icon="CalendarMonth" label="Vacations" current={42} total={329} />
                    </Stack>
                  </CC>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Sites */}
            <Stack gap="200">
              <Cluster justify="between" align="center">
                <Heading size="small" as="span">Sites actifs</Heading>
                <Button appearance="link" density="compact">Voir tous</Button>
              </Cluster>
              <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="200">
                {[
                  { site: "Carrefour Market Chatel", client: "Vindémia Distribution", secteur: "Ile de France", vac: 30, nonAff: 30, couv: "0%" },
                  { site: "Imperial Palace", client: "Mairie de Merville", secteur: "Rhône Alpes", vac: 180, nonAff: 179, couv: "0.56%" },
                  { site: "Jardins de la Roseraie", client: "Syndicat copropriété", secteur: "Grand Est", vac: 119, nonAff: 119, couv: "0%" },
                ].map((s, i) => (
                  <Grid.Col key={i}>
                    <Card appearance="outlined" onPress={() => undefined}>
                      <CC>
                        <Stack gap="150">
                          <Stack gap="025">
                            <Heading size="xsmall" as="span">{s.site}</Heading>
                            <Text size="small" as="span" color="subtlest">{s.client}</Text>
                          </Stack>
                          <Tag label={s.secteur} />
                          <Divider />
                          <div className={css["siteStats"]}>
                            <Stack gap="0"><Text size="small" as="span" color="subtlest">Vacations</Text><Heading size="small" as="span">{String(s.vac)}</Heading></Stack>
                            <Stack gap="0"><Text size="small" as="span" color="subtlest">Non affect.</Text><Text size="small" weight="bold" as="span" color={s.nonAff > 0 ? "warning" : undefined}>{String(s.nonAff)}</Text></Stack>
                            <Stack gap="0"><Text size="small" as="span" color="subtlest">Couverture</Text><Heading size="small" as="span">{s.couv}</Heading></Stack>
                          </div>
                        </Stack>
                      </CC>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </Page.Body>
      </Page>
  ),
};

// -----------------------------------------------------------------------
// 4. SETTINGS

/**
 * **Settings** — Page de paramètres avec tabs.
 *
 * - `SectionMessage` pour les messages informatifs
 * - `Field` + `TextField` pour les formulaires
 * - Grille de cards pour les rôles, Tag pour les étiquettes
 */
export const Settings: Story = {
  name: "Settings (paramètres)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  render: () => (
      <Page globalActions={null}>
        <Page.Bar title="Permissions" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Body>
          <Tabs>
            <TabList>
              <Tab id="roles" iconBefore="Manager">Rôles</Tab>
              <Tab id="fonctions" iconBefore="ManageAccounts">Fonctions</Tab>
              <Tab id="explorateur" iconBefore="Search">Explorateur</Tab>
            </TabList>

            <TabPanel id="roles">
              <div style={{ paddingTop: "var(--space300)" }}>
                <Stack gap="300">
                  <SectionMessage appearance="information">
                    {"Les rôles définissent le niveau d'accès système. Ils ne sont pas personnalisables."}
                  </SectionMessage>
                  <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="200">
                    {[
                      { role: "Administrateur", desc: "Accès complet. Gestion des utilisateurs, sites et paramètres.", count: 15, icon: "Administrator" as IconName },
                      { role: "Manager", desc: "Accès aux sites autorisés. Planification et suivi.", count: 20, icon: "Manager" as IconName },
                      { role: "Agent", desc: "Pointage et accès planning personnel.", count: 137, icon: "Person" as IconName },
                      { role: "Client", desc: "Lecture seule sur les sites attribués.", count: 53, icon: "Visibility" as IconName },
                    ].map((r) => (
                      <Grid.Col key={r.role}>
                        <Card appearance="outlined" onPress={() => undefined}>
                          <CC>
                            <Stack gap="150">
                              <Cluster justify="between" align="start">
                                <div className={css["iconPuck"]}><Icon icon={r.icon} /></div>
                                <Badge label={`${r.count}`} appearance="neutral" importance="medium" />
                              </Cluster>
                              <Stack gap="050">
                                <Heading size="small" as="span">{r.role}</Heading>
                                <Text size="small" as="span" color="subtle">{r.desc}</Text>
                              </Stack>
                            </Stack>
                          </CC>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </div>
            </TabPanel>

            <TabPanel id="fonctions">
              <div style={{ paddingTop: "var(--space300)" }}>
                <Stack gap="300">
                  <Cluster justify="between" align="center">
                    <Stack gap="050">
                      <Heading size="small" as="span">Fonctions</Heading>
                      <Text as="span" color="subtle">Affinez les permissions au-delà des rôles.</Text>
                    </Stack>
                    <Button color="comete" iconBefore="Add">Nouvelle fonction</Button>
                  </Cluster>

                  <div className={css["tableDesktopOnly"]}>
                    <Card appearance="outlined">
                      <div className={css["cardColumn"]}>
                        <MiniTableRow isHeader cells={["Fonction", "Rôle", "Utilisateurs", "Modifié le"]} />
                        {[
                          { fn: "Responsable planning", role: "Manager", users: "8", date: "12/04/2026" },
                          { fn: "Superviseur terrain", role: "Manager", users: "5", date: "08/04/2026" },
                          { fn: "Gestionnaire RH", role: "Admin.", users: "3", date: "01/04/2026" },
                        ].map((fn, i) => (
                          <MiniTableRow key={i} cells={[
                            <Text key="fn" weight="medium" as="span">{fn.fn}</Text>,
                            <Tag key="r" label={fn.role} />,
                            fn.users,
                            fn.date,
                          ]} />
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div className={css["cardsMobileOnly"]}>
                    <Stack gap="100">
                      {[
                        { fn: "Responsable planning", role: "Manager", users: "8", date: "12/04/2026" },
                        { fn: "Superviseur terrain", role: "Manager", users: "5", date: "08/04/2026" },
                        { fn: "Gestionnaire RH", role: "Admin.", users: "3", date: "01/04/2026" },
                      ].map((fn, i) => (
                        <Card key={i} appearance="outlined">
                          <CC>
                            <Stack gap="100">
                              <Cluster justify="between" align="center">
                                <Heading size="xsmall" as="span">{fn.fn}</Heading>
                                <Tag label={fn.role} />
                              </Cluster>
                              <Cluster gap="200">
                                <Text size="small" as="span" color="subtlest">{fn.users} utilisateurs</Text>
                                <Text size="small" as="span" color="subtlest">Modifié le {fn.date}</Text>
                              </Cluster>
                            </Stack>
                          </CC>
                        </Card>
                      ))}
                    </Stack>
                  </div>
                </Stack>
              </div>
            </TabPanel>

            <TabPanel id="explorateur">
              <div style={{ paddingTop: "var(--space300)" }}>
                <Stack gap="300">
                  <Text color="subtle">{"Vérifiez les permissions effectives d'un utilisateur."}</Text>
                  <Card appearance="outlined">
                    <CC>
                      <Stack gap="200">
                        <Grid columns={{ mobile: 1, tablet: 3 }} gap="200">
                          <Grid.Col>
                            <Field label="Utilisateur">
                              <TextField placeholder="Rechercher…" />
                            </Field>
                          </Grid.Col>
                          <Grid.Col>
                            <Field label="Ressource">
                              <TextField placeholder="Rechercher…" />
                            </Field>
                          </Grid.Col>
                          <Grid.Col>
                            <Field label=" ">
                              <Button color="comete" iconBefore="Search">Vérifier</Button>
                            </Field>
                          </Grid.Col>
                        </Grid>
                        <Divider />
                        <Stack gap="100" align="center">
                          <Icon icon="Search" />
                          <Text color="subtlest" align="center">Sélectionnez un utilisateur et une ressource.</Text>
                        </Stack>
                      </Stack>
                    </CC>
                  </Card>
                </Stack>
              </div>
            </TabPanel>
          </Tabs>
        </Page.Body>
      </Page>
  ),
};
