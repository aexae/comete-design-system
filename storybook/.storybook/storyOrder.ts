/**
 * Ordre des familles de premier niveau dans la sidebar Storybook, pour ordonner les cartes de la
 * page d'accueil. `storySort` (preview.tsx) doit être un littéral statique : les deux listes sont à
 * garder synchronisées.
 */
export const FAMILY_ORDER = [
  "Welcome",
  "Foundation",
  "Patterns",
  "Layout",
  "Navigation",
  "Components",
  "Templates",
] as const;
