// Welcome — page d'accueil du Storybook : première chose que l'on voit en ouvrant le DS.
// Maquette : « Comete-Storybook v3 » (Claude Design), refaite avec les composants et les tokens du
// DS. Aucune donnée du dépôt n'est écrite en dur : version, compteurs, liens (index.json) et
// dernières versions (historique git, via `virtual:welcome-releases`).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { addons } from "storybook/preview-api";
import { SELECT_STORY } from "storybook/internal/core-events";
import {
  Avatar,
  Button,
  Card,
  Cluster,
  Divider,
  Grid,
  Heading,
  Icon,
  IconTile,
  Logo,
  SectionMessage,
  Stack,
  Tag,
  Text,
} from "@aexae/comete-design-system/components";
import type { IconName, IconTileAppearance } from "@aexae/comete-design-system/components";
import releases from "virtual:welcome-releases";
import pkg from "../../package.json";
import { FAMILY_ORDER } from "../.storybook/storyOrder";
import css from "./Welcome.stories.module.css";

// -----------------------------------------------------------------------
// Données lues dans le dépôt

const REPO = "https://github.com/aexae";
const DS_REPO = `${REPO}/comete-design-system`;
/** Canal Teams « Marque et Charte Comète » : le point d'entrée des non-développeurs. */
const TEAMS_CHANNEL =
  "https://teams.microsoft.com/l/channel/19%3AS9DdPfCbIb8GvLhXOv-v_4bvaY2kAFy2kaohPw6v8Ho1%40thread.tacv2/Marque%20et%20Charte%20Com%C3%A8te?groupId=48d91ecf-f8d1-4494-9932-74e7016f6dd3&tenantId=a557c269-4546-4d0d-8c71-c648b78e708b&ngc=true&allowXTenantAccess=true";
const FIGMA = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";

/** Date ISO → « 09/11/2026 ». */
const frDate = (iso: string): string => iso.split("-").reverse().join("/");

// -----------------------------------------------------------------------
// Index Storybook (lu au rendu) et navigation

interface IndexEntry {
  id: string;
  title: string;
  type: "story" | "docs";
}

interface Family {
  name: string;
  /** Nombre d'éléments de la famille. */
  count: number;
  /** Quelques noms d'éléments (ordre alphabétique), pour donner un aperçu du contenu. */
  sample: string[];
}

interface Index {
  /** Familles de premier niveau, dans l'ordre de la sidebar (hors Welcome). */
  families: Family[];
  /** Première page (alphabétique) d'une ou plusieurs familles, ex. Foundation → Couleur. */
  firstOf: (...families: string[]) => IndexEntry | undefined;
  /** Page d'un titre complet, ex. « Patterns/Filtres » (docs de préférence). */
  entryOf: (title: string) => IndexEntry | undefined;
}

function buildIndex(entries: IndexEntry[]): Index {
  const best = new Map<string, IndexEntry>();
  const members = new Map<string, Set<string>>();
  for (const entry of entries) {
    const known = best.get(entry.title);
    if (!known || (known.type === "story" && entry.type === "docs")) best.set(entry.title, entry);
    const [family, name] = entry.title.split("/");
    if (!family) continue;
    const set = members.get(family) ?? new Set<string>();
    set.add(name ?? family);
    members.set(family, set);
  }
  const rank = (name: string): number => {
    const i = (FAMILY_ORDER as readonly string[]).indexOf(name);
    return i === -1 ? FAMILY_ORDER.length : i;
  };
  const families = [...members]
    .filter(([name]) => name !== "Welcome")
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, "fr"))
    .map(([name, set]) => ({
      name,
      count: set.size,
      sample: [...set].sort((a, b) => a.localeCompare(b, "fr")).slice(0, 3),
    }));
  return {
    families,
    entryOf: (title) => best.get(title),
    firstOf: (...families) => {
      for (const family of families) {
        const titles = [...best.keys()]
          .filter((t) => t === family || t.startsWith(`${family}/`))
          .sort((a, b) => a.localeCompare(b, "fr"));
        const first = titles[0] ? best.get(titles[0]) : undefined;
        if (first) return first;
      }
      return undefined;
    },
  };
}

function useIndex(): Index | undefined {
  const [index, setIndex] = useState<Index>();
  useEffect(() => {
    let cancelled = false;
    fetch("./index.json")
      .then((r) => r.json() as Promise<{ entries: Record<string, IndexEntry> }>)
      .then(({ entries }) => {
        if (!cancelled) setIndex(buildIndex(Object.values(entries)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return index;
}

/**
 * Ouvre une page dans le manager Storybook SANS recharger l'iframe : on demande la sélection par
 * le canal, comme le fait la sidebar. Un lien `?path=` rechargerait tout Storybook.
 */
function open(entry: IndexEntry | undefined): void {
  if (!entry) return;
  addons
    .getChannel()
    .emit(SELECT_STORY, { storyId: entry.id, viewMode: entry.type === "docs" ? "docs" : "story" });
}

const external = (url: string) => (): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

// -----------------------------------------------------------------------
// Blocs

function SectionHead({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
}): ReactElement {
  return (
    <Stack direction="row" justify="between" align="baseline" gap="200">
      <Stack gap="075">
        <Heading size="large">{title}</Heading>
        {lead ? (
          <Text size="medium" color="subtle">
            {lead}
          </Text>
        ) : null}
      </Stack>
      {action}
    </Stack>
  );
}

/**
 * Logo de l'intro, posé sur la surface navy fixe (identique dans les deux thèmes) : `inverted` est
 * clair en thème clair mais devient foncé en sombre, `brand` l'inverse. On affiche donc l'un ou
 * l'autre selon `data-theme`, en CSS, pour garder un logo clair sur le navy.
 */
function HeroLogo(props: Omit<ComponentProps<typeof Logo>, "appearance">): ReactElement {
  return (
    <>
      <span className={css["logoOnLight"]}>
        <Logo {...props} appearance="inverted" />
      </span>
      <span className={css["logoOnDark"]}>
        <Logo {...props} appearance="brand" />
      </span>
    </>
  );
}

function Hero(): ReactElement {
  return (
    <header className={css["hero"]}>
      <div className={css["heroText"]}>
        <HeroLogo size={44} aria-label="Comète" />
        <Heading size="xxlarge" as="h1" className={css["heroTitle"]}>
          Une seule identité pour{" "}
          <span className={css["heroAccent"]}>tous les logiciels Comète.</span>
        </Heading>
        <Text size="large" className={css["heroLead"]}>
          Logos, couleurs, typographie, icônes et composants : la source unique pour concevoir et
          développer chaque logiciel de la marque.
        </Text>
        <Text size="medium" italic className={css["heroQuote"]}>
          «&nbsp;Le logiciel Comète s&rsquo;adapte à votre fonctionnement, et non
          l&rsquo;inverse.&nbsp;»
        </Text>
      </div>
      <div className={css["heroArt"]} aria-hidden="true">
        <span className={css["orbit"]}>
          <span className={css["orbitDot"]} />
        </span>
        <span className={css["orbitInner"]} />
        <span className={css["glow"]} />
        <span className={css["heroIcon"]}>
          <HeroLogo format="icon" size={120} />
        </span>
      </div>
    </header>
  );
}

function Contents({ index }: { index: Index | undefined }): ReactElement {
  // Une carte par famille de la sidebar : nom, nombre et aperçu viennent de l'index Storybook.
  const families = index?.families ?? [];
  return (
    <Grid columns={{ mobile: 12, tablet: 12 }} gap="150">
      {families.map((f) => (
        <Grid.Col key={f.name} span={{ mobile: 12, tablet: 6, desktop: 4 }}>
          <Card
            appearance="outlined"
            className={css["fill"]}
            onPress={() => open(index?.firstOf(f.name))}
          >
            <Stack gap="025" padding="250">
              <Heading size="large" as="div" className={css["contentNum"]}>
                {f.count}
              </Heading>
              <Text weight="medium">{f.name} →</Text>
              <Text size="small" color="subtle">
                {f.sample.join(", ")}
                {f.count > f.sample.length ? "…" : ""}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}

const SWATCHES: { token: string; label: string; text: string; outlined?: boolean }[] = [
  {
    token: "--background-brand-subtlest-default",
    label: "subtlest",
    text: "--text-default-default",
  },
  { token: "--background-brand-subtler-default", label: "subtler", text: "--text-default-default" },
  { token: "--background-brand-bold-default", label: "bold", text: "--text-inverted" },
  // Surface d'identité navy (pas un contrôle) : texte prévu par le token, text.on-dark-surface.
  {
    token: "--background-brand-boldest-default",
    label: "boldest",
    text: "--text-on-dark-surface",
  },
  { token: "--border-brand-bold", label: "border", text: "--text-inverted" },
  {
    token: "--surface-default",
    label: "text",
    text: "--text-brand-default",
    outlined: true,
  },
];

const RESOURCE_ICONS: IconName[] = [
  "Home",
  "Group",
  "CalendarMonth",
  "Schedule",
  "LocationOn",
  "Description",
  "Search",
  "Settings",
  "Notifications",
  "Mail",
  "Person",
  "Star",
];

/** Valeur résolue d'un token CSS, relue quand le thème (`data-theme` sur <html>) change. */
function useTokenValue(token: string): string {
  const [value, setValue] = useState("");
  useEffect(() => {
    const read = (): void =>
      setValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [token]);
  return value;
}

/** La valeur « en dur » de l'exemple À éviter : celle du thème clair, figée. */
const HARDCODED = "#2467d1";

const DEMO_TOKEN = "--background-comete-bold-default";

function DoDontCard({ good }: { good: boolean }): ReactElement {
  const value = useTokenValue(DEMO_TOKEN);
  return (
    <Card appearance="outlined" color={good ? "success" : "critical"} className={css["fillStatus"]}>
      <Stack gap="150" padding="200">
        <Stack direction="row" gap="075" align="center">
          <Icon icon={good ? "Check" : "Close"} size={16} color={good ? "success" : "critical"} />
          <Text weight="bold" color={good ? "success" : "critical"}>
            {good ? "À faire" : "À éviter"}
          </Text>
        </Stack>
        <Cluster>
          <Button appearance="contained" color="comete" density="compact">
            Valider
          </Button>
        </Cluster>
        <Divider />
        <Stack direction="row" gap="150" align="center">
          <span
            className={css["tokenSwatch"]}
            // « À faire » suit le token ; « À éviter » fige la valeur résolue (valeur en dur).
            style={{ background: good ? `var(${DEMO_TOKEN})` : HARDCODED }}
          />
          <Stack gap="0" grow>
            <Text size="small" className={css["mono"]}>
              {good ? DEMO_TOKEN : HARDCODED}
            </Text>
            <Text size="small" color="subtlest" className={css["mono"]}>
              {good ? value : "valeur en dur"}
            </Text>
          </Stack>
          <Tag
            label={good ? "light/dark" : "light seul"}
            color={good ? "information" : "critical"}
            appearance="subtle"
          />
        </Stack>
      </Stack>
    </Card>
  );
}

function TokenDoDont(): ReactElement {
  return (
    <Stack gap="150">
      <Grid columns={{ mobile: 12, tablet: 12 }} gap="150">
        <Grid.Col span={{ mobile: 12, tablet: 6 }}>
          <DoDontCard good />
        </Grid.Col>
        <Grid.Col span={{ mobile: 12, tablet: 6 }}>
          <DoDontCard good={false} />
        </Grid.Col>
      </Grid>
      <SectionMessage appearance="information">
        Le même bleu, deux résultats : le token suit le thème sombre et les évolutions de la marque,
        la valeur en dur reste figée.
      </SectionMessage>
    </Stack>
  );
}

function ProfileRow({
  tag,
  tagColor,
  title,
  body,
  extra,
  actions,
  visual,
  bare,
}: {
  tag: string;
  tagColor: "accentPurple" | "comete" | "warning";
  title: string;
  body: string;
  /** Bloc facultatif entre le texte et les boutons (ex. une commande à copier). */
  extra?: ReactNode;
  actions: ReactNode;
  visual: ReactNode;
  /** Vrai : `visual` est du vrai contenu (cartes du DS), sans cadre décoratif. */
  bare?: boolean;
}): ReactElement {
  return (
    <Grid columns={{ mobile: 12, tablet: 12 }} gap="500" className={css["profile"]}>
      <Grid.Col span={{ mobile: 12, tablet: 5 }}>
        <Stack gap="150" align="start">
          <Tag label={tag} color={tagColor} appearance="subtle" />
          <Heading size="medium">{title}</Heading>
          <Text color="subtle">{body}</Text>
          {extra}
          <Cluster gap="100">{actions}</Cluster>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ mobile: 12, tablet: 7 }}>
        {bare ? (
          visual
        ) : (
          <div className={css["visual"]} aria-hidden="true">
            {visual}
          </div>
        )}
      </Grid.Col>
    </Grid>
  );
}

function Profiles({ index }: { index: Index | undefined }): ReactElement {
  const go = (title: string) => (): void => open(index?.entryOf(title));
  const chip = (label: string, title: string): ReactElement => (
    <Button key={label} appearance="outlined" onPress={go(title)}>
      {label}
    </Button>
  );
  return (
    <Stack gap="300">
      <SectionHead title="Par où commencer ?" lead="Choisissez votre profil." />
      <ProfileRow
        tag="Designers"
        tagColor="accentPurple"
        title="Concevoir avec Comète"
        body="Les foundations à respecter et la bibliothèque Figma. La plupart des composants renvoient vers leur nœud Figma."
        actions={
          <>
            {chip("Couleur", "Foundation/Couleur")}
            {chip("Statut", "Foundation/Statut")}
            {chip("Tokens", "Foundation/Tokens")}
            {chip("Typographie", "Foundation/Typography")}
            <Button
              appearance="contained"
              color="comete"
              iconAfter="OpenInNew"
              onPress={external(FIGMA)}
            >
              Ouvrir la bibliothèque Figma
            </Button>
          </>
        }
        visual={
          <div className={css["swatchBoard"]}>
            {SWATCHES.map((s) => (
              <span
                key={s.label}
                className={s.outlined ? `${css["swatch"]} ${css["swatchOutlined"]}` : css["swatch"]}
                style={{ background: `var(${s.token})`, color: `var(${s.text})` }}
              >
                {s.label}
              </span>
            ))}
            <span className={css["typeCell"]}>
              <span className={css["typeAa"]}>Aa</span>
            </span>
            <span className={css["sampleCell"]}>
              <Text weight="medium" size="small">
                Planning de la semaine
              </Text>
              <Text size="small" color="subtle" className={css["mono"]}>
                07:30 · 19:30 · 1 180,50 €
              </Text>
            </span>
          </div>
        }
      />
      <Divider />
      <ProfileRow
        tag="Développeurs"
        tagColor="comete"
        title="Intégrer les composants"
        body="Chaque page de composant contient ses guidelines d'usage et ses props, et, quand ils existent, ses exemples À faire / À éviter et ses tests d'interaction."
        extra={
          <Stack gap="075" className={css["installBlock"]}>
            <Text size="small" weight="bold" color="subtle" className={css["eyebrow"]}>
              Installer
            </Text>
            <Card appearance="subtle">
              <div className={css["install"]}>
                <Text size="small" className={css["mono"]}>
                  {`pnpm add ${pkg.name} @aexae/comete-design-tokens @aexae/comete-icons`}
                </Text>
              </div>
            </Card>
          </Stack>
        }
        actions={
          <Button
            appearance="contained"
            color="comete"
            iconAfter="OpenInNew"
            onPress={external(DS_REPO)}
          >
            Ouvrir le dépôt
          </Button>
        }
        bare
        visual={<TokenDoDont />}
      />
      <Divider />
      <ProfileRow
        tag="Produit, commerce, support"
        tagColor="warning"
        title="Récupérer une ressource"
        body="Logos, icônes, ou un aperçu des composants pour une présentation, un document ou une spécification."
        actions={
          <>
            {chip("Logos", "Components/Logo")}
            {chip("Icônes", "Components/Icon")}
            <Button appearance="outlined" onPress={() => open(index?.firstOf("Components"))}>
              Parcourir les composants
            </Button>
          </>
        }
        visual={
          <div className={css["resourceBoard"]}>
            <div className={css["resourceLogos"]}>
              <Logo size={40} aria-label="" />
              <Logo format="icon" size={48} />
            </div>
            <div className={css["resourceIcons"]}>
              {RESOURCE_ICONS.map((name) => (
                <Icon key={name} icon={name} size={32} />
              ))}
            </div>
          </div>
        }
      />
    </Stack>
  );
}

/** Logiciel d'une persona, affiché par son logo. */
interface AppLogo {
  entity: ComponentProps<typeof Logo>["entity"];
  label: string;
}

const PERSONAS = [
  {
    where: "Au bureau",
    title: "Ceux qui pilotent l'activité",
    icon: "Work" as IconName,
    tile: "comete" as IconTileAppearance,
    body: "Plannings, devis, facturation, paie, conformité : beaucoup de données, un fort besoin de paramétrage, des écrans utilisés toute la journée.",
    roles: [
      "Exploitation & planning",
      "RH & paie",
      "Facturation",
      "Contrôle de gestion",
      "Direction",
    ],
    apps: [
      { entity: "comete-software", label: "Comète" },
      { entity: "bi", label: "Comète BI" },
    ] as AppLogo[],
  },
  {
    where: "Sur le terrain",
    title: "Ceux qui exécutent et échangent",
    icon: "LocationOn" as IconName,
    tile: "warning" as IconTileAppearance,
    body: "Consulter un planning, pointer, signaler un événement, échanger avec la société de sécurité, souvent depuis un mobile.",
    roles: ["Agents", "Managers", "Clients des clients", "Sous-traitants", "Candidats"],
    apps: [
      { entity: "link", label: "Comète Link" },
      { entity: "ontime", label: "On Time" },
      { entity: "mce", label: "MCE" },
    ] as AppLogo[],
  },
];

function Personas(): ReactElement {
  return (
    <Stack gap="300">
      <SectionHead
        title="Pour qui on conçoit"
        lead="Les sociétés de sécurité privée, des TPE aux grands groupes, et tous ceux qui travaillent avec elles."
      />
      <Grid columns={{ mobile: 12, tablet: 12 }} gap="150">
        {PERSONAS.map((p) => (
          <Grid.Col key={p.where} span={{ mobile: 12, tablet: 6 }}>
            <Card appearance="outlined" className={css["fill"]}>
              <Stack gap="150" padding="300">
                <Stack direction="row" gap="150" align="center">
                  <IconTile icon={p.icon} appearance={p.tile} size="small" />
                  <Stack gap="0">
                    <Text size="small" weight="bold" color="subtle" className={css["eyebrow"]}>
                      {p.where}
                    </Text>
                    <Heading size="small" as="h3">
                      {p.title}
                    </Heading>
                  </Stack>
                </Stack>
                <Text size="small" color="subtle">
                  {p.body}
                </Text>
                <Cluster gap="075">
                  {p.roles.map((r) => (
                    <Tag key={r} label={r} color="neutral" appearance="subtle" />
                  ))}
                </Cluster>
                <Stack direction="row" gap="100" align="center">
                  <Text size="small" color="subtlest">
                    Logiciels
                  </Text>
                  {p.apps.map((a) => (
                    <Logo
                      key={a.label}
                      entity={a.entity}
                      format="icon"
                      size={16}
                      aria-label={a.label}
                    />
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}

const PRINCIPLES = [
  {
    title: "Votre fonctionnement, pas le nôtre",
    over: "Des composants paramétrables qui suivent les règles de chaque client",
    under: "un parcours unique imposé à tous.",
    proof: "Filtres",
    target: "Patterns/Filtres",
  },
  {
    title: "Une seule identité",
    over: "Le même bleu, la même police et les mêmes icônes dans les six logiciels",
    under: "une couleur par produit.",
    proof: "Couleur",
    target: "Foundation/Couleur",
  },
];

function Principles({ index }: { index: Index | undefined }): ReactElement {
  return (
    <Stack gap="300">
      <SectionHead title="Nos principes" lead="Ce qu'on choisit quand il faut trancher." />
      <Grid columns={{ mobile: 12, tablet: 12 }} gap="150">
        {PRINCIPLES.map((p, i) => (
          <Grid.Col key={p.title} span={{ mobile: 12, tablet: 6 }}>
            <Card appearance="outlined" className={css["fill"]}>
              <Stack gap="125" align="start" padding="300">
                <Text
                  size="small"
                  weight="bold"
                  color="accentPurple"
                  className={css["principleNum"]}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Heading size="small" as="h3">
                  {p.title}
                </Heading>
                <Text size="small">
                  {p.over}{" "}
                  <Text as="span" size="small" color="subtle">
                    plutôt que
                  </Text>{" "}
                  {p.under}
                </Text>
                <Button appearance="link" onPress={() => open(index?.entryOf(p.target))}>
                  {p.proof}
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}

function Releases(): ReactElement {
  return (
    <Stack gap="300">
      <SectionHead
        title="Dernières versions"
        lead="Ce qui a changé, et par qui."
        action={
          <Button
            appearance="contained"
            color="comete"
            iconAfter="OpenInNew"
            onPress={external(`${DS_REPO}/blob/main/CHANGELOG.md`)}
          >
            Tout le changelog
          </Button>
        }
      />
      <Card appearance="outlined" className={css["fill"]}>
        {releases.length === 0 ? (
          <Stack padding="300">
            <Text color="subtle">Historique indisponible : voir le changelog.</Text>
          </Stack>
        ) : (
          <Stack gap="200" padding="300">
            {releases.map((r, i) => (
              <Stack key={r.version} gap="200">
                {i > 0 ? <Divider /> : null}
                <Grid columns={{ mobile: 12, tablet: 12 }} gap="200">
                  <Grid.Col span={{ mobile: 12, tablet: 3 }}>
                    <Stack gap="050" align="start">
                      <Tag label={r.version} color="comete" appearance="subtle" />
                      <Text size="small" color="subtle">
                        {frDate(r.date)}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ mobile: 12, tablet: 9 }}>
                    <Stack gap="100">
                      {r.changes.map((c) => (
                        <Stack key={c.title} direction="row" gap="100" align="center">
                          <Avatar size="small" initials={c.author.slice(0, 1)} color="comete" />
                          <Text size="small" grow>
                            {c.title}
                          </Text>
                          <Text size="small" color="subtle">
                            {c.author}
                          </Text>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

function Help(): ReactElement {
  // Card bold comète : navy fixe, textes et icônes en text.on-dark-surface dans les deux thèmes.
  return (
    <Card appearance="bold" color="comete">
      <Cluster gap="300" align="center" padding="300">
        <Stack gap="050" grow>
          <Text weight="bold">Une question, un composant manquant, un logo introuvable ?</Text>
          <Text size="small" color="subtle">
            Écrivez-nous sur le canal Teams « Marque et Charte Comète », ou ouvrez une issue sur le
            dépôt si vous êtes développeur.
          </Text>
        </Stack>
        <Cluster gap="200" align="center">
          {["Axel", "Ruth"].map((name) => (
            <Stack key={name} direction="row" gap="100" align="center">
              <Avatar size="medium" initials={name.slice(0, 1)} color="neutral" />
              <Stack gap="0">
                <Text size="small" weight="medium">
                  {name}
                </Text>
                <Text size="small" color="subtle">
                  Référent design system
                </Text>
              </Stack>
            </Stack>
          ))}
        </Cluster>
        <Cluster gap="100">
          <Button
            appearance="contained"
            color="comete"
            iconAfter="OpenInNew"
            onPress={external(TEAMS_CHANNEL)}
          >
            Écrire sur Teams
          </Button>
          <Button appearance="contained" onPress={external(`${DS_REPO}/issues/new`)}>
            Ouvrir une issue
          </Button>
        </Cluster>
      </Cluster>
    </Card>
  );
}

function WelcomePage(): ReactElement {
  const index = useIndex();
  return (
    <div className={css["page"]}>
      <Stack gap="800">
        <Stack gap="150">
          <Hero />
          <Contents index={index} />
        </Stack>
        <Profiles index={index} />
        <Personas />
        <Principles index={index} />
        <Stack gap="300">
          <Releases />
          <Help />
        </Stack>
        <Text size="small" color="subtlest">
          <Text as="span" size="small" weight="bold">
            Comète
          </Text>{" "}
          · gestion pour la sécurité privée · Design System · v{pkg.version}
        </Text>
      </Stack>
    </div>
  );
}

// -----------------------------------------------------------------------

// Pas de `tags: ["autodocs"]` : l'accueil n'a pas d'onglet Docs, c'est une story seule.
const meta = {
  title: "Welcome",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  name: "Bienvenue",
  render: () => <WelcomePage />,
};
