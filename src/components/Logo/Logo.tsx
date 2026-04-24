// Logo — Comète Design System
// Affiche un logo produit depuis @naxit/comete-logos avec support thème.
import type { ReactElement } from "react";
import type { LogoProduct, LogoAppearance, LogoFormat, LogoTaglineAlign } from "@naxit/comete-logos";
import { logoRegistry } from "@naxit/comete-logos";

// -----------------------------------------------------------------------
// Types publics

export type { LogoProduct, LogoAppearance, LogoFormat, LogoTaglineAlign };

/** @deprecated Use LogoTaglineAlign instead. */
export type LogoSuffix = LogoTaglineAlign;

export interface LogoProps {
  /** Nom du produit. @default "comete" */
  product?: LogoProduct;
  /** Apparence visuelle. @default "brand" */
  appearance?: LogoAppearance;
  /** Format d'affichage : icône seule ou logo complet. @default "logo" */
  format?: LogoFormat;
  /** Mode d'affichage de la particule (nom produit ou tagline). @default "inline" */
  taglineAlign?: LogoTaglineAlign;
  /** Hauteur en pixels. La largeur s'adapte proportionnellement. @default 32 */
  size?: number;
  /** Label accessible. Quand fourni, le logo est exposé aux technologies d'assistance. */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Logo — Comète Design System
 *
 * Affiche un logo produit (Comète, OnTime, Link, Café Comète, etc.) dans
 * l'apparence souhaitée. Les couleurs sont résolues depuis les design tokens
 * CSS (`--logo-comete-*`) via les classes `.comete-logo--{appearance}`
 * embarquées dans `@naxit/comete-logos`. Le thème light/dark est
 * automatique via `[data-theme]` sur `<html>`.
 *
 * ```tsx
 * import { Logo } from "@naxit/comete-design-system";
 *
 * <Logo product="comete" />
 * <Logo product="cafe" taglineAlign="column" />
 * <Logo product="comete" appearance="inverse" format="icon" size={24} />
 * ```
 */
export function Logo({
  product = "comete",
  appearance = "brand",
  format = "logo",
  taglineAlign = "inline",
  size = 32,
  "aria-label": ariaLabel,
  className,
  style,
}: LogoProps): ReactElement | null {
  const LogoComponent = logoRegistry[product];

  const ariaProps: Record<string, string | boolean> = ariaLabel
    ? { "aria-label": ariaLabel, role: "img" }
    : { "aria-hidden": true };

  return (
    <span className={className} {...ariaProps} style={style}>
      <LogoComponent appearance={appearance} format={format} taglineAlign={taglineAlign} size={size} />
    </span>
  );
}

Logo.displayName = "Logo";
