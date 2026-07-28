// Tests unitaires du composant ButtonGroup
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

// NOTE: Vitest transforme les CSS Modules en proxy identité ({ group: "group", ... })
// Les assertions sur les classes utilisent donc le nom de classe tel que défini dans le CSS.

describe("ButtonGroup", () => {
  describe("rendu de base", () => {
    it("should render as a div with role=group", () => {
      render(
        <ButtonGroup>
          <Button>Action</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should have displayName set to ButtonGroup", () => {
      expect(ButtonGroup.displayName).toBe("ButtonGroup");
    });

    it("should apply the group CSS class", () => {
      render(
        <ButtonGroup>
          <Button>Action</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole("group")).toHaveClass("group");
    });
  });

  describe("prop aria-label", () => {
    it("should apply aria-label when provided", () => {
      render(
        <ButtonGroup aria-label="Actions principales">
          <Button>Action</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole("group", { name: "Actions principales" })).toBeInTheDocument();
    });

    it("should not have aria-label by default", () => {
      render(
        <ButtonGroup>
          <Button>Action</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole("group")).not.toHaveAttribute("aria-label");
    });
  });

  describe("children", () => {
    it("should render a single button", () => {
      render(
        <ButtonGroup>
          <Button>Confirmer</Button>
        </ButtonGroup>
      );
      expect(screen.getByRole("button", { name: "Confirmer" })).toBeInTheDocument();
    });

    it("should render multiple buttons", () => {
      render(
        <ButtonGroup>
          <Button>Annuler</Button>
          <Button color="comete">Confirmer</Button>
          <Button color="critical">Supprimer</Button>
        </ButtonGroup>
      );
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("should call the correct button handler when clicked", async () => {
      const handleConfirm = vi.fn();
      render(
        <ButtonGroup>
          <Button>Annuler</Button>
          <Button onPress={handleConfirm}>Confirmer</Button>
        </ButtonGroup>
      );
      await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));
      expect(handleConfirm).toHaveBeenCalledOnce();
    });
  });
});
