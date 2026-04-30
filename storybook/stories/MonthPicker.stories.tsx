// MonthPicker — stories Storybook
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonthPicker, Field } from "@naxit/comete-design-system/components";
import type {
  MonthPickerProps,
  SingleMonthPickerProps,
  RangeMonthPickerProps,
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
  title: "Components/MonthPicker",
  component: MonthPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("3363:12640"),
    },
  },
  argTypes: {
    isRange: {
      control: "boolean",
      description: "Mode plage (start/end) au lieu d'un mois unique",
    },
    month: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois sélectionné (1-12) — mode single",
      if: { arg: "isRange", truthy: false },
    },
    year: {
      control: { type: "number" },
      description: "Année sélectionnée — mode single",
      if: { arg: "isRange", truthy: false },
    },
    startMonth: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois de début (1-12) — mode range",
      if: { arg: "isRange", truthy: true },
    },
    startYear: {
      control: { type: "number" },
      description: "Année de début — mode range",
      if: { arg: "isRange", truthy: true },
    },
    endMonth: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois de fin (1-12) — mode range",
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
} satisfies Meta<typeof MonthPicker>;

export default meta;
type Story = StoryObj<typeof MonthPicker>;

// -----------------------------------------------------------------------
// Render helpers

/** Sous-composant : hooks isolés pour le mode single. */
function SingleRender({ args }: { args: SingleMonthPickerProps }) {
  const now = new Date();
  const [month, setMonth] = useState<number | undefined>(args.month ?? now.getMonth() + 1);
  const [year, setYear] = useState<number | undefined>(args.year ?? now.getFullYear());
  // Sync depuis les controls Storybook quand args change (sans écraser les
  // modifs utilisateur : onChange met à jour le state local, pas args).
  useEffect(() => {
    if (args.month !== undefined) setMonth(args.month);
  }, [args.month]);
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
      <MonthPicker
        {...args}
        isRange={false}
        month={month}
        year={year}
        onChange={(m, y) => {
          setMonth(m);
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
        Sélection : {String(month).padStart(2, "0")}/{year}
      </p>
    </div>
  );
}

/** Sous-composant : hooks isolés pour le mode range. */
function RangeRender({ args }: { args: RangeMonthPickerProps }) {
  const [startMonth, setStartMonth] = useState<number | undefined>(args.startMonth ?? 8);
  const [startYear, setStartYear] = useState<number | undefined>(args.startYear ?? 2025);
  const [endMonth, setEndMonth] = useState<number | undefined>(args.endMonth ?? 11);
  const [endYear, setEndYear] = useState<number | undefined>(args.endYear ?? 2025);
  // Sync depuis les controls Storybook quand args change.
  useEffect(() => {
    if (args.startMonth !== undefined) setStartMonth(args.startMonth);
  }, [args.startMonth]);
  useEffect(() => {
    if (args.startYear !== undefined) setStartYear(args.startYear);
  }, [args.startYear]);
  useEffect(() => {
    if (args.endMonth !== undefined) setEndMonth(args.endMonth);
  }, [args.endMonth]);
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
      <MonthPicker
        {...args}
        isRange
        startMonth={startMonth}
        startYear={startYear}
        endMonth={endMonth}
        endYear={endYear}
        onChange={(sm, sy, em, ey) => {
          setStartMonth(sm);
          setStartYear(sy);
          setEndMonth(em);
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
        Sélection : {String(startMonth).padStart(2, "0")}/{startYear} → {String(endMonth).padStart(2, "0")}/{endYear}
      </p>
    </div>
  );
}

/** Dispatcher — switch single/range selon `args.isRange`. */
function ControlledRender(args: MonthPickerProps) {
  if (args.isRange) {
    return <RangeRender args={args} />;
  }
  return <SingleRender args={args} />;
}

// -----------------------------------------------------------------------
// Stories

/** Mode saisie (défaut) — inputs mois/année + icône calendrier. */
export const Default: Story = {
  render: ControlledRender,
  parameters: {
    design: { type: "figma", url: figmaUrl("3363:12640") },
  },
};

/** Mode navigation — chevrons ←/→ + bouton mois/année. */
export const NonEditable: Story = {
  render: ControlledRender,
  args: {
    month: 6,
    year: 2025,
    isEditable: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3363:12640") },
  },
};

/** MonthPicker subtle. */
export const Subtle: Story = {
  render: ControlledRender,
  args: {
    month: 6,
    year: 2025,
    appearance: "subtle",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3363:12640") },
  },
};

/** MonthPicker invalid. */
export const Invalid: Story = {
  render: ControlledRender,
  args: {
    month: 6,
    year: 2025,
    isInvalid: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3363:12640") },
  },
};

/** État désactivé. */
export const Disabled: Story = {
  render: ControlledRender,
  args: {
    month: 6,
    year: 2025,
    isDisabled: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3363:12640") },
  },
};

/** MonthPicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args: MonthPickerProps) => (
    <Field label="Mois" isRequired>
      <ControlledRender {...args} />
    </Field>
  ),
};

/** MonthPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  args: { isInvalid: true },
  render: (args: MonthPickerProps) => (
    <Field label="Mois" message="Le mois est invalide" messageType="critical">
      <ControlledRender {...args} />
    </Field>
  ),
};

/** Mode plage (range) — "Août 2025 → Novembre 2025" + icône calendrier. */
export const Range: Story = {
  render: ControlledRender,
  args: {
    isRange: true,
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  } as never,
  parameters: {
    design: { type: "figma", url: figmaUrl("4189:17716") },
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: MonthPickerProps) => (
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
