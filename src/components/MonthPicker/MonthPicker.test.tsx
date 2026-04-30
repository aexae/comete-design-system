import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthPicker } from "./MonthPicker.js";

describe("MonthPicker", () => {
  // -- Rendering (editable mode = default) --

  it("should render empty inputs when no props provided", () => {
    render(<MonthPicker />);
    // Sans valeur fournie, les inputs sont vides et l'aria-label est neutre
    // (alignement DatePicker)
    const monthInput = screen.getByRole("textbox", { name: "Mois" });
    expect(monthInput).toHaveValue("");
    const yearInput = screen.getByRole("textbox", { name: "Année" });
    expect(yearInput).toHaveValue("");
  });

  it("should render with specified month and year", () => {
    render(<MonthPicker month={6} year={2025} />);
    const monthInput = screen.getByRole("textbox", {
      name: /Mois : /,
    });
    expect(monthInput).toHaveValue("06");
    expect(
      screen.getByRole("textbox", { name: "Année : 2025" }),
    ).toBeInTheDocument();
  });

  it("should render the separator in editable mode", () => {
    render(<MonthPicker />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("should render the calendar button", () => {
    render(<MonthPicker />);
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    ).toBeInTheDocument();
  });

  it("should apply a custom className", () => {
    const { container } = render(<MonthPicker className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should use a custom aria-label", () => {
    const { container } = render(
      <MonthPicker aria-label="Période comptable" />,
    );
    expect(container.firstChild).toHaveAttribute(
      "aria-label",
      "Période comptable",
    );
  });

  it("should set data-invalid when isInvalid", () => {
    const { container } = render(<MonthPicker isInvalid />);
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  it("should disable inputs when isDisabled (editable mode)", () => {
    render(<MonthPicker month={6} year={2025} isDisabled />);
    const calBtn = screen.getByLabelText("Ouvrir le sélecteur de mois");
    expect(calBtn).toBeDisabled();
  });

  // -- Editable mode (default) --

  it("should render inputs and calendar icon in editable mode (default)", () => {
    render(<MonthPicker month={6} year={2025} />);
    const monthInput = screen.getByRole("textbox", { name: /Mois : / });
    const yearInput = screen.getByRole("textbox", { name: "Année : 2025" });
    expect(monthInput).toBeInTheDocument();
    expect(yearInput).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    ).toBeInTheDocument();
    expect(monthInput.tagName).toBe("INPUT");
    expect(yearInput.tagName).toBe("INPUT");
  });

  it("should display month as zero-padded in editable mode", () => {
    render(<MonthPicker month={6} year={2025} />);
    const monthInput = screen.getByRole("textbox", {
      name: /Mois : /,
    });
    expect(monthInput).toHaveValue("06");
  });

  it("should open calendar in editable mode", async () => {
    const user = userEvent.setup();
    render(<MonthPicker month={6} year={2025} />);
    await user.click(screen.getByLabelText("Ouvrir le sélecteur de mois"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  // -- Navigation mode (isEditable=false) --

  it("should render chevron buttons in navigation mode", () => {
    render(<MonthPicker isEditable={false} />);
    expect(screen.getByLabelText("Mois précédent")).toBeInTheDocument();
    expect(screen.getByLabelText("Mois suivant")).toBeInTheDocument();
  });

  it("should disable all buttons when isDisabled (navigation)", () => {
    render(<MonthPicker month={6} year={2025} isEditable={false} isDisabled />);
    expect(screen.getByLabelText("Mois précédent")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Mois : / })).toBeDisabled();
    expect(screen.getByLabelText("Mois suivant")).toBeDisabled();
  });

  it("should call onChange with month - 1 when chevron left is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthPicker
        month={6}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Mois précédent"));
    expect(onChange).toHaveBeenCalledWith(5, 2025);
  });

  it("should call onChange with month + 1 when chevron right is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthPicker
        month={6}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Mois suivant"));
    expect(onChange).toHaveBeenCalledWith(7, 2025);
  });

  it("should wrap to December of previous year when going before January", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthPicker
        month={1}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Mois précédent"));
    expect(onChange).toHaveBeenCalledWith(12, 2024);
  });

  it("should wrap to January of next year when going after December", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthPicker
        month={12}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Mois suivant"));
    expect(onChange).toHaveBeenCalledWith(1, 2026);
  });

  it("should open calendar popover when month button is clicked", async () => {
    const user = userEvent.setup();
    render(<MonthPicker month={6} year={2025} isEditable={false} />);
    await user.click(screen.getByRole("button", { name: /Mois : / }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should call onChange when a month is selected in the calendar (navigation)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthPicker
        month={6}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Mois : / }));
    // Click on a month cell in the calendar grid
    const cells = screen.getAllByRole("gridcell");
    // Click the first cell (January)
    await user.click(cells[0]!);
    expect(onChange).toHaveBeenCalled();
    // Popover should close after selection
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
