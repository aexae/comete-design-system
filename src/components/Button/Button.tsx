import React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { forwardRef } from "react";
import type { IconColor, IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { useInputContext } from "../../contexts/InputContext.js";
import { useDensity, type Density } from "../../contexts/DensityContext.js";
import styles from "./Button.module.css";

// ----------------------------------------------------------------------

export type ButtonAppearance = "contained" | "outlined" | "subtle" | "link" | "link-subtle";
export type ButtonColor = "default" | "subtle" | "subtlest" | "brand" | "success" | "critical" | "warning" | "information";
/**
 * Densité — dimension + padding + radius, échelle partagée avec les champs.
 * - `compact` — hauteur 24 px, radius 4 px, padding 0/4, icône 20 px (desktop dense)
 * - `default` — hauteur 32 px, radius 6 px, padding 4/8, icône 24 px (desktop standard)
 * - `touch`   — hauteur 48 px, radius 8 px, padding 8/12, icône 24 px (mobile / cible tactile)
 *
 * @see {@link Density} et `DensityProvider` pour régler la densité globalement.
 */
export type ButtonDensity = Density;

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  /** Visual appearance. @default "contained" */
  appearance?: ButtonAppearance;
  /** Color scheme. @default "default" */
  color?: ButtonColor;
  /**
   * Densité — dimension + padding + radius (échelle partagée avec les champs).
   * Si non fournie, hérite d'un `DensityProvider`, sinon `"default"`.
   */
  density?: ButtonDensity;
  /**
   * Composition inline — supprime padding et hauteur minimale, pour un bouton
   * `link`/`link-subtle` inséré dans un paragraphe (évite tout espace
   * disgracieux dans le texte). Ignore `density`. @default false
   */
  isInline?: boolean;
  /** Icon name displayed before the label. Color is automatically resolved from appearance + color. */
  iconBefore?: IconName;
  /** Icon name displayed after the label. Color is automatically resolved from appearance + color. */
  iconAfter?: IconName;
  /** Affiche un spinner et désactive les interactions. @default false */
  isLoading?: boolean;
  /** État sélectionné/actif — applique un style visuel persistant. @default false */
  isSelected?: boolean;
  /** Étire le bouton sur toute la largeur du parent. @default false */
  isFullWidth?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
  /** Label du bouton. Optionnel pour un bouton icon-only. */
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------

/**
 * Resolves the icon color token appropriate for a given button appearance + color.
 * Mirrors the Button CSS: bold backgrounds (contained.brand, .success, .critical,
 * .information) use inverted text; all other combinations use semantic colors.
 *
 * @param appearance - Button visual appearance
 * @param color      - Button color scheme
 * @returns The matching IconColor token
 */
function resolveIconColor(appearance: ButtonAppearance, color: ButtonColor): IconColor {
  if (appearance === "link-subtle") return "subtle";

  if (appearance === "contained") {
    if (color === "subtle" || color === "subtlest") return color;
    // NOTE: warning bold background is light/yellow — needs dark icons, not white
    if (color === "warning") return "on-warning";
    // brand, success, critical, information render bold backgrounds with inverted (white) text
    const invertedColors: readonly ButtonColor[] = ["brand", "success", "critical", "information"];
    return invertedColors.includes(color) ? "inverted" : "default";
  }

  // outlined, subtle, link: icon follows the semantic color of the button text
  const semanticColorMap: Record<ButtonColor, IconColor> = {
    default: "default",
    subtle: "subtle",
    subtlest: "subtlest",
    brand: "brand",
    success: "success",
    critical: "critical",
    warning: "warning",
    information: "information",
  };
  return semanticColorMap[color];
}

// ----------------------------------------------------------------------

/**
 * Button — Comète Design System
 *
 * Built on React Aria for accessibility (keyboard, focus, ARIA).
 * Styled with CSS Modules consuming @aexae/comete-design-tokens.
 * Icon color is automatically resolved from the button appearance + color.
 *
 * ```tsx
 * import { Button } from "@aexae/comete-design-system";
 *
 * <Button color="brand">Enregistrer</Button>
 * <Button appearance="outlined" color="critical" iconBefore="Delete">
 *   Supprimer
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      appearance = "contained",
      color = "default",
      density,
      isInline = false,
      iconBefore,
      iconAfter,
      isLoading = false,
      isSelected = false,
      isFullWidth = false,
      className,
      style,
      children,
      ...ariaProps
    },
    ref
  ) => {
    // Hériter isDisabled du InputContext si pas passé explicitement
    const inputCtx = useInputContext();
    const effectiveDisabled =
      ariaProps.isDisabled ?? inputCtx?.isDisabled ?? false;

    // Map appearance to CSS class (handles kebab-case "link-subtle")
    const appearanceClassMap: Record<ButtonAppearance, string> = {
      contained: styles.contained,
      outlined: styles.outlined,
      subtle: styles.subtle,
      link: styles.link,
      "link-subtle": styles["link-subtle"],
    };
    const appearanceClass = appearanceClassMap[appearance];

    // Map color to CSS class
    const colorClassMap: Record<ButtonColor, string> = {
      default: styles.default,
      subtle: styles["color-subtle"],
      subtlest: styles["color-subtlest"],
      brand: styles.brand,
      success: styles.success,
      critical: styles.critical,
      warning: styles.warning,
      information: styles.information,
    };
    const colorClass = colorClassMap[color];

    // Densité → classe CSS (height, padding, radius, icon size).
    // Priorité : prop `density` > contexte (DensityProvider) > "default".
    // `isInline` reste un cas spécial (composition inline sans densité).
    const resolvedDensity = useDensity(density);
    const densityClassMap: Record<Density, string> = {
      compact: styles.densityCompact,
      default: styles.densityDefault,
      touch: styles.densityTouch,
    };
    const spacingClass = isInline
      ? styles.inline
      : densityClassMap[resolvedDensity];

    // NOTE: icon-only when icon is present but children is empty/null/undefined
    const isIconOnly =
      (iconBefore !== undefined || iconAfter !== undefined) &&
      (children === null || children === undefined || children === "");

    const classNames = [
      styles.button,
      appearanceClass,
      colorClass,
      spacingClass,
      isIconOnly ? styles.iconOnly : undefined,
      isLoading ? styles.loading : undefined,
      isFullWidth ? styles.fullWidth : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconColor = resolveIconColor(appearance, color);

    return (
      <AriaButton
        ref={ref}
        className={classNames}
        style={style}
        isDisabled={isLoading || effectiveDisabled}
        data-selected={isSelected || undefined}
        {...ariaProps}
      >
        {isLoading ? (
          <span className={styles.spinner} aria-label="Chargement">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="3"
              />
              <path
                d="M21 12a9 9 0 00-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ) : (
          <>
            {iconBefore && (
              <Icon icon={iconBefore} color={iconColor} className={styles.icon} />
            )}
            {children}
            {iconAfter && (
              <Icon icon={iconAfter} color={iconColor} className={styles.icon} />
            )}
          </>
        )}
      </AriaButton>
    );
  }
);

Button.displayName = "Button";
