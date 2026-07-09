import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./Heading";

describe("Heading", () => {
  // -------------------------------------------------------------------
  // Default HTML element per size
  // -------------------------------------------------------------------

  it("should render h1 for xxlarge", () => {
    render(<Heading size="xxlarge">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H1");
  });

  it("should render h1 for xlarge", () => {
    render(<Heading size="xlarge">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H1");
  });

  it("should render h2 for large", () => {
    render(<Heading size="large">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H2");
  });

  it("should render h3 for medium", () => {
    render(<Heading size="medium">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H3");
  });

  it("should render h4 for small", () => {
    render(<Heading size="small">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H4");
  });

  it("should render h5 for xsmall", () => {
    render(<Heading size="xsmall">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H5");
  });

  it("should render h6 for xxsmall", () => {
    render(<Heading size="xxsmall">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H6");
  });

  // -------------------------------------------------------------------
  // as override
  // -------------------------------------------------------------------

  it("should override element with as", () => {
    render(<Heading size="xxlarge" as="h2">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("H2");
  });

  it("should accept div as override", () => {
    render(<Heading size="medium" as="div">Title</Heading>);
    expect(screen.getByText("Title").tagName).toBe("DIV");
  });

  // -------------------------------------------------------------------
  // CSS class
  // -------------------------------------------------------------------

  it("should apply the size class", () => {
    render(<Heading size="large">Title</Heading>);
    expect(screen.getByText("Title").className).toContain("heading-large");
  });

  it("should apply the base heading class for margin reset", () => {
    render(<Heading size="medium">Title</Heading>);
    expect(screen.getByText("Title").className).toContain("heading");
  });

  // -------------------------------------------------------------------
  // Color
  // -------------------------------------------------------------------

  it("should apply color-default by default", () => {
    render(<Heading size="medium">Title</Heading>);
    expect(screen.getByText("Title").className).toContain("color-default");
  });

  it("should apply color-inverted", () => {
    render(<Heading size="medium" color="inverted">Title</Heading>);
    expect(screen.getByText("Title").className).toContain("color-inverted");
  });

  // -------------------------------------------------------------------
  // Align
  // -------------------------------------------------------------------

  it("should not apply an align class by default", () => {
    render(<Heading size="medium">Title</Heading>);
    expect(screen.getByText("Title").className).not.toContain("align-");
  });

  it("should apply align-center", () => {
    render(<Heading size="medium" align="center">Title</Heading>);
    expect(screen.getByText("Title").className).toContain("align-center");
  });

  // -------------------------------------------------------------------
  // Italic
  // -------------------------------------------------------------------

  it("should apply italic class when italic", () => {
    render(<Heading size="medium" italic>Title</Heading>);
    expect(screen.getByText("Title").className).toContain("italic");
  });

  // -------------------------------------------------------------------
  // maxLines truncation
  // -------------------------------------------------------------------

  it("should apply truncate class and WebkitLineClamp when maxLines is set", () => {
    render(<Heading size="medium" maxLines={2}>Title</Heading>);
    const el = screen.getByText("Title");
    expect(el.className).toContain("truncate");
    expect(el.style.webkitLineClamp).toBe("2");
  });

  // -------------------------------------------------------------------
  // className / attributes
  // -------------------------------------------------------------------

  it("should merge custom className", () => {
    render(<Heading size="large" className="custom">Title</Heading>);
    const el = screen.getByText("Title");
    expect(el.className).toContain("custom");
    expect(el.className).toContain("heading-large");
  });

  it("should forward id attribute", () => {
    render(<Heading size="medium" id="heading">Title</Heading>);
    expect(screen.getByText("Title").id).toBe("heading");
  });
});
