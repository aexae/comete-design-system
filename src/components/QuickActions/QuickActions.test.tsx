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
  {
    id: "report",
    icon: "Report",
    label: "Signaler une anomalie",
    tone: "critical",
    onPress: vi.fn(),
  },
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

  it("should put the icon tile before the label (icon on the left, label on the right)", () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    const row = screen.getByRole("button", { name: "Scanner un équipement" });
    const [first, second] = Array.from(row.children);
    // La pastille (décorative) précède le libellé : l'ordre du DOM suit l'ordre visuel.
    expect(first?.getAttribute("aria-hidden")).toBe("true");
    expect(second?.textContent).toBe("Scanner un équipement");
  });
});

describe("QuickActions — règle de couleur (ADR 0002)", () => {
  // La pastille est un `IconTile` : son ton se lit sur les classes du DOM rendu
  // (`classNameStrategy: "non-scoped"` en test). La neutralité de la rangée, elle, reste
  // une règle de feuille de style : on la vérifie sur le source CSS.
  const css = readFileSync("src/components/QuickActions/QuickActions.module.css", "utf8")
    // Les commentaires citent volontairement les tokens : on les ignore.
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({
    sel: (sel ?? "").trim(),
    body: body ?? "",
  }));

  /** La pastille : premier enfant de la rangée (décoratif), avant le libellé. */
  const tileOf = (label: string): HTMLElement =>
    screen.getByRole("button", { name: label }).firstElementChild as HTMLElement;

  it("should carry the tone as an IconTile appearance, « comete » when omitted", () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    expect(tileOf("Signaler une anomalie").className).toContain("critical");
    expect(tileOf("Scanner un équipement").className).toContain("comete");
  });

  it("should render a critical action as an IconTile critical, circle, medium", () => {
    render(<QuickActions actions={ACTIONS} isOpen onOpenChange={() => undefined} />);
    const tile = tileOf("Signaler une anomalie");
    expect(tile.className).toContain("iconTile");
    expect(tile.className).toContain("critical");
    expect(tile.className).toContain("circle");
    expect(tile.className).toContain("medium");
    // Décorative : c'est la rangée qui porte le nom accessible.
    expect(tile.getAttribute("aria-hidden")).toBe("true");
  });

  it("should draw no tile of its own (the DS component is the only one)", () => {
    expect(css).not.toMatch(/\.tile\b/);
    expect(css).not.toMatch(/\.glyph\b/);
    expect(css).not.toMatch(/data-tone/);
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

  it("should map each of the five semantic tones onto its IconTile appearance", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const tones = ["comete", "critical", "warning", "success", "information"] as const;
    render(
      <QuickActions
        actions={tones.map((tone) => ({
          id: tone,
          icon: "Star" as const,
          label: tone,
          tone,
          onPress: () => undefined,
        }))}
        isOpen
        onOpenChange={() => undefined}
      />
    );
    for (const tone of tones) {
      expect(tileOf(tone).className).toContain(tone);
    }
  });

  it("should accept the whole palette at the type level (no restriction)", () => {
    const palette: QuickAction["tone"][] = [
      "comete",
      "critical",
      "warning",
      "success",
      "information",
    ];
    expect(palette).toHaveLength(5);
  });
});

describe("QuickActions — garde-fou de composition (avertissement, jamais de blocage)", () => {
  const make = (tones: QuickAction["tone"][]): QuickAction[] =>
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
      />
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
      />
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
      />
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("should warn when more than one action is critical", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions
        actions={make(["critical", "critical"])}
        isOpen
        onOpenChange={() => undefined}
      />
    );
    expect(warn).toHaveBeenCalledOnce();
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toMatch(/2 actions portent le ton "critical"/);
    expect(message).toContain("Au-delà de deux tons dans un même menu");
  });

  it("should not warn with a single critical action", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <QuickActions actions={make(["critical", undefined])} isOpen onOpenChange={() => undefined} />
    );
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
