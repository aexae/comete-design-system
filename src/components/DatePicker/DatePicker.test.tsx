// Tests unitaires du composant DatePicker
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate } from "@internationalized/date";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("should have displayName set to DatePicker", () => {
    expect(DatePicker.displayName).toBe("DatePicker");
  });

  // =====================================================================
  // Mode saisie (isEditable=true, défaut)
  // =====================================================================

  describe("editable mode (default)", () => {
    it("should render date segments", () => {
      const { container } = render(
        <DatePicker aria-label="Date" />,
      );
      expect(container.querySelector(".dateInput")).toBeInTheDocument();
    });

    it("should render calendar button", () => {
      render(<DatePicker aria-label="Date" />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should apply datePicker class on root", () => {
      const { container } = render(
        <DatePicker aria-label="Date" />,
      );
      expect(container.firstElementChild).toHaveClass("datePicker");
    });

    it("should apply bordered InputContainer by default", () => {
      const { container } = render(
        <DatePicker aria-label="Date" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("bordered");
    });

    it("should apply subtle class on InputContainer", () => {
      const { container } = render(
        <DatePicker aria-label="Date" appearance="subtle" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("subtle");
    });

    it("should set data-disabled", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isDisabled />,
      );
      expect(container.querySelector("[data-disabled]")).toBeInTheDocument();
    });

    it("should set data-invalid", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isInvalid />,
      );
      expect(container.querySelector("[data-invalid]")).toBeInTheDocument();
    });

    it("should open calendar on button click", async () => {
      render(<DatePicker aria-label="Date" />);
      await userEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should append custom className", () => {
      const { container } = render(
        <DatePicker aria-label="Date" className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });

  // =====================================================================
  // Mode navigation (isEditable=false)
  // =====================================================================

  describe("navigation mode (isEditable=false)", () => {
    it("should render chevron buttons and date button", () => {
      render(<DatePicker aria-label="Date" isEditable={false} />);
      expect(screen.getByLabelText("Jour précédent")).toBeInTheDocument();
      expect(screen.getByLabelText("Jour suivant")).toBeInTheDocument();
    });

    it("should apply datePicker class on root", () => {
      const { container } = render(<DatePicker aria-label="Date" isEditable={false} />);
      expect(container.firstElementChild).toHaveClass("datePicker");
    });

    it("should render borderless InputContainer in navigation mode", () => {
      const { container } = render(<DatePicker aria-label="Date" isEditable={false} />);
      expect(container.querySelector(".inputContainer")).toHaveClass("borderless");
    });

    it("should render borderless InputContainer even with subtle appearance", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isEditable={false} appearance="subtle" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("borderless");
    });

    it("should set data-disabled when isDisabled", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isEditable={false} isDisabled />,
      );
      expect(container.firstElementChild).toHaveAttribute("data-disabled");
    });

    it("should set data-invalid when isInvalid", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isEditable={false} isInvalid />,
      );
      expect(container.firstElementChild).toHaveAttribute("data-invalid", "true");
    });

    it("should append custom className", () => {
      const { container } = render(
        <DatePicker aria-label="Date" isEditable={false} className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass("custom");
    });

    it("should open calendar when date button is clicked", async () => {
      const user = userEvent.setup();
      const date = new CalendarDate(2026, 4, 3);
      render(
        <DatePicker aria-label="Date" isEditable={false} value={date} />,
      );
      const buttons = screen.getAllByRole("button");
      const dateButton = buttons.find(
        (b) => !b.getAttribute("aria-label")?.includes("Jour"),
      );
      expect(dateButton).toBeDefined();
      await user.click(dateButton!);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should call onChange with previous day when left chevron is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new CalendarDate(2026, 4, 3);
      render(
        <DatePicker aria-label="Date" isEditable={false} value={date} onChange={onChange} />,
      );
      await user.click(screen.getByLabelText("Jour précédent"));
      expect(onChange).toHaveBeenCalledTimes(1);
      const newDate = onChange.mock.calls[0]![0] as CalendarDate;
      expect(newDate.year).toBe(2026);
      expect(newDate.month).toBe(4);
      expect(newDate.day).toBe(2);
    });

    it("should call onChange with next day when right chevron is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new CalendarDate(2026, 4, 3);
      render(
        <DatePicker aria-label="Date" isEditable={false} value={date} onChange={onChange} />,
      );
      await user.click(screen.getByLabelText("Jour suivant"));
      expect(onChange).toHaveBeenCalledTimes(1);
      const newDate = onChange.mock.calls[0]![0] as CalendarDate;
      expect(newDate.year).toBe(2026);
      expect(newDate.month).toBe(4);
      expect(newDate.day).toBe(4);
    });

    it("should disable buttons when isDisabled", () => {
      const date = new CalendarDate(2026, 4, 3);
      render(
        <DatePicker aria-label="Date" isEditable={false} value={date} isDisabled />,
      );
      expect(screen.getByLabelText("Jour précédent")).toBeDisabled();
      expect(screen.getByLabelText("Jour suivant")).toBeDisabled();
    });
  });

  // =====================================================================
  // Mode plage (isRange=true) — contraintes logiques
  // =====================================================================

  describe("range mode — logical constraints", () => {
    // Le DatePicker compute lui-même `isInverted` (end < start) car React Aria
    // DateRangePicker ne marque pas systématiquement le champ invalide au
    // rendu initial pour ce cas.

    it("should mark range as invalid when end is before start", () => {
      const start = new CalendarDate(2026, 7, 8);
      const end = new CalendarDate(2026, 7, 5);
      const { container } = render(
        <DatePicker
          aria-label="Date range"
          isRange
          value={{ start, end }}
        />,
      );
      const wrapper = container.querySelector("[data-invalid]");
      expect(wrapper).not.toBeNull();
    });

    it("should not mark range as invalid when end is after start", () => {
      const start = new CalendarDate(2026, 7, 5);
      const end = new CalendarDate(2026, 7, 8);
      const { container } = render(
        <DatePicker
          aria-label="Date range"
          isRange
          value={{ start, end }}
        />,
      );
      const wrapper = container.querySelector("[data-invalid]");
      expect(wrapper).toBeNull();
    });

    it("should not mark range as invalid when start equals end", () => {
      const date = new CalendarDate(2026, 7, 8);
      const { container } = render(
        <DatePicker
          aria-label="Date range"
          isRange
          value={{ start: date, end: date }}
        />,
      );
      const wrapper = container.querySelector("[data-invalid]");
      expect(wrapper).toBeNull();
    });
  });
});
