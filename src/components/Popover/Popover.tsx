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
  ...ariaProps
}: PopoverProps): ReactElement {
  return (
    <AriaPopover
      className={[styles.popover, className].filter(Boolean).join(" ")}
      style={style}
      offset={offset}
      shouldFlip
      // NOTE: containerPadding ensures the popover stays within the viewport
      // with an 8px margin. This prevents cascading submenus from going
      // off-screen when space is tight (e.g. Storybook panel open).
      containerPadding={8}
      {...ariaProps}
    >
      {children}
    </AriaPopover>
  );
}

Popover.displayName = "Popover";
