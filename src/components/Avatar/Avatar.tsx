// Avatar — Comète Design System
import React from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { FocusRing, type FocusRingBorderRadius } from "../FocusRing/index.js";
import styles from "./Avatar.module.css";

// ----------------------------------------------------------------------

export type AvatarAppearance = "square" | "rounded";
export type AvatarSize =
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge";

export interface AvatarProps {
  /** Visual shape. @default "rounded" */
  appearance?: AvatarAppearance;
  /** Size. @default "medium" */
  size?: AvatarSize;
  /** Photo URL — renders an <img>. Takes priority over initials and icon. */
  src?: string;
  /** Alt text for the photo / accessible label on the container. */
  alt?: string;
  /** 1–2 letters shown when no photo is provided. */
  initials?: string;
  /** Icon name shown when no photo and no initials. Must match an export from @naxit/comete-icons. */
  icon?: IconName;
  /** Disabled state. */
  isDisabled?: boolean;
  /** Selected/highlighted state. */
  isSelected?: boolean;
  /**
   * Press handler — makes the avatar interactive (renders as <button>).
   * When omitted the avatar renders as a display-only <div>.
   */
  onPress?: AriaButtonProps["onPress"];
  /** Additional CSS class names. */
  className?: string;
}

// ----------------------------------------------------------------------

/** Maps each avatar size to its Icon size in pixels. */
const SIZE_ICON_MAP: Record<AvatarSize, number> = {
  xsmall: 10,
  small: 14,
  medium: 18,
  large: 22,
  xlarge: 48,
  xxlarge: 64,
};

/** Maps each avatar size to its matching FocusRingBorderRadius token. */
const SIZE_RADIUS_MAP: Record<AvatarSize, FocusRingBorderRadius> = {
  xsmall: 2,
  small: 3,
  medium: 4,
  large: 6,
  xlarge: 8,
  xxlarge: 12,
};

// ----------------------------------------------------------------------

/**
 * Avatar — Comète Design System
 *
 * Displays a user avatar with photo, initials, or icon fallback.
 * Default fallback (no initials, no photo) is the Person icon.
 * When a photo is loading: initials are shown if available, otherwise the Person icon.
 * Interactive when `onPress` is provided (renders as `<button>` via React Aria).
 * Display-only otherwise (renders as `<div role="img">`).
 *
 * ```tsx
 * // Display-only
 * <Avatar initials="AB" />
 * <Avatar src="/photo.jpg" alt="Alice" appearance="square" size="large" />
 *
 * // Interactive
 * <Avatar initials="AB" onPress={() => openProfile()} isSelected={active} />
 * ```
 */
export function Avatar({
  appearance = "rounded",
  size = "medium",
  src,
  alt,
  initials,
  icon,
  isDisabled = false,
  isSelected = false,
  onPress,
  className,
}: AvatarProps): React.ReactElement {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [src]);

  const classNames = [styles.avatar, styles[appearance], styles[size], className]
    .filter(Boolean)
    .join(" ");

  // --- Content resolution ---
  // Default fallback is always the Person icon (or custom icon prop).
  // Photo loading: initials (if available) or icon while image loads.
  const defaultIcon = (
    <span className={styles.iconSlot}>
      <Icon icon={icon ?? "Person"} variant="filled" size={SIZE_ICON_MAP[size]} />
    </span>
  );

  let content: React.ReactNode;
  if (src) {
    const placeholder = initials ? (
      <span className={styles.initials} aria-hidden="true">
        {initials.slice(0, 2).toUpperCase()}
      </span>
    ) : (
      defaultIcon
    );
    content = (
      <>
        {!imageLoaded && placeholder}
        <img
          src={src}
          alt={alt ?? ""}
          className={[styles.photo, !imageLoaded ? styles.photoLoading : undefined]
            .filter(Boolean)
            .join(" ")}
          onLoad={() => setImageLoaded(true)}
        />
      </>
    );
  } else if (initials) {
    content = (
      <span className={styles.initials} aria-hidden="true">
        {initials.slice(0, 2).toUpperCase()}
      </span>
    );
  } else {
    content = defaultIcon;
  }

  // Selected ring only shown when a photo is loaded
  const showSelectedRing = isSelected && src && imageLoaded;

  // Accessible label for the container (only needed when there's no <img> with alt)
  const ariaLabel = src ? undefined : (alt ?? initials);

  // Radius token matching the current size/appearance — used by FocusRing
  const focusRadius: FocusRingBorderRadius =
    appearance === "rounded" ? "round" : SIZE_RADIUS_MAP[size];

  // Interactive mode — React Aria Button handles hover/pressed/focus/disabled states
  if (onPress !== undefined) {
    return (
      <AriaButton
        className={classNames}
        onPress={onPress}
        isDisabled={isDisabled}
        data-selected={isSelected || undefined}
        aria-label={ariaLabel}
      >
        {({ isFocusVisible }) => (
          <>
            {content}
            {(isFocusVisible || showSelectedRing) && (
              <FocusRing borderRadius={focusRadius} position="inside" />
            )}
          </>
        )}
      </AriaButton>
    );
  }

  // Display-only mode
  return (
    <div
      className={classNames}
      data-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      {content}
      {showSelectedRing && <FocusRing borderRadius={focusRadius} position="inside" />}
    </div>
  );
}

Avatar.displayName = "Avatar";
