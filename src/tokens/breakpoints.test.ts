// Tests pour la source unique de breakpoints + garde anti-drift CSS ↔ constantes.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS } from "./breakpoints";

// Lu depuis la racine du repo (cwd de vitest = racine de la config). Le CSS
// (@container / @media) ne peut pas lire une constante JS : ces tests
// garantissent que chaque fichier responsive reflète la source unique. Si un
// seuil change dans breakpoints.ts sans mise à jour du CSS (ou l'inverse), les
// assertions échouent → pas de dérive silencieuse.
const readCss = (path: string) => readFileSync(path, "utf8");

describe("BREAKPOINTS — source unique", () => {
  it("should expose the canonical ascending scale sm/md/lg", () => {
    expect(BREAKPOINTS).toEqual({ sm: 600, md: 900, lg: 1200 });
    expect(BREAKPOINTS.sm).toBeLessThan(BREAKPOINTS.md);
    expect(BREAKPOINTS.md).toBeLessThan(BREAKPOINTS.lg);
  });
});

describe("garde anti-drift — CSS reflète BREAKPOINTS", () => {
  it("Table hideBelow (container queries) mirrors sm/md/lg", () => {
    const css = readCss("src/components/Table/Table.module.css");
    expect(css).toContain(`@container table (max-width: ${BREAKPOINTS.sm}px)`);
    expect(css).toContain(`@container table (max-width: ${BREAKPOINTS.md}px)`);
    expect(css).toContain(`@container table (max-width: ${BREAKPOINTS.lg}px)`);
    // Plus aucun ancien seuil (480 / 768 / 1024).
    for (const stale of [480, 768, 1024]) {
      expect(css).not.toContain(`max-width: ${stale}px`);
    }
  });

  it("Grid (media queries viewport) uses sm and lg", () => {
    const css = readCss("src/components/Grid/Grid.module.css");
    expect(css).toContain(`@media (min-width: ${BREAKPOINTS.sm}px)`);
    expect(css).toContain(`@media (min-width: ${BREAKPOINTS.lg}px)`);
  });
});
