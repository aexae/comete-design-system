import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Illustration } from "./Illustration";

describe("Illustration", () => {
  // Rendu de base ----------------------------------------------------------

  it("should render a span wrapper element", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const span = container.firstChild as HTMLElement;
    expect(span.tagName).toBe("SPAN");
  });

  it("should render an SVG inside the wrapper", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply the illustration base class", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain("illustration");
  });

  // Valeurs par défaut -----------------------------------------------------

  it("should render with default size 256", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "256");
    expect(svg).toHaveAttribute("height", "256");
  });

  it("should be decorative (aria-hidden) by default", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  // Prop illustration ------------------------------------------------------

  it("should render a different illustration when prop changes", () => {
    const { container, rerender } = render(<Illustration illustration="Empty" />);
    const svgBefore = container.querySelector("svg")?.innerHTML;
    rerender(<Illustration illustration="Shield" />);
    const svgAfter = container.querySelector("svg")?.innerHTML;
    expect(svgBefore).not.toBe(svgAfter);
  });

  // Prop size --------------------------------------------------------------

  it("should apply size 128 to the SVG", () => {
    const { container } = render(<Illustration illustration="Empty" size={128} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "128");
    expect(svg).toHaveAttribute("height", "128");
  });

  it("should apply size 512 to the SVG", () => {
    const { container } = render(<Illustration illustration="Empty" size={512} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "512");
    expect(svg).toHaveAttribute("height", "512");
  });

  // Prop className ---------------------------------------------------------

  it("should forward className to the wrapper span", () => {
    const { container } = render(
      <Illustration illustration="Empty" className="custom-class" />,
    );
    const span = container.firstChild as HTMLElement;
    expect(span.className).toContain("custom-class");
    expect(span.className).toContain("illustration");
  });

  // Prop aria-label (accessibilité) -----------------------------------------

  it("should set aria-label and role='img' when aria-label is provided", () => {
    const { container } = render(
      <Illustration illustration="ForbiddenAccess" aria-label="Accès refusé" />,
    );
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-label", "Accès refusé");
    expect(span).toHaveAttribute("role", "img");
  });

  it("should not have aria-hidden when aria-label is provided", () => {
    const { container } = render(
      <Illustration illustration="ForbiddenAccess" aria-label="Accès refusé" />,
    );
    const span = container.firstChild as HTMLElement;
    expect(span).not.toHaveAttribute("aria-hidden");
  });

  it("should have aria-hidden when no aria-label is provided", () => {
    const { container } = render(<Illustration illustration="Empty" />);
    const span = container.firstChild as HTMLElement;
    expect(span).toHaveAttribute("aria-hidden", "true");
    expect(span).not.toHaveAttribute("aria-label");
  });
});
