// Foundation / Typography — styles typographiques du Comète Design System
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactElement } from "react";

// -----------------------------------------------------------------------
// Définition des styles typographiques

interface TypeStyle {
  /** Nom affiché (ex: "Hero XXL") */
  name: string;
  /** Balise HTML sémantique recommandée */
  tag: string;
  /** Tokens CSS utilisés */
  fontSizeToken: string;
  lineHeightToken: string;
  fontWeightToken: string;
  letterSpacingToken?: string;
  fontFamilyToken?: string;
  /** Valeurs résolues (à partir des tokens) */
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
  /** Guidance d'usage */
  usage: string;
}

interface TypeGroup {
  id: string;
  label: string;
  description: string;
  guidance: string[];
  styles: TypeStyle[];
}

const TYPE_GROUPS: TypeGroup[] = [
  {
    id: "hero",
    label: "Hero",
    description:
      "Texte d'accroche à très grande échelle, pour les pages marketing, les dashboards de métriques clés ou les écrans de bienvenue.",
    guidance: [
      "Réserver aux titres principaux d'une page — un seul style Hero par écran.",
      "Combiner avec un tracking négatif pour améliorer la lisibilité à grande taille.",
      "Ne jamais utiliser pour du corps de texte ou des libellés de composants.",
      "Préférer un poids Bold ou SemiBold pour maintenir l'impact visuel.",
    ],
    styles: [
      {
        name: "Hero XXL",
        tag: "h1",
        fontSizeToken: "--font-size-hero-xxl",
        lineHeightToken: "--line-height-hero-xxl",
        fontWeightToken: "--font-weight-bold",
        letterSpacingToken: "--letter-spacing-negative-extra-tight",
        fontSize: "96px",
        lineHeight: "120px",
        fontWeight: "700",
        letterSpacing: "-1px",
        usage: "Chiffre clé ou accroche principale d'une landing page.",
      },
      {
        name: "Hero XL",
        tag: "h1",
        fontSizeToken: "--font-size-hero-xl",
        lineHeightToken: "--line-height-hero-xl",
        fontWeightToken: "--font-weight-bold",
        letterSpacingToken: "--letter-spacing-negative-extra-tight",
        fontSize: "80px",
        lineHeight: "96px",
        fontWeight: "700",
        letterSpacing: "-1px",
        usage: "Titre principal d'une page d'accueil ou d'une section héro.",
      },
      {
        name: "Hero L",
        tag: "h1",
        fontSizeToken: "--font-size-hero-l",
        lineHeightToken: "--line-height-hero-l",
        fontWeightToken: "--font-weight-bold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "72px",
        lineHeight: "80px",
        fontWeight: "700",
        letterSpacing: "-0.5px",
        usage: "En-tête de module ou écran d'accueil applicatif.",
      },
      {
        name: "Hero M",
        tag: "h1",
        fontSizeToken: "--font-size-hero-m",
        lineHeightToken: "--line-height-hero-m",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "64px",
        lineHeight: "72px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Dashboard avec métrique centrale ou splash screen.",
      },
      {
        name: "Hero S",
        tag: "h2",
        fontSizeToken: "--font-size-hero-s",
        lineHeightToken: "--line-height-hero-s",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "56px",
        lineHeight: "64px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Titre de section dans une page de rapport ou de synthèse.",
      },
      {
        name: "Hero XS",
        tag: "h2",
        fontSizeToken: "--font-size-hero-xs",
        lineHeightToken: "--line-height-hero-xs",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "48px",
        lineHeight: "56px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Chiffre de KPI ou titre de widget large.",
      },
      {
        name: "Hero XXS",
        tag: "h2",
        fontSizeToken: "--font-size-hero-xxs",
        lineHeightToken: "--line-height-hero-xxs",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "40px",
        lineHeight: "48px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Titre de carte large ou compteur secondaire.",
      },
    ],
  },
  {
    id: "heading",
    label: "Heading",
    description:
      "Titres d'interface pour structurer le contenu : pages, sections, panneaux, dialogues. Correspondent aux niveaux h1–h5 en HTML sémantique.",
    guidance: [
      "Respecter la hiérarchie — ne jamais sauter de niveau (ex: h1 → h3 sans h2).",
      "Un seul H1 par page ; les niveaux suivants peuvent être répétés.",
      "Utiliser SemiBold pour les niveaux supérieurs, Medium pour H4/H5.",
      "Ne pas utiliser les styles Heading pour des libellés de composants (préférer Body).",
    ],
    styles: [
      {
        name: "H1",
        tag: "h1",
        fontSizeToken: "--font-size-ui-xxl",
        lineHeightToken: "--line-height-ui-xxl",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "32px",
        lineHeight: "36px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Titre principal d'une vue ou d'une page.",
      },
      {
        name: "H2",
        tag: "h2",
        fontSizeToken: "--font-size-ui-xl",
        lineHeightToken: "--line-height-ui-xl",
        fontWeightToken: "--font-weight-semibold",
        letterSpacingToken: "--letter-spacing-negative-tight",
        fontSize: "28px",
        lineHeight: "32px",
        fontWeight: "600",
        letterSpacing: "-0.5px",
        usage: "Titre de section principale dans une page.",
      },
      {
        name: "H3",
        tag: "h3",
        fontSizeToken: "--font-size-ui-l",
        lineHeightToken: "--line-height-ui-l",
        fontWeightToken: "--font-weight-semibold",
        fontSize: "24px",
        lineHeight: "28px",
        fontWeight: "600",
        usage: "Titre de sous-section, panneau latéral ou dialogue.",
      },
      {
        name: "H4",
        tag: "h4",
        fontSizeToken: "--font-size-ui-m",
        lineHeightToken: "--line-height-ui-m",
        fontWeightToken: "--font-weight-medium",
        fontSize: "20px",
        lineHeight: "24px",
        fontWeight: "500",
        usage: "En-tête de carte, groupe de formulaire ou widget.",
      },
      {
        name: "H5",
        tag: "h5",
        fontSizeToken: "--font-size-ui-s",
        lineHeightToken: "--line-height-ui-s",
        fontWeightToken: "--font-weight-medium",
        fontSize: "16px",
        lineHeight: "20px",
        fontWeight: "500",
        usage: "Libellé de section compacte, titre de colonne de tableau.",
      },
    ],
  },
  {
    id: "body",
    label: "Body",
    description:
      "Texte courant pour les paragraphes, descriptions, libellés et contenu de longueur variable. C'est le style le plus utilisé dans l'interface.",
    guidance: [
      "Body M (14px) est la taille par défaut pour la majorité des interfaces.",
      "Body L (16px) pour les contenus longs ou les contextes à faible densité.",
      "Body S (12px) pour les métadonnées, horodatages et informations secondaires.",
      "Utiliser Regular pour le corps de texte, Medium pour les libellés de composants.",
      "Ne pas descendre en dessous de 12px pour tout texte fonctionnel.",
    ],
    styles: [
      {
        name: "Body L",
        tag: "p",
        fontSizeToken: "--font-size-ui-s",
        lineHeightToken: "--line-height-ui-s",
        fontWeightToken: "--font-weight-regular",
        fontSize: "16px",
        lineHeight: "20px",
        fontWeight: "400",
        usage: "Contenu principal à faible densité, textes introductifs.",
      },
      {
        name: "Body L Medium",
        tag: "p",
        fontSizeToken: "--font-size-ui-s",
        lineHeightToken: "--line-height-ui-s",
        fontWeightToken: "--font-weight-medium",
        fontSize: "16px",
        lineHeight: "20px",
        fontWeight: "500",
        usage: "Libellés de boutons larges, texte d'accentuation modérée.",
      },
      {
        name: "Body M",
        tag: "p",
        fontSizeToken: "--font-size-ui-xs",
        lineHeightToken: "--line-height-ui-xs",
        fontWeightToken: "--font-weight-regular",
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: "400",
        usage: "Taille par défaut — paragraphes, descriptions, contenu de formulaire.",
      },
      {
        name: "Body M Medium",
        tag: "p",
        fontSizeToken: "--font-size-ui-xs",
        lineHeightToken: "--line-height-ui-xs",
        fontWeightToken: "--font-weight-medium",
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: "500",
        usage: "Libellés de composants, champs de formulaire, boutons standards.",
      },
      {
        name: "Body S",
        tag: "p",
        fontSizeToken: "--font-size-ui-xxs",
        lineHeightToken: "--line-height-ui-xxs",
        fontWeightToken: "--font-weight-regular",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "400",
        usage: "Métadonnées, horodatages, texte d'aide, badges compacts.",
      },
      {
        name: "Body S Medium",
        tag: "p",
        fontSizeToken: "--font-size-ui-xxs",
        lineHeightToken: "--line-height-ui-xxs",
        fontWeightToken: "--font-weight-medium",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "500",
        usage: "Libellés de statut, tags, indicateurs compacts.",
      },
      {
        name: "Label",
        tag: "span",
        fontSizeToken: "--font-size-ui-xxxs",
        lineHeightToken: "--line-height-ui-xs",
        fontWeightToken: "--font-weight-medium",
        letterSpacingToken: "--letter-spacing-positive-extra-wide",
        fontSize: "10px",
        lineHeight: "20px",
        fontWeight: "500",
        letterSpacing: "0.5px",
        usage: "Étiquettes en capitales, indicateurs d'état très compacts.",
      },
    ],
  },
  {
    id: "code",
    label: "Code",
    description:
      "Texte monospace pour les extraits de code, valeurs techniques, identifiants et chemins de fichiers. Utilise SF Mono.",
    guidance: [
      "Toujours afficher les valeurs de code dans un contexte à fond contrasté (surface sunken).",
      "Ne pas appliquer d'italic — la lisibilité du code nécessite un style droit.",
      "Utiliser Code M pour les blocs de code, Code S pour les valeurs inline.",
      "La couleur de texte doit rester --text-default, jamais tronquée par ellipsis.",
    ],
    styles: [
      {
        name: "Code M",
        tag: "code",
        fontSizeToken: "--font-size-ui-xs",
        lineHeightToken: "--line-height-ui-xs",
        fontWeightToken: "--font-weight-regular",
        fontFamilyToken: "--font-family-code",
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: "400",
        usage: "Blocs de code, fichiers de configuration, chemins.",
      },
      {
        name: "Code S",
        tag: "code",
        fontSizeToken: "--font-size-ui-xxs",
        lineHeightToken: "--line-height-ui-xxs",
        fontWeightToken: "--font-weight-regular",
        fontFamilyToken: "--font-family-code",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "400",
        usage: "Valeurs inline, tokens, identifiants courts.",
      },
    ],
  },
];

// -----------------------------------------------------------------------
// Exemples de texte par groupe

const SAMPLES: Record<string, string> = {
  hero: "Donnez vie à vos données.",
  heading: "Titre de section",
  body: "Le texte de corps structure le contenu et guide l'utilisateur à travers l'interface. Lisible, clair, sans fioritures.",
  code: "const theme = useTheme();\nreturn <Button variant=\"contained\">{label}</Button>;",
};

// -----------------------------------------------------------------------
// Composants d'affichage

const css = {
  page: {
    padding: 32,
    fontFamily: "var(--font-family-primary, system-ui, sans-serif)",
    color: "var(--text-default, #252a2c)",
    background: "var(--background-default-default, #fff)",
    minHeight: "100vh",
    maxWidth: 900,
    margin: "0 auto",
  },
  groupSection: {
    marginBottom: 56,
  },
  groupHeader: {
    borderBottom: "2px solid var(--border-default, #d8dedf)",
    paddingBottom: 16,
    marginBottom: 24,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--text-subtlest, #6f8488)",
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-default, #252a2c)",
    margin: "0 0 8px",
  },
  groupDesc: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--text-subtle, #49585b)",
    margin: "0 0 16px",
    maxWidth: 620,
  },
  guidanceList: {
    margin: 0,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  guidanceItem: {
    fontSize: 13,
    lineHeight: "18px",
    color: "var(--text-subtle, #49585b)",
  },
  styleRow: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: 16,
    alignItems: "start",
    padding: "20px 0",
    borderBottom: "1px solid var(--border-subtle, #eaedee)",
  },
  metaCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  styleName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-default, #252a2c)",
  },
  styleTag: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "var(--text-subtlest, #6f8488)",
    background: "var(--background-neutral-subtler-default, #eaedee)",
    borderRadius: 4,
    padding: "1px 5px",
    display: "inline-block",
    width: "fit-content",
  },
  tokenPill: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "var(--text-subtle, #49585b)",
    lineHeight: 1.4,
  },
  usageText: {
    fontSize: 11,
    color: "var(--text-subtlest, #6f8488)",
    fontStyle: "italic",
    marginTop: 4,
  },
} satisfies Record<string, CSSProperties>;

function TokenTag({ name }: { name: string }): ReactElement {
  return (
    <span
      style={{
        ...css.tokenPill,
        display: "block",
        padding: "2px 5px",
        background: "var(--background-neutral-subtlest-default, #f7f8f8)",
        border: "1px solid var(--border-subtle, #eaedee)",
        borderRadius: 4,
        marginTop: 2,
        width: "fit-content",
      }}
    >
      {name}
    </span>
  );
}

function StyleRow({ style, sample, isCode }: { style: TypeStyle; sample: string; isCode: boolean }): ReactElement {
  const textStyle: CSSProperties = {
    fontSize: `var(${style.fontSizeToken}, ${style.fontSize})`,
    lineHeight: `var(${style.lineHeightToken}, ${style.lineHeight})`,
    fontWeight: `var(${style.fontWeightToken}, ${style.fontWeight})` as CSSProperties["fontWeight"],
    letterSpacing: style.letterSpacingToken
      ? `var(${style.letterSpacingToken}, ${style.letterSpacing ?? "0"})`
      : undefined,
    fontFamily: style.fontFamilyToken
      ? `var(${style.fontFamilyToken}, monospace)`
      : "var(--font-family-primary, system-ui, sans-serif)",
    color: "var(--text-default, #252a2c)",
    margin: 0,
    wordBreak: "break-word" as const,
  };

  return (
    <div style={css.styleRow}>
      {/* Colonne métadonnées */}
      <div style={css.metaCol}>
        <span style={css.styleName}>{style.name}</span>
        <span style={css.styleTag}>&lt;{style.tag}&gt;</span>
        <TokenTag name={style.fontSizeToken} />
        <TokenTag name={style.lineHeightToken} />
        <TokenTag name={style.fontWeightToken} />
        {style.letterSpacingToken && <TokenTag name={style.letterSpacingToken} />}
        {style.fontFamilyToken && <TokenTag name={style.fontFamilyToken} />}
        <span style={css.usageText}>{style.usage}</span>
      </div>

      {/* Colonne rendu */}
      <div>
        {isCode ? (
          <pre
            style={{
              ...textStyle,
              background: "var(--background-surface-elevation-sunken-default, #f7f8f8)",
              border: "1px solid var(--border-subtle, #eaedee)",
              borderRadius: 8,
              padding: "12px 16px",
              overflowX: "auto",
              whiteSpace: "pre-wrap" as const,
            }}
          >
            {sample}
          </pre>
        ) : (
          <p style={textStyle}>{sample}</p>
        )}
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            color: "var(--text-subtlest, #6f8488)",
            fontFamily: "monospace",
          }}
        >
          {style.fontSize} / {style.lineHeight} / {style.fontWeight === "400" ? "Regular" : style.fontWeight === "500" ? "Medium" : style.fontWeight === "600" ? "SemiBold" : "Bold"}
          {style.letterSpacing && style.letterSpacing !== "0px" ? ` / ${style.letterSpacing}` : ""}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Sections: familles de polices + poids

function FontFamilySection(): ReactElement {
  const families = [
    {
      token: "--font-family-primary",
      resolved: "var(--font-family-poppins)",
      role: "Police principale",
      usage: "Tous les textes d'interface : titres, corps, libellés.",
      sample: "Aa Bb Cc — 0123456789",
    },
    {
      token: "--font-family-code",
      resolved: "SF Mono",
      role: "Police monospace",
      usage: "Code, valeurs techniques, identifiants.",
      sample: "const x = 42; // → {}[]",
    },
  ];

  const weights = [
    { token: "--font-weight-regular", value: "400", label: "Regular" },
    { token: "--font-weight-medium", value: "500", label: "Medium" },
    { token: "--font-weight-semibold", value: "600", label: "SemiBold" },
    { token: "--font-weight-bold", value: "700", label: "Bold" },
  ];

  return (
    <div style={{ marginBottom: 56 }}>
      <div style={css.groupHeader}>
        <p style={css.groupLabel}>Fondation</p>
        <h2 style={css.groupTitle}>Polices et graisses</h2>
        <p style={css.groupDesc}>
          Comète utilise <strong>Poppins</strong> comme police principale et{" "}
          <strong>SF Mono</strong> pour le code. Les quatre niveaux de graisse
          permettent de créer une hiérarchie claire sans multiplier les familles.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {families.map((f) => (
          <div
            key={f.token}
            style={{
              padding: 20,
              border: "1px solid var(--border-default, #d8dedf)",
              borderRadius: 10,
              background: "var(--background-neutral-subtlest-default, #f7f8f8)",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-subtlest, #6f8488)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {f.role}
            </p>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 28,
                fontFamily: f.token === "--font-family-code" ? "var(--font-family-code, monospace)" : "var(--font-family-primary, system-ui)",
                fontWeight: 500,
                color: "var(--text-default, #252a2c)",
                lineHeight: 1.3,
              }}
            >
              {f.sample}
            </p>
            <code
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "var(--text-subtle, #49585b)",
                background: "var(--background-neutral-subtler-default, #eaedee)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              var({f.token})
            </code>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-subtlest, #6f8488)" }}>
              {f.usage}
            </p>
          </div>
        ))}
      </div>

      {/* Poids */}
      <div
        style={{
          padding: 20,
          border: "1px solid var(--border-default, #d8dedf)",
          borderRadius: 10,
        }}
      >
        <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 600, color: "var(--text-subtlest, #6f8488)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Graisses disponibles
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {weights.map((w) => (
            <div key={w.token} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: Number(w.value),
                  fontFamily: "var(--font-family-primary, system-ui)",
                  color: "var(--text-default, #252a2c)",
                  lineHeight: 1.2,
                }}
              >
                {w.label}
              </p>
              <code style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-subtlest, #6f8488)" }}>
                var({w.token})
              </code>
              <span style={{ fontSize: 11, color: "var(--text-subtle, #49585b)" }}>
                font-weight: {w.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Page principale

function TypographyPage(): ReactElement {
  return (
    <div style={css.page}>
      {/* En-tête */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ ...css.groupLabel, margin: "0 0 8px" }}>Foundation</p>
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "var(--text-default, #252a2c)",
          }}
        >
          Typographie
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: "24px",
            color: "var(--text-subtle, #49585b)",
            maxWidth: 600,
          }}
        >
          Une typographie cohérente crée la hiérarchie visuelle et guide l&apos;attention.
          Comète définit quatre familles de styles — Hero, Heading, Body, Code — chacune
          avec un rôle précis dans l&apos;interface.
        </p>
      </div>

      <FontFamilySection />

      {TYPE_GROUPS.map((group) => (
        <div key={group.id} style={css.groupSection}>
          <div style={css.groupHeader}>
            <p style={css.groupLabel}>{group.label}</p>
            <p style={css.groupDesc}>{group.description}</p>

            {/* Guidance */}
            <div
              style={{
                padding: "12px 16px",
                background: "var(--background-information-subtlest-default, #ddf1ff)",
                border: "1px solid var(--border-information, #0076d8)",
                borderRadius: 8,
                display: "flex",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ</span>
              <ul style={css.guidanceList}>
                {group.guidance.map((g) => (
                  <li key={g} style={css.guidanceItem}>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {group.styles.map((style) => (
            <StyleRow
              key={style.name}
              style={style}
              sample={SAMPLES[group.id] ?? "Texte d'exemple"}
              isCode={group.id === "code"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Story

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllStyles: Story = {
  name: "Typography",
  render: () => <TypographyPage />,
};
