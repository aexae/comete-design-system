// useSlidingIndicator — Comète Design System (interne)
// Pastille de sélection unique qui glisse d'un item à l'autre (SideNav). La
// BottomNav ne glisse pas : sa pastille s'agrandit sur place. Le conteneur porte la pastille en position absolue ; le hook
// mesure l'item sélectionné et en donne la géométrie.
//
// Le glissement n'a lieu que quand la SÉLECTION change. Un simple
// redimensionnement (bascule rail/déployé, fenêtre) replace la pastille sans
// transition, pour qu'elle colle à son item au lieu de le poursuivre.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

interface IndicatorState {
  /** Géométrie de la pastille, relative au conteneur. `null` : rien de sélectionné ou rien de mesurable. */
  rect: { x: number; y: number; width: number; height: number } | null;
  /** Vrai le temps d'un changement de sélection : la pastille glisse. */
  isAnimated: boolean;
}

export interface UseSlidingIndicatorResult {
  /** Vrai quand la pastille est en place : les items cessent alors de peindre leur propre fond sélectionné. */
  isActive: boolean;
  /** Vrai quand la pastille doit glisser vers sa nouvelle position. */
  isAnimated: boolean;
  /** Position et taille à poser sur l'élément pastille. */
  style: CSSProperties | undefined;
}

/**
 * @param containerRef - Conteneur positionné (`position: relative`) qui porte la pastille.
 * @param selector - Sélecteur CSS de l'élément à recouvrir, cherché dans le conteneur.
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  selector: string
): UseSlidingIndicatorResult {
  const [state, setState] = useState<IndicatorState>({ rect: null, isAnimated: false });
  const stateRef = useRef(state);
  const targetRef = useRef<Element | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector(selector);
    const previous = targetRef.current;
    targetRef.current = target;

    let rect: IndicatorState["rect"] = null;
    if (target) {
      const c = container.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      // Rien de mesurable (élément masqué, ou jsdom) : on laisse l'item
      // peindre son fond lui-même.
      if (t.width > 0 && t.height > 0) {
        rect = {
          x: t.left - c.left + container.scrollLeft - container.clientLeft,
          y: t.top - c.top + container.scrollTop - container.clientTop,
          width: t.width,
          height: t.height,
        };
      }
    }
    // Glisse seulement d'un item sélectionné vers un autre.
    const isAnimated = previous !== null && target !== null && previous !== target;

    // Comparaison hors de `setState` : un état inchangé ne doit déclencher
    // aucun rendu, sinon la mesure après chaque rendu tournerait en boucle.
    const prev = stateRef.current;
    const a = prev.rect;
    const same =
      a === rect ||
      (a !== null &&
        rect !== null &&
        a.x === rect.x &&
        a.y === rect.y &&
        a.width === rect.width &&
        a.height === rect.height);
    if (same) return;
    const next = { rect, isAnimated };
    stateRef.current = next;
    setState(next);
  }, [containerRef, selector]);

  // Mesure après chaque rendu, avant la peinture : la pastille part dans la
  // même image que le changement de sélection. `measure` ne met l'état à jour
  // que si la géométrie change, donc pas de boucle.
  useLayoutEffect(() => {
    measure();
  });

  // La sélection peut changer sans que le conteneur se rende à nouveau (item
  // enveloppé dans un composant du consommateur) : on observe le DOM.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const mutations = new MutationObserver(measure);
    mutations.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current", "data-selected", "class"],
    });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(container);
    return () => {
      mutations.disconnect();
      resize?.disconnect();
    };
  }, [containerRef, measure]);

  const { rect, isAnimated } = state;
  return {
    isActive: rect !== null,
    isAnimated,
    style: rect
      ? {
          width: rect.width,
          height: rect.height,
          transform: `translate(${rect.x}px, ${rect.y}px)`,
        }
      : undefined,
  };
}
