// Tests unitaires du composant Avatar
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar";

// NOTE: Vitest transforme les CSS Modules en proxy identité ({ avatar: "avatar", ... })
// Les assertions sur les classes utilisent donc le nom de classe tel que défini dans le CSS.

describe("Avatar", () => {
  describe("rendu de base", () => {
    it("should render Person icon by default when no props given", () => {
      const { container } = render(<Avatar />);
      expect(container.firstElementChild).toHaveClass("avatar");
      expect(container.querySelector(".iconSlot")).toBeInTheDocument();
      expect(container.querySelector(".iconSlot svg")).toBeInTheDocument();
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
      const { container } = render(<Avatar src="/photo.jpg" alt="Alice" />);
      const img = container.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/photo.jpg");
    });

    it("should use empty string as alt when src is provided without alt", () => {
      const { container } = render(<Avatar src="/photo.jpg" />);
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
    });

    it("should show Person icon while image is loading when no initials", () => {
      const { container } = render(<Avatar src="/photo.jpg" />);
      expect(container.querySelector(".iconSlot")).toBeInTheDocument();
      expect(container.querySelector("img")).toHaveClass("photoLoading");
    });

    it("should show initials while image is loading when initials provided", () => {
      const { container } = render(<Avatar src="/photo.jpg" initials="AB" />);
      expect(container.querySelector(".initials")).toHaveTextContent("AB");
      expect(container.querySelector(".iconSlot")).not.toBeInTheDocument();
    });

    it("should hide placeholder and show image after load", () => {
      const { container } = render(<Avatar src="/photo.jpg" initials="AB" />);
      const img = container.querySelector("img")!;
      fireEvent.load(img);
      expect(container.querySelector(".initials")).not.toBeInTheDocument();
      expect(img).not.toHaveClass("photoLoading");
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
    it("should render photo over initials when both provided and image loaded", () => {
      const { container } = render(<Avatar src="/photo.jpg" alt="Alice" initials="AB" />);
      const img = container.querySelector("img")!;
      fireEvent.load(img);
      expect(img).toHaveAttribute("src", "/photo.jpg");
      expect(container.querySelector(".initials")).not.toBeInTheDocument();
    });

    it("should show initials as placeholder while photo loads", () => {
      const { container } = render(<Avatar src="/photo.jpg" alt="Alice" initials="AB" />);
      expect(container.querySelector(".initials")).toHaveTextContent("AB");
    });
  });

  describe("selected ring (photo only)", () => {
    it("should render FocusRing when isSelected with loaded photo in display mode", () => {
      const { container } = render(<Avatar isSelected src="/photo.jpg" />);
      fireEvent.load(container.querySelector("img")!);
      expect(container.querySelector(".ring")).toBeInTheDocument();
    });

    it("should not render FocusRing when isSelected without photo", () => {
      const { container } = render(<Avatar isSelected initials="AB" />);
      expect(container.querySelector(".ring")).not.toBeInTheDocument();
    });

    it("should render FocusRing when isSelected with loaded photo in interactive mode", () => {
      const { container } = render(<Avatar onPress={() => undefined} isSelected src="/photo.jpg" />);
      fireEvent.load(container.querySelector("img")!);
      expect(container.querySelector(".ring")).toBeInTheDocument();
    });

    it("should not render FocusRing when isSelected without photo in interactive mode", () => {
      const { container } = render(<Avatar onPress={() => undefined} isSelected initials="AB" />);
      expect(container.querySelector(".ring")).not.toBeInTheDocument();
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
