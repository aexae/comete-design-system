// TextField — Comète Design System
// Champ de saisie texte accessible via React Aria.
import type { ReactElement, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import {
  TextField as AriaTextField,
  Input as AriaInput,
  Button as AriaButton,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { Icon } from "../Icon/Icon.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import type { Density } from "../../contexts/DensityContext.js";
import { Spinner } from "../Spinner/index.js";
import styles from "./TextField.module.css";

// -----------------------------------------------------------------------
// Types publics

export type TextFieldAppearance = InputContainerAppearance;

export interface TextFieldProps extends Omit<
  AriaTextFieldProps,
  "className" | "style" | "children"
> {
  /** Apparence visuelle. @default "default" */
  appearance?: TextFieldAppearance;
  /**
   * Densité — hauteur + padding + radius. Si non fournie, hérite d'un
   * `DensityProvider`, sinon `"default"`.
   */
  density?: Density;
  /** Texte indicatif affiché quand le champ est vide. */
  placeholder?: string;
  /** Affiche un bouton clear (×) quand le champ a une valeur. @default false */
  isClearable?: boolean;
  /** Affiche un spinner de chargement. @default true */
  isLoading?: boolean;
  /** Élément affiché avant l'input (icône, etc.). */
  elemBefore?: ReactNode;
  /** Élément affiché après l'input (icône, bouton, etc.). */
  elemAfter?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * TextField — Comète Design System
 *
 * Champ de saisie texte. Deux apparences : default (bordure complète)
 * et subtle (bordure basse uniquement). Supporte compact, disabled, invalid,
 * clear button et loading spinner.
 *
 * ```tsx
 * import { Field, TextField } from "@aexae/comete-design-system";
 *
 * <Field label="Email" isRequired>
 *   <TextField placeholder="nom@example.com" type="email" isClearable />
 * </Field>
 * ```
 */
export function TextField({
  appearance = "default",
  density,
  placeholder,
  isClearable = true,
  isLoading = false,
  elemBefore,
  elemAfter,
  className,
  style,
  value: controlledValue,
  defaultValue,
  onChange,
  ...ariaProps
}: TextFieldProps): ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // NOTE: Always use controlled mode internally for clear/loading support
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const hasValue = currentValue !== "";

  function handleChange(newValue: string) {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }

  function handleClear() {
    handleChange("");
    inputRef.current?.focus();
  }

  const handleContainerClick = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    // Curseur à la fin du texte
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }, []);

  return (
    <AriaTextField
      className={[styles.textField, className].filter(Boolean).join(" ")}
      style={style}
      value={currentValue}
      onChange={handleChange}
      {...ariaProps}
    >
      {({ isDisabled, isInvalid }) => (
        <InputContainer
          appearance={appearance}
          density={density}
          isDisabled={isDisabled}
          isInvalid={isInvalid ?? false}
          onContainerClick={handleContainerClick}
        >
          {elemBefore && <span className={styles.elemBefore}>{elemBefore}</span>}
          <AriaInput ref={inputRef} className={styles.input} placeholder={placeholder} />
          {isLoading && <Spinner size="small" className={styles.spinner} />}
          {isClearable && hasValue && !isDisabled && (
            <AriaButton
              className={styles.clearButton}
              aria-label="Effacer"
              onPress={handleClear}
              excludeFromTabOrder
            >
              <Icon icon="CloseSmall" color="subtlest" />
            </AriaButton>
          )}
          {elemAfter && <span className={styles.elemAfter}>{elemAfter}</span>}
        </InputContainer>
      )}
    </AriaTextField>
  );
}

TextField.displayName = "TextField";
