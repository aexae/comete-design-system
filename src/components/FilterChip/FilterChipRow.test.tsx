// Tests unitaires du composant FilterChipRow
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilterChipRow, type FilterChipRowFacet } from "./FilterChipRow";

// Chips factices : on teste la logique de la rangée, pas le rendu de FilterChip.
const chip = (label: string) => <button type="button">{label}</button>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FilterChipRow", () => {
  it("should always render pinned facets, active or not", () => {
    const facets: FilterChipRowFacet[] = [
      { id: "a", isPinned: true, isActive: false, chip: chip("Sites") },
      { id: "b", isPinned: true, isActive: true, chip: chip("Types") },
    ];
    render(<FilterChipRow facets={facets} />);
    expect(screen.getByText("Sites")).toBeInTheDocument();
    expect(screen.getByText("Types")).toBeInTheDocument();
  });

  it("should hide inactive non-pinned facets and show active ones (temporary chips)", () => {
    const facets: FilterChipRowFacet[] = [
      { id: "a", isPinned: true, chip: chip("Sites") },
      { id: "b", isActive: false, chip: chip("Statut") }, // temporaire inactive → cachée
      { id: "c", isActive: true, chip: chip("Priorité") }, // temporaire active → visible
    ];
    render(<FilterChipRow facets={facets} />);
    expect(screen.getByText("Sites")).toBeInTheDocument();
    expect(screen.queryByText("Statut")).toBeNull();
    expect(screen.getByText("Priorité")).toBeInTheDocument();
  });

  it("should render pinned before temporary chips", () => {
    const facets: FilterChipRowFacet[] = [
      { id: "temp", isActive: true, chip: chip("Temporaire") },
      { id: "pin", isPinned: true, chip: chip("Épinglée") },
    ];
    render(<FilterChipRow facets={facets} />);
    const rendered = screen.getAllByRole("button").map((b) => b.textContent);
    expect(rendered.indexOf("Épinglée")).toBeLessThan(rendered.indexOf("Temporaire"));
  });

  it("should render the « Filtres » button with the total badge when onOpenAll is set", async () => {
    const onOpenAll = vi.fn();
    render(
      <FilterChipRow
        facets={[{ id: "a", isPinned: true, chip: chip("Sites") }]}
        totalActiveCount={5}
        onOpenAll={onOpenAll}
      />,
    );
    const filters = screen.getByRole("button", { name: /Filtres/ });
    expect(filters).toHaveTextContent("5");
    await userEvent.click(filters);
    expect(onOpenAll).toHaveBeenCalledOnce();
  });

  it("should not render the « Filtres » button without onOpenAll", () => {
    render(<FilterChipRow facets={[{ id: "a", isPinned: true, chip: chip("Sites") }]} />);
    expect(screen.queryByRole("button", { name: /Filtres/ })).toBeNull();
  });

  it("should warn in dev when more than 4 facets are pinned", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const facets: FilterChipRowFacet[] = Array.from({ length: 5 }, (_, i) => ({
      id: `f${i}`,
      isPinned: true,
      chip: chip(`F${i}`),
    }));
    render(<FilterChipRow facets={facets} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("épinglées"));
  });
});
