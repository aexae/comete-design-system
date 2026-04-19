// Page layout templates — modern composition examples for developers
//
// IMPORTANT — Banner vs SectionMessage:
//   • Banner       → global alert, ABOVE the page layout (outside Page.Body)
//   • SectionMessage → contextual message INSIDE the page content

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { IconName } from "@naxit/comete-design-system/components";
import {
  Page,
  Grid,
  Card,
  Stack,
  Cluster,
  Button,
  ButtonGroup,
  TextField,
  Field,
  Avatar,
  Badge,
  Tag,
  Text,
  Breadcrumbs,
  BreadcrumbItem,
  Divider,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  SectionMessage,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerProvider,
} from "@naxit/comete-design-system/components";
import css from "./PageTemplates.module.css";

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
        component: [
          "Gabarits de pages composés à partir des primitives du DS.",
          "Chaque template est **responsive** (mobile → tablet → desktop).",
          "",
          "Activez **Show grid** dans les contrôles pour afficher la grille 12 colonnes.",
          "",
          "| Template | Usage |",
          "|---|---|",
          "| **Collection** | Liste avec filtres et toolbar |",
          "| **Entity** | Fiche détail avec sidebar + contenu tabs |",
          "| **Dashboard** | KPIs, activité et résumés |",
          "| **Settings** | Paramètres avec navigation tabs |",
          "",
          "### Banner vs SectionMessage",
          "- `Banner` : alerte globale, **au-dessus** du layout",
          "- `SectionMessage` : message contextuel **dans** le contenu",
        ].join("\n"),
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

function FilterPanel({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <Stack gap="200">
      {showHeader && <><Text variant="heading-s" as="span">Filtres</Text><Divider /></>}
      {["Société / Agence", "Secteur", "Habilitations", "Formalités", "Équipements"].map((label) => (
        <Stack key={label} gap="075">
          <Text variant="label" as="span" color="subtlest">{label.toUpperCase()}</Text>
          <div className={css["placeholder"]} style={{ height: 36 }}>Tous</div>
        </Stack>
      ))}
    </Stack>
  );
}

function AgentCard({ initials, name, contrat, heures, delta, status }: {
  initials: string; name: string; contrat: string; heures: string; delta: string;
  status: "success" | "critical" | "warning" | "neutral";
}) {
  return (
    <Card appearance="outlined">
      <CC>
        <Stack gap="100">
          <Cluster gap="100" align="center">
            <Avatar size="small" initials={initials} />
            <Text variant="heading-xs" as="span">{name}</Text>
          </Cluster>
          {(contrat || heures || delta) && (
            <div className={css["siteStats"]}>
              {contrat && <Stack gap="0"><Text variant="body-s" as="span" color="subtlest">Contrat</Text><Text variant="heading-xs" as="span">{contrat}</Text></Stack>}
              {heures && <Stack gap="0"><Text variant="body-s" as="span" color="subtlest">Heures</Text><Text variant="heading-xs" as="span">{heures}</Text></Stack>}
              {delta && (
                <Stack gap="0">
                  <Text variant="body-s" as="span" color="subtlest">Delta</Text>
                  <Text variant="heading-xs" as="span" color={status === "success" ? "success" : "critical"}>{delta}</Text>
                </Stack>
              )}
            </div>
          )}
        </Stack>
      </CC>
    </Card>
  );
}

function PropRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <Stack direction="row" gap="100" align="start">
      <Icon icon={icon} />
      <Stack gap="0">
        <Text variant="body-s" as="span" color="subtlest">{label}</Text>
        <Text variant="body-m" as="span">{value}</Text>
      </Stack>
    </Stack>
  );
}

function MetricTile({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: "success" | "critical" | "warning" }) {
  return (
    <div className={css["metricTile"]}>
      <Stack gap="025">
        <Text variant="body-s" as="span" color="subtlest">{label}</Text>
        <Text variant="heading-l" as="span" color={highlight}>
          {value}
          {unit && <Text variant="body-s" as="span" color="subtlest"> {unit}</Text>}
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
              <Text variant="body-s-medium" as="span" color={trendUp === true ? "success" : trendUp === false ? "critical" : "subtlest"}>
                {trend}
              </Text>
            )}
          </Cluster>
          <Stack gap="0">
            <Text variant="heading-xl" as="span">{value}</Text>
            <Text variant="body-s" as="span" color="subtlest">{label}</Text>
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
          <Text variant="body-m" as="span">{label}</Text>
        </Stack>
        <Text variant="heading-xs" as="span">{current}/{total}</Text>
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

function TableRow({ cells, isHeader }: { cells: React.ReactNode[]; isHeader?: boolean }) {
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
 * **Collection** — Liste avec toolbar et filtres.
 *
 * - **Desktop** : tableau + sidebar filtres (Grid 9+3)
 * - **Mobile** : tableau bascule en **cards**, filtres dans un **Drawer**
 * - Infinite scroll
 */
export const Collection: Story = {
  name: "Collection (liste + filtres)",
  parameters: { design: { type: "figma", url: figmaUrl("4577:13694") } },
  render: function CollectionStory() {
    const [filtersOpen, setFiltersOpen] = useState(false);
    return (
      <div className={css["gutters"]}>
        <Page>
          <Page.Header title="Agents" trailing={<Avatar size="medium" initials="AC" />} />
          <Page.Toolbar
            start={
              <>
                <div style={{ maxWidth: 140 }}>
                  <TextField aria-label="Rechercher" placeholder="Rechercher…" isCompact elemBefore={<Icon icon="EditorSearch" />} />
                </div>
                <Button appearance="subtle" iconBefore="FilterList" onPress={() => setFiltersOpen(true)}>Filtres</Button>
              </>
            }
            end={
              <ButtonGroup>
                <Button color="brand" iconBefore="Add">Nouvel agent</Button>
                <Button appearance="subtle" iconBefore="Download">Exporter</Button>
                <Button appearance="subtle" iconBefore="MoreHoriz" aria-label="Plus" />
              </ButtonGroup>
            }
          />
          <Page.Body>
            <Grid gap="300">
              <Grid.Col span={{ mobile: 12, desktop: 9 }}>
                <Stack gap="150">
                  <Text variant="body-s" as="span" color="subtlest">140 agents</Text>

                  {/* Desktop: table */}
                  <div className={css["tableDesktopOnly"]}>
                    <Card appearance="outlined">
                      <div className={css["cardColumn"]}>
                        <TableRow isHeader cells={["Agent", "Matricule", "Contrat", "Heures", "Delta"]} />
                        {AGENTS.map((a) => (
                          <TableRow key={a.mat} cells={[
                            <><Avatar size="xsmall" initials={a.initials} /><span>{a.name}</span></>,
                            a.mat, a.contrat, a.heures,
                            a.delta ? <Text key="d" variant="heading-xs" as="span" color={a.status === "success" ? "success" : "critical"}>{a.delta}</Text> : null,
                          ]} />
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Mobile: cards */}
                  <div className={css["cardsMobileOnly"]}>
                    <Stack gap="100">
                      {AGENTS.map((a) => <AgentCard key={a.mat} {...a} />)}
                    </Stack>
                  </div>

                  <div style={{ textAlign: "center", padding: "var(--space200)" }}>
                    <Text variant="body-s" as="span" color="subtlest">Scroll pour charger plus</Text>
                  </div>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ mobile: 12, desktop: 3 }}>
                <div className={css["filterSidebar"]}>
                  <Card appearance="outlined"><CC><FilterPanel /></CC></Card>
                </div>
              </Grid.Col>
            </Grid>
          </Page.Body>

          <Drawer isOpen={filtersOpen} onOpenChange={setFiltersOpen} placement="right" size="narrow" aria-label="Filtres">
            <DrawerHeader onClose={() => setFiltersOpen(false)}>Filtres</DrawerHeader>
            <DrawerBody><FilterPanel showHeader={false} /></DrawerBody>
            <DrawerFooter>
              <Button appearance="subtle" onPress={() => setFiltersOpen(false)}>Réinitialiser</Button>
              <Button color="brand" onPress={() => setFiltersOpen(false)}>Appliquer</Button>
            </DrawerFooter>
          </Drawer>
        </Page>
      </div>
    );
  },
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
    <div className={css["gutters"]}>
      <Page>
        <Page.Header
          title="Fiche agent"
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbItem label="Espace manager" href="#" />
              <BreadcrumbItem label="Agents" href="#" />
              <BreadcrumbItem label="Fiche agent" isCurrent />
            </Breadcrumbs>
          }
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Page.Body>
          <Grid gap="300">
            <Grid.Col span={{ mobile: 12, tablet: 5, desktop: 4 }}>
              <Stack gap="200">
                <Card appearance="outlined">
                  <div className={css["cardColumn"]}>
                    <CC padding="var(--space300)">
                      <Stack gap="200" align="center">
                        <Avatar size="xlarge" initials="DM" />
                        <Stack gap="050" align="center">
                          <Text variant="heading-m" as="span">DUPONT Marie</Text>
                          <Cluster gap="075">
                            <Tag label="CDI" appearance="success" tagStyle="subtle" />
                            <Tag label="Agent" tagStyle="subtle" />
                          </Cluster>
                        </Stack>
                      </Stack>
                    </CC>
                    <Divider />
                    <CC>
                      <Stack gap="150">
                        <PropRow icon="Mail" label="E-mail" value="marie.dupont@mail.com" />
                        <PropRow icon="Badge" label="Matricule" value="150" />
                        <PropRow icon="BusinessCenter" label="Société" value="AEXAE" />
                        <PropRow icon="LocationOn" label="Secteur" value="Ile de France" />
                        <PropRow icon="School" label="Qualification" value="Agent N3E3" />
                      </Stack>
                    </CC>
                    <Divider />
                    <CC>
                      <Cluster gap="100">
                        <Button appearance="subtle" iconBefore="Edit">Modifier</Button>
                        <Button appearance="subtle" color="critical" iconBefore="Archive">Archiver</Button>
                      </Cluster>
                    </CC>
                  </div>
                </Card>

                <Card appearance="outlined">
                  <CC>
                    <Stack gap="200">
                      <Text variant="heading-s" as="span">Chiffres clés — Avril 2026</Text>
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

                <Card appearance="outlined">
                  <CC>
                    <Stack gap="100">
                      <Button appearance="subtle" iconBefore="Newspaper">Documents</Button>
                      <Button appearance="subtle" iconBefore="CalendarMonth">Planning site</Button>
                      <Button appearance="subtle" iconBefore="History">Main courante</Button>
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
                            <Stack direction="row" gap="100" align="center">
                              <Button appearance="subtle" size="small" iconBefore="ChevronLeft" aria-label="Précédent" />
                              <Text variant="heading-xs" as="span">Avril 2026</Text>
                              <Button appearance="subtle" size="small" iconBefore="ChevronRight" aria-label="Suivant" />
                            </Stack>
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
                              <TextField aria-label="Rechercher" placeholder="Rechercher…" />
                            </div>
                            <Button appearance="subtle" iconBefore="UploadFile">Importer</Button>
                          </Cluster>
                          <Card appearance="neutral">
                            <CC padding="var(--space300)">
                              <Stack gap="100" align="center">
                                <Icon icon="Newspaper" />
                                <Text variant="body-m" color="subtlest" align="center">Aucun document pour cet agent.</Text>
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
                              <Text variant="body-s" as="span" color="subtlest">{e.date}</Text>
                              <Stack gap="0">
                                <Text variant="body-m" as="span">{e.action}</Text>
                                <Text variant="body-s" as="span" color="subtlest">{e.user}</Text>
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
    </div>
  ),
};

// -----------------------------------------------------------------------
// 3. DASHBOARD

/**
 * **Dashboard** — Vue d'ensemble avec KPIs, activité et résumés.
 *
 * - Greeting card avec actions rapides
 * - KPI tiles avec trends
 * - Activité + Couverture — 2 colonnes dès tablet
 * - Sites en cards responsives
 */
export const Dashboard: Story = {
  name: "Dashboard (tableau de bord)",
  parameters: { design: { type: "figma", url: figmaUrl("4587:24160") } },
  render: () => (
    <div className={css["gutters"]}>
      <Page>
        <Page.Header
          title="Tableau de bord"
          trailing={
            <Stack direction="row" gap="150" align="center">
              <Button appearance="subtle" size="small" iconBefore="ChevronLeft" aria-label="Précédent" />
              <Text variant="body-m-medium" as="span">Avril 2026</Text>
              <Button appearance="subtle" size="small" iconBefore="ChevronRight" aria-label="Suivant" />
              <Avatar size="medium" initials="AC" />
            </Stack>
          }
        />
        <Page.Body>
          <Stack gap="400">
            {/* Greeting */}
            <Card appearance="neutral">
              <CC padding="var(--space300)">
                <Stack gap="200">
                  <Stack gap="050">
                    <Text variant="heading-xl" as="span">Bonjour Axel</Text>
                    <Text variant="body-m" as="span" color="subtle">{"Vous avez 3 alertes et 30 vacations non affectées ce mois-ci."}</Text>
                  </Stack>
                  <Cluster gap="100">
                    <Button color="brand" iconBefore="CalendarMonth">Planifier</Button>
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
                        <Text variant="heading-s" as="span">Activité récente</Text>
                        <Button appearance="link" size="small">Tout voir</Button>
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
                            <Text variant={item.bold ? "body-m-medium" : "body-m"} as="span">{item.title}</Text>
                            <Text variant="body-s" as="span" color="subtlest">{item.sub}</Text>
                          </Stack>
                          <span style={{ marginLeft: "auto", flexShrink: 0 }}>
                            <Text variant="body-s" as="span" color="subtlest">{item.date}</Text>
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
                        <Text variant="heading-s" as="span">Couverture</Text>
                        <Text variant="body-s" as="span" color="subtlest">Avril 2026</Text>
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
                <Text variant="heading-s" as="span">Sites actifs</Text>
                <Button appearance="link" size="small">Voir tous</Button>
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
                            <Text variant="heading-xs" as="span">{s.site}</Text>
                            <Text variant="body-s" as="span" color="subtlest">{s.client}</Text>
                          </Stack>
                          <Tag label={s.secteur} tagStyle="subtle" />
                          <Divider />
                          <div className={css["siteStats"]}>
                            <Stack gap="0"><Text variant="body-s" as="span" color="subtlest">Vacations</Text><Text variant="heading-s" as="span">{String(s.vac)}</Text></Stack>
                            <Stack gap="0"><Text variant="body-s" as="span" color="subtlest">Non affect.</Text><Text variant="heading-s" as="span" color={s.nonAff > 0 ? "warning" : undefined}>{String(s.nonAff)}</Text></Stack>
                            <Stack gap="0"><Text variant="body-s" as="span" color="subtlest">Couverture</Text><Text variant="heading-s" as="span">{s.couv}</Text></Stack>
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
    </div>
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
    <div className={css["gutters"]}>
      <Page>
        <Page.Header title="Permissions" trailing={<Avatar size="medium" initials="AC" />} />
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
                                <Text variant="heading-s" as="span">{r.role}</Text>
                                <Text variant="body-s" as="span" color="subtle">{r.desc}</Text>
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
                      <Text variant="heading-s" as="span">Fonctions</Text>
                      <Text variant="body-m" as="span" color="subtle">Affinez les permissions au-delà des rôles.</Text>
                    </Stack>
                    <Button color="brand" iconBefore="Add">Nouvelle fonction</Button>
                  </Cluster>

                  <div className={css["tableDesktopOnly"]}>
                    <Card appearance="outlined">
                      <div className={css["cardColumn"]}>
                        <TableRow isHeader cells={["Fonction", "Rôle", "Utilisateurs", "Modifié le"]} />
                        {[
                          { fn: "Responsable planning", role: "Manager", users: "8", date: "12/04/2026" },
                          { fn: "Superviseur terrain", role: "Manager", users: "5", date: "08/04/2026" },
                          { fn: "Gestionnaire RH", role: "Admin.", users: "3", date: "01/04/2026" },
                        ].map((fn, i) => (
                          <TableRow key={i} cells={[
                            <Text key="fn" variant="body-m-medium" as="span">{fn.fn}</Text>,
                            <Tag key="r" label={fn.role} tagStyle="subtle" />,
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
                                <Text variant="heading-xs" as="span">{fn.fn}</Text>
                                <Tag label={fn.role} tagStyle="subtle" />
                              </Cluster>
                              <Cluster gap="200">
                                <Text variant="body-s" as="span" color="subtlest">{fn.users} utilisateurs</Text>
                                <Text variant="body-s" as="span" color="subtlest">Modifié le {fn.date}</Text>
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
                  <Text variant="body-m" color="subtle">{"Vérifiez les permissions effectives d'un utilisateur."}</Text>
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
                              <Button color="brand" iconBefore="Search">Vérifier</Button>
                            </Field>
                          </Grid.Col>
                        </Grid>
                        <Divider />
                        <Stack gap="100" align="center">
                          <Icon icon="Search" />
                          <Text variant="body-m" color="subtlest" align="center">Sélectionnez un utilisateur et une ressource.</Text>
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
    </div>
  ),
};
