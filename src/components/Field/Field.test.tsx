// Tests unitaires du composant Field
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  describe("rendu de base", () => {
    it("should render children", () => {
      render(<Field>Content</Field>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should have displayName set to Field", () => {
      expect(Field.displayName).toBe("Field");
    });

    it("should apply field class", () => {
      const { container } = render(<Field>x</Field>);
      expect(container.firstElementChild).toHaveClass("field");
    });
  });

  describe("prop label", () => {
    it("should display label text", () => {
      render(<Field label="Nom">x</Field>);
      expect(screen.getByText("Nom")).toBeInTheDocument();
    });

    it("should not render label when undefined", () => {
      const { container } = render(<Field>x</Field>);
      expect(container.querySelector(".label")).not.toBeInTheDocument();
    });
  });

  describe("prop isRequired", () => {
    it("should display asterisk when required", () => {
      render(
        <Field label="Nom" isRequired>
          x
        </Field>
      );
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not display asterisk without label", () => {
      const { container } = render(<Field isRequired>x</Field>);
      expect(container.querySelector(".required")).not.toBeInTheDocument();
    });
  });

  describe("prop message", () => {
    it("should display message text", () => {
      render(<Field message="Helper text">x</Field>);
      expect(screen.getByText("Helper text")).toBeInTheDocument();
    });

    it("should apply neutral class by default", () => {
      const { container } = render(<Field message="msg">x</Field>);
      expect(container.querySelector(".message")).toHaveClass("neutral");
    });

    it("should apply critical class", () => {
      const { container } = render(
        <Field message="Error" messageType="critical">
          x
        </Field>
      );
      expect(container.querySelector(".message")).toHaveClass("critical");
    });

    it("should apply success class", () => {
      const { container } = render(
        <Field message="OK" messageType="success">
          x
        </Field>
      );
      expect(container.querySelector(".message")).toHaveClass("success");
    });

    it("should not render message when undefined", () => {
      const { container } = render(<Field>x</Field>);
      expect(container.querySelector(".message")).not.toBeInTheDocument();
    });
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(<Field className="custom">x</Field>);
      expect(container.firstElementChild).toHaveClass("field", "custom");
    });
  });
});
