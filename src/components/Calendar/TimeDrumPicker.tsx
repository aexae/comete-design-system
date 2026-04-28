// TimeDrumPicker — Comète Design System
// Colonnes scrollables (heures, minutes, secondes, AM/PM) pour la sélection d'heure.
import { useEffect, useRef, useState, type ReactElement, type CSSProperties } from "react";
import type { TimeValue } from "react-aria-components";
import { Time } from "@internationalized/date";
import styles from "./TimeDrumPicker.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface TimeDrumPickerProps {
  /** Heure sélectionnée. */
  value?: TimeValue | null;
  /** Callback appelé à chaque changement. */
  onChange?: (time: Time) => void;
  /** Désactive le sélecteur. */
  isDisabled?: boolean;
  /** Format 12h (AM/PM) ou 24h. @default 24 */
  hourCycle?: 12 | 24;
  /** Affiche la colonne des secondes. @default false */
  showSeconds?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Constantes

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

// -----------------------------------------------------------------------
// Helpers

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Animation custom du scroll en RAF — courte, ease-out-cubic, légère.
 *  Remplace `scrollTo({behavior:"smooth"})` dont la durée native (~400-500ms,
 *  ease-in-out) donne un ressenti pesant. */
function animateScrollTo(
  el: HTMLElement,
  target: number,
  duration = 180,
): () => void {
  const start = el.scrollTop;
  const change = target - start;
  if (Math.abs(change) < 0.5) {
    el.scrollTop = target;
    return () => {};
  }
  const startTime = performance.now();
  let rafId = 0;
  let cancelled = false;
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
  const step = (now: number) => {
    if (cancelled) return;
    const t = Math.min((now - startTime) / duration, 1);
    el.scrollTop = start + change * easeOutCubic(t);
    if (t < 1) rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

/** Convertit heure 24h → heure 12h (1-12). */
function to12Hour(h24: number): number {
  const h = h24 % 12;
  return h === 0 ? 12 : h;
}

/** Convertit heure 12h + période → heure 24h. */
function to24Hour(h12: number, period: "AM" | "PM"): number {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

// -----------------------------------------------------------------------
// DrumColumn — une seule colonne scrollable (valeurs numériques)

interface DrumColumnProps {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  isDisabled: boolean;
  label: string;
  /** Formatage personnalisé de l'affichage. Par défaut : pad(n). */
  format?: (n: number) => string;
}

function DrumColumn({
  values,
  selected,
  onSelect,
  isDisabled,
  label,
  format = pad,
}: DrumColumnProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelAnimRef = useRef<(() => void) | null>(null);

  // Scroll vers la valeur sélectionnée au montage
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const targetIndex = values.indexOf(selected);
    if (targetIndex >= 0) {
      el.scrollTop = targetIndex * ITEM_HEIGHT;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll vers la nouvelle valeur quand elle change depuis l'extérieur
  useEffect(() => {
    if (isScrollingRef.current) return;
    const el = listRef.current;
    if (!el) return;
    const targetIndex = values.indexOf(selected);
    if (targetIndex >= 0) {
      const targetScroll = targetIndex * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - targetScroll) > 1) {
        cancelAnimRef.current?.();
        cancelAnimRef.current = animateScrollTo(el, targetScroll);
      }
    }
  }, [selected, values]);

  const handleScroll = () => {
    if (isDisabled) return;
    isScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;

      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      const snappedScroll = clampedIndex * ITEM_HEIGHT;

      cancelAnimRef.current?.();
      cancelAnimRef.current = animateScrollTo(el, snappedScroll);

      const snappedValue = values[clampedIndex];
      if (snappedValue !== undefined) onSelect(snappedValue);

      isScrollingRef.current = false;
    }, 90);
  };

  const handleClick = (value: number) => {
    if (isDisabled) return;
    onSelect(value);
  };

  // padding haut/bas pour centrer le premier/dernier item
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div
      className={styles.drumColumn}
      role="listbox"
      aria-label={label}
      aria-disabled={isDisabled || undefined}
    >
      <div
        className={styles.drumScroll}
        ref={listRef}
        onScroll={handleScroll}
        style={{
          height: VISIBLE_ITEMS * ITEM_HEIGHT,
        }}
      >
        {/* Padding top */}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />

        {values.map((v) => {
          const isSelected = v === selected;
          return (
            <button
              key={v}
              type="button"
              role="option"
              className={styles.drumItem}
              aria-selected={isSelected}
              data-selected={isSelected || undefined}
              disabled={isDisabled}
              onClick={() => handleClick(v)}
              style={{ height: ITEM_HEIGHT }}
            >
              {format(v)}
            </button>
          );
        })}

        {/* Padding bottom */}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// PeriodColumn — colonne AM/PM (2 valeurs texte)

interface PeriodColumnProps {
  selected: "AM" | "PM";
  onSelect: (value: "AM" | "PM") => void;
  isDisabled: boolean;
}

function PeriodColumn({
  selected,
  onSelect,
  isDisabled,
}: PeriodColumnProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const cancelAnimRef = useRef<(() => void) | null>(null);
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);
  const periods: ("AM" | "PM")[] = ["AM", "PM"];

  // Scroll vers la période sélectionnée au montage
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const targetIndex = periods.indexOf(selected);
    if (targetIndex >= 0) {
      el.scrollTop = targetIndex * ITEM_HEIGHT;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll vers la nouvelle période quand elle change
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const targetIndex = periods.indexOf(selected);
    if (targetIndex >= 0) {
      const targetScroll = targetIndex * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - targetScroll) > 1) {
        cancelAnimRef.current?.();
        cancelAnimRef.current = animateScrollTo(el, targetScroll);
      }
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (p: "AM" | "PM") => {
    if (!isDisabled) onSelect(p);
  };

  return (
    <div
      className={styles.drumColumn}
      role="listbox"
      aria-label="Période"
      aria-disabled={isDisabled || undefined}
    >
      <div
        className={styles.drumScroll}
        ref={listRef}
        style={{
          height: VISIBLE_ITEMS * ITEM_HEIGHT,
        }}
      >
        {/* Padding top */}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />

        {periods.map((p) => {
          const isSelected = p === selected;
          return (
            <button
              key={p}
              type="button"
              role="option"
              className={styles.drumItem}
              aria-selected={isSelected}
              data-selected={isSelected || undefined}
              disabled={isDisabled}
              onClick={() => handleClick(p)}
              style={{ height: ITEM_HEIGHT }}
            >
              {p}
            </button>
          );
        })}

        {/* Padding bottom */}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Composant principal

/**
 * TimeDrumPicker — Comète Design System
 *
 * Colonnes scrollables pour la sélection d'heure.
 * En mode 24h : heures 0-23, minutes 0-59, secondes 0-59.
 * En mode 12h : heures 1-12, minutes 0-59, secondes 0-59, AM/PM.
 *
 * ```tsx
 * <TimeDrumPicker value={new Time(14, 30, 0)} onChange={(t) => console.log(t)} />
 * <TimeDrumPicker value={new Time(14, 30, 0)} hourCycle={12} onChange={(t) => console.log(t)} />
 * ```
 */
export function TimeDrumPicker({
  value,
  onChange,
  isDisabled = false,
  hourCycle = 24,
  showSeconds = false,
  className,
}: TimeDrumPickerProps): ReactElement {
  const resolvedValue = value ?? new Time(0, 0, 0);
  const is12h = hourCycle === 12;

  const [hour, setHour] = useState(resolvedValue.hour);
  const [minute, setMinute] = useState(resolvedValue.minute);
  const [second, setSecond] = useState(resolvedValue.second);
  const [period, setPeriod] = useState<"AM" | "PM">(
    resolvedValue.hour >= 12 ? "PM" : "AM",
  );

  // Synchroniser si la valeur contrôlée change
  useEffect(() => {
    setHour(resolvedValue.hour);
    setMinute(resolvedValue.minute);
    setSecond(resolvedValue.second);
    setPeriod(resolvedValue.hour >= 12 ? "PM" : "AM");
  }, [resolvedValue.hour, resolvedValue.minute, resolvedValue.second]);

  const handleChange = (h: number, m: number, s: number) => {
    onChange?.(new Time(h, m, s));
  };

  // Handlers 12h : convertissent 12h+période → 24h avant d'appeler handleChange
  const handleHour12Select = (h12: number) => {
    const h24 = to24Hour(h12, period);
    setHour(h24);
    handleChange(h24, minute, second);
  };

  const handlePeriodSelect = (p: "AM" | "PM") => {
    setPeriod(p);
    const h12 = to12Hour(hour);
    const h24 = to24Hour(h12, p);
    setHour(h24);
    handleChange(h24, minute, second);
  };

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div
      className={[styles.timeDrumPicker, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      aria-label="Sélecteur d'heure"
    >
      {/* Bande de sélection traversant toutes les colonnes */}
      <div
        className={styles.highlightBand}
        style={{
          top: `calc(${String(paddingItems * ITEM_HEIGHT)}px + var(--space100))`,
          height: ITEM_HEIGHT,
        }}
        aria-hidden="true"
      />

      {/* Colonne heures */}
      {is12h ? (
        <DrumColumn
          values={HOURS_12}
          selected={to12Hour(hour)}
          onSelect={handleHour12Select}
          isDisabled={isDisabled}
          label="Heures"
        />
      ) : (
        <DrumColumn
          values={HOURS_24}
          selected={hour}
          onSelect={(h) => {
            setHour(h);
            handleChange(h, minute, second);
          }}
          isDisabled={isDisabled}
          label="Heures"
        />
      )}

      <span className={styles.separator} aria-hidden="true">
        :
      </span>

      <DrumColumn
        values={MINUTES}
        selected={minute}
        onSelect={(m) => {
          setMinute(m);
          handleChange(hour, m, second);
        }}
        isDisabled={isDisabled}
        label="Minutes"
      />

      {showSeconds && (
        <>
          <span className={styles.separator} aria-hidden="true">
            :
          </span>
          <DrumColumn
            values={SECONDS}
            selected={second}
            onSelect={(s) => {
              setSecond(s);
              handleChange(hour, minute, s);
            }}
            isDisabled={isDisabled}
            label="Secondes"
          />
        </>
      )}

      {/* Colonne AM/PM en mode 12h */}
      {is12h && (
        <PeriodColumn
          selected={period}
          onSelect={handlePeriodSelect}
          isDisabled={isDisabled}
        />
      )}
    </div>
  );
}
