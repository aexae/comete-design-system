// BottomNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BottomNav,
  BottomNavItem,
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
  title: "Navigation/BottomNav",
  component: BottomNavItem,
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
        <BottomNav>
          <BottomNavItem
            label="Créer"
            icon="Add"
            isOpen={isOpen}
            onClick={() => { setIsOpen((o) => !o); }}
          />
        </BottomNav>
      </div>
    );
  },
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
      { label: "Options", icon: "MoreHoriz" as const },
    ];
    const [selected, setSelected] = useState("Accueil");
    return (
      <BottomNav>
        {items.map((item) => (
          <BottomNavItem
            key={item.label}
            {...item}
            isSelected={selected === item.label}
            onClick={() => { setSelected(item.label); }}
          />
        ))}
      </BottomNav>
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
      <BottomNav>
        <BottomNavItem
          label="Accueil"
          icon="Home"
          isSelected={activeItem === "Accueil"}
          onClick={() => { setSelected("Accueil"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Agenda"
          icon="CalendarMonth"
          isSelected={activeItem === "Agenda"}
          onClick={() => { setSelected("Agenda"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Créer"
          icon="Add"
          isOpen={popupOpen}
          onClick={() => { setPopupOpen((o) => !o); }}
        />
        <BottomNavItem
          label="Notifications"
          icon="Notifications"
          badge="5"
          isSelected={activeItem === "Notifications"}
          onClick={() => { setSelected("Notifications"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Profil"
          icon="Person"
          isSelected={activeItem === "Profil"}
          onClick={() => { setSelected("Profil"); setPopupOpen(false); }}
        />
      </BottomNav>
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

// -----------------------------------------------------------------------
// Popup example — item "Plus" à droite qui ouvre un menu d'actions secondaires

function BottomNavWithPopupRight() {
  const [selected, setSelected] = useState("Accueil");
  const [popupOpen, setPopupOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popupOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupOpen]);

  const activeItem = popupOpen ? null : selected;

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "flex", width: "100%" }}>
      {popupOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + var(--space200))",
            right: 0,
            minWidth: 240,
            background: "var(--background-default-default)",
            borderRadius: "var(--radius100)",
            boxShadow: "var(--elevation-medium)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <Menu
            aria-label="Plus"
            onAction={() => { setPopupOpen(false); }}
          >
            <MenuSection title="Plus">
              <MenuItem id="settings" iconBefore="Settings">Paramètres</MenuItem>
              <MenuItem id="help" iconBefore="Home">Aide</MenuItem>
              <MenuItem id="logout" iconBefore="Person">Déconnexion</MenuItem>
            </MenuSection>
          </Menu>
        </div>
      )}
      <BottomNav>
        <BottomNavItem
          label="Accueil"
          icon="Home"
          isSelected={activeItem === "Accueil"}
          onClick={() => { setSelected("Accueil"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Agenda"
          icon="CalendarMonth"
          isSelected={activeItem === "Agenda"}
          onClick={() => { setSelected("Agenda"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Notifications"
          icon="Notifications"
          badge="5"
          isSelected={activeItem === "Notifications"}
          onClick={() => { setSelected("Notifications"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Profil"
          icon="Person"
          isSelected={activeItem === "Profil"}
          onClick={() => { setSelected("Profil"); setPopupOpen(false); }}
        />
        <BottomNavItem
          label="Plus"
          icon="MoreHoriz"
          isOpen={popupOpen}
          onClick={() => { setPopupOpen((o) => !o); }}
        />
      </BottomNav>
    </div>
  );
}

/**
 * Un item "Plus" à droite ouvre un menu d'actions secondaires.
 * Le popup s'aligne sur le bord droit du container (right: 0).
 */
export const WithPopupRight: Story = {
  name: "With popup (right item)",
  parameters: { design: { type: "figma", url: figmaUrl("2524:18591") } },
  render: () => <BottomNavWithPopupRight />,
};
