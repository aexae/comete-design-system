// Tests unitaires des composants BottomNav et BottomNavItem
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BottomNav } from "./BottomNav";
import { BottomNavItem } from "./BottomNavItem";
import { BottomNavAction } from "./BottomNavAction";

// -----------------------------------------------------------------------
// BottomNav

describe("BottomNav", () => {
  it("should render as a nav element", () => {
    render(<BottomNav><span>item</span></BottomNav>);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should apply nav CSS class", () => {
    render(<BottomNav><span>item</span></BottomNav>);
    expect(screen.getByRole("navigation")).toHaveClass("nav");
  });

  it("should render children", () => {
    render(
      <BottomNav>
        <span data-testid="child">item</span>
      </BottomNav>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should reserve a central spacer when a BottomNav.Action is present", () => {
    const { container } = render(
      <BottomNav>
        <BottomNavItem label="A" icon="Home" />
        <BottomNavItem label="B" icon="Home" />
        <BottomNav.Action icon="Add" aria-label="Créer" />
        <BottomNavItem label="C" icon="Home" />
        <BottomNavItem label="D" icon="Home" />
      </BottomNav>
    );
    expect(container.querySelector("[class*='spacer']")).toBeInTheDocument();
    // 4 items + 1 action = 5 boutons
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });

  it("should NOT render a spacer without a BottomNav.Action", () => {
    const { container } = render(
      <BottomNav>
        <BottomNavItem label="A" icon="Home" />
        <BottomNavItem label="B" icon="Home" />
      </BottomNav>
    );
    expect(container.querySelector("[class*='spacer']")).not.toBeInTheDocument();
  });

  it("should warn in dev when more than 5 navigation items are provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <BottomNav>
        <BottomNavItem label="A" icon="Home" />
        <BottomNavItem label="B" icon="Home" />
        <BottomNavItem label="C" icon="Home" />
        <BottomNavItem label="D" icon="Home" />
        <BottomNavItem label="E" icon="Home" />
        <BottomNavItem label="F" icon="Home" />
      </BottomNav>
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("6 items"));
    warn.mockRestore();
  });

  it("should not warn with 5 items (the BottomNav.Action is not counted)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <BottomNav>
        <BottomNavItem label="A" icon="Home" />
        <BottomNavItem label="B" icon="Home" />
        <BottomNav.Action icon="Add" aria-label="Créer" />
        <BottomNavItem label="C" icon="Home" />
        <BottomNavItem label="D" icon="Home" />
        <BottomNavItem label="E" icon="Home" />
      </BottomNav>
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// -----------------------------------------------------------------------
// BottomNav.Action

describe("BottomNav.Action", () => {
  it("should be attached as BottomNav.Action", () => {
    expect(BottomNav.Action).toBe(BottomNavAction);
  });

  it("should render a button with its aria-label", () => {
    render(<BottomNavAction icon="Add" aria-label="Créer" />);
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });

  it("should apply the action CSS class", () => {
    render(<BottomNavAction icon="Add" aria-label="Créer" />);
    expect(screen.getByRole("button")).toHaveClass("action");
  });

  it("should set aria-expanded=true when isOpen", () => {
    render(<BottomNavAction icon="Add" aria-label="Fermer" isOpen />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("should not set aria-expanded when not open", () => {
    render(<BottomNavAction icon="Add" aria-label="Créer" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-expanded");
  });

  it("should call onPress when clicked", async () => {
    const handlePress = vi.fn();
    render(<BottomNavAction icon="Add" aria-label="Créer" onPress={handlePress} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});

// -----------------------------------------------------------------------
// BottomNavItem

describe("BottomNavItem", () => {
  it("should render label", () => {
    render(<BottomNavItem label="Accueil" icon="Home" />);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("should render as a button", () => {
    render(<BottomNavItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button", { name: /accueil/i })).toBeInTheDocument();
  });

  it("should apply item CSS class", () => {
    render(<BottomNavItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button")).toHaveClass("item");
  });

  it("should not have data-selected when isSelected is false", () => {
    render(<BottomNavItem label="Accueil" icon="Home" isSelected={false} />);
    expect(screen.getByRole("button")).not.toHaveAttribute("data-selected");
  });

  it("should set data-selected when isSelected is true", () => {
    render(<BottomNavItem label="Accueil" icon="Home" isSelected />);
    expect(screen.getByRole("button")).toHaveAttribute("data-selected");
  });

  it("should set aria-current=page when selected", () => {
    render(<BottomNavItem label="Accueil" icon="Home" isSelected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "page");
  });

  it("should not set aria-current when not selected", () => {
    render(<BottomNavItem label="Accueil" icon="Home" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-current");
  });

  it("should set aria-expanded=true when isOpen", () => {
    render(<BottomNavItem label="Créer" icon="Home" isOpen />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("should not set aria-expanded when not open", () => {
    render(<BottomNavItem label="Créer" icon="Home" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-expanded");
  });

  it("should disable the button when isDisabled", async () => {
    const handleClick = vi.fn();
    render(<BottomNavItem label="Accueil" icon="Home" isDisabled onClick={handleClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<BottomNavItem label="Accueil" icon="Home" onClick={handleClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render badge when provided", () => {
    render(<BottomNavItem label="Messages" icon="Person" badge="3" />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not render badge when not provided", () => {
    render(<BottomNavItem label="Accueil" icon="Home" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("should render multiple items inside BottomNav", () => {
    render(
      <BottomNav>
        <BottomNavItem label="Accueil" icon="Home" isSelected />
        <BottomNavItem label="Profil" icon="Person" />
        <BottomNavItem label="Home" icon="Home" />
      </BottomNav>
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});

// -----------------------------------------------------------------------
// BottomNavItem — état ouvert : garde CSS (les CSS Modules sont inertes en jsdom)

describe("BottomNavItem — état ouvert (CSS)", () => {
  const css = readFileSync("src/components/BottomNav/BottomNavItem.module.css", "utf8")
    // Les commentaires citent volontairement les anciennes règles : on les ignore.
    .replace(/\/\*[\s\S]*?\*\//g, "");

  /** Corps des règles dont le sélecteur correspond à `selector`. */
  const bodies = (selector: RegExp) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, sel]) => selector.test(sel ?? ""))
      .map(([, , body]) => body ?? "");

  it("should not give --text-selected to an open item (blue belongs to data-selected)", () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    const offenders = rules.filter(
      ([, sel, body]) => /aria-expanded/.test(sel ?? "") && /--text-selected|--background-selected/.test(body ?? ""),
    );
    expect(offenders).toHaveLength(0);
  });

  it("should not declare a transform transition on iconWrapper, iconSource or iconClose", () => {
    for (const cls of ["iconWrapper", "iconSource", "iconClose"]) {
      for (const body of bodies(new RegExp(String.raw`\.${cls}\b`))) {
        expect(body).not.toMatch(/transition[^;]*transform/);
        expect(body).not.toMatch(/transform\s*:/);
      }
    }
  });

  it("should keep the label visible when open", () => {
    expect(css).not.toMatch(/aria-expanded="true"\]\s*\.label/);
  });

  it("should open with a pure cross-fade: opacity only, --duration-fast", () => {
    const rule = bodies(/^\s*\.iconSource,\s*\.iconClose\s*$/)[0] ?? "";
    expect(rule).toMatch(/transition:\s*opacity var\(--duration-fast\)/);
  });
});
