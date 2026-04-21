import type { ReactElement, ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconComponentProps, IconName } from "../Icon";
import styles from "./SectionMessage.module.css";

// ----------------------------------------------------------------------

export type SectionMessageAppearance =
  | "information"
  | "success"
  | "warning"
  | "critical"
  | "discovery";

export interface SectionMessageProps {
  /**
   * Visual appearance that conveys the intent of the message.
   * @default "information"
   */
  appearance?: SectionMessageAppearance;
  /** Optional title displayed above the content. */
  title?: string;
  /** Body content of the section message. */
  children?: ReactNode;
  /**
   * Actions rendered below the content (typically link-style buttons).
   * Use `<Button appearance="link" spacing="compact">` for each action.
   */
  actions?: ReactNode;
  /**
   * Custom icon override. Defaults to an icon matching the appearance.
   * Pass `null` to hide the icon entirely.
   */
  icon?: ReactNode | null;
}

// ----------------------------------------------------------------------

const DEFAULT_ICONS: Record<SectionMessageAppearance, IconName> = {
  information: "Info",
  success: "CheckCircle",
  warning: "Warning",
  critical: "Report",
  discovery: "Help",
};

const ICON_COLORS: Record<SectionMessageAppearance, IconComponentProps["color"]> = {
  information: "information",
  success: "success",
  warning: "warning",
  critical: "critical",
  discovery: "accent",
};

// ----------------------------------------------------------------------

/**
 * SectionMessage — Comète Design System
 *
 * Displays an inline message to inform, warn, or guide the user.
 * Each appearance provides a distinct background color and default icon.
 *
 * ```tsx
 * <SectionMessage appearance="warning" title="Attention">
 *   Vérifiez les informations avant de continuer.
 * </SectionMessage>
 * ```
 */
export function SectionMessage({
  appearance = "information",
  title,
  children,
  actions,
  icon,
}: SectionMessageProps): ReactElement {
  const resolvedIcon =
    icon === undefined ? (
      <Icon
        icon={DEFAULT_ICONS[appearance]}
        color={ICON_COLORS[appearance]}
        appearance="filled"
      />
    ) : (
      icon
    );

  return (
    <div
      className={[styles.sectionMessage, styles[appearance]].join(" ")}
      role="group"
    >
      {resolvedIcon && (
        <div className={styles.icon}>{resolvedIcon}</div>
      )}
      <div className={styles.container}>
        {title && <div className={styles.title}>{title}</div>}
        {children && <div className={styles.content}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
