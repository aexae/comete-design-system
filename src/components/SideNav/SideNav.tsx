// SideNav — Comete Design System
// Composant de navigation latérale pour les applications.
import type { ReactElement, ReactNode } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import styles from "./SideNav.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface SideNavProps {
  children: ReactNode;
  className?: string;
}

export interface SideNavHeaderProps {
  /** Logo affiché à gauche (Logo Comète par défaut, ou logo client custom). */
  logo?: ReactNode;
  /** Nom de la société / application. */
  companyName?: string;
  /** Description courte sous le nom. */
  description?: string;
  className?: string;
}

export interface SideNavItemProps {
  /** Libellé principal de l'item. */
  label: string;
  /** Texte secondaire sous le label. */
  description?: string;
  /** Icône avant le label. */
  iconBefore?: IconName;
  /** Icône après le label. */
  iconAfter?: IconName;
  /** Item sélectionné (page courante). */
  isSelected?: boolean;
  /** Item désactivé. */
  isDisabled?: boolean;
  /** URL de navigation (rend un <a>). Sans href, rend un <button>. */
  href?: string;
  /** Callback de clic. */
  onClick?: () => void;
  className?: string;
}

export interface SideNavSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export interface SideNavDividerProps {
  className?: string;
}

export interface SideNavFooterProps {
  children: ReactNode;
  className?: string;
}

// -----------------------------------------------------------------------
// SideNavHeader

export function SideNavHeader({
  logo,
  companyName,
  description,
  className,
}: SideNavHeaderProps): ReactElement {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      {logo}
      {(companyName || description) && (
        <div className={styles.headerContent}>
          {companyName && <span className={styles.headerAppName}>{companyName}</span>}
          {description && (
            <span className={styles.headerSubtitle}>{description}</span>
          )}
        </div>
      )}
    </div>
  );
}

SideNavHeader.displayName = "SideNav.Header";

// -----------------------------------------------------------------------
// SideNavItem

export function SideNavItem({
  label,
  description,
  iconBefore,
  iconAfter,
  isSelected = false,
  isDisabled = false,
  href,
  onClick,
  className,
}: SideNavItemProps): ReactElement {
  const iconColor = isDisabled ? "disabled" : isSelected ? "selected" : "subtle";
  const iconAppearance = isSelected ? "filled" : "outlined";

  const classNames = [
    styles.item,
    isSelected ? styles.itemSelected : undefined,
    isDisabled ? styles.itemDisabled : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {iconBefore && (
        <Icon
          icon={iconBefore}
          size={24}
          appearance={iconAppearance}
          color={iconColor}
          className={styles.iconBefore}
        />
      )}
      <span className={styles.itemContent}>
        <span className={styles.itemTitle}>{label}</span>
        {description && (
          <span className={styles.itemDescription}>{description}</span>
        )}
      </span>
      {iconAfter && (
        <Icon
          icon={iconAfter}
          size={24}
          appearance="outlined"
          color={iconColor}
          className={styles.iconAfter}
        />
      )}
    </>
  );

  const ariaProps = {
    "aria-current": isSelected ? ("page" as const) : undefined,
    "aria-disabled": isDisabled || undefined,
    onClick: isDisabled ? undefined : onClick,
  };

  if (href && !isDisabled) {
    return (
      <a href={href} className={classNames} {...ariaProps}>
        {content}
      </a>
    );
  }

  if (href && isDisabled) {
    return (
      <a role="link" className={classNames} {...ariaProps}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classNames} {...ariaProps}>
      {content}
    </button>
  );
}

SideNavItem.displayName = "SideNav.Item";

// -----------------------------------------------------------------------
// SideNavSection

export function SideNavSection({
  title,
  children,
  className,
}: SideNavSectionProps): ReactElement {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      {title && <div className={styles.sectionHeading}>{title}</div>}
      {children}
    </div>
  );
}

SideNavSection.displayName = "SideNav.Section";

// -----------------------------------------------------------------------
// SideNavDivider

export function SideNavDivider({ className }: SideNavDividerProps): ReactElement {
  return (
    <hr
      className={[styles.divider, className].filter(Boolean).join(" ")}
    />
  );
}

SideNavDivider.displayName = "SideNav.Divider";

// -----------------------------------------------------------------------
// SideNavFooter

export function SideNavFooter({
  children,
  className,
}: SideNavFooterProps): ReactElement {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

SideNavFooter.displayName = "SideNav.Footer";

// -----------------------------------------------------------------------
// SideNav (main)

/**
 * SideNav — Comete Design System
 *
 * Navigation latérale composable. Utilise des sous-composants attachés
 * pour structurer le contenu : Header, Item, Section, Divider, Footer.
 *
 * ```tsx
 * <SideNav>
 *   <SideNav.Header companyName="Mon App" description="v1.0" />
 *   <SideNav.Section title="Navigation">
 *     <SideNav.Item label="Accueil" iconBefore="Home" isSelected />
 *     <SideNav.Item label="Paramètres" iconBefore="Settings" />
 *   </SideNav.Section>
 *   <SideNav.Divider />
 *   <SideNav.Footer>
 *     <Logo />
 *   </SideNav.Footer>
 * </SideNav>
 * ```
 */
export function SideNav({
  children,
  className,
}: SideNavProps): ReactElement {
  return (
    <nav className={[styles.sideNav, className].filter(Boolean).join(" ")}>
      {children}
    </nav>
  );
}

SideNav.displayName = "SideNav";

// Attach sub-components
SideNav.Header = SideNavHeader;
SideNav.Item = SideNavItem;
SideNav.Section = SideNavSection;
SideNav.Divider = SideNavDivider;
SideNav.Footer = SideNavFooter;
