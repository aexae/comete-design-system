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

export type DrawerSize = "narrow" | "medium" | "wide" | "extended" | "full" | "auto";

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
  /**
   * Affiche un handle en haut du drawer ; le glisser dans le sens de fermeture
   * (≥ 40px, souris ou tactile) ferme le drawer. @default false
   */
  swipeable?: boolean;
  /** Contenu du drawer. */
  children: ReactNode;
  /** Label accessible (requis si pas de DrawerHeader). */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Size presets & stacking constants

const SIZE_PRESETS = new Set<string>(["narrow", "medium", "wide", "extended", "full"]);

/** Inset (px) applied to the free edges of stacked drawers behind the topmost. */
const STACK_INSET = 10;

/** Brightness reduction per stack depth (0.06 = 6% darker per level behind). */
const STACK_SHADE = 0.06;

// -----------------------------------------------------------------------
// Swipe helpers — fermeture par drag du handle (pointer : souris + tactile)

/** Drag (px) au-delà duquel relâcher le handle ferme le drawer. */
const SWIPE_CLOSE_THRESHOLD = 40;

/** Distance de drag dans le sens de FERMETURE (positif = vers la fermeture). */
function closeDistance(placement: DrawerPlacement, dx: number, dy: number): number {
  if (placement === "bottom") return dy;
  if (placement === "top") return -dy;
  if (placement === "right") return dx;
  return -dx; // left
}

/** Transform de suivi pendant le drag, dans le sens de fermeture. */
function closeTransform(placement: DrawerPlacement, dist: number): string {
  if (placement === "top") return `translateY(${-dist}px)`;
  if (placement === "left") return `translateX(${-dist}px)`;
  if (placement === "right") return `translateX(${dist}px)`;
  return `translateY(${dist}px)`; // bottom
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
 * import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from "@aexae/comete-design-system";
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
  style,
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
  const sizeClass = isPreset ? styles[size as Exclude<DrawerSize, "auto">] : undefined;
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

  // Drag du handle pour fermer (pointer events → souris + tactile).
  const dragRef = useRef<{ x: number; y: number; dragging: boolean }>({
    x: 0, y: 0, dragging: false,
  });
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (!swipeable) return;
    dragRef.current = { x: e.clientX, y: e.clientY, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [swipeable]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging || !drawerRef.current) return;
    const dist = closeDistance(
      placement,
      e.clientX - dragRef.current.x,
      e.clientY - dragRef.current.y,
    );
    drawerRef.current.style.transition = "none";
    // ne suit que dans le sens de fermeture
    drawerRef.current.style.transform = dist > 0 ? closeTransform(placement, dist) : "";
  }, [placement]);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging || !drawerRef.current) return;
    dragRef.current.dragging = false;
    const dist = closeDistance(
      placement,
      e.clientX - dragRef.current.x,
      e.clientY - dragRef.current.y,
    );
    drawerRef.current.style.transition = "";
    drawerRef.current.style.transform = "";
    if (dist >= SWIPE_CLOSE_THRESHOLD) {
      onOpenChange(false);
    }
  }, [placement, onOpenChange]);

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
            ...style,
          } as CSSProperties}
          aria-label={ariaLabel}
        >
          {swipeable && (
            <div
              className={styles.swipeHandle}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
            />
          )}
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
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

/**
 * DrawerHeader — En-tête du drawer avec titre et bouton fermer optionnel.
 */
export function DrawerHeader({
  children,
  onClose,
  className,
  style,
}: DrawerHeaderProps): ReactElement {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")} style={style}>
      {typeof children === "string" ? (
        <AriaHeading slot="title" className={styles.title}>{children}</AriaHeading>
      ) : (
        children
      )}
      {onClose && (
        <Button
          appearance="subtle"
          iconBefore="CloseSmall"
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
  // "auto" : hauteur/largeur ajustée au contenu — pas de calc (calc(auto + …) invalide).
  const value = size === "auto" ? "auto" : `calc(${size} + var(--_depth-inset))`;
  return isHorizontal ? { width: value } : { height: value };
}

/** Preset name → CSS length. % values resolve against the viewport for fixed-positioned drawers. */
const PRESET_TO_CSS: Record<DrawerSize, string> = {
  narrow: "30%",
  medium: "50%",
  wide: "75%",
  extended: "90%",
  full: "100%",
  auto: "auto",
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
  return { [placement]: offset };
}

