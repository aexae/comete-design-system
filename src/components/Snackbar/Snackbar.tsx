// Snackbar — Comète Design System
// Notification transitoire à fond coloré (bold) : icône contextuelle + message
// + action optionnelle + fermeture optionnelle. Aligné sur Banner pour les
// tokens d'apparence.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../Icon/index.js";
import type { IconName } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./Snackbar.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Nature / sévérité de la snackbar — détermine le fond et l'icône. */
export type SnackbarAppearance =
  | "information"
  | "success"
  | "warning"
  | "critical"
  | "discovery";

/** Bouton d'action optionnel affiché à droite du message. */
export interface SnackbarAction {
  /** Libellé du bouton. */
  label: string;
  /** Handler au clic. */
  onPress: () => void;
  /** Icône avant le libellé. */
  iconBefore?: IconName;
  /** Icône après le libellé. */
  iconAfter?: IconName;
}

export interface SnackbarProps {
  /** Nature du message — fond coloré + icône contextuelle. @default "information" */
  appearance?: SnackbarAppearance;
  /** Message affiché. */
  children: ReactNode;
  /** Override de l'icône contextuelle. */
  icon?: IconName;
  /** Action optionnelle (bouton à droite du message). */
  action?: SnackbarAction;
  /** Callback de fermeture — si fourni, un bouton de fermeture s'affiche. */
  onClose?: () => void;
  /** Label accessible du bouton de fermeture. @default "Fermer" */
  closeLabel?: string;
  /**
   * Rôle ARIA. `status` (poli) par défaut ; `alert` (assertif) pour les
   * messages urgents. @default "status"
   */
  role?: "status" | "alert";
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Mapping appearance → icône contextuelle (aligné sur Banner / SectionMessage)

const DEFAULT_ICONS: Record<SnackbarAppearance, IconName> = {
  information: "Info",
  success: "CheckCircle",
  warning: "Warning",
  critical: "Report",
  discovery: "Help",
};

// -----------------------------------------------------------------------
// Composant

/**
 * Snackbar — Comète Design System
 *
 * Notification transitoire à fond coloré. Icône contextuelle résolue selon
 * l'apparence, message, action optionnelle et fermeture optionnelle.
 *
 * ```tsx
 * <Snackbar appearance="success">Sauvegarde effectuée.</Snackbar>
 *
 * <Snackbar
 *   appearance="critical"
 *   action={{ label: "Réessayer", onPress: retry }}
 *   onClose={dismiss}
 * >
 *   Échec de l'envoi.
 * </Snackbar>
 * ```
 */
export function Snackbar({
  appearance = "information",
  children,
  icon,
  action,
  onClose,
  closeLabel = "Fermer",
  role = "status",
  className,
  style,
}: SnackbarProps): ReactElement {
  // Fond warning clair → contenu sombre ; tous les autres fonds bold → inversé.
  const iconColor = appearance === "warning" ? "on-warning" : "inverted";

  return (
    <div
      className={[styles.snackbar, styles[appearance], className]
        .filter(Boolean)
        .join(" ")}
      role={role}
      style={style}
    >
      <Icon
        icon={icon ?? DEFAULT_ICONS[appearance]}
        size={24}
        appearance="filled"
        color={iconColor}
      />

      <div className={styles.message}>{children}</div>

      {action && (
        <AriaButton className={styles.action} onPress={action.onPress}>
          {({ isFocusVisible }) => (
            <>
              {action.iconBefore && (
                <Icon icon={action.iconBefore} size={20} color={iconColor} />
              )}
              <span className={styles.actionLabel}>{action.label}</span>
              {action.iconAfter && (
                <Icon icon={action.iconAfter} size={20} color={iconColor} />
              )}
              {isFocusVisible && <FocusRing borderRadius={3} position="inside" />}
            </>
          )}
        </AriaButton>
      )}

      {onClose && (
        <AriaButton
          className={styles.close}
          onPress={onClose}
          aria-label={closeLabel}
        >
          {({ isFocusVisible }) => (
            <>
              <Icon icon="Close" size={24} color={iconColor} />
              {isFocusVisible && <FocusRing borderRadius={3} position="inside" />}
            </>
          )}
        </AriaButton>
      )}
    </div>
  );
}

Snackbar.displayName = "Snackbar";
