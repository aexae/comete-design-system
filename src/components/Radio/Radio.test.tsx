// Tests unitaires des composants Radio et RadioGroup
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./Radio";

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <RadioGroup aria-label="Test" {...props}>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>,
  );
}

describe("Radio", () => {
  describe("rendu de base", () => {
    it("should render all radio buttons", () => {
      renderGroup();
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("should have displayName set to Radio", () => {
      expect(Radio.displayName).toBe("Radio");
    });

    it("should have displayName set to RadioGroup", () => {
      expect(RadioGroup.displayName).toBe("RadioGroup");
    });

    it("should render labels", () => {
      renderGroup();
      expect(screen.getByText("Option A")).toBeInTheDocument();
      expect(screen.getByText("Option B")).toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("should render description when provided", () => {
      render(
        <RadioGroup aria-label="Test">
          <Radio value="a" label="Option A" description="Help text" />
        </RadioGroup>,
      );
      expect(screen.getByText("Help text")).toBeInTheDocument();
    });
  });

  describe("sélection", () => {
    it("should select a radio on click", async () => {
      renderGroup();
      const radios = screen.getAllByRole("radio");
      await userEvent.click(radios[1]!);
      expect(radios[1]).toBeChecked();
      expect(radios[0]).not.toBeChecked();
    });

    it("should support controlled value", () => {
      renderGroup({ value: "b" });
      const radios = screen.getAllByRole("radio");
      expect(radios[1]).toBeChecked();
    });

    it("should call onChange when selection changes", async () => {
      const handleChange = vi.fn();
      renderGroup({ onChange: handleChange });
      await userEvent.click(screen.getAllByRole("radio")[1]!);
      expect(handleChange).toHaveBeenCalledWith("b");
    });

    it("should support defaultValue", () => {
      renderGroup({ defaultValue: "c" });
      expect(screen.getAllByRole("radio")[2]).toBeChecked();
    });
  });

  describe("disabled", () => {
    it("should disable all radios when group is disabled", () => {
      renderGroup({ isDisabled: true });
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toBeDisabled();
      }
    });

    it("should disable individual radio", () => {
      render(
        <RadioGroup aria-label="Test">
          <Radio value="a" label="A" isDisabled />
          <Radio value="b" label="B" />
        </RadioGroup>,
      );
      expect(screen.getAllByRole("radio")[0]).toBeDisabled();
      expect(screen.getAllByRole("radio")[1]).not.toBeDisabled();
    });
  });

  describe("className", () => {
    it("should apply custom className to RadioGroup", () => {
      const { container } = renderGroup({ className: "custom-group" });
      expect(container.firstElementChild).toHaveClass("group", "custom-group");
    });

    it("should apply custom className to Radio", () => {
      render(
        <RadioGroup aria-label="Test">
          <Radio value="a" label="A" className="custom-radio" />
        </RadioGroup>,
      );
      const radio = screen.getByRole("radio");
      expect(radio.closest(".custom-radio")).toBeInTheDocument();
    });
  });

  describe("keyboard", () => {
    it("should navigate with arrow keys", async () => {
      renderGroup({ defaultValue: "a" });
      const radios = screen.getAllByRole("radio");
      radios[0]!.focus();
      await userEvent.keyboard("{ArrowDown}");
      expect(radios[1]).toBeChecked();
    });
  });
});
