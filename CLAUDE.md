# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes essentielles

```bash
# Dépendances
pnpm install

# Build (génère dist/)
pnpm build

# Tests
pnpm test                # Lance une fois (vitest run)
pnpm test:watch          # Mode watch

# Lint & format
pnpm lint                # Vérification (zéro warning toléré)
pnpm lint:fix            # Auto-correction sur src/

# Storybook (catalogue de composants)
cd storybook && pnpm install && pnpm start  # → http://localhost:6006
# ou via Docker :
docker compose -f compose.dev.yml up        # → http://localhost:6060

# Nettoyage
pnpm clean
```

## Architecture

**Comète Design System** est une librairie React publiée sur GitHub Packages (`@naxit/comete-design-system`). Elle utilise React Aria (headless accessible) + CSS Modules + design tokens.

### Stack

- **React 18/19** + **TypeScript strict** (`strict: true`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`)
- **React Aria** (`react-aria-components`) — primitives accessibles headless
- **CSS Modules** — styling scopé, 100% design tokens, zéro valeur hardcodée
- **@naxit/comete-design-tokens** (peer dep) — CSS custom properties (primitives + semantic light/dark)
- **tsup** — bundler ESM uniquement, `splitting: false`. React, react-dom, react-aria-components sont externalisés
- **Vitest** + jsdom + @testing-library/react pour les tests
- **Storybook 10** dans `storybook/` (workspace pnpm séparé)

### Structure des sources (`src/`)

```
src/
├── components/          # Composants React
│   └── Button/          # Premier composant (React Aria + CSS Modules)
│       ├── Button.tsx
│       ├── Button.module.css
│       ├── Button.test.tsx
│       └── index.ts
├── providers/           # ThemeProvider (data-theme light/dark)
│   └── ThemeProvider/
├── hooks/               # useTheme
├── css-modules.d.ts     # Déclaration TS pour les imports .module.css
└── index.ts             # Entry point principal
```

### Points d'export (package.json `exports`)

- `.` → `src/index.ts` — export principal (composants + providers + hooks)
- `./components` → composants uniquement
- `./providers` → ThemeProvider
- `./hooks` → useTheme

### Thème

Le thème fonctionne via l'attribut `data-theme` sur `<html>` :
- `ThemeProvider` expose un contexte pour switcher light/dark
- `useTheme` retourne le mode actif et les fonctions de bascule
- Les CSS custom properties de `@naxit/comete-design-tokens` gèrent les couleurs via `:root` (light) et `[data-theme="dark"]`

### Conventions composants

Chaque composant suit la structure :
```
ComponentName/
├── ComponentName.tsx          # Composant (React Aria)
├── ComponentName.module.css   # Styles (100% tokens)
├── ComponentName.test.tsx     # Tests unitaires
└── index.ts                   # Export public
```

### Styling

- **Aucune valeur hardcodée** — tout passe par les CSS custom properties de `@naxit/comete-design-tokens`
- Les CSS Modules utilisent les data-attributes React Aria : `[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`
- Build : `typed-css-modules` génère les `.d.ts` pour les imports CSS Modules avant tsup

### Tests

Tests unitaires avec Vitest + jsdom + @testing-library/react. Fichiers `.test.tsx` au même niveau que le fichier testé :

```bash
pnpm test                           # Tous les tests
pnpm test -- --reporter=verbose     # Mode verbose
```

---

## Processus de création d'un composant

> **Déclencheur** : toute demande de création d'un nouveau composant.
> Exécuter les étapes dans l'ordre, sans sauter d'étape, jusqu'à la PR.

### 0. Branche dédiée

```bash
git checkout main && git pull origin main
git checkout -b component-name   # kebab-case du nom du composant
```

### 1. Extraction Figma

Le token Figma est dans `.env` sous la clé `FIGMA_ACCESS_TOKEN`. Le fichier du DS est `YO9cW75K8aLcM5BbojZAqB`.

```bash
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/YO9cW75K8aLcM5BbojZAqB/nodes?ids=NODE_ID" \
  | python3 -m json.tool > /tmp/component_node.json
```

Extraire via des scripts Python inline (`python3 -c "..."`) :
- **Props/variantes** : structure du COMPONENT_SET (`children[].name`)
- **Dimensions** : `absoluteBoundingBox`, `cornerRadius`, `paddingTop/Right/Bottom/Left`, `itemSpacing`
- **Couleurs** : `fills[].color` (RGB 0–1) → convertir en hex → matcher dans `comete-tokens.css`
- **Typographie** : `style.fontSize`, `fontWeight`, `lineHeightPx`, `letterSpacing`
- **Node IDs** des variantes représentatives pour les stories

Matcher les couleurs RGB aux tokens sémantiques :
```bash
TOKEN_CSS=$(find node_modules -path "*comete-design-tokens*comete-tokens.css" | head -1)
# Extraire uniquement les blocs :root (thème clair) pour avoir les bonnes valeurs
python3 -c "
import re
css = open('$TOKEN_CSS').read()
# Fusionner tous les blocs :root
roots = []
for m in re.finditer(r':root\s*\{', css):
    s = css.index('{', m.start()); depth=0; e=s
    for i in range(s, len(css)):
        if css[i]=='{': depth+=1
        elif css[i]=='}':
            depth-=1
            if depth==0: e=i; break
    roots.append(css[s+1:e])
root = '\n'.join(roots)
# Chercher la valeur hex
for t,v in re.findall(r'(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;', root):
    if v.lower() == '#HEXVALUE': print(t, v)
"
```

**Priorité tokens** : toujours préférer les tokens sémantiques (`--background-*`, `--text-*`, `--border-*`) aux tokens primitifs (`--cool-grey-*`, `--red-*`, etc.).

### 2. Fichiers à créer

**`src/components/ComponentName/ComponentName.tsx`**
- `export function ComponentName(props): ReactElement` (pas de forwardRef sauf si ref explicitement nécessaire)
- Utiliser React Aria (`react-aria-components`) uniquement pour les composants interactifs
- Types exportés : `ComponentNameAppearance`, `ComponentNameSize`, `ComponentNameProps`
- JSDoc sur la fonction et les props non évidentes

**`src/components/ComponentName/ComponentName.module.css`**
- Zéro valeur hardcodée — uniquement `var(--token)`
- Structure : base → dimensions/tailles → apparences × états
- **Priorité des overrides** : les sélecteurs composés (`.appearance.importance`) ont spécificité `(0,2,0)`. Les états prioritaires (`.disabled`, `.badge.disabled`) doivent être déclarés **en dernier** pour gagner par ordre de source à spécificité égale. Ne jamais utiliser `!important`.

**`src/components/ComponentName/ComponentName.test.tsx`**
- Couvrir : rendu de base, valeurs par défaut, chaque prop, combinaisons, états (disabled, etc.)
- Nommage : `"should [comportement] when [condition]"`
- CSS Modules en test = proxy identité → asserter sur le nom de classe brut (ex: `"medium"` pas `"ComponentName_medium__xxx"`)

**`src/components/ComponentName/index.ts`**
```ts
export { ComponentName } from "./ComponentName";
export type { ComponentNameProps, ComponentNameAppearance, ComponentNameSize } from "./ComponentName";
```

### 3. Brancher les exports

```ts
// src/components/index.ts
export * from "./ComponentName";
```

### 4. Validation — obligatoire avant tout commit

```bash
pnpm build              # TypeScript strict + génère dist/
pnpm test               # Tous les tests unitaires
pnpm lint               # Zéro warning (root)
cd storybook && pnpm lint && npx tsc --noEmit   # Zéro warning + zéro erreur TS (storybook)
```

Aucune erreur ni warning toléré. Corriger avant de continuer.

### 5. Story Storybook

Créer `storybook/stories/ComponentName.stories.tsx` :
- `meta` avec `argTypes` pour chaque prop contrôlable et `parameters.design` pointant sur le COMPONENT_SET Figma
- Chaque story individuelle lie son propre node Figma via `parameters.design`
- Stories couvrant au minimum : toutes les apparences, tous les états (disabled, etc.), variantes de contenu

```ts
// Pattern URL Figma réutilisable dans chaque fichier story
const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;
```

#### Props de type icône (`React.ReactNode`)

Les props acceptant une icône (`icon`, `startIcon`, `endIcon`, etc.) ne sont pas sérialisables dans `args`. Utiliser le pattern `mapping` :

```ts
import type { ReactNode } from "react";
import { Person } from "@naxit/comete-icons";

// REASON: React.ReactNode n'est pas sérialisable dans Storybook args.
// Storybook résout la clé string en valeur ReactNode avant de passer au composant.
const ICON_MAPPING: Record<string, ReactNode> = {
  none: undefined,
  Person: <Person spacing="none" variant="filled" />,
};
const ICON_OPTIONS = Object.keys(ICON_MAPPING);

// Dans argTypes :
icon: { control: "select", options: ICON_OPTIONS, mapping: ICON_MAPPING },
// Dans args :
args: { icon: "Person" },
```

Toujours inclure au minimum `none` et une icône représentative de `@naxit/comete-icons`.

### 6. Commit, push et PR

```bash
git add src/components/ComponentName/ src/components/index.ts storybook/stories/ComponentName.stories.tsx
git commit -m "feat(component-name): add ComponentName component"
git push -u origin component-name
gh pr create --title "feat(component-name): add ComponentName" --body "..." --base main
```

La PR doit inclure dans son body :
- Résumé des props et variantes implémentées
- Lien vers le node Figma
- Test plan (build, tests, lint, Storybook)

---

### Distribution

Publication sur GitHub Packages (registry configuré dans `.npmrc`). Les apps consommatrices installent via `pnpm add @naxit/comete-design-system`.
