// MonthPicker — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonthPicker, Field } from "@naxit/comete-design-system/components";
import type { MonthPickerProps } from "@naxit/comete-design-system/components";

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
    month: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois sélectionné (1-12)",
    },
    year: {
      control: { type: "number" },
      description: "Année sélectionnée",
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
// Render helper — contrôlé via useState

function ControlledRender(args: MonthPickerProps) {
  const now = new Date();
  const [month, setMonth] = useState(args.month ?? now.getMonth() + 1);
  const [year, setYear] = useState(args.year ?? now.getFullYear());
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
  render: (args: MonthPickerProps) => {
    const [month, setMonth] = useState(args.month ?? 6);
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field label="Mois" isRequired>
        <MonthPicker {...args} month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </Field>
    );
  },
};

/** MonthPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: (args: MonthPickerProps) => {
    const [month, setMonth] = useState(args.month ?? 6);
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field
        label="Mois"
        message="Le mois est invalide"
        messageType="critical"
      >
        <MonthPicker {...args} month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} isInvalid />
      </Field>
    );
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: MonthPickerProps) => {
    const [monthDef, setMonthDef] = useState(args.month ?? 6);
    const [yearDef, setYearDef] = useState(args.year ?? 2025);
    const [monthSub, setMonthSub] = useState(args.month ?? 6);
    const [yearSub, setYearSub] = useState(args.year ?? 2025);
    return (
      <div style={{ display: "flex", gap: 32 }}>
        <Field label="Default">
          <MonthPicker {...args} month={monthDef} year={yearDef} onChange={(m, y) => { setMonthDef(m); setYearDef(y); }} />
        </Field>
        <Field label="Subtle">
          <MonthPicker {...args} month={monthSub} year={yearSub} onChange={(m, y) => { setMonthSub(m); setYearSub(y); }} appearance="subtle" />
        </Field>
      </div>
    );
  },
};
