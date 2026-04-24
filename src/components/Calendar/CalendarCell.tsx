// CalendarCell — Comète Design System
// Cellule partagée entre tous les calendriers (date, mois, année).
import { useState, type ReactElement, type FocusEvent, type CSSProperties } from "react";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./CalendarCell.module.css";

// -----------------------------------------------------------------------
// Types publics

export type CalendarCellSize = "sm" | "lg";

export interface CalendarCellProps {
  /** Contenu textuel affiché dans la cellule (jour, abréviation de mois, année…). */
  children: React.ReactNode;
  /**
   * Taille de la cellule.
   * sm = 32 × 32 px (grille date) | lg = 48 px × flex (grille mois / année).
   * @default "sm"
   */
  size?: CalendarCellSize;
  /** Cellule sélectionnée (date unique). */
  isSelected?: boolean;
  /** Début d'une plage sélectionnée. */
  isSelectionStart?: boolean;
  /** Fin d'une plage sélectionnée. */
  isSelectionEnd?: boolean;
  /**
   * Cellule au milieu d'une plage (selected, ni start ni end).
   * Distinct de isSelected pour permettre un style différent sur RangeCalendar.
   */
  isRangePart?: boolean;
  /** Date du jour. */
  isToday?: boolean;
  /** Hover fourni par React Aria (optionnel — géré par CSS :hover sinon). */
  isHovered?: boolean;
  /** Pressed fourni par React Aria. */
  isPressed?: boolean;
  /** Cellule désactivée. */
  isDisabled?: boolean;
  /** Cellule indisponible (hors min/max ou isDateUnavailable). */
  isUnavailable?: boolean;
  /** Cellule hors du mois courant (masquée). */
  isOutsideMonth?: boolean;
  /**
   * Focus clavier visible.
   * Si fourni (ex: depuis React Aria render prop), remplace la détection interne.
   */
  isFocusVisible?: boolean;
  /**
   * Rend la cellule interactive en tant que <button>.
   * Si false, rendu en <span> (usage : cellule visuelle dans AriaCalendarCell).
   * @default true
   */
  interactive?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Label accessible. */
  "aria-label"?: string;
  /** État de sélection accessible. */
  "aria-selected"?: boolean;
  /** Handler de clic (mode interactif). */
  onClick?: () => void;
  /** Appelé quand la souris entre sur la cellule (mode interactif — prévisualisation de plage). */
  onMouseEnter?: () => void;
  /** Appelé quand la souris quitte la cellule. */
  onMouseLeave?: () => void;
  /** tabIndex pour la navigation clavier (mode interactif). */
  tabIndex?: number;
}

// -----------------------------------------------------------------------
// Composant

/**
 * CalendarCell — Comète Design System
 *
 * Cellule visuelle partagée entre tous les calendriers.
 * Centralise les états (default, today, selected, range, disabled, unavailable)
 * et le style (taille sm/lg, focus ring, indicateur today).
 *
 * Usage dans un AriaCalendarCell (date grid) :
 * ```tsx
 * <AriaCalendarCell date={date} className={styles.ariaDateCell}>
 *   {({ formattedDate, isFocusVisible, isSelected, ... }) => (
 *     <CalendarCell isSelected={isSelected} isFocusVisible={isFocusVisible} interactive={false}>
 *       {formattedDate}
 *     </CalendarCell>
 *   )}
 * </AriaCalendarCell>
 * ```
 *
 * Usage standalone (mois / année) :
 * ```tsx
 * <CalendarCell size="lg" isSelected={isSelected} isToday={isToday} onClick={handleSelect}>
 *   mars
 * </CalendarCell>
 * ```
 *
 * @param size          - sm = 32 × 32 px | lg = 48 px × flex
 * @param interactive   - true = <button> | false = <span> dans AriaCalendarCell
 * @param isRangePart   - milieu de plage (style distinct de isSelected)
 */
export function CalendarCell({
  children,
  size = "sm",
  isSelected,
  isSelectionStart,
  isSelectionEnd,
  isRangePart,
  isToday,
  isHovered,
  isPressed,
  isDisabled,
  isUnavailable,
  isOutsideMonth,
  isFocusVisible: externalFocusVisible,
  interactive = true,
  className,
  "aria-label": ariaLabel,
  "aria-selected": ariaSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  tabIndex,
}: CalendarCellProps): ReactElement {
  // NOTE: Le focus visible est auto-géré quand interactive=true et qu'aucune
  // valeur externe n'est fournie (cas MonthCalendar, YearCalendar).
  // Pour la grille date (interactive=false), React Aria fournit isFocusVisible.
  const [internalFocusVisible, setInternalFocusVisible] = useState(false);
  const focusVisible = externalFocusVisible ?? internalFocusVisible;

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    setInternalFocusVisible(e.currentTarget.matches(":focus-visible"));
  };
  const handleBlur = () => setInternalFocusVisible(false);

  const cellClassName = [styles.cell, className].filter(Boolean).join(" ");

  const dataAttrs = {
    "data-size": size,
    "data-selected": (isSelected && !isRangePart) || undefined,
    "data-selection-start": isSelectionStart || undefined,
    "data-selection-end": isSelectionEnd || undefined,
    "data-range-part": isRangePart || undefined,
    "data-today": isToday || undefined,
    "data-hovered": isHovered || undefined,
    "data-pressed": isPressed || undefined,
    "data-disabled": isDisabled || undefined,
    "data-unavailable": isUnavailable || undefined,
    "data-outside-month": isOutsideMonth || undefined,
  };

  const content = (
    <>
      <span className={styles.cellText}>{children}</span>
      {isToday && (
        <span className={styles.todayDot} aria-hidden="true" />
      )}
      {focusVisible && <FocusRing borderRadius={3} position="inside" />}
    </>
  );

  if (!interactive) {
    return (
      <span className={cellClassName} {...dataAttrs}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      role="gridcell"
      className={cellClassName}
      aria-label={ariaLabel}
      aria-selected={ariaSelected}
      disabled={isDisabled}
      tabIndex={tabIndex ?? (isDisabled ? -1 : 0)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...dataAttrs}
    >
      {content}
    </button>
  );
}
