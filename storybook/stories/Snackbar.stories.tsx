// Snackbar — stories Storybook
// Présentation inspirée de la doc MUI (https://mui.com/material-ui/react-snackbar/) :
// déclenchement par bouton, positionnement ancré (anchorOrigin), auto-hide,
// action + fermeture. Le composant Snackbar est présentationnel — l'ouverture,
// le positionnement et l'auto-hide sont gérés côté consumer (démontré ici).
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Button, Snackbar } from "@aexae/comete-design-system/components";

// -----------------------------------------------------------------------
// Figma links

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Helpers de présentation (positionnement ancré, façon MUI anchorOrigin)

type Vertical = "top" | "bottom";
type Horizontal = "left" | "center" | "right";

/** Style de positionnement fixe pour ancrer une snackbar dans le viewport. */
function anchorStyle(vertical: Vertical, horizontal: Horizontal): CSSProperties {
  return {
    position: "fixed",
    zIndex: 10,
    width: "min(440px, calc(100% - 48px))",
    [vertical]: 24,
    ...(horizontal === "center"
      ? { left: "50%", transform: "translateX(-50%)" }
      : { [horizontal]: 24 }),
  };
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Snackbar",
  component: Snackbar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: figmaUrl("5448:1991") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["information", "success", "warning", "critical", "discovery"],
    },
    children: { control: "text" },
    // `role` est purement accessibilité (politesse aria-live status/alert) —
    // aucun effet visuel, donc pas de contrôle interactif pour éviter la
    // confusion. Reste documenté dans la table des props.
    role: { control: false },
  },
  args: {
    appearance: "information",
    children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof Snackbar>;

// -----------------------------------------------------------------------
// Default — playground statique (contrôlé par la toolbar)

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("5448:1992") } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 440 }}>
        <Story />
      </div>
    ),
  ],
};

// -----------------------------------------------------------------------
// Basic — équivalent MUI "Simple" : bouton d'ouverture, ancrage bottom-left,
// action UNDO + fermeture, auto-hide au bout de 6 s.

export const Basic: Story = {
  args: { children: "Note archivée." },
  render: function BasicStory(args) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (!open) return;
      const timer = setTimeout(() => setOpen(false), 6000);
      return () => clearTimeout(timer);
    }, [open]);

    return (
      <>
        <Button appearance="contained" onPress={() => setOpen(true)}>
          Open Snackbar
        </Button>
        {open && (
          <div style={anchorStyle("bottom", "left")}>
            <Snackbar
              appearance={args.appearance}
              action={{ label: "Annuler", onPress: () => setOpen(false) }}
              onClose={() => setOpen(false)}
            >
              {args.children}
            </Snackbar>
          </div>
        )}
      </>
    );
  },
};

// -----------------------------------------------------------------------
// AutoHide — équivalent MUI "Automatic Dismiss" : disparaît après 5 s.

export const AutoHide: Story = {
  args: { children: "Cette snackbar disparaît dans 5 secondes." },
  render: function AutoHideStory(args) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (!open) return;
      const timer = setTimeout(() => setOpen(false), 5000);
      return () => clearTimeout(timer);
    }, [open]);

    return (
      <>
        <Button appearance="contained" onPress={() => setOpen(true)}>
          Afficher (5 s)
        </Button>
        {open && (
          <div style={anchorStyle("bottom", "center")}>
            <Snackbar appearance={args.appearance} onClose={() => setOpen(false)}>
              {args.children}
            </Snackbar>
          </div>
        )}
      </>
    );
  },
};

// -----------------------------------------------------------------------
// Positioned — équivalent MUI "anchorOrigin" : 6 ancrages.

export const Positioned: Story = {
  args: { children: "Message positionné." },
  render: function PositionedStory(args) {
    const [anchor, setAnchor] = useState<{
      v: Vertical;
      h: Horizontal;
    } | null>(null);

    const positions: { v: Vertical; h: Horizontal; label: string }[] = [
      { v: "top", h: "left", label: "Top-Left" },
      { v: "top", h: "center", label: "Top-Center" },
      { v: "top", h: "right", label: "Top-Right" },
      { v: "bottom", h: "left", label: "Bottom-Left" },
      { v: "bottom", h: "center", label: "Bottom-Center" },
      { v: "bottom", h: "right", label: "Bottom-Right" },
    ];

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
            minHeight: "80vh",
          }}
        >
          {positions.map((p) => (
            <Button
              key={p.label}
              appearance="contained"
              density="compact"
              onPress={() => setAnchor({ v: p.v, h: p.h })}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {anchor && (
          <div style={anchorStyle(anchor.v, anchor.h)}>
            <Snackbar appearance={args.appearance} onClose={() => setAnchor(null)}>
              {args.children}
            </Snackbar>
          </div>
        )}
      </>
    );
  },
};

// -----------------------------------------------------------------------
// Appearances — les 5 apparences (équivalent MUI "Use with Alerts" / severity).

export const Appearances: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 440,
      }}
    >
      <Snackbar appearance="information">Information message.</Snackbar>
      <Snackbar appearance="success">Sauvegarde effectuée avec succès.</Snackbar>
      <Snackbar appearance="warning">Mise à jour programmée ce soir.</Snackbar>
      <Snackbar appearance="critical">Impossible de se connecter.</Snackbar>
      <Snackbar appearance="discovery">Nouvelle fonctionnalité disponible.</Snackbar>
    </div>
  ),
};

// -----------------------------------------------------------------------
// WithActionAndClose — anatomie complète (statique).

export const WithActionAndClose: Story = {
  render: () => (
    <div style={{ maxWidth: 440 }}>
      <Snackbar
        appearance="success"
        action={{ label: "Annuler", onPress: () => undefined }}
        onClose={() => undefined}
      >
        Élément supprimé.
      </Snackbar>
    </div>
  ),
};
