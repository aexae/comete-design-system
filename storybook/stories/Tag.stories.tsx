// Tag — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag, Cluster, Stack } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Les tags sont de petites étiquettes qui catégorisent, filtrent ou identifient un élément par un mot-clé. Ils peuvent être interactifs pour permettre à l'utilisateur de les ajouter ou de les retirer." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tag label="En cours" color="information" />
                    <Tag label="Terminé" color="success" />
                  </div>
                ),
                caption:
                  "Un sens par couleur, sur l'axe de l'ADR 0002 : `information` = en cours, `success` = terminé conforme.",
              }}
              dontExample={{
                example: (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tag label="En cours" color="success" />
                    <Tag label="Terminé" color="neutral" />
                  </div>
                ),
                caption:
                  "Ne pas mettre « en cours » en vert : le vert récompense un aboutissement, pas une activité — et « terminé » ne se grise pas.",
              }}
              when={[
                "Étiqueter ou catégoriser un élément (statut, type, mot-clé) de façon compacte et non interactive.",
                "Afficher plusieurs attributs côte à côte (statuts, mots-clés, catégories).",
              ]}
              avoid={[
                "Un compteur ou une pastille de notification → Badge.",
                "Une action cliquable principale → Button.",
                "Un message d'état sur une section → SectionMessage.",
              ]}
              best={[
                "Libellé court (1-2 mots).",
                "Un statut se colore sur l'axe de l'ADR 0002 : `neutral` (pas commencé, archivé), `information` (étape en cours), `warning` (action ou décision attendue), `success` (l'état souhaité est atteint), `critical` (échec ou refus). Voir la page Foundation/Statut.",
                "Cet axe n'est pas propre au Tag : Badge, IconTile, SectionMessage, Banner, Snackbar et ProgressBar exposent les mêmes couleurs et leur doivent le même sens. Le Tag est seulement l'endroit où la frontière statut / catégorie est typée aujourd'hui.",
                "Qualifier le jeu de statuts avant de le mapper : sur une *progression* (Brouillon → En cours → Terminé) l'état courant est `information` ; sur un *cycle de vie* (Actif / Suspendu / Archivé) le régime nominal est `success`. D'où « En cours » en bleu mais « Actif » en vert.",
                "`critical` = ça a raté ou ça a été refusé. Une interruption réversible, qui attend une décision, est `warning` — sinon le rouge cesse de signaler.",
                "Les couleurs catégorielles (`comete`, `accent*`) classent — rôle, secteur, métier — et ne portent jamais un statut. Typer les mappings sur `TagStatusColor` pour que le compilateur le garantisse.",
                "Un tag = une dimension. Deux informations indépendantes → deux éléments (un tag + une icône), jamais une teinte composite.",
                "Ne pas coder une couleur en dur au point d'usage : elle vient d'un mapping statut → couleur centralisé dans la couche produit, pas de l'écran.",
                "`appearance=\"subtle\"` par défaut ; `bold` réservé à `critical` dans une liste longue ; `outlined` pour la catégorisation.",
              ]}
              accessibility={[
                "La couleur ne doit pas être le seul porteur de sens — `label` est requis, et jamais réduit à une pastille.",
                "Un Tag est informatif : ne pas y attacher d'interaction attendue au clavier.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2984:15878") },
  },
  argTypes: {
    color: {
      control: "select",
      options: ["neutral", "comete", "success", "warning", "critical", "information", "accentPurple", "accentTeal", "accentTurquoise", "accentMagenta", "accentBlueGrey"],
    },
    appearance: {
      control: "inline-radio",
      options: ["bold", "subtle", "outlined"],
    },
    shape: {
      control: "inline-radio",
      options: ["square", "rounded"],
    },
    isDisabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    label: "Tag",
    color: "neutral",
    appearance: "subtle",
    shape: "square",
    isDisabled: false,
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof Tag>;

// -----------------------------------------------------------------------
// Stories

/** Tag par défaut : neutral, subtle, square. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2991:38480") } },
};

/** Toutes les couleurs en style subtle + square. */
export const AllColors: Story = {
  name: "All colors",
  parameters: { design: { type: "figma", url: figmaUrl("466:3917") } },
  render: () => (
    <Cluster gap="100">
      <Tag label="Neutral" color="neutral" />
      <Tag label="Comete" color="comete" />
      <Tag label="Success" color="success" />
      <Tag label="Warning" color="warning" />
      <Tag label="Critical" color="critical" />
      <Tag label="Information" color="information" />
      <Tag label="Purple" color="accentPurple" />
      <Tag label="Teal" color="accentTeal" />
      <Tag label="Turquoise" color="accentTurquoise" />
      <Tag label="Magenta" color="accentMagenta" />
      <Tag label="Blue Grey" color="accentBlueGrey" />
    </Cluster>
  ),
};

/** Comparaison des 3 apparences : bold, subtle, outlined. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: () => (
    <Stack gap="200">
      <Cluster gap="100">
        <Tag label="Bold" appearance="bold" />
        <Tag label="Bold" appearance="bold" color="comete" />
        <Tag label="Bold" appearance="bold" color="success" />
        <Tag label="Bold" appearance="bold" color="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Subtle" appearance="subtle" />
        <Tag label="Subtle" appearance="subtle" color="comete" />
        <Tag label="Subtle" appearance="subtle" color="success" />
        <Tag label="Subtle" appearance="subtle" color="critical" />
      </Cluster>
      <Cluster gap="100">
        <Tag label="Outlined" appearance="outlined" />
        <Tag label="Outlined" appearance="outlined" color="comete" />
        <Tag label="Outlined" appearance="outlined" color="success" />
        <Tag label="Outlined" appearance="outlined" color="critical" />
      </Cluster>
    </Stack>
  ),
};

/** Comparaison des 2 formes : square vs rounded. */
export const Shapes: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Square" shape="square" />
      <Tag label="Rounded" shape="rounded" />
      <Tag label="Square" shape="square" color="comete" />
      <Tag label="Rounded" shape="rounded" color="comete" />
    </Cluster>
  ),
};

/** Tag avec bouton de suppression. */
export const Removable: Story = {
  args: {
    label: "Ile de France",
    color: "neutral",
    appearance: "subtle",
  },
  render: (args) => (
    <Tag {...args} onRemove={() => undefined} />
  ),
};

/** Tag avec pastille de couleur avant le label. */
export const WithElemBefore: Story = {
  name: "With elem before",
  render: () => (
    <Cluster gap="100">
      <Tag
        label="En ligne"
        color="success"
        appearance="subtle"
        elemBefore={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--background-success-bold-default)" }} />
        }
      />
      <Tag
        label="Hors ligne"
        color="critical"
        appearance="subtle"
        elemBefore={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--background-critical-bold-default)" }} />
        }
      />
    </Cluster>
  ),
};

/** Tags interactifs (avec onPress). */
export const Interactive: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Cliquez-moi" color="comete" onPress={() => undefined} />
      <Tag label="Filtrer" color="neutral" appearance="outlined" onPress={() => undefined} />
    </Cluster>
  ),
};

/** Tag removable avec focus ring sur le bouton. */
export const RemovableFocusRing: Story = {
  name: "Removable — focus ring",
  parameters: { design: { type: "figma", url: figmaUrl("2991:38494") } },
  render: () => (
    <Cluster gap="100">
      <Tag label="Neutral" onRemove={() => undefined} />
      <Tag label="Comete" color="comete" onRemove={() => undefined} />
      <Tag label="Success" color="success" appearance="subtle" onRemove={() => undefined} />
      <Tag label="Outlined" appearance="outlined" onRemove={() => undefined} />
    </Cluster>
  ),
};

/** Tags désactivés. */
export const Disabled: Story = {
  render: () => (
    <Cluster gap="100">
      <Tag label="Bold" appearance="bold" isDisabled />
      <Tag label="Subtle" appearance="subtle" isDisabled />
      <Tag label="Outlined" appearance="outlined" isDisabled />
      <Tag label="Comete" color="comete" isDisabled />
    </Cluster>
  ),
};

/** Matrice complète : 7 couleurs × 3 apparences × 2 shapes. */
export const FullMatrix: Story = {
  name: "Full matrix",
  parameters: { design: { type: "figma", url: figmaUrl("2984:15878") } },
  render: () => {
    const colors = ["neutral", "comete", "success", "warning", "critical", "information", "accentPurple", "accentTeal", "accentTurquoise", "accentMagenta", "accentBlueGrey"] as const;
    const appearances = ["bold", "subtle", "outlined"] as const;
    const shapes = ["square", "rounded"] as const;
    return (
      <Stack gap="400">
        {shapes.map((shape) => (
          <Stack key={shape} gap="200">
            <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", fontWeight: 600, color: "var(--text-default)" }}>
              {shape}
            </span>
            {appearances.map((a) => (
              <Stack key={a} gap="075">
                <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xxs)", color: "var(--text-subtlest)", textTransform: "uppercase" }}>
                  {a}
                </span>
                <Cluster gap="100">
                  {colors.map((c) => (
                    <Tag key={`${shape}-${a}-${c}`} label={c} color={c} appearance={a} shape={shape} />
                  ))}
                </Cluster>
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    );
  },
};
