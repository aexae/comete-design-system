# TODO

## Fiabilité / qualité

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
  `~/.zshrc` exporte `$(gh auth token)`, ancien PAT retiré des `.env` et de `~/.npmrc`.
  **Reste : révoquer l'ancien PAT classic sur GitHub** (scopes `repo` + `write:packages`,
  sans expiration, toujours valide).
  `pnpm install` renvoie 403 sur `comete-logos@0.13.1` avec le token exporté dans le shell,
  alors que `gh auth token` y a accès. Mettre à jour la variable exportée.

- **`node_modules` désynchronisé du lockfile** (2026-10-21)
  Tokens 0.13.2 installés alors que le lockfile demandait 0.17.0. Les tests tournaient
  contre une vieille version des tokens. Piste : `pnpm install --frozen-lockfile` en
  pré-test local, ou un check de version dans `test.setup.ts`.

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
