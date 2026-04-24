// Popup — Comète Design System
// Conteneur flottant positionné relativement à un trigger.
import type { ReactElement, ReactNode } from "react";
import {
  DialogTrigger,
  Dialog as AriaDialog,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { Popover } from "../Popover/Popover.js";
import styles from "./Popup.module.css";

// -----------------------------------------------------------------------
// Types publics

export type PopupPlacement = AriaPopoverProps["placement"];

export interface PopupProps {
  /** Élément déclencheur (bouton, etc.). */
  trigger: ReactNode;
  /** Contenu affiché dans le popover. */
  children: ReactNode;
  /**
   * Position du popover par rapport au trigger.
   * @default "bottom start"
   */
  placement?: PopupPlacement;
  /** Décalage vertical en px. @default 4 */
  offset?: number;
  /** État ouvert contrôlé. */
  isOpen?: boolean;
  /** Callback au changement d'état ouvert/fermé. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Classe CSS additionnelle sur le popover. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Popup — Comète Design System
 *
 * Conteneur flottant déclenché par un élément interactif.
 * Positionné automatiquement via React Aria + Popover DS.
 *
 * ```tsx
 * import { Popup, Button } from "@naxit/comete-design-system";
 *
 * <Popup trigger={<Button>Ouvrir</Button>} placement="bottom start">
 *   <p>Contenu du popup</p>
 * </Popup>
 * ```
 */
export function Popup({
  trigger,
  children,
  placement = "bottom start",
  offset = 4,
  isOpen,
  onOpenChange,
  className,
  style,
}: PopupProps): ReactElement {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      {trigger}
      <Popover
        placement={placement}
        offset={offset}
        className={[styles.popup, className].filter(Boolean).join(" ")}
        style={style}
      >
        <AriaDialog className={styles.dialog}>{children}</AriaDialog>
      </Popover>
    </DialogTrigger>
  );
}

Popup.displayName = "Popup";
