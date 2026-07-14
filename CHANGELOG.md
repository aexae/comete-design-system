# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit (à terme) le [versionnage sémantique](https://semver.org/lang/fr/).
Tant que le projet est en `1.0.0-alpha`, des changements cassants peuvent survenir
entre versions alpha.

## [Unreleased]

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
