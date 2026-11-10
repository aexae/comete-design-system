# Décisions — comete-design-system

> Journal des décisions (date, décision, contexte / raison).

## 2026-11-09 — Page : Body à 12px fixe, Bar alignée sur la Toolbar

**Contexte** : demande d'Axel : « paddingX de PageBar à 24px, paddingX du
Page.Body à 12px, Figma et code », puis, le point Toolbar soulevé,
« aligne la bar sur la toolbar ».

**Décisions** :

- **Body** : `--page-gutter` devient la gouttière de contenu à `var(--space150)`
  (12px) fixe à toutes les tailles. C'est elle que `Bleed isFull` compense et que
  les stories utilisent pour s'aligner sur le Body : aucun autre changement requis.
- **Bar et Toolbar** : même gouttière responsive qu'avant (24 / 16 / 8 selon le
  viewport), renommée `--page-header-gutter`. La Bar n'a donc pas de retrait fixe
  de 24px : Axel a préféré l'aligner sur la Toolbar.
- **Figma** : frames `<Page.Body>` de ❖ Page → `space150` sur les 4 variantes ;
  ❖ PageBar inchangé au final (compact `space100`, large `space300`) ; en desktop
  la gouttière portée par le frame `Viewport` (space300) descend aux enfants
  (Viewport → `space0`, Bar, Toolbar et footer → `space300`) pour que le Body
  puisse différer.

## 2026-11-09 — Prettier systématique, légendes homogènes, clip-path

**Contexte** : suite de la généralisation des libellés de variantes dans Storybook.

**Décisions** :

- **Prettier s'applique à tout le code, systématiquement** (demande d'Axel). Passage
  global `prettier --write` sur la racine et `storybook/` (313 fichiers), `prettier`
  en devDependency racine, scripts `pnpm format` / `pnpm format:check`, étape
  `Format check (Prettier)` dans `ci.yml` après le lint. Config unique `.prettierrc`
  à la racine (`jsxBracketSameLine` déprécié remplacé par `bracketSameLine`).
  Ignorés : `pnpm-lock.yaml`, `*.module.css.d.ts` (générés par tcm),
  `storybook-static`, `dist`, `coverage`. Annule la décision précédente de ne pas
  formater les stories.
- **Légendes homogènes** : toute légende nommant une variante, une taille, un état
  ou une prop passe par `Labeled` / `LabeledRow` / `Legend` (12 px, `--text-subtle`,
  pas de monospace, libellé **sous** l'instance). Les en-têtes de ligne / colonne de
  grilles utilisent `Legend`. Sur fond sombre (`inverted`), le fond devient une tuile
  dans le `Labeled` et le libellé reste dehors en `--text-subtle`.
- **`clip-path` → `clipPath`** : ajout de la conversion dans
  `scripts/generate-components.ts` de `comete-icons` et `comete-illustrations`, et
  application directe sur les composants générés déjà commités (20 icônes,
  2 illustrations), sans relancer `pnpm generate` côté icônes (le `svg/` local est
  brut, non optimisé). Non commité : livraison des deux paquets à la demande.

## 2026-11-09 — Storybook : libellé sous chaque instance dans les stories multi-variantes

**Contexte** : demande d'Axel de généraliser le pattern de la story Button
« Icon only — All variants » (libellé discret sous chaque instance) à toutes les
stories qui rendent plusieurs instances d'un composant.

**Décisions** :

- **Helper partagé `storybook/stories/_labeled.tsx`** (`Labeled`, `LabeledRow`)
  plutôt qu'un pattern inline dupliqué. Même rendu que Button : colonne flex,
  gap 8, libellé `fontSize 12` en `var(--text-subtle)`. Button migre dessus.
- **Périmètre** : on labellise quand ≥ 2 instances ne diffèrent que par des props
  et que rien dans le rendu ne dit laquelle on regarde. On ne touche pas aux
  instances auto-descriptives (texte visible = nom de la variante), aux stories
  déjà labellisées (en-têtes de grille, `Field label`, `<Text>` légende), aux
  compositions/démos/templates (items = contenu, pas variantes), ni aux
  playgrounds et stories `play`.
- **Libellé = valeur brute de l'API** (`small`, `outlined`, `comete`),
  combinaison avec « · » (`outlined · disabled`). Pas de nom marketing.
- **Pas de Prettier sur les stories** : les fichiers ne sont pas Prettier-clean
  au départ, un `--write` reformate tout. Code ajouté formaté à la main,
  validation = eslint + tsc + tests Storybook.
- **Badge « With cutout border »** : fond sombre par tuile au lieu d'un bandeau
  unique, pour garder le libellé lisible hors du fond.
- 16 stories modifiées dans 15 fichiers : Avatar (AllSizes, remplace un `#666`
  hardcodé), Badge (LowImportance, WithCutoutBorder, Disabled), Banner, Button
  (3 Icon only), ButtonGroup (MixedVariants, All densities), Couleur
  (Philosophie), IconTile (AllCombinations), ModalDialog (AllAppearances),
  ProgressIndicator (AllAppearances, AllSizes), ScrollArea (Axes),
  SectionMessage (AllAppearances ×2), Skeleton (Avatars, Squares,
  AllAppearances), Snackbar (Appearances), Switch (Indeterminate), Tag
  (AllAppearances, Shapes).

## 2026-11-09 — Button : couleurs subtle/subtlest sans fond au repos, stories link/subtle en default

**Contexte** : revue visuelle en Storybook après l'alignement du Button.

**Décisions** :

- **Couleurs `subtle` / `subtlest` sans fond au repos** (apparence `contained`) :
  elles portaient le même fond gris que `default`, ce qui les faisait passer pour
  des boutons pleins alors que leur rôle est le motif bouton-icône fantôme
  (IconButton). Fond retiré au repos, conservé au survol/pression (révélateur
  ghost). CSS only, pas d'API. Arbitrage Axel : correction côté CSS (pas côté
  story), la story `All Variants` servait déjà de référence correcte.
- **Stories alignées sur la couleur `default`** : `Link`, `Inline link` et le
  bouton `Link` de la vignette variantes repassent de `comete` / `information` à
  `default` (elles forçaient une couleur car `link` + `default` n'avait pas encore
  sa couleur link). La story `Subtle` repasse de `comete` à `default`.

## 2026-11-09 — Button : link/link-subtle en texte pur, couleur link rétablie, subtle conservé

**Contexte** : revue d'alignement du Button avec Figma avant de reprendre la couche
de tokens de composants. Quatre points soulevés par Axel.

**Décisions** :

- **Fonds retirés** au survol et à la pression sur `link` et `link-subtle` (feedback
  uniquement sur le texte, via épaississement du soulignement). Conforme à Figma.
- **Couleur link rétablie** : `link` utilise `--text-link-default/-hovered/-pressed`
  par défaut (elle avait été remplacée par `--text-default`). Les couleurs
  sémantiques (`comete`, `critical`, etc.) restent permises sur `link`. La couleur
  link n'est pas une valeur de `ButtonColor`, donc impossible à appliquer à
  `contained`/`outlined` : pas de combinaison incohérente par construction.
- **`subtle` conservé** (apparence) et **`subtle`/`subtlest` conservées** (couleurs),
  contrairement à la demande initiale de suppression : elles portent le motif
  bouton-icône fantôme (IconButton, fond au survol) utilisé ~13x en interne (Page,
  Calendar, TimePicker, SideNav, Drawer, Spotlight). `subtle` n'est pas un doublon
  de `link` (fond + pas de soulignement vs soulignement + pas de fond). Décision
  revue par Axel après mise en évidence de ces usages.
- **Non cassant** : aucune suppression d'API. `subtle` garde son fond.
- **État `selected`** de `link-subtle` : puce de fond conservée (seuls hover/press
  visés).

**Validation** : `pnpm build`, 1353 tests, `pnpm lint` OK. Faiblesses consignées
dans TODO.md (AA de la couleur link sur fonds subtlest, couleur d'icône de `link`
par défaut, re-sync du pilote tokens Figma). Modifié uniquement
`Button.module.css` + CHANGELOG. Non commité (en attente d'instruction).

## 2026-10-21 — Garde d'existence des tokens consommés

**Décision** : test `src/tokens/cssTokens.test.ts`. Toute custom property lue par le DS
(`var(--x)` dans les CSS Modules et le TSX, fallbacks imbriqués inclus) doit être définie
par `@aexae/comete-design-tokens` ou déclarée par un CSS du DS. Exceptions acceptées : les
variables privées `--_*` posées par le TSX, et une liste explicite (`RUNTIME_PROPERTIES`)
des variables posées au runtime (React Aria, inline style) ou offertes en surcharge au
consommateur. La liste est elle-même vérifiée (pas d'entrée obsolète).

**Contexte / raison** : un fallback masque la disparition d'un token, et un token absent
sans fallback rend la déclaration invalide en silence. Le test a révélé `--text-primary`
et `--radius125`, inexistants.

## 2026-10-21 — Button touch : padding X ≥ 2 × padding Y

**Décision** : règle testée dans `Button.test.tsx`. Le padding horizontal du Button touch
passe à `--space200` (16 px) au lieu de `--control-padding-x-touch` (12 px). Les champs
gardent `--control-padding-x-touch`.

**Contexte / raison** : demande explicite. Option préférée à un changement du token
(qui aurait aussi élargi `InputContainer` touch) et à une réduction du padding Y.

## 2026-10-21 — `--text-primary` → `--text-default`

**Décision** : SectionMessage (titre, contenu) et Breadcrumbs (page courante) utilisent
`--text-default`.

**Contexte / raison** : `--text-primary` n'existe pas dans les tokens (nom hérité de l'ère
MUI). `--text-default` est la couleur de texte principale du thème.

## 2026-10-21 — Création du token `--radius125` (10 px)

**Décision** : ajout de `Radius125` = `{Size125}` dans `comete-design-tokens`, consommé par
`Avatar` `xxlarge`.

**Contexte / raison** : `Avatar` référençait `--radius125`, inexistant, donc coin carré. Le
token prolonge l'échelle d'Avatar (8 px en xlarge, 12 px en xxxlarge). Création approuvée
explicitement.

## 2026-10-23 — Rechargement auto de Storybook sur chunk introuvable

**Décision** : `preview-head.html` écoute `vite:preloadError` et recharge la fenêtre
principale une fois (garde `sessionStorage` de 30 s contre les boucles).

**Contexte / raison** : chaque déploiement GitHub Pages supprime les assets hashés du
déploiement précédent. Les onglets ouverts ou le HTML en cache pointaient vers des chunks
absents, ce qui obligeait à recharger à la main (Cmd+R). C'est le mécanisme documenté par
Vite pour ce cas.
