import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  // -------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------

  it("should render children in a p by default", () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("P");
  });

  it("should apply medium size and regular weight by default", () => {
    render(<Text>Default</Text>);
    expect(screen.getByText("Default").className).toContain("text-medium-regular");
  });

  // -------------------------------------------------------------------
  // Size
  // -------------------------------------------------------------------

  it("should apply large size", () => {
    render(<Text size="large">Large</Text>);
    expect(screen.getByText("Large").className).toContain("text-large-regular");
  });

  it("should apply small size", () => {
    render(<Text size="small">Small</Text>);
    expect(screen.getByText("Small").className).toContain("text-small-regular");
  });

  it("should apply xsmall size", () => {
    render(<Text size="xsmall">XSmall</Text>);
    expect(screen.getByText("XSmall").className).toContain("text-xsmall-regular");
  });

  // -------------------------------------------------------------------
  // Weight
  // -------------------------------------------------------------------

  it("should apply medium weight", () => {
    render(<Text weight="medium">Medium</Text>);
    expect(screen.getByText("Medium").className).toContain("text-medium-medium");
  });

  it("should apply bold weight", () => {
    render(<Text weight="bold">Bold</Text>);
    expect(screen.getByText("Bold").className).toContain("text-medium-bold");
  });

  it("should combine size and weight", () => {
    render(<Text size="large" weight="bold">LargeBold</Text>);
    expect(screen.getByText("LargeBold").className).toContain("text-large-bold");
  });

  // -------------------------------------------------------------------
  // as
  // -------------------------------------------------------------------

  it("should render as span", () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText("Inline").tagName).toBe("SPAN");
  });

  it("should render as strong", () => {
    render(<Text as="strong">Strong</Text>);
    expect(screen.getByText("Strong").tagName).toBe("STRONG");
  });

  it("should render as em", () => {
    render(<Text as="em">Emphasis</Text>);
    expect(screen.getByText("Emphasis").tagName).toBe("EM");
  });

  it("should render as label", () => {
    render(<Text as="label">Label</Text>);
    expect(screen.getByText("Label").tagName).toBe("LABEL");
  });

  // -------------------------------------------------------------------
  // Color
  // -------------------------------------------------------------------

  it("should apply color-default by default", () => {
    render(<Text>Text</Text>);
    expect(screen.getByText("Text").className).toContain("color-default");
  });

  it("should apply color-subtle", () => {
    render(<Text color="subtle">Text</Text>);
    expect(screen.getByText("Text").className).toContain("color-subtle");
  });

  it("should apply color-critical", () => {
    render(<Text color="critical">Error</Text>);
    expect(screen.getByText("Error").className).toContain("color-critical");
  });

  // -------------------------------------------------------------------
  // Align
  // -------------------------------------------------------------------

  it("should not apply align by default", () => {
    render(<Text>Text</Text>);
    expect(screen.getByText("Text").className).not.toContain("align-");
  });

  it("should apply align-center", () => {
    render(<Text align="center">Center</Text>);
    expect(screen.getByText("Center").className).toContain("align-center");
  });

  it("should apply align-end", () => {
    render(<Text align="end">End</Text>);
    expect(screen.getByText("End").className).toContain("align-end");
  });

  // -------------------------------------------------------------------
  // Underline / Italic
  // -------------------------------------------------------------------

  it("should apply underline", () => {
    render(<Text underline>Underlined</Text>);
    expect(screen.getByText("Underlined").className).toContain("underline");
  });

  it("should apply italic", () => {
    render(<Text italic>Italic</Text>);
    expect(screen.getByText("Italic").className).toContain("italic");
  });

  // -------------------------------------------------------------------
  // maxLines
  // -------------------------------------------------------------------

  it("should apply truncate class when maxLines is set", () => {
    render(<Text maxLines={2}>Truncated</Text>);
    const el = screen.getByText("Truncated");
    expect(el.className).toContain("truncate");
  });

  it("should set WebkitLineClamp style when maxLines is set", () => {
    render(<Text maxLines={3}>Truncated</Text>);
    const el = screen.getByText("Truncated");
    expect(el.style.webkitLineClamp).toBe("3");
  });

  it("should not apply truncate when maxLines is not set", () => {
    render(<Text>Normal</Text>);
    expect(screen.getByText("Normal").className).not.toContain("truncate");
  });

  // -------------------------------------------------------------------
  // className / attributes
  // -------------------------------------------------------------------

  it("should merge custom className", () => {
    render(<Text className="custom">Text</Text>);
    const el = screen.getByText("Text");
    expect(el.className).toContain("custom");
    expect(el.className).toContain("text-medium-regular");
  });

  it("should forward id attribute", () => {
    render(<Text id="my-text">Text</Text>);
    expect(screen.getByText("Text").id).toBe("my-text");
  });

  // -------------------------------------------------------------------
  // Combinaisons
  // -------------------------------------------------------------------

  it("should combine all props", () => {
    render(
      <Text size="large" weight="bold" color="brand" align="center" underline italic as="span" className="extra">
        Combined
      </Text>,
    );
    const el = screen.getByText("Combined");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toContain("text-large-bold");
    expect(el.className).toContain("color-brand");
    expect(el.className).toContain("align-center");
    expect(el.className).toContain("underline");
    expect(el.className).toContain("italic");
    expect(el.className).toContain("extra");
  });

  // -------------------------------------------------------------------
  // margin: 0 (reset)
  // -------------------------------------------------------------------

  it("should apply the base text class for margin reset", () => {
    render(<Text>Text</Text>);
    expect(screen.getByText("Text").className).toContain("text");
  });
});
