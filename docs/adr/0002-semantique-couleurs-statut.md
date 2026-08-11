# ADR 0002 — Sémantique des couleurs de statut

- **Statut** : Accepté
- **Date** : 2026-08-10
- **Décideurs** : Ruth Fuambi
- **Portée** : `@aexae/comete-design-system` — **tous** les composants porteurs
  de couleurs sémantiques (`Tag`, `Badge`, `IconTile`, `SectionMessage`,
  `Banner`, `Snackbar`, `ProgressBar`, `Text`, `Icon`), pas le seul `Tag`

## Contexte

Le `Tag` expose **11 couleurs** (`neutral`, `comete`, `success`, `warning`,
`critical`, `information`, et cinq `accent*`) sans qu'aucune doctrine ne dise ce
que chacune signifie. Conséquence mécanique : chaque écran arbitre pour
lui-même, et les mappings divergent. Quatre divergences déjà constatées :

1. Côté Link, `getOrderStatusColor` (commandes) et `PublicationStatus`
   (planning) ne suivent pas la même logique — le second met « Non publié » en
   rouge `error`, c'est-à-dire qu'un état d'attente y est traité comme un échec.
2. Côté Link toujours, les pointages fusionnent **statut temporel** et **statut
   de géolocalisation** dans une seule teinte, par concaténation de variantes.
3. Côté DS, `storybook/stories/Table.stories.tsx` contenait un
   `EVENT_STATUS_COLOR` codé en dur, avec du vocabulaire métier, qui mettait
   « En cours » en `success` et « Terminée » en `neutral`.
4. Côté DS toujours, la guideline du même composant énonçait un **quatrième**
   mapping, concurrent du précédent et lui aussi en vocabulaire métier
   (« Actif → success, Pause → warning, Hors ligne → neutral »).

Le troisième point est le plus révélateur : **personne n'avait arbitré**. Une
story de démonstration a fixé, de fait, la convention couleur de tout le
produit. Sans axe écrit, la première valeur posée devient la norme.

Le quatrième mérite une précision, parce qu'il ne relève pas de la même erreur.
Son « Actif → `success` » n'était **pas** faux : il décrivait un **cycle de
vie**, là où les autres mappings décrivaient une **progression**. Ce qui
manquait n'était pas la bonne valeur, c'était la distinction elle-même — et
c'est ce trou que la section « Progression vs cycle de vie » vient combler. Le
défaut de cette guideline était ailleurs : elle portait du vocabulaire métier
dans un dépôt qui n'en porte pas.

## Décision

### L'axe — cinq sens

| Couleur | Sens | Formulation de référence |
|---|---|---|
| `neutral` | Pas commencé, brouillon, archivé, sans objet | « Rien à en attendre pour l'instant » |
| `information` | En cours, déroulement normal | « Ça avance, rien à faire » |
| `warning` | Action, décision ou échéance attendue | « Quelqu'un doit agir ou décider » |
| `success` | **L'état souhaité est atteint** | « On y est » |
| `critical` | Échec, refus, annulation | « Ça a raté, ou ça a été refusé » |

### Progression vs cycle de vie — deux lectures du même axe

`success` ne veut pas dire « terminé ». Il veut dire **l'état souhaité est
atteint**, ce qui recouvre deux situations différentes :

- **Progression** — l'objet traverse des étapes vers une fin. L'état souhaité
  est l'arrivée. Exemple générique : `Brouillon` → `En cours` → `Terminé`.
  → `neutral`, `information`, `success`.
- **Cycle de vie** — l'objet a un état de fonctionnement nominal, durable, dans
  lequel on veut qu'il reste. L'état souhaité est ce régime normal. Exemple
  générique : `Actif` / `Suspendu` / `Archivé`.
  → `success`, `warning`, `neutral`.

**Le piège** : « En cours » (progression) est `information`, alors que
« Actif » (cycle de vie) est `success`. Les deux libellés se ressemblent, leur
couleur diffère — et c'est correct.

Le critère qui les sépare : **cet état se termine-t-il de lui-même quand le
travail est fait ?**

- Oui → c'est une étape de progression. Elle est transitoire, elle n'est pas la
  destination : `information`.
- Non, c'est l'état dans lequel on veut que l'objet demeure indéfiniment → c'est
  le régime nominal d'un cycle de vie : `success`.

Corollaire : un domaine ne peuple pas forcément les cinq cases. Un cycle de vie
`Actif` / `Suspendu` / `Archivé` n'a pas d'`information` — il n'a aucune étape
transitoire. Ce n'est pas un manque à combler : on n'invente pas un statut pour
remplir une couleur.

### `critical` ou `warning` ? Le critère

La frontière se lit sur **ce qu'on attend de l'utilisateur**, pas sur la gravité
ressentie :

- **`critical` — ça a raté, ou ça a été refusé.** Le résultat est acquis et
  négatif. Il n'y a plus de décision à prendre sur cet objet-là : au mieux, on
  en ouvre un nouveau.
- **`warning` — quelqu'un doit agir ou décider.** L'issue est encore ouverte.
  Inclut les interruptions **réversibles** : un objet suspendu n'est ni raté ni
  sorti du flux, il attend une décision — c'est `warning`, pas `critical`.

La raison est la même que pour le vert : **`critical` doit rester rare pour
signaler**. Une couleur d'alarme apposée sur tout ce qui n'est pas nominal
cesse d'alarmer, et l'échec réel se noie dans le réversible.

### Les deux points contre-intuitifs, tranchés explicitement

**« En cours » est `information`, pas `success`.** Le vert marque **l'état
souhaité atteint** ; il ne signale pas une activité. L'intuition inverse est
courante — elle vient de la supervision temps réel, où « ce qui tourne
maintenant est ce qui compte ». Elle ne tient pas à l'échelle d'une liste : sur
une commande, « en cours » en vert et « soldée » en vert ne se distinguent plus,
alors que ce sont deux moments très différents pour le client. Le vert doit
rester rare pour rester lisible ; s'il marque l'activité, il marque presque tout.

Attention à ne pas surcorriger : c'est l'**étape transitoire** d'une
progression qui est `information`. Le régime nominal d'un cycle de vie, lui,
est bien l'état souhaité — donc `success`, même si son libellé évoque une
activité (voir « Progression vs cycle de vie » ci-dessus).

**« Terminé » est `success`, pas `neutral`.** Le gris est réservé à ce qui n'a
pas commencé ou qui est sorti du flux (brouillon, archivé, sans objet). Griser
un objet terminé, c'est confondre « c'est fini » et « ça ne me concerne pas » :
l'utilisateur perd la confirmation que la chaîne est allée à son terme.

### L'axe vaut pour le DS entier, pas pour le seul `Tag`

Le `Tag` est le composant où le problème s'est manifesté, pas celui à qui la
règle appartient. **Neuf composants** exposent aujourd'hui tout ou partie des
cinq couleurs sémantiques. Un axe qui ne vaudrait que pour le `Tag` laisserait
chacun des huit autres réarbitrer — c'est-à-dire reproduire exactement la
divergence décrite dans le Contexte, à l'échelle du design system cette fois.

| Composant | Prop | Sens portés | État |
|---|---|---|---|
| `Tag` | `color` | les 5 | Aligné, **typé** (`TagStatusColor`) |
| `Badge` | `appearance` | les 5 (+ `information-inverted`) | Aligné |
| `IconTile` | `appearance` | les 5 | Aligné |
| `SectionMessage` | `appearance` | 4 (pas de `neutral`) + accents | Aligné ; accents à questionner |
| `Banner` | `appearance` | 4 + `announcement` | **À trancher** |
| `Snackbar` | `appearance` | 4 + `discovery` | **À trancher** |
| `ProgressBar` | `appearance` | 4 + `comete`, et un mode `auto` | **À trancher** |
| `Text`, `Icon` | `color` | les 5 | Porteurs, pas décideurs |

`Text` et `Icon` sont un cas distinct : ils **rendent** une couleur qu'on leur
donne, ils ne qualifient pas un objet. Ils suivent l'axe quand ils servent un
statut (l'icône de seconde dimension de la règle 2), sans être eux-mêmes un
point de décision.

**Seul le `Tag` typait la distinction statut / catégorie** au moment de cet
ADR. Étendre `TagStatusColor` / `TagCategoryColor` aux autres composants est la
suite logique, mais relève d'un travail d'API à part : cet ADR pose la
doctrine, il ne renomme pas huit unions.

#### Points laissés ouverts — non tranchés ici

Trois écarts sont constatés mais **délibérément non arbitrés** : ils touchent
des API publiques et méritent leur propre décision.

1. **`Banner.appearance = "announcement"`** — un sixième nom, hors axe. Est-ce
   un sens supplémentaire, ou un alias d'`information` sur un composant dont la
   fonction est déjà d'annoncer ? *Piste* : alias à déprécier.
2. **`Snackbar.appearance = "discovery"`** — un septième nom, sur un composant
   voisin de `Banner` qui, lui, ne l'a pas. Deux composants proches, deux
   vocabulaires : la divergence de cet ADR en miniature.
3. **`ProgressBar.appearance = "auto"`** — code déjà une sémantique
   (`critical ≤ 20`, `warning 21–99`, `success 100`) qui contredit l'axe : une
   progression à 50 % est « ça avance, rien à faire » (`information`), pas
   « quelqu'un doit agir ». *Piste* : soit réaligner `auto`, soit exempter le
   composant au motif qu'une **jauge** exprime un seuil et non une étape — ce
   qui se défend, mais doit être écrit pour ne pas passer pour un oubli.

Tant que ces trois points ne sont pas tranchés, ils constituent les seules
exceptions connues à la portée ci-dessus.

### Les accents sont exclus des statuts

`comete` et les cinq `accent*` (`accentPurple`, `accentTeal`,
`accentTurquoise`, `accentMagenta`, `accentBlueGrey`) **ne portent jamais un
statut**. Ils servent la **catégorisation** — rôle, secteur, code d'activité,
métier — qui n'a pas d'axe bon/mauvais : un secteur n'est ni réussi ni raté.

C'est le corollaire direct de l'[ADR 0001](./0001-theming-couleur-multi-tenant.md),
qui qualifie déjà `--*-accent-<couleur>-*` de « namespace catégoriel décoratif
indépendant ». Cet ADR ne fait qu'en tirer la conséquence côté composant.

Le typage rend la distinction lisible à l'autocomplétion :

```ts
export type TagStatusColor =
  | "neutral" | "information" | "warning" | "success" | "critical";

export type TagCategoryColor =
  | "comete" | "accentPurple" | "accentTeal"
  | "accentTurquoise" | "accentMagenta" | "accentBlueGrey";

export type TagColor = TagStatusColor | TagCategoryColor;
```

`TagColor` reste l'union complète : la scission est **non cassante**, tout code
existant continue de compiler à l'identique.

### Les quatre règles d'usage

1. **Une couleur = un sens, jamais un objet.** La couleur qualifie l'état, pas
   la nature de ce qui la porte. Deux objets de nature différente dans le même
   état portent la même couleur : une commande en attente de validation et un
   document en attente de signature sont tous les deux `warning`. Corollaire :
   on ne réserve pas une couleur à un domaine (« le planning, c'est du violet »).

2. **Un tag = une dimension.** Deux dimensions indépendantes se lisent sur deux
   éléments — un tag + une icône — jamais dans une couleur composite.
   *Anti-exemple, dans le produit aujourd'hui* : les pointages fusionnent statut
   temporel et statut de géolocalisation en concaténant des variantes, ce qui
   produit une teinte qu'aucune règle ne peut plus expliquer, et dont le nombre
   de cas croît comme le produit des deux dimensions.

3. **Le libellé porte le sens, la couleur le renforce.** Jamais de tag sans
   texte, jamais de pastille seule. Sinon l'information est inaccessible aux
   daltoniens (8 % des hommes), invisible en impression noir et blanc, et
   indéchiffrable pour un utilisateur qui découvre l'écran. La couleur accélère
   la lecture d'un sens déjà écrit ; elle ne le remplace pas.

4. **Discret par défaut ; l'emphase réservée à `critical`, et rare.**
   L'emphase est un **budget**, pas un style : un élément accentué par ligne
   annule l'effet recherché. Chaque composant applique cette règle avec le
   levier dont il dispose :

   | Composant | Levier | Réglage |
   |---|---|---|
   | `Tag` | `appearance` | `subtle` par défaut ; `bold` pour `critical` ; `outlined` pour la catégorisation |
   | `Badge` | `importance` | `high` réservé à ce qui doit être vu |
   | `IconTile` | — aucun | l'intensité tient à la taille et à la forme |
   | `SectionMessage` | — aucun | calme par construction : un bloc dans le flux |
   | `Banner` | — aucun | fort par construction : un bandeau qui interrompt |

   Pour les composants sans levier, **choisir le composant, c'est choisir
   l'intensité**. Corollaire à refuser explicitement : on ne promeut pas un
   statut en `Banner` pour le faire remarquer — un bandeau interrompt la tâche
   en cours, ce qu'un statut de ligne ne justifie jamais.

   `outlined` est le seul réglage sans équivalent ailleurs : il est propre au
   `Tag`, et sert la catégorisation.

### Hors périmètre — ce que cet ADR ne décide pas

**La liste des statuts métier et leur mapping ne vivent pas dans le design
system.** Le DS ignore le domaine : il ne sait pas ce qu'est une commande
soldée, un pointage manqué ou une PDS refusée, et il n'a pas à l'apprendre.

La correspondance « valeur d'API → libellé + couleur + icône » est une **couche
produit**, partagée entre les applications consommatrices et **versionnée
séparément** : le métier évolue nettement plus vite que le DS, et faire
remonter chaque nouveau statut jusqu'à une release du DS créerait un goulot
d'étranglement injustifié.

Le DS fournit **uniquement le vocabulaire de couleurs** sur lequel cette couche
s'appuie. Toute liste de statuts figurant dans ce dépôt (stories, docs) est de
la **donnée de démonstration non normative** : seul l'axe ci-dessus l'est.

## Conséquences

### Ce qu'un consommateur doit faire

- **Qualifier le jeu de statuts avant de le mapper.** Est-ce une
  **progression** (des étapes vers une fin) ou un **cycle de vie** (un régime
  nominal durable) ? La réponse décide à elle seule si l'état courant se colore
  en `information` ou en `success`. Un jeu qui mélange les deux lectures est le
  signe qu'il cache en réalité deux dimensions (règle 2).
- **Ne jamais coder une couleur en dur au point d'usage.** Pas de
  `<Tag color="success">` écrit dans un composant d'écran : la couleur vient
  toujours d'un mapping statut → couleur, centralisé une fois pour toutes dans
  la couche produit.
- **Typer ce mapping sur `TagStatusColor`.** Le compilateur interdit alors d'y
  glisser un accent, et rend la règle « les accents ne sont pas des statuts »
  vérifiable plutôt que déclarative.
- **Toujours fournir un `label`.** Règle 3 : un tag sans texte est un défaut
  d'accessibilité, pas un choix esthétique.

### Ce que ça interdit

- **L'exception esthétique par écran.** « Ici, on préférerait du violet, c'est
  plus joli sur ce fond » n'est plus recevable. Une nuance qu'on veut voir
  apparaître est soit **un nouveau statut** (elle rejoint l'axe), soit **une
  seconde dimension** (elle sort du tag — règle 2). Il n'y a pas de troisième
  possibilité.
- **La réaffectation locale d'une couleur.** Un écran ne peut pas décider que,
  chez lui, `warning` veut dire « en cours ». Le sens est global ou il n'est pas.

### Coûts assumés

- **Le vert se retire des étapes transitoires.** Sur les jeux de **progression**,
  les états intermédiaires passent au bleu `information` : ces écrans perdront
  de la couleur. C'est l'effet recherché — un signal qui apparaît partout
  n'informe plus. Sur les jeux de **cycle de vie**, en revanche, le vert reste
  la couleur de l'état nominal et ne bouge pas.
- **Le rouge se retire du réversible.** Les états d'interruption qui attendent
  une décision repassent en `warning`. `critical` se restreint à ce qui a
  échoué ou été refusé, et redevient un signal.
- **Il faut trancher progression / cycle de vie pour chaque jeu de statuts.**
  C'est un travail de qualification en amont du mapping, qui n'existait pas
  avant cet ADR. C'est le prix de la cohérence : sans ce choix explicite, le
  même libellé se colore différemment d'un écran à l'autre.
- **Une migration à faire côté produit.** Les mappings existants (commandes,
  planning, pointages) divergent de l'axe et devront être réalignés — travail
  qui ne relève pas de ce dépôt.

## Alternatives écartées

- **Laisser chaque application décider** (statu quo) : c'est précisément ce qui
  a produit les quatre divergences du contexte. Une couleur dont le sens dépend
  de l'écran n'est plus un signal, seulement de la décoration.
- **Faire de « en cours » un `success`** (la convention que la story du DS avait
  posée de fait) : sur une **progression**, rend indistinguables l'étape et
  l'arrivée — les deux états dont la différence intéresse le plus
  l'utilisateur.
- **Traiter tout état courant comme une étape** (donc « Actif » en
  `information`) : uniformise la règle, mais au prix du sens. Un objet en
  service **est** dans son état souhaité ; le peindre comme une étape
  transitoire suggère qu'on attend qu'il en sorte, et prive le cycle de vie de
  tout état positif. La distinction progression / cycle de vie est plus
  coûteuse à énoncer mais se tient à l'usage.
- **Traiter « suspendu » comme `critical`** : plus alarmant, mais faux — une
  interruption réversible n'est pas un échec, et banaliser le rouge le rend
  inaudible là où il compte. Voir « `critical` ou `warning` ? ».
- **Ajouter une validation runtime** (`console.warn` si un accent est passé là
  où un statut est attendu) : rejeté. Un accent sur un `Tag` est un usage
  parfaitement légitime — la catégorisation — donc le warn se déclencherait sur
  du code correct. Le typage et la documentation portent la doctrine sans bruit.
- **Étendre l'axe à plus de cinq sens** (ajouter par exemple un « en retard »
  distinct de `warning`) : chaque sens supplémentaire réduit la mémorisabilité
  de l'ensemble. « En retard » est une action attendue avec une échéance
  dépassée — c'est `warning`, et c'est le libellé qui porte la nuance.
