// Build de la librairie (JS + CSS) via Vite en mode library.
// Les .d.ts sont émis séparément par `tsc -p tsconfig.build.json`.
//
// Pourquoi Vite : c'est le même pipeline CSS que les tests (vitest) et Storybook.
// tsup ne gère pas les CSS Modules (il émet la CSS en global et vide l'objet
// `import styles`), ce qui livrait un dist non stylé. Vite gère les CSS Modules
// nativement (scoping, :global(), composes).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { isAbsolute } from "node:path";

export default defineConfig({
  // libInjectCss : injecte un `import "./x.css"` (side-effect) en tête de chaque
  // chunk ayant du CSS associé → la feuille de style se charge automatiquement
  // quand on importe un composant (sinon les .css sont émises mais orphelines).
  // libInjectCss : injecte un `import "./x.css"` (side-effect) en tête de chaque
  // chunk ayant du CSS associé → la feuille de style se charge automatiquement
  // quand on importe un composant (sinon les .css sont émises mais orphelines).
  // Les .d.ts sont émis à part, en bundle, par `tsup --dts-only` (voir tsup.config.ts).
  plugins: [react(), libInjectCss()],
  css: {
    modules: {
      // Noms de classes stables et lisibles (débogables), cohérents avec la
      // philosophie « non-scoped » des tests. Le scoping par fichier évite les
      // collisions entre modules.
      generateScopedName: "[name]__[local]",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssCodeSplit: true,
    lib: {
      entry: {
        index: "src/index.ts",
        "components/index": "src/components/index.ts",
        "providers/index": "src/providers/index.ts",
        "hooks/index": "src/hooks/index.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      // Tout import « bare » (node_modules) est externalisé ; seuls les modules
      // relatifs/absolus du DS (dont les *.module.css) sont bundlés.
      external: (id) => !id.startsWith(".") && !isAbsolute(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
        // Le DS est intrinsèquement client (React Aria + hooks) : directive
        // "use client" en tête de chaque module émis (compat Next.js RSC).
        banner: '"use client";',
      },
    },
  },
});
