import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandProvider } from "./BrandProvider";

describe("BrandProvider", () => {
  it("should render its children", () => {
    const { getByText } = render(
      <BrandProvider seed="#1e3661">
        <span>contenu</span>
      </BrandProvider>,
    );
    expect(getByText("contenu")).toBeInTheDocument();
  });

  it("should inject a :root override when no name is given", () => {
    const { container } = render(
      <BrandProvider seed="#ff6a00">
        <span />
      </BrandProvider>,
    );
    const style = container.querySelector("style");
    expect(style?.textContent).toContain(":root {");
    expect(style?.textContent).toContain("--background-brand-bold-default:");
  });

  it("should scope the override and set data-brand when a name is given", () => {
    const { container } = render(
      <BrandProvider seed="#ff6a00" name="acme">
        <span />
      </BrandProvider>,
    );
    const wrapper = container.querySelector('[data-brand="acme"]');
    expect(wrapper).not.toBeNull();
    const style = container.querySelector("style");
    expect(style?.textContent).toContain('[data-brand="acme"] {');
  });

  it("should not inject any style for an invalid seed", () => {
    const { container } = render(
      <BrandProvider seed="not-a-color">
        <span>contenu</span>
      </BrandProvider>,
    );
    expect(container.querySelector("style")).toBeNull();
    expect(container.textContent).toContain("contenu");
  });
});
