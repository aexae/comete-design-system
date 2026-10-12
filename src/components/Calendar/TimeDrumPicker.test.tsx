// Tests unitaires du composant TimeDrumPicker
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Time } from "@internationalized/date";
import { TimeDrumPicker } from "./TimeDrumPicker.js";

const option = (column: string, text: string): HTMLElement =>
  within(screen.getByRole("listbox", { name: column })).getByRole("option", { name: text });

describe("TimeDrumPicker", () => {
  describe("onComplete (heure complète → ferme le popover)", () => {
    it("should call onChange but NOT onComplete when an hour is clicked", async () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30)} onChange={onChange} onComplete={onComplete} />);
      await userEvent.click(option("Heures", "09"));
      expect(onChange).toHaveBeenCalledWith(new Time(9, 30, 0));
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("should call onComplete when a minute is clicked (24h, no seconds)", async () => {
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30)} onChange={onChange} onComplete={onComplete} />);
      await userEvent.click(option("Minutes", "45"));
      expect(onChange).toHaveBeenCalledWith(new Time(14, 45, 0));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("should only complete on the seconds column when seconds are shown", async () => {
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30, 10)} showSeconds onComplete={onComplete} />);
      await userEvent.click(option("Minutes", "45"));
      expect(onComplete).not.toHaveBeenCalled();
      await userEvent.click(option("Secondes", "20"));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("should only complete on the period column in 12h mode", async () => {
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30)} hourCycle={12} onComplete={onComplete} />);
      await userEvent.click(option("Minutes", "45"));
      expect(onComplete).not.toHaveBeenCalled();
      await userEvent.click(within(screen.getByRole("listbox", { name: "Période" })).getByRole("option", { name: "AM" }));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("should not call onComplete when disabled", async () => {
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30)} isDisabled onComplete={onComplete} />);
      await userEvent.click(option("Minutes", "45"));
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("should not call onComplete on mount (no scroll-driven completion)", () => {
      const onComplete = vi.fn();
      render(<TimeDrumPicker value={new Time(14, 30)} onComplete={onComplete} />);
      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
