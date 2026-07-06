// Tests unitaires pour Accordion + AccordionItem + AccordionTrigger + AccordionContent
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

function renderAccordion(
  props: Partial<React.ComponentProps<typeof Accordion>> = {},
) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>Trigger A</AccordionTrigger>
        <AccordionContent>Content A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Trigger B</AccordionTrigger>
        <AccordionContent>Content B</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe("Accordion", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render triggers as buttons", () => {
    renderAccordion();
    expect(screen.getByRole("button", { name: "Trigger A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trigger B" })).toBeInTheDocument();
  });

  it("should default all items to collapsed", () => {
    renderAccordion();
    expect(screen.getByRole("button", { name: "Trigger A" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("should open the item(s) in defaultValue", () => {
    renderAccordion({ defaultValue: ["a"] });
    expect(screen.getByRole("button", { name: "Trigger A" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Trigger B" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("should honour controlled value", () => {
    renderAccordion({ value: ["b"] });
    expect(screen.getByRole("button", { name: "Trigger B" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  // -------------------------------------------------------------------
  // onValueChange
  // -------------------------------------------------------------------

  it("should call onValueChange with an array of open values when clicked", () => {
    const onValueChange = vi.fn();
    renderAccordion({ onValueChange });
    fireEvent.click(screen.getByRole("button", { name: "Trigger A" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });

  // -------------------------------------------------------------------
  // Single (default) vs multiple
  // -------------------------------------------------------------------

  it("should close the previous item in single mode (default)", () => {
    renderAccordion({ defaultValue: ["a"] });
    const btnA = screen.getByRole("button", { name: "Trigger A" });
    const btnB = screen.getByRole("button", { name: "Trigger B" });
    fireEvent.click(btnB);
    expect(btnA).toHaveAttribute("aria-expanded", "false");
    expect(btnB).toHaveAttribute("aria-expanded", "true");
  });

  it("should keep multiple items open when multiple is set", () => {
    renderAccordion({ multiple: true, defaultValue: ["a"] });
    const btnA = screen.getByRole("button", { name: "Trigger A" });
    const btnB = screen.getByRole("button", { name: "Trigger B" });
    fireEvent.click(btnB);
    expect(btnA).toHaveAttribute("aria-expanded", "true");
    expect(btnB).toHaveAttribute("aria-expanded", "true");
  });

  // -------------------------------------------------------------------
  // Disabled
  // -------------------------------------------------------------------

  it("should disable a single item via AccordionItem disabled", () => {
    const onValueChange = vi.fn();
    render(
      <Accordion onValueChange={onValueChange}>
        <AccordionItem value="a" disabled>
          <AccordionTrigger>Trigger A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const btn = screen.getByRole("button", { name: "Trigger A" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("should disable all items via Accordion disabled", () => {
    renderAccordion({ disabled: true });
    expect(screen.getByRole("button", { name: "Trigger A" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trigger B" })).toBeDisabled();
  });

  // -------------------------------------------------------------------
  // Structure a11y
  // -------------------------------------------------------------------

  it("should wrap the trigger in the requested heading level (default h3)", () => {
    const { container, rerender } = render(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>Trigger A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector("h3")).not.toBeNull();
    rerender(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger headingLevel={2}>Trigger A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector("h2")).not.toBeNull();
  });

  it("should render a chevron icon in the trigger", () => {
    const { container } = renderAccordion();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should expose data-slot hooks on root, item and content", () => {
    const { container } = renderAccordion({ defaultValue: ["a"] });
    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull();
    expect(
      container.querySelector('[data-slot="accordion-item"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="accordion-content"]'),
    ).not.toBeNull();
  });
});
