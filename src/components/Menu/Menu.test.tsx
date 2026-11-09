// Tests unitaires pour le composant Menu
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button as AriaButton } from "react-aria-components";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
  MenuPopover,
  MenuSection,
  MenuDivider,
} from "./Menu";

// -----------------------------------------------------------------------
// Helpers

/** Renders a basic menu with a trigger button and opens it. */
async function renderOpenMenu(menuContent: React.ReactNode) {
  const user = userEvent.setup();
  render(
    <MenuTrigger>
      <AriaButton>Open Menu</AriaButton>
      <MenuPopover>
        <Menu>{menuContent}</Menu>
      </MenuPopover>
    </MenuTrigger>
  );
  await user.click(screen.getByRole("button", { name: "Open Menu" }));
  return user;
}

// -----------------------------------------------------------------------
// Tests

describe("Menu", () => {
  // Rendu de base --------------------------------------------------------

  it("should render a menu when trigger is clicked", async () => {
    await renderOpenMenu(
      <>
        <MenuItem id="edit">Modifier</MenuItem>
        <MenuItem id="delete">Supprimer</MenuItem>
      </>
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("should render menu items as menuitem role", async () => {
    await renderOpenMenu(
      <>
        <MenuItem id="edit">Modifier</MenuItem>
        <MenuItem id="delete">Supprimer</MenuItem>
      </>
    );
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(2);
  });

  it("should display item labels", async () => {
    await renderOpenMenu(
      <>
        <MenuItem id="edit">Modifier</MenuItem>
        <MenuItem id="delete">Supprimer</MenuItem>
      </>
    );
    expect(screen.getByText("Modifier")).toBeInTheDocument();
    expect(screen.getByText("Supprimer")).toBeInTheDocument();
  });

  // Description ----------------------------------------------------------

  it("should render description when provided", async () => {
    await renderOpenMenu(
      <MenuItem id="profile" description="Voir votre profil">
        Profil
      </MenuItem>
    );
    expect(screen.getByText("Voir votre profil")).toBeInTheDocument();
  });

  // Icônes ---------------------------------------------------------------

  it("should render iconBefore as an svg", async () => {
    await renderOpenMenu(
      <MenuItem id="edit" iconBefore="Edit">
        Modifier
      </MenuItem>
    );
    const item = screen.getByRole("menuitem");
    expect(item.querySelector("svg")).toBeInTheDocument();
  });

  it("should render iconAfter as an svg", async () => {
    await renderOpenMenu(
      <MenuItem id="submenu" iconAfter="ChevronRight">
        Sous-menu
      </MenuItem>
    );
    const item = screen.getByRole("menuitem");
    expect(item.querySelector("svg")).toBeInTheDocument();
  });

  // Elem after ----------------------------------------------------------

  it("should render elemAfter content", async () => {
    await renderOpenMenu(
      <MenuItem id="save" elemAfter={<kbd>⌘S</kbd>}>
        Enregistrer
      </MenuItem>
    );
    expect(screen.getByText("⌘S")).toBeInTheDocument();
  });

  // Disabled -------------------------------------------------------------

  it("should render disabled items with data-disabled", async () => {
    await renderOpenMenu(
      <MenuItem id="locked" isDisabled>
        Verrouillé
      </MenuItem>
    );
    const item = screen.getByRole("menuitem");
    expect(item).toHaveAttribute("data-disabled", "true");
  });

  // Actions --------------------------------------------------------------

  it("should call onAction when an item is clicked", async () => {
    const onAction = vi.fn();
    const user = await renderOpenMenu(
      <>
        <MenuItem
          id="edit"
          onAction={() => {
            onAction("edit");
          }}
        >
          Modifier
        </MenuItem>
        <MenuItem
          id="delete"
          onAction={() => {
            onAction("delete");
          }}
        >
          Supprimer
        </MenuItem>
      </>
    );
    await user.click(screen.getByText("Modifier"));
    expect(onAction).toHaveBeenCalledWith("edit");
  });

  // Sections -------------------------------------------------------------

  it("should render section headings", async () => {
    await renderOpenMenu(
      <>
        <MenuSection title="Navigation">
          <MenuItem id="home">Accueil</MenuItem>
        </MenuSection>
        <MenuSection title="Actions">
          <MenuItem id="settings">Paramètres</MenuItem>
        </MenuSection>
      </>
    );
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should render items inside sections", async () => {
    await renderOpenMenu(
      <MenuSection title="Fichier">
        <MenuItem id="new">Nouveau</MenuItem>
        <MenuItem id="open">Ouvrir</MenuItem>
      </MenuSection>
    );
    expect(screen.getByText("Nouveau")).toBeInTheDocument();
    expect(screen.getByText("Ouvrir")).toBeInTheDocument();
  });

  // Divider --------------------------------------------------------------

  it("should render a divider as a separator", async () => {
    await renderOpenMenu(
      <>
        <MenuItem id="edit">Modifier</MenuItem>
        <MenuDivider />
        <MenuItem id="delete">Supprimer</MenuItem>
      </>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  // Keyboard navigation --------------------------------------------------

  it("should open menu with ArrowDown on trigger", async () => {
    const user = userEvent.setup();
    render(
      <MenuTrigger>
        <AriaButton>Options</AriaButton>
        <MenuPopover>
          <Menu>
            <MenuItem id="a">Item A</MenuItem>
            <MenuItem id="b">Item B</MenuItem>
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    );
    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // Menu closes on item selection ----------------------------------------

  it("should close menu after selecting an item", async () => {
    const user = await renderOpenMenu(<MenuItem id="edit">Modifier</MenuItem>);
    await user.click(screen.getByText("Modifier"));
    // Menu should be closed (no menu role in the DOM)
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // SubmenuTrigger --------------------------------------------------------

  it("should render a submenu trigger item with data-has-submenu", async () => {
    await renderOpenMenu(
      <SubmenuTrigger>
        <MenuItem id="more">Plus</MenuItem>
        <MenuPopover>
          <Menu>
            <MenuItem id="sub-a">Sub A</MenuItem>
          </Menu>
        </MenuPopover>
      </SubmenuTrigger>
    );
    const trigger = screen.getByRole("menuitem", { name: "Plus" });
    expect(trigger).toHaveAttribute("data-has-submenu", "true");
  });

  it("should auto-render ChevronRight icon on submenu trigger", async () => {
    await renderOpenMenu(
      <SubmenuTrigger>
        <MenuItem id="more">Plus</MenuItem>
        <MenuPopover>
          <Menu>
            <MenuItem id="sub-a">Sub A</MenuItem>
          </Menu>
        </MenuPopover>
      </SubmenuTrigger>
    );
    const trigger = screen.getByRole("menuitem", { name: "Plus" });
    expect(trigger.querySelector("svg")).toBeInTheDocument();
  });
});
