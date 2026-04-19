import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  // -------------------------------------------------------------------
  // Default HTML element per size
  // -------------------------------------------------------------------

  it("should render h1 for xxlarge", () => {
    render(<Hero size="xxlarge">Hero</Hero>);
    expect(screen.getByText("Hero").tagName).toBe("H1");
  });

  it("should render h1 for large", () => {
    render(<Hero size="large">Hero</Hero>);
    expect(screen.getByText("Hero").tagName).toBe("H1");
  });

  it("should render h2 for small", () => {
    render(<Hero size="small">Hero</Hero>);
    expect(screen.getByText("Hero").tagName).toBe("H2");
  });

  it("should render h2 for xxsmall", () => {
    render(<Hero size="xxsmall">Hero</Hero>);
    expect(screen.getByText("Hero").tagName).toBe("H2");
  });

  // -------------------------------------------------------------------
  // as override
  // -------------------------------------------------------------------

  it("should override element with as", () => {
    render(<Hero size="xxlarge" as="div">Hero</Hero>);
    expect(screen.getByText("Hero").tagName).toBe("DIV");
  });

  // -------------------------------------------------------------------
  // CSS class
  // -------------------------------------------------------------------

  it("should apply the size class", () => {
    render(<Hero size="xlarge">Hero</Hero>);
    expect(screen.getByText("Hero").className).toContain("hero-xlarge");
  });

  it("should apply the base hero class for margin reset", () => {
    render(<Hero size="medium">Hero</Hero>);
    expect(screen.getByText("Hero").className).toContain("hero");
  });

  // -------------------------------------------------------------------
  // Color
  // -------------------------------------------------------------------

  it("should apply color-default by default", () => {
    render(<Hero size="large">Hero</Hero>);
    expect(screen.getByText("Hero").className).toContain("color-default");
  });

  it("should apply color-inverse", () => {
    render(<Hero size="large" color="inverse">Hero</Hero>);
    expect(screen.getByText("Hero").className).toContain("color-inverse");
  });

  // -------------------------------------------------------------------
  // className / attributes
  // -------------------------------------------------------------------

  it("should merge custom className", () => {
    render(<Hero size="large" className="custom">Hero</Hero>);
    const el = screen.getByText("Hero");
    expect(el.className).toContain("custom");
    expect(el.className).toContain("hero-large");
  });

  it("should forward id attribute", () => {
    render(<Hero size="medium" id="hero">Hero</Hero>);
    expect(screen.getByText("Hero").id).toBe("hero");
  });
});
