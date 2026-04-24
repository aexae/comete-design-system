// Tag — Comète Design System
// Étiquette compacte pour catégoriser, filtrer ou identifier du contenu.
// Basé sur React Aria pour l'accessibilité. Spec Figma : node 2984:15878.
import type { ReactElement, ReactNode } from "react";
import { Icon } from "../Icon/index.js";
import styles from "./Tag.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TagColor =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "critical"
  | "information"
  | "accent";

export type TagAppearance = "bold" | "subtle" | "outlined";

export type TagShape = "square" | "rounded";

export interface TagProps {
  /** Texte affiché dans le tag. */
  label: string;
  /** Couleur sémantique du tag. @default "neutral" */
  color?: TagColor;
  /** Style visuel : rempli (bold), léger (subtle) ou bordé (outlined). @default "subtle" */
  appearance?: TagAppearance;
  /** Forme : coins droits (square) ou arrondis (rounded). @default "square" */
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
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Tag — Comète Design System
 *
 * Étiquette compacte pour catégoriser, filtrer ou identifier du contenu.
 * Supporte 7 couleurs × 3 apparences × 2 formes.
 *
 * ```tsx
 * <Tag label="CDI" color="success" />
 * <Tag label="Agent" color="neutral" appearance="bold" />
 * <Tag label="Urgent" color="critical" onRemove={() => remove()} />
 * ```
 */
export function Tag({
  label,
  color = "neutral",
  appearance = "subtle",
  shape = "square",
  isDisabled = false,
  elemBefore,
  elemAfter,
  onPress,
  onRemove,
  className,
  style,
}: TagProps): ReactElement {
  const classNames = [
    styles["tag"],
    styles[color],
    styles[appearance],
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
      style={style}
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
          tabIndex={0}
        >
          <Icon icon="CloseSmallFaded" size={12} spacing="none" />
        </button>
      )}
    </span>
  );
}

Tag.displayName = "Tag";
