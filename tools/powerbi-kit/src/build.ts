// ---------------------------------------------------------------------------
// build — assemblage du kit Power BI
// ---------------------------------------------------------------------------
//
// Produit dans `dist/` :
//   icons.csv          table à importer (colonne à catégoriser « Image URL »)
//   colors.csv         couleurs sémantiques pré-encodées pour SUBSTITUTE()
//   svg/               SVG plats (inspection, custom visuals)
//   logos/             SVG + PNG des logos, par apparence
//   theme/             thèmes de rapport clair et sombre
//   README.md          mode d'emploi destiné au consultant

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { renderIcon, availableIconNames, type IconVariant, type IconSpacing } from "./icons.ts";
import { renderLogo, type LogoAppearance, type LogoFormat, type LogoProduct, type LogoTaglineAlign } from "./logos.ts";
import { loadTokens } from "./tokens.ts";
import { toDataUri, csvCell, POWERBI_URL_LIMIT, COLOR_PLACEHOLDER } from "./datauri.ts";
import { buildTheme, unmappedColors } from "./theme.ts";
import { renderReadme } from "./readme.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DIST = ROOT + "dist/";

interface IconEntry {
  name: string;
  /** À quoi l'icône correspond dans Comète BI — repris dans le CSV livré. */
  usage: string;
}
interface IconsConfig {
  variants: IconVariant[];
  spacing: IconSpacing;
  size: number;
  entries: IconEntry[] | "*";
  /** Écarts relevés dans l'inventaire : repris tels quels dans le README livré. */
  notes?: string[];
  /**
   * Jeux d'icônes en SVG à couleur figée, un dossier par jeu. Power BI accepte
   * les SVG à l'insertion d'image et en icône de bouton mais ne les recolore
   * pas : la couleur (token `--icon-*`, sans le préfixe) est résolue au build.
   */
  coloredSets?: { dir: string; color: string; variant: IconVariant; names: string[] }[];
}
interface LogosConfig {
  size: number;
  entries: { product: LogoProduct; format: LogoFormat; taglineAlign: LogoTaglineAlign }[];
  appearances: LogoAppearance[];
}

function readConfig<T>(file: string): T {
  return JSON.parse(readFileSync(`${ROOT}config/${file}`, "utf8")) as T;
}

function write(relative: string, content: string | Buffer): void {
  const path = DIST + relative;
  mkdirSync(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, content);
}

/** Excel n'ouvre correctement un CSV UTF-8 que s'il porte un BOM. */
function writeCsv(relative: string, header: string[], rows: string[][]): void {
  const lines = [header, ...rows].map((cells) => cells.map(csvCell).join(","));
  write(relative, "﻿" + lines.join("\r\n") + "\r\n");
}

// ---------------------------------------------------------------------------

interface Report {
  icons: number;
  logos: number;
  oversized: string[];
  themeWarnings: string[];
}

export async function build(): Promise<Report> {
  rmSync(DIST, { recursive: true, force: true });

  const tokens = loadTokens("light");
  const iconsConfig = readConfig<IconsConfig>("icons.json");
  const logosConfig = readConfig<LogosConfig>("logos.json");
  const oversized: string[] = [];

  // ---- Icônes -------------------------------------------------------------
  const available = new Set(availableIconNames());
  const entries: IconEntry[] =
    iconsConfig.entries === "*"
      ? availableIconNames().map((name) => ({ name, usage: "" }))
      : iconsConfig.entries;
  const unknown = entries.filter((e) => !available.has(e.name as never)).map((e) => e.name);
  if (unknown.length > 0) {
    throw new Error(`Icônes absentes du package : ${unknown.join(", ")}`);
  }

  const iconRows: string[][] = [];
  for (const entry of entries) {
    for (const variant of iconsConfig.variants) {
      const svg = renderIcon(entry.name as never, {
        variant,
        spacing: iconsConfig.spacing,
        size: iconsConfig.size,
        tokens,
      });
      const { uri, length, overLimit } = toDataUri(svg);
      if (overLimit) oversized.push(`${entry.name}/${variant} (${length})`);
      write(`svg/icons/${variant}/${entry.name}.svg`, svg);
      iconRows.push([entry.name, variant, entry.usage, String(iconsConfig.size), uri, String(length)]);

    }
  }

  for (const set of iconsConfig.coloredSets ?? []) {
    const token = `--icon-${set.color.replace(/^icon-/, "")}`;
    const hex = tokens.get(token);
    if (hex === undefined) throw new Error(`Token de couleur inconnu pour le jeu ${set.dir} : ${token}`);
    const missingNames = set.names.filter((n) => !available.has(n as never));
    if (missingNames.length > 0) {
      throw new Error(`Jeu ${set.dir} : icônes absentes du package : ${missingNames.join(", ")}`);
    }
    for (const name of set.names) {
      const svg = renderIcon(name as never, {
        variant: set.variant,
        spacing: iconsConfig.spacing,
        size: iconsConfig.size,
        tokens,
        color: hex,
      });
      write(`svg/icons/${set.dir}/${name}.svg`, svg);
    }
  }
  writeCsv("icons.csv", ["name", "variant", "usage", "size", "svg_datauri", "uri_length"], iconRows);

  // ---- Couleurs sémantiques, pré-encodées pour SUBSTITUTE() ---------------
  const colorRows: string[][] = [];
  for (const [token, value] of [...tokens].sort()) {
    if (!token.startsWith("--icon-") || !/^#[0-9a-fA-F]{6}$/.test(value)) continue;
    colorRows.push([token.replace("--icon-", ""), value.toUpperCase(), value.replace("#", "%23").toUpperCase()]);
  }
  writeCsv("colors.csv", ["name", "hex", "dax_value"], colorRows);

  // ---- Logos --------------------------------------------------------------
  let logoCount = 0;
  const logoRows: string[][] = [];
  for (const entry of logosConfig.entries) {
    for (const appearance of logosConfig.appearances) {
      // Les trois apparences se lisent depuis le thème clair, qui sert de
      // référence : `brand` donne le logo foncé (fond clair), `inverse` le
      // logo clair (fond sombre), `neutral` la version monochrome. Les rendre
      // avec les tokens sombres inverserait une seconde fois `inverse` et
      // produirait un wordmark foncé, invisible sur un fond sombre.
      const rendered = renderLogo({
        product: entry.product,
        appearance,
        format: entry.format,
        taglineAlign: entry.taglineAlign,
        size: logosConfig.size,
        theme: "light",
        tokens,
      });

      const slug = `${entry.product}-${entry.format}-${entry.taglineAlign}-${appearance}`;
      write(`logos/svg/${slug}.svg`, rendered.svg);
      const { uri, length, overLimit } = toDataUri(rendered.svg);
      if (overLimit) oversized.push(`${slug} (${length})`);
      logoRows.push([slug, entry.product, entry.format, appearance, String(rendered.width), String(rendered.height), uri, String(length)]);
      logoCount += 1;
    }
  }
  writeCsv("logos.csv", ["name", "product", "format", "appearance", "width", "height", "svg_datauri", "uri_length"], logoRows);

  // ---- Thème --------------------------------------------------------------
  const themeWarnings: string[] = [];
  for (const mode of ["light", "dark"] as const) {
    const modeTokens = loadTokens(mode);
    const label = mode === "light" ? "Comète BI clair" : "Comète BI sombre";
    const { theme, missing } = buildTheme(modeTokens, mode, label);
    themeWarnings.push(...missing.map((m) => `${mode}: token manquant ${m}`));
    themeWarnings.push(...unmappedColors(theme, modeTokens).map((c) => `${mode}: couleur hors tokens ${c}`));
    write(`theme/comete-bi-${mode}.json`, JSON.stringify(theme, null, 2) + "\n");
  }

  // ---- Documentation ------------------------------------------------------
  write("README.md", renderReadme({
    iconCount: entries.length,
    notes: iconsConfig.notes ?? [],
    variants: iconsConfig.variants,
    logoCount,
    colorCount: colorRows.length,
    placeholder: COLOR_PLACEHOLDER,
    limit: POWERBI_URL_LIMIT,
  }));

  return { icons: iconRows.length, logos: logoCount, oversized, themeWarnings };
}
