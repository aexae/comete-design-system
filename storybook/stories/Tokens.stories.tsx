// Token Explorer — parcourir les tokens de @naxit/comete-design-tokens
import tokensRaw from "@naxit/comete-design-tokens/css?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// -----------------------------------------------------------------------
// Parsing du fichier CSS

interface TokenEntry {
  name: string;
  light: string;
  dark: string | null;
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
      if (depth === 0) { end = i; break; }
    }
  }
  return css.slice(start + 1, end);
}

function buildTokenEntries(): TokenEntry[] {
  const rootLight = new Map<string, string>();
  const rootRe = /:root\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = rootRe.exec(tokensRaw)) !== null) {
    const idx = tokensRaw.indexOf(":root", m.index);
    const start = tokensRaw.indexOf("{", idx);
    let depth = 0, end = start;
    for (let i = start; i < tokensRaw.length; i++) {
      if (tokensRaw[i] === "{") depth++;
      else if (tokensRaw[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    parseBlock(tokensRaw.slice(start + 1, end)).forEach((v, k) => rootLight.set(k, v));
  }
  const rootDark = parseBlock(extractBlock(tokensRaw, '[data-theme="dark"]'));
  const entries: TokenEntry[] = [];
  rootLight.forEach((light, name) => entries.push({ name, light, dark: rootDark.get(name) ?? null }));
  return entries;
}

const ALL_TOKENS = buildTokenEntries().sort((a, b) => a.name.localeCompare(b.name));

// -----------------------------------------------------------------------
// Catégorisation

type SemanticGroup = "background" | "text" | "border" | "icon" | "interaction" | "blanket" | "logo";
type PrimitiveGroup = "color" | "size" | "space" | "radius" | "typography" | "animation" | "shadow" | "opacity" | "z-index" | "breakpoint" | "other";

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
  if (/^--(red|salem|grey|white|black|blue-marguerite|blue-grey|porcelain|supernova|comete-biscay|comete-lightning-yellow|saffron|green-vogue|orange|lime)/.test(name))
    return "color";
  if (name.startsWith("--size")) return "size";
  if (name.startsWith("--space")) return "space";
  if (name.startsWith("--radius")) return "radius";
  if (name.startsWith("--font-") || name.startsWith("--line-height-") || name.startsWith("--letter-spacing-"))
    return "typography";
  if (name.startsWith("--duration-") || name.startsWith("--easing-")) return "animation";
  if (name.startsWith("--shadow-") || name.startsWith("--elevation-")) return "shadow";
  if (name.startsWith("--opacity-")) return "opacity";
  if (name.startsWith("--z-index-")) return "z-index";
  if (["--mobile", "--tablet", "--laptop", "--desktop"].includes(name)) return "breakpoint";
  return "other";
}

function getBackgroundSubgroup(name: string): string {
  return name.replace("--background-", "").split("-")[0] ?? "other";
}

function getColorPalette(name: string): string {
  return name.replace(/^--/, "").replace(/-\d+[A-Z]*$/, "");
}

const semanticTokens = ALL_TOKENS.filter((t) => getSemanticGroup(t.name) !== null);
const primitiveTokens = ALL_TOKENS.filter((t) => getSemanticGroup(t.name) === null);

// -----------------------------------------------------------------------
// Utilitaires

function isColorValue(v: string): boolean {
  return v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl") || v.startsWith("rgba");
}

function getComputedTokenValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function useCopy(): [
  { name: string; field: "var" | "value" } | null,
  (name: string, field: "var" | "value", text: string) => void,
] {
  const [copied, setCopied] = useState<{ name: string; field: "var" | "value" } | null>(null);
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);
  const handleCopy = useCallback((name: string, field: "var" | "value", text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied({ name, field });
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(null), 1500);
  }, []);
  return [copied, handleCopy];
}

// -----------------------------------------------------------------------
// Styles partagés

const S = {
  page: { display: "flex", fontFamily: "var(--font-family-primary, system-ui, sans-serif)", fontSize: 13, color: "var(--text-default)", minHeight: "100vh", background: "var(--background-surface-default)" } satisfies CSSProperties,
  sidebar: { position: "sticky" as const, top: 0, alignSelf: "flex-start", width: 220, flexShrink: 0, padding: "24px 0 24px 24px", borderRight: "1px solid var(--border-default)", overflowY: "auto" as const, maxHeight: "100vh" } satisfies CSSProperties,
  toolbar: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" as const, marginBottom: 20, padding: "12px 16px", background: "var(--background-surface-elevation-sunken-default)", borderRadius: 10, border: "1px solid var(--border-default)" } satisfies CSSProperties,
  topTabBar: { display: "flex", gap: 0, borderBottom: "2px solid var(--border-default)", marginBottom: 24 } satisfies CSSProperties,
  subTabBar: { display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid var(--border-default)" } satisfies CSSProperties,
  subgroupTitle: { margin: "14px 0 6px", fontSize: 11, fontWeight: 600, textTransform: "capitalize" as const, color: "var(--text-subtle)", borderLeft: "2px solid var(--border-default)", paddingLeft: 8 } satisfies CSSProperties,
};

// -----------------------------------------------------------------------
// UI partagés

function Tab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: string }): ReactElement {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "8px 16px", border: "none",
      borderBottom: active ? "2px solid var(--border-focus)" : "2px solid transparent",
      background: "transparent", color: active ? "var(--text-selected)" : "var(--text-subtle)",
      fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer", marginBottom: -2,
      display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
    }}>
      {label}
      {badge && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "var(--background-warning-subtlest-default)", color: "var(--text-warning)", fontWeight: 600 }}>{badge}</span>}
    </button>
  );
}

function NavLink({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }): ReactElement {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
      padding: "6px 12px", border: "none",
      borderLeft: active ? "2px solid var(--border-focus)" : "2px solid transparent",
      background: active ? "var(--background-selected-subtlest-default)" : "transparent",
      color: active ? "var(--text-selected)" : "var(--text-subtle)",
      fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left", borderRadius: 0,
    }}>
      {label}
      <span style={{ fontSize: 11, color: "var(--text-subtlest)", fontWeight: 400 }}>{count}</span>
    </button>
  );
}

function TokenRow({ token, computedValue, copiedField, onCopy }: {
  token: TokenEntry; computedValue: string;
  copiedField: { name: string; field: "var" | "value" } | null;
  onCopy: (name: string, field: "var" | "value", text: string) => void;
}): ReactElement {
  const isColor = isColorValue(computedValue) || isColorValue(token.light);
  const hasThemeVariant = token.dark !== null && token.dark !== token.light;
  const resolvedValue = computedValue || token.light;
  const isCopiedVar = copiedField?.name === token.name && copiedField.field === "var";
  const isCopiedValue = copiedField?.name === token.name && copiedField.field === "value";
  const isAnyCopied = isCopiedVar || isCopiedValue;
  const btn: CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "monospace", textAlign: "left" };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "32px 1fr auto", alignItems: "center", gap: 10,
      padding: "6px 10px", border: `1px solid ${isAnyCopied ? "var(--border-focus)" : "transparent"}`,
      borderRadius: 6, background: isAnyCopied ? "var(--background-selected-subtlest-default)" : "transparent",
      width: "100%", textAlign: "left", transition: "background 0.1s, border-color 0.1s",
    }}>
      {isColor
        ? <span style={{ width: 28, height: 28, borderRadius: 6, background: `var(${token.name})`, border: "1px solid var(--border-default)", flexShrink: 0, display: "block" }} />
        : <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--background-neutral-subtler-default)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--text-subtlest)", flexShrink: 0 }}>abc</span>}
      <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <button type="button" onClick={() => { onCopy(token.name, "var", `var(${token.name})`); }} title={`Copier var(${token.name})`}
          style={{ ...btn, fontSize: 12, color: isCopiedVar ? "var(--text-selected)" : "var(--text-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isCopiedVar ? "✓ copié" : token.name.replace(/^--/, "")}
        </button>
        <button type="button" onClick={() => { onCopy(token.name, "value", resolvedValue); }} title={`Copier ${resolvedValue}`}
          style={{ ...btn, fontSize: 11, color: isCopiedValue ? "var(--text-selected)" : "var(--text-subtlest)" }}>
          {isCopiedValue ? "✓ copié" : resolvedValue}
        </button>
      </span>
      {hasThemeVariant
        ? <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "var(--background-brand-subtlest-default)", color: "var(--text-brand)", whiteSpace: "nowrap", flexShrink: 0 }}>light/dark</span>
        : <span style={{ width: 64 }} />}
    </div>
  );
}

function ColorSwatch({ token: t, copiedField, onCopy }: {
  token: TokenEntry;
  copiedField: { name: string; field: "var" | "value" } | null;
  onCopy: (name: string, field: "var" | "value", text: string) => void;
}): ReactElement {
  const shade = t.name.split("-").pop() ?? "";
  const isCopiedVar = copiedField?.name === t.name && copiedField.field === "var";
  const isCopiedValue = copiedField?.name === t.name && copiedField.field === "value";
  const isAnyCopied = isCopiedVar || isCopiedValue;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 2px", border: `1.5px solid ${isAnyCopied ? "var(--border-focus)" : "transparent"}`, borderRadius: 6 }}>
      <span style={{ width: 40, height: 40, borderRadius: 6, background: `var(${t.name}, ${t.light})`, border: "1px solid var(--border-default)", display: "block" }} />
      <button type="button" onClick={() => onCopy(t.name, "var", `var(${t.name})`)} title={`Copier var(${t.name})`}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 10, fontFamily: "monospace", color: isCopiedVar ? "var(--text-selected)" : "var(--text-subtlest)" }}>
        {isCopiedVar ? "✓ var" : shade}
      </button>
      <button type="button" onClick={() => onCopy(t.name, "value", t.light)} title={`Copier ${t.light}`}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 9, fontFamily: "monospace", color: isCopiedValue ? "var(--text-selected)" : "var(--text-subtlest)" }}>
        {isCopiedValue ? "✓ hex" : t.light}
      </button>
    </div>
  );
}

// =======================================================================
// TAB 1 — All Tokens
// =======================================================================

const SEMANTIC_GROUPS: SemanticGroup[] = ["background", "text", "border", "icon", "interaction", "blanket", "logo"];
const SEMANTIC_LABELS: Record<SemanticGroup, string> = { background: "Background", text: "Text", border: "Border", icon: "Icon", interaction: "Interaction", blanket: "Blanket", logo: "Logo" };
const PRIMITIVE_GROUPS: PrimitiveGroup[] = ["color", "size", "space", "radius", "typography", "animation", "shadow", "opacity", "z-index", "breakpoint"];
const PRIMITIVE_LABELS: Record<PrimitiveGroup, string> = { color: "Couleurs", size: "Tailles", space: "Espacement", radius: "Radius", typography: "Typographie", animation: "Animation", shadow: "Ombres", opacity: "Opacité", "z-index": "Z-index", breakpoint: "Breakpoints", other: "Autres" };

function AllTokensTab(): ReactElement {
  const [category, setCategory] = useState<"semantic" | "primitive">("semantic");
  const [semanticGroup, setSemanticGroup] = useState<SemanticGroup>("background");
  const [primitiveGroup, setPrimitiveGroup] = useState<PrimitiveGroup>("color");
  const [search, setSearch] = useState("");
  const [copiedField, handleCopy] = useCopy();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => setTick((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  void tick;

  const filteredSemantic = useMemo(() => semanticTokens.filter((t) => search === "" || t.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const filteredPrimitive = useMemo(() => primitiveTokens.filter((t) => search === "" || t.name.toLowerCase().includes(search.toLowerCase())), [search]);

  const activeTokens = category === "semantic"
    ? filteredSemantic.filter((t) => getSemanticGroup(t.name) === semanticGroup)
    : filteredPrimitive.filter((t) => getPrimitiveGroup(t.name) === primitiveGroup);

  const isColorPalette = category === "primitive" && primitiveGroup === "color";
  const palettes = isColorPalette ? [...new Set(activeTokens.map((t) => getColorPalette(t.name)))] : null;
  const isBackground = category === "semantic" && semanticGroup === "background";
  const subgroups = isBackground ? [...new Set(activeTokens.map((t) => getBackgroundSubgroup(t.name)))] : null;

  return (
    <div style={{ display: "flex", minHeight: "100%" }}>
      <nav style={S.sidebar}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtlest)", margin: "0 0 8px 12px" }}>Thématiques</p>
        {SEMANTIC_GROUPS.map((g) => (
          <NavLink key={g} label={SEMANTIC_LABELS[g]} count={filteredSemantic.filter((t) => getSemanticGroup(t.name) === g).length} active={category === "semantic" && semanticGroup === g} onClick={() => { setCategory("semantic"); setSemanticGroup(g); }} />
        ))}
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-subtlest)", margin: "20px 0 8px 12px" }}>Primitifs</p>
        {PRIMITIVE_GROUPS.map((g) => {
          const count = filteredPrimitive.filter((t) => getPrimitiveGroup(t.name) === g).length;
          if (count === 0 && search !== "") return null;
          return <NavLink key={g} label={PRIMITIVE_LABELS[g]} count={count} active={category === "primitive" && primitiveGroup === g} onClick={() => { setCategory("primitive"); setPrimitiveGroup(g); }} />;
        })}
      </nav>

      <div style={{ flex: 1, minWidth: 0, padding: 24 }}>
        <div style={S.toolbar}>
          <input type="search" placeholder="Rechercher un token…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 240px", padding: "6px 10px", border: "1px solid var(--border-default)", borderRadius: 6, background: "var(--background-default-default)", color: "var(--text-default)", fontSize: 13, fontFamily: "inherit" }} />
          <span style={{ fontSize: 12, color: "var(--text-subtlest)" }}>
            Cliquer sur le nom pour copier <code style={{ background: "var(--background-neutral-subtler-default)", padding: "1px 4px", borderRadius: 3 }}>var(--nom)</code>, sur la valeur pour copier le hex/valeur brute
          </span>
        </div>

        {category === "primitive" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "var(--background-warning-subtlest-default)", border: "1px solid var(--border-warning)", borderRadius: 8, marginBottom: 20, color: "var(--text-warning)", fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <span><strong>Tokens primitifs — usage exceptionnel uniquement.</strong><br />Dans quasiment tous les cas, utilise les <strong>tokens thématiques</strong>. Les primitifs ne répondent pas au changement de thème light/dark.</span>
          </div>
        )}

        {activeTokens.length === 0 && <p style={{ color: "var(--text-subtlest)", padding: "24px 0" }}>Aucun token pour cette recherche.</p>}

        {isBackground && subgroups
          ? subgroups.map((sg) => {
              const tokens = activeTokens.filter((t) => getBackgroundSubgroup(t.name) === sg);
              if (tokens.length === 0) return null;
              return (<div key={sg}><p style={S.subgroupTitle}>{sg}</p>{tokens.map((t) => <TokenRow key={t.name} token={t} computedValue={getComputedTokenValue(t.name)} copiedField={copiedField} onCopy={handleCopy} />)}</div>);
            })
          : isColorPalette && palettes
            ? palettes.map((palette) => {
                const tokens = activeTokens.filter((t) => getColorPalette(t.name) === palette);
                return (<div key={palette}><p style={S.subgroupTitle}>{palette}</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 4, marginBottom: 8 }}>{tokens.map((t) => <ColorSwatch key={t.name} token={t} copiedField={copiedField} onCopy={handleCopy} />)}</div></div>);
              })
            : activeTokens.map((t) => <TokenRow key={t.name} token={t} computedValue={getComputedTokenValue(t.name)} copiedField={copiedField} onCopy={handleCopy} />)}
      </div>
    </div>
  );
}

// =======================================================================
// TAB 2 — Code
// =======================================================================

function CodeBlock({ children }: { children: string }): ReactElement {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  function handleCopy() {
    void navigator.clipboard.writeText(children);
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <pre style={{ background: "var(--background-surface-elevation-sunken-default)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "16px 48px 16px 16px", overflow: "auto", fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-family-code, 'SF Mono', monospace)", color: "var(--text-default)", margin: 0 }}>
        <code>{children}</code>
      </pre>
      <button type="button" onClick={handleCopy} title="Copier"
        style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", border: "1px solid var(--border-default)", borderRadius: 4, background: "var(--background-default-default)", color: copied ? "var(--text-selected)" : "var(--text-subtlest)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
        {copied ? "✓" : "Copier"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-default)", margin: "0 0 12px" }}>{title}</h3>
      {children}
    </div>
  );
}

function CodeTab(): ReactElement {
  return (
    <div style={{ maxWidth: 720, padding: 24 }}>
      <Section title="Installation">
        <CodeBlock>{`pnpm add @naxit/comete-design-tokens`}</CodeBlock>
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6 }}>
          Les tokens sont distribués sous forme de CSS custom properties. Importez le fichier CSS à la racine de votre application.
        </p>
        <CodeBlock>{`import "@naxit/comete-design-tokens/css";`}</CodeBlock>
      </Section>

      <Section title="Utilisation en CSS Modules">
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, marginBottom: 12 }}>
          Référencez directement les custom properties dans vos fichiers <code>.module.css</code>.
        </p>
        <CodeBlock>{`.card {
  background-color: var(--background-surface-elevation-raise-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius050);
  color: var(--text-default);
  padding: var(--space200);
  box-shadow: var(--elevation-small);
}`}</CodeBlock>
      </Section>

      <Section title="Utilisation inline (style)">
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, marginBottom: 12 }}>
          Les tokens fonctionnent aussi dans les attributs <code>style</code> JSX.
        </p>
        <CodeBlock>{`<div
  style={{
    background: "var(--background-brand-bold-default)",
    color: "var(--text-inverted)",
    padding: "var(--space200)",
    borderRadius: "var(--radius100)",
  }}
>
  Contenu
</div>`}</CodeBlock>
      </Section>

      <Section title="Thème light / dark">
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, marginBottom: 12 }}>
          Les tokens thématiques changent automatiquement de valeur selon l&apos;attribut <code>data-theme</code> sur <code>&lt;html&gt;</code>. Utilisez le <code>ThemeProvider</code> du DS pour gérer le basculement.
        </p>
        <CodeBlock>{`import { ThemeProvider } from "@naxit/comete-design-system/providers";

<ThemeProvider mode="dark">
  <App />
</ThemeProvider>`}</CodeBlock>
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6 }}>
          Les <strong>tokens thématiques</strong> (background, text, border, icon…) s&apos;adaptent automatiquement. Les <strong>tokens primitifs</strong> (couleurs hex, tailles, radius…) restent identiques quel que soit le thème.
        </p>
      </Section>

      <Section title="Conventions de nommage">
        <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, marginBottom: 12 }}>Les tokens suivent un schéma hiérarchique :</p>
        <CodeBlock>{`--{catégorie}-{rôle}-{variante}-{état}

Exemples :
  --background-brand-bold-default
  --text-default
  --border-focus
  --icon-subtle
  --shadow-key-2
  --radius050          (primitif : 4px)
  --space200           (primitif : 16px)
  --porcelain-300      (primitif : couleur)`}</CodeBlock>
      </Section>
    </div>
  );
}

// =======================================================================
// TAB 3 — Examples
// =======================================================================

function ExampleCard({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: 24, background: "var(--background-surface-default)" }}>{children}</div>
      <div style={{ padding: "8px 16px", background: "var(--background-surface-elevation-sunken-default)", borderTop: "1px solid var(--border-default)", fontSize: 12, fontWeight: 600, color: "var(--text-subtle)" }}>{title}</div>
    </div>
  );
}

function ExamplesTab(): ReactElement {
  return (
    <div style={{ maxWidth: 720, padding: 24 }}>
      <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.6, marginBottom: 24 }}>
        Exemples visuels montrant les tokens en contexte. Basculez le thème (icône soleil/lune dans la toolbar Storybook) pour voir l&apos;adaptation.
      </p>

      <ExampleCard title="Background surfaces">
        <div style={{ display: "flex", gap: 12 }}>
          {[["surface-default", "--background-surface-default"], ["surface-raise", "--background-surface-elevation-raise-default"], ["surface-sunken", "--background-surface-elevation-sunken-default"]].map(([label, token]) => (
            <div key={token} style={{ flex: 1, padding: 16, borderRadius: 8, background: `var(${token})`, border: "1px solid var(--border-default)", fontSize: 11, fontFamily: "monospace", color: "var(--text-subtle)" }}>{label}</div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title="Text hierarchy">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--text-default)", fontSize: 16, fontWeight: 600 }}>text-default — Titre principal</span>
          <span style={{ color: "var(--text-subtle)", fontSize: 14 }}>text-subtle — Texte secondaire</span>
          <span style={{ color: "var(--text-subtlest)", fontSize: 13 }}>text-subtlest — Texte tertiaire, placeholders</span>
          <span style={{ color: "var(--text-disabled)", fontSize: 13 }}>text-disabled — Texte désactivé</span>
        </div>
      </ExampleCard>

      <ExampleCard title="Status colors">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[["success", "--background-success-subtlest-default", "--text-success"], ["information", "--background-information-subtlest-default", "--text-information"], ["warning", "--background-warning-subtlest-default", "--text-warning"], ["critical", "--background-critical-subtlest-default", "--text-critical"]].map(([label, bgToken, textToken]) => (
            <div key={label} style={{ padding: "8px 16px", borderRadius: 6, background: `var(${bgToken})`, color: `var(${textToken})`, fontSize: 13, fontWeight: 500 }}>{label}</div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title="Elevation / shadows">
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {["none", "xsmall", "small", "medium", "large"].map((level) => (
            <div key={level} style={{ width: 64, height: 64, borderRadius: 8, background: "var(--background-surface-elevation-raise-default)", boxShadow: `var(--elevation-${level})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-subtlest)", fontFamily: "monospace" }}>{level}</div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title="Border & radius">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[["radius025", "2px"], ["radius050", "4px"], ["radius100", "8px"], ["radius150", "12px"], ["radius200", "16px"]].map(([token, label]) => (
            <div key={token} style={{ width: 48, height: 48, border: "2px solid var(--border-default)", borderRadius: `var(--${token})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-subtlest)", fontFamily: "monospace" }}>{label}</div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title="Spacing scale">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["050", "100", "150", "200", "300", "400"].map((n) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 56, fontSize: 10, fontFamily: "monospace", color: "var(--text-subtlest)", textAlign: "right" }}>space{n}</span>
              <div style={{ height: 12, width: `var(--space${n})`, background: "var(--background-brand-bold-default)", borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </ExampleCard>
    </div>
  );
}

// =======================================================================
// TAB 4 — Changelog
// =======================================================================

function ChangelogEntry({ version, title, children }: { version: string; title: string; children: ReactNode }): ReactElement {
  return (
    <div style={{ marginBottom: 24, paddingLeft: 16, borderLeft: "2px solid var(--border-default)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", padding: "1px 6px", borderRadius: 4, background: "var(--background-brand-subtlest-default)", color: "var(--text-brand)" }}>{version}</span>
        <span style={{ fontWeight: 600, color: "var(--text-default)" }}>{title}</span>
      </div>
      <p style={{ margin: 0, color: "var(--text-subtle)" }}>{children}</p>
    </div>
  );
}

function ChangelogTab(): ReactElement {
  return (
    <div style={{ maxWidth: 720, padding: 24, fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.8 }}>
      <p style={{ color: "var(--text-subtlest)", marginBottom: 24 }}>Historique des changements significatifs dans <code>@naxit/comete-design-tokens</code>.</p>
      <ChangelogEntry version="0.4.6" title="Renommage text-default, nouvelles palettes">
        Renommage <code>--text-default</code> → <code>--text-default</code>. Ajout des palettes <code>orange</code> et <code>lime</code> (11 shades chacune, basées sur Atlassian Design).
      </ChangelogEntry>
      <ChangelogEntry version="0.4.5" title="Tokens d'élévation">
        Ajout des tokens <code>--elevation-*</code> (none, xsmall, small, medium, large, xlarge, xxlarge) et des composites <code>--shadow-key-*</code> / <code>--shadow-ambiant-*</code>.
      </ChangelogEntry>
      <ChangelogEntry version="0.4.0" title="Thème dark complet">
        Refonte du thème dark avec tous les tokens thématiques (background, text, border, icon, interaction).
      </ChangelogEntry>
      <ChangelogEntry version="0.3.0" title="Publication initiale">
        Première version avec tokens primitifs (couleurs, tailles, espacements, radius, typographie) et tokens thématiques light.
      </ChangelogEntry>
    </div>
  );
}

// =======================================================================
// Page principale — 4 onglets
// =======================================================================

type MainTab = "all-tokens" | "code" | "examples" | "changelog";

function TokenExplorer(): ReactElement {
  const [mainTab, setMainTab] = useState<MainTab>("all-tokens");
  return (
    <div style={S.page}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ ...S.topTabBar, position: "sticky", top: 0, zIndex: 10, background: "var(--background-surface-default)", paddingLeft: 24 }}>
          <Tab label={`All tokens (${ALL_TOKENS.length})`} active={mainTab === "all-tokens"} onClick={() => setMainTab("all-tokens")} />
          <Tab label="Code" active={mainTab === "code"} onClick={() => setMainTab("code")} />
          <Tab label="Examples" active={mainTab === "examples"} onClick={() => setMainTab("examples")} />
          <Tab label="Changelog" active={mainTab === "changelog"} onClick={() => setMainTab("changelog")} />
        </div>
        {mainTab === "all-tokens" && <AllTokensTab />}
        {mainTab === "code" && <CodeTab />}
        {mainTab === "examples" && <ExamplesTab />}
        {mainTab === "changelog" && <ChangelogTab />}
      </div>
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
