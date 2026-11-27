# Règles d'intégration Figma (MCP) — Comète Design System

> Règles à suivre pour transformer un design Figma en code avec le serveur MCP Figma
> (`get_design_context`, `get_screenshot`, `get_variable_defs`, `search_design_system`…).
> Ce fichier est importé par `CLAUDE.md`. Analyse du 2026-11-27 (DS `1.0.0-alpha.204`,
> tokens `0.48.0`, icônes `0.14.0`).

## 0. Règles absolues

1. **Le code généré par Figma est une référence, jamais du code final.** Le MCP renvoie
   souvent du React + Tailwind avec des valeurs en dur : ne jamais le recopier. Le
   traduire en composants du DS, en CSS Modules et en `var(--token)`.
2. **Réutiliser avant de créer.** Toute instance Figma `❖ Nom` correspond en général à
   `src/components/Nom/`. Chercher d'abord dans `src/components/index.ts`.
3. **Zéro valeur en dur** dans les CSS Modules : couleurs, tailles, espacements, rayons,
   ombres, durées, z-index passent par `var(--…)`. Seules exceptions documentées : les
   seuils `@media` / `@container` (voir §6) et `1px` / `2px` de bordure ou d'outline.
4. **Priorité : token de composant > token sémantique > primitive.** Si le composant a sa
   famille (`--button-*`, `--side-nav-*`…), l'utiliser ; sinon un sémantique
   (`--text-default-default`, `--border-focused`…) ; une primitive (`--cool-grey-950`,
   `--space200`) seulement quand aucun des deux ne couvre le besoin.
5. **Si aucun token ne correspond, demander.** Ne jamais deviner ni créer de token sans
   accord explicite (la création se fait dans `comete-design-tokens`).
6. **Icônes et illustrations : jamais de SVG inline ni d'asset téléchargé depuis Figma.**
   Elles viennent de `@aexae/comete-icons` et `@aexae/comete-illustrations` (§4, §5).
7. **Accessibilité** : les composants interactifs reposent sur `react-aria-components`.
   Ne pas recréer un bouton, menu, select, dialog… à partir de `<div>`.

## 1. Fichiers Figma de référence

| Fichier              | fileKey                  | Contenu                                        |
| -------------------- | ------------------------ | ---------------------------------------------- |
| Comète Design System | `YO9cW75K8aLcM5BbojZAqB` | Composants `❖ …`, variables, exemples de pages |
| Comète Icons Set     | `3rYV3P1VzRh0q22HNhgCZv` | Icônes (frame `1:965`, **ne pas supprimer**)   |

- URL : `figma.com/design/:fileKey/:fileName?node-id=1-2` → `nodeId = "1:2"`.
- Workflow MCP : `create_session` (fileKey) → `get_design_context` (nodeId) →
  `get_screenshot` pour valider visuellement → `get_variable_defs` pour lire les
  variables liées. Charger le skill `/figma-design-to-code` avant `get_design_context`.
- Les **variables Figma** portent les mêmes chemins que les tokens :
  `button/color/selected/background/default` ↔ `--button-color-selected-background-default`,
  `text/default/default` ↔ `--text-default-default`. Conversion : `/` et `.` → `-`,
  préfixe `--`.
- Le REST API Figma (`curl` + `FIGMA_TOKEN` du `.env`) reste possible pour les
  extractions massives (audit de variantes), mais le MCP est la voie par défaut.

## 2. Design tokens

### Où et comment

- **Dépôt source** : `../comete-design-tokens/tokens/` (JSON au format DTCG : `$type`,
  `$value`, `$description`, `$deprecated`).
  - `tokens/base/*/tokens.json` — primitives (couleur, size, spacing, radius, typo,
    shadow, animation, opacity, z-index, control, breakpoints).
  - `tokens/theme/light.json`, `dark.json` — sémantique : `background`, `surface`,
    `text`, `border`, `icon`, `logo`, `blanket`.
  - `tokens/component/<composant>/` — tokens de composant (`button`, `avatar`,
    `avatar-group`, `banner`, `page`, `page-bar`, `page-toolbar`, `side-nav`,
    `bottom-nav`, `quick-actions-menu`, `spinner`, `autosave-indicator`). Ils aliasent le
    sémantique, donc héritent du thème.
- **Transformation** : Style Dictionary 5 (`build.ts`) produit
  - `build/css/comete-tokens.css` — fichier unique : primitives `:root`, sémantique clair
    `:root`, sombre `[data-theme="dark"]` + `prefers-color-scheme: dark` (hors
    `[data-theme="light"]`), composants `:root` (en `var(--…)`) ;
  - `build/omnis/*.omnis.json` — sortie pour Comète SQL (Omnis), couleurs en entier.
- **Consommation** : `import "@aexae/comete-design-tokens/css";` une fois à la racine de
  l'app (fait dans `storybook/.storybook/preview.tsx`). Le DS l'a en `peerDependency`.
- **Garde anti-drift** : `src/tokens/cssTokens.test.ts` échoue si un `var(--x)` du DS
  référence un token inexistant. Les variables privées posées par le TSX s'écrivent
  `--_nom` ; les autres variables runtime doivent être déclarées dans
  `RUNTIME_PROPERTIES` de ce test.

### Familles de noms (CSS)

| Usage               | Pattern                                                                                                                         | Exemples                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Fond d'élément      | `--background-<rôle>-<intensité>-<état>`                                                                                        | `--background-neutral-subtler-default`, `--background-comete-bold-hovered`                                        |
| Surface (conteneur) | `--surface[-…]`                                                                                                                 | `--surface-default`, `--surface-raise`, `--surface-sunken`, `--surface-overlay`, `--surface-inverted`             |
| Texte               | `--text-<rôle>[-état]`                                                                                                          | `--text-default-default`, `--text-subtle`, `--text-subtlest`, `--text-critical`, `--text-link`, `--text-inverted` |
| Bordure             | `--border-<rôle>[-bold\|-subtle]`                                                                                               | `--border-default`, `--border-focused`, `--border-critical-bold`                                                  |
| Icône               | `--icon-<rôle>`                                                                                                                 | `--icon-default`, `--icon-subtle`, `--icon-success`                                                               |
| Taille              | `--size<échelle>`                                                                                                               | `--size200` = 16 px (échelle ×8 px / 100)                                                                         |
| Espacement          | `--space<échelle>`                                                                                                              | `--space050` = 4 px, `--space100` = 8 px, `--space200` = 16 px                                                    |
| Rayon               | `--radius<échelle>`, `--radius-round`                                                                                           | `--radius0375` = 6 px                                                                                             |
| Contrôles           | `--control-{height,padding-x,radius,icon}-{compact,default,touch}`                                                              | densités 24 / 32 / 48 px                                                                                          |
| Typo                | `--font-size-{ui,hero}-*`, `--line-height-{ui,hero}-*`, `--font-weight-*`, `--letter-spacing-*`, `--font-family-{primary,code}` | `--font-size-ui-xs` = 14 px                                                                                       |
| Élévation           | `--elevation-{none…xxlarge}`, `--shadow-{key,ambiant}-N`                                                                        |                                                                                                                   |
| Animation           | `--duration-{instant,fast,normal,slow,slower}`, `--easing-*`                                                                    |                                                                                                                   |
| Superposition       | `--z-index-{base,raised,dropdown,sticky,overlay,modal,popover,toast,tooltip}`                                                   |                                                                                                                   |
| Breakpoints         | `--breakpoint-{sm,md,lg}` (tokens ≥ 0.49.0)                                                                                     | 600 / 900 / 1200 px, inutilisables dans une condition `@media`                                                    |

Rôles de couleur : `neutral`, `comete` (bleu interactif Comète), `brand` (couleur du
client, surchargée par `BrandProvider`), `success`, `warning`, `critical`,
`information`, `accent-{purple,teal,turquoise,magenta,blue-grey}`, `day`/`night`.
Intensités : `subtlest` < `subtler` < `bold` < `boldest`. États :
`default` / `hovered` / `pressed`.

> **`comete` vs `brand`** : `comete-*` = éléments interactifs, jamais surchargés ;
> `brand-*` = surfaces d'identité du tenant (Card, Bleed, IconTile, Text). Voir
> `docs/adr/0001-theming-couleur-multi-tenant.md` et `0002-semantique-couleurs-statut.md`.

### Retrouver un token depuis une valeur Figma

Préférer `get_variable_defs` (donne directement la variable liée). Si le nœud Figma a une
valeur brute non liée, chercher la valeur hex dans le bloc `:root` clair de
`node_modules/@aexae/comete-design-tokens/build/css/comete-tokens.css`, puis retenir le
token de composant s'il existe, sinon le sémantique (le commentaire `/** … */` de chaque token décrit son usage). Une valeur
non liée dans Figma est un écart à signaler dans `TODO.md`.

## 3. Composants

### Emplacement et anatomie

```
src/components/<Nom>/
├── <Nom>.tsx               # export function <Nom>(props): ReactElement
├── <Nom>.module.css        # 100 % tokens
├── <Nom>.module.css.d.ts   # généré par `pnpm css-types` (typed-css-modules)
├── <Nom>.test.tsx          # Vitest + Testing Library
└── index.ts                # exports publics (composant + types)
```

Puis `export * from "./<Nom>";` dans `src/components/index.ts`. Story dans
`storybook/stories/<Nom>.stories.tsx`.

### Catalogue (≈ 60 composants)

- **Typo** : `Text`, `Heading`, `Hero`, `Code` (utilitaires dans `src/styles/typography.module.css`)
- **Layout** : `Stack`, `Cluster`, `Grid`, `Bleed`, `Divider`, `Page` (+ PageBar, PageToolbar, PageBody), `ScrollArea`, `Card`
- **Actions** : `Button`, `ButtonGroup`, `ToggleButtonGroup`, `QuickActionsMenu`, `Menu`
- **Saisie** : `Field`, `InputContainer`, `TextField`, `SearchField`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `TimePicker`, `Calendar`, `WeekPicker`, `MonthPicker`, `YearPicker`
- **Navigation** : `SideNav`, `BottomNav`, `Breadcrumbs`, `Tabs`, `Stepper`
- **Feedback** : `Banner`, `SectionMessage`, `Snackbar`, `Spinner`, `ProgressBar`, `ProgressIndicator`, `Skeleton`, `InformativeState`, `Badge`, `Tag`
- **Overlays** : `Popover`, `Popup`, `ModalDialog`, `Drawer`, `Blanket`, `Spotlight`
- **Données** : `Table`, `List`, `Accordion`, `Avatar`, `AvatarGroup`
- **Médias** : `Icon`, `IconTile`, `Illustration`, `Logo`
- **Utilitaires** : `FocusRing`, `DropIndicator`, `_states/DataStateMessage`

### Conventions d'API (calquées sur les propriétés Figma)

- Propriété Figma de variante → prop typée en union de littéraux exportée :
  `<Nom>Appearance`, `<Nom>Color`, `<Nom>Size`, `<Nom>Density`, `<Nom>Props`.
- Vocabulaire commun : `appearance` (`contained | outlined | subtle | link…`),
  `color` (rôles de couleur ci-dessus), `density` (`compact | default | touch`),
  booléens préfixés `is…` (`isDisabled`, `isLoading`, `isSelected`, `isFullWidth`).
- Les icônes se passent **par nom** (`iconBefore="Add"`), pas en `ReactNode`, quand le
  composant résout lui-même la couleur (cas du `Button`).
- Chaque composant accepte `className` et `style` en fin de props.
- Densité héritée : `DensityProvider` / `useDensity()` (`src/contexts/DensityContext.tsx`).
  État désactivé propagé aux icônes : `InputContext`.
- `forwardRef` uniquement quand une ref est nécessaire (cas du `Button`) ; sinon
  `export function`.

```tsx
// Pattern type : Button (src/components/Button/Button.tsx)
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import styles from "./Button.module.css";

export type ButtonAppearance = "contained" | "outlined" | "subtle" | "link" | "link-subtle";
export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style"> {
  /** Visual appearance. @default "contained" */
  appearance?: ButtonAppearance;
  color?: ButtonColor;
  density?: ButtonDensity;
  iconBefore?: IconName;
  className?: string;
  style?: React.CSSProperties;
}
```

### Traduction Figma → JSX

| Figma                                                 | Code                                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Auto layout vertical, gap 16                          | `<Stack direction="column" gap="200">` (gap = suffixe du token `--space*`)                |
| Auto layout horizontal qui passe à la ligne           | `<Cluster>`                                                                               |
| Texte « Body/M/Medium »                               | `<Text size="medium" weight="medium">`                                                    |
| Titres                                                | `<Heading size=… as="h2">` (le niveau HTML se choisit selon la page, pas selon la taille) |
| Instance `❖ Button` (variant=contained, color=comete) | `<Button appearance="contained" color="comete">`                                          |
| Icône `Add` outlined 24                               | `<Icon icon="Add" />`                                                                     |
| Illustration                                          | `<Illustration illustration="…" size={256} />`                                            |

Ne créer un `<div>` + CSS Module que pour ce qu'aucun composant de layout ne couvre.

## 4. Icônes (`@aexae/comete-icons`)

- ~440 icônes, **PascalCase** (`Add`, `ArrowBack`, `AttachFileOff`), union `IconName`.
- Générées depuis Figma (`pnpm pipeline` dans `../comete-icons` : `figma:sync` →
  `optimize` SVGO → `generate`). Ne jamais éditer `src/icons/*.tsx` à la main.
- Variantes : `outlined` (défaut) | `filled` | `duotone`. `spacing` : `default`
  (viewBox 24 avec marge) | `none` (viewBox 16 sans marge).
- Couleur : prop `color` (`IconColor` : `default`, `subtle`, `subtlest`, `success`,
  `critical`, `warning`, `information`, `inverted`, `comete`, `brand`, `accent*`,
  `disabled`…) → classe CSS → `--icon-*`. Tracés en `currentColor` ; les accents duotone
  sont mappés dans `scripts/optimize-svg.ts` (`DUOTONE_COLOR_TO_TOKEN`).
- **Dans le DS, utiliser le wrapper** :

```tsx
import { Icon } from "@aexae/comete-design-system";

<Icon icon="Check" color="success" />                           // décorative (aria-hidden)
<Icon icon="Warning" appearance="filled" size={16} aria-label="Attention" />
```

- Nom Figma ↔ nom de code : identiques. Si une icône Figma n'existe pas dans `IconName`,
  ne pas l'inliner : signaler qu'il faut lancer la synchro dans `comete-icons`.

## 5. Illustrations, logos et autres assets

- **Illustrations** (`@aexae/comete-illustrations`) : SVG multicolores (couleurs
  conservées), catégorisées (empty-state, error, onboarding…). Wrapper
  `<Illustration illustration="…" size={128 | 256 | 512} />`.
- **Logos** (`@aexae/comete-logos`) : `<Logo entity=… appearance="brand" format="logo" size={32} />`,
  variantes d'apparence pilotées par les tokens `--logo-comete-*`.
- **Pas de dossier d'images** dans le DS : aucun PNG/JPG/vidéo livré, aucun CDN
  configuré. Si un design contient une photo ou un média, il appartient à l'application
  consommatrice : demander où le stocker plutôt que l'ajouter au DS.
- Ne pas utiliser les URLs `localhost` d'assets renvoyées par le MCP pour des icônes,
  illustrations ou logos : ils existent déjà dans les paquets.
- **Polices** : Noto Sans / Noto Sans Mono, **non embarquées**. Storybook les charge via
  Google Fonts (`storybook/.storybook/preview-head.html`) ; chaque app doit les charger.

## 6. Styles

- **CSS Modules** uniquement (pas de Tailwind, pas de CSS-in-JS). Noms de classes en
  camelCase (`.densityCompact`, `.iconOnly`), scopés `[name]__[local]` au build.
- Ordre dans un module : base → densités/tailles → apparences × couleurs → états.
  Les états prioritaires (`disabled`) sont déclarés **en dernier**. Jamais `!important`.
- États interactifs via les data-attributes React Aria :
  `[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`,
  `[data-selected]`.
- Focus : `outline: 2px solid var(--border-focused)` (ou le token de composant),
  `outline-offset: 2px`.
- Variables CSS locales posées par le TSX : préfixe `--_` (`style={{ "--_x": … }}`).
- Animations : `--duration-*` + `--easing-*`, et un bloc
  `@media (prefers-reduced-motion: reduce)`.
- **Global** : seulement `@aexae/comete-design-tokens/css` et les utilitaires partagés
  `src/styles/typography.module.css`, `src/styles/scrollbar.module.css`.
- **Thème** : `ThemeProvider` pose `data-theme="light|dark"` sur `<html>` ; `useTheme()`.
  Ne jamais écrire de couleur différente par thème dans un module : les tokens
  sémantiques basculent seuls. `BrandProvider seed="#hex"` surcharge `brand-*` au runtime
  (OKLCH, `src/providers/BrandProvider/`).

### Responsive

- Breakpoints : `BREAKPOINTS = { sm: 600, md: 900, lg: 1200 }` dans
  `src/tokens/breakpoints.ts` (exporté), miroir des tokens `--breakpoint-sm/md/lg`
  (tokens ≥ 0.49.0). Un `@media` / `@container` ne peut pas lire un
  `var()` : les seuils sont recopiés en dur dans le CSS et `breakpoints.test.ts` vérifie
  leur synchronisation. Tout nouveau seuil doit passer par cette source et ce test.
- Mobile first : `@media (min-width: 600px)` puis `(min-width: 1200px)` (`Grid`).
- Composants dépendant de leur conteneur : `@container` (`Table`, `Button collapseLabel`
  dans `Page`).
- Adaptation tactile : `density="touch"` (48 px) plutôt que des media queries.
- Viewports Storybook métier : mobile agent 375, tablette manager 768, desktop 1440.

```css
/* Pattern type (extrait de Button.module.css) */
.densityDefault {
  --button-icon-size: var(--button-size-default-icon);
  min-height: var(--button-size-default-height);
  padding: var(--button-spacing-default-padding-y) var(--button-spacing-default-padding-x);
  border-radius: var(--button-radius-default);
  font-size: var(--font-size-ui-xs);
  line-height: var(--line-height-ui-s);
}
.button[data-focus-visible] {
  outline: 2px solid var(--button-color-focus-border);
  outline-offset: 2px;
}
.button[data-disabled] {
  cursor: not-allowed;
  opacity: var(--button-opacity-disabled);
}
```

## 7. Stack technique et structure

- React 18/19, TypeScript 6 strict (`noUncheckedIndexedAccess`), `react-aria-components`.
- Build : `pnpm build` = `typed-css-modules` → **Vite** (mode lib, ESM,
  `preserveModules`, CSS injecté par `vite-plugin-lib-inject-css`, bannière
  `"use client"`) → `scripts/plainify-css.mjs` → **tsup `--dts-only`** (types bundlés)
  → `scripts/smoke-dist.mjs`.
- Tests : Vitest + jsdom + Testing Library (`src/**/*.test.tsx`) ; stories testées par
  `@storybook/addon-vitest` (navigateur Playwright).
- Lint : ESLint (zéro warning, `jsx-a11y`), Prettier (bloquant en CI).
- Storybook 10 (`storybook/`, workspace séparé) : addons `docs`, `designs` (lien Figma
  par story via `parameters.design`), `a11y`, `vitest`, `mcp`.
- Publication : GitHub Packages (`@aexae/*`), registre dans `.npmrc`.

```
comete-design-system/
├── src/
│   ├── components/   # un dossier par composant
│   ├── contexts/     # DensityContext, InputContext
│   ├── hooks/        # useTheme, useHoverIntent, useSlidingIndicator, useTableSelection
│   ├── providers/    # ThemeProvider, BrandProvider
│   ├── styles/       # typography, scrollbar (CSS Modules partagés)
│   ├── tokens/       # BREAKPOINTS + gardes anti-drift
│   └── index.ts      # exports : ".", "./components", "./providers", "./hooks"
├── storybook/        # stories/ + .storybook/
├── docs/adr/         # décisions d'architecture
└── tools/powerbi-kit/
Dépôts voisins : ../comete-design-tokens, ../comete-icons, ../comete-illustrations, ../comete-logos
```

## 8. Checklist d'une intégration Figma

1. `get_screenshot` + `get_design_context` du nœud ; `get_variable_defs` pour les tokens.
2. Lister les instances `❖` → composants existants ; lister les écarts (props absentes).
3. Si un composant manque : suivre « Processus de création d'un composant » de
   `CLAUDE.md` (branche, fichiers, tests, story avec `parameters.design`).
4. Mapper chaque valeur à un token ; demander pour toute valeur sans token.
5. Vérifier light **et** dark dans Storybook, ainsi que les densités et le clavier.
6. `pnpm format && pnpm build && pnpm test && pnpm lint && pnpm format:check`, puis
   `cd storybook && pnpm lint && npx tsc --noEmit`.
7. Consigner les écarts Figma ↔ code dans `TODO.md`, les arbitrages dans `DECISIONS.md`,
   et mettre à jour `CHANGELOG.md` (`[Unreleased]`).
