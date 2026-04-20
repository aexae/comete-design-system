// Bleed — stories Storybook
// Démontre le composant Bleed dans des layouts mobile et desktop complets.

import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Bleed,
  Page,
  Stack,
  Card,
  Heading,
  Text,
  Divider,
  TopNav,
  SideNav,
  Logo,
  BottomNavigation,
  BottomNavigationItem,
  Avatar,
  Button,
  Icon,
  Tag,
} from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Layout/Bleed",
  component: Bleed,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Bleed>;

export default meta;
type Story = StoryObj<typeof Bleed>;

// -----------------------------------------------------------------------
// Shared helpers

function SampleCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card appearance="outlined">
      <Stack padding="200" gap="075">
        <Heading size="xsmall" as="span">{title}</Heading>
        <Text size="small" as="span" color="subtlest">{subtitle}</Text>
      </Stack>
    </Card>
  );
}

function BleedBanner() {
  return (
    <div style={{
      background: "var(--background-information-subtlest-default)",
      padding: "var(--space300)",
    }}>
      <Stack gap="100" align="center">
        <Icon icon="Campaign" size={32} color="information" />
        <Heading size="small" as="span">Bannière full-bleed</Heading>
        <Text size="small" as="span" color="subtlest" align="center">
          Ce contenu traverse les gouttières de Page et va bord-à-bord.
        </Text>
      </Stack>
    </div>
  );
}

// -----------------------------------------------------------------------
// 1. MOBILE — TopNav + Page + BottomNavigation

/**
 * **BleedMobile** — Layout mobile complet avec TopNav et BottomNavigation.
 *
 * Le `<Bleed isFull>` traverse les gouttières de `<Page>` pour aller
 * bord-à-bord dans la zone de contenu. En mobile, cela correspond
 * au viewport complet (pas de SideNav).
 *
 * - **`--page-gutter`** : `var(--space200)` (16px) sous 1200px
 * - Le contenu standard reste indenté par les gouttières
 * - `<Bleed isFull>` atteint les bords du viewport
 */
export const BleedMobile: Story = {
  name: "Mobile (TopNav + BottomNav)",
  parameters: {
    layout: "centered",
    chromatic: { viewports: [375] },
  },
  render: () => (
    <div style={{ width: 402, height: 874, border: "3px solid var(--border-default)", borderRadius: "58px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopNav title="Tableau de bord" onBack={() => undefined}>
        <Avatar size="small" initials="AC" />
      </TopNav>

      <Page style={{ flex: 1, minHeight: 0 }}>
        <Page.Body>
          <Stack gap="200">
            <Heading size="medium" as="span">Bonjour Axel</Heading>
            <Text as="span" color="subtle">
              Contenu standard — indenté par les gouttières (16px).
            </Text>

            <SampleCard title="Carte normale" subtitle="Respecte les gouttières de Page" />

            <Divider />

            {/* ---- Bleed isFull ---- */}
            <Bleed isFull>
              <BleedBanner />
            </Bleed>

            <Divider />

            <SampleCard title="Agent DUPONT" subtitle="151.67h — Conforme" />
            <SampleCard title="Agent MARTIN" subtitle="140.00h — Delta -11.67h" />

            <Divider />

            {/* ---- Second bleed ---- */}
            <Bleed isFull>
              <div style={{
                background: "var(--background-neutral-subtlest-default)",
                padding: "var(--space200)",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space100)" }}>
                  <Stack gap="0" align="center">
                    <Heading size="medium" as="span">42</Heading>
                    <Text size="xsmall" as="span" color="subtlest">Vacations</Text>
                  </Stack>
                  <Stack gap="0" align="center">
                    <Heading size="medium" as="span">3</Heading>
                    <Text size="xsmall" as="span" color="subtlest">Alertes</Text>
                  </Stack>
                  <Stack gap="0" align="center">
                    <Heading size="medium" as="span">0</Heading>
                    <Text size="xsmall" as="span" color="subtlest">Retards</Text>
                  </Stack>
                </div>
              </div>
            </Bleed>

            <SampleCard title="Site — Carrefour Market" subtitle="30 vacations, 0% couverture" />
          </Stack>
        </Page.Body>
      </Page>

      <BottomNavigation>
        <BottomNavigationItem label="Accueil" icon="Home" isSelected />
        <BottomNavigationItem label="Agents" icon="Agent" />
        <BottomNavigationItem label="Sites" icon="LocationOn" />
        <BottomNavigationItem label="Profil" icon="Person" />
      </BottomNavigation>
    </div>
  ),
};

// -----------------------------------------------------------------------
// 2. DESKTOP — SideNav + Page

/**
 * **BleedDesktop** — Layout desktop complet avec SideNav.
 *
 * Le `<Bleed isFull>` traverse les gouttières de `<Page>` pour aller
 * bord-à-bord dans la **zone de contenu** (viewport − SideNav).
 * Le bleed ne passe PAS sous la SideNav.
 *
 * - **`--page-gutter`** : `var(--space300)` (24px) à ≥1200px
 * - Page.Body utilise un content-grid : gouttières = colonnes CSS Grid
 * - `Bleed isFull` compense `--page-gutter` via margins négatives (CSS pur)
 */
export const BleedDesktop: Story = {
  name: "Desktop (SideNav + Page)",
  parameters: {
    viewport: { defaultViewport: "responsive" },
    chromatic: { viewports: [1440] },
  },
  render: () => (
    <div style={{ display: "flex", height: "100vh" }}>
      <SideNav>
        <SideNav.Header
          logo={<Logo format="icon" />}
          appName="Pro Sécurité"
          subtitle="Main Courante"
        />
        <SideNav.Section title="Manager">
          <SideNav.Item label="Tableau de bord" icon="Dashboard" isSelected href="/" />
          <SideNav.Item label="Agents" icon="Agent" href="/agents" />
          <SideNav.Item label="Sites" icon="LocationOn" href="/sites" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="Administration">
          <SideNav.Item label="Utilisateurs" icon="Group" href="/users" />
          <SideNav.Item label="Permissions" icon="ManageAccounts" href="/permissions" />
        </SideNav.Section>
        <SideNav.Footer>
          <Logo />
        </SideNav.Footer>
      </SideNav>

      <Page style={{ flex: 1, minHeight: 0 }}>
        <Page.Header
          title="Tableau de bord"
          trailing={
            <Stack direction="row" gap="100" align="center">
              <Button appearance="subtle" size="small" iconBefore="Notifications" aria-label="Notifications" />
              <Avatar size="medium" initials="AC" />
            </Stack>
          }
        />
        <Page.Body>
          <Stack gap="300">
            <Text as="span" color="subtle">
              Le contenu respecte les gouttières de Page (24px desktop).
              Les sections <code>&lt;Bleed isFull&gt;</code> les traversent pour aller bord-à-bord.
            </Text>

            <Stack gap="200">
              <Heading size="small" as="span">Chiffres clés</Heading>
              <Stack direction="row" gap="200">
                <SampleCard title="42" subtitle="Vacations affectées" />
                <SampleCard title="3" subtitle="Alertes" />
                <SampleCard title="1" subtitle="Retard" />
                <SampleCard title="0" subtitle="PDS manquées" />
              </Stack>
            </Stack>

            {/* ---- Bleed isFull ---- */}
            <Bleed isFull>
              <BleedBanner />
            </Bleed>

            <Stack gap="200">
              <Heading size="small" as="span">Agents récents</Heading>
              <Stack direction="row" gap="200">
                {[
                  { initials: "DM", name: "DUPONT Marie", tag: "Conforme" },
                  { initials: "MJ", name: "MARTIN Jean", tag: "En attente" },
                  { initials: "BS", name: "BERNARD Sophie", tag: "Alerte" },
                ].map((a) => (
                  <Card key={a.initials} appearance="outlined">
                    <Stack padding="200" gap="100">
                      <Stack direction="row" gap="100" align="center">
                        <Avatar size="small" initials={a.initials} />
                        <Heading size="xsmall" as="span">{a.name}</Heading>
                      </Stack>
                      <Tag label={a.tag} />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>

            <Divider />

            {/* ---- Second bleed ---- */}
            <Bleed isFull>
              <div style={{
                background: "var(--background-neutral-subtlest-default)",
                padding: "var(--space400) var(--space300)",
              }}>
                <Stack gap="100" align="center">
                  <Heading size="medium" as="span">Section pleine largeur</Heading>
                  <Text as="span" color="subtlest" align="center">
                    Cette section traverse les gouttières de Page.
                    Elle va du bord gauche (après la SideNav) au bord droit du viewport.
                  </Text>
                  <Button color="brand" iconBefore="Add">Action</Button>
                </Stack>
              </div>
            </Bleed>

            <SampleCard title="Contenu normal" subtitle="De retour dans les gouttières" />
          </Stack>
        </Page.Body>
      </Page>
    </div>
  ),
};

// -----------------------------------------------------------------------
// 3. RELATIVE — démonstration du mode inline/block

/**
 * **Relative** — Mode relatif (`inline` / `block`) pour compenser
 * le padding d'un parent direct.
 *
 * Contrairement à `isFull`, le bleed relatif ne traverse pas les
 * gouttières de Page — il compense uniquement le padding de son
 * parent immédiat.
 */
export const Relative: Story = {
  name: "Relative (inline/block)",
  parameters: {
    layout: "padded",
  },
  render: () => (
    <Stack gap="300">
      <Stack gap="050">
        <Heading size="small" as="span">Bleed inline</Heading>
        <Text size="small" as="span" color="subtlest">
          Compense le padding du parent. Ici le Stack a padding=&quot;300&quot;,
          et le Bleed a inline=&quot;300&quot;.
        </Text>
      </Stack>

      <Card appearance="outlined">
        <Stack padding="300" gap="200">
          <Text as="span">Contenu normal (dans le padding)</Text>

          <Bleed inline="300">
            <Card appearance="outlined" color="sunken">
              <Stack padding="200" align="center">
                <Text weight="medium" as="span">
                  Bleed inline=&quot;300&quot; — compense le padding parent
                </Text>
              </Stack>
            </Card>
          </Bleed>

          <Text as="span">Contenu normal (dans le padding)</Text>

          <Bleed inline="300" block="300">
            <Card appearance="default" color="sunken">
              <Stack padding="200" align="center">
                <Text weight="medium" as="span">
                  Bleed inline=&quot;300&quot; block=&quot;300&quot; — compense les deux axes
                </Text>
              </Stack>
            </Card>
          </Bleed>
        </Stack>
      </Card>
    </Stack>
  ),
};
