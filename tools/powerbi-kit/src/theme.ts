// ---------------------------------------------------------------------------
// theme — thème de rapport Power BI dérivé des design tokens
// ---------------------------------------------------------------------------
//
// Le thème est la pièce qui aligne le plus visiblement un rapport sur la charte
// Comète : couleurs de séries, KPI, fonds, bordures et classes typographiques.
//
// Plutôt que de figer des hex, on part d'une structure de référence
// (`config/theme-base.json`) et d'un mapping explicite `chemin JSON → token`
// (`config/theme-tokens.json`). Le thème se régénère donc quand les tokens
// évoluent, et la variante sombre s'obtient en changeant de table de tokens.

import { readFileSync } from "node:fs";
import type { ThemeMode } from "./tokens.ts";
import { fileURLToPath } from "node:url";

const CONFIG_DIR = fileURLToPath(new URL("../config/", import.meta.url));

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function readJson(file: string): Json {
  return JSON.parse(readFileSync(CONFIG_DIR + file, "utf8")) as Json;
}

/** Écrit `value` à l'emplacement décrit par un chemin `a.b[0].c`. */
function setAtPath(root: Json, path: string, value: string): boolean {
  const steps = path.match(/[^.[\]]+/g);
  if (!steps || steps.length === 0) return false;

  let node: Json = root;
  for (const step of steps.slice(0, -1)) {
    if (node === null || typeof node !== "object") return false;
    node = Array.isArray(node) ? (node[Number(step)] as Json) : (node as Record<string, Json>)[step] as Json;
    if (node === undefined) return false;
  }
  const last = steps[steps.length - 1];
  if (last === undefined || node === null || typeof node !== "object") return false;

  if (Array.isArray(node)) node[Number(last)] = value;
  else (node as Record<string, Json>)[last] = value;
  return true;
}

/**
 * Un emplacement pointe soit vers un token unique, soit vers un token par mode.
 *
 * La forme `{ light, dark }` existe parce qu'un token peut être exact en clair
 * sans être utilisable en sombre : les primitifs (`--comete-blue-950`) gardent
 * la même valeur dans les deux thèmes, ce qui donnerait du texte foncé sur fond
 * sombre. On garde alors le primitif en clair — fidèle à la maquette — et un
 * token sémantique en sombre.
 */
type TokenRef = string | { light: string; dark: string };

function tokenFor(ref: TokenRef, mode: ThemeMode): string {
  return typeof ref === "string" ? ref : ref[mode];
}

export interface ThemeResult {
  theme: Json;
  /** Emplacements dont le token est introuvable — signalés, non silencieux. */
  missing: string[];
}

/**
 * Construit le thème pour un mode donné, à partir d'une table de tokens déjà
 * résolue pour ce mode. `name` distingue les variantes dans le sélecteur de
 * thèmes de Power BI.
 */
export function buildTheme(tokens: Map<string, string>, mode: ThemeMode, name: string): ThemeResult {
  const theme = readJson("theme-base.json");
  const mapping = readJson("theme-tokens.json") as Record<string, TokenRef>;
  const missing: string[] = [];

  for (const [path, ref] of Object.entries(mapping)) {
    const token = tokenFor(ref, mode);
    const value = tokens.get(token);
    if (value === undefined) {
      missing.push(`${path} → ${token}`);
      continue;
    }
    if (!setAtPath(theme, path, value.toUpperCase())) missing.push(`${path} (chemin absent)`);
  }

  if (theme !== null && typeof theme === "object" && !Array.isArray(theme)) {
    (theme as Record<string, Json>).name = name;
  }
  return { theme, missing };
}

/** Couleurs restées en dur : utile pour vérifier que le mapping est complet. */
export function unmappedColors(theme: Json, tokens: Map<string, string>): string[] {
  const known = new Set([...tokens.values()].map((v) => v.toUpperCase()));
  const found = new Set<string>();
  const walk = (node: Json): void => {
    if (typeof node === "string") {
      if (/^#[0-9a-fA-F]{6}$/.test(node) && !known.has(node.toUpperCase())) found.add(node.toUpperCase());
    } else if (Array.isArray(node)) node.forEach(walk);
    else if (node !== null && typeof node === "object") Object.values(node).forEach(walk);
  };
  walk(theme);
  return [...found].sort();
}
