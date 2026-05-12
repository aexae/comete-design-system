import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerProvider,
  Field,
  Icon,
  SearchField,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@naxit/comete-design-system";
import type { IconComponentProps } from "@naxit/comete-design-system";
import * as Icons from "@naxit/comete-icons";
import type { IconColor, IconName, IconProps, IconVariant } from "@naxit/comete-icons";
import { iconRegistry } from "@naxit/comete-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ComponentType, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// ----------------------------------------------------------------------
// Build icon name list from the registry (always in sync with the package)

const ICON_NAMES: IconName[] = Object.keys(iconRegistry).sort() as IconName[];

// ----------------------------------------------------------------------
// Figma design URLs

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";

/** Builds a Figma URL with a specific node ID for the addon-designs panel */
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// ----------------------------------------------------------------------

const VARIANTS: IconVariant[] = ["outlined", "filled", "duotone"];

const COLORS: IconColor[] = [
  "default",
  "subtle",
  "subtlest",
  "disabled",
  "inverted",
  "brand",
  "selected",
  "information",
  "success",
  "warning",
  "on-warning",
  "critical",
  "accent",
  "day",
  "night",
];

// ----------------------------------------------------------------------

const meta: Meta<IconComponentProps> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: ICON_NAMES,
      description: "Name of the icon to render",
    },
    appearance: {
      control: "select",
      options: VARIANTS,
    },
    color: {
      control: "select",
      options: COLORS,
    },
    size: {
      control: { type: "number", min: 12, max: 64, step: 4 },
    },
    spacing: {
      control: "select",
      options: ["default", "none"],
    },
    "aria-label": {
      control: "text",
      description: "Accessible label (makes the icon non-decorative)",
    },
  },
  args: {
    icon: "AddBox",
    appearance: "outlined",
    color: "default",
    size: 24,
    spacing: "default",
  },
  parameters: {
    design: {
      type: "figma",
      url: figmaUrl("5133-3041"),
    },
  },
};

export default meta;
type Story = StoryObj<IconComponentProps>;

// ----------------------------------------------------------------------
// Helpers SVG / PNG

function findVisibleSvg(container: HTMLElement): SVGSVGElement | null {
  const svgs = Array.from(container.querySelectorAll<SVGSVGElement>("svg"));
  return svgs.find((svg) => getComputedStyle(svg).display !== "none") ?? null;
}

function buildExportSvg(container: HTMLElement): SVGSVGElement | null {
  const original = findVisibleSvg(container);
  if (!original) return null;
  const clone = original.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const origEls = Array.from(original.querySelectorAll<SVGElement>("*"));
  const cloneEls = Array.from(clone.querySelectorAll<SVGElement>("*"));

  for (let i = 0; i < origEls.length; i++) {
    const cs = getComputedStyle(origEls[i]);
    const ce = cloneEls[i];
    const fill = cs.fill;
    if (fill) ce.style.fill = fill;
    const stroke = cs.stroke;
    if (stroke && stroke !== "none") ce.style.stroke = stroke;
  }
  return clone;
}

function buildSvgString(container: HTMLElement): string | null {
  const svgEl = buildExportSvg(container);
  if (!svgEl) return null;
  return new XMLSerializer().serializeToString(svgEl);
}

function buildSvgBlob(container: HTMLElement): Blob | null {
  const str = buildSvgString(container);
  if (!str) return null;
  return new Blob([str], { type: "image/svg+xml;charset=utf-8" });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadPng(
  container: HTMLElement,
  filename: string,
  targetHeight = 256,
): Promise<void> {
  const svgEl = buildExportSvg(container);
  if (!svgEl) return;

  const vbParts = (svgEl.getAttribute("viewBox") ?? "").split(" ").map(Number);
  const vbW = vbParts[2] ?? 1;
  const vbH = vbParts[3] ?? 1;
  const targetWidth = Math.round((targetHeight * vbW) / vbH);

  svgEl.setAttribute("width", String(targetWidth));
  svgEl.setAttribute("height", String(targetHeight));

  const svgString = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (pngBlob) downloadBlob(pngBlob, filename);
  }, "image/png");
}

// ----------------------------------------------------------------------
// IconWithDownload — rendu d'une icône + boutons SVG / PNG

function IconWithDownload(props: IconComponentProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const icon = props.icon ?? "AddBox";

  const handleDownloadSvg = useCallback(() => {
    if (!containerRef.current) return;
    const blob = buildSvgBlob(containerRef.current);
    if (!blob) return;
    downloadBlob(blob, `${icon}.svg`);
  }, [icon]);

  const handleDownloadPng = useCallback(() => {
    if (!containerRef.current) return;
    void downloadPng(containerRef.current, `${icon}.png`);
  }, [icon]);

  const btnStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    border: "1px solid var(--border-default)",
    borderRadius: 5,
    background: "var(--background-neutral-subtler-default)",
    color: "var(--text-subtlest)",
    cursor: "pointer",
    letterSpacing: "0.03em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div ref={containerRef}>
        <Icon {...props} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={handleDownloadSvg} style={btnStyle}>SVG</button>
        <button type="button" onClick={handleDownloadPng} style={btnStyle}>PNG</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

export const Default: Story = {
  render: (args) => <IconWithDownload {...args} />,
};

export const Filled: Story = {
  args: { icon: "AddBox", appearance: "filled" },
  render: (args) => <IconWithDownload {...args} />,
};

export const Duotone: Story = {
  args: { icon: "AddBox", appearance: "duotone" },
  render: (args) => <IconWithDownload {...args} />,
};

export const Size16: Story = {
  args: { icon: "AddBox", size: 16, spacing: "none" },
  render: (args) => <IconWithDownload {...args} />,
};

export const Size48: Story = {
  args: { icon: "AddBox", size: 48 },
  render: (args) => <IconWithDownload {...args} />,
};

export const WithLabel: Story = {
  args: { icon: "AddBox", "aria-label": "Erreur" },
  render: (args) => <IconWithDownload {...args} />,
};

// ----------------------------------------------------------------------
// Showcase : all colors for a single icon

export const AllColors: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {COLORS.map((c) => (
        <div
          key={c}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: c === "inverted" ? "8px" : undefined,
            background: c === "inverted" ? "var(--background-brand-bold-default)" : undefined,
            borderRadius: c === "inverted" ? 8 : undefined,
          }}
        >
          <Icon {...args} color={c} icon="AddBox" />
          <span
            style={{
              fontSize: 10,
              color:  c === "inverted" ? "var(--text-inverted)" : "var(--text-subtlest)",
            }}
          >
            {c}
          </span>
        </div>
      ))}
    </div>
  ),
};

// Showcase : all variants for a single icon

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {VARIANTS.map((v) => (
        <div
          key={v}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Icon {...args} appearance={v} icon="AddBox" />
          <span
            style={{
              fontSize: 10,
              color: "var(--text-subtlest)",
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  ),
};

// ----------------------------------------------------------------------
// Icon Explorer — parcourir et copier toutes les icônes

type IconComponent = ComponentType<IconProps>;

const ICON_ENTRIES: Array<[string, IconComponent]> = (
  Object.entries(Icons as Record<string, unknown>)
).filter(
  (entry): entry is [string, IconComponent] =>
    typeof entry[1] === "function" && /^[A-Z]/.test(entry[0])
);

type IconSpacing = "default" | "none";

interface IconCardProps {
  name: string;
  Component: IconComponent;
  variant: IconVariant;
  color: IconColor;
  size: number;
  spacing: IconSpacing;
  isCopied: boolean;
  isSelected: boolean;
  onClick: (name: string, container: HTMLElement) => void;
}

/**
 * Carte de la grille — icône + nom uniquement.
 * Hover : background subtle + cursor pointer.
 * Sélectionnée (panneau ouvert) : outline brand.
 * Copiée : check + label « Copié ! » pendant 1.5 s.
 */
function IconCard({
  name,
  Component,
  variant,
  color,
  size,
  spacing,
  isCopied,
  isSelected,
  onClick,
}: IconCardProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <button
      type="button"
      onClick={() => {
        if (containerRef.current) onClick(name, containerRef.current);
      }}
      title={name}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "16px 8px",
        border: `1.5px solid ${
          isSelected ? "var(--border-focus)" : "transparent"
        }`,
        borderRadius: 8,
        background: isCopied
          ? "var(--background-success-subtlest-default)"
          : isSelected
            ? "var(--background-selected-subtlest-default)"
            : "transparent",
        cursor: "pointer",
        width: "100%",
        transition: "background 0.15s, border-color 0.15s",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (!isCopied && !isSelected) {
          e.currentTarget.style.background =
            "var(--background-neutral-subtlest-hovered)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isCopied && !isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div ref={containerRef}>
        <Component variant={variant} color={color} spacing={spacing} size={size} />
      </div>
      <span
        style={{
          fontSize: 10,
          color: isCopied
            ? "var(--text-success)"
            : isSelected
              ? "var(--text-selected)"
              : "var(--text-subtlest)",
          textAlign: "center",
          lineHeight: 1.2,
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: isCopied || isSelected ? 600 : 400,
        }}
      >
        {isCopied ? "✓ Copié !" : name}
      </span>
    </button>
  );
}

// ----------------------------------------------------------------------
// IconDetailPanel — Drawer DS montrant les détails d'une icône (pattern
// Material Symbols : preview en grand, variants cliquables, slider taille,
// code d'import + boutons de téléchargement)

interface IconDetailPanelProps {
  name: string;
  Component: IconComponent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PANEL_SIZE_MIN = 16;
const PANEL_SIZE_MAX = 128;
const PANEL_SIZE_DEFAULT = 96;

function IconDetailPanel({
  name,
  Component,
  isOpen,
  onOpenChange,
}: IconDetailPanelProps): ReactElement {
  const previewRef = useRef<HTMLButtonElement>(null);
  const [panelVariant, setPanelVariant] = useState<IconVariant>("outlined");
  const [panelSize, setPanelSize] = useState(PANEL_SIZE_DEFAULT);
  const [codeCopied, setCodeCopied] = useState(false);
  const [svgCopied, setSvgCopied] = useState(false);
  const codeCopyTimerRef = useRef<number | null>(null);
  const svgCopyTimerRef = useRef<number | null>(null);

  // Reset variant + size + feedback à chaque ouverture sur une nouvelle icône.
  useEffect(() => {
    if (isOpen) {
      setPanelVariant("outlined");
      setPanelSize(PANEL_SIZE_DEFAULT);
      setCodeCopied(false);
      setSvgCopied(false);
    }
  }, [isOpen, name]);

  useEffect(
    () => () => {
      if (codeCopyTimerRef.current !== null) {
        window.clearTimeout(codeCopyTimerRef.current);
      }
      if (svgCopyTimerRef.current !== null) {
        window.clearTimeout(svgCopyTimerRef.current);
      }
    },
    [],
  );

  /** Clic sur la preview → copie le SVG (variant + taille courants) + check. */
  const handleCopySvg = (): void => {
    if (!previewRef.current) return;
    const svgString = buildSvgString(previewRef.current);
    if (svgString) void navigator.clipboard.writeText(svgString);
    setSvgCopied(true);
    if (svgCopyTimerRef.current !== null) {
      window.clearTimeout(svgCopyTimerRef.current);
    }
    svgCopyTimerRef.current = window.setTimeout(() => {
      setSvgCopied(false);
    }, 1500);
  };

  // Code d'import — inclut `appearance` si différent du défaut (outlined).
  const importCode =
    panelVariant === "outlined"
      ? `<Icon icon="${name}" />`
      : `<Icon icon="${name}" appearance="${panelVariant}" />`;

  const handleCopyCode = (): void => {
    void navigator.clipboard.writeText(importCode);
    setCodeCopied(true);
    if (codeCopyTimerRef.current !== null) {
      window.clearTimeout(codeCopyTimerRef.current);
    }
    codeCopyTimerRef.current = window.setTimeout(() => {
      setCodeCopied(false);
    }, 1500);
  };

  const handleDownloadSvg = (): void => {
    if (!previewRef.current) return;
    const blob = buildSvgBlob(previewRef.current);
    if (blob) downloadBlob(blob, `${name}-${panelVariant}.svg`);
  };

  const handleDownloadPng = (): void => {
    if (!previewRef.current) return;
    void downloadPng(previewRef.current, `${name}-${panelVariant}.png`);
  };

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-subtlest)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="right"
      // Responsive : min 360 px pour que les boutons du footer + le code
      // d'import ne soient pas tronqués sur petits écrans ; 30 % d'écran
      // sur grand écran ; plafonné à 440 px pour ne pas dominer la grille.
      size="clamp(360px, 30vw, 440px)"
      aria-label={`Détails de l'icône ${name}`}
    >
      <DrawerHeader onClose={() => onOpenChange(false)}>{name}</DrawerHeader>
      <DrawerBody>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Preview SVG cliquable → copie le SVG (variant + taille courants). */}
          <button
            ref={previewRef}
            type="button"
            onClick={handleCopySvg}
            title="Cliquer pour copier le SVG"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              minHeight: 160,
              background: svgCopied
                ? "var(--background-success-subtlest-default)"
                : "var(--background-surface-elevation-sunken-default)",
              border: `1.5px solid ${
                svgCopied ? "var(--border-success)" : "transparent"
              }`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
              fontFamily: "inherit",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (!svgCopied) {
                e.currentTarget.style.background =
                  "var(--background-neutral-subtlest-hovered)";
              }
            }}
            onMouseLeave={(e) => {
              if (!svgCopied) {
                e.currentTarget.style.background =
                  "var(--background-surface-elevation-sunken-default)";
              }
            }}
          >
            <Component variant={panelVariant} size={panelSize} />
            {/* Feedback de copie en overlay (sans déplacer la preview) */}
            {svgCopied && (
              <span
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-success)",
                  background: "var(--background-default-default)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: "1px solid var(--border-success)",
                }}
              >
                ✓ Copié
              </span>
            )}
          </button>

          {/* Slider de taille */}
          <div>
            <div style={sectionLabel}>Taille — {panelSize} px</div>
            <input
              type="range"
              min={PANEL_SIZE_MIN}
              max={PANEL_SIZE_MAX}
              step={4}
              value={panelSize}
              onChange={(e) => {
                setPanelSize(Number(e.target.value));
              }}
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: "var(--background-brand-bold-default)",
              }}
            />
          </div>

          {/* 3 variants cliquables */}
          <div>
            <div style={sectionLabel}>Variants — clique pour changer</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {VARIANTS.map((v) => {
                const isActive = v === panelVariant;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setPanelVariant(v);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: 12,
                      background: isActive
                        ? "var(--background-selected-subtlest-default)"
                        : "var(--background-surface-elevation-sunken-default)",
                      border: `1.5px solid ${
                        isActive ? "var(--border-focus)" : "transparent"
                      }`,
                      borderRadius: 6,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <Component variant={v} size={32} />
                    <span
                      style={{
                        fontSize: 10,
                        color: isActive
                          ? "var(--text-selected)"
                          : "var(--text-subtlest)",
                        textTransform: "capitalize",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {v}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code d'import */}
          <div>
            <div style={sectionLabel}>Import</div>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Cliquer pour copier"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border-default)",
                borderRadius: 6,
                background: codeCopied
                  ? "var(--background-success-subtlest-default)"
                  : "var(--background-surface-elevation-sunken-default)",
                cursor: "pointer",
                fontFamily:
                  "var(--font-family-monospace, ui-monospace, monospace)",
                fontSize: 12,
                color: "var(--text-default)",
                textAlign: "left",
                transition: "background 0.15s",
              }}
            >
              <code>{importCode}</code>
              <span
                style={{
                  fontSize: 11,
                  color: codeCopied
                    ? "var(--text-success)"
                    : "var(--text-subtlest)",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {codeCopied ? "✓ Copié" : "Copier"}
              </span>
            </button>
          </div>
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button appearance="outlined" isFullWidth onPress={handleDownloadSvg}>
          Télécharger SVG
        </Button>
        <Button isFullWidth onPress={handleDownloadPng}>
          Télécharger PNG
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

function IconExplorer(): ReactElement {
  const [search, setSearch] = useState("");
  const [variant, setVariant] = useState<IconVariant>("outlined");
  const [color, setColor] = useState<IconColor>("default");
  const [size, setSize] = useState(24);
  const [spacing, setSpacing] = useState<IconSpacing>("default");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const filtered = ICON_ENTRIES.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Clic sur une carte d'icône :
   * 1. Copie le SVG dans le clipboard.
   * 2. Affiche un check « ✓ Copié ! » sur la carte pendant 1.5 s.
   * 3. Ouvre le panneau de détail latéral (pattern Material Symbols).
   */
  function handleIconClick(name: string, container: HTMLElement): void {
    const svgString = buildSvgString(container);
    if (svgString) void navigator.clipboard.writeText(svgString);
    setCopied(name);
    setSelected(name);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  // Composant de l'icône sélectionnée (pour passer au panneau de détail).
  const selectedComponent =
    selected !== null
      ? ICON_ENTRIES.find(([name]) => name === selected)?.[1]
      : null;

  const label: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: "var(--text-subtlest)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <DrawerProvider>
      <div
        style={{
          padding: 24,
          fontFamily: "var(--font-family-primary, system-ui, sans-serif)",
          minHeight: "100vh",
        }}
      >
      {/* Barre d'outils */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: 20,
          padding: 16,
          background: "var(--background-surface-elevation-sunken-default)",
          borderRadius: 8,
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Recherche — SearchField wrappé dans Field pour le label intégré */}
        <div style={{ flex: "1 1 220px", minWidth: 160 }}>
          <Field label="Recherche">
            <SearchField
              placeholder="Filtrer par nom…"
              value={search}
              onChange={setSearch}
            />
          </Field>
        </div>

        {/* Variant — ToggleButtonGroup n'a pas de prop label, label inline minimal */}
        <div>
          <div style={label}>Variant</div>
          <ToggleButtonGroup
            aria-label="Variant"
            selectionMode="single"
            selectedKeys={[variant]}
            onSelectionChange={(keys) => {
              const first = Array.from(keys as Set<string>)[0];
              if (first !== undefined) setVariant(first as IconVariant);
            }}
          >
            {VARIANTS.map((v) => (
              <ToggleButton key={v} id={v}>
                {v}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {/* Couleur — Select avec son label intégré */}
        <div style={{ width: 140 }}>
          <Select
            label="Couleur"
            items={COLORS.map((c) => ({ value: c, label: c }))}
            value={color}
            onChange={(v) => {
              if (v !== null) setColor(v as IconColor);
            }}
          />
        </div>

        {/* Taille — range natif avec accent-color en brand */}
        <div>
          <div style={label}>Taille — {size}px</div>
          <input
            type="range"
            min={12}
            max={48}
            step={4}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
            }}
            style={{
              width: 100,
              cursor: "pointer",
              accentColor: "var(--background-brand-bold-default)",
            }}
          />
        </div>

        {/* Spacing — ToggleButtonGroup n'a pas de prop label, label inline minimal */}
        <div>
          <div style={label}>Spacing</div>
          <ToggleButtonGroup
            aria-label="Spacing"
            selectionMode="single"
            selectedKeys={[spacing]}
            onSelectionChange={(keys) => {
              const first = Array.from(keys as Set<string>)[0];
              if (first !== undefined) setSpacing(first as IconSpacing);
            }}
          >
            {(["default", "none"] as const).map((s) => (
              <ToggleButton key={s} id={s}>
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </div>

      {/* Compteur */}
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-subtlest)" }}>
        <strong style={{ color: "var(--text-default)" }}>{filtered.length}</strong>
        {" / "}
        {ICON_ENTRIES.length} icônes
        {search !== "" && ` — "${search}"`}
        {" · cliquer pour copier le SVG et ouvrir les détails"}
      </p>

      {/* Grille */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: 48, color: "var(--text-subtlest)" }}>
          Aucune icône pour &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 4,
          }}
        >
          {filtered.map(([name, Component]) => (
            <IconCard
              key={name}
              name={name}
              Component={Component}
              variant={variant}
              color={color}
              size={size}
              spacing={spacing}
              isCopied={copied === name}
              isSelected={selected === name}
              onClick={handleIconClick}
            />
          ))}
        </div>
      )}
      </div>
      {/* Drawer de détail latéral (pattern Material Symbols) — rendu
          inconditionnellement et contrôlé par `isOpen` pour bénéficier des
          transitions slide-in/out du Drawer DS. */}
      {selectedComponent !== null && selectedComponent !== undefined && (
        <IconDetailPanel
          name={selected ?? ""}
          Component={selectedComponent}
          isOpen={selected !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      )}
    </DrawerProvider>
  );
}

export const Explorer: Story = {
  name: "Icon Explorer",
  parameters: { layout: "fullscreen" },
  render: () => <IconExplorer />,
};
