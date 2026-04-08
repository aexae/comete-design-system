// WeekPicker — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeekPicker, Field } from "@naxit/comete-design-system/components";
import type { WeekPickerProps } from "@naxit/comete-design-system/components";

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
    week: {
      control: { type: "number", min: 1, max: 53 },
      description: "Numéro de semaine ISO (1-53)",
    },
    year: {
      control: { type: "number" },
      description: "Année ISO de la semaine",
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
// Render helper — contrôlé via useState

function ControlledRender(args: WeekPickerProps) {
  const [week, setWeek] = useState(args.week ?? 28);
  const [year, setYear] = useState(args.year ?? 2025);
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

// -----------------------------------------------------------------------
// Stories

/** Mode saisie (défaut) — inputs semaine/année + icône calendrier. */
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
  render: (args: WeekPickerProps) => {
    const [week, setWeek] = useState(args.week ?? 28);
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field label="Semaine" isRequired>
        <WeekPicker {...args} week={week} year={year} onChange={(w, y) => { setWeek(w); setYear(y); }} />
      </Field>
    );
  },
};

/** WeekPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: (args: WeekPickerProps) => {
    const [week, setWeek] = useState(args.week ?? 28);
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field
        label="Semaine"
        message="La semaine est invalide"
        messageType="critical"
      >
        <WeekPicker {...args} week={week} year={year} onChange={(w, y) => { setWeek(w); setYear(y); }} isInvalid />
      </Field>
    );
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: WeekPickerProps) => {
    const [weekDef, setWeekDef] = useState(args.week ?? 28);
    const [yearDef, setYearDef] = useState(args.year ?? 2025);
    const [weekSub, setWeekSub] = useState(args.week ?? 28);
    const [yearSub, setYearSub] = useState(args.year ?? 2025);
    return (
      <div style={{ display: "flex", gap: 32 }}>
        <Field label="Default">
          <WeekPicker {...args} week={weekDef} year={yearDef} onChange={(w, y) => { setWeekDef(w); setYearDef(y); }} />
        </Field>
        <Field label="Subtle">
          <WeekPicker {...args} week={weekSub} year={yearSub} onChange={(w, y) => { setWeekSub(w); setYearSub(y); }} appearance="subtle" />
        </Field>
      </div>
    );
  },
};
