// Tests unitaires pour le composant Switch
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render a switch input with the accessible role", () => {
    render(<Switch aria-label="Notifications" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("should render the label as children", () => {
    render(<Switch>Auto-save</Switch>);
    expect(screen.getByText("Auto-save")).toBeInTheDocument();
  });

  it("should render a switch that starts unchecked by default", () => {
    render(<Switch aria-label="x" />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("should honour defaultChecked", () => {
    render(<Switch aria-label="x" defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("should honour controlled isChecked", () => {
    render(<Switch aria-label="x" isChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  // -------------------------------------------------------------------
  // onChange
  // -------------------------------------------------------------------

  it("should call onChange when clicked", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="x" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should mark the input as disabled when isDisabled is true", () => {
    render(<Switch aria-label="x" isDisabled />);
    // React Aria sets `disabled` on the underlying <input type="checkbox"> —
    // the browser then blocks native click activation. In jsdom fireEvent.click
    // bypasses that check, so we assert on the attribute directly.
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  // -------------------------------------------------------------------
  // Appearance — icône visible selon apparence + état
  // -------------------------------------------------------------------

  it("should NOT render an icon for the default appearance", () => {
    const { container } = render(
      <Switch aria-label="x" appearance="default" isChecked />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("should render the check icon ONLY when success is checked", () => {
    const { container, rerender } = render(
      <Switch aria-label="x" appearance="success" />,
    );
    expect(container.querySelector("svg")).toBeNull();
    rerender(<Switch aria-label="x" appearance="success" isChecked />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should ALWAYS render the icon for warning (checked or not)", () => {
    const { container, rerender } = render(
      <Switch aria-label="x" appearance="warning" />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<Switch aria-label="x" appearance="warning" isChecked />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should ALWAYS render the icon for critical (checked or not)", () => {
    const { container, rerender } = render(
      <Switch aria-label="x" appearance="critical" />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<Switch aria-label="x" appearance="critical" isChecked />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  // -------------------------------------------------------------------
  // Indeterminate
  // -------------------------------------------------------------------

  it("should apply data-indeterminate on the track when isIndeterminate is true", () => {
    const { container } = render(
      <Switch aria-label="x" isIndeterminate />,
    );
    const track = container.querySelector('[data-appearance]');
    expect(track).toHaveAttribute("data-indeterminate", "true");
  });

  // -------------------------------------------------------------------
  // Disabled — data-disabled propagé sur root et track
  // -------------------------------------------------------------------

  it("should apply data-disabled on the label and track when isDisabled", () => {
    const { container } = render(
      <Switch aria-label="x" isDisabled>Label</Switch>,
    );
    const label = container.querySelector("label");
    const track = container.querySelector('[data-appearance]');
    expect(label).toHaveAttribute("data-disabled");
    expect(track).toHaveAttribute("data-disabled", "true");
  });
});
