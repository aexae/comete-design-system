# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit (à terme) le [versionnage sémantique](https://semver.org/lang/fr/).
Tant que le projet est en `1.0.0-alpha`, des changements cassants peuvent survenir
entre versions alpha.

## [Unreleased]

### Ajouté

- **Table** : nouveaux états et API absorbant des patterns jusqu'ici story-only :
  - `TableBody isNoResults` (+ `noResultsTitle`/`noResultsDescription`/
    `noResultsAction`/`noResultsState`) — état « aucun résultat » (recherche/
    filtre sans correspondance), distinct de `isEmpty` (aucune donnée). Nouveau
    `kind: "noResults"` sur l'état de données interne.
  - `Table.SelectionBar` (export `TableSelectionBar`) — barre contextuelle
    « N lignes sélectionnées » + actions groupées (`count`, `onClear`,
    `children`, `label`), masquée quand `count` vaut 0, compteur annoncé
    (`aria-live`).
  - `Table` : props `stickyHeader` (en-tête collant) et `maxHeight` (conteneur
    de défilement borné) — remplacent le wrapper + styles inline de la story.
  - `TableHeaderCell isActionColumn` — nom accessible masqué (« Actions ») pour
    la colonne d'actions, au lieu d'un placeholder vide (`&nbsp;`) inaccessible.
  - `hideBelow` (`"sm" | "md" | "lg"`) sur `TableHeaderCell` ET `TableCell` —
    colonnes responsives par **container queries** (largeur du container, pas
    du viewport) : dégradation desktop → tablette. À poser sur l'en-tête ET
    chaque cellule de la même colonne ; jamais sur la sélection ni les actions.
    Activé par la prop **`responsive`** sur `Table` (opt-in — établit le query
    container ; sans elle, aucun wrapper ni impact de mise en page). Type
    `TableHideBelow` exporté.

### Modifié

- **Table** : les flèches de tri des en-têtes triables ne s'affichent plus qu'au
  **survol** (et au focus clavier) ; la colonne actuellement triée garde sa
  flèche visible.

### Documentation

- Ajout de `CONTRIBUTING.md` — règle « une story peut détenir de l'état, jamais
  de la mécanique » (les API manquantes repérées en story s'absorbent dans le
  composant avant merge).

## [1.0.0-alpha.147] - 2026-08-04

### Corrigé

- **BottomNav** : le FAB central (`BottomNav.Action`) est désormais **parfaitement
  centré** — `.nav` passe en `box-sizing: border-box` (il débordait de 8px de son
  conteneur, décalant la barre). Les libellés d'items utilisent toute la largeur de
  la cellule (retrait du padding horizontal) → plus de troncature des libellés
  courants (ex. « Main courante »).

## [1.0.0-alpha.146] - 2026-07-30

### Changements cassants (BREAKING)

- **Page.Header** : composant **supprimé** (était `@deprecated`). C'était un
  sous-ensemble strict de `Page.Bar` (titre + `leading` + `trailing`), sans les
  variantes responsive ni l'intégration des actions globales du layout. Migration :
  remplacer `<Page.Header title leading trailing />` par `<Page.Bar title leading
  trailing />` ; pour un en-tête sans le trio d'actions globales, poser
  `globalActions={null}` sur la `Page`.

### Ajouté

- **Skeleton** : prop `decorative` — masque le skeleton aux lecteurs d'écran
  (`aria-hidden`, aucune région live), pour regrouper plusieurs skeletons sous une
  **seule** région d'état parente.
- **SideNav** et **BottomNav** : prop `aria-label` sur le repère `<nav>`
  (défaut « Navigation principale ») — indispensable quand plusieurs `nav`
  coexistent.

### Modifié

- **Card** : l'apparence `subtle` n'a plus d'ombre **au repos** (l'élévation
  n'apparaît qu'au hover/press pour les cartes actionnables). `bold` inchangé.
- **SideNav** : `SideNav.Trigger` expose `aria-expanded` ; `SideNav.Skeleton`
  n'émet plus qu'**une seule** région `role="status"` (au lieu d'une par
  placeholder) ; valeurs de contexte mémoïsées (moins de re-renders au survol).
- **BottomNav** : la `BottomNav.Action` centrale est réordonnée au centre du flux
  DOM (ordre de lecture = position visuelle).
- **Page** : valeur de contexte mémoïsée ; nettoyage de CSS/props/commentaires
  morts (reliquats de TopNav / Page.Header) dans Page, SideNav, BottomNav.

## [1.0.0-alpha.145] - 2026-07-30

### Changements cassants (BREAKING)

- **TopNav** : composant **supprimé** (relicat d'avant `Page.Bar`). Il faisait
  doublon avec `Page.Bar`, la barre de page unifiée qui remplace l'ancien duo
  TopNav + Page.Header. Migration : utiliser `Page.Bar` (titre + `leading` pour
  l'affordance de navigation + actions globales via `Page globalActions`).

### Ajouté

- **FilterChip** / **FilterChipRow** : nouvel organisme de **filtres rapides**
  (chips façon listing). Une chip = une facette : inactive (`outlined` +
  chevron), 1 valeur (`contained` + « Label : Valeur » via `valueLabel`), ≥ 2
  valeurs (`contained` + compteur) ; croix de retrait (cible clavier distincte).
  Le corps ouvre un panneau — **popover desktop** (application instantanée) ou
  **bottom sheet** mobile `size="auto"` (différée) selon `applyMode` (auto ou
  forcé). `FilterChipRow` compose la rangée : chips épinglées + chips
  **temporaires** (facettes actives non épinglées) + bouton « Filtres » à badge
  total ouvrant le panneau complet — invariant : jamais de filtre actif caché.
  État contrôlé côté consommateur. Complète le Drawer de filtres, ne le
  remplace pas.
- **Page** : prop `globalActions` — le layout porte lui-même les actions
  globales (notifications, réglages, avatar) et les injecte dans le `trailing`
  de chaque `Page.Bar` via contexte. Omise = trio de démo par défaut (+ `warn`
  en dev) ; `null` = aucune ; `ReactNode` = actions de l'app.
- **Button** : prop `collapseLabel` — réduit le bouton en **icône seule** (label
  masqué, `aria-label` requis) sous ~768px du conteneur ancêtre (`@container`),
  pour des toolbars responsives.
- **SideNav** : sous-composant `SideNav.FooterBrand` — enveloppe le logo de
  marque du footer avec un traitement discret (opacité réduite qui remonte au
  survol, taille bornée), en laissant `SideNav.Footer` neutre (pas d'opacité
  globale sur du contenu générique).
- **Button** : prop `shape` (`"round"` (défaut) | `"square"`) — contrôle la forme
  du rendu **icône seule** (icon-only ou `collapseLabel` réduit). `square`
  reprend les coins arrondis standard de la densité, pour aligner un bouton
  icône seule sur les boutons à label adjacents (ex. dans une toolbar).
- **Page.Toolbar** : slot dédié `search` (en plus de `start` / `end`) — le
  champ de recherche est traité à part par le layout et borné 160–240px : il se
  comprime jusqu'à 160px (placeholder préservé) quand la place manque, sans
  jamais tronquer ni descendre sur une seconde rangée. Optionnel,
  rétrocompatible (sans lui, comportement inchangé).
- **Card** : prop `isLoading` — remplace le contenu (`children`) par des
  squelettes ; carte marquée `aria-busy`, ni actionnable ni draggable pendant le
  chargement. `children` devient optionnel.

### Modifié

- **Page.Toolbar** : la barre reste sur **une seule ligne** à toutes les
  largeurs. Sous 768px (container `page`), les boutons `collapseLabel` passent
  en icône seule et la recherche se comprime jusqu'à son plancher — les actions
  ne passent plus jamais sur une seconde rangée.
- **Stories Page** : une seule story « Full page (responsive) » pilotée par
  l'addon Viewport (au lieu de cadres device en iframes) ; toolbar alignée sur
  la maquette Figma (recherche « Rechercher », Filtres/⋯ en icône seule
  `square`, primaire `comete` réductible en « + », Exporter masqué sous compact).
- **SideNav** : le *peek* (survol du Trigger en mode replié) s'affiche désormais
  en **overlay glissant** par-dessus le contenu (translateX + ombre légère) au
  lieu de pousser la mise en page — le contenu principal ne bouge plus. Il reste
  ouvert tant que le pointeur/focus sont sur le Trigger ou la nav.
- **SideNav** : corps interne **scrollable** (header et footer épinglés) ; la
  scrollbar n'apparaît qu'au survol de la nav (gouttière réservée → aucun
  décalage des items) et un indicateur de débordement discret signale le
  contenu masqué.
- **SideNav** : la hauteur du logo dans `SideNav.Header` est bornée (~40px, +
  largeur) quel que soit le ReactNode fourni.

## [1.0.0-alpha.144] - 2026-07-28

### Modifié

- **Button** (icon-only) : un bouton sans label (icône seule) est désormais
  **circulaire** (`--radius-round`) et **parfaitement carré** (largeur = hauteur) à
  toutes les densités — 24×24 (compact), 32×32 (default), 48×48 (touch), `inline`
  couvert aussi. `padding: 0` + `min-width` égal au `min-height` de la densité.

### Ajouté

- **États de données natifs** (chargement / vide / erreur) intégrés directement
  aux composants de collection : `Table` (via `TableBody` : `isLoading`,
  `skeletonRows`, `isEmpty`, `error`, `onRetry`, `columnCount`, slots
  `emptyState`/`errorState`), `List` (mêmes props + `skeletonItems`) et
  `Page.Body` (`isLoading`/`isEmpty`/`error`/`onRetry`). Le consommateur n'a plus
  à composer ces états à la main ; rendu unifié via `InformativeState` +
  illustrations `Empty` / `ConnexionError`.
- **SideNav** : sous-composants `SideNav.Skeleton` (+ `SideNav.ItemSkeleton`) pour
  l'état de chargement et `SideNav.Empty` pour l'état vide de la navigation.
- **BottomNav.Action** : nouveau bouton d'action central (FAB encoché) pour la
  `BottomNav`. La barre réserve automatiquement l'emplacement central lorsqu'une
  `BottomNav.Action` est présente. Règle de composition : exactement 2 items de
  chaque côté (2 + Action + 2). Un avertissement est émis en développement
  au-delà de 5 items de navigation (l'Action ne compte pas).
- **Drawer** : `size="auto"` (dimension ajustée au contenu) et fermeture par
  **glissement du handle** (`swipeable`, tous placements, seuil 40px).

## [1.0.0-alpha.143] - 2026-07-28

### Ajouté

- **BrandProvider** (multi-tenant) : nouveau provider qui applique la **charte
  couleur d'un client** au runtime à partir d'une seule couleur HEX. Il génère toute
  la famille de tokens `brand-*` (rampe OKLCH à luminosité normalisée par rôle, clair
  + sombre) et l'injecte, scopée à `[data-brand="<name>"]` ou à `:root`. Les éléments
  interactifs (`comete-*`) ne sont pas affectés (École A). Exporté depuis
  `@aexae/comete-design-system/providers`.
- Utilitaires de theming exportés : `generateBrandTheme(seed)` et
  `brandThemeToCss(seed, { scope })` (fonctions pures, sans dépendance externe).
- Documentation : ADR `docs/adr/0001-theming-couleur-multi-tenant.md` et page
  Storybook **Foundation/Couleur** (philosophie comète/brand/École A + démo live).

## [1.0.0-alpha.142] - 2026-07-28

### Changements cassants (BREAKING)

- **Couleur — séparation `comete` / `brand`** : la famille de tokens `brand-*`
  (bleu Comète) est renommée **`comete-*`** — couleur fixe, propriété du DS, jamais
  surchargée par le client (elle porte les éléments interactifs et l'identité Comète).
  Le nom **`brand-*`** désigne désormais la **charte couleur du client** (surchargeable
  au runtime, défaut = bleu Comète). Requiert
  `@aexae/comete-design-tokens@^0.13.0` (famille `comete-*` ajoutée, famille `client-*`
  supprimée).
- **Button**, **Tag**, **ProgressBar** : la valeur `brand` de `color` / `appearance`
  devient `comete`.
- **Card** : `color="brand"` (ancien bleu Comète) devient `color="comete"` ; l'ancienne
  `color="client"` devient `color="brand"` (charte client).
- **Page** : suppression de la prop `breadcrumbs` de `Page.Header`. Les breadcrumbs
  ne font plus partie du gabarit de page (alignement avec `Page.Bar`, qui n'en
  proposait déjà pas). Les consommateurs qui affichaient un fil d'Ariane doivent
  désormais le composer eux-mêmes dans le contenu de la page (`Page.Body`) ou en
  amont du `Page.Header`.

### Ajouté

- **Bleed**, **IconTile**, **Text** : nouvelle variante de couleur `brand` (charte
  client), en complément de `comete` (bleu Comète fixe).

### Modifié

- **Calendar** : la sélection (dates, plages, créneaux horaires) utilise désormais la
  couleur fixe `comete-*` au lieu de `client-*` — les éléments interactifs ne suivent
  pas la charte client.
- **BottomNav** : l'état sélectionné d'un `BottomNavItem` ne repose plus sur un
  fond ; seuls la couleur du texte et celle de l'icône changent.

## [1.0.0-alpha.141] - 2026-07-15

### Modifié

- **Accordion** : le trigger et le contenu ont désormais un fond plein subtil
  (`--background-neutral-subtlest-default`) et un padding vertical harmonisé
  (`--space100`). Le feedback hover/pressed du trigger est conservé.
- **Tag** : interlignage resserré (`--line-height-ui-xxs` → `--line-height-ui-xxxs`).

## [1.0.0-alpha.140] - 2026-07-10

### Corrigé

- **Switch** : conformité Figma des états *unchecked* (off). Le rail est désormais
  neutre (gris) pour **toutes** les apparences en off (fin des teintes
  `success/warning/critical-subtlest`) ; la couleur d'apparence n'apparaît qu'en
  checked / indéterminé. Pour `warning` / `critical` en off, le pouce devient un
  cercle plein coloré (`--background-warning-bold-default` / `--background-critical-bold-default`)
  avec un glyphe contrasté (`--icon-bold` / `--icon-inverted`).

## [1.0.0-alpha.139] - 2026-07-10

### Corrigé

- **Switch** : conformité Figma. Le label est désormais rendu à gauche et
  l'interrupteur à droite (label en `flex: 1`), au lieu de l'ordre inverse.
- **Switch** : les glyphes du pouce sont désormais fidèles au design — coche pour
  `success` (cochée), point d'exclamation nu pour `warning` / `critical` (au lieu
  de l'icône triangle « Warning »). Rendus en SVG inline (le « ! » nu n'existe pas
  dans `@naxit/comete-icons`), colorés via `--icon-success` / `--icon-warning` /
  `--icon-critical`.

## [1.0.0-alpha.138] - 2026-07-10

### Corrigé

- **Table** : le composant composé expose désormais un type nommable `TableComponent`
  (au lieu du type inféré `typeof TableRoot`, non exportable). Corrige l'erreur TS4023
  (« name 'TableRoot' … cannot be named ») qui remontait dans les stories et les apps
  consommatrices dès qu'elles référençaient `typeof Table`.

## [1.0.0-alpha.137] - 2026-07-10

### Changements cassants (BREAKING)

- **Hero** et **Heading** : la couleur `color="inverse"` devient `color="inverted"`,
  pour s'aligner sur la nomenclature de `Text` (`color="inverted"`) et sur le token
  sous-jacent `--text-inverted`.

### Ajouté

- **Hero** et **Heading** : nouvelles props `align` (`start` | `center` | `end`),
  `italic` (booléen) et `maxLines` (troncature multi-lignes avec ellipsis),
  alignées sur l'API de `Text`.

## [1.0.0-alpha.136] - 2026-06-25

### Changements cassants (BREAKING)

- **Badge** : l'apparence `primary` devient `information` et `primary-inverted` devient
  `information-inverted`, pour s'aligner sur les tokens réellement utilisés
  (`--background-information-*`) et sur les autres statuts (`success`, `warning`, `critical`).
- **ProgressIndicator** : l'apparence `primary` devient `neutral`, et son point sélectionné
  utilise désormais le token `--background-neutral-bold-default` (au lieu de la couleur brand).
- **CalendarCell** : `size="sm" | "lg"` devient `size="small" | "large"` pour s'aligner
  sur l'échelle de tailles du reste du design system.

### Ajouté

- **Banner** : nouveaux statuts `success` (vert) et `information` (bleu), en complément de
  `warning` / `critical` / `announcement`.
- Directive `"use client"` injectée dans tous les modules du bundle (compatibilité
  Next.js App Router / React Server Components).

### Corrigé

- **Banner** : l'icône est désormais résolue selon le statut (`warning` → Warning,
  `critical` → Report, `success` → CheckCircle, `information` → Info,
  `announcement` → Campaign) au lieu d'afficher systématiquement l'icône `Warning`.
- **Page** : exemple JSDoc corrigé (`Button` utilise `appearance` + `color`, pas `appearance="primary"`).
- **Calendar** : la largeur des cellules de date est désormais constante dans tous les états
  (default / hover / sélection / plage) — plus de saut de largeur lors de la prévisualisation
  d'une plage au survol.
- `package.json` : `sideEffects` passe de `false` à `["**/*.css"]` pour éviter que les
  bundlers (webpack) n'éliminent les imports CSS des composants.
- Documentation : README (licence AGPL-3.0-only, exemples Button à jour), `SECURITY.md`
  (politique réelle au lieu du template GitHub).

### Supprimé

- Dossiers de composants vides et non implémentés `MonthRangePicker` et `YearRangePicker`.
