// Post-build : renomme les feuilles émises `*.module.css` → `*.css` (plein).
//
// Pourquoi c'est nécessaire (et pas cosmétique) : Vite émet les feuilles sous le
// nom source `X.module.css`, avec les classes DÉJÀ scopées (`X-module__local`)
// figées en dur dans le JS (import side-effect, mapping ignoré). Or les bundlers
// des consommateurs (Vite, webpack `css-loader modules.auto`) appliquent la
// transformation CSS Modules à TOUT fichier matchant `/\.module\.css$/`, y compris
// dans node_modules. Ils RE-scopent alors `.X-module__local` en
// `._X-module__local_hash` → la feuille ne cible plus les classes posées dans le
// DOM → composant NON stylé. En livrant ces feuilles en `.css` plein, aucun
// consommateur ne les re-traite : ce sont des règles globales déjà scopées.
//
// On ne renomme QUE l'asset CSS (+ sa map) et l'import injecté. Le chunk JS
// `X.module.css.js` garde son nom : c'est du `.js`, jamais interprété comme CSS.
import { globSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { basename } from "node:path";

const stripModule = (p) => p.replace(/\.module\.css($|\.map$)/, ".css$1");

let renamed = 0;
let rewritten = 0;

// 1) Renommer les feuilles CSS et leurs sourcemaps : X.module.css(.map) → X.css(.map)
for (const cssPath of globSync("dist/**/*.module.css{,.map}")) {
  const target = stripModule(cssPath);
  let content = readFileSync(cssPath, "utf8");
  // Corriger les références internes au nom de fichier (map + commentaire sourceMappingURL).
  const oldBase = basename(cssPath);
  const newBase = basename(target);
  content = content.split(oldBase).join(newBase);
  writeFileSync(cssPath, content);
  renameSync(cssPath, target);
  renamed++;
}

// 2) Réécrire l'import side-effect injecté : import "./X.module.css" → "./X.css"
//    (cible uniquement les specifiers d'import relatifs se terminant par .module.css,
//     donc jamais "./X.module.css.js" qui est le chunk JS.)
for (const jsPath of globSync("dist/**/*.module.css.js")) {
  const src = readFileSync(jsPath, "utf8");
  const out = src.replace(
    /(import\s*['"]\.\/[^'"]+?)\.module\.css(['"])/g,
    "$1.css$2",
  );
  if (out !== src) {
    writeFileSync(jsPath, out);
    rewritten++;
  }
}

console.log(
  `[plainify-css] ${renamed} feuille(s) renommée(s) *.module.css → *.css, ${rewritten} import(s) réécrit(s).`,
);
