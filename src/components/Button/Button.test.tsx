// Tests unitaires du composant Button
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

// NOTE: Vitest transforme les CSS Modules en proxy identité ({ button: "button", ... })
// Les assertions sur les classes utilisent donc le nom de classe tel que défini dans le CSS.

describe("Button", () => {
  describe("rendu de base", () => {
    it("should render children", () => {
      render(<Button>Enregistrer</Button>);
      expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
    });

    it("should have displayName set to Button", () => {
      expect(Button.displayName).toBe("Button");
    });
  });

  describe("classes CSS par défaut", () => {
    it("should apply default appearance, color and spacing classes when no props given", () => {
      render(<Button>Label</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "contained", "default", "spacingDefault");
    });
  });

  describe("prop appearance", () => {
    it.each([["contained"], ["outlined"], ["subtle"], ["link"]] as const)(
      "should apply class %s when appearance=%s",
      (appearance) => {
        render(<Button appearance={appearance}>Label</Button>);
        expect(screen.getByRole("button")).toHaveClass(appearance);
      }
    );

    it("should apply class link-subtle when appearance=link-subtle", () => {
      render(<Button appearance="link-subtle">Label</Button>);
      expect(screen.getByRole("button")).toHaveClass("link-subtle");
    });
  });

  describe("prop color", () => {
    it.each([
      ["default"],
      ["brand"],
      ["success"],
      ["critical"],
      ["warning"],
      ["information"],
    ] as const)("should apply class %s when color=%s", (color) => {
      render(<Button color={color}>Label</Button>);
      expect(screen.getByRole("button")).toHaveClass(color);
    });
  });

  describe("prop spacing", () => {
    it("should apply class spacingDefault when spacing is omitted", () => {
      render(<Button>Label</Button>);
      expect(screen.getByRole("button")).toHaveClass("spacingDefault");
    });

    it.each([
      ["default", "spacingDefault"],
      ["compact", "spacingCompact"],
      ["none", "spacingNone"],
    ] as const)("should apply class %s when spacing=%s", (spacing, cssClass) => {
      render(<Button spacing={spacing}>Label</Button>);
      expect(screen.getByRole("button")).toHaveClass(cssClass);
    });
  });

  describe("prop isSelected", () => {
    it("should set data-selected attribute when isSelected is true", () => {
      render(<Button isSelected>Label</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-selected");
    });

    it("should not set data-selected attribute when isSelected is false or missing", () => {
      render(<Button>Label</Button>);
      expect(screen.getByRole("button")).not.toHaveAttribute("data-selected");
    });
  });

  describe("prop className", () => {
    it("should append the custom className to the button", () => {
      render(<Button className="my-custom-class">Label</Button>);
      expect(screen.getByRole("button")).toHaveClass("my-custom-class");
    });

    it("should not remove base classes when a custom className is provided", () => {
      render(<Button className="extra">Label</Button>);
      expect(screen.getByRole("button")).toHaveClass("button", "extra");
    });
  });

  describe("icônes", () => {
    it("should render iconBefore inside a span before children", () => {
      render(<Button iconBefore="Check">Label</Button>);
      const button = screen.getByRole("button");
      const iconSpan = button.firstElementChild;
      expect(iconSpan?.tagName).toBe("SPAN");
      expect(iconSpan).toHaveClass("icon");
      expect(iconSpan?.querySelector("svg")).toBeInTheDocument();
    });

    it("should render iconAfter inside a span after children", () => {
      render(<Button iconAfter="ChevronRight">Label</Button>);
      const button = screen.getByRole("button");
      const iconSpan = button.lastElementChild;
      expect(iconSpan?.tagName).toBe("SPAN");
      expect(iconSpan).toHaveClass("icon");
      expect(iconSpan?.querySelector("svg")).toBeInTheDocument();
    });

    it("should not render icon spans when no icon props are given", () => {
      render(<Button>Label</Button>);
      expect(screen.getByRole("button").querySelector("span")).toBeNull();
    });
  });

  describe("accessibilité et interactions", () => {
    it("should call onClick handler when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onPress={handleClick}>Label</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it("should not call onClick when isDisabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button isDisabled onPress={handleClick}>
          Label
        </Button>
      );
      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should forward isDisabled as data-disabled attribute", () => {
      render(<Button isDisabled>Label</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-disabled");
    });
  });

  describe("ref forwarding", () => {
    it("should forward ref to the underlying button element", () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>Label</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
