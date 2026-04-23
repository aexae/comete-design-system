import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { Spotlight } from "./Spotlight";

// JSDOM ne fournit pas ResizeObserver — mock minimal
beforeAll(() => {
  (globalThis as Record<string, unknown>)["ResizeObserver"] = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// JSDOM ne layout pas — on mock getBoundingClientRect sur la cible
function createMockTarget(): HTMLDivElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({
    x: 100,
    y: 100,
    width: 200,
    height: 40,
    top: 100,
    right: 300,
    bottom: 140,
    left: 100,
    toJSON() {},
  });
  document.body.appendChild(el);
  return el;
}

describe("Spotlight", () => {
  let target: HTMLDivElement;
  let targetRef: React.RefObject<HTMLDivElement | null>;

  beforeEach(() => {
    target = createMockTarget();
    targetRef = createRef<HTMLDivElement>();
    (targetRef as { current: HTMLDivElement }).current = target;
  });

  it("should have displayName set to Spotlight", () => {
    expect(Spotlight.displayName).toBe("Spotlight");
  });

  it("should not render when isOpen is false", () => {
    render(
      <Spotlight targetRef={targetRef} isOpen={false}>
        Content
      </Spotlight>,
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <Spotlight targetRef={targetRef} isOpen>
        Content
      </Spotlight>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should display title when provided", () => {
    render(
      <Spotlight targetRef={targetRef} title="Welcome" isOpen>
        Body text
      </Spotlight>,
    );
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("should render a default OK button when no tour or actions", () => {
    render(
      <Spotlight targetRef={targetRef} isOpen>
        Body
      </Spotlight>,
    );
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("should call onOpenChange(false) when OK is pressed", async () => {
    const onChange = vi.fn();
    render(
      <Spotlight targetRef={targetRef} isOpen onOpenChange={onChange}>
        Body
      </Spotlight>,
    );
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("should call onOpenChange(false) on Escape", async () => {
    const onChange = vi.fn();
    render(
      <Spotlight targetRef={targetRef} isOpen onOpenChange={onChange}>
        Body
      </Spotlight>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("should render custom actions when provided", () => {
    render(
      <Spotlight
        targetRef={targetRef}
        isOpen
        actions={[
          { label: "Got it", onPress: vi.fn() },
          { label: "Learn more", onPress: vi.fn(), appearance: "link" },
        ]}
      >
        Body
      </Spotlight>,
    );
    expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn more" })).toBeInTheDocument();
  });

  it("should render custom footer over actions", () => {
    render(
      <Spotlight
        targetRef={targetRef}
        isOpen
        footer={<div>Custom footer</div>}
        actions={[{ label: "Ignored", onPress: vi.fn() }]}
      >
        Body
      </Spotlight>,
    );
    expect(screen.getByText("Custom footer")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });

  it("should apply additional className", () => {
    render(
      <Spotlight targetRef={targetRef} isOpen className="custom-spotlight">
        Body
      </Spotlight>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("custom-spotlight");
  });

  describe("tour mode", () => {
    it("should render Suivant button on first step", () => {
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={0}
          totalSteps={3}
          onNext={vi.fn()}
          onDone={vi.fn()}
        >
          Step 1
        </Spotlight>,
      );
      expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Précédent" })).not.toBeInTheDocument();
    });

    it("should render Précédent and Suivant on middle step", () => {
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={1}
          totalSteps={3}
          onPrev={vi.fn()}
          onNext={vi.fn()}
          onDone={vi.fn()}
        >
          Step 2
        </Spotlight>,
      );
      expect(screen.getByRole("button", { name: "Précédent" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
    });

    it("should render Terminer on last step", () => {
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={2}
          totalSteps={3}
          onDone={vi.fn()}
        >
          Step 3
        </Spotlight>,
      );
      expect(screen.getByRole("button", { name: "Terminer" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Suivant" })).not.toBeInTheDocument();
    });

    it("should call onNext when Suivant is pressed", async () => {
      const onNext = vi.fn();
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={0}
          totalSteps={3}
          onNext={onNext}
          onDone={vi.fn()}
        >
          Step 1
        </Spotlight>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Suivant" }));
      expect(onNext).toHaveBeenCalledOnce();
    });

    it("should call onDone when Terminer is pressed", async () => {
      const onDone = vi.fn();
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={2}
          totalSteps={3}
          onDone={onDone}
        >
          Step 3
        </Spotlight>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Terminer" }));
      expect(onDone).toHaveBeenCalledOnce();
    });

    it("should render Ignorer when onSkip is provided", () => {
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={0}
          totalSteps={3}
          onNext={vi.fn()}
          onDone={vi.fn()}
          onSkip={vi.fn()}
        >
          Step 1
        </Spotlight>,
      );
      expect(screen.getByRole("button", { name: "Ignorer" })).toBeInTheDocument();
    });

    it("should call onSkip when Ignorer is pressed", async () => {
      const onSkip = vi.fn();
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={0}
          totalSteps={3}
          onNext={vi.fn()}
          onDone={vi.fn()}
          onSkip={onSkip}
        >
          Step 1
        </Spotlight>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Ignorer" }));
      expect(onSkip).toHaveBeenCalledOnce();
    });

    it("should render ProgressIndicator with correct total", () => {
      render(
        <Spotlight
          targetRef={targetRef}
          isOpen
          activeStep={1}
          totalSteps={4}
          onNext={vi.fn()}
          onDone={vi.fn()}
        >
          Step 2
        </Spotlight>,
      );
      const dots = screen.getAllByRole("tab");
      expect(dots).toHaveLength(4);
    });
  });

  describe("SVG blanket", () => {
    it("should render the SVG blanket when open", () => {
      const { container } = render(
        <Spotlight targetRef={targetRef} isOpen>
          Body
        </Spotlight>,
      );
      expect(container.ownerDocument.querySelector("svg")).toBeInTheDocument();
    });

    it("should render pulse rect when pulse is true", () => {
      const { container } = render(
        <Spotlight targetRef={targetRef} isOpen pulse>
          Body
        </Spotlight>,
      );
      const pulseRect = container.ownerDocument.querySelector("[class*='pulse']");
      expect(pulseRect).toBeInTheDocument();
    });

    it("should not render pulse rect when pulse is false", () => {
      const { container } = render(
        <Spotlight targetRef={targetRef} isOpen>
          Body
        </Spotlight>,
      );
      const pulseRect = container.ownerDocument.querySelector("[class*='pulse']");
      expect(pulseRect).not.toBeInTheDocument();
    });
  });
});
