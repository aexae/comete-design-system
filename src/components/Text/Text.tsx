// Text — Comète Design System
// Texte courant : paragraphes, descriptions, libellés.
import type { ReactElement, ReactNode, CSSProperties } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Text.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TextSize = "large" | "medium" | "small" | "xsmall";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor =
  | "default" | "subtle" | "subtlest" | "disabled" | "inverted"
  | "brand" | "accent" | "success" | "information" | "warning" | "critical" | "link";
export type TextAlign = "start" | "center" | "end";
export type TextAs = "p" | "span" | "strong" | "em" | "label" | "div";

export interface TextProps {
  /** Taille du texte. @default "medium" */
  size?: TextSize;
  /** Graisse. @default "regular" */
  weight?: TextWeight;
  /** Couleur du texte. @default "default" */
  color?: TextColor;
  /** Alignement du texte. */
  align?: TextAlign;
  /** Applique un soulignement. @default false */
  underline?: boolean;
  /** Applique une mise en italique. @default false */
  italic?: boolean;
  /** Empêche le retour à la ligne (white-space: nowrap). @default false */
  noWrap?: boolean;
  /** Limite le nombre de lignes avec troncature (ellipsis). */
  maxLines?: number;
  /** Balise HTML. @default "p" */
  as?: TextAs;
  /** Contenu textuel. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Identifiant HTML. */
  id?: string;
  /** Prend tout l'espace disponible (flex: 1). @default false */
  grow?: boolean;
  /** Style inline. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Text — Comète Design System
 *
 * Texte courant pour les paragraphes, descriptions, libellés et contenu
 * de longueur variable. La taille par défaut est `medium` (14px).
 *
 * ```tsx
 * import { Text } from "@naxit/comete-design-system";
 *
 * <Text>Paragraphe par défaut</Text>
 * <Text size="large" weight="bold">Texte accentué</Text>
 * <Text size="small" color="subtle">Métadonnée</Text>
 * <Text maxLines={2}>Texte tronqué à 2 lignes…</Text>
 * ```
 */
export function Text({
  size = "medium",
  weight = "regular",
  color = "default",
  align,
  underline,
  italic,
  noWrap = false,
  maxLines,
  as: Component = "p",
  children,
  className,
  id,
  grow = false,
  style,
}: TextProps): ReactElement {
  const cssKey = `text-${size}-${weight}` as keyof typeof typographyStyles;

  const classNames = [
    styles.text,
    typographyStyles[cssKey],
    styles[`color-${color}` as keyof typeof styles],
    align ? styles[`align-${align}` as keyof typeof styles] : undefined,
    underline ? styles.underline : undefined,
    italic ? styles.italic : undefined,
    noWrap ? styles.noWrap : undefined,
    maxLines ? styles.truncate : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = {
    ...(grow && { flex: 1, minWidth: 0 }),
    ...(maxLines ? { WebkitLineClamp: maxLines } : undefined),
    ...style,
  } as CSSProperties;

  return (
    <Component className={classNames} style={mergedStyle} id={id}>
      {children}
    </Component>
  );
}

Text.displayName = "Text";
