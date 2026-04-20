// Logo — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Logo,
  type LogoTaglineAlign,
  type LogoAppearance,
  type LogoProduct,
  type LogoFormat,
} from "@naxit/comete-design-system/components";
import type { CSSProperties, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Logo",
  component: Logo,
  tags: ["autodocs"],
  argTypes: {
    product: {
      control: "select",
      options: ["comete", "ontime", "link", "bi", "academie", "club", "mce", "cafe", "mycomete"] satisfies LogoProduct[],
    },
    appearance: {
      control: "select",
      options: ["brand", "neutral", "inverse"] satisfies LogoAppearance[],
    },
    format: {
      control: { type: "inline-radio" },
      options: ["icon", "logo"] satisfies LogoFormat[],
    },
    taglineAlign: {
      control: "select",
      options: ["none", "inline", "column"] satisfies LogoTaglineAlign[],
    },
    size: {
      // ── Slider, identique à l'Icon Explorer ──────────────────────────
      control: { type: "range", min: 16, max: 96, step: 4 },
    },
  },
  args: {
    product: "comete",
    appearance: "brand",
    format: "logo",
    taglineAlign: "inline",
    size: 32,
  },
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("1981:32146") },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof Logo>;

// -----------------------------------------------------------------------
// LogoWithDownload — rendu d'un logo + boutons SVG / PNG
// Utilisé par les stories Default et IconOnly pour offrir un export rapide
// directement depuis le canvas Storybook.
// -----------------------------------------------------------------------

interface LogoWithDownloadProps {
  product?: LogoProduct;
  appearance?: LogoAppearance;
  format?: LogoFormat;
  taglineAlign?: LogoTaglineAlign;
  size?: number;
}

function LogoWithDownload({
  product = "comete",
  appearance = "brand",
  format = "logo",
  taglineAlign = "inline",
  size = 32,
}: LogoWithDownloadProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadSvg = useCallback(() => {
    if (!containerRef.current) return;
    const blob = buildSvgBlob(containerRef.current);
    if (!blob) return;
    downloadBlob(blob, `logo-${product}-${appearance}.svg`);
  }, [product, appearance]);

  const handleDownloadPng = useCallback(() => {
    if (!containerRef.current) return;
    void downloadPng(containerRef.current, `logo-${product}-${appearance}.png`);
  }, [product, appearance]);

  const btnStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    border: "1px solid var(--border-default)",
    borderRadius: 5,
    background: "var(--background-default-default)",
    color: "var(--text-subtlest)",
    cursor: "pointer",
    letterSpacing: "0.03em",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div ref={containerRef}>
        <Logo product={product} appearance={appearance} format={format} taglineAlign={taglineAlign} size={size} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={handleDownloadSvg} style={btnStyle}>
          SVG
        </button>
        <button type="button" onClick={handleDownloadPng} style={btnStyle}>
          PNG
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Logo Comète par défaut (brand, logo, 32px). */
export const Default: Story = {
  render: (args) => <LogoWithDownload {...args} />,
};

/** Icône seule. */
export const IconOnly: Story = {
  name: "Icon only",
  args: { format: "icon" },
  render: (args) => <LogoWithDownload {...args} />,
};

/** Apparence neutral (monochrome sombre). */
export const Neutral: Story = {
  args: { appearance: "neutral" },
};

/** Apparence inverse (pour fond sombre). */
export const Inverse: Story = {
  args: { appearance: "inverse" },
  decorators: [
    (Story) => (
      <div
        style={{
          background: "var(--background-default-inverted)",
          padding: 24,
          borderRadius: 8,
          border: "1px solid var(--border-default)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/** Taille large. */
export const Large: Story = {
  args: { size: 48 },
};

/** TaglineAlign column : nom produit sous le wordmark (ou au-dessus pour Café). */
export const TaglineAlignColumn: Story = {
  name: "TaglineAlign column",
  args: { taglineAlign: "column", product: "ontime", size: 48 },
  render: (args) => {
    const products: LogoProduct[] = ["comete", "ontime", "link", "bi", "academie", "club", "mce", "cafe"];
    const appearances: LogoAppearance[] = ["brand", "neutral", "inverse"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {appearances.map((a) => (
          <div
            key={a}
            style={{
              background: a === "inverse" ? "var(--background-default-inverted)" : undefined,
              padding: 24,
              borderRadius: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                width: "100%",
                color: a === "inverse" ? "var(--text-inverted)" : "var(--text-subtlest)",
              }}
            >
              appearance={a} taglineAlign=&quot;column&quot;
            </span>
            {products.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Logo product={p} appearance={a} taglineAlign={args.taglineAlign} size={args.size} />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: a === "inverse" ? "var(--text-inverted)" : "var(--text-subtlest)",
                  }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

/** Tous les produits. */
export const AllProducts: Story = {
  name: "All products",
  render: () => {
    const products: LogoProduct[] = ["comete", "ontime", "link", "bi", "academie", "club", "mce", "cafe", "mycomete"];
    const appearances: LogoAppearance[] = ["brand", "neutral", "inverse"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {appearances.map((a) => (
          <div
            key={a}
            style={{
              background: a === "inverse" ? "var(--background-default-inverted)" : undefined,
              padding: 24,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: a === "inverse" ? "var(--text-inverted)" : "var(--text-subtlest)",
              }}
            >
              appearance={a}
            </span>
            {products.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    width: 80,
                    color: a === "inverse" ? "var(--text-inverted)" : "var(--text-subtlest)",
                  }}
                >
                  {p}
                </span>
                <Logo product={p} appearance={a} taglineAlign="inline" size={32} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// -----------------------------------------------------------------------
// Logo Explorer — parcourir, copier et télécharger tous les logos
// -----------------------------------------------------------------------

const ALL_PRODUCTS: LogoProduct[] = [
  "comete",
  "ontime",
  "link",
  "bi",
  "academie",
  "club",
  "mce",
  "mycomete",
];

const ALL_APPEARANCES: LogoAppearance[] = ["brand", "neutral", "inverse"];

// -----------------------------------------------------------------------
// Helpers SVG/PNG

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Retourne la liste des SVGs visibles (display !== none) à l'intérieur du
 * conteneur. Les logos peuvent contenir plusieurs SVGs :
 *   - Light/Dark bodies (dont un seul est affiché à un instant donné)
 *   - Composition ProductRootName + ProductIcon (+ ProductSuffix ou tagline)
 */
function findVisibleSvgs(container: HTMLElement): SVGSVGElement[] {
  const svgs = Array.from(container.querySelectorAll<SVGSVGElement>("svg"));
  return svgs.filter((svg) => getComputedStyle(svg).display !== "none");
}

/**
 * Clone un SVG et résout les CSS custom properties (fill, stop-color,
 * stop-opacity) en valeurs concrètes via getComputedStyle, afin que le
 * SVG exporté soit autonome (sans dépendance aux tokens CSS de la page).
 */
function cloneAndResolveVars(original: SVGSVGElement): SVGSVGElement {
  const clone = original.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", SVG_NS);

  const origEls = Array.from(original.querySelectorAll<SVGElement>("[style]"));
  const cloneEls = Array.from(clone.querySelectorAll<SVGElement>("[style]"));

  for (let i = 0; i < origEls.length; i++) {
    const origEl = origEls[i];
    const cloneEl = cloneEls[i];
    if (!origEl || !cloneEl) continue;
    const cs = getComputedStyle(origEl);

    const fill = cs.fill;
    if (fill && fill !== "") cloneEl.style.fill = fill;

    const stopColor = cs.getPropertyValue("stop-color");
    if (stopColor && stopColor !== "") {
      cloneEl.style.setProperty("stop-color", stopColor);
    }
    const stopOpacity = cs.getPropertyValue("stop-opacity");
    if (stopOpacity && stopOpacity !== "") {
      cloneEl.style.setProperty("stop-opacity", stopOpacity);
    }
  }

  return clone;
}

/**
 * Compose un ou plusieurs SVG enfants en un SVG standalone unique en
 * utilisant leur position/taille réelles dans le DOM. Pour chaque enfant,
 * on applique un `<g transform>` qui traduit et met à l'échelle son
 * viewBox interne vers la position absolue dans le wrapper.
 *
 * Cette approche fonctionne pour les logos refactorés qui composent
 * plusieurs SVGs via inline-flex + position:absolute, et reste correcte
 * pour les cas single-SVG (MyComete, icon-only).
 */
function buildExportSvg(container: HTMLElement): SVGSVGElement | null {
  const svgs = findVisibleSvgs(container);
  if (svgs.length === 0) return null;

  // Cas simple : un seul SVG — on clone tel quel.
  if (svgs.length === 1) {
    const only = svgs[0];
    if (!only) return null;
    return cloneAndResolveVars(only);
  }

  // Cas composé : on mesure chaque SVG par rapport au conteneur et on
  // construit un SVG englobant avec des <g transform> par enfant.
  const containerRect = container.getBoundingClientRect();
  // On se base sur le plus grand rectangle englobant tous les SVG visibles
  // (et non sur le conteneur lui-même : le <span> wrapper peut avoir du
  // padding/marge qui ne reflète pas l'encombrement réel des SVGs).
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const svg of svgs) {
    const r = svg.getBoundingClientRect();
    minX = Math.min(minX, r.left - containerRect.left);
    minY = Math.min(minY, r.top - containerRect.top);
    maxX = Math.max(maxX, r.right - containerRect.left);
    maxY = Math.max(maxY, r.bottom - containerRect.top);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

  const outer = document.createElementNS(SVG_NS, "svg");
  outer.setAttribute("xmlns", SVG_NS);
  outer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  outer.setAttribute("width", String(width));
  outer.setAttribute("height", String(height));
  outer.setAttribute("fill", "none");

  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    const offsetX = rect.left - containerRect.left - minX;
    const offsetY = rect.top - containerRect.top - minY;
    const renderW = rect.width;
    const renderH = rect.height;
    const vbAttr = svg.getAttribute("viewBox") ?? "0 0 1 1";
    const vbParts = vbAttr.split(/\s+/).map(Number);
    const vbX = vbParts[0] ?? 0;
    const vbY = vbParts[1] ?? 0;
    const vbW = vbParts[2] ?? 1;
    const vbH = vbParts[3] ?? 1;
    const sx = vbW === 0 ? 1 : renderW / vbW;
    const sy = vbH === 0 ? 1 : renderH / vbH;

    const g = document.createElementNS(SVG_NS, "g");
    // translate(offset) scale(sx sy) translate(-vbX -vbY)
    // → place le coin (vbX,vbY) du viewBox au point (offsetX, offsetY).
    g.setAttribute(
      "transform",
      `translate(${offsetX} ${offsetY}) scale(${sx} ${sy}) translate(${-vbX} ${-vbY})`,
    );

    const resolved = cloneAndResolveVars(svg);
    // Transvase les enfants du <svg> cloné dans le <g> (on ne garde pas
    // le nœud <svg> intérieur pour rester sur un SVG 1.1 valide).
    for (const child of Array.from(resolved.childNodes)) {
      g.appendChild(child);
    }
    outer.appendChild(g);
  }

  return outer;
}

function buildSvgBlob(container: HTMLElement): Blob | null {
  const svgEl = buildExportSvg(container);
  if (!svgEl) return null;
  const svgString = new XMLSerializer().serializeToString(svgEl);
  return new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
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
  targetHeight = 256
): Promise<void> {
  // Build a high-res SVG: parse viewBox to compute width at targetHeight
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
  if (ctx) {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (pngBlob) downloadBlob(pngBlob, filename);
  }, "image/png");
}

// -----------------------------------------------------------------------
// LogoCard

interface LogoCardProps {
  product: LogoProduct;
  appearance: LogoAppearance;
  format: LogoFormat;
  taglineAlign: LogoTaglineAlign;
  size: number;
  isCopied: boolean;
  onCopy: (product: LogoProduct) => void;
}

function LogoCard({
  product,
  appearance,
  format,
  taglineAlign,
  size,
  isCopied,
  onCopy,
}: LogoCardProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadSvg = useCallback(() => {
    if (!containerRef.current) return;
    const blob = buildSvgBlob(containerRef.current);
    if (!blob) return;
    downloadBlob(blob, `logo-${product}-${appearance}.svg`);
  }, [product, appearance]);

  const handleDownloadPng = useCallback(() => {
    if (!containerRef.current) return;
    void downloadPng(containerRef.current, `logo-${product}-${appearance}.png`);
  }, [product, appearance]);

  const isInverse = appearance === "inverse";

  const cardStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "16px 8px 10px",
    borderRadius: 10,
    border: `1.5px solid ${isCopied ? "var(--border-focus)" : "transparent"}`,
    background: isInverse
      ? "var(--background-default-inverted)"
      : isCopied
        ? "var(--background-selected-subtlest-default)"
        : "transparent",
    transition: "background 0.12s, border-color 0.12s",
  };

  const nameLabelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: isCopied
      ? "var(--text-selected)"
      : isInverse
        ? "var(--text-inverted)"
        : "var(--text-subtlest)",
    textAlign: "center",
    lineHeight: 1.2,
  };

  const btnRowStyle: CSSProperties = {
    display: "flex",
    gap: 4,
    marginTop: 2,
  };

  const dlBtnStyle: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 7px",
    border: "1px solid var(--border-default)",
    borderRadius: 4,
    background: "var(--background-default-default)",
    color: "var(--text-subtlest)",
    cursor: "pointer",
    letterSpacing: "0.03em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Zone cliquable : copie le JSX */}
      <button
        type="button"
        onClick={() => {
          onCopy(product);
        }}
        title={`Copier <Logo product="${product}" appearance="${appearance}"${format !== "logo" ? ` format="${format}"` : ""} size={${size}} />`}
        style={{
          ...cardStyle,
          cursor: "pointer",
          width: "100%",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
        {/* Conteneur du SVG — utilisé pour l'export */}
        <div ref={containerRef}>
          <Logo product={product} appearance={appearance} format={format} taglineAlign={taglineAlign} size={size} />
        </div>
        <span style={nameLabelStyle}>
          {isCopied ? "✓ copié" : product}
        </span>
      </button>

      {/* Boutons de téléchargement */}
      <div style={btnRowStyle}>
        <button
          type="button"
          title={`Télécharger logo-${product}-${appearance}.svg`}
          onClick={handleDownloadSvg}
          style={dlBtnStyle}
        >
          SVG
        </button>
        <button
          type="button"
          title={`Télécharger logo-${product}-${appearance}.png`}
          onClick={handleDownloadPng}
          style={dlBtnStyle}
        >
          PNG
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// LogoExplorer

function LogoExplorer(): ReactElement {
  const [search, setSearch] = useState("");
  const [appearance, setAppearance] = useState<LogoAppearance>("brand");
  const [format, setFormat] = useState<LogoFormat>("logo");
  const [taglineAlign, setTaglineAlign] = useState<LogoTaglineAlign>("inline");
  const [size, setSize] = useState(28);
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const filtered = ALL_PRODUCTS.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  function handleCopy(product: LogoProduct): void {
    const formatAttr = format !== "logo" ? ` format="${format}"` : "";
    const taglineAlignAttr = taglineAlign !== "inline" ? ` taglineAlign="${taglineAlign}"` : "";
    const jsx = `<Logo product="${product}" appearance="${appearance}"${formatAttr}${taglineAlignAttr} size={${size}} />`;
    void navigator.clipboard.writeText(jsx);
    setCopied(product);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  // ── Styles réutilisables ───────────────────────────────────────────────

  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: "var(--text-subtlest)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const controlStyle: CSSProperties = {
    padding: "5px 10px",
    border: "1px solid var(--border-default)",
    borderRadius: 6,
    background: "var(--background-default-default)",
    color: "var(--text-default)",
    fontSize: 13,
  };

  const tabBtnStyle = (active: boolean): CSSProperties => ({
    ...controlStyle,
    background: active
      ? "var(--background-selected-subtlest-default)"
      : "var(--background-default-default)",
    borderColor: active ? "var(--border-focus)" : "var(--border-default)",
    color: active ? "var(--text-selected)" : "var(--text-default)",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
  });

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "var(--font-family-primary, system-ui, sans-serif)",
        minHeight: "100vh",
      }}
    >
      {/* ── Barre d'outils ─────────────────────────────────────────── */}
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
        {/* Recherche */}
        <div style={{ flex: "1 1 200px", minWidth: 140 }}>
          <div style={labelStyle}>Recherche</div>
          <input
            type="search"
            placeholder="Filtrer par nom…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            style={{ ...controlStyle, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Apparence */}
        <div>
          <div style={labelStyle}>Apparence</div>
          <div style={{ display: "flex", gap: 4 }}>
            {ALL_APPEARANCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAppearance(a);
                }}
                style={tabBtnStyle(appearance === a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Format (Comète only — other products don't have icon-only mode) */}
        <div>
          <div style={labelStyle}>Format</div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["logo", "icon"] satisfies LogoFormat[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFormat(t);
                }}
                style={tabBtnStyle(format === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* TaglineAlign */}
        <div>
          <div style={labelStyle}>TaglineAlign</div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["none", "inline", "column"] satisfies LogoTaglineAlign[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTaglineAlign(s);
                }}
                style={tabBtnStyle(taglineAlign === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Taille */}
        <div>
          <div style={labelStyle}>Taille — {size}px</div>
          <input
            type="range"
            min={16}
            max={96}
            step={4}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
            }}
            style={{ width: 110, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* ── Compteur + hint ────────────────────────────────────────── */}
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-subtlest)" }}>
        <strong style={{ color: "var(--text-default)" }}>{filtered.length}</strong>
        {" / "}
        {ALL_PRODUCTS.length} logos
        {search !== "" && ` — "${search}"`}
        {" · cliquer pour copier le JSX"}
      </p>

      {/* ── Grille ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--text-subtlest)",
          }}
        >
          Aucun logo pour &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px, 1fr) minmax(120px, 1fr)",
            gap: 8,
            padding: appearance === "inverse" ? 16 : 0,
            background:
              appearance === "inverse"
                ? "var(--background-default-inverted)"
                : "transparent",
            borderRadius: appearance === "inverse" ? 12 : 0,
          }}
        >
          {filtered.map((product) => (
            <LogoCard
              key={product}
              product={product}
              appearance={appearance}
              format={format}
              taglineAlign={taglineAlign}
              size={size}
              isCopied={copied === product}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Story

export const Explorer: Story = {
  name: "Logo Explorer",
  parameters: { layout: "fullscreen" },
  render: () => <LogoExplorer />,
};
