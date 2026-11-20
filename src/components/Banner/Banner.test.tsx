// Tests unitaires pour le composant Banner
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Banner } from "./Banner";

describe("Banner", () => {
  // Rendu de base --------------------------------------------------------

  it("should render a div with role='alert'", () => {
    render(<Banner appearance="warning">Message</Banner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(<Banner appearance="warning">Contenu du banner</Banner>);
    expect(screen.getByText("Contenu du banner")).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <Banner appearance="critical">
        <span>Erreur critique</span>
        <button>Réessayer</button>
      </Banner>
    );
    expect(screen.getByText("Erreur critique")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });

  // Apparences -----------------------------------------------------------

  it("should apply warning class for appearance='warning'", () => {
    render(<Banner appearance="warning">Message</Banner>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("banner");
    expect(el.className).toContain("warning");
  });

  it("should apply critical class for appearance='critical'", () => {
    render(<Banner appearance="critical">Message</Banner>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("banner");
    expect(el.className).toContain("critical");
  });

  it("should not apply critical class when appearance is warning", () => {
    render(<Banner appearance="warning">Message</Banner>);
    expect(screen.getByRole("alert").className).not.toContain("critical");
  });

  it("should not apply warning class when appearance is critical", () => {
    render(<Banner appearance="critical">Message</Banner>);
    expect(screen.getByRole("alert").className).not.toContain("warning");
  });

  it.each(["success", "information", "announcement", "discovery"] as const)(
    "should apply the %s class for that appearance",
    (appearance) => {
      render(<Banner appearance={appearance}>Message</Banner>);
      expect(screen.getByRole("alert").className).toContain(appearance);
    }
  );

  // Structure interne ----------------------------------------------------

  it("should render a content area with children inside", () => {
    const { container } = render(<Banner appearance="warning">Texte</Banner>);
    const content = container.querySelector(`.content`);
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toBe("Texte");
  });

  it("should render the Warning icon", () => {
    const { container } = render(<Banner appearance="warning">Message</Banner>);
    // L'icône Warning est un SVG rendu par @aexae/comete-icons
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should wrap the icon in an iconSlot", () => {
    const { container } = render(<Banner appearance="critical">Message</Banner>);
    expect(container.querySelector(".iconSlot svg")).toBeInTheDocument();
  });

  // Tokens de composant --------------------------------------------------

  it.each(["warning", "critical", "announcement", "success", "information", "discovery"] as const)(
    "should read the banner component tokens for appearance='%s'",
    (appearance) => {
      const css = readFileSync("src/components/Banner/Banner.module.css", "utf8");
      const rule = css.match(new RegExp(`\\.${appearance} \\{([^}]*)\\}`))?.[1] ?? "";
      expect(rule).toContain(`var(--banner-color-${appearance}-background)`);
      expect(rule).toContain(`var(--banner-color-${appearance}-text)`);
      expect(rule).toContain(`var(--banner-color-${appearance}-icon)`);
    }
  );

  it("should size the icon with the banner icon token", () => {
    const css = readFileSync("src/components/Banner/Banner.module.css", "utf8");
    expect(css).toContain("width: var(--banner-size-icon)");
    expect(css).toContain("height: var(--banner-size-icon)");
  });

  it("should render the content in medium weight", () => {
    const css = readFileSync("src/components/Banner/Banner.module.css", "utf8");
    const rule = css.match(/\.content \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("var(--font-weight-medium)");
  });
});
