// Tests unitaires du composant Pagination
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, getPageItems } from "./Pagination";

describe("getPageItems", () => {
  it("should list every page when there are 7 or fewer", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("should collapse the end near the start: 1 2 3 4 5 … N", () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
    expect(getPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
  });

  it("should collapse both sides in the middle: 1 … c-1 c c+1 … N", () => {
    expect(getPageItems(10, 20)).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20]);
  });

  it("should collapse the start near the end: 1 … N-4 … N", () => {
    expect(getPageItems(20, 20)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
    expect(getPageItems(17, 20)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
  });

  it("should always return 7 slots once there are more than 7 pages (stable width)", () => {
    for (let c = 1; c <= 30; c += 1) expect(getPageItems(c, 30)).toHaveLength(7);
  });
});

describe("Pagination", () => {
  it("should render a navigation landmark named 'Pagination' by default", () => {
    render(<Pagination page={0} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("should accept a custom aria-label", () => {
    render(
      <Pagination page={0} pageCount={8} aria-label="Pages des agents" onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("navigation", { name: "Pages des agents" })).toBeInTheDocument();
  });

  it("should mark the current page with aria-current", () => {
    render(<Pagination page={1} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 1" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Page 8" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 6" })).toBeNull();
  });

  it("should call onPageChange with the 0-indexed clicked page", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={0} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should not call onPageChange when the current page is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={0} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should go to the previous / next page", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} pageCount={8} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page précédente" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Page suivante" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("should disable previous on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={0} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeEnabled();
    rerender(<Pagination page={7} pageCount={8} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  });

  it("should render nothing when there is a single page or fewer", () => {
    const { container, rerender } = render(
      <Pagination page={0} pageCount={1} onPageChange={() => undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<Pagination page={0} pageCount={0} onPageChange={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should expose the density as data-density", () => {
    render(<Pagination page={0} pageCount={4} density="compact" onPageChange={() => undefined} />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-density", "compact");
  });

  it("should clamp an out-of-range page", () => {
    render(<Pagination page={99} pageCount={4} onPageChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  });
});
