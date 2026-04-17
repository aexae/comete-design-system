// Avatar — Comète Design System
import React from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { Badge } from "../Badge/index.js";
import { FocusRing, type FocusRingBorderRadius } from "../FocusRing/index.js";
import styles from "./Avatar.module.css";

// ----------------------------------------------------------------------

export type AvatarSize =
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "xxlarge"
  | "xxxlarge";

export interface AvatarProps {
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
  /** Notification count — shows a critical badge at the top-right when > 0. */
  notification?: number;
  /** Presence indicator — shows a success dot at the bottom-right. */
  presence?: boolean;
  /**
   * Press handler — makes the avatar interactive (renders as <button>).
   * When omitted the avatar renders as a display-only <div>.
   */
  onPress?: AriaButtonProps["onPress"];
  /**
   * Border colour applied as a box-shadow ring around the avatar.
   * Used by `AvatarGroup` to match the container background.
   * When omitted no ring is rendered.
   */
  borderColor?: string;
  /** Additional CSS class names. */
  className?: string;
}

// ----------------------------------------------------------------------

/** Maps each avatar size to the icon size in pixels (matching size tokens). */
const SIZE_ICON_MAP: Record<AvatarSize, number> = {
  xsmall: 10,   // --size125
  small: 14,    // --size175
  medium: 16,   // --size200
  large: 20,    // --size250
  xlarge: 32,   // --size400
  xxlarge: 48,  // --size600
  xxxlarge: 64, // --size800
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
 * <Avatar src="/photo.jpg" alt="Alice" size="large" />
 *
 * // Interactive
 * <Avatar initials="AB" onPress={() => openProfile()} isSelected={active} />
 * ```
 */
export function Avatar({
  size = "medium",
  src,
  alt,
  initials,
  icon,
  isDisabled = false,
  isSelected = false,
  notification,
  presence,
  onPress,
  borderColor,
  className,
}: AvatarProps): React.ReactElement {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [src]);

  const classNames = [styles.avatar, styles.rounded, styles[size], className]
    .filter(Boolean)
    .join(" ");

  const borderStyle: React.CSSProperties | undefined = borderColor
    ? { boxShadow: `0 0 0 var(--avatar-border-width) ${borderColor}` }
    : undefined;

  // --- Content resolution ---
  // Default fallback is always the Person icon (or custom icon prop).
  // Photo loading: initials (if available) or icon while image loads.
  // XS avatars display a single letter.
  const maxInitialsChars = size === "xsmall" ? 1 : 2;

  const defaultIcon = (
    <span className={styles.iconSlot}>
      <Icon icon={icon ?? "Person"} appearance="filled" size={SIZE_ICON_MAP[size]} />
    </span>
  );

  let content: React.ReactNode;
  if (src) {
    const placeholder = initials ? (
      <span className={styles.initials} aria-hidden="true">
        {initials.slice(0, maxInitialsChars).toUpperCase()}
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
        {initials.slice(0, maxInitialsChars).toUpperCase()}
      </span>
    );
  } else {
    content = defaultIcon;
  }

  const showSelectedRing = isSelected;

  // Accessible label for the container (only needed when there's no <img> with alt)
  const ariaLabel = src ? undefined : (alt ?? initials);

  // Radius token — avatars are always round
  const focusRadius: FocusRingBorderRadius = "round";

  const hasBadge = (notification != null && notification > 0) || presence;

  // Build the core avatar element
  let avatarElement: React.ReactElement;

  if (onPress !== undefined) {
    // Interactive mode — React Aria Button handles hover/pressed/focus/disabled states
    avatarElement = (
      <AriaButton
        className={classNames}
        style={borderStyle}
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
  } else {
    // Display-only mode
    avatarElement = (
      <div
        className={classNames}
        style={borderStyle}
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

  if (!hasBadge) return avatarElement;

  return (
    <div className={styles.badgeWrapper}>
      {avatarElement}
      {notification != null && notification > 0 && (
        <span className={styles.notificationSlot}>
          <Badge
            appearance="critical"
            importance="high"
            label={String(notification)}
            cutoutBorder
            isDisabled={isDisabled}
          />
        </span>
      )}
      {presence && (
        <span className={styles.presenceSlot}>
          <Badge
            appearance="success"
            importance="low"
            cutoutBorder
            isDisabled={isDisabled}
          />
        </span>
      )}
    </div>
  );
}

Avatar.displayName = "Avatar";
