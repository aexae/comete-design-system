// Accordion — Comète Design System
// API composable façon shadcn / Base UI :
//   Accordion › AccordionItem › (AccordionTrigger + AccordionContent)
// Pilotage par `value` (comme Base UI), mode `multiple`, `disabled`.
// S'appuie sur les primitives React Aria `DisclosureGroup` / `Disclosure`
// / `DisclosurePanel` — accessibilité complète (aria-expanded, aria-controls,
// clavier, focus).
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  DisclosurePanel as AriaDisclosurePanel,
  Heading as AriaHeading,
  type Key,
} from "react-aria-components";
import { Icon } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./Accordion.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Niveau de titre HTML utilisé par le `AccordionTrigger`. */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AccordionProps {
  /**
   * Autorise plusieurs items ouverts simultanément.
   * @default false (un seul item ouvert à la fois)
   */
  multiple?: boolean;
  /** Valeurs des items ouverts (contrôlé). */
  value?: string[];
  /** Valeurs des items ouverts par défaut (non contrôlé). */
  defaultValue?: string[];
  /** Callback quand les items ouverts changent. */
  onValueChange?: (value: string[]) => void;
  /** Désactive tous les items. */
  disabled?: boolean;
  /** Contenu : une liste de `AccordionItem`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface AccordionItemProps {
  /** Identifiant unique de l'item (requis, sert de clé `value`). */
  value: string;
  /** Désactive cet item spécifiquement. */
  disabled?: boolean;
  /** Contenu : un `AccordionTrigger` + un `AccordionContent`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface AccordionTriggerProps {
  /** Icône optionnelle affichée avant le titre. */
  startIcon?: ReactNode;
  /** Niveau de titre HTML. @default 3 */
  headingLevel?: AccordionHeadingLevel;
  /** Contenu du header (le titre). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

export interface AccordionContentProps {
  /** Rôle ARIA du panel. @default "group" */
  role?: "group" | "region";
  /** Contenu du panel. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Accordion (root / group)

/**
 * Accordion — Comète Design System
 *
 * Ensemble de sections repliables. Le root gère l'ouverture (mode simple
 * par défaut, ou `multiple`). Piloté par `value` / `defaultValue`.
 *
 * ```tsx
 * <Accordion defaultValue={["item-1"]}>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>Yes. WAI-ARIA compliant.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export function Accordion({
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  className,
  style,
}: AccordionProps): ReactElement {
  return (
    <AriaDisclosureGroup
      allowsMultipleExpanded={multiple}
      expandedKeys={value}
      defaultExpandedKeys={defaultValue}
      onExpandedChange={
        onValueChange
          ? (keys: Set<Key>) =>
              onValueChange(Array.from(keys, (k) => String(k)))
          : undefined
      }
      isDisabled={disabled}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      data-slot="accordion"
    >
      {children}
    </AriaDisclosureGroup>
  );
}

Accordion.displayName = "Accordion";

// -----------------------------------------------------------------------
// AccordionItem

/**
 * AccordionItem — une section repliable. `value` l'identifie dans le root.
 */
export function AccordionItem({
  value,
  disabled,
  children,
  className,
  style,
}: AccordionItemProps): ReactElement {
  return (
    <AriaDisclosure
      id={value}
      isDisabled={disabled}
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={style}
      data-slot="accordion-item"
    >
      {children}
    </AriaDisclosure>
  );
}

AccordionItem.displayName = "AccordionItem";

// -----------------------------------------------------------------------
// AccordionTrigger — l'en-tête cliquable

/**
 * AccordionTrigger — En-tête cliquable qui ouvre/ferme l'`AccordionItem`.
 * Rend un `<h3><button>…</button></h3>` (niveau configurable) avec un
 * chevron `ExpandMore` qui pivote à l'ouverture.
 */
export function AccordionTrigger({
  startIcon,
  headingLevel = 3,
  children,
  className,
  style,
}: AccordionTriggerProps): ReactElement {
  return (
    <AriaHeading
      level={headingLevel}
      className={[styles.triggerHeading, className].filter(Boolean).join(" ")}
      style={style}
    >
      <AriaButton slot="trigger" className={styles.trigger}>
        {({ isFocusVisible }) => (
          <>
            {startIcon && (
              <span className={styles.triggerStart}>{startIcon}</span>
            )}
            <span className={styles.triggerLabel}>{children}</span>
            <span className={styles.triggerChevron} aria-hidden="true">
              <Icon icon="ExpandMore" size={16} />
            </span>
            {isFocusVisible && (
              <FocusRing borderRadius={2} position="inside" />
            )}
          </>
        )}
      </AriaButton>
    </AriaHeading>
  );
}

AccordionTrigger.displayName = "AccordionTrigger";

// -----------------------------------------------------------------------
// AccordionContent — le panel déroulé

/**
 * AccordionContent — Contenu affiché quand l'`AccordionItem` est ouvert.
 */
export function AccordionContent({
  role = "group",
  children,
  className,
  style,
}: AccordionContentProps): ReactElement {
  return (
    <AriaDisclosurePanel
      role={role}
      className={[styles.content, className].filter(Boolean).join(" ")}
      style={style}
      data-slot="accordion-content"
    >
      {children}
    </AriaDisclosurePanel>
  );
}

AccordionContent.displayName = "AccordionContent";
