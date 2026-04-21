import { Button } from "@naxit/comete-design-system";
import type { ButtonProps } from "@naxit/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

// ----------------------------------------------------------------------
// Figma design URLs — public file, addon-designs embeds

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";

/** Builds a Figma URL with a specific node ID for the addon-designs panel */
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// ----------------------------------------------------------------------

const meta: Meta<ButtonProps> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    appearance: {
      control: "select",
      options: ["contained", "outlined", "subtle", "link", "link-subtle"],
    },
    color: {
      control: "select",
      options: ["default", "brand", "success", "critical", "warning", "information"],
    },
    spacing: {
      control: "select",
      options: ["default", "compact", "none"],
    },
    isDisabled: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
    isSelected: {
      control: "boolean",
    },
    iconBefore: {
      control: "select",
      options: ["none", "Image", "Lock", "Download", "Check"],
      description: "Icon before the label",
      table: { category: "Icons" },
    },
    iconAfter: {
      control: "select",
      options: ["none", "ChevronRight", "ArrowDropDown", "Image"],
      description: "Icon after the label",
      table: { category: "Icons" },
    },
  },
  args: {
    children: "Button",
    appearance: "contained",
    color: "default",
    spacing: "default",
    onPress: fn(),
  },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("213:725"),
    },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

// ----------------------------------------------------------------------

export const Default: Story = {
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("12:508"),
    },
  },
};

export const Brand: Story = {
  args: { color: "brand", children: "Enregistrer" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1981:18041"),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    void expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const Success: Story = {
  args: { color: "success", children: "Valider" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8737"),
    },
  },
};

export const Critical: Story = {
  args: { color: "critical", children: "Supprimer" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2420:45925"),
    },
  },
};

export const Warning: Story = {
  args: { color: "warning", children: "Attention" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2420:43580"),
    },
  },
};

export const Information: Story = {
  args: { color: "information", children: "En savoir plus" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2420:46791"),
    },
  },
};

// ----------------------------------------------------------------------

export const Outlined: Story = {
  args: { appearance: "outlined", color: "brand", children: "Annuler" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2105:5778"),
    },
  },
};

export const Subtle: Story = {
  args: { appearance: "subtle", color: "brand", children: "Voir plus" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8972"),
    },
  },
};

export const Link: Story = {
  args: { appearance: "link", color: "brand", children: "En savoir plus" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8388"),
    },
  },
};

export const LinkSubtle: Story = {
  args: { appearance: "link-subtle", color: "default", children: "Voir les détails" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8451"),
    },
  },
};

// ----------------------------------------------------------------------

export const Compact: Story = {
  args: { spacing: "compact", color: "brand", children: "Compact" },
};

export const None: Story = {
  args: { spacing: "none", appearance: "link-subtle", children: "None" },
};

// ----------------------------------------------------------------------

export const Disabled: Story = {
  args: { isDisabled: true, color: "brand", children: "Désactivé" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    void expect(args.onPress).not.toHaveBeenCalled();
    void expect(button).toBeDisabled();
  },
};

/** Bouton en état sélectionné — style visuel persistant (ex : toggle actif) */
export const Selected: Story = {
  args: { isSelected: true, color: "brand", children: "Sélectionné" },
};

// ----------------------------------------------------------------------

/** Vérifie la navigation clavier : Tab pour focus, Enter pour déclencher onPress */
export const KeyboardNavigation: Story = {
  args: { color: "brand", children: "Action clavier" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.tab();
    void expect(button).toHaveFocus();
    void expect(button).toHaveAttribute("data-focus-visible");
    await userEvent.keyboard("{Enter}");
    void expect(args.onPress).toHaveBeenCalledOnce();
  },
};

// ----------------------------------------------------------------------

/** Icône avant le label */
export const WithIconBefore: Story = {
  args: {
    color: "brand",
    children: "Enregistrer",
    iconBefore: "Lock",
  },
};

/** Icône après le label */
export const WithIconAfter: Story = {
  args: {
    color: "brand",
    children: "Continuer",
    iconAfter: "ChevronRight",
  },
};

/** Icône + label sur toutes les couleurs contained */
export const IconAllColors: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {(
        [
          "default",
          "brand",
          "success",
          "critical",
          "warning",
          "information",
        ] as const
      ).map((color) => (
        <Button
          key={color}
          color={color}
          appearance={args.appearance}
          iconBefore="Image"
        >
          {color}
        </Button>
      ))}
    </div>
  ),
};

// ----------------------------------------------------------------------

/** Bouton icon-only (sans label) */
export const IconOnly: Story = {
  name: "Icon only",
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button iconBefore="Image" color="default" spacing="compact" />
      <Button iconBefore="Lock" color="brand" />
      <Button iconBefore="Check" color="success" appearance="outlined" />
      <Button iconBefore="Image" color="critical" appearance="subtle" />
    </div>
  ),
};

/** Bouton en état loading (spinner remplace le contenu) */
export const Loading: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button color="default" isLoading>Default</Button>
      <Button color="brand" isLoading>Brand</Button>
      <Button color="success" isLoading>Success</Button>
      <Button appearance="outlined" color="brand" isLoading>Outlined</Button>
      <Button appearance="subtle" color="default" isLoading>Subtle</Button>
    </div>
  ),
};

// ----------------------------------------------------------------------

/** All contained color variants side by side */
export const AllColors: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button color="default" appearance={args.appearance}>Default</Button>
      <Button color="brand" appearance={args.appearance}>Brand</Button>
      <Button color="success" appearance={args.appearance}>Success</Button>
      <Button color="critical" appearance={args.appearance}>Critical</Button>
      <Button color="warning" appearance={args.appearance}>Warning</Button>
      <Button color="information" appearance={args.appearance}>Information</Button>
    </div>
  ),
};

/** All variants for the brand color */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button appearance="contained" color="default">Contained</Button>
      <Button appearance="outlined" color="default">Outlined</Button>
      <Button appearance="link" color="information">Link</Button>
      <Button appearance="subtle" color="default">Subtle</Button>
      <Button appearance="link-subtle" color="default">Link Subtle</Button>
    </div>
  ),
};

/**
 * Toutes les densités du bouton. Même contenu et même appearance pour
 * mettre en évidence la différence de hauteur/padding/icône.
 */
export const AllSpacings: Story = {
  name: "All spacings",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button spacing="default">Button</Button>
      <Button spacing="compact">Button</Button>
      <Button spacing="none">Button</Button>
    </div>
  ),
};
