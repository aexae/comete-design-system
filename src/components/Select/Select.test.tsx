import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";
import type { SelectItems } from "./Select";

const BASIC_ITEMS: SelectItems = [
  { value: "fr", label: "France" },
  { value: "be", label: "Belgique" },
  { value: "ch", label: "Suisse" },
];

const GROUPED_ITEMS: SelectItems = [
  {
    label: "Europe",
    options: [
      { value: "fr", label: "France" },
      { value: "be", label: "Belgique" },
    ],
  },
  {
    label: "Amérique",
    options: [{ value: "us", label: "États-Unis" }],
  },
];

const ITEMS_WITH_DISABLED: SelectItems = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B", isDisabled: true },
  { value: "c", label: "Option C" },
];

describe("Select", () => {
  it("should render with default placeholder", () => {
    render(<Select items={BASIC_ITEMS} aria-label="Pays" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeDefined();
    expect(trigger.textContent).toContain("Sélectionner");
  });

  it("should render with custom placeholder", () => {
    render(<Select items={BASIC_ITEMS} placeholder="Choisir un pays" aria-label="Pays" />);
    const trigger = screen.getByRole("button");
    expect(trigger.textContent).toContain("Choisir un pays");
  });

  it("should display selected value in trigger", () => {
    render(<Select items={BASIC_ITEMS} value="fr" aria-label="Pays" />);
    const trigger = screen.getByRole("button");
    expect(trigger.textContent).toContain("France");
  });

  it("should open dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Select items={BASIC_ITEMS} aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("should show all options when opened", async () => {
    const user = userEvent.setup();
    render(<Select items={BASIC_ITEMS} aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("France")).toBeDefined();
    expect(within(listbox).getByText("Belgique")).toBeDefined();
    expect(within(listbox).getByText("Suisse")).toBeDefined();
  });

  it("should call onChange when option is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select items={BASIC_ITEMS} onChange={onChange} aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByText("Belgique"));
    expect(onChange).toHaveBeenCalledWith("be");
  });

  it("should render grouped items", async () => {
    const user = userEvent.setup();
    render(<Select items={GROUPED_ITEMS} aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Europe")).toBeDefined();
    expect(within(listbox).getByText("Amérique")).toBeDefined();
    expect(within(listbox).getByText("France")).toBeDefined();
    expect(within(listbox).getByText("États-Unis")).toBeDefined();
  });

  it("should render with appearance default (bordered)", () => {
    const { container } = render(<Select items={BASIC_ITEMS} aria-label="Pays" />);
    expect(container.querySelector(".bordered")).not.toBeNull();
  });

  it("should render with appearance subtle", () => {
    const { container } = render(<Select items={BASIC_ITEMS} appearance="subtle" aria-label="Pays" />);
    expect(container.querySelector(".subtle")).not.toBeNull();
  });

  it("should disable the select", () => {
    render(<Select items={BASIC_ITEMS} isDisabled aria-label="Pays" />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-disabled")).not.toBeNull();
  });

  it("should mark as invalid", () => {
    const { container } = render(<Select items={BASIC_ITEMS} isInvalid aria-label="Pays" />);
    expect(container.querySelector("[data-invalid]")).not.toBeNull();
  });

  it("should show empty state when no items", async () => {
    const user = userEvent.setup();
    render(<Select items={[]} aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Aucune correspondance")).toBeDefined();
  });

  it("should show custom empty message", async () => {
    const user = userEvent.setup();
    render(<Select items={[]} emptyMessage="Pas de résultat" aria-label="Pays" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Pas de résultat")).toBeDefined();
  });

  it("should render compact variant", () => {
    const { container } = render(<Select items={BASIC_ITEMS} isCompact aria-label="Pays" />);
    expect(container.querySelector(".compact")).not.toBeNull();
  });

  it("should support disabled options", async () => {
    const user = userEvent.setup();
    render(<Select items={ITEMS_WITH_DISABLED} aria-label="Options" />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    const disabledOption = within(listbox).getByText("Option B").closest("[role=option]");
    expect(disabledOption?.getAttribute("aria-disabled")).toBe("true");
  });

  // -----------------------------------------------------------------------
  // Field integration

  it("should render label via Field", () => {
    render(<Select items={BASIC_ITEMS} label="Pays" />);
    expect(screen.getByText("Pays")).toBeDefined();
  });

  it("should render required asterisk via Field", () => {
    render(<Select items={BASIC_ITEMS} label="Pays" isRequired />);
    expect(screen.getByText("*")).toBeDefined();
  });

  it("should render message via Field", () => {
    render(<Select items={BASIC_ITEMS} label="Pays" message="Sélection requise" messageType="critical" />);
    expect(screen.getByText("Sélection requise")).toBeDefined();
  });
});
