// DrawerContext — Comète Design System
// Gère le stacking des drawers (blanket partagé, mode push).
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

// -----------------------------------------------------------------------
// Types

export type DrawerPlacement = "left" | "right" | "top" | "bottom";
export type DrawerStacking = "overlay" | "push";

export interface DrawerStackEntry {
  id: string;
  placement: DrawerPlacement;
  stacking: DrawerStacking;
  size: string;
}

interface DrawerContextValue {
  /** Currently open drawers, ordered by registration time. */
  stack: DrawerStackEntry[];
  /** Register a drawer when it opens. */
  register: (entry: DrawerStackEntry) => void;
  /** Unregister a drawer when it closes. */
  unregister: (id: string) => void;
}

// -----------------------------------------------------------------------
// Context

const DrawerContext = createContext<DrawerContextValue>({
  stack: [],
  register: () => {},
  unregister: () => {},
});

export function useDrawerStack(): DrawerContextValue {
  return useContext(DrawerContext);
}

// -----------------------------------------------------------------------
// Provider

export function DrawerProvider({ children }: { children: ReactNode }): ReactElement {
  const [stack, setStack] = useState<DrawerStackEntry[]>([]);

  const register = useCallback((entry: DrawerStackEntry) => {
    setStack((prev) => [...prev.filter((e) => e.id !== entry.id), entry]);
  }, []);

  const unregister = useCallback((id: string) => {
    setStack((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(() => ({ stack, register, unregister }), [stack, register, unregister]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

DrawerProvider.displayName = "DrawerProvider";
