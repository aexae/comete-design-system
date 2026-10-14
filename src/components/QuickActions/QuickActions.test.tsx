// Tests unitaires de QuickActions (menu d'actions rapides du FAB)
import { readFileSync } from "node:fs";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import { BottomNav } from "../BottomNav/BottomNav";
import { BottomNavItem } from "../BottomNav/BottomNavItem";
import { QuickActions, type QuickAction } from "./QuickActions";

const ACTIONS: QuickAction[] = [
  { id: "report", icon: "Report", label: "Signaler une anomalie", tone: "critical", onPress: vi.fn() },
  { id: "scan", icon: "Scanner", label: "Scanner un équipement", onPress: vi.fn() },
];

/** FAB (déclencheur) + QuickActions, comme dans l'app. */
function Harness({ actions = ACTIONS }: { actions?: QuickAction[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BottomNav>
        <BottomNavItem label="Accueil" icon="Home" />
        <BottomNavItem label="Ma fiche" icon="Assignment" />
        <BottomNav.Action
          icon="Add"
          aria-label="Actions rapides"
          isOpen={open}
          onPress={() => setOpen((o) => !o)}
        />
        <BottomNavItem label="Planning" icon="CalendarMonth" />
        <BottomNavItem label="MCE" icon="FormEdit" />
      </BottomNav>
      <QuickActions actions={actions} isOpen={open} onOpenChange={setOpen} />
    </>
  );
}

const trigger = () => screen.getByRole("button", { name: "Actions rapides", hidden: true });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuickActions — comportement", () => {
  it("should trap the focus inside the layer when opened, and close on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(trigger());
    const dialog = await screen.findByRole("dialog", { name: "Actions rapides" });
    // Le focus est dans la couche (piège de focus), pas resté sur le déclencheur.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    // Tab ne sort pas de la couche.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("should give the focus back to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const fab = trigger();
    await user.click(fab);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(fab));
  });

  it("should expose aria-expanded on the trigger while open", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(trigger()).not.toHaveAttribute("aria-expanded");
    await user.click(trigger());
    await screen.findByRole("dialog");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("should run the action then close the layer", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Harness actions={[{ ...ACTIONS[0]!, onPress }, ACTIONS[1]!]} />);
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Signaler une anomalie" }));
    expect(onPress).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("should use « Actions rapides » as the default accessible name", async () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    expect(await screen.findByRole("dialog", { name: "Actions rapides" })).toBeInTheDocument();
  });

  it("should have no « Fermer » button and no description line (label only)", () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
    // Une rangée = un libellé + une pastille d'icône, rien d'autre.
    const row = screen.getByRole("button", { name: "Scanner un équipement" });
    expect(row.children).toHaveLength(2);
    expect(row.textContent).toBe("Scanner un équipement");
  });
});

describe("QuickActions — règle de couleur (ADR 0002)", () => {
  // Les CSS Modules sont inertes en jsdom : on garde la règle sur le source CSS, et le
  // ton dans le DOM.
  const css = readFileSync("src/components/QuickActions/QuickActions.module.css", "utf8")
    // Les commentaires citent volontairement les tokens : on les ignore.
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({
    sel: (sel ?? "").trim(),
    body: body ?? "",
  }));

  it("should expose the tone on the icon tile (data-tone), « comete » when omitted", () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    const critical = screen.getByRole("button", { name: "Signaler une anomalie" });
    const normal = screen.getByRole("button", { name: "Scanner un équipement" });
    expect(critical.querySelector("[data-tone]")).toHaveAttribute("data-tone", "critical");
    expect(normal.querySelector("[data-tone]")).toHaveAttribute("data-tone", "comete");
  });

  it("should give a critical tone --text-critical on its icon", () => {
    const glyph = rules.find((r) => /\[data-tone="critical"\]\s+\.glyph/.test(r.sel));
    expect(glyph?.body).toMatch(/color:\s*var\(--text-critical\)/);
    const tile = rules.find((r) => /^\.tile\[data-tone="critical"\]$/.test(r.sel));
    expect(tile?.body).toMatch(/background-color:\s*var\(--background-critical-/);
  });

  it("should NEVER colour the row: neutral surface, no critical/brand token on .row", () => {
    const rowRules = rules.filter((r) => /^\.row(\[|$|:)/.test(r.sel));
    expect(rowRules.length).toBeGreaterThan(0);
    for (const r of rowRules) {
      expect(r.body).not.toMatch(/critical|comete|brand|success|warning|information|accent/);
    }
    const base = rules.find((r) => r.sel === ".row");
    expect(base?.body).toMatch(/background-color:\s*var\(--background-surface-default\)/);
  });

  it("should define the five semantic tones, and only those (no tone per action)", () => {
    const tones = new Set([...css.matchAll(/\[data-tone="([^"]+)"\]/g)].map((m) => m[1]));
    expect([...tones].sort()).toEqual(["comete", "critical", "information", "success", "warning"]);
  });

  it("should accept the whole palette at the type level (no restriction)", () => {
    const palette: QuickAction["tone"][] = ["comete", "critical", "warning", "success", "information"];
    expect(palette).toHaveLength(5);
  });
});

describe("QuickActions — garde-fou de composition (avertissement, jamais de blocage)", () => {
  const make = (tones: (QuickAction["tone"])[]): QuickAction[] =>
    tones.map((tone, i) => ({
      id: String(i),
      icon: "Star",
      label: `Action ${i + 1}`,
      tone,
      onPress: () => undefined,
    }));

  it("should warn when a menu uses more than two distinct tones, explaining why", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions
        actions={make(["comete", "warning", "success"])}
        isOpen
        onOpenChange={() => undefined}
      />,
    );
    expect(warn).toHaveBeenCalledOnce();
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toMatch(/3 tons distincts/);
    expect(message).toContain("La couleur porte la nature de l'action, pas son identité.");
    expect(message).toContain("Au-delà de deux tons dans un même menu");
  });

  it("should still render every action when it warns (warn, never break)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions
        actions={make(["comete", "warning", "success", "information"])}
        isOpen
        onOpenChange={() => undefined}
      />,
    );
    // Seules les rangées comptent (la couche ajoute aussi un bouton de fermeture masqué).
    expect(screen.getAllByRole("button", { name: /^Action \d$/ })).toHaveLength(4);
  });

  it("should not warn with two distinct tones", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions
        actions={make(["comete", "comete", "critical"])}
        isOpen
        onOpenChange={() => undefined}
      />,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("should warn when more than one action is critical", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions actions={make(["critical", "critical"])} isOpen onOpenChange={() => undefined} />,
    );
    expect(warn).toHaveBeenCalledOnce();
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toMatch(/2 actions portent le ton "critical"/);
    expect(message).toContain("Au-delà de deux tons dans un même menu");
  });

  it("should not warn with a single critical action", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<QuickActions actions={make(["critical", undefined])} isOpen onOpenChange={() => undefined} />);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("QuickActions — plafond", () => {
  it("should warn in development beyond five actions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const six: QuickAction[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      icon: "Star",
      label: `Action ${i + 1}`,
      onPress: () => undefined,
    }));
    render(<QuickActions actions={six} isOpen onOpenChange={() => undefined} />);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/6 actions/);
  });

  it("should not warn up to five actions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const five: QuickAction[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      icon: "Star",
      label: `Action ${i + 1}`,
      onPress: () => undefined,
    }));
    render(<QuickActions actions={five} isOpen onOpenChange={() => undefined} />);
    expect(warn).not.toHaveBeenCalled();
  });
});
