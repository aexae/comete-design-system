# Décisions — comete-design-system

> Journal des décisions (date, décision, contexte / raison).

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
