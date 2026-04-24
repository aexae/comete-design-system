// ProgressBar — Comète Design System
// Barre de progression linéaire avec label optionnel.
import type { ReactElement } from "react";
import styles from "./ProgressBar.module.css";

// -----------------------------------------------------------------------
// Types publics

export type ProgressBarAppearance = "critical" | "warning" | "information" | "brand" | "success";

export interface ProgressBarProps {
  /** Valeur de progression (0–100). @default 0 */
  value?: number;
  /** Apparence de la barre. @default "auto" (critical ≤20, warning 21–99, success 100). Peut être forcée manuellement. */
  appearance?: ProgressBarAppearance | "auto";
  /** Afficher le pourcentage à droite de la barre. @default true */
  showLabel?: boolean;
  /** Label accessible décrivant la progression. */
  "aria-label"?: string;
  /** Classe CSS additionnelle sur le wrapper. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * ProgressBar — Comète Design System
 *
 * Affiche une barre de progression linéaire. La valeur est clampée
 * entre 0 et 100. Un label textuel (« 42 % ») est affiché par défaut
 * à droite de la barre.
 *
 * ```tsx
 * import { ProgressBar } from "@naxit/comete-design-system";
 *
 * <ProgressBar value={60} />
 * <ProgressBar value={100} showLabel={false} />
 * ```
 */
function resolveAppearance(
  appearance: ProgressBarAppearance | "auto",
  value: number,
): ProgressBarAppearance {
  if (appearance !== "auto") return appearance;
  if (value <= 20) return "critical";
  if (value >= 100) return "success";
  if (value >= 70) return "information";
  return "warning";
}

export function ProgressBar({
  value = 0,
  appearance = "auto",
  showLabel = true,
  "aria-label": ariaLabel,
  className,
  style,
}: ProgressBarProps): ReactElement {
  const clamped = Math.round(Math.min(100, Math.max(0, value)));
  const resolved = resolveAppearance(appearance, clamped);

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const fillClass = [styles.fill, styles[resolved]].join(" ");

  return (
    <div className={rootClass} style={style}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={fillClass}
          style={{ width: `${String(clamped)}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>{`${String(clamped)}\u00A0%`}</span>
      )}
    </div>
  );
}

ProgressBar.displayName = "ProgressBar";
