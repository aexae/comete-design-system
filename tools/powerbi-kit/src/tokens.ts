// ---------------------------------------------------------------------------
// tokens — résolution des CSS custom properties de @aexae/comete-design-tokens
// ---------------------------------------------------------------------------
//
// Power BI ne comprend ni `var()` ni `currentColor` : tout doit être résolu en
// valeur littérale avant encodage. Ce module lit `comete-tokens.css` et expose
// une table `--token → valeur` par thème.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export type ThemeMode = "light" | "dark";

/** Chemin du CSS de tokens, résolu depuis le package installé. */
export function tokensCssPath(): string {
  const pkg = require.resolve("@aexae/comete-design-tokens/package.json");
  return pkg.replace(/package\.json$/, "build/css/comete-tokens.css");
}

/**
 * Extrait le corps de chaque bloc dont le sélecteur matche `selector`.
 * Parcours à profondeur d'accolades pour supporter les blocs imbriqués
 * (`@media { :root { … } }`).
 */
function extractBlocks(css: string, selector: RegExp): string[] {
  const out: string[] = [];
  for (const match of css.matchAll(selector)) {
    const open = css.indexOf("{", match.index);
    if (open === -1) continue;
    let depth = 0;
    for (let i = open; i < css.length; i += 1) {
      const char = css[i];
      if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          out.push(css.slice(open + 1, i));
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Table `--nom → valeur` pour un thème donné.
 *
 * Le thème clair est la fusion de tous les blocs `:root` (hors `@media dark`).
 * Le thème sombre part du clair puis applique `[data-theme="dark"]`, ce qui
 * reproduit la cascade réelle du navigateur.
 */
export function loadTokens(mode: ThemeMode = "light"): Map<string, string> {
  const css = readFileSync(tokensCssPath(), "utf8");

  // Le bloc `@media (prefers-color-scheme: dark)` contient un `:root` qui
  // fausserait la lecture du thème clair : on le retire d'abord.
  const mediaDark = css.indexOf("@media (prefers-color-scheme: dark)");
  const lightSource = mediaDark === -1 ? css : css.slice(0, mediaDark);

  const bodies = extractBlocks(lightSource, /:root\s*(?=\{)/g);
  if (mode === "dark") bodies.push(...extractBlocks(css, /\[data-theme="dark"\]\s*(?=\{)/g));

  const table = new Map<string, string>();
  for (const body of bodies) {
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      if (name && value) table.set(name, value.trim());
    }
  }
  return table;
}

/**
 * Remplace récursivement les `var(--token[, fallback])` par leur valeur.
 * Les tokens inconnus lèvent : un `var()` qui survit produirait une icône
 * invisible dans Power BI, échouer tôt vaut mieux qu'un kit silencieusement cassé.
 */
export function resolveVars(input: string, tokens: Map<string, string>, depth = 0): string {
  if (depth > 10) throw new Error(`Résolution var() circulaire : ${input}`);
  if (!input.includes("var(")) return input;

  const resolved = input.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_full, name: string, fallback?: string) => {
    const value = tokens.get(name) ?? fallback?.trim();
    if (value === undefined) throw new Error(`Token inconnu : ${name}`);
    return value;
  });
  return resolveVars(resolved, tokens, depth + 1);
}
