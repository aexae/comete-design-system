// Radio — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "@naxit/comete-design-system/components";
import { expect, fn, userEvent, within } from "storybook/test";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3704:73901") },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    "aria-label": "Choix",
    onChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// -----------------------------------------------------------------------
// Stories — état par état (miroir du Checkbox)

/** Radio par défaut (unselected). */
export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

/** Radio sélectionné. */
export const Selected: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Radio invalide. */
export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args} isInvalid>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Radio invalide sélectionné. */
export const InvalidSelected: Story = {
  name: "Invalid selected",
  render: (args) => (
    <RadioGroup {...args} isInvalid defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Groupe désactivé. */
export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args} isDisabled>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Groupe désactivé avec sélection. */
export const DisabledSelected: Story = {
  name: "Disabled selected",
  render: (args) => (
    <RadioGroup {...args} isDisabled defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
};

/** Avec description. */
export const WithDescription: Story = {
  name: "With description",
  render: (args) => (
    <RadioGroup {...args} defaultValue="monthly">
      <Radio value="monthly" label="Mensuel" description="Facturé chaque mois" />
      <Radio value="yearly" label="Annuel" description="Facturé une fois par an (–20 %)" />
    </RadioGroup>
  ),
};

/** Option individuelle désactivée. */
export const IndividualDisabled: Story = {
  name: "Individual disabled",
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" isDisabled />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
};

// -----------------------------------------------------------------------
// Play functions — tests d'interaction

/** Vérifie que onChange est appelé au clic. */
export const ClickInteraction: Story = {
  name: "Click interaction",
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (value: string) => void };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("radio")[1]);
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};

/** Vérifie que le groupe disabled ne réagit pas. */
export const DisabledInteraction: Story = {
  name: "Disabled interaction",
  args: { isDisabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (value: string) => void };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("radio")[0]);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Vérifie la navigation clavier (ArrowDown). */
export const KeyboardNavigation: Story = {
  name: "Keyboard navigation",
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
  play: async ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: { onChange?: (value: string) => void };
  }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    radios[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

/** Focus visible — le FocusRing s'affiche via Tab. */
export const FocusVisible: Story = {
  name: "Focus visible",
  render: (args) => (
    <RadioGroup {...args} defaultValue="a">
      <Radio value="a" label="Focused (selected)" />
      <Radio value="b" label="Option B" />
    </RadioGroup>
  ),
  play: ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    radios[0].focus();
  },
};

// -----------------------------------------------------------------------

/** Toutes les combinaisons. */
export const AllStates: Story = {
  name: "All states",
  parameters: { design: { type: "figma", url: figmaUrl("3704:73886") } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <RadioGroup aria-label="Default" defaultValue="a">
        <Radio value="a" label="Selected" />
        <Radio value="b" label="Unselected" />
      </RadioGroup>

      <RadioGroup aria-label="Invalid" isInvalid defaultValue="a">
        <Radio value="a" label="Invalid selected" />
        <Radio value="b" label="Invalid unselected" />
      </RadioGroup>

      <RadioGroup aria-label="Disabled" isDisabled defaultValue="a">
        <Radio value="a" label="Disabled selected" />
        <Radio value="b" label="Disabled unselected" />
      </RadioGroup>

      <RadioGroup aria-label="Description" defaultValue="a">
        <Radio value="a" label="With description" description="Helper text" />
      </RadioGroup>
    </div>
  ),
};
