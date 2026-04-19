// Text — Comète Design System
// Composant typographique unifié : applique le bon style ET la bonne balise HTML.
import type { ReactElement, ReactNode, ElementType, HTMLAttributes } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Text.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TextVariant =
  | "hero-xxl"
  | "hero-xl"
  | "hero-l"
  | "hero-m"
  | "hero-s"
  | "hero-xs"
  | "hero-xxs"
  | "heading-h1"
  | "heading-h2"
  | "heading-h3"
  | "heading-h4"
  | "heading-h5"
  | "body-l"
  | "body-l-medium"
  | "body-m"
  | "body-m-medium"
  | "body-s"
  | "body-s-medium"
  | "label"
  | "code-m"
  | "code-s";

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
  "hero-xxl": "h1",
  "hero-xl": "h1",
  "hero-l": "h1",
  "hero-m": "h1",
  "hero-s": "h2",
  "hero-xs": "h2",
  "hero-xxs": "h2",
  "heading-h1": "h1",
  "heading-h2": "h2",
  "heading-h3": "h3",
  "heading-h4": "h4",
  "heading-h5": "h5",
  "body-l": "p",
  "body-l-medium": "p",
  "body-m": "p",
  "body-m-medium": "p",
  "body-s": "p",
  "body-s-medium": "p",
  label: "span",
  "code-m": "code",
  "code-s": "code",
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
 * <Text variant="label" color="subtlest" align="center">ÉTIQUETTE</Text>
 * ```
 */
export function Text({
  variant,
  color = "default",
  align,
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
