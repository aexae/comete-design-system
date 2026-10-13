// BottomNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, type Ref, type RefObject, useEffect, useRef, useState } from "react";
import { within, screen, userEvent, expect, waitFor } from "storybook/test";
import {
  BottomNav,
  BottomNavItem,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  Icon,
  List,
  ListHead,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemTrailing,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Page,
  Popover,
  Text,
} from "@aexae/comete-design-system/components";
import type { IconName } from "@aexae/comete-icons";
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
function PhoneScreen({
  children,
  screenRef,
}: {
  children: ReactNode;
  /** Ref de l'écran : sert de LIMITE (`boundaryElement`) aux popovers de la barre. */
  screenRef?: Ref<HTMLDivElement>;
}): ReactNode {
  return (
    <div ref={screenRef} className={css["screen"]}>
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

function BottomNavWithPopupRight({
  boundaryRef,
}: {
  /** Écran du téléphone : le popover ne peut pas en sortir. */
  boundaryRef: RefObject<HTMLElement | null>;
}) {
  const [selected, setSelected] = useState("Accueil");
  const [popupOpen, setPopupOpen] = useState(false);

  // Un seul item actif : menu ouvert → aucun item de page n'est sélectionné.
  const activeItem = popupOpen ? null : selected;

  return (
    <BottomNav>
      <BottomNavItem
        label="Accueil"
        icon="Home"
        isSelected={activeItem === "Accueil"}
        onClick={() => { setSelected("Accueil"); }}
      />
      <BottomNavItem
        label="Agenda"
        icon="CalendarMonth"
        isSelected={activeItem === "Agenda"}
        onClick={() => { setSelected("Agenda"); }}
      />
      <BottomNavItem
        label="Notifications"
        icon="Notifications"
        badge="5"
        isSelected={activeItem === "Notifications"}
        onClick={() => { setSelected("Notifications"); }}
      />
      <BottomNavItem
        label="Profil"
        icon="Person"
        isSelected={activeItem === "Profil"}
        onClick={() => { setSelected("Profil"); }}
      />
      {/* « Plus » ouvre le `Popover` du DS via un `MenuTrigger` : ouverture,
          fermeture (clic extérieur, Échap, choix d'une action) et placement sont
          gérés par le composant — plus de div positionnée à la main. */}
      <MenuTrigger isOpen={popupOpen} onOpenChange={setPopupOpen}>
        <BottomNavItem label="Plus" icon="MoreHoriz" isOpen={popupOpen} />
        <Popover
          // Au-dessus de l'item, aligné sur son bord droit ; si la place manque,
          // il se retourne. `boundaryElement` = l'écran : le popover reste
          // entièrement dans l'écran (décalé si besoin, hauteur bornée).
          placement="top end"
          offset={8}
          boundaryElement={boundaryRef.current ?? undefined}
          style={{ minWidth: 240 }}
        >
          <Menu aria-label="Plus" onAction={() => { setPopupOpen(false); }}>
            <MenuSection title="Plus">
              <MenuItem id="settings" iconBefore="Settings">Paramètres</MenuItem>
              <MenuItem id="help" iconBefore="Home">Aide</MenuItem>
              <MenuItem id="logout" iconBefore="Person">Déconnexion</MenuItem>
            </MenuSection>
          </Menu>
        </Popover>
      </MenuTrigger>
    </BottomNav>
  );
}

function WithPopupRightDemo(): ReactNode {
  const screenRef = useRef<HTMLDivElement>(null);
  return (
    <PhoneScreen screenRef={screenRef}>
      <BottomNavWithPopupRight boundaryRef={screenRef} />
    </PhoneScreen>
  );
}

/**
 * Un item « Plus » à droite ouvre un menu d'actions secondaires dans un
 * **`Popover`** du DS (via `MenuTrigger`).
 *
 * - placement `top end` : au-dessus de l'item, aligné sur son bord droit ;
 * - `boundaryElement` = l'écran du téléphone : le popover **ne sort pas de
 *   l'écran** (retournement si la place manque, décalage, hauteur bornée) ;
 * - fermeture par clic extérieur, Échap ou choix d'une action.
 */
export const WithPopupRight: Story = {
  name: "With popup (right item)",
  parameters: { layout: "centered", design: { type: "figma", url: figmaUrl("2524:18591") } },
  render: () => <WithPopupRightDemo />,
};

// Test (masqué du sidebar) : le `play` ne se rejoue donc PAS à l'ouverture de la
// story visible ci-dessus. Vérifie le Popover du DS : ouverture au-dessus de
// « Plus », inclusion dans l'écran du téléphone, fermeture (Échap, action).
export const WithPopupRightInteractions: Story = {
  tags: ["!dev"],
  render: () => <WithPopupRightDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // Référence prise AVANT l'ouverture : menu ouvert, React Aria masque le reste de
    // la page aux technologies d'assistance (le bouton sort de l'arbre d'accessibilité).
    const trigger = canvas.getByRole("button", { name: "Plus" });
    const plus = () => trigger;
    const menu = () => screen.queryByRole("menu");

    await step("fermé au départ", async () => {
      await expect(plus()).toHaveAttribute("aria-haspopup", "true");
      await expect(menu()).toBeNull();
    });

    await step("s'ouvre dans un Popover, au-dessus de « Plus », sans sortir de l'écran", async () => {
      await userEvent.click(plus());
      const m = await screen.findByRole("menu");
      await expect(plus()).toHaveAttribute("aria-expanded", "true");
      // Le libellé reste visible à l'état ouvert : nom accessible conservé.
      await expect(canvas.getByRole("button", { name: "Plus", hidden: true })).toBe(trigger);
      const popover = m.closest("[data-trigger]") ?? m.parentElement;
      const rect = (popover as HTMLElement).getBoundingClientRect();
      const phone = canvasElement.querySelector<HTMLElement>('[class*="screen"]');
      await expect(phone).not.toBeNull();
      const bounds = (phone as HTMLElement).getBoundingClientRect();
      // Entièrement dans l'écran du téléphone…
      await expect(rect.left).toBeGreaterThanOrEqual(bounds.left);
      await expect(rect.right).toBeLessThanOrEqual(bounds.right);
      await expect(rect.top).toBeGreaterThanOrEqual(bounds.top);
      await expect(rect.bottom).toBeLessThanOrEqual(bounds.bottom);
      // …et au-dessus de la barre (placement « top »).
      await expect(rect.bottom).toBeLessThanOrEqual(plus().getBoundingClientRect().top);
    });

    await step("se referme avec Échap", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(menu()).toBeNull());
      await expect(plus()).toHaveAttribute("aria-expanded", "false");
    });

    await step("se referme au choix d'une action", async () => {
      await userEvent.click(plus());
      await userEvent.click(await screen.findByRole("menuitem", { name: "Paramètres" }));
      await waitFor(() => expect(menu()).toBeNull());
    });
  },
};

// -----------------------------------------------------------------------
// « Plus » en page — l'alternative au popup : une destination, pas un calque
//
// Libellés repris de navConfig.js / locales/fr/mce.json (Link). Toute la
// structure (écran, zone de page qui défile) passe par le CSS module.

const PLUS_SECTIONS: { title: string; entries: { label: string; icon: IconName }[] }[] = [
  {
    title: "Main courante",
    entries: [
      { label: "Main courante", icon: "MenuBook" },
      { label: "Formulaires d'évènements", icon: "EventNote" },
      { label: "Rondes", icon: "Patrol" },
      { label: "Formulaires", icon: "FormEdit" },
    ],
  },
  {
    title: "Administration",
    entries: [
      { label: "Utilisateurs", icon: "Group" },
      { label: "Droits d'accès", icon: "ManageAccounts" },
    ],
  },
];

function PlusPageDemo(): ReactNode {
  return (
    <PhoneScreen>
      <div className={css["pageFill"]}>
        <Page globalActions={null}>
          {/* Une seule affordance de navigation dans `leading` : le retour. */}
          <Page.Bar
            size="compact"
            title="Plus"
            leading={<Button appearance="subtle" iconBefore="ChevronLeft" aria-label="Retour" />}
          />
          <Page.Body>
            <List aria-label="Plus">
              {PLUS_SECTIONS.flatMap((section) => [
                <ListHead key={`head-${section.title}`}>{section.title}</ListHead>,
                ...section.entries.map((entry) => (
                  <ListItemButton key={entry.label}>
                    <ListItemIcon>
                      <Icon icon={entry.icon} size={24} color="subtle" />
                    </ListItemIcon>
                    <ListItemText primary={entry.label} />
                    <ListItemTrailing>
                      <Icon icon="ChevronRight" size={24} color="subtlest" />
                    </ListItemTrailing>
                  </ListItemButton>
                )),
              ])}
            </List>
          </Page.Body>
        </Page>
      </div>
      {/* « Plus » est une destination : sélectionné comme ses voisines, jamais
          `isOpen` — pas d'icône de fermeture, rien ne se referme. */}
      <BottomNav>
        <BottomNavItem label="Accueil" icon="Home" />
        <BottomNavItem label="Agenda" icon="CalendarMonth" />
        <BottomNavItem label="Notifications" icon="Notifications" badge="5" />
        <BottomNavItem label="Profil" icon="Person" />
        <BottomNavItem label="Plus" icon="MoreHoriz" isSelected />
      </BottomNav>
    </PhoneScreen>
  );
}

/**
 * **Plus en page** — l'alternative au popup : « Plus » n'ouvre pas de calque,
 * c'est une **destination** qui mène à un écran (barre de page avec retour,
 * liste en deux sections). Le « Plus » reste **sélectionné** (bleu, comme ses
 * voisines), sans état ouvert ni icône de fermeture.
 *
 * Le popup garde le contexte de la page mais plafonne à quelques entrées ; la
 * page n'a pas de plafond, entre dans l'historique du navigateur et laisse le
 * « Plus » sélectionné.
 */
export const PlusPage: Story = {
  name: "Plus en page",
  parameters: { layout: "centered", controls: { disable: true } },
  render: () => <PlusPageDemo />,
};

// Test (masqué du sidebar) : le `play` ne se rejoue pas à l'ouverture de la story.
export const PlusPageInteractions: Story = {
  tags: ["!dev"],
  parameters: { layout: "centered" },
  render: () => <PlusPageDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("la barre de page expose le titre « Plus »", async () => {
      await expect(canvas.getByRole("heading", { level: 1, name: "Plus" })).toBeInTheDocument();
    });

    await step("« Retour » est présent et atteignable au clavier", async () => {
      const back = canvas.getByRole("button", { name: "Retour" });
      await userEvent.tab();
      await expect(back).toHaveFocus();
    });

    await step("« Plus » est une destination : sélectionné, sans aria-expanded", async () => {
      const nav = within(canvas.getByRole("navigation"));
      const plus = nav.getByRole("button", { name: "Plus" });
      await expect(plus).not.toHaveAttribute("aria-expanded");
      await expect(plus).toHaveAttribute("aria-current");
    });

    await step("la liste expose les six entrées attendues", async () => {
      const list = within(canvas.getByRole("list", { name: "Plus" }));
      const names = list.getAllByRole("button").map((b) => b.textContent);
      await expect(names).toEqual([
        "Main courante",
        "Formulaires d'évènements",
        "Rondes",
        "Formulaires",
        "Utilisateurs",
        "Droits d'accès",
      ]);
    });
  },
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
  const [selected, setSelected] = useState("Accueil");
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
          label="Accueil"
          icon="Home"
          isSelected={activeItem === "Accueil"}
          onClick={() => { setSelected("Accueil"); }}
        />
        <BottomNavItem
          label="Main courante"
          icon="MenuBook"
          isSelected={activeItem === "Main courante"}
          onClick={() => { setSelected("Main courante"); }}
        />
        <BottomNav.Action
          icon="Add"
          aria-label={sheetOpen ? "Fermer les outils terrain" : "Ouvrir les outils terrain"}
          isOpen={sheetOpen}
          onPress={() => { setSheetOpen((o) => !o); }}
        />
        <BottomNavItem
          label="Planning"
          icon="CalendarClock"
          isSelected={activeItem === "Planning"}
          onClick={() => { setSelected("Planning"); }}
        />
        <BottomNavItem
          label="Plus"
          icon="MoreHoriz"
          isSelected={activeItem === "Plus"}
          onClick={() => { setSelected("Plus"); }}
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
  // Le FAB central (BottomNav.Action) ouvre le tiroir (aria-expanded → true) ;
  // Échap le referme ; l'item sélectionné porte aria-current="page".
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Item sélectionné au repos : aria-current="page".
    const accueil = canvas.getByRole("button", { name: "Accueil" });
    await expect(accueil).toHaveAttribute("aria-current", "page");

    // Clic sur l'Action → ouvre le tiroir (Drawer) et passe aria-expanded=true.
    const action = canvas.getByRole("button", { name: /outils terrain/i });
    await expect(action).not.toHaveAttribute("aria-expanded");
    await userEvent.click(action);
    await expect(action).toHaveAttribute("aria-expanded", "true");
    await expect(await body.findByRole("dialog")).toBeInTheDocument();

    // Échap ferme le tiroir : aria-expanded retombe et le dialog disparaît.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(action).not.toHaveAttribute("aria-expanded"));
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
