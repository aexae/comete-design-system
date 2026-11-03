// Tests unitaires de TimeCalendar — zone défilante
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Time } from "@internationalized/date";
import { TimeCalendar } from "./TimeCalendar";

describe("TimeCalendar — zone défilante", () => {
  const css = readFileSync("src/components/Calendar/TimeCalendar.module.css", "utf8")
    // Les commentaires citent volontairement l'ancienne couche.
    .replace(/\/\*[\s\S]*?\*\//g, "");

  it("should wrap the listbox in a ScrollArea rather than scrolling it", () => {
    render(<TimeCalendar value={new Time(14, 30)} />);
    const liste = screen.getByRole("listbox", { name: "Sélecteur d'heure" });
    // La zone défilante ENVELOPPE la liste : le rôle et le nom accessible
    // restent sur la liste, l'ascenseur va sur la zone.
    const viewport = liste.closest(".viewport");
    expect(viewport).not.toBeNull();
    expect(viewport).toHaveClass("shadows");
    expect(viewport?.parentElement).toHaveClass("root");
  });

  it("should keep the height cap on the scroll area, not on the list", () => {
    // Posé sur la liste, le plafond la ferait déborder de la zone au lieu de
    // la faire défiler.
    expect(css).toMatch(/\.scroll\s*\{[^}]*max-height/);
    expect(css).not.toMatch(/\.timeCalendar\s*\{[^}]*max-height/);
  });

  it("should draw no scrollbar of its own", () => {
    expect(css).not.toMatch(/scrollbar/);
    expect(css).not.toMatch(/overflow-y/);
  });
});
