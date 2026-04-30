// YearPicker — stories Storybook
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { YearPicker, Field } from "@naxit/comete-design-system/components";
import type {
  YearPickerProps,
  SingleYearPickerProps,
  RangeYearPickerProps,
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
  title: "Components/YearPicker",
  component: YearPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: figmaUrl("3370:6833"),
    },
  },
  argTypes: {
    isRange: {
      control: "boolean",
      description: "Mode plage (start/end) au lieu d'une année unique",
    },
    year: {
      control: { type: "number" },
      description: "Année sélectionnée — mode single",
      if: { arg: "isRange", truthy: false },
    },
    startYear: {
      control: { type: "number" },
      description: "Année de début — mode range",
      if: { arg: "isRange", truthy: true },
    },
    endYear: {
      control: { type: "number" },
      description: "Année de fin — mode range",
      if: { arg: "isRange", truthy: true },
    },
    isEditable: {
      control: "boolean",
      description: "Mode saisie (input + icône calendrier)",
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
} satisfies Meta<typeof YearPicker>;

export default meta;
type Story = StoryObj<typeof YearPicker>;

// -----------------------------------------------------------------------
// Render helpers

/** Sous-composant : hooks isolés pour le mode single. */
function SingleRender({ args }: { args: SingleYearPickerProps }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | undefined>(args.year ?? currentYear);
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
      <YearPicker
        {...args}
        isRange={false}
        year={year}
        onChange={setYear}
      />
      <p
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          color: "var(--text-subtlest)",
        }}
      >
        Sélection : {year}
      </p>
    </div>
  );
}

/** Sous-composant : hooks isolés pour le mode range. */
function RangeRender({ args }: { args: RangeYearPickerProps }) {
  const [startYear, setStartYear] = useState<number | undefined>(args.startYear ?? 2023);
  const [endYear, setEndYear] = useState<number | undefined>(args.endYear ?? 2025);
  useEffect(() => {
    if (args.startYear !== undefined) setStartYear(args.startYear);
  }, [args.startYear]);
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
      <YearPicker
        {...args}
        isRange
        startYear={startYear}
        endYear={endYear}
        onChange={(sy, ey) => {
          setStartYear(sy);
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
        Sélection : {startYear} → {endYear}
      </p>
    </div>
  );
}

/** Dispatcher — switch single/range selon `args.isRange`. */
function ControlledRender(args: YearPickerProps) {
  if (args.isRange) {
    return <RangeRender args={args} />;
  }
  return <SingleRender args={args} />;
}

// -----------------------------------------------------------------------
// Stories

/** Mode saisie (défaut) — input année + icône calendrier. */
export const Default: Story = {
  render: ControlledRender,
  parameters: {
    design: { type: "figma", url: figmaUrl("3370:6839") },
  },
};

/** Mode navigation — chevrons ←/→ + bouton année. */
export const NonEditable: Story = {
  render: ControlledRender,
  args: {
    year: 2025,
    isEditable: false,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3370:6839") },
  },
};

/** YearPicker subtle. */
export const Subtle: Story = {
  render: ControlledRender,
  args: {
    year: 2025,
    appearance: "subtle",
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3370:6839") },
  },
};

/** YearPicker invalid. */
export const Invalid: Story = {
  render: ControlledRender,
  args: {
    year: 2025,
    isInvalid: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3370:6839") },
  },
};

/** État désactivé. */
export const Disabled: Story = {
  render: ControlledRender,
  args: {
    year: 2025,
    isDisabled: true,
  },
  parameters: {
    design: { type: "figma", url: figmaUrl("3513:37040") },
  },
};

/** YearPicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args: YearPickerProps) => (
    <Field label="Année" isRequired>
      <ControlledRender {...args} />
    </Field>
  ),
};

/** YearPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  args: { isInvalid: true },
  render: (args: YearPickerProps) => (
    <Field label="Année" message="L'année est invalide" messageType="critical">
      <ControlledRender {...args} />
    </Field>
  ),
};

/** Mode plage (range) — "2023 → 2025" + icône calendrier. */
export const Range: Story = {
  render: ControlledRender,
  args: {
    isRange: true,
    startYear: 2023,
    endYear: 2025,
  } as never,
  parameters: {
    design: { type: "figma", url: figmaUrl("4253:12831") },
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: YearPickerProps) => (
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
