// Guidelines — helper partagé pour la doc des composants.
// - `GuidelinesFlat` : rendu riche (cartes À faire/À éviter, sections, encart
//   accessibilité, chips de code, liens auto vers les composants cités).
// - `Guidelines` : ancienne variante à onglets (conservée pour compat).
// Fichier non-story (glob = *.stories.@(ts|tsx)).
import { Fragment } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  Icon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@aexae/comete-design-system/components";
import type { IconColor, IconName } from "@naxit/comete-icons";

// -----------------------------------------------------------------------
// Liens automatiques vers les composants cités dans les guidelines.
// Nom (tel qu'écrit dans le texte) → id de page docs Storybook. Les
// sous-composants sans page dédiée pointent vers la page de leur parent.
const COMPONENT_DOC_IDS: Record<string, string> = {
  Accordion: "components-accordion",
  Avatar: "components-avatar",
  AvatarGroup: "components-avatargroup",
  Badge: "components-badge",
  Banner: "components-banner",
  Blanket: "components-blanket",
  Bleed: "layout-bleed",
  BottomNav: "navigation-bottomnav",
  Breadcrumbs: "components-breadcrumbs",
  Button: "components-button",
  ButtonGroup: "components-buttongroup",
  Calendar: "components-calendar",
  Card: "components-card",
  Checkbox: "components-checkbox",
  CheckboxGroup: "components-checkboxgroup",
  Cluster: "layout-cluster",
  Code: "components-code",
  DatePicker: "components-datepicker",
  Divider: "components-divider",
  Drawer: "components-drawer",
  DropIndicator: "components-dropindicator",
  Field: "components-field",
  FocusRing: "components-focusring",
  Grid: "layout-grid",
  Heading: "components-heading",
  Hero: "components-hero",
  Icon: "components-icon",
  IconTile: "components-icontile",
  Illustration: "components-illustration",
  InformativeState: "components-informativestate",
  InputContainer: "components-inputcontainer",
  List: "components-list",
  Logo: "components-logo",
  Menu: "components-menu",
  MenuItem: "components-menu-menuitem",
  ModalDialog: "components-modaldialog",
  MonthPicker: "components-monthpicker",
  Page: "layout-page",
  Popover: "components-popover",
  Popup: "components-popup",
  ProgressBar: "components-progressbar",
  ProgressIndicator: "components-progressindicator",
  Radio: "components-radio",
  RadioGroup: "components-radiogroup",
  SearchField: "components-searchfield",
  SectionMessage: "components-sectionmessage",
  Select: "components-select",
  SideNav: "navigation-sidenav",
  Skeleton: "components-skeleton",
  Snackbar: "components-snackbar",
  Spotlight: "components-spotlight",
  Stack: "layout-stack",
  Stepper: "components-stepper",
  Switch: "components-switch",
  Tab: "components-tabs-tab",
  Table: "components-table",
  Tabs: "components-tabs",
  Tag: "components-tag",
  Text: "components-text",
  TextField: "components-textfield",
  TimePicker: "components-timepicker",
  ToggleButtonGroup: "components-togglebuttongroup",
  TopNav: "navigation-topnav",
  WeekPicker: "components-weekpicker",
  YearPicker: "components-yearpicker",
  // Sous-composants / API composée → page du parent
  ListItem: "components-list",
  TablePagination: "components-table",
  "Table.View": "components-table",
  MenuSection: "components-menu",
  SideNavItem: "navigation-sidenav-item",
  SideNavSection: "navigation-sidenav-section",
  DrawerHeader: "components-drawer",
  "Page.Header": "layout-page",
  "Page.Body": "layout-page",
};

// Clés triées par longueur décroissante → matche les noms les plus longs
// d'abord (RadioGroup avant Radio, TextField avant Text, SideNavItem avant
// SideNav…).
const LINK_KEYS = Object.keys(COMPONENT_DOC_IDS).sort(
  (a, b) => b.length - a.length,
);

/** Un caractère est une borne de mot s'il n'est ni une lettre ni un chiffre. */
function isBoundary(ch: string): boolean {
  return ch === "" || !/[A-Za-z0-9]/.test(ch);
}

// NOTE couleurs : plusieurs tokens de fond/bordure teintés (information-subtlest,
// surface-elevation, border-information…) ET --text-link n'ont PAS de valeur en
// thème dark dans @aexae/comete-design-tokens. On n'utilise donc ici que des
// tokens qui résolvent dans les deux thèmes (surface-default, neutral-subtlest,
// selected-subtlest, border-subtle, et les --text-* qui, eux, sont complets).
const LINK_STYLE = {
  color: "var(--text-information)",
  textUnderlineOffset: 2,
} as const;

const PILL_STYLE = {
  color: "var(--text-information)",
  background: "var(--background-selected-subtlest-default)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius150)",
  padding: "0.1em 0.5em",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  whiteSpace: "nowrap",
} as const;

/**
 * Transforme les noms de composants cités dans un texte en liens vers leur
 * page Storybook. Matching sensible à la casse (noms en PascalCase) et sur des
 * bornes de mot, pour ne pas casser « texte », « code » ou « iconBefore ».
 * `pill` active un rendu en pastille (colonne « Plutôt utiliser »).
 */
function linkify(text: string, pill = false): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = "";
  let i = 0;
  let linkKey = 0;
  while (i < text.length) {
    const match = LINK_KEYS.find(
      (name) =>
        text.startsWith(name, i) &&
        isBoundary(text.charAt(i - 1)) &&
        isBoundary(text.charAt(i + name.length)),
    );
    if (match) {
      if (buffer) {
        nodes.push(buffer);
        buffer = "";
      }
      nodes.push(
        <a
          key={`lk-${linkKey++}`}
          href={`./?path=/docs/${COMPONENT_DOC_IDS[match]}--docs`}
          target="_top"
          style={pill ? PILL_STYLE : LINK_STYLE}
        >
          {match}
        </a>,
      );
      i += match.length;
    } else {
      buffer += text.charAt(i);
      i += 1;
    }
  }
  if (buffer) {
    nodes.push(buffer);
  }
  return nodes;
}

/** Chip de code inline (valeur de prop, token…), marqué par des backticks. */
function CodeChip({ children }: { children: ReactNode }): ReactElement {
  return (
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.85em",
        background: "var(--background-neutral-subtler-default)",
        color: "var(--text-default)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius150)",
        padding: "0.05em 0.4em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </code>
  );
}

/**
 * Rend un texte enrichi : `code` → chip, noms de composants → liens.
 */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  text.split(/(`[^`]+`)/g).forEach((part, idx) => {
    if (!part) return;
    if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) {
      out.push(<CodeChip key={`code-${idx}`}>{part.slice(1, -1)}</CodeChip>);
    } else {
      out.push(<Fragment key={`txt-${idx}`}>{linkify(part)}</Fragment>);
    }
  });
  return out;
}

export interface GuidelinesProps {
  /** Quand utiliser le composant. */
  when: string[];
  /** Quand l'éviter — format « raison → Composant » pour lier l'alternative. */
  avoid: string[];
  /** Bonnes pratiques (optionnel). */
  best?: string[];
  /** Points d'accessibilité (optionnel) — affichés dans un encart. */
  accessibility?: string[];
  /** Exemple « À faire » (optionnel) — rendu visuel + légende. */
  doExample?: { example: ReactNode; caption: string };
  /** Exemple « À éviter » (optionnel) — rendu visuel + légende. */
  dontExample?: { example: ReactNode; caption: string };
}

// -----------------------------------------------------------------------
// Ancienne variante à onglets (conservée pour usage standalone).

function GuidelineList({
  items,
  icon,
  color,
}: {
  items: string[];
  icon: IconName;
  color: IconColor;
}): ReactElement {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: "var(--space200) 0 0",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space150)",
      }}
    >
      {items.map((text, i) => (
        <li
          key={i}
          style={{ display: "flex", gap: "var(--space100)", alignItems: "flex-start" }}
        >
          <span style={{ flex: "none", marginTop: 1 }}>
            <Icon icon={icon} size={18} color={color} appearance="filled" />
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-primary)",
              fontSize: "var(--font-size-ui-xs)",
              lineHeight: "var(--line-height-ui-m)",
              color: "var(--text-default)",
            }}
          >
            {renderInline(text)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Guidelines à onglets (When to use / À éviter / Bonnes pratiques). */
export function Guidelines({ when, avoid, best }: GuidelinesProps): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <Tabs defaultSelectedKey="when">
        <TabList aria-label="Guidelines">
          <Tab id="when" iconBefore="CheckCircle">
            When to use
          </Tab>
          <Tab id="avoid" iconBefore="Block">
            À éviter
          </Tab>
          {best ? (
            <Tab id="best" iconBefore="Lightbulb">
              Bonnes pratiques
            </Tab>
          ) : null}
        </TabList>
        <TabPanel id="when">
          <GuidelineList items={when} icon="CheckCircle" color="success" />
        </TabPanel>
        <TabPanel id="avoid">
          <GuidelineList items={avoid} icon="Block" color="critical" />
        </TabPanel>
        {best ? (
          <TabPanel id="best">
            <GuidelineList items={best} icon="Lightbulb" color="brand" />
          </TabPanel>
        ) : null}
      </Tabs>
    </div>
  );
}

// -----------------------------------------------------------------------
// Rendu riche (GuidelinesFlat)

/** Puce colorée précédant un titre de section. */
function Dot({ color }: { color: string }): ReactElement {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flex: "none",
        display: "inline-block",
      }}
    />
  );
}

function SectionHeading({
  dot,
  children,
}: {
  dot: string;
  children: ReactNode;
}): ReactElement {
  return (
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space100)",
        margin: 0,
        fontFamily: "var(--font-family-primary)",
        fontSize: "var(--font-size-ui-s)",
        fontWeight: "var(--font-weight-semibold)",
        letterSpacing: "var(--letter-spacing-negative-tight)",
        color: "var(--text-default)",
      }}
    >
      <Dot color={dot} />
      {children}
    </h3>
  );
}

/** Liste à puces enrichie (chips + liens). */
function BulletList({ items }: { items: string[] }): ReactElement {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        paddingTop: "var(--space150)",
        paddingInlineStart: "var(--space300)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space100)",
        listStyle: "disc",
      }}
    >
      {items.map((text, i) => (
        <li
          key={i}
          style={{
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-ui-xs)",
            lineHeight: "var(--line-height-ui-m)",
            letterSpacing: "var(--letter-spacing-negative-tight)",
            color: "var(--text-default)",
          }}
        >
          {renderInline(text)}
        </li>
      ))}
    </ul>
  );
}

/** Ligne « Plutôt utiliser » : raison → pastille(s) du composant alternatif. */
function AltRow({ item }: { item: string }): ReactElement {
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--space200)",
    padding: "var(--space150) var(--space200)",
    background: "var(--background-neutral-subtlest-default)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius200)",
  } as const;
  const textStyle = {
    fontFamily: "var(--font-family-primary)",
    fontSize: "var(--font-size-ui-xs)",
    lineHeight: "var(--line-height-ui-m)",
    color: "var(--text-default)",
  } as const;

  const idx = item.indexOf("→");
  if (idx === -1) {
    return (
      <div style={rowStyle}>
        <span style={textStyle}>{renderInline(item)}</span>
      </div>
    );
  }
  const reason = item.slice(0, idx).trimEnd();
  const target = item.slice(idx + 1).trim().replace(/\.$/, "");
  return (
    <div style={rowStyle}>
      <span style={textStyle}>{renderInline(reason)}</span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space100)",
          flex: "none",
        }}
      >
        <span style={{ color: "var(--text-subtlest)" }}>→</span>
        <span style={textStyle}>{linkify(target, true)}</span>
      </span>
    </div>
  );
}

/** Carte À faire / À éviter avec exemple rendu et légende. */
function DoDontCard({
  kind,
  example,
  caption,
}: {
  kind: "do" | "dont";
  example: ReactNode;
  caption: string;
}): ReactElement {
  const isDo = kind === "do";
  const accent = isDo ? "var(--text-success)" : "var(--text-critical)";
  const titleColor = isDo ? "var(--text-success)" : "var(--text-critical)";
  return (
    <div
      style={{
        flex: "1 1 240px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--background-surface-default)",
        border: "1px solid var(--border-subtle)",
        borderTop: `2px solid ${accent}`,
        borderRadius: "var(--radius200)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space100)",
          padding: "var(--space150) var(--space200)",
          color: titleColor,
        }}
      >
        <Icon
          icon={isDo ? "CheckCircle" : "Close"}
          size={16}
          color={isDo ? "success" : "critical"}
          appearance="filled"
        />
        <span
          style={{
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-ui-xs)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {isDo ? "À faire" : "À éviter"}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space400) var(--space200)",
          minHeight: 96,
          background: "var(--background-neutral-subtlest-default)",
        }}
      >
        {example}
      </div>
      <div
        style={{
          padding: "var(--space200)",
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-ui-xs)",
          lineHeight: "var(--line-height-ui-m)",
          color: "var(--text-subtle)",
        }}
      >
        {renderInline(caption)}
      </div>
    </div>
  );
}

/** Encart Accessibilité (bleu info). */
function AccessibilityCallout({ items }: { items: string[] }): ReactElement {
  return (
    <div
      style={{
        background: "var(--background-neutral-subtlest-default)",
        border: "1px solid var(--border-subtle)",
        borderLeft: "3px solid var(--text-information)",
        borderRadius: "var(--radius200)",
        padding: "var(--space200) var(--space300)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space100)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space100)",
          color: "var(--text-information)",
        }}
      >
        <Icon icon="Info" size={16} color="information" appearance="filled" />
        <span
          style={{
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-ui-s)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          Accessibilité
        </span>
      </div>
      <BulletList items={items} />
    </div>
  );
}

/**
 * GuidelinesFlat — rendu riche façon Zeroheight :
 * cartes À faire / À éviter, « Quand l'utiliser », « Plutôt utiliser »
 * (alternatives liées), « Bonnes pratiques » et encart Accessibilité.
 * Les cartes et l'encart ne s'affichent que si leurs données sont fournies.
 */
export function GuidelinesFlat({
  when,
  avoid,
  best,
  accessibility,
  doExample,
  dontExample,
}: GuidelinesProps): ReactElement {
  return (
    <div
      style={{
        maxWidth: 760,
        paddingTop: "var(--space400)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space400)",
      }}
    >
      {doExample && dontExample ? (
        <div
          style={{
            display: "flex",
            gap: "var(--space300)",
            flexWrap: "wrap",
            alignItems: "stretch",
          }}
        >
          <DoDontCard
            kind="do"
            example={doExample.example}
            caption={doExample.caption}
          />
          <DoDontCard
            kind="dont"
            example={dontExample.example}
            caption={dontExample.caption}
          />
        </div>
      ) : null}

      <section>
        <SectionHeading dot="var(--text-success)">
          Quand l&apos;utiliser
        </SectionHeading>
        <BulletList items={when} />
      </section>

      <section>
        <SectionHeading dot="var(--text-information)">
          Plutôt utiliser
        </SectionHeading>
        <p
          style={{
            margin: "var(--space150) 0 var(--space100)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-ui-xs)",
            color: "var(--text-subtle)",
          }}
        >
          Dans ces cas, un autre composant est plus adapté :
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space100)",
          }}
        >
          {avoid.map((it, i) => (
            <AltRow key={i} item={it} />
          ))}
        </div>
      </section>

      {best ? (
        <section>
          <SectionHeading dot="var(--text-warning)">
            Bonnes pratiques
          </SectionHeading>
          <BulletList items={best} />
        </section>
      ) : null}

      {accessibility && accessibility.length > 0 ? (
        <AccessibilityCallout items={accessibility} />
      ) : null}
    </div>
  );
}
