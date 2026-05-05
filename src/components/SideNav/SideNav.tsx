// SideNav — Comete Design System
import { createContext,
  useContext,
  useState,
  type ReactElement,
  type ReactNode, type CSSProperties } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { Button } from "../Button/index.js";
import { Divider } from "../Divider/index.js";
import styles from "./SideNav.module.css";

// -----------------------------------------------------------------------
// Context partagé (couvre SideNav + SideNav.Trigger + SideNavHeader)

interface SideNavContextValue {
  isCollapsed: boolean;
  /** Toggle du mode collapsed. */
  onToggleCollapse?: () => void;
  /** Vrai quand un peek est demandé (hover sur Trigger ou nav). */
  isPeeking: boolean;
  /** Marque la zone Trigger (Page.Header.leading) comme survolée. */
  setTriggerHover?: (hovered: boolean) => void;
  /** Marque la nav elle-même comme survolée. */
  setNavHover?: (hovered: boolean) => void;
}

const SideNavContext = createContext<SideNavContextValue>({
  isCollapsed: false,
  isPeeking: false,
});

/** Hook pour accéder à l'état du SideNav parent. */
export function useSideNav(): SideNavContextValue {
  return useContext(SideNavContext);
}

// -----------------------------------------------------------------------
// Types publics

export interface SideNavProps {
  children: ReactNode;
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface SideNavProviderProps {
  children: ReactNode;
  /** Mode réduit (controlled). */
  isCollapsed?: boolean;
  /** Mode réduit initial (uncontrolled). @default false */
  defaultCollapsed?: boolean;
  /** Callback déclenché à chaque changement de l'état collapsed. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface SideNavHeaderProps {
  /** Logo affiché à gauche. */
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

export interface SideNavTriggerProps {
  /** Classe CSS additionnelle. */
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
      {logo && <span className={styles.headerLogo}>{logo}</span>}
      {(companyName || description) && (
        <div className={styles.headerContent}>
          {companyName && <span className={styles.headerAppName}>{companyName}</span>}
          {description && (
            <span className={styles.headerSubtitle}>{description}</span>
          )}
        </div>
      )}
      {/* Pas de bouton collapse ici — le toggle est exclusivement géré par
          `<SideNav.Trigger />` dans `Page.Header.leading`. */}
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
    <Divider className={[styles.divider, className].filter(Boolean).join(" ")} />
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
// SideNavTrigger — bouton standalone à placer dans une TopNav

/**
 * SideNav.Trigger — bouton de toggle à placer dans `Page.Header.leading`.
 * Lit son état depuis le `<SideNav.Provider>` parent (commun avec la
 * `<SideNav>`).
 *
 * Comportement :
 * - **Click** : toggle l'état collapsed/expanded.
 * - **Hover en collapsed** : déclenche le peek — la SideNav s'ouvre en
 *   overlay par-dessus le contenu sans pousser la layout.
 *
 * ```tsx
 * <SideNav.Provider isCollapsed={c} onCollapsedChange={setC}>
 *   <SideNav>...</SideNav>
 *   <Page>
 *     <Page.Header leading={<SideNav.Trigger />} />
 *   </Page>
 * </SideNav.Provider>
 * ```
 */
export function SideNavTrigger({
  className,
}: SideNavTriggerProps): ReactElement {
  const { isCollapsed, onToggleCollapse, setTriggerHover } = useContext(
    SideNavContext,
  );
  return (
    <Button
      appearance="subtle"
      color="subtlest"
      iconBefore={isCollapsed ? "LeftPanelOpen" : "LeftPanelClose"}
      onPress={onToggleCollapse}
      onHoverStart={() => setTriggerHover?.(true)}
      onHoverEnd={() => setTriggerHover?.(false)}
      aria-label={isCollapsed ? "Développer la navigation" : "Réduire la navigation"}
      className={className}
    />
  );
}

SideNavTrigger.displayName = "SideNav.Trigger";

// -----------------------------------------------------------------------
// SideNav.Provider — détient le state partagé (isCollapsed, peek)

/**
 * SideNav.Provider — wrapper à placer **au-dessus** de la `<SideNav>` ET
 * du `<Page>` qui contient le `<SideNav.Trigger />`. Détient le state
 * partagé (collapsed + peek hover) pour que les deux puissent se
 * coordonner.
 *
 * Mode controlled : passer `isCollapsed` + `onCollapsedChange`.
 * Mode uncontrolled : passer `defaultCollapsed`.
 *
 * ```tsx
 * const [collapsed, setCollapsed] = useState(false);
 *
 * <SideNav.Provider isCollapsed={collapsed} onCollapsedChange={setCollapsed}>
 *   <div style={{ display: "flex" }}>
 *     <SideNav>
 *       <SideNav.Header ... />
 *       <SideNav.Section title="...">...</SideNav.Section>
 *     </SideNav>
 *     <Page>
 *       <Page.Header leading={<SideNav.Trigger />} title="..." />
 *     </Page>
 *   </div>
 * </SideNav.Provider>
 * ```
 */
export function SideNavProvider({
  children,
  isCollapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
}: SideNavProviderProps): ReactElement {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [triggerHover, setTriggerHover] = useState(false);
  const [navHover, setNavHover] = useState(false);

  const isCollapsed = controlled ?? internalCollapsed;
  const onToggleCollapse = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };
  const isPeeking = isCollapsed && (triggerHover || navHover);

  return (
    <SideNavContext.Provider
      value={{
        isCollapsed,
        onToggleCollapse,
        isPeeking,
        setTriggerHover,
        setNavHover,
      }}
    >
      {children}
    </SideNavContext.Provider>
  );
}

SideNavProvider.displayName = "SideNav.Provider";

// -----------------------------------------------------------------------
// SideNav (main)

/**
 * SideNav — Comete Design System
 *
 * Navigation latérale composable. Lit son état (isCollapsed + peek) depuis
 * le `<SideNav.Provider>` parent — doit donc toujours être placée à
 * l'intérieur de celui-ci.
 *
 * ```tsx
 * <SideNav.Provider isCollapsed={c} onCollapsedChange={setC}>
 *   <SideNav>
 *     <SideNav.Header ... />
 *     <SideNav.Section title="Navigation">
 *       <SideNav.Item label="Accueil" iconBefore="Home" isSelected />
 *     </SideNav.Section>
 *   </SideNav>
 * </SideNav.Provider>
 * ```
 */
export function SideNav({
  children,
  className,
  style,
}: SideNavProps): ReactElement {
  const { isCollapsed, isPeeking, setNavHover } = useContext(SideNavContext);

  return (
    <div
      className={styles.container}
      data-collapsed={isCollapsed || undefined}
      data-peeking={isPeeking || undefined}
      style={style}
    >
      <nav
        className={[styles.sideNav, className].filter(Boolean).join(" ")}
        data-collapsed={isCollapsed || undefined}
        data-peeking={isPeeking || undefined}
        /* Handlers actifs uniquement quand expanded ou en peek. En
           collapsed-not-peeking la nav fait 0px et n'a pas de zone hover —
           le hover sur le bord gauche NE déclenche PAS le peek (seul le
           Trigger le fait). En peek, les handlers maintiennent l'overlay
           ouvert tant que la souris est dessus. */
        onMouseEnter={
          !isCollapsed || isPeeking ? () => setNavHover?.(true) : undefined
        }
        onMouseLeave={
          !isCollapsed || isPeeking ? () => setNavHover?.(false) : undefined
        }
      >
        {children}
      </nav>
    </div>
  );
}

SideNav.displayName = "SideNav";

// Attach sub-components
SideNav.Header = SideNavHeader;
SideNav.Item = SideNavItem;
SideNav.Section = SideNavSection;
SideNav.Divider = SideNavDivider;
SideNav.Footer = SideNavFooter;
SideNav.Trigger = SideNavTrigger;
SideNav.Provider = SideNavProvider;
