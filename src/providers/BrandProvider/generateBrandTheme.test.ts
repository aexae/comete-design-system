import { describe, expect, it } from "vitest";
import { hexToRgb, oklchToHex, rgbToHex, rgbToOklch } from "./oklch";
import { brandThemeToCss, generateBrandTheme } from "./generateBrandTheme";

const HEX = /^#[0-9a-f]{6}$/;
const lightnessOf = (hex: string): number => rgbToOklch(hexToRgb(hex)).l;

describe("oklch", () => {
  it("should round-trip hex → rgb → hex", () => {
    expect(rgbToHex(hexToRgb("#1e3661"))).toBe("#1e3661");
  });

  it("should expand 3-digit hex", () => {
    expect(rgbToHex(hexToRgb("#abc"))).toBe("#aabbcc");
  });

  it("should throw on invalid hex", () => {
    expect(() => hexToRgb("nope")).toThrow();
    expect(() => hexToRgb("#12")).toThrow();
  });

  it("should round-trip a color through oklch within tolerance", () => {
    const back = oklchToHex(rgbToOklch(hexToRgb("#429aef")));
    expect(back).toBe("#429aef");
  });
});

describe("generateBrandTheme", () => {
  it("should produce the full brand family for light and dark", () => {
    const theme = generateBrandTheme("#1e3661");
    const expectedKeys = [
      "--background-brand-bold-default",
      "--background-brand-bold-hovered",
      "--background-brand-bold-pressed",
      "--background-brand-boldest-default",
      "--background-brand-boldest-hovered",
      "--background-brand-boldest-pressed",
      "--background-brand-subtler-default",
      "--background-brand-subtler-hovered",
      "--background-brand-subtler-pressed",
      "--background-brand-subtlest-default",
      "--background-brand-subtlest-hovered",
      "--background-brand-subtlest-pressed",
      "--border-brand-bold",
      "--border-brand-boldest",
      "--border-brand-subtle",
      "--icon-brand-default",
      "--icon-brand-boldest",
      "--text-brand-default",
      "--text-brand-hovered",
      "--text-brand-pressed",
      "--text-brand-boldest",
    ];
    expect(Object.keys(theme.light).sort()).toEqual([...expectedKeys].sort());
    expect(Object.keys(theme.dark).sort()).toEqual([...expectedKeys].sort());
  });

  it("should emit only valid 6-digit hex values", () => {
    const theme = generateBrandTheme("#ff6a00");
    for (const v of [...Object.values(theme.light), ...Object.values(theme.dark)]) {
      expect(v).toMatch(HEX);
    }
  });

  it("should keep bold darker than subtlest in light theme", () => {
    const { light } = generateBrandTheme("#429aef");
    expect(lightnessOf(light["--background-brand-bold-default"]!)).toBeLessThan(
      lightnessOf(light["--background-brand-subtlest-default"]!)
    );
  });

  it("should darken bold for a light seed so inverted text keeps contrast (École A)", () => {
    // Un jaune très clair doit tout de même donner un fond bold assez sombre en thème
    // clair (palier 700, miroir de comete.bold, texte inversé ≥ 4,5:1) et un boldest
    // navy (palier 950).
    const { light } = generateBrandTheme("#ffd400");
    expect(lightnessOf(light["--background-brand-bold-default"]!)).toBeLessThan(0.5);
    expect(lightnessOf(light["--background-brand-boldest-default"]!)).toBeLessThan(0.3);
  });

  it("should keep boldest darker than bold in light theme and in dark theme", () => {
    const theme = generateBrandTheme("#1e3661");
    for (const mode of [theme.light, theme.dark]) {
      expect(lightnessOf(mode["--background-brand-boldest-default"]!)).toBeLessThan(
        lightnessOf(mode["--background-brand-bold-default"]!)
      );
    }
  });

  it("should invert lightness roles between light and dark themes", () => {
    const theme = generateBrandTheme("#1e3661");
    // bold est sombre en clair, clair en sombre.
    expect(lightnessOf(theme.dark["--background-brand-bold-default"]!)).toBeGreaterThan(
      lightnessOf(theme.light["--background-brand-bold-default"]!)
    );
  });

  it("should throw on an invalid seed", () => {
    expect(() => generateBrandTheme("not-a-color")).toThrow();
  });
});

describe("brandThemeToCss", () => {
  it("should target :root and [data-theme=dark] by default", () => {
    const css = brandThemeToCss("#1e3661");
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("--background-brand-bold-default:");
  });

  it("should scope both themes when a scope is given", () => {
    const css = brandThemeToCss("#1e3661", { scope: '[data-brand="acme"]' });
    expect(css).toContain('[data-brand="acme"] {');
    expect(css).toContain(
      '[data-brand="acme"][data-theme="dark"], [data-theme="dark"] [data-brand="acme"] {'
    );
  });
});
