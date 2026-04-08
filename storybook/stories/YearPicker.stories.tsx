// YearPicker — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { YearPicker, Field } from "@naxit/comete-design-system/components";
import type { YearPickerProps } from "@naxit/comete-design-system/components";

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
    year: {
      control: { type: "number" },
      description: "Année sélectionnée",
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
// Render helper — contrôlé via useState

function ControlledRender(args: YearPickerProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(args.year ?? currentYear);
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
        year={year}
        onChange={(y) => {
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
        Sélection : {year}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Mode navigation (défaut) — chevrons ←/→ + bouton année. */
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
  render: (args: YearPickerProps) => {
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field label="Année" isRequired>
        <YearPicker {...args} year={year} onChange={setYear} />
      </Field>
    );
  },
};

/** YearPicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: (args: YearPickerProps) => {
    const [year, setYear] = useState(args.year ?? 2025);
    return (
      <Field
        label="Année"
        message="L'année est invalide"
        messageType="critical"
      >
        <YearPicker {...args} year={year} onChange={setYear} isInvalid />
      </Field>
    );
  },
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args: YearPickerProps) => {
    const [yearDefault, setYearDefault] = useState(args.year ?? 2025);
    const [yearSubtle, setYearSubtle] = useState(args.year ?? 2025);
    return (
      <div style={{ display: "flex", gap: 32 }}>
        <Field label="Default">
          <YearPicker {...args} year={yearDefault} onChange={setYearDefault} />
        </Field>
        <Field label="Subtle">
          <YearPicker {...args} year={yearSubtle} onChange={setYearSubtle} appearance="subtle" />
        </Field>
      </div>
    );
  },
};
