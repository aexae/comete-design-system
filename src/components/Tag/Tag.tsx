// Tag — Comète Design System
// Étiquette compacte pour catégoriser, filtrer ou identifier du contenu.
// Basé sur React Aria pour l'accessibilité. Spec Figma : node 2984:15878.
import type { ReactElement, ReactNode } from "react";
import { Icon } from "../Icon/index.js";
import styles from "./Tag.module.css";

// -----------------------------------------------------------------------
// Types publics

/**
 * Couleurs **sémantiques** — expriment l'état d'un objet, sur un axe unique :
 *
 * - `neutral` — pas commencé, brouillon, archivé, sans objet
 * - `information` — en cours, déroulement normal
 * - `warning` — action, décision ou échéance attendue
 * - `success` — l'état souhaité est atteint
 * - `critical` — échec, refus, annulation
 *
 * L'axe se lit de deux façons, à qualifier avant tout mapping :
 * - **progression** (`Brouillon` → `En cours` → `Terminé`) — l'état souhaité
 *   est l'arrivée, donc l'étape courante est `information`, jamais `success` ;
 * - **cycle de vie** (`Actif` / `Suspendu` / `Archivé`) — l'état souhaité est
 *   le régime nominal, donc `Actif` est bien `success`.
 *
 * Deux frontières faciles à rater : « terminé » est `success` et non `neutral`
 * (le gris est réservé à ce qui n'a pas commencé ou est archivé) ; une
 * interruption réversible est `warning` et non `critical` (`critical` = ça a
 * raté ou ça a été refusé).
 *
 * Voir `docs/adr/0002-semantique-couleurs-statut.md`.
 */
export type TagStatusColor =
  | "neutral"
  | "information"
  | "warning"
  | "success"
  | "critical";

/**
 * Couleurs **catégorielles** — classent sans porter de jugement (rôle, secteur,
 * code d'activité, métier). **Jamais un statut** : une catégorie n'a pas d'axe
 * bon/mauvais.
 *
 * Voir `docs/adr/0002-semantique-couleurs-statut.md`.
 */
export type TagCategoryColor =
  | "comete"
  | "accentPurple"
  | "accentTeal"
  | "accentTurquoise"
  | "accentMagenta"
  | "accentBlueGrey";

/** Union complète des couleurs acceptées par le `Tag`. */
export type TagColor = TagStatusColor | TagCategoryColor;

export type TagAppearance = "bold" | "subtle" | "outlined";

export type TagShape = "square" | "rounded";

export interface TagProps {
  /** Texte affiché dans le tag. */
  label: string;
  /**
   * Couleur du tag.
   *
   * Pour un **statut**, utiliser une {@link TagStatusColor} ; les couleurs
   * catégorielles ({@link TagCategoryColor}) ne portent pas d'état. Le sens de
   * chaque couleur est fixé par `docs/adr/0002-semantique-couleurs-statut.md`
   * (story `Foundation/Statut`) — ne pas le redéfinir écran par écran.
   *
   * @default "neutral"
   */
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
 * Supporte 11 couleurs × 3 apparences × 2 formes.
 *
 * Deux familles de couleurs, à ne pas mélanger (ADR 0002) :
 * {@link TagStatusColor} pour un **état**, {@link TagCategoryColor} pour une
 * **catégorie**.
 *
 * ```tsx
 * // Statut — l'axe de l'ADR 0002
 * <Tag label="En cours" color="information" />
 * <Tag label="Terminé" color="success" />
 * <Tag label="Annulé" color="critical" appearance="bold" />
 *
 * // Catégorie — aucun jugement bon/mauvais
 * <Tag label="CDI" color="accentTeal" appearance="outlined" />
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
          <Icon icon="CloseSmall" size={12} spacing="none" />
        </button>
      )}
    </span>
  );
}

Tag.displayName = "Tag";
