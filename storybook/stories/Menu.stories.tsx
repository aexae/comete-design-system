// Menu — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  SubmenuTrigger,
} from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Types pour les args du composant Menu

interface MenuStoryArgs {
  menus: 1 | 2 | 3;
  hasSeparator: boolean;
  title: string;
}

// -----------------------------------------------------------------------
// Helper — génère une section avec 3 items

function SampleSection({
  sectionTitle,
  hasSeparator = true,
  offset = 0,
}: {
  sectionTitle: string;
  hasSeparator?: boolean;
  offset?: number;
}) {
  return (
    <MenuSection title={sectionTitle} hasSeparator={hasSeparator}>
      <MenuItem
        id={`item-${offset + 1}`}
        iconBefore="Star"
        iconAfter="ChevronRight"
        description="Description"
      >
        Option
      </MenuItem>
      <MenuItem
        id={`item-${offset + 2}`}
        iconBefore="Star"
        iconAfter="ChevronRight"
        description="Description"
      >
        Option
      </MenuItem>
      <MenuItem
        id={`item-${offset + 3}`}
        iconBefore="Star"
        iconAfter="ChevronRight"
        description="Description"
      >
        Option
      </MenuItem>
    </MenuSection>
  );
}

// -----------------------------------------------------------------------
// Meta — Composant Menu

const meta = {
  title: "Components/Menu",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4711:14452"),
    },
  },
  argTypes: {
    menus: {
      control: { type: "inline-radio" },
      options: [1, 2, 3],
      description: "Nombre de sections affichées",
    },
    hasSeparator: {
      control: "boolean",
      description: "Afficher le séparateur entre les sections",
    },
    title: {
      control: "text",
      description: "Titre du heading item (section)",
    },
    mode: {
      control: "select",
      options: ["default", "select-single", "select-multiple"],
    },
  },
  args: {
    menus: 1,
    hasSeparator: true,
    title: "HEADING ITEM",
    mode: "default",
  },
} satisfies Meta<MenuStoryArgs>;

export default meta;
type Story = StoryObj<MenuStoryArgs>;

// -----------------------------------------------------------------------
// Render partagé

function MenuStory(args: MenuStoryArgs) {
  return (
    <div style={{ width: 360 }}>
      <Menu aria-label="Menu">
        <SampleSection sectionTitle={args.title} hasSeparator={args.hasSeparator} />
        {args.menus >= 2 && (
          <SampleSection sectionTitle={args.title} hasSeparator={args.hasSeparator} offset={3} />
        )}
        {args.menus >= 3 && (
          <SampleSection sectionTitle={args.title} hasSeparator={args.hasSeparator} offset={6} />
        )}
      </Menu>
    </div>
  );
}


// -----------------------------------------------------------------------
// Stories — Figma variants 

/** Menu simple à 3 options sans description ni icône après. */
export const SimpleOptions: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu aria-label="Menu">
        <MenuItem id="edit" iconBefore="Edit">Modifier</MenuItem>
        <MenuItem id="duplicate" iconBefore="ContentCopy">Dupliquer</MenuItem>
        <MenuItem id="delete" iconBefore="Delete">Supprimer</MenuItem>
      </Menu>
    </div>
  ),
};

/** Menu avec un bouton dans le slotAfter d'un item. */
export const WithSlotAfterButton: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu aria-label="Menu">
        <MenuItem id="profile" iconBefore="Person">Profil</MenuItem>
        <MenuItem
          id="invite"
          iconBefore="PersonAdd"
          slotAfter={<Button size="small" appearance="outlined">Inviter</Button>}
        >
          Membres
        </MenuItem>
        <MenuItem id="settings" iconBefore="Settings">Paramètres</MenuItem>
      </Menu>
    </div>
  ),
};

/** Variante menus = 1 : menu avec une seule section. */
export const OneSection: Story = {
  args: { menus: 1 },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:14820") },
  },
  render: MenuStory,
};

/** Variante menus = 2 : menu avec deux sections. */
export const TwoSections: Story = {
  args: {
    menus: 2,
    hasSeparator: false
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:14822") },
  },
  render: MenuStory,
};

/** Variante menus = 3 : menu avec trois sections. */
export const ThreeSections: Story = {
  args: { menus: 3 },
  parameters: {
    design: { type: "figma", url: figmaUrl("4711:14825") },
  },
  render: MenuStory,
};

/** Sélection unique (radios) : un seul item peut être sélectionné. */
export const SingleSelection: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu
        aria-label="Tri"
        mode="select-single"
        defaultSelectedKeys={new Set(["date"])}
      >
        <MenuItem id="date" iconBefore="CalendarToday">Par date</MenuItem>
        <MenuItem id="name" iconBefore="SortByAlpha">Par nom</MenuItem>
        <MenuItem id="size" iconBefore="Straighten">Par taille</MenuItem>
      </Menu>
    </div>
  ),
};

/** Sélection multiple (checkboxes) : plusieurs items sélectionnés. */
export const MultipleSelection: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu
        aria-label="Filtres"
        mode="select-multiple"
        defaultSelectedKeys={new Set(["active", "recent"])}
      >
        <MenuItem id="active">Actifs</MenuItem>
        <MenuItem id="recent">Récents</MenuItem>
        <MenuItem id="archived">Archivés</MenuItem>
        <MenuItem id="draft">Brouillons</MenuItem>
      </Menu>
    </div>
  ),
};

/** Sélection multiple avec icônes et descriptions. */
export const MultipleWithIcons: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu
        aria-label="Colonnes visibles"
        mode="select-multiple"
        defaultSelectedKeys={new Set(["name", "date"])}
      >
        <MenuItem id="name" iconBefore="Person" description="Nom complet">Nom</MenuItem>
        <MenuItem id="email" iconBefore="Mail" description="Adresse email">Email</MenuItem>
        <MenuItem id="date" iconBefore="CalendarToday" description="Date de création">Date</MenuItem>
        <MenuItem id="status" iconBefore="Info" description="Statut actuel">Statut</MenuItem>
      </Menu>
    </div>
  ),
};

/** Menu en cascade : un item ouvre un sous-menu. */
export const Submenu: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Menu aria-label="Menu">
        <MenuItem id="edit" iconBefore="Edit">Modifier</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="move" iconBefore="Folder">Déplacer vers</MenuItem>
          <MenuPopover>
            <Menu aria-label="Menu">
              <MenuItem id="drafts">Brouillons</MenuItem>
              <MenuItem id="archive">Archives</MenuItem>
              <SubmenuTrigger>
                <MenuItem id="projects">Projets</MenuItem>
                <MenuPopover>
                  <Menu aria-label="Menu">
                    <MenuItem id="p-alpha">Alpha</MenuItem>
                    <MenuItem id="p-beta">Beta</MenuItem>
                  </Menu>
                </MenuPopover>
              </SubmenuTrigger>
            </Menu>
          </MenuPopover>
        </SubmenuTrigger>
        <MenuItem id="delete" iconBefore="Delete">Supprimer</MenuItem>
      </Menu>
    </div>
  ),
};
