// ---------------------------------------------------------------------------
// css-stub — neutralise les imports CSS pour un chargement Node pur
// ---------------------------------------------------------------------------
//
// Le barrel de `@aexae/comete-icons` importe `icons.css` pour le mapping
// couleur → token. Node ne sait pas charger de CSS ; on le remplace par un
// module vide. Le kit n'a pas besoin de ce CSS : les couleurs sont résolues
// depuis les tokens en amont (cf. `tokens.ts`).
//
// À enregistrer AVANT tout import du package : le graphe ESM est chargé en
// entier avant évaluation, donc `main.ts` charge le reste dynamiquement.

import { registerHooks } from "node:module";

export function registerCssStub(): void {
  registerHooks({
    load(url, context, nextLoad) {
      if (url.endsWith(".css")) {
        return { format: "module", shortCircuit: true, source: "export default {};" };
      }
      return nextLoad(url, context);
    },
  });
}
