// Banner — barre de notification pleine largeur
import type { ReactElement, ReactNode } from "react";
import { Icon } from "../Icon/index.js";
import type { IconName } from "../Icon/index.js";
import styles from "./Banner.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Sévérité / nature du banner. */
export type BannerAppearance =
  | "warning"
  | "critical"
  | "announcement"
  | "success"
  | "information";

// -----------------------------------------------------------------------
// Mapping appearance → icône contextuelle (aligné sur SectionMessage)

const DEFAULT_ICONS: Record<BannerAppearance, IconName> = {
  warning: "Warning",
  critical: "Report",
  announcement: "Campaign",
  success: "CheckCircle",
  information: "Info",
};

export interface BannerProps {
  /** Sévérité du message — détermine le fond coloré et la couleur de l'icône. */
  appearance: BannerAppearance;
  /** Contenu affiché dans la zone message (texte, liens, boutons…). */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Banner — Comète Design System
 *
 * Barre de notification pleine largeur affichant un message d'avertissement
 * ou critique avec une icône contextuelle.
 *
 * ```tsx
 * <Banner appearance="warning">Mise à jour programmée ce soir à 22h.</Banner>
 * <Banner appearance="critical">Impossible de se connecter au service.</Banner>
 * <Banner appearance="announcement">Nouvelle fonctionnalité disponible.</Banner>
 * <Banner appearance="success">Sauvegarde effectuée avec succès.</Banner>
 * <Banner appearance="information">Maintenance prévue la semaine prochaine.</Banner>
 * ```
 *
 * @param appearance - Nature : "warning" (jaune), "critical" (rouge), "announcement"
 *                     (neutre sombre), "success" (vert), "information" (bleu). L'icône
 *                     est résolue automatiquement selon l'apparence.
 * @param children   - Contenu du message
 */
export function Banner({ appearance, children, className, style }: BannerProps): ReactElement {
  return (
    <div
      className={[styles.banner, styles[appearance], className].filter(Boolean).join(" ")}
      role="alert"
      style={style}
    >
      <Icon
        icon={DEFAULT_ICONS[appearance]}
        size={24}
        appearance="filled"
        // warning a un fond clair (texte sombre) ; tous les autres fonds bold → icône inversée
        color={appearance === "warning" ? "on-warning" : "inverted"}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
