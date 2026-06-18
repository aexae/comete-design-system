// Tests unitaires du composant TextField
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  describe("rendu de base", () => {
    it("should render an input", () => {
      render(<TextField aria-label="test" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should have displayName set to TextField", () => {
      expect(TextField.displayName).toBe("TextField");
    });

    it("should apply textField class on root and bordered on InputContainer", () => {
      const { container } = render(<TextField aria-label="test" />);
      expect(container.firstElementChild).toHaveClass("textField");
      expect(container.querySelector(".inputContainer")).toHaveClass("bordered");
    });
  });

  describe("prop appearance", () => {
    it("should apply subtle class on InputContainer", () => {
      const { container } = render(
        <TextField aria-label="test" appearance="subtle" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("subtle");
    });
  });

  describe("prop density", () => {
    it("should apply densityCompact class on InputContainer", () => {
      const { container } = render(
        <TextField aria-label="test" density="compact" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("densityCompact");
    });

    it("should forward density to InputContainer", () => {
      const { container } = render(
        <TextField aria-label="test" density="touch" />,
      );
      expect(container.querySelector(".inputContainer")).toHaveClass("densityTouch");
    });
  });

  describe("prop placeholder", () => {
    it("should display placeholder", () => {
      render(<TextField aria-label="test" placeholder="Saisir..." />);
      expect(screen.getByPlaceholderText("Saisir...")).toBeInTheDocument();
    });
  });

  describe("prop isDisabled", () => {
    it("should set data-disabled", () => {
      const { container } = render(
        <TextField aria-label="test" isDisabled />,
      );
      expect(container.querySelector("[data-disabled]")).toBeInTheDocument();
    });
  });

  describe("prop isInvalid", () => {
    it("should set data-invalid", () => {
      const { container } = render(
        <TextField aria-label="test" isInvalid />,
      );
      expect(container.querySelector("[data-invalid]")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should call onChange on typing", async () => {
      const onChange = vi.fn();
      render(
        <TextField aria-label="test" onChange={onChange} />,
      );
      await userEvent.type(screen.getByRole("textbox"), "hello");
      expect(onChange).toHaveBeenLastCalledWith("hello");
    });

    it("should display typed value", async () => {
      render(<TextField aria-label="test" />);
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");
      expect(input).toHaveValue("test");
    });
  });

  describe("slots elemBefore / elemAfter", () => {
    it("should render elemBefore", () => {
      render(
        <TextField aria-label="test" elemBefore={<span>Before</span>} />,
      );
      expect(screen.getByText("Before")).toBeInTheDocument();
    });

    it("should render elemAfter", () => {
      render(
        <TextField aria-label="test" elemAfter={<span>After</span>} />,
      );
      expect(screen.getByText("After")).toBeInTheDocument();
    });
  });

  describe("prop isClearable", () => {
    it("should not show clear button when empty", () => {
      render(<TextField aria-label="test" isClearable />);
      expect(
        screen.queryByRole("button", { name: "Effacer" }),
      ).not.toBeInTheDocument();
    });

    it("should show clear button when has value", () => {
      render(
        <TextField aria-label="test" isClearable defaultValue="hello" />,
      );
      expect(
        screen.getByRole("button", { name: "Effacer" }),
      ).toBeInTheDocument();
    });

    it("should clear value on clear button click", async () => {
      const onChange = vi.fn();
      render(
        <TextField
          aria-label="test"
          isClearable
          defaultValue="hello"
          onChange={onChange}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Effacer" }));
      expect(onChange).toHaveBeenCalledWith("");
      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("should not show clear button when disabled", () => {
      render(
        <TextField
          aria-label="test"
          isClearable
          defaultValue="hello"
          isDisabled
        />,
      );
      expect(
        screen.queryByRole("button", { name: "Effacer" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("prop isLoading", () => {
    it("should show spinner when loading", () => {
      render(<TextField aria-label="test" isLoading />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should not show spinner by default", () => {
      render(<TextField aria-label="test" />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(
        <TextField aria-label="test" className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });
});
