// List — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
  Tag,
  Text,
} from "@aexae/comete-design-system/components";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
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
        <Badge label="12" appearance="primary" importance="high" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <Icon icon="Star" />
        </ListItemIcon>
        <ListItemText primary="Favoris" />
        <Tag label="Nouveau" appearance="subtle" />
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
