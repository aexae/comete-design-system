// BottomNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BottomNav,
  BottomNavItem,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  Text,
} from "@aexae/comete-design-system/components";
import type { IconName } from "@naxit/comete-icons";

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

// -----------------------------------------------------------------------
// Outil terrain MCE — bouton d'action central encoché (FAB) + tiroir bas
//
// Cas d'usage : application de terrain (Maîtrise du Cycle d'Exploitation)
// où l'action primaire est mise en avant via un FAB encoché au centre de la
// barre. Le FAB ouvre un tiroir bas ("bottom sheet") proposant deux actions
// de création rapide adaptées au travail sur site.

const SCRIM_HEIGHT = 320; // hauteur du voile assombri qui remonte depuis la barre
const FAB_SIZE = 56; // diamètre du FAB (rayon 28)
const NOTCH_RADIUS = 32; // ménage un liseré de 4px autour du FAB
const NOTCH_SLOT = NOTCH_RADIUS * 2; // largeur réservée au centre = largeur de l'encoche

// Découpe circulaire au centre du bord supérieur de la barre (effet encoché).
const NOTCH_MASK = `radial-gradient(circle ${NOTCH_RADIUS}px at 50% 0, transparent ${NOTCH_RADIUS - 1}px, #000 ${NOTCH_RADIUS}px)`;

interface MceAction {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const MCE_ACTIONS: MceAction[] = [
  {
    id: "scan",
    icon: "Scanner",
    title: "Scanner un équipement",
    description: "Identifier via QR code ou code-barres",
  },
  {
    id: "report",
    icon: "Report",
    title: "Signaler une anomalie",
    description: "Créer un rapport d'incident sur site",
  },
];

/** Ligne d'action du tiroir : pastille icône + titre + description + chevron. */
function MceActionRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space200)",
        width: "100%",
        padding: "var(--space150)",
        background: "none",
        border: "none",
        borderRadius: "var(--radius150)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          width: "var(--size600)",
          height: "var(--size600)",
          borderRadius: "var(--radius-round)",
          backgroundColor: "var(--background-brand-subtlest-default)",
        }}
      >
        <Icon icon={icon} size={24} appearance="filled" color="brand" />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "var(--space025)", flex: 1, minWidth: 0 }}>
        <Text size="medium" weight="bold" as="span">{title}</Text>
        <Text size="small" color="subtle" as="span">{description}</Text>
      </span>
      <Icon icon="ChevronRight" size={24} color="subtlest" />
    </button>
  );
}

function BottomNavFieldToolMce() {
  const [selected, setSelected] = useState("Tournée");
  const [sheetOpen, setSheetOpen] = useState(false);
  const dragStartY = useRef<number | null>(null);

  // Un seul item actif : tiroir ouvert → aucun item de page n'est sélectionné.
  const activeItem = sheetOpen ? null : selected;
  const closeSheet = () => { setSheetOpen(false); };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {sheetOpen && (
        <>
          {/* Scrim — voile assombri collé au bord haut de la barre, remonte
              depuis la nav et se ferme au tap. Ne recouvre jamais la barre.
              À CONSERVER même si la story n'a pas de contenu : dans l'app réelle
              (liste de sites, carte, planning), il signale l'état modal. */}
          <button
            type="button"
            aria-label="Fermer les outils terrain"
            onClick={closeSheet}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "100%",
              height: SCRIM_HEIGHT,
              padding: 0,
              border: "none",
              cursor: "pointer",
              backgroundColor: "var(--blanket-default)",
              zIndex: 1,
            }}
          />

          {/* Tiroir bas — collé au bord haut de la barre (bottom: 100%) */}
          <div
            role="dialog"
            aria-label="Outils terrain"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              zIndex: 2,
              backgroundColor: "var(--background-surface-elevation-overlay-default)",
              borderRadius: "var(--radius200) var(--radius200) 0 0",
              boxShadow: "var(--elevation-large)",
              overflow: "hidden",
              // padding bas = dégagement pour le FAB qui empiète sur la barre
              padding: `0 var(--space200) calc(${FAB_SIZE / 2}px + var(--space150))`,
            }}
          >
            {/* Poignée — tap ou swipe vers le bas pour fermer */}
            <button
              type="button"
              aria-label="Fermer"
              onClick={closeSheet}
              onPointerDown={(e) => { dragStartY.current = e.clientY; }}
              onPointerMove={(e) => {
                if (dragStartY.current !== null && e.clientY - dragStartY.current > 40) {
                  dragStartY.current = null;
                  setSheetOpen(false);
                }
              }}
              onPointerUp={() => { dragStartY.current = null; }}
              onPointerCancel={() => { dragStartY.current = null; }}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                padding: "var(--space100) 0 var(--space150)",
                background: "none",
                border: "none",
                cursor: "grab",
                touchAction: "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: "var(--size400)",
                  height: "var(--size050)",
                  borderRadius: "var(--radius-round)",
                  backgroundColor: "var(--background-neutral-bold-default)",
                }}
              />
            </button>
            {/* Titre */}
            <div style={{ padding: "0 var(--space150) var(--space100)" }}>
              <Text size="medium" weight="bold" as="div">Outils terrain</Text>
            </div>
            {/* Deux actions */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {MCE_ACTIONS.map((action) => (
                <MceActionRow
                  key={action.id}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  onPress={closeSheet}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Barre basse — fond encoché + items (atténués si ouvert) + FAB */}
      <div style={{ position: "relative" }}>
        {/* Couche de fond avec découpe circulaire (masque) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--background-surface-default)",
            WebkitMaskImage: NOTCH_MASK,
            maskImage: NOTCH_MASK,
          }}
        />

        {/* Items — atténués et non cliquables tant que le tiroir est ouvert.
            Règle : exactement 2 items de chaque côté du FAB (2 + FAB + 2). */}
        <BottomNav
          style={{
            position: "relative",
            background: "transparent",
            opacity: sheetOpen ? 0.4 : 1,
            pointerEvents: sheetOpen ? "none" : "auto",
            transition: "opacity var(--duration-normal) var(--easing-default)",
          }}
        >
          <BottomNavItem
            label="Tournée"
            icon="Map"
            isSelected={activeItem === "Tournée"}
            onClick={() => { setSelected("Tournée"); }}
          />
          <BottomNavItem
            label="Planning"
            icon="CalendarMonth"
            isSelected={activeItem === "Planning"}
            onClick={() => { setSelected("Planning"); }}
          />
          {/* Réserve l'emplacement central (largeur de l'encoche) pour le FAB */}
          <span aria-hidden style={{ flexGrow: 0, flexShrink: 0, flexBasis: NOTCH_SLOT }} />
          <BottomNavItem
            label="Rapports"
            icon="Assignment"
            isSelected={activeItem === "Rapports"}
            onClick={() => { setSelected("Rapports"); }}
          />
          <BottomNavItem
            label="Profil"
            icon="Person"
            isSelected={activeItem === "Profil"}
            onClick={() => { setSelected("Profil"); }}
          />
        </BottomNav>

        {/* FAB encoché — reste au-dessus de tout ; le + pivote de 45° en × */}
        <button
          type="button"
          aria-label={sheetOpen ? "Fermer les outils terrain" : "Ouvrir les outils terrain"}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => { setSheetOpen((o) => !o); }}
          style={{
            position: "absolute",
            left: "50%",
            top: -(FAB_SIZE / 2),
            transform: "translateX(-50%)",
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: "var(--radius-round)",
            border: "none",
            display: "grid",
            placeItems: "center",
            backgroundColor: "var(--background-brand-bold-default)",
            boxShadow: "var(--elevation-medium)",
            cursor: "pointer",
            zIndex: 3,
          }}
        >
          {/* Rotation CSS du + à 45° → ×. On ne change pas l'icône, on la tourne. */}
          <span
            style={{
              display: "grid",
              placeItems: "center",
              transform: sheetOpen ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 200ms ease-out",
            }}
          >
            <Icon icon="Add" size={24} appearance="filled" color="inverted" />
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Outil terrain MCE — le bouton d'action central est **encoché** dans la barre
 * (découpe circulaire) et ouvre un **tiroir bas** proposant deux actions de
 * création rapide : scanner un équipement, signaler une anomalie.
 *
 * Comportement (pattern Material Design) :
 * - le FAB déclenche le tiroir et son `+` **pivote de 45° en ×** ; un second
 *   appui referme ;
 * - le tiroir s'ouvre **collé au bord haut de la barre** (aucun espace) et
 *   remonte depuis celle-ci ;
 * - le **scrim** assombrit la zone au-dessus de la barre — la bottom nav reste
 *   visible dessous, mais **atténuée et non cliquable** tant que le tiroir est
 *   ouvert ; le scrim ne recouvre jamais la barre ni le FAB ;
 * - fermeture possible via le FAB (×), la **poignée** (tap / swipe vers le bas)
 *   ou le **scrim**.
 *
 * **Règle de composition (obligatoire)** : le FAB encoché doit toujours être
 * flanqué d'**exactement 2 items de chaque côté** (2 + FAB + 2). Ni plus, ni
 * moins — la symétrie garantit le centrage de l'encoche et un layout équilibré.
 */
export const FieldToolMce: Story = {
  name: "Field tool (notched FAB + bottom sheet)",
  parameters: {
    controls: { disable: true },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  render: () => <BottomNavFieldToolMce />,
};
