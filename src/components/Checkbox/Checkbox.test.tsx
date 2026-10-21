// Tests unitaires du composant Checkbox
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  describe("rendu de base", () => {
    it("should render without label", () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector("label")).toBeInTheDocument();
    });

    it("should have displayName set to Checkbox", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });

    it("should render as a label element", () => {
      const { container } = render(<Checkbox label="Test" />);
      expect(container.querySelector("label")).toBeInTheDocument();
    });

    it("should render the checkbox role", () => {
      render(<Checkbox label="Test" />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  describe("prop label", () => {
    it("should display label text", () => {
      render(<Checkbox label="Accept" />);
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });

    it("should not render label group when no label and no description", () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector(".labelGroup")).not.toBeInTheDocument();
    });
  });

  describe("prop description", () => {
    it("should display description text", () => {
      render(<Checkbox label="Accept" description="Terms and conditions" />);
      expect(screen.getByText("Terms and conditions")).toBeInTheDocument();
    });
  });

  describe("prop isRequired", () => {
    it("should display asterisk when isRequired", () => {
      render(<Checkbox label="Accept" isRequired />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not display asterisk when not required", () => {
      const { container } = render(<Checkbox label="Accept" />);
      expect(container.querySelector(".required")).not.toBeInTheDocument();
    });
  });

  describe("prop isDisabled", () => {
    it("should set data-disabled attribute", () => {
      const { container } = render(<Checkbox label="Test" isDisabled />);
      expect(container.querySelector("[data-disabled]")).toBeInTheDocument();
    });

    it("should not toggle when disabled", async () => {
      const onChange = vi.fn();
      render(<Checkbox label="Test" isDisabled onChange={onChange} />);
      await userEvent.click(screen.getByRole("checkbox"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("prop isInvalid", () => {
    it("should set data-invalid attribute", () => {
      const { container } = render(<Checkbox label="Test" isInvalid />);
      expect(container.querySelector("[data-invalid]")).toBeInTheDocument();
    });
  });

  describe("prop isIndeterminate", () => {
    it("should set data-indeterminate attribute", () => {
      const { container } = render(<Checkbox label="Test" isIndeterminate />);
      expect(
        container.querySelector("[data-indeterminate]"),
      ).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should toggle on click", async () => {
      const onChange = vi.fn();
      render(<Checkbox label="Test" onChange={onChange} />);
      await userEvent.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should toggle on Space key", async () => {
      const onChange = vi.fn();
      render(<Checkbox label="Test" onChange={onChange} />);
      screen.getByRole("checkbox").focus();
      await userEvent.keyboard(" ");
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should set data-selected when defaultChecked", () => {
      const { container } = render(
        <Checkbox label="Test" defaultChecked />,
      );
      expect(container.querySelector("[data-selected]")).toBeInTheDocument();
    });

    it("should set data-selected when isChecked", () => {
      const { container } = render(
        <Checkbox label="Test" isChecked onChange={() => {}} />,
      );
      expect(container.querySelector("[data-selected]")).toBeInTheDocument();
    });
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(<Checkbox className="custom" />);
      expect(container.querySelector(".custom")).toBeInTheDocument();
    });
  });
});

describe("Checkbox — contexte de positionnement", () => {
  it("should be a positioned ancestor so the visually hidden native input stays inside it", () => {
    // `<input>` masqué par React Aria (`position: absolute`) : sans ancêtre positionné proche, il
    // se cale sur un ancêtre lointain et son focus fait défiler ce parent (popup blanche).
    const css = readFileSync("src/components/Checkbox/Checkbox.module.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const root = /\.checkbox\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(root).toMatch(/position:\s*relative/);
  });
});
