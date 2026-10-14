// BottomNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, type Ref, type RefObject, useEffect, useRef, useState } from "react";
import { within, screen, userEvent, expect, waitFor } from "storybook/test";
import {
  BottomNav,
  BottomNavItem,
  Button,
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
} from "@aexae/comete-design-system/components";
import type { IconName } from "@aexae/comete-icons";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import css from "./BottomNav.stories.module.css";
import { QuickActionsDemo } from "./_quickActionsDemo";

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
                "Plus de 5 destinations → les regrouper dans un item « Plus » (popup ou page). Jamais pour une action de création : c'est le rôle du FAB.",
              ]}
              best={[
                "3 à 5 items avec icône + libellé court ; un seul actif reflétant la vue courante.",
                "Icônes explicites et cohérentes ; réserver le débordement à un menu « Plus ».",
                "Masquer la BottomNav au scroll descendant pour gagner de l'espace, la réafficher au scroll montant.",
                "Avec un bouton d'action central (BottomNav.Action) : exactement 2 items de chaque côté (2 + Action + 2).",
                "« Plus » ≠ FAB. L'item « Plus » regroupe des **destinations** secondaires : il mène quelque part (page) ou garde le contexte (popup), puis se sélectionne ou se referme. Le FAB (`BottomNav.Action`) lance une **action** de création : il ouvre un menu d'actions (`QuickActions`), ne se sélectionne jamais et n'est pas une destination.",
                "Ne pas mélanger : pas de destinations derrière le FAB, pas d'actions de création derrière « Plus ».",
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
                      <BottomNavItem label="Tableau de bord" icon="Dashboard" isSelected />
                      <BottomNavItem label="Ma fiche" icon="Assignment" />
                      <BottomNavItem label="Planning" icon="CalendarMonth" />
                    </BottomNav>
                  </div>
                ),
                caption: "Libellés courts : lisibles d'un coup d'œil.",
              }}
              dontExample={{
                example: (
                  <div style={{ width: "100%" }}>
                    <BottomNav>
                      <BottomNavItem label="Tableau de bord" icon="Dashboard" isSelected />
                      <BottomNavItem label="Rapports et analyses détaillés" icon="Assignment" />
                      <BottomNavItem label="Planning" icon="CalendarMonth" />
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
    // Cadre de 402px pour les stories « item » ; les stories plein viewport (`noFrame`, ex.
    // recette QuickActions) s'en passent : un cadre fixe les ferait rétrécir / déborder.
    (Story: () => ReactNode, context: { parameters: { noFrame?: boolean } }) =>
      context.parameters.noFrame ? (
        <Story />
      ) : (
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

/**
 * Item interactif qui ouvre un popup.
 * Démarre en état default. Cliquer → isOpen + popup affiché + icône → croix (Close).
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

// Destinations RÉELLES de Link (comete_webapp : navConfig.js, locales/fr/mce.json).
// Ces libellés sont plus longs que de simples exemples : ils révèlent la
// troncature à 10 px, et la barre de Link porte jusqu'à SIX emplacements
// (5 destinations + « Plus »).
const MANAGER_ITEMS: NavItemDef[] = [
  { label: "Tableau de bord", icon: "Dashboard" },
  { label: "Agents", icon: "Group" },
  { label: "Sites", icon: "Site" },
  { label: "Pointages", icon: "Clockings" },
];

const AGENT_ITEMS: NavItemDef[] = [
  { label: "Tableau de bord", icon: "Dashboard" },
  { label: "Ma fiche", icon: "Assignment" },
  { label: "Planning", icon: "CalendarMonth" },
  { label: "Demandes", icon: "Comment", badge: "3" },
  { label: "Missions", icon: "Star" },
];

const PLUS_ITEM: NavItemDef = { label: "Plus", icon: "MoreHoriz" };

/** Entrées derrière le « Plus » (popup ou page) — libellés de Link. */
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

/** Quatre items — **Manager** (Tableau de bord, Agents, Sites, Pointages). Contrôle « Item actif ». */
export const FourItems: NavStory = {
  name: "Four items",
  parameters: {
    controls: { include: ["active"] },
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  argTypes: {
    active: { name: "Item actif", control: "radio", options: (MANAGER_ITEMS).map((i) => i.label) },
  },
  args: { active: "Tableau de bord" },
  render: (args) => (
    <PhoneScreen>
      <InteractiveBottomNav items={MANAGER_ITEMS} active={args.active} />
    </PhoneScreen>
  ),
};

/** Cinq items (maximum recommandé) — **Agent**. Contrôle « Item actif ». */
export const FiveItems: NavStory = {
  name: "Five items",
  parameters: {
    controls: { include: ["active"] },
    design: { type: "figma", url: figmaUrl("2524:18591") },
  },
  argTypes: {
    active: { name: "Item actif", control: "radio", options: (AGENT_ITEMS).map((i) => i.label) },
  },
  args: { active: "Tableau de bord" },
  render: (args) => (
    <PhoneScreen>
      <InteractiveBottomNav items={AGENT_ITEMS} active={args.active} />
    </PhoneScreen>
  ),
};

const LONG_LABEL_ITEMS: NavItemDef[] = [
  { label: "Tableau de bord", icon: "Dashboard" },
  { label: "Rapports et analyses détaillés", icon: "Assignment" },
  { label: "Planning des interventions", icon: "CalendarMonth" },
  { label: "Missions", icon: "Star" },
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
  args: { active: "Tableau de bord" },
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
  const [selected, setSelected] = useState("Tableau de bord");
  const [popupOpen, setPopupOpen] = useState(false);

  // Un seul item actif : menu ouvert → aucun item de page n'est sélectionné.
  const activeItem = popupOpen ? null : selected;

  return (
    <BottomNav>
      {MANAGER_ITEMS.map((item) => (
        <BottomNavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          isSelected={activeItem === item.label}
          onClick={() => { setSelected(item.label); }}
        />
      ))}
      {/* « Plus » ouvre le `Popover` du DS via un `MenuTrigger` : ouverture,
          fermeture (clic extérieur, Échap, choix d'une entrée) et placement sont
          gérés par le composant — plus de div positionnée à la main. */}
      <MenuTrigger isOpen={popupOpen} onOpenChange={setPopupOpen}>
        <BottomNavItem label={PLUS_ITEM.label} icon={PLUS_ITEM.icon} isOpen={popupOpen} />
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
            {PLUS_SECTIONS.map((section) => (
              <MenuSection key={section.title} title={section.title}>
                {section.entries.map((entry) => (
                  <MenuItem key={entry.label} id={entry.label} iconBefore={entry.icon}>
                    {entry.label}
                  </MenuItem>
                ))}
              </MenuSection>
            ))}
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
 * La barre **Manager** (Tableau de bord, Agents, Sites, Pointages) + un item « Plus » à droite qui ouvre un menu de destinations secondaires dans un
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
      await userEvent.click(await screen.findByRole("menuitem", { name: "Main courante" }));
      await waitFor(() => expect(menu()).toBeNull());
    });
  },
};

// -----------------------------------------------------------------------
// « Plus » en page — l'alternative au popup : une destination, pas un calque
//
// Libellés réels de Link (voir PLUS_SECTIONS). Toute la
// structure (écran, zone de page qui défile) passe par le CSS module.

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
        {AGENT_ITEMS.map((item) => (
          <BottomNavItem key={item.label} label={item.label} icon={item.icon} badge={item.badge} />
        ))}
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
// Recette FAB — BottomNav.Action + QuickActions

/**
 * **Recette FAB** — le bouton d'action central (`BottomNav.Action`) ouvre `QuickActions` : des
 * **pastilles flottantes** au-dessus d'un voile, une par action rapide (libellé à gauche,
 * pastille d'icône à droite).
 *
 * - **Vocabulaire réel** : les deux actions du FAB de l'agent en MCE (Link) — « Déclarer un
 *   évènement » et « Démarrer une ronde ». Aucune n'est `critical` : MCE n'a aucune notion de
 *   gravité ; ce sont l'icône et le verbe qui distinguent, pas la couleur (ADR 0002 — la
 *   couleur porte la nature, jamais l'identité) ;
 * - une rangée = un libellé et rien d'autre (pas de description : une action qui a besoin
 *   d'être expliquée est une entrée de **tiroir** (`Drawer`)) ;
 * - pas de « Fermer » : le FAB pivote en croix et le voile est touchable ; Échap ferme
 *   aussi, et le focus revient sur le FAB ;
 * - 5 actions au plus.
 *
 * La couche est plein écran : la story tourne en **viewport mobile** pour que voile,
 * pastilles et FAB s'alignent.
 */
export const QuickActionsRecipe: Story = {
  name: "With FAB — quick actions",
  globals: { viewport: { value: "cometeMobileAgent", isRotated: false } },
  parameters: { controls: { disable: true }, layout: "fullscreen", noFrame: true },
  render: () => <QuickActionsDemo />,
};
