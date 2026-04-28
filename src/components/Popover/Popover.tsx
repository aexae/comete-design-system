// Popover — Comète Design System
// Overlay flottant positionné relativement à un trigger.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import styles from "./Popover.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface PopoverProps
  extends Omit<AriaPopoverProps, "className" | "style" | "children"> {
  /** Contenu affiché dans le popover. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Inline styles (ex : CSS custom properties pour la largeur). */
  style?: CSSProperties;
  /** Aligne la largeur du popover sur celle du trigger. @default false */
  matchTriggerWidth?: boolean;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Popover — Comète Design System
 *
 * Overlay flottant positionné automatiquement par React Aria.
 * À utiliser avec un `DialogTrigger` ou `MenuTrigger` comme parent.
 *
 * ```tsx
 * import { Popover } from "@naxit/comete-design-system";
 * import { DialogTrigger, Dialog } from "react-aria-components";
 *
 * <DialogTrigger>
 *   <Button>Ouvrir</Button>
 *   <Popover>
 *     <Dialog>Contenu du popover</Dialog>
 *   </Popover>
 * </DialogTrigger>
 * ```
 */
export function Popover({
  children,
  className,
  style,
  offset = 4,
  matchTriggerWidth = false,
  shouldFlip = true,
  containerPadding = 8,
  ...ariaProps
}: PopoverProps): ReactElement {
  return (
    <AriaPopover
      {...ariaProps}
      className={[styles.popover, matchTriggerWidth && styles.matchTriggerWidth, className].filter(Boolean).join(" ")}
      style={style}
      offset={offset}
      shouldFlip={shouldFlip}
      // NOTE: containerPadding garantit que le popover reste dans le viewport
      // avec une marge minimale (équivalent du `shift` de Floating UI / Radix).
      // Combiné à shouldFlip, donne le comportement flip+shift attendu sur les
      // sous-menus en cascade : flip à l'opposé puis shift pour rester visible.
      // L'ordre (après le spread) garantit qu'on ne se fait pas écraser par
      // un context Aria parent (SubmenuTrigger).
      containerPadding={containerPadding}
    >
      {children}
    </AriaPopover>
  );
}

Popover.displayName = "Popover";
