// Logo — Comète Design System
// Affiche un logo (entreprise, logiciel ou gamme) depuis @aexae/comete-logos avec support thème.
import type { ReactElement } from "react";
import type { LogoEntity, LogoAppearance, LogoFormat, LogoTaglineAlign } from "@aexae/comete-logos";
import { logoRegistry } from "@aexae/comete-logos";

// -----------------------------------------------------------------------
// Types publics

export type { LogoEntity, LogoAppearance, LogoFormat, LogoTaglineAlign };

/** @deprecated Use LogoEntity instead. */
export type LogoProduct = LogoEntity;

/** @deprecated Use LogoTaglineAlign instead. */
export type LogoSuffix = LogoTaglineAlign;

export interface LogoProps {
  /**
   * Entité représentée par le logo : l'entreprise (`comete-company`, signature
   * possible), le logiciel (`comete-software`, jamais de signature) ou une gamme
   * (`ontime`, `link`…). @default "comete-software"
   */
  entity?: LogoEntity;
  /** Apparence visuelle. @default "brand" */
  appearance?: LogoAppearance;
  /** Format d'affichage : icône seule, logo complet ou wordmark (dessin Figma des lettres, « o » en anneau, sans pictogramme). @default "logo" */
  format?: LogoFormat;
  /** Mode d'affichage de la particule (nom produit ou tagline). @default "inline" (`"column"` pour `comete-company`) */
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
 * Affiche le logo d'une entité (Comète entreprise, Comète logiciel, OnTime, Link, Café Comète, etc.) dans
 * l'apparence souhaitée. Les couleurs sont résolues depuis les design tokens
 * CSS (`--logo-comete-*`) via les classes `.comete-logo--{appearance}`
 * embarquées dans `@aexae/comete-logos`. Le thème light/dark est
 * automatique via `[data-theme]` sur `<html>`.
 *
 * ```tsx
 * import { Logo } from "@aexae/comete-design-system";
 *
 * <Logo entity="comete-software" />
 * <Logo entity="cafe" taglineAlign="column" />
 * <Logo entity="comete-software" appearance="inverted" format="icon" size={24} />
 * <Logo entity="comete-company" />   // logo de l'entreprise, avec la signature
 * ```
 */
export function Logo({
  entity = "comete-software",
  appearance = "brand",
  format = "logo",
  taglineAlign,
  size = 32,
  "aria-label": ariaLabel,
  className,
  style,
}: LogoProps): ReactElement | null {
  const LogoComponent = logoRegistry[entity];

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
