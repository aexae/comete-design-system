// ---------------------------------------------------------------------------
// png — rasterisation des SVG
// ---------------------------------------------------------------------------
//
// Power BI n'accepte aucun SVG à l'insertion d'image sur le canvas (PNG, JPG,
// BMP, GIF uniquement) : le logo d'en-tête de rapport doit être fourni en PNG.
// On rasterise à plusieurs densités pour rester net sur écran HiDPI et à
// l'export PDF.

import { Resvg } from "@resvg/resvg-js";

/** Rend un SVG en PNG à la densité demandée (1 = taille native). */
export function rasterize(svg: string, scale: number): Buffer {
  const resvg = new Resvg(svg, {
    // `zoom` conserve le ratio, contrairement à un width/height imposé.
    fitTo: { mode: "zoom", value: scale },
    // Fond transparent : le logo doit se poser sur n'importe quel fond de page.
    background: "rgba(0,0,0,0)",
  });
  return Buffer.from(resvg.render().asPng());
}
