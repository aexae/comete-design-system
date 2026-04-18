// Tests unitaires pour le composant TopNav
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopNav } from "./TopNav";

describe("TopNav", () => {
  // Rendu de base --------------------------------------------------------

  it("should render as a <nav> element", () => {
    render(<TopNav />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  // Logo & appName -------------------------------------------------------

  it("should show logo and appName", () => {
    render(
      <TopNav logo={<img src="/logo.svg" alt="Logo" />} appName="Mon App" />,
    );
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Mon App")).toBeInTheDocument();
  });

  // Title ----------------------------------------------------------------

  it("should show title", () => {
    render(<TopNav title="Accueil" />);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  // Back button ----------------------------------------------------------

  it("should show back button when onBack is provided and call handler on click", () => {
    const handleBack = vi.fn();
    render(<TopNav onBack={handleBack} />);
    const button = screen.getByRole("button", { name: "Retour" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("should NOT show back button when onBack is undefined", () => {
    render(<TopNav />);
    expect(screen.queryByRole("button", { name: "Retour" })).not.toBeInTheDocument();
  });

  // Children (trailing actions) ------------------------------------------

  it("should render children", () => {
    render(
      <TopNav>
        <button>Search</button>
        <button>Profile</button>
      </TopNav>,
    );
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();
  });

  // Custom className -----------------------------------------------------

  it("should apply custom className", () => {
    render(<TopNav className="custom-class" />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("custom-class");
  });
});
