import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputContextProvider, useInputContext } from "./InputContext";

function Consumer() {
  const ctx = useInputContext();
  if (!ctx) return <span data-testid="result">null</span>;
  return (
    <span data-testid="result">
      disabled={String(ctx.isDisabled)} invalid={String(ctx.isInvalid)}
    </span>
  );
}

describe("InputContext", () => {
  it("should return null when not in a provider", () => {
    render(<Consumer />);
    expect(screen.getByTestId("result")).toHaveTextContent("null");
  });

  it("should provide isDisabled and isInvalid", () => {
    render(
      <InputContextProvider isDisabled isInvalid={false}>
        <Consumer />
      </InputContextProvider>,
    );
    expect(screen.getByTestId("result")).toHaveTextContent(
      "disabled=true invalid=false",
    );
  });

  it("should provide false values", () => {
    render(
      <InputContextProvider isDisabled={false} isInvalid={false}>
        <Consumer />
      </InputContextProvider>,
    );
    expect(screen.getByTestId("result")).toHaveTextContent(
      "disabled=false invalid=false",
    );
  });

  it("should provide isInvalid=true", () => {
    render(
      <InputContextProvider isDisabled={false} isInvalid>
        <Consumer />
      </InputContextProvider>,
    );
    expect(screen.getByTestId("result")).toHaveTextContent(
      "disabled=false invalid=true",
    );
  });
});
