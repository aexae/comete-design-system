// TopNav — barre de navigation principale responsive
import type { ReactElement, ReactNode } from "react";
import { Button } from "../Button/index.js";
import styles from "./TopNav.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface TopNavProps {
  /** Logo element displayed on desktop/tablet. */
  logo?: ReactNode;
  /** App/product name displayed next to logo on desktop/tablet. */
  appName?: string;
  /** Page title displayed on mobile (replaces logo+appName). */
  title?: string;
  /** Called when back button is pressed on mobile. Shows a back arrow when defined. */
  onBack?: () => void;
  /** Trailing actions (search, notifications, avatar, etc). Displayed on all breakpoints. */
  children?: ReactNode;
  /** Additional CSS class. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * TopNav — Comete Design System
 *
 * Barre de navigation principale qui s'adapte via CSS media queries
 * au desktop (>=1200px), tablet (>=600px) et mobile (<600px).
 *
 * ```tsx
 * <TopNav logo={<img src="/logo.svg" alt="Logo" />} appName="Mon App" title="Accueil">
 *   <button>Search</button>
 *   <button>Profile</button>
 * </TopNav>
 * ```
 */
export function TopNav({
  logo,
  appName,
  title,
  onBack,
  children,
  className,
  style,
}: TopNavProps): ReactElement {
  return (
    <nav className={[styles.topNav, className].filter(Boolean).join(" ")} style={style}>
      {/* Start section */}
      <div className={styles.start}>
        {onBack && (
          <Button
            appearance="subtle"
            iconBefore="ArrowBack"
            onPress={onBack}
            aria-label="Retour"
            className={styles.backButton}
          />
        )}
        {logo && <span className={styles.logo}>{logo}</span>}
        {appName && <span className={styles.appName}>{appName}</span>}
        {title && <span className={styles.title}>{title}</span>}
      </div>
      {/* End section */}
      {children && <div className={styles.end}>{children}</div>}
    </nav>
  );
}
