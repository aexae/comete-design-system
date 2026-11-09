// Tests unitaires du composant Popover
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button, DialogTrigger, Dialog } from "react-aria-components";
import { Popover } from "./Popover";

function renderPopover() {
  return render(
    <DialogTrigger>
      <Button>Open</Button>
      <Popover>
        <Dialog aria-label="Test popover">
          <p>Content</p>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

describe("Popover", () => {
  describe("rendu de base", () => {
    it("should have displayName set to Popover", () => {
      expect(Popover.displayName).toBe("Popover");
    });

    it("should not be visible by default", () => {
      renderPopover();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should open on trigger click", async () => {
      renderPopover();
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should close on Escape", async () => {
      renderPopover();
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("Content")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("prop className", () => {
    it("should append custom className", async () => {
      render(
        <DialogTrigger>
          <Button>Open</Button>
          <Popover className="custom">
            <Dialog aria-label="Test">
              <p>Content</p>
            </Dialog>
          </Popover>
        </DialogTrigger>
      );
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      const dialog = screen.getByRole("dialog");
      expect(dialog.closest("[class*='popover']")).toHaveClass("custom");
    });
  });
});

describe("Popover — zone défilante", () => {
  async function ouvrir(props: { isScrollable?: boolean } = {}) {
    render(
      <DialogTrigger>
        <Button>Open</Button>
        <Popover {...props}>
          <Dialog aria-label="Test popover">
            <p>Content</p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    return screen.getByRole("dialog").closest("[class*='popover']");
  }

  it("should put its content in a ScrollArea by default", async () => {
    const pop = await ouvrir();
    expect(pop).toHaveClass("hasScroll");
    const viewport = pop?.querySelector(".viewport");
    expect(viewport).not.toBeNull();
    // `visibility="auto"` efface le pouce au repos : les ombres portent le
    // signal « il reste du contenu ».
    expect(viewport).toHaveClass("shadows");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should hand the scrolling back to the content when asked", async () => {
    // Une collection React Aria DOIT rester son propre défileur : après avoir
    // amené l'élément focalisé dans la vue, `scrollIntoViewport` recentre la
    // collection dans ses parents défilants. Inerte quand la collection EST
    // le défileur, destructeur sinon — l'élément focalisé quitte l'écran.
    const pop = await ouvrir({ isScrollable: false });
    expect(pop).not.toHaveClass("hasScroll");
    expect(pop?.querySelector(".viewport")).toBeNull();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should draw no scrollbar of its own", () => {
    const css = readFileSync("src/components/Popover/Popover.module.css", "utf8")
      // Les commentaires citent volontairement l'ancienne couche.
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/scrollbar/);
    expect(css).not.toMatch(/overflow-y/);
  });
});
