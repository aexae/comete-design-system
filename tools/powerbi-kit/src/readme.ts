// ---------------------------------------------------------------------------
// readme — documentation livrée avec le kit
// ---------------------------------------------------------------------------
//
// Ce README part avec le kit chez le consultant : il doit être autoportant et
// tenir compte de ce que Power BI sait — et ne sait pas — faire d'un SVG.

export interface StatusColorRow {
  value: string;
  token: string;
  note: string;
  hex: string;
}

export interface ChartColorRow {
  token: string;
  hex: string;
}

export interface ReadmeData {
  /** Palette de séries du thème, dans l'ordre des slots. */
  seriesColors: ChartColorRow[];
  /** Couleurs sémantiques à utiliser dans les mesures DAX. */
  semanticColors: (ChartColorRow & { label: string })[];
  /** Convention des comparaisons N contre N-1. */
  nVsN1: { current: ChartColorRow; previous: ChartColorRow };
  /** Couleurs de statut résolues, injectées dans la mesure DAX livrée. */
  statusColors: { column: string; fallback: string; entries: StatusColorRow[] };
  iconCount: number;
  /** Écarts relevés entre l'interface actuelle et le kit. */
  notes: string[];
  variants: string[];
  logoCount: number;
  colorCount: number;
  placeholder: string;
  limit: number;
}

export function renderReadme(data: ReadmeData): string {
  return `# Kit Power BI Comète

Icônes, logos et thème du design system Comète, préparés pour Power BI.
Kit généré automatiquement depuis les sources du design system : ne pas éditer
les fichiers à la main, ils seront écrasés à la prochaine génération.

## Ce que contient le kit

| Fichier / dossier | Contenu |
|---|---|
| \`icons.csv\` | ${data.iconCount} icônes × ${data.variants.length} variante(s) (${data.variants.join(", ")}), en data URI prête pour DAX |
| \`colors.csv\` | ${data.colorCount} couleurs sémantiques Comète, pré-encodées pour \`SUBSTITUTE()\` |
| \`logos.csv\` | ${data.logoCount} logos en data URI |
| \`svg/icons/\` | les mêmes icônes en SVG plats (placeholder de couleur) |
| \`svg/icons/main_menu/\` | icônes du menu principal en SVG à couleur figée, pour le canevas et les boutons |
| \`logos/svg/\` | logos en SVG uniques, autonomes, fond transparent |
| \`theme/\` | thèmes de rapport, clair et sombre. Les \`.annotated.jsonc\` portent le nom du token en commentaire sur chaque couleur : pour la lecture uniquement, Power BI refuse les commentaires à l'import |

## Power BI et le SVG : deux canaux

**Sur le canevas** (Insérer > Image, icône personnalisée d'un bouton) : Power BI
Desktop accepte les fichiers \`.svg\` (vérifié sur la version 2026). Attention,
il ne sait pas les recolorer : utiliser les SVG à couleur figée du dossier
\`svg/icons/main_menu/\`, dont la couleur est résolue depuis les tokens au build.

**Dans les visuels de données** (tables, matrices, cartes) : passer par une
**mesure ou colonne catégorisée \`Image URL\`** contenant une data URI, ce que
fournit \`icons.csv\`. C'est le seul canal recolorable en DAX. Cela ne fonctionne
ni dans le visuel Image ni dans les segments. À valider tôt sur les visuels
réellement retenus, ainsi que sur l'export PDF / PowerPoint du rapport.

## Mise en place

1. **Données > Obtenir des données > Texte/CSV** → \`icons.csv\`.
   Vérifier que l'encodage détecté est **UTF-8** et le séparateur la virgule.
2. Sélectionner la colonne \`svg_datauri\` → onglet **Outils de colonne** →
   **Catégorie de données** → **URL de l'image**.
3. Faire de même avec \`colors.csv\` (aucune catégorisation nécessaire).

Les tables n'ont pas besoin d'être reliées au modèle : elles servent de
bibliothèque, interrogées par nom.

## Recoloration en DAX

Chaque icône contient le placeholder \`${data.placeholder}\` à la place de sa
couleur. Sans substitution le SVG reste valide mais sa couleur est ignorée :
l'icône sort en noir. Toujours substituer le placeholder.

\`\`\`dax
Icone =
VAR Svg = LOOKUPVALUE(
    Icons[svg_datauri],
    Icons[name], "ArrowPositive",
    Icons[variant], "filled"
)
RETURN SUBSTITUTE(Svg, "${data.placeholder}", "%23009B60")
\`\`\`

Le \`#\` d'une couleur hexadécimale **doit être écrit \`%23\`** : un \`#\` littéral
tronque l'URI et l'icône disparaît. La colonne \`dax_value\` de \`colors.csv\`
contient déjà les couleurs sous cette forme.

### Icône conditionnelle, variation d'un indicateur

\`\`\`dax
Tendance =
VAR Variation = [CA mois] - [CA mois-1]
VAR NomIcone  = IF(Variation >= 0, "ArrowPositive", "ArrowNegative")
VAR Couleur   = IF(Variation >= 0, "%23009B60", "%23E12121")
VAR Svg = LOOKUPVALUE(Icons[svg_datauri], Icons[name], NomIcone, Icons[variant], "filled")
RETURN SUBSTITUTE(Svg, "${data.placeholder}", Couleur)
\`\`\`

Placer la mesure dans une colonne de table ou de matrice : elle s'affiche comme
une image, à la taille de ligne définie dans **Format > Valeurs > Taille**.

## Couleurs des graphiques et des mesures DAX

Les visuels qui suivent le thème n'ont rien à faire : la palette de séries
s'applique seule, dans cet ordre.

| Slot | Token | Hex |
|---|---|---|
${data.seriesColors.map((c, i) => `| ${i + 1} | \`${c.token}\` | \`${c.hex}\` |`).join("\n")}

En revanche, **les couleurs écrites dans les mesures DAX ne suivent jamais le
thème** : mises en forme conditionnelles, flèches de tendance, titres
dynamiques. Chaque hex codé dans une mesure doit être remplacé par une valeur
de ce document. Pour les usages sémantiques :

| Usage | Token | Hex |
|---|---|---|
${data.semanticColors.map((c) => `| ${c.label} | \`${c.token}\` | \`${c.hex}\` |`).join("\n")}

### Comparaisons N contre N-1

Une série N contre N-1 n'est pas deux catégories : c'est un sujet et son
contexte. Ne pas leur donner deux couleurs pleines de la palette. La règle :

| Série | Token | Hex |
|---|---|---|
| Période courante (N) | \`${data.nVsN1.current.token}\` | \`${data.nVsN1.current.hex}\` |
| Période de comparaison (N-1) | \`${data.nVsN1.previous.token}\` | \`${data.nVsN1.previous.hex}\` |

Le thème ne sait pas affecter une couleur à un nom de série : ces deux
couleurs s'appliquent dans le visuel (section Couleurs, série par série),
ou par la mesure DAX quand le visuel le permet.

Règle : plus aucun hex hors de ce document dans les mesures. En cas de besoin
non couvert, demander à Comète plutôt que d'improviser une couleur.

## Couleurs des statuts de devis

Les statuts portent leur couleur par le sens, pas par la position dans la
palette. Ne jamais laisser un visuel colorer les statuts tout seul : appliquer
la mesure ci-dessous sur chaque visuel concerné (volet Format, section
Colonnes ou Couleurs des données, bouton fx, Style de format = Valeur de
champ, choisir la mesure).

| Statut | Token | Hex |
|---|---|---|
${data.statusColors.entries.map((e) => `| ${e.value} | \`${e.token.slice(2)}\` | \`${e.hex}\` |`).join("\n")}

\`\`\`dax
Couleur statut devis =
SWITCH(
    SELECTEDVALUE(${data.statusColors.column}),
${data.statusColors.entries.map((e) => `    "${e.value}", "${e.hex}",`).join("\n")}
    "${data.statusColors.fallback}"
)
\`\`\`

Adapter la référence \`${data.statusColors.column}\` au nom réel de la table et
de la colonne du modèle. Les couleurs affectées manuellement par catégorie ne
sont jamais touchées par un import de thème : cette table est la seule source.

Le mécanisme d'application dépend du visuel. La mise en forme conditionnelle
par mesure (fx, Valeur de champ) est disponible sur les barres, colonnes et
aires sans champ dans le puits Légende, et sur les fonds de cellule des tables
et matrices. Quand le visuel a une légende, ou pour les secteurs et anneaux,
Power BI ne propose pas le fx : affecter alors les couleurs par catégorie à la
main (Format, Couleurs des données) en prenant les hex de la table ci-dessus.
Dans tous les cas la règle est la même : un statut, une couleur, partout.

## Thème du rapport

**Affichage > Thèmes > Rechercher des thèmes** → \`theme/comete-bi-light.json\`.

Il fixe les couleurs de séries, les rôles KPI (\`good\` / \`neutral\` / \`bad\`), les
fonds, bordures et classes typographiques. Il définit aussi les défauts des
objets insérés : une zone de texte neuve part en Segoe UI 10 sans remplissage,
une forme neuve part en fond de surface avec un contour discret et des coins
arrondis. Ne s'applique qu'aux objets créés après l'import du thème. Toute la typographie est en
**Segoe UI**, livrée avec Windows, avec **Segoe UI Semibold** pour les titres et
les chiffres clés. Aucune police à installer.

La police DIN a été écartée : elle n'est plus fournie avec Power BI Desktop et
tombe en police à empattements de substitution.

## Icônes dans un bouton Power BI

Sélectionner le bouton, volet **Format > Bouton > Style > Icône**, choisir
**Type de forme > Personnalisé** puis **Parcourir** vers un SVG de
\`svg/icons/main_menu/\`. La couleur est portée par le fichier (token
\`icon-brand\`) : Power BI ne recolore pas un SVG importé.

## Logos

- **En-tête de rapport, filigrane, fond** : Insérer > Image vers un SVG de
  \`logos/svg/\`, net à toute taille.
- **Dans une table ou une carte** : \`logos.csv\`, comme les icônes.
- Apparences : \`brand\` (fond clair), \`inverse\` (fond sombre), \`neutral\`
  (monochrome). Le logo est un élément de marque : ne pas le recolorer,
  le déformer ni le recomposer.

## Écarts avec l'interface actuelle

L'inventaire des icônes de Comète BI a relevé des éléments qui ne se
transposent pas tels quels dans le rapport :

${data.notes.map((n) => `- ${n}`).join("\n")}

## Limites connues

- Une valeur \`Image URL\` est plafonnée à ${data.limit.toLocaleString("fr-FR")} caractères. La colonne
  \`uri_length\` permet de le vérifier. Aucune valeur de ce kit ne dépasse la limite.
- La variante \`duotone\` des icônes n'est pas fournie : sa seconde teinte est
  fixée par le design system et ne suit pas la recoloration DAX.
- Les couleurs sont celles du **thème clair**. Un rapport sur fond sombre
  demande de substituer des couleurs claires, ou d'utiliser \`theme/comete-bi-dark.json\`.
`;
}
