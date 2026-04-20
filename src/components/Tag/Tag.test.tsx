import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("should render label text", () => {
    render(<Tag label="CDI" />);
    expect(screen.getByText("CDI")).toBeInTheDocument();
  });

  it("should apply default classes (neutral, subtle, square)", () => {
    const { container } = render(<Tag label="Test" />);
    const tag = container.firstElementChild!;
    expect(tag.className).toContain("neutral");
    expect(tag.className).toContain("subtle");
    expect(tag.className).toContain("square");
  });

  it("should apply color class", () => {
    const { container } = render(<Tag label="OK" color="success" />);
    expect(container.firstElementChild!.className).toContain("success");
  });

  it("should apply appearance class", () => {
    const { container } = render(<Tag label="OK" appearance="bold" />);
    expect(container.firstElementChild!.className).toContain("bold");
  });

  it("should apply shape class", () => {
    const { container } = render(<Tag label="OK" shape="square" />);
    expect(container.firstElementChild!.className).toContain("square");
  });

  it("should apply disabled class and aria-disabled", () => {
    const { container } = render(<Tag label="Off" isDisabled />);
    const tag = container.firstElementChild!;
    expect(tag.className).toContain("disabled");
    expect(tag).toHaveAttribute("aria-disabled", "true");
  });

  it("should render elemBefore", () => {
    render(<Tag label="Tag" elemBefore={<span data-testid="before">●</span>} />);
    expect(screen.getByTestId("before")).toBeInTheDocument();
  });

  it("should render elemAfter", () => {
    render(<Tag label="Tag" elemAfter={<span data-testid="after">★</span>} />);
    expect(screen.getByTestId("after")).toBeInTheDocument();
  });

  it("should render remove button when onRemove is provided", () => {
    render(<Tag label="Tag" onRemove={() => undefined} />);
    expect(screen.getByRole("button", { name: "Supprimer Tag" })).toBeInTheDocument();
  });

  it("should not render remove button when disabled", () => {
    render(<Tag label="Tag" onRemove={() => undefined} isDisabled />);
    expect(screen.queryByRole("button", { name: "Supprimer Tag" })).not.toBeInTheDocument();
  });

  it("should make remove button focusable with Tab", () => {
    render(<Tag label="Tag" onRemove={() => undefined} />);
    const removeBtn = screen.getByRole("button", { name: "Supprimer Tag" });
    expect(removeBtn).toHaveAttribute("tabindex", "0");
  });

  it("should call onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Tag label="Tag" onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Supprimer Tag" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("should be interactive when onPress is provided", () => {
    const { container } = render(<Tag label="Click me" onPress={() => undefined} />);
    const tag = container.firstElementChild!;
    expect(tag).toHaveAttribute("role", "button");
    expect(tag).toHaveAttribute("tabindex", "0");
    expect(tag.className).toContain("interactive");
  });

  it("should call onPress when clicked", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Tag label="Click" onPress={onPress} />);
    await user.click(screen.getByText("Click"));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("should not be interactive when disabled", () => {
    const { container } = render(<Tag label="No" onPress={() => undefined} isDisabled />);
    const tag = container.firstElementChild!;
    expect(tag).not.toHaveAttribute("role");
    expect(tag.className).not.toContain("interactive");
  });

  it("should support all 7 colors", () => {
    const colors = ["neutral", "brand", "success", "warning", "critical", "information", "accent"] as const;
    for (const color of colors) {
      const { container, unmount } = render(<Tag label="X" color={color} />);
      expect(container.firstElementChild!.className).toContain(color);
      unmount();
    }
  });

  it("should support all 3 appearances", () => {
    const appearances = ["bold", "subtle", "outlined"] as const;
    for (const a of appearances) {
      const { container, unmount } = render(<Tag label="X" appearance={a} />);
      expect(container.firstElementChild!.className).toContain(a);
      unmount();
    }
  });
});
