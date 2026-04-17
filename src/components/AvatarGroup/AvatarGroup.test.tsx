// Tests unitaires du composant AvatarGroup
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AvatarGroup } from "./AvatarGroup";

const ITEMS = [
  { key: "a", initials: "AB" },
  { key: "b", initials: "CD" },
  { key: "c", initials: "EF" },
];

const OVERFLOW_ITEMS = [
  { key: "d", initials: "GH", name: "Guillaume" },
  { key: "e", initials: "IJ", name: "Isabelle" },
];

describe("AvatarGroup", () => {
  describe("rendu de base", () => {
    it("should render all items", () => {
      const { container } = render(<AvatarGroup items={ITEMS} />);
      expect(container.querySelectorAll(".item")).toHaveLength(3);
    });

    it("should have displayName set to AvatarGroup", () => {
      expect(AvatarGroup.displayName).toBe("AvatarGroup");
    });

    it("should render with role group", () => {
      render(<AvatarGroup items={ITEMS} />);
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<AvatarGroup items={ITEMS} className="custom" />);
      expect(container.firstElementChild).toHaveClass("group", "custom");
    });
  });

  describe("mode display (default)", () => {
    it("should render avatars as display-only", () => {
      render(<AvatarGroup items={ITEMS} />);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    it("should not apply interactive class", () => {
      const { container } = render(<AvatarGroup items={ITEMS} />);
      expect(container.querySelector(".interactive")).not.toBeInTheDocument();
    });
  });

  describe("mode navigate", () => {
    it("should render avatars as buttons", () => {
      render(<AvatarGroup items={ITEMS} mode="navigate" onItemPress={() => {}} />);
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("should apply interactive class", () => {
      const { container } = render(<AvatarGroup items={ITEMS} mode="navigate" />);
      expect(container.querySelector(".interactive")).toBeInTheDocument();
    });

    it("should call onItemPress with item and index when clicked", async () => {
      const handlePress = vi.fn();
      render(<AvatarGroup items={ITEMS} mode="navigate" onItemPress={handlePress} />);
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[1]!);
      expect(handlePress).toHaveBeenCalledWith(ITEMS[1], 1);
    });
  });

  describe("mode select", () => {
    it("should render avatars as buttons", () => {
      render(<AvatarGroup items={ITEMS} mode="select" selectedKeys={[]} onSelectionChange={() => {}} />);
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("should call onSelectionChange when avatar is clicked", async () => {
      const handleChange = vi.fn();
      render(
        <AvatarGroup items={ITEMS} mode="select" selectedKeys={[]} onSelectionChange={handleChange} />,
      );
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]!);
      expect(handleChange).toHaveBeenCalledWith(["a"]);
    });

    it("should deselect when clicking a selected avatar", async () => {
      const handleChange = vi.fn();
      render(
        <AvatarGroup items={ITEMS} mode="select" selectedKeys={["a"]} onSelectionChange={handleChange} />,
      );
      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]!);
      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe("overflow", () => {
    it("should render overflow indicator when overflowItems provided", () => {
      const { container } = render(
        <AvatarGroup items={ITEMS} overflowItems={OVERFLOW_ITEMS} />,
      );
      expect(container.querySelector(".overflow")).toBeInTheDocument();
    });

    it("should not render overflow indicator without overflowItems", () => {
      const { container } = render(<AvatarGroup items={ITEMS} />);
      expect(container.querySelector(".overflow")).not.toBeInTheDocument();
    });

    it("should open menu with overflow items when +N is clicked", async () => {
      render(
        <AvatarGroup items={ITEMS} overflowItems={OVERFLOW_ITEMS} mode="navigate" />,
      );
      const buttons = screen.getAllByRole("button");
      // +N trigger is the last button
      await userEvent.click(buttons[buttons.length - 1]!);
      expect(screen.getByText("Guillaume")).toBeInTheDocument();
      expect(screen.getByText("Isabelle")).toBeInTheDocument();
    });
  });

  describe("stacking", () => {
    it("should apply negative margin to non-first items", () => {
      const { container } = render(<AvatarGroup items={ITEMS} size="medium" />);
      const items = container.querySelectorAll(".item");
      expect(items[0]).toHaveStyle({ marginLeft: "0" });
      expect(items[1]).toHaveStyle({ marginLeft: "-8px" });
    });

    it("should apply descending z-index to items", () => {
      const { container } = render(<AvatarGroup items={ITEMS} />);
      const items = container.querySelectorAll<HTMLElement>(".item");
      const z0 = Number(items[0]?.style.zIndex);
      const z1 = Number(items[1]?.style.zIndex);
      const z2 = Number(items[2]?.style.zIndex);
      expect(z0).toBeGreaterThan(z1);
      expect(z1).toBeGreaterThan(z2);
    });
  });
});
