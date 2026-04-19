// Select — Comète Design System
// Sélecteur déroulant accessible basé sur React Aria.
// Intègre Field (label + message) comme wrapper obligatoire.
import { type ReactElement, type ReactNode, type Key, useRef } from "react";
import {
  Select as AriaSelect,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  Header as AriaHeader,
  SelectValue as AriaSelectValue,
  Button as AriaButton,
  type ListBoxItemProps as AriaListBoxItemProps,
} from "react-aria-components";
import { Icon } from "../Icon/Icon.js";
import { FocusRing } from "../FocusRing/FocusRing.js";
import { InputContainer } from "../InputContainer/InputContainer.js";
import type { InputContainerAppearance } from "../InputContainer/InputContainer.js";
import { Field, type FieldMessageType } from "../Field/Field.js";
import { Popover } from "../Popover/Popover.js";
import styles from "./Select.module.css";

// -----------------------------------------------------------------------
// Types publics

export type SelectAppearance = InputContainerAppearance;

export interface SelectOption {
  /** Valeur unique de l'option (utilisée comme clé). */
  value: string;
  /** Label affiché dans la liste et le trigger. */
  label: string;
  /** Désactive l'option. */
  isDisabled?: boolean;
}

export interface SelectGroup {
  /** Titre du groupe. */
  label: string;
  /** Options du groupe. */
  options: SelectOption[];
}

export type SelectItems = (SelectOption | SelectGroup)[];

export interface SelectProps {
  /** Liste d'options (plates ou groupées). */
  items: SelectItems;
  /** Valeur sélectionnée (contrôlé). */
  value?: string | null;
  /** Valeur par défaut (non contrôlé). */
  defaultValue?: string;
  /** Callback au changement de sélection. */
  onChange?: (value: string | null) => void;
  /** Texte indicatif quand aucune valeur n'est sélectionnée. @default "Sélectionner…" */
  placeholder?: string;
  /** Apparence visuelle. @default "default" */
  appearance?: SelectAppearance;
  /** Taille compacte (padding réduit). @default false */
  isCompact?: boolean;
  /** Affiche un bouton clear quand une valeur est sélectionnée. @default false */
  isClearable?: boolean;
  /** Affiche un spinner de chargement. @default false */
  isLoading?: boolean;
  /** État désactivé. @default false */
  isDisabled?: boolean;
  /** État invalide. @default false */
  isInvalid?: boolean;
  /** Message affiché quand la liste est vide. @default "Aucune correspondance" */
  emptyMessage?: string;
  /** Label du champ (affiché au-dessus via Field). */
  label?: string;
  /** Indique un champ requis (astérisque rouge via Field). */
  isRequired?: boolean;
  /** Message affiché sous le champ (via Field). */
  message?: string;
  /** Type du message. @default "neutral" */
  messageType?: FieldMessageType;
  /** Label accessible (si pas de label visible). */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Helpers

function isGroup(item: SelectOption | SelectGroup): item is SelectGroup {
  return "options" in item;
}

function flattenOptions(items: SelectItems): SelectOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

// -----------------------------------------------------------------------
// Spinner (identique au TextField)

function Spinner(): ReactElement {
  return (
    <span className={styles.spinner} role="status" aria-label="Chargement">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// -----------------------------------------------------------------------
// SelectOptionItem (interne)

interface SelectOptionItemProps extends Omit<AriaListBoxItemProps<object>, "className" | "style" | "children"> {
  children: ReactNode;
}

function SelectOptionItem({ children, ...props }: SelectOptionItemProps): ReactElement {
  return (
    <AriaListBoxItem {...props} className={styles.option}>
      {({ isSelected, isFocusVisible }) => (
        <>
          <span className={styles.optionContent}>
            <span className={styles.optionLabel}>{children}</span>
            {isSelected && <Icon icon="Check" color="selected" />}
          </span>
          {isFocusVisible && <FocusRing borderRadius={1} position="inside" />}
        </>
      )}
    </AriaListBoxItem>
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * Select — Comète Design System
 *
 * Sélecteur déroulant accessible. Intègre Field (label + message)
 * et InputContainer (bordure + états visuels) comme le TextField.
 *
 * ```tsx
 * import { Select } from "@naxit/comete-design-system";
 *
 * <Select
 *   label="Pays"
 *   isRequired
 *   items={[
 *     { value: "fr", label: "France" },
 *     { value: "be", label: "Belgique" },
 *   ]}
 *   value="fr"
 *   onChange={(value) => setValue(value)}
 * />
 * ```
 */
export function Select({
  items,
  value,
  defaultValue,
  onChange,
  placeholder = "Sélectionner\u2026",
  appearance = "default",
  isCompact = false,
  isClearable = false,
  isLoading = false,
  isDisabled,
  isInvalid,
  emptyMessage = "Aucune correspondance",
  label,
  isRequired,
  message,
  messageType,
  "aria-label": ariaLabel,
  className,
}: SelectProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const allOptions = flattenOptions(items);
  const hasValue = value !== undefined ? value !== null : undefined;
  const disabled = isDisabled ?? false;

  function handleSelectionChange(key: Key | null) {
    onChange?.(key !== null ? String(key) : null);
  }

  function handleClear() {
    onChange?.(null);
  }

  return (
    <Field
      label={label}
      isRequired={isRequired}
      message={message}
      messageType={messageType}
      className={className}
    >
      <AriaSelect
        selectedKey={value}
        defaultSelectedKey={defaultValue}
        onSelectionChange={handleSelectionChange}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        placeholder={placeholder}
        aria-label={ariaLabel ?? label}
        className={styles.select}
      >
        {({ isOpen }) => (
          <>
            <div ref={containerRef}>
              <InputContainer
                appearance={appearance}
                isCompact={isCompact}
                isDisabled={disabled}
                isInvalid={isInvalid ?? false}
              >
                <AriaButton className={styles.triggerButton}>
                  <AriaSelectValue className={styles.value}>
                    {({ selectedText, isPlaceholder }) =>
                      isPlaceholder ? placeholder : (selectedText ?? "")
                    }
                  </AriaSelectValue>
                </AriaButton>
                {isLoading && <Spinner />}
                {isClearable && hasValue && !disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    className={styles.clearButton}
                    aria-label="Effacer la sélection"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClear();
                      }
                    }}
                  >
                    <Icon icon="CloseSmallFaded" size={16} spacing="none" />
                  </span>
                )}
                <Icon
                  icon="KeyboardArrowDown"
                  color={disabled ? "disabled" : "default"}
                  className={isOpen ? styles.chevronOpen : undefined}
                />
              </InputContainer>
            </div>
            <Popover placement="bottom start" triggerRef={containerRef} className={styles.popover}>
              <AriaListBox className={styles.listBox}>
                {allOptions.length === 0 && !isLoading ? (
                  <AriaListBoxItem id="__empty__" isDisabled textValue={emptyMessage} className={styles.stateItem}>
                    <span className={styles.emptyState}>{emptyMessage}</span>
                  </AriaListBoxItem>
                ) : isLoading && allOptions.length === 0 ? (
                  <AriaListBoxItem id="__loading__" isDisabled textValue="Chargement" className={styles.stateItem}>
                    <span className={styles.loadingState}>Chargement{"\u2026"}</span>
                  </AriaListBoxItem>
                ) : (
                  items.map((item) => {
                    if (isGroup(item)) {
                      return (
                        <AriaListBoxSection key={item.label} className={styles.group}>
                          <AriaHeader className={styles.groupLabel}>
                            {item.label}
                          </AriaHeader>
                          {item.options.map((opt) => (
                            <SelectOptionItem
                              key={opt.value}
                              id={opt.value}
                              textValue={opt.label}
                              isDisabled={opt.isDisabled}
                            >
                              {opt.label}
                            </SelectOptionItem>
                          ))}
                        </AriaListBoxSection>
                      );
                    }
                    return (
                      <SelectOptionItem
                        key={item.value}
                        id={item.value}
                        textValue={item.label}
                        isDisabled={item.isDisabled}
                      >
                        {item.label}
                      </SelectOptionItem>
                    );
                  })
                )}
              </AriaListBox>
            </Popover>
          </>
        )}
      </AriaSelect>
    </Field>
  );
}

Select.displayName = "Select";
