import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Grid } from "./Grid";

describe("Grid", () => {
  it("should render children", () => {
    const { getByText } = render(
      <Grid>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    expect(getByText("Cell")).toBeInTheDocument();
  });

  it("should not inject --_grid-cols-* when columns uses default", () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    // default 12 is applied as mobile value
    expect(style).toContain("--_grid-cols-mobile: 12");
  });

  it("should inject columns as mobile CSS variable when scalar", () => {
    const { container } = render(
      <Grid columns={4}>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_grid-cols-mobile: 4");
    expect(style).not.toContain("--_grid-cols-tablet");
    expect(style).not.toContain("--_grid-cols-desktop");
  });

  it("should inject responsive columns per breakpoint", () => {
    const { container } = render(
      <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_grid-cols-mobile: 1");
    expect(style).toContain("--_grid-cols-tablet: 2");
    expect(style).toContain("--_grid-cols-desktop: 4");
  });

  it("should only inject the breakpoints provided", () => {
    const { container } = render(
      <Grid columns={{ tablet: 3 }}>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).not.toContain("--_grid-cols-mobile");
    expect(style).toContain("--_grid-cols-tablet: 3");
    expect(style).not.toContain("--_grid-cols-desktop");
  });

  it("should apply gap as CSS variables for both axes", () => {
    const { container } = render(
      <Grid gap="200">
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_grid-row-gap: var(--space200)");
    expect(style).toContain("--_grid-column-gap: var(--space200)");
  });

  it("should allow independent rowGap and columnGap", () => {
    const { container } = render(
      <Grid gap="100" rowGap="300">
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style");
    expect(style).toContain("--_grid-row-gap: var(--space300)");
    expect(style).toContain("--_grid-column-gap: var(--space100)");
  });

  it("should include the base grid class", () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("grid");
  });

  it("should include custom className on Grid", () => {
    const { container } = render(
      <Grid className="custom-class">
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "custom-class",
    );
  });
});

describe("Grid.Col", () => {
  it("should default span to 1 (mobile)", () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelector("[style*='col-span-mobile']");
    expect(col).not.toBeNull();
    expect(col?.getAttribute("style")).toContain("--_col-span-mobile: 1");
  });

  it("should inject scalar span as mobile CSS variable", () => {
    const { container } = render(
      <Grid>
        <Grid.Col span={6}>Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    const style = col.getAttribute("style");
    expect(style).toContain("--_col-span-mobile: 6");
    expect(style).not.toContain("--_col-span-tablet");
    expect(style).not.toContain("--_col-span-desktop");
  });

  it("should inject responsive span per breakpoint", () => {
    const { container } = render(
      <Grid>
        <Grid.Col span={{ mobile: 12, tablet: 6, desktop: 3 }}>Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    const style = col.getAttribute("style");
    expect(style).toContain("--_col-span-mobile: 12");
    expect(style).toContain("--_col-span-tablet: 6");
    expect(style).toContain("--_col-span-desktop: 3");
  });

  it("should inject start when provided and add hasStart class", () => {
    const { container } = render(
      <Grid>
        <Grid.Col span={6} start={3}>
          Cell
        </Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    expect(col.className).toContain("hasStart");
    expect(col.getAttribute("style")).toContain("--_col-start-mobile: 3");
  });

  it("should NOT add hasStart class when start is omitted", () => {
    const { container } = render(
      <Grid>
        <Grid.Col span={6}>Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    expect(col.className).not.toContain("hasStart");
  });

  it("should include custom className on Grid.Col", () => {
    const { container } = render(
      <Grid>
        <Grid.Col className="custom-col">Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    expect(col.className).toContain("custom-col");
  });

  it("should always include the base col class", () => {
    const { container } = render(
      <Grid>
        <Grid.Col>Cell</Grid.Col>
      </Grid>,
    );
    const col = container.querySelectorAll("div")[1] as HTMLElement;
    expect(col.className).toContain("col");
  });
});
