// ProgressIndicator — Comete Design System
// Indicateur de progression par points (dot indicator) accessible.
import { useRef, type KeyboardEvent, type ReactElement, type CSSProperties } from "react";
import styles from "./ProgressIndicator.module.css";

// -----------------------------------------------------------------------
// Types publics

export type ProgressIndicatorAppearance =
  | "default"
  | "primary"
  | "help"
  | "inverted";

export type ProgressIndicatorSize = "small" | "medium" | "large";

export type ProgressIndicatorSpacing =
  | "comfortable"
  | "cozy"
  | "compact";

export interface ProgressIndicatorProps {
  /** Apparence visuelle des points. */
  appearance?: ProgressIndicatorAppearance;
  /** Taille des points. */
  size?: ProgressIndicatorSize;
  /** Espacement entre les points. */
  spacing?: ProgressIndicatorSpacing;
  /** Index du point selectionne (0-based). */
  selectedIndex?: number;
  /** Nombre total de points. */
  total?: number;
  /** Callback appele lorsqu'un point est clique ou selectionne au clavier. */
  onChange?: (index: number) => void;
  /** Label accessible decrivant la progression. */
  "aria-label"?: string;
  /** Additional CSS class. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * ProgressIndicator — Comete Design System
 *
 * Affiche un indicateur de progression sous forme de points.
 * Montre a l'utilisateur ou il se trouve dans un parcours multi-etapes.
 *
 * Navigation clavier : Tab entre dans le composant, puis les fleches
 * gauche/droite deplacent le focus et selectionnent le dot.
 *
 * ```tsx
 * import { ProgressIndicator } from "@naxit/comete-design-system";
 *
 * <ProgressIndicator
 *   appearance="primary"
 *   size="medium"
 *   spacing="comfortable"
 *   selectedIndex={2}
 *   total={5}
 *   onChange={(index) => setStep(index)}
 *   aria-label="Etape 3 sur 5"
 * />
 * ```
 */
export function ProgressIndicator({
  appearance = "default",
  size = "medium",
  spacing = "comfortable",
  selectedIndex = 0,
  total = 5,
  onChange,
  "aria-label": ariaLabel,
  className,
  style,
}: ProgressIndicatorProps): ReactElement {
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const rootClassNames = [
    styles.root,
    styles[size],
    styles[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % total;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + total) % total;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = total - 1;
    }

    if (nextIndex !== undefined) {
      dotsRef.current[nextIndex]?.focus();
      onChange?.(nextIndex);
    }
  }

  return (
    <div
      className={rootClassNames}
      role="tablist"
      aria-label={ariaLabel ?? `Etape ${selectedIndex + 1} sur ${total}`}
      style={style}
    >
      {Array.from({ length: total }, (_, i) => {
        const isSelected = i === selectedIndex;
        const dotClassNames = [
          styles.dot,
          styles[appearance],
          isSelected ? styles.selected : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            type="button"
            role="tab"
            className={dotClassNames}
            aria-selected={isSelected}
            aria-label={`Etape ${i + 1}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange?.(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        );
      })}
    </div>
  );
}

ProgressIndicator.displayName = "ProgressIndicator";
