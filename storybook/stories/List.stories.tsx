// List — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { within, expect } from "storybook/test";
import {
  Avatar,
  Badge,
  Checkbox,
  Icon,
  List,
  ListHead,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemTrailing,
  SectionMessage,
  Stack,
  Tag,
  Text,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat, SectionHeading } from "./_guidelines";

// -----------------------------------------------------------------------
// Doc « Où va quoi » — règle leading (identité) / trailing (attribution + état).
// Injectée dans l'onglet Guidelines, à la suite de GuidelinesFlat.

function LeadingTrailingDoc() {
  return (
    <section
      style={{
        marginTop: "var(--space300)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space150)",
      }}
    >
      <SectionHeading dot="var(--text-information)">
        Placement du contenu
      </SectionHeading>
      <SectionMessage
        appearance="information"
        title="Le leading porte l'identité de la ligne. Le trailing porte l'attribution et l'état."
      >
        <Stack gap="100">
          <Text size="small" color="subtle" as="p">
            Un avatar <em>à gauche</em> répond à « qui est cette ligne ? » — la
            ligne <em>est</em> l&apos;agent. Un avatar <em>à droite</em> répond à
            « qui a fait ça ? » — la ligne est un évènement, l&apos;agent
            n&apos;en est qu&apos;un attribut.
          </Text>
          <Text size="small" color="subtle" as="p">
            <strong>Test</strong> : retire l&apos;avatar. Si tu ne sais plus de
            quel objet parle la ligne, il va à gauche.
          </Text>
        </Stack>
      </SectionMessage>
      <ul
        style={{
          margin: 0,
          paddingLeft: "var(--space300)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space075)",
        }}
      >
        <li>
          <Text size="small" color="subtle" as="span">
            Le trailing est <strong>facultatif</strong> — une liste Contacts
            n&apos;en a pas.
          </Text>
        </li>
        <li>
          <Text size="small" color="subtle" as="span">
            <strong>Une seule information à droite</strong> : une ligne compacte
            qui porte trois chiffres n&apos;est plus compacte.
          </Text>
        </li>
        <li>
          <Text size="small" color="subtle" as="span">
            L&apos;affectation « quelle donnée à quel emplacement » appartient au{" "}
            <strong>produit</strong>, pas au DS : le DS fournit les emplacements
            (leading / titre / sous-titre / trailing), une <em>fiche
            d&apos;anatomie</em> par liste décide du remplissage.
          </Text>
        </li>
      </ul>
    </section>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Les listes affichent un ensemble d'éléments verticaux liés, chacun pouvant contenir du texte, des icônes ou des avatars. Elles structurent le contenu en groupes ordonnés ou non ordonnés, avec la possibilité de rendre chaque élément interactif." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <>
            <GuidelinesFlat
              doExample={{
                example: (
                  <div style={{ maxWidth: 280 }}>
                    <List isBordered aria-label="Notifications">
                      <ListItem>
                        <ListItemIcon>
                          <Icon icon="Notifications" />
                        </ListItemIcon>
                        <ListItemText primary="Nouveau message" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Icon icon="CheckCircle" />
                        </ListItemIcon>
                        <ListItemText primary="Sauvegarde terminée" />
                      </ListItem>
                    </List>
                  </div>
                ),
                caption: "Éléments homogènes d'une seule dimension.",
              }}
              dontExample={{
                example: (
                  <div style={{ maxWidth: 280 }}>
                    <List isBordered aria-label="Agents">
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar size="medium" initials="DM" />
                        </ListItemAvatar>
                        <ListItemText primary="DUPONT Marie" secondary="MAT-0142" />
                        <ListItemTrailing>
                          <Text size="xsmall" color="subtle" as="span">
                            Payables 35h
                          </Text>
                          <Text size="xsmall" color="subtle" as="span">
                            Indispo ±2
                          </Text>
                          <Text size="small" weight="medium" as="span">
                            +2h30
                          </Text>
                        </ListItemTrailing>
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar size="medium" initials="MB" />
                        </ListItemAvatar>
                        <ListItemText primary="MARTIN Bob" secondary="MAT-0198" />
                        <ListItemTrailing>
                          <Text size="xsmall" color="subtle" as="span">
                            Payables 28h
                          </Text>
                          <Text size="xsmall" color="subtle" as="span">
                            Indispo ±1
                          </Text>
                          <Text size="small" weight="medium" as="span">
                            -1h00
                          </Text>
                        </ListItemTrailing>
                      </ListItem>
                    </List>
                  </div>
                ),
                caption:
                  "Une seule information dans le trailing ; les métriques secondaires vont au desktop ou à la fiche.",
              }}
              when={[
                "Empiler des éléments homogènes d'une seule dimension (navigation, menus, réglages, fichiers).",
                "Quand chaque ligne est une entité avec une action principale (ListItemButton).",
                "À insérer dans une Card, un Menu ou une SideNav.",
              ]}
              avoid={[
                "Comparer plusieurs colonnes de données → préférer Table.",
                "Un groupe d'options sélectionnables dans un formulaire → Checkbox/Radio groupés.",
              ]}
              best={[
                "`isBordered=false` par défaut (inséré dans un conteneur) ; l'activer pour un rendu autonome.",
                "ListItemIcon / ListItemAvatar à largeur fixe pour aligner le texte.",
                "ListItemSecondaryAction pour une action à droite (interactif : Switch, Checkbox) — extraite du bouton. ListItemTrailing pour de l'attribution/état non-interactif (heure, Tag) — dans le bouton, la ligne reste un seul arrêt de tabulation.",
                "Leading = identité de la ligne, trailing = attribution + état — voir « Placement du contenu » ci-dessous.",
                "`overline` (surtitre) : réservé à un type COURT et énumérable (« Ronde », « Contrôle d'accès ») ; jamais une phrase libre, qu'il tronquerait de façon illisible. Question ouverte côté donnée : si un champ mélange type court et intitulé libre, il manque un champ — arbitrage produit, pas DS.",
              ]}
              accessibility={[
                "`List` porte un `aria-label` ; chaque item est une entité cohérente.",
                "Action principale via ListItemButton ; ne pas imbriquer d'interactifs.",
              ]}
            />
            <LeadingTrailingDoc />
            </>
          }
        />
      ),
    },
    layout: "centered",
  },
  args: {
    // La bordure est OFF par défaut — les stories rendent la List "à nu"
    // comme elle apparaîtrait quand insérée dans un container qui porte
    // déjà sa propre bordure (Card, Menu, SideNav…). Le toolbar Storybook
    // expose l'arg pour tester le rendu autonome.
    isBordered: false,
  },
  argTypes: {
    isDense: { control: "boolean" },
    isBordered: { control: "boolean" },
  },
  // Contrainte de largeur uniquement — la bordure est maintenant portée par
  // la prop `isBordered` sur List, plus par le décorateur.
  decorators: [
    (Story) => <div style={{ width: 360 }}>{Story()}</div>,
  ],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof List>;

// -----------------------------------------------------------------------
// Stories

/** Liste basique avec icônes + texte. */
export const Default: Story = {
  render: (args) => (
    <List {...args} aria-label="Notifications">
      <ListItem>
        <ListItemIcon>
          <Icon icon="Notifications" />
        </ListItemIcon>
        <ListItemText primary="Nouveau message" />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Icon icon="Email" />
        </ListItemIcon>
        <ListItemText primary="Email reçu" />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Icon icon="Schedule" />
        </ListItemIcon>
        <ListItemText primary="Rappel calendrier" />
      </ListItem>
    </List>
  ),
};

/** Liste avec texte principal + secondaire. */
export const WithSecondaryText: Story = {
  name: "With secondary text",
  render: (args) => (
    <List {...args} aria-label="Activité">
      <ListItem>
        <ListItemIcon>
          <Icon icon="Notifications" />
        </ListItemIcon>
        <ListItemText
          primary="Nouveau message"
          secondary="Il y a 5 minutes"
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Icon icon="CheckCircle" />
        </ListItemIcon>
        <ListItemText
          primary="Sauvegarde terminée"
          secondary="Tous les fichiers ont été sauvegardés"
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Icon icon="Warning" />
        </ListItemIcon>
        <ListItemText
          primary="Mise à jour disponible"
          secondary="Version 2.4.0 — voir les notes de version"
        />
      </ListItem>
    </List>
  ),
};

/** Liste avec avatars + texte (contacts, utilisateurs…). */
export const WithAvatars: Story = {
  name: "With avatars",
  render: (args) => (
    <List {...args} aria-label="Contacts">
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="MD" size="medium" />
        </ListItemAvatar>
        <ListItemText primary="Martin Dupont" secondary="martin.dupont@aexae.fr" />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="SC" size="medium" />
        </ListItemAvatar>
        <ListItemText primary="Sophie Claire" secondary="sophie.claire@aexae.fr" />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="PB" size="medium" />
        </ListItemAvatar>
        <ListItemText primary="Pierre Bernard" secondary="pierre.bernard@aexae.fr" />
      </ListItem>
    </List>
  ),
};

/** Liste interactive avec ListItemButton — sélection unique tenue par le parent. */
export const Interactive: Story = {
  render: function InteractiveStory(args) {
    const [selected, setSelected] = useState("home");
    const items = [
      { id: "home", label: "Accueil", icon: "Home" as const },
      { id: "search", label: "Rechercher", icon: "Search" as const },
      { id: "favorites", label: "Favoris", icon: "Star" as const },
      { id: "settings", label: "Paramètres", icon: "Settings" as const },
    ];
    return (
      <List {...args} aria-label="Navigation">
        {items.map((it) => (
          <ListItemButton
            key={it.id}
            isSelected={selected === it.id}
            onPress={() => setSelected(it.id)}
          >
            <ListItemIcon>
              <Icon icon={it.icon} />
            </ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    );
  },
};

/** Sections multiples séparées par des `ListHead`. */
export const WithSections: Story = {
  name: "With section heads",
  render: (args) => (
    <List {...args} aria-label="Paramètres">
      <ListHead>Compte</ListHead>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Person" />
        </ListItemIcon>
        <ListItemText primary="Profil" secondary="Nom, email, photo" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Lock" />
        </ListItemIcon>
        <ListItemText primary="Sécurité" secondary="Mot de passe, 2FA" />
      </ListItemButton>
      <ListHead>Notifications</ListHead>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Email" />
        </ListItemIcon>
        <ListItemText primary="Email" secondary="Daily digest activé" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Notifications" />
        </ListItemIcon>
        <ListItemText primary="Push" secondary="Désactivé" />
      </ListItemButton>
    </List>
  ),
};

/** Items avec éléments à droite (badge, tag, action). */
export const WithTrailing: Story = {
  name: "With trailing content",
  render: (args) => (
    <List {...args} aria-label="Inbox">
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Email" />
        </ListItemIcon>
        <ListItemText primary="Boîte de réception" />
        <ListItemTrailing>
          <Badge label="12" appearance="information" importance="high" />
        </ListItemTrailing>
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Star" />
        </ListItemIcon>
        <ListItemText primary="Favoris" />
        <ListItemTrailing>
          <Tag label="Nouveau" appearance="subtle" />
        </ListItemTrailing>
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Delete" />
        </ListItemIcon>
        <ListItemText primary="Corbeille" />
      </ListItemButton>
    </List>
  ),
};

/** États : sélectionné + désactivé. */
export const States: Story = {
  render: (args) => (
    <List {...args} aria-label="States">
      <ListItem>
        <ListItemIcon>
          <Icon icon="Home" />
        </ListItemIcon>
        <ListItemText primary="Item statique" />
      </ListItem>
      <ListItem isSelected>
        <ListItemIcon>
          <Icon icon="Star" />
        </ListItemIcon>
        <ListItemText
          primary="Item sélectionné"
          secondary="data-selected + aria-current"
        />
      </ListItem>
      <ListItem isDisabled>
        <ListItemIcon>
          <Icon icon="Block" />
        </ListItemIcon>
        <ListItemText
          primary="Item désactivé"
          secondary="texte sourd"
        />
      </ListItem>
      <ListItemButton onPress={() => {}}>
        <ListItemIcon>
          <Icon icon="CheckCircle" />
        </ListItemIcon>
        <ListItemText primary="Button cliquable" />
      </ListItemButton>
      <ListItemButton isDisabled onPress={() => {}}>
        <ListItemIcon>
          <Icon icon="Block" />
        </ListItemIcon>
        <ListItemText primary="Button désactivé" />
      </ListItemButton>
    </List>
  ),
};

/**
 * Folder list — pattern « explorateur de fichiers » avec avatar circulaire
 * (initiales ou icône colorée) + texte secondaire + métadonnée à droite
 * (date, taille). C'est l'un des cas d'usage où la List se distingue
 * nettement du Menu (Menu = popover dense single-line, List = contenu
 * inline avec métadonnées multi-niveaux).
 */
export const FolderList: Story = {
  name: "Folder / file list",
  render: (args) => (
    <List {...args} aria-label="Fichiers">
      <ListHead>Aujourd&apos;hui</ListHead>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="PDF" size="medium" />
        </ListItemAvatar>
        <ListItemText
          primary="Rapport Q4 2025"
          secondary="rapport-q4.pdf — 2.3 Mo"
        />
        <Text size="xsmall" color="subtle">
          12:30
        </Text>
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="XLS" size="medium" />
        </ListItemAvatar>
        <ListItemText
          primary="Planning équipe"
          secondary="planning-équipe.xlsx — 156 Ko"
        />
        <Text size="xsmall" color="subtle">
          09:14
        </Text>
      </ListItem>
      <ListHead>Hier</ListHead>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="FIG" size="medium" />
        </ListItemAvatar>
        <ListItemText
          primary="Design System v3"
          secondary="design-system-v3.fig — 8.1 Mo"
        />
        <Text size="xsmall" color="subtle">
          17:42
        </Text>
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar initials="MD" size="medium" />
        </ListItemAvatar>
        <ListItemText
          primary="Notes réunion"
          secondary="notes-réunion.md — 4 Ko"
        />
        <Text size="xsmall" color="subtle">
          14:08
        </Text>
      </ListItem>
    </List>
  ),
};

/**
 * Liste avec contrôles trailing — pattern « écran de paramètres ».
 * Chaque item porte une `Checkbox` cliquable indépendamment de l'item.
 * C'est l'autre cas d'usage très distinct du Menu : un Menu ne tient pas
 * un état persistant, la List si.
 */
export const WithControls: Story = {
  name: "With controls (Checkbox)",
  render: function ControlsStory(args) {
    const [prefs, setPrefs] = useState({
      email: true,
      push: false,
      digest: true,
      marketing: false,
    });
    const toggle = (key: keyof typeof prefs) =>
      setPrefs((p) => ({ ...p, [key]: !p[key] }));
    return (
      <List {...args} aria-label="Notifications">
        <ListHead>Email</ListHead>
        <ListItem>
          <ListItemIcon>
            <Icon icon="Email" />
          </ListItemIcon>
          <ListItemText
            primary="Notifications email"
            secondary="Recevoir un email à chaque action"
          />
          <Checkbox
            isChecked={prefs.email}
            onChange={() => toggle("email")}
            aria-label="Notifications email"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Icon icon="NotificationsAdd" />
          </ListItemIcon>
          <ListItemText
            primary="Récapitulatif quotidien"
            secondary="Tous les soirs à 18 h"
          />
          <Checkbox
            isChecked={prefs.digest}
            onChange={() => toggle("digest")}
            aria-label="Récapitulatif quotidien"
          />
        </ListItem>
        <ListHead>Push</ListHead>
        <ListItem>
          <ListItemIcon>
            <Icon icon="Notifications" />
          </ListItemIcon>
          <ListItemText
            primary="Notifications push"
            secondary="Système, badges, sons"
          />
          <Checkbox
            isChecked={prefs.push}
            onChange={() => toggle("push")}
            aria-label="Notifications push"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Icon icon="Campaign" />
          </ListItemIcon>
          <ListItemText
            primary="Communications produit"
            secondary="Nouveautés, conseils, offres"
          />
          <Checkbox
            isChecked={prefs.marketing}
            onChange={() => toggle("marketing")}
            aria-label="Communications produit"
          />
        </ListItem>
      </List>
    );
  },
};

/**
 * Layout 3-lignes — `ListItemText` reçoit `wrap` pour que le texte
 * secondaire passe sur plusieurs lignes au lieu d'être tronqué à
 * l'ellipse. Cas typique : inbox preview avec aperçu du message.
 *
 * Visuellement très différent du Menu (qui est strictement single-line).
 */
export const ThreeLine: Story = {
  name: "Three-line list",
  render: (args) => (
    <List {...args} aria-label="Inbox">
      <ListItemButton>
        <ListItemAvatar>
          <Avatar initials="MD" size="medium" />
        </ListItemAvatar>
        <ListItemText
          wrap
          primary="Martin Dupont"
          secondary="J'ai vu votre demande pour la mise à jour, je m'en occupe cet après-midi et je vous reviens avec un retour."
        />
      </ListItemButton>
      <ListItemButton>
        <ListItemAvatar>
          <Avatar initials="SC" size="medium" />
        </ListItemAvatar>
        <ListItemText
          wrap
          primary="Sophie Claire"
          secondary="Réunion confirmée pour demain 10 h en visio. Je t'envoie le lien Meet juste avant."
        />
      </ListItemButton>
      <ListItemButton>
        <ListItemAvatar>
          <Avatar initials="PB" size="medium" />
        </ListItemAvatar>
        <ListItemText
          wrap
          primary="Pierre Bernard"
          secondary="Bonjour, j'ai trouvé un bug sur l'écran d'accueil quand on est en mode déconnecté — détails en pièce jointe."
        />
      </ListItemButton>
    </List>
  ),
};

/**
 * Inset list — items sans icône, mais avec un padding-left qui aligne
 * leur texte avec celui des items qui ont une icône au-dessus. Pattern
 * utile dans les listes mixtes (certains items ont une icône, d'autres
 * non) où on veut un alignement vertical du texte cohérent.
 */
export const Inset: Story = {
  name: "Inset list",
  render: (args) => {
    // Padding-left aligné sur le texte des items à icône :
    // padding-item + min-width icon + gap = space200 + size300 + space150.
    const insetStyle = {
      paddingLeft: "calc(var(--space200) + var(--size300) + var(--space150))",
    };
    return (
      <List {...args} aria-label="Inset">
        <ListItem>
          <ListItemIcon>
            <Icon icon="Star" />
          </ListItemIcon>
          <ListItemText primary="Favoris" />
        </ListItem>
        <ListItem style={insetStyle}>
          <ListItemText primary="Article récent (inset, sans icône)" />
        </ListItem>
        <ListItem style={insetStyle}>
          <ListItemText primary="Article archivé (inset, sans icône)" />
        </ListItem>
      </List>
    );
  },
};

/** Mode dense — padding vertical réduit. */
export const Dense: Story = {
  args: { isDense: true },
  render: (args) => (
    <List {...args} aria-label="Liste dense">
      <ListHead>Récents</ListHead>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Description" />
        </ListItemIcon>
        <ListItemText primary="rapport-q4.pdf" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Description" />
        </ListItemIcon>
        <ListItemText primary="planning-équipe.xlsx" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Description" />
        </ListItemIcon>
        <ListItemText primary="design-system-v3.fig" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Description" />
        </ListItemIcon>
        <ListItemText primary="notes-réunion.md" />
      </ListItemButton>
    </List>
  ),
};

// -----------------------------------------------------------------------
// États natifs (chargement / vide / erreur)
//
// Le consommateur passe `isLoading`, `isEmpty` ou `error` directement à
// `List` — aucun état à composer à la main. Priorité : error > isLoading >
// isEmpty > children.

const noop = () => undefined;

/** **Chargement** — items skeleton (avatar + 2 lignes), contexte « Membres ». */
export const LoadingState: Story = {
  name: "Loading",
  parameters: { controls: { disable: true } },
  render: () => (
    <List aria-label="Membres (chargement)" isBordered isLoading skeletonItems={4} />
  ),
};

/** **Vide** — état vide natif via `isEmpty` (illustration + message). */
export const EmptyState: Story = {
  name: "Empty",
  parameters: { controls: { disable: true } },
  render: () => (
    <List
      aria-label="Membres (vide)"
      isBordered
      isEmpty
      emptyTitle="Aucun membre"
      emptyDescription="Invitez des membres pour collaborer."
    />
  ),
};

/** **Erreur** — état erreur natif via `error` + bouton « Réessayer » (`onRetry`). */
export const ErrorState: Story = {
  name: "Error",
  parameters: { controls: { disable: true } },
  render: () => (
    <List
      aria-label="Membres (erreur)"
      isBordered
      error="Impossible de charger les membres."
      onRetry={noop}
    />
  ),
};

/**
 * **Surtitre (overline)** — un type court en capitales au-dessus du titre.
 * Réservé à un type **court et énumérable** ; la 3ᵉ ligne (intitulé libre)
 * montre pourquoi une phrase n'y a pas sa place — elle se tronque et appartient
 * au titre. Le prop est livré ; la recette Main courante n'y bascule pas tant
 * que la nature du champ `type` n'est pas tranchée côté produit (cf. guidelines).
 * Les stories sans surtitre (Default, With secondary text…) sont le contre-point.
 */
export const Overline: Story = {
  name: "Overline (surtitre)",
  parameters: { controls: { disable: true } },
  render: () => (
    <List isBordered aria-label="Main courante">
      <ListItem>
        <ListItemText
          overline="Ronde"
          primary="Toiture terrasse"
          secondary="Hall d'accueil · 14:05"
        />
      </ListItem>
      <ListItem>
        <ListItemText
          overline="Contrôle d'accès"
          primary="Tourniquet Est"
          secondary="Zone livraison · 11:30"
        />
      </ListItem>
      <ListItem>
        {/* Cas limite : un intitulé libre en surtitre se tronque mal — il
            appartient au titre, pas au surtitre. */}
        <ListItemText
          overline="Intrusion détectée en zone de stockage réfrigérée"
          primary="Entrepôt B"
          secondary="12:58"
        />
      </ListItem>
    </List>
  ),
  play: async ({ canvasElement }) => {
    // Le surtitre est tronqué sur UNE seule ligne (nowrap + ellipse) — un
    // intitulé libre n'y déborde pas verticalement.
    const overlines = canvasElement.querySelectorAll('[class*="itemTextOverline"]');
    await expect(overlines).toHaveLength(3);
    const long = overlines[overlines.length - 1] as HTMLElement;
    const cs = getComputedStyle(long);
    await expect(cs.whiteSpace).toBe("nowrap");
    await expect(cs.overflow).toBe("hidden");
    await expect(cs.textOverflow).toBe("ellipsis");
  },
};

// -----------------------------------------------------------------------
// §8 — Fixture Agents : le cas limite qui valide le slot LIBRE.
// Avatar d'identité en leading, nom en titre, matricule · contrat en
// sous-titre, UNE métrique (Delta) en trailing, AUCUN statut.

interface Agent {
  id: string;
  name: string;
  matricule: string;
  contrat: string;
  delta: string;
}

const AGENTS: Agent[] = [
  { id: "1", name: "DUPONT Marie", matricule: "MAT-0142", contrat: "CDI 35h", delta: "+2h30" },
  { id: "2", name: "MARTIN Bob", matricule: "MAT-0198", contrat: "CDD 28h", delta: "-1h00" },
  { id: "3", name: "CHEN Alice", matricule: "MAT-0231", contrat: "CDI 39h", delta: "+0h15" },
  { id: "4", name: "CLAIRE Sophie", matricule: "MAT-0087", contrat: "Intérim", delta: "-3h45" },
];

const agentInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * **Agents — le slot libre à l'épreuve.** Avatar d'**identité** en leading (la
 * ligne EST l'agent → grand avatar), nom en titre, `matricule · contrat` en
 * sous-titre, et **une seule** métrique (Delta) en trailing — **aucun statut**.
 * C'est le cas qui prouve que `ListItemTrailing` n'est pas typé « statut ».
 */
export const AgentsList: Story = {
  name: "Agents (slot libre, une métrique)",
  parameters: { controls: { disable: true } },
  render: () => (
    <List isBordered aria-label="Agents">
      {AGENTS.map((a) => (
        <ListItemButton key={a.id}>
          <ListItemAvatar>
            <Avatar size="medium" initials={agentInitials(a.name)} />
          </ListItemAvatar>
          <ListItemText
            primary={a.name}
            secondary={`${a.matricule} · ${a.contrat}`}
          />
          <ListItemTrailing>
            <Text size="small" weight="medium" as="span">
              {a.delta}
            </Text>
          </ListItemTrailing>
        </ListItemButton>
      ))}
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Le trailing (Delta) est DANS le bouton → une ligne = un seul arrêt de
    // tabulation : autant de boutons que d'agents, aucun focus supplémentaire.
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(AGENTS.length);
    await expect(buttons[0]).toHaveTextContent("+2h30");
  },
};

/**
 * **Ligne d'état réservée.** Une ligne avec état, une sans. Grâce au
 * `min-height` réservé dans `ListItemTrailing` (§2), les deux gardent la MÊME
 * hauteur — le rythme tient sans filet.
 */
export const ReservedTrailingLine: Story = {
  name: "Ligne d'état réservée",
  parameters: { controls: { disable: true } },
  render: () => (
    <List isBordered aria-label="Rythme réservé">
      <ListItemButton>
        <ListItemText primary="Avec état" secondary="Site A" />
        <ListItemTrailing>
          <Text size="xsmall" color="subtle" as="span">
            14:05
          </Text>
          <Tag label="En cours" color="information" appearance="subtle" />
        </ListItemTrailing>
      </ListItemButton>
      <ListItemButton>
        <ListItemText primary="Sans état" secondary="Site B" />
        <ListItemTrailing>
          <Text size="xsmall" color="subtle" as="span">
            13:40
          </Text>
        </ListItemTrailing>
      </ListItemButton>
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole("listitem");
    const heights = rows.map((r) => Math.round(r.getBoundingClientRect().height));
    // La ligne réservée maintient la hauteur : avec état == sans état.
    await expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  },
};

/**
 * **Anatomie** — les emplacements d'un item, légendés. Le DS fournit les
 * emplacements (leading / surtitre / titre / sous-titre / trailing) ; quelle
 * donnée va où appartient au produit (cf. guidelines « Où va quoi »).
 */
export const ListAnatomy: Story = {
  name: "Anatomie",
  parameters: { controls: { disable: true } },
  render: () => (
    <List isBordered aria-label="Anatomie d'un item">
      <ListItem>
        <ListItemAvatar>
          <Avatar size="medium" initials="LE" />
        </ListItemAvatar>
        <ListItemText
          overline="SURTITRE"
          primary="Titre (primary)"
          secondary="Sous-titre (secondary)"
        />
        <ListItemTrailing>
          <Text size="xsmall" color="subtle" as="span">
            trailing
          </Text>
          <Tag label="état" color="neutral" appearance="subtle" />
        </ListItemTrailing>
      </ListItem>
    </List>
  ),
};
