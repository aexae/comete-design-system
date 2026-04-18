// Drawer — Comète Design System
// Panneau latéral accessible avec slide-in/out, stacking et swipe.
import { useCallback, useId, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from "react-aria-components";
import { Button } from "../Button/Button.js";
import { useDrawerStack } from "./DrawerContext.js";
import type { DrawerPlacement, DrawerStacking } from "./DrawerContext.js";
import styles from "./Drawer.module.css";

// -----------------------------------------------------------------------
// Types publics

export type DrawerSize = "narrow" | "medium" | "wide" | "extended" | "full";

export type { DrawerPlacement, DrawerStacking };

export interface DrawerProps {
  /** État ouvert/fermé (contrôlé). */
  isOpen: boolean;
  /** Callback au changement d'état. */
  onOpenChange: (isOpen: boolean) => void;
  /** Côté d'apparition du drawer. @default "left" */
  placement?: DrawerPlacement;
  /** Taille (preset ou valeur CSS). @default "medium" */
  size?: DrawerSize | (string & {});
  /** Comportement de stacking entre drawers multiples. @default "overlay" */
  stacking?: DrawerStacking;
  /** Active le geste swipe-to-close. @default false */
  swipeable?: boolean;
  /** Contenu du drawer. */
  children: ReactNode;
  /** Label accessible (requis si pas de DrawerHeader). */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Size presets & stacking constants

const SIZE_PRESETS = new Set<string>(["narrow", "medium", "wide", "extended", "full"]);

/** Inset (px) applied to the free edges of stacked drawers behind the topmost. */
const STACK_INSET = 10;

/** Brightness reduction per stack depth (0.06 = 6% darker per level behind). */
const STACK_SHADE = 0.06;

// -----------------------------------------------------------------------
// Swipe helpers

const SWIPE_THRESHOLD = 100;

function getSwipeAxis(placement: DrawerPlacement): "x" | "y" {
  return placement === "left" || placement === "right" ? "x" : "y";
}

function getSwipeSign(placement: DrawerPlacement): 1 | -1 {
  // Positive delta = swipe in close direction
  return placement === "left" || placement === "top" ? -1 : 1;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Drawer — Comète Design System
 *
 * Panneau qui glisse depuis un bord de l'écran. Supporte le stacking
 * (overlay ou push), le swipe-to-close et 4 directions.
 *
 * ```tsx
 * import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from "@naxit/comete-design-system";
 *
 * <Drawer isOpen={isOpen} onOpenChange={setIsOpen} placement="right" size="wide">
 *   <DrawerHeader onClose={() => setIsOpen(false)}>Filtres</DrawerHeader>
 *   <DrawerBody>Contenu scrollable</DrawerBody>
 *   <DrawerFooter><Button>Appliquer</Button></DrawerFooter>
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onOpenChange,
  placement = "left",
  size = "medium",
  stacking = "overlay",
  swipeable = false,
  children,
  "aria-label": ariaLabel,
  className,
}: DrawerProps): ReactElement {
  const uid = useId();
  const { stack, register, unregister } = useDrawerStack();

  // Register/unregister in the drawer stack (layout effect for synchronous updates)
  useLayoutEffect(() => {
    if (isOpen) {
      register({ id: uid, placement, stacking, size });
    } else {
      unregister(uid);
    }
    return () => unregister(uid);
  }, [isOpen, uid, placement, stacking, size, register, unregister]);

  // Only the first drawer in the stack renders the blanket
  const isFirstInStack = stack.length === 0 || stack[0]?.id === uid;
  const showBlanket = isFirstInStack;

  // Stacking: compute visual offset for this drawer
  const myIndex = stack.findIndex((e) => e.id === uid);

  // Push mode: every push-stacked drawer above me contributes its size to my offset.
  // We sum them so a chain of pushes stacks side-by-side correctly.
  const pushersAboveMe = myIndex >= 0
    ? stack.slice(myIndex + 1).filter((e) => e.stacking === "push")
    : [];
  const hasPusher = pushersAboveMe.length > 0;

  const pushStyle: CSSProperties | undefined = hasPusher
    ? buildPushStyle(placement, pushersAboveMe.map((p) => p.size))
    : undefined;

  // Overlay mode: card-stack effect — drawers behind the topmost are shorter
  // (inset on perpendicular edges) and extend past it on the free axis so a
  // strip peeks out from behind.
  const drawersAboveMe = myIndex >= 0 ? stack.length - 1 - myIndex : 0;
  const depthInset = !hasPusher && drawersAboveMe > 0
    ? drawersAboveMe * STACK_INSET
    : 0;
  const depthShade = !hasPusher && drawersAboveMe > 0
    ? drawersAboveMe * STACK_SHADE
    : 0;

  // Push chain: drawer is either being pushed or is itself pushing others.
  // We remove the border-radius so adjacent push drawers look like a single
  // seamless multi-pane surface.
  const isPushingSomething = stacking === "push" && myIndex > 0;
  const isInPushChain = hasPusher || isPushingSomething;

  // Size: preset class or custom CSS value
  const isPreset = SIZE_PRESETS.has(size);
  const sizeClass = isPreset ? styles[size as DrawerSize] : undefined;
  const customSizeStyle: CSSProperties | undefined = !isPreset
    ? buildCustomSizeStyle(placement, size)
    : undefined;

  const drawerClasses = [
    styles.drawer,
    styles[placement],
    sizeClass,
    isInPushChain ? styles.inPushChain : undefined,
    className,
  ].filter(Boolean).join(" ");

  // Swipe state
  const swipeRef = useRef<{ startX: number; startY: number; dragging: boolean }>({
    startX: 0, startY: 0, dragging: false,
  });
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!swipeable) return;
    const touch = e.touches[0];
    if (!touch) return;
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, dragging: true };
  }, [swipeable]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeable || !swipeRef.current.dragging || !drawerRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const axis = getSwipeAxis(placement);
    const sign = getSwipeSign(placement);
    const delta = axis === "x"
      ? (touch.clientX - swipeRef.current.startX) * sign
      : (touch.clientY - swipeRef.current.startY) * sign;
    // Only allow swiping in the close direction (negative delta)
    if (delta >= 0) {
      drawerRef.current.style.transform = "";
      return;
    }
    const prop = axis === "x" ? "translateX" : "translateY";
    drawerRef.current.style.transform = `${prop}(${delta / sign}px)`;
    drawerRef.current.style.transition = "none";
  }, [swipeable, placement]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeable || !swipeRef.current.dragging || !drawerRef.current) return;
    swipeRef.current.dragging = false;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const axis = getSwipeAxis(placement);
    const sign = getSwipeSign(placement);
    const delta = axis === "x"
      ? (touch.clientX - swipeRef.current.startX) * sign
      : (touch.clientY - swipeRef.current.startY) * sign;

    drawerRef.current.style.transition = "";
    if (delta < -SWIPE_THRESHOLD) {
      onOpenChange(false);
    }
    drawerRef.current.style.transform = "";
  }, [swipeable, placement, onOpenChange]);

  // z-index increases per stack position so newer drawers appear on top
  const stackZIndex = myIndex >= 0 ? myIndex : 0;

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={showBlanket ? styles.overlay : styles.overlayTransparent}
      style={{ zIndex: `calc(var(--z-index-overlay) + ${stackZIndex * 2})` }}
    >
      <AriaModal className={styles.modal} style={{ zIndex: `calc(var(--z-index-modal) + ${stackZIndex * 2})` }}>
        <AriaDialog
          ref={drawerRef}
          className={drawerClasses}
          style={{
            ...customSizeStyle,
            ...pushStyle,
            "--_depth-inset": depthInset > 0 ? `${depthInset}px` : undefined,
            "--_depth-shade": depthShade > 0 ? depthShade : undefined,
          } as CSSProperties}
          aria-label={ariaLabel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {swipeable && <div className={styles.swipeHandle} />}
          {children}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

Drawer.displayName = "Drawer";

// -----------------------------------------------------------------------
// Sub-components

export interface DrawerHeaderProps {
  /** Contenu du header (titre texte ou élément custom). */
  children: ReactNode;
  /** Affiche un bouton fermer. */
  onClose?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

/**
 * DrawerHeader — En-tête du drawer avec titre et bouton fermer optionnel.
 */
export function DrawerHeader({
  children,
  onClose,
  className,
}: DrawerHeaderProps): ReactElement {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      {typeof children === "string" ? (
        <AriaHeading slot="title" className={styles.title}>{children}</AriaHeading>
      ) : (
        children
      )}
      {onClose && (
        <Button
          appearance="subtle"
          iconBefore="CloseSmallFaded"
          aria-label="Fermer"
          onPress={onClose}
          className={styles.closeButton}
        />
      )}
    </div>
  );
}

DrawerHeader.displayName = "DrawerHeader";

export interface DrawerBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * DrawerBody — Contenu scrollable du drawer.
 */
export function DrawerBody({ children, className }: DrawerBodyProps): ReactElement {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

DrawerBody.displayName = "DrawerBody";

export interface DrawerFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * DrawerFooter — Pied du drawer (boutons d'action).
 */
export function DrawerFooter({ children, className }: DrawerFooterProps): ReactElement {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

DrawerFooter.displayName = "DrawerFooter";

// -----------------------------------------------------------------------
// Helpers

function buildCustomSizeStyle(
  placement: DrawerPlacement,
  size: string,
): CSSProperties {
  const isHorizontal = placement === "left" || placement === "right";
  const value = `calc(${size} + var(--_depth-inset))`;
  return isHorizontal ? { width: value } : { height: value };
}

/** Preset name → CSS length. % values resolve against the viewport for fixed-positioned drawers. */
const PRESET_TO_CSS: Record<DrawerSize, string> = {
  narrow: "30%",
  medium: "50%",
  wide: "75%",
  extended: "90%",
  full: "100%",
};

function resolveSizeValue(size: string): string {
  return (PRESET_TO_CSS as Record<string, string>)[size] ?? size;
}

/**
 * Push mode: the previous drawer is pushed aside by overriding its anchor
 * edge (left/right/top/bottom) with the pusher's resolved size. Using
 * position (not transform) because translateX(%) is relative to the element's
 * own size, whereas position % is relative to the viewport (what we want).
 */
function buildPushStyle(
  placement: DrawerPlacement,
  pusherSizes: string[],
): CSSProperties {
  const values = pusherSizes.map(resolveSizeValue);
  const offset = values.length === 1 ? values[0] : `calc(${values.join(" + ")})`;
  // Shift the anchored edge inward by the cumulative pusher size(s)
  return { [placement]: offset } as CSSProperties;
}

