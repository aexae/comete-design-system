// Guidelines — « Anatomie d'un écran de liste » (page complète).
//
// Reproduction du prototype « guidelines-anatomie » avec les composants du DS
// uniquement : le schéma est recomposé avec de vrais composants (Banner, Page-like
// bars, SearchField, ToggleButtonGroup, Tag, Table…), les règles avec
// SectionMessage, les légendes avec Badge / Tag / Code, la mise en page avec
// Grid / Stack / Cluster.
//
// Les notes techniques n'apparaissent que pour le public « Développeur ».

import { Fragment, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Page,
  Grid,
  Stack,
  Cluster,
  Banner,
  Badge,
  Button,
  Code,
  Divider,
  Heading,
  IconTile,
  Logo,
  SearchField,
  SectionMessage,
  SideNav,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TablePagination,
  TableRow,
  Tag,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@aexae/comete-design-system/components";

// -----------------------------------------------------------------------
// Types & données (prose gardée hors JSX : règle react/no-unescaped-entities)

type Audience = "tous" | "produit" | "dev";

/** Texte riche : une chaîne simple ou un segment en gras. */
type Rich = string | { b: string };

const RichText = ({ parts }: { parts: Rich[] }): ReactElement => (
  <>
    {parts.map((p, i) =>
      typeof p === "string" ? (
        <Fragment key={i}>{p}</Fragment>
      ) : (
        <Text size="medium" key={i} as="span" weight="bold">
          {p.b}
        </Text>
      ),
    )}
  </>
);

const TITLE = "Anatomie d'un écran de liste";
const LEAD: Rich[] = [
  "Comment un écran qui affiche une liste est construit chez Comète : où va chaque chose, et pourquoi. Ce gabarit fixe la ",
  { b: "structure" },
  " et le ",
  { b: "comportement" },
  ". Il ne dit pas quelles colonnes ni quels filtres afficher : ça se décide écran par écran, avec le produit.",
];

const ZONES_INTRO =
  "Un écran de liste se lit de haut en bas, et de gauche à droite. Les numéros du schéma renvoient à la légende dessous. Une zone est conditionnelle : elle n'existe que sur les écrans qui en ont besoin.";
const FIG_CAPTION =
  "La zone 5 est en pointillés : elle est conditionnelle. Les proportions sont indicatives.";

interface Zone {
  n: string;
  el: string;
  optional?: boolean;
  note: ReactNode;
  tech: ReactNode;
}

const ZONES: Zone[] = [
  {
    n: "1",
    el: "Alerte globale",
    note: "Un message qui concerne toute l'application : maintenance, incident. Elle se place au-dessus de la mise en page, jamais dans le contenu. Un message qui ne concerne qu'une section se met dans cette section.",
    tech: "Banner, hors de Page.Body. Dans le contenu : SectionMessage.",
  },
  {
    n: "2",
    el: "Navigation latérale",
    note: "Le menu de gauche, permanent sur desktop uniquement (≥ 1200 px) : déployé (240 px) ou réduit en rail (80 px), jamais masqué, jamais agrandi au survol. Le bouton de bascule est dans son en-tête. Sous 1200 px, tablette comprise, il disparaît de l'écran : on l'ouvre dans un tiroir depuis le hamburger de la barre de page. En app mobile, il n'y en a pas.",
    tech: "SideNav + SideNav.Provider (mode expanded / rail, desktop ≥ 1200 px) ; sous 1200 px (mobile web ET tablette) : Drawer placement=\"left\".",
  },
  {
    n: "3",
    el: "Barre de page",
    note: "Trois zones : à gauche une seule affordance de navigation (un retour, ou le hamburger du tiroir en mobile web), suivie du titre de l'écran, aligné à gauche ; à droite les « Actions app », celles qui valent pour toute l'application (recherche, notifications, réglages), les mêmes sur tous les écrans. Il n'y a pas de fil d'Ariane.",
    tech: "Page.Bar : leading, title (rendu en h1, aligné à gauche), trailing. Les Actions app viennent du layout (Page globalActions), pas de la page. Props : size large ou compact.",
  },
  {
    n: "4",
    el: "Barre d'outils",
    note: (
      <>
        {"La recherche, le bouton Filtres et les « Actions page » : celles qui agissent sur cette page, comme exporter ou créer. Elles changent d'un écran à l'autre, contrairement aux Actions app de la barre de page. "}
        <Text size="medium" as="span" weight="bold">
          Une seule par écran.
        </Text>
      </>
    ),
    tech: "Page.Toolbar : search, filters, end (les Actions page).",
  },
  {
    n: "5",
    el: "Filtres actifs",
    optional: true,
    note: "Les filtres posés, affichés sous la barre d'outils pour qu'on sache pourquoi la liste est réduite. Chaque filtre nomme sa facette, suivie de sa valeur (« Secteurs : Nord ») ou de leur nombre quand il y en a plusieurs (« Secteurs : 2 »). La croix retire toute la facette ; le corps du tag rouvre le panneau sur cette facette. Cette rangée disparaît quand aucun filtre n'est posé, et sur mobile où le compteur du bouton Filtres prend le relais.",
    tech: "Rangée de tags (ActiveFilterTags) : facette + valeur, croix = facette entière, corps = onOpenFacet ; + « Réinitialiser ».",
  },
  {
    n: "6",
    el: "Le contenu",
    note: "Ce que l'écran liste. Ici un tableau : trié, paginé, sélectionnable, avec des lignes cliquables. Les colonnes secondaires disparaissent quand l'écran rétrécit, et sur téléphone le tableau devient une liste compacte.",
    tech: "Table responsive, hideBelow sur les colonnes secondaires, useTableSelection, motif TableToList en mobile.",
  },
];

interface Rule {
  n: string;
  /** Règle destinée aux développeurs : n'apparaît que si le public « Développeur » est sélectionné. */
  devOnly?: boolean;
  title: string;
  why: Rich[];
  ok: string;
  ko: string;
  tech?: ReactNode;
}

const RULES: Rule[] = [
  {
    n: "01",
    title: "Tout critère passe par le bouton Filtres",
    why: [
      "La barre d'outils n'a pas de sélecteur d'état : un ",
      { b: "état de travail" },
      ", comme anomalies, en cours ou terminé, est un ",
      { b: "critère" },
      " comme un site, une prestation ou un profil. Tous se posent au même endroit, le bouton Filtres, et s'affichent ensuite sous la barre d'outils, dans les critères actifs.",
    ],
    ok: "« Anomalies » dans le panneau de filtres, avec les secteurs et les profils.",
    ko: "Un sélecteur « Toutes / Anomalies / Actives » ajouté dans la barre d'outils.",
  },
  {
    n: "02",
    title: "L'élévation est pour ce qui flotte, pas pour ce qui est posé",
    why: [
      "Une ombre et un cadre signalent qu'un élément est ",
      { b: "au-dessus" },
      " de la page : un panneau, une feuille, un menu. Une section, un tableau, une rangée de tags sont ",
      { b: "posés" },
      " sur la page : ils se distinguent par l'espace et un filet, pas par une boîte. La carte reste légitime quand elle délimite un objet, par exemple la fiche d'un site.",
    ],
    ok: "Le tableau directement sur le fond, séparé par un filet.",
    ko: "Le tableau dans une carte, les filtres dans une autre carte à côté.",
  },
  {
    n: "03",
    title: "Une liste vit à deux niveaux",
    why: [
      { b: "En page" },
      ", la liste est le sujet de l'écran : elle a droit à toute la barre d'outils. ",
      { b: "Dans une fiche" },
      ", la liste n'est qu'une section parmi d'autres : elle porte ses propres contrôles réduits, posés sur le fond, et jamais une seconde barre d'outils de niveau page.",
    ],
    ok: "Dans une fiche site : un titre de section, une recherche, un sélecteur de date.",
    ko: "Dans une fiche : une deuxième barre d'outils complète, avec son bouton Filtres.",
  },
  {
    n: "04",
    devOnly: true,
    title: "Ce que voit chaque rôle se déclare à la source",
    why: [
      "Un manager et un partenaire ne voient pas les mêmes colonnes ni les mêmes filtres. Cette différence se déclare ",
      { b: "une fois" },
      ", sur chaque colonne et sur chaque filtre. Elle ne se bricole pas dans l'affichage, écran par écran.",
    ],
    ok: "Chaque colonne porte la liste des rôles qui la voient.",
    ko: "Un test « si partenaire, masquer ce bloc » écrit dans l'affichage.",
    tech: (
      <>
        <Code>{'roles: ["manager","client"]'}</Code> sur chaque colonne, filtre et action. Aucun{" "}
        <Code>isPartner</Code> ni <Code>isManager</Code> dans un composant d’affichage.
      </>
    ),
  },
  {
    n: "05",
    title: "Entre deux sections, c'est l'espace qui sépare",
    why: [
      "Puisqu'on n'utilise ni carte ni fond coloré, ce sont le ",
      { b: "vide" },
      " et la ",
      { b: "taille du titre" },
      " qui disent où une section finit et où la suivante commence.",
    ],
    ok: "Un grand espace vertical, un titre de section plus petit que celui de la page, et toujours le même ordre : titre, puis tableau, puis pagination.",
    ko: "Un fond gris ou une carte pour marquer la limite.",
    tech: (
      <>
        Espacement vertical au moins égal à <Code>--space500</Code> entre deux sections. Titre de
        section en <Code>{'Heading size="small"'}</Code>.
      </>
    ),
  },
];

const CLIC_TITLE = "Le clic de ligne";
const CLIC_INTRO = "C'est le point le plus souvent raté, et celui qui coûte le plus cher à l'usage.";
const CLIC_CALLOUT_TITLE = "Si l'objet de la ligne a une page à lui, le clic doit être un vrai lien.";
const CLIC_CALLOUT = "Pas un comportement JavaScript qui imite un lien.";
const CLIC_BODY =
  "Avec un vrai lien, l'utilisateur peut ouvrir dans un nouvel onglet avec Ctrl ou ⌘, cliquer avec la molette, copier l'adresse, revenir en arrière. Le clavier y accède, et un lecteur d'écran annonce un lien. Un comportement JavaScript casse tout cela d'un coup, sans que personne ne s'en rende compte avant de s'en servir.";
const MODALE_TITLE = "Et la modale ?";
const MODALE_BODY: Rich[] = [
  "La modale sert à ",
  { b: "décider" },
  ", pas à ",
  { b: "consulter" },
  ". Confirmer une suppression, oui. Ouvrir la fiche d'un agent ou d'un site, non : la modale prive l'utilisateur d'une adresse à partager, de l'historique du navigateur et du nouvel onglet.",
];

const GLOSSAIRE: Array<{ term: string; def: string }> = [
  { term: "Filtre", def: "Un critère qu'on pose dans le panneau : un secteur, un profil, une période, un état de travail." },
  { term: "Barre de page", def: "La bande du haut : affordance de navigation, titre à gauche, Actions app." },
  { term: "Actions app", def: "Les actions générales à l'application (recherche, notifications, réglages), à droite de la barre de page. Les mêmes sur tous les écrans." },
  { term: "Barre d'outils", def: "La bande juste en dessous : recherche, filtres, Actions page. Une seule par écran." },
  { term: "Actions page", def: "Les actions contextuelles à la page (exporter, créer…), à droite de la barre d'outils. Elles changent d'un écran à l'autre." },
  { term: "Liste de section", def: "Une liste qui vit à l'intérieur d'une fiche, et non comme sujet de l'écran." },
  { term: "Dé-encarter", def: "Retirer les cartes qui servaient de conteneur, et poser les sections sur le fond." },
];

// -----------------------------------------------------------------------
// Briques

/**
 * Marqueur numéroté du schéma et de la légende. Le `Badge` s'ajuste à son texte (un « 1 » est plus
 * étroit qu'un « 4 ») et un parent flex le comprime : on le pose dans une cellule de largeur fixe,
 * qui ne rétrécit pas et le centre, pour que tous les marqueurs occupent la même place.
 */
const Num = ({ n }: { n: string }): ReactElement => (
  <span style={{ display: "inline-flex", flex: "none", justifyContent: "center", minWidth: "var(--size300)" }}>
    <Badge label={n} appearance="information" importance="high" />
  </span>
);

/** Zone du schéma : filet + padding, tokens du DS uniquement. */
const frame = (dashed = false): React.CSSProperties => ({
  border: `1px ${dashed ? "dashed" : "solid"} var(--border-default)`,
  borderRadius: "var(--radius-100)",
  padding: "var(--space150)",
  background: "var(--background-surface-default)",
});

/** « À faire » / « À éviter » à plat : pas de boîte, l'icône et la couleur du titre portent le verdict. */
const Verdict = ({ kind, text }: { kind: "ok" | "ko"; text: string }): ReactElement => (
  <Cluster gap="150" align="start" style={{ flexWrap: "nowrap" }}>
    <IconTile
      icon={kind === "ok" ? "Check" : "Close"}
      appearance={kind === "ok" ? "success" : "critical"}
      size="xsmall"
      shape="circle"
      aria-label={kind === "ok" ? "À faire" : "À éviter"}
    />
    <Stack gap="050">
      <Text size="medium" weight="bold" color={kind === "ok" ? "success" : "critical"} as="span">
        {kind === "ok" ? "À faire" : "À éviter"}
      </Text>
      <Text size="medium" color="subtle" as="p">{text}</Text>
    </Stack>
  </Cluster>
);

const TechNote = ({ audience, children }: { audience: Audience; children: ReactNode }): ReactElement | null =>
  audience === "dev" ? (
    <Text size="medium" as="p" color="subtlest">
      {children}
    </Text>
  ) : null;

// -----------------------------------------------------------------------
// Schéma — recomposé avec les composants du DS

function Schema(): ReactElement {
  return (
    <SideNav.Provider>
    <Stack gap="150">
      {/* 1 — Alerte globale */}
      <Cluster gap="150" align="center" style={{ flexWrap: "nowrap" }}>
        <Num n="1" />
        <div style={{ flex: 1 }}>
          <Banner appearance="warning">Alerte globale, au-dessus de toute la mise en page</Banner>
        </div>
      </Cluster>

      <Cluster gap="200" align="stretch" style={{ flexWrap: "nowrap" }}>
        {/* 2 — Navigation latérale : le vrai SideNav du DS */}
        <Stack gap="100" style={{ flex: "0 0 auto" }}>
          <div>
            <Num n="2" />
          </div>
          <div style={{ display: "flex", position: "relative", minHeight: 440 }}>
            <SideNav>
              <SideNav.Header
                logo={<Logo product="link" format="icon" />}
                companyName="Comète Link"
                description="Main Courante"
              />
              <SideNav.Section title="Manager">
                <SideNav.Item label="Accueil" iconBefore="Home" href="#" />
                <SideNav.Item label="Agents" iconBefore="Agent" isSelected href="#" />
                <SideNav.Item label="Sites" iconBefore="LocationOn" href="#" />
              </SideNav.Section>
              <SideNav.Divider />
              <SideNav.Section title="Administration" shortTitle="Admin">
                <SideNav.Item label="Utilisateurs" iconBefore="Group" href="#" />
                <SideNav.Item label="Droits" iconBefore="ManageAccounts" href="#" />
              </SideNav.Section>
            </SideNav>
          </div>
        </Stack>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Stack gap="150">
            {/* 3 — Barre de page */}
            <div style={frame()}>
              <Cluster gap="150" align="center" justify="between" style={{ flexWrap: "nowrap" }}>
                <Cluster gap="150" align="center" style={{ flexWrap: "nowrap" }}>
                  <Num n="3" />
                  <Button appearance="subtle" density="compact" iconBefore="ArrowBack" aria-label="Retour" />
                  <Heading size="small" as="div">Titre de l’écran</Heading>
                </Cluster>
                <Button color="comete" density="compact">Actions app</Button>
              </Cluster>
            </div>

            {/* 4 — Barre d'outils */}
            <div style={frame()}>
              <Cluster gap="150" align="center" justify="between" style={{ flexWrap: "nowrap" }}>
                <Cluster gap="150" align="center" style={{ flexWrap: "nowrap" }}>
                  <Num n="4" />
                  <div style={{ width: 200 }}>
                    <SearchField aria-label="Rechercher" placeholder="Rechercher" density="compact" />
                  </div>
                  <Button appearance="outlined" iconBefore="Tune" density="compact">Filtres</Button>
                </Cluster>
                <Button appearance="outlined" density="compact">Actions page</Button>
              </Cluster>
            </div>

            {/* 5 — Critères actifs (conditionnel) */}
            <div style={frame(true)}>
              <Cluster gap="100" align="center">
                <Num n="5" />
                <Tag label="Secteurs : Nord" color="information" appearance="subtle" onRemove={() => undefined} />
                <Tag label="Diplômes : SSIAP 2" color="information" appearance="subtle" onRemove={() => undefined} />
                <Tag label="Types de contrats : 2" color="information" appearance="subtle" onRemove={() => undefined} />
                <Button appearance="link">Réinitialiser</Button>
              </Cluster>
            </div>

            {/* 6 — Contenu (ici un tableau) */}
            <div style={frame()}>
              <Stack gap="100">
                <div>
                  <Num n="6" />
                </div>
                <Table aria-label="Schéma du tableau">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Colonne</TableHeaderCell>
                      <TableHeaderCell>Colonne</TableHeaderCell>
                      <TableHeaderCell>Colonne</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[0, 1, 2, 3].map((r) => (
                      <TableRow key={r}>
                        <TableCell>Valeur</TableCell>
                        <TableCell>Valeur</TableCell>
                        <TableCell>Valeur</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  count={4}
                  page={0}
                  rowsPerPage={25}
                  rowsPerPageOptions={[25, 50, 100]}
                  onPageChange={() => undefined}
                  onRowsPerPageChange={() => undefined}
                />
              </Stack>
            </div>
          </Stack>
        </div>
      </Cluster>
    </Stack>
    </SideNav.Provider>
  );
}

// -----------------------------------------------------------------------
// Page

const COUNT_WORDS = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six"];

function GuidelinesAnatomie(): ReactElement {
  const [audience, setAudience] = useState<Audience>("tous");
  // La règle réservée aux développeurs ne s'affiche que pour le public « Développeur » ; les
  // numéros se suivent sans trou quand elle est masquée.
  const rules = RULES.filter((r) => !r.devOnly || audience === "dev");

  const audienceGroup = (label: string, labels: Record<Audience, string>): ReactElement => (
    <ToggleButtonGroup
      aria-label={label}
      size="small"
      selectedKeys={[audience]}
      onSelectionChange={(keys) => {
        const k = [...keys][0];
        if (k === "tous" || k === "produit" || k === "dev") setAudience(k);
      }}
    >
      <ToggleButton id="tous">{labels.tous}</ToggleButton>
      <ToggleButton id="produit">{labels.produit}</ToggleButton>
      <ToggleButton id="dev">{labels.dev}</ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Page globalActions={null}>
      <Page.Bar
        size="compact"
        title={TITLE}
        trailing={
          <Cluster gap="100" align="center">
            <Text size="medium" color="subtlest" as="span">PUBLIC</Text>
            {audienceGroup("Public", { tous: "Tous", produit: "Produit", dev: "Dev" })}
          </Cluster>
        }
      />
      <Page.Body>
        <div style={{ maxWidth: 1180 }}>
          <Stack gap="400">
            <Text size="medium" color="subtle" as="p">
              <RichText parts={LEAD} />
            </Text>

            {/* Les six zones */}
            <Stack gap="200">
              <Heading size="medium" as="h2">Les six zones</Heading>
              <Text size="medium" as="p" color="subtle">{ZONES_INTRO}</Text>
              <Schema />
              <Text size="medium" as="p" color="subtlest">{FIG_CAPTION}</Text>

              <Grid gap="300">
                {ZONES.map((z) => (
                  <Grid.Col key={z.n} span={{ mobile: 12, desktop: 6 }}>
                    <Cluster gap="150" align="start" style={{ flexWrap: "nowrap" }}>
                      <Num n={z.n} />
                      <Stack gap="050">
                        <Cluster gap="075" align="center">
                          <Text size="medium" weight="bold" as="span">{z.el}</Text>
                          {z.optional && <Tag label="Conditionnel" color="neutral" appearance="subtle" />}
                        </Cluster>
                        <Text size="medium" color="subtle" as="p">{z.note}</Text>
                        <TechNote audience={audience}>{z.tech}</TechNote>
                      </Stack>
                    </Cluster>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>

            <Divider />

            {/* Les cinq règles */}
            <Stack gap="200">
              <Heading size="medium" as="h2">
                {rules.length === 1 ? "La règle" : `Les ${COUNT_WORDS[rules.length] ?? rules.length} règles`}
              </Heading>
              <Grid gap="300">
                {rules.map((r, i) => (
                  <Grid.Col key={r.n} span={{ mobile: 12, desktop: 6 }}>
                    <Stack gap="150">
                      {i >= 2 && <Divider />}
                      <Cluster gap="150" align="baseline" style={{ flexWrap: "nowrap" }}>
                        <Text size="medium" weight="bold" color="subtlest" as="span">{String(i + 1).padStart(2, "0")}</Text>
                        <Heading size="xsmall" as="h3">{r.title}</Heading>
                        {r.devOnly && <Tag label="Développeur" color="neutral" appearance="subtle" />}
                      </Cluster>
                      <Text size="medium" color="subtle" as="p">
                        <RichText parts={r.why} />
                      </Text>
                      <Grid gap="200">
                        <Grid.Col span={{ mobile: 12, tablet: 6 }}>
                          <Verdict kind="ok" text={r.ok} />
                        </Grid.Col>
                        <Grid.Col span={{ mobile: 12, tablet: 6 }}>
                          <Verdict kind="ko" text={r.ko} />
                        </Grid.Col>
                      </Grid>
                      {r.tech && <TechNote audience={audience}>{r.tech}</TechNote>}
                    </Stack>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>

            <Divider />

            {/* Le clic de ligne */}
            <Stack gap="200">
              <Heading size="medium" as="h2">{CLIC_TITLE}</Heading>
              <Text size="medium" as="p" color="subtle">{CLIC_INTRO}</Text>
              <Grid gap="300">
                <Grid.Col span={{ mobile: 12, desktop: 6 }}>
                  <Stack gap="150">
                    <SectionMessage appearance="information" title={CLIC_CALLOUT_TITLE}>
                      {CLIC_CALLOUT}
                    </SectionMessage>
                    <Text size="medium" as="p" color="subtle">{CLIC_BODY}</Text>
                    <TechNote audience={audience}>
                      <Code>href</Code> sur la cellule primaire, étendu à la ligne via{" "}
                      <Code>isRowAnchor</Code>. C’est le défaut relevé sur les listes actuelles de Link.
                    </TechNote>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ mobile: 12, desktop: 6 }}>
                  <Stack gap="100">
                    <Heading size="xsmall" as="h3">{MODALE_TITLE}</Heading>
                    <Text size="medium" as="p" color="subtle">
                      <RichText parts={MODALE_BODY} />
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>

            <Divider />

            {/* Vocabulaire */}
            <Stack gap="200">
              <Heading size="medium" as="h2">Le vocabulaire</Heading>
              <Grid gap="300">
                {GLOSSAIRE.map((g) => (
                  <Grid.Col key={g.term} span={{ mobile: 12, desktop: 6 }}>
                    <Cluster gap="200" align="baseline" style={{ flexWrap: "nowrap" }}>
                      <div style={{ flex: "0 0 150px" }}>
                        <Text size="medium" weight="bold" as="span">{g.term}</Text>
                      </div>
                      <Text size="medium" color="subtle" as="span">{g.def}</Text>
                    </Cluster>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </div>
      </Page.Body>
    </Page>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta: Meta = {
  title: "Templates/Anatomie d'un écran de liste",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

/**
 * **Anatomie d'un écran de liste** — page de guidelines (six zones, règles, clic de
 * ligne, vocabulaire), recomposée uniquement avec des composants du DS. Le sélecteur
 * de public révèle les notes techniques et la règle réservée aux développeurs
 * (« Développeur »).
 */
export const Anatomie: Story = {
  name: "Guidelines (page)",
  render: () => <GuidelinesAnatomie />,
};
