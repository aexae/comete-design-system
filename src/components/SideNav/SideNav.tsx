// SideNav — Comete Design System
import { Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode, type CSSProperties } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { Button } from "../Button/index.js";
import { Divider } from "../Divider/index.js";
import { Skeleton } from "../Skeleton/index.js";
import styles from "./SideNav.module.css";

// -----------------------------------------------------------------------
// Context partagé (couvre SideNav + SideNav.Trigger + SideNavHeader)

interface SideNavContextValue {
  isCollapsed: boolean;
  /** Toggle du mode collapsed. */
  onToggleCollapse?: () => void;
  /** Vrai quand la nav est affichée en overlay (peek). */
  isPeeking: boolean;
  /** Marque la zone Trigger (Page.Header.leading) comme survolée. */
  setTriggerHover?: (hovered: boolean) => void;
  /** Marque la nav (overlay) comme survolée. */
  setNavHover?: (hovered: boolean) => void;
  /** Marque le focus clavier comme présent à l'intérieur de la nav overlay. */
  setNavFocused?: (focused: boolean) => void;
  /** Ferme le peek immédiatement (ex. clic sur un item → navigation). */
  closePeek?: () => void;
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

export interface SideNavFooterBrandProps {
  /** Logo / marque à afficher discrètement. */
  children: ReactNode;
  className?: string;
}

export interface SideNavItemSkeletonProps {
  /** Ajoute une 2ᵉ ligne (placeholder de description). @default false */
  hasDescription?: boolean;
  className?: string;
}

export interface SideNavSkeletonProps {
  /** Nombre de lignes d'items placeholder à afficher. @default 5 */
  count?: number;
  /** Affiche un placeholder de titre de section au-dessus des items. @default true */
  withSectionTitle?: boolean;
  /** Affiche un placeholder d'en-tête (logo + nom) en haut. @default false */
  withHeader?: boolean;
  className?: string;
}

export interface SideNavEmptyProps {
  /** Titre de l'état vide. @default "Aucun élément" */
  title?: string;
  /** Description affichée sous le titre. */
  description?: string;
  /** Icône illustrative affichée au-dessus du titre. */
  icon?: IconName;
  /** Slot d'action (ex. un `<Button>`) affiché sous la description. */
  action?: ReactNode;
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
// SideNavFooterBrand — marque discrète dans le footer

/**
 * SideNav.FooterBrand — enveloppe un logo de marque dans le `SideNav.Footer`
 * avec un traitement discret (opacité réduite qui remonte au survol, taille
 * bornée, centré). À réserver au logo de marque : le reste du footer (liens,
 * version, compte…) doit rester neutre et pleinement contrasté.
 *
 * ```tsx
 * <SideNav.Footer>
 *   <SideNav.FooterBrand>
 *     <Logo product="link" format="logo" />
 *   </SideNav.FooterBrand>
 * </SideNav.Footer>
 * ```
 */
export function SideNavFooterBrand({
  children,
  className,
}: SideNavFooterBrandProps): ReactElement {
  return (
    <div className={[styles.footerBrand, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

SideNavFooterBrand.displayName = "SideNav.FooterBrand";

// -----------------------------------------------------------------------
// SideNavItemSkeleton — placeholder d'un item pendant le chargement

/**
 * SideNav.ItemSkeleton — silhouette d'un `SideNav.Item` pendant le
 * chargement (pastille d'icône + barre de label). Composable pour bâtir
 * un état de chargement sur mesure, ou via `SideNav.Skeleton`.
 */
export function SideNavItemSkeleton({
  hasDescription = false,
  className,
}: SideNavItemSkeletonProps): ReactElement {
  return (
    <div className={[styles.skeletonItem, className].filter(Boolean).join(" ")}>
      <Skeleton shape="circle" height={24} aria-label="Chargement…" />
      <span className={styles.skeletonItemContent}>
        <Skeleton height={12} width="70%" radius={4} aria-label="Chargement…" />
        {hasDescription && (
          <Skeleton height={10} width="45%" radius={4} aria-label="Chargement…" />
        )}
      </span>
    </div>
  );
}

SideNavItemSkeleton.displayName = "SideNav.ItemSkeleton";

// -----------------------------------------------------------------------
// SideNavSkeleton — état de chargement complet (titre + N items)

/**
 * SideNav.Skeleton — état de chargement prêt à l'emploi : un placeholder de
 * titre de section optionnel suivi de `count` lignes d'items. À rendre à la
 * place des `SideNav.Section`/`SideNav.Item` tant que la navigation charge.
 *
 * ```tsx
 * <SideNav>
 *   <SideNav.Header logo={<Logo format="icon" />} companyName="…" />
 *   {isLoading ? <SideNav.Skeleton count={6} /> : sections}
 * </SideNav>
 * ```
 */
export function SideNavSkeleton({
  count = 5,
  withSectionTitle = true,
  withHeader = false,
  className,
}: SideNavSkeletonProps): ReactElement {
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      {withHeader && (
        <div className={styles.skeletonHeader}>
          <Skeleton shape="circle" height={32} aria-label="Chargement…" />
          <span className={styles.skeletonHeaderContent}>
            <Skeleton height={12} width="60%" radius={4} aria-label="Chargement…" />
            <Skeleton height={10} width="40%" radius={4} aria-label="Chargement…" />
          </span>
        </div>
      )}
      {withSectionTitle && (
        <div className={styles.skeletonSectionTitle}>
          <Skeleton height={8} width={72} radius={4} aria-label="Chargement…" />
        </div>
      )}
      {Array.from({ length: count }, (_, i) => (
        <SideNavItemSkeleton key={i} />
      ))}
    </div>
  );
}

SideNavSkeleton.displayName = "SideNav.Skeleton";

// -----------------------------------------------------------------------
// SideNavEmpty — état vide

/**
 * SideNav.Empty — état vide compact affiché quand la navigation ne contient
 * aucun élément (icône optionnelle + titre + description + action). À rendre
 * à la place des `SideNav.Section`/`SideNav.Item`.
 *
 * ```tsx
 * <SideNav>
 *   <SideNav.Empty
 *     icon="Search"
 *     title="Aucun résultat"
 *     description="Aucune entrée ne correspond à votre recherche."
 *     action={<Button appearance="subtle" size="small">Réinitialiser</Button>}
 *   />
 * </SideNav>
 * ```
 */
export function SideNavEmpty({
  title = "Aucun élément",
  description,
  icon,
  action,
  className,
}: SideNavEmptyProps): ReactElement {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(" ")}>
      {icon && (
        <span className={styles.emptyIcon}>
          <Icon icon={icon} size={24} appearance="outlined" color="subtle" />
        </span>
      )}
      <span className={styles.emptyText}>
        <span className={styles.emptyTitle}>{title}</span>
        {description && (
          <span className={styles.emptyDescription}>{description}</span>
        )}
      </span>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

SideNavEmpty.displayName = "SideNav.Empty";

// -----------------------------------------------------------------------
// SideNavTrigger — bouton standalone à placer dans une TopNav

/**
 * SideNav.Trigger — bouton de toggle à placer dans `Page.Header.leading`.
 * Lit son état depuis le `<SideNav.Provider>` parent (commun avec la
 * `<SideNav>`).
 *
 * Comportement :
 * - **Click / Enter** (clavier) : toggle replié/déployé. Le mode déployé est
 *   en flux et pousse le contenu (panneau latéral classique).
 * - **Hover** (pointeur, en replié) : déclenche le *peek* — la SideNav
 *   s'affiche en **overlay glissant** par-dessus le contenu, **sans le
 *   pousser** (le contenu ne bouge pas). Le peek reste ouvert tant que le
 *   pointeur est sur le Trigger OU la nav, ou qu'un focus clavier est dans la
 *   nav ; il se ferme après un court délai une fois hors des deux. Le peek est
 *   une affordance *pointer-only* : au clavier, on déploie via Click/Enter.
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
/** Délai de tolérance avant fermeture du peek — évite les fermetures
 *  accidentelles lors d'un déplacement en diagonale (Trigger → nav). */
const PEEK_CLOSE_DELAY_MS = 200;

export function SideNavProvider({
  children,
  isCollapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
}: SideNavProviderProps): ReactElement {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [triggerHover, setTriggerHover] = useState(false);
  const [navHover, setNavHover] = useState(false);
  const [navFocused, setNavFocused] = useState(false);
  const [peekOpen, setPeekOpen] = useState(false);

  const isCollapsed = controlled ?? internalCollapsed;

  // Le peek reste ouvert tant que le pointeur survole le Trigger OU la nav,
  // ou qu'un focus clavier est à l'intérieur de la nav. Il ne se ferme que
  // lorsque NI hover NI focus ne sont présents, après un court délai.
  const wantOpen = triggerHover || navHover || navFocused;

  useEffect(() => {
    if (!isCollapsed) {
      setPeekOpen(false);
      return undefined;
    }
    if (wantOpen) {
      setPeekOpen(true);
      return undefined;
    }
    const timer = setTimeout(() => setPeekOpen(false), PEEK_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [wantOpen, isCollapsed]);

  const onToggleCollapse = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  // Fermeture immédiate (clic sur un item → navigation). On remet aussi les
  // drapeaux hover/focus à zéro pour que l'overlay reste fermé tant que le
  // pointeur ne quitte pas puis ne revient pas sur la nav.
  const closePeek = () => {
    setTriggerHover(false);
    setNavHover(false);
    setNavFocused(false);
    setPeekOpen(false);
  };

  const isPeeking = isCollapsed && peekOpen;

  return (
    <SideNavContext.Provider
      value={{
        isCollapsed,
        onToggleCollapse,
        isPeeking,
        setTriggerHover,
        setNavHover,
        setNavFocused,
        closePeek,
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
  const { isCollapsed, isPeeking, setNavHover, setNavFocused, closePeek } =
    useContext(SideNavContext);

  // Header et Footer restent épinglés en haut/bas ; tout le reste (sections +
  // items) est regroupé dans un corps qui défile (overflow-y: auto). On
  // partitionne les enfants pour ne pas imposer de wrapper au consommateur —
  // l'API composable (Header + sections + Footer) reste inchangée.
  const items = Children.toArray(children);
  const isType = (child: ReactNode, type: unknown) =>
    isValidElement(child) && child.type === type;
  const header = items.filter((c) => isType(c, SideNavHeader));
  const footer = items.filter((c) => isType(c, SideNavFooter));
  const body = items.filter(
    (c) => !isType(c, SideNavHeader) && !isType(c, SideNavFooter),
  );

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
        /* En collapsed, la nav est un overlay non focusable/non cliquable tant
           qu'elle n'est pas en peek (pointer-events: none + visibility: hidden
           via le CSS) — ces handlers ne s'y déclenchent donc pas. En peek, ils
           maintiennent l'overlay ouvert tant que le pointeur OU le focus
           clavier y sont. Un clic sur un item (navigation) ferme le peek. */
        onMouseEnter={() => setNavHover?.(true)}
        onMouseLeave={() => setNavHover?.(false)}
        onFocusCapture={() => setNavFocused?.(true)}
        onBlurCapture={() => setNavFocused?.(false)}
        onClick={isPeeking ? () => closePeek?.() : undefined}
      >
        {header}
        <div className={styles.body}>{body}</div>
        {footer}
      </nav>
    </div>
  );
}

SideNav.displayName = "SideNav";

// Attach sub-components
SideNav.Header = SideNavHeader;
SideNav.Item = SideNavItem;
SideNav.ItemSkeleton = SideNavItemSkeleton;
SideNav.Skeleton = SideNavSkeleton;
SideNav.Empty = SideNavEmpty;
SideNav.Section = SideNavSection;
SideNav.Divider = SideNavDivider;
SideNav.Footer = SideNavFooter;
SideNav.FooterBrand = SideNavFooterBrand;
SideNav.Trigger = SideNavTrigger;
SideNav.Provider = SideNavProvider;
