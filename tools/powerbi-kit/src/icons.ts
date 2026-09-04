// ---------------------------------------------------------------------------
// icons — @aexae/comete-icons → SVG plats prêts pour Power BI
// ---------------------------------------------------------------------------
//
// Les composants d'icônes s'appuient sur deux mécanismes que Power BI ignore :
// `fill="currentColor"` (résolu par la classe CSS `.comete-icon--*`) et, pour
// la variante duotone, un `fill="var(--icon-…)"`. On rend le composant en SSR
// puis on remplace ces deux mécanismes par des valeurs littérales.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { iconRegistry, type IconName } from "@aexae/comete-icons";
import { COLOR_PLACEHOLDER } from "./datauri.ts";
import { resolveVars } from "./tokens.ts";

export type IconVariant = "outlined" | "filled" | "duotone";
export type IconSpacing = "default" | "none";

export interface RenderIconOptions {
  variant: IconVariant;
  spacing: IconSpacing;
  /** Taille de rendu en px inscrite dans les attributs width/height. */
  size: number;
  /** Table de tokens, pour résoudre les `var()` de la variante duotone. */
  tokens: Map<string, string>;
  /**
   * Couleur littérale à substituer à `currentColor`.
   * Par défaut le placeholder `%COLOR%`, recolorable en DAX.
   */
  color?: string;
}

/** Tous les noms d'icônes disponibles dans le package, triés. */
export function availableIconNames(): IconName[] {
  return Object.keys(iconRegistry).sort() as IconName[];
}

/**
 * Nettoie le markup SSR : les attributs de présentation liés au DOM (classe
 * CSS, `aria-hidden`) n'ont aucun effet dans une data URI et alourdissent la
 * valeur, qui est plafonnée à 32 768 caractères.
 */
function stripDomAttributes(markup: string): string {
  return markup
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\saria-hidden="[^"]*"/g, "")
    .replace(/></g, "><");
}

/** Rend une icône en SVG autonome, sans dépendance CSS. */
export function renderIcon(name: IconName, options: RenderIconOptions): string {
  const Component = iconRegistry[name];
  if (!Component) throw new Error(`Icône inconnue : ${name}`);

  const markup = renderToStaticMarkup(
    createElement(Component, {
      variant: options.variant,
      spacing: options.spacing,
      size: options.size,
    }),
  );

  const cleaned = stripDomAttributes(markup);
  // Ordre important : les `var()` sont résolues d'abord, car un token peut
  // lui-même contenir un `currentColor` que l'on veut voir substitué ensuite.
  const resolved = resolveVars(cleaned, options.tokens);
  return resolved.replace(/currentColor/g, options.color ?? COLOR_PLACEHOLDER);
}
