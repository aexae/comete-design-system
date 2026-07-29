// FilterChip — Comète Design System
// Filtre rapide (chip) façon listing Back Market : une chip = une facette.
// Inactive → pilule outlined + chevron ; active → pilule contained (fond
// sombre) + compteur + croix de retrait. Le corps de la chip ouvre un panneau
// (popover desktop / bottom sheet mobile) avec les options de la facette et un
// pied « Réinitialiser » / « Appliquer » (pas d'application au fil de l'eau).
//
// L'état des filtres reste chez le consommateur (controlled) : FilterChip ne
// gère QUE l'ouverture du panneau et le rendu ; il expose `onApply`, `onReset`
// et `onClear`. Le contenu de la facette (checkboxes, radios, dates…) est passé
// en `children` et rendu à l'identique dans le popover ET le bottom sheet.
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button as AriaButton } from "react-aria-components";
import { Popup } from "../Popup/Popup.js";
import { Drawer } from "../Drawer/Drawer.js";
import { Button } from "../Button/Button.js";
import { Icon } from "../Icon/Icon.js";
import styles from "./FilterChip.module.css";

export interface FilterChipProps {
  /** Libellé court de la facette (1 mot conseillé : « Sites », « Types »…). */
  label: string;
  /**
   * Nombre de valeurs appliquées pour cette facette. Affiché en compteur quand
   * la chip est active. @default 0
   */
  count?: number;
  /**
   * Chip active (≥ 1 valeur appliquée) : pilule sombre + compteur + croix.
   * Par défaut, dérivé de `count > 0`.
   */
  isActive?: boolean;
  /** Contenu du panneau : options de la facette (checkboxes, radios, dates…). */
  children: ReactNode;
  /** Appelé au clic sur « Appliquer » (commit de la sélection en cours). */
  onApply: () => void;
  /** Appelé au clic sur « Réinitialiser » dans le pied du panneau. */
  onReset?: () => void;
  /**
   * Appelé au clic sur la croix (×) : efface TOUTES les valeurs de la facette
   * d'un coup. La croix n'apparaît que si la chip est active.
   */
  onClear?: () => void;
  /**
   * Active le bouton « Réinitialiser » du panneau. Par défaut, dérivé de
   * `isActive` (rien d'appliqué → rien à réinitialiser).
   */
  canReset?: boolean;
  /** État ouvert contrôlé du panneau (sinon géré en interne). */
  isOpen?: boolean;
  /** Callback au changement d'ouverture du panneau. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Libellé du bouton d'application. @default "Appliquer" */
  applyLabel?: string;
  /** Libellé du bouton de réinitialisation. @default "Réinitialiser" */
  resetLabel?: string;
  /** Classe CSS additionnelle sur la chip. */
  className?: string;
}

/** Seuil de bascule popover → bottom sheet, en px de largeur du conteneur. */
const MOBILE_THRESHOLD = 480;

/**
 * Observe la largeur du conteneur (l'élément parent de la chip = la rangée de
 * filtres) et renvoie `true` sous {@link MOBILE_THRESHOLD}. Fidèle au seuil
 * *container* de la toolbar (pas le viewport). Dégrade en `false` (popover) si
 * `ResizeObserver` est indisponible (SSR, tests).
 */
function useContainerIsNarrow(ref: React.RefObject<HTMLElement | null>): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setNarrow(width > 0 && width < MOBILE_THRESHOLD);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return narrow;
}

/**
 * FilterChip — Comète Design System
 *
 * ```tsx
 * <FilterChip
 *   label="Sites"
 *   count={3}
 *   onApply={apply}
 *   onReset={reset}
 *   onClear={clearAll}
 * >
 *   <CheckboxGroup …>…</CheckboxGroup>
 * </FilterChip>
 * ```
 */
export function FilterChip({
  label,
  count = 0,
  isActive,
  children,
  onApply,
  onReset,
  onClear,
  canReset,
  isOpen,
  onOpenChange,
  applyLabel = "Appliquer",
  resetLabel = "Réinitialiser",
  className,
}: FilterChipProps): ReactElement {
  const active = isActive ?? count > 0;
  const resetEnabled = canReset ?? active;

  // État d'ouverture : contrôlé si `isOpen` fourni, sinon interne.
  const [openState, setOpenState] = useState(false);
  const open = isOpen ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const isNarrow = useContainerIsNarrow(rootRef);

  const accessibleName = active
    ? `${label}, ${count} filtre${count > 1 ? "s" : ""} actif${count > 1 ? "s" : ""}`
    : label;

  // Corps de la chip. `managed` = on gère nous-mêmes press + aria (chemin
  // bottom sheet) ; sinon DialogTrigger (Popup) les câble automatiquement.
  const bodyButton = (managed: boolean) => (
    <AriaButton
      className={styles.body}
      aria-label={accessibleName}
      {...(managed
        ? {
            "aria-haspopup": "dialog" as const,
            "aria-expanded": open,
            onPress: () => setOpen(true),
          }
        : {})}
    >
      <span className={styles.label}>{label}</span>
      {active ? (
        <span className={styles.count} aria-hidden="true">
          {count}
        </span>
      ) : (
        <Icon icon="KeyboardArrowDown" size={16} className={styles.chevron} />
      )}
    </AriaButton>
  );

  const panel = (
    <div className={styles.panel}>
      <div className={styles.panelBody}>{children}</div>
      <div className={styles.panelFooter}>
        <Button
          appearance="subtle"
          density="compact"
          isDisabled={!resetEnabled}
          onPress={() => onReset?.()}
        >
          {resetLabel}
        </Button>
        <Button
          color="comete"
          density="compact"
          onPress={() => {
            onApply();
            setOpen(false);
          }}
        >
          {applyLabel}
        </Button>
      </div>
    </div>
  );

  const chipClassName = [
    styles.chip,
    active ? styles.chipActive : styles.chipInactive,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={chipClassName}>
      {isNarrow ? (
        <>
          {bodyButton(true)}
          <Drawer
            isOpen={open}
            onOpenChange={setOpen}
            placement="bottom"
            size="auto"
            aria-label={`Filtrer par ${label}`}
          >
            {panel}
          </Drawer>
        </>
      ) : (
        <Popup
          trigger={bodyButton(false)}
          placement="bottom-left"
          isOpen={open}
          onOpenChange={setOpen}
        >
          {panel}
        </Popup>
      )}

      {active && (
        <AriaButton
          className={styles.clear}
          aria-label={`Effacer le filtre ${label}`}
          onPress={() => onClear?.()}
        >
          <Icon icon="Close" size={16} color="inverted" />
        </AriaButton>
      )}
    </div>
  );
}

FilterChip.displayName = "FilterChip";
