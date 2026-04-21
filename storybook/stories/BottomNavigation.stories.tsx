// BottomNavigation — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationItem,
  Menu,
  MenuItem,
  MenuSection,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;
const SMALL_WIDTH = 80;

// -----------------------------------------------------------------------
// Meta — on documente l'item individuel pour le contrôle interactif

const meta = {
  title: "Components/BottomNavigation",
  component: BottomNavigationItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2524:18591") },
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
      options: ["Home", "CalendarMonth", "Person", "Notifications", "Star", "Add"],
    },
    isSelected: { control: "boolean" },
    isOpen: { control: "boolean" },
    isDisabled: { control: "boolean" },
    badge: { control: "text" },
    onClick: { action: "clicked" },
  },
  args: {
    label: "Accueil",
    icon: "Home",
    isSelected: false,
    isOpen: false,
    isDisabled: false,
  },
} satisfies Meta<typeof BottomNavigationItem>;

export default meta;
type Story = StoryObj<typeof BottomNavigationItem>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNavigation>
        <BottomNavigationItem {...args} />
      </BottomNavigation>
    </div>
  ),
};

export const Selected: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  args: { isSelected: true },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNavigation>
        <BottomNavigationItem {...args} />
      </BottomNavigation>
    </div>
  ),
};

/**
 * Item interactif qui ouvre un popup.
 * Démarre en état default. Cliquer → isOpen + popup affiché + icône → Cancel.
 * Re-cliquer ou cliquer ailleurs → ferme le popup.
 */
export const Open: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
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
      <div ref={wrapperRef} style={{ position: "relative", width: SMALL_WIDTH }}>
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
              <MenuSection title="Créer">
                <MenuItem id="event" iconBefore="CalendarMonth">Nouvel événement</MenuItem>
                <MenuItem id="note" iconBefore="Notes">Nouvelle note</MenuItem>
              </MenuSection>
            </Menu>
          </div>
        )}
        <BottomNavigation>
          <BottomNavigationItem
            label="Créer"
            icon="Add"
            isOpen={isOpen}
            onClick={() => { setIsOpen((o) => !o); }}
          />
        </BottomNavigation>
      </div>
    );
  },
};

/** Item désactivé — non interactif */
export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNavigation>
        <BottomNavigationItem {...args} />
      </BottomNavigation>
    </div>
  ),
};

export const WithBadge: Story = {
  name: "With badge",
  parameters: { design: { type: "figma", url: figmaUrl("14:1031") } },
  args: { label: "Notifications", icon: "Notifications", badge: "3" },
  render: (args) => (
    <div style={{ width: SMALL_WIDTH }}>
      <BottomNavigation>
        <BottomNavigationItem {...args} />
      </BottomNavigation>
    </div>
  ),
};

export const FullNav: Story = {
  name: "Full navigation bar",
  parameters: { design: { type: "figma", url: figmaUrl("2524:18591") } },
  render: () => {
    const items = [
      { label: "Accueil", icon: "Home" as const },
      { label: "Agenda", icon: "CalendarMonth" as const },
      { label: "Notifications", icon: "Notifications" as const, badge: "5" },
      { label: "Profil", icon: "Person" as const },
      { label: "Missions", icon: "Star" as const },
    ];
    const [selected, setSelected] = useState("Accueil");
    return (
      <BottomNavigation>
        {items.map((item) => (
          <BottomNavigationItem
            key={item.label}
            {...item}
            isSelected={selected === item.label}
            onClick={() => { setSelected(item.label); }}
          />
        ))}
      </BottomNavigation>
    );
  },
};

// -----------------------------------------------------------------------
// Popup example — item central "Créer" qui ouvre un menu d'actions au-dessus

function BottomNavWithPopup() {
  const [selected, setSelected] = useState("Accueil");
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Ferme le popup au clic extérieur
  useEffect(() => {
    if (!popupOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupOpen]);

  // Un seul item actif à la fois : quand le popup est ouvert, aucun item de
  // page n'est "selected" (l'item Créer est l'actif via isOpen).
  const activeItem = popupOpen ? null : selected;

  return (
    <div ref={popupRef} style={{ position: "relative", display: "flex", width: "100%" }}>
      {popupOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + var(--space200))",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 280,
            background: "var(--background-default-default)",
            borderRadius: "var(--radius100)",
            boxShadow: "var(--elevation-medium)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <Menu
            aria-label="Créer"
            onAction={() => { setPopupOpen(false); }}
          >
            <MenuSection title="Créer">
              <MenuItem id="event" iconBefore="CalendarMonth">Nouvel événement</MenuItem>
              <MenuItem id="note" iconBefore="Notes">Nouvelle note</MenuItem>
              <MenuItem id="comment" iconBefore="Comment">Nouveau commentaire</MenuItem>
              <MenuItem id="photo" iconBefore="PhotoLibrary">Ajouter une photo</MenuItem>
            </MenuSection>
          </Menu>
        </div>
      )}
      <BottomNavigation>
        <BottomNavigationItem
          label="Accueil"
          icon="Home"
          isSelected={activeItem === "Accueil"}
          onClick={() => { setSelected("Accueil"); setPopupOpen(false); }}
        />
        <BottomNavigationItem
          label="Agenda"
          icon="CalendarMonth"
          isSelected={activeItem === "Agenda"}
          onClick={() => { setSelected("Agenda"); setPopupOpen(false); }}
        />
        <BottomNavigationItem
          label="Créer"
          icon="Add"
          isOpen={popupOpen}
          onClick={() => { setPopupOpen((o) => !o); }}
        />
        <BottomNavigationItem
          label="Notifications"
          icon="Notifications"
          badge="5"
          isSelected={activeItem === "Notifications"}
          onClick={() => { setSelected("Notifications"); setPopupOpen(false); }}
        />
        <BottomNavigationItem
          label="Profil"
          icon="Person"
          isSelected={activeItem === "Profil"}
          onClick={() => { setSelected("Profil"); setPopupOpen(false); }}
        />
      </BottomNavigation>
    </div>
  );
}

/**
 * L'item central "Créer" ouvre un popup d'actions au-dessus de la barre.
 * Cas d'usage typique : bouton "+" / FAB qui propose plusieurs types de création.
 */
export const WithPopup: Story = {
  name: "With popup",
  parameters: { design: { type: "figma", url: figmaUrl("2524:18591") } },
  render: () => <BottomNavWithPopup />,
};
