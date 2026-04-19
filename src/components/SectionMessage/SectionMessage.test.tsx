import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionMessage } from "./SectionMessage";

describe("SectionMessage", () => {
  it("should render with default appearance", () => {
    render(<SectionMessage>Content</SectionMessage>);

    const el = screen.getByRole("group");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("sectionMessage", "information");
  });

  it("should render children content", () => {
    render(<SectionMessage>Some message content</SectionMessage>);

    expect(screen.getByText("Some message content")).toBeInTheDocument();
  });

  it("should render the title when provided", () => {
    render(<SectionMessage title="Alert title">Content</SectionMessage>);

    expect(screen.getByText("Alert title")).toBeInTheDocument();
    expect(screen.getByText("Alert title")).toHaveClass("title");
  });

  it("should not render title element when title is not provided", () => {
    const { container } = render(<SectionMessage>Content</SectionMessage>);

    expect(container.querySelector(".title")).not.toBeInTheDocument();
  });

  it("should apply the correct class for each appearance", () => {
    const appearances = [
      "information",
      "success",
      "warning",
      "critical",
      "discovery",
    ] as const;

    for (const appearance of appearances) {
      const { unmount } = render(
        <SectionMessage appearance={appearance}>Content</SectionMessage>,
      );

      expect(screen.getByRole("group")).toHaveClass(appearance);
      unmount();
    }
  });

  it("should render the default icon for each appearance", () => {
    render(
      <SectionMessage appearance="information">Content</SectionMessage>,
    );

    const el = screen.getByRole("group");
    expect(el.querySelector(".icon")).toBeInTheDocument();
  });

  it("should hide the icon when icon is null", () => {
    const { container } = render(
      <SectionMessage icon={null}>Content</SectionMessage>,
    );

    expect(container.querySelector(".icon")).not.toBeInTheDocument();
  });

  it("should render a custom icon when provided", () => {
    render(
      <SectionMessage icon={<span data-testid="custom-icon">★</span>}>
        Content
      </SectionMessage>,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    render(
      <SectionMessage
        actions={<button type="button">Click me</button>}
      >
        Content
      </SectionMessage>,
    );

    expect(screen.getByText("Click me")).toBeInTheDocument();
    expect(screen.getByText("Click me").closest(".actions")).toBeInTheDocument();
  });

  it("should not render actions element when actions are not provided", () => {
    const { container } = render(<SectionMessage>Content</SectionMessage>);

    expect(container.querySelector(".actions")).not.toBeInTheDocument();
  });

  it("should not render content element when children are not provided", () => {
    const { container } = render(<SectionMessage title="Title only" />);

    expect(container.querySelector(".content")).not.toBeInTheDocument();
  });

  it("should render title, content and actions together", () => {
    render(
      <SectionMessage
        title="Title"
        actions={<button type="button">Action</button>}
      >
        Body text
      </SectionMessage>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
