import React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { forwardRef } from "react";
import type { IconColor, IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import styles from "./Button.module.css";

// ----------------------------------------------------------------------

export type ButtonAppearance = "contained" | "outlined" | "subtle" | "link" | "link-subtle";
export type ButtonColor = "default" | "brand" | "success" | "critical" | "warning" | "information";
export type ButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  /** Visual appearance. @default "contained" */
  appearance?: ButtonAppearance;
  /** Color scheme. @default "default" */
  color?: ButtonColor;
  /** Size. @default "medium" */
  size?: ButtonSize;
  /** Icon name displayed before the label. Color is automatically resolved from appearance + color. */
  iconBefore?: IconName;
  /** Icon name displayed after the label. Color is automatically resolved from appearance + color. */
  iconAfter?: IconName;
  /** Affiche un spinner et désactive les interactions. @default false */
  isLoading?: boolean;
  /** État sélectionné/actif — applique un style visuel persistant. @default false */
  isSelected?: boolean;
  /** Additional CSS class names. */
  className?: string;
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
    // NOTE: warning bold background is light/yellow — needs dark icons, not white
    if (color === "warning") return "on-warning";
    // brand, success, critical, information render bold backgrounds with inverted (white) text
    const invertedColors: readonly ButtonColor[] = ["brand", "success", "critical", "information"];
    return invertedColors.includes(color) ? "inverted" : "default";
  }

  // outlined, subtle, link: icon follows the semantic color of the button text
  const semanticColorMap: Record<ButtonColor, IconColor> = {
    default: "default",
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
 * Styled with CSS Modules consuming @naxit/comete-design-tokens.
 * Icon color is automatically resolved from the button appearance + color.
 *
 * ```tsx
 * import { Button } from "@naxit/comete-design-system";
 * import { Check } from "@naxit/comete-icons";
 *
 * <Button color="brand">Enregistrer</Button>
 * <Button appearance="outlined" color="critical" iconBefore={<TrashIcon spacing="default" variant="filled" />}>
 *   Supprimer
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      appearance = "contained",
      color = "default",
      size = "medium",
      iconBefore,
      iconAfter,
      isLoading = false,
      isSelected = false,
      className,
      children,
      ...ariaProps
    },
    ref
  ) => {
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
      brand: styles.brand,
      success: styles.success,
      critical: styles.critical,
      warning: styles.warning,
      information: styles.information,
    };
    const colorClass = colorClassMap[color];

    // Map size to CSS class
    const sizeClassMap: Record<ButtonSize, string> = {
      xsmall: styles.xsmall,
      small: styles.small,
      medium: styles.medium,
      large: styles.large,
      xlarge: styles.xlarge,
    };
    const sizeClass = sizeClassMap[size];

    // NOTE: icon-only when icon is present but children is empty/null/undefined
    const isIconOnly =
      (iconBefore !== undefined || iconAfter !== undefined) &&
      (children === null || children === undefined || children === "");

    const classNames = [
      styles.button,
      appearanceClass,
      colorClass,
      sizeClass,
      isIconOnly ? styles.iconOnly : undefined,
      isLoading ? styles.loading : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconColor = resolveIconColor(appearance, color);

    return (
      <AriaButton
        ref={ref}
        className={classNames}
        isDisabled={isLoading || ariaProps.isDisabled}
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
