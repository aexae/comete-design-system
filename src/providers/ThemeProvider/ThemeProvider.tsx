import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";

// ----------------------------------------------------------------------

export type ThemeMode = "light" | "dark";

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial mode. Defaults to "light". */
  mode?: ThemeMode;
}

// ----------------------------------------------------------------------

export const ThemeContext = createContext<ThemeContextType | null>(null);

type Action = { type: "SET_MODE"; payload: ThemeMode };
type State = { mode: ThemeMode };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------

/**
 * ThemeProvider — gère le mode light/dark via l'attribut `data-theme`
 * sur `<html>`, ce qui active les bons tokens CSS sémantiques
 * de @aexae/comete-design-tokens.
 *
 * ```tsx
 * import { ThemeProvider } from "@aexae/comete-design-system";
 *
 * <ThemeProvider mode="light">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider = ({
  children,
  mode: initialMode = "light",
}: ThemeProviderProps) => {
  const [state, dispatch] = useReducer(reducer, { mode: initialMode });

  const toggleTheme = useCallback(() => {
    dispatch({
      type: "SET_MODE",
      payload: state.mode === "light" ? "dark" : "light",
    });
  }, [state.mode]);

  const setMode = useCallback((mode: ThemeMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  // Sync prop → state
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, setMode]);

  // Sync state → DOM attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.mode);
  }, [state.mode]);

  const value = useMemo(
    () => ({ mode: state.mode, toggleTheme, setMode }),
    [state.mode, toggleTheme, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
