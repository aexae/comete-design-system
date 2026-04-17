// Tests unitaires du composant Skeleton
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("rendu de base", () => {
    it("should render as a div", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild?.tagName).toBe("DIV");
    });

    it("should have displayName set to Skeleton", () => {
      expect(Skeleton.displayName).toBe("Skeleton");
    });

    it("should have role status by default", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild).toHaveAttribute("role", "status");
    });

    it("should have aria-busy true", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-live polite", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild).toHaveAttribute("aria-live", "polite");
    });

    it("should have a default aria-label", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild).toHaveAttribute("aria-label", "Chargement…");
    });

    it("should override aria-label when aria-label prop is provided", () => {
      const { container } = render(<Skeleton aria-label="Chargement de l'avatar" />);
      expect(container.firstElementChild).toHaveAttribute(
        "aria-label",
        "Chargement de l'avatar"
      );
    });
  });

  describe("classes CSS par défaut", () => {
    it("should apply skeleton and rectangle classes when no props given", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstElementChild).toHaveClass("skeleton", "rectangle");
    });
  });

  describe("shape", () => {
    it("should apply rectangle class for shape rectangle", () => {
      const { container } = render(<Skeleton shape="rectangle" />);
      expect(container.firstElementChild).toHaveClass("rectangle");
    });

    it("should apply circle class for shape circle", () => {
      const { container } = render(<Skeleton shape="circle" />);
      expect(container.firstElementChild).toHaveClass("circle");
    });

    it("should force width to height when shape is circle", () => {
      const { container } = render(<Skeleton shape="circle" width={300} height={48} />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.width).toBe("48px");
      expect(el.style.height).toBe("48px");
    });
  });

  describe("dimensions", () => {
    it("should apply numeric width as px", () => {
      const { container } = render(<Skeleton width={240} />);
      expect((container.firstElementChild as HTMLElement).style.width).toBe("240px");
    });

    it("should apply string width as-is", () => {
      const { container } = render(<Skeleton width="50%" />);
      expect((container.firstElementChild as HTMLElement).style.width).toBe("50%");
    });

    it("should apply numeric height as px", () => {
      const { container } = render(<Skeleton height={32} />);
      expect((container.firstElementChild as HTMLElement).style.height).toBe("32px");
    });

    it("should default width to 100% and height to 20px", () => {
      const { container } = render(<Skeleton />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.width).toBe("100%");
      expect(el.style.height).toBe("20px");
    });
  });

  describe("radius", () => {
    it("should apply numeric radius as px on rectangle", () => {
      const { container } = render(<Skeleton radius={8} />);
      expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe("8px");
    });

    it("should apply string radius as-is on rectangle", () => {
      const { container } = render(<Skeleton radius="50%" />);
      expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe("50%");
    });

    it("should NOT apply custom radius on circle (uses round token)", () => {
      const { container } = render(<Skeleton shape="circle" radius={4} />);
      expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe("");
    });
  });

  describe("className", () => {
    it("should append custom className", () => {
      const { container } = render(<Skeleton className="custom" />);
      expect(container.firstElementChild).toHaveClass("custom");
    });
  });
});
