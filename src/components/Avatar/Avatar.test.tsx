// Tests unitaires du composant Avatar
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar";

// NOTE: Vitest transforme les CSS Modules en proxy identité ({ avatar: "avatar", ... })
// Les assertions sur les classes utilisent donc le nom de classe tel que défini dans le CSS.

describe("Avatar", () => {
  describe("rendu de base", () => {
    it("should render without content by default", () => {
      const { container } = render(<Avatar />);
      expect(container.firstElementChild).toHaveClass("avatar");
    });

    it("should have displayName set to Avatar", () => {
      expect(Avatar.displayName).toBe("Avatar");
    });
  });

  describe("classes CSS par défaut", () => {
    it("should apply default appearance and size classes when no props given", () => {
      const { container } = render(<Avatar />);
      expect(container.firstElementChild).toHaveClass("avatar", "rounded", "medium");
    });
  });

  describe("prop appearance", () => {
    it.each([["square"], ["rounded"]] as const)(
      "should apply class %s when appearance=%s",
      (appearance) => {
        const { container } = render(<Avatar appearance={appearance} />);
        expect(container.firstElementChild).toHaveClass(appearance);
      }
    );
  });

  describe("prop size", () => {
    it.each([
      ["xsmall"],
      ["small"],
      ["medium"],
      ["large"],
      ["xlarge"],
      ["xxlarge"],
    ] as const)("should apply class %s when size=%s", (size) => {
      const { container } = render(<Avatar size={size} />);
      expect(container.firstElementChild).toHaveClass(size);
    });
  });

  describe("contenu — photo", () => {
    it("should render an img when src is provided", () => {
      render(<Avatar src="/photo.jpg" alt="Alice" />);
      const img = screen.getByRole("img", { name: "Alice" });
      expect(img.tagName).toBe("IMG");
      expect(img).toHaveAttribute("src", "/photo.jpg");
    });

    it("should use empty string as alt when src is provided without alt", () => {
      const { container } = render(<Avatar src="/photo.jpg" />);
      // alt="" makes the img decorative (role="presentation"), query by tag
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
    });
  });

  describe("contenu — initiales", () => {
    it("should render initials when provided", () => {
      const { container } = render(<Avatar initials="ab" />);
      const span = container.querySelector(`.initials`);
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent("AB");
    });

    it("should truncate initials to 2 characters", () => {
      const { container } = render(<Avatar initials="abc" />);
      expect(container.querySelector(`.initials`)).toHaveTextContent("AB");
    });

    it("should set aria-label to initials on the container when no src", () => {
      render(<Avatar initials="AB" />);
      expect(screen.getByRole("img", { name: "AB" })).toBeInTheDocument();
    });
  });

  describe("contenu — icône", () => {
    it("should render icon inside iconSlot when provided", () => {
      const { container } = render(
        <Avatar icon="Person" />
      );
      const slot = container.querySelector(`.iconSlot`);
      expect(slot).toBeInTheDocument();
      expect(slot?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("priorité de contenu", () => {
    it("should render photo over initials when both provided", () => {
      render(<Avatar src="/photo.jpg" alt="Alice" initials="AB" />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "/photo.jpg");
    });
  });

  describe("mode display-only (pas de onPress)", () => {
    it("should render as div when onPress is not provided", () => {
      const { container } = render(<Avatar initials="AB" />);
      expect(container.firstElementChild?.tagName).toBe("DIV");
    });

    it("should set data-disabled when isDisabled is true", () => {
      const { container } = render(<Avatar isDisabled />);
      expect(container.firstElementChild).toHaveAttribute("data-disabled");
    });

    it("should set data-selected when isSelected is true", () => {
      const { container } = render(<Avatar isSelected />);
      expect(container.firstElementChild).toHaveAttribute("data-selected");
    });
  });

  describe("mode interactif (avec onPress)", () => {
    it("should render as button when onPress is provided", () => {
      render(<Avatar onPress={() => undefined} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should call onPress when clicked", async () => {
      const handlePress = vi.fn();
      render(<Avatar initials="AB" onPress={handlePress} />);
      await userEvent.click(screen.getByRole("button"));
      expect(handlePress).toHaveBeenCalledOnce();
    });

    it("should not call onPress when isDisabled", async () => {
      const handlePress = vi.fn();
      render(<Avatar initials="AB" isDisabled onPress={handlePress} />);
      await userEvent.click(screen.getByRole("button"));
      expect(handlePress).not.toHaveBeenCalled();
    });

    it("should set data-selected on the button when isSelected is true", () => {
      render(<Avatar onPress={() => undefined} isSelected />);
      expect(screen.getByRole("button")).toHaveAttribute("data-selected");
    });
  });

  describe("prop className", () => {
    it("should append custom className", () => {
      const { container } = render(<Avatar className="custom" />);
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });
});
