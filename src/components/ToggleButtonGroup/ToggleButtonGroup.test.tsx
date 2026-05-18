import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButtonGroup, ToggleButton } from "./ToggleButtonGroup";

describe("ToggleButtonGroup", () => {
  // -------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------

  it("should render a group with toggle buttons", () => {
    render(
      <ToggleButtonGroup aria-label="Options">
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
        <ToggleButton id="c">C</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should apply group CSS class", () => {
    const { container } = render(
      <ToggleButtonGroup aria-label="Options">
        <ToggleButton id="a">A</ToggleButton>
      </ToggleButtonGroup>,
    );

    const group = container.firstElementChild;
    expect(group?.className).toContain("group");
  });

  it("should apply item CSS class to each button", () => {
    render(
      <ToggleButtonGroup aria-label="Options">
        <ToggleButton id="a">A</ToggleButton>
      </ToggleButtonGroup>,
    );

    // In single mode, React Aria renders radio buttons
    const button = screen.getByRole("radio");
    expect(button.className).toContain("item");
  });

  it("should merge custom className on group", () => {
    const { container } = render(
      <ToggleButtonGroup aria-label="Options" className="custom">
        <ToggleButton id="a">A</ToggleButton>
      </ToggleButtonGroup>,
    );

    const group = container.firstElementChild;
    expect(group?.className).toContain("group");
    expect(group?.className).toContain("custom");
  });

  it("should merge custom className on item", () => {
    render(
      <ToggleButtonGroup aria-label="Options">
        <ToggleButton id="a" className="custom">
          A
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    const button = screen.getByRole("radio");
    expect(button.className).toContain("item");
    expect(button.className).toContain("custom");
  });

  // -------------------------------------------------------------------
  // Selection — single mode (renders as radiogroup/radio)
  // -------------------------------------------------------------------

  it("should default to single selection mode", () => {
    render(
      <ToggleButtonGroup
        aria-label="Options"
        defaultSelectedKeys={["a"]}
      >
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    const radioA = screen.getByRole("radio", { name: "A" });
    const radioB = screen.getByRole("radio", { name: "B" });
    expect(radioA).toHaveAttribute("data-selected", "true");
    expect(radioB).not.toHaveAttribute("data-selected");
  });

  it("should render as radiogroup in single mode", () => {
    render(
      <ToggleButtonGroup aria-label="Options" selectionMode="single">
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("should toggle selection on click in single mode", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <ToggleButtonGroup
        aria-label="Options"
        selectionMode="single"
        defaultSelectedKeys={["a"]}
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Selection — multiple mode
  // -------------------------------------------------------------------

  it("should support multiple selection mode", () => {
    render(
      <ToggleButtonGroup
        aria-label="Options"
        selectionMode="multiple"
        defaultSelectedKeys={["a", "c"]}
      >
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
        <ToggleButton id="c">C</ToggleButton>
      </ToggleButtonGroup>,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("data-selected", "true");
    expect(buttons[1]).not.toHaveAttribute("data-selected");
    expect(buttons[2]).toHaveAttribute("data-selected", "true");
  });

  it("should render as toolbar with buttons in multiple mode", () => {
    render(
      <ToggleButtonGroup
        aria-label="Options"
        selectionMode="multiple"
      >
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  // -------------------------------------------------------------------
  // Disabled state
  // -------------------------------------------------------------------

  it("should disable all buttons when group isDisabled", () => {
    render(
      <ToggleButtonGroup aria-label="Options" isDisabled>
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    const radios = screen.getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).toHaveAttribute("data-disabled", "true");
    }
  });

  it("should disable individual button when isDisabled on item", () => {
    render(
      <ToggleButtonGroup aria-label="Options">
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b" isDisabled>
          B
        </ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });

  it("should not trigger selection change on disabled button click", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <ToggleButtonGroup
        aria-label="Options"
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="a" isDisabled>
          A
        </ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "A" }));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Controlled selection
  // -------------------------------------------------------------------

  it("should support controlled selectedKeys", () => {
    render(
      <ToggleButtonGroup
        aria-label="Options"
        selectedKeys={["b"]}
      >
        <ToggleButton id="a">A</ToggleButton>
        <ToggleButton id="b">B</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute(
      "data-selected",
    );
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  // -------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------

  it("should set aria-label on the group", () => {
    render(
      <ToggleButtonGroup aria-label="Formatting options">
        <ToggleButton id="a">A</ToggleButton>
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-label",
      "Formatting options",
    );
  });

  // -------------------------------------------------------------------
  // Icon-only buttons
  // -------------------------------------------------------------------

  it("should not render an empty label span when used as icon-only", () => {
    // An empty label span participates in the flex layout and is offset by
    // `gap`, which visually shifts the icon off-center. The component must
    // skip rendering the label when no children are passed.
    const { container } = render(
      <ToggleButtonGroup aria-label="Alignment">
        <ToggleButton
          id="left"
          iconBefore="FormatAlignLeft"
          aria-label="Align left"
        />
      </ToggleButtonGroup>,
    );

    // The label class is unique to ToggleButton — verify no element uses it.
    expect(container.querySelector(".label")).toBeNull();
  });
});
