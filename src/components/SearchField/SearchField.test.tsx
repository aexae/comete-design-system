import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("should render with default placeholder", () => {
    render(<SearchField />);
    expect(screen.getByPlaceholderText("Rechercher")).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    render(<SearchField placeholder="Rechercher un agent…" />);
    expect(screen.getByPlaceholderText("Rechercher un agent…")).toBeInTheDocument();
  });

  it("should have default aria-label", () => {
    render(<SearchField />);
    expect(screen.getByRole("searchbox")).toHaveAccessibleName("Rechercher");
  });

  it("should render search icon before input", () => {
    const { container } = render(<SearchField />);
    expect(container.querySelector(".elemBefore svg")).toBeInTheDocument();
  });

  it("should be clearable by default", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchField defaultValue="test" onChange={onChange} />);
    const clearBtn = screen.getByRole("button", { name: "Effacer" });
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("should support custom aria-label", () => {
    render(<SearchField aria-label="Rechercher un site" />);
    expect(screen.getByRole("searchbox")).toHaveAccessibleName("Rechercher un site");
  });

  it("should support appearance prop", () => {
    const { container } = render(<SearchField appearance="subtle" />);
    expect(container.querySelector(".subtle")).toBeInTheDocument();
  });

  it("should support density compact", () => {
    const { container } = render(<SearchField density="compact" />);
    expect(container.querySelector(".densityCompact")).toBeInTheDocument();
  });

  it("should support isDisabled", () => {
    render(<SearchField isDisabled />);
    expect(screen.getByRole("searchbox")).toBeDisabled();
  });
});
