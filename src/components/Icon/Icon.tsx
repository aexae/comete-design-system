import type { ReactElement } from "react";
import type { IconColor, IconName, IconProps, IconSpacing, IconVariant } from "@naxit/comete-icons";
import { iconRegistry } from "@naxit/comete-icons";
import { useInputContext } from "../../contexts/InputContext.js";
import styles from "./Icon.module.css";

// ----------------------------------------------------------------------

export type { IconName };

export type IconAppearance = IconVariant;

export interface IconComponentProps {
  /** Name of the icon to render. Must match an export from @naxit/comete-icons. */
  icon: IconName;
  /** Icon style appearance. @default "outlined" */
  appearance?: IconAppearance;
  /** Semantic color mapped to design tokens. @default "default" */
  color?: IconColor;
  /** Rendered size in pixels. @default 24 */
  size?: number;
  /**
   * Internal spacing of the SVG (viewBox).
   * - "default" — icon with padding (viewBox 0 0 24 24)
   * - "none" — icon without padding (viewBox 0 0 16 16)
   * @default "default"
   */
  spacing?: IconSpacing;
  /**
   * Accessible label. When provided the icon is exposed to assistive
   * technologies via `aria-label`; otherwise it is treated as decorative
   * (`aria-hidden="true"`).
   */
  "aria-label"?: string;
  /** Additional CSS class applied to the wrapper `<span>`. */
  className?: string;
}

// ----------------------------------------------------------------------

/**
 * Icon — Comète Design System
 *
 * Renders an icon from `@naxit/comete-icons` by name.
 * Wraps the SVG in a `<span>` for easy CSS positioning.
 *
 * ```tsx
 * import { Icon } from "@naxit/comete-design-system";
 *
 * <Icon icon="Check" color="success" />
 * <Icon icon="Warning" appearance="filled" size={16} aria-label="Attention" />
 * ```
 */
export function Icon({
  icon,
  appearance = "outlined",
  color,
  size = 24,
  spacing = "default",
  "aria-label": ariaLabel,
  className,
}: IconComponentProps): ReactElement | null {
  const IconComponent = iconRegistry[icon];
  const inputCtx = useInputContext();

  // Si color n'est pas passée explicitement, hériter du contexte InputContext
  const resolvedColor: IconColor =
    color ?? (inputCtx?.isDisabled ? "disabled" : "default");

  const iconProps: IconProps = { variant: appearance, color: resolvedColor, size, spacing };

  const classNames = [styles.icon, className].filter(Boolean).join(" ");

  const ariaProps: Record<string, string | boolean> = ariaLabel
    ? { "aria-label": ariaLabel, role: "img" }
    : { "aria-hidden": true };

  return (
    <span className={classNames} {...ariaProps}>
      <IconComponent {...iconProps} />
    </span>
  );
}

Icon.displayName = "Icon";
