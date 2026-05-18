// Tests unitaires du composant TimePicker
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Time } from "@internationalized/date";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  describe("rendu de base", () => {
    it("should render time segments", () => {
      const { container } = render(<TimePicker aria-label="Heure" />);
      expect(container.querySelector(".timeInput")).toBeInTheDocument();
    });

    it("should have displayName set to TimePicker", () => {
      expect(TimePicker.displayName).toBe("TimePicker");
    });

    it("should apply timePicker class on root and bordered on InputContainer", () => {
      const { container } = render(<TimePicker aria-label="Heure" />);
      expect(container.firstElementChild).toHaveClass("timePicker");
      expect(container.querySelector(".inputContainer")).toHaveClass("bordered");
    });

    it("should render a clock icon", () => {
      const { container } = render(<TimePicker aria-label="Heure" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render hour and minute segments", () => {
      const { container } = render(<TimePicker aria-label="Heure" />);
      const segments = container.querySelectorAll(".segment");
      // hour + literal (:) + minute = 3 segments minimum
      expect(segments.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("prop appearance", () => {
    it("should apply subtle class on InputContainer", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" appearance="subtle" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("subtle");
    });
  });

  describe("prop isCompact", () => {
    it("should apply compact class on InputContainer", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" isCompact />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("compact");
    });
  });

  describe("prop isDisabled", () => {
    it("should set data-disabled", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" isDisabled />,
      );
      expect(container.querySelector("[data-disabled]")).toBeInTheDocument();
    });
  });

  describe("prop isInvalid", () => {
    it("should set data-invalid", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" isInvalid />,
      );
      expect(container.querySelector("[data-invalid]")).toBeInTheDocument();
    });
  });

  describe("prop showSeconds", () => {
    it("should not render second segment by default", () => {
      const { container } = render(<TimePicker aria-label="Heure" />);
      expect(container.querySelector(".segment[data-type='second']")).not.toBeInTheDocument();
    });

    it("should render second segment when showSeconds is true", () => {
      const { container } = render(<TimePicker aria-label="Heure" showSeconds />);
      expect(container.querySelector(".segment[data-type='second']")).toBeInTheDocument();
    });
  });

  describe("prop hourCycle", () => {
    it("should render AM/PM segment when hourCycle is 12", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" hourCycle={12} />,
      );
      const segments = container.querySelectorAll(".segment");
      // hour + : + minute + space + dayPeriod = 5 segments
      expect(segments.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("valeur par défaut", () => {
    it("should render non-placeholder segments when value is provided", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" defaultValue={new Time(14, 30)} />,
      );
      // With a value set, segments should not have the placeholder attribute
      const segments = container.querySelectorAll(".segment[data-type='hour'], .segment[data-type='minute']");
      for (const segment of segments) {
        expect(segment).not.toHaveAttribute("data-placeholder");
      }
    });
  });

  describe("interaction", () => {
    it("should call onChange when value changes", async () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Heure"
          defaultValue={new Time(10, 0)}
          onChange={onChange}
        />,
      );
      const hourSegment = screen.getByText("10");
      await userEvent.click(hourSegment);
      await userEvent.keyboard("{ArrowUp}");
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(
        <TimePicker aria-label="Heure" className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });

  // ---------------------------------------------------------------------
  // Mode non-éditable (isEditable=false) — états visuels
  // ---------------------------------------------------------------------

  describe("non-editable mode states", () => {
    it("should render formatted time in .timeDisplay", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          defaultValue={new Time(14, 30)}
        />,
      );
      const timeDisplay = container.querySelector(".timeDisplay");
      expect(timeDisplay).toHaveTextContent("14:30");
    });

    it("should set data-disabled on root when isDisabled", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          isDisabled
          defaultValue={new Time(14, 30)}
        />,
      );
      expect(container.firstElementChild).toHaveAttribute("data-disabled", "true");
    });

    it("should set data-invalid on root when isInvalid", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          isInvalid
          defaultValue={new Time(14, 30)}
        />,
      );
      expect(container.firstElementChild).toHaveAttribute("data-invalid", "true");
    });

    it("should propagate isInvalid to InputContainer (border critical)", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          isInvalid
          defaultValue={new Time(14, 30)}
        />,
      );
      const inputContainer = container.querySelector(".inputContainer");
      expect(inputContainer).toHaveClass("invalid");
    });

    it("should propagate isDisabled to InputContainer", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          isDisabled
          defaultValue={new Time(14, 30)}
        />,
      );
      const inputContainer = container.querySelector(".inputContainer");
      expect(inputContainer).toHaveClass("disabled");
    });

    it("should set both data-disabled and data-invalid when both flags are true", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          isDisabled
          isInvalid
          defaultValue={new Time(14, 30)}
        />,
      );
      expect(container.firstElementChild).toHaveAttribute("data-disabled", "true");
      expect(container.firstElementChild).toHaveAttribute("data-invalid", "true");
    });

    it("should include seconds in timeDisplay when showSeconds is true", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          showSeconds
          defaultValue={new Time(14, 30, 45)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("14:30:45");
    });

    it("should omit seconds in timeDisplay when showSeconds is false (default)", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          defaultValue={new Time(14, 30, 45)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("14:30");
      expect(container.querySelector(".timeDisplay")).not.toHaveTextContent("14:30:45");
    });

    it("should display AM suffix in 12h mode for morning time", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          hourCycle={12}
          defaultValue={new Time(9, 5)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("09:05 AM");
    });

    it("should display PM suffix in 12h mode for afternoon time", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          hourCycle={12}
          defaultValue={new Time(14, 30)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("02:30 PM");
    });

    it("should display 12 PM for noon in 12h mode", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          hourCycle={12}
          defaultValue={new Time(12, 0)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("12:00 PM");
    });

    it("should display 12 AM for midnight in 12h mode", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          hourCycle={12}
          defaultValue={new Time(0, 0)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("12:00 AM");
    });

    it("should use 24h format with no AM/PM suffix when hourCycle is 24", () => {
      const { container } = render(
        <TimePicker
          aria-label="Heure"
          isEditable={false}
          hourCycle={24}
          defaultValue={new Time(14, 30)}
        />,
      );
      expect(container.querySelector(".timeDisplay")).toHaveTextContent("14:30");
      expect(container.querySelector(".timeDisplay")).not.toHaveTextContent("PM");
    });
  });
});
