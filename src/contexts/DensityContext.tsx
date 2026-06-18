// DensityContext — Comète Design System
// Propage la densité (compact / default / touch) aux contrôles enfants
// (Button, champs). Permet de régler la densité une seule fois pour une
// zone — typiquement `touch` pour un shell mobile — tout en laissant
// chaque composant override localement via sa prop `density`.
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------
// Types publics

/**
 * Densité d'un contrôle interactif.
 * - `compact` — hauteur 24 px, radius 4 px, icône 20 px (desktop dense)
 * - `default` — hauteur 32 px, radius 6 px, icône 24 px (desktop standard)
 * - `touch`   — hauteur 48 px, radius 8 px, icône 24 px (mobile / cible tactile)
 */
export type Density = "compact" | "default" | "touch";

// -----------------------------------------------------------------------
// Context

const DensityContext = createContext<Density | null>(null);

// -----------------------------------------------------------------------
// Provider

export interface DensityProviderProps {
  /** Densité appliquée à tous les contrôles descendants. */
  density: Density;
  children: ReactNode;
}

/**
 * DensityProvider — Comète Design System
 *
 * Définit la densité par défaut des contrôles descendants (Button, champs).
 * Une prop `density` passée explicitement sur un composant prime toujours
 * sur la valeur du contexte (opt-out local).
 *
 * ```tsx
 * // Shell mobile : tout passe en cible tactile (48 px)
 * <DensityProvider density="touch">
 *   <App />
 * </DensityProvider>
 * ```
 */
export function DensityProvider({ density, children }: DensityProviderProps) {
  return (
    <DensityContext.Provider value={density}>
      {children}
    </DensityContext.Provider>
  );
}

DensityProvider.displayName = "DensityProvider";

// -----------------------------------------------------------------------
// Hook

/**
 * useDensity — Comète Design System
 *
 * Résout la densité effective d'un contrôle selon la priorité :
 * prop explicite → contexte `DensityProvider` → `"default"`.
 *
 * ```tsx
 * const density = useDensity(props.density);
 * ```
 *
 * @param density - Densité passée explicitement au composant (optionnelle)
 * @returns La densité effective à appliquer
 */
export function useDensity(density?: Density): Density {
  const contextDensity = useContext(DensityContext);
  return density ?? contextDensity ?? "default";
}
