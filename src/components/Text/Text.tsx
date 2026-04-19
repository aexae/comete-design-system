// Text — Comète Design System
// Composant typographique unifié : applique le bon style ET la bonne balise HTML.
import type { ReactElement, ReactNode, ElementType, HTMLAttributes } from "react";
import typographyStyles from "../../styles/typography.module.css";
import styles from "./Text.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TextType = "hero" | "heading" | "body" | "code";

export type HeroVariant =
  | "xxl" | "xxl-semibold"
  | "xl" | "xl-semibold"
  | "l" | "l-semibold"
  | "m" | "m-bold"
  | "s" | "s-bold"
  | "xs" | "xs-bold"
  | "xxs" | "xxs-bold";

export type HeadingVariant =
  | "xxl" | "xxl-bold"
  | "xl" | "xl-bold"
  | "l" | "l-bold"
  | "m" | "m-bold"
  | "s" | "s-bold"
  | "xs" | "xs-bold"
  | "xxs" | "xxs-bold";

export type BodyVariant =
  | "l" | "l-medium" | "l-bold"
  | "m" | "m-medium" | "m-bold"
  | "s" | "s-medium" | "s-bold"
  | "xs" | "xs-bold"
  | "label";

export type CodeVariant = "value" | "operator" | "label";

export type TextVariant = HeroVariant | HeadingVariant | BodyVariant | CodeVariant;

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

// -----------------------------------------------------------------------
// Props — union discriminée par type

interface TextPropsBase extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  /** Couleur du texte. @default "default" */
  color?: TextColor;
  /** Alignement du texte. */
  align?: TextAlign;
  /** Applique un soulignement. @default false */
  underline?: boolean;
  /** Applique une mise en italique. @default false */
  italic?: boolean;
  /** Override la balise HTML par défaut déduite du type + variante. */
  as?: ElementType;
  /** Contenu textuel. */
  children?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

interface HeroTextProps extends TextPropsBase {
  /** Famille typographique. */
  type: "hero";
  /** Variante de taille/poids. */
  variant: HeroVariant;
}

interface HeadingTextProps extends TextPropsBase {
  /** Famille typographique. */
  type: "heading";
  /** Variante de taille/poids. */
  variant: HeadingVariant;
}

interface BodyTextProps extends TextPropsBase {
  /** Famille typographique. */
  type: "body";
  /** Variante de taille/poids. */
  variant: BodyVariant;
}

interface CodeTextProps extends TextPropsBase {
  /** Famille typographique. */
  type: "code";
  /** Variante de taille/poids. */
  variant: CodeVariant;
}

export type TextProps = HeroTextProps | HeadingTextProps | BodyTextProps | CodeTextProps;

// -----------------------------------------------------------------------
// Mapping (type, variant) → balise HTML par défaut

const DEFAULT_ELEMENT_MAP: Record<string, Record<string, ElementType>> = {
  hero: {
    xxl: "h1", "xxl-semibold": "h1",
    xl: "h1", "xl-semibold": "h1",
    l: "h1", "l-semibold": "h1",
    m: "h1", "m-bold": "h1",
    s: "h2", "s-bold": "h2",
    xs: "h2", "xs-bold": "h2",
    xxs: "h2", "xxs-bold": "h2",
  },
  heading: {
    xxl: "h1", "xxl-bold": "h1",
    xl: "h2", "xl-bold": "h2",
    l: "h3", "l-bold": "h3",
    m: "h4", "m-bold": "h4",
    s: "h5", "s-bold": "h5",
    xs: "h6", "xs-bold": "h6",
    xxs: "h6", "xxs-bold": "h6",
  },
  body: {
    l: "p", "l-medium": "p", "l-bold": "p",
    m: "p", "m-medium": "p", "m-bold": "p",
    s: "p", "s-medium": "p", "s-bold": "p",
    xs: "p", "xs-bold": "p",
    label: "span",
  },
  code: {
    value: "code",
    operator: "code",
    label: "code",
  },
};

// -----------------------------------------------------------------------
// Résolution clé CSS

function resolveCssKey(type: TextType, variant: string): string {
  if (type === "body" && variant === "label") return "label";
  return `${type}-${variant}`;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Text — Comète Design System
 *
 * Composant typographique unifié. Applique automatiquement le style de texte
 * et la balise HTML sémantique correspondant au type + variante.
 *
 * ```tsx
 * import { Text } from "@naxit/comete-design-system";
 *
 * <Text type="heading" variant="xxl">Titre de page</Text>
 * <Text type="body" variant="m" color="subtle">Description</Text>
 * <Text type="body" variant="m" underline>Lien souligné</Text>
 * <Text type="code" variant="value">const x = 1</Text>
 * ```
 */
export function Text({
  type,
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
  const Component: ElementType = as ?? DEFAULT_ELEMENT_MAP[type]?.[variant] ?? "span";
  const cssKey = resolveCssKey(type, variant);

  const classNames = [
    styles.text,
    typographyStyles[cssKey as keyof typeof typographyStyles],
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
