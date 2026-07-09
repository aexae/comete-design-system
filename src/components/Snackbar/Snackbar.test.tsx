// Tests unitaires pour le composant Snackbar
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Snackbar } from "./Snackbar";

describe("Snackbar", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render the message", () => {
    render(<Snackbar>Sauvegarde effectuée.</Snackbar>);
    expect(screen.getByText("Sauvegarde effectuée.")).toBeInTheDocument();
  });

  it("should default appearance to 'information'", () => {
    const { container } = render(<Snackbar>msg</Snackbar>);
    expect(container.firstChild).toHaveClass("information");
  });

  it("should apply the appearance class", () => {
    const { container } = render(
      <Snackbar appearance="critical">msg</Snackbar>,
    );
    expect(container.firstChild).toHaveClass("critical");
  });

  it("should default role to 'status'", () => {
    render(<Snackbar>msg</Snackbar>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should allow role='alert'", () => {
    render(<Snackbar role="alert">msg</Snackbar>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // Icône contextuelle
  // -------------------------------------------------------------------

  it("should render a contextual icon by default", () => {
    const { container } = render(<Snackbar appearance="success">msg</Snackbar>);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  // -------------------------------------------------------------------
  // Action
  // -------------------------------------------------------------------

  it("should NOT render an action button when action is omitted", () => {
    render(<Snackbar>msg</Snackbar>);
    expect(screen.queryByRole("button", { name: "Action" })).not.toBeInTheDocument();
  });

  it("should render the action button and call onPress when clicked", () => {
    const onPress = vi.fn();
    render(
      <Snackbar action={{ label: "Réessayer", onPress }}>msg</Snackbar>,
    );
    const btn = screen.getByRole("button", { name: "Réessayer" });
    fireEvent.click(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------
  // Close
  // -------------------------------------------------------------------

  it("should NOT render a close button when onClose is omitted", () => {
    render(<Snackbar>msg</Snackbar>);
    expect(screen.queryByRole("button", { name: "Fermer" })).not.toBeInTheDocument();
  });

  it("should render a close button and call onClose when clicked", () => {
    const onClose = vi.fn();
    render(<Snackbar onClose={onClose}>msg</Snackbar>);
    const btn = screen.getByRole("button", { name: "Fermer" });
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should use a custom closeLabel", () => {
    render(
      <Snackbar onClose={() => undefined} closeLabel="Dismiss">
        msg
      </Snackbar>,
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // Action + Close ensemble
  // -------------------------------------------------------------------

  it("should render both action and close buttons together", () => {
    render(
      <Snackbar
        action={{ label: "Annuler", onPress: () => undefined }}
        onClose={() => undefined}
      >
        msg
      </Snackbar>,
    );
    expect(screen.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });
});
