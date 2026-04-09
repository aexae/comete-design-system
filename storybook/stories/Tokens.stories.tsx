// Token Explorer — parcourir les tokens de @naxit/comete-design-tokens
import tokensRaw from "@naxit/comete-design-tokens/css?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------
// Parsing du fichier CSS

interface TokenEntry {
  name: string; // --background-neutral-subtler-default
  light: string; // valeur en thème clair
  dark: string | null; // valeur en thème sombre (null si identique)
}

function parseBlock(block: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    map.set(m[1].trim(), m[2].trim());
  }
  return map;
}

function extractBlock(css: string, selector: string): string {
  const idx = css.indexOf(selector);
  if (idx === -1) return "";
  const start = css.indexOf("{", idx);
  if (start === -1) return "";
  let depth = 0;
  let end = start;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return css.slice(start + 1, end);
}

function buildTokenEntries(): TokenEntry[] {
  // On extrait tous les blocs :root (il y en a plusieurs : primitives + semantic light)
  const rootLight = new Map<string, string>();
  const rootRe = /:root\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = rootRe.exec(tokensRaw)) !== null) {
    // Cherche le bon bloc à partir de la position du match
    const idx = tokensRaw.indexOf(":root", m.index);
    const start = tokensRaw.indexOf("{", idx);
    let depth = 0,
      end = start;
    for (let i = start; i < tokensRaw.length; i++) {
      if (tokensRaw[i] === "{") depth++;
      else if (tokensRaw[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const b = tokensRaw.slice(start + 1, end);
    parseBlock(b).forEach((v, k) => rootLight.set(k, v));
  }

  const darkBlock = extractBlock(tokensRaw, '[data-theme="dark"]');
  const rootDark = parseBlock(darkBlock);

  const entries: TokenEntry[] = [];
  rootLight.forEach((light, name) => {
    const dark = rootDark.get(name) ?? null;
    entries.push({ name, light, dark });
  });
  return entries;
}

const ALL_TOKENS = buildTokenEntries();

// -----------------------------------------------------------------------
// Catégorisation

type SemanticGroup =
  | "background"
  | "text"
  | "border"
  | "icon"
  | "interaction"
  | "blanket"
  | "logo";

type PrimitiveGroup =
  | "color"
  | "size"
  | "space"
  | "radius"
  | "typography"
  | "animation"
  | "shadow"
  | "opacity"
  | "z-index"
  | "breakpoint"
  | "other";

function getSemanticGroup(name: string): SemanticGroup | null {
  if (name.startsWith("--background-")) return "background";
  if (name.startsWith("--text-")) return "text";
  if (name.startsWith("--border-")) return "border";
  if (name.startsWith("--icon-")) return "icon";
  if (name.startsWith("--interaction-")) return "interaction";
  if (name.startsWith("--blanket-")) return "blanket";
  if (name.startsWith("--logo-")) return "logo";
  return null;
}

function getPrimitiveGroup(name: string): PrimitiveGroup {
  if (/^--(red|salem|grey|white|black|blue-marguerite|blue-grey|porcelain|supernova|comete-biscay|comete-lightning-yellow|saffron|green-vogue)/.test(name))
    return "color";
  if (name.startsWith("--size")) return "size";
  if (name.startsWith("--space")) return "space";
  if (name.startsWith("--radius")) return "radius";
  if (
    name.startsWith("--font-") ||
    name.startsWith("--line-height-") ||
    name.startsWith("--letter-spacing-")
  )
    return "typography";
  if (name.startsWith("--duration-") || name.startsWith("--easing-"))
    return "animation";
  if (name.startsWith("--shadow-")) return "shadow";
  if (name.startsWith("--opacity-")) return "opacity";
  if (name.startsWith("--z-index-")) return "z-index";
  if (["--mobile", "--tablet", "--laptop", "--desktop"].includes(name))
    return "breakpoint";
  return "other";
}

// Sous-groupe d'un token background : --background-{subgroup}-*
function getBackgroundSubgroup(name: string): string {
  const parts = name.replace("--background-", "").split("-");
  return parts[0] ?? "other";
}

// Palette d'un token couleur : --{palette}-{shade}
function getColorPalette(name: string): string {
  return name.replace(/^--/, "").replace(/-\d+$/, "");
}

const semanticTokens = ALL_TOKENS.filter((t) => getSemanticGroup(t.name) !== null);
const primitiveTokens = ALL_TOKENS.filter((t) => getSemanticGroup(t.name) === null);

// -----------------------------------------------------------------------
// Utilitaires d'affichage

function isColorValue(value: string): boolean {
  return (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("rgba")
  );
}

function getComputedTokenValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// -----------------------------------------------------------------------
// Composants UI partagés

const S = {
  page: {
    padding: 24,
    fontFamily: "var(--font-family-primary, system-ui, sans-serif)",
    fontSize: 13,
    color: "var(--text-primary, #252a2c)",
    minHeight: "100vh",
    background: "var(--background-default-default, #fff)",
  },
  toolbar: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap" as const,
    marginBottom: 20,
    padding: "12px 16px",
    background: "var(--background-neutral-subtlest-default, #f7f8f8)",
    borderRadius: 10,
    border: "1px solid var(--border-default, #d8dedf)",
  },
  tabBar: {
    display: "flex",
    gap: 2,
    marginBottom: 20,
    borderBottom: "2px solid var(--border-default, #d8dedf)",
  },
  sectionTitle: {
    margin: "20px 0 10px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    color: "var(--text-subtlest, #6f8488)",
  },
  subgroupTitle: {
    margin: "14px 0 6px",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize" as const,
    color: "var(--text-subtle, #49585b)",
    borderLeft: "2px solid var(--border-default, #d8dedf)",
    paddingLeft: 8,
  },
} satisfies Record<string, CSSProperties>;

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

function Tab({ label, active, onClick, badge }: TabProps): ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        border: "none",
        borderBottom: active
          ? "2px solid var(--border-focus, #009bfe)"
          : "2px solid transparent",
        background: "transparent",
        color: active ? "var(--text-selected, #0076d8)" : "var(--text-subtle, #49585b)",
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        cursor: "pointer",
        marginBottom: -2,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
      {badge && (
        <span
          style={{
            fontSize: 10,
            padding: "1px 5px",
            borderRadius: 4,
            background: "var(--background-warning-subtlest-default, #fef2c3)",
            color: "var(--text-warning, #856d0e)",
            fontWeight: 600,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// -----------------------------------------------------------------------
// Ligne de token thématique

type CopiedField = { name: string; field: "var" | "value" };

interface TokenRowProps {
  token: TokenEntry;
  computedValue: string;
  copiedField: CopiedField | null;
  onCopy: (name: string, field: "var" | "value", text: string) => void;
}

function TokenRow({ token, computedValue, copiedField, onCopy }: TokenRowProps): ReactElement {
  const isColor = isColorValue(computedValue) || isColorValue(token.light);
  const hasThemeVariant = token.dark !== null && token.dark !== token.light;
  const resolvedValue = computedValue || token.light;
  const isCopiedVar = copiedField?.name === token.name && copiedField.field === "var";
  const isCopiedValue = copiedField?.name === token.name && copiedField.field === "value";
  const isAnyCopied = isCopiedVar || isCopiedValue;

  const clickableStyle: CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "monospace",
    textAlign: "left",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr auto",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        border: `1px solid ${isAnyCopied ? "var(--border-focus, #009bfe)" : "transparent"}`,
        borderRadius: 6,
        background: isAnyCopied
          ? "var(--background-selected-subtlest-default, #dceefd)"
          : "transparent",
        width: "100%",
        textAlign: "left",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      {/* Swatch */}
      {isColor ? (
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: `var(${token.name})`,
            border: "1px solid var(--border-default, #d8dedf)",
            flexShrink: 0,
            display: "block",
          }}
        />
      ) : (
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "var(--background-neutral-subtler-default, #eaedee)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: "var(--text-subtlest, #6f8488)",
            flexShrink: 0,
          }}
        >
          abc
        </span>
      )}

      {/* Nom + valeur — chacun cliquable indépendamment */}
      <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => { onCopy(token.name, "var", `var(${token.name})`); }}
          title={`Copier var(${token.name})`}
          style={{
            ...clickableStyle,
            fontSize: 12,
            color: isCopiedVar
              ? "var(--text-selected, #0076d8)"
              : "var(--text-primary, #252a2c)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isCopiedVar ? "✓ copié" : `var(${token.name})`}
        </button>
        <button
          type="button"
          onClick={() => { onCopy(token.name, "value", resolvedValue); }}
          title={`Copier ${resolvedValue}`}
          style={{
            ...clickableStyle,
            fontSize: 11,
            color: isCopiedValue
              ? "var(--text-selected, #0076d8)"
              : "var(--text-subtlest, #6f8488)",
          }}
        >
          {isCopiedValue ? "✓ copié" : resolvedValue}
        </button>
      </span>

      {/* Badge "thème" si la valeur change en dark */}
      {hasThemeVariant ? (
        <span
          style={{
            fontSize: 10,
            padding: "1px 5px",
            borderRadius: 4,
            background: "var(--background-brand-subtlest-default, #dceefd)",
            color: "var(--text-brand, #2467d1)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          light/dark
        </span>
      ) : (
        <span style={{ width: 64 }} />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Explorateur tokens thématiques

const SEMANTIC_TABS: SemanticGroup[] = [
  "background",
  "text",
  "border",
  "icon",
  "interaction",
  "blanket",
  "logo",
];

const SEMANTIC_TAB_LABELS: Record<SemanticGroup, string> = {
  background: "Background",
  text: "Text",
  border: "Border",
  icon: "Icon",
  interaction: "Interaction",
  blanket: "Blanket",
  logo: "Logo",
};

function SemanticExplorer({ search }: { search: string }): ReactElement {
  const [activeGroup, setActiveGroup] = useState<SemanticGroup>("background");
  const [tick, setTick] = useState(0);

  // Re-render quand le thème change (data-theme sur <html>)
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTick((n) => n + 1);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      obs.disconnect();
    };
  }, []);

  const [copiedField, setCopiedField] = useState<CopiedField | null>(null);
  const timerRef = useRef<number | null>(null);

  function handleCopy(_name: string, field: "var" | "value", text: string): void {
    void navigator.clipboard.writeText(text);
    setCopiedField({ name: _name, field });
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const groupTokens = semanticTokens.filter(
    (t) =>
      getSemanticGroup(t.name) === activeGroup &&
      (search === "" || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pour background : sous-groupes
  const isBackground = activeGroup === "background";
  const subgroups = isBackground
    ? [...new Set(groupTokens.map((t) => getBackgroundSubgroup(t.name)))]
    : null;

  // Clé pour forcer relecture de getComputedStyle
  void tick;

  return (
    <>
      <div style={S.tabBar}>
        {SEMANTIC_TABS.map((g) => {
          const count = semanticTokens.filter(
            (t) =>
              getSemanticGroup(t.name) === g &&
              (search === "" || t.name.toLowerCase().includes(search.toLowerCase()))
          ).length;
          return (
            <Tab
              key={g}
              label={`${SEMANTIC_TAB_LABELS[g]} (${count})`}
              active={activeGroup === g}
              onClick={() => {
                setActiveGroup(g);
              }}
            />
          );
        })}
      </div>

      {groupTokens.length === 0 && (
        <p style={{ color: "var(--text-subtlest, #6f8488)", padding: "24px 0" }}>
          Aucun token pour cette recherche.
        </p>
      )}

      {isBackground && subgroups
        ? subgroups.map((sg) => {
            const tokens = groupTokens.filter(
              (t) => getBackgroundSubgroup(t.name) === sg
            );
            if (tokens.length === 0) return null;
            return (
              <div key={sg}>
                <p style={S.subgroupTitle}>{sg}</p>
                {tokens.map((t) => (
                  <TokenRow
                    key={t.name}
                    token={t}
                    computedValue={getComputedTokenValue(t.name)}
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            );
          })
        : groupTokens.map((t) => (
            <TokenRow
              key={t.name}
              token={t}
              computedValue={getComputedTokenValue(t.name)}
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          ))}
    </>
  );
}

// -----------------------------------------------------------------------
// Explorateur tokens primitifs

const PRIMITIVE_GROUPS: PrimitiveGroup[] = [
  "color",
  "size",
  "space",
  "radius",
  "typography",
  "animation",
  "shadow",
  "opacity",
  "z-index",
  "breakpoint",
];

const PRIMITIVE_LABELS: Record<PrimitiveGroup, string> = {
  color: "Couleurs",
  size: "Tailles",
  space: "Espacement",
  radius: "Radius",
  typography: "Typographie",
  animation: "Animation",
  shadow: "Ombres",
  opacity: "Opacité",
  "z-index": "Z-index",
  breakpoint: "Breakpoints",
  other: "Autres",
};

function PrimitiveExplorer({ search }: { search: string }): ReactElement {
  const [activeGroup, setActiveGroup] = useState<PrimitiveGroup>("color");
  const [copiedField, setCopiedField] = useState<CopiedField | null>(null);
  const timerRef = useRef<number | null>(null);

  function handleCopy(_name: string, field: "var" | "value", text: string): void {
    void navigator.clipboard.writeText(text);
    setCopiedField({ name: _name, field });
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const groupTokens = primitiveTokens.filter(
    (t) =>
      getPrimitiveGroup(t.name) === activeGroup &&
      (search === "" || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pour les couleurs : sous-groupes par palette
  const isColor = activeGroup === "color";
  const palettes = isColor
    ? [...new Set(groupTokens.map((t) => getColorPalette(t.name)))]
    : null;

  return (
    <>
      {/* Avertissement */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "10px 14px",
          background: "var(--background-warning-subtlest-default, #fef2c3)",
          border: "1px solid var(--border-warning, #caa204)",
          borderRadius: 8,
          marginBottom: 20,
          color: "var(--text-warning, #856d0e)",
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 16 }}>⚠</span>
        <span>
          <strong>Tokens primitifs — usage exceptionnel uniquement.</strong>
          <br />
          Dans quasiment tous les cas, utilise les{" "}
          <strong>tokens thématiques</strong> (onglet précédent). Les primitifs
          ne répondent pas au changement de thème light/dark.
        </span>
      </div>

      <div style={S.tabBar}>
        {PRIMITIVE_GROUPS.map((g) => {
          const count = primitiveTokens.filter(
            (t) =>
              getPrimitiveGroup(t.name) === g &&
              (search === "" || t.name.toLowerCase().includes(search.toLowerCase()))
          ).length;
          if (count === 0 && search !== "") return null;
          return (
            <Tab
              key={g}
              label={`${PRIMITIVE_LABELS[g]} (${count})`}
              active={activeGroup === g}
              onClick={() => {
                setActiveGroup(g);
              }}
            />
          );
        })}
      </div>

      {/* Palette couleurs */}
      {isColor && palettes
        ? palettes.map((palette) => {
            const tokens = groupTokens.filter(
              (t) => getColorPalette(t.name) === palette
            );
            return (
              <div key={palette}>
                <p style={S.subgroupTitle}>{palette}</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {tokens.map((t) => {
                    const shade = t.name.split("-").pop() ?? "";
                    const isCopiedVar = copiedField?.name === t.name && copiedField.field === "var";
                    const isCopiedValue = copiedField?.name === t.name && copiedField.field === "value";
                    const isAnyCopied = isCopiedVar || isCopiedValue;
                    return (
                      <div
                        key={t.name}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 2px",
                          border: `1.5px solid ${isAnyCopied ? "var(--border-focus, #009bfe)" : "transparent"}`,
                          borderRadius: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            background: `var(${t.name}, ${t.light})`,
                            border: "1px solid var(--border-default, #d8dedf)",
                            display: "block",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => { handleCopy(t.name, "var", `var(${t.name})`); }}
                          title={`Copier var(${t.name})`}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: 10,
                            fontFamily: "monospace",
                            color: isCopiedVar
                              ? "var(--text-selected, #0076d8)"
                              : "var(--text-subtlest, #6f8488)",
                          }}
                        >
                          {isCopiedVar ? "✓ var" : shade}
                        </button>
                        <button
                          type="button"
                          onClick={() => { handleCopy(t.name, "value", t.light); }}
                          title={`Copier ${t.light}`}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: 9,
                            fontFamily: "monospace",
                            color: isCopiedValue
                              ? "var(--text-selected, #0076d8)"
                              : "var(--text-subtlest, #9eaaac)",
                          }}
                        >
                          {isCopiedValue ? "✓ hex" : t.light}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        : /* Autres groupes : liste simple */
          groupTokens.map((t) => (
            <TokenRow
              key={t.name}
              token={t}
              computedValue={getComputedTokenValue(t.name)}
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          ))}
    </>
  );
}

// -----------------------------------------------------------------------
// Page principale

function TokenExplorer(): ReactElement {
  const [mainTab, setMainTab] = useState<"semantic" | "primitive">("semantic");
  const [search, setSearch] = useState("");

  const semanticCount = semanticTokens.length;
  const primitiveCount = primitiveTokens.length;

  return (
    <div style={S.page}>
      {/* Titre + onglets principaux */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          marginBottom: 20,
          borderBottom: "2px solid var(--border-default, #d8dedf)",
        }}
      >
        <Tab
          label={`Tokens thématiques (${semanticCount})`}
          active={mainTab === "semantic"}
          onClick={() => {
            setMainTab("semantic");
          }}
        />
        <Tab
          label={`Tokens primitifs (${primitiveCount})`}
          active={mainTab === "primitive"}
          onClick={() => {
            setMainTab("primitive");
          }}
          badge="usage exceptionnel"
        />
      </div>

      {/* Barre de recherche */}
      <div style={S.toolbar}>
        <input
          type="search"
          placeholder="Rechercher un token…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          style={{
            flex: "1 1 240px",
            padding: "6px 10px",
            border: "1px solid var(--border-default, #d8dedf)",
            borderRadius: 6,
            background: "var(--background-default-default, #fff)",
            color: "var(--text-primary, #252a2c)",
            fontSize: 13,
          }}
        />
        <span style={{ fontSize: 12, color: "var(--text-subtlest, #6f8488)" }}>
          Cliquer sur la var pour copier{" "}
          <code
            style={{
              background: "var(--background-neutral-subtler-default, #eaedee)",
              padding: "1px 4px",
              borderRadius: 3,
            }}
          >
            var(--nom)
          </code>
          , sur la valeur pour copier le hex/valeur brute
        </span>
      </div>

      {mainTab === "semantic" ? (
        <SemanticExplorer search={search} />
      ) : (
        <PrimitiveExplorer search={search} />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Story

const meta = {
  title: "Foundation/Tokens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllTokens: Story = {
  name: "Token Explorer",
  render: () => <TokenExplorer />,
};
