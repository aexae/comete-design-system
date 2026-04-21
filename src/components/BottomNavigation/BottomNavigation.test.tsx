// Tests unitaires des composants BottomNavigation et BottomNavigationItem
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";
import { BottomNavigationItem } from "./BottomNavigationItem";

// -----------------------------------------------------------------------
// BottomNavigation

describe("BottomNavigation", () => {
  it("should render as a nav element", () => {
    render(<BottomNavigation><span>item</span></BottomNavigation>);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should apply nav CSS class", () => {
    render(<BottomNavigation><span>item</span></BottomNavigation>);
    expect(screen.getByRole("navigation")).toHaveClass("nav");
  });

  it("should render children", () => {
    render(
      <BottomNavigation>
        <span data-testid="child">item</span>
      </BottomNavigation>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// BottomNavigationItem

describe("BottomNavigationItem", () => {
  it("should render label", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" />);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("should render as a button", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button", { name: /accueil/i })).toBeInTheDocument();
  });

  it("should apply item CSS class", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button")).toHaveClass("item");
  });

  it("should not have data-selected when isSelected is false", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" isSelected={false} />);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-selected");
  });

  it("should set data-selected when isSelected is true", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" isSelected />);
    expect(screen.getByRole("button")).toHaveAttribute("data-selected");
  });

  it("should set aria-current=page when selected", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" isSelected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "page");
  });

  it("should not set aria-current when not selected", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-current");
  });

  it("should set aria-expanded=true when isOpen", () => {
    render(<BottomNavigationItem label="Créer" icon="Home" isOpen />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("should not set aria-expanded when not open", () => {
    render(<BottomNavigationItem label="Créer" icon="Home" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-expanded");
  });

  it("should disable the button when isDisabled", async () => {
    const handleClick = vi.fn();
    render(<BottomNavigationItem label="Accueil" icon="Home" isDisabled onClick={handleClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<BottomNavigationItem label="Accueil" icon="Home" onClick={handleClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render badge when provided", () => {
    render(<BottomNavigationItem label="Messages" icon="Person" badge="3" />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not render badge when not provided", () => {
    render(<BottomNavigationItem label="Accueil" icon="Home" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("should render multiple items inside BottomNavigation", () => {
    render(
      <BottomNavigation>
        <BottomNavigationItem label="Accueil" icon="Home" isSelected />
        <BottomNavigationItem label="Profil" icon="Person" />
        <BottomNavigationItem label="Dashboard" icon="Dashboard" />
      </BottomNavigation>
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});
