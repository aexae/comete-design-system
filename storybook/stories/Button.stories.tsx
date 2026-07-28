import { Button, DensityProvider } from "@aexae/comete-design-system";
import type { ButtonProps } from "@aexae/comete-design-system";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

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
      options: ["default", "subtle", "subtlest", "comete", "success", "critical", "warning", "information"],
    },
    density: {
      control: "select",
      options: ["compact", "default", "touch"],
      description: "Densité — hauteur/padding/radius (échelle partagée avec les champs).",
    },
    isInline: {
      control: "boolean",
      description:
        "Composition inline — supprime padding et hauteur minimale, pour un bouton lien inséré dans du texte. Ignore `density`.",
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
    density: "default",
    onPress: fn(),
  },
  parameters: {
    docs: {
      description: { component: "Les boutons déclenchent des actions ou des événements lorsque l'utilisateur interagit avec eux. Ils se déclinent en plusieurs variantes pour hiérarchiser les actions principales, secondaires et tertiaires." },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: <Button color="critical">Supprimer</Button>,
                caption:
                  "Couleur sémantique alignée sur l'action (`critical` pour une action destructrice).",
              }}
              dontExample={{
                example: <Button color="critical">Enregistrer</Button>,
                caption:
                  "Ne pas utiliser une couleur critique pour une action non destructrice.",
              }}
              when={[
                "Déclencher une action immédiate (soumettre, enregistrer, ouvrir une modale, lancer un traitement).",
                "Hiérarchiser les actions par apparence : `contained` pour l'action principale, `outlined`/`subtle` pour les secondaires.",
              ]}
              avoid={[
                "Naviguer entre des pages → Breadcrumbs ou SideNavItem.",
              ]}
              best={[
                "Regrouper des actions liées dans un ButtonGroup (action principale à droite).",
                "Densité alignée sur les champs voisins (`compact`/`default`/`touch`) ; `isLoading` pour désactiver + signaler un traitement.",
                "Réserver `color=\"critical\"` aux actions destructrices, avec confirmation si irréversible.",
              ]}
              accessibility={[
                "Libellé = verbe d'action explicite ; éviter les libellés vagues (« OK », « Oui »).",
                "`isLoading` / `isDisabled` doivent rester perceptibles au clavier et aux lecteurs d'écran.",
              ]}
            />
          }
        />
      ),
    },
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

export const Comete: Story = {
  args: { color: "comete", children: "Enregistrer" },
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
  args: { appearance: "outlined", color: "comete", children: "Annuler" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("2105:5778"),
    },
  },
};

export const Subtle: Story = {
  args: { appearance: "subtle", color: "comete", children: "Voir plus" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8972"),
    },
  },
};

export const Link: Story = {
  args: { appearance: "link", color: "comete", children: "En savoir plus" },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("1973:8388"),
    },
  },
};

/**
 * `isInline` — cas spécial de composition inline : padding nul et hauteur
 * minimale réduite, pour un bouton `link`/`link-subtle` inséré dans un paragraphe
 * sans générer d'espace disgracieux dans le texte.
 */
export const InlineLink: Story = {
  name: "Inline link (isInline)",
  render: () => (
    <p style={{ maxWidth: 420, lineHeight: 1.6 }}>
      Consultez notre{" "}
      <Button appearance="link" color="information" isInline>
        politique de confidentialité
      </Button>{" "}
      avant de continuer. Le bouton reste dans le fil du texte, sans padding superflu.
    </p>
  ),
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
  args: { density: "compact", color: "comete", children: "Compact" },
};

export const Inline: Story = {
  args: { isInline: true, appearance: "link-subtle", children: "Inline" },
};

// ----------------------------------------------------------------------

export const Disabled: Story = {
  args: { isDisabled: true, color: "comete", children: "Désactivé" },
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
  args: { isSelected: true, color: "comete", children: "Sélectionné" },
};

// ----------------------------------------------------------------------

/** Vérifie la navigation clavier : Tab pour focus, Enter pour déclencher onPress */
export const KeyboardNavigation: Story = {
  args: { color: "comete", children: "Action clavier" },
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
    color: "comete",
    children: "Enregistrer",
    iconBefore: "Lock",
  },
};

/** Icône après le label */
export const WithIconAfter: Story = {
  args: {
    color: "comete",
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
          "subtle",
          "subtlest",
          "comete",
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
      <Button iconBefore="Image" color="default" density="compact" />
      <Button iconBefore="Lock" color="comete" />
      <Button iconBefore="Check" color="success" appearance="outlined" />
      <Button iconBefore="Image" color="critical" appearance="subtle" />
    </div>
  ),
};

/** Bouton icon-only à chaque densité : toujours circulaire et parfaitement carré
 *  (width = height), quelle que soit la densité. */
export const IconOnlyAllDensities: Story = {
  name: "Icon only — All densities",
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
      {(["compact", "default", "touch"] as const).map((density) => (
        <div
          key={density}
          style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}
        >
          <Button iconBefore="Add" color="comete" density={density} />
          <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>{density}</span>
        </div>
      ))}
    </div>
  ),
};

/** Bouton en état loading (spinner remplace le contenu) */
export const Loading: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button color="default" isLoading>Default</Button>
      <Button color="comete" isLoading>Comete</Button>
      <Button color="success" isLoading>Success</Button>
      <Button appearance="outlined" color="comete" isLoading>Outlined</Button>
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
      <Button color="subtle" appearance={args.appearance}>Subtle</Button>
      <Button color="subtlest" appearance={args.appearance}>Subtlest</Button>
      <Button color="comete" appearance={args.appearance}>Comete</Button>
      <Button color="success" appearance={args.appearance}>Success</Button>
      <Button color="critical" appearance={args.appearance}>Critical</Button>
      <Button color="warning" appearance={args.appearance}>Warning</Button>
      <Button color="information" appearance={args.appearance}>Information</Button>
    </div>
  ),
};

/** All variants for the comete color */
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

export const AllDensities: Story = {
  name: "All densities",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button density="compact" color="comete">Compact · 24</Button>
      <Button density="default" color="comete">Default · 32</Button>
      <Button density="touch" color="comete">Touch · 48</Button>
    </div>
  ),
};

export const Touch: Story = {
  args: { density: "touch", color: "comete", children: "Cible tactile" },
};

export const TouchViaProvider: Story = {
  name: "Touch via DensityProvider",
  render: () => (
    <DensityProvider density="touch">
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button color="comete">Hérite touch</Button>
        <Button appearance="outlined">Hérite touch</Button>
        {/* override local : repasse en compact malgré le provider */}
        <Button density="compact">Override compact</Button>
      </div>
    </DensityProvider>
  ),
};
