// FilterChip — Comète Design System
// Filtre rapide (chip) façon listing Back Market : une chip = une facette.
// Inactive → pilule outlined + chevron ; active → pilule contained (fond
// sombre) + valeur (1) ou compteur (≥ 2) + croix de retrait. Le corps de la
// chip ouvre un panneau (popover desktop / bottom sheet mobile) avec les
// options de la facette. Application instantanée (popover) ou différée
// (bottom sheet) selon `applyMode` — cf. la prop.
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
import { Drawer, DrawerHeader } from "../Drawer/Drawer.js";
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
  /**
   * Libellé de la **valeur unique** sélectionnée. Quand `count === 1` et que
   * `valueLabel` est fourni, la chip affiche « Label : Valeur » (ex.
   * « Types : Intrusion ») au lieu du compteur — règle validée : 1 valeur →
   * la valeur, ≥ 2 → le compteur. Le composant ne connaissant pas les options,
   * c'est au consommateur de fournir ce libellé. Tronqué en ellipsis si long.
   */
  valueLabel?: string;
  /** Contenu du panneau : options de la facette (checkboxes, radios, dates…). */
  children: ReactNode;
  /**
   * Mode d'application :
   * - `"instant"` — chaque changement dans `children` s'applique immédiatement
   *   (le consommateur applique dans son `onChange`). Pas de bouton
   *   « Appliquer » ; le pied ne garde que « Réinitialiser ». Fermeture par
   *   clic hors zone / Échap / re-clic (rien à confirmer).
   * - `"deferred"` — brouillon : les changements ne s'appliquent qu'au clic sur
   *   « Appliquer » ; Échap/clic-hors jettent le brouillon.
   *
   * Défaut automatique : `"instant"` en popover (desktop), `"deferred"` en
   * bottom sheet (mobile). À forcer si besoin (ex. `"deferred"` partout quand
   * le backend est lent). Instantané = itération rapide sur données locales ;
   * différé = requêtes coûteuses ou panneau qui masque les résultats.
   */
  applyMode?: "instant" | "deferred";
  /**
   * Appelé au clic sur « Appliquer » (mode différé uniquement — commit du
   * brouillon). Inutile en mode instantané.
   */
  onApply?: () => void;
  /**
   * Appelé au clic sur « Réinitialiser ». En différé, vide le **brouillon** (il
   * faut encore « Appliquer » pour confirmer — comportement Back Market) ; en
   * instantané, efface directement les valeurs appliquées.
   */
  onReset?: () => void;
  /**
   * Appelé au clic sur la croix (×) : efface TOUTES les valeurs de la facette
   * d'un coup. La croix n'apparaît que si la chip est active.
   */
  onClear?: () => void;
  /**
   * Active le bouton « Réinitialiser ». **Requis en mode différé** : le
   * brouillon vit chez le consommateur, passez `canReset={draft.length > 0}`.
   * En mode instantané, dérivé de l'état actif (brouillon = appliqué).
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
  valueLabel,
  children,
  applyMode,
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

  // Mode d'application : instantané en popover, différé en bottom sheet — sauf
  // override explicite du consommateur.
  const mode = applyMode ?? (isNarrow ? "deferred" : "instant");

  // Règle valeur / compteur : 1 valeur (avec libellé) → « Label : Valeur »,
  // sinon compteur. Le nom accessible suit la même logique.
  const showValue = count === 1 && !!valueLabel;
  const accessibleName = !active
    ? label
    : showValue
      ? `${label}, filtré sur ${valueLabel}`
      : `${label}, ${count} filtre${count > 1 ? "s" : ""} actif${count > 1 ? "s" : ""}`;

  // Corps de la chip. `aria-haspopup`/`aria-expanded` posés explicitement (le
  // DialogTrigger de Popup ne pose pas `haspopup`). `managed` = chemin bottom
  // sheet : on ouvre nous-mêmes ; en desktop c'est DialogTrigger qui gère le press.
  const bodyButton = (managed: boolean) => (
    <AriaButton
      className={styles.body}
      aria-label={accessibleName}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...(managed ? { onPress: () => setOpen(true) } : {})}
    >
      <span className={styles.label}>{label}</span>
      {!active ? (
        <Icon icon="KeyboardArrowDown" size={16} className={styles.chevron} />
      ) : showValue ? (
        <span className={styles.value} aria-hidden="true">
          : {valueLabel}
        </span>
      ) : (
        <span className={styles.count} aria-hidden="true">
          {count}
        </span>
      )}
    </AriaButton>
  );

  const panel = (
    <div className={styles.panel}>
      {/* En mobile (Drawer), le corps porte lui-même le scroll (le Drawer ne
          plafonne pas) ; en desktop, c'est le popover qui défile. Un seul
          scroller dans les deux cas. */}
      <div
        className={[styles.panelBody, isNarrow ? styles.panelBodyScroll : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
      <div className={styles.panelFooter}>
        <Button
          appearance="subtle"
          density="compact"
          isDisabled={!resetEnabled}
          onPress={() => onReset?.()}
        >
          {resetLabel}
        </Button>
        {/* « Appliquer » uniquement en différé : en instantané tout est déjà
            appliqué (le consommateur applique dans son onChange). */}
        {mode === "deferred" && (
          <Button
            color="comete"
            density="compact"
            onPress={() => {
              onApply?.();
              setOpen(false);
            }}
          >
            {applyLabel}
          </Button>
        )}
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
          >
            {/* Titre du bottom sheet (le `DrawerHeader` porte le nom accessible
                via son slot title → plus besoin d'`aria-label` sur le Drawer). */}
            <DrawerHeader onClose={() => setOpen(false)}>{label}</DrawerHeader>
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
