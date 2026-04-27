// Heading — Comète Design System
// Titres sémantiques pour structurer le contenu (h1–h6).
import type { ReactElement, ReactNode } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Heading.module.css";

// -----------------------------------------------------------------------
// Types publics

export type HeadingSize =
  | "xxlarge" | "xlarge" | "large" | "medium" | "small" | "xsmall" | "xxsmall";

export type HeadingColor = "default" | "inverse";

export type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

export interface HeadingProps {
  /** Taille visuelle. Détermine aussi la balise HTML par défaut. */
  size: HeadingSize;
  /** Couleur du titre. @default "default" */
  color?: HeadingColor;
  /** Override la balise HTML déduite de la taille. */
  as?: HeadingAs;
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

const DEFAULT_AS: Record<HeadingSize, HeadingAs> = {
  xxlarge: "h1",
  xlarge: "h1",
  large: "h2",
  medium: "h3",
  small: "h4",
  xsmall: "h5",
  xxsmall: "h6",
};

// -----------------------------------------------------------------------
// Composant

/**
 * Heading — Comète Design System
 *
 * Titre sémantique. Chaque `size` mappe automatiquement vers une balise
 * HTML h1–h6. Utilisez `as` pour découpler le style de la hiérarchie HTML.
 *
 * ```tsx
 * import { Heading } from "@naxit/comete-design-system";
 *
 * <Heading size="xxlarge">Titre de page</Heading>
 * <Heading size="medium">Sous-section</Heading>
 * <Heading size="xxlarge" as="h2">Style xxlarge, sémantique h2</Heading>
 * ```
 */
export function Heading({
  size,
  color = "default",
  as,
  noWrap = false,
  children,
  className,
  grow = false,
  id,
  style,
}: HeadingProps): ReactElement {
  const Component = as ?? DEFAULT_AS[size];
  const cssKey = `heading-${size}` as keyof typeof typographyStyles;

  const classNames = [
    styles.heading,
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

Heading.displayName = "Heading";
