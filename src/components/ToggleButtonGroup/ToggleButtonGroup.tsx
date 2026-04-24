// ToggleButtonGroup — Comete Design System
// Groupe de boutons toggle avec selection unique ou multiple.
// Basé sur React Aria ToggleButtonGroup + ToggleButton.
import type { ReactElement, ReactNode } from "react";
import {
  ToggleButtonGroup as AriaToggleButtonGroup,
  ToggleButton as AriaToggleButton,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
  type Selection,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { Badge } from "../Badge/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./ToggleButtonGroup.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Mode de selection du groupe. */
export type ToggleButtonGroupSelectionMode = "single" | "multiple";

export interface ToggleButtonGroupProps
  extends Omit<
    AriaToggleButtonGroupProps,
    "className" | "style" | "orientation"
  > {
  /** Mode de selection : "single" (defaut) ou "multiple". */
  selectionMode?: ToggleButtonGroupSelectionMode;
  /** Cles selectionnees (mode controle). */
  selectedKeys?: Iterable<string>;
  /** Cles selectionnees par defaut (mode non controle). */
  defaultSelectedKeys?: Iterable<string>;
  /** Callback quand la selection change. */
  onSelectionChange?: (keys: Selection) => void;
  /** Desactive tous les boutons du groupe. */
  isDisabled?: boolean;
  /** Libelle accessible du groupe. */
  "aria-label"?: string;
  /** Additional CSS class. */
  className?: string;
  /** Boutons ToggleButton a regrouper. */
  children: ReactNode;
}

export interface ToggleButtonProps
  extends Omit<AriaToggleButtonProps, "className" | "style" | "children"> {
  /** Identifiant unique du bouton dans le groupe (requis pour la selection). */
  id: string;
  /** Label du bouton. */
  children: ReactNode;
  /** Icone affichee avant le label. */
  iconBefore?: IconName;
  /** Icone affichee apres le label. */
  iconAfter?: IconName;
  /** Label du badge affiche apres le texte. */
  badge?: string;
  /** Desactive ce bouton specifique. */
  isDisabled?: boolean;
  /** Additional CSS class. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// ToggleButtonGroup — root container

/**
 * ToggleButtonGroup — Comete Design System
 *
 * Regroupe un ensemble de `ToggleButton` lies dans un layout horizontal.
 * Gere la selection unique ou multiple via React Aria.
 *
 * ```tsx
 * <ToggleButtonGroup selectionMode="single" defaultSelectedKeys={["bold"]}>
 *   <ToggleButton id="bold">Bold</ToggleButton>
 *   <ToggleButton id="italic">Italic</ToggleButton>
 *   <ToggleButton id="underline">Underline</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 */
export function ToggleButtonGroup({
  className,
  children,
  selectionMode = "single",
  ...ariaProps
}: ToggleButtonGroupProps): ReactElement {
  const classNames = [styles.group, className].filter(Boolean).join(" ");
  return (
    <AriaToggleButtonGroup
      {...ariaProps}
      selectionMode={selectionMode}
      className={classNames}
    >
      {children}
    </AriaToggleButtonGroup>
  );
}

ToggleButtonGroup.displayName = "ToggleButtonGroup";

// -----------------------------------------------------------------------
// ToggleButton — individual toggle item

/**
 * ToggleButton — Comete Design System
 *
 * Bouton individuel au sein d'un `ToggleButtonGroup`.
 * Supporte les icones avant/apres et l'etat desactive.
 */
export function ToggleButton({
  children,
  iconBefore,
  iconAfter,
  badge,
  className,
  style,
  ...ariaProps
}: ToggleButtonProps): ReactElement {
  return (
    <AriaToggleButton
      {...ariaProps}
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={style}
    >
      {({ isSelected, isDisabled, isFocusVisible }) => {
        const iconColor = isDisabled
          ? "disabled"
          : isSelected
            ? "inverted"
            : "default";

        return (
          <>
            {iconBefore && (
              <Icon
                icon={iconBefore}
                size={20}
                appearance="outlined"
                color={iconColor}
              />
            )}
            <span className={styles.label}>{children}</span>
            {badge && (
              <Badge
                label={badge}
                appearance="primary-inverted"
                importance="medium"
                isDisabled={isDisabled}
              />
            )}
            {iconAfter && (
              <Icon
                icon={iconAfter}
                size={20}
                appearance="outlined"
                color={iconColor}
              />
            )}
            {isFocusVisible && (
              <FocusRing borderRadius={4} position="inside" />
            )}
          </>
        );
      }}
    </AriaToggleButton>
  );
}

ToggleButton.displayName = "ToggleButton";
