// Tests unitaires des composants Breadcrumbs et BreadcrumbItem
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";
import { BreadcrumbItem } from "./BreadcrumbItem";

// -----------------------------------------------------------------------
// Breadcrumbs

describe("Breadcrumbs", () => {
  it("should render as a nav element", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should have default aria-label", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Fil d'Ariane");
  });

  it("should use custom aria-label when provided", () => {
    render(
      <Breadcrumbs aria-label="Navigation">
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Navigation");
  });

  it("should render children inside a list", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
        <BreadcrumbItem label="Produits" href="/produits" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});

// -----------------------------------------------------------------------
// BreadcrumbItem

describe("BreadcrumbItem", () => {
  it("should render label", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("should render as a link when href is provided", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
  });

  it("should render as span when isCurrent is true", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Page courante" isCurrent />
      </Breadcrumbs>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Page courante")).toBeInTheDocument();
  });

  it("should set aria-current=page on current item", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Page courante" isCurrent />
      </Breadcrumbs>
    );
    const el = screen.getByText("Page courante").closest("[aria-current]");
    expect(el).toHaveAttribute("aria-current", "page");
  });

  it("should not have aria-current on non-current items", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.queryByRole("link")).not.toHaveAttribute("aria-current");
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" onClick={handleClick} />
      </Breadcrumbs>
    );
    // onClick seul → rendu comme <button> (pas de href → pas de rôle "link")
    await userEvent.click(screen.getByRole("button", { name: "Accueil" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render iconBefore when provided", () => {
    const { container } = render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" iconBefore="Home" />
      </Breadcrumbs>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should render iconAfter when provided", () => {
    const { container } = render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" iconAfter="Home" />
      </Breadcrumbs>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should not render isCurrent item as link even if href is provided", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Page" href="/page" isCurrent />
      </Breadcrumbs>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should apply list CSS class to the list", () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem label="Accueil" href="/" />
      </Breadcrumbs>
    );
    expect(screen.getByRole("list")).toHaveClass("list");
  });
});
