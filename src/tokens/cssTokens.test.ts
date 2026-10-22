// Garde anti-drift : chaque custom property lue par le DS doit exister.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  TOKENS_CSS_PATH,
  declaredProperties,
  listSourceFiles,
  referencedProperties,
} from "./cssTokens.testUtils";

// REASON: un `var(--token, fallback)` dont le token a disparu ou a été renommé
// ne casse rien de visible : le fallback masque l'absence. Sans fallback, la
// déclaration devient invalide en silence (couleur héritée, radius à 0…). Ce
// test fait échouer la CI dans les deux cas.

// Variables posées hors CSS (inline style du TSX, React Aria) ou surcharges
// documentées offertes au consommateur. Les `--_*` (privées, posées par le
// TSX) sont acceptées par convention de nommage.
const RUNTIME_PROPERTIES: Record<string, string> = {
  "--trigger-width": "posée par React Aria sur le Popover",
  "--focus-ring-offset": "posée par FocusRing.tsx",
  "--menu-popover-width": "posée par Menu.tsx",
  "--qa-index": "posée par QuickActions.tsx",
  "--sidenav-section-heading-size": "posée par SideNav.tsx",
  "--sidenav-section-heading-line": "surcharge consommateur (SideNav)",
  "--popup-padding": "surcharge consommateur (Popup, SideNav)",
  "--checkbox-surface": "surcharge consommateur (Checkbox)",
  "--scroll-shadow-surface": "surcharge consommateur (ScrollArea)",
};

const isPrivate = (name: string) => name.startsWith("--_");

const sources = listSourceFiles(
  (path) => /\.(css|tsx?)$/.test(path) && !/\.(test|testUtils)\.tsx?$/.test(path) && !path.endsWith(".d.ts"),
);
const cssFiles = sources.filter((path) => path.endsWith(".css"));

const tokens = declaredProperties(readFileSync(TOKENS_CSS_PATH, "utf8"));
const localProperties = new Set(cssFiles.flatMap((path) => [...declaredProperties(readFileSync(path, "utf8"))]));

const references = sources.flatMap((path) =>
  [...referencedProperties(readFileSync(path, "utf8"))].map((name) => ({ path, name })),
);

describe("tokens consommés — existence", () => {
  it("should find the tokens stylesheet and CSS references to check", () => {
    expect(tokens.size).toBeGreaterThan(0);
    expect(references.length).toBeGreaterThan(0);
  });

  it("should detect tokens hidden behind a fallback and skip comments and dynamic names", () => {
    const source = "a { padding: var(--gone, var(--space150)); /* var(--note) */ }\nconst s = `var(--space${gap})`;";

    expect([...referencedProperties(source)]).toEqual(["--gone", "--space150"]);
  });

  it("should only reference custom properties defined by comete-design-tokens or by the DS", () => {
    const missing = references
      .filter(
        ({ name }) =>
          !tokens.has(name) && !localProperties.has(name) && !isPrivate(name) && !(name in RUNTIME_PROPERTIES),
      )
      .map(({ path, name }) => `${name} (${path})`);

    expect(missing).toEqual([]);
  });

  it("should keep the runtime allowlist free of stale or shadowing entries", () => {
    const referenced = new Set(references.map(({ name }) => name));
    const stale = Object.keys(RUNTIME_PROPERTIES).filter(
      (name) => !referenced.has(name) || tokens.has(name) || localProperties.has(name),
    );

    expect(stale).toEqual([]);
  });
});
