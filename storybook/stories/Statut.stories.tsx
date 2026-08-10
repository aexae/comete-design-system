// Foundation/Statut — sémantique des couleurs de statut (ADR 0002).
// Vocabulaire STRICTEMENT générique : cette page appartient au DS, qui ignore
// le domaine métier. Aucun statut Comète (« Soldée », « Manqué », « PDS »,
// « Publié »…) ne doit apparaître ici — la liste des statuts métier et leur
// mapping vivent dans la couche produit (ADR 0002, § Hors périmètre).
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, within } from "storybook/test";
import {
  Badge,
  Banner,
  Cluster,
  Heading,
  Icon,
  IconTile,
  SectionMessage,
  Stack,
  Tag,
  Text,
} from "@aexae/comete-design-system/components";
import type {
  TagCategoryColor,
  TagStatusColor,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// -----------------------------------------------------------------------

const meta = {
  title: "Foundation/Statut",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // La doctrine (l'axe, les 4 règles, le hors-périmètre) vit dans l'onglet
      // Guidelines ; les stories ne portent que la démonstration visuelle.
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
                  "`information` = une étape en cours, `success` = l'état souhaité est atteint.",
              }}
              dontExample={{
                example: (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tag label="En cours" color="success" />
                    <Tag label="Terminé" color="neutral" />
                  </div>
                ),
                caption:
                  "Le vert ne récompense pas une activité, et le gris est réservé à ce qui n'a pas commencé ou est archivé.",
              }}
              best={[
                "L'axe, dans l'ordre : `neutral` (pas commencé, brouillon, archivé, sans objet), `information` (en cours, déroulement normal), `warning` (action, décision ou échéance attendue), `success` (l'état souhaité est atteint), `critical` (échec, refus, annulation).",
                "Qualifier le jeu de statuts AVANT de le mapper. *Progression* (Brouillon → En cours → Terminé) : l'état souhaité est l'arrivée, l'étape courante est `information`. *Cycle de vie* (Actif / Suspendu / Archivé) : l'état souhaité est le régime nominal, donc `Actif` est `success`. Le critère — cet état se termine-t-il de lui-même quand le travail est fait ?",
                "`critical` = ça a raté ou ça a été refusé, le résultat est acquis. `warning` = l'issue est ouverte, quelqu'un doit décider — ce qui inclut les interruptions réversibles. Le rouge doit rester rare pour signaler.",
                "Règle 1 — une couleur = un sens, jamais un objet. Deux objets de nature différente dans le même état portent la même couleur. On ne réserve pas une couleur à un domaine.",
                "Règle 2 — un tag = une dimension. Deux dimensions indépendantes se lisent sur deux éléments (un tag + une icône), jamais dans une teinte composite.",
                "Règle 4 — discret par défaut, l'emphase réservée à `critical`, et rare. Chaque composant l'applique avec son levier : `appearance` pour Tag, `importance` pour Badge, aucun pour SectionMessage et Banner — dont l'intensité tient au rôle. Pour ceux-là, choisir le composant c'est choisir l'intensité : on ne promeut pas un statut en Banner pour le faire remarquer.",
                "Les couleurs catégorielles (`comete`, `accent*`) ne portent jamais un statut : une catégorie n'a pas d'axe bon/mauvais. Typer les mappings sur `TagStatusColor` pour que le compilateur le garantisse.",
                "Ne jamais coder une couleur en dur au point d'usage — elle vient d'un mapping centralisé dans la couche produit. La liste des statuts métier ne vit pas dans le design system.",
                "Portée : l'axe vaut pour Tag, Badge, IconTile, SectionMessage, Banner, Snackbar et ProgressBar. Trois écarts restent non tranchés (`announcement` sur Banner, `discovery` sur Snackbar, le mode `auto` de ProgressBar) — voir l'ADR 0002.",
              ]}
              accessibility={[
                "Règle 3 — le libellé porte le sens, la couleur le renforce. Jamais de tag sans texte, jamais de pastille seule : sinon l'information est inaccessible aux daltoniens, invisible en impression noir et blanc, et indéchiffrable pour qui découvre l'écran.",
                "Une seconde dimension se porte par un élément accessible (icône avec `aria-label`), pas par une nuance de la couleur du premier.",
              ]}
            />
          }
        />
      ),
      description: {
        component:
          "Ce que chaque couleur d'état veut dire, et ce qu'elle ne veut pas dire. Cinq sens sur un axe unique — neutral, information, warning, success, critical — valables pour TOUT le design system (Tag, Badge, IconTile, SectionMessage, Banner, Snackbar, ProgressBar), et non pour le seul Tag. Les stories ci-dessous démontrent ; la doctrine, les quatre règles et le hors-périmètre sont dans l'onglet Guidelines. Référence complète : docs/adr/0002-semantique-couleurs-statut.md.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// -----------------------------------------------------------------------
// Données de la doctrine — l'axe (ADR 0002)

interface Sens {
  color: TagStatusColor;
  /** Libellé de démonstration — générique, jamais un statut métier. */
  label: string;
  sens: string;
  formulation: string;
}

/** Les 5 sens, dans l'ordre de progression. */
const AXE: Sens[] = [
  {
    color: "neutral",
    label: "Brouillon",
    sens: "Pas commencé, brouillon, archivé, sans objet",
    formulation: "Rien à en attendre pour l'instant",
  },
  {
    color: "information",
    label: "En cours",
    sens: "En cours, déroulement normal",
    formulation: "Ça avance, rien à faire",
  },
  {
    color: "warning",
    label: "À valider",
    sens: "Action, décision ou échéance attendue",
    formulation: "Quelqu'un doit agir ou décider",
  },
  {
    color: "success",
    label: "Terminé",
    sens: "L'état souhaité est atteint",
    formulation: "On y est",
  },
  {
    color: "critical",
    label: "Échec",
    sens: "Échec, refus, annulation",
    formulation: "Ça a raté, ou ça a été refusé",
  },
];

/**
 * Deux lectures du même axe. `success` ne veut pas dire « terminé » mais
 * « l'état souhaité est atteint » — ce qui se lit différemment selon que le jeu
 * de statuts décrit une progression ou un cycle de vie.
 */
const PROGRESSION: { color: TagStatusColor; label: string }[] = [
  { color: "neutral", label: "Brouillon" },
  { color: "information", label: "En cours" },
  { color: "success", label: "Terminé" },
];

const CYCLE_DE_VIE: { color: TagStatusColor; label: string }[] = [
  { color: "success", label: "Actif" },
  { color: "warning", label: "Suspendu" },
  { color: "neutral", label: "Archivé" },
];

/**
 * Extrait de liste longue illustrant la règle 4 : `bold` est réservé à
 * `critical`, et reste rare — un `bold` par ligne annulerait l'effet.
 */
const LISTE_LONGUE: {
  label: string;
  color: TagStatusColor;
  appearance: "subtle" | "bold";
}[] = [
  { label: "Terminé", color: "success", appearance: "subtle" },
  { label: "En cours", color: "information", appearance: "subtle" },
  { label: "Échec de transmission", color: "critical", appearance: "bold" },
  { label: "À valider", color: "warning", appearance: "subtle" },
];

/**
 * Le levier d'emphase de chaque composant. La règle 4 est transverse
 * (« discret par défaut, l'emphase réservée à `critical` ») ; `subtle` / `bold`
 * ne sont que les noms que le `Tag` lui donne.
 */
const LEVIERS: { composant: string; levier: string; note: string }[] = [
  {
    composant: "Tag",
    levier: "appearance",
    note: "subtle (défaut) · bold · outlined",
  },
  {
    composant: "Badge",
    levier: "importance",
    note: "high · medium · low — contraste et forme",
  },
  {
    composant: "IconTile",
    levier: "— aucun",
    note: "l'intensité vient de la taille et de la forme",
  },
  {
    composant: "SectionMessage",
    levier: "— aucun",
    note: "calme par nature : un bloc dans le flux",
  },
  {
    composant: "Banner",
    levier: "— aucun",
    note: "fort par nature : un bandeau qui interrompt",
  },
];

/** Couleurs catégorielles — classent, ne jugent pas. Jamais un statut. */
const CATEGORIES: { color: TagCategoryColor; label: string }[] = [
  { color: "comete", label: "Comète" },
  { color: "accentPurple", label: "Catégorie A" },
  { color: "accentTeal", label: "Catégorie B" },
  { color: "accentTurquoise", label: "Catégorie C" },
  { color: "accentMagenta", label: "Catégorie D" },
  { color: "accentBlueGrey", label: "Catégorie E" },
];

// -----------------------------------------------------------------------
// Helpers de mise en page (docs) — alignés sur Foundation/Couleur

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

/** Encadré d'exemple : un titre court, un rendu, une légende. */
function Exemple({
  ton,
  titre,
  legende,
  children,
}: {
  ton: "ok" | "ko";
  titre: string;
  legende: string;
  children: ReactNode;
}) {
  const accent = ton === "ok" ? "var(--text-success)" : "var(--text-critical)";
  return (
    <Stack
      gap="150"
      style={{
        flex: "1 1 260px",
        minWidth: 0,
        padding: "var(--space200)",
        borderRadius: "var(--radius200)",
        border: "1px solid var(--border-subtle)",
        borderTop: `2px solid ${accent}`,
        background: "var(--background-neutral-subtlest-default)",
      }}
    >
      <Stack direction="row" gap="100" align="center">
        <Icon
          icon={ton === "ok" ? "CheckCircle" : "Close"}
          size={16}
          color={ton === "ok" ? "success" : "critical"}
          appearance="filled"
        />
        <Text size="small" weight="bold" as="span">
          {titre}
        </Text>
      </Stack>
      {children}
      <Text size="xsmall" as="span" color="subtle">
        {legende}
      </Text>
    </Stack>
  );
}

// -----------------------------------------------------------------------

/**
 * La référence : toute couleur de statut, dans n'importe quel écran, se ramène
 * à une de ces cinq cases. Le raisonnement et les règles sont dans l'onglet
 * **Guidelines**.
 */
export const Axe: Story = {
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Section title="Les cinq sens">
        <Stack gap="150">
          {AXE.map((s) => (
            <Stack
              key={s.color}
              direction="row"
              gap="200"
              align="center"
              wrap
              style={{
                padding: "var(--space150) var(--space200)",
                borderRadius: "var(--radius200)",
                border: "1px solid var(--border-subtle)",
                background: "var(--background-surface-default)",
              }}
            >
              <span style={{ flex: "none", minWidth: 120 }}>
                <Tag label={s.label} color={s.color} />
              </span>
              <Stack gap="025" style={{ flex: "1 1 240px", minWidth: 0 }}>
                <Text size="small" as="span">
                  {s.sens}
                </Text>
                <Text size="xsmall" as="span" color="subtlest">
                  « {s.formulation} » · <code>{s.color}</code>
                </Text>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Section>

      <Text size="xsmall" color="subtlest">
        Libellés génériques, non normatifs — le DS ignore le domaine.
      </Text>
    </Stack>
  ),
  // Règle 3 : le libellé porte le sens, la couleur le renforce. Chaque tag de
  // l'axe doit donc être trouvable par son TEXTE — jamais par sa couleur.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const s of AXE) {
      await expect(canvas.getByText(s.label)).toBeVisible();
    }
  },
};

/**
 * Le piège : « En cours » (progression) est `information`, « Actif » (cycle de
 * vie) est `success`. Les libellés se ressemblent, la couleur diffère — et
 * c&apos;est correct. Le critère de tri est dans l&apos;onglet **Guidelines**.
 */
export const ProgressionVsCycleDeVie: Story = {
  name: "Progression vs cycle de vie",
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Stack direction="row" gap="300" wrap align="start">
        <Stack gap="150" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Heading size="small" as="h2">
            Progression — des étapes vers une fin
          </Heading>
          <Cluster gap="100">
            {PROGRESSION.map((s) => (
              <Tag key={s.label} label={s.label} color={s.color} />
            ))}
          </Cluster>
          <Text size="xsmall" as="span" color="subtle">
            L&apos;état souhaité est <strong>l&apos;arrivée</strong>. L&apos;état
            courant est une étape : elle se termine d&apos;elle-même, donc{" "}
            <code>information</code>.
          </Text>
        </Stack>

        <Stack gap="150" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Heading size="small" as="h2">
            Cycle de vie — un régime nominal durable
          </Heading>
          <Cluster gap="100">
            {CYCLE_DE_VIE.map((s) => (
              <Tag key={s.label} label={s.label} color={s.color} />
            ))}
          </Cluster>
          <Text size="xsmall" as="span" color="subtle">
            L&apos;état souhaité est <strong>le régime normal</strong>, dans
            lequel on veut que l&apos;objet reste : c&apos;est lui qui porte le{" "}
            <code>success</code>.
          </Text>
        </Stack>
      </Stack>

      <Text size="xsmall" color="subtlest">
        Un cycle de vie n&apos;a pas d&apos;<code>information</code> — pas
        d&apos;étape transitoire à décrire.
      </Text>
    </Stack>
  ),
  // Le piège, verrouillé : « En cours » et « Actif » désignent tous deux l'état
  // courant, et n'ont PAS la même couleur. Une harmonisation « pour la
  // cohérence » casse ce test.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const enCours = PROGRESSION.find((s) => s.label === "En cours");
    const actif = CYCLE_DE_VIE.find((s) => s.label === "Actif");
    await expect(enCours?.color).toBe("information");
    await expect(actif?.color).toBe("success");

    // Un cycle de vie n'a pas d'étape transitoire.
    await expect(
      CYCLE_DE_VIE.filter((s) => s.color === "information"),
    ).toEqual([]);

    for (const s of [...PROGRESSION, ...CYCLE_DE_VIE]) {
      await expect(canvas.getByText(s.label)).toBeVisible();
    }
  },
};

/**
 * L&apos;axe n&apos;appartient pas au `Tag` : le même sens garde la même
 * couleur quel que soit le composant qui le rend. Portée exacte et écarts non
 * tranchés dans l&apos;onglet **Guidelines**.
 */
export const UnAxePlusieursComposants: Story = {
  name: "Un axe, plusieurs composants",
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Text color="subtle">
        Le même sens, rendu par des composants différents. La couleur ne change
        pas parce que le support change — sinon l&apos;utilisateur devrait
        apprendre un vocabulaire par composant.
      </Text>

      <Section title="warning — quelqu'un doit agir ou décider">
        <Cluster gap="150" align="center">
          <Tag label="À valider" color="warning" />
          <Badge appearance="warning" label="2" />
          <IconTile icon="Warning" appearance="warning" />
        </Cluster>
        <SectionMessage appearance="warning" title="Deux éléments à valider">
          L&apos;issue est encore ouverte : une décision est attendue.
        </SectionMessage>
      </Section>

      <Section title="critical — ça a raté, ou ça a été refusé">
        <Cluster gap="150" align="center">
          <Tag label="Échec" color="critical" />
          <Badge appearance="critical" label="1" />
          <IconTile icon="Report" appearance="critical" />
        </Cluster>
        <Banner appearance="critical">
          Le résultat est acquis et négatif — il n&apos;y a plus de décision à
          prendre sur cet objet.
        </Banner>
      </Section>

      <Text size="xsmall" color="subtlest">
        Seul le <code>Tag</code> type aujourd&apos;hui la frontière statut /
        catégorie.
      </Text>
    </Stack>
  ),
  // La portée, verrouillée : le même sens se rend avec la même couleur, quel
  // que soit le composant. Si quelqu'un décide qu'un Badge « warning » est en
  // fait `critical` parce que « ça se voit mieux », ce test doit tomber.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("À valider")).toBeVisible();
    await expect(canvas.getByText("Échec")).toBeVisible();
    await expect(canvas.getByText("Deux éléments à valider")).toBeVisible();
  },
};

/**
 * Un accent n&apos;est jamais un statut : un secteur n&apos;est ni réussi ni
 * raté. À gauche ce qui situe sur l&apos;axe, à droite ce qui classe sans
 * juger.
 */
export const CategorieVsStatut: Story = {
  name: "Catégorie vs statut",
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Stack direction="row" gap="300" wrap align="start">
        <Stack gap="150" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Heading size="small" as="h2">
            Statut — situe sur un axe
          </Heading>
          <Cluster gap="100">
            {AXE.map((s) => (
              <Tag key={s.color} label={s.label} color={s.color} />
            ))}
          </Cluster>
          <Text size="xsmall" as="span" color="subtle">
            Cinq sens, une progression. Réservé à l&apos;état d&apos;un objet.
          </Text>
        </Stack>

        <Stack gap="150" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Heading size="small" as="h2">
            Catégorisation — ne juge pas
          </Heading>
          <Cluster gap="100">
            {CATEGORIES.map((c) => (
              <Tag
                key={c.color}
                label={c.label}
                color={c.color}
                appearance="outlined"
              />
            ))}
          </Cluster>
          <Cluster gap="100" align="center">
            <IconTile icon="Work" appearance="accentPurple" />
            <IconTile icon="Site" appearance="accentTeal" />
            <Badge appearance="accentMagenta" label="A" />
            <Badge appearance="accentBlueGrey" label="B" />
          </Cluster>
          <Text size="xsmall" as="span" color="subtle">
            Rôle, secteur, code d&apos;activité, métier. Aucun axe bon/mauvais —
            et la même frontière sur <code>Badge</code> et <code>IconTile</code>.
          </Text>
        </Stack>
      </Stack>
    </Stack>
  ),
  // Garde-fou : la colonne « catégorisation » ne doit utiliser AUCUNE des cinq
  // couleurs sémantiques. Le typage l'interdit déjà à la compilation ; on le
  // vérifie ici à l'exécution pour que l'ajout d'un « juste un vert, ça rend
  // mieux » dans CATEGORIES casse un test plutôt qu'une doctrine.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const statutColors = new Set<string>(AXE.map((s) => s.color));
    const chevauchement = CATEGORIES.filter((c) =>
      statutColors.has(c.color),
    ).map((c) => c.color);
    await expect(chevauchement).toEqual([]);

    // Règle 3 : les deux colonnes restent lisibles par leur texte seul.
    for (const c of CATEGORIES) {
      await expect(canvas.getByText(c.label)).toBeVisible();
    }
  },
};

/**
 * Un même objet, deux informations indépendantes : où il en est (l&apos;axe) et
 * s&apos;il est signalé. Elles se lisent sur deux éléments, jamais dans une
 * teinte composite.
 */
export const DeuxDimensions: Story = {
  name: "Deux dimensions",
  render: () => (
    <Stack gap="200" style={{ maxWidth: 860 }}>
      <Stack direction="row" gap="200" wrap align="stretch">
        <Exemple
          ton="ok"
          titre="Deux éléments, deux sens"
          legende="Le tag porte l'axe, l'icône porte la seconde dimension. Chacune reste lisible seule, et une troisième dimension s'ajouterait sans rien casser."
        >
          <Cluster gap="100">
            <Tag label="En cours" color="information" />
            <Icon
              icon="Flag"
              size={18}
              color="warning"
              appearance="filled"
              aria-label="Signalé"
            />
          </Cluster>
        </Exemple>

        <Exemple
          ton="ko"
          titre="Une teinte pour deux sens"
          legende="La couleur ne dit plus laquelle des deux dimensions elle exprime. Un objet en cours et signalé devient indistinguable d'un objet qui attend une action."
        >
          <Cluster gap="100">
            <Tag label="En cours signalé" color="warning" />
          </Cluster>
        </Exemple>
      </Stack>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // La seconde dimension est portée par une icône ACCESSIBLE (aria-label),
    // pas par une nuance de la couleur du tag.
    await expect(canvas.getByText("En cours")).toBeVisible();
    await expect(canvas.getByLabelText("Signalé")).toBeInTheDocument();
  },
};

/**
 * L&apos;emphase est un budget, pas un style : discret par défaut, réservée à
 * `critical`, et rare. Chaque composant l&apos;applique avec le levier dont il
 * dispose — et plusieurs n&apos;en ont aucun.
 */
export const Emphase: Story = {
  name: "Emphase (par composant)",
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Section title="Le levier, composant par composant">
        <Stack gap="050">
          {LEVIERS.map((l) => (
            <Stack
              key={l.composant}
              direction="row"
              gap="150"
              align="baseline"
              wrap
              style={{
                padding: "var(--space100) var(--space200)",
                borderRadius: "var(--radius200)",
                border: "1px solid var(--border-subtle)",
                background: "var(--background-surface-default)",
              }}
            >
              <span style={{ flex: "none", minWidth: 130 }}>
                <Text size="small" weight="bold" as="span">
                  {l.composant}
                </Text>
              </span>
              <span style={{ flex: "none", minWidth: 190 }}>
                <Text size="xsmall" as="span" color="subtle">
                  <code>{l.levier}</code>
                </Text>
              </span>
              <Text size="xsmall" as="span" color="subtlest">
                {l.note}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Section>

      <Section title="Discret par défaut">
        <Cluster gap="150" align="center">
          {AXE.map((s) => (
            <Tag key={s.color} label={s.label} color={s.color} appearance="subtle" />
          ))}
          <Badge appearance="information" importance="medium" label="7" />
        </Cluster>
        <Text size="xsmall" as="span" color="subtle">
          Lisible sans dominer. C&apos;est le réglage de tous les statuts, y
          compris <code>critical</code>, sauf l&apos;exception ci-dessous.
        </Text>
      </Section>

      <Section title="L'emphase, réservée à critical — et rare">
        <Cluster gap="150" align="center">
          {LISTE_LONGUE.map((l) => (
            <Tag
              key={l.label}
              label={l.label}
              color={l.color}
              appearance={l.appearance}
            />
          ))}
          <Badge appearance="critical" importance="high" label="1" />
        </Cluster>
        <Text size="xsmall" as="span" color="subtle">
          Un seul élément monte le ton, et c&apos;est un échec. Si chaque ligne
          porte l&apos;emphase, plus aucune ne ressort — le budget est dépensé.
        </Text>
      </Section>

      <Section title="Sans levier — l'intensité vient du composant">
        <Stack gap="150">
          <SectionMessage appearance="warning" title="Calme par construction">
            Un bloc informatif dans le flux : il attend d&apos;être lu, il
            n&apos;interrompt pas.
          </SectionMessage>
          <Banner appearance="critical">
            Fort par construction — un bandeau pleine largeur interrompt. C&apos;est
            son rôle, pas un réglage.
          </Banner>
        </Stack>
        <Text size="xsmall" as="span" color="subtle">
          Ni l&apos;un ni l&apos;autre n&apos;expose de prop d&apos;intensité. Le
          choix du composant <em>est</em> le choix de l&apos;intensité — d&apos;où
          la tentation, à refuser, de promouvoir un statut en{" "}
          <code>Banner</code> pour le faire remarquer.
        </Text>
      </Section>

      <Section title="outlined — spécifique au Tag, pour la catégorisation">
        <Cluster gap="100">
          {CATEGORIES.map((c) => (
            <Tag
              key={c.color}
              label={c.label}
              color={c.color}
              appearance="outlined"
            />
          ))}
        </Cluster>
        <Text size="xsmall" as="span" color="subtle">
          Se distingue des surfaces colorées sans revendiquer d&apos;urgence.
          C&apos;est le seul des trois réglages du <code>Tag</code> qui
          n&apos;ait pas d&apos;équivalent ailleurs.
        </Text>
      </Section>
    </Stack>
  ),
  // Règle 4 : l'emphase est réservée à `critical` et reste l'exception. On le
  // vérifie sur les données de la démo — ajouter un `bold` sur un `success`
  // « parce que ça ressort mieux » casse ce test.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emphase = LISTE_LONGUE.filter((l) => l.appearance === "bold");
    await expect(emphase.map((l) => l.color)).toEqual(["critical"]);

    // Règle 3 : même sous emphase, c'est le libellé qui porte le sens.
    await expect(canvas.getByText("Échec de transmission")).toBeVisible();

    // La règle est bien présentée comme transverse, pas comme une prop du Tag.
    await expect(canvas.getByText("Calme par construction")).toBeVisible();
  },
};
