// Select — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, Stack } from "@naxit/comete-design-system/components";
import type { SelectItems } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Data

const COUNTRIES: SelectItems = [
  { value: "fr", label: "France" },
  { value: "be", label: "Belgique" },
  { value: "ch", label: "Suisse" },
  { value: "lu", label: "Luxembourg" },
  { value: "mc", label: "Monaco" },
];

const GROUPED: SelectItems = [
  {
    label: "Europe",
    options: [
      { value: "fr", label: "France" },
      { value: "be", label: "Belgique" },
      { value: "ch", label: "Suisse" },
    ],
  },
  {
    label: "Amérique",
    options: [
      { value: "us", label: "États-Unis" },
      { value: "ca", label: "Canada" },
    ],
  },
];

const WITH_DISABLED: SelectItems = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B (disabled)", isDisabled: true },
  { value: "c", label: "Option C" },
];

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: figmaUrl("5436:4670") },
    docs: {
      description: {
        component:
          "Sélecteur déroulant accessible basé sur React Aria. Intègre Field (label + message) et InputContainer (bordure + états). Supporte les options plates ou groupées, clearable, loading et compact.",
      },
    },
  },
  argTypes: {
    appearance: {
      control: "inline-radio",
      options: ["default", "subtle"],
    },
    isCompact: { control: "boolean" },
    isClearable: { control: "boolean" },
    isLoading: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isRequired: { control: "boolean" },
    placeholder: { control: "text" },
    label: { control: "text" },
    message: { control: "text" },
    messageType: {
      control: "inline-radio",
      options: ["neutral", "critical", "success"],
    },
  },
  args: {
    items: COUNTRIES,
    label: "Pays",
    placeholder: "Sélectionner\u2026",
    appearance: "default",
    isCompact: false,
    isClearable: false,
    isLoading: false,
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "fr" },
};

export const Grouped: Story = {
  args: { items: GROUPED },
};

export const Clearable: Story = {
  args: { value: "fr", isClearable: true },
};

export const Compact: Story = {
  args: { isCompact: true },
};

export const Subtle: Story = {
  args: { appearance: "subtle" },
};

export const Disabled: Story = {
  args: { isDisabled: true, value: "fr" },
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    message: "Ce champ est requis",
    messageType: "critical" as const,
  },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const WithDisabledOptions: Story = {
  args: { items: WITH_DISABLED },
};

export const Empty: Story = {
  args: { items: [], emptyMessage: "Aucun résultat" },
};

export const AllAppearances: Story = {
  render: () => (
    <Stack gap="200">
      <Select items={COUNTRIES} label="Default" appearance="default" />
      <Select items={COUNTRIES} label="Subtle" appearance="subtle" />
    </Stack>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Stack gap="200">
      <Select items={COUNTRIES} label="Normal" />
      <Select items={COUNTRIES} label="Avec valeur" value="fr" />
      <Select items={COUNTRIES} label="Requis" isRequired />
      <Select items={COUNTRIES} label="Invalide" isInvalid message="Erreur" messageType="critical" />
      <Select items={COUNTRIES} label="Désactivé" isDisabled value="fr" />
      <Select items={COUNTRIES} label="Chargement" isLoading />
      <Select items={COUNTRIES} label="Clearable" value="fr" isClearable />
      <Select items={COUNTRIES} label="Compact" isCompact />
    </Stack>
  ),
};
