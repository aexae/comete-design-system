// IconTile — Comète Design System
// Icône présentée sur un fond coloré avec forme et taille configurables.
import type { ReactElement } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon";
import styles from "./IconTile.module.css";

// -----------------------------------------------------------------------
// Types publics

export type IconTileAppearance =
  | "neutral"
  | "brand"
  | "information"
  | "success"
  | "warning"
  | "critical"
  | "accent";

export type IconTileSize = "xsmall" | "small" | "medium" | "large";

export type IconTileShape = "square" | "circle";

export interface IconTileProps {
  /** Icône à afficher. */
  icon: IconName;
  /** Apparence colorée. @default "neutral" */
  appearance?: IconTileAppearance;
  /** Taille de la tuile. @default "medium" */
  size?: IconTileSize;
  /** Forme de la tuile. @default "square" */
  shape?: IconTileShape;
  /** Label accessible (aria-label). */
  label?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Mapping taille → taille icône (px)

const ICON_SIZE_MAP: Record<IconTileSize, number> = {
  xsmall: 16,
  small: 20,
  medium: 24,
  large: 24,
};

// Mapping appearance → couleur icône
const ICON_COLOR_MAP: Record<IconTileAppearance, string> = {
  neutral: "default",
  brand: "brand",
  information: "information",
  success: "success",
  warning: "warning",
  critical: "critical",
  accent: "accent",
};

// -----------------------------------------------------------------------
// Composant

/**
 * IconTile — Comète Design System
 *
 * Affiche une icône sur un fond coloré arrondi ou circulaire.
 * Utilisé pour donner un contexte visuel à une icône (catégories,
 * KPIs, listes, etc.).
 *
 * ```tsx
 * import { IconTile } from "@naxit/comete-design-system";
 *
 * <IconTile icon="CalendarMonth" appearance="information" />
 * <IconTile icon="Warning" appearance="critical" shape="circle" size="large" />
 * ```
 */
export function IconTile({
  icon,
  appearance = "neutral",
  size = "medium",
  shape = "square",
  label,
  className,
  style,
}: IconTileProps): ReactElement {
  const classNames = [
    styles.iconTile,
    styles[size],
    styles[shape],
    styles[appearance],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classNames}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={style}
    >
      <Icon
        icon={icon}
        size={ICON_SIZE_MAP[size]}
        color={ICON_COLOR_MAP[appearance] as never}
        spacing="none"
      />
    </span>
  );
}
