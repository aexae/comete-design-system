import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconComponentProps, IconName } from "../Icon";
import styles from "./SectionMessage.module.css";

// ----------------------------------------------------------------------

export type SectionMessageAppearance =
  | "information"
  | "success"
  | "warning"
  | "critical"
  | "accentPurple"
  | "accentTeal"
  | "accentTurquoise"
  | "accentMagenta"
  | "accentBlueGrey";

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
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

// ----------------------------------------------------------------------

const DEFAULT_ICONS: Record<SectionMessageAppearance, IconName> = {
  information: "Info",
  success: "CheckCircle",
  warning: "Warning",
  critical: "Report",
  accentPurple: "Help",
  accentTeal: "Help",
  accentTurquoise: "Help",
  accentMagenta: "Help",
  accentBlueGrey: "Help",
};

const ICON_COLORS: Record<SectionMessageAppearance, IconComponentProps["color"]> = {
  information: "information",
  success: "success",
  warning: "warning",
  critical: "critical",
  accentPurple: "accentPurple",
  accentTeal: "accentTeal",
  accentTurquoise: "accentTurquoise",
  accentMagenta: "accentMagenta",
  accentBlueGrey: "accentBlueGrey",
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
  className,
  style,
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
      className={[styles.sectionMessage, styles[appearance], className]
        .filter(Boolean)
        .join(" ")}
      style={style}
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
