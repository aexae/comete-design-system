# Contexte du chantier design Comète BI

Journal du chantier entre Axel et Claude. Ouvert pendant l'échange Cowork du 31 août au 4 septembre 2026, repris depuis le 4 septembre dans la session terminal, désormais la seule active. Ce fichier est versionné par git, il remplace le suffixe `_vX` utilisé pour les documents livrés hors dépôt.

## Situation

- Comète BI = rapport Power BI de 23 pages (2 visibles : Accueil et Droits d'accès, 21 masquées atteintes par le menu en arborescence de l'Accueil), développé par le prestataire KPI Consulting (Frédéric Roucher, frederic@kpi-consulting.fr) avec Patrick Etienne (Responsable Développements) et Pascal Bailleul (AMOA).
- Interlocuteurs Comète : Thomas Bejarano (chef de produit, tient le tableau de suivi des demandes), François-Régis de Feydeau (autre point d'entrée des demandes), Vincent Guerin (seul à suivre la consommation des jours), Patricia (Responsable Support).
- Contrat TMA KPI : 1,5 jour par mois. Toute demande passe par Thomas ou François-Régis et le tableau de suivi. Aucun canal parallèle.
- Déclencheur : le 27 août Frédéric a proposé un restyling « glossy » (liquid glass) des rapports plus un passage en 16:9. Point de cadrage Axel × Frédéric le 1er septembre.

## Décisions actées

- Pause des évolutions purement visuelles en autonomie. Le restyling glossy reste non publié.
- Le contenu design est défini et validé par Axel. Les demandes officielles suivent le circuit TMA.
- Comète fournit un référentiel exploitable : thème Power BI généré depuis les tokens, gabarits, règles d'usage.
- Principe « home staging » : zéro décision design à la charge de Frédéric (profil data science), demandes mécaniques et binaires. Axel fait le pilote lui-même, KPI réplique par copier/coller de visuels depuis une page GABARITS masquée dans le PBIX maître.
- 16:9 : non tranché, étude côté Comète (compatibilité écrans, collecte de données d'usage).
- SideNav Power BI reporté en v2 (piste retenue : SideNav permanent à 7 rubriques plus onglets de rubrique, sans signets). Première étape : redesign de la seule page d'Accueil.
- Typographie : DIN n'est plus livrée avec Power BI Desktop et tombe en serif de substitution. Tout le thème est en Segoe UI, Semibold pour titres et chiffres clés.
- En-têtes de page neutres, comme le composant Heading du DS : titre en text-default sur le fond de page, pas de bandeau coloré.

## Contraintes Power BI apprises

- Import d'un thème JSON : Power BI Desktop uniquement, pas le Service. Téléchargement du PBIX désactivé dans le Service. Un PBIX de juin (« COMETE BI v26-03-30.pbix ») trouvé sur le SharePoint TMA sert de bac à sable local : ne jamais publier depuis ce fichier.
- Le modèle a « décourager les mesures implicites » : les champs numériques des visuels n'acceptent que les mesures explicites (dossier Mesures).
- À l'import d'un thème, les éléments liés aux « couleurs du thème » de l'ancien thème (32 couleurs) se remappent sur les nouvelles : l'intégration dans le PBIX maître n'est pas neutre, la reprise des éléments concernés fait partie du lot 1. Constaté le 7 septembre sur l'Accueil du bac à sable (boutons saumon, textes bleus soulignés). La casse est purement cosmétique (données et interactions intactes) et réversible en réimportant l'ancien thème (garder « Thème.json » d'origine comme thème de rollback). Stratégie : tout se fait dans le PBIX local, on ne publie qu'un ensemble de pages reprises cohérent, jamais un état mixte. L'Accueil actuel sera de toute façon remplacé par le gabarit.
- Pas de remise à zéro globale d'un visuel : réinitialisation section par section dans le volet Format. Les zones de texte, formes et boutons existants, chargés de mises en forme explicites, ne se remappent pas au changement de thème : à remplacer par les gabarits. En revanche le schéma de thème 2.157 expose bien `textbox` (text : color, fontFamily, fontSize, plus background), `shape` (fill, outline, text, radius des rectangles) et `actionButton` : les NOUVEAUX objets insérés peuvent hériter de bons défauts si le thème les définit. Comportement à confirmer par un test dans Desktop avant d'étendre le thème.
- Power BI Desktop (version 2026) accepte les fichiers SVG à l'insertion d'image et comme icône personnalisée de bouton (vérifié par Axel le 4 septembre). Il ne les recolore pas : les SVG doivent porter leur couleur. Le `$schema` du thème pointe 2.114, la dernière version publiée est 2.157.
- Volet Format : onglet Général = conteneur commun (position, taille, titre, Effets dont Arrière-plan), onglet Objet visuel = intérieur du composant. Un bouton a deux fonds : piloter le fond uniquement dans l'onglet du composant, Arrière-plan du conteneur toujours désactivé sur les boutons.
- Les formes ont un padding via Forme > Texte > Remplissage (px). La grille de Power BI n'est ni réglable ni fiable : discipline par saisie numérique en multiples de 8.
- Estimation de reprise : 30 à 45 minutes par page (retrait du fond bitmap, remplacement bandeaux/tuiles/boutons par gabarits, resets section par section, re-colorage des éléments remappés).

## Thème : source de vérité = ce dossier (tools/powerbi-kit)

- Le thème n'est plus édité à la main. Il est généré depuis les tokens par `config/theme-base.json` (structure) et `config/theme-tokens.json` (chemin JSON vers token, light et dark).
- Historique : v0 (2 sept, généré depuis les tokens primitifs), v0.1 (nouvelle Carte `cardVisual` et `actionButton`), v0.2 (DIN remplacée par Segoe UI Semibold), v0.3 (4 sept, appliqué dans les configs du kit sur go d'Axel, name du theme-base corrigé le même jour), v0.4 (4 sept, sur go d'Axel : défauts des nouveaux objets, `textbox` en Segoe UI 10 text-default sans remplissage, `shape` en fond surface, contour border-default, radius 4, et `$schema` passé de 2.114 à 2.157), v0.5 (7 sept, sur go d'Axel : icône des boutons à 24 px par défaut, et correctif du radius des boutons : la propriété `roundedCornerRadius` du v0.3 n'existe pas dans le schéma, remplacée par `rectangleRoundedCurve`, le radius 6 ne s'appliquait probablement pas jusqu'ici). Les thèmes générés s'appellent « Comète BI clair » et « Comète BI sombre ».
- v0.3 : couleurs basculées sur les tokens sémantiques (text-default pour texte, titres, callouts et valeurs, text-subtle pour étiquettes, border-default, fond de page background-surface-elevation-sunken, zébrage sunken, grilles border-subtle, totaux brand-subtlest), radius des visuels 4 (DS Card = radius050), rowPadding des tables retiré, bouton = contained.default du DS (fond neutral-subtler, texte text-default, sans contour, Arrière-plan désactivé, radius 6 = control-radius-default). Mapping vérifié light et dark : zéro token manquant, zéro hexa hors tokens.
- Un aperçu équivalent à `dist/theme/comete-bi-light.json` a été livré hors dépôt : « Thème Comète BI_v0.3.json ».
- Le build ne tourne pas depuis la VM de Cowork (binaires esbuild et resvg macOS) : `pnpm --filter @aexae/comete-powerbi-kit build` sur le Mac.
- Frédéric a envoyé deux thèmes extraits (Thème.json quasi vide, puis Theme_Comete.json « Effectifs 2026 » avec palette hors tokens sarcelle et or, ombres actives, radius 12). Pièces d'inventaire, à ne pas intégrer. Vigilance : le kit doit être l'unique source avant le lot 1.

## À confirmer et à faire

- À confirmer par Axel : radius 4 sur les visuels, fond de page sunken #f7f8f8, variante contained.default pour les boutons Extraire.
- Ouvert : désactiver dans le thème la bordure interne de la nouvelle Carte (`cardVisual`), nom exact de la section du volet Format non encore fourni.
- Gabarits (page TEMOIN du bac à sable, 1280 × 720) : en-tête neutre avec bouton retour subtle, tuiles KPI 200 × 112, boutons 144 × 40 dans les variantes DS (contained.default, contained.comete pour le CTA, outlined, subtle). Correspondances DS dans `src/components/Button/Button.module.css`. Le 7 septembre, Axel a monté les quatre variantes de boutons dans le gabarit des pages (Primaire, Secondaire, Neutre, Lien) avec leurs états hover et pressed.
- Redesign de la page d'Accueil : spec à produire, avec les icônes du kit pour les rubriques. Question en suspens : garder les 7 cartes KPI actuelles ou les réduire aux KPI actionnables.
- Ensuite : checklist de réplication par page pour KPI, règles d'usage (étiquettes de données obligatoires sur les séries ambre #E19800 et bleu clair #66B8F4, contraste inférieur à 3:1), CR v2 pour Frédéric.
- Couleurs des statuts de devis : mapping validé le 7 septembre (config/status-colors.json, hex résolus des tokens au build, mesure DAX SWITCH livrée dans le README du kit). Constat : les couleurs de la légende « Répartition en % des types de devis » sont des overrides par catégorie posés par KPI, jamais touchés par un import de thème. La mesure de couleur conditionnelle est la seule source, à appliquer visuel par visuel (fx, Valeur de champ).
- Icônes : l'inventaire du tour produit (21 icônes) est couvert par la sélection du kit, y compris Revenue, FinanceMode et SubcontractorFilter pour les trois manquantes identifiées. Le kit génère aussi `dist/svg/icons/main_menu/` : les 8 icônes du menu principal en SVG à couleur figée (token icon-brand), pour les boutons et le canevas.
- Logos : SVG uniquement depuis le 4 septembre (PNG retirés, Desktop accepte le SVG et il reste net à toute taille).
- Contrôle du kit : `pnpm --filter @aexae/comete-powerbi-kit verify` rejoue le chemin réel (substitution DAX, décodage de la data URI, rasterisation) et échoue au moindre SVG cassé. À lancer après chaque build.
- Reste à valider dans Desktop : qu'une zone de texte et une forme neuves héritent bien des défauts du thème v0.4 à l'insertion (le schéma le permet, le comportement à l'insertion est à confirmer).

## Roadmap interne (roadmap.logiciel-comete.fr, projet 17, responsable Thomas)

Tâches créées le 2 septembre et assignées à Axel : « Page pilote : thème Comète v0 + gabarits (TESTS-AXEL) », « Étude format 16:9 », « Refonte visuelle lot 1 : intégration du thème au PBIX maître + 6 pages » (1 j/h), « Refonte visuelle lot 2 (6 pages) » (1 j/h), « Refonte visuelle lot 3 : pages restantes + Accueil et icônes Comète » (1 j/h). Dates recalées par Axel, extension de fin de projet à voir avec Thomas.

## Documents livrés hors dépôt

Dossier `/Users/nax/Documents/Axel/Professionnel/Companies/Comète/Comète BI` : trames du point de cadrage (v1 à v3), « Tour produit Comète BI - 2026-09-02_v1.docx » (23 captures, observations), « Inventaire icônes Comète BI_v1.xlsx » (visuels relevés et correspondances comete-icons), « CR chantier design Comète BI_v1.docx » (compte rendu évolutif pour Frédéric), thèmes v0 à v0.3, ressources fournies par KPI (Comete.pptx, Thème.json, Theme_Comete.json).

## Règles de travail avec Axel sur ce chantier

- Aucune modification du thème sans son go explicite. Chaque réglage manuel qu'il fait deux fois dans Desktop est un candidat au JSON : collecter les propriétés au fil de l'eau.
- Couleurs : toujours les tokens sémantiques du DS, jamais des primitifs ni des hexas à la main. Le demander pour tout arbitrage.
- Pas de tiret cadratin ni de point-virgule dans les textes produits. Documents hors dépôt versionnés avec un suffixe `_vX`, jamais écrasés.
- Axel est novice sur Power BI : chaque manipulation en pas-à-pas (ruban, bouton, volet).
- Garder `--no-optional-locks` sur les commandes git de lecture (héritage du montage Cowork, le lock résiduel a été supprimé le 4 septembre).
- La session Cowork est abandonnée depuis le 4 septembre : plus aucune coordination inter-session nécessaire, le travail se fait dans la session terminal sur le Mac.
