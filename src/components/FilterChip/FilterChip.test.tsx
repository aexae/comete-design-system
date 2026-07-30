// Tests unitaires du composant FilterChip
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "./FilterChip";

const options = <div>Options de la facette</div>;

describe("FilterChip", () => {
  describe("rendu de base", () => {
    it("should render the facet label on the chip body", () => {
      render(
        <FilterChip label="Types" onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(screen.getByRole("button", { name: "Types" })).toBeInTheDocument();
    });

    it("should expose the body as a dialog trigger", () => {
      render(
        <FilterChip label="Types" onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(screen.getByRole("button", { name: "Types" })).toHaveAttribute(
        "aria-haspopup",
        "dialog",
      );
    });

    it("should have displayName set to FilterChip", () => {
      expect(FilterChip.displayName).toBe("FilterChip");
    });
  });

  describe("état inactif", () => {
    it("should not render a clear button when inactive", () => {
      render(
        <FilterChip label="Types" onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(
        screen.queryByRole("button", { name: /Effacer le filtre/ }),
      ).toBeNull();
    });
  });

  describe("état actif", () => {
    it("should become active from count > 0 (count announced, clear button shown)", () => {
      render(
        <FilterChip label="Sites" count={3} onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(
        screen.getByRole("button", { name: "Sites, 3 filtres actifs" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Effacer le filtre Sites" }),
      ).toBeInTheDocument();
    });

    it("should use singular wording for a single active value", () => {
      render(
        <FilterChip label="Sites" count={1} onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(
        screen.getByRole("button", { name: "Sites, 1 filtre actif" }),
      ).toBeInTheDocument();
    });

    it("should honor the isActive override regardless of count", () => {
      render(
        <FilterChip label="Dates" isActive count={0} onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      expect(
        screen.getByRole("button", { name: "Effacer le filtre Dates" }),
      ).toBeInTheDocument();
    });

    it("should call onClear when the clear (×) button is pressed", async () => {
      const onClear = vi.fn();
      render(
        <FilterChip label="Sites" count={2} onClear={onClear} onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Effacer le filtre Sites" }),
      );
      expect(onClear).toHaveBeenCalledOnce();
    });
  });

  describe("panneau (popover)", () => {
    it("should open the panel and call onApply from « Appliquer »", async () => {
      const onApply = vi.fn();
      render(
        <FilterChip label="Types" onApply={onApply}>
          {options}
        </FilterChip>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Types" }));
      const apply = await screen.findByRole("button", { name: "Appliquer" });
      await userEvent.click(apply);
      expect(onApply).toHaveBeenCalledOnce();
    });

    it("should disable « Réinitialiser » when there is nothing to reset", async () => {
      render(
        <FilterChip label="Types" onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Types" }));
      const reset = await screen.findByRole("button", { name: "Réinitialiser" });
      expect(reset).toBeDisabled();
    });

    it("should enable « Réinitialiser » when active and call onReset", async () => {
      const onReset = vi.fn();
      render(
        <FilterChip label="Sites" count={2} onReset={onReset} onApply={() => {}}>
          {options}
        </FilterChip>,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Sites, 2 filtres actifs" }),
      );
      const reset = await screen.findByRole("button", { name: "Réinitialiser" });
      expect(reset).toBeEnabled();
      await userEvent.click(reset);
      expect(onReset).toHaveBeenCalledOnce();
    });
  });
});
