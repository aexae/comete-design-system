// ---------------------------------------------------------------------------
// datauri — encodage SVG → data URI consommable par Power BI
// ---------------------------------------------------------------------------
//
// Une mesure DAX catégorisée `Image URL` accepte une data URI SVG. Contraintes
// vérifiées ici :
//   - `#` doit être encodé (`%23`), sinon l'URI est tronquée au premier dièse ;
//   - `<`, `>`, `"`, `%` et les retours ligne doivent être encodés ;
//   - `xmlns` est obligatoire, sinon rien ne s'affiche ;
//   - la valeur doit tenir sous la limite de 32 768 caractères.

/** Limite documentée par Power BI pour une valeur catégorisée `Image URL`. */
export const POWERBI_URL_LIMIT = 32768;

/**
 * Placeholder substituable en DAX pour recolorer une icône à la volée.
 *
 * Volontairement sans `%` : un placeholder contenant des `%` rendrait l'URI
 * malformée tant qu'il n'est pas substitué, et l'image échouerait sans message.
 * Avec `__COLOR__`, une valeur non substituée reste une URI valide — le SVG
 * s'affiche simplement sans couleur, ce qui se diagnostique à l'œil.
 */
export const COLOR_PLACEHOLDER = "__COLOR__";

const PREFIX = "data:image/svg+xml;utf8,";

/**
 * Encode les caractères qui cassent une data URI, en laissant lisibles ceux
 * qui ne posent pas de problème (le SVG reste inspectable à l'œil dans le CSV).
 *
 * `%` est encodé en premier pour ne pas ré-encoder les échappements produits
 * ensuite. Les guillemets deviennent des apostrophes, valides en XML et plus
 * légères qu'un `%22` dans une valeur déjà plafonnée en longueur.
 */
function encodeSvg(svg: string): string {
  return svg
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/"/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DataUriResult {
  uri: string;
  length: number;
  /** true quand la valeur dépasse la limite Power BI et sera tronquée. */
  overLimit: boolean;
}

/** Construit la data URI et signale le dépassement de limite plutôt que de lever. */
export function toDataUri(svg: string): DataUriResult {
  if (!svg.includes("xmlns=")) {
    throw new Error("SVG sans attribut xmlns — Power BI n'affichera rien.");
  }
  const uri = PREFIX + encodeSvg(svg);
  return { uri, length: uri.length, overLimit: uri.length > POWERBI_URL_LIMIT };
}

/** Échappe une valeur pour un CSV RFC 4180 (séparateur virgule, UTF-8 BOM côté écriture). */
export function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
