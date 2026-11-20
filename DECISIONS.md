# Décisions — comete-design-system

> Journal des décisions (date, décision, contexte / raison).

## 2026-11-20 — `--surface-*` hors de `background`, Checkbox et Switch sur `background.default`

**Décisions** (Axel, tokens 0.34.0) :

- **Doctrine surface vs background** validée : surface = ce sur quoi on pose du contenu (profondeur, sans sens) ; background = ce qu'un composant peint pour dire quelque chose (emphase, statut, marque). La famille `background.surface.*` sort de `background` et devient `surface.*`, aplatie (plus de niveau `elevation`, qui désigne déjà les ombres). Le DS migre ses 36 fichiers consommateurs sans changement visuel.
- **Checkbox et Switch** : le fond non coché de la case et le pouce du Switch passent de `--surface-default` à `--background-default-default`, comme leurs variables Figma (`DEPRECATED-input/color/background/default` et `button` du Switch). Un contrôle n'est pas une surface. Seul le thème sombre change (cool-grey 950 au lieu de 900).
- **Badge et AvatarGroup gardent `--surface-default`** pour l'anneau de découpe et la bordure de chevauchement : ils imitent la surface sous l'élément, c'est bien une surface.
- **Cadre « Dark background » de la page Spinner (Figma)** : relié par Axel à `surface/default` en mode sombre, conforme à la doctrine (c'est la page en thème sombre, le spinner y est posé).

**Contexte / raison** : voir DECISIONS du repo tokens (0.34.0). Les DS de référence séparent tous couches et remplissages ; la séparation devient lisible dans le nom.

## 2026-11-20 — on-light-surface / on-dark-surface, critical bold, disabled en opacité

**Décisions** (Axel) :

- `on-warning` devient `on-light-surface` et `on-comete` devient `on-dark-surface` (texte,
  icône, couleur d'Icon). Le nom décrit la surface fixe, plus une famille de couleur.
- `background.critical.bold` vaut red 600 dans les deux thèmes : tout texte ou icône posé
  dessus utilise `on-dark-surface` (blanc fixe), pas `inverted` (encre en sombre).
- Banner : apparence `discovery` (accent purple, icône `New`), message en medium, token de
  taille d'icône.
- SideNav et BottomNav : le disabled suit le standard opacité, sans couleur dédiée. Plus
  aucun usage de `--text-disabled` / `--icon-disabled` dans ces composants.
- Valeurs brutes portées par les tokens de composant (240, 72, 160 px) quand l'échelle n'a
  pas le cran.
- Règle permanente : aucun nouvel usage d'un élément déprécié (token, variable Figma,
  composant), même via un alias. Arbitrage d'Axel si besoin.

## 2026-11-20 — `icon.on-comete` sur Card bold comete / brand, voiles

**Décision** (Axel) : création de `icon.on-comete` dans les tokens (0.32.0), blanc fixe dans les
deux thèmes, modèle de `icon.on-warning`. `Card` `bold` en `comete` ou `brand` le pose sur
`--icon-default`, `--icon-subtle` et `--icon-subtlest`, comme le texte en `text.on-comete`.

**Raison** : les icônes de ces cartes restaient en `icon.inverted`, qui suit le thème et devient
encre en sombre, illisible sur le navy fixe.

**Voiles** (tokens 0.32.0, détail dans `comete-design-tokens/DECISIONS.md`) : `blanket` seul
voile plein écran, `background.surface.mask.{default,hovered,pressed}` voile local en grey-alpha,
`interaction.*` et `background.alpha.default` supprimés. Aucun changement de code DS, rien ne les
consommait.

**Storybook Icon** : la liste des couleurs du control est maintenue à la main et doit rester
identique au type `IconColor` de comete-icons, triée. Elle avait pris du retard sur 0.12.0.

## 2026-11-20 — Tokens de composant Banner, Page, SideNav, BottomNav

**Décision** (demande d'Axel) : ces composants lisent leurs tokens de composant (tokens
0.31.0) au lieu des tokens sémantiques, avec des valeurs reprises du code (rendu
inchangé). Les écarts avec Figma (SideNav, BottomNav, PageBar, Banner) ne sont pas
tranchés : ils sont listés dans le TODO du dépôt tokens. Le disabled du BottomNavItem
passe par `--bottom-nav-color-item-*-disabled`, qui aliasent encore `text.disabled` et
`icon.disabled` (dépréciés) : la référence de `deprecatedDisabledTokens.test.ts` perd son
entrée BottomNavItem, la dette est suivie côté tokens.

## 2026-11-20 — text.on-comete pour les surfaces navy fixes, icon.bold aligné sur Figma

**Décision** (Axel, suite aux faiblesses du lot A des descriptions) : nouveau token
`text.on-comete` (blanc fixe, modèle de `text.on-warning`) pour tout texte posé sur
`surface.comete` ou `*.boldest`, qui sont navy dans les deux thèmes. `Card bold comete /
brand` et la page Welcome l'adoptent. `icon.bold` suit Figma (950 clair, 50 sombre).
Les icônes de `Card bold comete` restent en `icon.inverted` : un `icon.on-comete` serait
le pendant logique, à créer si validé.

## 2026-11-19 — Button brand et accent, polices Noto Sans et Noto Sans Mono

**Décisions** (Axel) :

- Le code et Figma doivent être synchronisés : le Button reçoit `brand` et les 5 accents, déjà présents dans le set Figma (alpha.188). `outlined` et `subtle` gardent un texte fixe au survol pour toutes les couleurs.
- Seules Noto Sans et Noto Sans Mono subsistent (tokens 0.29.0). Storybook charge ces deux familles au lieu de Poppins. Tout usage d'un token de police dans le DS ajoute la famille générique en repli (`monospace`, `sans-serif`).

## 2026-11-19 — Chromatic : token hors du dépôt, projet sur le compte aexae

**Décisions** (demande d'Axel) :

- `projectToken` retiré de `storybook/chromatic.config.json`. La CI utilise le secret
  `CHROMATIC_PROJECT_TOKEN`, le local la même clé dans `.env` (ignoré par git).
- Les tests visuels passent du projet `Naxit/comete-design-system` (compte perso) au
  projet `comete-design-system` du compte Chromatic `aexae`.

**Raison** : le token était en clair dans un fichier commité, et le projet consommait le
quota du compte personnel.

## 2026-11-19 — Majeures de la racine : Vite 8, tsup 9, jsdom 31, TypeScript 6

**Décisions** (demande d'Axel) :

- `vite` 7 → 8, `@vitejs/plugin-react` 4 → 6, `tsup` 8 → 9, `jsdom` 29 → 31,
  `@testing-library/jest-dom` 6 → 7, `typescript` 5.9 → 6.0.
- `scripts/plainify-css.mjs` et `scripts/smoke-dist.mjs` acceptent les deux noms de
  chunk de locals (`X.module.css.js` et `X.module.js`). `plainify-css` échoue désormais
  si des feuilles sont renommées sans qu'aucun import soit réécrit.
- Quatre assertions `toHaveStyle` (FocusRing, ScrollArea) lisent le style inline.
- `storybook/virtual-modules.d.ts` déclare `@aexae/comete-design-tokens/css`.
- TypeScript reste en 6.0 : la 7 est refusée par `typescript-eslint`.
- Correctif du peer tokens (`>=0.17.0`) préparé dans `comete-icons` et `comete-logos`,
  non commité, non publié.

**Contexte / raison** : Vite 8 passe à Rolldown, qui nomme autrement les chunks des CSS
Modules. Sans adaptation, le build sortait un dist dont chaque composant importait une
feuille `X.module.css` renommée entre-temps : paquet non stylé, et `smoke-dist` ne
trouvait plus rien à contrôler. Validé par build, `publint`, lint, Prettier, `tsc`,
tests unitaires et 613 tests de stories. CSS et exports du dist comparés à l'ancien :
identiques.

## 2026-11-19 — Paquets Comète en `latest`, Vitest 5 et majeures du Storybook

**Décisions** (demande d'Axel) :

- `@aexae/comete-design-tokens`, `comete-icons` et `comete-logos` passent en `latest`
  dans les `devDependencies` racine et dans `storybook/package.json`. Le lockfile fige
  toujours la version installée : la montée se fait par `pnpm update -r "@aexae/*"`.
- Les `peerDependencies` publiées du DS gardent une plage explicite (`^0.23.0` pour les
  tokens) : c'est ce que lisent les applications consommatrices, `latest` n'y a pas de
  sens.
- `comete-illustrations` reste épinglé : le paquet n'a pas de dist-tag `latest`.
- `tools/powerbi-kit` reste sur logos 0.12.4 et tokens ^0.13.0 (voir `TODO.md`).
- `vitest` 4 → 5 à la racine et dans Storybook, avec `@vitest/browser*` 5. Ajout de
  `src/vitest-jest-dom.d.ts` pour retyper les matchers jest-dom.
- Storybook : `chromatic` 15 → 18, `@storybook/addon-designs` 11 → 12,
  `@types/node` 25 → 26.
- `eslint` reste en 9 : la 10 fait planter `eslint-plugin-react`.

**Contexte / raison** : Axel ne cible jamais une autre version que la dernière pour les
paquets Comète. Validé par build, lint, Prettier, `tsc` et tests (1379 / 1380 unitaires,
613 stories). Le test restant, `cssTokens.test.ts`, attend la publication des tokens 0.24.0.

## 2026-11-19 — Storybook 10.6.7 et messages de démarrage

**Décisions** (demande d'Axel : mettre à jour Storybook et corriger le message au lancement) :

- `storybook`, `@storybook/addon-a11y|docs|vitest`, `@storybook/react-vite` et
  `eslint-plugin-storybook` passent de 10.5.8 à 10.6.7. `@storybook/addon-mcp` passe de
  0.7.0 à 10.6.7 : l'addon est désormais versionné avec Storybook.
- `.storybook/main.ts` importe `./welcomeReleases.ts` avec son extension, et
  `storybook/tsconfig.json` active `allowImportingTsExtensions`. Storybook avertissait
  au démarrage d'un import sans extension.
- `.storybook/vitest.setup.ts` ne fait plus `setProjectAnnotations` : l'addon vitest
  applique les annotations seul depuis 10.3 et le signalait à chaque lancement des tests.
- `**/.claude` ajouté à `.prettierignore` : les réglages locaux de Claude Code faisaient
  échouer `pnpm format:check` en local.

**Contexte / raison** : périmètre limité à Storybook pour garder une mise à jour sans
risque. Validé par lint, `tsc`, Prettier et les 613 tests de stories en Chromium.

## 2026-11-19 — Réglages Claude Code du Storybook : retrait de la règle `mcp__*`

**Décision** (choix d'Axel) : suppression de `"mcp__*"` dans `permissions.allow` de
`storybook/.claude/settings.local.json`, sans la remplacer par des règles par serveur.

**Contexte / raison** : Claude Code refuse un joker sur le nom de serveur en `allow`
(seul `mcp__<serveur>__*` est accepté) et ignorait la règle avec un avertissement. Le
fichier est en `bypassPermissions`, les outils MCP passent donc déjà sans confirmation :
le retrait ne change aucun comportement.

## 2026-11-19 — Tokens disabled sémantiques dépréciés, garde contre les nouveaux usages

**Décision** (demande d'Axel) : `--background-disabled-default`, `--text-disabled`,
`--border-disabled` et `--icon-disabled` sont dépréciés (tokens 0.24.1, variables Figma
`DEPRECATED-…`). Le test `src/tokens/deprecatedDisabledTokens.test.ts` fige leurs 73
usages restants dans 24 composants : tout nouvel usage fait échouer la CI, et chaque
migration vers `--<composant>-opacity-disabled` retire son entrée. Liste vide = tokens
supprimables.

**Contexte / raison** : le disabled passe par l'opacité. À la migration, deux pièges :
opacités imbriquées (0,38 × 0,38, soit environ 14 %) à éviter en ne posant l'opacité
qu'à un niveau, et contraste qui dépend du fond (sans exigence WCAG pour un élément
désactivé).

## 2026-11-19 — Tokens de composant nommés par catégorie, disabled en opacité, Avatar et AvatarGroup

**Décisions** (demandes d'Axel) :

- **Nommage `<composant>/<catégorie>/…`** (`color`, `size`, `spacing`, `radius`,
  `opacity`, `border-width`), aligné sur Figma. Button :
  `--button-contained-default-*` devient `--button-color-contained-neutral-*`,
  `--button-size-<densité>-{padding-x,padding-y,gap}` devient
  `--button-spacing-<densité>-*`, `--button-size-<densité>-radius` devient
  `--button-radius-<densité>`. `default` devient `neutral` pour toutes les apparences.
  Avatar : `--avatar-color-<couleur>-{background-*,text,icon}`,
  `--avatar-size-<taille>-{container,icon}`, `--avatar-radius`.
  AutosaveIndicator : `--autosave-indicator-color-*`, `--autosave-indicator-spacing-gap`.
- **link-subtle neutral aligné sur Figma** : repos et appui en `text-default`, survol
  en `text-subtle-hovered` (le code utilisait `text-subtle` aux trois états).
- **Disabled = opacité (option A)** : `--button-opacity-disabled` et
  `--avatar-opacity-disabled` aliasent `--opacity-disabled`. Dans Figma, la collection
  `base/opacity` passe en pourcentage (38) : Figma lit l'opacité en 0-100, le code en
  fraction (0,38). Les 22 composants sur les couleurs `*-disabled` seront migrés un
  par un après la livraison du Button et de l'Avatar.
- **AvatarGroup** : l'épaisseur de l'anneau (`--avatar-group-border-width-*`) et le
  chevauchement (`--avatar-group-spacing-overlap-*`, marge négative de 25 % du
  diamètre) sont des tokens, posés par taille sur le groupe. L'anneau prend la couleur
  du fond du conteneur via `borderColor` : pas de token de couleur (un token de fond
  sur une bordure serait incohérent), blanc brut #FFFFFF dans Figma. Hors groupe, un
  `borderColor` ne dessine plus d'anneau.
- **Avatar** : un seul `--avatar-radius` (rond, l'apparence carrée a disparu du code
  en avril 2026, #65). L'icône suit la couleur de l'avatar (`--avatar-icon-color`,
  posée par la classe de couleur ou la sélection) au lieu de rester `icon-default`.
  Taille d'icône portée par le CSS. Une seule lettre en xsmall et small, sauf pour un
  compteur `+N`, affiché en entier. L'état selected n'affiche plus l'anneau de focus,
  réservé au focus clavier : il se lit au fond `--avatar-color-selected-*`. Exception
  (demande d'Axel) : sur une photo chargée, qui cache ce fond, l'anneau de focus marque
  la sélection (code et Figma).
- **Toute propriété tokenisable pointe sur un token** (code et Figma). Si le token
  manque, on s'arrête et on demande l'accord avant de le créer.
- **Figma** : nouveau ❖ Avatar (20406:6274, 630 variantes : `size` × `color` ×
  `state` × `content`), nouvelle page ❖ AvatarGroup (set 20414:31920, 7 tailles,
  avatars exposés, propriété `overflow`). Les instances de l'ancien Avatar et de
  l'ancien Button sont migrées, l'ancien set Avatar est supprimé.
- **Livraison autonome** : Claude peut livrer seul un travail terminé et validé, sans
  attendre « livre » (branche + PR conservées sur le DS).

**Contexte / raison** : `button/color/…` ou `button/spacing/…` identifie la nature d'un
token dès son nom. L'opacité garde la teinte du composant désactivé sans multiplier
les tokens de couleur.

## 2026-11-18 — Button en chargement : `isPending` plutôt que `isDisabled`

**Décision** : `isLoading` passe `isPending` à React Aria (1.17) au lieu de `isDisabled`.
Le bouton garde sa couleur, reste focusable, bloque l'appui et le survol.

**Contexte / raison** : remarqué par Axel dans la story Spinner › In Button (bouton
comete bleu pâle au lieu de blue600). `isDisabled` posait `data-disabled`, donc
l'opacité désactivée, alors que Figma dessine l'état loading en couleur pleine.
Effet de bord pour les consommateurs : `data-disabled` n'est plus présent en
chargement (sélecteurs CSS ou tests qui s'y fiaient).

## 2026-11-18 — Composant Spinner, tokens spinner, typo et icônes du Button par densité

**Décisions** (demandes d'Axel) :

- **`Spinner`** créé dans le DS sur le dessin du ❖ Spinner Figma (3499:129936). Il
  remplace les trois SVG locaux de `Button`, `TextField` et `Select`. Taille `fill` ajoutée
  côté code (absente de Figma) pour que le Button le dimensionne à sa taille d'icône. Le
  ❖ Spinner Figma n'a pas de taille 32 px : l'instance du Button lie sa taille à
  `button/size/*/icon`.
- **Tokens de composant spinner** en remplacement des `DEPRECATED-spinner/*` :
  `spinner/size/{xsmall,small,medium,large,xlarge}` (size100 / 200 / 300 / 600 / 1200) et
  `spinner/color/{default,inverted}` (icon/default, icon/inverted). Créés dans la
  collection Figma `component` et dans `tokens/component/spinner/tokens.json`. ❖ Spinner
  et l'animation sont rebranchés dessus. Les variables `DEPRECATED-spinner/*` restent
  (usages éventuels hors Spinner non audités).
- **Labels du Button** : Body/S/Medium en compact, Body/L/Medium en touch (Body/M en
  default), dans le code et sur les 1960 variantes compact et touch. Les styles
  « Underline » et « Underline Subtle » des liens n'existaient qu'en M : quatre styles
  créés sur le même modèle (`Body/{S,L}/Medium Underline`, `… Underline Subtle`).
- **Icônes des contrôles 16 / 24 / 32 px** (avant : 16 / 20 / 24), jugé plus harmonieux.
  `control/icon/default` → size300, `control/icon/touch` → size400 (Figma et tokens).

- **Spinner en comète** (code seulement, en itération avec Axel, Figma ensuite) :
  inspiré de loading-ui « Comet spinner », dont la queue est faite de 5 `box-shadow`
  disjointes. Redessiné en SVG en une seule forme pleine, en écho au logo : enveloppe
  d'un cercle qui glisse sur l'orbite en rétrécissant jusqu'à une pointe effilée (pas
  de col entre tête et queue). Rythme repris de la référence (rotation `ease`, queue
  0 → 84° à 38 % → 0, `ease` entre étapes) sur 85 % d'un cycle de 2 s, puis pause de
  la tête en haut. Rotation (`animateTransform`) et contour (`animate d`, 54 images)
  en SMIL sur une seule horloge, compatible Safari. Le modèle « traînée » (queue liée
  à la vitesse) a été essayé puis écarté au profit du rythme de la référence.
  Apparence `comete` : dégradé linéaire du logo dans le repère de la comète, via les
  tokens `--spinner-color-comete-{light,dark}` (alias de `--logo-comete-gradient-*`,
  créés avec accord d'Axel, aussi dans Figma). Tête dessinée en vrai `<circle>` : le
  contour animé, polygonal pour SMIL, rendait une tête facettée pendant la pause.
  Mouvement réduit : comète figée tournée en CSS.

**Contexte** : l'icône de 32 px remplit exactement la hauteur utile du touch (48 − 2 × 8)
et celle de 24 px celle du default (32 − 2 × 4). Le spinner suit la même taille.

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

## 2026-11-19 — Button contained subtle / subtlest : fond au repos tokenisé

**Décision** (Axel, sur capture Storybook) : `contained` `subtle` et `subtlest` consomment
`--button-color-contained-{subtle,subtlest}-background-default` (tokens 0.28.0, alias de
`background.neutral.subtler.default`). Remplace la décision du 2026-11-09 « sans fond au
repos ».

**Contexte / raison** : cette décision n'avait jamais été effective. Faute de règle
`background-color`, le `<button>` héritait du gris `ButtonFace` du navigateur, donc le
rendu avait bien un fond, hors tokens. On tokenise le rendu observé. Les motifs fantômes
restent portés par l'apparence `subtle` (fond `transparent` au repos).

## 2026-11-19 — Couleurs de marque : navy jamais interactif, brand miroir de comete, boldest

**Contexte** : phase 0 du chantier « descriptions des tokens ». En décrivant `brand` et
`comete`, cinq rôles divergeaient (dérive historique, commits tokens `8b9449d` puis
`25f9198`). Question d'Axel sur la pratique courante primaire / secondaire de marque.

**Décisions** (Axel) :

- **Navy = identité, jamais sur une surface interactive. Bleu action = CTA et
  contrôles.** Pratique standard des design systems (identité séparée de l'affordance).
- **`brand` est un miroir rôle pour rôle de `comete`**, mêmes valeurs par défaut :
  choisir `brand` dans les contrôles Storybook rend comme `comete` sans `BrandProvider`.
  Renommage `brand-comete` / `brand-client` écarté (terme standard, `comete` ne varie
  jamais, `client-*` retiré en 0.13.0, coût cassant élevé sans gain).
- **Niveau `boldest`** ajouté sur `background`, `text`, `border`, `icon` des deux
  familles (navy 950). `Card bold comete / brand` passe en navy (Figma l'était déjà).
  `icon.{comete,brand}` deviennent des groupes (cassant, précédent `text` 0.20.0).
- **Accent de marque pour l'or** (`comete.yellow`) : rôle sémantique à créer, périmètre
  fermé (fond décoratif, filet, icône, pas de texte), interdit dans les composants de
  statut. Lot C du chantier, pas encore fait.
- **Gabarit de description** validé : rôle en une phrase, quand l'utiliser, quand ne pas
  l'utiliser, couple de contraste, nom marque. Familles à la main, états dérivés.
  `$description` seul, français, validation en PR. Inauguré sur les tokens `boldest`.
- **Dossier tokens `base/brand` → `base/comete`** (Axel l'a renommé dans Figma).

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
