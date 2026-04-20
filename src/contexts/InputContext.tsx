// InputContext — Comète Design System
// Propage l'état disabled/invalid aux composants enfants dans un champ de saisie.
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------
// Types publics

export interface InputContextValue {
  /** Le champ parent est désactivé. */
  isDisabled: boolean;
  /** Le champ parent est en erreur. */
  isInvalid: boolean;
}

// -----------------------------------------------------------------------
// Context

const InputContext = createContext<InputContextValue | null>(null);

// -----------------------------------------------------------------------
// Provider

export interface InputContextProviderProps extends InputContextValue {
  children: ReactNode;
}

/**
 * InputContextProvider — Comète Design System
 *
 * Propage l'état `isDisabled` et `isInvalid` d'un champ de saisie vers
 * ses composants enfants (Icon, Button, etc.). Placé automatiquement par
 * InputContainer — les consommateurs n'ont pas besoin de l'utiliser
 * directement.
 *
 * Les composants enfants consomment le contexte via `useInputContext()`.
 * Si une prop est passée explicitement sur le composant enfant, elle prime
 * sur la valeur du contexte (opt-out).
 */
export function InputContextProvider({
  isDisabled,
  isInvalid,
  children,
}: InputContextProviderProps) {
  return (
    <InputContext.Provider value={{ isDisabled, isInvalid }}>
      {children}
    </InputContext.Provider>
  );
}

InputContextProvider.displayName = "InputContextProvider";

// -----------------------------------------------------------------------
// Hook

/**
 * useInputContext — Comète Design System
 *
 * Retourne l'état du champ parent (`isDisabled`, `isInvalid`) ou `null`
 * si le composant n'est pas dans un InputContainer.
 *
 * ```tsx
 * const ctx = useInputContext();
 * const effectiveDisabled = props.isDisabled ?? ctx?.isDisabled ?? false;
 * ```
 */
export function useInputContext(): InputContextValue | null {
  return useContext(InputContext);
}
