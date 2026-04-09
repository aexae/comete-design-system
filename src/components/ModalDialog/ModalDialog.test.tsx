// Tests unitaires pour ModalDialog
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModalDialog } from "./ModalDialog";

describe("ModalDialog", () => {
  it("should render when isOpen is true", () => {
    render(
      <ModalDialog isOpen title="Test">
        <p>Content</p>
      </ModalDialog>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(
      <ModalDialog isOpen={false} title="Test">
        <p>Content</p>
      </ModalDialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should have displayName set to ModalDialog", () => {
    expect(ModalDialog.displayName).toBe("ModalDialog");
  });

  it("should render the title as a heading", () => {
    render(
      <ModalDialog isOpen title="Modal Title">
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByRole("heading", { name: "Modal Title" })).toBeInTheDocument();
  });

  it("should render footer content", () => {
    render(
      <ModalDialog isOpen title="Test" footer={<button>Confirm</button>}>
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("should not render footer when not provided", () => {
    const { container } = render(
      <ModalDialog isOpen title="Test">
        <p>Body</p>
      </ModalDialog>
    );
    expect(container.querySelector(".footer")).not.toBeInTheDocument();
  });

  it("should render warning icon for appearance warning", () => {
    render(
      <ModalDialog isOpen title="Warning" appearance="warning">
        <p>Body</p>
      </ModalDialog>
    );
    expect(document.querySelector("[role='dialog'] svg")).toBeInTheDocument();
  });

  it("should render critical icon for appearance critical", () => {
    render(
      <ModalDialog isOpen title="Critical" appearance="critical">
        <p>Body</p>
      </ModalDialog>
    );
    expect(document.querySelector("[role='dialog'] svg")).toBeInTheDocument();
  });

  it("should not render icon for default appearance", () => {
    render(
      <ModalDialog isOpen title="Default">
        <p>Body</p>
      </ModalDialog>
    );
    expect(document.querySelector("[role='dialog'] .headerIcon")).not.toBeInTheDocument();
  });

  it("should apply width class", () => {
    render(
      <ModalDialog isOpen title="Test" width="large">
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByRole("dialog")).toHaveClass("large");
  });

  it("should apply custom className", () => {
    render(
      <ModalDialog isOpen title="Test" className="custom">
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByRole("dialog")).toHaveClass("custom");
  });

  it("should render close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(
      <ModalDialog isOpen title="Test" onClose={onClose}>
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByLabelText("Fermer")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <ModalDialog isOpen title="Test" onClose={onClose}>
        <p>Body</p>
      </ModalDialog>
    );
    await userEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should not render close button when onClose is not provided", () => {
    render(
      <ModalDialog isOpen title="Test">
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.queryByLabelText("Fermer")).not.toBeInTheDocument();
  });

  it("should close on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <ModalDialog isOpen title="Test" onOpenChange={onOpenChange}>
        <p>Body</p>
      </ModalDialog>
    );
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
