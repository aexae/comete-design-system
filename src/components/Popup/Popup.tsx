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

export type PopupPlacement =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "left-top"
  | "left-bottom"
  | "right"
  | "right-top"
  | "right-bottom";

/** Maps DS placement (kebab-case) to React Aria placement (space-separated).
 *  React Aria uses start/end for cross-axis alignment on top/bottom,
 *  and top/bottom for cross-axis alignment on left/right. */
const PLACEMENT_MAP: Record<PopupPlacement, NonNullable<AriaPopoverProps["placement"]>> = {
  "top": "top",
  "top-left": "top start",
  "top-right": "top end",
  "bottom": "bottom",
  "bottom-left": "bottom start",
  "bottom-right": "bottom end",
  "left": "left",
  "left-top": "left top",
  "left-bottom": "left bottom",
  "right": "right",
  "right-top": "right top",
  "right-bottom": "right bottom",
};

export interface PopupProps {
  /** Élément déclencheur (bouton, etc.). */
  trigger: ReactNode;
  /** Contenu affiché dans le popover. */
  children: ReactNode;
  /**
   * Position du popover par rapport au trigger.
   * @default "bottom-left"
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
 * <Popup trigger={<Button>Ouvrir</Button>} placement="bottom-left">
 *   <p>Contenu du popup</p>
 * </Popup>
 * ```
 */
export function Popup({
  trigger,
  children,
  placement = "bottom-left",
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
        placement={PLACEMENT_MAP[placement]}
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
