// TimePicker — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  TimePicker,
  type TimePickerAppearance,
} from "@naxit/comete-design-system/components";
import { Time } from "@internationalized/date";
import { fn } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("6284:794") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "subtle"] satisfies TimePickerAppearance[],
    },
    isCompact: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    hourCycle: {
      control: "select",
      options: [12, 24],
      description: "Format 12h (AM/PM) ou 24h",
    },
    showSeconds: { control: "boolean" },
    isEditable: { control: "boolean" },
  },
  args: {
    "aria-label": "Heure",
    onChange: fn(),
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof TimePicker>;

// -----------------------------------------------------------------------
// Stories

/** TimePicker par défaut (24h). */
export const Default: Story = {};

/** Avec une valeur par défaut. */
export const WithValue: Story = {
  name: "With value",
  args: { defaultValue: new Time(14, 30) },
};

/** Format 12h avec AM/PM. */
export const HourCycle12: Story = {
  name: "12h format",
  args: { hourCycle: 12, defaultValue: new Time(14, 30) },
};

/** Avec les secondes. */
export const WithSeconds: Story = {
  name: "With seconds",
  args: { showSeconds: true, defaultValue: new Time(14, 30, 45) },
};

/** Apparence subtle. */
export const Subtle: Story = {
  args: { appearance: "subtle" },
};

/** Compact. */
export const Compact: Story = {
  args: { isCompact: true, defaultValue: new Time(9, 0) },
};

/** Invalid. */
export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: new Time(9, 0) },
};

/** Mode non-editable — heure formatée + bouton horloge popover. */
export const NonEditable: Story = {
  args: { isEditable: false, defaultValue: new Time(14, 30) },
};

/** Disabled. */
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: new Time(9, 0) },
};

/** Dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: () => (
    <div style={{ width: 200 }}>
      <Field label="Heure de début" isRequired>
        <TimePicker aria-label="Heure de début" defaultValue={new Time(9, 0)} />
      </Field>
    </div>
  ),
};

/** Field avec erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  render: () => (
    <div style={{ width: 200 }}>
      <Field
        label="Heure de fin"
        message="L'heure est invalide"
        messageType="critical"
      >
        <TimePicker aria-label="Heure de fin" isInvalid defaultValue={new Time(18, 0)} />
      </Field>
    </div>
  ),
};

/** Toutes les apparences × états. */
export const AllStates: Story = {
  name: "All states",
  render: () => {
    const appearances: TimePickerAppearance[] = ["default", "subtle"];
    const col = { width: 180 };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {appearances.map((a) => (
          <div key={a} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-subtlest)",
              }}
            >
              appearance={a}
            </span>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={col}>
                <Field label="Default">
                  <TimePicker aria-label="Default" appearance={a} />
                </Field>
              </div>
              <div style={col}>
                <Field label="With value">
                  <TimePicker aria-label="With value" appearance={a} defaultValue={new Time(14, 30)} />
                </Field>
              </div>
              <div style={col}>
                <Field label="Invalid" message="Erreur" messageType="critical">
                  <TimePicker aria-label="Invalid" appearance={a} defaultValue={new Time(14, 30)} isInvalid />
                </Field>
              </div>
              <div style={col}>
                <Field label="Disabled">
                  <TimePicker aria-label="Disabled" appearance={a} defaultValue={new Time(14, 30)} isDisabled />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
};
