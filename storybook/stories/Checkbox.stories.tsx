// Checkbox — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@aexae/comete-design-system/components";
import { expect, fn, userEvent, within } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: <Checkbox label="J'accepte les conditions" />,
                caption:
                  "Option indépendante à cocher, validée avec le formulaire.",
              }}
              dontExample={{
                example: (
                  <Checkbox label="Activer les notifications" defaultChecked />
                ),
                caption: "Ne pas utiliser pour un réglage on/off à effet immédiat.",
              }}
              when={[
                "Activer/désactiver une option indépendante (accepter des CGU, un réglage isolé).",
                "Représenter un état partiel avec `isIndeterminate` (case « tout sélectionner » d'une liste).",
                "Sélectionner un ou plusieurs items dans une liste (ex. sélection de lignes).",
              ]}
              avoid={[
                "Un réglage à effet immédiat sans validation → Switch.",
                "Un choix exclusif parmi plusieurs options → Radio/RadioGroup.",
                "Plusieurs cases liées → les regrouper dans un CheckboxGroup.",
              ]}
              best={[
                "Toujours un label explicite (ou `aria-label` si visuellement absent) ; `description` pour préciser.",
                "`isInvalid` + message pour l'erreur ; `isRequired` pour les cases obligatoires.",
              ]}
              accessibility={[
                "Toujours un `label` (ou `aria-label`) ; ne pas signaler l'erreur uniquement par la couleur.",
                "L'état coché / indéterminé doit être annoncé aux lecteurs d'écran.",
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
    label: { control: "text" },
    description: { control: "text" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
    isChecked: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    label: "Label",
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

// -----------------------------------------------------------------------
// Stories

/** Checkbox par défaut (unchecked). */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("11:310") } },
};

/** Checkbox coché. */
export const Checked: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("11:312") } },
  args: { defaultChecked: true },
};

/** Checkbox indéterminé. */
export const Indeterminate: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("12:735") } },
  args: { isIndeterminate: true },
};

/** Checkbox invalide (unchecked). */
export const Invalid: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("2960:1048") } },
  args: { isInvalid: true },
};

/** Checkbox invalide coché. */
export const InvalidChecked: Story = {
  name: "Invalid checked",
  parameters: { design: { type: "figma", url: figmaUrl("2960:1142") } },
  args: { isInvalid: true, defaultChecked: true },
};

/** Checkbox désactivé. */
export const Disabled: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("12:740") } },
  args: { isDisabled: true },
};

/** Checkbox désactivé coché. */
export const DisabledChecked: Story = {
  name: "Disabled checked",
  parameters: { design: { type: "figma", url: figmaUrl("12:742") } },
  args: { isDisabled: true, defaultChecked: true },
};

/** Avec description. */
export const WithDescription: Story = {
  name: "With description",
  args: { label: "Label", description: "Description d'aide" },
};

/** Avec required. */
export const Required: Story = {
  args: { label: "Label", isRequired: true },
};

// -----------------------------------------------------------------------
// Play functions — tests d'interaction

/** Vérifie que onChange est appelé au clic. */
export const ClickInteraction: Story = {
  name: "Click interaction",
  args: { label: "Click me", onChange: fn() },
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (isSelected: boolean) => void };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};

/** Vérifie que le checkbox disabled ne réagit pas. */
export const DisabledInteraction: Story = {
  name: "Disabled interaction",
  args: { label: "Disabled", isDisabled: true, onChange: fn() },
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (isSelected: boolean) => void };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Vérifie la navigation clavier (Space). */
export const KeyboardNavigation: Story = {
  name: "Keyboard navigation",
  args: { label: "Keyboard", onChange: fn() },
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (isSelected: boolean) => void };
  }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};

// -----------------------------------------------------------------------

/** Toutes les combinaisons. */
export const AllStates: Story = {
  name: "All states",
  parameters: { design: { type: "figma", url: figmaUrl("11:309") } },
  render: () => {
    const states = [
      { label: "Unchecked" },
      { label: "Checked", defaultChecked: true },
      { label: "Indeterminate", isIndeterminate: true },
      { label: "Invalid", isInvalid: true },
      { label: "Invalid checked", isInvalid: true, defaultChecked: true },
      { label: "Invalid indeterminate", isInvalid: true, isIndeterminate: true },
      { label: "Disabled", isDisabled: true },
      { label: "Disabled checked", isDisabled: true, defaultChecked: true },
      { label: "Disabled indeterminate", isDisabled: true, isIndeterminate: true },
      { label: "Required", isRequired: true },
      { label: "With description", description: "Helper text" },
    ] as const;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {states.map((props) => (
          <Checkbox key={props.label} {...props} />
        ))}
      </div>
    );
  },
};
