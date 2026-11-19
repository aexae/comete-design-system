// Tests unitaires du composant FocusRing
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FocusRing } from "./FocusRing";

describe("FocusRing", () => {
  it("should render a span with aria-hidden", () => {
    const { container } = render(<FocusRing />);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("should apply ring CSS class", () => {
    const { container } = render(<FocusRing />);
    expect(container.querySelector("span")).toHaveClass("ring");
  });

  it("should apply outside class by default", () => {
    const { container } = render(<FocusRing />);
    expect(container.querySelector("span")).toHaveClass("outside");
  });

  it("should apply inside class when position is inside", () => {
    const { container } = render(<FocusRing position="inside" />);
    expect(container.querySelector("span")).toHaveClass("inside");
  });

  // REASON: on lit le style inline plutôt que `toHaveStyle` : depuis jsdom 30,
  // `getComputedStyle` résout les `var()` et un token non défini en test donne `0px`.
  it("should apply border-radius token from borderRadius prop (number)", () => {
    const { container } = render(<FocusRing borderRadius={4} />);
    expect(container.querySelector("span")?.style.borderRadius).toBe("var(--radius050)");
  });

  it("should apply border-radius round token when borderRadius is round", () => {
    const { container } = render(<FocusRing borderRadius="round" />);
    expect(container.querySelector("span")?.style.borderRadius).toBe("var(--radius-round)");
  });

  it("should default to borderRadius token --radius025", () => {
    const { container } = render(<FocusRing />);
    expect(container.querySelector("span")?.style.borderRadius).toBe("var(--radius025)");
  });
});
