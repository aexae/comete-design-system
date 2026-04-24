// Field — Comète Design System
// Wrapper générique pour champs de formulaire : label + contenu + message.
import type { ReactElement, ReactNode } from "react";
import styles from "./Field.module.css";

// -----------------------------------------------------------------------
// Types publics

export type FieldMessageType = "neutral" | "critical" | "success";

export interface FieldProps {
  /** Texte du label affiché au-dessus du champ. */
  label?: string;
  /** Indique un champ requis (affiche un astérisque rouge). */
  isRequired?: boolean;
  /** Message affiché sous le champ. */
  message?: string;
  /** Type du message (couleur). @default "neutral" */
  messageType?: FieldMessageType;
  /** Contenu du champ (input, select, etc.). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Field — Comète Design System
 *
 * Wrapper de formulaire générique. Fournit un label, un emplacement
 * pour le contrôle et un message optionnel (neutre, succès, erreur).
 *
 * ```tsx
 * import { Field, TextField } from "@naxit/comete-design-system";
 *
 * <Field label="Nom" isRequired message="Ce champ est requis" messageType="critical">
 *   <TextField placeholder="Saisir un nom" isInvalid />
 * </Field>
 * ```
 */
export function Field({
  label,
  isRequired,
  message,
  messageType = "neutral",
  children,
  className,
  style,
}: FieldProps): ReactElement {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} style={style}>
      {label !== undefined && (
        <span className={styles.label}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </span>
      )}
      {children}
      {message !== undefined && (
        <span className={[styles.message, styles[messageType]].join(" ")}>
          {message}
        </span>
      )}
    </div>
  );
}

Field.displayName = "Field";
