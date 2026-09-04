// ---------------------------------------------------------------------------
// readme — documentation livrée avec le kit
// ---------------------------------------------------------------------------
//
// Ce README part avec le kit chez le consultant : il doit être autoportant et
// tenir compte de ce que Power BI sait — et ne sait pas — faire d'un SVG.

export interface ReadmeData {
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
| \`logos/svg/\`, \`logos/png/\` | logos vectoriels et rasterisés (1x, 2x, 3x, fond transparent) |
| \`theme/\` | thèmes de rapport, clair et sombre |

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

## Thème du rapport

**Affichage > Thèmes > Rechercher des thèmes** → \`theme/comete-bi-light.json\`.

Il fixe les couleurs de séries, les rôles KPI (\`good\` / \`neutral\` / \`bad\`), les
fonds, bordures et classes typographiques. Toute la typographie est en
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

- **En-tête de rapport, filigrane, fond** : utiliser les SVG (\`logos/svg/\`),
  nets à toute taille. Les PNG (\`logos/png/\`, 1x, 2x, 3x) restent fournis pour
  les contextes qui refusent le SVG (anciennes versions, exports, documents).
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
