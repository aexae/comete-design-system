// Tests unitaires pour ModalDialog
import { readFileSync } from "node:fs";
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

  // showHeader ------------------------------------------------------------

  it("should hide the close button when showHeader is false", () => {
    const onClose = vi.fn();
    render(
      <ModalDialog isOpen title="Recherche globale" showHeader={false} onClose={onClose}>
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.queryByRole("button", { name: "Fermer" })).not.toBeInTheDocument();
  });

  it("should keep an accessible name when showHeader is false", () => {
    render(
      <ModalDialog isOpen title="Recherche globale" showHeader={false}>
        <p>Body</p>
      </ModalDialog>
    );
    // Le titre reste dans le DOM, hors écran : sans lui le dialog perdrait son
    // nom accessible (React Aria le lit via `slot="title"`).
    expect(screen.getByRole("heading", { name: "Recherche globale" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Recherche globale");
  });

  it("should show the header by default", () => {
    const onClose = vi.fn();
    render(
      <ModalDialog isOpen title="Avec header" onClose={onClose}>
        <p>Body</p>
      </ModalDialog>
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Avec header");
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

  it("should render pinned content outside the scrolling body", () => {
    render(
      <ModalDialog title="Palette" isOpen pinned={<input aria-label="Chercher" />}>
        <p>Résultats</p>
      </ModalDialog>
    );
    const pinned = screen.getByLabelText("Chercher").parentElement;
    // Le corps est un `ScrollArea` : son contenu vit DANS la zone défilante,
    // deux niveaux sous la racine qui porte `body`.
    const body = screen.getByText("Résultats").closest(".body");
    expect(pinned).toHaveClass("pinned");
    expect(body).not.toBeNull();
    // le bloc épinglé n'est PAS dans le corps qui défile
    expect(body).not.toContainElement(screen.getByLabelText("Chercher"));
  });

  it("should not render a pinned block when the prop is omitted", () => {
    render(
      <ModalDialog title="Simple" isOpen>
        <p>Corps</p>
      </ModalDialog>
    );
    expect(document.querySelector(".pinned")).toBeNull();
  });
});

describe("ModalDialog — zone défilante", () => {
  // Le corps est un `ScrollArea`, pas la couche CSS partagée. Les noms de
  // classe sont bruts en test (`classNameStrategy: "non-scoped"`).
  const css = readFileSync("src/components/ModalDialog/ModalDialog.module.css", "utf8")
    // Les commentaires citent volontairement l'ancienne couche : on les ignore.
    .replace(/\/\*[\s\S]*?\*\//g, "");

  function renderCorps() {
    render(
      <ModalDialog title="Long" isOpen>
        <p>Corps défilant</p>
      </ModalDialog>
    );
    return screen.getByText("Corps défilant").closest(".body");
  }

  it("should hand the scrolling to a ScrollArea, not to the shared layer", () => {
    const racine = renderCorps();
    expect(racine).not.toBeNull();
    expect(racine).toHaveClass("root");
    expect(racine).not.toHaveClass("scrollable");
    expect(racine).not.toHaveClass("themed");
  });

  it("should show overflow shadows, the only cue left once the thumb fades", () => {
    // `visibility="auto"` efface le pouce au repos : ce sont les ombres qui
    // disent qu'il reste du contenu, y compris au doigt où il n'y a pas de survol.
    expect(renderCorps()?.querySelector(".viewport")).toHaveClass("shadows");
  });

  it("should keep the padding inside the scroller, on the content", () => {
    renderCorps();
    const contenu = screen.getByText("Corps défilant").parentElement;
    expect(contenu).toHaveClass("bodyContent");
    expect(contenu?.parentElement).toHaveClass("viewport");
  });

  it("should move the headerless top padding onto the content too", () => {
    // Le retrait que le header fournissait vit maintenant avec les autres,
    // dans le défileur — sinon il serait posé hors de la zone qui défile.
    expect(css).toMatch(/\.noHeader\s+\.bodyContent\s*\{[^}]*padding-top/);
    expect(css).not.toMatch(/\.noHeader\s+\.body\s*\{/);
  });

  it("should repaint the overflow masks in the dialog colour", () => {
    // Sans ce jeton les masques tirent vers `--background-surface-default`,
    // qui n'est pas la couleur du dialog — ils jureraient sur la modale.
    expect(css).toMatch(
      /\.body\s*\{[^}]*--scroll-shadow-surface:\s*var\(--background-surface-elevation-overlay-default\)/
    );
  });

  it("should draw no scrollbar of its own", () => {
    expect(css).not.toMatch(/scrollbar/);
    expect(css).not.toMatch(/overflow-y/);
  });
});
