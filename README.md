# @aexae/comete-design-system

Design system Comète — composants React accessibles, thémables et 100% pilotés par des design tokens.

## Installation

```bash
pnpm add @aexae/comete-design-system @aexae/comete-design-tokens
```

## Utilisation

```tsx
import { Button, ThemeProvider } from "@aexae/comete-design-system";
import "@aexae/comete-design-tokens/css";

function App() {
  return (
    <ThemeProvider mode="light">
      <Button appearance="contained" color="brand" iconBefore="Lock">
        Connexion
      </Button>
    </ThemeProvider>
  );
}
```

## Composants

### Button

```tsx
<Button appearance="contained" color="brand">Valider</Button>
<Button appearance="outlined" color="critical" density="compact">Supprimer</Button>
<Button appearance="link" color="information" iconAfter="ChevronRight">Voir plus</Button>
```

- **Apparences** (`appearance`) : `contained`, `outlined`, `subtle`, `link`, `link-subtle`
- **Couleurs** (`color`) : `default`, `subtle`, `subtlest`, `brand`, `success`, `critical`, `warning`, `information`
- **Densité** (`density`) : `compact`, `default`, `touch` — dimension + padding + radius, pilotable globalement via `DensityProvider`
- **Icônes** : `iconBefore` / `iconAfter` reçoivent un `IconName` (string) de `@naxit/comete-icons` — couleur résolue automatiquement selon `appearance` + `color`
- **Accessibilité** : React Aria (ARIA, clavier, focus management)

### ThemeProvider & useTheme

```tsx
import { ThemeProvider, useTheme } from "@aexae/comete-design-system";

// Provider
<ThemeProvider mode="light">
  <App />
</ThemeProvider>

// Hook
const { mode, toggleTheme, setMode } = useTheme();
```

Gère le light/dark mode via l'attribut `data-theme` sur `<html>`, synchronisé avec les CSS custom properties de `@aexae/comete-design-tokens`.

## Points d'entrée

| Import | Contenu |
|---|---|
| `@aexae/comete-design-system` | Tout (composants + providers + hooks) |
| `@aexae/comete-design-system/components` | Composants uniquement |
| `@aexae/comete-design-system/providers` | ThemeProvider, DensityProvider |
| `@aexae/comete-design-system/hooks` | useTheme, useDensity |

## Développement

```bash
pnpm install
pnpm build              # Build ESM dans dist/
pnpm test               # Tests unitaires (Vitest)
pnpm lint               # Lint strict (zéro warning)
```

### Storybook

```bash
cd storybook && pnpm install && pnpm start   # → http://localhost:6006
```

Catalogue complet des composants avec tests d'interaction intégrés. Lien Figma via `@storybook/addon-designs`.

## Architecture

- **React Aria Components** — Accessibilité native headless
- **CSS Modules** — Styles scopés, zéro valeur hardcodée
- **100% token-driven** — Toutes les valeurs visuelles proviennent de `@aexae/comete-design-tokens`
- **tsup** — Bundle ESM, code splitting, tree-shaking

## Stack

- React 18/19, TypeScript strict, ESM uniquement
- React Aria Components ^1.16.0
- CSS Modules + typed-css-modules
- tsup, Vitest, Storybook 10

## Écosystème

Ce package consomme `@aexae/comete-design-tokens` (theming + styles) et `@naxit/comete-icons` (icônes dans les composants). Les trois packages forment la base de l'écosystème Comète.

## Licence

AGPL-3.0-only — voir [`package.json`](./package.json).
