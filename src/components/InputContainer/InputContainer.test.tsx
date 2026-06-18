// Tests unitaires pour InputContainer
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputContainer } from "./InputContainer";

describe("InputContainer", () => {
  it("should render children", () => {
    render(
      <InputContainer>
        <input data-testid="inner" />
      </InputContainer>
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("should apply bordered class by default", () => {
    const { container } = render(
      <InputContainer>content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("inputContainer", "bordered");
  });

  it("should apply subtle class when appearance is subtle", () => {
    const { container } = render(
      <InputContainer appearance="subtle">content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("subtle");
    expect(container.firstChild).not.toHaveClass("bordered");
  });

  it.each([
    ["compact", "densityCompact"],
    ["default", "densityDefault"],
    ["touch", "densityTouch"],
  ] as const)("should apply class %s when density=%s", (density, cssClass) => {
    const { container } = render(
      <InputContainer density={density}>content</InputContainer>
    );
    expect(container.firstChild).toHaveClass(cssClass);
  });

  it("should apply disabled class when isDisabled is true", () => {
    const { container } = render(
      <InputContainer isDisabled>content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("disabled");
  });

  it("should apply invalid class when isInvalid is true", () => {
    const { container } = render(
      <InputContainer isInvalid>content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("invalid");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <InputContainer className="custom">content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("should apply densityDefault and not densityCompact by default", () => {
    const { container } = render(
      <InputContainer>content</InputContainer>
    );
    expect(container.firstChild).toHaveClass("densityDefault");
    expect(container.firstChild).not.toHaveClass("densityCompact");
  });
});
