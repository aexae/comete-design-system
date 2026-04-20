// InputContainer — Comète Design System
// Conteneur visuel partagé pour tous les champs de saisie.
import type { ReactElement, ReactNode } from "react";
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
  /** Contenu du conteneur (input, segments, boutons, etc.). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
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
  children,
  className,
}: InputContainerProps): ReactElement {
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
    <div className={classNames}>
      <InputContextProvider isDisabled={isDisabled} isInvalid={isInvalid}>
        {children}
      </InputContextProvider>
    </div>
  );
}

InputContainer.displayName = "InputContainer";
