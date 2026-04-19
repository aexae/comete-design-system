import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("should render label text", () => {
    render(<Tag label="CDI" />);
    expect(screen.getByText("CDI")).toBeInTheDocument();
  });

  it("should apply default classes (neutral, bold, rounded)", () => {
    const { container } = render(<Tag label="Test" />);
    const tag = container.firstElementChild!;
    expect(tag.className).toContain("neutral");
    expect(tag.className).toContain("bold");
    expect(tag.className).toContain("rounded");
  });

  it("should apply appearance class", () => {
    const { container } = render(<Tag label="OK" appearance="success" />);
    expect(container.firstElementChild!.className).toContain("success");
  });

  it("should apply tagStyle class", () => {
    const { container } = render(<Tag label="OK" tagStyle="subtle" />);
    expect(container.firstElementChild!.className).toContain("subtle");
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

  it("should support all 7 appearances", () => {
    const appearances = ["neutral", "brand", "success", "warning", "critical", "information", "accent"] as const;
    for (const appearance of appearances) {
      const { container, unmount } = render(<Tag label="X" appearance={appearance} />);
      expect(container.firstElementChild!.className).toContain(appearance);
      unmount();
    }
  });

  it("should support all 3 styles", () => {
    const tagStyles = ["bold", "subtle", "outlined"] as const;
    for (const s of tagStyles) {
      const { container, unmount } = render(<Tag label="X" tagStyle={s} />);
      expect(container.firstElementChild!.className).toContain(s);
      unmount();
    }
  });
});
