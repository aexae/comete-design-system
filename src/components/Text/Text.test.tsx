import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render children", () => {
    render(<Text type="body" variant="m">Hello world</Text>);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // Balise HTML par défaut — Hero
  // -------------------------------------------------------------------

  it("should render an h1 for hero xxl", () => {
    render(<Text type="hero" variant="xxl">Hero</Text>);
    expect(screen.getByText("Hero").tagName).toBe("H1");
  });

  it("should render an h1 for hero xxl-semibold", () => {
    render(<Text type="hero" variant="xxl-semibold">Hero</Text>);
    expect(screen.getByText("Hero").tagName).toBe("H1");
  });

  it("should render an h2 for hero s", () => {
    render(<Text type="hero" variant="s">Hero</Text>);
    expect(screen.getByText("Hero").tagName).toBe("H2");
  });

  it("should render an h2 for hero s-bold", () => {
    render(<Text type="hero" variant="s-bold">Hero</Text>);
    expect(screen.getByText("Hero").tagName).toBe("H2");
  });

  // -------------------------------------------------------------------
  // Balise HTML par défaut — Heading
  // -------------------------------------------------------------------

  it("should render an h1 for heading xxl", () => {
    render(<Text type="heading" variant="xxl">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H1");
  });

  it("should render an h1 for heading xxl-bold", () => {
    render(<Text type="heading" variant="xxl-bold">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H1");
  });

  it("should render an h2 for heading xl", () => {
    render(<Text type="heading" variant="xl">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H2");
  });

  it("should render an h3 for heading l", () => {
    render(<Text type="heading" variant="l">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H3");
  });

  it("should render an h4 for heading m", () => {
    render(<Text type="heading" variant="m">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H4");
  });

  it("should render an h5 for heading s", () => {
    render(<Text type="heading" variant="s">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H5");
  });

  it("should render an h6 for heading xs", () => {
    render(<Text type="heading" variant="xs">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H6");
  });

  it("should render an h6 for heading xxs", () => {
    render(<Text type="heading" variant="xxs">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H6");
  });

  it("should render an h6 for heading xs-bold", () => {
    render(<Text type="heading" variant="xs-bold">Title</Text>);
    expect(screen.getByText("Title").tagName).toBe("H6");
  });

  // -------------------------------------------------------------------
  // Balise HTML par défaut — Body
  // -------------------------------------------------------------------

  it("should render a p for body m", () => {
    render(<Text type="body" variant="m">Body</Text>);
    expect(screen.getByText("Body").tagName).toBe("P");
  });

  it("should render a p for body l-bold", () => {
    render(<Text type="body" variant="l-bold">Body</Text>);
    expect(screen.getByText("Body").tagName).toBe("P");
  });

  it("should render a p for body xs", () => {
    render(<Text type="body" variant="xs">Body</Text>);
    expect(screen.getByText("Body").tagName).toBe("P");
  });

  it("should render a span for body label", () => {
    render(<Text type="body" variant="label">Label</Text>);
    expect(screen.getByText("Label").tagName).toBe("SPAN");
  });

  // -------------------------------------------------------------------
  // Balise HTML par défaut — Code
  // -------------------------------------------------------------------

  it("should render a code element for code value", () => {
    render(<Text type="code" variant="value">const x = 1</Text>);
    expect(screen.getByText("const x = 1").tagName).toBe("CODE");
  });

  it("should render a code element for code operator", () => {
    render(<Text type="code" variant="operator">=&gt;</Text>);
    expect(screen.getByText("=>").tagName).toBe("CODE");
  });

  it("should render a code element for code label", () => {
    render(<Text type="code" variant="label">function</Text>);
    expect(screen.getByText("function").tagName).toBe("CODE");
  });

  // -------------------------------------------------------------------
  // Override de la balise via as
  // -------------------------------------------------------------------

  it("should override the default element with as", () => {
    render(
      <Text type="heading" variant="xxl" as="h2">
        Title
      </Text>,
    );
    expect(screen.getByText("Title").tagName).toBe("H2");
  });

  it("should accept a span via as for body variant", () => {
    render(
      <Text type="body" variant="m" as="span">
        Inline
      </Text>,
    );
    expect(screen.getByText("Inline").tagName).toBe("SPAN");
  });

  // -------------------------------------------------------------------
  // Variant CSS class
  // -------------------------------------------------------------------

  it("should apply the variant class for body-m", () => {
    render(<Text type="body" variant="m">Text</Text>);
    expect(screen.getByText("Text").className).toContain("body-m");
  });

  it("should apply the variant class for hero-xxl", () => {
    render(<Text type="hero" variant="xxl">Hero</Text>);
    expect(screen.getByText("Hero").className).toContain("hero-xxl");
  });

  it("should apply the variant class for heading-xs", () => {
    render(<Text type="heading" variant="xs">Heading</Text>);
    expect(screen.getByText("Heading").className).toContain("heading-xs");
  });

  it("should apply the label class for body label", () => {
    render(<Text type="body" variant="label">Label</Text>);
    expect(screen.getByText("Label").className).toContain("label");
  });

  it("should apply the variant class for code-value", () => {
    render(<Text type="code" variant="value">code</Text>);
    expect(screen.getByText("code").className).toContain("code-value");
  });

  // -------------------------------------------------------------------
  // Color
  // -------------------------------------------------------------------

  it("should apply color-default by default", () => {
    render(<Text type="body" variant="m">Text</Text>);
    expect(screen.getByText("Text").className).toContain("color-default");
  });

  it("should apply the color class when color is set", () => {
    render(
      <Text type="body" variant="m" color="subtle">
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("color-subtle");
  });

  it("should apply color-critical", () => {
    render(
      <Text type="body" variant="s" color="critical">
        Error
      </Text>,
    );
    expect(screen.getByText("Error").className).toContain("color-critical");
  });

  it("should apply color-brand", () => {
    render(
      <Text type="body" variant="m" color="brand">
        Brand
      </Text>,
    );
    expect(screen.getByText("Brand").className).toContain("color-brand");
  });

  it("should apply color-link", () => {
    render(
      <Text type="body" variant="m" color="link">
        Link
      </Text>,
    );
    expect(screen.getByText("Link").className).toContain("color-link");
  });

  // -------------------------------------------------------------------
  // Align
  // -------------------------------------------------------------------

  it("should not apply an align class by default", () => {
    render(<Text type="body" variant="m">Text</Text>);
    expect(screen.getByText("Text").className).not.toContain("align-");
  });

  it("should apply align-center", () => {
    render(
      <Text type="body" variant="m" align="center">
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("align-center");
  });

  it("should apply align-right", () => {
    render(
      <Text type="body" variant="m" align="right">
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("align-right");
  });

  it("should apply align-left", () => {
    render(
      <Text type="body" variant="m" align="left">
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("align-left");
  });

  // -------------------------------------------------------------------
  // Underline
  // -------------------------------------------------------------------

  it("should not apply underline by default", () => {
    render(<Text type="body" variant="m">Text</Text>);
    expect(screen.getByText("Text").className).not.toContain("underline");
  });

  it("should apply underline class when underline is true", () => {
    render(
      <Text type="body" variant="m" underline>
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("underline");
  });

  // -------------------------------------------------------------------
  // Italic
  // -------------------------------------------------------------------

  it("should not apply italic by default", () => {
    render(<Text type="body" variant="m">Text</Text>);
    expect(screen.getByText("Text").className).not.toContain("italic");
  });

  it("should apply italic class when italic is true", () => {
    render(
      <Text type="body" variant="m" italic>
        Text
      </Text>,
    );
    expect(screen.getByText("Text").className).toContain("italic");
  });

  // -------------------------------------------------------------------
  // className passthrough
  // -------------------------------------------------------------------

  it("should merge custom className", () => {
    render(
      <Text type="body" variant="m" className="custom">
        Text
      </Text>,
    );
    const el = screen.getByText("Text");
    expect(el.className).toContain("custom");
    expect(el.className).toContain("body-m");
  });

  // -------------------------------------------------------------------
  // HTML attributes passthrough
  // -------------------------------------------------------------------

  it("should forward HTML attributes", () => {
    render(
      <Text type="body" variant="m" id="my-text" data-testid="text">
        Text
      </Text>,
    );
    const el = screen.getByTestId("text");
    expect(el.id).toBe("my-text");
  });

  // -------------------------------------------------------------------
  // Combinaisons
  // -------------------------------------------------------------------

  it("should combine type, variant, color, align, underline, italic and className", () => {
    render(
      <Text type="heading" variant="xl" color="brand" align="center" underline italic className="extra">
        Combined
      </Text>,
    );
    const el = screen.getByText("Combined");
    expect(el.tagName).toBe("H2");
    expect(el.className).toContain("heading-xl");
    expect(el.className).toContain("color-brand");
    expect(el.className).toContain("align-center");
    expect(el.className).toContain("underline");
    expect(el.className).toContain("italic");
    expect(el.className).toContain("extra");
  });

  it("should combine as override with variant styling", () => {
    render(
      <Text type="heading" variant="xxl" as="span" color="subtle">
        Span styled as H1
      </Text>,
    );
    const el = screen.getByText("Span styled as H1");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toContain("heading-xxl");
    expect(el.className).toContain("color-subtle");
  });

  // -------------------------------------------------------------------
  // margin: 0 (reset)
  // -------------------------------------------------------------------

  it("should apply the base text class for margin reset", () => {
    render(<Text type="heading" variant="xxl">Title</Text>);
    expect(screen.getByText("Title").className).toContain("text");
  });
});
