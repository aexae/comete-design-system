// Tests unitaires pour le composant Icon
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";
import { InputContextProvider } from "../../contexts/InputContext";

// NOTE: CSS Modules en environnement jsdom = proxy identité.
// Les noms de classe correspondent aux noms bruts définis dans Icon.module.css.

describe("Icon", () => {
  // Rendu de base ----------------------------------------------------------

  it("should render a span wrapper element", () => {
    const { container } = render(<Icon icon="Add" />);
    const span = container.firstChild as HTMLElement;
    expect(span.tagName).toBe("SPAN");
  });

  it("should render an SVG inside the wrapper", () => {
    const { container } = render(<Icon icon="Add" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply the icon base class", () => {
    const { container } = render(<Icon icon="Add" />);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain("icon");
  });

  // Valeurs par défaut -----------------------------------------------------

  it("should render with default size 24", () => {
    const { container } = render(<Icon icon="Add" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("should be decorative (aria-hidden) by default", () => {
    const { container } = render(<Icon icon="Add" />);
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  // Prop icon --------------------------------------------------------------

  it("should render the requested icon", () => {
    const { container } = render(<Icon icon="Check" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render a different icon when icon prop changes", () => {
    const { container, rerender } = render(<Icon icon="Add" />);
    const svgBefore = container.querySelector("svg")?.innerHTML;
    rerender(<Icon icon="Check" />);
    const svgAfter = container.querySelector("svg")?.innerHTML;
    // Different icons produce different SVG paths
    expect(svgBefore).not.toBe(svgAfter);
  });

  // Prop size --------------------------------------------------------------

  it("should apply custom size to the SVG", () => {
    const { container } = render(<Icon icon="Add" size={16} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  // Prop className ---------------------------------------------------------

  it("should forward className to the wrapper span", () => {
    const { container } = render(<Icon icon="Add" className="custom-class" />);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain("custom-class");
    // Should also keep the base icon class
    expect(span.className).toContain("icon");
  });

  // Prop aria-label (accessibilité) -----------------------------------------

  it("should set aria-label and role='img' when aria-label is provided", () => {
    const { container } = render(<Icon icon="Warning" aria-label="Attention" />);
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-label", "Attention");
    expect(span).toHaveAttribute("role", "img");
  });

  it("should not have aria-hidden when aria-label is provided", () => {
    const { container } = render(<Icon icon="Warning" aria-label="Attention" />);
    const span = container.firstChild as HTMLElement;
    expect(span).not.toHaveAttribute("aria-hidden");
  });

  it("should have aria-hidden when no aria-label is provided", () => {
    const { container } = render(<Icon icon="Warning" />);
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-hidden", "true");
    expect(span).not.toHaveAttribute("aria-label");
  });

  // Couleur & contexte disabled --------------------------------------------

  it("should apply the explicit color class when not in a disabled context", () => {
    const { container } = render(<Icon icon="Add" color="subtlest" />);
    expect(container.querySelector("svg")).toHaveClass("comete-icon--subtlest");
  });

  it("should force the disabled color over an explicit color inside a disabled InputContext", () => {
    const { container } = render(
      <InputContextProvider isDisabled isInvalid={false}>
        <Icon icon="Add" color="subtlest" />
      </InputContextProvider>,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("comete-icon--disabled");
    expect(svg).not.toHaveClass("comete-icon--subtlest");
  });

  it("should keep the explicit color when the InputContext is not disabled", () => {
    const { container } = render(
      <InputContextProvider isDisabled={false} isInvalid={false}>
        <Icon icon="Add" color="brand" />
      </InputContextProvider>,
    );
    expect(container.querySelector("svg")).toHaveClass("comete-icon--brand");
  });
});
