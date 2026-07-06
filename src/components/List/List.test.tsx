// Tests unitaires pour le composant List et ses sous-composants
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  List,
  ListHead,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "./List";

describe("List", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render as a <ul>", () => {
    render(
      <List aria-label="Items">
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should expose aria-label on the root <ul>", () => {
    render(
      <List aria-label="My list">
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("list")).toHaveAttribute("aria-label", "My list");
  });

  it("should apply data-dense when isDense is true", () => {
    render(
      <List aria-label="dense" isDense>
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-dense", "true");
  });

  it("should NOT apply data-dense by default", () => {
    render(
      <List aria-label="default">
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("list")).not.toHaveAttribute("data-dense");
  });

  it("should merge custom className on the list root", () => {
    render(
      <List aria-label="x" className="custom">
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("list").className).toContain("custom");
  });

  // -------------------------------------------------------------------
  // ListHead
  // -------------------------------------------------------------------

  it("should render ListHead text", () => {
    render(
      <List aria-label="x">
        <ListHead>Section title</ListHead>
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByText("Section title")).toBeInTheDocument();
  });

  it("should render ListHead with role=presentation", () => {
    render(
      <List aria-label="x">
        <ListHead>Section</ListHead>
      </List>,
    );
    // role="presentation" élève le head hors de l'arbre accessible — il n'est
    // pas exposé comme `listitem`. Pour vérifier, on s'assure que la liste
    // n'a aucun rôle `listitem` enfant (seul le head est présent).
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  // -------------------------------------------------------------------
  // ListItem
  // -------------------------------------------------------------------

  it("should render ListItem as a <li> with role=listitem", () => {
    render(
      <List aria-label="x">
        <ListItem>A</ListItem>
      </List>,
    );
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("should mark a ListItem as selected via data-selected + aria-current", () => {
    render(
      <List aria-label="x">
        <ListItem isSelected>Selected</ListItem>
      </List>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-selected", "true");
    expect(item).toHaveAttribute("aria-current", "true");
  });

  it("should mark a ListItem as disabled (visual only via data-disabled)", () => {
    render(
      <List aria-label="x">
        <ListItem isDisabled>Disabled</ListItem>
      </List>,
    );
    // aria-disabled n'est pas autorisé sur role=listitem ; on signale
    // l'état uniquement via le data-attribute (utilisé par le CSS).
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });

  // -------------------------------------------------------------------
  // ListItemButton
  // -------------------------------------------------------------------

  it("should render ListItemButton as an accessible button", () => {
    render(
      <List aria-label="x">
        <ListItemButton>Click me</ListItemButton>
      </List>,
    );
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("should call onPress when ListItemButton is clicked", () => {
    const handlePress = vi.fn();
    render(
      <List aria-label="x">
        <ListItemButton onPress={handlePress}>Tap</ListItemButton>
      </List>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tap" }));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onPress when ListItemButton is disabled", () => {
    const handlePress = vi.fn();
    render(
      <List aria-label="x">
        <ListItemButton isDisabled onPress={handlePress}>
          Tap
        </ListItemButton>
      </List>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tap" }));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it("should mark a ListItemButton as selected via aria-current", () => {
    render(
      <List aria-label="x">
        <ListItemButton isSelected>Selected</ListItemButton>
      </List>,
    );
    expect(
      screen.getByRole("button", { name: "Selected" }),
    ).toHaveAttribute("aria-current", "true");
  });

  // -------------------------------------------------------------------
  // ListItemText
  // -------------------------------------------------------------------

  it("should render primary and secondary text", () => {
    render(
      <List aria-label="x">
        <ListItem>
          <ListItemText primary="Primary" secondary="Secondary" />
        </ListItem>
      </List>,
    );
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("should render only primary when secondary is omitted", () => {
    render(
      <List aria-label="x">
        <ListItem>
          <ListItemText primary="Primary only" />
        </ListItem>
      </List>,
    );
    expect(screen.getByText("Primary only")).toBeInTheDocument();
  });

  it("should render arbitrary children when no primary is provided", () => {
    render(
      <List aria-label="x">
        <ListItem>
          <ListItemText>
            <span>Free content</span>
          </ListItemText>
        </ListItem>
      </List>,
    );
    expect(screen.getByText("Free content")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // ListItemIcon / ListItemAvatar
  // -------------------------------------------------------------------

  it("should render ListItemIcon with aria-hidden", () => {
    const { container } = render(
      <List aria-label="x">
        <ListItem>
          <ListItemIcon>
            <span data-testid="icon">★</span>
          </ListItemIcon>
        </ListItem>
      </List>,
    );
    const iconWrapper = container.querySelector("[aria-hidden='true']");
    expect(iconWrapper).not.toBeNull();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should render ListItemAvatar contents", () => {
    render(
      <List aria-label="x">
        <ListItem>
          <ListItemAvatar>
            <span data-testid="avatar">AB</span>
          </ListItemAvatar>
        </ListItem>
      </List>,
    );
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // ListItemSecondaryAction
  // -------------------------------------------------------------------

  it("should render ListItemSecondaryAction inside a ListItem", () => {
    render(
      <List aria-label="x">
        <ListItem>
          <ListItemText primary="Item" />
          <ListItemSecondaryAction>
            <button type="button">Action</button>
          </ListItemSecondaryAction>
        </ListItem>
      </List>,
    );
    expect(
      screen.getByRole("button", { name: "Action" }),
    ).toBeInTheDocument();
  });

  it("should extract ListItemSecondaryAction out of the ListItemButton's <button>", () => {
    const { container } = render(
      <List aria-label="x">
        <ListItemButton>
          <ListItemText primary="Notifications" />
          <ListItemSecondaryAction>
            <button type="button" data-testid="action">
              Toggle
            </button>
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>,
    );
    // Le bouton d'action doit être en dehors du `<button>` principal
    // (imbrication interactive interdite).
    const mainButton = container.querySelector<HTMLButtonElement>(
      'button[class*="itemButton"]',
    );
    const action = screen.getByTestId("action");
    expect(mainButton).not.toBeNull();
    expect(mainButton?.contains(action)).toBe(false);
  });

  it("should NOT trigger ListItemButton's onPress when the secondary action button is clicked", () => {
    const handlePress = vi.fn();
    render(
      <List aria-label="x">
        <ListItemButton onPress={handlePress}>
          <ListItemText primary="Notifications" />
          <ListItemSecondaryAction>
            <button type="button">Toggle</button>
          </ListItemSecondaryAction>
        </ListItemButton>
      </List>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(handlePress).not.toHaveBeenCalled();
  });
});
