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
 * Resolves the inner content of the avatar.
 * Priority order: photo > initials > icon > empty.
 *
 * @param src      - Photo URL
 * @param alt      - Alt text for the photo
 * @param initials - Fallback text (1–2 chars)
 * @param icon     - Fallback icon node
 * @returns The React node to render inside the avatar container
 */
function resolveContent(
  src: string | undefined,
  alt: string | undefined,
  initials: string | undefined,
  icon: IconName | undefined
): React.ReactNode {
  if (src) {
    return <img src={src} alt={alt ?? ""} className={styles.photo} />;
  }
  if (initials) {
    return (
      <span className={styles.initials} aria-hidden="true">
        {initials.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  if (icon) {
    return (
      <span className={styles.iconSlot}>
        <Icon icon={icon} variant="filled" />
      </span>
    );
  }
  return null;
}

// ----------------------------------------------------------------------

/**
 * Avatar — Comète Design System
 *
 * Displays a user avatar with photo, initials, or icon fallback.
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
 *
 * @param appearance - Shape: "square" | "rounded". @default "rounded"
 * @param size       - Avatar size. @default "medium"
 * @param src        - Photo URL (takes priority over initials/icon).
 * @param alt        - Alt text / accessible label.
 * @param initials   - 1–2 letter fallback when no photo.
 * @param icon       - Icon fallback when no photo and no initials.
 * @param isDisabled - Disabled state.
 * @param isSelected - Selected/highlighted state.
 * @param onPress    - Press handler — enables interactive mode.
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
  const classNames = [styles.avatar, styles[appearance], styles[size], className]
    .filter(Boolean)
    .join(" ");

  const content = resolveContent(src, alt, initials, icon);

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
            {isFocusVisible && <FocusRing borderRadius={focusRadius} position="inside" />}
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
    </div>
  );
}

Avatar.displayName = "Avatar";
