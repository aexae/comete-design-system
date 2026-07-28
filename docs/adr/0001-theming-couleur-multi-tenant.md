# ADR 0001 — Theming couleur multi-tenant (comète / brand)

- **Statut** : Accepté
- **Date** : 2026-07-28
- **Décideurs** : Axel Cremont
- **Portée** : `@aexae/comete-design-tokens`, `@aexae/comete-design-system`

## Contexte

Comète est l'éditeur ; chaque **client** a sa propre couleur primaire (sa charte).
Le DS servait jusqu'ici une unique famille de tokens `brand-*` (le bleu Comète),
utilisée à la fois comme couleur d'**affordance** (boutons, tags, sélection…) et
comme couleur d'**identité**. En multi-tenant, laisser la couleur client piloter les
affordances pose deux problèmes :

1. **Sens des couleurs** — un bouton primaire qui prend la teinte du client peut se
   lire comme un statut (un primaire rouge = « danger »). L'affordance et l'identité
   se télescopent.
2. **Accessibilité** — une teinte client arbitraire ne garantit pas le contraste AA
   sous du texte, en clair comme en sombre.

## Décision

Séparer deux concepts, portés par deux familles de tokens distinctes.

| Famille | Rôle | Surchargée par le client ? |
|---|---|---|
| `comete-*` | Couleur **fixe** de l'éditeur : affordances interactives **et** identité Comète (navy). | **Non** — propriété du DS. |
| `brand-*` | **Charte couleur du client**. Défaut = navy Comète. | **Oui** — au runtime. |

**Principe directeur (École A)** : *les éléments interactifs ne suivent jamais la
charte client.* Ils consomment `comete-*` (fixe). La couleur client (`brand-*`)
n'apparaît que sur des **surfaces d'identité ambiantes** (Card, Bleed, IconTile,
Text) — grandes, passives, non porteuses d'affordance ni de statut.

Litmus : *plus un élément est petit et interactif, moins la marque y a sa place ;
plus une surface est grande et ambiante, plus elle y est bienvenue.*

`--*-accent-<couleur>-*` (teal, purple, magenta…) reste un namespace **catégoriel
décoratif** indépendant, non concerné.

## Phase 1 — le split (livré : tokens 0.13.0, DS 1.0.0-alpha.142)

- Renommage `brand-* → comete-*` (mêmes valeurs, navy).
- Réouverture de `brand-*` avec le nouveau sens (charte client, défaut navy).
- Suppression de l'ancienne famille `client-*` (background-only, incohérente).
- API : `comete` seul sur Button/Tag/ProgressBar ; `comete` + `brand` sur
  Card/Bleed/IconTile/Text ; sélection du Calendar repassée sur `comete`.

## Phase 2 — le runtime multi-tenant (cet ADR)

Un `BrandProvider` génère, à partir d'une **seule couleur HEX** fournie par le
client, l'ensemble de la famille `brand-*` et l'injecte au runtime.

### Génération

1. Conversion du HEX en **OKLCH** (espace perceptuellement uniforme).
2. Construction d'une rampe tonale à **luminosité normalisée par rôle** : la teinte
   (H) et la saturation (C) viennent du client, mais la **luminosité (L) de chaque
   rôle est fixée par le DS** (le `bold` reste sombre en thème clair, clair en thème
   sombre, etc.), avec clamp de gamut sRGB.
3. Conséquence clé sur l'**accessibilité** : comme `L` est normalisée par rôle, les
   fonds `bold` restent toujours suffisamment contrastés avec le texte inversé
   existant (`--text-inverted`, qui bascule déjà par thème). **Aucun token on-color
   ni changement de composant n'est nécessaire.** Une charte client claire (ex. jaune
   vif) est assombrie pour le rôle `bold` tout en conservant sa teinte — compromis
   assumé au profit du contraste.
4. Mapping des tokens `brand-*` (background bold/subtler/subtlest × états, border
   bold/subtle, icon, text) sur les paliers de la rampe, en miroir de la structure du
   bleu Comète, pour les thèmes clair **et** sombre.

### Injection

- `brandThemeToCss(seed, { scope })` produit deux blocs CSS
  (`[scope] { … }` et `[scope][data-theme="dark"] { … }`).
- `<BrandProvider seed name?>` :
  - avec `name` → scope `[data-brand="<name>"]` sur un wrapper `display:contents`
    (plusieurs tenants peuvent coexister sur une page) ;
  - sans `name` → override `:root` (mono-tenant par déploiement).
- Fonction de génération **pure** → mémoïsable par seed. Le `<style>` est rendu dans
  l'arbre (SSR-safe, pas de flash côté serveur si le seed est résolu à la requête).

## Conséquences

- **+** Une couleur client par HEX suffit ; contraste garanti par construction ;
  École A préservée (affordances jamais impactées).
- **+** Zéro dépendance externe (conversion OKLCH écrite en TS dans le DS).
- **−** La teinte client est **normalisée en luminosité** par rôle : le rendu `bold`
  d'une marque très claire est assombri (teinte conservée, pas la clarté).
- **−** `brand-*` ne s'affiche que sur les 4 composants ambiants ; un CTA « héro »
  voulant la couleur client relèverait d'une exception (École B) hors de cet ADR.

## Alternatives écartées

- **Nom `accent`** pour la couleur interactive : rejeté, `--*-accent-<couleur>-*` est
  déjà un namespace catégoriel décoratif.
- **École B (la marque EST l'accent interactif)** : plus puissant mais rouvre le
  télescopage sens/identité et multiplie les cas d'échec de contraste.
- **Générateur de palette type Tailwind (rampe HSL)** : perceptuellement inégal et
  non *contrast-aware* ; OKLCH + L normalisée par rôle est retenu.
