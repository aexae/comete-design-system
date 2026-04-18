import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Cluster } from "./Cluster";

describe("Cluster", () => {
  it("should render children", () => {
    const { getByText } = render(
      <Cluster>
        <span>A</span>
        <span>B</span>
      </Cluster>,
    );
    expect(getByText("A")).toBeInTheDocument();
    expect(getByText("B")).toBeInTheDocument();
  });

  it("should default to center align and start justify", () => {
    const { container } = render(
      <Cluster>
        <span>A</span>
      </Cluster>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("align-center");
    expect(el.className).toContain("justify-start");
  });

  it("should apply gap as CSS variables for both axes", () => {
    const { container } = render(
      <Cluster gap="200">
        <span>A</span>
      </Cluster>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_cluster-row-gap");
    expect(style).toContain("--_cluster-column-gap");
    expect(style).toContain("var(--space200)");
  });

  it("should allow independent rowGap and columnGap", () => {
    const { container } = render(
      <Cluster rowGap="300" columnGap="100">
        <span>A</span>
      </Cluster>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_cluster-row-gap: var(--space300)");
    expect(style).toContain("--_cluster-column-gap: var(--space100)");
  });

  it("should fall back to gap when rowGap or columnGap is omitted", () => {
    const { container } = render(
      <Cluster gap="200" columnGap="050">
        <span>A</span>
      </Cluster>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_cluster-row-gap: var(--space200)");
    expect(style).toContain("--_cluster-column-gap: var(--space050)");
  });

  it("should apply align and justify classes", () => {
    const { container } = render(
      <Cluster align="baseline" justify="between">
        <span>A</span>
      </Cluster>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("align-baseline");
    expect(el.className).toContain("justify-between");
  });

  it("should include custom className", () => {
    const { container } = render(
      <Cluster className="custom-class">
        <span>A</span>
      </Cluster>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-class",
    );
  });

  it("should always include the base cluster class", () => {
    const { container } = render(
      <Cluster>
        <span>A</span>
      </Cluster>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "cluster",
    );
  });
});
