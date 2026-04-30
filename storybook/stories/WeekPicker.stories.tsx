// WeekPicker — stories Storybook
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeekPicker, Field } from "@naxit/comete-design-system/components";
import type {
  WeekPickerProps,
  SingleWeekPickerProps,
  RangeWeekPickerProps,
} from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/WeekPicker",
  component: WeekPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("3563:89666"),
    },
  },
  argTypes: {
    isRange: {
      control: "boolean",
      description: "Mode plage (start/end) au lieu d'une semaine unique",
    },
    week: {
      control: { type: "number", min: 1, max: 53 },
      description: "Numéro de semaine ISO (1-53) — mode single",
      if: { arg: "isRange", truthy: false },
    },
    year: {
      control: { type: "number" },
      description: "Année ISO de la semaine — mode single",
      if: { arg: "isRange", truthy: false },
    },
    startWeek: {
      control: { type: "number", min: 1, max: 53 },
      description: "Semaine de début (1-53) — mode range",
      if: { arg: "isRange", truthy: true },
    },
    startYear: {
      control: { type: "number" },
      description: "Année de début — mode range",
      if: { arg: "isRange", truthy: true },
    },
    endWeek: {
      control: { type: "number", min: 1, max: 53 },
      description: "Semaine de fin (1-53) — mode range",
      if: { arg: "isRange", truthy: true },
    },
    endYear: {
      control: { type: "number" },
      description: "Année de fin — mode range",
      if: { arg: "isRange", truthy: true },
    },
    isEditable: {
      control: "boolean",
      description: "Mode saisie (inputs + icône calendrier)",
    },
    appearance: {
      control: { type: "inline-radio" },
      options: ["default", "subtle"],
      description: "Apparence visuelle",
    },
    isInvalid: {
      control: "boolean",
      description: "Marque le champ comme invalide",
    },
    isDisabled: {
      control: "boolean",
      description: "Désactive le composant",
    },
  },
} satisfies Meta<typeof WeekPicker>;

export default meta;
type Story = StoryObj<typeof WeekPicker>;

// -----------------------------------------------------------------------
// Render helpers

/** Sous-composant : hooks isolés pour le mode single. */
function SingleRender({ args }: { args: SingleWeekPickerProps }) {
  const [week, setWeek] = useState<number | undefined>(args.week ?? 28);
  const [year, setYear] = useState<number | undefined>(args.year ?? 2025);
  useEffect(() => {
    if (args.week !== undefined) setWeek(args.week);
  }, [args.week]);
  useEffect(() => {
    if (args.year !== undefined) setYear(args.year);
  }, [args.year]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      <WeekPicker
        {...args}
        isRange={false}
        week={week}
        year={year}
        onChange={(w, y) => {
          setWeek(w);
          setYear(y);
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-subtlest)",
        }}
      >
        Sélection : S{week} / {year}
      </p>
    </div>
  );
}

/** Sous-composant : hooks isolés pour le mode range. */
function RangeRender({ args }: { args: RangeWeekPickerProps }) {
  const [startWeek, setStartWeek] = useState<number | undefined>(args.startWeek ?? 28);
  const [startYear, setStartYear] = useState<number | undefined>(args.startYear ?? 2025);
  const [endWeek, setEndWeek] = useState<number | undefined>(args.endWeek ?? 32);
  const [endYear, setEndYear] = useState<number | undefined>(args.endYear ?? 2025);
  useEffect(() => {
    if (args.startWeek !== undefined) setStartWeek(args.startWeek);
  }, [args.startWeek]);
  useEffect(() => {
    if (args.startYear !== undefined) setStartYear(args.startYear);
  }, [args.startYear]);
  useEffect(() => {
    if (args.endWeek !== undefined) setEndWeek(args.endWeek);
  }, [args.endWeek]);
  useEffect(() => {
    if (args.endYear !== undefined) setEndYear(args.endYear);
  }, [args.endYear]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      <WeekPicker
        {...args}
        isRange
        startWeek={startWeek}
        startYear={startYear}
        endWeek={endWeek}
        endYear={endYear}
        onChange={(sw, sy, ew, ey) => {
          setStartWeek(sw);
          setStartYear(sy);
          setEndWeek(ew);
          setEndYear(ey);
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-subtlest)",
        }}
      >
        Sélection : S{startWeek}/{startYear} → S{endWeek}/{endYear}
      </p>
    </div>
  );
}

/** Dispatcher — switch single/range selon `args.isRange`. */
function ControlledRender(args: WeekPickerProps) {
  if (args.isRange) {
    return <RangeRender args={args} />;
  }
  return <SingleRender args={args} />;
}

// -----------------------------------------------------------------------
// Stories

/** Mode saisie (défaut) — input semaine + icône calendrier. */
export const Default: Story = {
  render: ControlledRender,
  parameters: {
    design: { type: "figma", url: figmaUrl("3563:89666") },
  },
};

/** Mode navigation — chevrons ←/→ + bouton semaine formaté. */
export const NonEditable: Story = {
  render: ControlledRender,
  args: {
    week: 28,
    year: 2025,
    isEditable: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3563:89666") },
  },
};

/** WeekPicker subtle. */
export const Subtle: Story = {
  render: ControlledRender,
  args: {
    week: 28,
    year: 2025,
    appearance: "subtle",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3563:89666") },
  },
};

/** WeekPicker invalid. */
export const Invalid: Story = {
  render: ControlledRender,
  args: {
    week: 28,
    year: 2025,
    isInvalid: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3563:89666") },
  },
};

/** État désactivé. */
export const Disabled: Story = {
  render: ControlledRender,
  args: {
    week: 28,
    year: 2025,
    isDisabled: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3563:89666") },
  },
};

/** WeekPicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args: WeekPickerProps) => (
    <Field label="Semaine" isRequired>
      <ControlledRender {...args} />
    </Field>
  ),
};

/** WeekPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  args: { isInvalid: true },
  render: (args: WeekPickerProps) => (
    <Field
      label="Semaine"
      message="La semaine est invalide"
      messageType="critical"
    >
      <ControlledRender {...args} />
    </Field>
  ),
};

/** Mode plage (range) — "Sem. 28 • 07/07/25 → Sem. 32 • 04/08/25" + icône calendrier. */
export const Range: Story = {
  render: ControlledRender,
  args: {
    isRange: true,
    startWeek: 28,
    startYear: 2025,
    endWeek: 32,
    endYear: 2025,
  } as never,
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: WeekPickerProps) => (
    <div style={{ display: "flex", gap: 32 }}>
      <Field label="Default">
        <ControlledRender {...args} />
      </Field>
      <Field label="Subtle">
        <ControlledRender {...args} appearance="subtle" />
      </Field>
    </div>
  ),
};
