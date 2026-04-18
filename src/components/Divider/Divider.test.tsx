import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("should render with role separator by default", () => {
    const { getByRole } = render(<Divider />);
    expect(getByRole("separator")).toBeInTheDocument();
  });

  it("should default to horizontal orientation", () => {
    const { getByRole } = render(<Divider />);
    const sep = getByRole("separator");
    expect(sep.className).toContain("horizontal");
    expect(sep.className).not.toContain("vertical");
  });

  it("should render with vertical orientation when specified", () => {
    const { getByRole } = render(<Divider orientation="vertical" />);
    const sep = getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
    expect(sep.className).toContain("vertical");
  });

  it("should apply additional className", () => {
    const { getByRole } = render(<Divider className="custom-class" />);
    expect(getByRole("separator").className).toContain("custom-class");
  });

  it("should always include the base divider class", () => {
    const { getByRole } = render(<Divider />);
    expect(getByRole("separator").className).toContain("divider");
  });
});
