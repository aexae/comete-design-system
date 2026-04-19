// Text — Comète Design System
// Composant typographique unifié : applique le bon style ET la bonne balise HTML.
import type { ReactElement, ReactNode, ElementType, HTMLAttributes } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Text.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TextVariant =
  // Hero — Bold (default)
  | "hero-xxl"
  | "hero-xl"
  | "hero-l"
  | "hero-m"
  | "hero-s"
  | "hero-xs"
  | "hero-xxs"
  // Hero — Semibold / Bold alternés
  | "hero-xxl-semibold"
  | "hero-xl-semibold"
  | "hero-l-semibold"
  | "hero-m-bold"
  | "hero-s-bold"
  | "hero-xs-bold"
  | "hero-xxs-bold"
  // Heading — Semibold (default)
  | "heading-h1"
  | "heading-h2"
  | "heading-h3"
  | "heading-h4"
  | "heading-h5"
  | "heading-xs"
  | "heading-xxs"
  // Heading — Bold
  | "heading-h1-bold"
  | "heading-h2-bold"
  | "heading-h3-bold"
  | "heading-h4-bold"
  | "heading-h5-bold"
  | "heading-xs-bold"
  | "heading-xxs-bold"
  // Body
  | "body-l"
  | "body-l-medium"
  | "body-l-bold"
  | "body-m"
  | "body-m-medium"
  | "body-m-bold"
  | "body-s"
  | "body-s-medium"
  | "body-s-bold"
  | "body-xs"
  | "body-xs-bold"
  // Label
  | "label"
  // Code
  | "code-value"
  | "code-operator"
  | "code-label";

export type TextColor =
  | "default"
  | "subtle"
  | "subtlest"
  | "disabled"
  | "inverted"
  | "brand"
  | "accent"
  | "success"
  | "information"
  | "warning"
  | "critical"
  | "link";

export type TextAlign = "left" | "center" | "right";

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  /** Style typographique à appliquer. Détermine aussi la balise HTML par défaut. */
  variant: TextVariant;
  /** Couleur du texte. @default "default" */
  color?: TextColor;
  /** Alignement du texte. */
  align?: TextAlign;
  /** Applique un soulignement. @default false */
  underline?: boolean;
  /** Applique une mise en italique. @default false */
  italic?: boolean;
  /** Override la balise HTML par défaut déduite de la variante. */
  as?: ElementType;
  /** Contenu textuel. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Mapping variante → balise HTML par défaut

const DEFAULT_ELEMENT_MAP: Record<TextVariant, ElementType> = {
  // Hero
  "hero-xxl": "h1",
  "hero-xl": "h1",
  "hero-l": "h1",
  "hero-m": "h1",
  "hero-s": "h2",
  "hero-xs": "h2",
  "hero-xxs": "h2",
  "hero-xxl-semibold": "h1",
  "hero-xl-semibold": "h1",
  "hero-l-semibold": "h1",
  "hero-m-bold": "h1",
  "hero-s-bold": "h2",
  "hero-xs-bold": "h2",
  "hero-xxs-bold": "h2",
  // Heading
  "heading-h1": "h1",
  "heading-h2": "h2",
  "heading-h3": "h3",
  "heading-h4": "h4",
  "heading-h5": "h5",
  "heading-xs": "h6",
  "heading-xxs": "h6",
  "heading-h1-bold": "h1",
  "heading-h2-bold": "h2",
  "heading-h3-bold": "h3",
  "heading-h4-bold": "h4",
  "heading-h5-bold": "h5",
  "heading-xs-bold": "h6",
  "heading-xxs-bold": "h6",
  // Body
  "body-l": "p",
  "body-l-medium": "p",
  "body-l-bold": "p",
  "body-m": "p",
  "body-m-medium": "p",
  "body-m-bold": "p",
  "body-s": "p",
  "body-s-medium": "p",
  "body-s-bold": "p",
  "body-xs": "p",
  "body-xs-bold": "p",
  // Label
  label: "span",
  // Code
  "code-value": "code",
  "code-operator": "code",
  "code-label": "code",
};

// -----------------------------------------------------------------------
// Composant

/**
 * Text — Comète Design System
 *
 * Composant typographique unifié. Applique automatiquement le style de texte
 * et la balise HTML sémantique correspondant à la variante choisie.
 *
 * ```tsx
 * import { Text } from "@naxit/comete-design-system";
 *
 * <Text variant="heading-h1">Titre de page</Text>
 * <Text variant="body-m" color="subtle">Description secondaire</Text>
 * <Text variant="body-m" underline>Lien souligné</Text>
 * <Text variant="body-m" italic>Texte en italique</Text>
 * ```
 */
export function Text({
  variant,
  color = "default",
  align,
  underline,
  italic,
  as,
  children,
  className,
  ...rest
}: TextProps): ReactElement {
  const Component = as ?? DEFAULT_ELEMENT_MAP[variant];

  const classNames = [
    styles.text,
    typographyStyles[variant],
    styles[`color-${color}` as keyof typeof styles],
    align ? styles[`align-${align}` as keyof typeof styles] : undefined,
    underline ? styles.underline : undefined,
    italic ? styles.italic : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames} {...rest}>
      {children}
    </Component>
  );
}

Text.displayName = "Text";
