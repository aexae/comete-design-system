// Tests pour la source unique de breakpoints + garde anti-drift CSS ↔ constantes.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS, breakpointDown, breakpointUp } from "./breakpoints";

// Lu depuis la racine du repo (cwd de vitest = racine de la config). Le CSS
// (@container / @media) ne peut pas lire une constante JS : ces tests
// garantissent que chaque fichier responsive reflète la source unique. Si un
// seuil change dans breakpoints.ts sans mise à jour du CSS (ou l'inverse), les
// assertions échouent → pas de dérive silencieuse.
const readCss = (path: string) => readFileSync(path, "utf8");

describe("BREAKPOINTS — source unique", () => {
  it("should expose the canonical ascending scale watch → tv", () => {
    expect(BREAKPOINTS).toEqual({
      watch: 0,
      mobile: 280,
      tablet: 600,
      laptop: 1200,
      desktop: 1536,
      tv: 1920,
    });
    const values = Object.values(BREAKPOINTS);
    expect([...values].sort((x, y) => x - y)).toEqual(values);
  });

  it("should build complementary media queries from a breakpoint name", () => {
    expect(breakpointUp("tablet")).toBe(`(min-width: ${BREAKPOINTS.tablet}px)`);
    expect(breakpointDown("tablet")).toBe(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
    expect(breakpointUp("laptop")).toBe(`(min-width: ${BREAKPOINTS.laptop}px)`);
  });
});

// « Sous » un breakpoint = largeur < valeur → `max-width: valeur − 1`.
const below = (bp: keyof typeof BREAKPOINTS) => `(max-width: ${BREAKPOINTS[bp] - 1}px)`;

describe("garde anti-drift — CSS reflète BREAKPOINTS", () => {
  it("Table hideBelow (container queries) bascule sous tablet et sous laptop", () => {
    const css = readCss("src/components/Table/Table.module.css");
    expect(css).toContain(`@container table ${below("tablet")}`);
    expect(css).toContain(`@container table ${below("laptop")}`);
    expect(css).toContain('[data-hide-below="tablet"]');
    expect(css).toContain('[data-hide-below="laptop"]');
  });

  it("Page.Bar compact et Button collapseLabel basculent sous tablet", () => {
    expect(readCss("src/components/Page/Page.module.css")).toContain(
      `@container page ${below("tablet")}`
    );
    expect(readCss("src/components/Button/Button.module.css")).toContain(
      `@container ${below("tablet")}`
    );
  });

  it("every @media / @container width in src and stories is a breakpoint", () => {
    // Seuils admis : BREAKPOINTS[x] (« à partir de ») et
    // BREAKPOINTS[x] - 1 (« sous », cf. breakpointDown). Tout autre seuil de
    // largeur est une valeur en dur qui ne suivrait pas l'échelle.
    const allowed = new Set(Object.values(BREAKPOINTS).flatMap((v) => [v, v - 1]));
    const list = (dir: string) =>
      readdirSync(dir, { recursive: true, encoding: "utf8" }).map(
        (f) => `${dir}/${f.replace(/\\/g, "/")}`
      );
    const files = [...list("src"), ...list("storybook/stories")].filter((f) => f.endsWith(".css"));
    const offenders: string[] = [];
    for (const file of files) {
      const css = readCss(file);
      for (const m of css.matchAll(/@(?:media|container)[^{]*?\((?:min|max)-width:\s*(\d+)px\)/g)) {
        if (!allowed.has(Number(m[1]))) offenders.push(`${file}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("Grid (media queries viewport) uses tablet and laptop", () => {
    const css = readCss("src/components/Grid/Grid.module.css");
    expect(css).toContain(`@media ${breakpointUp("tablet")}`);
    expect(css).toContain(`@media ${breakpointUp("laptop")}`);
  });
});
