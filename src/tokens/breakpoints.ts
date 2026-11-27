// breakpoints — Comète Design System
// Source unique des breakpoints responsives du DS (largeur en px).
//
// ⚠️ Une condition CSS `@container` / `@media` NE PEUT PAS lire une constante
// JS ni un `var(--token)`. Les CSS Modules qui déclenchent du responsive
// (Grid = media queries viewport ; Table = container queries) DOIVENT donc
// refléter ces valeurs « en dur ». Le test `breakpoints.test.ts` garantit que
// ces fichiers CSS restent synchronisés avec cette source (garde anti-drift).

/**
 * Échelle de breakpoints du DS (largeur en px, borne basse de chaque plage).
 * Croissante. Miroir des tokens `--breakpoint-*` de
 * `@aexae/comete-design-tokens` (>= 0.49.0).
 *
 * - `watch` (0) — montres connectées.
 * - `mobile` (280) — téléphones, écran externe des pliants compris.
 * - `tablet` (600) — tablettes : seuil `tablet` de `Grid`, `Table hideBelow="tablet"`.
 *   En dessous : `Page.Bar` compacte, `Button collapseLabel` en icône seule et,
 *   dans l'application, `BottomNav` au lieu de la `SideNav`.
 * - `laptop` (1200) — ordinateurs portables : seuil `laptop` de `Grid`,
 *   `Table hideBelow="laptop"`, `SideNav` persistante sur le web, gouttière
 *   large de `Page`.
 * - `desktop` (1536) — début du desktop. Aucun usage DS pour l'instant.
 * - `tv` (1920) — démos et présentations (TV, vidéoprojecteurs). Aucun usage DS
 *   pour l'instant ; attention, un moniteur de bureau en 1920 l'atteint aussi.
 */
export const BREAKPOINTS = {
  watch: 0,
  mobile: 280,
  tablet: 600,
  laptop: 1200,
  desktop: 1536,
  tv: 1920,
} as const;

/** Nom d'un breakpoint de l'échelle (`"watch" | "mobile" | "tablet" | "laptop" | "desktop" | "tv"`). */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Media query « à partir de » un breakpoint, ex. `breakpointUp("tablet")` →
 * `"(min-width: 600px)"`. À passer à `window.matchMedia` pour brancher un
 * comportement d'application (navigation, mise en page) sur l'échelle du DS
 * sans recopier de valeur : il suit tout changement de `BREAKPOINTS`.
 *
 * ```ts
 * const sideNav = window.matchMedia(breakpointUp("tablet")).matches; // application
 * ```
 */
export function breakpointUp(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}

/**
 * Media query « sous » un breakpoint (exclu), ex. `breakpointDown("tablet")` →
 * `"(max-width: 599px)"`. Complément exact de {@link breakpointUp}.
 */
export function breakpointDown(breakpoint: Breakpoint): string {
  return `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`;
}
