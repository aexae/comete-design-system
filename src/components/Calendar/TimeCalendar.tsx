// TimeCalendar — Comète Design System
// Liste scrollable de créneaux horaires (pas de 15 min par défaut).
import { useEffect, useRef, type ReactElement } from "react";
import type { TimeValue } from "react-aria-components";
import { Time } from "@internationalized/date";
import styles from "./TimeCalendar.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface TimeCalendarProps {
  /** Heure sélectionnée. */
  value?: TimeValue | null;
  /** Callback appelé à chaque sélection. */
  onChange?: (time: Time) => void;
  /**
   * Intervalle en minutes entre chaque créneau.
   * @default 15
   */
  step?: number;
  /** Désactive le calendrier. */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

// -----------------------------------------------------------------------
// Helpers

/** Génère tous les créneaux HH:MM pour une journée avec le pas donné. */
function generateTimeSlots(step: number): Time[] {
  const slots: Time[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(new Time(h, m));
  }
  return slots;
}

/** Formate une Time en "HH : MM". */
function formatTimeSlot(time: Time): string {
  const h = String(time.hour).padStart(2, "0");
  const m = String(time.minute).padStart(2, "0");
  return `${h} : ${m}`;
}

/** Vérifie si deux TimeValue sont le même créneau. */
function isSameTime(a: TimeValue | null | undefined, b: Time): boolean {
  if (!a) return false;
  return a.hour === b.hour && a.minute === b.minute;
}

// -----------------------------------------------------------------------
// Composant

/**
 * TimeCalendar — Comète Design System
 *
 * Liste scrollable de créneaux horaires, utilisée dans le popover du TimePicker.
 *
 * ```tsx
 * <TimeCalendar value={new Time(14, 30)} onChange={(t) => console.log(t)} />
 * ```
 */
export function TimeCalendar({
  value,
  onChange,
  step = 15,
  isDisabled = false,
  className,
}: TimeCalendarProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const slots = generateTimeSlots(step);

  // Scroll vers l'élément sélectionné au montage
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "center" });
    }
  }, []);

  const handleSelect = (time: Time) => {
    if (isDisabled) return;
    onChange?.(time);
  };

  return (
    <div
      role="listbox"
      aria-label="Sélecteur d'heure"
      className={[styles.timeCalendar, className].filter(Boolean).join(" ")}
      data-disabled={isDisabled || undefined}
      ref={listRef}
    >
      {slots.map((time) => {
        const selected = isSameTime(value, time);
        const label = formatTimeSlot(time);
        return (
          <button
            key={`${time.hour}-${time.minute}`}
            type="button"
            role="option"
            ref={selected ? selectedRef : undefined}
            className={styles.timeOption}
            aria-selected={selected}
            data-selected={selected || undefined}
            disabled={isDisabled}
            onClick={() => handleSelect(time)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
