// MainHeader — Comète Design System
// Sous-composant header unifié pour tous les calendriers du design system.
// Composé d'un bouton chevron gauche, d'un bouton heading avec ArrowDropDown,
// et d'un bouton chevron droit. Les boutons latéraux peuvent être masqués (spacer)
// pour les panels internes des doubles calendriers.
// NOTE: Le bouton heading utilise un <button> natif (pas AriaButton) pour éviter
// le conflit avec le système de slots React Aria (slot="previous"/"next" requis
// pour tout AriaButton enfant d'un AriaCalendar / AriaRangeCalendar).
import type { ReactElement } from "react";
import { ButtonContext } from "react-aria-components";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import styles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface MainHeaderProps {
  /** Texte affiché dans le bouton heading (ex : "mars 2026", "2026", "2020–2039"). */
  label: string;
  /**
   * Appelé sur le bouton ←.
   * Non applicable quand hidePrev=true ou slotNav=true.
   */
  onPrev?: () => void;
  /**
   * Appelé sur le bouton →.
   * Non applicable quand hideNext=true ou slotNav=true.
   */
  onNext?: () => void;
  /**
   * Appelé sur le bouton heading (drill-up vers le niveau supérieur).
   * Quand absent, le heading est un <span> non interactif (niveau max).
   */
  onHeadingPress?: () => void;
  /** Désactive tous les boutons. */
  isDisabled?: boolean;
  /**
   * Affiche un spacer à la place du bouton ← (ex : panel droit d'un double calendrier).
   * Ignoré si slotNav=true.
   */
  hidePrev?: boolean;
  /**
   * Affiche un spacer à la place du bouton → (ex : panel gauche d'un double calendrier).
   * Ignoré si slotNav=true.
   */
  hideNext?: boolean;
  /**
   * Quand true, les boutons ← et → utilisent slot="previous"/"next" React Aria
   * (navigation gérée par AriaCalendar / AriaRangeCalendar).
   * À utiliser uniquement à l'intérieur d'un de ces composants.
   */
  slotNav?: boolean;
  /** Classe CSS additionnelle sur le <header>. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * MainHeader — Comète Design System
 *
 * En-tête unifié pour tous les calendriers (date, semaine, mois, année).
 * Gère les variantes de navigation : slot React Aria, callbacks custom, spacer.
 *
 * ```tsx
 * // Dans un calendrier custom (MonthCalendar, YearCalendar…)
 * <MainHeader
 *   label="2026"
 *   onPrev={() => setYear(y => y - 1)}
 *   onNext={() => setYear(y => y + 1)}
 *   onHeadingPress={() => setDrillLevel("year")}
 * />
 *
 * // Dans un AriaCalendar (slot-based navigation)
 * <MainHeader
 *   label="mars 2026"
 *   slotNav
 *   onHeadingPress={handleDrillUp}
 * />
 * ```
 *
 * @param label          - Texte du bouton heading
 * @param slotNav        - Utilise slot="previous"/"next" React Aria
 * @param onHeadingPress - Absent = heading non interactif (niveau max)
 * @param hidePrev       - Spacer à la place du bouton ←
 * @param hideNext       - Spacer à la place du bouton →
 */
export function MainHeader({
  label,
  onPrev,
  onNext,
  onHeadingPress,
  isDisabled,
  hidePrev = false,
  hideNext = false,
  slotNav = false,
  className,
}: MainHeaderProps): ReactElement {
  // Bouton gauche : spacer | slot | callback
  const prevButton: ReactElement = hidePrev ? (
    <span className={styles.navSpacer} aria-hidden="true" />
  ) : slotNav ? (
    <Button
      slot="previous"
      className={styles.navButton}
      isDisabled={isDisabled}
      aria-label="Précédent"
      appearance="subtle"
    >
      <Icon icon="ChevronLeft" />
    </Button>
  ) : (
    <Button
      className={styles.navButton}
      onPress={onPrev}
      isDisabled={isDisabled}
      aria-label="Précédent"
      appearance="subtle"
    >
      <Icon icon="ChevronLeft" />
    </Button>
  );

  // Bouton droit : spacer | slot | callback
  const nextButton: ReactElement = hideNext ? (
    <span className={styles.navSpacer} aria-hidden="true" />
  ) : slotNav ? (
    <Button
      slot="next"
      className={styles.navButton}
      isDisabled={isDisabled}
      aria-label="Suivant"
      appearance="subtle"
    >
      <Icon icon="ChevronRight" />
    </Button>
  ) : (
    <Button
      className={styles.navButton}
      onPress={onNext}
      isDisabled={isDisabled}
      aria-label="Suivant"
      appearance="subtle"
    >
      <Icon icon="ChevronRight" />
    </Button>
  );

  // WORKAROUND: ButtonContext.Provider value={{}} efface le contexte de slots
  // d'AriaCalendar/AriaRangeCalendar qui exigerait slot="previous"/"next" sur tout AriaButton enfant.
  const heading: ReactElement = onHeadingPress ? (
    <ButtonContext.Provider value={{}}>
      <Button
        className={styles.headingButton}
        onPress={onHeadingPress}
        isDisabled={isDisabled}
        aria-label={`Niveau supérieur — ${label}`}
        appearance="subtle"
      >
        <span>{label}</span>
        <Icon icon="ArrowDropDown" size={16} />
      </Button>
    </ButtonContext.Provider>
  ) : (
    <span className={styles.heading}>{label}</span>
  );

  return (
    <header className={[styles.header, className].filter(Boolean).join(" ")}>
      {prevButton}
      {heading}
      {nextButton}
    </header>
  );
}
