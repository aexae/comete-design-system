# Décisions — comete-design-system

> Journal des décisions (date, décision, contexte / raison).

## 2026-11-18 — Spinner du Button aligné sur les tailles d'icône

**Décision** : le spinner `isLoading` prend `--button-icon-size` (16 / 20 / 24 px selon la
densité) au lieu d'un svg fixe de 24 px. Dans Figma, les 420 spinners du `❖ Button
(rebuild)` sont liés à `button/size/*/icon` (ils faisaient 12 / 14 / 16 px).

**Contexte / raison** : demande d'Axel. Code et Figma divergeaient, et aucune des deux
tailles ne suivait un token.

Puis, à la demande d'Axel, les 420 calques de spinner sont remplacés par des instances du
❖ Spinner Figma (3499:129941), taille liée à `button/size/*/icon` et couleur de l'arc liée
à la variable de texte de chaque variante.

## 2026-11-18 — Padding horizontal touch : retour dans l'échelle `control`

**Décision** : `control/padding-x/touch` passe à `space200` (16 px) pour tous les
contrôles, et `button/spacing/touch/padding-x` en redevient l'alias (Figma par Axel,
tokens 0.22.0, DS alpha.178). Remplace l'exception du 2026-10-21.

**Contexte / raison** : la couche `control` n'a d'intérêt que si tous les contrôles la
consomment. La règle padding X ≥ 2 × padding Y reste respectée (16 contre 8). Les champs
touch passent de 12 à 16 px.

## 2026-11-15 — Livraison tokens 0.20.0 (alpha.176) + correctif Card

**Contexte** : livraison de la migration `@aexae/comete-design-tokens` 0.20.0
(branche `tokens-0.20.0`, PR, rebasée sur `origin/main` qui avait avancé de 2
commits — #351 Icon Explorer, #352 sidenav). Conflit résolu sur
`Icon.stories.tsx` (version Icon Explorer conservée + renommage des tokens texte).

**Décision / correctif** : au contrôle anti-régression (scan src + storybook des
tokens texte obsolètes), `Card.module.css` s'est révélé **oublié** par la
migration : ses surcharges locales `--text-default/subtle/subtlest` (variantes
`bold`/`warning`/désactivée) redéfinissaient l'**ancien** nom, devenu mort en
0.20.0 (`--text-<nom>-default` vaut un hex littéral, ne lit pas `--text-<nom>` ;
les composants texte descendants lisent le nom suffixé). Non détecté par le
garde-fou `cssTokens.test.ts` (une déclaration locale reste « valide »). Corrigé :
surcharges renommées en `--text-<nom>-default`. Les surcharges `--icon-*` restent
(tokens icônes non restructurés). Validé : build + 1353 tests + lint + format +
Storybook (lint/tsc) verts.

**CI (après push)** : un seul échec, le test de story `PageBar` « Long title » en Chromium (`scrollWidth > clientWidth` faux, 1030 = 1030) : le titre de ~100 caractères tombait exactement à la largeur de la boîte en CI, non reproductible en local (606 tests verts). Cas limite déjà marginal, probablement basculé par la gouttière de Bar unifiée (16 → 12 px sous 1200 px, +8 px de boîte). Décision : conserver le contrat (ellipsis, débordement réel, nom accessible) et rendre le débordement non ambigu avec un titre très supérieur à toute largeur de Bar (constante `LONG_TITLE`, commentaire REASON).

## 2026-11-15 — Figma ❖ Button rebuild : uniformisation, redistribution et _Variant labels

**Contexte** : suite à l'ajout des 140 variants `iconOnly` compact/touch (voir
entrée ci-dessous), trois finitions demandées par Axel sur le set `19940:889`.

**Décisions** :

- **Uniformisation des labels icon-only** : les labels (masqués) des variantes
  `iconOnly=true` de type `link` / `link-subtle` portaient encore `Underline` /
  `Underline Subtle`. Passés en `Body/M/Medium` comme les autres icon-only (168
  labels), via la procédure sûre détacher→styler→relier (cf.
  [[feedback_figma_linked_text_prop_bug]]) avec garde-fou anti-propagation sur
  labels témoins. Au passage, les clones compact/touch (contained/outlined/subtle
  inclus) ont été reliés à la propriété `✏️ label` qu'ils avaient perdue : tous
  les labels icon-only sont désormais uniformes (Medium + liés).
- **Redistribution** : les 140 nouveaux variants, posés en bloc brut à droite,
  ont été rangés dans la grille du set en 2 colonnes propres (compact puis touch),
  juste après les colonnes icon-only par état. Set resserré de 2907 à 2148 de
  large (contenu de x=40 à x=2108).
  - **Correctif (2026-11-15, 2e passe)** : la grille du set est **appearance-major**
    (5 groupes contained → outlined → subtle → link → link-subtle, 14 couleurs
    chacun, gouttière de +32 px entre groupes), et non color-major. La 1re
    redistribution avait placé compact/touch en color-major → décalage avec les
    lignes. Chaque variante compact (x=1982) / touch (x=2060) a été réalignée sur
    le `y` de la variante icon-only `default` (x=1640) de **même couleur +
    appearance** (lookup direct, robuste aux gouttières). Vérifié : 70/70 compact
    et 70/70 touch alignés sur la référence. Les labels verticaux et le wrapper
    « Button + Labels » (façon Tag) ont été repris côté Axel entre-temps.
- **\_Variant labels** (format « axes résumés » choisi par Axel) : ajout de deux
  bandeaux façon `Figma parts / _Variant labels` (style Noto Sans Mono gris
  `text/subtlest`), détachés pour s'aligner sur la grille irrégulière. Bandeau
  colonnes inséré en flux au-dessus du set (en-têtes `iconOnly=false/true`,
  sous-groupes `états` / `densités`, nom de chaque colonne) ; bandeau lignes en
  enfant absolu à droite du set (14 couleurs centrées sur chaque groupe de 5
  lignes + légende des 5 appearances).

**Validation** : captures (vue d'ensemble + frame annoté), lecture des positions
(colonnes alignées, 14 labels couleur espacés de 300 px), témoins de style
inchangés (aucune propagation).

## 2026-11-15 — Figma ❖ Button rebuild : density compact/touch pour iconOnly

**Contexte** : le set `19940:889` n'avait les variants `iconOnly=true` qu'en
`density=default` (280), compact et touch manquaient (contrairement à
`iconOnly=false` qui a default/compact/touch). Axel a élargi le frame du set
(largeur 2602) pour accueillir les nouveaux à droite.

**Décision** : ajout de 140 variants (`iconOnly=true`, `state=default`,
5 apparences × 14 couleurs × {compact, touch}), même périmètre que
`iconOnly=false` (compact/touch uniquement en state=default). Générés par clonage
du variant default correspondant puis redimensionnement, pour préserver les
propriétés de composant et la propriété de label liée (pas de `combineAsVariants`,
cf. [[feedback_figma_linked_text_prop_bug]]). Géométrie demandée par Axel :
compact 24×24 / icône 16, default 32×32 / icône 20 (inchangé), touch 48×48 /
icône 24, radius rond (999) hérité de la source. Placés en bloc à droite
(startX 1960, pas 64, 10 colonnes), set final 1050 variants, aucun doublon.

**Validation** : matrice symétrique (true: 280/70/70), géométrie et scale du
vecteur vérifiés, rendu conforme à la source en capture.

## 2026-11-10 — Button link : soulignement hover/pressed/focus (pas au repos)

**Contexte** : Axel veut que l'apparence `link` ne soit pas soulignée au repos,
seulement au survol, à l'appui et au focus clavier. Recheck Figma (❖ Button
rebuild `19940:889`) : `link` au repos = style `Body/M/Medium` (aucun
soulignement), hover et pressed = `Body/M/Medium Underline`. Le focus Figma est
encore `Body/M/Medium` (non souligné), à aligner (voir TODO).

**Décision (code)** : `.link` passe à `text-decoration: none` au repos. Le
soulignement plein (thickness 12 %, offset 16 %) n'apparaît qu'en
`[data-hovered]`, `[data-pressed]` et `[data-focus-visible]`, exclusion de
`[data-selected]` (sinon la règle hover primerait le `text-decoration: none` de
l'état selected). `link-subtle` inchangé (pointillé partout sauf selected).

**Validation** : `pnpm build` + 1353 tests + `pnpm lint` verts.

## 2026-11-10 — Page : gouttière unique responsive (Bar = Toolbar = Body)

**Contexte** : Axel a relu les variables de composant dans Figma, réorganisé les
groupes (couleurs dans « color », spacing et radius sortis de « size ») et unifié
les gouttières du ❖ Page. La géométrie Figma relue (toutes variantes) applique la
même gouttière horizontale à Bar, Toolbar et Body : 12 px sous desktop (mobile 402
et tablette 744), 24 px à desktop (1728). Le code gardait un modèle scindé
(`--page-gutter` 12 px fixe pour le Body, `--page-header-gutter` responsive 24/16/8
pour Bar et Toolbar), d'où des écarts à chaque breakpoint.

**Décision** : fusionner en une gouttière unique `--page-gutter`, responsive
(12 px par défaut, 24 px en `min-width: 1200px`), appliquée à `.bar`, `.toolbar` et
`.body`. Suppression de `--page-header-gutter` et de ses deux media queries. Le
padding vertical de la Bar (8 px sous desktop via `.bar` compact, 16 px à desktop)
était déjà conforme, inchangé. Description du ❖ Page dans Figma réalignée sur la
géométrie réelle (nœud local `18862:6708`).

**Validation** : `pnpm build` + 1353 tests + `pnpm lint` verts. BottomNav relu au
passage : spacing code (item 8/0, radius 12, content gap 2, icône 24, badge pill)
déjà conforme à Figma, aucune modif hors renommage de tokens 0.20.0.

## 2026-11-10 — Button (code + rebuild Figma) : icônes contained inverted, selected unifié

**Contexte** : revue d'Axel sur le rebuild. Deux demandes : (1) icônes des
boutons `contained` en inverted sauf warning ; (2) boutons `selected` tous
identiques, sans soulignement ni bordure.

**Code (DS)** :

- `resolveIconColor` déjà conforme (inverted pour comete/success/critical/
  information, `on-warning` pour warning, sombre pour default/subtle/subtlest).
- `selected` unifié : règle unique `.button[data-selected]` (fond plein,
  `border-color: transparent`, `text-decoration: none`) ; icône en couleur
  `selected` (TSX). Voir entrée BREAKING ci-dessous.

**Rebuild Figma** (COMPONENT_SET `19940:889`, 910 variants) :

- Icônes : 120 contained pleins → `icon/inverted`, 70 selected → `icon/selected`,
  contained warning → `icon/on-warning`, et les **720 autres → couleur d'icône
  sémantique de leur variante** (`icon/<color>` : success → `icon/success`, comete →
  `icon/comete`, accent-* → `icon/accent/*`, default/subtle/subtlest idem) pour
  outlined/subtle/link/link-subtle et contained default/subtle/subtlest. Mécanisme :
  l'instance Icon doit être rendue `visible` temporairement pour accéder au
  vecteur et lier son fill ; le binding booléen `iconBefore` est préservé.
- Décoration de texte : état final **uniforme** `Body/M/Medium` (sans trait) sur
  les 910 labels. **C'est exactement la convention du bouton d'origine** (`213:725`) :
  là aussi tous les labels, `link`/`link-subtle` compris, sont en `Body/M/Medium`
  sans trait — le soulignement de link/link-subtle est géré **uniquement par le CSS**,
  jamais dans le master Figma. Le pointillé que le rebuild affichait partout était
  donc un bug du rebuild, désormais retiré.
- **Défaut structurel du rebuild (calque label sur-lié)** : contrairement au bouton
  d'origine (`213:725`) qui tient des styles de label **différents par variant**
  (link = `Body/M/Medium Underline`, link-subtle = `…Underline Subtle`, subtle /
  contained = `Body/M/Medium`), le rebuild **ne peut pas** : le set a été assemblé via
  `combineAsVariants` sur des **clones**, ce qui a sur-lié le calque `✏️ {label}` par
  **identité interne** (pas par nom). Il se comporte comme un seul calque partagé :
  toute écriture de style/décoration se propage à tous les variants et **écrase même
  une surcharge explicite** (vérifié) ; renommer le calque ne détache pas. Les
  **icônes**, elles, tiennent par variant (override sur un nœud imbriqué dans
  l'instance Icon, pas sur le calque matché).
- **Vraie cause (identifiée par Axel)** : bug Figma connu — changer un style de texte
  se propage entre variants partageant une **propriété de texte liée** (le binding
  `characters` du label), spécialement après des éditions via le plugin/MCP. Ce
  n'était PAS le clonage. (Forums Figma : « Text style changes propagate across
  component variants sharing a linked text property following Figma MCP edits ».)
- **Résolu sur le set existant** (`19940:889`, pas de recréation). Méthode : **détacher
  la propriété `characters`** de chaque label (`componentPropertyReferences = {}`,
  910 labels), puis assigner les styles par variant (link → `Body/M/Medium Underline`,
  link-subtle → `…Underline Subtle`, reste + tous selected → `Body/M/Medium`). Une fois
  détachés, les styles **coexistent** et tiennent. Vérifié : décoration correcte par
  variant, **tokens de couleur préservés** (fills label + fond toujours liés aux
  `button/*`), arrangement/iconButtons/propriétés intacts. La tentative de recréation
  par clone+`combineAsVariants` a été **abandonnée** (cassait l'arrangement et les
  iconButtons). Reste : Axel vérifie, puis **recréer la propriété `label`** (TEXT) et
  la réassigner aux labels.

## 2026-11-10 — Button consomme la couche de tokens de composants + restructuration texte (BREAKING)

**Contexte** : réintroduction d'une couche de tokens de composants (voir
comete-design-tokens). Tokens 0.20.0 publiés avec la couche `button/*` et la
restructuration des tokens texte en groupes `default/hovered/pressed`.

**Décisions / changements** :

- Bump `@aexae/comete-design-tokens` ^0.19.0 → ^0.20.0 (root + storybook).
- Renommage de ~215 références `--text-<x>` → `--text-<x>-default` dans tout le DS
  et le storybook (comete/success/critical/warning/information/subtle/subtlest/
  default/brand/accent-*). Cassant pour les consommateurs.
- `BrandProvider` génère `--text-brand-default/-hovered/-pressed`.
- `Button.module.css` consomme `--button-*` (apparence × couleur × partie × état) et
  `--button-size-*` (dimensions). `link-subtle` devient per-couleur (comme `link`),
  avec couleur hover/press + soulignement pointillé.
- `--text-warning` → orange, `--text-brand` default → comete.blue.700 (mirror Figma).
- **État `selected` unifié** : une seule règle `.button[data-selected]` (puce de
  fond pleine, `border-color: transparent`, `text-decoration: none`) pour toutes
  les apparences et couleurs. Supprime le soulignement conservé sur link /
  link-subtle et la bordure des outlined. L'icône passe en couleur `selected`
  (TSX) pour un rendu identique partout.
- **Icônes `contained`** : confirmé `inverted` pour les fonds pleins (comete,
  success, critical, information), `on-warning` pour warning (fond clair). Les
  contained default/subtle/subtlest gardent une icône sombre (fond clair/absent).

**Validation** : `pnpm build`, 1353 tests, lint OK ; storybook lint + tsc OK.
**Statut** : NON commité (clone partagé, sur main). Livraison DS en attente
d'instruction (branche + PR). Les tokens 0.20.0 sont déjà publiés.

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
