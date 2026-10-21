// Outils de test : lecture des tokens de @aexae/comete-design-tokens et
// résolution des `var()` d'un CSS Module en valeur finale. Utilisé uniquement
// par les gardes anti-drift (jamais importé par le code livré).
import { readdirSync, readFileSync } from "node:fs";

// Lu depuis la racine du repo (cwd de vitest = racine de la config).
export const TOKENS_CSS_PATH = "node_modules/@aexae/comete-design-tokens/build/css/comete-tokens.css";

/** Fichiers sources (chemins relatifs à la racine) dont le nom passe le filtre. */
export function listSourceFiles(filter: (path: string) => boolean): string[] {
  return readdirSync("src", { recursive: true, encoding: "utf8" })
    .map((path) => `src/${path.replace(/\\/g, "/")}`)
    .filter(filter)
    .sort();
}

/** Noms des custom properties déclarées (`--x: …`) dans un CSS. */
export function declaredProperties(css: string): Set<string> {
  return new Set(Array.from(css.matchAll(/(--[\w-]+)\s*:/g), (m) => m[1] ?? ""));
}

/**
 * Noms des custom properties lues via `var(--x…)`, fallbacks imbriqués inclus.
 * Les commentaires sont ignorés, ainsi que les noms construits dynamiquement
 * (`var(--space${gap})` dans le TSX), non vérifiables statiquement.
 */
export function referencedProperties(source: string): Set<string> {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
  return new Set(Array.from(code.matchAll(/var\(\s*(--[\w-]+)(?![\w$-])/g), (m) => m[1] ?? ""));
}

/**
 * Valeurs des tokens. La première déclaration gagne : c'est le bloc `:root`
 * (thème clair), suffisant pour les dimensions qui ne varient pas par thème.
 */
export function readTokenValues(): Map<string, string> {
  const values = new Map<string, string>();
  const css = readFileSync(TOKENS_CSS_PATH, "utf8");
  for (const [, name = "", value = ""] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!values.has(name)) values.set(name, value.trim());
  }
  return values;
}

/** Découpe une valeur CSS sur un séparateur, en ignorant ceux entre parenthèses. */
export function splitTopLevel(value: string, separator: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth === 0 && separator.test(char)) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Résout récursivement les `var()` d'une valeur. Un token défini prime sur son
 * fallback (comportement du navigateur). Lève une erreur si un token est absent
 * et sans fallback.
 */
export function resolveCssValue(value: string, tokens: Map<string, string>): string {
  const start = value.indexOf("var(");
  if (start === -1) return value.trim();

  let depth = 0;
  let end = start + "var".length;
  for (; end < value.length; end += 1) {
    if (value[end] === "(") depth += 1;
    if (value[end] === ")") depth -= 1;
    if (depth === 0) break;
  }
  const inner = value.slice(start + "var(".length, end);
  const name = inner.split(",")[0]?.trim() ?? "";
  const fallback = inner.includes(",") ? inner.slice(inner.indexOf(",") + 1) : undefined;

  const token = tokens.get(name);
  let resolved: string;
  if (token !== undefined) resolved = resolveCssValue(token, tokens);
  else if (fallback !== undefined) resolved = resolveCssValue(fallback, tokens);
  else throw new Error(`Token ${name} introuvable et sans fallback`);

  return resolveCssValue(value.slice(0, start) + resolved + value.slice(end + 1), tokens);
}

/** Convertit une valeur résolue en pixels (seule unité des tokens de dimension). */
export function toPx(value: string): number {
  if (value === "0") return 0;
  const match = /^(-?[\d.]+)px$/.exec(value);
  if (!match?.[1]) throw new Error(`Valeur non exprimée en px : ${value}`);
  return Number(match[1]);
}

/** Corps de la première règle dont le sélecteur est exactement `selector`. */
export function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  if (!match?.[1]) throw new Error(`Règle ${selector} introuvable`);
  return match[1];
}

/** Valeur d'une déclaration dans le corps d'une règle. */
export function declarationValue(body: string, property: string): string {
  const match = new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+);`).exec(body);
  if (!match?.[1]) throw new Error(`Déclaration ${property} introuvable`);
  return match[1].trim();
}
