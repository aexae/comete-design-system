import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressIndicator } from "./ProgressIndicator.js";

describe("ProgressIndicator", () => {
  it("should render the default number of dots (5)", () => {
    render(<ProgressIndicator />);
    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(5);
  });

  it("should render the specified number of dots", () => {
    render(<ProgressIndicator total={3} />);
    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(3);
  });

  it("should mark the selected dot with aria-selected", () => {
    render(<ProgressIndicator total={4} selectedIndex={2} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[2]).toHaveAttribute("aria-selected", "true");
    expect(dots[0]).toHaveAttribute("aria-selected", "false");
  });

  it("should apply the selected class to the selected dot", () => {
    render(<ProgressIndicator total={3} selectedIndex={1} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[1]).toHaveClass("selected");
    expect(dots[0]).not.toHaveClass("selected");
  });

  it("should default selectedIndex to 0", () => {
    render(<ProgressIndicator total={3} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveClass("selected");
    expect(dots[1]).not.toHaveClass("selected");
    expect(dots[2]).not.toHaveClass("selected");
  });

  it("should apply the root class", () => {
    const { container } = render(<ProgressIndicator />);
    expect(container.firstChild).toHaveClass("root");
  });

  it("should apply a custom className", () => {
    const { container } = render(<ProgressIndicator className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should apply the size class", () => {
    const { container } = render(<ProgressIndicator size="large" />);
    expect(container.firstChild).toHaveClass("large");
  });

  it("should apply the default size class (medium)", () => {
    const { container } = render(<ProgressIndicator />);
    expect(container.firstChild).toHaveClass("medium");
  });

  it("should apply the spacing class", () => {
    const { container } = render(<ProgressIndicator spacing="compact" />);
    expect(container.firstChild).toHaveClass("compact");
  });

  it("should apply the default spacing class (comfortable)", () => {
    const { container } = render(<ProgressIndicator />);
    expect(container.firstChild).toHaveClass("comfortable");
  });

  it("should apply the appearance class to dots", () => {
    render(<ProgressIndicator appearance="neutral" total={2} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveClass("neutral");
    expect(dots[1]).toHaveClass("neutral");
  });

  it("should apply the default appearance class to dots", () => {
    render(<ProgressIndicator total={1} />);
    const dot = screen.getByRole("tab");
    expect(dot).toHaveClass("default");
  });

  it("should have role tablist on root", () => {
    render(<ProgressIndicator />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("should generate an aria-label from selectedIndex and total", () => {
    render(<ProgressIndicator selectedIndex={1} total={4} />);
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Etape 2 sur 4",
    );
  });

  it("should use a custom aria-label when provided", () => {
    render(
      <ProgressIndicator
        selectedIndex={0}
        total={3}
        aria-label="Step 1 of 3"
      />,
    );
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Step 1 of 3",
    );
  });

  it("should label each dot with its step number", () => {
    render(<ProgressIndicator total={3} selectedIndex={1} />);
    expect(screen.getByLabelText("Etape 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Etape 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Etape 3")).toBeInTheDocument();
  });

  it("should apply dot class to every dot", () => {
    render(<ProgressIndicator total={3} />);
    const dots = screen.getAllByRole("tab");
    for (const dot of dots) {
      expect(dot).toHaveClass("dot");
    }
  });

  it("should render dots as buttons", () => {
    render(<ProgressIndicator total={2} />);
    const dots = screen.getAllByRole("tab");
    for (const dot of dots) {
      expect(dot.tagName).toBe("BUTTON");
    }
  });

  it("should only make the selected dot tabbable", () => {
    render(<ProgressIndicator total={3} selectedIndex={1} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("tabIndex", "-1");
    expect(dots[1]).toHaveAttribute("tabIndex", "0");
    expect(dots[2]).toHaveAttribute("tabIndex", "-1");
  });

  it("should call onChange when a dot is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    await user.click(dots[2]!);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("should not throw when clicked without onChange", async () => {
    const user = userEvent.setup();
    render(<ProgressIndicator total={3} />);
    const dots = screen.getAllByRole("tab");
    await expect(user.click(dots[1]!)).resolves.not.toThrow();
  });

  it("should navigate to next dot on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={0} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(1);
    expect(dots[1]).toHaveFocus();
  });

  it("should navigate to previous dot on ArrowLeft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={1} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[1]!.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(0);
    expect(dots[0]).toHaveFocus();
  });

  it("should wrap around from last to first on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={2} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[2]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(0);
    expect(dots[0]).toHaveFocus();
  });

  it("should wrap around from first to last on ArrowLeft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={0} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[0]!.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(2);
    expect(dots[2]).toHaveFocus();
  });

  it("should navigate to first dot on Home", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={2} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[2]!.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
    expect(dots[0]).toHaveFocus();
  });

  it("should navigate to last dot on End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProgressIndicator total={3} selectedIndex={0} onChange={onChange} />);
    const dots = screen.getAllByRole("tab");
    dots[0]!.focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(2);
    expect(dots[2]).toHaveFocus();
  });
});
