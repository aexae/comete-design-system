// Mécanique du pouce rendu — Comète Design System
//
// Le défilement reste NATIF : on ne déplace jamais le contenu par
// transformation. On masque seulement l'ascenseur du système et on dessine
// le nôtre par-dessus, en lisant `scrollTop` / `scrollHeight`.
//
// C'est ce qui permet trois choses impossibles avec l'ascenseur natif :
// le pouce ne prend aucune place (il flotte au-dessus du contenu), il
// s'affiche pendant le défilement puis s'estompe, et sa couleur obéit
// vraiment au survol — Chrome ne repeint pas `::-webkit-scrollbar-thumb`
// sur un changement d'état.
import { useCallback, useEffect, useRef, useState } from "react";

/** Quand l'ascenseur est visible. */
export type ScrollAreaVisibility = "hover" | "scroll" | "auto" | "always";

/** Géométrie d'un axe, en pourcentage de la piste. */
export interface ThumbGeometry {
  /** Le contenu déborde-t-il sur cet axe ? */
  isOverflowing: boolean;
  /** Taille du pouce, en % de la piste. */
  size: number;
  /** Décalage du pouce depuis le début de la piste, en %. */
  offset: number;
}

const VIDE: ThumbGeometry = { isOverflowing: false, size: 0, offset: 0 };

/** Taille de pouce en deçà de laquelle il devient impossible à viser. */
const TAILLE_MINIMALE_POURCENT = 8;

function mesurer(
  longueurVisible: number,
  longueurTotale: number,
  position: number,
): ThumbGeometry {
  if (longueurTotale <= longueurVisible + 1) return VIDE;

  const brut = (longueurVisible / longueurTotale) * 100;
  const size = Math.max(brut, TAILLE_MINIMALE_POURCENT);

  // Le pouce ayant un plancher de taille, sa course est plus courte que la
  // piste : on répartit la position sur la course RESTANTE, sinon il
  // dépasserait en fin de défilement.
  const courseContenu = longueurTotale - longueurVisible;
  const avancement = courseContenu > 0 ? position / courseContenu : 0;
  const offset = avancement * (100 - size);

  return { isOverflowing: true, size, offset };
}

export interface UseScrollbarResult {
  /** À poser sur l'élément qui défile. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  vertical: ThumbGeometry;
  horizontal: ThumbGeometry;
  /** L'ascenseur doit-il être visible en ce moment ? */
  isVisible: boolean;
  /** Le pointeur est-il sur la zone ? */
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  /** Démarre un glisser du pouce sur l'axe donné. */
  startDrag: (axis: "vertical" | "horizontal", event: React.PointerEvent) => void;
  /** Un glisser est-il en cours ? Le pouce reste alors visible. */
  isDragging: boolean;
}

/**
 * Pilote un ascenseur rendu : géométrie du pouce, visibilité, glisser.
 *
 * `visibility` reprend les quatre modes du motif bien connu :
 * `hover` (défaut), `scroll`, `auto` et `always`.
 */
export function useScrollbar(
  visibility: ScrollAreaVisibility = "hover",
  hideDelay = 600,
): UseScrollbarResult {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [vertical, setVertical] = useState<ThumbGeometry>(VIDE);
  const [horizontal, setHorizontal] = useState<ThumbGeometry>(VIDE);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const rafraichir = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setVertical(mesurer(el.clientHeight, el.scrollHeight, el.scrollTop));
    setHorizontal(mesurer(el.clientWidth, el.scrollWidth, el.scrollLeft));
  }, []);

  // Géométrie : au montage, à chaque défilement, et dès que la taille de la
  // zone OU de son contenu change (une liste qui se filtre, une image qui
  // arrive). Sans l'observateur, le pouce garderait une taille périmée.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    rafraichir();

    const auDefilement = () => {
      rafraichir();
      if (visibility !== "scroll" && visibility !== "auto") return;
      setIsScrolling(true);
      clearTimeout(minuterie.current);
      minuterie.current = setTimeout(() => setIsScrolling(false), hideDelay);
    };
    el.addEventListener("scroll", auDefilement, { passive: true });

    const observateur = new ResizeObserver(rafraichir);
    observateur.observe(el);
    for (const enfant of Array.from(el.children)) observateur.observe(enfant);

    return () => {
      el.removeEventListener("scroll", auDefilement);
      observateur.disconnect();
      clearTimeout(minuterie.current);
    };
  }, [rafraichir, visibility, hideDelay]);

  // Glisser du pouce. On capture le pointeur : le glisser survit à une sortie
  // de la zone, comme un vrai ascenseur.
  const startDrag = useCallback(
    (axis: "vertical" | "horizontal", event: React.PointerEvent) => {
      const el = viewportRef.current;
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      const cible = event.currentTarget as HTMLElement;
      cible.setPointerCapture(event.pointerId);
      setIsDragging(true);

      const vertical = axis === "vertical";
      const departPointeur = vertical ? event.clientY : event.clientX;
      const departScroll = vertical ? el.scrollTop : el.scrollLeft;
      const piste = vertical ? el.clientHeight : el.clientWidth;
      const total = vertical ? el.scrollHeight : el.scrollWidth;
      // Un pixel de pouce vaut d'autant plus de contenu que celui-ci est long.
      const facteur = piste > 0 ? total / piste : 1;

      const auMouvement = (e: PointerEvent) => {
        const delta = (vertical ? e.clientY : e.clientX) - departPointeur;
        const cible2 = departScroll + delta * facteur;
        if (vertical) el.scrollTop = cible2;
        else el.scrollLeft = cible2;
      };
      const auRelachement = (e: PointerEvent) => {
        cible.releasePointerCapture(e.pointerId);
        cible.removeEventListener("pointermove", auMouvement);
        cible.removeEventListener("pointerup", auRelachement);
        cible.removeEventListener("pointercancel", auRelachement);
        setIsDragging(false);
      };
      cible.addEventListener("pointermove", auMouvement);
      cible.addEventListener("pointerup", auRelachement);
      cible.addEventListener("pointercancel", auRelachement);
    },
    [],
  );

  const isVisible =
    visibility === "always" ||
    isDragging ||
    (visibility === "hover" && isHovered) ||
    (visibility === "scroll" && isScrolling) ||
    (visibility === "auto" && (isHovered || isScrolling));

  return {
    viewportRef,
    vertical,
    horizontal,
    isVisible,
    onPointerEnter: useCallback(() => setIsHovered(true), []),
    onPointerLeave: useCallback(() => setIsHovered(false), []),
    startDrag,
    isDragging,
  };
}
