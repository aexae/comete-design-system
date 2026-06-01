# @aexae/comete-design-system v1.0.0-alpha.1 — Première release

La première brique du design system Comète : une bibliothèque de composants React accessibles, thémables et 100% pilotés par des design tokens.

> **Alpha** — L'API des composants peut encore évoluer. Le catalogue va s'enrichir progressivement.

## Composant : Button

Le seul composant de cette release, avec une couverture complète des cas d'usage :

```tsx
import { Button } from "@aexae/comete-design-system";
import { Lock, ChevronRight } from "@naxit/comete-icons";

<Button variant="contained" color="brand">Valider</Button>
<Button variant="outlined" color="critical" size="small">Supprimer</Button>
<Button variant="link" color="information" iconAfter={<ChevronRight />}>Voir plus</Button>
<Button iconBefore={<Lock />} color="brand">Connexion</Button>
```

- **5 variants** : `contained`, `outlined`, `subtle`, `link`, `link-subtle`
- **6 couleurs** : `default`, `brand`, `success`, `critical`, `warning`, `information`
- **3 tailles** : `small`, `medium`, `large`
- **Icônes** : props `iconBefore` / `iconAfter`, couleur automatiquement résolue selon variant + color (inversion sur fond bold, sémantique sur outlined/subtle)
- **États** : hover, pressed, focus-visible, disabled — gérés via data-attributes React Aria

## ThemeProvider & useTheme

```tsx
import { ThemeProvider, useTheme } from "@aexae/comete-design-system";

<ThemeProvider mode="light">
  <App />
</ThemeProvider>

// Dans un composant enfant :
const { mode, toggleTheme, setMode } = useTheme();
```

- Gère le light/dark mode via l'attribut `data-theme` sur `<html>`
- Synchronisation automatique prop → DOM
- API : `mode`, `toggleTheme()`, `setMode("light" | "dark")`

## Tests

27 tests unitaires couvrant : rendu, variants, couleurs, tailles, icônes, accessibilité, interactions clavier, états disabled, forwarded ref.

## Storybook

20 stories pour le Button : toutes les couleurs, variants, tailles, combinaisons d'icônes, états disabled. Tests d'interaction intégrés (click, clavier, focus-visible). Lien Figma intégré via `@storybook/addon-designs`.

## Architecture

- **React Aria Components** — Accessibilité native (ARIA, clavier, focus management)
- **CSS Modules** — Styles scopés, zéro valeur hardcodée
- **100% token-driven** — Toutes les valeurs visuelles proviennent de `@aexae/comete-design-tokens`
- **Styling par data-attributes** — `[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`

## Stack technique

- React 18/19, TypeScript strict, ESM uniquement
- React Aria Components ^1.16.0
- CSS Modules + typed-css-modules pour le typage
- tsup (ESM, code splitting, tree-shaking, source maps)
- Vitest + @testing-library/react
- Storybook 10.3.0

## Utilisation

```bash
pnpm add @aexae/comete-design-system @aexae/comete-design-tokens
```

```tsx
import { Button, ThemeProvider } from "@aexae/comete-design-system";
import "@aexae/comete-design-tokens/css";

function App() {
  return (
    <ThemeProvider mode="light">
      <Button variant="contained" color="brand">
        Commencer
      </Button>
    </ThemeProvider>
  );
}
```

## Écosystème

Consomme `@aexae/comete-design-tokens` (theming + styles) et `@naxit/comete-icons` (icônes dans les composants). Les trois packages forment la base de l'écosystème Comète.
