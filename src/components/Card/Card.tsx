// Card — Comète Design System
// Conteneur de surface interactif pour grouper du contenu connexe.
import type {
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { useEffect, useRef, useState } from "react";
import { DragIndicator } from "@naxit/comete-icons";
import { FocusRing } from "../FocusRing/FocusRing.js";
import styles from "./Card.module.css";

// -----------------------------------------------------------------------
// Types publics

export type CardDrag = "top" | "left" | "none";

export type CardAppearance = "outlined" | "default";

export type CardColor =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "critical"
  | "information"
  | "accent"
  | "sunken"
  | "raised";

export interface CardProps {
  /**
   * Position de la poignée de drag.
   * - "none" — pas de drag
   * - "top"  — poignée de drag horizontale en haut
   * - "left" — poignée de drag verticale à gauche
   * @default "none"
   */
  drag?: CardDrag;
  /**
   * Apparence visuelle de la carte.
   * - "outlined" — bordure standard
   * - "default"  — sans bordure
   * @default "outlined"
   */
  appearance?: CardAppearance;
  /**
   * Couleur de fond de la carte.
   * @default "neutral"
   */
  color?: CardColor;
  /** Contenu affiché à l'intérieur de la carte. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Callback déclenché au clic ou à la pression clavier (Enter/Space). Rend la carte actionnable (hover, press, focus ring). */
  onPress?: () => void;
  /** Callback déclenché au début du drag. Requiert drag "top" ou "left". */
  onDrag?: () => void;
  /** Callback déclenché à la fin du drag. Requiert drag "top" ou "left". */
  onDragEnd?: () => void;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Card — Comète Design System
 *
 * Conteneur de surface pour regrouper du contenu connexe.
 * Supporte l'interaction (onPress) et le drag-and-drop (onDrag/onDragEnd).
 *
 * ```tsx
 * import { Card } from "@naxit/comete-design-system";
 *
 * <Card appearance="outlined">
 *   <p>Contenu de la carte</p>
 * </Card>
 * <Card appearance="default" color="sunken">
 *   <p>Fond sunken sans bordure</p>
 * </Card>
 * ```
 */
export function Card({
  drag = "none",
  appearance = "outlined",
  color = "neutral",
  children,
  className,
  onPress,
  onDrag,
  onDragEnd: onDragEndProp,
}: CardProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const hadKeyboardEvent = useRef(false);

  const isActionable = onPress !== undefined;
  const isDraggable = drag === "top" || drag === "left";

  useEffect(() => {
    if (!isActionable) return;
    function onKey() {
      hadKeyboardEvent.current = true;
    }
    function onPointer() {
      hadKeyboardEvent.current = false;
    }
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, [isActionable]);

  function handleFocus() {
    setIsFocusVisible(hadKeyboardEvent.current);
  }

  function handleBlur() {
    setIsFocusVisible(false);
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (dragAreaRef.current?.contains(e.target as Node)) return;
    onPress?.();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPress?.();
    }
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    const preview = document.createElement("div");
    preview.className = `${styles.dragPreview} ${styles[appearance]}`;
    document.body.appendChild(preview);
    e.dataTransfer?.setDragImage(preview, 80, 35);
    dragPreviewRef.current = preview;

    setIsDragging(true);
    onDrag?.();
  }

  function handleDragEnd() {
    if (dragPreviewRef.current) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }

    setIsDragging(false);
    onDragEndProp?.();
  }

  const classNames = [
    styles.card,
    styles[appearance],
    styles[`color-${color}`],
    isDraggable
      ? drag === "top"
        ? styles.dragTop
        : styles.dragLeft
      : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      role={isActionable ? "button" : undefined}
      tabIndex={isActionable ? 0 : undefined}
      onClick={isActionable ? handleClick : undefined}
      onKeyDown={isActionable ? handleKeyDown : undefined}
      onFocus={isActionable ? handleFocus : undefined}
      onBlur={isActionable ? handleBlur : undefined}
      data-interactive={isActionable || undefined}
      data-dragging={isDragging || undefined}
    >
      {isActionable && isFocusVisible && (
        <FocusRing borderRadius={4} position="inside" />
      )}
      {isDraggable && (
        <div
          ref={dragAreaRef}
          className={styles.dragArea}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <DragIndicator
            size={16}
            color="subtlest"
            className={
              drag === "top" ? styles.dragIconRotated : undefined
            }
          />
        </div>
      )}
      {isDraggable ? (
        <div className={styles.content}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

Card.displayName = "Card";
