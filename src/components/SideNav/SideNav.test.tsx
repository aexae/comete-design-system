// Tests unitaires pour le composant SideNav
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SideNav } from "./SideNav";

// -----------------------------------------------------------------------
// Tests

describe("SideNav", () => {
  // SideNav container ---------------------------------------------------

  it("should render children inside a nav element", () => {
    render(
      <SideNav>
        <div>content</div>
      </SideNav>
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("should apply additional className to the container", () => {
    render(
      <SideNav className="custom">
        <div>content</div>
      </SideNav>
    );
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("custom");
  });

  // SideNav.Header ------------------------------------------------------

  it("should render companyName in the header", () => {
    render(
      <SideNav>
        <SideNav.Header companyName="My App" />
      </SideNav>
    );
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  it("should render description in the header", () => {
    render(
      <SideNav>
        <SideNav.Header companyName="My App" description="v1.0" />
      </SideNav>
    );
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("should render logo slot in the header", () => {
    render(
      <SideNav>
        <SideNav.Header logo={<img alt="logo" src="/logo.png" />} companyName="App" />
      </SideNav>
    );
    expect(screen.getByAltText("logo")).toBeInTheDocument();
  });

  // SideNav.Item — rendering as <a> or <button> -------------------------

  it("should render as <a> when href is provided", () => {
    render(
      <SideNav>
        <SideNav.Item label="Home" href="/home" />
      </SideNav>
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("should render as <button> when href is not provided", () => {
    render(
      <SideNav>
        <SideNav.Item label="Action" />
      </SideNav>
    );
    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  // SideNav.Item — selected state ----------------------------------------

  it("should have aria-current=page when selected", () => {
    render(
      <SideNav>
        <SideNav.Item label="Home" href="/home" isSelected />
      </SideNav>
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("should apply selected class when isSelected is true", () => {
    render(
      <SideNav>
        <SideNav.Item label="Home" isSelected />
      </SideNav>
    );
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.className).toContain("Selected");
  });

  // SideNav.Item — disabled state ----------------------------------------

  it("should have aria-disabled when disabled", () => {
    render(
      <SideNav>
        <SideNav.Item label="Locked" isDisabled />
      </SideNav>
    );
    const button = screen.getByRole("button", { name: "Locked" });
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("should not call onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <SideNav>
        <SideNav.Item label="Locked" isDisabled onClick={onClick} />
      </SideNav>
    );
    await user.click(screen.getByRole("button", { name: "Locked" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  // SideNav.Item — icon rendering ----------------------------------------

  it("should render icon as an svg", () => {
    render(
      <SideNav>
        <SideNav.Item label="Home" iconBefore="Home" />
      </SideNav>
    );
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("should render iconAfter as an svg", () => {
    render(
      <SideNav>
        <SideNav.Item label="More" iconAfter="ChevronRight" />
      </SideNav>
    );
    const button = screen.getByRole("button", { name: "More" });
    // Should have at least one svg for iconAfter
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  // SideNav.Item — description -------------------------------------------

  it("should render description when provided", () => {
    render(
      <SideNav>
        <SideNav.Item label="Home" description="View statistics" />
      </SideNav>
    );
    expect(screen.getByText("View statistics")).toBeInTheDocument();
  });

  // SideNav.Item — onClick -----------------------------------------------

  it("should call onClick when item is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <SideNav>
        <SideNav.Item label="Action" onClick={onClick} />
      </SideNav>
    );
    await user.click(screen.getByRole("button", { name: "Action" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // SideNav.Section ------------------------------------------------------

  it("should render section title", () => {
    render(
      <SideNav>
        <SideNav.Section title="Navigation">
          <SideNav.Item label="Home" />
        </SideNav.Section>
      </SideNav>
    );
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("should render section children", () => {
    render(
      <SideNav>
        <SideNav.Section>
          <SideNav.Item label="Home" />
          <SideNav.Item label="Settings" />
        </SideNav.Section>
      </SideNav>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  // SideNav.Divider ------------------------------------------------------

  it("should render a divider as a separator", () => {
    render(
      <SideNav>
        <SideNav.Item label="Above" />
        <SideNav.Divider />
        <SideNav.Item label="Below" />
      </SideNav>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  // SideNav.Footer -------------------------------------------------------

  it("should render footer children", () => {
    render(
      <SideNav>
        <SideNav.Footer>
          <span>Footer content</span>
        </SideNav.Footer>
      </SideNav>
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  // Composition test -----------------------------------------------------

  it("should compose all sub-components together", () => {
    render(
      <SideNav>
        <SideNav.Header
          logo={<img alt="logo" src="/logo.png" />}
          companyName="My App"
          description="v2.0"
        />
        <SideNav.Section title="Main">
          <SideNav.Item label="Home" iconBefore="Home" isSelected href="/" />
          <SideNav.Item label="Settings" iconBefore="Settings" href="/settings" />
        </SideNav.Section>
        <SideNav.Divider />
        <SideNav.Section title="Admin">
          <SideNav.Item label="Users" iconBefore="Person" href="/users" isDisabled />
        </SideNav.Section>
        <SideNav.Footer>
          <span>Powered by Comete</span>
        </SideNav.Footer>
      </SideNav>
    );

    // Nav container
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // Header
    expect(screen.getByAltText("logo")).toBeInTheDocument();
    expect(screen.getByText("My App")).toBeInTheDocument();
    expect(screen.getByText("v2.0")).toBeInTheDocument();

    // Sections
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();

    // Items
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    const settingsLink = screen.getByRole("link", { name: "Settings" });
    expect(settingsLink).not.toHaveAttribute("aria-current");

    // Disabled item renders without href
    const usersItem = screen.getByText("Users").closest("[aria-disabled]");
    expect(usersItem).toHaveAttribute("aria-disabled", "true");

    // Divider
    expect(screen.getByRole("separator")).toBeInTheDocument();

    // Footer
    expect(screen.getByText("Powered by Comete")).toBeInTheDocument();
  });

  // SideNav.ItemSkeleton ------------------------------------------------

  it("should render skeleton placeholders in an item skeleton", () => {
    const { container } = render(<SideNav.ItemSkeleton />);
    expect(
      container.querySelector("[class*='skeletonItem']"),
    ).toBeInTheDocument();
    // 1 pastille + 1 barre de label (pas de description par défaut)
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  it("should render a second line when hasDescription is set", () => {
    render(<SideNav.ItemSkeleton hasDescription />);
    // icône + label + description
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  // SideNav.Skeleton ----------------------------------------------------

  it("should render the requested number of item skeletons", () => {
    const { container } = render(
      <SideNav>
        <SideNav.Skeleton count={4} withSectionTitle={false} />
      </SideNav>,
    );
    expect(
      container.querySelectorAll("[class*='skeletonItemContent']"),
    ).toHaveLength(4);
  });

  it("should render a section title placeholder by default", () => {
    const { container } = render(
      <SideNav>
        <SideNav.Skeleton count={2} />
      </SideNav>,
    );
    expect(
      container.querySelector("[class*='skeletonSectionTitle']"),
    ).toBeInTheDocument();
  });

  it("should render a header placeholder when withHeader is set", () => {
    const { container } = render(
      <SideNav>
        <SideNav.Skeleton count={2} withHeader />
      </SideNav>,
    );
    expect(
      container.querySelector("[class*='skeletonHeader']"),
    ).toBeInTheDocument();
  });

  // SideNav.Empty -------------------------------------------------------

  it("should render the default empty title", () => {
    render(
      <SideNav>
        <SideNav.Empty />
      </SideNav>,
    );
    expect(screen.getByText("Aucun élément")).toBeInTheDocument();
  });

  it("should render a custom title, description and action", () => {
    render(
      <SideNav>
        <SideNav.Empty
          title="Aucun résultat"
          description="Rien ne correspond."
          action={<button>Réinitialiser</button>}
        />
      </SideNav>,
    );
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
    expect(screen.getByText("Rien ne correspond.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Réinitialiser" }),
    ).toBeInTheDocument();
  });

  it("should render an icon when provided", () => {
    const { container } = render(
      <SideNav>
        <SideNav.Empty icon="Search" title="Aucun résultat" />
      </SideNav>,
    );
    expect(
      container.querySelector("[class*='emptyIcon']"),
    ).toBeInTheDocument();
  });

  // SideNav.FooterBrand -------------------------------------------------

  it("should wrap the brand mark in a dedicated footerBrand element", () => {
    const { container, getByText } = render(
      <SideNav>
        <SideNav.Footer>
          <SideNav.FooterBrand>
            <span>Marque</span>
          </SideNav.FooterBrand>
        </SideNav.Footer>
      </SideNav>,
    );
    const brand = container.querySelector("[class*='footerBrand']");
    expect(brand).toBeInTheDocument();
    expect(getByText("Marque")).toBeInTheDocument();
  });

  // Défilement interne --------------------------------------------------

  it("should render sections/items in a scrollable body, header and footer pinned outside", () => {
    const { container } = render(
      <SideNav>
        <SideNav.Header companyName="Ma marque" />
        <SideNav.Section title="Navigation">
          <SideNav.Item label="Accueil" iconBefore="Home" />
        </SideNav.Section>
        <SideNav.Footer>Pied de page</SideNav.Footer>
      </SideNav>,
    );
    const body = container.querySelector("[class*='body']");
    expect(body).toBeInTheDocument();
    // Les items défilent dans le corps…
    expect(body?.textContent).toContain("Accueil");
    // …mais header et footer restent en dehors (épinglés).
    expect(body?.textContent).not.toContain("Ma marque");
    expect(body?.textContent).not.toContain("Pied de page");
  });
});
