import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DensityProvider, useDensity, type Density } from "./DensityContext";

function Consumer({ density }: { density?: Density }) {
  return <span data-testid="result">{useDensity(density)}</span>;
}

describe("useDensity", () => {
  it("retombe sur 'default' hors de tout provider et sans prop", () => {
    render(<Consumer />);
    expect(screen.getByTestId("result")).toHaveTextContent("default");
  });

  it("hérite de la densité du DensityProvider", () => {
    render(
      <DensityProvider density="touch">
        <Consumer />
      </DensityProvider>,
    );
    expect(screen.getByTestId("result")).toHaveTextContent("touch");
  });

  it("la prop explicite prime sur le contexte", () => {
    render(
      <DensityProvider density="touch">
        <Consumer density="compact" />
      </DensityProvider>,
    );
    expect(screen.getByTestId("result")).toHaveTextContent("compact");
  });
});
