// SideNav — Comete Design System
import { Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
// Context partagé (couvre SideNav + SideNavHeader)

/**
 * Mode d'affichage de la navigation latérale — **desktop uniquement**
 * (≥ 1200px, le breakpoint `lg` de `BREAKPOINTS`).
 * - `expanded` — panneau complet 240px (logo + libellés + sections nommées).
 * - `rail` — rail 80px : icône + libellé court dessous.
 *
 * À ce format la navigation ne disparaît **jamais** et ne s'agrandit **jamais
 * au survol** : on passe de l'un à l'autre par le bouton de bascule de l'en-tête
 * ou par `Ctrl/Cmd+Shift+E`.
 *
 * **Sous 1200px (tablette comprise), il n'y a pas de nav permanente.** La
 * tablette suit la règle du mobile web : l'app affiche la nav dans un `Drawer`
 * (`placement="left"`), par-dessus le contenu, derrière un hamburger. Une
 * tablette n'a pas la largeur d'un rail de 80px ET d'un contenu confortable.
 * En **app mobile**, il n'y a pas de SideNav du tout (la `BottomNav` porte
 * seule la navigation).
 */
export type SideNavMode = "expanded" | "rail";

interface SideNavContextValue {
  /** Mode d'affichage courant. */
  mode: SideNavMode;
  /** Change le mode (déployer / réduire en rail). Absent hors `SideNav.Provider`. */
  setMode?: (mode: SideNavMode) => void;
}

const SideNavContext = createContext<SideNavContextValue>({
  mode: "expanded",
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
  /** Mode d'affichage (controlled) : `expanded` | `rail`. */
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
}

export interface SideNavHeaderProps {
  /** Logo affiché à gauche. */
  logo?: ReactNode;
  /** Nom de la société / application. */
  companyName?: string;
  /** Description courte sous le nom. */
  description?: string;
  className?: string;
  /**
   * Affiche le bouton de bascule `expanded` ⇄ `rail` (rendu seulement sous un
   * `SideNav.Provider`). À désactiver quand la nav n'a pas de rail — par exemple
   * dans un `Drawer` sur mobile web. @default true
   */
  showToggle?: boolean;
}

export interface SideNavItemProps {
  /** Libellé principal de l'item. */
  label: string;
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
  /** Intitulé de la section, affiché en mode `expanded`. */
  title?: string;
  /**
   * Intitulé **abrégé**, utilisé à la place de `title` en mode `rail`.
   *
   * Le rail ne laisse qu'une soixantaine de pixels utiles : un intitulé un peu
   * long y est tronqué, et aucune taille de police lisible n'y change quoi que
   * ce soit (« ADMINISTRATION » déborde encore à 8px). On raccourit donc le mot
   * plutôt que de le rapetisser — « Administration » → « Admin ».
   *
   * Absent, le `title` est utilisé tel quel et peut se tronquer. Quand les deux
   * diffèrent, l'intitulé complet reste disponible en infobulle native, comme
   * pour les libellés d'items réduits.
   *
   * **Quel levier choisir** — les deux sont complémentaires :
   * - l'intitulé dépasse de beaucoup (un mot long) → `shortTitle` ;
   * - il ne dépasse que de quelques pixels (« MANAGER ») → réduire
   *   `--sidenav-section-heading-size`, qui laisse le libellé intact.
   */
  shortTitle?: string;
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

// -----------------------------------------------------------------------
// SideNavHeader

export function SideNavHeader({
  logo,
  companyName,
  description,
  className,
  showToggle: showToggleProp = true,
}: SideNavHeaderProps): ReactElement {
  const { mode, setMode } = useContext(SideNavContext);
  // Le bouton de bascule vit DANS la nav (décision produit). Rendu seulement sous
  // un `SideNav.Provider` (setMode disponible) et si `showToggle` n'est pas
  // désactivé. En rail, il déploie ; en expanded, il réduit en rail.
  const showToggle = showToggleProp && Boolean(setMode);
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

  // En rail, l'icône est l'élément principal (libellé court dessous) : un item
  // sans icône y serait mal aligné et illisible — on le signale en développement.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && isRail && !iconBefore) {
      // eslint-disable-next-line no-console
      console.warn(
        `SideNav.Item « ${label} » : une icône (\`iconBefore\`) est requise en ` +
          `mode rail — sans elle, l'item est mal aligné.`,
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
    // En rail, le libellé (10px) est visible mais peut être tronqué : tooltip natif
    // avec le libellé complet. Le nom accessible vient du texte visible.
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
  shortTitle,
  children,
  className,
}: SideNavSectionProps): ReactElement {
  const { mode } = useContext(SideNavContext);
  // En rail, on affiche l'abrégé s'il existe — raccourcir le mot plutôt que de
  // le rapetisser. L'intitulé complet reste en infobulle quand il diffère.
  const isRail = mode === "rail";
  const heading = isRail && shortTitle ? shortTitle : title;
  const fullTitle = isRail && shortTitle && title !== shortTitle ? title : undefined;

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      {heading && (
        <div
          className={styles.sectionHeading}
          {...(fullTitle ? { title: fullTitle } : {})}
        >
          {heading}
        </div>
      )}
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
  className,
}: SideNavItemSkeletonProps): ReactElement {
  return (
    <div className={[styles.skeletonItem, className].filter(Boolean).join(" ")}>
      <Skeleton shape="circle" height={24} decorative />
      <span className={styles.skeletonItemContent}>
        <Skeleton height={12} width="70%" radius={4} decorative />
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
// SideNav.Provider — détient le mode (expanded / rail)

/**
 * SideNav.Provider — wrapper à placer **au-dessus** de la `<SideNav>`. Détient le
 * mode d'affichage partagé entre la nav et son bouton de bascule.
 *
 * Mode controlled : passer `mode` + `onModeChange`.
 * Mode uncontrolled : passer `defaultMode` (défaut `"expanded"`).
 *
 * ### Règles par plateforme (le DS ne pose aucune media query, l'app décide)
 * - **App mobile** : **pas de SideNav** — la `BottomNav` porte seule la
 *   navigation.
 * - **Mobile navigateur web ET tablette (< 1200px)** : la SideNav passe
 *   **par-dessus** le viewport, dans un `Drawer placement="left"` ouvert par un
 *   bouton hamburger (`Page.Bar.leading`) ; elle ne pousse jamais le contenu.
 *   Dans le Drawer, utiliser `<SideNav.Header showToggle={false} />` — il n'y a
 *   pas de rail à ce format. La tablette suit **exactement** la règle du mobile
 *   web : elle n'a pas la largeur d'un rail de 80px ET d'un contenu confortable.
 * - **Desktop (≥ 1200px, breakpoint `lg`)** : la nav est **permanente** et ne
 *   disparaît jamais. `expanded` (240px) ou **`rail` (80px)** ; le rail est
 *   **fixe** : il ne s'agrandit pas au survol, on bascule par le bouton de la
 *   nav ou `Ctrl/Cmd+Shift+E` (`expanded` ⇄ `rail`, choix **persisté par
 *   l'app**). Défaut conseillé : `expanded`.
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
export function SideNavProvider({
  children,
  mode: controlledMode,
  defaultMode = "expanded",
  onModeChange,
  enableShortcut = true,
}: SideNavProviderProps): ReactElement {
  const [internalMode, setInternalMode] = useState<SideNavMode>(defaultMode);
  const mode = controlledMode ?? internalMode;

  const setMode = useCallback(
    (next: SideNavMode) => {
      setInternalMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

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

  // Valeur de contexte mémoïsée : évite de re-render tous les consommateurs
  // (`SideNav`, `SideNav.Header`, `useSideNav`) à chaque rendu du Provider.
  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

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
 * Navigation latérale composable, **permanente sur desktop** (≥ 1200px) :
 * `expanded` (240px) ou `rail` (80px), jamais masquée et jamais agrandie au
 * survol. Sous 1200px (tablette comprise), l'app l'affiche dans un `Drawer`
 * plutôt que de la rendre en permanence. Lit son mode depuis le
 * `<SideNav.Provider>` parent — à placer à l'intérieur de celui-ci.
 *
 * ```tsx
 * <SideNav.Provider>
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
  const { mode } = useContext(SideNavContext);

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

  return (
    <div className={styles.container} data-mode={mode} style={style}>
      <nav
        aria-label={ariaLabel}
        className={[styles.sideNav, className].filter(Boolean).join(" ")}
        data-mode={mode}
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
SideNav.Provider = SideNavProvider;
