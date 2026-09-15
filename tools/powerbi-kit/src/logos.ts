// ---------------------------------------------------------------------------
// logos — @aexae/comete-logos → SVG uniques prêts pour Power BI
// ---------------------------------------------------------------------------
//
// Deux mécanismes du package reposent sur le CSS et doivent être rejoués ici :
//
// 1. Les couleurs passent par des variables `--_logo-*` définies par les
//    classes `.comete-logo--{appearance}` de `logos.css`. On reproduit ce
//    mapping pour les résoudre en hex.
// 2. Chaque icône produit embarque DEUX corps SVG (`__light` et `__dark`) ;
//    `logos.css` en masque un selon l'apparence et le thème. Sans CSS, Power BI
//    peindrait les deux l'un sur l'autre : on supprime le corps inactif.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { logoRegistry, type LogoProps } from "@aexae/comete-logos";
import { composeSvg } from "./compose.ts";
import { resolveVars, type ThemeMode } from "./tokens.ts";

export type LogoAppearance = "brand" | "neutral" | "inverse";
export type LogoFormat = "icon" | "logo";
export type LogoTaglineAlign = "none" | "inline" | "column";
export type LogoProduct = keyof typeof logoRegistry;

/** Mapping repris de `logos.css` : apparence → tokens de thème. */
const APPEARANCE_VARS: Record<LogoAppearance, Record<string, string>> = {
  brand: {
    "--_logo-text": "var(--logo-comete-default)",
    "--_logo-icon": "var(--logo-comete-default)",
    "--_logo-subtle": "var(--logo-comete-subtle)",
    "--_logo-gradient-light": "var(--logo-comete-gradient-light)",
    "--_logo-gradient-dark": "var(--logo-comete-gradient-dark)",
  },
  neutral: {
    "--_logo-text": "var(--logo-comete-neutral)",
    "--_logo-icon": "var(--logo-comete-neutral)",
    "--_logo-subtle": "var(--logo-comete-neutral)",
    "--_logo-gradient-light": "var(--logo-comete-neutral)",
    "--_logo-gradient-dark": "var(--logo-comete-neutral)",
  },
  inverse: {
    "--_logo-text": "var(--logo-comete-inverted)",
    "--_logo-icon": "var(--logo-comete-inverted)",
    "--_logo-subtle": "var(--logo-comete-subtle)",
    "--_logo-gradient-light": "var(--logo-comete-gradient-light)",
    "--_logo-gradient-dark": "var(--logo-comete-gradient-dark)",
  },
};

/**
 * Corps d'icône visible selon l'apparence et le thème — table reprise des
 * commentaires de `logos.css`. `inverse` s'inverse en thème sombre pour rendre
 * un logo identique à `brand` en clair.
 */
function visibleBody(appearance: LogoAppearance, theme: ThemeMode): "light" | "dark" {
  if (appearance === "brand") return theme === "dark" ? "dark" : "light";
  if (appearance === "inverse") return theme === "dark" ? "light" : "dark";
  return "dark"; // neutral : toujours DarkBody
}

/** Retire le <svg> du corps masqué par le CSS pour l'apparence courante. */
function dropHiddenBody(markup: string, keep: "light" | "dark"): string {
  const hidden = keep === "light" ? "dark" : "light";
  const pattern = new RegExp(`<svg[^>]*class="comete-logo__${hidden}"[\\s\\S]*?<\\/svg>`, "g");
  return markup.replace(pattern, "");
}

export interface RenderLogoOptions {
  product: LogoProduct;
  appearance: LogoAppearance;
  format: LogoFormat;
  taglineAlign: LogoTaglineAlign;
  /** Hauteur de la ligne de wordmark en px (le reste est proportionnel). */
  size: number;
  theme: ThemeMode;
  tokens: Map<string, string>;
}

export interface RenderedLogo {
  svg: string;
  width: number;
  height: number;
}

/** Rend un logo en SVG unique, autonome et sans `var()` résiduelle. */
export function renderLogo(options: RenderLogoOptions): RenderedLogo {
  const Component = logoRegistry[options.product];
  if (!Component) throw new Error(`Logo inconnu : ${options.product}`);

  const props: LogoProps = {
    appearance: options.appearance,
    format: options.format,
    taglineAlign: options.taglineAlign,
    size: options.size,
  };
  const markup = dropHiddenBody(
    renderToStaticMarkup(createElement(Component, props)),
    visibleBody(options.appearance, options.theme),
  );

  // Table de résolution : tokens de thème + variables d'apparence du logo.
  const table = new Map(options.tokens);
  for (const [name, value] of Object.entries(APPEARANCE_VARS[options.appearance])) {
    table.set(name, value);
  }

  const composed = composeSvg(markup, (svg) =>
    resolveVars(svg, table)
      .replace(/\sclass="[^"]*"/g, "")
      .replace(/\saria-hidden="[^"]*"/g, ""),
  );

  if (composed.svg.includes("var(")) {
    throw new Error(`var() non résolue dans le logo ${options.product}/${options.format}`);
  }
  return composed;
}

/** Tous les produits disponibles. */
export function availableProducts(): LogoProduct[] {
  return Object.keys(logoRegistry).sort() as LogoProduct[];
}
