// Menu — Comète Design System
// Composant menu accessible basé sur React Aria.
import type { ReactElement, ReactNode } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  MenuSection as AriaMenuSection,
  Header as AriaHeader,
  Separator as AriaSeparator,
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

export interface MenuProps<T extends object = object>
  extends Omit<AriaMenuProps<T>, "className" | "style"> {
  /** Additional CSS class on the menu list. */
  className?: string;
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
  /** Icône affichée avant le label. */
  iconBefore?: IconName;
  /** Icône affichée après le label (ex : ChevronRight pour un sous-menu). */
  iconAfter?: IconName;
  /** Contenu personnalisé affiché après le label (ex : raccourci clavier, badge). */
  slotAfter?: ReactNode;
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
// MenuTrigger — wraps React Aria's MenuTrigger

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
// SubmenuTrigger — wraps a MenuItem + Popover for cascading menus

/**
 * SubmenuTrigger — Comète Design System
 *
 * Wraps a MenuItem (trigger) and a Popover+Menu to create a cascading
 * submenu. The submenu opens on hover or ArrowRight.
 *
 * ```tsx
 * <Menu>
 *   <SubmenuTrigger>
 *     <MenuItem>Plus d'options</MenuItem>
 *     <MenuPopover>
 *       <Menu>
 *         <MenuItem>Sous-option 1</MenuItem>
 *       </Menu>
 *     </MenuPopover>
 *   </SubmenuTrigger>
 * </Menu>
 * ```
 */
export function SubmenuTrigger(props: SubmenuTriggerProps): ReactElement {
  return <AriaSubmenuTrigger {...props} />;
}

SubmenuTrigger.displayName = "SubmenuTrigger";

// -----------------------------------------------------------------------
// MenuPopover — popover container with elevation

/**
 * MenuPopover — Comète Design System
 *
 * Popover qui contient le Menu. Délègue au composant Popover du DS
 * pour le positionnement, l'ombre et les animations.
 */
export function MenuPopover({
  width = 320,
  className,
  children,
}: MenuPopoverProps): ReactElement {
  const cssVars = { "--menu-popover-width": `${width}px` } as React.CSSProperties;
  return (
    <Popover
      className={[styles.menuPopover, className].filter(Boolean).join(" ")}
      style={cssVars}
    >
      {children}
    </Popover>
  );
}

MenuPopover.displayName = "MenuPopover";

// -----------------------------------------------------------------------
// Menu — the menu list itself

/**
 * Menu — Comète Design System
 *
 * Liste d'items de menu accessible. Gère la navigation clavier,
 * la sélection et le focus automatiquement via React Aria.
 *
 * ```tsx
 * <Menu>
 *   <MenuItem id="edit" iconBefore="Edit">Modifier</MenuItem>
 *   <MenuDivider />
 *   <MenuItem id="delete" iconBefore="Delete">Supprimer</MenuItem>
 * </Menu>
 * ```
 */
export function Menu<T extends object>({
  className,
  ...props
}: MenuProps<T>): ReactElement {
  const classNames = [styles.menu, className].filter(Boolean).join(" ");

  return <AriaMenu {...props} className={classNames} />;
}

Menu.displayName = "Menu";

// -----------------------------------------------------------------------
// MenuItem — individual menu item

/**
 * MenuItem — Comète Design System
 *
 * Item individuel du menu. Supporte icône avant/après, description
 * secondaire et slot personnalisé (raccourci clavier, badge, etc.).
 *
 * @param children    - Label principal
 * @param description - Texte secondaire sous le label
 * @param iconBefore  - Icône avant le label
 * @param iconAfter   - Icône après le label
 * @param slotAfter   - Contenu custom après le label (badge, shortcut)
 */
export function MenuItem({
  children,
  description,
  iconBefore,
  iconAfter,
  slotAfter,
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
      {({ isFocusVisible, isDisabled, isSelected, hasSubmenu }) => {
        const trailingIcon = iconAfter ?? (hasSubmenu ? "ChevronRight" : undefined);

        return (
          <>
            {/* Container interne */}
            <span
              className={styles.itemContainer}
              data-selected={isSelected || undefined}
              data-disabled={isDisabled || undefined}
            >
              {iconBefore && (
                <Icon
                  icon={iconBefore}
                  size={24}
                  appearance="outlined"
                  color={isDisabled ? "disabled" : isSelected ? "selected" : "default"}
                  className={styles.iconBefore}
                />
              )}

              <span className={styles.content}>
                <span className={styles.title}>{children}</span>
                {hasDescription && (
                  <span className={styles.description}>{description}</span>
                )}
              </span>

              {slotAfter && (
                <span className={styles.slotAfter}>{slotAfter}</span>
              )}

              {trailingIcon && (
                <Icon
                  icon={trailingIcon}
                  size={24}
                  appearance="outlined"
                  color={isDisabled ? "disabled" : isSelected ? "selected" : "default"}
                  className={styles.iconAfter}
                />
              )}
            </span>

            {/* Focus ring overlay */}
            {isFocusVisible && <FocusRing borderRadius={1} position="inside" />}
          </>
        );
      }}
    </AriaMenuItem>
  );
}

MenuItem.displayName = "MenuItem";

// -----------------------------------------------------------------------
// MenuSection — grouped items with optional heading

/**
 * MenuSection — Comète Design System
 *
 * Regroupe des items de menu avec un titre optionnel en majuscules.
 * Ajoute automatiquement un séparateur visuel entre les sections.
 *
 * ```tsx
 * <Menu>
 *   <MenuSection title="Navigation">
 *     <MenuItem id="home">Accueil</MenuItem>
 *     <MenuItem id="profile">Profil</MenuItem>
 *   </MenuSection>
 *   <MenuSection title="Actions">
 *     <MenuItem id="settings">Paramètres</MenuItem>
 *   </MenuSection>
 * </Menu>
 * ```
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
// MenuDivider — visual separator between items

/**
 * MenuDivider — Comète Design System
 *
 * Ligne de séparation horizontale entre les items du menu.
 */
export function MenuDivider(): ReactElement {
  return <AriaSeparator className={styles.divider} />;
}

MenuDivider.displayName = "MenuDivider";
