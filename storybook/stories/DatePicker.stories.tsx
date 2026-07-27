// DatePicker — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DatePicker,
  Field,
  type DatePickerAppearance,
} from "@aexae/comete-design-system/components";
import { today, getLocalTimeZone } from "@internationalized/date";
import { fn } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Saisir ou choisir une date (ou une plage avec isRange) via un champ + calendrier.",
                "isEditable pour la saisie clavier segmentée ; idéal dans un formulaire.",
                "Formulaires nécessitant une date précise avec validation (réservation, échéance, naissance).",
              ]}
              avoid={[
                "Choisir un mois/semaine/année entier → MonthPicker/WeekPicker/YearPicker.",
                "Une heure → TimePicker.",
                "Afficher un calendrier permanent sans champ → Calendar.",
              ]}
              best={[
                "Toujours un label (via Field) ; fournir min/max et un défaut pertinent.",
                "isRange pour les plages ; messages d'erreur clairs sur les dates invalides.",
                "Accompagner d'une `description` indiquant le format attendu si nécessaire.",
              ]}
              accessibility={[
                "Champ segmenté navigable au clavier ; label associé obligatoire.",
                "Erreurs de date annoncées ; bornes min/max communiquées.",
                "Les segments du champ sont navigables individuellement au clavier (flèches haut/bas).",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3240:13513") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "subtle"] satisfies DatePickerAppearance[],
    },
    isEditable: {
      control: "boolean",
      description: "Mode saisie (champ segmenté + icône calendrier)",
    },
    isRange: {
      control: "boolean",
      description: "Sélection de plage (deux dates start/end)",
    },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    "aria-label": "Date",
    onChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof DatePicker>;

// -----------------------------------------------------------------------
// Stories

/** DatePicker par défaut. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3246:2714") } },
};

/** DatePicker avec valeur par défaut. */
export const WithValue: Story = {
  name: "With value",
  parameters: { design: { type: "figma", url: figmaUrl("3321:12548") } },
  args: { defaultValue: today(getLocalTimeZone()) },
};

/** DatePicker subtle. */
export const Subtle: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3564:137030") } },
  args: { appearance: "subtle" },
};

/** DatePicker invalid. */
export const Invalid: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3359:1568") } },
  args: { isInvalid: true, defaultValue: today(getLocalTimeZone()) },
};

/** DatePicker disabled. */
export const Disabled: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3359:1328") } },
  args: { isDisabled: true, defaultValue: today(getLocalTimeZone()) },
};

/** DatePicker dans un Field avec label. */
export const WithField: Story = {
  name: "With Field wrapper",
  render: (args) => (
    <div style={{ width: 320 }}>
      <Field label="Date de début" isRequired>
        <DatePicker {...args} aria-label="Date de début" />
      </Field>
    </div>
  ),
};

/** DatePicker avec message d'erreur. */
export const FieldInvalid: Story = {
  name: "Field invalid",
  args: { isInvalid: true, defaultValue: today(getLocalTimeZone()) },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Field
        label="Date de fin"
        message="La date est invalide"
        messageType="critical"
      >
        <DatePicker {...(args as Record<string, unknown>)} isRange={false} aria-label="Date de fin" defaultValue={today(getLocalTimeZone())} />
      </Field>
    </div>
  ),
};

/** Mode navigation — chevrons ←/→ + bouton date formatée. */
export const NonEditable: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3246:2714") } },
  args: { isEditable: false, defaultValue: today(getLocalTimeZone()) },
};

/** Mode plage saisie — deux DateInput (start / end) séparés par un tiret. */
export const Range: Story = {
  args: {
    isRange: true,
    defaultValue: {
      start: today(getLocalTimeZone()),
      end: today(getLocalTimeZone()).add({ days: 4 }),
    },
  } as never,
};

/** Toutes les apparences. */
export const AllAppearances: Story = {
  name: "All appearances",
  render: (args) => (
    <div style={{ display: "flex", gap: 32 }}>
      <div style={{ width: 280 }}>
        <Field label="Default">
          <DatePicker {...(args as Record<string, unknown>)} isRange={false} aria-label="Default" defaultValue={today(getLocalTimeZone())} />
        </Field>
      </div>
      <div style={{ width: 280 }}>
        <Field label="Subtle">
          <DatePicker
            {...(args as Record<string, unknown>)}
            isRange={false}
            aria-label="Subtle"
            appearance="subtle"
            defaultValue={today(getLocalTimeZone())}
          />
        </Field>
      </div>
    </div>
  ),
};
