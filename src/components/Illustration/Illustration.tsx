import type { ReactElement } from "react";
import type { IllustrationName, IllustrationProps } from "@naxit/comete-illustrations";
import { illustrationRegistry } from "@naxit/comete-illustrations";
import styles from "./Illustration.module.css";

// ----------------------------------------------------------------------

export type { IllustrationName };

export type IllustrationSize = 128 | 256 | 512;

export interface IllustrationComponentProps {
  /** Name of the illustration to render. Must match an export from @naxit/comete-illustrations. */
  illustration: IllustrationName;
  /** Rendered size in pixels (width & height). @default 256 */
  size?: IllustrationSize;
  /**
   * Accessible label. When provided the illustration is exposed to assistive
   * technologies via `aria-label`; otherwise it is treated as decorative
   * (`aria-hidden="true"`).
   */
  "aria-label"?: string;
  /** Additional CSS class applied to the wrapper `<span>`. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// ----------------------------------------------------------------------

/**
 * Illustration — Comète Design System
 *
 * Renders a multicolor illustration from `@naxit/comete-illustrations` by name.
 * Wraps the SVG in a `<span>` for easy CSS positioning.
 *
 * ```tsx
 * import { Illustration } from "@naxit/comete-design-system";
 *
 * <Illustration illustration="Empty" />
 * <Illustration illustration="ForbiddenAccess" size={128} aria-label="Accès refusé" />
 * ```
 */
export function Illustration({
  illustration,
  size = 256,
  "aria-label": ariaLabel,
  className,
  style,
}: IllustrationComponentProps): ReactElement | null {
  const IllustrationComponent = illustrationRegistry[illustration];

  const illustrationProps: IllustrationProps = { width: size, height: size };

  const classNames = [styles.illustration, className].filter(Boolean).join(" ");

  const ariaProps: Record<string, string | boolean> = ariaLabel
    ? { "aria-label": ariaLabel, role: "img" }
    : { "aria-hidden": true };

  return (
    <span className={classNames} {...ariaProps} style={style}>
      <IllustrationComponent {...illustrationProps} />
    </span>
  );
}

Illustration.displayName = "Illustration";
