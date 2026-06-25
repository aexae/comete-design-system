// Tests unitaires pour le composant Badge
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

// NOTE: CSS Modules en environnement jsdom = proxy identité.
// Les noms de classe correspondent aux noms bruts définis dans Badge.module.css.

describe("Badge", () => {
  // Rendu de base --------------------------------------------------------

  it("should render a span element", () => {
    render(<Badge label="Test" />);
    expect(screen.getByText("Test").tagName).toBe("SPAN");
  });

  it("should display the label for high importance", () => {
    render(<Badge importance="high" label="New" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should display the label for medium importance", () => {
    render(<Badge importance="medium" label="12" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should not display any text for low importance (dot)", () => {
    const { container } = render(<Badge importance="low" label="ignored" />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.textContent).toBe("");
  });

  // Valeurs par défaut ---------------------------------------------------

  it("should apply default appearance 'neutral' and importance 'high'", () => {
    render(<Badge label="Default" />);
    const el = screen.getByText("Default");
    expect(el.className).toContain("neutral");
    expect(el.className).toContain("high");
  });

  // Apparences -----------------------------------------------------------

  it.each([
    "neutral",
    "information",
    "information-inverted",
    "critical",
    "success",
    "warning",
    "accentPurple",
    "accentTeal",
    "accentTurquoise",
    "accentMagenta",
    "accentBlueGrey",
  ] as const)("should apply appearance class '%s'", (appearance) => {
    render(<Badge appearance={appearance} label="X" />);
    expect(screen.getByText("X").className).toContain(appearance);
  });

  // Importance -----------------------------------------------------------

  it.each(["high", "medium", "low"] as const)(
    "should apply importance class '%s'",
    (importance) => {
      const { container } = render(<Badge importance={importance} label="X" />);
      // Pour low, le span n'a pas de texte visible
      const el = container.querySelector("span");
      expect(el?.className).toContain(importance);
    }
  );

  // cutoutBorder ---------------------------------------------------------

  it("should apply cutoutBorder class when cutoutBorder=true", () => {
    render(<Badge label="X" cutoutBorder />);
    expect(screen.getByText("X").className).toContain("cutoutBorder");
  });

  it("should not apply cutoutBorder class by default", () => {
    render(<Badge label="X" />);
    expect(screen.getByText("X").className).not.toContain("cutoutBorder");
  });

  // Disabled -------------------------------------------------------------

  it("should apply disabled class when isDisabled=true", () => {
    render(<Badge label="X" isDisabled />);
    expect(screen.getByText("X").className).toContain("disabled");
  });

  it("should not apply disabled class by default", () => {
    render(<Badge label="X" />);
    expect(screen.getByText("X").className).not.toContain("disabled");
  });

  // Combinaisons ---------------------------------------------------------

  it("should combine appearance, importance and cutoutBorder classes", () => {
    render(<Badge appearance="critical" importance="medium" label="!" cutoutBorder />);
    const el = screen.getByText("!");
    expect(el.className).toContain("critical");
    expect(el.className).toContain("medium");
    expect(el.className).toContain("cutoutBorder");
  });

  it("should apply disabled class regardless of appearance", () => {
    render(<Badge appearance="success" importance="high" label="OK" isDisabled />);
    const el = screen.getByText("OK");
    expect(el.className).toContain("disabled");
    expect(el.className).toContain("success");
  });
});
