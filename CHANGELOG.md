# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit (à terme) le [versionnage sémantique](https://semver.org/lang/fr/).
Tant que le projet est en `1.0.0-alpha`, des changements cassants peuvent survenir
entre versions alpha.

## [Unreleased]

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
