import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthRangePicker } from "./MonthRangePicker.js";

describe("MonthRangePicker", () => {
  // -- Rendering --

  it("should render with current month when no props provided", () => {
    render(<MonthRangePicker />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    ).toBeInTheDocument();
  });

  it("should render start and end month labels", () => {
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
      />,
    );
    const startInput = screen.getByLabelText(/Mois de début/);
    const endInput = screen.getByLabelText(/Mois de fin/);
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it("should apply a custom className", () => {
    const { container } = render(<MonthRangePicker className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should use a custom aria-label", () => {
    const { container } = render(
      <MonthRangePicker aria-label="Période de facturation" />,
    );
    expect(container.firstChild).toHaveAttribute(
      "aria-label",
      "Période de facturation",
    );
  });

  it("should set data-invalid when isInvalid", () => {
    const { container } = render(<MonthRangePicker isInvalid />);
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  it("should disable inputs and calendar button when isDisabled", () => {
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        isDisabled
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    ).toBeDisabled();
  });

  // -- Editable inputs --

  it("should call onChange when start input is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        onChange={onChange}
      />,
    );
    const startInput = screen.getByLabelText(/Mois de début/);
    await user.clear(startInput);
    await user.type(startInput, "03/2025");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(3, 2025, 11, 2025);
  });

  it("should call onChange when end input is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        onChange={onChange}
      />,
    );
    const endInput = screen.getByLabelText(/Mois de fin/);
    await user.clear(endInput);
    await user.type(endInput, "12/2025");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(8, 2025, 12, 2025);
  });

  it("should auto-swap when start > end", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        onChange={onChange}
      />,
    );
    const startInput = screen.getByLabelText(/Mois de début/);
    await user.clear(startInput);
    await user.type(startInput, "12/2026");
    await user.tab();
    // start 12/2026 > end 11/2025 → auto-swap
    expect(onChange).toHaveBeenCalledWith(11, 2025, 12, 2026);
  });

  it("should commit on Enter key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        onChange={onChange}
      />,
    );
    const endInput = screen.getByLabelText(/Mois de fin/);
    await user.clear(endInput);
    await user.type(endInput, "06/2026{Enter}");
    expect(onChange).toHaveBeenCalledWith(8, 2025, 6, 2026);
  });

  it("should ignore invalid input and not call onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        onChange={onChange}
      />,
    );
    const startInput = screen.getByLabelText(/Mois de début/);
    await user.clear(startInput);
    await user.type(startInput, "invalid");
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  // -- Calendar popover --

  it("should open calendar popover when calendar button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
      />,
    );
    await user.click(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    );
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(0);
  });

  it("should render the arrow separator", () => {
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
      />,
    );
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  // -- Navigation mode (isEditable={false}) --

  it("should render buttons instead of inputs when isEditable is false", () => {
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        isEditable={false}
      />,
    );
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.getByLabelText(/Mois de début/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mois de fin/)).toBeInTheDocument();
  });

  it("should open calendar popover when start month button is clicked in navigation mode", async () => {
    const user = userEvent.setup();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        isEditable={false}
      />,
    );
    await user.click(screen.getByLabelText(/Mois de début/));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should open calendar popover when end month button is clicked in navigation mode", async () => {
    const user = userEvent.setup();
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        isEditable={false}
      />,
    );
    await user.click(screen.getByLabelText(/Mois de fin/));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should disable buttons in navigation mode when isDisabled", () => {
    render(
      <MonthRangePicker
        startMonth={8}
        startYear={2025}
        endMonth={11}
        endYear={2025}
        isEditable={false}
        isDisabled
      />,
    );
    expect(screen.getByLabelText(/Mois de début/)).toBeDisabled();
    expect(screen.getByLabelText(/Mois de fin/)).toBeDisabled();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de mois"),
    ).toBeDisabled();
  });
});
