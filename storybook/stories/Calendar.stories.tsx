// Calendar — stories Storybook (composant unifié)
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDate } from "@internationalized/date";
import type { DateValue, RangeValue } from "react-aria-components";
import {
  Calendar,
  type CalendarAppearance,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Types raccourcis pour les args destructurés

type Args = {
  appearance?: CalendarAppearance;
  calendars?: 1 | 2;
  isRange?: boolean;
  isDisabled?: boolean;
};

// -----------------------------------------------------------------------
// DefaultValue adapté à l'appearance et à isRange.
// Permet de voir immédiatement le mode actif dans Storybook.

function getDefaultValue(
  appearance: CalendarAppearance = "date",
  isRange?: boolean,
): unknown {
  if (appearance === "week") {
    return {
      start: new CalendarDate(2026, 4, 13),
      end: new CalendarDate(2026, 4, 19),
    };
  }
  if (isRange) {
    if (appearance === "month")
      return {
        start: new CalendarDate(2026, 3, 1),
        end: new CalendarDate(2026, 8, 1),
      };
    if (appearance === "year")
      return {
        start: new CalendarDate(2024, 1, 1),
        end: new CalendarDate(2031, 1, 1),
      };
    // date range
    return {
      start: new CalendarDate(2026, 4, 10),
      end: new CalendarDate(2026, 4, 20),
    };
  }
  if (appearance === "month") return new CalendarDate(2026, 4, 1);
  if (appearance === "year") return new CalendarDate(2026, 1, 1);
  return new CalendarDate(2026, 4, 15);
}

// -----------------------------------------------------------------------
// Helper partagé — construit le <Calendar> depuis les args Storybook.
// Utilisé par toutes les stories non contrôlées.
//
// • appearance  → passé tel quel
// • calendars   → passé tel quel
// • isDisabled  → passé tel quel
// • isRange     → injecté comme `isRange: true` (discriminant) ou `mode: "period"` pour week
// • extra       → props supplémentaires (minValue, maxValue…)
// • key         → force remount quand appearance/isRange/calendars change

function renderCalendar(args: Args, extra?: Record<string, unknown>) {
  const { appearance = "date", calendars, isRange, isDisabled } = args;

  const props: Record<string, unknown> = {
    "aria-label": "Calendrier",
    appearance,
    calendars,
    isDisabled,
    defaultValue: getDefaultValue(appearance, isRange),
    ...extra,
  };

  // Week utilise `mode` au lieu de `isRange`
  if (appearance === "week") {
    props["mode"] = isRange ? "period" : "week";
  } else if (isRange) {
    props["isRange"] = true;
  }

  return (
    <Calendar
      key={`${appearance}-${isRange}-${calendars}`}
      {...(props as Parameters<typeof Calendar>[0])}
    />
  );
}

// -----------------------------------------------------------------------
// Composant contrôlé universel — réagit à appearance / isRange / calendars / isDisabled.
// Remonte (key) à chaque changement d'appearance ou isRange pour réinitialiser le state.

function ControlledCalendar(args: Args) {
  const { appearance = "date", isRange } = args;
  return (
    <ControlledCalendarInner key={`${appearance}-${isRange}`} {...args} />
  );
}

function ControlledCalendarInner({
  appearance = "date",
  calendars,
  isRange,
  isDisabled,
}: Args) {
  // --- Week (toujours range) ---
  if (appearance === "week") {
    return (
      <WeekControlledInner
        calendars={calendars}
        isRange={isRange}
        isDisabled={isDisabled}
      />
    );
  }

  // --- Range (date, month, year) ---
  if (isRange) {
    return (
      <RangeControlledInner
        appearance={appearance}
        calendars={calendars}
        isDisabled={isDisabled}
      />
    );
  }

  // --- Single (date, month, year) ---
  return (
    <SingleControlledInner
      appearance={appearance}
      calendars={calendars}
      isDisabled={isDisabled}
    />
  );
}

// --- Week controlled (mode="week" ou "period") ---

function WeekControlledInner({
  calendars,
  isRange,
  isDisabled,
}: {
  calendars?: 1 | 2;
  isRange?: boolean;
  isDisabled?: boolean;
}) {
  const [range, setRange] = useState<RangeValue<CalendarDate>>({
    start: new CalendarDate(2026, 4, 13),
    end: new CalendarDate(2026, 4, 19),
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Calendar
        aria-label="Choisir une semaine"
        appearance="week"
        mode={isRange ? "period" : "week"}
        calendars={calendars}
        isDisabled={isDisabled}
        value={range}
        onChange={setRange}
      />
      <p style={{ fontFamily: "monospace", fontSize: 13 }}>
        {range.start.toString()} → {range.end.toString()}
      </p>
    </div>
  );
}

// --- Range controlled (date / month / year) ---

function RangeControlledInner({
  appearance = "date",
  calendars,
  isDisabled,
}: {
  appearance?: CalendarAppearance;
  calendars?: 1 | 2;
  isDisabled?: boolean;
}) {
  const initialRange: RangeValue<CalendarDate> =
    appearance === "year"
      ? {
          start: new CalendarDate(2024, 1, 1),
          end: new CalendarDate(2031, 1, 1),
        }
      : appearance === "month"
        ? {
            start: new CalendarDate(2026, 3, 1),
            end: new CalendarDate(2026, 8, 1),
          }
        : {
            start: new CalendarDate(2026, 3, 10),
            end: new CalendarDate(2026, 3, 20),
          };

  const [range, setRange] = useState<RangeValue<CalendarDate>>(initialRange);

  const calProps: Record<string, unknown> = {
    "aria-label": "Choisir une période",
    appearance,
    isRange: true,
    calendars,
    isDisabled,
    value: range,
    onChange: setRange,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Calendar {...(calProps as Parameters<typeof Calendar>[0])} />
      <p style={{ fontFamily: "monospace", fontSize: 13 }}>
        {formatRange(appearance, range)}
      </p>
    </div>
  );
}

// --- Single controlled (date / month / year) ---

function SingleControlledInner({
  appearance = "date",
  calendars,
  isDisabled,
}: {
  appearance?: CalendarAppearance;
  calendars?: 1 | 2;
  isDisabled?: boolean;
}) {
  const initial: CalendarDate =
    appearance === "year"
      ? new CalendarDate(2026, 1, 1)
      : appearance === "month"
        ? new CalendarDate(2026, 3, 1)
        : new CalendarDate(2026, 3, 15);

  const [value, setValue] = useState<DateValue>(initial);

  const calProps: Record<string, unknown> = {
    "aria-label": "Choisir une valeur",
    appearance,
    calendars,
    isDisabled,
    value,
    onChange: setValue,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Calendar {...(calProps as Parameters<typeof Calendar>[0])} />
      <p style={{ fontFamily: "monospace", fontSize: 13 }}>
        Sélectionné : {formatSingle(appearance, value)}
      </p>
    </div>
  );
}

// --- Helpers de formatage ---

function formatRange(
  appearance: string,
  range: RangeValue<CalendarDate>,
): string {
  if (appearance === "year") return `${range.start.year} → ${range.end.year}`;
  if (appearance === "month")
    return `${range.start.year}/${String(range.start.month).padStart(2, "0")} → ${range.end.year}/${String(range.end.month).padStart(2, "0")}`;
  return `${range.start.toString()} → ${range.end.toString()}`;
}

function formatSingle(appearance: string, value: DateValue): string {
  if (appearance === "year") return String(value.year);
  if (appearance === "month")
    return `${value.year}/${String(value.month).padStart(2, "0")}`;
  return value.toString();
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3223:8583") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["date", "week", "month", "year"] satisfies CalendarAppearance[],
      description: "Mode de sélection du calendrier.",
      table: { defaultValue: { summary: "date" } },
    },
    calendars: {
      control: "select",
      options: [1, 2],
      description: "Nombre de calendriers affichés côte à côte.",
      table: { defaultValue: { summary: "1" } },
    },
    isRange: {
      control: "boolean",
      description:
        "Active la sélection de plage (range) au lieu d'une sélection unique.",
      table: { defaultValue: { summary: "false" } },
    },
    isDisabled: {
      control: "boolean",
      description: "Désactive le composant.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    appearance: "date",
    calendars: 1,
    isRange: false,
    isDisabled: false,
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof Calendar>;

// -----------------------------------------------------------------------
// Playground — expose tous les contrôles

export const Playground: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

// -----------------------------------------------------------------------
// appearance="date" (défaut)

export const Default: Story = {
  name: "Date",
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

export const Controlled: Story = {
  name: "Date — contrôlé",
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => <ControlledCalendar {...args} />,
};

export const WithMinMax: Story = {
  name: "Date — min/max",
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) =>
    renderCalendar(args, {
      minValue: new CalendarDate(2026, 3, 10),
      maxValue: new CalendarDate(2026, 3, 25),
    }),
};

export const Disabled: Story = {
  name: "Date — désactivé",
  args: { isDisabled: true },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

// -----------------------------------------------------------------------
// appearance="week"

export const Week: Story = {
  name: "Semaine",
  args: { appearance: "week" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

export const WeekControlled: Story = {
  name: "Semaine — contrôlée",
  args: { appearance: "week" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => <ControlledCalendar {...args} />,
};

export const WeekDisabled: Story = {
  name: "Semaine — désactivé",
  args: { appearance: "week", isDisabled: true },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

// -----------------------------------------------------------------------
// appearance="month"

export const Month: Story = {
  name: "Mois",
  args: { appearance: "month" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

export const MonthControlled: Story = {
  name: "Mois — contrôlé",
  args: { appearance: "month" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => <ControlledCalendar {...args} />,
};

export const MonthDisabled: Story = {
  name: "Mois — désactivé",
  args: { appearance: "month", isDisabled: true },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

// -----------------------------------------------------------------------
// appearance="year"

export const Year: Story = {
  name: "Année",
  args: { appearance: "year" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};

export const YearControlled: Story = {
  name: "Année — contrôlée",
  args: { appearance: "year" },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => <ControlledCalendar {...args} />,
};

export const YearDisabled: Story = {
  name: "Année — désactivée",
  args: { appearance: "year", isDisabled: true },
  parameters: { design: { type: "figma", url: figmaUrl("3223:8583") } },
  render: (args: Args) => renderCalendar(args),
};
