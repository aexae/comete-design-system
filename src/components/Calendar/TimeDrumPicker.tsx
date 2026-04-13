// TimeDrumPicker — Comète Design System
// 3 colonnes scrollables (heures, minutes, secondes) pour la sélection d'heure.
import { useEffect, useRef, useState, type ReactElement } from "react";
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
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Constantes

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

// -----------------------------------------------------------------------
// Helpers

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// -----------------------------------------------------------------------
// DrumColumn — une seule colonne scrollable

interface DrumColumnProps {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  isDisabled: boolean;
  label: string;
}

function DrumColumn({
  values,
  selected,
  onSelect,
  isDisabled,
  label,
}: DrumColumnProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
        el.scrollTo({ top: targetScroll, behavior: "smooth" });
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

      el.scrollTo({ top: snappedScroll, behavior: "smooth" });
      onSelect(values[clampedIndex]);

      isScrollingRef.current = false;
    }, 80);
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
              {pad(v)}
            </button>
          );
        })}

        {/* Padding bottom */}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />
      </div>

      {/* Highlight bar sur l'élément central */}
      <div
        className={styles.drumHighlight}
        style={{
          top: paddingItems * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

// -----------------------------------------------------------------------
// Composant principal

/**
 * TimeDrumPicker — Comète Design System
 *
 * 3 colonnes scrollables (heures 0-23, minutes 0-59, secondes 0-59)
 * avec effet « drum picker ». L'élément sélectionné est centré et surligné.
 *
 * ```tsx
 * <TimeDrumPicker value={new Time(14, 30, 0)} onChange={(t) => console.log(t)} />
 * ```
 */
export function TimeDrumPicker({
  value,
  onChange,
  isDisabled = false,
  className,
}: TimeDrumPickerProps): ReactElement {
  const resolvedValue = value ?? new Time(0, 0, 0);

  const [hour, setHour] = useState(resolvedValue.hour);
  const [minute, setMinute] = useState(resolvedValue.minute);
  const [second, setSecond] = useState(resolvedValue.second);

  // Synchroniser si la valeur contrôlée change
  useEffect(() => {
    setHour(resolvedValue.hour);
    setMinute(resolvedValue.minute);
    setSecond(resolvedValue.second);
  }, [resolvedValue.hour, resolvedValue.minute, resolvedValue.second]);

  const handleChange = (h: number, m: number, s: number) => {
    onChange?.(new Time(h, m, s));
  };

  return (
    <div
      className={[styles.timeDrumPicker, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      aria-label="Sélecteur d'heure"
    >
      <DrumColumn
        values={HOURS}
        selected={hour}
        onSelect={(h) => {
          setHour(h);
          handleChange(h, minute, second);
        }}
        isDisabled={isDisabled}
        label="Heures"
      />

      <div className={styles.drumSeparator} aria-hidden="true">
        :
      </div>

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

      <div className={styles.drumSeparator} aria-hidden="true">
        :
      </div>

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
    </div>
  );
}
