// ---------------------------------------------------------------------------
// compose — markup SSR (spans + <svg> superposés) → SVG unique autonome
// ---------------------------------------------------------------------------
//
// `LogoFrame` compose un logo à partir de plusieurs <svg> assemblés en HTML :
// wordmark, icône en overlay absolu, suffixe en flex row ou column. Power BI
// n'accepte qu'un SVG unique : ce module rejoue le placement — que LogoFrame
// exprime déjà entièrement en pixels — et réémet un seul SVG.
//
// Le sous-ensemble CSS à couvrir est volontairement étroit : c'est celui, et
// seulement celui, que LogoFrame produit (inline-flex row/column, alignItems,
// position absolute avec left/top, marges). Toute construction hors de ce
// périmètre lève, pour éviter un kit silencieusement décalé.

interface Style {
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  position?: string;
  left?: number;
  top?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  width?: number;
  height?: number;
  vars: Map<string, string>;
}

type Node =
  | { kind: "span"; style: Style; children: Node[] }
  | { kind: "svg"; attrs: Map<string, string>; inner: string };

// ---------------------------------------------------------------------------
// Parsing

function parseStyle(raw: string): Style {
  const style: Style = { vars: new Map() };
  for (const decl of raw.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop) continue;

    if (prop.startsWith("--")) {
      style.vars.set(prop, value);
      continue;
    }
    const px = (): number | undefined => {
      const n = Number.parseFloat(value);
      return Number.isNaN(n) ? undefined : n;
    };
    switch (prop) {
      case "display": style.display = value; break;
      case "flex-direction": style.flexDirection = value; break;
      case "align-items": style.alignItems = value; break;
      case "position": style.position = value; break;
      case "left": style.left = px(); break;
      case "top": style.top = px(); break;
      case "margin-top": style.marginTop = px(); break;
      case "margin-right": style.marginRight = px(); break;
      case "margin-bottom": style.marginBottom = px(); break;
      case "margin-left": style.marginLeft = px(); break;
      case "width": style.width = px(); break;
      case "height": style.height = px(); break;
      default: break; // line-height, etc. : sans effet sur la géométrie ici
    }
  }
  return style;
}

function parseAttrs(tag: string): Map<string, string> {
  const attrs = new Map<string, string>();
  for (const [, name, value] of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    if (name) attrs.set(name, value ?? "");
  }
  return attrs;
}

/** Parse le markup en arbre span/svg. Le contenu d'un <svg> reste opaque. */
export function parseMarkup(html: string): Node {
  let pos = 0;

  function parseNodes(): Node[] {
    const nodes: Node[] = [];
    while (pos < html.length) {
      const open = html.indexOf("<", pos);
      if (open === -1) break;
      if (html.startsWith("</", open)) return nodes; // fermeture : rendre la main
      const close = html.indexOf(">", open);
      if (close === -1) break;
      const tag = html.slice(open, close + 1);

      if (tag.startsWith("<span")) {
        pos = close + 1;
        const children = parseNodes();
        const end = html.indexOf("</span>", pos);
        if (end === -1) throw new Error("</span> manquante dans le markup SSR");
        pos = end + "</span>".length;
        nodes.push({ kind: "span", style: parseStyle(parseAttrs(tag).get("style") ?? ""), children });
      } else if (tag.startsWith("<svg")) {
        const end = html.indexOf("</svg>", close);
        if (end === -1) throw new Error("</svg> manquante dans le markup SSR");
        nodes.push({ kind: "svg", attrs: parseAttrs(tag), inner: html.slice(close + 1, end) });
        pos = end + "</svg>".length;
      } else {
        throw new Error(`Balise inattendue dans le markup logo : ${tag.slice(0, 40)}`);
      }
    }
    return nodes;
  }

  const roots = parseNodes();
  if (roots.length !== 1 || !roots[0]) throw new Error("Le markup logo doit avoir une racine unique");
  return roots[0];
}

// ---------------------------------------------------------------------------
// Mesure

interface Size { width: number; height: number }

function outerSize(node: Node): Size {
  const inner = measure(node);
  if (node.kind !== "span") return inner;
  const s = node.style;
  return {
    width: inner.width + (s.marginLeft ?? 0) + (s.marginRight ?? 0),
    height: inner.height + (s.marginTop ?? 0) + (s.marginBottom ?? 0),
  };
}

/** Enfants participant au flux (les `position:absolute` en sont retirés). */
function flowChildren(node: Extract<Node, { kind: "span" }>): Node[] {
  return node.children.filter((c) => !(c.kind === "span" && c.style.position === "absolute"));
}

function measure(node: Node): Size {
  if (node.kind === "svg") {
    return {
      width: Number.parseFloat(node.attrs.get("width") ?? "0"),
      height: Number.parseFloat(node.attrs.get("height") ?? "0"),
    };
  }
  // Un span dimensionné explicitement fait autorité (cas du bloc wordmark).
  if (node.style.width !== undefined && node.style.height !== undefined) {
    return { width: node.style.width, height: node.style.height };
  }
  const children = flowChildren(node).map(outerSize);
  if (children.length === 0) return { width: 0, height: 0 };

  const column = node.style.flexDirection === "column";
  return column
    ? {
        width: Math.max(...children.map((c) => c.width)),
        height: children.reduce((sum, c) => sum + c.height, 0),
      }
    : {
        width: children.reduce((sum, c) => sum + c.width, 0),
        height: Math.max(...children.map((c) => c.height)),
      };
}

// ---------------------------------------------------------------------------
// Placement

interface Placed { node: Extract<Node, { kind: "svg" }>; x: number; y: number }

function place(node: Node, x: number, y: number, out: Placed[]): void {
  if (node.kind === "svg") {
    out.push({ node, x, y });
    return;
  }

  const box = measure(node);
  const column = node.style.flexDirection === "column";
  const align = node.style.alignItems ?? "flex-start";
  let cursor = column ? y : x;

  for (const child of node.children) {
    // Overlay absolu : positionné par rapport au span relatif parent.
    if (child.kind === "span" && child.style.position === "absolute") {
      place(child, x + (child.style.left ?? 0), y + (child.style.top ?? 0), out);
      continue;
    }
    const size = outerSize(child);
    const margin = child.kind === "span" ? child.style : undefined;

    if (column) {
      const offsetX =
        align === "flex-end" ? box.width - size.width
        : align === "center" ? (box.width - size.width) / 2
        : 0;
      place(child, x + offsetX + (margin?.marginLeft ?? 0), cursor + (margin?.marginTop ?? 0), out);
      cursor += size.height;
    } else {
      const offsetY =
        align === "center" ? (box.height - size.height) / 2
        : align === "flex-end" ? box.height - size.height
        : 0;
      place(child, cursor + (margin?.marginLeft ?? 0), y + offsetY + (margin?.marginTop ?? 0), out);
      cursor += size.width;
    }
  }
}

// ---------------------------------------------------------------------------
// Émission

/**
 * Préfixe les `id` d'un fragment SVG et les références qui les ciblent.
 *
 * React génère les ids de dégradé avec `useId` : deux sous-SVG d'un même logo
 * reçoivent le même (`_R_0_g`). Fusionnés dans un document unique, le second
 * écrase le premier et le logo se peint avec le mauvais dégradé.
 */
function namespaceIds(fragment: string, prefix: string): string {
  const ids = new Set<string>();
  for (const [, id] of fragment.matchAll(/\sid="([^"]+)"/g)) if (id) ids.add(id);
  let out = fragment;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`(\\sid=")${escaped}(")`, "g"), `$1${prefix}${id}$2`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${prefix}${id})`)
      .replace(new RegExp(`((?:xlink:)?href=")#${escaped}(")`, "g"), `$1#${prefix}${id}$2`);
  }
  return out;
}

/** Transform amenant le repère interne d'un sous-SVG à sa position finale. */
function transformFor(placed: Placed): string {
  const { node, x, y } = placed;
  const viewBox = (node.attrs.get("viewBox") ?? "0 0 0 0").split(/\s+/).map(Number);
  const [minX = 0, minY = 0, vbWidth = 1, vbHeight = 1] = viewBox;
  const width = Number.parseFloat(node.attrs.get("width") ?? String(vbWidth));
  const height = Number.parseFloat(node.attrs.get("height") ?? String(vbHeight));
  const scaleX = vbWidth === 0 ? 1 : width / vbWidth;
  const scaleY = vbHeight === 0 ? 1 : height / vbHeight;

  const translate = `translate(${round(x - minX * scaleX)} ${round(y - minY * scaleY)})`;
  const scale = scaleX === 1 && scaleY === 1 ? "" : ` scale(${round(scaleX)} ${round(scaleY)})`;
  return translate + scale;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export interface ComposeResult {
  svg: string;
  width: number;
  height: number;
}

/**
 * Aplatit le markup SSR d'un logo en un SVG unique.
 * `resolve` traduit les valeurs restantes (`var(--_logo-*)`) en littéraux.
 */
export function composeSvg(html: string, resolve: (value: string) => string): ComposeResult {
  const root = parseMarkup(html);
  const { width, height } = measure(root);
  if (width === 0 || height === 0) throw new Error("Logo de dimension nulle — markup inattendu");

  const placed: Placed[] = [];
  place(root, 0, 0, placed);

  const groups = placed.map((item, index) => {
    const inner = namespaceIds(item.node.inner, `l${index}_`);
    return `<g transform="${transformFor(item)}">${inner}</g>`;
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" ` +
    `width="${round(width)}" height="${round(height)}" fill="none">${groups.join("")}</svg>`;

  return { svg: resolve(svg), width, height };
}
