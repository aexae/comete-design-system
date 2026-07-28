// Génération de la famille de tokens `brand-*` à partir d'une seule couleur HEX
// (la charte du client). Voir docs/adr/0001-theming-couleur-multi-tenant.md.
//
// Principe : la teinte (H) et la chroma (C) viennent du client ; la luminosité (L)
// de chaque palier est **fixée par le DS** (normalisée par rôle), avec clamp de gamut.
// Le contraste des fonds `bold` avec le texte inversé est ainsi garanti par construction.

import { hexToRgb, oklchToHex, rgbToOklch } from "./oklch.js";

type Stop = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

// Cibles de luminosité OKLCH par palier (du plus clair au plus sombre).
const STOP_L: Record<Stop, number> = {
  50: 0.971,
  100: 0.936,
  200: 0.886,
  300: 0.808,
  400: 0.724,
  500: 0.637,
  600: 0.55,
  700: 0.464,
  800: 0.377,
  900: 0.29,
  950: 0.23,
};

/** Construit la rampe tonale complète (teinte/chroma du seed, L imposée par palier). */
function buildScale(seedHex: string): Record<Stop, string> {
  const { c, h } = rgbToOklch(hexToRgb(seedHex));
  const stops = Object.keys(STOP_L).map(Number) as Stop[];
  const scale = {} as Record<Stop, string>;
  for (const stop of stops) {
    scale[stop] = oklchToHex({ l: STOP_L[stop], c, h });
  }
  return scale;
}

// Mapping token → palier, en miroir de la structure du bleu Comète.
// Suffixe de custom property → palier de la rampe.
const LIGHT_MAP: Record<string, Stop> = {
  "background-brand-bold-default": 950,
  "background-brand-bold-hovered": 900,
  "background-brand-bold-pressed": 800,
  "background-brand-subtler-default": 200,
  "background-brand-subtler-hovered": 300,
  "background-brand-subtler-pressed": 400,
  "background-brand-subtlest-default": 100,
  "background-brand-subtlest-hovered": 200,
  "background-brand-subtlest-pressed": 300,
  "border-brand-bold": 900,
  "border-brand-subtle": 200,
  "icon-brand": 800,
  "text-brand": 900,
};

const DARK_MAP: Record<string, Stop> = {
  "background-brand-bold-default": 50,
  "background-brand-bold-hovered": 100,
  "background-brand-bold-pressed": 200,
  "background-brand-subtler-default": 800,
  "background-brand-subtler-hovered": 700,
  "background-brand-subtler-pressed": 600,
  "background-brand-subtlest-default": 950,
  "background-brand-subtlest-hovered": 900,
  "background-brand-subtlest-pressed": 800,
  "border-brand-bold": 100,
  "border-brand-subtle": 800,
  "icon-brand": 200,
  "text-brand": 100,
};

export interface BrandTheme {
  /** { "--background-brand-bold-default": "#…", … } pour le thème clair. */
  light: Record<string, string>;
  /** idem pour le thème sombre. */
  dark: Record<string, string>;
}

/**
 * Génère l'ensemble des tokens `brand-*` (clair + sombre) à partir d'une couleur HEX.
 * Fonction pure — mémoïsable par `seedHex`.
 *
 * @param seedHex couleur de marque du client, ex. `"#FF6A00"`.
 */
export function generateBrandTheme(seedHex: string): BrandTheme {
  const scale = buildScale(seedHex);
  const apply = (map: Record<string, Stop>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [name, stop] of Object.entries(map)) {
      out[`--${name}`] = scale[stop];
    }
    return out;
  };
  return { light: apply(LIGHT_MAP), dark: apply(DARK_MAP) };
}

const block = (selector: string, vars: Record<string, string>): string => {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
};

export interface BrandThemeCssOptions {
  /** Sélecteur cible. Défaut `:root` (mono-tenant). Ex. `[data-brand="acme"]`. */
  scope?: string;
}

/**
 * Produit le CSS d'override de la famille `brand-*`, pour les thèmes clair et sombre.
 * Le bloc sombre est scopé sous `[data-theme="dark"]` (mécanisme du ThemeProvider).
 */
export function brandThemeToCss(seedHex: string, options: BrandThemeCssOptions = {}): string {
  const scope = options.scope ?? ":root";
  const { light, dark } = generateBrandTheme(seedHex);
  const darkSelector =
    scope === ":root"
      ? '[data-theme="dark"]'
      : `${scope}[data-theme="dark"], [data-theme="dark"] ${scope}`;
  return `${block(scope, light)}\n${block(darkSelector, dark)}`;
}
