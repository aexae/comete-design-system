import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconTile } from "./IconTile";

describe("IconTile", () => {
  it("should render with default props", () => {
    const { container } = render(<IconTile icon="CalendarMonth" />);
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.tagName).toBe("SPAN");
    expect(tile.className).toContain("iconTile");
    expect(tile.className).toContain("medium");
    expect(tile.className).toContain("square");
    expect(tile.className).toContain("neutral");
    expect(tile.getAttribute("aria-hidden")).toBe("true");
  });

  it("should apply appearance class", () => {
    const { container } = render(
      <IconTile icon="Warning" appearance="critical" />,
    );
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain("critical");
  });

  it("should apply size class", () => {
    const { container } = render(
      <IconTile icon="CalendarMonth" size="large" />,
    );
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain("large");
  });

  it("should apply shape class", () => {
    const { container } = render(
      <IconTile icon="CalendarMonth" shape="circle" />,
    );
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain("circle");
  });

  it("should set aria-label and role when label is provided", () => {
    render(<IconTile icon="CalendarMonth" label="Calendrier" />);
    const tile = screen.getByRole("img", { name: "Calendrier" });

    expect(tile).toBeDefined();
    expect(tile.getAttribute("aria-hidden")).toBeNull();
  });

  it("should be aria-hidden when no label is provided", () => {
    const { container } = render(<IconTile icon="CalendarMonth" />);
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(tile.getAttribute("role")).toBeNull();
  });

  it("should accept a custom className", () => {
    const { container } = render(
      <IconTile icon="CalendarMonth" className="custom" />,
    );
    const tile = container.firstElementChild as HTMLElement;

    expect(tile.className).toContain("custom");
  });

  it("should render all appearances", () => {
    const appearances = [
      "neutral",
      "brand",
      "information",
      "success",
      "warning",
      "critical",
      "accent",
    ] as const;

    for (const appearance of appearances) {
      const { container } = render(
        <IconTile icon="CalendarMonth" appearance={appearance} />,
      );
      const tile = container.firstElementChild as HTMLElement;

      expect(tile.className).toContain(appearance);
    }
  });

  it("should render all sizes", () => {
    const sizes = ["xsmall", "small", "medium", "large"] as const;

    for (const size of sizes) {
      const { container } = render(
        <IconTile icon="CalendarMonth" size={size} />,
      );
      const tile = container.firstElementChild as HTMLElement;

      expect(tile.className).toContain(size);
    }
  });

  it("should render both shapes", () => {
    const shapes = ["square", "circle"] as const;

    for (const shape of shapes) {
      const { container } = render(
        <IconTile icon="CalendarMonth" shape={shape} />,
      );
      const tile = container.firstElementChild as HTMLElement;

      expect(tile.className).toContain(shape);
    }
  });
});
