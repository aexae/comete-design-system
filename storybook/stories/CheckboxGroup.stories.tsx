// CheckboxGroup — stories Storybook
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, CheckboxGroup } from "@aexae/comete-design-system/components";
import { fn } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <CheckboxGroup aria-label="Notifications">
                    <Checkbox value="email" label="E-mails" />
                    <Checkbox value="sms" label="SMS" />
                    <Checkbox value="push" label="Push" />
                  </CheckboxGroup>
                ),
                caption:
                  "Plusieurs options non exclusives, validées avec le formulaire.",
              }}
              dontExample={{
                example: (
                  <CheckboxGroup aria-label="Accepter">
                    <Checkbox value="yes" label="Oui" />
                    <Checkbox value="no" label="Non" />
                  </CheckboxGroup>
                ),
                caption: "Ne pas utiliser pour un choix mutuellement exclusif.",
              }}
              when={[
                "Choisir plusieurs options non exclusives dans un formulaire (préférences, filtres soumis).",
                "Quand la sélection est validée avec le reste du formulaire.",
              ]}
              avoid={[
                "Un seul choix exclusif → RadioGroup.",
                "Une case unique isolée → Checkbox.",
                "Un filtrage instantané à choix multiples visible en permanence → ToggleButtonGroup (multiple).",
              ]}
              best={[
                "Fournir un label de groupe (`aria-label` ou label visible) ; `isRequired`/`isInvalid` au niveau du groupe.",
                "Ordonner les options logiquement (fréquence, alpha) ; éviter les listes très longues (préférer un multi-select).",
              ]}
              accessibility={[
                "Le groupe porte le label ; `isRequired`/`isInvalid` s'appliquent au groupe entier.",
                "Chaque case a un libellé explicite ; l'erreur n'est pas signalée que par la couleur.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("11:309") },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    "aria-label": "Préférences",
    onChange: fn(),
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

// -----------------------------------------------------------------------

/** Groupe par défaut. */
export const Default: Story = {
  render: (args) => (
    <CheckboxGroup {...args}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
      <Checkbox value="c" label="Option C" />
    </CheckboxGroup>
  ),
};

/** Avec sélection initiale. */
export const WithSelection: Story = {
  name: "With selection",
  render: (args) => (
    <CheckboxGroup {...args} defaultValue={["a", "c"]}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
      <Checkbox value="c" label="Option C" />
    </CheckboxGroup>
  ),
};

/** Groupe invalide. */
export const Invalid: Story = {
  render: (args) => (
    <CheckboxGroup {...args} isInvalid>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

/** Groupe désactivé. */
export const Disabled: Story = {
  render: (args) => (
    <CheckboxGroup {...args} isDisabled defaultValue={["a"]}>
      <Checkbox value="a" label="Option A" />
      <Checkbox value="b" label="Option B" />
    </CheckboxGroup>
  ),
};

/** Sélection contrôlée. */
function ControlledDemo() {
  const [value, setValue] = useState<string[]>(["a"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CheckboxGroup aria-label="Préférences" value={value} onChange={setValue}>
        <Checkbox value="a" label="Option A" />
        <Checkbox value="b" label="Option B" />
        <Checkbox value="c" label="Option C" />
      </CheckboxGroup>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-subtle)" }}>
        Sélection : {value.length > 0 ? value.join(", ") : "aucune"}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  parameters: { controls: { disable: true } },
};
