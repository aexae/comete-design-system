// Drawer — Comète Design System
// Panneau latéral accessible avec slide-in/out, stacking et swipe.
import { useCallback, useEffect, useId, useRef } from "react";
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

/** Pixel offset per stack depth for the overlay card-stack effect. */
const STACK_OFFSET = 8;
/** Scale reduction per stack depth. */
const STACK_SCALE_STEP = 0.02;

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

  // Register/unregister in the drawer stack
  useEffect(() => {
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
  const drawersAboveMe = myIndex >= 0 ? stack.length - 1 - myIndex : 0;

  // Push mode: offset if a newer drawer pushes this one
  const pusher = myIndex >= 0 && myIndex < stack.length - 1
    ? stack.find((e, i) => i > myIndex && e.stacking === "push")
    : undefined;

  const pushStyle: CSSProperties | undefined = pusher
    ? buildPushTransform(placement, pusher.size)
    : undefined;

  // Overlay mode: card-stack effect — drawers behind the topmost are
  // offset toward the edge and slightly scaled down, creating depth.
  const overlayStyle: CSSProperties | undefined =
    drawersAboveMe > 0 && !pusher
      ? buildOverlayDepthStyle(placement, drawersAboveMe)
      : undefined;

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
          style={{ ...customSizeStyle, ...pushStyle, ...overlayStyle }}
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
  return isHorizontal ? { width: size } : { height: size };
}

function buildPushTransform(
  placement: DrawerPlacement,
  pusherSize: string,
): CSSProperties {
  const sign = placement === "left" || placement === "top" ? "" : "-";
  const isHorizontal = placement === "left" || placement === "right";
  const prop = isHorizontal ? "translateX" : "translateY";
  return {
    transform: `${prop}(${sign}${pusherSize})`,
    transition: "transform 200ms ease-out",
  };
}

/**
 * Card-stack depth effect for overlay stacking.
 * Drawers behind the topmost are offset toward the edge and scaled down.
 *
 * For a left drawer with depth=1:
 *   → translateX(-12px) scale(0.97) — pushed left, slightly smaller
 * For a right drawer with depth=1:
 *   → translateX(12px) scale(0.97)
 */
function buildOverlayDepthStyle(
  placement: DrawerPlacement,
  depth: number,
): CSSProperties {
  const offset = depth * STACK_OFFSET;
  const scale = 1 - depth * STACK_SCALE_STEP;
  const isHorizontal = placement === "left" || placement === "right";
  const sign = placement === "left" || placement === "top" ? -1 : 1;
  const prop = isHorizontal ? "translateX" : "translateY";

  return {
    transform: `${prop}(${sign * offset}px) scale(${scale})`,
    transition: "transform 200ms ease-out, scale 200ms ease-out",
    transformOrigin: placement,
  };
}
