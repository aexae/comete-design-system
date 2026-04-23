// Spotlight — Comète Design System
// Composant d'onboarding mettant en surbrillance un élément cible
// avec un blanket troué et un dialog flottant positionné.
import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { Button } from "../Button/Button.js";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup.js";
import { ProgressIndicator } from "../ProgressIndicator/ProgressIndicator.js";
import styles from "./Spotlight.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Placement du dialog par rapport à la cible. */
export type SpotlightPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface SpotlightAction {
  /** Texte du bouton. */
  label: string;
  /** Callback au clic. */
  onPress: () => void;
  /** Apparence du bouton. @default "contained" */
  appearance?: "contained" | "subtle" | "link";
}

export interface SpotlightProps {
  /** Ref vers l'élément DOM cible à mettre en surbrillance. */
  targetRef: RefObject<HTMLElement | null>;
  /** Titre affiché dans le header du dialog. */
  title?: string;
  /** Contenu du body (texte descriptif, images, etc.). */
  children: ReactNode;
  /** Actions affichées dans le footer. Remplace les actions par défaut du mode tour. */
  actions?: SpotlightAction[];
  /** Contenu libre du footer. Prioritaire sur `actions`. */
  footer?: ReactNode;
  /** Position du dialog par rapport à la cible. @default "bottom" */
  placement?: SpotlightPlacement;
  /** Décalage (px) entre la cible et le dialog. @default 8 */
  offset?: number;
  /** Padding (px) autour de la cible dans le cutout. @default 4 */
  targetPadding?: number;
  /** Border-radius (px) du cutout autour de la cible. @default 4 */
  targetBorderRadius?: number;
  /** Active l'animation pulse autour de la cible. @default false */
  pulse?: boolean;
  /** Largeur du dialog (px). @default 400 */
  width?: number;
  /** État ouvert/fermé (contrôlé). */
  isOpen?: boolean;
  /** Callback au changement d'état. */
  onOpenChange?: (isOpen: boolean) => void;

  // --- Multi-step tour ---
  /** Index de l'étape courante (0-based). Active le mode tour. */
  activeStep?: number;
  /** Nombre total d'étapes. */
  totalSteps?: number;
  /** Callback pour passer à l'étape suivante. */
  onNext?: () => void;
  /** Callback pour revenir à l'étape précédente. */
  onPrev?: () => void;
  /** Callback pour terminer le tour. */
  onDone?: () => void;
  /** Callback pour ignorer le tour. */
  onSkip?: () => void;

  /** Label accessible du dialog. @default title ?? "Spotlight" */
  "aria-label"?: string;
  /** Classe CSS additionnelle sur le dialog card. */
  className?: string;
}

// -----------------------------------------------------------------------
// Hook interne : mesure du rect cible

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function useTargetRect(
  targetRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ x: r.x, y: r.y, width: r.width, height: r.height });
  }, [targetRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    measure();
  }, [isOpen, measure]);

  useEffect(() => {
    if (!isOpen) return;
    const el = targetRef.current;
    if (!el) return;

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [isOpen, targetRef, measure]);

  return rect;
}

// -----------------------------------------------------------------------
// Positionnement du dialog

interface Position {
  top: number;
  left: number;
}

function computePosition(
  targetRect: Rect,
  dialogWidth: number,
  dialogHeight: number,
  placement: SpotlightPlacement,
  offset: number,
  padding: number,
): Position {
  const tx = targetRect.x - padding;
  const ty = targetRect.y - padding;
  const tw = targetRect.width + padding * 2;
  const th = targetRect.height + padding * 2;

  const [side, align] = placement.includes("-")
    ? (placement.split("-") as [string, string])
    : [placement, "center"];

  let top = 0;
  let left = 0;

  // Vertical positioning
  switch (side) {
    case "top":
      top = ty - dialogHeight - offset;
      break;
    case "bottom":
      top = ty + th + offset;
      break;
    case "left":
    case "right":
      if (align === "start") top = ty;
      else if (align === "end") top = ty + th - dialogHeight;
      else top = ty + th / 2 - dialogHeight / 2;
      break;
  }

  // Horizontal positioning
  switch (side) {
    case "left":
      left = tx - dialogWidth - offset;
      break;
    case "right":
      left = tx + tw + offset;
      break;
    case "top":
    case "bottom":
      if (align === "start") left = tx;
      else if (align === "end") left = tx + tw - dialogWidth;
      else left = tx + tw / 2 - dialogWidth / 2;
      break;
  }

  // Viewport clamping
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;
  left = Math.max(margin, Math.min(left, vw - dialogWidth - margin));
  top = Math.max(margin, Math.min(top, vh - dialogHeight - margin));

  return { top, left };
}

// -----------------------------------------------------------------------
// Actions par défaut (mode tour)

function DefaultTourActions({
  activeStep,
  totalSteps,
  onPrev,
  onNext,
  onDone,
  onSkip,
}: {
  activeStep: number;
  totalSteps: number;
  onPrev?: () => void;
  onNext?: () => void;
  onDone?: () => void;
  onSkip?: () => void;
}): ReactElement {
  const isFirst = activeStep === 0;
  const isLast = activeStep === totalSteps - 1;

  return (
    <>
      <ProgressIndicator
        appearance="inverted"
        size="small"
        spacing="cozy"
        selectedIndex={activeStep}
        total={totalSteps}
        aria-label={`Étape ${activeStep + 1} sur ${totalSteps}`}
      />
      <ButtonGroup>
        {onSkip && (
          <Button appearance="link" onPress={onSkip}>
            Ignorer
          </Button>
        )}
        {!isFirst && onPrev && (
          <Button appearance="subtle" onPress={onPrev}>
            Précédent
          </Button>
        )}
        {isLast ? (
          <Button color="brand" onPress={onDone}>
            Terminer
          </Button>
        ) : (
          <Button color="brand" onPress={onNext}>
            Suivant
          </Button>
        )}
      </ButtonGroup>
    </>
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * Spotlight — Comète Design System
 *
 * Met en surbrillance un élément cible avec un blanket troué
 * et affiche un dialog flottant pour guider l'utilisateur.
 * Idéal pour l'onboarding et la découverte de fonctionnalités.
 *
 * ```tsx
 * import { Spotlight } from "@naxit/comete-design-system";
 *
 * const targetRef = useRef<HTMLButtonElement>(null);
 *
 * <button ref={targetRef}>Ma fonctionnalité</button>
 *
 * <Spotlight
 *   targetRef={targetRef}
 *   title="Nouvelle fonctionnalité"
 *   isOpen={showSpotlight}
 *   onOpenChange={setShowSpotlight}
 *   placement="bottom"
 * >
 *   Découvrez cette nouvelle fonctionnalité qui vous permet de…
 * </Spotlight>
 * ```
 */
export function Spotlight({
  targetRef,
  title,
  children,
  actions,
  footer,
  placement = "bottom",
  offset = 8,
  targetPadding = 4,
  targetBorderRadius = 4,
  pulse = false,
  width = 400,
  isOpen,
  onOpenChange,
  activeStep,
  totalSteps,
  onNext,
  onPrev,
  onDone,
  onSkip,
  "aria-label": ariaLabel,
  className,
}: SpotlightProps): ReactElement {
  const maskId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dialogSize, setDialogSize] = useState({ width: 0, height: 0 });
  const targetRect = useTargetRect(targetRef, isOpen ?? false);

  // Mesure du dialog
  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDialogSize({ width: r.width, height: r.height });
  }, [isOpen, title, children, footer, actions, activeStep]);

  // ResizeObserver sur le dialog
  useEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setDialogSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  const isTour = totalSteps !== undefined && activeStep !== undefined;

  const position =
    targetRect && dialogSize.height > 0
      ? computePosition(
          targetRect,
          dialogSize.width,
          dialogSize.height,
          placement,
          offset,
          targetPadding,
        )
      : null;

  // Footer rendering
  let footerContent: ReactNode = null;
  if (footer) {
    footerContent = footer;
  } else if (actions) {
    footerContent = (
      <ButtonGroup>
        {actions.map((action) => (
          <Button
            key={action.label}
            appearance={action.appearance ?? "contained"}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        ))}
      </ButtonGroup>
    );
  } else if (isTour) {
    footerContent = (
      <DefaultTourActions
        activeStep={activeStep}
        totalSteps={totalSteps}
        onPrev={onPrev}
        onNext={onNext}
        onDone={onDone}
        onSkip={onSkip}
      />
    );
  } else {
    footerContent = (
      <ButtonGroup>
        <Button color="brand" onPress={() => onOpenChange?.(false)}>
          OK
        </Button>
      </ButtonGroup>
    );
  }

  const dialogClasses = [styles.dialog, className].filter(Boolean).join(" ");

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={styles.overlay}
    >
      <AriaModal className={styles.modal}>
        {/* SVG Blanket with cutout */}
        <svg className={styles.blanket} aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.x - targetPadding}
                  y={targetRect.y - targetPadding}
                  width={targetRect.width + targetPadding * 2}
                  height={targetRect.height + targetPadding * 2}
                  rx={targetBorderRadius}
                  ry={targetBorderRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            className={styles.blanketFill}
            mask={`url(#${maskId})`}
          />
          {/* Pulse animation */}
          {pulse && targetRect && (
            <rect
              className={styles.pulse}
              x={targetRect.x - targetPadding}
              y={targetRect.y - targetPadding}
              width={targetRect.width + targetPadding * 2}
              height={targetRect.height + targetPadding * 2}
              rx={targetBorderRadius}
              ry={targetBorderRadius}
            />
          )}
        </svg>

        {/* Dialog */}
        <AriaDialog
          ref={dialogRef}
          className={dialogClasses}
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width,
            opacity: position ? 1 : 0,
          }}
          aria-label={ariaLabel ?? title ?? "Spotlight"}
        >
          {title && (
            <AriaHeading slot="title" className={styles.title}>
              {title}
            </AriaHeading>
          )}
          <div className={styles.body}>{children}</div>
          <div className={styles.footer}>{footerContent}</div>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

Spotlight.displayName = "Spotlight";
