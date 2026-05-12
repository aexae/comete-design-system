// Tests unitaires Stepper + Step
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper, Step } from "./Stepper";

describe("Stepper", () => {
  // -- Rendu de base --

  it("should render all step labels", () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Compte" />
        <Step label="Adresse" />
        <Step label="Paiement" />
      </Stepper>,
    );
    expect(screen.getByText("Compte")).toBeInTheDocument();
    expect(screen.getByText("Adresse")).toBeInTheDocument();
    expect(screen.getByText("Paiement")).toBeInTheDocument();
  });

  it("should render as an ordered list", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("should default aria-label to 'Progression'", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
      </Stepper>,
    );
    expect(container.querySelector("ol")).toHaveAttribute("aria-label", "Progression");
  });

  it("should use custom aria-label when provided", () => {
    const { container } = render(
      <Stepper activeStep={0} aria-label="Checkout steps">
        <Step label="Step 1" />
      </Stepper>,
    );
    expect(container.querySelector("ol")).toHaveAttribute("aria-label", "Checkout steps");
  });

  // -- Status calculé depuis activeStep --

  it("should compute status from activeStep (upcoming/active/completed)", () => {
    const { container } = render(
      <Stepper activeStep={1}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[1]).toHaveAttribute("data-status", "active");
    expect(items[2]).toHaveAttribute("data-status", "upcoming");
  });

  it("should mark the first step as active when activeStep=0", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "active");
    expect(items[1]).toHaveAttribute("data-status", "upcoming");
  });

  it("should mark all steps as completed when activeStep exceeds count", () => {
    const { container } = render(
      <Stepper activeStep={99}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[1]).toHaveAttribute("data-status", "completed");
  });

  // -- isError override --

  it("should override status to 'error' when isError is true", () => {
    const { container } = render(
      <Stepper activeStep={1}>
        <Step label="Step 1" />
        <Step label="Step 2" isError />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[1]).toHaveAttribute("data-status", "error");
  });

  it("isError should take priority over completed status", () => {
    const { container } = render(
      <Stepper activeStep={2}>
        <Step label="Step 1" />
        <Step label="Step 2" isError />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    // Step 2 is index 1 < activeStep (2), would normally be "completed", but isError wins
    expect(items[1]).toHaveAttribute("data-status", "error");
  });

  // -- aria-current --

  it("should set aria-current='step' on the active step content", () => {
    const { container } = render(
      <Stepper activeStep={1}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    // Linear by default → div, not button
    const activeContent = container.querySelector('[aria-current="step"]');
    expect(activeContent).not.toBeNull();
    expect(activeContent).toHaveTextContent("Step 2");
  });

  // -- Orientation --

  it("should default to horizontal orientation", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
      </Stepper>,
    );
    expect(container.querySelector("ol")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("should propagate vertical orientation to root and items", () => {
    const { container } = render(
      <Stepper activeStep={0} orientation="vertical">
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    expect(container.querySelector("ol")).toHaveAttribute("data-orientation", "vertical");
    const items = container.querySelectorAll("li");
    items.forEach((item) => {
      expect(item).toHaveAttribute("data-orientation", "vertical");
    });
  });

  // -- Connecteur --

  it("should render connectors between steps but not after the last", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    const connectors = container.querySelectorAll(".connector");
    // 3 steps → 2 connectors
    expect(connectors).toHaveLength(2);
  });

  it("should mark last step with data-last", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).not.toHaveAttribute("data-last");
    expect(items[1]).toHaveAttribute("data-last", "true");
  });

  // -- Mode linear (défaut) — non cliquable --

  it("should render steps as div (not button) in linear mode", () => {
    const { container } = render(
      <Stepper activeStep={1}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("should NOT call onStepChange on click in linear mode", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper activeStep={0} onStepChange={onStepChange}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    await user.click(screen.getByText("Step 2"));
    expect(onStepChange).not.toHaveBeenCalled();
  });

  // -- Mode interactif — cliquable --

  it("should render steps as buttons when isInteractive is true", () => {
    render(
      <Stepper activeStep={0} isInteractive onStepChange={() => {}}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("should NOT render steps as buttons when isInteractive is false (default)", () => {
    render(
      <Stepper activeStep={0} onStepChange={() => {}}>
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("isInteractive and isLinear are independent (interactive + linear)", () => {
    const { container } = render(
      <Stepper activeStep={2} isInteractive onStepChange={() => {}}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    // Interactive → boutons
    expect(screen.getAllByRole("button")).toHaveLength(3);
    // Linear (défaut) → auto-complétion préservée
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[1]).toHaveAttribute("data-status", "completed");
    expect(items[2]).toHaveAttribute("data-status", "active");
  });

  it("should call onStepChange with index when a step is clicked (isInteractive)", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper activeStep={0} isInteractive onStepChange={onStepChange}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    await user.click(screen.getByRole("button", { name: "Step 3" }));
    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  // -- Disabled step --

  it("should not be clickable when isDisabled (isInteractive)", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper activeStep={0} isInteractive onStepChange={onStepChange}>
        <Step label="Step 1" />
        <Step label="Step 2" isDisabled />
      </Stepper>,
    );
    const step2Button = screen.getByRole("button", { name: "Step 2" });
    expect(step2Button).toBeDisabled();
    await user.click(step2Button);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  // -- Number / icône d'indicateur --

  it("should render step numbers for upcoming and active steps", () => {
    const { container } = render(
      <Stepper activeStep={1}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    // Step 1 = completed → check icon (no number text)
    // Step 2 = active → number "2"
    // Step 3 = upcoming → number "3"
    expect(container.querySelector(".indicatorNumber")?.textContent).toBeDefined();
    const numbers = Array.from(container.querySelectorAll(".indicatorNumber")).map(
      (n) => n.textContent,
    );
    expect(numbers).toEqual(["2", "3"]); // 1 is completed, no number
  });

  // -- isCompleted override + non-linear behavior --

  it("should NOT auto-complete previous steps in non-linear mode", () => {
    const { container } = render(
      <Stepper activeStep={2} isLinear={false} onStepChange={() => {}}>
        <Step label="Step 1" />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    // En non-linéaire, sans `isCompleted` explicite, les steps avant activeStep
    // restent "upcoming" — l'utilisateur a pu sauter par-dessus.
    expect(items[0]).toHaveAttribute("data-status", "upcoming");
    expect(items[1]).toHaveAttribute("data-status", "upcoming");
    expect(items[2]).toHaveAttribute("data-status", "active");
  });

  it("should mark only explicitly isCompleted steps as completed in non-linear mode", () => {
    const { container } = render(
      <Stepper activeStep={2} isLinear={false} onStepChange={() => {}}>
        <Step label="Step 1" isCompleted />
        <Step label="Step 2" />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[1]).toHaveAttribute("data-status", "upcoming");
    expect(items[2]).toHaveAttribute("data-status", "active");
  });

  it("isCompleted=true should override even in linear mode", () => {
    const { container } = render(
      <Stepper activeStep={0}>
        <Step label="Step 1" />
        <Step label="Step 2" isCompleted />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "active");
    expect(items[1]).toHaveAttribute("data-status", "completed");
  });

  it("isCompleted=false should override linear auto-derivation", () => {
    const { container } = render(
      <Stepper activeStep={2}>
        <Step label="Step 1" />
        <Step label="Step 2" isCompleted={false} />
        <Step label="Step 3" />
      </Stepper>,
    );
    const items = container.querySelectorAll("li");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    // Step 2 (index 1) serait normalement "completed" (index < activeStep) ;
    // l'override le maintient en "upcoming".
    expect(items[1]).toHaveAttribute("data-status", "upcoming");
  });

  // -- Error throws when Step used outside Stepper --

  it("should throw when <Step> is used outside <Stepper>", () => {
    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Step label="Standalone" />)).toThrow(
      /Step.*Stepper/,
    );
    consoleSpy.mockRestore();
  });
});
