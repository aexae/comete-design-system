// Foundation/Couleur — philosophie couleur du DS (comète / brand / École A)
// + démonstration du runtime multi-tenant (BrandProvider).
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Bleed,
  Button,
  Card,
  Heading,
  IconTile,
  Stack,
  Tag,
  Text,
} from "@aexae/comete-design-system/components";
import { BrandProvider } from "@aexae/comete-design-system/providers";

// -----------------------------------------------------------------------

const meta = {
  title: "Foundation/Couleur",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Philosophie couleur du design system : la couleur fixe de l'éditeur (comète) est séparée de la charte couleur du client (brand). Les éléments interactifs ne suivent jamais la charte client (École A). Le BrandProvider applique une charte client au runtime à partir d'une seule couleur HEX. Voir docs/adr/0001-theming-couleur-multi-tenant.md. Le sens des couleurs d'état (neutral, information, warning, success, critical) et la frontière entre statut et catégorisation sont traités à part : voir Foundation/Statut et docs/adr/0002-semantique-couleurs-statut.md.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// -----------------------------------------------------------------------
// Helpers de mise en page (docs)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="150">
      <Heading size="small" as="h2">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <Stack gap="050" align="center">
      <div
        style={{
          width: 72,
          height: 48,
          borderRadius: "var(--radius200)",
          background: `var(${token})`,
          border: "1px solid var(--border-subtle)",
        }}
      />
      <Text size="xsmall" as="span" color="subtlest">
        {label}
      </Text>
    </Stack>
  );
}

// -----------------------------------------------------------------------
// Page principale — philosophie

export const Philosophie: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860, padding: "var(--space300)" }}>
      <Stack gap="100">
        <Heading size="large" as="h1">
          Couleur
        </Heading>
        <Text color="subtle">
          Comète est l&apos;éditeur ; chaque client a sa propre couleur de marque. Le
          système de couleur sépare donc deux notions qu&apos;on ne doit jamais
          confondre : la couleur <strong>fixe</strong> de l&apos;éditeur et la{" "}
          <strong>charte</strong> du client.
        </Text>
      </Stack>

      <Section title="Deux familles, deux rôles">
        <Stack gap="100">
          <Card appearance="outlined" color="comete">
            <Stack padding="200" gap="050">
              <Text weight="bold" as="span" color="comete">
                comète
              </Text>
              <Text size="small" as="span" color="subtle">
                Couleur fixe de l&apos;éditeur (navy). Porte les éléments interactifs
                et l&apos;identité Comète. <strong>Jamais</strong> surchargée par le
                client.
              </Text>
            </Stack>
          </Card>
          <Card appearance="outlined" color="brand">
            <Stack padding="200" gap="050">
              <Text weight="bold" as="span" color="brand">
                brand
              </Text>
              <Text size="small" as="span" color="subtle">
                Charte couleur du <strong>client</strong>. Défaut = navy Comète,
                surchargeable au runtime via le BrandProvider.
              </Text>
            </Stack>
          </Card>
          <Text size="small" color="subtlest">
            (<code>accent-&lt;couleur&gt;</code> — teal, purple, magenta… — est un
            troisième système, purement catégoriel/décoratif, indépendant.)
          </Text>
          <Text size="small" color="subtlest">
            Les couleurs d&apos;<strong>état</strong> (<code>neutral</code>,{" "}
            <code>information</code>, <code>warning</code>, <code>success</code>,{" "}
            <code>critical</code>) forment un quatrième système, avec son propre
            axe de sens : voir <strong>Foundation/Statut</strong> et{" "}
            <code>docs/adr/0002-semantique-couleurs-statut.md</code>. C&apos;est
            là qu&apos;est actée l&apos;exclusion des accents du vocabulaire de
            statut.
          </Text>
        </Stack>
      </Section>

      <Section title="École A — où la marque a le droit d'apparaître">
        <Text color="subtle">
          Principe directeur : <em>les éléments interactifs ne suivent jamais la
          charte client.</em> Un bouton primaire qui prendrait la teinte du client
          pourrait se lire comme un statut (un primaire rouge = « danger »).
        </Text>
        <Text size="small" color="subtle">
          Litmus : plus un élément est petit et interactif, moins la marque y a sa
          place ; plus une surface est grande et ambiante, plus elle y est bienvenue.
        </Text>
        <Stack direction="row" gap="200" wrap>
          <Stack gap="050">
            <Text size="xsmall" as="span" color="subtlest">
              Interactif → comète (fixe)
            </Text>
            <Stack direction="row" gap="100">
              <Button color="comete">Action</Button>
              <Tag label="Statut" color="comete" appearance="bold" />
            </Stack>
          </Stack>
          <Stack gap="050">
            <Text size="xsmall" as="span" color="subtlest">
              Surface ambiante → comète ou brand
            </Text>
            <Stack direction="row" gap="100">
              <IconTile icon="Campaign" appearance="comete" />
              <IconTile icon="Campaign" appearance="brand" />
            </Stack>
          </Stack>
        </Stack>
      </Section>

      <Section title="Tokens brand générés">
        <Text size="small" color="subtle">
          Le BrandProvider génère toute la famille depuis une seule couleur HEX
          (rampe OKLCH à luminosité normalisée par rôle) :
        </Text>
        <Stack direction="row" gap="150" wrap>
          <Swatch token="--background-brand-subtlest-default" label="subtlest" />
          <Swatch token="--background-brand-subtler-default" label="subtler" />
          <Swatch token="--background-brand-bold-default" label="bold" />
          <Swatch token="--border-brand-bold" label="border" />
          <Swatch token="--text-brand" label="text" />
        </Stack>
      </Section>
    </Stack>
  ),
};

// -----------------------------------------------------------------------
// Démo runtime multi-tenant

/**
 * Applique une charte client au runtime avec le `BrandProvider`. Change la couleur
 * ci-dessous : seules les surfaces `brand` (Card, Bleed, IconTile) suivent ; le
 * bouton `comète` reste fixe (École A).
 */
export const MarqueClient: StoryObj<{ seed: string }> = {
  name: "Marque client (BrandProvider)",
  parameters: { layout: "padded" },
  argTypes: {
    seed: { control: "color", name: "Couleur client (HEX)" },
  },
  args: { seed: "#FF6A00" },
  render: (args: { seed: string }) => (
    <Stack gap="200" style={{ maxWidth: 720, padding: "var(--space300)" }}>
      <Text size="small" color="subtle">
        Charte appliquée : <code>{args.seed}</code>
      </Text>
      <BrandProvider seed={args.seed} name="demo">
        <Stack gap="150">
          <Bleed color="brand" isBordered>
            <Stack padding="200" gap="050">
              <Text weight="bold" as="span" color="brand">
                Surface d&apos;identité (brand)
              </Text>
              <Text size="small" as="span" color="subtle">
                Suit la charte client.
              </Text>
            </Stack>
          </Bleed>

          <Stack direction="row" gap="150" wrap>
            <Card appearance="bold" color="brand">
              <Stack padding="200">
                <Text as="span">Card bold · brand</Text>
              </Stack>
            </Card>
            <Card appearance="bold" color="comete">
              <Stack padding="200">
                <Text as="span">Card bold · comète (fixe)</Text>
              </Stack>
            </Card>
          </Stack>

          <Stack direction="row" gap="100" align="center">
            <IconTile icon="Campaign" appearance="brand" />
            <Button color="comete">Bouton comète (inchangé)</Button>
          </Stack>
        </Stack>
      </BrandProvider>
    </Stack>
  ),
};
