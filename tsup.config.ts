import { defineConfig } from "tsup";

/**
 * Génération des déclarations de types UNIQUEMENT (`dts.only`).
 * Le JS et le CSS sont produits par Vite (voir vite.lib.config.ts) — tsup ne
 * gère pas les CSS Modules. On garde tsup ici pour ses `.d.ts` **bundlés** :
 * chaque entrée publique produit un `.d.ts` self-contained (types inlinés, aucun
 * import relatif interne), ce qui garantit une résolution des types correcte y
 * compris en Node16 ESM (attw vert), contrairement à un emit `.d.ts` par fichier.
 *
 * `clean: false` : ne PAS effacer la sortie JS/CSS déjà produite par Vite dans dist/.
 */
export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/index.ts",
    "src/providers/index.ts",
    "src/hooks/index.ts",
  ],
  outDir: "dist",
  format: ["esm"],
  dts: { only: true },
  clean: false,
  external: [
    "react",
    "react-dom",
    "react-aria-components",
    "@naxit/comete-icons",
    "@naxit/comete-illustrations",
    "@aexae/comete-design-tokens",
    "@internationalized/date",
  ],
});
