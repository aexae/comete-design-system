// ScrollArea — Comète Design System
// Zone défilante à ascenseur rendu : il flotte au-dessus du contenu.
import type { CSSProperties, ReactElement, ReactNode } from "react";
import scrollbarStyles from "../../styles/scrollbar.module.css";
import styles from "./ScrollArea.module.css";
import { useScrollbar, type ScrollAreaVisibility } from "./useScrollbar";

// -----------------------------------------------------------------------
// Types publics

export type ScrollAreaAxis = "vertical" | "horizontal" | "both";
export type { ScrollAreaVisibility };

export interface ScrollAreaProps {
  /** Axe sur lequel la zone défile. @default "vertical" */
  axis?: ScrollAreaAxis;
  /**
   * Quand l'ascenseur est visible.
   *
   * - `hover` (défaut) : au survol de la zone.
   * - `scroll` : pendant le défilement, puis il s'estompe après
   *   `hideDelay`. C'est le seul mode qui se voie **au doigt**, où il n'y a
   *   pas de survol.
   * - `auto` : les deux — survol ou défilement.
   * - `always` : en permanence.
   */
  visibility?: ScrollAreaVisibility;
  /** Délai avant estompage, en ms, pour `scroll` et `auto`. @default 600 */
  hideDelay?: number;
  /**
   * Hauteur maximale au-delà de laquelle la zone défile.
   *
   * À omettre quand la hauteur vient d'ailleurs — un parent en colonne flex,
   * une grille, une hauteur posée par `className`. Sans contrainte de
   * hauteur d'aucune sorte, une zone verticale ne défile jamais : elle
   * grandit avec son contenu.
   */
  maxHeight?: string | number;
  /**
   * Largeur maximale, pour une zone qui défile horizontalement. Même
   * remarque : sans contrainte, le contenu ne déborde jamais.
   */
  maxWidth?: string | number;
  /**
   * Affiche un fondu en haut et en bas tant qu'il reste du contenu au-delà
   * du bord.
   *
   * Utile avec `visibility="hover"`, où rien n'indique au doigt qu'on peut
   * défiler. Hors de la surface par défaut (modale, tiroir), redonner la
   * bonne couleur au masque via `--scroll-shadow-surface`.
   * @default false
   */
  hasOverflowShadows?: boolean;
  /** Contenu de la zone. */
  children: ReactNode;
  /**
   * Nom accessible. À renseigner avec `role="region"` quand la zone doit
   * être atteignable au clavier et annoncée.
   */
  "aria-label"?: string;
  /** Rôle ARIA. Laisser vide pour une zone purement visuelle. */
  role?: "region" | "group" | "log";
  /**
   * Rend la zone focalisable au clavier (`tabIndex=0`).
   *
   * Une zone défilante qui ne contient aucun élément focalisable — un bloc
   * de texte long, un journal — est autrement inatteignable au clavier.
   * @default false
   */
  isFocusable?: boolean;
  /** Classe CSS additionnelle, posée sur la racine. */
  className?: string;
  /** Styles inline additionnels, posés sur la racine. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * ScrollArea — Comète Design System
 *
 * Zone défilante dont l'ascenseur est **rendu par le composant** plutôt que
 * laissé au navigateur. Le défilement, lui, reste natif : molette, doigt,
 * clavier et barre d'espace fonctionnent sans qu'on y touche, et le contenu
 * n'est jamais déplacé par transformation.
 *
 * Trois choses que l'ascenseur natif ne sait pas faire :
 *
 * 1. **Flotter au-dessus du contenu**, sans lui prendre de place. Les
 *    navigateurs ont retiré `overflow: overlay`.
 * 2. **Paraître pendant le défilement** puis s'estomper. CSS n'a pas de
 *    pseudo-classe « en train de défiler ».
 * 3. **Réagir au survol de façon fiable** : Chrome ne repeint pas
 *    `::-webkit-scrollbar-thumb` quand l'état de survol change.
 *
 * Anatomie : une racine positionnée, une zone de défilement dont l'ascenseur
 * système est masqué, et un pouce par axe posé par-dessus.
 *
 * ```tsx
 * import { ScrollArea } from "@aexae/comete-design-system";
 *
 * <ScrollArea maxHeight={320} visibility="auto" role="log" aria-label="Main courante">
 *   {entrees.map((e) => <Entree key={e.id} {...e} />)}
 * </ScrollArea>
 * ```
 */
export function ScrollArea({
  axis = "vertical",
  visibility = "hover",
  hideDelay = 600,
  maxHeight,
  maxWidth,
  hasOverflowShadows = false,
  children,
  role,
  isFocusable = false,
  className,
  style,
  ...rest
}: ScrollAreaProps): ReactElement {
  const {
    viewportRef,
    vertical,
    horizontal,
    isVisible,
    onPointerEnter,
    onPointerLeave,
    startDrag,
  } = useScrollbar(visibility, hideDelay);

  const montreVertical = axis !== "horizontal" && vertical.isOverflowing;
  const montreHorizontal = axis !== "vertical" && horizontal.isOverflowing;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ maxHeight, maxWidth, ...style }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={viewportRef}
        className={[
          styles.viewport,
          styles[axis],
          // L'ascenseur du système est masqué : c'est le nôtre qu'on voit.
          scrollbarStyles.hidden,
          hasOverflowShadows ? scrollbarStyles.shadows : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        role={role}
        aria-label={rest["aria-label"]}
        tabIndex={isFocusable ? 0 : undefined}
      >
        {children}
      </div>

      {/* Les ascenseurs sont `aria-hidden` : ce sont des doublures visuelles
          du défilement natif, que les technologies d'assistance pilotent
          déjà par la zone elle-même. Les exposer ajouterait deux contrôles
          fantômes sans rien offrir de plus. */}
      {montreVertical && (
        <div
          className={[styles.scrollbar, styles.scrollbarVertical].join(" ")}
          data-state={isVisible ? "visible" : "hidden"}
          aria-hidden="true"
        >
          <div
            className={styles.thumb}
            style={{ height: `${vertical.size}%`, top: `${vertical.offset}%` }}
            onPointerDown={(e) => startDrag("vertical", e)}
          />
        </div>
      )}

      {montreHorizontal && (
        <div
          className={[styles.scrollbar, styles.scrollbarHorizontal].join(" ")}
          data-state={isVisible ? "visible" : "hidden"}
          aria-hidden="true"
        >
          <div
            className={styles.thumb}
            style={{
              width: `${horizontal.size}%`,
              left: `${horizontal.offset}%`,
            }}
            onPointerDown={(e) => startDrag("horizontal", e)}
          />
        </div>
      )}
    </div>
  );
}

ScrollArea.displayName = "ScrollArea";
