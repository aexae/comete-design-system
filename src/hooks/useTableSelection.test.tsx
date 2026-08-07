// Tests unitaires pour useTableSelection
import { act, renderHook } from "@testing-library/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useTableSelection } from "./useTableSelection";

const PAGE = ["1", "2", "3"];

describe("useTableSelection — non contrôlé", () => {
  it("should start empty by default", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(false);
  });

  it("should honor defaultSelectedKeys", () => {
    const { result } = renderHook(() =>
      useTableSelection({ keys: PAGE, defaultSelectedKeys: ["2"] }),
    );
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected("2")).toBe(true);
    expect(result.current.isSomeSelected).toBe(true);
  });

  it("should toggle a row on and off", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.toggle("1"));
    expect(result.current.isSelected("1")).toBe(true);
    act(() => result.current.toggle("1"));
    expect(result.current.isSelected("1")).toBe(false);
  });

  it("should select/deselect idempotently", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.select("1"));
    act(() => result.current.select("1"));
    expect(result.current.selectedCount).toBe(1);
    act(() => result.current.deselect("1"));
    act(() => result.current.deselect("1"));
    expect(result.current.selectedCount).toBe(0);
  });

  it("should mark indeterminate when some (not all) page keys selected", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.toggle("1"));
    expect(result.current.isSomeSelected).toBe(true);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("should mark all-selected when every page key is selected", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.selectAll());
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.isSomeSelected).toBe(false);
    expect(result.current.selectedCount).toBe(3);
  });

  it("should toggleAll: select all then clear the current page", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.toggleAll());
    expect(result.current.isAllSelected).toBe(true);
    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it("should NOT be all-selected when the page is empty", () => {
    const { result } = renderHook(() => useTableSelection({ keys: [] }));
    expect(result.current.isAllSelected).toBe(false);
  });

  it("clear() should empty the whole selection", () => {
    const { result } = renderHook(() =>
      useTableSelection({ keys: PAGE, defaultSelectedKeys: PAGE }),
    );
    expect(result.current.selectedCount).toBe(3);
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
  });
});

describe("useTableSelection — périmètre page (pagination)", () => {
  it("toggleAll should only clear current-page keys, preserving off-page selection", () => {
    // Sélection initiale : une clé hors page ("9") + toute la page.
    const { result } = renderHook(() =>
      useTableSelection({ keys: PAGE, defaultSelectedKeys: ["9", "1", "2", "3"] }),
    );
    expect(result.current.isAllSelected).toBe(true);
    act(() => result.current.toggleAll()); // désélectionne la page uniquement
    expect(result.current.selectedKeys.has("9")).toBe(true);
    expect(result.current.selectedKeys.has("1")).toBe(false);
    expect(result.current.selectedCount).toBe(1);
  });

  it("isAllSelected should reflect the current page, not off-page keys", () => {
    const { result } = renderHook(() =>
      useTableSelection({ keys: PAGE, defaultSelectedKeys: ["9"] }),
    );
    // "9" sélectionnée mais hors page → la page n'a rien de sélectionné.
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(false);
  });
});

describe("useTableSelection — contrôlé", () => {
  it("should reflect the selectedKeys prop and not keep internal state", () => {
    const onSelectionChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ selected }: { selected: string[] }) =>
        useTableSelection({ keys: PAGE, selectedKeys: selected, onSelectionChange }),
      { initialProps: { selected: ["1"] } },
    );
    expect(result.current.isSelected("1")).toBe(true);

    // Toggling notifie le parent mais ne modifie PAS l'état localement.
    act(() => result.current.toggle("2"));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1", "2"]));
    // Tant que le parent n'a pas réappliqué, la sélection reste pilotée par la prop.
    expect(result.current.isSelected("2")).toBe(false);

    // Le parent réapplique → la nouvelle valeur est reflétée.
    rerender({ selected: ["1", "2"] });
    expect(result.current.isSelected("2")).toBe(true);
  });
});

describe("useTableSelection — prop-getters", () => {
  it("getSelectAllProps should expose checked/indeterminate + label swap", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    expect(result.current.getSelectAllProps()).toMatchObject({
      isChecked: false,
      isIndeterminate: false,
      "aria-label": "Tout sélectionner",
    });
    act(() => result.current.toggle("1"));
    expect(result.current.getSelectAllProps().isIndeterminate).toBe(true);
    act(() => result.current.selectAll());
    expect(result.current.getSelectAllProps()).toMatchObject({
      isChecked: true,
      isIndeterminate: false,
      "aria-label": "Tout désélectionner",
    });
  });

  it("getSelectAllProps().onChange should toggle the whole page", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    act(() => result.current.getSelectAllProps().onChange());
    expect(result.current.isAllSelected).toBe(true);
  });

  it("getRowCheckboxProps should reflect selection and use a custom label", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    expect(result.current.getRowCheckboxProps("1", "Ligne Marie")).toMatchObject({
      isChecked: false,
      "aria-label": "Ligne Marie",
    });
    act(() => result.current.getRowCheckboxProps("1").onChange());
    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.getRowCheckboxProps("1").isChecked).toBe(true);
  });

  it("getRowCheckboxProps should fall back to a default label", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    expect(result.current.getRowCheckboxProps("1")["aria-label"]).toBe(
      "Sélectionner la ligne",
    );
  });
});

describe("useTableSelection — getRowClickProps (clic sur toute la ligne)", () => {
  // Construit un faux MouseEvent dont `target` supporte `closest()` (jsdom).
  const eventFrom = (el: Element) =>
    ({ target: el }) as unknown as ReactMouseEvent<HTMLElement>;

  it("should toggle when the click is on a non-interactive cell", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    const cell = document.createElement("td");
    act(() => result.current.getRowClickProps("1").onClick(eventFrom(cell)));
    expect(result.current.isSelected("1")).toBe(true);
  });

  it("should IGNORE clicks originating from an interactive control (no double toggle)", () => {
    const { result } = renderHook(() => useTableSelection({ keys: PAGE }));
    // La Checkbox de React Aria rend un <label> — un clic dessus doit être
    // ignoré par le onClick de ligne (la case gère déjà son propre toggle).
    const label = document.createElement("label");
    const input = document.createElement("input");
    label.appendChild(input);
    act(() => result.current.getRowClickProps("1").onClick(eventFrom(input)));
    expect(result.current.isSelected("1")).toBe(false);
  });
});
