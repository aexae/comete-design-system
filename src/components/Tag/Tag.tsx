// Tag — Comète Design System
// Étiquette compacte pour catégoriser, filtrer ou identifier du contenu.
// Basé sur React Aria pour l'accessibilité. Spec Figma : node 2984:15878.
import type { ReactElement, ReactNode } from "react";
import styles from "./Tag.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TagAppearance =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "critical"
  | "information"
  | "accent";

export type TagStyle = "bold" | "subtle" | "outlined";

export type TagShape = "square" | "rounded";

export interface TagProps {
  /** Texte affiché dans le tag. */
  label: string;
  /** Couleur sémantique du tag. @default "neutral" */
  appearance?: TagAppearance;
  /** Style visuel : rempli (bold), léger (subtle) ou bordé (outlined). @default "bold" */
  tagStyle?: TagStyle;
  /** Forme : coins droits (square) ou arrondis (rounded). @default "rounded" */
  shape?: TagShape;
  /** Désactive le tag (opacité réduite, pas d'interaction). @default false */
  isDisabled?: boolean;
  /** Élément affiché avant le label (ex: pastille de couleur, petit avatar). */
  elemBefore?: ReactNode;
  /** Élément affiché après le label (ex: bouton close). */
  elemAfter?: ReactNode;
  /** Callback quand le tag est pressé (rend le tag interactif). */
  onPress?: () => void;
  /** Callback quand l'élément after est pressé (ex: suppression). */
  onRemove?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Tag — Comète Design System
 *
 * Étiquette compacte pour catégoriser, filtrer ou identifier du contenu.
 * Supporte 7 apparences × 3 styles × 2 formes.
 *
 * ```tsx
 * <Tag label="CDI" appearance="success" />
 * <Tag label="Agent" appearance="neutral" tagStyle="subtle" />
 * <Tag label="Urgent" appearance="critical" onRemove={() => remove()} />
 * ```
 */
export function Tag({
  label,
  appearance = "neutral",
  tagStyle = "bold",
  shape = "rounded",
  isDisabled = false,
  elemBefore,
  elemAfter,
  onPress,
  onRemove,
  className,
}: TagProps): ReactElement {
  const classNames = [
    styles["tag"],
    styles[appearance],
    styles[tagStyle],
    styles[shape],
    isDisabled ? styles["disabled"] : undefined,
    onPress && !isDisabled ? styles["interactive"] : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (!isDisabled && onPress) onPress();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && onPress && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onPress();
    }
  };

  const isInteractive = !!onPress && !isDisabled;

  return (
    <span
      className={classNames}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={isDisabled || undefined}
    >
      {elemBefore !== undefined && (
        <span className={styles["elemBefore"]}>{elemBefore}</span>
      )}
      <span className={styles["label"]}>{label}</span>
      {elemAfter !== undefined && (
        <span className={styles["elemAfter"]}>{elemAfter}</span>
      )}
      {onRemove && !isDisabled && (
        <button
          type="button"
          className={styles["removeButton"]}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Supprimer ${label}`}
          tabIndex={-1}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

Tag.displayName = "Tag";
