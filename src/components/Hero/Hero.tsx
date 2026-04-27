// Hero — Comète Design System
// Texte d'accroche à très grande échelle (marketing, Homes, landing).
import type { ReactElement, ReactNode } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Hero.module.css";

// -----------------------------------------------------------------------
// Types publics

export type HeroSize =
  | "xxlarge" | "xlarge" | "large" | "medium" | "small" | "xsmall" | "xxsmall";

export type HeroColor = "default" | "inverse";

export type HeroAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

export interface HeroProps {
  /** Taille visuelle. Détermine aussi la balise HTML par défaut. */
  size: HeroSize;
  /** Couleur du texte. @default "default" */
  color?: HeroColor;
  /** Override la balise HTML déduite de la taille. */
  as?: HeroAs;
  /** Empêche le retour à la ligne (white-space: nowrap). @default false */
  noWrap?: boolean;
  /** Contenu textuel. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Prend tout l'espace disponible (flex: 1). @default false */
  grow?: boolean;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
  /** Identifiant HTML. */
  id?: string;
}

// -----------------------------------------------------------------------
// Mapping size → balise HTML par défaut

const DEFAULT_AS: Record<HeroSize, HeroAs> = {
  xxlarge: "h1",
  xlarge: "h1",
  large: "h1",
  medium: "h1",
  small: "h2",
  xsmall: "h2",
  xxsmall: "h2",
};

// -----------------------------------------------------------------------
// Composant

/**
 * Hero — Comète Design System
 *
 * Texte d'accroche à très grande échelle. Réservé aux pages marketing,
 * Homes de métriques clés ou écrans de bienvenue.
 *
 * ```tsx
 * import { Hero } from "@naxit/comete-design-system";
 *
 * <Hero size="xxlarge">Donnez vie à vos données.</Hero>
 * <Hero size="small">Chiffre clé du mois</Hero>
 * ```
 */
export function Hero({
  size,
  color = "default",
  as,
  noWrap = false,
  children,
  className,
  grow = false,
  id,
  style,
}: HeroProps): ReactElement {
  const Component = as ?? DEFAULT_AS[size];
  const cssKey = `hero-${size}` as keyof typeof typographyStyles;

  const classNames = [
    styles.hero,
    typographyStyles[cssKey],
    styles[`color-${color}` as keyof typeof styles],
    noWrap ? styles.noWrap : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = grow ? { flex: 1, minWidth: 0, ...style } : style;

  return (
    <Component className={classNames} id={id} style={mergedStyle}>
      {children}
    </Component>
  );
}

Hero.displayName = "Hero";
