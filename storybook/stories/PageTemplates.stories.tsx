// Page layout templates — modern composition examples for developers
//
// IMPORTANT — Banner vs SectionMessage:
//   • Banner       → global alert, ABOVE the page layout (outside Page.Body)
//   • SectionMessage → contextual message INSIDE the page content

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemTrailing,
} from "@aexae/comete-design-system/components";
import { useTableSelection } from "@aexae/comete-design-system/hooks";
import css from "./PageTemplates.module.css";
import { FilterBar, FACETS } from "./_filterDemo";

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
// Recette « Liste » standard (D10). La visibilité par rôle est DÉCLARATIVE :
// chaque colonne / action porte son `roles` (une source par élément) ; aucun
// `if (isPartner)` dans l'affichage (§0bis.B du prompt D10).
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

// Vues de travail (§2) = segment dans la toolbar ; compteur = badge.
const AGENT_VIEWS = [
  { id: "tous", label: "Tous", badge: "140" },
  { id: "anomalies", label: "Anomalies", badge: "12" },
  { id: "actifs", label: "Actifs" },
];

const ROWS_PER_PAGE = 5;

// -----------------------------------------------------------------------
// Cœur partagé (§0bis.A) : Table du DS + quatre états + sélection + repli
// téléphone + lignes interactives. Factorisé pour être réutilisé par les DEUX
// formes — « Liste » (page) et « Liste de section » — qui ne diffèrent que par
// leur surface de contrôle (vues + filtres pour la page ; rien de plus que le
// tri + la recherche compacte pour la section). Présentationnel : toutes les
// données arrivent déjà filtrées / triées / paginées par l'appelant.
interface AgentTableCoreProps {
  /** Libellé accessible de la Table (diffère page ↔ section). */
  ariaLabel: string;
  /** Colonnes déjà filtrées par rôle (source déclarative, §0bis.B). */
  cols: AgentColumn[];
  /** Nb de colonnes rendues (sélection incluse) — pour les états du TableBody. */
  columnCount: number;
  state: string;
  /** Agents de la page courante (déjà triés + slicés). */
  pageAgents: Agent[];
  /** Total filtré — pagination + compteur. */
  totalCount: number;
  sel: ReturnType<typeof useTableSelection<string>>;
  sort: { col: string; dir: SortDir };
  onSort: (s: { col: string; dir: SortDir }) => void;
  page: number;
  onPageChange: (p: number) => void;
  /**
   * Liste de section : « aucun résultat » en UNE ligne (variante compacte, §4)
   * au lieu de l'état riche illustré. Sans effet sur les autres états.
   */
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
  compactEmpty = false,
}: AgentTableCoreProps): React.ReactElement {
  const isData = state === "data";
  // Repli téléphone : ce que la liste compacte montre dérive des MÊMES
  // colonnes déclaratives (aucun littéral de rôle). Matricule et delta ne
  // s'affichent que si leur colonne est visible pour le rôle courant.
  const showMat = cols.some((c) => c.id === "mat");
  const showDelta = cols.some((c) => c.id === "delta");
  const compactSecondary = (a: Agent): string | undefined =>
    [showMat ? `Mat. ${a.mat}` : null, a.contrat ? `${a.contrat} h` : null]
      .filter(Boolean)
      .join(" · ") || undefined;

  // Liste de section : « aucun résultat » (filtré à zéro) en une seule ligne,
  // sans l'état riche du TableBody ni la pagination (§4). Les autres formes
  // passent par le rendu complet ci-dessous.
  if (compactEmpty && state === "noResults") {
    return (
      <Text size="small" as="p" color="subtlest">
        Aucun résultat pour cette section.
      </Text>
    );
  }

  return (
    <>
      {/* Sélection active → barre contextuelle (compteur + actions groupées) ;
          sinon le compteur de résultats. Même emplacement. Masqués hors état
          « données ». La sélection fait partie du cœur : les deux formes en
          héritent. */}
      {isData &&
        (sel.selectedCount > 0 ? (
          <TableSelectionBar count={sel.selectedCount} onClear={sel.clear}>
            <Button appearance="subtle" iconBefore="Download">Exporter la sélection</Button>
          </TableSelectionBar>
        ) : (
          <Text size="small" as="span" color="subtlest">{totalCount} agents</Text>
        ))}

      {/* Repli responsive (§5) : Table du DS sur desktop, liste compacte sur
          téléphone (motif TableToListRecipe — réutilisé, pas réécrit). Même
          bascule à 599px, une seule source (pageAgents). */}
      <div className={css["tableDesktopOnly"]}>
        {/* Table du DS, dé-encartée (aucun Card autour). Ligne cliquable via
            `href` (D16) : la cellule « Agent » (isRowAnchor) devient un <a> ;
            le clic sur la case de sélection ne navigue pas. */}
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
            </TableRow>
          </TableHead>
          {/* Un seul TableBody porte les quatre états (priorité DS :
              error > loading > empty > noResults > enfants). « aucun
              résultat » (filtré à zéro) est distinct de « vide » (aucune
              donnée) et propose « Tout effacer ». */}
          <TableBody
            columnCount={columnCount}
            skeletonRows={ROWS_PER_PAGE}
            isLoading={state === "loading"}
            isEmpty={state === "empty"}
            emptyTitle="Aucun agent"
            emptyDescription="Ajoutez un premier agent pour le voir apparaître ici."
            isNoResults={state === "noResults"}
            noResultsTitle="Aucun résultat"
            noResultsDescription="Aucun agent ne correspond aux filtres actifs."
            noResultsAction={<Button appearance="subtle">Tout effacer</Button>}
            error={state === "error"}
            onRetry={() => undefined}
          >
            {isData
              ? pageAgents.map((a) => (
                  <TableRow key={a.mat} href={`#/agents/${a.mat}`} isSelected={sel.isSelected(a.mat)}>
                    <TableCell><Checkbox {...sel.getRowCheckboxProps(a.mat, a.name)} /></TableCell>
                    {cols.map((c) => (
                      <TableCell key={c.id} align={c.align} hideBelow={c.hideBelow} isRowAnchor={c.id === "agent"}>
                        {c.cell(a)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {/* Repli téléphone : liste compacte cliquable (List + ListItemButton +
          ListItemText + ListItemTrailing). PAS des cartes (§9). N'existe qu'à
          l'état « données » ; les autres états restent portés par la Table. */}
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

      {isData && <TablePagination count={totalCount} page={page} rowsPerPage={ROWS_PER_PAGE} onPageChange={onPageChange} />}
    </>
  );
}

/**
 * **Collection** — recette « Liste » standard (premier gabarit de page, D10).
 *
 * `Table` du DS **dé-encartée** (posée sur le fond, pas dans une carte), **une
 * seule** toolbar (recherche + **segment de vues** `ToggleButtonGroup`), filtres
 * via `_filterDemo` (chips + panneau), lignes cliquables (**D16 : `href`**), tri,
 * pagination. Colonnes et actions **déclaratives par rôle** (`roles`) — bascule
 * le contrôle **Rôle** pour voir deux jeux issus des **mêmes** définitions.
 */
export const Collection: Story = {
  name: "Collection (liste + filtres)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  argTypes: {
    role: { name: "Rôle", control: "inline-radio", options: ["manager", "partenaire", "client"] },
    state: { name: "État", control: "inline-radio", options: ["data", "loading", "empty", "noResults", "error"] },
  },
  args: { role: "manager", state: "data" },
  render: function CollectionStory(args) {
    const role = (args as { role?: Role }).role ?? "manager";
    const state = (args as { state?: string }).state ?? "data";
    const [view, setView] = useState("tous");
    const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: "agent", dir: "default" });
    const [page, setPage] = useState(0);

    const cols = AGENT_COLUMNS.filter((c) => c.roles.includes(role));
    const actions = AGENT_ACTIONS.filter((a) => a.roles.includes(role));
    // Filtres role-déclaratifs : la facette porte `roles` (§0bis.B). On ne
    // garde que celles visibles par le rôle courant — aucun `if (isPartner)`.
    const visibleFacets = FACETS.filter((f) => !f.roles || f.roles.includes(role));

    const sorted = [...AGENTS].sort((a, b) => {
      if (sort.dir === "default") return 0;
      const c = AGENT_COLUMNS.find((x) => x.id === sort.col);
      if (!c?.sortValue) return 0;
      const va = c.sortValue(a), vb = c.sortValue(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === "ascending" ? cmp : -cmp;
    });
    const pageAgents = sorted.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
    const sel = useTableSelection({ keys: pageAgents.map((a) => a.mat) });
    const columnCount = cols.length + 1; // +1 pour la colonne de sélection

    return (
      <Page globalActions={null}>
        <Page.Bar title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
        <Page.Toolbar
          start={
            <>
              <div className={css["searchWrapper"]}>
                <SearchField placeholder="Rechercher…" density="compact" aria-label="Rechercher un agent" />
              </div>
              <ToggleButtonGroup
                aria-label="Vues"
                size="small"
                selectionMode="single"
                selectedKeys={[view]}
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const k = [...keys][0];
                  if (typeof k === "string") { setView(k); setPage(0); }
                }}
              >
                {AGENT_VIEWS.map((v) => (
                  <ToggleButton key={v.id} id={v.id} badge={v.badge}>{v.label}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </>
          }
          end={
            <ButtonGroup>
              {actions.map((a) =>
                a.primary
                  ? <Button key={a.id} color="comete" iconBefore={a.icon}>{a.label}</Button>
                  : <Button key={a.id} appearance="subtle" iconBefore={a.icon}>{a.label}</Button>
              )}
              <Button appearance="subtle" iconBefore="MoreHoriz" aria-label="Plus d'actions" />
            </ButtonGroup>
          }
        />
        <Page.Body>
          <Stack gap="150">
            {/* Filtres : chips actives + panneau (incl. « Tous les filtres »),
                via _filterDemo. Facettes filtrées par rôle. Posés sur le fond
                (dé-encartage), pas dans une carte. */}
            <FilterBar facets={visibleFacets} />

            {/* Cœur partagé (§0bis.A) : sélection + Table (4 états) + repli
                téléphone + pagination. La page ne fournit QUE sa surface de
                contrôle (toolbar : recherche + vues ; filtres complets ci-dessus)
                ; le reste vient du cœur, réutilisé tel quel par la liste de
                section. */}
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
            />
          </Stack>
        </Page.Body>
      </Page>
    );
  },
};

// -----------------------------------------------------------------------
// 1bis. LISTE DE SECTION (§0bis.A, décision B)
// Le MÊME cœur (AgentTableCore) posé DANS une fiche, SANS chrome de page : ni
// Page.Bar ni Page.Toolbar. La surface de contrôle est réduite AU NIVEAU
// SECTION — en-tête (titre + recherche compacte) + tri via les en-têtes —,
// sans segment de vues ni panneau de filtres. Composé SUR LE FOND (décision
// B), pas dans un TableView (qui ajouterait une surface = double gris) ni un
// Card.

function SectionList({
  title,
  viewerRole,
  agents,
}: {
  title: string;
  viewerRole: Role;
  agents: Agent[];
}): React.ReactElement {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ col: string; dir: SortDir }>({ col: "agent", dir: "default" });
  const [page, setPage] = useState(0);

  const cols = AGENT_COLUMNS.filter((c) => c.roles.includes(viewerRole));
  const needle = q.trim().toLowerCase();
  const filtered = needle ? agents.filter((a) => a.name.toLowerCase().includes(needle)) : agents;
  const sorted = [...filtered].sort((a, b) => {
    if (sort.dir === "default") return 0;
    const c = AGENT_COLUMNS.find((x) => x.id === sort.col);
    if (!c?.sortValue) return 0;
    const va = c.sortValue(a), vb = c.sortValue(b);
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sort.dir === "ascending" ? cmp : -cmp;
  });
  const pageAgents = sorted.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const sel = useTableSelection({ keys: pageAgents.map((a) => a.mat) });
  const columnCount = cols.length + 1;
  // Recherche compacte à zéro résultat → « aucun résultat » compact (§4).
  const state = sorted.length === 0 ? "noResults" : "data";

  return (
    <Stack gap="200">
      {/* En-tête de section : titre un cran SOUS le titre de fiche
          (Heading size="small"), et la surface de contrôle réduite — recherche
          compacte SEULEMENT (ni vues, ni panneau de filtres). Ordre imposé :
          en-tête → tableau → pagination (§7). */}
      <Cluster justify="between" align="center" gap="200">
        <Heading size="small" as="h2">{title}</Heading>
        <div className={css["searchWrapper"]}>
          <SearchField
            density="compact"
            placeholder="Rechercher…"
            aria-label={`Rechercher dans « ${title} »`}
            value={q}
            onChange={(v) => { setQ(v); setPage(0); }}
          />
        </div>
      </Cluster>
      <AgentTableCore
        ariaLabel={title}
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
        compactEmpty
      />
    </Stack>
  );
}

/**
 * **Liste de section** — la liste posée DANS une fiche, sans chrome de page
 * (§0bis.A, décision B).
 *
 * Aucune `Page.Bar`, aucune `Page.Toolbar` de niveau page : chaque section
 * porte son propre en-tête (`Heading size="small"` + recherche compacte) et
 * rien de plus — **ni segment de vues, ni panneau de filtres**. Le **cœur**
 * (Table, états, sélection, repli) est le **même** que la page
 * (`AgentTableCore`). Deux sections consécutives, **posées sur le fond** (pas
 * de `TableView`, pas de `Card`), séparées par le seul **rythme vertical**
 * (`--space500`) — une seule section ne prouverait pas qu'elles se distinguent
 * sans surface.
 */
export const ListeDeSection: Story = {
  name: "Liste de section (dans une fiche)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  render: () => (
    <Page globalActions={null}>
      {/* Pas de Page.Bar / Page.Toolbar : on isole la RÉGION de section d'une
          fiche. Le titre de fiche est un simple Heading (un cran AU-DESSUS des
          titres de section), pas une Page.Bar. */}
      <Page.Body>
        <Stack gap="500">
          <Heading size="large" as="h1">Site Montparnasse</Heading>
          <SectionList title="Agents rattachés" viewerRole="manager" agents={AGENTS.slice(0, 4)} />
          <SectionList title="Agents intérimaires" viewerRole="manager" agents={AGENTS.slice(4)} />
        </Stack>
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
