// Génération de la famille de tokens `brand-*` à partir d'une seule couleur HEX
// (la charte du client). Voir docs/adr/0001-theming-couleur-multi-tenant.md.
//
// Principe : la teinte (H) et la chroma (C) viennent du client ; la luminosité (L)
// de chaque palier est **fixée par le DS** (normalisée par rôle), avec clamp de gamut.
// En clair, le contraste des fonds `bold` (palier 700, texte inversé 5,3:1) et `boldest`
// (palier 950, navy, 12:1) avec le texte inversé est ainsi garanti par construction. En sombre,
// `bold` passe en 600/500/400 et `boldest` en 200/100/50 (tokens 0.45.0) : voir le TODO des
// tokens pour le contraste du texte sur `bold` sombre, encore à arbitrer.

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

// Mapping token → palier, miroir rôle pour rôle de la famille `comete-*` des tokens
// (tokens/theme/light.json et dark.json) : un composant rendu en `brand` sans
// BrandProvider doit rendre comme en `comete`. Tenir les deux en phase.
// Suffixe de custom property → palier de la rampe.
const LIGHT_MAP: Record<string, Stop> = {
  "background-brand-bold-default": 700,
  "background-brand-bold-hovered": 800,
  "background-brand-bold-pressed": 900,
  "background-brand-boldest-default": 950,
  "background-brand-boldest-hovered": 900,
  "background-brand-boldest-pressed": 800,
  "background-brand-subtle-default": 200,
  "background-brand-subtle-hovered": 300,
  "background-brand-subtle-pressed": 400,
  "background-brand-subtlest-default": 100,
  "background-brand-subtlest-hovered": 200,
  "background-brand-subtlest-pressed": 300,
  "border-brand-bold": 900,
  "border-brand-boldest": 950,
  "border-brand-subtle": 200,
  "icon-brand-default": 800,
  "icon-brand-boldest": 950,
  "text-brand-default": 900,
  "text-brand-hovered": 800,
  "text-brand-pressed": 700,
  "text-brand-boldest": 950,
};

const DARK_MAP: Record<string, Stop> = {
  "background-brand-bold-default": 600,
  "background-brand-bold-hovered": 500,
  "background-brand-bold-pressed": 400,
  "background-brand-boldest-default": 200,
  "background-brand-boldest-hovered": 100,
  "background-brand-boldest-pressed": 50,
  "background-brand-subtle-default": 800,
  "background-brand-subtle-hovered": 700,
  "background-brand-subtle-pressed": 600,
  "background-brand-subtlest-default": 950,
  "background-brand-subtlest-hovered": 900,
  "background-brand-subtlest-pressed": 800,
  "border-brand-bold": 100,
  "border-brand-boldest": 50,
  "border-brand-subtle": 800,
  "icon-brand-default": 200,
  "icon-brand-boldest": 50,
  "text-brand-default": 100,
  "text-brand-hovered": 200,
  "text-brand-pressed": 300,
  "text-brand-boldest": 50,
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
