import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearPicker } from "./YearPicker.js";

describe("YearPicker", () => {
  // -- Rendering (editable mode = default) --

  it("should render empty input when no props provided", () => {
    render(<YearPicker />);
    // Sans valeur fournie, l'input est vide et l'aria-label est neutre
    // (alignement DatePicker)
    const input = screen.getByLabelText("Année");
    expect(input).toHaveValue("");
  });

  it("should render with specified year", () => {
    render(<YearPicker year={2023} />);
    expect(screen.getByLabelText("Année : 2023")).toBeInTheDocument();
  });

  it("should render input and calendar icon in editable mode (default)", () => {
    render(<YearPicker year={2025} />);
    expect(screen.getByLabelText("Année : 2025")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur d'années")
    ).toBeInTheDocument();
    // No chevrons in editable mode
    expect(screen.queryByLabelText("Année précédente")).not.toBeInTheDocument();
  });

  it("should apply a custom className", () => {
    const { container } = render(<YearPicker className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should use a custom aria-label on the root", () => {
    const { container } = render(
      <YearPicker aria-label="Exercice comptable" />
    );
    expect(container.firstChild).toHaveAttribute(
      "aria-label",
      "Exercice comptable"
    );
  });

  it("should set data-invalid when isInvalid", () => {
    const { container } = render(<YearPicker isInvalid />);
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  // -- Editable mode (default) --

  it("should open calendar popover when calendar icon is clicked", async () => {
    const user = userEvent.setup();
    render(<YearPicker year={2025} />);
    await user.click(screen.getByLabelText("Ouvrir le sélecteur d'années"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should call onChange when a year is selected in the calendar (editable)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearPicker year={2025} onChange={onChange} />);
    await user.click(screen.getByLabelText("Ouvrir le sélecteur d'années"));
    const cell2023 = screen.getByRole("gridcell", { name: "2023" });
    await user.click(cell2023);
    expect(onChange).toHaveBeenCalledWith(2023);
    // Popover should close after selection
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  // -- Navigation mode (isEditable=false) --

  it("should render chevron buttons in navigation mode", () => {
    render(<YearPicker isEditable={false} />);
    expect(screen.getByLabelText("Année précédente")).toBeInTheDocument();
    expect(screen.getByLabelText("Année suivante")).toBeInTheDocument();
  });

  it("should disable all buttons when isDisabled (navigation)", () => {
    render(<YearPicker year={2025} isEditable={false} isDisabled />);
    expect(screen.getByLabelText("Année précédente")).toBeDisabled();
    expect(screen.getByLabelText("Année : 2025")).toBeDisabled();
    expect(screen.getByLabelText("Année suivante")).toBeDisabled();
  });

  it("should call onChange with year - 1 when chevron left is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearPicker year={2025} isEditable={false} onChange={onChange} />);
    await user.click(screen.getByLabelText("Année précédente"));
    expect(onChange).toHaveBeenCalledWith(2024);
  });

  it("should call onChange with year + 1 when chevron right is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearPicker year={2025} isEditable={false} onChange={onChange} />);
    await user.click(screen.getByLabelText("Année suivante"));
    expect(onChange).toHaveBeenCalledWith(2026);
  });

  it("should open calendar popover when year button is clicked", async () => {
    const user = userEvent.setup();
    render(<YearPicker year={2025} isEditable={false} />);
    await user.click(screen.getByLabelText("Année : 2025"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should call onChange when a year is selected in the calendar (navigation)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearPicker year={2025} isEditable={false} onChange={onChange} />);
    await user.click(screen.getByLabelText("Année : 2025"));
    const cell2023 = screen.getByRole("gridcell", { name: "2023" });
    await user.click(cell2023);
    expect(onChange).toHaveBeenCalledWith(2023);
    // Popover should close after selection
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
