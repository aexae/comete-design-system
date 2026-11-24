import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { SideNav } from "../components/SideNav/index.js";

// jsdom ne met rien en page : chaque item reçoit une boîte factice, empilée
// verticalement selon son rang (40 px de haut, 200 px de large).
function mockLayout(): void {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const item = this.closest("button, a");
    const index = item?.parentElement ? [...item.parentElement.children].indexOf(item) : 0;
    const isTarget = this.hasAttribute("aria-current");
    const top = isTarget ? index * 40 : 0;
    return {
      x: 0,
      y: top,
      top,
      left: 0,
      width: 200,
      height: isTarget ? 40 : 400,
      right: 200,
      bottom: top + 40,
      toJSON: () => ({}),
    };
  });
}

function SideNavFixture({ selected }: { selected: number }) {
  return (
    <SideNav>
      <SideNav.Section>
        {["Accueil", "Planning", "Équipe"].map((label, i) => (
          <SideNav.Item key={label} label={label} iconBefore="Home" isSelected={i === selected} />
        ))}
      </SideNav.Section>
    </SideNav>
  );
}

describe("useSlidingIndicator", () => {
  beforeEach(mockLayout);
  afterEach(() => vi.restoreAllMocks());

  it("should place the SideNav indicator on the selected item without animating", () => {
    const { container } = render(<SideNavFixture selected={1} />);
    const indicator = container.querySelector("[aria-hidden].indicator") as HTMLElement;
    expect(indicator).toHaveAttribute("data-visible");
    expect(indicator).not.toHaveAttribute("data-animated");
    expect(indicator.style.transform).toBe("translate(0px, 40px)");
    expect(indicator.style.height).toBe("40px");
  });

  it("should slide the SideNav indicator when the selection changes", () => {
    const { container, rerender } = render(<SideNavFixture selected={0} />);
    act(() => {
      rerender(<SideNavFixture selected={2} />);
    });
    const indicator = container.querySelector(".indicator") as HTMLElement;
    expect(indicator).toHaveAttribute("data-animated");
    expect(indicator.style.transform).toBe("translate(0px, 80px)");
  });

  it("should let the selected item paint its own background when nothing is measurable", () => {
    vi.restoreAllMocks();
    const { container } = render(<SideNavFixture selected={0} />);
    expect(container.querySelector(".indicator")).not.toHaveAttribute("data-visible");
    expect(container.querySelector("[data-side-nav-indicator]")).toBeNull();
  });

  it("should animate only with motion tokens and honour reduced motion", () => {
    const css = readFileSync("src/components/SideNav/SideNav.module.css", "utf8");
    expect(css).toContain("transform var(--duration-normal) var(--easing-emphasized)");
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*\.indicator/);
  });
});
