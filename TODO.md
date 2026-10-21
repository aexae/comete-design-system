# TODO

## Fiabilité / qualité

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

- **`NPM_AUTH_TOKEN` du shell sans accès à `@aexae/comete-logos`** (2026-10-21)
  `pnpm install` renvoie 403 sur `comete-logos@0.13.1` avec le token exporté dans le shell,
  alors que `gh auth token` y a accès. Mettre à jour la variable exportée.

- **`node_modules` désynchronisé du lockfile** (2026-10-21)
  Tokens 0.13.2 installés alors que le lockfile demandait 0.17.0. Les tests tournaient
  contre une vieille version des tokens. Piste : `pnpm install --frozen-lockfile` en
  pré-test local, ou un check de version dans `test.setup.ts`.
