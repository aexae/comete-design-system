// Tests unitaires du composant Spinner
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  describe("rendu de base", () => {
    it("should have displayName set to Spinner", () => {
      expect(Spinner.displayName).toBe("Spinner");
    });

    it("should render a status with a default label", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Chargement");
    });

    it("should render an svg hidden from assistive technologies", () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("should apply medium size without color class by default", () => {
      render(<Spinner />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("spinner", "medium");
      expect(el).not.toHaveClass("inverted");
    });
  });

  describe("comète", () => {
    const animated = (container: HTMLElement) => ({
      shape: container.querySelector("g.comet > path > animate"),
      rotation: container.querySelector("g.comet > animateTransform"),
    });
    const list = (el: Element | null, attr: string) => el?.getAttribute(attr)?.split(";") ?? [];

    it("should draw a true circle head with an animated tail and rotation", () => {
      const { container } = render(<Spinner />);
      const { shape, rotation } = animated(container);
      expect(container.querySelector("g.comet > circle")).toBeInTheDocument();
      expect(shape).toHaveAttribute("attributeName", "d");
      expect(rotation).toHaveAttribute("type", "rotate");
    });

    it("should share one timeline between outline and rotation", () => {
      const { container } = render(<Spinner />);
      const { shape, rotation } = animated(container);
      expect(shape?.getAttribute("dur")).toBe(rotation?.getAttribute("dur"));
      expect(list(shape, "keyTimes")).toEqual(list(rotation, "keyTimes"));
      expect(list(shape, "values")).toHaveLength(list(shape, "keyTimes").length);
      expect(list(rotation, "values")).toHaveLength(list(shape, "keyTimes").length);
    });

    it("should morph between outlines with the same structure", () => {
      const { container } = render(<Spinner />);
      const counts = list(animated(container).shape, "values").map((d) => d.split("L").length);
      expect(counts.length).toBeGreaterThan(2);
      expect(new Set(counts).size).toBe(1);
    });

    it("should end the cycle on a pause matching the first pose", () => {
      const { container } = render(<Spinner />);
      const values = list(animated(container).shape, "values");
      const keyTimes = list(animated(container).shape, "keyTimes").map(Number);
      expect(values[0]).toBe(values[values.length - 1]);
      expect(values[values.length - 2]).toBe(values[values.length - 1]);
      expect(keyTimes[keyTimes.length - 2]).toBeLessThan(1);
    });

    it("should keep the head outline continuous across frames", () => {
      const { container } = render(<Spinner />);
      // Les derniers points du contour décrivent la calotte de la tête, fixe dans le
      // repère de la comète : elle ne doit jamais bondir d'une image à l'autre.
      const HEAD_CAP_POINTS = 7;
      const frames = list(animated(container).shape, "values").map((d) =>
        d
          .replace(/[MZ]/g, "")
          .split("L")
          .slice(-HEAD_CAP_POINTS)
          .map((p) => p.split(" ").map(Number))
      );
      let maxJump = 0;
      for (let f = 1; f < frames.length; f++) {
        frames[f]?.forEach(([x = 0, y = 0], i) => {
          const [px = 0, py = 0] = frames[f - 1]?.[i] ?? [];
          maxJump = Math.max(maxJump, Math.hypot(x - px, y - py));
        });
      }
      expect(maxJump).toBeLessThan(3);
    });

    it("should provide a static comet for reduced motion", () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector("g.cometStatic > circle")).toBeInTheDocument();
      expect(container.querySelector("g.cometStatic > path")).toBeInTheDocument();
    });
  });

  describe("prop size", () => {
    it.each(["xsmall", "small", "medium", "large", "xlarge", "fill"] as const)(
      "should apply %s class when size is %s",
      (size) => {
        render(<Spinner size={size} />);
        expect(screen.getByRole("status")).toHaveClass(size);
      }
    );
  });

  describe("prop appearance", () => {
    it("should fill with the logo gradient when appearance is comete", () => {
      const { container } = render(<Spinner appearance="comete" />);
      const gradient = container.querySelector("linearGradient");
      expect(gradient).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveAttribute("fill", `url(#${gradient?.id})`);
    });

    it("should fill with currentColor by default", () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor");
      expect(container.querySelector("linearGradient")).not.toBeInTheDocument();
    });

    it("should apply inverted class when appearance is inverted", () => {
      render(<Spinner appearance="inverted" />);
      expect(screen.getByRole("status")).toHaveClass("inverted");
    });
  });

  describe("accessibilité", () => {
    it("should use the provided aria-label when aria-label is set", () => {
      render(<Spinner aria-label="Envoi en cours" />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Envoi en cours");
    });

    it("should be hidden without status role when decorative", () => {
      const { container } = render(<Spinner decorative />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("props className et style", () => {
    it("should merge className and style when provided", () => {
      render(<Spinner className="custom" style={{ margin: 4 }} />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("spinner", "custom");
      expect(el).toHaveStyle({ margin: "4px" });
    });
  });
});
