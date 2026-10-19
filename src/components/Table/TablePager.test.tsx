// Tests unitaires de TablePager (sous-composant de Table)
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TablePager, getPageItems } from "./TablePager";

describe("getPageItems — 4 numéros maximum (défaut)", () => {
  it("should list every page when there are 4 or fewer", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("should collapse the end near the start: 1 2 3 … N", () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, 3, "ellipsis-end", 12]);
    expect(getPageItems(3, 12)).toEqual([1, 2, 3, "ellipsis-end", 12]);
  });

  it("should mask the middle pages in the middle: 1 … c c+1 … N", () => {
    expect(getPageItems(5, 12)).toEqual([1, "ellipsis-start", 5, 6, "ellipsis-end", 12]);
    expect(getPageItems(4, 12)).toEqual([1, "ellipsis-start", 4, 5, "ellipsis-end", 12]);
  });

  it("should collapse the start near the end: 1 … N-2 N-1 N", () => {
    expect(getPageItems(12, 12)).toEqual([1, "ellipsis-start", 10, 11, 12]);
    expect(getPageItems(10, 12)).toEqual([1, "ellipsis-start", 10, 11, 12]);
  });

  it("should never show more than 4 page numbers, whatever the volume", () => {
    for (const total of [5, 6, 8, 12, 30, 200]) {
      for (let c = 1; c <= total; c += 1) {
        const numbers = getPageItems(c, total).filter((i) => typeof i === "number");
        expect(numbers.length).toBeLessThanOrEqual(4);
        expect(numbers).toContain(c); // la page courante reste visible
        expect(numbers).toContain(1);
        expect(numbers).toContain(total);
      }
    }
  });
});

describe("getPageItems — 7 emplacements", () => {
  it("should list every page when there are 7 or fewer", () => {
    expect(getPageItems(1, 1, 7)).toEqual([1]);
    expect(getPageItems(3, 7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("should collapse the end near the start: 1 2 3 4 5 … N", () => {
    expect(getPageItems(1, 20, 7)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
    expect(getPageItems(4, 20, 7)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
  });

  it("should collapse both sides in the middle: 1 … c-1 c c+1 … N", () => {
    expect(getPageItems(10, 20, 7)).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20]);
  });

  it("should collapse the start near the end: 1 … N-4 … N", () => {
    expect(getPageItems(20, 20, 7)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
    expect(getPageItems(17, 20, 7)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
  });

  it("should always return 7 slots once there are more than 7 pages (stable width)", () => {
    for (let c = 1; c <= 30; c += 1) expect(getPageItems(c, 30, 7)).toHaveLength(7);
  });
});

describe("getPageItems — emplacements réduits", () => {
  it("should slide a 3-page window around the current page, with ellipses where pages are hidden", () => {
    expect(getPageItems(1, 8, 3)).toEqual([1, 2, 3, "ellipsis-end"]);
    expect(getPageItems(4, 8, 3)).toEqual(["ellipsis-start", 3, 4, 5, "ellipsis-end"]);
    expect(getPageItems(8, 8, 3)).toEqual(["ellipsis-start", 6, 7, 8]);
  });

  it("should mask the middle pages with ellipses for a large volume: 1 … 4 5 6 … 12", () => {
    expect(getPageItems(5, 12, 7)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 12]);
  });

  it("should list every page when there are 3 or fewer, whatever the slots", () => {
    expect(getPageItems(2, 3, 3)).toEqual([1, 2, 3]);
    expect(getPageItems(1, 2, 3)).toEqual([1, 2]);
  });

  it("should use 5 slots: 1 2 3 … N / 1 … c … N / 1 … N-2 N-1 N", () => {
    expect(getPageItems(1, 20, 5)).toEqual([1, 2, 3, "ellipsis-end", 20]);
    expect(getPageItems(2, 20, 5)).toEqual([1, 2, 3, "ellipsis-end", 20]);
    expect(getPageItems(10, 20, 5)).toEqual([1, "ellipsis-start", 10, "ellipsis-end", 20]);
    expect(getPageItems(19, 20, 5)).toEqual([1, "ellipsis-start", 18, 19, 20]);
    expect(getPageItems(20, 20, 5)).toEqual([1, "ellipsis-start", 18, 19, 20]);
  });

  it.each([5, 7] as const)("should keep a stable slot count (%i) once there are more pages", (slots) => {
    for (let c = 1; c <= 30; c += 1) expect(getPageItems(c, 30, slots)).toHaveLength(slots);
  });

  it("should always show exactly 3 page numbers in the 3-slot window", () => {
    for (let c = 1; c <= 30; c += 1) {
      expect(getPageItems(c, 30, 3).filter((i) => typeof i === "number")).toHaveLength(3);
    }
  });
});

describe("TablePager", () => {
  it("should render a navigation landmark named 'Pagination' by default", () => {
    render(<TablePager page={0} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("should accept a custom aria-label", () => {
    render(
      <TablePager page={0} pageCount={8} aria-label="Pages des agents" onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("navigation", { name: "Pages des agents" })).toBeInTheDocument();
  });

  it("should mark the current page with aria-current", () => {
    render(<TablePager page={1} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 1" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Page 8" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 6" })).toBeNull();
  });

  it("should call onPageChange with the 0-indexed clicked page", () => {
    const onPageChange = vi.fn();
    render(<TablePager page={0} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should not call onPageChange when the current page is clicked", () => {
    const onPageChange = vi.fn();
    render(<TablePager page={0} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should go to the previous / next page", () => {
    const onPageChange = vi.fn();
    render(<TablePager page={3} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page précédente" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Page suivante" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("should disable previous on the first page and next on the last", () => {
    const { rerender } = render(<TablePager page={0} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeEnabled();
    rerender(<TablePager page={7} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  });

  it("should render only 3 page buttons with visiblePages={3}", () => {
    render(<TablePager page={3} pageCount={8} visiblePages={3} onPageChange={() => undefined} />);
    const pages = screen.getAllByRole("button", { name: /^Page \d+$/ }).map((b) => b.textContent);
    expect(pages).toEqual(["3", "4", "5"]);
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });

  it("should render nothing when there is a single page or fewer", () => {
    const { container, rerender } = render(
      <TablePager page={0} pageCount={1} onPageChange={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<TablePager page={0} pageCount={0} onPageChange={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should expose the density as data-density", () => {
    render(<TablePager page={0} pageCount={4} density="compact" onPageChange={() => undefined} />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-density", "compact");
  });

  it("should clamp an out-of-range page", () => {
    render(<TablePager page={99} pageCount={4} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });
});
