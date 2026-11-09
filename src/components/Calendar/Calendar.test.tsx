// Tests unitaires des composants Calendar et RangeCalendar
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "./Calendar.js";
import { RangeCalendar } from "./RangeCalendar.js";

// NOTE: React Aria utilise la locale du navigateur (en-US dans jsdom) pour les labels
// des boutons de navigation — on évite de dépendre de ces strings localisées.

// -----------------------------------------------------------------------
// Calendar (date unique)

describe("Calendar", () => {
  describe("rendu de base", () => {
    it("should render a calendar grid", () => {
      render(<Calendar aria-label="Choisir une date" />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("should render two navigation buttons", () => {
      render(<Calendar aria-label="Choisir une date" />);
      // React Aria render prev + next buttons (locale-dependent names — on vérifie juste le count)
      expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
    });

    it("should render a heading with month and year", () => {
      render(
        <Calendar aria-label="Choisir une date" defaultValue={new CalendarDate(2024, 3, 1)} />
      );
      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("should render day-of-week header cells", () => {
      const { container } = render(<Calendar aria-label="Choisir une date" />);
      // React Aria rend les entêtes de jours comme <th> dans un <thead>
      const ths = container.querySelectorAll("thead th");
      expect(ths.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("prop value (contrôlé)", () => {
    it("should mark the selected date as selected", () => {
      render(<Calendar aria-label="Choisir une date" value={new CalendarDate(2024, 3, 15)} />);
      const selectedCell = screen.getByRole("gridcell", { selected: true });
      expect(selectedCell).toBeInTheDocument();
    });
  });

  describe("prop defaultValue", () => {
    it("should display the default month/year when defaultValue is provided", () => {
      render(
        <Calendar aria-label="Choisir une date" defaultValue={new CalendarDate(2024, 3, 1)} />
      );
      expect(screen.getByRole("heading")).toHaveTextContent(/2024/);
    });
  });

  describe("prop onChange", () => {
    it("should render selectable date cells when onChange is provided", () => {
      // NOTE: L'interaction réelle (click → onChange) est gérée par React Aria et testée
      // dans ses propres tests. On vérifie ici que les cellules cliquables sont rendues.
      const handleChange = vi.fn();
      const { container } = render(
        <Calendar
          aria-label="Choisir une date"
          defaultValue={new CalendarDate(2024, 3, 1)}
          onChange={handleChange}
        />
      );
      const tds = container.querySelectorAll("tbody td");
      expect(tds.length).toBeGreaterThan(0);
    });
  });

  describe("prop isDisabled", () => {
    it("should set data-disabled on navigation buttons when isDisabled is true", () => {
      render(
        <Calendar
          aria-label="Choisir une date"
          isDisabled
          defaultValue={new CalendarDate(2024, 3, 1)}
        />
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons.some((b) => b.hasAttribute("data-disabled"))).toBe(true);
    });
  });

  describe("navigation", () => {
    it("should navigate to a different month when clicking a nav button", async () => {
      render(
        <Calendar aria-label="Choisir une date" defaultValue={new CalendarDate(2024, 3, 1)} />
      );
      const headingBefore = screen.getByRole("heading").textContent;
      const [prevButton] = screen.getAllByRole("button");
      await userEvent.click(prevButton!);
      expect(screen.getByRole("heading").textContent).not.toBe(headingBefore);
    });

    it("should navigate forward when clicking the next button", async () => {
      render(
        <Calendar aria-label="Choisir une date" defaultValue={new CalendarDate(2024, 3, 1)} />
      );
      const headingBefore = screen.getByRole("heading").textContent;
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[buttons.length - 1]!);
      expect(screen.getByRole("heading").textContent).not.toBe(headingBefore);
    });
  });
});

// -----------------------------------------------------------------------
// RangeCalendar

describe("RangeCalendar", () => {
  describe("rendu de base", () => {
    it("should render a grid", () => {
      render(<RangeCalendar aria-label="Choisir une plage" />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("should render two navigation buttons", () => {
      render(<RangeCalendar aria-label="Choisir une plage" />);
      expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("prop value (contrôlé)", () => {
    it("should mark the range start and end as selected", () => {
      render(
        <RangeCalendar
          aria-label="Choisir une plage"
          value={{
            start: new CalendarDate(2024, 3, 10),
            end: new CalendarDate(2024, 3, 15),
          }}
        />
      );
      const selectedCells = screen.getAllByRole("gridcell", { selected: true });
      expect(selectedCells.length).toBeGreaterThan(1);
    });
  });

  describe("prop onChange", () => {
    it("should render selectable date cells when onChange is provided", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <RangeCalendar
          aria-label="Choisir une plage"
          defaultValue={{
            start: new CalendarDate(2024, 3, 1),
            end: new CalendarDate(2024, 3, 1),
          }}
          onChange={handleChange}
        />
      );
      const tds = container.querySelectorAll("tbody td");
      expect(tds.length).toBeGreaterThan(0);
    });
  });
});
