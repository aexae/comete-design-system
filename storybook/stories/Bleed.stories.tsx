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
  BottomNav,
  BottomNavItem,
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
  argTypes: {
    isFull: { control: "boolean" },
    isBordered: { control: "boolean" },
    color: {
      control: "select",
      options: [undefined, "neutral", "brand", "success", "warning", "critical", "information", "accent", "subtlest", "subtler", "bold"],
    },
    inline: {
      control: "select",
      options: [undefined, "0", "050", "100", "150", "200", "300"],
    },
    block: {
      control: "select",
      options: [undefined, "0", "050", "100", "150", "200", "300"],
    },
  },
  args: {
    isFull: true,
    isBordered: false,
    color: undefined,
    inline: undefined,
    block: undefined,
  },
} satisfies Meta<typeof Bleed>;

export default meta;
type Story = StoryObj<typeof meta>;

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
// Default — interactive controls

/** Story interactive : testez les props via le panneau Controls. */
export const Default: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div style={{ display: "flex", height: "100vh" }}>
      <Page style={{ flex: 1 }}>
        <Page.Header title="Bleed playground" />
        <Page.Body>
          <Stack gap="200">
            <Text as="span" color="subtle">
              Contenu standard — respecte les gouttières de Page.
            </Text>

            <SampleCard title="Carte normale" subtitle="Dans les gouttières" />

            <Bleed {...args}>
              <BleedBanner />
            </Bleed>

            <SampleCard title="Autre carte" subtitle="Toujours dans les gouttières" />
          </Stack>
        </Page.Body>
      </Page>
    </div>
  ),
};

// -----------------------------------------------------------------------
// 1. MOBILE — TopNav + Page + BottomNav

/**
 * **BleedMobile** — Layout mobile complet avec TopNav et BottomNav.
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
      <TopNav title="Accueil" onBack={() => undefined}>
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

      <BottomNav>
        <BottomNavItem label="Accueil" icon="Home" isSelected />
        <BottomNavItem label="Agents" icon="Agent" />
        <BottomNavItem label="Sites" icon="LocationOn" />
        <BottomNavItem label="Profil" icon="Person" />
      </BottomNav>
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
          companyName="Pro Sécurité"
          description="Main Courante"
        />
        <SideNav.Section title="Manager">
          <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
          <SideNav.Item label="Agents" iconBefore="Agent" href="/agents" />
          <SideNav.Item label="Sites" iconBefore="LocationOn" href="/sites" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="Administration">
          <SideNav.Item label="Utilisateurs" iconBefore="Group" href="/users" />
          <SideNav.Item label="Permissions" iconBefore="ManageAccounts" href="/permissions" />
        </SideNav.Section>
        <SideNav.Footer>
          <Logo />
        </SideNav.Footer>
      </SideNav>

      <Page style={{ flex: 1, minHeight: 0 }}>
        <Page.Header
          title="Accueil"
          trailing={
            <Stack direction="row" gap="100" align="center">
              <Button appearance="subtle" spacing="compact" iconBefore="Notifications" aria-label="Notifications" />
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
