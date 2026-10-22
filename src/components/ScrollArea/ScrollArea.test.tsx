import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ScrollArea } from "./ScrollArea";

/**
 * jsdom ne met en page rien du tout : `clientHeight` et `scrollHeight` y
 * valent 0, donc aucun débordement n'est jamais détecté et les ascenseurs
 * ne sont pas rendus. On simule donc une géométrie, sinon tous les tests
 * de pouce porteraient sur du vide.
 */
function simulerDebordement({
  clientHeight = 100,
  scrollHeight = 400,
  clientWidth = 100,
  scrollWidth = 100,
} = {}) {
  const def = (nom: string, valeur: number) =>
    Object.defineProperty(HTMLElement.prototype, nom, {
      configurable: true,
      get() {
        return valeur;
      },
    });
  def("clientHeight", clientHeight);
  def("scrollHeight", scrollHeight);
  def("clientWidth", clientWidth);
  def("scrollWidth", scrollWidth);
}

function retablirGeometrie() {
  for (const nom of ["clientHeight", "scrollHeight", "clientWidth", "scrollWidth"]) {
    Object.defineProperty(HTMLElement.prototype, nom, {
      configurable: true,
      get() {
        return 0;
      },
    });
  }
}

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  retablirGeometrie();
  vi.useRealTimers();
});

const pouces = () => document.querySelectorAll(".thumb");
const barres = () => document.querySelectorAll(".scrollbar");

describe("ScrollArea", () => {
  it("should render its children", () => {
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("should default to the vertical axis", () => {
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toHaveClass("vertical");
  });

  it.each([
    ["vertical", "vertical"],
    ["horizontal", "horizontal"],
    ["both", "both"],
  ] as const)("should apply the %s axis", (axis, attendu) => {
    render(<ScrollArea axis={axis}>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toHaveClass(attendu);
  });

  it("should hide the native scrollbar — the rendered one replaces it", () => {
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toHaveClass("hidden");
  });

  it("should not render any scrollbar when the content does not overflow", () => {
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(barres()).toHaveLength(0);
  });

  it("should render a vertical thumb when the content overflows", () => {
    simulerDebordement();
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(barres()).toHaveLength(1);
    expect(pouces()).toHaveLength(1);
  });

  it("should size the thumb from the visible fraction of the content", () => {
    // 100 visibles sur 400 → le pouce occupe le quart de la piste.
    simulerDebordement({ clientHeight: 100, scrollHeight: 400 });
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(pouces()[0]).toHaveStyle({ height: "25%" });
  });

  it("should floor the thumb size so it stays grabbable on very long content", () => {
    // 10 visibles sur 10000 → 0,1 % serait invisible ; on plancher à 8 %.
    simulerDebordement({ clientHeight: 10, scrollHeight: 10000 });
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(pouces()[0]).toHaveStyle({ height: "8%" });
  });

  it("should render a horizontal thumb on the horizontal axis", () => {
    simulerDebordement({ clientWidth: 100, scrollWidth: 400 });
    render(<ScrollArea axis="horizontal">Contenu</ScrollArea>);
    expect(pouces()[0]).toHaveStyle({ width: "25%" });
  });

  it("should render both thumbs on the both axis", () => {
    simulerDebordement({ scrollHeight: 400, clientWidth: 100, scrollWidth: 400 });
    render(<ScrollArea axis="both">Contenu</ScrollArea>);
    expect(pouces()).toHaveLength(2);
  });

  it("should keep the scrollbar hidden at rest in hover mode", () => {
    simulerDebordement();
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(barres()[0]).toHaveAttribute("data-state", "hidden");
  });

  it("should always show the scrollbar when visibility is always", () => {
    simulerDebordement();
    render(<ScrollArea visibility="always">Contenu</ScrollArea>);
    expect(barres()[0]).toHaveAttribute("data-state", "visible");
  });

  it("should reveal on scroll then hide after the delay in scroll mode", () => {
    vi.useFakeTimers();
    simulerDebordement();
    render(
      <ScrollArea visibility="scroll" hideDelay={500}>
        Contenu
      </ScrollArea>,
    );
    expect(barres()[0]).toHaveAttribute("data-state", "hidden");

    act(() => {
      screen.getByText("Contenu").dispatchEvent(new Event("scroll"));
    });
    expect(barres()[0]).toHaveAttribute("data-state", "visible");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(barres()[0]).toHaveAttribute("data-state", "hidden");
  });

  it("should not reveal on scroll in hover mode", () => {
    simulerDebordement();
    render(<ScrollArea visibility="hover">Contenu</ScrollArea>);
    act(() => {
      screen.getByText("Contenu").dispatchEvent(new Event("scroll"));
    });
    expect(barres()[0]).toHaveAttribute("data-state", "hidden");
  });

  it("should hide the scrollbars from assistive technology", () => {
    simulerDebordement();
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(barres()[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("should apply maxHeight and maxWidth to the root", () => {
    const { container } = render(
      <ScrollArea maxHeight={320} maxWidth="40rem">
        Contenu
      </ScrollArea>,
    );
    expect(container.firstChild).toHaveStyle({
      maxHeight: "320px",
      maxWidth: "40rem",
    });
  });

  it("should not be focusable by default", () => {
    render(<ScrollArea>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).not.toHaveAttribute("tabindex");
  });

  it("should be focusable when isFocusable is set", () => {
    render(<ScrollArea isFocusable>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toHaveAttribute("tabindex", "0");
  });

  it("should expose a role and an accessible name when given", () => {
    render(
      <ScrollArea role="log" aria-label="Main courante">
        Contenu
      </ScrollArea>,
    );
    expect(screen.getByRole("log", { name: "Main courante" })).toBeInTheDocument();
  });

  it("should add the overflow shadows only when asked", () => {
    const { rerender } = render(<ScrollArea>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).not.toHaveClass("shadows");
    rerender(<ScrollArea hasOverflowShadows>Contenu</ScrollArea>);
    expect(screen.getByText("Contenu")).toHaveClass("shadows");
  });

  it("should merge className and style on the root", () => {
    const { container } = render(
      <ScrollArea className="mien" style={{ padding: "8px" }}>
        Contenu
      </ScrollArea>,
    );
    expect(container.firstChild).toHaveClass("mien");
    expect(container.firstChild).toHaveStyle({ padding: "8px" });
  });
});
