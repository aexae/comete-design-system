// Menu — Comète Design System
// Composant menu accessible basé sur React Aria.
import {
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  MenuSection as AriaMenuSection,
  Header as AriaHeader,
  Separator as AriaSeparator,
  PopoverContext as AriaPopoverContext,
  type MenuProps as AriaMenuProps,
  type MenuItemProps as AriaMenuItemProps,
  type MenuTriggerProps as AriaMenuTriggerProps,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import { Popover } from "../Popover/index.js";
import styles from "./Menu.module.css";

// -----------------------------------------------------------------------
// Types publics

/**
 * Mode du menu.
 * - "default"        — menu classique sans sélection
 * - "select-single"   — sélection unique (radios visuels)
 * - "select-multiple" — sélection multiple (checkboxes visuels)
 */
export type MenuMode = "default" | "select-single" | "select-multiple";

export interface MenuProps<T extends object = object>
  extends Omit<AriaMenuProps<T>, "className" | "style" | "selectionMode"> {
  /**
   * Mode du menu. Câble automatiquement le selectionMode React Aria
   * et affiche les indicateurs visuels (radios / checkboxes) dans le elemBefore.
   * @default "default"
   */
  mode?: MenuMode;
  /** Additional CSS class on the menu list. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

export interface MenuTriggerProps extends AriaMenuTriggerProps {
  children: ReactNode;
}

export interface MenuItemProps
  extends Omit<AriaMenuItemProps, "className" | "style"> {
  /** Label principal affiché dans l'item. */
  children: ReactNode;
  /** Description secondaire affichée sous le label. */
  description?: string;
  /** Contenu personnalisé affiché avant iconBefore (remplacé par radio/checkbox en mode sélection). */
  elemBefore?: ReactNode;
  /** Icône affichée avant le label. */
  iconBefore?: IconName;
  /** Contenu personnalisé affiché après le label (ex : raccourci clavier, badge). */
  elemAfter?: ReactNode;
  /** Icône affichée après le label (ex : ChevronRight pour un sous-menu). */
  iconAfter?: IconName;
  /** Additional CSS class on the menu item. */
  className?: string;
}

export interface MenuSectionProps {
  /** Titre de la section (affiché en majuscules au-dessus des items). */
  title?: string;
  /** Affiche un séparateur au-dessus de la section (sauf la première). @default true */
  hasSeparator?: boolean;
  /** Items du menu dans cette section. */
  children: ReactNode;
  /** Additional CSS class on the section. */
  className?: string;
}

export interface SubmenuTriggerProps extends AriaSubmenuTriggerProps {
  children: ReactElement[];
}

export interface MenuPopoverProps {
  /** Width of the popover. @default 320 */
  width?: number;
  /** Additional CSS class on the popover. */
  className?: string;
  children: ReactNode;
}

// -----------------------------------------------------------------------
// Mode → React Aria selectionMode mapping

const MODE_TO_SELECTION: Record<MenuMode, "none" | "single" | "multiple"> = {
  default: "none",
  "select-single": "single",
  "select-multiple": "multiple",
};

// -----------------------------------------------------------------------
// MenuTrigger

/**
 * MenuTrigger — Comète Design System
 *
 * Wraps a trigger element (button) and a Popover+Menu. Opens the menu on
 * press or keyboard interaction (Enter, Space, ArrowDown).
 *
 * ```tsx
 * <MenuTrigger>
 *   <Button>Options</Button>
 *   <MenuPopover>
 *     <Menu>
 *       <MenuItem>Modifier</MenuItem>
 *       <MenuItem>Supprimer</MenuItem>
 *     </Menu>
 *   </MenuPopover>
 * </MenuTrigger>
 * ```
 */
export function MenuTrigger(props: MenuTriggerProps): ReactElement {
  return <AriaMenuTrigger {...props} />;
}

MenuTrigger.displayName = "MenuTrigger";

// -----------------------------------------------------------------------
// SubmenuTrigger

/**
 * SubmenuTrigger — Comète Design System
 *
 * Wraps a MenuItem (trigger) and a Popover+Menu to create a cascading
 * submenu. The submenu opens on hover or ArrowRight.
 */
export function SubmenuTrigger(props: SubmenuTriggerProps): ReactElement {
  return <AriaSubmenuTrigger {...props} />;
}

SubmenuTrigger.displayName = "SubmenuTrigger";

// -----------------------------------------------------------------------
// MenuPopover

/**
 * MenuPopover — Comète Design System
 *
 * Popover qui contient le Menu. Délègue au composant Popover du DS pour le
 * positionnement par défaut (flip + containerPadding).
 *
 * **Fallback overlay** : on lit le `triggerRef` injecté par le SubmenuTrigger
 * via `PopoverContext` et on mesure la position réelle du trigger. Si ni le
 * côté droit ni le côté gauche n'a la place pour afficher le popover entier,
 * on bascule sur `placement="bottom start"` — le popover s'affiche alors **sous
 * le trigger, aligné à sa gauche**, recouvrant visuellement le menu parent
 * plutôt que de sortir du viewport.
 */
export function MenuPopover({
  width = 320,
  className,
  children,
}: MenuPopoverProps): ReactElement {
  // Lit le contexte que SubmenuTrigger / DialogTrigger injecte sur le Popover.
  // Type opaque côté react-aria-components — on cast pour récupérer triggerRef.
  const popoverContext = useContext(AriaPopoverContext) as
    | { triggerRef?: RefObject<HTMLElement | null> }
    | null;
  const triggerRef = popoverContext?.triggerRef;

  // Bascule en overlay quand ni le côté droit ni le côté gauche du trigger
  // n'a assez de place pour afficher le popover entier. On marque aussi le
  // trigger via un data-attribute pour que le chevron du MenuItem pivote
  // automatiquement (CSS) — donne un feedback visuel cohérent quand le
  // submenu s'affiche en bas plutôt qu'à côté.
  const [overlayFallback, setOverlayFallback] = useState(false);
  useEffect(() => {
    // Capture le trigger au mount pour l'utiliser dans le cleanup même si le
    // ref bouge plus tard (lint react-hooks/exhaustive-deps).
    const initialTrigger = triggerRef?.current;
    const check = () => {
      const triggerEl = triggerRef?.current;
      if (!triggerEl || typeof window === "undefined") {
        setOverlayFallback(false);
        return;
      }
      const rect = triggerEl.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      // Marge de sécurité : 8px de padding côté viewport + 4px d'offset Popover.
      const needed = width + 12;
      const isOverlay = spaceRight < needed && spaceLeft < needed;
      setOverlayFallback(isOverlay);
      if (isOverlay) {
        triggerEl.setAttribute("data-submenu-overlay", "");
      } else {
        triggerEl.removeAttribute("data-submenu-overlay");
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      // Cleanup au démontage (popover qui se ferme) : remet le chevron par défaut.
      initialTrigger?.removeAttribute("data-submenu-overlay");
    };
  }, [triggerRef, width]);

  const cssVars = { "--menu-popover-width": `${width}px` } as React.CSSProperties;
  return (
    <Popover
      className={[styles.menuPopover, className].filter(Boolean).join(" ")}
      style={cssVars}
      // En overlay : place le popover sous le trigger, aligné à sa gauche
      // (recouvre le menu parent). Sinon, on laisse React Aria décider —
      // côté pour SubmenuTrigger, sous le bouton pour MenuTrigger.
      {...(overlayFallback ? { placement: "bottom start" as const } : {})}
    >
      {children}
    </Popover>
  );
}

MenuPopover.displayName = "MenuPopover";

// -----------------------------------------------------------------------
// Menu

/**
 * Menu — Comète Design System
 *
 * Liste d'items de menu accessible. Gère la navigation clavier,
 * la sélection et le focus automatiquement via React Aria.
 *
 * ```tsx
 * // Menu classique
 * <Menu>
 *   <MenuItem id="edit" iconBefore="Edit">Modifier</MenuItem>
 *   <MenuItem id="delete" iconBefore="Delete">Supprimer</MenuItem>
 * </Menu>
 *
 * // Sélection unique (radios)
 * <Menu mode="select-single" selectedKeys={new Set(["date"])} onSelectionChange={setKeys}>
 *   <MenuItem id="date">Par date</MenuItem>
 *   <MenuItem id="name">Par nom</MenuItem>
 * </Menu>
 *
 * // Sélection multiple (checkboxes)
 * <Menu mode="select-multiple" selectedKeys={selected} onSelectionChange={setSelected}>
 *   <MenuItem id="active">Actifs</MenuItem>
 *   <MenuItem id="archived">Archivés</MenuItem>
 * </Menu>
 * ```
 */
export function Menu<T extends object>({
  mode = "default",
  className,
  style,
  ...props
}: MenuProps<T>): ReactElement {
  const classNames = [styles.menu, className].filter(Boolean).join(" ");

  return (
    <AriaMenu
      {...props}
      selectionMode={MODE_TO_SELECTION[mode]}
      className={classNames}
      style={style}
    />
  );
}

Menu.displayName = "Menu";

// -----------------------------------------------------------------------
// MenuItem

/**
 * MenuItem — Comète Design System
 *
 * Item individuel du menu. Layout :
 * `[elemBefore] [iconBefore] [content] [elemAfter] [iconAfter]`
 *
 * En mode sélection, le elemBefore est automatiquement remplacé par
 * un indicateur radio (select-single) ou checkbox (select-multiple).
 *
 * @param children    - Label principal
 * @param description - Texte secondaire sous le label
 * @param elemBefore  - Contenu custom avant iconBefore (remplacé en mode sélection)
 * @param iconBefore  - Icône avant le label
 * @param elemAfter   - Contenu custom après le label (badge, shortcut)
 * @param iconAfter   - Icône après le label
 */
export function MenuItem({
  children,
  description,
  elemBefore,
  iconBefore,
  elemAfter,
  iconAfter,
  className,
  ...ariaProps
}: MenuItemProps): ReactElement {
  const hasDescription = description !== undefined;

  return (
    <AriaMenuItem
      {...ariaProps}
      className={[
        styles.item,
        hasDescription ? styles.withDescription : styles.compact,
        className,
      ].filter(Boolean).join(" ")}
    >
      {({ isFocusVisible, isDisabled, isSelected, hasSubmenu, selectionMode }) => {
        const trailingIcon = iconAfter ?? (hasSubmenu ? "ChevronRight" : undefined);
        // Le chevron auto-injecté pour les SubmenuTrigger reçoit une classe
        // dédiée — quand le popover bascule en overlay, MenuPopover marque le
        // trigger d'un data-submenu-overlay et la CSS fait pivoter ce chevron
        // (90deg) pour pointer vers le bas, cohérent avec la direction de la
        // cascade overlay. Les iconAfter custom ne sont pas affectés.
        const isAutoSubmenuChevron = !iconAfter && hasSubmenu;
        const iconColor = isDisabled ? "disabled" : isSelected ? "selected" : "default";
        const isSelectable = selectionMode !== "none";

        // Selection indicator replaces elemBefore in selection modes
        const resolvedElemBefore = isSelectable
          ? (
              <Icon
                icon={
                  selectionMode === "multiple"
                    ? isSelected ? "CheckBox" : "CheckBoxOutlineBlank"
                    : isSelected ? "RadioButtonChecked" : "RadioButtonUnchecked"
                }
                size={24}
                color={iconColor}
              />
            )
          : elemBefore;

        return (
          <>
            <span
              className={styles.itemContainer}
              data-selected={isSelected || undefined}
              data-disabled={isDisabled || undefined}
            >
              {resolvedElemBefore && (
                <span className={styles.elemBefore}>{resolvedElemBefore}</span>
              )}

              {iconBefore && (
                <Icon
                  icon={iconBefore}
                  size={24}
                  appearance="outlined"
                  color={iconColor}
                  className={styles.iconBefore}
                />
              )}

              <span className={styles.content}>
                <span className={styles.title}>{children}</span>
                {hasDescription && (
                  <span className={styles.description}>{description}</span>
                )}
              </span>

              {elemAfter && (
                <span className={styles.elemAfter}>{elemAfter}</span>
              )}

              {trailingIcon && (
                <Icon
                  icon={trailingIcon}
                  size={24}
                  appearance="outlined"
                  color={iconColor}
                  className={[
                    styles.iconAfter,
                    isAutoSubmenuChevron ? styles.submenuChevron : undefined,
                  ].filter(Boolean).join(" ")}
                />
              )}
            </span>

            {isFocusVisible && <FocusRing borderRadius={1} position="inside" />}
          </>
        );
      }}
    </AriaMenuItem>
  );
}

MenuItem.displayName = "MenuItem";

// -----------------------------------------------------------------------
// MenuSection

/**
 * MenuSection — Comète Design System
 *
 * Regroupe des items de menu avec un titre optionnel en majuscules.
 */
export function MenuSection({
  title,
  hasSeparator = true,
  children,
  className,
}: MenuSectionProps): ReactElement {
  const classNames = [
    hasSeparator ? styles.section : styles.sectionNoSeparator,
    className,
  ].filter(Boolean).join(" ");

  return (
    <AriaMenuSection className={classNames}>
      {title && (
        <AriaHeader className={styles.sectionHeading}>{title}</AriaHeader>
      )}
      {children}
    </AriaMenuSection>
  );
}

MenuSection.displayName = "MenuSection";

// -----------------------------------------------------------------------
// MenuDivider

/**
 * MenuDivider — Comète Design System
 *
 * Ligne de séparation horizontale entre les items du menu.
 */
export function MenuDivider(): ReactElement {
  return <AriaSeparator className={styles.divider} />;
}

MenuDivider.displayName = "MenuDivider";
