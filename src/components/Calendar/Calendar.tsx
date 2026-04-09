// Calendar — Comète Design System
// Composant unifié : appearance=date|week|month|year, calendars=1|2, isOpen.
import { useContext, useState, type ReactElement } from "react";
import {
  Calendar as AriaCalendar,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
  CalendarStateContext,
  CalendarCell as AriaCalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Button as AriaButton,
  ButtonContext,
  type DateValue,
  useLocale,
} from "react-aria-components";
import type { RangeValue } from "react-aria-components";
import { type CalendarDate } from "@internationalized/date";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { CalendarCell as CometeCalendarCell } from "./CalendarCell.js";
import { MainHeader } from "./MainHeader.js";
import { WeekGrid, DualWeekGrid } from "./WeekGrid.js";
import { MonthCalendar } from "./MonthCalendar.js";
import { DualMonthCalendar } from "./DualMonthCalendar.js";
import { YearCalendar } from "./YearCalendar.js";
import { DualYearCalendar } from "./DualYearCalendar.js";
import { TimeCalendar } from "./TimeCalendar.js";
import type { TimeCalendarProps as TimeCalendarComponentProps } from "./TimeCalendar.js";
import styles from "./Calendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export type CalendarAppearance = "date" | "week" | "month" | "year" | "time";

/** Props communes à toutes les apparences. */
interface CalendarBaseProps {
  /**
   * Contrôlé par un DatePicker parent pour indiquer l'état ouvert/fermé.
   * Sans effet de rendu propre au calendrier — réservé au composant parent.
   */
  isOpen?: boolean;
  /**
   * Nombre de calendriers affichés côte à côte.
   * Disponible pour appearance=date et appearance=month.
   * @default 1
   */
  calendars?: 1 | 2;
  /** Classe CSS additionnelle. */
  className?: string;
}

/** Props pour appearance="date" (sélection d'une date unique). */
export interface DateCalendarProps extends CalendarBaseProps {
  appearance?: "date";
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  autoFocus?: boolean;
}

/** Props pour appearance="week" (sélection d'une semaine ISO). */
export interface WeekCalendarProps extends CalendarBaseProps {
  appearance: "week";
  value?: RangeValue<CalendarDate>;
  defaultValue?: RangeValue<CalendarDate>;
  onChange?: (range: RangeValue<CalendarDate>) => void;
  isDisabled?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  locale?: string;
  /**
   * Mode de sélection :
   * - "week"   : un clic sélectionne une semaine unique (défaut)
   * - "period" : premier clic = semaine de début, deuxième clic = semaine de fin
   */
  mode?: "week" | "period";
  "aria-label"?: string;
}

/** Props pour appearance="month", 1 calendrier (sélection d'un mois unique). */
export interface MonthCalendarProps extends CalendarBaseProps {
  appearance: "month";
  calendars?: 1;
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onChange?: (date: CalendarDate) => void;
  isDisabled?: boolean;
  locale?: string;
}

/** Props pour appearance="month", 2 calendriers (sélection d'une plage de mois). */
export interface MonthCalendarDualProps extends CalendarBaseProps {
  appearance: "month";
  calendars: 2;
  value?: RangeValue<CalendarDate>;
  defaultValue?: RangeValue<CalendarDate>;
  onChange?: (range: RangeValue<CalendarDate>) => void;
  isDisabled?: boolean;
  locale?: string;
}

/** Props pour appearance="year", 1 calendrier (sélection d'une année unique). */
export interface YearCalendarProps extends CalendarBaseProps {
  appearance: "year";
  calendars?: 1;
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onChange?: (date: CalendarDate) => void;
  isDisabled?: boolean;
}

/** Props pour appearance="year", 2 calendriers (sélection d'une plage d'années). */
export interface YearCalendarDualProps extends CalendarBaseProps {
  appearance: "year";
  calendars: 2;
  value?: RangeValue<CalendarDate>;
  defaultValue?: RangeValue<CalendarDate>;
  onChange?: (range: RangeValue<CalendarDate>) => void;
  isDisabled?: boolean;
}

/** Props pour appearance="time" (liste scrollable de créneaux horaires). */
export interface TimeCalendarCalendarProps extends CalendarBaseProps {
  appearance: "time";
  value?: TimeCalendarComponentProps["value"];
  onChange?: TimeCalendarComponentProps["onChange"];
  /** Intervalle en minutes. @default 15 */
  step?: number;
  isDisabled?: boolean;
}

export type CalendarProps =
  | DateCalendarProps
  | WeekCalendarProps
  | MonthCalendarProps
  | MonthCalendarDualProps
  | YearCalendarProps
  | YearCalendarDualProps
  | TimeCalendarCalendarProps;

// -----------------------------------------------------------------------
// Composant unifié

/**
 * Calendar — Comète Design System
 *
 * Sélecteur de date/semaine/mois/année selon l'appearance.
 * Supporte 1 ou 2 calendriers côte à côte (appearance=date|month).
 *
 * ```tsx
 * // Date unique
 * <Calendar defaultValue={new CalendarDate(2026, 3, 15)} />
 *
 * // Semaine
 * <Calendar appearance="week" onChange={(range) => console.log(range)} />
 *
 * // Mois — double calendrier
 * <Calendar appearance="month" calendars={2} />
 * ```
 *
 * @param appearance - Mode de sélection (date | week | month | year)
 * @param calendars  - Nombre de calendriers côte à côte (1 | 2)
 * @param isOpen     - État ouvert/fermé contrôlé par un DatePicker parent
 */
export function Calendar(props: CalendarProps): ReactElement {
  // NOTE: isOpen est accepté sans être utilisé ici — le rendu est délégué
  // au composant DatePicker qui wrappera Calendar dans un popover.

  if (props.appearance === "time") {
    const { appearance: _a, isOpen: _o, calendars: _c, ...timeProps } = props;
    return <TimeCalendar {...timeProps} />;
  }

  if (props.appearance === "week") {
    if (props.calendars === 2) {
      const { appearance: _a, isOpen: _o, calendars: _c, ...dualProps } = props;
      return <DualWeekGrid {...dualProps} />;
    }
    const { appearance: _a, isOpen: _o, calendars: _c, ...weekProps } = props;
    return <WeekGrid {...weekProps} />;
  }

  if (props.appearance === "month") {
    if (props.calendars === 2) {
      const { appearance: _a, isOpen: _o, calendars: _c, ...dualProps } = props;
      return <DualMonthCalendar {...dualProps} />;
    }
    const { appearance: _a, isOpen: _o, calendars: _c, ...monthProps } = props;
    return <MonthCalendar {...monthProps} />;
  }

  if (props.appearance === "year") {
    if (props.calendars === 2) {
      const { appearance: _a, isOpen: _o, calendars: _c, ...dualProps } = props;
      return <DualYearCalendar {...dualProps} />;
    }
    const { appearance: _a, isOpen: _o, calendars: _c, ...yearProps } = props;
    return <YearCalendar {...yearProps} />;
  }

  // appearance="date" (défaut) — TypeScript a déjà réduit à DateCalendarProps ici
  const {
    appearance: _a,
    isOpen: _o,
    calendars = 1,
    ...dateProps
  } = props;
  if (calendars === 2) {
    return <DualDateCalendar {...dateProps} />;
  }
  return <DateGrid {...dateProps} />;
}

// -----------------------------------------------------------------------
// Utilitaire — formatage du mois visible (interne)

function formatVisibleMonth(date: CalendarDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(date.year, date.month - 1, 1));
}

// -----------------------------------------------------------------------
// Header interne pour AriaCalendar (lit CalendarStateContext)

/**
 * Lit le mois visible depuis CalendarStateContext et rend un MainHeader slot-based.
 * Doit être placé à l'intérieur d'un AriaCalendar.
 */
function CalendarDateHeader({
  onDrillUp,
  isDisabled,
}: {
  onDrillUp: (date: CalendarDate) => void;
  isDisabled?: boolean;
}): ReactElement | null {
  const state = useContext(CalendarStateContext);
  const { locale } = useLocale();

  if (!state) return null;

  const visibleDate = state.visibleRange.start;
  const label = formatVisibleMonth(visibleDate, locale);

  return (
    <MainHeader
      label={label}
      slotNav
      onHeadingPress={() => onDrillUp(visibleDate)}
      isDisabled={isDisabled}
    />
  );
}

// -----------------------------------------------------------------------
// Heading mensuel pour le double calendrier lié (interne)

/**
 * Affiche le nom du mois/année correspondant à l'offset donné depuis le début de la plage visible.
 * Rend un bouton interactif (drill-up) ou un span non interactif selon onDrillUp.
 * Passe la date du panel cliqué et le côté ("left" | "right") au callback.
 */
function DualPanelHeadingButton({
  offset,
  className,
  onDrillUp,
  isDisabled,
}: {
  offset: number;
  className?: string;
  onDrillUp?: (date: CalendarDate, panel: "left" | "right") => void;
  isDisabled?: boolean;
}): ReactElement | null {
  const state = useContext(RangeCalendarStateContext);
  const { locale } = useLocale();

  if (!state) return null;

  const leftDate = state.visibleRange.start;
  const date = leftDate.add({ months: offset });
  const panel: "left" | "right" = offset === 0 ? "left" : "right";
  const label = formatVisibleMonth(date, locale);

  if (onDrillUp) {
    return (
      // WORKAROUND: ButtonContext.Provider value={{}} efface le contexte de slots
      // d'AriaRangeCalendar qui exigerait slot="previous"/"next" sur tout AriaButton enfant.
      <ButtonContext.Provider value={{}}>
        <Button
          className={[styles.headingButton, className].filter(Boolean).join(" ")}
          onPress={() => onDrillUp(date, panel)}
          isDisabled={isDisabled}
          aria-label={`Niveau supérieur — ${label}`}
          variant="subtle"
        >
          <span>{label}</span>
        </Button>
      </ButtonContext.Provider>
    );
  }

  return (
    <span className={[styles.heading, className].filter(Boolean).join(" ")}>
      {label}
    </span>
  );
}

// -----------------------------------------------------------------------
// Grille date simple (interne)

function DateGrid({
  className,
  isDisabled,
  ...props
}: Omit<DateCalendarProps, "appearance" | "calendars" | "isOpen">) {
  // Niveau d'affichage : "date" = grille date React Aria, "month" = MonthCalendar drill-up.
  const [drillLevel, setDrillLevel] = useState<"date" | "month">("date");
  // Date pivot capturée lors du drill-up — initialise MonthCalendar au bon mois.
  const [pivotDate, setPivotDate] = useState<CalendarDate | undefined>(undefined);
  // Clé de remontage d'AriaCalendar après drill-down (force defaultFocusedValue).
  const [calendarKey, setCalendarKey] = useState(0);

  const handleDrillUp = (visibleDate: CalendarDate) => {
    setPivotDate(visibleDate);
    setDrillLevel("month");
  };

  const handleMonthSelect = (month: CalendarDate) => {
    // Drill-down : revenir à la grille date en centrant sur le mois sélectionné.
    setPivotDate(month);
    setCalendarKey((k) => k + 1);
    setDrillLevel("date");
  };

  if (drillLevel === "month") {
    return (
      <MonthCalendar
        defaultValue={pivotDate}
        isDisabled={isDisabled}
        className={className}
        onChange={handleMonthSelect}
      />
    );
  }

  return (
    <AriaCalendar
      key={calendarKey}
      {...props}
      isDisabled={isDisabled}
      // NOTE: defaultFocusedValue initialise le mois affiché après un drill-down.
      // Quand value est fourni, React Aria l'utilise prioritairement pour le focus initial.
      defaultFocusedValue={pivotDate ?? props.defaultValue ?? props.value}
      className={[styles.calendar, className].filter(Boolean).join(" ")}
    >
      <CalendarDateHeader onDrillUp={handleDrillUp} isDisabled={isDisabled} />
      <CalendarGrid className={styles.grid}>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className={styles.headerCell}>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <SingleCalendarGridBody calendarDisabled={isDisabled ?? false} />
      </CalendarGrid>
    </AriaCalendar>
  );
}

// -----------------------------------------------------------------------
// Double grille date liée (calendars=2)

/**
 * Affiche deux mois liés côte à côte avec navigation synchronisée et sélection de plage.
 *
 * NOTE: Utilise AriaRangeCalendar avec visibleDuration={{ months: 2 }} pour lier les deux
 * calendriers. La navigation prev/next fait défiler les deux mois simultanément.
 * Les flèches internes (droite du calendrier gauche, gauche du calendrier droit) n'existent
 * pas — un seul bouton prev et un seul bouton next couvrent l'ensemble.
 */
function DualDateCalendar({
  className,
  defaultValue,
  value,
  minValue,
  maxValue,
  isDisabled,
  isReadOnly,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: Omit<DateCalendarProps, "appearance" | "calendars" | "isOpen" | "onChange" | "autoFocus">) {
  // NOTE: value/defaultValue proviennent de DateCalendarProps (DateValue unique).
  // On les utilise uniquement pour initialiser le mois visible via defaultFocusedValue.
  // REASON: focusedValue (contrôlé) sans onFocusChange bloque la gestion interne du focus
  // par React Aria et provoque une sélection de plage immédiate au premier clic.
  // defaultFocusedValue initialise sans contrôler — React Aria gère ensuite librement.
  const initialFocus = value ?? defaultValue;

  // Niveau d'affichage : "date" = double grille React Aria, "month" = MonthCalendar drill-up (simple).
  const [drillLevel, setDrillLevel] = useState<"date" | "month">("date");
  // Date du panel cliqué (pivot pour initialiser le MonthCalendar).
  const [pivotDate, setPivotDate] = useState<CalendarDate | undefined>(undefined);
  // Panel ayant déclenché le drill-up : détermine quel panel est mis à jour au retour.
  const [drilledPanel, setDrilledPanel] = useState<"left" | "right">("left");

  const handleDrillUp = (date: CalendarDate, panel: "left" | "right") => {
    setPivotDate(date);
    setDrilledPanel(panel);
    setDrillLevel("month");
  };

  // Drill-down depuis le sélecteur de mois simple :
  // - panel gauche → left = sélection, right = sélection + 1 (defaultFocusedValue = sélection)
  // - panel droit  → right = sélection, left = sélection - 1 (defaultFocusedValue = sélection - 1)
  const handleMonthSelect = (month: CalendarDate) => {
    const newPivot = drilledPanel === "right"
      ? month.subtract({ months: 1 })
      : month;
    setPivotDate(newPivot);
    setDrillLevel("date");
  };

  if (drillLevel === "month") {
    return (
      <MonthCalendar
        defaultValue={pivotDate}
        isDisabled={isDisabled}
        className={className}
        onChange={handleMonthSelect}
      />
    );
  }

  return (
    <AriaRangeCalendar
      visibleDuration={{ months: 2 }}
      defaultFocusedValue={initialFocus}
      minValue={minValue}
      maxValue={maxValue}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={[styles.dualLinkedCalendar, className].filter(Boolean).join(" ")}
    >
      <AriaButton slot="previous" className={[styles.navButton, styles.dualNavPrev].join(" ")}>
        <Icon icon="ChevronLeft" size={20} variant="filled" />
      </AriaButton>
      <DualPanelHeadingButton
        offset={0}
        className={styles.dualHeadingLeft}
        onDrillUp={handleDrillUp}
        isDisabled={isDisabled}
      />
      <DualPanelHeadingButton
        offset={1}
        className={styles.dualHeadingRight}
        onDrillUp={handleDrillUp}
        isDisabled={isDisabled}
      />
      <AriaButton slot="next" className={[styles.navButton, styles.dualNavNext].join(" ")}>
        <Icon icon="ChevronRight" size={20} variant="filled" />
      </AriaButton>
      <CalendarGrid className={[styles.grid, styles.dualGrid1].join(" ")}>
        <CalendarGridContent calendarDisabled={isDisabled ?? false} />
      </CalendarGrid>
      <CalendarGrid
        offset={{ months: 1 }}
        className={[styles.grid, styles.dualGrid2].join(" ")}
      >
        <CalendarGridContent calendarDisabled={isDisabled ?? false} />
      </CalendarGrid>
    </AriaRangeCalendar>
  );
}

// -----------------------------------------------------------------------
// Contenu de grille réutilisable (interne)

/**
 * Grille date pour AriaCalendar (single).
 * Les cellules hors-mois sont rendues en <button> interactif et appellent
 * state.setFocusedDate pour naviguer vers le mois cliqué.
 * NOTE: React Aria marque les cellules hors visible range comme isDisabled,
 * bloquant les clics. On bypass en rendant la cellule comme button indépendant.
 */
function SingleCalendarGridBody({ calendarDisabled }: { calendarDisabled: boolean }) {
  const state = useContext(CalendarStateContext);
  return (
    <CalendarGridBody>
      {(date) => (
        <AriaCalendarCell date={date} className={styles.ariaDateCell}>
          {({ formattedDate, isFocusVisible, isHovered, isPressed, isSelected, isSelectionStart, isSelectionEnd, isToday, isDisabled: cellDisabled, isUnavailable, isOutsideMonth }) => {
            if (isOutsideMonth) {
              return (
                <CometeCalendarCell
                  interactive={true}
                  isOutsideMonth={true}
                  isToday={isToday}
                  isDisabled={calendarDisabled}
                  onClick={() => state?.setFocusedDate(date)}
                >
                  {formattedDate}
                </CometeCalendarCell>
              );
            }
            return (
              <CometeCalendarCell
                interactive={false}
                isSelected={isSelected}
                isSelectionStart={isSelectionStart}
                isSelectionEnd={isSelectionEnd}
                isToday={isToday}
                isHovered={isHovered}
                isPressed={isPressed}
                isDisabled={cellDisabled}
                isUnavailable={isUnavailable}
                isFocusVisible={isFocusVisible}
              >
                {formattedDate}
              </CometeCalendarCell>
            );
          }}
        </AriaCalendarCell>
      )}
    </CalendarGridBody>
  );
}

/**
 * Header + body d'un CalendarGrid pour AriaRangeCalendar (dual).
 * Même logique de bypass pour les cellules hors-mois.
 */
function CalendarGridContent({ calendarDisabled }: { calendarDisabled: boolean }) {
  const state = useContext(RangeCalendarStateContext);
  return (
    <>
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className={styles.headerCell}>{day}</CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <AriaCalendarCell date={date} className={styles.ariaDateCell}>
            {({ formattedDate, isFocusVisible, isHovered, isPressed, isSelected, isSelectionStart, isSelectionEnd, isToday, isDisabled: cellDisabled, isUnavailable, isOutsideMonth }) => {
              if (isOutsideMonth) {
                return (
                  <CometeCalendarCell
                    interactive={true}
                    isOutsideMonth={true}
                    isToday={isToday}
                    isDisabled={calendarDisabled}
                    onClick={() => state?.setFocusedDate(date)}
                  >
                    {formattedDate}
                  </CometeCalendarCell>
                );
              }
              return (
                <CometeCalendarCell
                  interactive={false}
                  isSelected={isSelected}
                  isSelectionStart={isSelectionStart}
                  isSelectionEnd={isSelectionEnd}
                  isRangePart={isSelected && !isSelectionStart && !isSelectionEnd}
                  isToday={isToday}
                  isHovered={isHovered}
                  isPressed={isPressed}
                  isDisabled={cellDisabled}
                  isUnavailable={isUnavailable}
                  isFocusVisible={isFocusVisible}
                >
                  {formattedDate}
                </CometeCalendarCell>
              );
            }}
          </AriaCalendarCell>
        )}
      </CalendarGridBody>
    </>
  );
}
