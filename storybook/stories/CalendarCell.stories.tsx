// CalendarCell — états visuels (story de référence design)
// Chaque état est rendu en isolation via des styles inline utilisant les design tokens.
// Aucun contexte Calendar requis — correspond à la vue "Parts" du fichier Figma.
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

// -----------------------------------------------------------------------
// Constantes de style — reprises à l'identique de Calendar.module.css

const BASE_CELL: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "var(--size400)",
  height: "var(--size400)",
  borderRadius: "var(--radius0375)",
  cursor: "pointer",
  outline: "none",
  flexShrink: 0,
};

const BASE_TEXT: CSSProperties = {
  fontFamily: "var(--font-family-primary)",
  fontSize: "var(--font-size-ui-xs)",
  fontWeight: "var(--font-weight-regular)",
  lineHeight: "var(--line-height-ui-xs)",
  color: "var(--text-subtle)",
  pointerEvents: "none",
  userSelect: "none",
};

// -----------------------------------------------------------------------
// Composant cellule isolée

interface CellPreviewProps {
  /** Numéro affiché dans la cellule. */
  day?: number;
  /** Couleur d'arrière-plan de la cellule. */
  background?: string;
  /** Border-radius CSS (supporte les valeurs composites pour range start/end). */
  borderRadius?: string;
  /** Couleur du texte. */
  color?: string;
  /** Graisse du texte. */
  fontWeight?: string;
  /** Opacité (état désactivé). */
  opacity?: string;
  /** Curseur CSS. */
  cursor?: CSSProperties["cursor"];
  /** Text-decoration (état indisponible). */
  textDecoration?: string;
  /** Affiche le point indicateur "aujourd'hui" sous le numéro. */
  todayIndicator?: boolean;
  /** Affiche un anneau de focus (box-shadow inset). */
  focusRing?: boolean;
  /** Étiquette sous la cellule. */
  label: string;
}

function CellPreview({
  day = 15,
  background = "transparent",
  borderRadius = "var(--radius0375)",
  color = "var(--text-subtle)",
  fontWeight = "var(--font-weight-regular)",
  opacity,
  cursor = "pointer",
  textDecoration,
  todayIndicator = false,
  focusRing = false,
  label,
}: CellPreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          ...BASE_CELL,
          background,
          borderRadius,
          cursor,
          opacity,
          boxShadow: focusRing
            ? "inset 0 0 0 2px var(--border-focused)"
            : undefined,
        }}
      >
        <span
          style={{
            ...BASE_TEXT,
            color,
            fontWeight,
            textDecoration,
          }}
        >
          {day}
        </span>
        {todayIndicator && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "var(--space050)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "var(--size050)",
              borderRadius: "var(--radius-round)",
              backgroundColor: "var(--border-focused)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      <span
        style={{
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xxs)",
          color: "var(--text-subtlest)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------
// Meta

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";

const meta = {
  title: "Components/Calendar/Cellule",
  parameters: {
    layout: "padded",
    design: {
      type: "figma",
      url: `${FIGMA_FILE}?node-id=3147-10692`,
    },
  },
} satisfies Meta;

export default meta;

// -----------------------------------------------------------------------
// Story unique — tous les états côte à côte

export const AllStates: StoryObj = {
  name: "Tous les états",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space300)",
        alignItems: "flex-end",
      }}
    >
      <CellPreview label="Défaut" />

      <CellPreview
        label="Survol"
        background="var(--background-neutral-subtler-hovered)"
      />

      <CellPreview
        label="Pressé"
        background="var(--background-neutral-subtler-pressed)"
      />

      <CellPreview
        label="Aujourd'hui"
        color="var(--text-information)"
        fontWeight="var(--font-weight-semibold)"
        todayIndicator
      />

      <CellPreview
        label="Sélectionné"
        background="var(--background-client-subtlest-default)"
        color="var(--text-information)"
      />

      <CellPreview
        label="Plage — début"
        background="var(--border-brand)"
        borderRadius="var(--radius0375) 0 0 var(--radius0375)"
        color="var(--text-inverted)"
      />

      <CellPreview
        label="Plage — milieu"
        background="var(--background-client-subtlest-hovered)"
        borderRadius="0"
        color="var(--text-default)"
      />

      <CellPreview
        label="Plage — fin"
        background="var(--border-brand)"
        borderRadius="0 var(--radius0375) var(--radius0375) 0"
        color="var(--text-inverted)"
      />

      <CellPreview
        label="Plage — seule"
        background="var(--border-brand)"
        color="var(--text-inverted)"
      />

      <CellPreview
        label="Désactivé"
        color="var(--icon-disabled)"
        opacity="var(--opacity-disabled)"
        cursor="not-allowed"
      />

      <CellPreview
        label="Indisponible"
        color="var(--icon-disabled)"
        textDecoration="line-through"
        cursor="default"
      />

      <CellPreview label="Focus" focusRing />
    </div>
  ),
};
