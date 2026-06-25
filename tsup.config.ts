import { defineConfig } from "tsup";

/**
 * Comète Design System — build config
 * @see https://tsup.egoist.dev/
 */
export default defineConfig({
  entry: ["src/**/index.ts"],
  outDir: "dist",
  format: ["esm"],
  dts: true,
  // Le DS est intrinsèquement client (React Aria + hooks) : on marque tous les
  // modules émis comme client pour la compatibilité Next.js App Router / RSC.
  // NB: ne pas activer `treeshake` (passe Rollup) — il supprime la directive
  // "use client" du banner. esbuild applique déjà son DCE interne au bundling,
  // et le tree-shaking côté consommateur reste assuré (ESM + sideEffects).
  banner: { js: '"use client";' },
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: false,
  keepNames: true,
  external: ["react", "react-dom", "react-aria-components", "@naxit/comete-icons", "@naxit/comete-illustrations"],
});
