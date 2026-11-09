// Labeled — helper partagé pour les stories qui rendent plusieurs instances
// d'un composant (« All variants », « All sizes », matrices d'états…).
// Affiche un libellé discret sous chaque instance, identique au pattern
// de la story Button / Icon only — All variants.
// Fichier non-story (glob = *.stories.@(ts|tsx)).
import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface LabeledProps {
  /** Libellé affiché sous l'instance (nom de variante, taille, état…). */
  label: ReactNode;
  children: ReactNode;
  /** Alignement horizontal de l'instance et du libellé (défaut : `center`). */
  align?: "center" | "flex-start" | "stretch";
  /** Styles additionnels du conteneur (ex. largeur fixe pour une grille). */
  style?: CSSProperties;
}

/** Une instance + son libellé, empilés verticalement. */
export function Labeled({ label, children, align = "center", style }: LabeledProps): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: align, ...style }}>
      {children}
      <Legend>{label}</Legend>
    </div>
  );
}

export interface LabeledRowProps {
  children: ReactNode;
  /** Espace entre les instances (défaut : 24, comme la story Button). */
  gap?: number;
  /** Alignement vertical des instances (défaut : `flex-end`). */
  align?: CSSProperties["alignItems"];
  /** Styles additionnels du conteneur. */
  style?: CSSProperties;
}

/** Rangée horizontale (wrap) de `Labeled`. */
export function LabeledRow({
  children,
  gap = 24,
  align = "flex-end",
  style,
}: LabeledRowProps): ReactElement {
  return (
    <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: align, ...style }}>
      {children}
    </div>
  );
}

export interface LegendProps {
  children: ReactNode;
  /** Styles additionnels (ex. largeur fixe pour un en-tête de ligne). */
  style?: CSSProperties;
}

/** Libellé seul, même style que celui de `Labeled` : pour les en-têtes de
 *  lignes / colonnes d'une grille de variantes, quand l'instance ne peut pas
 *  être enveloppée. */
export function Legend({ children, style }: LegendProps): ReactElement {
  return <span style={{ fontSize: 12, color: "var(--text-subtle)", ...style }}>{children}</span>;
}
