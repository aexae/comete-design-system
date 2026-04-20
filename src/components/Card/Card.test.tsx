// Tests unitaires du composant Card
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  describe("rendu de base", () => {
    it("should render children", () => {
      render(<Card>Contenu</Card>);
      expect(screen.getByText("Contenu")).toBeInTheDocument();
    });

    it("should have displayName set to Card", () => {
      expect(Card.displayName).toBe("Card");
    });

    it("should render as a div", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.firstElementChild?.tagName).toBe("DIV");
    });
  });

  describe("classes CSS par défaut", () => {
    it("should apply card and outlined classes when no props given", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.firstElementChild).toHaveClass("card", "outlined");
    });

    it("should not have role or tabIndex by default", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.firstElementChild).not.toHaveAttribute("role");
      expect(container.firstElementChild).not.toHaveAttribute("tabindex");
    });
  });

  describe("prop appearance", () => {
    it.each([["outlined"], ["default"]] as const)(
      "should apply class %s when appearance=%s",
      (appearance) => {
        const { container } = render(<Card appearance={appearance}>x</Card>);
        expect(container.firstElementChild).toHaveClass(appearance);
      },
    );
  });

  describe("prop color", () => {
    it("should apply neutral color class by default", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.firstElementChild).toHaveClass("color-neutral");
    });

    it.each(["neutral", "brand", "success", "warning", "critical", "information", "accent", "sunken", "raised"] as const)(
      "should apply color-%s class",
      (color) => {
        const { container } = render(<Card color={color}>x</Card>);
        expect(container.firstElementChild).toHaveClass(`color-${color}`);
      },
    );
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(<Card className="custom">x</Card>);
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });

  describe("actionable (onPress defined)", () => {
    it("should set role=button and tabIndex=0 when onPress is provided", () => {
      render(
        <Card onPress={() => {}}>
          x
        </Card>,
      );
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabindex", "0");
    });

    it("should set data-interactive attribute when onPress is provided", () => {
      const { container } = render(
        <Card onPress={() => {}}>
          x
        </Card>,
      );
      expect(container.firstElementChild).toHaveAttribute("data-interactive");
    });

    it("should call onPress on click", () => {
      const handlePress = vi.fn();
      render(
        <Card onPress={handlePress}>
          x
        </Card>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handlePress).toHaveBeenCalledOnce();
    });

    it("should call onPress on Enter key", () => {
      const handlePress = vi.fn();
      render(
        <Card onPress={handlePress}>
          x
        </Card>,
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handlePress).toHaveBeenCalledOnce();
    });

    it("should call onPress on Space key", () => {
      const handlePress = vi.fn();
      render(
        <Card onPress={handlePress}>
          x
        </Card>,
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      expect(handlePress).toHaveBeenCalledOnce();
    });

    it("should not call onPress on other keys", () => {
      const handlePress = vi.fn();
      render(
        <Card onPress={handlePress}>
          x
        </Card>,
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: "Escape" });
      expect(handlePress).not.toHaveBeenCalled();
    });

    it("should not render FocusRing by default", () => {
      const { container } = render(
        <Card onPress={() => {}}>
          x
        </Card>,
      );
      expect(container.querySelector(".ring")).not.toBeInTheDocument();
    });
  });

  describe("default (no drag, no onPress)", () => {
    it("should not set role or tabIndex", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.firstElementChild).not.toHaveAttribute("role");
      expect(container.firstElementChild).not.toHaveAttribute("tabindex");
    });

    it("should not render drag area", () => {
      const { container } = render(<Card>x</Card>);
      expect(container.querySelector(".dragArea")).not.toBeInTheDocument();
    });
  });

  describe('drag="top"', () => {
    it("should render drag area", () => {
      const { container } = render(<Card drag="top">x</Card>);
      expect(container.querySelector(".dragArea")).toBeInTheDocument();
    });

    it("should apply dragTop class", () => {
      const { container } = render(<Card drag="top">x</Card>);
      expect(container.firstElementChild).toHaveClass("dragTop");
    });

    it("should apply dragIconRotated class on icon", () => {
      const { container } = render(<Card drag="top">x</Card>);
      const icon = container.querySelector(".dragArea svg");
      expect(icon).toHaveClass("dragIconRotated");
    });

    it("should wrap children in content container", () => {
      const { container } = render(<Card drag="top">x</Card>);
      expect(container.querySelector(".content")).toBeInTheDocument();
    });

    it("should not set role or tabIndex", () => {
      const { container } = render(<Card drag="top">x</Card>);
      expect(container.firstElementChild).not.toHaveAttribute("role");
      expect(container.firstElementChild).not.toHaveAttribute("tabindex");
    });
  });

  describe('drag="left"', () => {
    it("should render drag area", () => {
      const { container } = render(<Card drag="left">x</Card>);
      expect(container.querySelector(".dragArea")).toBeInTheDocument();
    });

    it("should apply dragLeft class", () => {
      const { container } = render(<Card drag="left">x</Card>);
      expect(container.firstElementChild).toHaveClass("dragLeft");
    });

    it("should not apply dragIconRotated class on icon", () => {
      const { container } = render(<Card drag="left">x</Card>);
      const icon = container.querySelector(".dragArea svg");
      expect(icon).not.toHaveClass("dragIconRotated");
    });

    it("should wrap children in content container", () => {
      const { container } = render(<Card drag="left">x</Card>);
      expect(container.querySelector(".content")).toBeInTheDocument();
    });
  });

  describe("prop onDrag", () => {
    it("should call onDrag when drag starts on drag area", () => {
      const handleDrag = vi.fn();
      const { container } = render(
        <Card drag="top" onDrag={handleDrag}>
          x
        </Card>,
      );
      const dragArea = container.querySelector(".dragArea")!;
      fireEvent.dragStart(dragArea);
      expect(handleDrag).toHaveBeenCalledOnce();
    });

    it("should set data-dragging during drag", () => {
      const { container } = render(
        <Card drag="top" onDrag={() => {}}>
          x
        </Card>,
      );
      const card = container.firstElementChild!;
      const dragArea = container.querySelector(".dragArea")!;

      expect(card).not.toHaveAttribute("data-dragging");
      fireEvent.dragStart(dragArea);
      expect(card).toHaveAttribute("data-dragging");
    });
  });

  describe("prop onDragEnd", () => {
    it("should call onDragEnd when drag ends", () => {
      const handleDragEnd = vi.fn();
      const { container } = render(
        <Card drag="top" onDragEnd={handleDragEnd}>
          x
        </Card>,
      );
      const dragArea = container.querySelector(".dragArea")!;
      fireEvent.dragStart(dragArea);
      fireEvent.dragEnd(dragArea);
      expect(handleDragEnd).toHaveBeenCalledOnce();
    });

    it("should remove data-dragging after drag ends", () => {
      const { container } = render(
        <Card drag="top" onDrag={() => {}}>
          x
        </Card>,
      );
      const card = container.firstElementChild!;
      const dragArea = container.querySelector(".dragArea")!;

      fireEvent.dragStart(dragArea);
      expect(card).toHaveAttribute("data-dragging");
      fireEvent.dragEnd(dragArea);
      expect(card).not.toHaveAttribute("data-dragging");
    });
  });
});
