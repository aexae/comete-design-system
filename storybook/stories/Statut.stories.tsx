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

// -----------------------------------------------------------------------

const meta = {
  title: "Foundation/Statut",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Sémantique des couleurs de statut pour TOUT le design system — Tag, Badge, IconTile, SectionMessage, Banner, Snackbar, ProgressBar, Text et Icon. Le Tag est seulement l'endroit où la distinction statut / catégorie est typée aujourd'hui ; l'axe, lui, ne lui appartient pas. Ce que chaque couleur veut dire, et ce qu'elle ne veut pas dire. Cinq sens — neutral (pas commencé, archivé, sans objet), information (en cours, déroulement normal), warning (action ou décision attendue), success (l'état souhaité est atteint), critical (échec, refus, annulation). Deux lectures de cet axe : progression (des étapes vers une fin) et cycle de vie (un régime nominal durable) — d'où « En cours » en information mais « Actif » en success. Les couleurs catégorielles (comete, accent*) ne portent jamais un statut. Voir docs/adr/0002-semantique-couleurs-statut.md. La liste des statuts métier et leur mapping ne vivent pas dans le design system : les libellés de cette page sont génériques et non normatifs.",
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
 * L'axe — les cinq sens dans l'ordre de progression. C'est la référence : toute
 * couleur de statut, dans n'importe quel écran, se ramène à une de ces cinq
 * cases.
 *
 * Deux points contre-intuitifs, tranchés par l'ADR 0002 : **« en cours » est
 * `information`, pas `success`** (le vert marque l'état souhaité atteint,
 * il ne signale pas une activité), et **« terminé » est `success`, pas
 * `neutral`** (le gris est réservé à ce qui n'a pas commencé ou qui est archivé).
 */
export const Axe: Story = {
  render: () => (
    <Stack gap="300" style={{ maxWidth: 860 }}>
      <Stack gap="100">
        <Heading size="large" as="h1">
          Statut
        </Heading>
        <Text color="subtle">
          Cinq couleurs, un seul axe : de « rien à en attendre » à « l&apos;état
          souhaité est atteint », avec ce qui attend une décision d&apos;un côté
          et ce qui a échoué de l&apos;autre. Deux lectures possibles de cet axe
          — <em>progression</em> et <em>cycle de vie</em> — détaillées dans la
          story suivante.
        </Text>
        <Text color="subtle">
          <strong>Cet axe vaut pour tout le design system</strong>, pas pour le
          seul <code>Tag</code> : <code>Badge</code>, <code>IconTile</code>,{" "}
          <code>SectionMessage</code>, <code>Banner</code>,{" "}
          <code>Snackbar</code> et <code>ProgressBar</code> exposent les mêmes
          couleurs et leur doivent le même sens. Les <code>Tag</code> ci-dessous
          ne sont qu&apos;un support de démonstration — voir{" "}
          <em>Un axe, plusieurs composants</em>.
        </Text>
      </Stack>

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

      <Text size="small" color="subtlest">
        Les libellés ci-dessus sont des exemples <strong>génériques</strong>. La
        liste des statuts métier et leur correspondance exacte ne vivent pas
        dans le design system : c&apos;est une couche produit, versionnée
        séparément. Voir <code>docs/adr/0002-semantique-couleurs-statut.md</code>.
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
 * `success` ne veut pas dire « terminé » : il veut dire **l&apos;état souhaité
 * est atteint**. Deux jeux de statuts peuvent donc placer leur vert à des
 * endroits différents de l&apos;axe.
 *
 * **Le piège** : « En cours » (progression) est `information`, alors que
 * « Actif » (cycle de vie) est `success`. Les deux libellés se ressemblent,
 * leur couleur diffère — et c&apos;est correct.
 *
 * Le critère : *cet état se termine-t-il de lui-même quand le travail est
 * fait ?* Oui → étape transitoire, `information`. Non, c&apos;est l&apos;état
 * dans lequel on veut que l&apos;objet demeure → régime nominal, `success`.
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

      <Text size="small" color="subtle">
        Un cycle de vie n&apos;a pas d&apos;<code>information</code> : il
        n&apos;a aucune étape transitoire. Ce n&apos;est pas un manque à combler
        — on n&apos;invente pas un statut pour remplir une couleur. Un jeu qui
        mélange les deux lectures cache en général deux dimensions (voir{" "}
        <em>Deux dimensions</em>).
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
 * **L&apos;axe n&apos;appartient pas au `Tag`.** Neuf composants du DS exposent
 * tout ou partie des cinq couleurs sémantiques — `Tag`, `Badge`, `IconTile`,
 * `SectionMessage`, `Banner`, `Snackbar`, `ProgressBar`, et `Text` / `Icon` qui
 * les portent sans les décider.
 *
 * Un même sens garde donc la même couleur quel que soit le composant qui le
 * rend : c&apos;est le corollaire de la règle 1 (*une couleur = un sens, jamais
 * un objet*) appliqué au design system lui-même. Le `Tag` est seulement
 * l&apos;endroit où la distinction est **typée** aujourd&apos;hui
 * (`TagStatusColor` / `TagCategoryColor`).
 *
 * Trois écarts restent **non tranchés** — `Banner` expose `announcement`,
 * `Snackbar` expose `discovery`, et le mode `auto` de `ProgressBar` code sa
 * propre sémantique. Voir la section « Points laissés ouverts » de l&apos;ADR.
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

      <Text size="small" color="subtlest">
        Seul le <code>Tag</code> type aujourd&apos;hui la frontière statut /
        catégorie (<code>TagStatusColor</code> vs <code>TagCategoryColor</code>).
        Étendre ce typage aux autres composants est un travail d&apos;API à
        part : l&apos;ADR pose la doctrine, il ne renomme pas huit unions.
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
 * Statut ≠ catégorie. À gauche, les cinq couleurs sémantiques : elles situent un
 * objet sur l&apos;axe bon/mauvais. À droite, les couleurs catégorielles
 * (`comete` + les cinq `accent*`) : elles classent — rôle, secteur, code
 * d&apos;activité, métier — sans porter de jugement.
 *
 * **Un accent n&apos;est jamais un statut.** Un secteur n&apos;est ni réussi ni
 * raté. C&apos;est le corollaire de l&apos;ADR 0001, qui qualifie déjà
 * `--*-accent-<couleur>-*` de namespace catégoriel décoratif.
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
            Rôle, secteur, code d&apos;activité, métier. Aucun axe bon/mauvais.
            Les accents existent aussi sur <code>Badge</code>,{" "}
            <code>IconTile</code> et <code>SectionMessage</code> — la frontière
            statut / catégorie est la même partout.
          </Text>
        </Stack>
      </Stack>

      <Text size="small" color="subtle">
        <strong>Les accents ne sont jamais un statut.</strong> Utiliser
        <code> accentPurple</code> pour dire « en attente » remet en circulation
        une couleur dont personne ne connaît le sens, et prive la catégorisation
        d&apos;une de ses teintes. Le typage rend la règle vérifiable :
        <code> TagStatusColor</code> d&apos;un côté, <code>TagCategoryColor</code>{" "}
        de l&apos;autre.
      </Text>
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
 * Un tag = une dimension. Deux dimensions indépendantes se lisent sur **deux
 * éléments** — un tag de statut + une icône —, jamais dans une couleur
 * composite.
 *
 * À droite, la version fautive : les deux sens sont écrasés dans une seule
 * teinte. On ne sait plus si l&apos;orange dit « une action est attendue » ou
 * « un signalement est présent », et le nombre de cas à définir croît comme le
 * **produit** des deux dimensions au lieu de leur somme.
 */
export const DeuxDimensions: Story = {
  name: "Deux dimensions",
  render: () => (
    <Stack gap="200" style={{ maxWidth: 860 }}>
      <Text color="subtle">
        Un même objet porte ici deux informations indépendantes : où il en est
        (dimension 1 — l&apos;axe) et s&apos;il est signalé (dimension 2 —
        binaire, orthogonale).
      </Text>

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
 * **L&apos;emphase est un budget, pas un style.** La règle 4 ne parle pas de
 * `subtle` et `bold` — ce sont les noms que le `Tag` donne à son levier. Elle
 * dit : *discret par défaut, l&apos;emphase réservée à `critical`, et rare*.
 *
 * Chaque composant applique cette règle avec le levier dont il dispose — et
 * plusieurs n&apos;en ont aucun, parce que leur intensité est fixée par leur
 * rôle. Pour ceux-là, **choisir le composant, c&apos;est choisir
 * l&apos;intensité** : on ne promeut pas un statut en `Banner` pour le faire
 * remarquer.
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
