// AvatarGroup — Comète Design System
import React from "react";
import { Button as AriaButton } from "react-aria-components";
import { Avatar, type AvatarSize } from "../Avatar/index.js";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  MenuPopover,
} from "../Menu/index.js";
import type { Selection } from "react-aria-components";
import styles from "./AvatarGroup.module.css";

// ----------------------------------------------------------------------
// Types publics

/**
 * Mode de l'AvatarGroup.
 * - "display"  — statique, aucune interaction
 * - "navigate" — chaque avatar est cliquable (onItemPress), +N ouvre un menu de navigation
 * - "select"   — chaque avatar est sélectionnable (toggle), +N ouvre un menu avec checkboxes
 */
export type AvatarGroupMode = "display" | "navigate" | "select";

export interface AvatarGroupProps {
  /** Avatar items to display in the stack. */
  items: AvatarGroupItem[];
  /**
   * Items non affichés dans le stack. Rend un indicateur "+N" cliquable
   * qui ouvre un menu avec ces items.
   */
  overflowItems?: AvatarGroupItem[];
  /** Keys of currently selected items (mode "select" only, controlled). */
  selectedKeys?: string[];
  /** Callback when selection changes (mode "select" only). */
  onSelectionChange?: (keys: string[]) => void;
  /** Size applied to every avatar in the group. @default "medium" */
  size?: AvatarSize;
  /**
   * Border colour for the ring that visually separates stacked avatars.
   * Should match the background behind the group.
   * @default "var(--background-surface-default)"
   */
  borderColor?: string;
  /**
   * Mode de l'AvatarGroup.
   * @default "display"
   */
  mode?: AvatarGroupMode;
  /** Press handler forwarded to each avatar (mode "navigate" only). */
  onItemPress?: (item: AvatarGroupItem, index: number) => void;
  /** Accessible label for the group. @default "Avatar group" */
  "aria-label"?: string;
  /** Additional CSS class names on the root element. */
  className?: string;
}

export interface AvatarGroupItem {
  /** Unique key for the avatar. Falls back to index when omitted. */
  key?: string;
  /** Full name — displayed in the overflow menu. */
  name?: string;
  /** Photo URL. */
  src?: string;
  /** Alt text / accessible label. */
  alt?: string;
  /** Initials fallback. */
  initials?: string;
}

// ----------------------------------------------------------------------

/** Overlap per avatar size — ~25 % of avatar diameter. */
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
 * ```tsx
 * // Display only
 * <AvatarGroup items={users} />
 *
 * // Navigate — click opens profile
 * <AvatarGroup items={visible} overflowItems={hidden} mode="navigate" onItemPress={openProfile} />
 *
 * // Select — toggle selection + overflow with checkboxes
 * <AvatarGroup items={visible} overflowItems={hidden} mode="select"
 *   selectedKeys={selected} onSelectionChange={setSelected} />
 * ```
 */
export function AvatarGroup({
  items,
  overflowItems,
  selectedKeys,
  onSelectionChange,
  size = "medium",
  borderColor = "var(--background-surface-default)",
  mode = "display",
  onItemPress,
  "aria-label": ariaLabel = "Avatar group",
  className,
}: AvatarGroupProps): React.ReactElement {
  const overflowCount = overflowItems?.length ?? 0;
  const overlapPx = SIZE_OVERLAP[size];
  const total = items.length + (overflowCount > 0 ? 1 : 0);
  const isInteractive = mode !== "display";

  const selectedSet = React.useMemo(
    () => new Set(selectedKeys),
    [selectedKeys],
  );

  const hasOverflowSelection = React.useMemo(
    () => mode === "select" && overflowItems != null && overflowItems.some((item) => selectedSet.has(item.key ?? "")),
    [mode, overflowItems, selectedSet],
  );

  function handleToggle(item: AvatarGroupItem) {
    if (mode !== "select" || !onSelectionChange) return;
    const key = item.key ?? "";
    const next = selectedSet.has(key)
      ? [...selectedSet].filter((k) => k !== key)
      : [...selectedSet, key];
    onSelectionChange(next);
  }

  function handleOverflowSelectionChange(keys: Selection) {
    if (!onSelectionChange) return;
    if (keys === "all") return;
    onSelectionChange([...keys] as string[]);
  }

  return (
    <div
      className={[styles.group, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item, i) => {
        const key = item.key ?? String(i);
        return (
          <div
            key={key}
            className={[styles.item, isInteractive ? styles.interactive : ""].filter(Boolean).join(" ")}
            style={{
              marginLeft: i === 0 ? 0 : -overlapPx,
              zIndex: total - i,
            }}
          >
            <Avatar
              src={item.src}
              alt={item.alt}
              initials={item.initials}
              size={size}
              borderColor={borderColor}
              isSelected={mode === "select" ? selectedSet.has(key) : undefined}
              onPress={
                mode === "navigate"
                  ? () => onItemPress?.(item, i)
                  : mode === "select"
                    ? () => handleToggle(item)
                    : undefined
              }
            />
          </div>
        );
      })}
      {overflowCount > 0 && (
        <div
          className={styles.overflow}
          style={{ marginLeft: -overlapPx }}
        >
          <MenuTrigger>
            <AriaButton className={styles.overflowTrigger}>
              <Avatar
                initials={`+${overflowCount}`}
                size={size}
                borderColor={borderColor}
                isSelected={hasOverflowSelection}
              />
            </AriaButton>
            <MenuPopover>
              <Menu
                aria-label="Autres membres"
                mode={mode === "select" ? "selectMultiple" : "default"}
                selectedKeys={mode === "select" ? selectedSet : undefined}
                onSelectionChange={mode === "select" ? handleOverflowSelectionChange : undefined}
              >
                {overflowItems!.map((item, i) => {
                  const key = item.key ?? String(i);
                  return (
                    <MenuItem
                      key={key}
                      id={key}
                      onAction={
                        mode === "navigate" && onItemPress
                          ? () => onItemPress(item, items.length + i)
                          : undefined
                      }
                    >
                      {item.name ?? item.initials ?? key}
                    </MenuItem>
                  );
                })}
              </Menu>
            </MenuPopover>
          </MenuTrigger>
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = "AvatarGroup";
