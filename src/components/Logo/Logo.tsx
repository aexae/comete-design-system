// Logo — Comète Design System
// Affiche un logo produit depuis @naxit/comete-logos avec support thème.
import type { ReactElement } from "react";
import type { LogoProduct, LogoAppearance, LogoType } from "@naxit/comete-logos";
import { logoRegistry } from "@naxit/comete-logos";

// -----------------------------------------------------------------------
// Types publics

export type { LogoProduct, LogoAppearance, LogoType };

export interface LogoProps {
  /** Nom du produit. @default "comete" */
  product?: LogoProduct;
  /** Apparence visuelle. @default "brand" */
  appearance?: LogoAppearance;
  /** Type d'affichage : icône seule ou logo complet. @default "logo" */
  type?: LogoType;
  /** Hauteur en pixels. La largeur s'adapte proportionnellement. @default 32 */
  size?: number;
  /** Label accessible. Quand fourni, le logo est exposé aux technologies d'assistance. */
  label?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Logo — Comète Design System
 *
 * Affiche un logo produit (Comète, OnTime, Link, etc.) dans l'apparence
 * souhaitée. Les couleurs sont résolues depuis les design tokens CSS
 * (`--logo-comete-*`) via les classes `.comete-logo--{appearance}`
 * embarquées dans `@naxit/comete-logos`. Le thème light/dark est
 * automatique via `[data-theme]` sur `<html>`.
 *
 * ```tsx
 * import { Logo } from "@naxit/comete-design-system";
 *
 * <Logo product="comete" />
 * <Logo product="comete" appearance="inverse" type="icon" size={24} />
 * ```
 */
export function Logo({
  product = "comete",
  appearance = "brand",
  type = "logo",
  size = 32,
  label,
  className,
}: LogoProps): ReactElement | null {
  const LogoComponent = logoRegistry[product];

  const ariaProps: Record<string, string | boolean> = label
    ? { "aria-label": label, role: "img" }
    : { "aria-hidden": true };

  return (
    <span className={className} {...ariaProps}>
      <LogoComponent appearance={appearance} type={type} size={size} />
    </span>
  );
}

Logo.displayName = "Logo";
