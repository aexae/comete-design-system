// SideNav — Comete Design System
import { Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode, type CSSProperties } from "react";
import type { IconName } from "@aexae/comete-icons";
import { Icon } from "../Icon/index.js";
import { Button } from "../Button/index.js";
import { Divider } from "../Divider/index.js";
import { Skeleton } from "../Skeleton/index.js";
import styles from "./SideNav.module.css";

// `process` n'est pas typé ici (le DS build avec `types: []`, sans @types/node).
// Déclaration locale minimale : le bundler du consommateur remplace
// `process.env.NODE_ENV` par une constante à la compilation.
declare const process: { env: { NODE_ENV?: string } };

// -----------------------------------------------------------------------
// Context partagé (couvre SideNav + SideNav.Trigger + SideNavHeader)

/**
 * Mode d'affichage de la navigation latérale.
 * - `expanded` — panneau complet 240px (logo + libellés + sections nommées).
 * - `rail` — rail 56px, icônes seules ; survol → peek (grandissement en largeur).
 * - `hidden` — masquée (largeur 0) ; réouverture via `SideNav.Trigger` (mobile).
 */
export type SideNavMode = "expanded" | "rail" | "hidden";

interface SideNavContextValue {
  /** Mode d'affichage courant. */
  mode: SideNavMode;
  /** Change le mode (déployer / rail / masquer). */
  setMode?: (mode: SideNavMode) => void;
  /**
   * @deprecated Utiliser `mode` (`mode === "hidden"`). Conservé pour les
   * consommateurs et le `SideNav.Trigger` existants.
   */
  isCollapsed: boolean;
  /** @deprecated Toggle hidden ⇄ expanded (piloté par `SideNav.Trigger`). */
  onToggleCollapse?: () => void;
  /** Vrai quand la nav est affichée en overlay (peek). */
  isPeeking: boolean;
  /** Marque la zone Trigger (Page.Bar.leading) comme survolée. */
  setTriggerHover?: (hovered: boolean) => void;
  /**
   * Marque la nav comme survolée. En mode rail, survoler la nav (= le rail)
   * est le déclencheur du peek ; en mode hidden, c'est le Trigger.
   */
  setNavHover?: (hovered: boolean) => void;
  /** Marque le focus clavier comme présent à l'intérieur de la nav overlay. */
  setNavFocused?: (focused: boolean) => void;
  /** Ferme le peek immédiatement (ex. clic sur un item → navigation). */
  closePeek?: () => void;
}

const SideNavContext = createContext<SideNavContextValue>({
  mode: "expanded",
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
  /**
   * Nom accessible du repère de navigation (`<nav>`). Indispensable quand
   * plusieurs `<nav>` coexistent, pour que les lecteurs d'écran les distinguent.
   * @default "Navigation principale"
   */
  "aria-label"?: string;
}

export interface SideNavProviderProps {
  children: ReactNode;
  /** Mode d'affichage (controlled) : `expanded` | `rail` | `hidden`. */
  mode?: SideNavMode;
  /** Mode d'affichage initial (uncontrolled). @default "expanded" */
  defaultMode?: SideNavMode;
  /** Callback déclenché à chaque changement de mode. */
  onModeChange?: (mode: SideNavMode) => void;
  /**
   * Active le raccourci clavier global `Ctrl/Cmd+Shift+E` qui bascule
   * `expanded` ⇄ `rail`. @default true
   */
  enableShortcut?: boolean;
  /**
   * @deprecated Utiliser `mode` (`true` → `"hidden"`, `false` → `"expanded"`).
   * Mode réduit (controlled) — conservé pour rétrocompatibilité.
   */
  isCollapsed?: boolean;
  /**
   * @deprecated Utiliser `defaultMode` (`true` → `"hidden"`).
   * Mode réduit initial (uncontrolled).
   */
  defaultCollapsed?: boolean;
  /**
   * @deprecated Utiliser `onModeChange`. Reçoit `true` quand le mode devient
   * `"hidden"`, `false` sinon.
   */
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
  const { mode, setMode } = useContext(SideNavContext);
  // Le bouton de bascule vit DANS la nav (décision produit). Rendu seulement
  // sous un `SideNav.Provider` (setMode disponible) et hors mode hidden (là,
  // c'est le `SideNav.Trigger` mobile qui rouvre). En rail comme en peek
  // (mode === "rail"), il déploie ; en expanded, il réduit en rail.
  const showToggle = Boolean(setMode) && mode !== "hidden";
  const willExpand = mode === "rail";
  const toggleIcon = willExpand ? "LeftPanelOpen" : "LeftPanelClose";
  const toggleLabel = willExpand
    ? "Déployer la navigation"
    : "Réduire la navigation";

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
      {showToggle && (
        // `title` (tooltip natif avec le raccourci) porté par l'enveloppe : le
        // Button du DS n'expose pas `title` ; l'`aria-label` reste sur le bouton.
        <span className={styles.headerToggle} title={`${toggleLabel} (Ctrl+Shift+E)`}>
          <Button
            appearance="subtle"
            color="subtlest"
            iconBefore={toggleIcon}
            onPress={() => setMode?.(willExpand ? "expanded" : "rail")}
            aria-label={toggleLabel}
          />
        </span>
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
  const { mode } = useContext(SideNavContext);
  const isRail = mode === "rail";

  // En rail, un item sans icône est invisible (seule l'icône est rendue) : on
  // le signale en développement.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && isRail && !iconBefore) {
      // eslint-disable-next-line no-console
      console.warn(
        `SideNav.Item « ${label} » : une icône (\`iconBefore\`) est requise en ` +
          `mode rail — sans elle, l'item est invisible.`,
      );
    }
  }, [isRail, iconBefore, label]);

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
    // En rail, le libellé est masqué : nom accessible obligatoire + tooltip
    // natif au survol. En déployé, le texte visible suffit.
    "aria-label": isRail ? label : undefined,
    title: isRail ? label : undefined,
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
      <Skeleton shape="circle" height={24} decorative />
      <span className={styles.skeletonItemContent}>
        <Skeleton height={12} width="70%" radius={4} decorative />
        {hasDescription && (
          <Skeleton height={10} width="45%" radius={4} decorative />
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
    <div
      className={[styles.section, className].filter(Boolean).join(" ")}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement de la navigation"
    >
      {withHeader && (
        <div className={styles.skeletonHeader}>
          <Skeleton shape="circle" height={32} decorative />
          <span className={styles.skeletonHeaderContent}>
            <Skeleton height={12} width="60%" radius={4} decorative />
            <Skeleton height={10} width="40%" radius={4} decorative />
          </span>
        </div>
      )}
      {withSectionTitle && (
        <div className={styles.skeletonSectionTitle}>
          <Skeleton height={8} width={72} radius={4} decorative />
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
// SideNavTrigger — bouton standalone à placer dans le `leading` d'une Page.Bar

/**
 * SideNav.Trigger — bouton de toggle à placer dans `Page.Bar.leading`.
 * Lit son état depuis le `<SideNav.Provider>` parent (commun avec la
 * `<SideNav>`).
 *
 * @deprecated Sur desktop, le **rail** (mode `"rail"`) remplace ce Trigger : la
 * bascule vit désormais dans la nav (header / tête de rail / header du peek).
 * Réservez `SideNav.Trigger` au cas **`hidden`/mobile** — hamburger dans
 * `Page.Bar.leading` qui rouvre la navigation (voir la story MobileDrawer).
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
 * // Cas mobile : mode "hidden" + hamburger dans la Page.Bar.
 * <SideNav.Provider mode={open ? "expanded" : "hidden"} onModeChange={...}>
 *   <SideNav>...</SideNav>
 *   <Page>
 *     <Page.Bar leading={<SideNav.Trigger />} />
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
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? "Développer la navigation" : "Réduire la navigation"}
      className={className}
    />
  );
}

SideNavTrigger.displayName = "SideNav.Trigger";

// -----------------------------------------------------------------------
// SideNav.Provider — détient le state partagé (isCollapsed, peek)

/**
 * SideNav.Provider — wrapper à placer **au-dessus** de la `<SideNav>` (et, en
 * cas mobile, du `<Page>` qui contient le `<SideNav.Trigger />`). Détient le
 * state partagé (`mode` + peek hover) pour que la nav, la tête de rail et le
 * peek se coordonnent.
 *
 * Mode controlled : passer `mode` + `onModeChange`.
 * Mode uncontrolled : passer `defaultMode` (défaut `"expanded"`).
 * (Alias dépréciés : `isCollapsed`/`defaultCollapsed`/`onCollapsedChange` →
 * mappés sur `"hidden"`.)
 *
 * ### Responsive (recommandation — le DS ne pose aucune media query, l'app décide)
 * - **≥ 1024px** : `expanded` par défaut ; l'utilisateur peut basculer en
 *   `rail` (bouton dans la nav ou `Ctrl/Cmd+Shift+E`), choix **persisté par
 *   l'app**.
 * - **768–1024px** : `rail` recommandé par défaut (wayfinding permanent, place
 *   maximale au contenu).
 * - **< 768px** : `hidden` + hamburger (`SideNav.Trigger`) dans
 *   `Page.Bar.leading`, ouvrant la navigation dans un `Drawer placement="left"`
 *   (recette illustrée par la story *MobileDrawer* — non codée dans le DS).
 *
 * Choisir **rail** pour des utilisateurs quotidiens (repères de navigation
 * toujours visibles) ; **hidden** pour un focus maximal sur le contenu.
 *
 * ```tsx
 * const [mode, setMode] = useState<SideNavMode>("expanded");
 *
 * <SideNav.Provider mode={mode} onModeChange={setMode}>
 *   <div style={{ display: "flex" }}>
 *     <SideNav>
 *       <SideNav.Header logo={<Logo format="icon" />} companyName="…" />
 *       <SideNav.Section title="…">
 *         <SideNav.Item label="Accueil" iconBefore="Home" isSelected href="/" />
 *       </SideNav.Section>
 *     </SideNav>
 *     <Page>…</Page>
 *   </div>
 * </SideNav.Provider>
 * ```
 */
/** Délai de tolérance avant fermeture du peek — évite les fermetures
 *  accidentelles lors d'un déplacement en diagonale (Trigger → nav). */
const PEEK_CLOSE_DELAY_MS = 200;

/** Délai d'intention avant ouverture du peek en mode rail (évite les
 *  déclenchements en simple traversée du rail). */
const PEEK_OPEN_DELAY_MS = 110;

export function SideNavProvider({
  children,
  mode: controlledMode,
  defaultMode,
  onModeChange,
  enableShortcut = true,
  isCollapsed: legacyControlled,
  defaultCollapsed,
  onCollapsedChange,
}: SideNavProviderProps): ReactElement {
  // Mode contrôlé : `mode` prioritaire ; sinon alias booléen déprécié
  // `isCollapsed` (true → hidden). Mode initial (uncontrolled) : `defaultMode`,
  // sinon alias `defaultCollapsed`, sinon "expanded".
  const controlled: SideNavMode | undefined =
    controlledMode ??
    (legacyControlled === undefined
      ? undefined
      : legacyControlled
        ? "hidden"
        : "expanded");
  const initialMode: SideNavMode =
    defaultMode ?? (defaultCollapsed ? "hidden" : "expanded");

  const [internalMode, setInternalMode] = useState<SideNavMode>(initialMode);
  const [triggerHover, setTriggerHover] = useState(false);
  const [navHover, setNavHover] = useState(false);
  const [navFocused, setNavFocused] = useState(false);
  const [peekOpen, setPeekOpen] = useState(false);

  const mode = controlled ?? internalMode;
  const isCollapsed = mode === "hidden";

  const setMode = useCallback(
    (next: SideNavMode) => {
      setInternalMode(next);
      onModeChange?.(next);
      onCollapsedChange?.(next === "hidden");
    },
    [onModeChange, onCollapsedChange],
  );

  // Le peek concerne le rail (survol du rail = survol de la nav) et l'ancien
  // mode hidden (survol du Trigger). Il reste ouvert tant que le pointeur
  // survole le déclencheur OU la nav, ou qu'un focus clavier est dans la nav.
  // Ouverture différée en rail (délai d'intention), fermeture différée dans les
  // deux cas (tolérance). `triggerHover` ne vaut true qu'en mode hidden.
  const canPeek = mode === "rail" || mode === "hidden";
  const wantOpen = triggerHover || navHover || navFocused;

  useEffect(() => {
    if (!canPeek) {
      setPeekOpen(false);
      return undefined;
    }
    if (wantOpen) {
      // Rail : petit délai d'intention avant ouverture. Hidden : immédiat
      // (comportement historique du Trigger).
      if (mode === "rail" && !peekOpen) {
        const openTimer = setTimeout(() => setPeekOpen(true), PEEK_OPEN_DELAY_MS);
        return () => clearTimeout(openTimer);
      }
      setPeekOpen(true);
      return undefined;
    }
    const timer = setTimeout(() => setPeekOpen(false), PEEK_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [wantOpen, canPeek, mode, peekOpen]);

  // Legacy : le Trigger bascule hidden ⇄ expanded.
  const onToggleCollapse = useCallback(() => {
    setMode(isCollapsed ? "expanded" : "hidden");
  }, [isCollapsed, setMode]);

  // Raccourci clavier global : Ctrl/Cmd+Shift+E bascule expanded ⇄ rail.
  useEffect(() => {
    if (!enableShortcut) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        setMode(mode === "expanded" ? "rail" : "expanded");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, mode, setMode]);

  // Fermeture immédiate (clic sur un item → navigation). On remet aussi les
  // drapeaux hover/focus à zéro pour que l'overlay reste fermé tant que le
  // pointeur ne quitte pas puis ne revient pas sur la nav.
  const closePeek = useCallback(() => {
    setTriggerHover(false);
    setNavHover(false);
    setNavFocused(false);
    setPeekOpen(false);
  }, []);

  const isPeeking = canPeek && peekOpen;

  // Valeur de contexte mémoïsée : le Provider re-render à chaque micro-changement
  // d'état hover/focus pendant un survol — sans ça, tous les consommateurs
  // (`SideNav`, `SideNav.Trigger`, `useSideNav`) re-render à chaque frame.
  const value = useMemo(
    () => ({
      mode,
      setMode,
      isCollapsed,
      onToggleCollapse,
      isPeeking,
      setTriggerHover,
      setNavHover,
      setNavFocused,
      closePeek,
    }),
    [mode, setMode, isCollapsed, onToggleCollapse, isPeeking, closePeek],
  );

  return (
    <SideNavContext.Provider value={value}>{children}</SideNavContext.Provider>
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
  "aria-label": ariaLabel = "Navigation principale",
}: SideNavProps): ReactElement {
  const { mode, isCollapsed, isPeeking, setNavHover, setNavFocused, closePeek } =
    useContext(SideNavContext);

  // Header et Footer restent épinglés en haut/bas ; tout le reste (sections +
  // items) est regroupé dans un corps qui défile (overflow-y: auto). On
  // partitionne les enfants pour ne pas imposer de wrapper au consommateur —
  // l'API composable (Header + sections + Footer) reste inchangée.
  const { header, footer, body } = useMemo(() => {
    const items = Children.toArray(children);
    const isType = (child: ReactNode, type: unknown) =>
      isValidElement(child) && child.type === type;
    return {
      header: items.filter((c) => isType(c, SideNavHeader)),
      footer: items.filter((c) => isType(c, SideNavFooter)),
      body: items.filter(
        (c) => !isType(c, SideNavHeader) && !isType(c, SideNavFooter),
      ),
    };
  }, [children]);

  // Fermeture du peek au clic sur un item : écouteur natif délégué sur la nav
  // (plutôt qu'un `onClick` JSX, qui violerait les règles jsx-a11y sur un
  // élément non-interactif). Actif uniquement quand la nav est en overlay.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el || !isPeeking) return undefined;
    // Clic sur un item → navigation puis fermeture du peek.
    const onClick = () => closePeek?.();
    // Échap → fermeture du peek.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePeek?.();
    };
    el.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isPeeking, closePeek]);

  return (
    <div
      className={styles.container}
      data-mode={mode}
      data-collapsed={isCollapsed || undefined}
      style={style}
    >
      <nav
        ref={navRef}
        aria-label={ariaLabel}
        className={[styles.sideNav, className].filter(Boolean).join(" ")}
        data-mode={mode}
        data-collapsed={isCollapsed || undefined}
        data-peeking={isPeeking || undefined}
        /* En collapsed, la nav est un overlay non focusable/non cliquable tant
           qu'elle n'est pas en peek (pointer-events: none + visibility: hidden
           via le CSS) — ces handlers ne s'y déclenchent donc pas. En peek, ils
           maintiennent l'overlay ouvert tant que le pointeur OU le focus
           clavier y sont. Le clic sur un item (fermeture du peek) est géré par
           un écouteur natif via `navRef`. */
        onMouseEnter={() => setNavHover?.(true)}
        onMouseLeave={() => setNavHover?.(false)}
        onFocusCapture={() => setNavFocused?.(true)}
        onBlurCapture={(e) => {
          // Ne remet à false que si le focus quitte réellement la nav (pas un
          // simple déplacement entre items).
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setNavFocused?.(false);
          }
        }}
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
