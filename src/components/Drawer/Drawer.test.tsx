import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from "./Drawer";
import type { DrawerPlacement, DrawerStacking } from "./Drawer";
import { DrawerProvider } from "./DrawerContext";

/** Read an inline CSS custom property from an element's style attribute. */
function getCssVar(el: Element, name: string): string {
  return (el as HTMLElement).style.getPropertyValue(name).trim();
}

/**
 * Find a dialog by aria-label across the whole document.
 * React Aria may mark back-of-stack modals with aria-hidden/inert, which
 * removes them from the accessibility tree and breaks `getByRole("dialog")`.
 * We query directly by attribute instead.
 */
function getDialogByLabel(label: string): HTMLElement {
  const el = document.body.querySelector<HTMLElement>(
    `[role="dialog"][aria-label="${label}"]`,
  );
  if (!el) throw new Error(`No dialog with aria-label="${label}" found`);
  return el;
}

function renderDrawer(props: Partial<React.ComponentProps<typeof Drawer>> = {}) {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    "aria-label": "Test drawer",
    ...props,
  };
  return render(
    <DrawerProvider>
      <Drawer {...defaultProps}>
        <p>Drawer content</p>
      </Drawer>
    </DrawerProvider>,
  );
}

describe("Drawer", () => {
  it("should render when isOpen is true", () => {
    renderDrawer();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    renderDrawer({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should apply placement class", () => {
    renderDrawer({ placement: "right" });
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("right");
  });

  it("should apply size preset class", () => {
    renderDrawer({ size: "wide" });
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("wide");
  });

  it("should apply custom size as inline width (wrapped in calc for stack depth compat)", () => {
    renderDrawer({ placement: "right", size: "400px" });
    const dialog = screen.getByRole("dialog");
    // Size is wrapped with var(--_depth-inset) so stacked drawers can grow past the topmost
    expect(dialog.style.width).toBe("calc(400px + var(--_depth-inset))");
  });

  it("should apply custom size as inline height for top/bottom placement", () => {
    renderDrawer({ placement: "bottom", size: "60vh" });
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.height).toBe("calc(60vh + var(--_depth-inset))");
  });

  it("should default to left placement", () => {
    renderDrawer();
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("left");
  });

  it("should apply custom className", () => {
    renderDrawer({ className: "my-drawer" });
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("my-drawer");
  });

  it("should call onOpenChange when Escape is pressed", async () => {
    const onOpenChange = vi.fn();
    renderDrawer({ onOpenChange });
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should set aria-label on the dialog", () => {
    renderDrawer({ "aria-label": "Navigation drawer" });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "Navigation drawer");
  });

  it("should render swipe handle when swipeable", () => {
    renderDrawer({ swipeable: true });
    const dialog = screen.getByRole("dialog");
    // The swipe handle is the first child of the dialog
    expect(dialog.firstElementChild?.className).toContain("swipeHandle");
  });

  it("should not render swipe handle when not swipeable", () => {
    renderDrawer({ swipeable: false });
    const dialog = screen.getByRole("dialog");
    expect(dialog.firstElementChild?.className).not.toContain("swipeHandle");
  });
});

describe("DrawerHeader", () => {
  it("should render title as heading", () => {
    render(
      <DrawerProvider>
        <Drawer isOpen onOpenChange={vi.fn()} aria-label="Test">
          <DrawerHeader>Mon titre</DrawerHeader>
        </Drawer>
      </DrawerProvider>,
    );
    expect(screen.getByText("Mon titre")).toBeInTheDocument();
  });

  it("should render close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(
      <DrawerProvider>
        <Drawer isOpen onOpenChange={vi.fn()} aria-label="Test">
          <DrawerHeader onClose={onClose}>Titre</DrawerHeader>
        </Drawer>
      </DrawerProvider>,
    );
    const closeBtn = screen.getByLabelText("Fermer");
    expect(closeBtn).toBeInTheDocument();
  });
});

describe("DrawerBody", () => {
  it("should render children", () => {
    render(
      <DrawerProvider>
        <Drawer isOpen onOpenChange={vi.fn()} aria-label="Test">
          <DrawerBody>Body content</DrawerBody>
        </Drawer>
      </DrawerProvider>,
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });
});

describe("DrawerFooter", () => {
  it("should render children", () => {
    render(
      <DrawerProvider>
        <Drawer isOpen onOpenChange={vi.fn()} aria-label="Test">
          <DrawerFooter>Footer content</DrawerFooter>
        </Drawer>
      </DrawerProvider>,
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});

/**
 * Stacking depth tests — guard against regressions on the card-stack effect.
 *
 * Rules enforced:
 * - Single drawer → no depth-inset, no depth-shade.
 * - Multiple overlay drawers → back drawers get progressively larger inset/shade.
 * - Topmost drawer (front) → always inset 0, shade 0 (it's the visible one).
 * - Push mode disables the depth effect (drawers slide side by side instead).
 * - Drawers share a single blanket (only the first-in-stack renders it).
 *
 * Inset/shade per depth (see Drawer.tsx STACK_INSET / STACK_SHADE):
 * - drawersAboveMe=0 (top): 0px / 0
 * - drawersAboveMe=1:       10px / 0.06
 * - drawersAboveMe=2:       20px / 0.12
 */
describe("Drawer — overlay stacking", () => {
  function renderStack(
    entries: Array<{
      label: string;
      placement?: DrawerPlacement;
      stacking?: DrawerStacking;
      size?: string;
    }>,
  ) {
    return render(
      <DrawerProvider>
        {entries.map((e) => (
          <Drawer
            key={e.label}
            isOpen
            onOpenChange={vi.fn()}
            aria-label={e.label}
            placement={e.placement ?? "left"}
            size={e.size ?? "medium"}
            stacking={e.stacking ?? "overlay"}
          >
            <p>{e.label} content</p>
          </Drawer>
        ))}
      </DrawerProvider>,
    );
  }

  it("single drawer has no depth-inset and no depth-shade", () => {
    renderStack([{ label: "solo" }]);
    const dialog = screen.getByRole("dialog");
    expect(getCssVar(dialog, "--_depth-inset")).toBe("");
    expect(getCssVar(dialog, "--_depth-shade")).toBe("");
  });

  it("two overlay drawers: back has inset 10px + shade 0.06, front has none", () => {
    renderStack([{ label: "back" }, { label: "front" }]);
    const back = getDialogByLabel("back");
    const front = getDialogByLabel("front");

    expect(getCssVar(back, "--_depth-inset")).toBe("10px");
    expect(Number(getCssVar(back, "--_depth-shade"))).toBeCloseTo(0.06, 5);

    expect(getCssVar(front, "--_depth-inset")).toBe("");
    expect(getCssVar(front, "--_depth-shade")).toBe("");
  });

  it("three overlay drawers: insets and shades scale with depth from top", () => {
    renderStack([
      { label: "deepest" },
      { label: "middle" },
      { label: "top" },
    ]);
    const deepest = getDialogByLabel("deepest");
    const middle = getDialogByLabel("middle");
    const top = getDialogByLabel("top");

    // 2 drawers above → 20px / 0.12
    expect(getCssVar(deepest, "--_depth-inset")).toBe("20px");
    expect(Number(getCssVar(deepest, "--_depth-shade"))).toBeCloseTo(0.12, 5);

    // 1 drawer above → 10px / 0.06
    expect(getCssVar(middle, "--_depth-inset")).toBe("10px");
    expect(Number(getCssVar(middle, "--_depth-shade"))).toBeCloseTo(0.06, 5);

    // topmost → 0 / 0 (empty inline vars)
    expect(getCssVar(top, "--_depth-inset")).toBe("");
    expect(getCssVar(top, "--_depth-shade")).toBe("");
  });

  it("applies stacking depth equally for all placements", () => {
    (["left", "right", "top", "bottom"] satisfies DrawerPlacement[]).forEach((placement) => {
      const { unmount } = renderStack([
        { label: `back-${placement}`, placement },
        { label: `front-${placement}`, placement },
      ]);
      const back = getDialogByLabel(`back-${placement}`);
      expect(getCssVar(back, "--_depth-inset")).toBe("10px");
      unmount();
    });
  });

  it("push-stacked drawer disables depth-inset/shade and shifts the pushed drawer via its anchor edge", () => {
    renderStack([
      { label: "pushed", placement: "left" },
      { label: "pusher", placement: "left", stacking: "push", size: "300px" },
    ]);
    const pushed = getDialogByLabel("pushed");

    // Pushed drawer must NOT get the card-stack inset/shade (it slides aside instead)
    expect(getCssVar(pushed, "--_depth-inset")).toBe("");
    expect(getCssVar(pushed, "--_depth-shade")).toBe("");
    // Its anchor edge (left, since placement=left) is shifted by the pusher's size
    expect(pushed.style.left).toBe("300px");
    // No transform hack — push uses position, not translate (% semantics differ)
    expect(pushed.style.transform).toBe("");
  });

  it("push-stacked resolves preset sizes (e.g. 'narrow' → 30%) instead of emitting invalid CSS", () => {
    renderStack([
      { label: "pushed", placement: "left" },
      { label: "pusher", placement: "left", stacking: "push", size: "narrow" },
    ]);
    const pushed = getDialogByLabel("pushed");
    expect(pushed.style.left).toBe("30%");
  });

  it("push-stacked chain: cumulative offset when multiple push drawers are above", () => {
    renderStack([
      { label: "first", placement: "left", size: "medium" },
      { label: "second", placement: "left", stacking: "push", size: "narrow" },
      { label: "third", placement: "left", stacking: "push", size: "narrow" },
    ]);
    const first = getDialogByLabel("first");
    const second = getDialogByLabel("second");
    const third = getDialogByLabel("third");

    // first is pushed by second AND third (30% + 30% = 60%; jsdom normalizes calc)
    expect(first.style.left).toMatch(/^calc\((30% \+ 30%|60%)\)$/);
    // second is pushed by third only (30%)
    expect(second.style.left).toBe("30%");
    // third pushes nothing, no offset
    expect(third.style.left).toBe("");
  });

  it("drawers in a push chain get `inPushChain` class (radius removed via CSS)", () => {
    renderStack([
      { label: "first", placement: "left", size: "medium" },
      { label: "second", placement: "left", stacking: "push", size: "narrow" },
    ]);
    const first = getDialogByLabel("first");
    const second = getDialogByLabel("second");

    // both are in the push chain (first is pushed, second is pushing)
    expect(first.className).toContain("inPushChain");
    expect(second.className).toContain("inPushChain");
  });

  it("pure overlay stack does NOT get `inPushChain` class", () => {
    renderStack([{ label: "back" }, { label: "front" }]);
    expect(getDialogByLabel("back").className).not.toContain("inPushChain");
    expect(getDialogByLabel("front").className).not.toContain("inPushChain");
  });

  it("push-stacked shifts the correct anchor edge for each placement", () => {
    const cases: Array<{ placement: DrawerPlacement; edge: "left" | "right" | "top" | "bottom" }> = [
      { placement: "left", edge: "left" },
      { placement: "right", edge: "right" },
      { placement: "top", edge: "top" },
      { placement: "bottom", edge: "bottom" },
    ];
    cases.forEach(({ placement, edge }) => {
      const { unmount } = renderStack([
        { label: `pushed-${placement}`, placement },
        { label: `pusher-${placement}`, placement, stacking: "push", size: "medium" },
      ]);
      const pushed = getDialogByLabel(`pushed-${placement}`);
      expect(pushed.style[edge]).toBe("50%");
      unmount();
    });
  });

  it("only the first drawer in the stack renders the opaque blanket", () => {
    renderStack([{ label: "first" }, { label: "second" }]);
    // Overlays are portaled into document.body, not the render container
    const opaqueOverlays = document.body.querySelectorAll(
      '[class*="overlay"]:not([class*="overlayTransparent"])',
    );
    const transparentOverlays = document.body.querySelectorAll('[class*="overlayTransparent"]');
    expect(opaqueOverlays.length).toBe(1);
    expect(transparentOverlays.length).toBe(1);
  });

  it("stacked drawers get incrementing z-index so newer ones appear on top", () => {
    renderStack([{ label: "back" }, { label: "front" }]);
    // z-index is set on the Modal (parent of Dialog) and Overlay — check Dialog's ancestor style
    const back = getDialogByLabel("back");
    const front = getDialogByLabel("front");
    const backModal = back.parentElement as HTMLElement;
    const frontModal = front.parentElement as HTMLElement;

    expect(backModal.style.zIndex).toContain("--z-index-modal");
    expect(frontModal.style.zIndex).toContain("--z-index-modal");
    // Front drawer has a larger offset than back (0 vs 2)
    expect(backModal.style.zIndex).toContain("+ 0");
    expect(frontModal.style.zIndex).toContain("+ 2");
  });
});
