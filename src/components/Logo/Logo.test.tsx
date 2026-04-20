// Tests unitaires pour Logo
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("should render an SVG", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should have displayName set to Logo", () => {
    expect(Logo.displayName).toBe("Logo");
  });

  it("should be aria-hidden by default", () => {
    const { container } = render(<Logo />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("should have role img and aria-label when aria-label is provided", () => {
    render(<Logo aria-label="Logo Comète" />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Logo Comète");
  });

  it("should apply custom className", () => {
    const { container } = render(<Logo className="custom" />);
    expect(container.firstElementChild).toHaveClass("custom");
  });

  it("should render icon format", () => {
    const { container } = render(<Logo format="icon" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 32 32");
  });

  it("should render logo format with wider viewBox", () => {
    const { container } = render(<Logo format="logo" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Logo viewBox is wider than icon
    const viewBox = svg?.getAttribute("viewBox") ?? "";
    const [, , w] = viewBox.split(" ").map(Number);
    expect(w).toBeGreaterThan(32);
  });

  it("should scale size", () => {
    const { container } = render(<Logo format="icon" size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
  });

  it("should render cafe product", () => {
    const { container } = render(<Logo product="cafe" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should support taglineAlign=column", () => {
    const { container } = render(<Logo product="ontime" taglineAlign="column" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
