# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit (à terme) le [versionnage sémantique](https://semver.org/lang/fr/).
Tant que le projet est en `1.0.0-alpha`, des changements cassants peuvent survenir
entre versions alpha.

## [Unreleased]

### Ajouté

- **`Avatar` — `color`** (`neutral` par défaut, `comete`, `accentPurple`, `accentTeal`,
  `accentTurquoise`, `accentMagenta`, `accentBlueGrey`) : couleur de fond et de contenu
  quand l'avatar montre des initiales ou une icône. **Catégorielle, jamais un statut**
  (ADR 0002) : un avatar identifie — une personne, un fil de discussion, une équipe — il
  ne dit pas « tout va bien », ce qui relève de `presence`, `notification` ou d'un `Tag`.
  Fond `subtlest` et contenu `--text-*`, comme le `Tag` subtle et l'`IconTile`, avec les
  états survol et appui pour un avatar interactif. Le jeton de texte est **celui que
  `Text` emploie déjà** pour la même couleur : `Avatar color="accentPurple"` et
  `Text color="accentPurple"` tombent sur `--text-accent-purple`, de sorte qu'un nom
  d'auteur prenne exactement la teinte de son avatar. Sans effet sur une photo, qui
  couvre le fond ; `isSelected` l'emporte sur la couleur. Story « Fil de discussion ».
- **`ScrollArea`** (nouveau composant) : zone défilante dont l'ascenseur est **rendu par
  le composant** plutôt que laissé au navigateur. Le défilement reste natif — molette,
  doigt, clavier — et le contenu n'est jamais déplacé par transformation : on masque
  l'ascenseur du système et on dessine le nôtre par-dessus, en lisant `scrollTop` /
  `scrollHeight`. Trois choses que l'ascenseur natif ne sait pas faire :

  1. **Flotter au-dessus du contenu** sans lui prendre de place — les navigateurs ont
     retiré `overflow: overlay`.
  2. **Paraître pendant le défilement** puis s'estomper — CSS n'a pas de pseudo-classe
     « en train de défiler ».
  3. **Réagir au survol de façon fiable** sur toutes les configurations.

  API : `axis` (`vertical` par défaut, `horizontal`, `both`), **`visibility`** (`hover`
  par défaut, `scroll`, `auto`, `always`), **`hideDelay`** (600 ms), `maxHeight`,
  `maxWidth`, `hasOverflowShadows`, `isFocusable`, `role`, `aria-label`. Barre de 10px
  (`--size125`) et pouce de 6px, collés au bord. Couleurs du pouce, mesurées contre
  `--background-surface-default` : en clair `--grey-solid-500` #8c8f97 (3,24:1) au repos
  et `--icon-subtlest` #6f8488 (3,94:1) au survol ; en sombre `--icon-subtle` #8d9fa3
  (3,85:1) et `--text-subtle` #b5c1c4 (5,76:1). `--grey-solid-500` est un jeton
  **primitif**, seul écart assumé à la règle maison : aucun sémantique neutre ne se situe
  entre #6f8488 (3,94:1) et #b5c1c4 (1,84:1, sous le seuil). Le pouce se
  glisse à la souris et au doigt (capture de pointeur), sa taille a un plancher pour
  rester visable sur un contenu très long, et sa **cible de préhension atteint
  `--control-height-touch` (48px)** par un pseudo-élément invisible — WCAG 2.5.5 tenu
  sans épaissir le trait. Les ascenseurs sont `aria-hidden` : ce sont des doublures
  visuelles du défilement natif, déjà piloté par la zone. `visibility="scroll"` est le
  seul mode visible **au doigt**, où il n'y a pas de survol.
- **Couche utilitaire `styles/scrollbar.module.css`** : définition **unique** des zones
  défilantes, en quatre rôles cumulables — `scrollable` (la mécanique), `themed`
  (l'ascenseur), `hidden` (ascenseur masqué, défilement conservé) et `shadows`
  (l'indication de débordement). Sur le modèle de `styles/typography.module.css`.
  `Drawer`, `ModalDialog`, `Popover`, `Select`, `TimeCalendar` et `TimeDrumPicker` la
  consomment au lieu de recopier les mêmes déclarations. Interne au paquet, rien à
  changer côté consommateur.
- **Icônes `WorkRange`, `Security` et `Today`** disponibles via `<Icon icon="…" />`, et
  `CalendarToday` réalignée sur Material `calendar_today` (bump `@aexae/comete-icons` → `0.9.1`).
  La peer dependency s'élargit en `^0.8.0 || ^0.9.0` (non cassant). Icons 0.9.1 exporte aussi
  `getIconByOmnisId` / `omnisIcons` : correspondance ID d'icône Omnis → icône du paquet.
- **Garde anti-drift des tokens** (`src/tokens/cssTokens.test.ts`) : toute custom property
  lue par le DS (CSS Modules et TSX, fallbacks imbriqués inclus) doit exister dans
  `@aexae/comete-design-tokens` ou être déclarée par le DS. Un token disparu derrière un
  fallback fait désormais échouer la CI. Exceptions runtime listées explicitement.
- **Tokens `text-subtle-inverted` / `text-subtlest-inverted`** : deux variantes de texte
  inversé pour hiérarchiser du texte secondaire sur une surface inversée (fond foncé en
  thème clair, fond clair en thème sombre). Bump `@aexae/comete-design-tokens` → `0.18.0`.
- **`ModalDialog` — `showHeader`** : à `false`, masque le header (titre, icône d'apparence,
  croix) pour les surfaces dont le contenu commence par sa propre commande — une palette de
  recherche, où le champ tient lieu d'en-tête et `esc` remplace la croix. Le `title` reste
  **obligatoire** et reste rendu, masqué visuellement : c'est lui qui donne son nom
  accessible au dialog (React Aria le lit via `slot="title"`). Défaut `true`, comportement
  inchangé.
- **`ModalDialog` — `pinned`** : contenu **épinglé** entre le header et le body, hors de la
  zone qui défile. Pendant de `DrawerHeader` côté modale, pour les surfaces dont la commande
  doit rester sous la main pendant qu'on parcourt le contenu (le champ d'une palette de
  recherche). À préférer à un conteneur défilant imbriqué : celui-ci reçoit l'ascenseur du
  système et non celui du DS, les pseudo-éléments `::-webkit-scrollbar` ne se transmettant
  pas aux descendants. Sans header, c'est le bloc épinglé qui porte le retrait haut.
- **`ModalDialog` — `container`** : confine la modale **et son voile** dans un conteneur
  plutôt que dans la fenêtre (cadre mobile d'une story, zone applicative qui doit rester
  visible autour). Le conteneur doit être positionné (`position: relative`). Même procédé
  que `BottomNav.ActionMenu` (`UNSTABLE_portalContainer`).
- **`Table` — `rowSeparation="hovered"`** : la ligne survolée reçoit son fond de survol **et** un
  filet ; les autres lignes restent nues.
- **`QuickActions`** (nouveau composant) : menu d'actions rapides du FAB (`BottomNav.Action`) —
  pattern « speed dial », des **pastilles flottantes** au-dessus d'un voile (libellé à
  gauche, pastille d'icône circulaire à droite). Rend **uniquement la couche flottante** (le
  déclencheur reste le FAB, inchangé). Construit sur `ModalOverlay` / `Modal` / `Dialog`
  (react-aria-components) : voile, piège de focus, Échap, retour du focus sur le déclencheur,
  apparition décalée. API : `actions` (2 à 5 : `id`, `icon`, `label`, `tone`, `onPress`),
  `isOpen`, `onOpenChange`, `aria-label` (« Actions rapides »). **Règle de couleur (ADR 0002)** :
  `tone` = nature de l'action, jamais son identité — palette sémantique des autres composants
  (`comete` par défaut, `critical`, `warning`, `success`, `information`), sans restriction de
  type ; la couleur ne va que sur la **pastille d'icône**, jamais sur la rangée. Garde-fou sur
  la **composition** : avertissement en développement au-delà de 2 tons distincts ou de plus
  d'une action `critical` (le composant rend quand même). Pas de description, pas de bouton
  « Fermer », plafond à 5 actions (avertissement en développement) ; au-delà ou pour expliquer
  une action : tiroir (`Drawer`).
- **`BottomNav.Action` ouvert** : le FAB remonte au-dessus du voile de `QuickActions`
  (z-index appliqué uniquement quand `aria-expanded="true"`, aucun z-index sur la barre
  basse). Son socle (contour) reste sous le voile, comme la barre : le contour du FAB garde
  son rendu d'origine. Comportement, rotation et `aria-expanded` inchangés.
- **`List` — `hasDividers`** : séparateur **subtle** (`--border-subtle`) entre les items,
  **inset** : il démarre à l'aplomb du texte et ne passe jamais sous l'icône ni l'avatar de
  gauche (pseudo-élément, aucun décalage) ; pleine largeur avant un `ListHead`, sans filet
  après le dernier élément. Complète `gap` (séparation par l'air).
- **`ListItem` / `ListItemButton` — `isUnread`** : item **non lu** — texte principal et
  sous-texte en semibold (600) et pastille (`Badge` information) après le contenu, en fin de ligne ; « Non lu »
  est annoncé aux lecteurs d'écran (masqué visuellement). Story « Unread » (séparateurs activés via `hasDividers`).
- **`Table` — `rowSeparation`** (`none` | `dividers` | `striped` | `hovered`, défaut
  `none`) : séparation visuelle des lignes pour les grands écrans — filet fin entre
  chaque ligne, bandes une ligne sur deux, ou fond de survol + filet uniquement sur la ligne
  survolée. Filets en `box-shadow` sur les cellules : aucun décalage au survol.
- **`TableRow` — `onToggleSelect`** : mode **sélectionnable**. Un clic sur la ligne
  coche la case ; un contrôle interactif dans la ligne (case, bouton, lien, ancre
  `href`/`onPress`) garde la **priorité**. `useTableSelection().getRowClickProps(key)`
  le renvoie prêt à étaler.
- **`Table.SelectionBar` — `total`** : précise le libellé, « 3 lignes sélectionnées
  **sur 120** ». `label` reçoit aussi le total.
- **SideNav — rail de 80 px** : nouvel état **rail** (`mode="rail"`), pour tablette
  et desktop. Rail de **80 px** (maquette Figma) : chaque item empile l'icône
  (24 px) et un libellé court (10 px) dessous, barre de sélection de 4 × 20 px,
  titres de section (12 px) et séparateurs sur toute la largeur utile. Le rail est
  **fixe** : il ne s'agrandit **jamais au survol**. On passe de `expanded` (240 px) à
  `rail` par le bouton de bascule de l'en-tête ou `Ctrl/Cmd+Shift+E` (désactivable
  via `enableShortcut`). Custom property `--sidenav-rail-width`. En rail,
  `SideNav.Item` requiert une icône (`iconBefore`) — un `console.warn` le signale en
  dev. Type `SideNavMode` exporté.
- **SideNav.Header — `showToggle`** (défaut `true`) : retire le bouton de bascule
  `expanded` ⇄ `rail` de l'en-tête (utile dans un `Drawer` sur mobile web, où il n'y a
  pas de rail).
- **SideNav — règles par plateforme** (documentées sur le composant et dans
  Storybook) : **app mobile** = pas de SideNav, la `BottomNav` porte seule la
  navigation ; **mobile navigateur web** = la SideNav s'affiche dans un `Drawer`
  `placement="left"`, par-dessus le contenu ; **tablette et desktop** = navigation
  permanente, déployée ou en rail, qui ne disparaît jamais.

- **Story BottomNav « Plus en page »** : l'alternative au popup — « Plus » est une
  destination (`Page.Bar` compacte avec « Retour » + `List` en deux sections),
  sélectionné comme ses voisines, sans état ouvert.

- **`TablePager` / `Table.Pager`** (sous-composant de `Table`) : navigation entre pages —
  précédente / suivante encadrent des pages numérotées `1 2 3 4 5 … 8` (7 emplacements
  au plus, largeur stable), page courante pleine (`aria-current="page"`), précédente /
  suivante désactivées aux extrémités, taille selon la densité (28 / 32 / 40 px). Props :
  `page` (0-indexée), `pageCount`, `onPageChange`, `density`, `aria-label`.
  Jamais plus de **4 numéros** (`visiblePages="4"`, défaut : `1 2 3 … 12`, `1 … 5 6 … 12`,
  `1 … 10 11 12`) — les pages intermédiaires sont masquées par des points de suspension ;
  `3` | `5` | `7` restent disponibles (relayé par `TablePagination`). `TablePagination` le compose ; `Table.Pagination` est aussi exposé.

### Corrigé

- **Contraste du pouce d'ascenseur.** Un pouce restylé est un composant d'interface au
  sens du **WCAG 1.4.11**, qui demande 3:1 contre le fond : l'exemption « rendu par
  défaut du navigateur » tombe dès qu'on le style. **Le jeton change selon le thème**,
  parce qu'aucun jeton neutre ne donne à la fois un gris assez clair sur blanc et assez
  contrasté sur #374043 :

  | | thème clair | thème sombre |
  |---|---|---|
  | repos | `--icon-subtlest` #6f8488 **3,94:1** | `--icon-subtle` #8d9fa3 **3,85:1** |
  | survol | `--icon-subtle` #596b70 **5,58:1** | `--text-subtle` #b5c1c4 **5,76:1** |

  Les quatre crans passent le seuil, et le survol va dans le bon sens des deux côtés :
  il assombrit sur fond clair, il éclaircit sur fond sombre. Le survol porte sur le
  **conteneur**, pas sur le pouce : viser une barre de 8px pour la voir réagir n'aurait
  pas de sens. Bascule par `data-theme` avec repli `prefers-color-scheme`, comme
  `Skeleton`. Aucun couple de la famille `--border-*` ne pouvait tenir ce rôle —
  `--border-default` et `--border-bold` y valent tous deux #49585b en thème sombre.
  **`SideNav` adopte les mêmes jetons** : un seul pouce dans tout le DS. Son
  révélé-au-survol lui reste propre, seul le déclenchement diffère.
- **`SideNav` — valeurs en dur.** La largeur de l'ascenseur passe de `8px` à
  `var(--size100)` et le rayon du pouce de `4px` à `var(--radius-round)`. Même rendu,
  mais plus de valeur hardcodée dans ce bloc.
- **`ModalDialog` — corps défilant.** Le corps avait `flex: 1`, donc `flex-basis: 0` :
  Safari effondre un tel élément à zéro en colonne flex à hauteur `vh` (modale
  visuellement vide, pied remonté en haut). Il passe à `flex: 1 1 auto` avec
  `min-height: 0`, comme le corps du `Drawer` — même garde, désormais au même endroit.
- **Ascenseurs révélés au survol.** Au repos, piste ET pouce sont transparents : plus
  aucune colonne permanente le long du contenu. Ils apparaissent au survol de la zone
  (piste `--background-neutral-subtlest-default`, pouce aux couleurs conformes ci-dessus),
  avec une transition sur `--duration-normal`. Le couloir reste réservé : l'ascenseur
  paraît et disparaît sans jamais décaler le contenu. Même parti pris que `SideNav`,
  généralisé à toutes les surfaces défilantes.

  **Conséquence assumée** : au doigt, où il n'y a pas de survol, l'ascenseur ne paraît
  jamais. C'est `.shadows` (prop `hasOverflowShadows` de `ScrollArea`) qui dit alors
  qu'il reste du contenu. L'afficher pendant le **défilement** puis l'estomper n'est pas
  faisable en CSS — il n'existe pas de pseudo-classe « en train de défiler ».
- **Apparence des ascenseurs — plus discrète.** La piste passe de
  `--background-surface-elevation-sunken-default` à **transparent** : une rainure grise
  dessinait une colonne permanente le long du contenu, visible même quand il n'y avait
  presque rien à faire défiler. Seul le pouce porte l'information utile. La largeur ne
  change pas. S'applique partout d'un coup, via la couche `styles/scrollbar.module.css`.

  Les jetons retenus restent un **pis-aller** : `--icon-*` désigne des marques
  d'interface, `--text-*` de la prose, ni l'une ni l'autre une pièce de mécanique. Il
  manque une rampe de remplissage neutre pour ça, définie par thème. Sujet ouvert (ADR).
- **Ascenseurs thémés — `Drawer`, `ModalDialog`, `Popover`, `Select`, `TimeCalendar`** : la
  largeur de 8px (`--size100`) voulue par le DS ne s'appliquait **nulle part sur Chrome**.
  Ces composants posaient `scrollbar-color` (pour Firefox) **et** des règles
  `::-webkit-scrollbar` ; or Chrome ignore les pseudo-éléments webkit dès qu'une propriété
  standard est posée sur le même élément. On obtenait la barre du système (15px), seulement
  recoloriée. Les propriétés standard sont désormais confinées à
  `@supports not selector(::-webkit-scrollbar)`, comme le faisait déjà `SideNav`. Mesuré sur
  Chrome 152 : 15px avant, **8px après**. La règle vit maintenant à un seul endroit, dans la
  couche `styles/scrollbar.module.css`.

- **`SectionMessage`** (titre, contenu) et **`Breadcrumbs`** (page courante) : `--text-primary`,
  token inexistant, remplacé par `--text-default`. La couleur était héritée du parent.
- **`Avatar`** (`size="xxlarge"`) : `--radius125` n'existait pas, le coin était carré. Le
  token (10 px) est ajouté dans `@aexae/comete-design-tokens`. Bump → `0.19.0`.
- **`InformativeState`** : le plancher de largeur cède quand la place manque. `box-sizing`
  vaut `content-box` ici : les 256px s'entendaient HORS padding et les 2 × 48px s'y
  ajoutaient, soit 352px imposés — l'état débordait horizontalement dans un conteneur
  étroit (cadre mobile, modale confinée), or il sert surtout là. Comportement inchangé dès
  qu'il y a la place.
- **`List` — `isBordered`** : la liste est désormais en `box-sizing: border-box`. Avec
  `width: 100%` en content-box, la bordure la faisait dépasser de 2 px de son parent, qui
  affichait alors un défilement horizontal (ex. liste d'agents de la recette « Filtres »
  mobile).
- **`Drawer` (modal)** : plus de bande blanche à droite, non voilée, à l'ouverture. React Aria
  verrouille la page avec `overflow: hidden` **et** `scrollbar-gutter: stable` ; le voile
  s'arrêtait avant ce couloir réservé. Le Drawer libère le couloir (`scrollbar-gutter: auto`)
  tant qu'il est ouvert et restitue l'état initial à la fermeture.
- **`Checkbox`** : la racine est `position: relative`. L'`<input>` natif masqué par React Aria
  (`position: absolute`) se calait sur un ancêtre lointain (ex. un popover) ; au clic, le
  focus faisait défiler ce parent — même en `overflow: hidden` — et son contenu disparaissait
  (popup « Filtres » blanche après sélection d'une option).
- **`Badge` — largeur minimale de 16px** : le `min-width` passe de 12px (`--size150`) à
  16px (`--size200`), la hauteur du badge. Un badge d'un seul caractère ne peut plus être plus
  étroit que haut, ni être écrasé sous cette largeur par un parent flex. La largeur d'un
  badge qui a plus de contenu reste celle de son texte (6px de marge de chaque côté) : un « 1 »
  reste un peu plus étroit qu'un « 4 ».

- **`Badge` — ne se comprime plus** : `flex-shrink: 0` sur la règle de base (tous les niveaux
  d'importance, point `low` compris). Posé dans une ligne flex à côté d'un libellé long, un
  badge était écrasé (jusqu'à 13,5px de large) : c'est désormais le voisin qui cède.
### Modifié

- **`Page.Body` — plus de retrait bas.** Le corps de page avait
  `padding-block: var(--space100)`, soit 8px en haut **et** en bas. Seul celui du haut
  a une raison d'être : il détache le contenu de la toolbar qui le surmonte. En bas il
  n'y a rien dont se détacher, et sur un contenu qui ne défile pas il ne produisait
  qu'une bande morte au ras de la fenêtre — là où un contenu qui touche le bord dit
  au contraire que la page continue. Devient `padding-block-start`.

  **À savoir** : sur une page dont le corps DÉFILE, la dernière ligne s'arrête
  désormais au ras du bord. L'espacement de fin de contenu, quand il en faut un,
  appartient au contenu (un `Stack`, une section), pas au conteneur.
- **`Button`** (`density="touch"`) : padding horizontal porté de 12 px à 16 px (`--space200`)
  pour respecter la règle padding X ≥ 2 × padding Y (8 px), vérifiée par un test. Le bouton
  touch s'élargit de 8 px. `--control-padding-x-touch` (12 px) reste celui des champs.
- **`TableHeaderCell` triable — icône de tri subtle** : la flèche utilise `--icon-subtle` dans tous
  les états (aperçu au survol, tri actif).
- **`TableHeaderCell` triable — icône de tri** : plus de double flèche « expand »
  (`UnfoldMore`). Au survol d'une colonne non triée, la **flèche haut** apparaît
  atténuée (aperçu du tri croissant) ; un tri actif garde sa flèche pleine.
- **`TablePagination`** : le sélecteur s'intitule « **Résultats par page** » (au lieu de
  « Lignes par page ») et propose **25 / 50 / 100** par défaut — **10 retiré**.
- **`TablePagination`** : mise en page revue — « **Résultats par page** » à gauche,
  « **1 à 25 sur 248** » (annoncé aux lecteurs d'écran) et la `Pagination` à droite.

- **`BottomNavItem` — état ouvert allégé (item « Plus »)** : l'état
  `aria-expanded` animait cinq choses en parallèle (fond, croisement d'icônes avec
  `rotate`/`scale`, agrandissement et descente de l'icône, effacement du
  libellé). Il ne garde qu'**un seul signal** : le croisement d'icônes en
  **fondu pur** (`--duration-fast`). Plus de `transform`, plus de fond (`::before`
  supprimé), le libellé reste **visible** (nom accessible conservé).
  `BottomNavAction` est inchangé. Le bleu (`--text-selected`) reste réservé à
  `data-selected` : un item qui ouvre un popup n'est pas sélectionné.
  L'icône de fermeture est la **croix seule** (`Close`), plus la croix dans un cercle
  (`Cancel`). `prefers-reduced-motion` désactive les transitions.
- **SideNav — retrait horizontal homogène** : en-tête, items, séparateurs, titres de
  section et pied partagent désormais **le même bord gauche** (variable
  `--sidenav-inset`, 20 px depuis le bord de la nav) ; ils étaient à 16 / 20 / 24 px.
  L'espace **avant et après un item est identique** (8 px de chaque côté) : la
  gouttière de défilement (8 px) est logée dans la marge droite de la nav au lieu de
  s'y ajouter (19 px à droite pour 8 px à gauche auparavant). La largeur déployée reste
  240 px (items de 224 px + 2 × 8 px, conforme à la maquette).
- **SideNav — titre de section** : `.sectionHeading` passe de 10 px à **12 px**
  (`--font-size-ui-xxs`).

### Changements cassants (BREAKING)

- **`SideNav.Item` — prop `description` supprimée**, avec le `.itemDescription` qui la
  rendait. Un item de navigation porte un libellé, pas un résumé : la seconde ligne
  allongeait la rangée, brisait le rythme vertical de la liste et disparaissait de
  toute façon en mode rail. Retirer la prop des appels suffit à migrer.
- **`SideNav.ItemSkeleton` — prop `hasDescription` supprimée.** Conséquence directe :
  c'était le placeholder d'une 2ᵉ ligne qui n'existe plus. Un squelette à deux lignes
  pour un item qui n'en a qu'une annoncerait un chargement trompeur.
- **`FilterChip` / `FilterChipRow`** : composants **supprimés** (organisme de filtres
  rapides), avec leurs types et leur story `Components/FilterChip`. Retirer les imports
  correspondants ; le panneau de filtres de la recette « Filtres » (`Popup` / `Drawer`)
  reste la référence.
- **`Table.SelectionBar`** : la prop **`onClear`** et le bouton « Tout
  désélectionner » sont **supprimés** (doublon avec la case à cocher d'en-tête du
  tableau). Retirer `onClear` des usages.
- **`useTableSelection().getRowClickProps(key)`** renvoie `{ onToggleSelect }` (à étaler
  sur `TableRow`, inchangé côté usage) au lieu de `{ onClick }` ; le filtrage des
  contrôles interactifs est désormais fait par `TableRow`.
- **`TablePagination`** : `rowsPerPageOptions` par défaut `[25, 50, 100]` (était
  `[10, 25, 50]`) ; libellé par défaut « Résultats par page : ».
- **SideNav — mode replié (`collapsed` / `hidden`) supprimé.** La navigation est
  permanente : `SideNavMode` vaut `"expanded" | "rail"`. Sur mobile web, utiliser un
  `Drawer placement="left"`.
- **SideNav — peek au survol supprimé.** Plus aucun agrandissement au survol (rail
  comme déployé) : on bascule par le bouton de la nav ou `Ctrl/Cmd+Shift+E`.
- **`SideNav.Trigger` (`SideNavTrigger`, `SideNavTriggerProps`) supprimé** : il
  servait à rouvrir la nav repliée. Pour le hamburger mobile web, utiliser un
  `Button` qui ouvre le `Drawer`.
- **`SideNav.Provider` — props `isCollapsed` / `defaultCollapsed` / `onCollapsedChange`
  supprimées** → utiliser `mode` / `defaultMode` / `onModeChange`.
- **`useSideNav()`** ne renvoie plus que `{ mode, setMode }` (`isCollapsed`,
  `onToggleCollapse`, `isPeeking`, `closePeek` et les setters de survol sont retirés).

## [1.0.0-alpha.164] - 2026-10-13

### Ajouté

- **`Popup`** : le padding interne de la carte est désormais pilotable par la
  variable CSS `--popup-padding` (défaut `--space200`, non-breaking). Permet à
  un contenu qui porte déjà ses propres retraits de coller aux bords, sans
  élargir l'API publique du composant. Même procédé que `--menu-popover-width`
  et `--focus-ring-offset`.

### Modifié

- **Bouton « Effacer » — `Select`, `DatePicker`, `TimePicker`, `MonthPicker`,
  `WeekPicker`, `YearPicker`** : le bouton n'est plus affiché en permanence. Il
  est **masqué au repos** et révélé au **survol ou au focus** du champ, en
  s'ajoutant à l'icône calendrier / horloge (les deux visibles ensemble).
  Alignement sur la convention déjà en place dans `TextField` / `SearchField`,
  inchangés. Le masquage utilise `visibility` et non `display` : la place reste
  réservée, l'icône d'ouverture ne se décale pas. Sur support tactile, faute de
  survol, le bouton n'apparaît qu'à la prise de focus.

- **Croix d'effacement — `TextField` / `SearchField`, `Select`, `DatePicker`,
  `MonthPicker`, `WeekPicker`, `YearPicker`, `TimePicker`** : la croix utilise
  désormais `--icon-subtlest` partout. Elle était en `--icon-default` (plus
  foncée) sur `Select` et sur les sélecteurs de date / mois / semaine / année /
  heure, déjà en `subtlest` sur `TextField`. Les sélecteurs surchargent la
  classe `.comete-icon--default` du `<Icon>` via `:global()`.

- **Bouton « Effacer » — `DatePicker`, `TimePicker`, `MonthPicker`, `WeekPicker`,
  `YearPicker`** : il n'est plus masqué. Il reste **toujours visible** dès que le
  champ a une valeur, au lieu d'être révélé au survol ou au focus (remplace la
  convention décrite plus haut pour ces cinq composants ; `TextField` /
  `SearchField` et `Select` sont inchangés).
- **`Select` — libellé de groupe** : la taille du libellé des groupes d'options
  (`.groupLabel`) passe de 10 px (`--font-size-ui-xxxs`) à 12 px
  (`--font-size-ui-xxs`). L'interligne (16 px) et la mise en capitales sont
  inchangés.
- **`DatePicker` — icône et bouton calendrier** : l'icône passe de
  `CalendarMonth` à `CalendarToday`. Le rond de survol des boutons trailing
  (calendrier, Effacer) **englobe tout le dessin de l'icône** : `CalendarToday`
  dessine 18 × 20 px dans sa boîte de 24 px (diagonale ≈ 26,9 px), un rond de
  24 px (ou de 26 px, avec la bordure transparente du `Button`) laissait dépasser
  les coins. Le rond fait 28 px (`--size350`) ; il déborde d'1 px en haut et en
  bas dans le retrait du champ, dont la hauteur ne change pas.
- **`TimeDrumPicker` / `TimePicker` — plus d'espace entre les colonnes** : les
  colonnes (heures, minutes, secondes, AM/PM) et le « : » étaient séparés de
  `--space100` (8 px). Ils se touchent désormais (`gap: 0`) ; le retrait
  extérieur du sélecteur est conservé. Le sélecteur à deux colonnes passe de
  100 px à 84 px de large.

### Corrigé

- **`TimePicker` (saisie) — boutons non calés à droite** : quand le champ
  s'agrandissait, le bouton « Effacer » et l'icône horloge restaient collés au
  texte (le champ de saisie `.timeInput` était dimensionné sur son contenu).
  Il occupe désormais la largeur disponible, comme `.dateInput` du `DatePicker` :
  les boutons restent calés à droite.
- **`TimePicker` — le sélecteur d'heure se referme une fois l'heure choisie** :
  le popover à tambours restait ouvert après le choix (il ne se fermait qu'au
  clic extérieur ou à Échap). Il se referme désormais quand l'heure est
  **complète**, c'est-à-dire au **clic** sur la dernière colonne : minutes en
  24 h (secondes si `showSeconds`), AM/PM en 12 h. Choisir une heure ne ferme
  pas (il reste les minutes à choisir). `TimeDrumPicker` expose pour cela
  `onComplete`, déclenché par un clic et non par le défilement (qui émet en
  continu et au calage initial des colonnes). `DatePicker`, `MonthPicker`,
  `WeekPicker` et `YearPicker` se referment déjà au choix.
- **`List` — réserve de l'action secondaire** : `ListItem` et `ListItemButton`
  réservaient la place à droite via `var(--space700)`, un token **inexistant**
  dans `@aexae/comete-design-tokens`. La déclaration était invalide, donc
  `padding-right` retombait à `0` et le contenu textuel passait **sous**
  l'action secondaire (mesuré à 48 px de recouvrement). Remplacé par
  `--space600` = retrait de l'action (`--space200`) + sa largeur (`--size400`).
- **`List` — `isFlush` combiné à une action secondaire** : `isFlush` annulait
  aussi la réserve droite ci-dessus, ramenant le recouvrement. La réserve est
  désormais rétablie dans ce cas, réduite à la seule largeur de l'action, et
  l'action elle-même se cale au bord pour rester alignée sur le texte mis à plat.
- **`SearchField` / `TextField type="search"` — deux croix d'effacement** : au
  survol ou au focus d'un champ rempli, Chromium et Safari affichaient leur
  croix native **en plus** du bouton « Effacer » du DS. L'accessoire natif
  (`::-webkit-search-cancel-button` et `::-webkit-search-decoration`) est
  désormais masqué : seul le bouton du DS (`isClearable`) subsiste.
- **`DatePicker` (saisie, date et plage) — bouton calendrier** : trois défauts
  liés. Le `DatePicker` de React Aria injecte dans **tous** ses boutons un contexte
  (`isPressed: state.isOpen`, `onPress` = ouverture seule, `aria-expanded`) qui
  pilote **son propre** état d'ouverture, distinct de celui du DS. Résultat : le
  bouton restait coloré en état « appuyé » une fois le calendrier ouvert, un
  second clic sur l'icône ne refermait pas le calendrier, et « Effacer » héritait
  lui aussi de ce contexte. Le bouton calendrier est désormais sorti du contexte
  (`slot={null}`) : il **ouvre et referme** le calendrier, expose
  `aria-haspopup="dialog"` et `aria-expanded` à jour, et ne reste plus appuyé.
  « Effacer » est lui aussi sorti du contexte. Choisir une date (ou une plage
  complète) **referme** le calendrier.
- **Logo, rendu hors tokens** (e-mails, exports, page sans la feuille des tokens) :
  le suffixe et la signature Comète prenaient un gris unique `#6F8488`, à 3,9:1 sur
  blanc et 3,0:1 sur navy, sous le seuil AA. Bump `@aexae/comete-logos` → `0.13.1`
  (racine + storybook), qui donne un ton de repli par apparence : 5,6:1 (`brand`),
  8,9:1 (`neutral`), 6,5:1 (`inverse`). Aucun changement de rendu avec les tokens
  chargés, aucun changement d'API.

## [1.0.0-alpha.163] - 2026-10-06

### Changements cassants (BREAKING)

- La peer dependency `@aexae/comete-icons` passe de `^0.7.0` à `^0.8.0`. Icons 0.8.0 ne
  change aucune icône : il corrige sa propre peer dependency sur les tokens, qui exigeait
  `^0.13.0` et excluait donc 0.14 à 0.17 (en semver 0.x, `^0.13.0` vaut
  `>=0.13.0 <0.14.0`). C'était le dernier avertissement de peer non satisfaite à
  l'installation du design system.

## [1.0.0-alpha.162] - 2026-10-06

### Modifié

- **Logo, variante `inverse`** : le suffixe « on time » passe sur le ton atténué du
  thème opposé (`--logo-comete-subtle-inverted`). La variante `inverse` se pose sur la
  surface opposée au thème, mais le suffixe prenait le ton atténué du thème courant :
  1,6 à 2,6:1, illisible. Il remonte à **5 à 8:1**. Aucun changement d'API.
- Bump `@aexae/comete-design-tokens` → `0.17.0` (nouveau token
  `--logo-comete-subtle-inverted`) et `@aexae/comete-logos` → `0.13.0` (consomme ce
  token ; sa peer dependency sur les tokens passe de `^0.13.0` à `^0.17.0`).

## [1.0.0-alpha.161] - 2026-10-06

### Changements cassants (BREAKING)

- **ProgressBar `appearance="auto"`** (valeur par défaut) suit désormais l'axe de statut
  de l'ADR 0002 : `information` de 0 à 99 %, `success` à 100 %. Les anciens seuils
  (`critical` ≤ 20, `warning` 21–69, `information` 70–99) sont supprimés : ils peignaient
  en rouge toute barre qui démarre et traitaient une progression normale comme une alerte.
  Pour une jauge à seuils (quota, capacité, échéance), passer `appearance="warning"` ou
  `"critical"` explicitement depuis la règle métier.

## [1.0.0-alpha.160] - 2026-10-04

### Modifié

- **Couleurs disabled** : les tokens `disabled` (fond, texte, icône, bordure) pointent
  désormais sur les primitives alpha (`black-*` / `white-*`) au lieu de `grey.solid`.
  Le contraste texte sur fond disabled remonte de ~1,27:1 à **2,62:1** (clair) et de
  ~2,1:1 à **3,42:1** (sombre). Le fond disabled devient semi-transparent et s'adapte à
  la surface sous-jacente. Les 26 composants qui consomment ces tokens suivent
  automatiquement, sans modification de code.
- **Texte par défaut (thème sombre)** : `text.default` passe de `cool-grey.200` (`#d8dedf`)
  à `cool-grey.50` (`#f7f8f8`), texte par défaut plus lumineux et contrasté en dark.
- Bump `@aexae/comete-design-tokens` → `0.16.0` (regroupe les deux changements ci-dessus).

## [1.0.0-alpha.159] - 2026-09-29

### Modifié

- **Icônes** : `InvoiceStatusCheck` resynchronisée depuis Figma, accent en
  `--icon-information` (bump `@aexae/comete-icons` → `0.7.5`).

## [1.0.0-alpha.158] - 2026-09-29

### Ajouté

- **Icônes** : `CalendarAi`, `Female`, `Instruction`, `Male`, `TextFields`, `VisibilityBadge`
  et `License` (existait sans export) via `<Icon icon="…" />` (bump `@aexae/comete-icons` → `0.7.4`).

### Modifié

- **Icônes** : couleurs alignées sur Figma, zéro couleur codée en dur dans le paquet
  (110 composants corrigés) ; 28 icônes aux tracés mis à jour depuis Figma (famille
  `Clocking*`, `Description`, `HourlyRate`, `Tune`, `Lock`, `Pdf`, `Report`, etc.).
  `--icon-selected` n'apparaît plus dans le dessin des icônes (reste disponible via
  la prop `color`).

## [1.0.0-alpha.157] - 2026-09-29

### Ajouté

- **Icônes** : nouvelle icône `DeployedCode` (Material Symbols `deployed_code`) via
  `<Icon icon="DeployedCode" />` (bump `@aexae/comete-icons` → `0.7.3`).

## [1.0.0-alpha.155] - 2026-09-15

### Modifié

- **Couleurs (tokens)** — via `@aexae/comete-design-tokens@0.13.2` :
  - Bouton `color="comete"` (contained), thème clair : fond default/hover/pressed
    passe de comete-blue `950/900/800` à `700/800/900` (bleu de marque plus vif
    qui fonce à l'interaction ; blanc sur le fond par défaut = 5.34:1, AA).
  - Tokens `selected` / `focused` repointés de la palette `blue` vers `comete.blue`
    au même step (clair + sombre) : `--border-focused`, `--border-selected`,
    `--background-focused-default`, `--text-selected`, `--icon-selected`,
    `--border-selected-inverted`, `--border-focus-inverted`.

### Ajouté

- **`Page.Toolbar`** : nouveau slot `filters` (optionnel, non-breaking) — le
  déclencheur du panneau de filtres (typiquement un unique bouton « Filtres »
  ouvrant un popover) rendu sur la ligne de la toolbar, **entre la recherche et
  `start`**, pour que recherche + filtres + vues + actions tiennent sur une
  seule ligne. Largeur de contenu, jamais comprimé.
- **`ListItemButton`** : nouvelle prop `isFlush` (défaut `false`) qui annule le
  padding **horizontal** de l'item (le vertical / la cible tactile de 44 px est
  conservé). À utiliser quand un conteneur parent définit déjà le retrait
  horizontal, pour un unique bord d'alignement.
- **`ListHead`** : nouvelle prop `isFlush` (défaut `false`) qui annule le padding
  **horizontal** du sous-titre de section (le vertical est conservé), pour
  l'aligner sur des items eux-mêmes mis à plat (`ListItemButton isFlush`).
- **Drawer — mode non modal** : nouvelle prop `isModal` (`true` par défaut,
  non-breaking). En `isModal={false}`, le Drawer devient un **panneau persistant
  rendu dans le flux** — sans voile ni piège à focus, sans fermeture au clic
  extérieur / Échap, et sans voler le focus à l'ouverture. Réservé aux
  placements `left` / `right`.
## [1.0.0-alpha.154] - 2026-09-07

### Corrigé

- **Typographie** : le token `--font-family-code` passe de `SF Mono` (exclusif
  Apple, sans fallback → texte non-monospace hors macOS) à une **pile monospace
  système** cross-platform : `ui-monospace, SFMono-Regular, "SF Mono", Menlo,
  Consolas, "Liberation Mono", monospace` (via `@aexae/comete-design-tokens@0.13.1`).
  Le rôle « code » rend désormais en monospace sur toutes les plateformes.

## [1.0.0-alpha.153] - 2026-09-03

### Ajouté

- **Icônes** : nouvelle icône `AdminPanelSettings` via `<Icon icon="AdminPanelSettings" />`
  (bump `@aexae/comete-icons` → `0.7.2`).

## [1.0.0-alpha.152] - 2026-09-03

### Ajouté

- **Icônes** : nouvelle icône `HourlyRate` disponible via `<Icon icon="HourlyRate" />`
  (bump `@aexae/comete-icons` → `0.7.1`). Son accent duotone rouge est mappé sur
  `--icon-critical`.

## [1.0.0-alpha.151] - 2026-09-03

### Ajouté

- **Icônes** : 3 nouvelles icônes disponibles via `<Icon icon="…" />` —
  `SubcontractorFilter`, `Revenue`, `FinanceMode`. Bump de la dépendance
  `@aexae/comete-icons` → `^0.7.0` (peer). Elles apparaissent automatiquement
  dans l'explorateur d'icônes de Storybook (liste dynamique).

## [1.0.0-alpha.150] - 2026-08-17

### Changements cassants (BREAKING)

- **Migration de scope `@naxit/*` → `@aexae/*`** : les dépendances d'icônes,
  logos et illustrations sont désormais publiées sous le scope de l'organisation
  `@aexae` (alignement avec `@aexae/comete-design-tokens` et
  `@aexae/comete-design-system`). Les `peerDependencies` du DS passent de
  `@naxit/comete-icons` / `@naxit/comete-illustrations` à
  `@aexae/comete-icons` (>=0.6.1) / `@aexae/comete-illustrations`
  (>=0.1.0-alpha.4). **Action requise côté consommateur** : installer les
  paquets `@aexae/*` correspondants (les `@naxit/*` ne sont plus utilisés). Plus
  aucune référence à `naxit` dans le code, les commentaires, la documentation ni
  la configuration.

## [1.0.0-alpha.149] - 2026-08-12

### Corrigé

- **Build / dist — feuilles livrées en `*.css` plein, plus en `*.module.css`
  (critique)** : le build émettait les feuilles sous leur nom source
  `X.module.css`, avec les classes déjà scopées (`X-module__local`) figées dans le
  JS. Or les bundlers des consommateurs (Vite, webpack `css-loader modules.auto`)
  appliquent la transformation CSS Modules à **tout** fichier `*.module.css`, y
  compris dans `node_modules` : ils **re-scopaient** `.X-module__local` en
  `._X-module__local_hash`, si bien que la feuille ne ciblait plus les classes
  posées dans le DOM → composants non stylés chez Vite/webpack (alors que le paquet
  paraissait sain avec un bundler sans CSS Modules par extension, ex. esbuild).
  Le build « aplatit » désormais les feuilles en `*.css` (script
  `scripts/plainify-css.mjs`) et réécrit l'import side-effect injecté ; ces
  feuilles sont de fait globales et ne sont plus re-traitées par personne. Garde
  ajoutée dans `scripts/smoke-dist.mjs` : échec si un `*.module.css` est livré.

## [1.0.0-alpha.148] - 2026-08-12

### Corrigé

- **Build / dist — paquet non stylé (critique)** : chaque composant importe son
  module CSS, mais l'ancien build (tsup) compilait ces `*.module.css` en objets
  vides (`{}`) → tous les composants posaient des classes `undefined`, aucun style
  n'était appliqué chez les consommateurs (l'`index.css` était valide mais ne ciblait
  rien). Le build passe sur **Vite (library mode)** pour le JS + CSS Modules (même
  pipeline que les tests/Storybook), avec **`tsup --dts-only`** pour les `.d.ts`
  bundlés. Garde de non-régression ajoutée : `scripts/smoke-dist.mjs` (lancé par
  `pnpm build`) + `publint` en CI.

### Ajouté

- **Table — lignes interactives accessibles** : `TableRow` accepte `href`
  (navigation) ou `onPress` (action, p. ex. ouvrir un panneau). L'élément
  focusable réel est un vrai `<a href>` / `<button>` rendu **dans la cellule
  primaire** (première `TableCell`, ou celle marquée `isRowAnchor`), jamais sur
  le `<tr>` : l'affordance devient atteignable au clavier et annoncée par les
  lecteurs d'écran, la sémantique de table est préservée. Le clic sur le reste
  de la ligne est un confort souris qui délègue à cet élément (et ignore les
  interactifs internes : checkbox de sélection, boutons d'action). Nouveau
  `isRowAnchor` sur `TableCell` pour désigner la cellule primaire.

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
- **List** : prop `gap` (`"100" | "150" | "200"`) — espacement vertical entre
  items (`row-gap`), pour une séparation « sans filet » (sans dividers).
  Orthogonale à `isDense` (qui agit sur le padding interne). Type `ListGap`
  exporté.
- **`useTableSelection`** — hook de sélection de lignes pour `Table` (contrôlé
  ou non) : gère l'ensemble des clés sélectionnées, le toggle par ligne, le
  « tout sélectionner » à **périmètre page courante** et l'état **indeterminate**.
  Fournit des prop-getters `getSelectAllProps()` / `getRowCheckboxProps(key, label?)`
  à étaler sur les `Checkbox` d'en-tête et de ligne, plus `getRowClickProps(key)`
  pour rendre **toute la ligne** cliquable (amélioration pointeur ; ignore les
  clics sur la case pour éviter le double toggle). Supprime le boilerplate
  d'état que chaque consommateur réécrivait ; la sélection composable existante
  (`TableRow isSelected` + `Checkbox` + `Table.SelectionBar`) est inchangée.
  Types `UseTableSelectionOptions` / `UseTableSelectionResult` exportés
  (via `@aexae/comete-design-system` et `@aexae/comete-design-system/hooks`).
- **`BREAKPOINTS`** — source unique des breakpoints responsives du DS
  (`sm: 600`, `md: 900`, `lg: 1200`), exportée depuis
  `@aexae/comete-design-system` (+ type `Breakpoint`). `Grid` (media queries
  viewport) et `Table` (`hideBelow`, container queries) reflètent désormais ces
  valeurs ; une garde de test (`breakpoints.test.ts`) empêche toute dérive entre
  les constantes et le CSS.
- **Tag** : types `TagStatusColor` (`neutral` | `information` | `warning` |
  `success` | `critical`) et `TagCategoryColor` (`comete` + les cinq `accent*`)
  exportés. `TagColor` reste leur union — **non cassant**, tout code existant
  compile à l'identique. Le découpage rend la doctrine de l'ADR 0002 visible à
  l'autocomplétion et permet de typer un mapping statut → couleur de façon que
  le compilateur interdise d'y glisser une couleur catégorielle.

### Déprécié

- **`TableRow onClick`** : déprécié au profit de `href` / `onPress`. Posé sur le
  `<tr>`, il ne crée ni rôle, ni ordre de tabulation, ni gestion clavier — la
  ligne cliquable reste invisible au clavier et aux lecteurs d'écran. Toujours
  fonctionnel (avec un `console.warn` en développement) ; ignoré si
  `href`/`onPress` est fourni.

### Modifié

- **Table** : les flèches de tri des en-têtes triables ne s'affichent plus qu'au
  **survol** (et au focus clavier) ; la colonne actuellement triée garde sa
  flèche visible.
- **Table** (`hideBelow`) : seuils de masquage des colonnes **alignés sur la
  source unique `BREAKPOINTS`** — `sm 480→600`, `md 768→900`, `lg 1024→1200`.
  Cohérence avec les breakpoints de `Grid` (600/1200) ; l'API (`"sm"|"md"|"lg"`)
  est inchangée, seuls les seuils (largeur de container) bougent.
- **`ListItemTrailing`** : calé en **haut** de l'item (`align-self: flex-start`)
  au lieu d'être centré — reste en regard de la 1re ligne du titre quand
  celui-ci passe à 2 lignes (`ListItemText lineClamp`). Sans effet sur les items
  d'une seule ligne (la hauteur y égale la ligne d'état réservée). Démontré dans
  la recette `Table → List`, où les titres d'incident (longs) passent en
  `lineClamp={2}`.

### Documentation

- **ADR 0002 — sémantique des couleurs de statut**
  (`docs/adr/0002-semantique-couleurs-statut.md`), de portée **DS entière**
  (`Tag`, `Badge`, `IconTile`, `SectionMessage`, `Banner`, `Snackbar`,
  `ProgressBar`, `Text`, `Icon`) : acte l'axe unique des cinq
  sens — `neutral` (pas commencé, archivé), `information` (étape en cours),
  `warning` (action ou décision attendue), `success` (**l'état souhaité est
  atteint**), `critical` (échec ou refus). Distingue les **deux lectures** de
  cet axe : *progression* (l'état souhaité est l'arrivée → l'étape courante est
  `information`) et *cycle de vie* (l'état souhaité est le régime nominal →
  `Actif` est `success`). Pose le critère `critical` / `warning` : `critical` =
  ça a raté ou ça a été refusé ; `warning` = quelqu'un doit décider, ce qui
  inclut les interruptions réversibles. Acte l'exclusion des couleurs
  catégorielles (`comete`, `accent*`) du vocabulaire de statut et quatre règles
  d'usage (une couleur = un sens ; un tag = une dimension ; le libellé porte le
  sens ; `subtle` par défaut). Écrit explicitement le **hors périmètre** : la
  liste des statuts métier et leur mapping ne vivent pas dans le DS mais dans
  une couche produit versionnée séparément.
  L'ADR recense les composants concernés et laisse **trois écarts
  explicitement non tranchés** : `Banner.appearance = "announcement"`,
  `Snackbar.appearance = "discovery"` et le mode `auto` de `ProgressBar`, qui
  code sa propre sémantique (`critical ≤ 20`, `warning 21–99`, `success 100`).
- **Story `Foundation/Statut`** — page de référence de l'axe : les cinq sens,
  progression vs cycle de vie, un axe / plusieurs composants, statut vs
  catégorisation, l'illustration « un tag = une dimension », et les règles
  d'apparence. Vocabulaire strictement générique (le DS ignore le domaine).
  `Foundation/Couleur` y renvoie.
- **Stories Table** : les deux mappings statut → couleur sont fusionnés en une
  **map de démonstration unique** `DEMO_STATUS_COLOR`, explicitement marquée
  **non normative**, typée `TagStatusColor` et réalignée sur l'axe de l'ADR 0002
  (« En cours » passe de `success` à `information`, « Terminée » de `neutral` à
  `success`). La guideline Table qui énonçait un mapping concurrent en
  vocabulaire métier renvoie désormais à l'ADR.
- **Story de référence Table** « Recette — Table ↔ cartes » : mêmes données
  rendues en `Table` ou en grille de `Card` (titre + métadonnées + `Tag` de
  statut), bascule via un `ToggleButtonGroup` (liste / grille) dans le header du
  `Table.View`. La guideline précise que la bascule est une option par écran,
  jamais le repli téléphone par défaut (qui reste la liste compacte).
- **Recette `Table → List`** : recâblée sur le slot `ListItemTrailing` du DS
  (avatar + heure au-dessus du statut, ligne d'état réservée portée par le
  composant). La recette ne porte **plus aucune classe CSS locale** et
  `storybook/stories/Table.stories.module.css` est supprimé — la mécanique vit
  désormais dans `List`, conformément à `CONTRIBUTING.md`.
- Ajout de `CONTRIBUTING.md` — règle « une story peut détenir de l'état, jamais
  de la mécanique » (les API manquantes repérées en story s'absorbent dans le
  composant avant merge).
- **Guidelines List** : l'anti-pattern « trop d'informations dans le trailing »
  (trois métriques entassées à droite) rejoint le `dontExample` des guidelines,
  avec la règle en face — une seule information dans le trailing, les métriques
  secondaires vont au desktop ou à la fiche. La story autonome
  « Agents — 3 métriques (à éviter) » est supprimée (elle faisait doublon avec la
  démonstration guidelines).

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
  dans `@aexae/comete-icons`), colorés via `--icon-success` / `--icon-warning` /
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
