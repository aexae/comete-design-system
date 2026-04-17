// BreadcrumbItem — élément individuel du fil d'Ariane
import { useState, type FocusEvent, type ReactElement, type ReactNode } from "react";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./BreadcrumbItem.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface BreadcrumbItemProps {
  /** Texte affiché dans l'item. */
  label: string;
  /** URL de navigation. Si absent, l'item est rendu comme texte (page courante). */
  href?: string;
  /** Handler de clic (alternatif à href pour la navigation programmatique). */
  onClick?: () => void;
  /** Nom de l'icône affichée avant le libellé. Must match an export from @naxit/comete-icons. */
  iconBefore?: IconName;
  /**
   * Nom de l'icône affichée après le libellé.
   * Utilisée typiquement pour un séparateur visuel (ex : "ChevronRight")
   * dans la variante "Breadcrumbs + Icon".
   */
  iconAfter?: IconName;
  /** Marque cet item comme la page courante (aria-current="page", non cliquable). */
  isCurrent?: boolean;
}

// -----------------------------------------------------------------------
// Hook interne — détecte le focus clavier via :focus-visible

function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLElement>) => {
    setIsFocusVisible(e.currentTarget.matches(":focus-visible"));
  };

  const handleBlur = () => {
    setIsFocusVisible(false);
  };

  return { isFocusVisible, onFocus: handleFocus, onBlur: handleBlur };
}

// -----------------------------------------------------------------------
// Composant interne — élément interactif avec FocusRing

function InteractiveItem({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const focusRing = isFocusVisible ? <FocusRing borderRadius={2} /> : null;

  if (href !== undefined) {
    return (
      <a className={styles.link} href={href} onClick={onClick} onFocus={onFocus} onBlur={onBlur}>
        {children}
        {focusRing}
      </a>
    );
  }
  return (
    <button type="button" className={styles.link} onClick={onClick} onFocus={onFocus} onBlur={onBlur}>
      {children}
      {focusRing}
    </button>
  );
}

// -----------------------------------------------------------------------
// Composant

/**
 * BreadcrumbItem — Comète Design System
 *
 * Élément individuel du fil d'Ariane.
 * Le séparateur "/" est masqué sur le premier item via CSS (`:first-child`).
 *
 * ```tsx
 * // Lien navigable
 * <BreadcrumbItem label="Accueil" href="/" iconBefore="Home" />
 *
 * // Navigation programmatique (onClick sans href)
 * <BreadcrumbItem label="Catalogue" onClick={() => nav("/catalogue")} />
 *
 * // Page courante (non cliquable)
 * <BreadcrumbItem label="Produit" isCurrent />
 * ```
 *
 * @param label      - Libellé de l'item
 * @param href       - URL de destination (rend un lien)
 * @param onClick    - Handler de navigation programmatique
 * @param iconBefore - Icône optionnelle avant le libellé (ex : Home)
 * @param iconAfter  - Icône optionnelle après le libellé (ex : ChevronRight séparateur)
 * @param isCurrent  - Indique la page courante
 */
export function BreadcrumbItem({
  label,
  href,
  onClick,
  iconBefore,
  iconAfter,
  isCurrent = false,
}: BreadcrumbItemProps): ReactElement {
  const isInteractive = (href !== undefined || onClick !== undefined) && !isCurrent;

  const content = (
    <>
      {iconBefore && (
        <span className={styles.iconBefore}>
          <Icon icon={iconBefore} size={20} color="subtle" />
        </span>
      )}
      <span>{label}</span>
      {iconAfter && (
        <span className={styles.iconAfter}>
          <Icon icon={iconAfter} size={16} color="default" />
        </span>
      )}
    </>
  );

  return (
    <li className={styles.item}>
      <span className={styles.separator} aria-hidden="true">/</span>
      {isInteractive ? (
        <InteractiveItem href={href} onClick={onClick}>
          {content}
        </InteractiveItem>
      ) : (
        <span
          className={`${styles.link} ${isCurrent ? styles.current : ""}`}
          aria-current={isCurrent ? "page" : undefined}
        >
          {content}
        </span>
      )}
    </li>
  );
}
