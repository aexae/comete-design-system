import { Illustration } from "@naxit/comete-design-system";
import type { IllustrationComponentProps, IllustrationSize } from "@naxit/comete-design-system";
import type { IllustrationName, IllustrationProps } from "@naxit/comete-illustrations";
import { illustrationRegistry } from "@naxit/comete-illustrations";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ComponentType, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

// ----------------------------------------------------------------------
// Build illustration name list from the registry (always in sync with the package)

const ILLUSTRATION_NAMES: IllustrationName[] = Object.keys(
  illustrationRegistry,
).sort() as IllustrationName[];

// ----------------------------------------------------------------------

const SIZES: IllustrationSize[] = [128, 256, 512];

// ----------------------------------------------------------------------

const meta: Meta<IllustrationComponentProps> = {
  title: "Components/Illustration",
  component: Illustration,
  tags: ["autodocs"],
  argTypes: {
    illustration: {
      control: "select",
      options: ILLUSTRATION_NAMES,
      description: "Name of the illustration to render",
    },
    size: {
      control: "select",
      options: SIZES,
    },
    label: {
      control: "text",
      description: "Accessible label (makes the illustration non-decorative)",
    },
  },
  args: {
    illustration: "Empty",
    size: 256,
  },
};

export default meta;
type Story = StoryObj<IllustrationComponentProps>;

// ----------------------------------------------------------------------

export const Default: Story = {};

export const Size128: Story = {
  args: { illustration: "Empty", size: 128 },
};

export const Size512: Story = {
  args: { illustration: "Empty", size: 512 },
};

export const WithLabel: Story = {
  args: { illustration: "ForbiddenAccess", label: "Accès refusé" },
};

// ----------------------------------------------------------------------
// Showcase : all sizes for a single illustration

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "end" }}>
      {SIZES.map((s) => (
        <div
          key={s}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Illustration {...args} size={s} illustration="Empty" />
          <span style={{ fontSize: 12, color: "var(--text-subtlest, #888)" }}>
            {s}px
          </span>
        </div>
      ))}
    </div>
  ),
};

// ----------------------------------------------------------------------
// Illustration Explorer — parcourir et copier toutes les illustrations

type IllustrationComponent = ComponentType<IllustrationProps>;

const ILLUSTRATION_ENTRIES: Array<[string, IllustrationComponent]> = (
  Object.entries(illustrationRegistry as Record<string, unknown>)
).filter(
  (entry): entry is [string, IllustrationComponent] =>
    typeof entry[1] === "function" && /^[A-Z]/.test(entry[0])
);

interface IllustrationCardProps {
  name: string;
  Component: IllustrationComponent;
  size: number;
  isCopied: boolean;
  onCopy: (name: string) => void;
}

function IllustrationCard({
  name,
  Component,
  size,
  isCopied,
  onCopy,
}: IllustrationCardProps): ReactElement {
  return (
    <button
      onClick={() => {
        onCopy(name);
      }}
      title={`Copier "${name}"`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 16,
        border: `1.5px solid ${isCopied ? "var(--border-focus, #4a90e2)" : "transparent"}`,
        borderRadius: 12,
        background: isCopied
          ? "var(--background-selected-subtlest-default, rgba(74,144,226,0.08))"
          : "transparent",
        cursor: "pointer",
        width: "100%",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      <Component width={size} height={size} />
      <span
        style={{
          fontSize: 11,
          color: isCopied
            ? "var(--text-selected, #4a90e2)"
            : "var(--text-subtlest, #888)",
          textAlign: "center",
          lineHeight: 1.3,
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {isCopied ? "✓ copié" : name}
      </span>
    </button>
  );
}

function IllustrationExplorer(): ReactElement {
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(128);
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const filtered = ILLUSTRATION_ENTRIES.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCopy(name: string): void {
    void navigator.clipboard.writeText(name);
    setCopied(name);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  const label: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: "var(--text-subtlest, #888)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const control: CSSProperties = {
    padding: "5px 10px",
    border: "1px solid var(--border-default, #ddd)",
    borderRadius: 6,
    background: "var(--background-default, #fff)",
    color: "var(--text-primary, #111)",
    fontSize: 13,
  };

  return (
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
          background: "var(--background-surface-elevation-sunken-default, #f7f7f7)",
          borderRadius: 12,
          border: "1px solid var(--border-default, #eee)",
        }}
      >
        {/* Recherche */}
        <div style={{ flex: "1 1 220px", minWidth: 160 }}>
          <div style={label}>Recherche</div>
          <input
            type="search"
            placeholder="Filtrer par nom…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            style={{ ...control, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Taille */}
        <div>
          <div style={label}>Taille — {size}px</div>
          <input
            type="range"
            min={64}
            max={256}
            step={16}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
            }}
            style={{ width: 140, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Compteur */}
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-subtlest, #888)" }}>
        <strong style={{ color: "var(--text-primary, #111)" }}>{filtered.length}</strong>
        {" / "}
        {ILLUSTRATION_ENTRIES.length} illustrations
        {search !== "" && ` — "${search}"`}
        {" · cliquer pour copier le nom"}
      </p>

      {/* Grille */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: 48, color: "var(--text-subtlest, #888)" }}>
          Aucune illustration pour &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${size + 40}px, 1fr))`,
            gap: 8,
          }}
        >
          {filtered.map(([name, Component]) => (
            <IllustrationCard
              key={name}
              name={name}
              Component={Component}
              size={size}
              isCopied={copied === name}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Explorer: Story = {
  name: "Illustration Explorer",
  parameters: { layout: "fullscreen" },
  render: () => <IllustrationExplorer />,
};
