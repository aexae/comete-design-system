// BottomNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BottomNav,
  BottomNavItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  Text,
} from "@aexae/comete-design-system/components";
import type { IconName } from "@naxit/comete-icons";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import css from "./BottomNav.stories.module.css";

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
    docs: {
      description: { component: "La barre de navigation inférieure offre un accès rapide aux sections principales d'une application mobile. Elle reste fixe en bas de l'écran et met en évidence la section active." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Navigation principale sur mobile : 3 à 5 destinations de premier niveau accessibles au pouce.",
                "Quand l'app est consultée majoritairement sur petit écran.",
                "Applications web progressives (PWA) ou apps hybrides ciblant principalement le mobile.",
              ]}
              avoid={[
                "Un desktop avec navigation riche → SideNav.",
                "Une barre globale marque/compte → Page.Bar.",
                "Plus de 5 destinations → regrouper via un item « Plus » (Menu).",
              ]}
              best={[
                "3 à 5 items avec icône + libellé court ; un seul actif reflétant la vue courante.",
                "Icônes explicites et cohérentes ; réserver le débordement à un menu « Plus ».",
                "Masquer la BottomNav au scroll descendant pour gagner de l'espace, la réafficher au scroll montant.",
                "Avec un bouton d'action central (BottomNav.Action) : exactement 2 items de chaque côté (2 + Action + 2).",
              ]}
              accessibility={[
                "Chaque item a un libellé (visible ou `aria-label`) ; item courant via `aria-current`.",
                "Cibles tactiles suffisamment grandes ; navigation possible au clavier.",
                "Assurer un contraste suffisant entre l'icône active et les icônes inactives.",
              ]}
              doExample={{
                example: (
                  <div style={{ width: "100%" }}>
                    <BottomNav>
                      <BottomNavItem label="Accueil" icon="Home" isSelected />
                      <BottomNavItem label="Rapports" icon="Assignment" />
                      <BottomNavItem label="Profil" icon="Person" />
                    </BottomNav>
                  </div>
                ),
                caption: "Libellés courts : lisibles d'un coup d'œil.",
              }}
              dontExample={{
                example: (
                  <div style={{ width: "100%" }}>
                    <BottomNav>
                      <BottomNavItem label="Accueil" icon="Home" isSelected />
                      <BottomNavItem label="Rapports et analyses détaillés" icon="Assignment" />
                      <BottomNavItem label="Profil" icon="Person" />
                    </BottomNav>
                  </div>
                ),
                caption: "Libellés trop longs : tronqués par « … », illisibles.",
              }}
            />
          }
        />
      ),
    },
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

// -----------------------------------------------------------------------
// Barres complètes interactives — un contrôle « Item actif » pilote l'item
// sélectionné (cliquer un item l'active aussi ; un seul actif à la fois).

/** Story dont l'unique arg est l'item actif (non lié aux props BottomNavItem). */
type NavStory = StoryObj<{ active: string }>;

interface NavItemDef {
  label: string;
  icon: IconName;
  badge?: string;
}

function InteractiveBottomNav({
  items,
  active,
}: {
  items: NavItemDef[];
  active: string;
}): ReactNode {
  const [selected, setSelected] = useState(active);
  // Le contrôle Storybook « Item actif » repositionne la sélection.
  useEffect(() => {
    setSelected(active);
  }, [active]);
  return (
    <BottomNav>
      {items.map((item) => (
        <BottomNavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          isSelected={selected === item.label}
          onClick={() => { setSelected(item.label); }}
        />
      ))}
    </BottomNav>
  );
}

/**
 * Écran de démo (cadre téléphone) : place la barre en bas d'un fond clair, comme
 * sur mobile. Utilisé par toutes les stories de barre complète pour un contexte
 * cohérent.
 */
function PhoneScreen({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className={css["screen"]}>
      {children}
      {/* Home indicator iOS, comme dans la story field tool */}
      <div aria-hidden className={css["homeIndicator"]} />
    </div>
  );
}

const FOUR_ITEMS: NavItemDef[] = [
  { label: "Accueil", icon: "Home" },
  { label: "Agenda", icon: "CalendarMonth" },
  { label: "Notifications", icon: "Notifications", badge: "3" },
  { label: "Profil", icon: "Person" },
];

const FIVE_ITEMS: NavItemDef[] = [
  { label: "Accueil", icon: "Home" },
  { label: "Agenda", icon: "CalendarMonth" },
  { label: "Notifications", icon: "Notifications", badge: "5" },
  { label: "Missions", icon: "Star" },
  { label: "Profil", icon: "Person" },
];

/** Quatre items — contrôle « Item actif » pour activer chaque item. */
export const FourItems: NavStory = {
  name: "Four items",
  parameters: {
    controls: { include: ["active"] },
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  argTypes: {
    active: { name: "Item actif", control: "radio", options: FOUR_ITEMS.map((i) => i.label) },
  },
  args: { active: "Accueil" },
  render: (args) => (
    <PhoneScreen>
      <InteractiveBottomNav items={FOUR_ITEMS} active={args.active} />
    </PhoneScreen>
  ),
};

/** Cinq items (maximum recommandé) — contrôle « Item actif ». */
export const FiveItems: NavStory = {
  name: "Five items",
  parameters: {
    controls: { include: ["active"] },
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  argTypes: {
    active: { name: "Item actif", control: "radio", options: FIVE_ITEMS.map((i) => i.label) },
  },
  args: { active: "Accueil" },
  render: (args) => (
    <PhoneScreen>
      <InteractiveBottomNav items={FIVE_ITEMS} active={args.active} />
    </PhoneScreen>
  ),
};

const LONG_LABEL_ITEMS: NavItemDef[] = [
  { label: "Accueil", icon: "Home" },
  { label: "Rapports et analyses détaillés", icon: "Assignment" },
  { label: "Planning des interventions", icon: "CalendarMonth" },
  { label: "Profil", icon: "Person" },
];

/**
 * **Garde-fou** : un libellé trop long est tronqué avec ellipsis. Cas à éviter
 * en production — voir les guidelines, préférer un libellé court. Interactive :
 * cliquer un item l'active (ou via le contrôle « Item actif »).
 */
export const LongLabel: NavStory = {
  parameters: {
    controls: { include: ["active"] },
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  argTypes: {
    active: { name: "Item actif", control: "radio", options: LONG_LABEL_ITEMS.map((i) => i.label) },
  },
  args: { active: "Accueil" },
  render: (args) => (
    <PhoneScreen>
      <InteractiveBottomNav items={LONG_LABEL_ITEMS} active={args.active} />
    </PhoneScreen>
  ),
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
  parameters: { layout: "centered", design: { type: "figma", url: figmaUrl("2524:18591") } },
  render: () => (
    <PhoneScreen>
      <BottomNavWithPopupRight />
    </PhoneScreen>
  ),
};

// -----------------------------------------------------------------------
// Recette de référence « outil terrain MCE » — BottomNav.Action + Drawer
//
// Cas d'usage : application de terrain (Maîtrise du Cycle d'Exploitation) où
// l'action primaire est un FAB central (`BottomNav.Action`) qui ouvre un tiroir
// bas. Le tiroir EST le composant `Drawer` du DS (placement="bottom",
// size="auto", swipeable) ; son CONTENU (2 actions) est un pattern de story — le
// DS fournit le contenant. Toute la structure passe par le CSS module de la
// story : aucun inline style de structure.

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

/**
 * Ligne d'action du tiroir — PATTERN de contenu démontré dans la story (pastille
 * icône + titre + description + chevron). Ce n'est PAS un composant du DS : le DS
 * fournit le contenant (`Drawer`) ; le contenu reste à la charge de l'app.
 */
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
    <button type="button" onClick={onPress} className={css["actionRow"]}>
      <span aria-hidden className={css["actionRowIcon"]}>
        <Icon icon={icon} size={24} appearance="filled" color="brand" />
      </span>
      <span className={css["actionRowText"]}>
        <Text size="medium" weight="bold" as="span">{title}</Text>
        <Text size="small" color="subtle" as="span">{description}</Text>
      </span>
      <Icon icon="ChevronRight" size={24} color="subtlest" />
    </button>
  );
}

/**
 * Recette MCE complète : barre encochée (`BottomNav.Action` central + 2 items
 * de chaque côté) + tiroir `Drawer`.
 */
function FieldToolRecipe(): ReactNode {
  const [selected, setSelected] = useState("Tournée");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Un seul item actif : tiroir ouvert → aucun item de page n'est sélectionné.
  const activeItem = sheetOpen ? null : selected;
  const closeSheet = () => { setSheetOpen(false); };

  return (
    <>
      {/* Barre basse — items + bouton d'action central (BottomNav.Action).
          Règle : exactement 2 items de chaque côté (2 + Action + 2) ; la barre
          réserve l'emplacement central automatiquement. Le home indicator est
          fourni par PhoneScreen. */}
      <BottomNav>
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
        <BottomNav.Action
          icon="Add"
          aria-label={sheetOpen ? "Fermer les outils terrain" : "Ouvrir les outils terrain"}
          isOpen={sheetOpen}
          onPress={() => { setSheetOpen((o) => !o); }}
        />
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

      {/* Tiroir bas = composant Drawer du DS : hauteur ajustée au contenu
          (size="auto"), scrim cliquable, handle draggable (swipeable). */}
      <Drawer
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        placement="bottom"
        size="auto"
        swipeable
        aria-label="Outils terrain"
      >
        <DrawerHeader onClose={closeSheet}>Outils terrain</DrawerHeader>
        <DrawerBody>
          {/* Contenu = pattern de story (2 grosses actions), pas un composant DS */}
          <div className={css["sheetActions"]}>
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
        </DrawerBody>
      </Drawer>
    </>
  );
}

/**
 * Outil terrain MCE — **recette de référence**. Le bouton d'action central
 * `BottomNav.Action` ouvre un **tiroir bas** (`Drawer`) proposant deux actions
 * de création rapide : scanner un équipement, signaler une anomalie.
 *
 * - le tiroir est le **composant `Drawer`** du DS (`placement="bottom"`,
 *   `size="auto"` = hauteur ajustée au contenu, `swipeable` = handle) ; il gère
 *   le **scrim cliquable** et la fermeture par **drag du handle vers le bas** ;
 * - fermeture via le scrim, le handle (drag ≥ 40px) ou le bouton du header ;
 * - le **contenu** du tiroir (2 actions : icône + titre + description + chevron)
 *   est un **pattern de story**, pas un composant — le DS fournit le contenant ;
 * - **aucun inline style de structure** : toute la mise en page vit dans le CSS
 *   module de la story.
 *
 * **Règle de composition (obligatoire)** : le `BottomNav.Action` central doit
 * toujours être flanqué d'**exactement 2 items de chaque côté** (2 + Action + 2).
 */
export const FieldToolMce: Story = {
  name: "With FAB",
  parameters: {
    controls: { disable: true },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  render: () => (
    <PhoneScreen>
      <FieldToolRecipe />
    </PhoneScreen>
  ),
};
