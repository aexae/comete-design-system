import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InformativeState } from "./InformativeState.js";

describe("InformativeState", () => {
  it("should render the title", () => {
    render(<InformativeState title="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("should render the title as an h2 heading", () => {
    render(<InformativeState title="Heading" />);
    expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
  });

  it("should render the description when provided", () => {
    render(<InformativeState title="Title" description="Some description" />);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    const { container } = render(<InformativeState title="Title" />);
    expect(container.querySelector(".description")).not.toBeInTheDocument();
  });

  it("should render the image slot when provided", () => {
    render(<InformativeState title="Title" image={<img alt="illustration" src="test.png" />} />);
    expect(screen.getByAltText("illustration")).toBeInTheDocument();
  });

  it("should not render the image container when not provided", () => {
    const { container } = render(<InformativeState title="Title" />);
    expect(container.querySelector(".image")).not.toBeInTheDocument();
  });

  it("should render the actions slot when provided", () => {
    render(<InformativeState title="Title" actions={<button type="button">Action</button>} />);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("should not render the actions container when not provided", () => {
    const { container } = render(<InformativeState title="Title" />);
    expect(container.querySelector(".stackActions")).not.toBeInTheDocument();
  });

  it("should render all sections together", () => {
    render(
      <InformativeState
        title="Empty"
        description="Nothing to show"
        image={<span data-testid="illustration">img</span>}
        actions={<button type="button">Create</button>}
      />
    );
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
    expect(screen.getByTestId("illustration")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("should apply the root class", () => {
    const { container } = render(<InformativeState title="Title" />);
    expect(container.firstChild).toHaveClass("root");
  });

  it("should apply a custom className", () => {
    const { container } = render(<InformativeState title="Title" className="custom" />);
    expect(container.firstChild).toHaveClass("root", "custom");
  });

  it("should render only title when no optional props are given", () => {
    const { container } = render(<InformativeState title="Only title" />);
    expect(screen.getByText("Only title")).toBeInTheDocument();
    expect(container.querySelector(".image")).not.toBeInTheDocument();
    expect(container.querySelector(".description")).not.toBeInTheDocument();
    expect(container.querySelector(".stackActions")).not.toBeInTheDocument();
  });
});
