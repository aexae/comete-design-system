import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea, Card, Divider, Text } from "@aexae/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Zone défilante dont l'ascenseur est **rendu par le composant** plutôt que laissé au navigateur. Le défilement reste natif — molette, doigt, clavier — et le contenu n'est jamais déplacé par transformation. Trois choses que l'ascenseur natif ne sait pas faire : **flotter au-dessus du contenu** sans lui prendre de place (les navigateurs ont retiré `overflow: overlay`), **paraître pendant le défilement** puis s'estomper (CSS n'a pas de pseudo-classe « en train de défiler »), et **réagir au survol de façon fiable** (Chrome ne repeint pas `::-webkit-scrollbar-thumb` quand l'état change).",
      },
    },
    design: { type: "figma", url: figmaUrl("4559:6522") },
  },
  argTypes: {
    axis: {
      control: "inline-radio",
      options: ["vertical", "horizontal", "both"],
      description: "Axe sur lequel la zone défile.",
    },
    visibility: {
      control: "inline-radio",
      options: ["hover", "scroll", "auto", "always"],
      description: "Quand l'ascenseur est visible.",
    },
    hideDelay: { control: { type: "number", step: 100 } },
    maxHeight: { control: "text" },
    maxWidth: { control: "text" },
    hasOverflowShadows: { control: "boolean" },
    isFocusable: { control: "boolean" },
    role: { control: "select", options: [undefined, "region", "group", "log"] },
  },
  args: { axis: "vertical", visibility: "hover", maxHeight: 225 },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof ScrollArea>;

// -----------------------------------------------------------------------
// Contenus de démonstration

const VERSIONS = Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${50 - i}`);

function Etiquettes() {
  return (
    <div style={{ padding: "var(--space200) var(--space250)" }}>
      <Text size="small" weight="bold">
        Versions
      </Text>
      {VERSIONS.map((v) => (
        <div key={v} style={{ marginTop: "var(--space125)" }}>
          <Divider />
          <div style={{ paddingTop: "var(--space125)" }}>
            <Text size="small">{v}</Text>
          </div>
        </div>
      ))}
    </div>
  );
}

const LIGNES = Array.from({ length: 24 }, (_, i) => ({
  heure: `${String((i % 10) + 2).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  texte: [
    "Ronde secteur nord terminée",
    "Badge non reconnu, porte 4",
    "Levée de doute, aucune anomalie",
    "Relève de poste",
  ][i % 4],
}));

function Journal() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space100)",
        padding: "var(--space200)",
      }}
    >
      {LIGNES.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: "var(--space200)" }}>
          <Text size="small" color="subtlest">
            {l.heure}
          </Text>
          <Text size="small">{l.texte}</Text>
        </div>
      ))}
    </div>
  );
}

const MODES = [
  { mode: "hover" as const, titre: "hover", note: "au survol — défaut" },
  { mode: "scroll" as const, titre: "scroll", note: "pendant le défilement, puis s'estompe" },
  { mode: "auto" as const, titre: "auto", note: "survol ou défilement" },
  { mode: "always" as const, titre: "always", note: "en permanence" },
];

function Bande() {
  return (
    <div style={{ display: "flex", gap: "var(--space200)", padding: "var(--space200)" }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            flex: "none",
            width: 160,
            padding: "var(--space200)",
            borderRadius: "var(--radius050)",
            background: "var(--background-surface-elevation-sunken-default)",
          }}
        >
          <Text size="small">Secteur {i + 1}</Text>
        </div>
      ))}
    </div>
  );
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <Card appearance="outlined">
      <div style={{ width: 220 }}>{children}</div>
    </Card>
  );
}

// -----------------------------------------------------------------------
// Stories
//
// Une story par chose RÉELLEMENT différente à montrer. Les quatre modes de
// `visibility` ne diffèrent que par l'interaction : ils ont donc UNE story
// comparative, pas quatre identiques au repos.

/**
 * L'ascenseur **flotte au-dessus du contenu** et ne lui prend aucune place.
 * Par défaut il paraît au survol de la zone ; le pouce se fonce quand on le
 * vise, la piste se teinte quand on la survole. Le défilement est natif :
 * molette, doigt, clavier.
 *
 * Les autres modes se règlent par le contrôle `visibility` ci-dessous.
 */
export const Default: Story = {
  render: (args) => (
    <Cadre>
      <ScrollArea {...args}>
        <Etiquettes />
      </ScrollArea>
    </Cadre>
  ),
};

/**
 * **Les quatre modes, côte à côte** — c'est le seul endroit où la différence se
 * voit, puisqu'elle est tout entière dans l'interaction. Survolez chaque zone,
 * puis faites-les défiler sans survoler.
 *
 * `scroll` est le seul mode visible **au doigt**, où il n'y a pas de survol.
 * `always` se réserve aux surfaces denses où la position dans une longue liste
 * fait partie de l'information.
 */
export const Visibilite: Story = {
  name: "Visibilité",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "var(--space300)", flexWrap: "wrap" }}>
      {MODES.map(({ mode, titre, note }) => (
        <div key={mode} style={{ display: "flex", flexDirection: "column", gap: "var(--space100)" }}>
          <Text size="small" weight="bold">
            {titre}
          </Text>
          <Text size="xsmall" color="subtlest">
            {note}
          </Text>
          <Cadre>
            <ScrollArea visibility={mode} maxHeight={180}>
              <Etiquettes />
            </ScrollArea>
          </Cadre>
        </div>
      ))}
    </div>
  ),
};

/**
 * **Les autres axes** — à gauche l'horizontal seul, à droite les deux ensemble,
 * chaque pouce indépendant.
 *
 * Une contrainte de taille est indispensable sur l'axe concerné : sans
 * `maxWidth`, une zone horizontale s'étire et son contenu ne déborde jamais.
 */
export const Axes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "var(--space300)", flexWrap: "wrap", alignItems: "flex-start" }}>
      <Card appearance="outlined">
        <ScrollArea axis="horizontal" visibility="always" maxWidth={320}>
          <Bande />
        </ScrollArea>
      </Card>
      <Card appearance="outlined">
        <ScrollArea axis="both" visibility="always" maxHeight={200} maxWidth={320}>
          <div style={{ width: 700 }}>
            <Journal />
          </div>
        </ScrollArea>
      </Card>
    </div>
  ),
};

/**
 * **Ombres de débordement** — un fondu en haut et en bas tant qu'il reste du
 * contenu au-delà du bord.
 *
 * Complément utile en mode `hover`, où rien n'indique au doigt qu'on peut
 * défiler. Hors de la surface par défaut, redonner la bonne couleur au masque
 * via `--scroll-shadow-surface`.
 */
export const OmbresDeDebordement: Story = {
  name: "Ombres de débordement",
  args: { hasOverflowShadows: true },
  render: (args) => (
    <Cadre>
      <ScrollArea {...args}>
        <Journal />
      </ScrollArea>
    </Cadre>
  ),
};

/**
 * **Atteignable au clavier** — une zone défilante qui ne contient aucun
 * élément focalisable est autrement impossible à faire défiler sans souris.
 * `isFocusable` la rend focalisable, `role` et `aria-label` la font annoncer.
 *
 * Les ascenseurs eux-mêmes sont `aria-hidden` : ce sont des doublures
 * visuelles du défilement natif, déjà piloté par la zone.
 */
export const Focalisable: Story = {
  args: {
    isFocusable: true,
    visibility: "auto",
    role: "log",
    "aria-label": "Main courante",
  },
  render: (args) => (
    <Cadre>
      <ScrollArea {...args}>
        <Journal />
      </ScrollArea>
    </Cadre>
  ),
};
