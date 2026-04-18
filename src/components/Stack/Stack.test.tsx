import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("should render children", () => {
    const { getByText } = render(
      <Stack>
        <span>A</span>
        <span>B</span>
      </Stack>,
    );
    expect(getByText("A")).toBeInTheDocument();
    expect(getByText("B")).toBeInTheDocument();
  });

  it("should default to column direction, stretch align, start justify", () => {
    const { container } = render(
      <Stack>
        <span>A</span>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("column");
    expect(el.className).toContain("align-stretch");
    expect(el.className).toContain("justify-start");
  });

  it("should apply row direction", () => {
    const { container } = render(
      <Stack direction="row">
        <span>A</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("row");
  });

  it("should apply gap as --space token CSS variable", () => {
    const { container } = render(
      <Stack gap="200">
        <span>A</span>
      </Stack>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_stack-gap");
    expect(style).toContain("var(--space200)");
  });

  it("should apply align and justify classes", () => {
    const { container } = render(
      <Stack align="center" justify="between">
        <span>A</span>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("align-center");
    expect(el.className).toContain("justify-between");
  });

  it("should apply wrap class when wrap=true", () => {
    const { container } = render(
      <Stack wrap>
        <span>A</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("wrap");
  });

  it("should not apply wrap class by default", () => {
    const { container } = render(
      <Stack>
        <span>A</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).not.toContain(
      "wrap",
    );
  });

  it("should include custom className", () => {
    const { container } = render(
      <Stack className="custom-class">
        <span>A</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-class",
    );
  });

  it("should always include the base stack class", () => {
    const { container } = render(
      <Stack>
        <span>A</span>
      </Stack>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("stack");
  });
});
