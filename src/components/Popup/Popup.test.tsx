// Tests unitaires du composant Popup
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "react-aria-components";
import { Popup } from "./Popup";

describe("Popup", () => {
  describe("rendu de base", () => {
    it("should render the trigger", () => {
      render(
        <Popup trigger={<Button>Open</Button>}>
          <p>Content</p>
        </Popup>
      );
      expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    });

    it("should have displayName set to Popup", () => {
      expect(Popup.displayName).toBe("Popup");
    });

    it("should not show content by default", () => {
      render(
        <Popup trigger={<Button>Open</Button>}>
          <p>Content</p>
        </Popup>
      );
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should open on trigger click", async () => {
      render(
        <Popup trigger={<Button>Open</Button>}>
          <p>Content</p>
        </Popup>
      );
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should close on Escape", async () => {
      render(
        <Popup trigger={<Button>Open</Button>}>
          <p>Content</p>
        </Popup>
      );
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("Content")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("prop isOpen (controlled)", () => {
    it("should show content when isOpen=true", () => {
      render(
        <Popup trigger={<Button>Open</Button>} isOpen onOpenChange={() => {}}>
          <p>Content</p>
        </Popup>
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("prop onOpenChange", () => {
    it("should call onOpenChange on trigger click", async () => {
      const onOpenChange = vi.fn();
      render(
        <Popup trigger={<Button>Open</Button>} onOpenChange={onOpenChange}>
          <p>Content</p>
        </Popup>
      );
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });
});
