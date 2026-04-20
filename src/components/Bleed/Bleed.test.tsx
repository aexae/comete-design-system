import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Bleed } from "./Bleed";

describe("Bleed", () => {
  it("should render children", () => {
    const { container } = render(<Bleed>Contenu</Bleed>);
    expect(container.textContent).toBe("Contenu");
  });

  it("should apply bleed class", () => {
    const { container } = render(<Bleed>x</Bleed>);
    expect(container.firstElementChild?.classList.contains("bleed")).toBe(true);
  });

  it("should apply inline class when inline is set", () => {
    const { container } = render(<Bleed inline="200">x</Bleed>);
    expect(container.firstElementChild?.classList.contains("inline")).toBe(true);
  });

  it("should apply block class when block is set", () => {
    const { container } = render(<Bleed block="200">x</Bleed>);
    expect(container.firstElementChild?.classList.contains("block")).toBe(true);
  });

  it("should set --_bleed-inline CSS variable", () => {
    const { container } = render(<Bleed inline="200">x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--_bleed-inline")).toBe("var(--space200)");
  });

  it("should set --_bleed-block CSS variable", () => {
    const { container } = render(<Bleed block="100">x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--_bleed-block")).toBe("var(--space100)");
  });

  it("should support both inline and block", () => {
    const { container } = render(<Bleed inline="200" block="100">x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("inline")).toBe(true);
    expect(el.classList.contains("block")).toBe(true);
  });

  it("should apply full class when isFull is true", () => {
    const { container } = render(<Bleed isFull>x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("full")).toBe(true);
  });

  it("should not apply inline class when isFull is true", () => {
    const { container } = render(<Bleed isFull inline="200">x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("full")).toBe(true);
    expect(el.classList.contains("inline")).toBe(false);
  });

  it("should not set --_bleed-inline when isFull is true", () => {
    const { container } = render(<Bleed isFull inline="200">x</Bleed>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--_bleed-inline")).toBe("");
  });

  it("should apply custom className", () => {
    const { container } = render(<Bleed className="custom">x</Bleed>);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });

  it("should apply color class", () => {
    const { container } = render(<Bleed color="success">x</Bleed>);
    expect(container.firstElementChild?.classList.contains("success")).toBe(true);
  });

  it("should apply bordered class", () => {
    const { container } = render(<Bleed isBordered>x</Bleed>);
    expect(container.firstElementChild?.classList.contains("bordered")).toBe(true);
  });

  it("should apply both color and bordered", () => {
    const { container } = render(<Bleed color="critical" isBordered>x</Bleed>);
    const el = container.firstElementChild!;
    expect(el.classList.contains("critical")).toBe(true);
    expect(el.classList.contains("bordered")).toBe(true);
  });

  it("should support all 7 colors", () => {
    const colors = ["neutral", "brand", "success", "warning", "critical", "information", "accent"] as const;
    for (const c of colors) {
      const { container, unmount } = render(<Bleed color={c}>x</Bleed>);
      expect(container.firstElementChild?.classList.contains(c)).toBe(true);
      unmount();
    }
  });
});
