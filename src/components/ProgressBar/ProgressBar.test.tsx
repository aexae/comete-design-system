import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("should render with default props", () => {
    render(<ProgressBar />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeDefined();
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("should display the label by default", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByText(/42/)).toBeDefined();
  });

  it("should hide the label when showLabel is false", () => {
    const { container } = render(<ProgressBar value={50} showLabel={false} />);
    expect(container.querySelector(`.label`)).toBeNull();
  });

  it("should clamp value below 0 to 0", () => {
    render(<ProgressBar value={-10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(screen.getByText(/0/)).toBeDefined();
  });

  it("should clamp value above 100 to 100", () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getByText(/100/)).toBeDefined();
  });

  it("should round fractional values", () => {
    render(<ProgressBar value={33.7} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("34");
  });

  it("should set fill width to match value", () => {
    const { container } = render(<ProgressBar value={60} />);
    const fill = container.querySelector(`.fill`) as HTMLElement;
    expect(fill.style.width).toBe("60%");
  });

  it("should apply custom className", () => {
    const { container } = render(<ProgressBar className="custom" />);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });

  it("should apply custom aria-label", () => {
    render(<ProgressBar value={75} aria-label="Chargement en cours" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-label")).toBe("Chargement en cours");
  });

  it("should apply root class", () => {
    const { container } = render(<ProgressBar />);
    expect(container.firstElementChild?.classList.contains("root")).toBe(true);
  });

  it("should apply track class", () => {
    const { container } = render(<ProgressBar />);
    expect(container.querySelector(`.track`)).not.toBeNull();
  });

  // -----------------------------------------------------------------------
  // Auto appearance

  it("should apply critical appearance when value <= 20 (auto)", () => {
    const { container } = render(<ProgressBar value={15} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("critical")).toBe(true);
  });

  it("should apply critical appearance at exactly 20 (auto)", () => {
    const { container } = render(<ProgressBar value={20} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("critical")).toBe(true);
  });

  it("should apply warning appearance between 21 and 99 (auto)", () => {
    const { container } = render(<ProgressBar value={50} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("warning")).toBe(true);
  });

  it("should apply warning appearance at 21 (auto)", () => {
    const { container } = render(<ProgressBar value={21} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("warning")).toBe(true);
  });

  it("should apply warning appearance at 69 (auto)", () => {
    const { container } = render(<ProgressBar value={69} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("warning")).toBe(true);
  });

  it("should apply information appearance at 70 (auto)", () => {
    const { container } = render(<ProgressBar value={70} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("information")).toBe(true);
  });

  it("should apply information appearance at 99 (auto)", () => {
    const { container } = render(<ProgressBar value={99} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("information")).toBe(true);
  });

  it("should apply success appearance at 100 (auto)", () => {
    const { container } = render(<ProgressBar value={100} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("success")).toBe(true);
  });

  it("should apply critical appearance at 0 (auto)", () => {
    const { container } = render(<ProgressBar value={0} />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("critical")).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Manual appearance override

  it("should allow forcing brand appearance", () => {
    const { container } = render(<ProgressBar value={10} appearance="brand" />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("brand")).toBe(true);
  });

  it("should allow forcing success appearance on low value", () => {
    const { container } = render(<ProgressBar value={5} appearance="success" />);
    const fill = container.querySelector(`.fill`);
    expect(fill?.classList.contains("success")).toBe(true);
  });
});
