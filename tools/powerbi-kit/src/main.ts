// ---------------------------------------------------------------------------
// main — point d'entrée : enregistre le stub CSS puis lance la génération
// ---------------------------------------------------------------------------
//
// L'import de `build.ts` est dynamique à dessein : un graphe ESM est chargé en
// entier avant d'être évalué, donc un import statique ferait charger le CSS de
// `@aexae/comete-icons` avant que le stub soit posé.

import { registerCssStub } from "./css-stub.ts";

registerCssStub();

const { build } = await import("./build.ts");
const report = await build();

console.log(`✓ ${report.icons} entrées d'icônes, ${report.logos} logos générés dans dist/`);

for (const warning of report.themeWarnings) console.warn(`⚠ ${warning}`);
if (report.oversized.length > 0) {
  console.error(`✗ Valeurs au-delà de la limite Power BI : ${report.oversized.join(", ")}`);
  process.exitCode = 1;
}
