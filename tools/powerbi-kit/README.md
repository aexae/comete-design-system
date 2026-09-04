# powerbi-kit, générateur du kit Power BI Comète

Génère, depuis les sources du design system, un kit prêt à l'emploi pour un
rapport Power BI : icônes en data URI, logos vectoriels et rasterisés, thème de
rapport dérivé des design tokens.

Workspace interne, non publié. Le livrable est le contenu de `dist/`.

```bash
pnpm install                # depuis la racine du dépôt
pnpm --filter @aexae/comete-powerbi-kit build
```

Le kit est écrit dans `dist/` (ignoré par git : c'est un artefact regénérable).

## Ce que le générateur doit rejouer

Power BI n'exécute ni CSS ni script : un SVG doit être autonome. Trois
mécanismes du design system reposent sur le CSS et sont donc rejoués ici.

| Mécanisme | Où | Traitement |
|---|---|---|
| `fill="currentColor"` sur les icônes | `icons.ts` | remplacé par le placeholder `__COLOR__`, substituable en DAX |
| `var(--token)` (duotone, logos) | `tokens.ts` | résolu en hex depuis `comete-tokens.css` |
| Deux corps SVG `__light` / `__dark` par icône produit | `logos.ts` | le corps masqué par `logos.css` est supprimé |

À quoi s'ajoute la composition : un logo complet n'est pas un SVG mais
plusieurs `<svg>` assemblés en HTML par `LogoFrame`. `compose.ts` rejoue ce
placement, que `LogoFrame` exprime déjà entièrement en pixels, et réémet un
SVG unique, en renommant au passage les identifiants de dégradé, que React
génère identiques d'un sous-SVG à l'autre.

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/main.ts` | point d'entrée, pose le stub CSS puis lance la génération |
| `src/build.ts` | orchestration et écriture de `dist/` |
| `src/icons.ts` | rendu SSR des icônes → SVG plats |
| `src/logos.ts` | rendu SSR des logos, choix du corps visible, résolution des couleurs |
| `src/compose.ts` | aplatissement du markup multi-SVG en SVG unique |
| `src/tokens.ts` | lecture de `comete-tokens.css`, résolution des `var()` |
| `src/datauri.ts` | encodage data URI compatible Power BI |
| `src/png.ts` | rasterisation (resvg) |
| `src/theme.ts` | thème de rapport depuis les tokens |
| `src/readme.ts` | README livré au consultant |
| `src/css-stub.ts` | neutralise les imports CSS des packages sous Node |

## Configuration

**`config/icons.json`**, sélection d'icônes exportées.
La liste actuelle est **provisoire** : elle doit être remplacée par les icônes
réellement identifiées dans Comète BI. `"names": "*"` exporte les 422 icônes du
package, ce qui est utile pour explorer mais peu exploitable comme livrable.

**`config/logos.json`**, logos, formats et densités PNG.

**`config/theme-base.json`**, structure du thème de rapport.
**`config/theme-tokens.json`**, mapping `chemin JSON → token`, appliqué sur la
structure ci-dessus. C'est le fichier à modifier pour changer une couleur du
thème : les valeurs viennent toujours des tokens, jamais d'un hex écrit à la main.

## Garde-fous

Le build échoue si une icône demandée n'existe pas dans le package, si une
`var()` survit dans un logo, ou si une valeur dépasse la limite de 32 768
caractères d'une URL d'image Power BI. Il avertit si un token du mapping de
thème est introuvable, ou si une couleur du thème ne correspond à aucun token.
