// BottomNav.Item — stories avec props exposées dans les controls
//
// Sous-page de « Navigation/BottomNav » (comme SideNav / SideNav.Item) : la page de la barre
// montre la BottomNav complète et ses variantes, celle-ci les états d'un item isolé.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BottomNav,
  BottomNavItem,
  Menu,
  MenuItem,
  MenuSection,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;
const SMALL_WIDTH = 80;
/** Place réservée au-dessus de l'item pour le popup de la story « Open » (ouvert par défaut). */
const OPEN_POPUP_ROOM = 176;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/BottomNav/Item",
  component: BottomNavItem,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Un item de la barre de navigation inférieure : une icône et un libellé court, éventuellement un badge. Il est sélectionné quand il reflète la vue courante, et « ouvert » (`isOpen`) quand il déploie un popup — l'icône devient alors une croix.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Une destination de premier niveau dans une BottomNav : icône + libellé court.",
                "Un item « Plus » (`isOpen`) qui ouvre un popup de destinations secondaires.",
              ]}
              avoid={[
                "Une action de création → `BottomNav.Action` (FAB), pas un item.",
                "Un libellé long : il est tronqué par « … ».",
                "Plus d'un item sélectionné à la fois.",
              ]}
              best={[
                "Un seul item `isSelected`, reflétant la vue courante.",
                "`isOpen` seulement pour un « Plus » à popup ; un « Plus » en page est une destination : sélectionné, jamais ouvert.",
                "Badge court : un nombre ou quelques caractères.",
              ]}
              accessibility={[
                "Libellé visible ou `aria-label` ; item courant via `aria-current`.",
                "Un item qui ouvre un popup expose son état déplié (`aria-expanded`).",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("14:1031") },
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div style={{ display: "flex", justifyContent: "center", width: 402 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    icon: {
      control: "select",
      options: ["Dashboard", "Assignment", "CalendarMonth", "Comment", "Star", "MoreHoriz"],
    },
    isSelected: { control: "boolean" },
    isOpen: { control: "boolean" },
    isDisabled: { control: "boolean" },
    badge: { control: "text" },
    onClick: { action: "clicked" },
  },
  args: {
    label: "Planning",
    icon: "CalendarMonth",
    isSelected: false,
    isOpen: false,
    isDisabled: false,
  },
} satisfies Meta<typeof BottomNavItem>;

export default meta;
type Story = StoryObj<typeof BottomNavItem>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNav>
        <BottomNavItem {...args} />
      </BottomNav>
    </div>
  ),
};

export const Selected: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  args: { isSelected: true },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNav>
        <BottomNavItem {...args} />
      </BottomNav>
    </div>
  ),
};

/** Démo : item « Plus » dont le popup est OUVERT au montage. */
function OpenItemDemo(): ReactNode {
  const [isOpen, setIsOpen] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: SMALL_WIDTH, paddingTop: OPEN_POPUP_ROOM }}>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + var(--space200))",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 240,
            background: "var(--background-default-default)",
            borderRadius: "var(--radius100)",
            boxShadow: "var(--elevation-medium)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <Menu aria-label="Actions" onAction={() => { setIsOpen(false); }}>
            <MenuSection title="Main courante">
              <MenuItem id="events" iconBefore="MenuBook">Main courante</MenuItem>
              <MenuItem id="patrols" iconBefore="Patrol">Rondes</MenuItem>
            </MenuSection>
          </Menu>
        </div>
      )}
      <BottomNav>
        <BottomNavItem
          label="Plus"
          icon="MoreHoriz"
          isOpen={isOpen}
          onClick={() => { setIsOpen((o) => !o); }}
        />
      </BottomNav>
    </div>
  );
}

/**
 * Item interactif qui ouvre un popup.
 * **Démarre ouvert** : popup affiché + icône en croix (Close). Re-cliquer l'item, cliquer
 * ailleurs ou choisir une entrée → ferme le popup ; cliquer l'item le rouvre.
 */
export const Open: Story = {
  parameters: { controls: { disable: true } },
  render: () => <OpenItemDemo />,
};

/** Item désactivé — non interactif */
export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNav>
        <BottomNavItem {...args} />
      </BottomNav>
    </div>
  ),
};

export const WithBadge: Story = {
  name: "With badge",
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  args: { label: "Notifications", icon: "Notifications", badge: "3" },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNav>
        <BottomNavItem {...args} />
      </BottomNav>
    </div>
  ),
};
