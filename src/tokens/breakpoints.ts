// breakpoints — Comète Design System
// Source unique des breakpoints responsives du DS (largeur en px).
//
// ⚠️ Une condition CSS `@container` / `@media` NE PEUT PAS lire une constante
// JS ni un `var(--token)`. Les CSS Modules qui déclenchent du responsive
// (Grid = media queries viewport ; Table = container queries) DOIVENT donc
// refléter ces valeurs « en dur ». Le test `breakpoints.test.ts` garantit que
// ces fichiers CSS restent synchronisés avec cette source (garde anti-drift).

/**
 * Échelle de breakpoints du DS (largeur en px). Croissante.
 *
 * - `sm` (600) — bascule tablette ; c'est aussi le seuil `tablet` de `Grid`.
 * - `md` (900) — palier intermédiaire (masquage des colonnes de confort des
 *   tables via `hideBelow`).
 * - `lg` (1200) — bascule desktop ; c'est aussi le seuil `desktop` de `Grid`.
 *
 * `Grid` (media queries viewport) n'utilise que `sm` et `lg` ; `Table`
 * (`hideBelow`, container queries) utilise les trois.
 */
export const BREAKPOINTS = {
  sm: 600,
  md: 900,
  lg: 1200,
} as const;

/** Nom d'un breakpoint de l'échelle (`"sm" | "md" | "lg"`). */
export type Breakpoint = keyof typeof BREAKPOINTS;
