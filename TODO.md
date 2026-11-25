# TODO

## Audit des usages de tokens dans le code (2026-11-25)

Aucun `var(--…)` vers un token inexistant ni déprécié dans `src/` et `storybook/` (hors gabarits
dynamiques `--space${n}` et fixtures de test). Écarts restants :

- **Card bold `comete` / `brand` actionnable** : fond navy (`*-boldest-*`, survol et pressé
  compris) alors que la décision du 19/11 dit « navy jamais sur une surface interactive ». À
  arbitrer : garder l'exception ou passer en `*-bold-*` quand la carte est actionnable.
- **Warning : code et Figma divergent** : `background.warning.bold` = `yellow.400` (#facc15) dans
  le code, `orange/400` (#feb939) dans Figma, qui n'a pas de palette `yellow`. La variable Figma
  `background/warning/boldest/*` suit donc `orange/950-800` (#441f06) alors que le code est en
  `yellow.950-800` (#292410). Aligner les deux (importer la palette yellow dans Figma ou
  repasser le code en orange).
- **Primitives en direct** : `Skeleton` (`--black-8` / `--white-8` avec bascule de thème
  manuelle, à remplacer par un token sémantique), `ScrollArea` (`--grey-solid-500`, écart
  documenté en attendant la rampe de remplissage).
- **Couleurs brutes** : `Drawer` (`rgb(0 0 0 / var(--_depth-shade))`), `TimeDrumPicker`
  (`rgba(0, 0, 0, …)` dans un masque, acceptable si c'est de l'alpha de masque seulement).
- **Dimensions en dur** dans les composants : `ModalDialog` (largeurs max 320 à 968 px,
  `min-height: 48px`), `Menu` (320, 56, 36 px), `Calendar` (280, 240 px), `Card` (200 px),
  épaisseurs de bordure et de focus en 1 ou 2 px partout (aucun token `border-width`
  sémantique), points de rupture 600 / 768 / 1200 px en dur dans les `@media` (pas de token
  utilisable en media query CSS).

## Figma : écarts relevés en construisant « ◆ Exemples de pages » (2026-11-24)

Page créée : écrans surface default (formulaire), sunken (tableau de bord), raise (panneau de
détail) et overlay (modale), en instances du DS. Écarts des composants Figma rencontrés :

- **Card** : variantes `neutral` / `outlined` alors que le code a `outlined` / `subtle` / `bold`
  et `color`. `neutral` est liée à `DEPRECATED-card/color/background/neutral` → `surface/sunken`,
  donc invisible sur une page sunken. Aucune élévation sur la variante par défaut. Le slot de
  contenu est à hauteur fixe (72 px) : il faut le passer en hug à chaque instance.
- **ModalDialog** : le booléen `isBlanketHidden` est inversé. À `true` (valeur par défaut), le
  voile est affiché, à `false` il est masqué. Renommer la propriété (`showBlanket`) ou inverser
  sa liaison. Pas d'étirement de la boîte au redimensionnement (largeur fixe, vérifié le
  2026-11-24).
- **Field** : le slot `{children}` accepte un TextField mais ignore un Select (swap sans effet
  ni erreur). Le TextField imbriqué ne remplit pas la largeur du Field.
- **Menu** : sans fond propre (la surface est portée par Popover), contenu d'exemple
  (« Option », « Heading item ») à remplacer. À documenter ou à corriger.
- **TextField** : l'état `filled` affiche une bordure bleue de focus. L'état rempli au repos est
  `rest`, nom peu parlant à côté de `filled`.

## Audit des stories : tokens et composants hors DS (2026-11-24)

Corrigé dans la PR « welcome boldest » : tokens inexistants (Icon `--border-focus`,
`--border-success`, Divider/Grid `--font-size-ui-sm`, GuidelinesAnatomieListe `--radius-100`,
Couleur `--text-brand`), bloc d'aide Welcome passé sur `Card bold comete`, pastilles Personas sur
`IconTile`, tuile d'appIcon maison retirée, opacités du hero tokenisées. Reste :

- ~~**Token `--border-on-dark-surface`**~~ : FAIT (tokens 0.39.0), filets du hero Welcome dessus.
  Manquent encore `--border-on-light-surface` et toute la famille `background` en
  `on-*-surface`. Variable Figma `border/on-dark-surface` : FAITE (collection semantics).
- ~~**Bouton « Écrire sur Teams »**~~ : FAIT, `color="comete"` (choix d'Axel).
- ~~**Avatars du bloc d'aide**~~ : FAIT, `color="neutral"`.
- **`.heroAccent`** (Welcome) : un token de fond (`--background-warning-bold-default`) sert de
  couleur de texte.
- **Typography.stories** : valeurs de line-height recopiées à la main et fausses (H1 36 au lieu de
  40, H3 28 au lieu de 32, Body M 20 au lieu de 18). Lire la valeur calculée. La page n'utilise
  aucun composant DS (onglets, encart, titres) et ~130 px en dur.
- **Explorateurs Tokens, Logo, Illustration, Icon** : `<input type="search">`, `<button>` et
  onglets maison au lieu de `SearchField`, `Button`, `Tabs`, `ToggleButtonGroup`, ~135 px en dur
  dans Tokens.stories. `--text-disabled` (déprécié) affiché sans mention.
- **Breadcrumbs.stories:170** : bouton custom `outline: none` sans FocusRing (pas de focus
  clavier visible).
- **CalendarCell.stories** : recopie les styles du composant (`CellPreview`) au lieu de
  l'utiliser, a dérivé, et utilise `--icon-disabled` (déprécié).
- **Divers** : Statut (Stack bordé → Card outlined), Table (h3 stylé, point d'état en token de
  texte), Tag (points 8 px en dur), Stepper (`<button>` natif), `_guidelines` CodeChip → `Code`,
  PageTemplates.module.css (`rgba(255,0,76,…)`), `_rechercheGlobale` (repli `#fff3b0` inutile),
  démos sur fond sombre en px (Badge, Heading, Hero, Spinner, Text), échafaudages
  `div style={{display:"flex", gap: 12}}` au lieu de Stack/Cluster dans une quinzaine de stories,
  `<Icon size>` surchargé (~25 occurrences).
- **`customTheme.ts`** (manager Storybook) : 4 hex absents des tokens (#22427c, #39558a, #7488ab,
  #e9effa), le navy des tokens est #1e3661.
- **`--page-gutter`** : custom property interne de Page utilisée dans 7 stories, API non
  documentée.
- **Composants src** : tokens `--*-disabled` dépréciés encore lus par Tabs, TimePicker,
  ToggleButtonGroup, Calendar, Radio, Card. CalendarCell.module.css:133 pose `--border-comete-bold`
  en fond.
- ~~**ADR 0001**~~ : FAIT, addendum `boldest` et `on-dark-surface`.

## Navs, Banner, Button link (2026-11-20)

- ~~**Easing de la pastille glissante**~~ : FAIT, `easing.emphasized` (tokens 0.37.0, alpha.197).
- ~~**BottomNav, item ouvert (`isOpen`)**~~ : validé par Axel. La BottomNav n'a plus de pastille glissante (réduction / agrandissement par item, alpha.197).
- ~~**Snackbar `discovery`**~~ : FAIT, `announcement` (alpha.197, Figma compris).
- ~~**`--text-link-default`**~~ : FAIT, `Text color="link"` retiré (alpha.197).
- **Tokens `text.link.*`** : plus lus par aucun composant du DS. À déprécier puis retirer dans comete-design-tokens et dans Figma (vérifier d'abord les apps consommatrices).
- **Figma, variables `DEPRECATED-snackbar/color/discovery/*`** et `DEPRECATED-section-message/color/discovery/*` : plus liées à la Snackbar. Les autres variantes de la Snackbar restent liées à `DEPRECATED-snackbar/*` : à rebasculer vers les tokens de thème ou une couche `snackbar` propre.
- **Storybook, neutralisation des liens** : `preview.tsx` annule tout clic sur un lien `href="/…"` dans le document Storybook. Une future story qui voudrait tester une vraie navigation devra intercepter elle-même.
- **SideNav `:has()`** : les fonds survolé et appuyé de l'item sélectionné passent par `:has()` sur la pastille. Navigateurs sans `:has()` (avant 2023) : fond par défaut au survol, sans casse.

## Icon : couleur `on-comete` et liste du control (2026-11-20)

- ~~**comete-icons** : `IconColor` n'a pas de valeur `on-comete`~~ : FAIT, `on-dark-surface` en
  comete-icons 0.13.0. Card garde l'override `--icon-default` pour couvrir toutes les icônes enfants.
- ~~**Storybook Icon** : la constante `COLORS` est recopiée à la main~~ : FAIT, `ICON_COLORS`
  exporté par comete-icons 0.14.0 et consommé par la story.

## Surface vs background : reliquats (2026-11-20)

- ~~**`--background-default-*`** : nom trompeur depuis la doctrine~~ : FAIT, `--background-field-default` et `--surface-inverted` (tokens 0.36.0, alpha.196).
- **Autres contrôles à auditer** : tout `--surface-*` consommé par un composant qui n'est pas un
  contenant (InputContainer en hovered utilise `--surface-sunken-hovered` : champ ou surface ?).

## Tokens de composant Banner, Page, SideNav, BottomNav (2026-11-20)

- **Écarts Figma / code à trancher** : détail dans `comete-design-tokens/TODO.md` (fond et
  bordure du SideNav, ligne de description, titre de section, logo, fond de la barre
  compacte de PageBar). Reste en dur : la transition `100ms ease` du SideNav.
- **Surcharge de couleur d'icône par classe interne** : Banner et BottomNav colorent l'icône
  via `:global(.comete-icon--*)` ou `:global(svg)`, comme l'Avatar. Fragile si comete-icons
  renomme ses classes.
- **Fonds bold qui suivent le thème** (success, information, discovery, announcement) : texte
  en `text.inverted`, encre foncée en sombre. Lisibilité à vérifier fond par fond, comme
  pour critical.
- **Icon `color="disabled"`** lit `--icon-disabled` (déprécié) : l'Icon le pose encore dans un
  InputContainer désactivé. À migrer vers l'opacité avec les champs.

## Fiabilité / qualité

- **Polices : chargement à la charge des applications** (2026-11-19)
  Les tokens 0.29.0 ne gardent que Noto Sans (`--font-family-primary`) et Noto Sans
  Mono (`--font-family-code`), sans famille générique de repli. Le DS ne charge
  aucune police : Storybook les charge depuis Google Fonts (avant, il chargeait
  Poppins alors que le token pointait sur Noto Sans, donc le rendu dépendait des
  polices installées sur le poste). Chaque application doit charger les deux
  familles, sinon le navigateur retombe sur sa police par défaut. `Code` ajoute
  `monospace` en repli. Pistes : documenter le chargement dans le README, ou
  embarquer les polices (`@fontsource`) dans le paquet. Google Fonts envoie l'IP
  du visiteur à Google (point RGPD à valider pour les applications).

- ~~**comete-icons : couleurs `brand` et `comete` cassées** (2026-11-19)~~ corrigé dans
  comete-icons 0.12.0 (`--icon-brand-default`, `--icon-comete-default`, ajout de
  `brandBoldest` et `cometeBoldest`), consommé par le DS depuis alpha.190.

- **Couleurs de marque après tokens 0.26.0 (2026-11-19)**
  - ~~`BottomNav.Action` sur `brand-bold`~~ fait (alpha.186) :
    `--background-comete-bold-default`. Reste : le FAB n'a pas d'état hovered /
    pressed en CSS (fond fixe), à ajouter avec `--background-comete-bold-hovered/pressed`.
  - ~~Figma ≠ repo sur les valeurs `comete`~~ fait (tokens 0.27.0) : Figma réaligné sur
    le code, `border/brand` sans suffixe déprécié dans Figma.
  - **Or (`comete.yellow`)** : la page Welcome consomme des primitives brutes
    (`--comete-yellow-300/400/700/950`) faute de rôle sémantique d'accent. À migrer
    quand le rôle existera (lot C).
  - **Surfaces** : hiérarchie `background.surface.*` incohérente (voir TODO tokens).

- **Button et Avatar : tokens restructurés, Figma rebuild et migrations faits (2026-11-19).**
  Restes :
  - **Disabled en opacité pour les 24 autres composants** (73 usages des tokens
    `*-disabled`, dépréciés depuis tokens 0.24.1), un par un. Liste figée dans
    `src/tokens/deprecatedDisabledTokens.test.ts`. Éviter l'opacité imbriquée.
  - **Anneau de l'AvatarGroup** : défaut code `--background-surface-default` (suit le
    thème), Figma en #FFFFFF brut (faux en thème sombre, à surcharger par instance).
  - **Variables obsolètes restantes** dans le ❖ Avatar : `DEPRECATED-badge/*` (badges)
    et `DEPRECATED-focus-ring/*` (focus ring).
  - **Guidance ❖ Avatar** : le tableau mentionne encore les apparences round / square.
  - **Table Figma** : les avatars de la colonne User sont des avatars small redimensionnés
    à 14 px (surcharge héritée de l'ancien set).
  - **Rendus changés pour les consommateurs** : icône d'avatar colorée, une lettre en
    small, link-subtle neutral plus foncé au repos, selected sans anneau (sauf sur photo).
- **AutosaveIndicator absent du DS.** Le composant existe dans Figma (default / success /
  critical, desktop et mobile) et ses tokens `--autosave-indicator-*` existent, mais pas
  de composant React. À créer si les produits en ont besoin (un `Switch` documente déjà
  un usage d'enregistrement automatique).

- ~~**Button touch : padding-x hors de `control/padding-x/touch`**~~ fait (2026-11-18) :
  `control/padding-x/touch` à 16 px pour tous les contrôles, Button aliasé (tokens 0.22.0).
  Effet de bord : les champs touch gagnent 4 px de padding horizontal, à valider à l'œil.

- ~~**Spinner : pas de composant `Spinner` dans le code**~~ fait (2026-11-18), non livré.
  Restes :
  - **Livraison en deux temps** : tokens 0.23.0 à publier avant le DS. En local, le CSS
    des tokens est copié à la main dans `node_modules` (écrasé par tout `pnpm install`).
  - ~~**`DEPRECATED-spinner/*`** encore présentes dans Figma~~ supprimées (2026-11-18),
    aucun usage dans le fichier.
  - **`--spinner-color-default`** n'est consommé que par Figma : en code, `inherit` prend
    `currentColor`. À garder tant que Figma en a besoin (pas de `currentColor` en Figma).
  - **Comète : poids et fil principal.** Tracé animé d'environ 29 Ko par instance
    dans le DOM : à surveiller dans une liste. Animation SMIL sur le fil principal :
    peut saccader si la page est très chargée. Figma aligné le 2026-11-18 (4 poses
    clés, variantes `appearance=comete`).
  - **Apparence `comete` (jaune) : contraste insuffisant sur fond clair.**
    `#f8bf01` sur blanc ≈ 1,7:1, sous le seuil de 3:1 des composants graphiques
    (WCAG 1.4.11). À réserver aux fonds foncés ou aux usages où un libellé annonce
    déjà le chargement. Tokens `--spinner-color-comete-{light,dark}` et variables
    Figma `spinner/color/comete/*` créés (approuvés le 2026-11-18).
  - **Le ❖ Spinner Figma n'a pas de taille 32 px** : l'instance du Button touch est
    redimensionnée par variable.
  - **Champs `TextField` / `Select`** : spinner fixe à 16 px quelle que soit la densité.
    À aligner sur `--control-icon-*` si voulu.

- **Button : contrôles visuels à faire** (2026-11-18)
  Icônes à 24 px en default et 32 px en touch, labels Body/S et Body/L : vérifier les
  icon-only (icône 24 dans 32, 32 dans 48) et le compact en Body/S (12 px, lisibilité).
  Les styles `Body/M/Medium Underline` (lh 18) et `Body/M/Medium` (lh 20) divergent :
  les nouveaux styles S et L suivent le Medium de leur taille.

- ~~**Figma ❖ Button rebuild : link focus à souligner**~~ fait côté Axel (2026-11-15)
  `appearance=link, state=focus` (iconOnly=false) est maintenant `Body/M/Medium
Underline`, aligné sur le code (underline en hover/pressed/focus).
  ~~Reste mineur : `link, state=default, iconOnly=true` encore en style `Underline`~~
  fait (2026-11-15) : tous les labels icon-only (masqués) uniformisés en
  `Body/M/Medium`, y compris `link` / `link-subtle` et les clones compact/touch.
  Tous reliés à la propriété `✏️ label` (les clones l'avaient perdue).

- ~~**Page : gouttières code désynchronisées de Figma**~~ fait (2026-11-10)
  Gouttière unifiée côté code : `--page-gutter` responsive (12 px par défaut,
  24 px en `min-width: 1200px`) appliquée à `.bar`, `.toolbar` et `.body`,
  `--page-header-gutter` supprimé. Description du ❖ Page dans Figma réalignée
  sur la géométrie réelle (12/12/24). Build + 1353 tests + lint verts.

- **Rebuild Button Figma : styles de label par variant (2026-11-10, en cours)**
  Bug Figma : le style de texte se propageait entre variants partageant la propriété
  liée `characters`. Fix appliqué sur `19940:889` : **détacher** `characters` des 910
  labels puis assigner les styles par variant (link `Underline`, link-subtle
  `Underline Subtle`, reste + selected `Body/M/Medium`). Coexistence OK, tokens de
  couleur préservés. **Reste** : Axel vérifie, puis **recréer la propriété `label`
  (TEXT) et la réassigner** aux 910 labels (actuellement le texte n'est plus éditable
  via propriété). La migration des ~1150 instances cible toujours `19940:889`.

- **Stories Storybook : libellés de variantes (2026-11-09)**
  Helper `Labeled` / `LabeledRow` / `Legend` (`stories/_labeled.tsx`) généralisé et
  légendes homogénéisées (12 px, `--text-subtle`, sous l'instance). Restes :
  - **Valeurs non brutes** : `Tag` AllColors (« Purple », « Blue Grey » pour
    `accentPurple`, `accentBlueGrey`), `Select` AllStates, `Heading`/`Hero` Align et
    `CalendarCell` (libellés français) : jugés auto-descriptifs, pas relabellisés.
  - **`Banner` AllAppearances** en layout `fullscreen` : le libellé est collé au bord
    gauche du viewport, pas de gouttière.
  - **Fonds sombres des variantes `inverted`** : `Icon` garde
    `--background-brand-bold-default`, `Logo` garde `--background-default-inverted`,
    `Badge` cutout utilise `--background-neutral-bold-default`. Trois tokens pour un même
    rôle « tuile sombre de démo » : unifier si l'on veut une homogénéité stricte.
  - **`Tag` FullMatrix** : l'en-tête de shape a perdu sa hiérarchie (même style que
    l'en-tête d'appearance).
  - **`clip-path` en attribut JSX** : corrigé dans les sources de `comete-icons`
    (générateur + 20 icônes) et `comete-illustrations` (générateur + 2 illustrations),
    non commité ni publié. Reste : livrer les deux paquets (tag → CI) puis bumper le DS
    et le Storybook. Côté icônes, le dossier local `svg/` contient des SVG bruts non
    optimisés : `pnpm generate` seul produit des couleurs hardcodées, toujours passer par
    `pnpm pipeline` (sync → optimize → generate → build).
  - **Fragilités hors périmètre** : `ScrollArea.stories.tsx` utilise `React.ReactNode`
    sans import de `React` ; `ProgressIndicator` WithNavigationButtons appelle
    `useState` dans un `render` anonyme (règle des hooks respectée par chance).
  - **`comete-illustrations` : `pnpm lint` (biome) échoue** sur le formatage de
    `.claude/settings.local.json` (préexistant, hors de la correction clip-path).

- **`Button` link / link-subtle en texte pur + couleur link (2026-11-09)**
  Faiblesses relevées après le passage de `link` à `--text-link-*` et le retrait
  des fonds hover/press sur `link` / `link-subtle` :
  - **Accessibilité** : `link` par défaut (#0076d8) sous le seuil AA sur les fonds
    `comete-subtlest` / `information-subtlest` (3,9:1), cf. la note « Lien sur fond
    comete-subtlest » plus bas. Un bouton `link` posé sur ces surfaces est concerné.
  - **Couleur d'icône de `link` par défaut** : `resolveIconColor` renvoie encore
    `default` (icône sombre) alors que le texte est maintenant bleu link. Pas de
    régression interne (aucun bouton `link` interne n'a d'icône), mais mismatch
    possible côté consommateur. Correctif propre = couleur d'icône `link` dédiée
    dans `@aexae/comete-icons` (repo séparé, création de token à approuver), ou
    mapper `link`+`default` sur `information` en attendant (approximation).
  - **Feedback des liens sémantiques** : hover/press sans fond, feedback via
    épaississement du soulignement uniquement (pas de token de texte survolé par
    couleur sémantique). À valider visuellement en Storybook.
  - **État `selected` de `link-subtle`** : conserve volontairement une puce de fond
    (`background-selected-subtlest-*`), car la consigne ne visait que hover/press.
    À rouvrir si un texte pur est voulu aussi en `selected`.
  - **Contraste des couleurs `subtle` / `subtlest` sans fond** : depuis le retrait
    du fond au repos (apparence `contained`), le texte `--text-subtlest` repose
    sur le fond de page. À vérifier sur fonds clairs et sombres (seuil AA 4,5:1) ;
    `subtlest` est volontairement peu contrasté et peut passer sous le seuil hors
    contexte bouton-icône. Usage à cadrer dans les guidelines (réservé IconButton).
  - ~~**Pilote tokens Figma `Button-test`** : variables `button/link/*/background/*`
    à retirer, `button/link/default/text/*` à pointer vers `text/link/*`~~ fait
    (2026-11-09) : 4 variables de fond `link` supprimées, `link/default/text/{default,
hovered}` repointées vers `text/link/{default,hovered}`, ajout de
    `button/link/default/text/pressed` -> `text/link/pressed`, spécimens
    comete/critical hover+press vidés de leur fond. Validé en capture (clair/sombre).

- **Storybook GitHub Pages : chunks supprimés à chaque déploiement** (2026-10-23)
  `deploy-pages` remplace tout l'artefact à chaque push sur `main` : les anciens assets
  hashés disparaissent. Un onglet ouvert (ou un `iframe.html` en cache, max-age=600)
  échoue avec "Failed to fetch dynamically imported module". Palliatif ajouté :
  rechargement auto sur `vite:preloadError` (`storybook/.storybook/preview-head.html`).
  Limites : pendant les 10 min de cache HTTP, le rechargement peut resservir l'ancien
  `iframe.html` (la garde de 30 s évite la boucle, l'erreur peut alors rester affichée).
  Pistes : conserver les assets du déploiement précédent (déploiement via branche
  `gh-pages` sans nettoyage, ou fusion de l'ancien `assets/` dans l'artefact) ;
  déployer moins souvent (sur tag de release plutôt qu'à chaque push).

- **Fallbacks des tokens `--control-*` codés en dur dans les CSS Modules** (2026-10-21)
  `Button.module.css` et `InputContainer.module.css` écrivent
  `var(--control-height-touch, var(--size600))` (idem radius, icon, padding).
  Le fallback recopie la valeur actuelle du token de `comete-design-tokens`.
  Si le token change de valeur, le fallback diverge sans bruit.
  ~~Piste : test d'existence des tokens consommés~~ fait (`src/tokens/cssTokens.test.ts`).
  Reste : retirer les fallbacks devenus inutiles (la garde détecte un token disparu).

- **Noms de tokens construits dynamiquement non vérifiés** (2026-10-21)
  `Stack`, `Cluster`, `Grid`, `Bleed` composent `var(--space${gap})` dans le TSX. La garde
  d'existence ne peut pas les vérifier statiquement. Piste : test qui itère sur les valeurs
  du type `Space` et vérifie que chaque `--space<valeur>` existe dans les tokens.

- ~~**`--radius125` : correctif Avatar en attente de publication**~~ fait, tokens 0.19.0 (2026-10-21)

## Environnement

- ~~**`NPM_AUTH_TOKEN` du shell sans accès à `@aexae/comete-logos`**~~ fait (2026-10-21) :
  `~/.zshrc` exporte `$(gh auth token)`, ancien PAT retiré des `.env` et de `~/.npmrc`,
  puis révoqué sur GitHub (2026-10-23).

- **`node_modules` désynchronisé du lockfile** (2026-10-21)
  Tokens 0.13.2 installés alors que le lockfile demandait 0.17.0. Les tests tournaient
  contre une vieille version des tokens. Piste : `pnpm install --frozen-lockfile` en
  pré-test local, ou un check de version dans `test.setup.ts`.

- **Storybook 11 : à évaluer à la sortie stable** (2026-11-19)
  La page « What's new » annonce Storybook 11 en bêta, sortie stable prévue en décembre 2026.
  Intérêts pour ce dépôt : skills officiels pour agents (`component-docs`, `write-stories`,
  `test-stories`, `ui-review`) utilisables sans Storybook lancé, CLI `storybook tools`,
  docgen React via `react-component-meta`, stories typées en CSF 4 (codemod, CSF 3 conservé).
  Ne pas passer à la bêta : version majeure avec changements cassants, alors que la 10.6.7
  vient d'être stabilisée. À la sortie stable, vérifier la compatibilité de
  `@storybook/addon-designs`, de Chromatic et des 613 tests de stories.

- **CI : `playwright install --with-deps` dépend des miroirs Ubuntu** (2026-11-19)
  Le job « Lint, Test & Build » a échoué deux fois de suite sur la PR #360 (miroirs
  `azure.archive.ubuntu.com` et `security.ubuntu.com` en 503 ou injoignables) avant de
  passer au troisième essai. Pistes : exécuter le job dans l'image Docker officielle de
  Playwright (navigateurs et dépendances système préinstallés), ou mettre en cache
  `~/.cache/ms-playwright` et n'installer les dépendances système qu'en cas d'échec.

- **`storybook/.claude/settings.local.json` : `bypassPermissions` + `Bash(*)`** (2026-11-19)
  Dans le dossier `storybook/`, Claude Code exécute toute commande sans confirmation
  (`git push`, `git tag`, `rm -rf`…). Seuls `pnpm publish` et `npm publish` restent en
  `ask`. Pistes : repasser en mode par défaut avec une liste `allow` ciblée, ou ajouter en
  `ask` / `deny` les commandes à risque (`git push*`, `git tag*`, `rm -rf*`,
  `gh pr merge*`). Fichier local ignoré par git (`**/.claude/`), donc propre à ce poste.

- **ESLint 10 bloqué par `eslint-plugin-react`** (2026-11-19)
  Essai fait : avec `eslint` 10.15.0, le lint plante (`contextOrFilename.getFilename is
not a function` dans `eslint-plugin-react` 7.37.5, sa dernière version).
  `eslint-plugin-jsx-a11y` 6.10.2 ne déclare pas non plus ESLint 10. On reste en 9.39,
  signalée « no longer supported » à l'installation. À retenter quand les deux plugins
  publient une version compatible, ou en remplaçant `eslint-plugin-react` par
  `@eslint-react/eslint-plugin`.

- **Peer `@aexae/comete-design-tokens` trop étroit dans icons et logos** (2026-11-19)
  `comete-icons@0.11.1` et `comete-logos@0.15.0` déclarent `^0.17.0`, qui en 0.x ne
  couvre que 0.17.x. D'où l'avertissement `pnpm peers check` avec les tokens 0.23.0.
  Le correctif est dans ces deux dépôts (peer en `>=0.17.0`) et demande une publication
  de chacun. Rien à faire côté DS.

- **`tools/powerbi-kit` figé sur logos 0.12.4 et tokens ^0.13.0** (2026-11-19)
  Essai de passage en `latest` annulé : logos 0.15.0 a renommé l'apparence `inverse` en
  `inverted`, `tsc` échoue dans `src/logos.ts`. Le kit lit aussi les classes CSS internes
  des logos et les noms de tokens : une migration demande de revérifier les sorties
  (`pnpm verify`, PNG, thème). Tant qu'il reste figé, le second avertissement de peers
  (tokens 0.13.2) persiste.

- **`src/vitest-jest-dom.d.ts` : rustine de typage à retirer** (2026-11-19)
  `@testing-library/jest-dom` (6.9 comme 7.0) n'est pas typé pour Vitest 5. Le fichier
  rebranche les matchers DOM sur `Matchers<R, T>`. À supprimer dès que jest-dom suit.

- **Node local 25 hors plage supportée par Vitest 5** (2026-11-19)
  Vitest 5 annonce `^22.12 || ^24 || >=26`. Tout tourne en 25.8.1 et la CI est en 22,
  mais le poste local est sur une version impaire non LTS. Piste : passer en Node 24.

- **TypeScript 7 bloqué, on s'arrête en 6.0** (2026-11-19)
  `typescript-eslint` 8.73 exige `<6.1.0`. TypeScript 7 (réécriture native) demande
  aussi de vérifier `tsup` (bundle des `.d.ts`) et `typed-css-modules`. À retenter
  quand `typescript-eslint` l'annonce.

- **Dist produit par Vite 8 (Rolldown) : écarts à surveiller** (2026-11-19)
  CSS et exports publics identiques à ceux de Vite 7 (comparaison fichier à fichier),
  `publint` vert. Trois écarts : les chunks de locals s'appellent `X.module.js` (avant
  `X.module.css.js`), le JS pèse environ 13 % de plus (commentaires JSDoc conservés,
  `minify: false`), et les 4 barrels d'entrée n'ont plus de sourcemap. Non testé dans
  une application consommatrice : à valider sur une alpha avant diffusion large.
  Piste poids : retirer les commentaires à la sortie (`output.comments` de Rolldown).

- **Node local 25 hors plage de `tsup` 9 et `jsdom` 31** (2026-11-19)
  Comme Vitest 5, ils annoncent `^22 || ^24 || >=26`. Tout tourne en 25.8.1, la CI est
  en 22. Raison de plus pour passer le poste en Node 24.

- **`@testing-library/jest-dom` 8 disponible** (2026-11-19)
  Installé en 7.0.1 (la 8.0.0 est trop récente pour `minimumReleaseAge`). À essayer :
  elle pourrait rendre `src/vitest-jest-dom.d.ts` inutile.

- **`toHaveStyle` peu fiable sous jsdom 31 pour les tokens** (2026-11-19)
  `getComputedStyle` résout désormais les `var()` (token absent en test = `0px`) et
  convertit les `rem`. Quatre assertions (FocusRing, ScrollArea) lisent maintenant le
  style inline. Règle pour les prochains tests : `element.style.x` pour une valeur
  posée en inline, jamais `toHaveStyle` avec un `var()`.

- **Chromatic : quota du plan atteint** (2026-11-19)
  Chromatic 18 fonctionne en CI (« Visual tests » et « Storybook Publish » verts, PR
  #363). Mais le statut « UI Tests » reste en attente avec « Update your plan to resume
  testing » : le quota de snapshots du plan est épuisé, la comparaison visuelle ne
  tourne plus. Régressions visuelles non détectées tant que le plan n'est pas relevé
  ou le quota renouvelé. Piste : TurboSnap (`onlyChanged`) pour réduire la
  consommation.

- **Chromatic : projet rattaché au compte perso Naxit** (2026-11-19)
  Le projet (appId `69bb5bbd483eecaff6adc69c`) a été créé le 19/03/2026 sous le compte
  Chromatic personnel. Le token (`CHROMATIC_PROJECT_TOKEN` et `storybook/chromatic.config.json`)
  désigne ce projet, donc la facturation et le quota sont ceux du compte perso (cause
  probable du quota épuisé ci-dessus). Constaté dans Chromatic : le compte `aexae`
  existe (plan Free 5 000 snapshots/mois, 0 utilisé) avec un ancien projet
  `comete-design-system` (appId `685bae95c4baf249a1369566`, 2 builds) dont le lien GitHub
  est cassé (token du compte `developpeurcomete` expiré). Aucune option de transfert
  libre-service dans Manage › Configure. Action : basculer la CI sur le projet `aexae`
  (secret + config), relier le dépôt à ce projet, puis supprimer ou délier le projet Naxit.
  Le compte `aexae` étant aussi en Free, le quota sera de nouveau atteint sans plan
  payant ni TurboSnap.

- **Chromatic : synchro GitHub portée par un compte personnel**
  La synchro GitHub d'un projet Chromatic utilise le token OAuth d'un collaborateur.
  Celui du projet `aexae` appartenait à `developpeurcomete` (compte Gmail générique
  partagé), désormais invalide. `developpeurcomete` n'apparaît plus dans les
  collaborateurs du compte `aexae`. Le compte Chromatic `aexae` est synchronisé par
  `CometeAdminGit` (Admin, token valide). Action : se connecter à Chromatic avec
  `CometeAdminGit` et faire « Replace with your token » sur le projet, plutôt qu'un
  token nominatif (départ de la personne = synchro cassée).

- **Sécurité : token Chromatic en clair dans le dépôt**
  `storybook/chromatic.config.json` contient `projectToken` en dur (commité depuis le
  19/03/2026), doublon du secret CI. Le retirer du fichier, régénérer le token dans
  Chromatic (il reste dans l'historique git) et passer par `CHROMATIC_PROJECT_TOKEN`
  en local aussi.

## Emails (relevé sur le modèle « RFE point d'étape », 2026-10-21)

Motifs utilisés dans les emails clients sans équivalent dans le DS. Le modèle
de référence est dans SharePoint › 7-Communication › `_Marque & Charte Comète/Emails/`.

- **Liste à puces éditoriale**
  `List` est une liste d'interface (`ListItem`, `ListItemIcon`, `ListItemText`) et n'affiche
  pas de puces. Les emails, la documentation et la Comète Académie ont besoin d'une liste
  de texte simple (puces, numéros), stylée sur `Text`. Piste : variante `List kind="bullet"`
  ou composant `TextList`.

- **Pied de page et structure d'email**
  Aucun composant pour le gabarit d'email : fond de page, carte de 600 px, bandeau,
  pied de page (logo société inverse, adresse, liens), mention de réception. `Page`
  correspond à une page d'application. Piste : documenter un gabarit d'email (HTML en
  tableaux, styles en ligne) plutôt qu'un composant React.

- **Lien sur fond `comete-subtlest` sous le seuil AA**
  `text-link-default` (#0076d8) sur `background-comete-subtlest-default` (#dceefd) fait
  3,9:1, sous 4,5:1. Même problème sur `background-information-subtlest-default` (#ddf1ff,
  3,95:1), donc dans `SectionMessage information` et `Card subtle comete`. Dans l'email,
  contournement par `Text` default souligné. Piste : couleur de lien dédiée aux fonds
  subtlest, ou règle d'usage dans les guidelines de `Card` et `SectionMessage`.

- **Outillage : suites de la montée Storybook 10.6.8 et ESLint 10 (24/11/2026)**
  - `eslint-plugin-react` 7.37.5 et `eslint-plugin-jsx-a11y` 6.10.2 ne déclarent pas ESLint 10
    (peer non satisfait, `pnpm peers check`). Ils tournent grâce à `fixupPluginRules`
    (`@eslint/compat`) dans les deux `eslint.config.mjs`. À retirer dès qu'une version
    compatible sort. Si `eslint-plugin-react` reste sans support, évaluer
    `@eslint-react/eslint-plugin`.
  - `typed-css-modules` 0.9.1 (dernière version, projet peu actif) épingle `glob` ^10,
    déprécié avec failles publiées. Contourné par un `overrides` dans `pnpm-workspace.yaml`
    (`glob` ^13). Outil de build uniquement, pas d'exposition à l'exécution. Piste : remplacer
    `tcm` par un outil maintenu, ou retirer l'override quand `tcm` suit.
  - Storybook 10.6.8 ne corrige pas la course de l'indexeur décrite ci-dessus (ses notes de
    version ne couvrent que `preview-stats.json` et le préchargement des stories). Le
    contournement reste le redémarrage.
  - Retards restants, non traités ici car hors demande et à risque : `typescript` 7 (bloqué
    par `typescript-eslint`, peer `<6.1.0`), `react-aria-components` 1.17 vers 1.22,
    `playwright` 1.60 vers 1.65 (épinglé, à aligner avec l'image CI) et la version 8 de
    `@testing-library/jest-dom`. Renovate est configuré mais ces retards s'accumulent :
    vérifier qu'il tourne bien sur le dépôt.
  - `@aexae/comete-logos` est en `latest` (racine et Storybook) : installation non
    reproductible hors lockfile, et `logos` 0.15.0 attend `tokens` ^0.17 alors que le DS est
    en 0.37 (peer non satisfait). Épingler une version et réaligner le peer côté `comete-logos`.
  - `tools/powerbi-kit` reste sur `tokens` 0.13.2 et `logos` 0.12.4, incompatibles avec
    `icons` 0.14.0 (peer `>=0.33.0`).
  - Shell de Claude Code : la fonction `pnpm` (et `npx`) appelle `_with_npm_token`, absente
    du snapshot. Les commandes échouent sauf à appeler `/opt/homebrew/bin/pnpm` avec
    `NPM_AUTH_TOKEN` exporté. À corriger dans le profil zsh (définir la fonction avant les
    alias, ou la rendre disponible en shell non interactif).
