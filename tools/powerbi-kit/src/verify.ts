// ---------------------------------------------------------------------------
// verify — contrôle du kit généré, tel que Power BI le consommera
// ---------------------------------------------------------------------------
//
// Rejoue le chemin réel de chaque livrable : la data URI de chaque icône est
// substituée comme le ferait SUBSTITUTE() en DAX, décodée comme le fait le
// moteur de rendu, puis rasterisée (resvg). Un SVG cassé, un placeholder
// manquant ou un dièse mal encodé font échouer la commande.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { rasterize } from "./png.ts";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const PREFIX = "data:image/svg+xml;utf8,";

function decode(uri: string): string {
  if (!uri.startsWith(PREFIX)) throw new Error("préfixe de data URI inattendu");
  return decodeURIComponent(uri.slice(PREFIX.length));
}

/** Parseur CSV minimal (RFC 4180, séparateur virgule, BOM toléré). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

function checkCsv(file: string, options: { placeholder: boolean }): number {
  const rows = parseCsv(readFileSync(DIST + file, "utf8"));
  const header = rows[0];
  if (!header) throw new Error(`${file} : vide`);
  const iUri = header.indexOf("svg_datauri");
  const iName = header.indexOf("name");
  const failures: string[] = [];
  for (const row of rows.slice(1)) {
    const uri = row[iUri] ?? "";
    const name = row[iName] ?? "?";
    try {
      if (options.placeholder && !uri.includes("__COLOR__")) throw new Error("placeholder absent");
      // Ordre réel : DAX substitue la couleur, puis Power BI décode l'URI.
      const svg = decode(uri.replace(/__COLOR__/g, "%232354AA"));
      if (svg.includes("__COLOR__") || svg.includes("var(")) throw new Error("résidu non résolu");
      rasterize(svg, 1);
    } catch (error) {
      failures.push(`${name} : ${(error as Error).message}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`${file} : ${failures.length} échec(s)\n  ${failures.slice(0, 10).join("\n  ")}`);
  }
  return rows.length - 1;
}

const icons = checkCsv("icons.csv", { placeholder: true });
const logos = checkCsv("logos.csv", { placeholder: false });
console.log(`✓ vérifié : ${icons} entrées d'icônes et ${logos} logos décodés et rasterisés`);
