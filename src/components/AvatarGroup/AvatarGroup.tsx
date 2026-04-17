// AvatarGroup — Comète Design System
import React from "react";
import { Avatar, type AvatarProps, type AvatarSize } from "../Avatar/index.js";
import styles from "./AvatarGroup.module.css";

// ----------------------------------------------------------------------

export interface AvatarGroupProps {
  /** Avatar items to display in the stack. */
  items: AvatarGroupItem[];
  /** Number of extra avatars not shown (renders a "+N" indicator). @default 0 */
  overflow?: number;
  /** Size applied to every avatar in the group. @default "medium" */
  size?: AvatarSize;
  /**
   * Border colour for the ring that visually separates stacked avatars.
   * Should match the background behind the group.
   * @default "var(--background-surface-default)"
   */
  borderColor?: string;
  /** Press handler for the overflow "+N" indicator. */
  onOverflowPress?: AvatarProps["onPress"];
  /** Press handler forwarded to each avatar. */
  onItemPress?: (item: AvatarGroupItem, index: number) => void;
  /** Accessible label for the group. @default "Avatar group" */
  "aria-label"?: string;
  /** Additional CSS class names on the root element. */
  className?: string;
}

export interface AvatarGroupItem {
  /** Unique key for the avatar. Falls back to index when omitted. */
  key?: string;
  /** Photo URL. */
  src?: string;
  /** Alt text / accessible label. */
  alt?: string;
  /** Initials fallback. */
  initials?: string;
}

// ----------------------------------------------------------------------

/** Overlap (px) per avatar size — ~25 % of avatar diameter. */
const SIZE_OVERLAP: Record<AvatarSize, number> = {
  xsmall: 4,
  small: 6,
  medium: 8,
  large: 10,
  xlarge: 16,
  xxlarge: 24,
  xxxlarge: 32,
};

// ----------------------------------------------------------------------

/**
 * AvatarGroup — Comète Design System
 *
 * Displays a horizontal stack of overlapping avatars with an optional "+N"
 * overflow indicator.
 *
 * Pass `borderColor` to match the container background so the separation
 * ring blends in (same approach as Atlassian's avatar group).
 *
 * ```tsx
 * <AvatarGroup items={users} overflow={3} size="large" />
 * ```
 */
export function AvatarGroup({
  items,
  overflow = 0,
  size = "medium",
  borderColor = "var(--background-surface-default)",
  onOverflowPress,
  "aria-label": ariaLabel = "Avatar group",
  onItemPress,
  className,
}: AvatarGroupProps): React.ReactElement {
  const overlap = SIZE_OVERLAP[size];
  const total = items.length + (overflow > 0 ? 1 : 0);

  return (
    <div
      className={[styles.group, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, i) => (
        <div
          key={item.key ?? i}
          className={styles.item}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: total - i,
          }}
        >
          <Avatar
            src={item.src}
            alt={item.alt}
            initials={item.initials}
            size={size}
            borderColor={borderColor}
            onPress={
              onItemPress ? () => onItemPress(item, i) : undefined
            }
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={styles.overflow}
          style={{ marginLeft: -overlap }}
        >
          <Avatar
            initials={`+${overflow}`}
            size={size}
            onPress={onOverflowPress}
          />
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = "AvatarGroup";
