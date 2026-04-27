// InputContainer — Comète Design System
// Conteneur visuel partagé pour tous les champs de saisie.
import { useCallback, useRef, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { InputContextProvider } from "../../contexts/InputContext.js";
import styles from "./InputContainer.module.css";

// -----------------------------------------------------------------------
// Types publics

export type InputContainerAppearance = "default" | "subtle";

export interface InputContainerProps {
  /** Apparence visuelle. @default "default" */
  appearance?: InputContainerAppearance;
  /** Taille compacte (padding réduit). @default false */
  isCompact?: boolean;
  /** Supprime toute bordure (utilisé par les pickers en mode navigation). @default false */
  isBorderless?: boolean;
  /** État désactivé (visuel uniquement). @default false */
  isDisabled?: boolean;
  /** État invalide (visuel uniquement). @default false */
  isInvalid?: boolean;
  /**
   * Callback quand l'utilisateur clique sur le padding/fond du conteneur
   * (pas sur un élément interactif enfant). Permet aux composants consommateurs
   * d'implémenter focus, ouverture de popover, etc.
   */
  onContainerClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Contenu du conteneur (input, segments, boutons, etc.). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * InputContainer — Comète Design System
 *
 * Conteneur visuel partagé par tous les champs de saisie (TextField,
 * DatePicker, TimePicker, TextArea, etc.). Gère l'apparence (bordure,
 * radius, padding), les états visuels (hover, focus-within, disabled,
 * invalid) et la taille compacte.
 *
 * Ne contient aucune logique Aria — chaque composant de saisie
 * compose InputContainer avec ses propres primitives.
 *
 * ```tsx
 * <InputContainer appearance="default">
 *   <AriaInput />
 * </InputContainer>
 * ```
 */
export function InputContainer({
  appearance = "default",
  isCompact = false,
  isBorderless = false,
  isDisabled = false,
  isInvalid = false,
  onContainerClick,
  children,
  className,
  style,
}: InputContainerProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDisabled) return;

      // Ne réagir que si le clic est sur le conteneur lui-même (padding/fond),
      // pas sur un enfant interactif (input, button, select, a, [tabindex]).
      const target = e.target as HTMLElement;
      if (target !== containerRef.current && target.closest("input, button, select, textarea, a, [tabindex]")) {
        return;
      }

      // Si le conteneur a déjà le focus (un enfant est focusé), ne rien faire.
      if (containerRef.current?.contains(document.activeElement) && document.activeElement !== containerRef.current) {
        return;
      }

      // Empêcher le comportement par défaut (sélection de texte, etc.)
      // pour que le focus aille bien dans le champ.
      e.preventDefault();

      if (onContainerClick) {
        onContainerClick(e as unknown as MouseEvent<HTMLDivElement>);
      } else {
        // Comportement par défaut : focus le premier élément focusable
        const focusable = containerRef.current?.querySelector<HTMLElement>(
          "input, [tabindex]:not([tabindex='-1']), button:not([aria-label='Effacer'])",
        );
        focusable?.focus();
      }
    },
    [isDisabled, onContainerClick],
  );

  const classNames = [
    styles.inputContainer,
    isBorderless
      ? styles.borderless
      : appearance === "default"
        ? styles.bordered
        : styles.subtle,
    isCompact ? styles.compact : undefined,
    isDisabled ? styles.disabled : undefined,
    isInvalid ? styles.invalid : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={classNames} style={style} onPointerDown={handlePointerDown}>
      <InputContextProvider isDisabled={isDisabled} isInvalid={isInvalid}>
        {children}
      </InputContextProvider>
    </div>
  );
}

InputContainer.displayName = "InputContainer";
