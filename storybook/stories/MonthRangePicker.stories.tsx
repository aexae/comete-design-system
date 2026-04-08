// MonthRangePicker — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonthRangePicker, Field } from "@naxit/comete-design-system/components";
import type { MonthRangePickerProps } from "@naxit/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/MonthRangePicker",
  component: MonthRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("4189:17716"),
    },
  },
  argTypes: {
    startMonth: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois de début (1-12)",
    },
    startYear: {
      control: { type: "number" },
      description: "Année de début",
    },
    endMonth: {
      control: { type: "number", min: 1, max: 12 },
      description: "Mois de fin (1-12)",
    },
    endYear: {
      control: { type: "number" },
      description: "Année de fin",
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
} satisfies Meta<typeof MonthRangePicker>;

export default meta;
type Story = StoryObj<typeof MonthRangePicker>;

// -----------------------------------------------------------------------
// Render helper — contrôlé via useState

function ControlledRender(args: MonthRangePickerProps) {
  const now = new Date();
  const [sm, setSm] = useState(args.startMonth ?? 8);
  const [sy, setSy] = useState(args.startYear ?? now.getFullYear());
  const [em, setEm] = useState(args.endMonth ?? 11);
  const [ey, setEy] = useState(args.endYear ?? now.getFullYear());

  const fmt = (m: number, y: number) =>
    `${String(m).padStart(2, "0")}/${y}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      <MonthRangePicker
        {...args}
        startMonth={sm}
        startYear={sy}
        endMonth={em}
        endYear={ey}
        onChange={(nsm, nsy, nem, ney) => {
          setSm(nsm);
          setSy(nsy);
          setEm(nem);
          setEy(ney);
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-subtlest)",
        }}
      >
        Sélection : {fmt(sm, sy)} → {fmt(em, ey)}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Mode par défaut — champs texte éditables + calendrier. */
export const Default: Story = {
  render: ControlledRender,
  args: {
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4189:25887") },
  },
};

/** Mode navigation — boutons mois cliquables. */
export const NonEditable: Story = {
  render: ControlledRender,
  args: {
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
    isEditable: false,
  },
};

/** MonthRangePicker subtle. */
export const Subtle: Story = {
  render: ControlledRender,
  args: {
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
    appearance: "subtle",
  },
};

/** MonthRangePicker invalid. */
export const Invalid: Story = {
  render: ControlledRender,
  args: {
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
    isInvalid: true,
  },
};

/** État désactivé. */
export const Disabled: Story = {
  render: ControlledRender,
  args: {
    startMonth: 8,
    startYear: 2025,
    endMonth: 11,
    endYear: 2025,
    isDisabled: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("4189:26190") },
  },
};

/** MonthRangePicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args: MonthRangePickerProps) => {
    const [sm, setSm] = useState(args.startMonth ?? 8);
    const [sy, setSy] = useState(args.startYear ?? 2025);
    const [em, setEm] = useState(args.endMonth ?? 11);
    const [ey, setEy] = useState(args.endYear ?? 2025);
    return (
      <Field label="Période" isRequired>
        <MonthRangePicker
          {...args}
          startMonth={sm}
          startYear={sy}
          endMonth={em}
          endYear={ey}
          onChange={(nsm, nsy, nem, ney) => {
            setSm(nsm);
            setSy(nsy);
            setEm(nem);
            setEy(ney);
          }}
        />
      </Field>
    );
  },
};

/** MonthRangePicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: (args: MonthRangePickerProps) => {
    const [sm, setSm] = useState(args.startMonth ?? 8);
    const [sy, setSy] = useState(args.startYear ?? 2025);
    const [em, setEm] = useState(args.endMonth ?? 11);
    const [ey, setEy] = useState(args.endYear ?? 2025);
    return (
      <Field
        label="Période"
        message="La période est invalide"
        messageType="critical"
      >
        <MonthRangePicker
          {...args}
          startMonth={sm}
          startYear={sy}
          endMonth={em}
          endYear={ey}
          onChange={(nsm, nsy, nem, ney) => {
            setSm(nsm);
            setSy(nsy);
            setEm(nem);
            setEy(ney);
          }}
          isInvalid
        />
      </Field>
    );
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: MonthRangePickerProps) => {
    const [sm1, setSm1] = useState(args.startMonth ?? 8);
    const [sy1, setSy1] = useState(args.startYear ?? 2025);
    const [em1, setEm1] = useState(args.endMonth ?? 11);
    const [ey1, setEy1] = useState(args.endYear ?? 2025);
    const [sm2, setSm2] = useState(args.startMonth ?? 8);
    const [sy2, setSy2] = useState(args.startYear ?? 2025);
    const [em2, setEm2] = useState(args.endMonth ?? 11);
    const [ey2, setEy2] = useState(args.endYear ?? 2025);
    return (
      <div style={{ display: "flex", gap: 32 }}>
        <Field label="Default">
          <MonthRangePicker
            {...args}
            startMonth={sm1}
            startYear={sy1}
            endMonth={em1}
            endYear={ey1}
            onChange={(nsm, nsy, nem, ney) => {
              setSm1(nsm);
              setSy1(nsy);
              setEm1(nem);
              setEy1(ney);
            }}
          />
        </Field>
        <Field label="Subtle">
          <MonthRangePicker
            {...args}
            startMonth={sm2}
            startYear={sy2}
            endMonth={em2}
            endYear={ey2}
            onChange={(nsm, nsy, nem, ney) => {
              setSm2(nsm);
              setSy2(nsy);
              setEm2(nem);
              setEy2(ney);
            }}
            appearance="subtle"
          />
        </Field>
      </div>
    );
  },
};
