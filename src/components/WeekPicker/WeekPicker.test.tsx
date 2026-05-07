import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeekPicker } from "./WeekPicker.js";

describe("WeekPicker", () => {
  // -- Rendering (editable mode = default) --

  it("should render with current week when no props provided", () => {
    render(<WeekPicker />);
    // Input + calendar button should be present
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de semaine"),
    ).toBeInTheDocument();
  });

  it("should render week label in editable input", () => {
    render(<WeekPicker week={28} year={2025} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    // Format: "Sem. 28 • DD/MM/YY - DD/MM/YY"
    expect(input).toHaveDisplayValue(/Sem\. 28/);
  });

  it("should apply a custom className", () => {
    const { container } = render(<WeekPicker className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should use a custom aria-label", () => {
    const { container } = render(
      <WeekPicker aria-label="Semaine de paie" />,
    );
    expect(container.firstChild).toHaveAttribute(
      "aria-label",
      "Semaine de paie",
    );
  });

  it("should set data-invalid when isInvalid", () => {
    const { container } = render(<WeekPicker isInvalid />);
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  it("should disable input and calendar button when isDisabled", () => {
    render(<WeekPicker week={28} year={2025} isDisabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de semaine"),
    ).toBeDisabled();
  });

  // -- Editable mode (default) --

  it("should render input and calendar icon in editable mode", () => {
    render(<WeekPicker week={28} year={2025} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ouvrir le sélecteur de semaine"),
    ).toBeInTheDocument();
    // No chevrons in editable mode
    expect(
      screen.queryByLabelText("Semaine précédente"),
    ).not.toBeInTheDocument();
  });

  it("should open calendar when clicking calendar icon in editable mode", async () => {
    const user = userEvent.setup();
    render(<WeekPicker week={28} year={2025} />);
    await user.click(
      screen.getByLabelText("Ouvrir le sélecteur de semaine"),
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should resolve week from typed week number on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WeekPicker week={28} year={2025} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "12{Enter}");
    expect(onChange).toHaveBeenCalledWith(12, 2025);
  });

  it("should resolve week from typed date on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WeekPicker week={28} year={2025} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "01/01/25");
    await user.tab(); // blur
    expect(onChange).toHaveBeenCalledWith(1, 2025);
  });

  it("should resolve week from 'Sem. X' format on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WeekPicker week={28} year={2025} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Sem. 5{Enter}");
    expect(onChange).toHaveBeenCalledWith(5, 2025);
  });

  it("should ignore invalid input and restore range on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WeekPicker week={28} year={2025} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    const originalValue = (input as HTMLInputElement).value;
    await user.clear(input);
    await user.type(input, "invalid");
    await user.tab(); // blur
    expect(onChange).not.toHaveBeenCalled();
    // Input should be restored to formatted range
    expect(input).toHaveValue(originalValue);
  });

  // -- Navigation mode (isEditable=false) --

  it("should render chevron buttons in navigation mode", () => {
    render(<WeekPicker isEditable={false} />);
    expect(screen.getByLabelText("Semaine précédente")).toBeInTheDocument();
    expect(screen.getByLabelText("Semaine suivante")).toBeInTheDocument();
  });

  it("should display formatted week label in navigation mode", () => {
    render(<WeekPicker week={28} year={2025} isEditable={false} />);
    const weekBtn = screen.getByRole("button", { name: /Semaine : Sem\. 28/ });
    expect(weekBtn).toBeInTheDocument();
  });

  it("should disable all buttons when isDisabled (navigation)", () => {
    render(
      <WeekPicker week={28} year={2025} isEditable={false} isDisabled />,
    );
    expect(screen.getByLabelText("Semaine précédente")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Semaine : / })).toBeDisabled();
    expect(screen.getByLabelText("Semaine suivante")).toBeDisabled();
  });

  it("should call onChange with week - 1 when chevron left is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WeekPicker
        week={28}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Semaine précédente"));
    expect(onChange).toHaveBeenCalledWith(27, 2025);
  });

  it("should call onChange with week + 1 when chevron right is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WeekPicker
        week={28}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Semaine suivante"));
    expect(onChange).toHaveBeenCalledWith(29, 2025);
  });

  it("should wrap to previous year when going before week 1", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WeekPicker
        week={1}
        year={2025}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Semaine précédente"));
    // Week 1 of 2025 starts Mon 2024-12-30, going back 7 days = Mon 2024-12-23 = week 52 of 2024
    expect(onChange).toHaveBeenCalledWith(52, 2024);
  });

  it("should wrap to next year when going after last week", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WeekPicker
        week={52}
        year={2024}
        isEditable={false}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Semaine suivante"));
    // Week 52 of 2024 starts Mon 2024-12-23, going forward 7 days = Mon 2024-12-30 = week 1 of 2025
    expect(onChange).toHaveBeenCalledWith(1, 2025);
  });

  it("should open calendar popover when week button is clicked", async () => {
    const user = userEvent.setup();
    render(<WeekPicker week={28} year={2025} isEditable={false} />);
    await user.click(screen.getByRole("button", { name: /Semaine : / }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // -- Range mode : contraintes logiques --
  // Exemple typique : 08/07/2026 (semaine 28) → 05/07/2026 (semaine 27) = invalide.

  it("should set data-invalid when range is inverted (start > end, same year)", () => {
    const { container } = render(
      <WeekPicker
        isRange
        startWeek={28}
        startYear={2026}
        endWeek={27}
        endYear={2026}
      />,
    );
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  it("should set data-invalid when range is inverted across years", () => {
    const { container } = render(
      <WeekPicker
        isRange
        startWeek={3}
        startYear={2026}
        endWeek={50}
        endYear={2025}
      />,
    );
    expect(container.firstChild).toHaveAttribute("data-invalid", "true");
  });

  it("should not set data-invalid when range is valid (start <= end)", () => {
    const { container } = render(
      <WeekPicker
        isRange
        startWeek={27}
        startYear={2026}
        endWeek={28}
        endYear={2026}
      />,
    );
    expect(container.firstChild).not.toHaveAttribute("data-invalid");
  });

  it("should not set data-invalid when range bounds are equal", () => {
    const { container } = render(
      <WeekPicker
        isRange
        startWeek={28}
        startYear={2026}
        endWeek={28}
        endYear={2026}
      />,
    );
    expect(container.firstChild).not.toHaveAttribute("data-invalid");
  });
});
