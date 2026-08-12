// Garde de non-régression du build : vérifie que le dist livre bien des CSS
// Modules fonctionnels. Historiquement, tsup compilait chaque `import styles from
// "./x.module.css"` en objet VIDE (`{}`) → tous les composants posaient des classes
// `undefined` et le paquet publié était non stylé, sans qu'aucun test ne l'attrape.
//
// Ce script échoue (exit 1) si, pour un module CSS du dist :
//  - le module de locals n'importe pas sa feuille `.css` (side-effect → CSS jamais chargée), ou
//  - la CSS a des sélecteurs de classe mais le JS n'expose aucun local scopé (objet vide).
import { globSync, readFileSync } from "node:fs";
import { basename } from "node:path";

const files = globSync("dist/**/*.module.css.js");

if (files.length === 0) {
  console.error("[smoke-dist] Aucun *.module.css.js dans dist — build absent ou cassé.");
  process.exit(1);
}

const failures = [];

// Garde anti-régression : AUCUNE feuille `*.module.css` ne doit être livrée.
// Les consommateurs (Vite, webpack modules.auto) re-scoperaient ces fichiers
// (`.X-module__local` → `._X-module__local_hash`) alors que les noms sont figés
// dans le JS → composant non stylé. Les feuilles doivent être en `.css` plein.
const moduleSheets = globSync("dist/**/*.module.css");
for (const sheet of moduleSheets) {
  failures.push(`${sheet} : feuille livrée en *.module.css (sera re-scopée par le bundler consommateur — doit être *.css)`);
}

for (const jsPath of files) {
  // La feuille associée au chunk `X.module.css.js` est désormais `X.css` (plainify-css).
  const cssPath = jsPath.replace(/\.module\.css\.js$/, ".css");
  const js = readFileSync(jsPath, "utf8");
  let css = "";
  try {
    css = readFileSync(cssPath, "utf8");
  } catch {
    failures.push(`${cssPath} : feuille CSS émise manquante`);
    continue;
  }

  const base = basename(cssPath);
  const importsCss = new RegExp(`import ['"]\\./${base.replace(/\./g, "\\.")}['"]`).test(js);
  if (!importsCss) {
    failures.push(`${jsPath} : n'importe pas sa CSS en side-effect (feuille orpheline)`);
  }

  // Locals scopés exposés par le JS (pattern `<name>__<local>` de generateScopedName).
  const localValues = [...js.matchAll(/["']([A-Za-z_][\w-]*__[\w-]+)["']/g)].map((m) => m[1]);
  // La CSS contient-elle des sélecteurs de classe ? (hors `:global(...)`)
  const cssHasClassSelectors = /(^|[\s,{}])\.[A-Za-z_]/.test(css.replace(/:global\([^)]*\)/g, ""));

  if (cssHasClassSelectors) {
    const someLocalInCss = localValues.some((v) => css.includes(`.${v}`));
    if (localValues.length === 0 || !someLocalInCss) {
      failures.push(`${jsPath} : la CSS a des classes mais le module n'expose aucun local scopé (objet vide ?)`);
    }
  }
}

if (failures.length > 0) {
  console.error(`[smoke-dist] ÉCHEC — ${failures.length} module(s) CSS cassé(s) :`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}

console.log(`[smoke-dist] OK — ${files.length} modules CSS avec locals scopés + CSS chaînée.`);
