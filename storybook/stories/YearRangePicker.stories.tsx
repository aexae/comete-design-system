// YearRangePicker — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { YearRangePicker, Field } from "@naxit/comete-design-system/components";
import type { YearRangePickerProps } from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/YearRangePicker",
  component: YearRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4253:12831"),
    },
  },
  argTypes: {
    startYear: {
      control: { type: "number" },
      description: "Année de début",
    },
    endYear: {
      control: { type: "number" },
      description: "Année de fin",
    },
    calendars: {
      control: { type: "inline-radio" },
      options: [1, 2],
      description: "Nombre de calendriers dans les popovers",
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
} satisfies Meta<typeof YearRangePicker>;

export default meta;
type Story = StoryObj<typeof YearRangePicker>;

// -----------------------------------------------------------------------
// Render helper — contrôlé via useState

function ControlledRender(args: YearRangePickerProps) {
  const currentYear = new Date().getFullYear();
  const [start, setStart] = useState(args.startYear ?? currentYear);
  const [end, setEnd] = useState(args.endYear ?? currentYear);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      <YearRangePicker
        {...args}
        startYear={start}
        endYear={end}
        onChange={(s, e) => {
          setStart(s);
          setEnd(e);
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-subtlest)",
        }}
      >
        Sélection : {start} → {end}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Mode navigation (défaut) — boutons année + icône calendrier. */
export const Default: Story = {
  render: ControlledRender,
  parameters: {
    design: { type: "figma", url: figmaUrl("4254:23633") },
  },
};

/** Mode navigation — boutons année cliquables. */
export const NonEditable: Story = {
  render: ControlledRender,
  args: {
    startYear: 2023,
    endYear: 2025,
    isEditable: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4254:23633") },
  },
};

/** YearRangePicker subtle. */
export const Subtle: Story = {
  render: ControlledRender,
  args: {
    startYear: 2023,
    endYear: 2025,
    appearance: "subtle",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4254:23633") },
  },
};

/** YearRangePicker invalid. */
export const Invalid: Story = {
  render: ControlledRender,
  args: {
    startYear: 2023,
    endYear: 2025,
    isInvalid: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4254:23633") },
  },
};

/** État désactivé. */
export const Disabled: Story = {
  render: ControlledRender,
  args: {
    startYear: 2025,
    endYear: 2026,
    isDisabled: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4254:24045") },
  },
};

/** YearRangePicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args: YearRangePickerProps) => {
    const [start, setStart] = useState(args.startYear ?? 2023);
    const [end, setEnd] = useState(args.endYear ?? 2025);
    return (
      <Field label="Période" isRequired>
        <YearRangePicker {...args} startYear={start} endYear={end} onChange={(s, e) => { setStart(s); setEnd(e); }} />
      </Field>
    );
  },
};

/** YearRangePicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: (args: YearRangePickerProps) => {
    const [start, setStart] = useState(args.startYear ?? 2023);
    const [end, setEnd] = useState(args.endYear ?? 2025);
    return (
      <Field
        label="Période"
        message="La période est invalide"
        messageType="critical"
      >
        <YearRangePicker {...args} startYear={start} endYear={end} onChange={(s, e) => { setStart(s); setEnd(e); }} isInvalid />
      </Field>
    );
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: YearRangePickerProps) => {
    const [startDef, setStartDef] = useState(args.startYear ?? 2023);
    const [endDef, setEndDef] = useState(args.endYear ?? 2025);
    const [startSub, setStartSub] = useState(args.startYear ?? 2023);
    const [endSub, setEndSub] = useState(args.endYear ?? 2025);
    return (
      <div style={{ display: "flex", gap: 32 }}>
        <Field label="Default">
          <YearRangePicker {...args} startYear={startDef} endYear={endDef} onChange={(s, e) => { setStartDef(s); setEndDef(e); }} />
        </Field>
        <Field label="Subtle">
          <YearRangePicker {...args} startYear={startSub} endYear={endSub} onChange={(s, e) => { setStartSub(s); setEndSub(e); }} appearance="subtle" />
        </Field>
      </div>
    );
  },
};
