// Popover — Comète Design System
// Overlay flottant positionné relativement à un trigger.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { ScrollArea } from "../ScrollArea/ScrollArea.js";
import styles from "./Popover.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface PopoverProps extends Omit<AriaPopoverProps, "className" | "style" | "children"> {
  /** Contenu affiché dans le popover. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Inline styles (ex : CSS custom properties pour la largeur). */
  style?: CSSProperties;
  /** Aligne la largeur du popover sur celle du trigger. @default false */
  matchTriggerWidth?: boolean;
  /**
   * Pose le contenu dans une zone défilante (`ScrollArea`). @default true
   *
   * À passer à `false` quand le contenu DOIT rester son propre défileur.
   * C'est le cas des collections React Aria (`ListBox`, `Menu`) : après
   * avoir amené l'élément focalisé dans la vue, `scrollIntoViewport`
   * RECENTRE la collection dans ses parents défilants. Quand la collection
   * est elle-même le défileur, cette correction sort aussitôt
   * (`scrollView === element`) ; dès que le défileur est un ancêtre, elle
   * s'exécute et repositionne le défilement au milieu de la collection —
   * l'élément focalisé disparaît de l'écran à la flèche bas.
   */
  isScrollable?: boolean;
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
 * import { Popover } from "@aexae/comete-design-system";
 * import { DialogTrigger, Dialog } from "react-aria-components";
 *
 * <DialogTrigger>
 *   <Button>Ouvrir</Button>
 *   <Popover>
 *     <Dialog>Contenu du popover</Dialog>
 *   </Popover>
 * </DialogTrigger>
 * ```
 *
 * Le contenu est posé dans un `ScrollArea` : le plafond de hauteur du popover
 * est une sécurité (un overlay ne dépasse jamais du viewport), et c'est la
 * zone défilante qui l'absorbe. En deçà du plafond elle ne défile pas et son
 * ascenseur n'existe pas. Les contenus qui défilent déjà d'eux-mêmes passent
 * `isScrollable={false}` — voir cette prop.
 */
export function Popover({
  children,
  className,
  style,
  offset = 4,
  matchTriggerWidth = false,
  isScrollable = true,
  shouldFlip = true,
  containerPadding = 8,
  ...ariaProps
}: PopoverProps): ReactElement {
  return (
    <AriaPopover
      {...ariaProps}
      className={[
        styles.popover,
        isScrollable && styles.hasScroll,
        matchTriggerWidth && styles.matchTriggerWidth,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
      {/* Le popover ne défile plus lui-même : la zone défilante est un
          `ScrollArea`, comme partout ailleurs dans le DS. Son pouce flotte
          au-dessus du contenu au lieu de lui prendre un couloir de 8px, et
          les ombres de débordement portent le signal quand il s'est estompé. */}
      {isScrollable ? (
        <ScrollArea visibility="auto" hasOverflowShadows className={styles.scroll}>
          {children}
        </ScrollArea>
      ) : (
        children
      )}
    </AriaPopover>
  );
}

Popover.displayName = "Popover";
