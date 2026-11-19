// REASON: @testing-library/jest-dom augmente encore `Assertion<T>` (un seul paramètre de
// type), signature que Vitest 5 a remplacée par `Assertion<R, T>`. La fusion d'interfaces
// échoue alors en silence et `toBeInTheDocument()` & co. disparaissent des types.
// Vitest 5 expose `Matchers<R, T>` comme point d'extension officiel : on y branche les
// matchers DOM. À supprimer quand jest-dom publiera un typage compatible Vitest 5.
import "vitest";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  // Les paramètres de type doivent reprendre à l'identique ceux de Vitest (fusion d'interfaces).
  /* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<unknown, R> {}
  /* eslint-enable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
}
