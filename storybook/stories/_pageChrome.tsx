// Helper de story partagé — chrome de la `Page.Bar`. PAS un export du DS
// (rien dans src/components/, rien dans l'index public).
//
// Les actions globales ne se redéfinissent pas story par story : elles sont
// UNE composition, injectée une fois par le gabarit via `Page globalActions`.
// Ce helper existe pour que les stories `Layout/Page*` et les recettes montrent
// toutes exactement la même barre.
import type { ReactElement } from "react";
import { fn } from "storybook/test";
import { Avatar, Button } from "@aexae/comete-design-system/components";

/**
 * Bouton loupe de la barre de page. Remplace l'ancien bouton « Réglages » :
 * les préférences sont une destination de navigation, pas une action de barre,
 * et la recherche globale sait désormais y mener.
 */
export function GlobalSearchButton({
  onPress,
  isExpanded,
  density,
}: {
  onPress: () => void;
  /** Reflète l'état déplié du champ (`aria-expanded`). */
  isExpanded?: boolean;
  /** Densité du `Button`, pour suivre celle des actions voisines. */
  density?: "default" | "compact";
}): ReactElement {
  return (
    <Button
      appearance="subtle"
      iconBefore="Search"
      aria-label="Recherche globale"
      {...(density ? { density } : {})}
      {...(isExpanded === undefined ? {} : { "aria-expanded": isExpanded })}
      onPress={onPress}
    />
  );
}

/** Trace du clic sur la loupe dans les stories qui ne jouent pas le parcours. */
export const onOpenGlobalSearch = fn();

/**
 * Trio d'actions globales de la `Page.Bar` : **recherche, notifications,
 * avatar**, dans cet ordre.
 *
 * La loupe vient **avant** les notifications : la recherche est une action
 * choisie et fréquente, la notification est subie. Elle a remplacé l'ancien
 * bouton « Réglages » — les préférences sont une destination de navigation,
 * pas une action de barre, et la recherche globale sait y mener (voir la
 * recette `Recipes/Recherche globale`).
 *
 * Dans les stories de mise en page, le clic sur la loupe est une simple trace :
 * le parcours complet vit dans la recette, qui en porte l'état.
 */
export function PageGlobalActions({
  onSearch = onOpenGlobalSearch,
}: {
  /** Branché par la recette pour ouvrir réellement la page de recherche. */
  onSearch?: () => void;
} = {}): ReactElement {
  return (
    <>
      <GlobalSearchButton onPress={onSearch} />
      <Button appearance="subtle" iconBefore="Notifications" aria-label="Notifications" />
      <Avatar size="medium" initials="AC" />
    </>
  );
}
