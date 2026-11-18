// Spinner — Comète Design System
// Indicateur de chargement indéterminé en forme de comète, en écho au logo : une
// seule forme pleine, tête ronde prolongée par une queue effilée en pointe.
// Rythme repris de loading-ui « Comet spinner » : la tête accélère puis ralentit
// (ease), la queue naît, s'étire puis se résorbe, et la tête marque une pause en
// fin de tour. La référence dessine sa queue avec des box-shadow disjointes : ici,
// SVG pour une queue continue.
import { useId, type CSSProperties, type ReactElement } from "react";
import styles from "./Spinner.module.css";

// -----------------------------------------------------------------------
// Géométrie (viewBox 96 × 96)

type Point = readonly [number, number];

const CENTER = 48;
/** Rayon de la tête. */
const HEAD = 9;
/** Rayon de l'orbite suivie par le centre de la tête : ORBIT + HEAD = 48. */
const ORBIT = CENTER - HEAD;
/** Rayon de la pointe, en part du rayon de la tête : 0 = pointe effilée (logo). */
const TIP = 0;
/** Pente maximale de l'effilement : une queue courte reste une goutte arrondie. */
const MAX_SLOPE = 0.9;
/** Points par bord de queue et par calotte. Constants : l'interpolation SMIL exige
 *  la même structure de chemin à chaque image. */
const STEPS = 16;
const CAP = 8;

/** Point de l'orbite à une distance curviligne `s` derrière la tête (sens antihoraire). */
function orbitAt(s: number): { x: number; y: number; tx: number; ty: number } {
  const angle = -s / ORBIT;
  return {
    x: CENTER + ORBIT * Math.sin(angle),
    y: CENTER - ORBIT * Math.cos(angle),
    // Tangente unitaire vers la pointe.
    tx: -Math.cos(angle),
    ty: -Math.sin(angle),
  };
}

/** Points d'arc de `from` vers `to` autour de (cx, cy), en passant par `via`. */
function arc(cx: number, cy: number, r: number, from: Point, to: Point, via: number): Point[] {
  const turn = 2 * Math.PI;
  const wrap = (a: number) => ((a % turn) + turn) % turn;
  const a0 = Math.atan2(from[1] - cy, from[0] - cx);
  const sweep = wrap(Math.atan2(to[1] - cy, to[0] - cx) - a0);
  const span = wrap(via - a0) < sweep ? sweep : sweep - turn;
  const points: Point[] = [];
  for (let j = 1; j < CAP; j++) {
    const a = a0 + (span * j) / CAP;
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return points;
}

/**
 * Contour de la comète : enveloppe d'un cercle qui glisse le long de l'orbite en
 * rétrécissant de HEAD à la pointe. Pas de col entre tête et queue, quelle que soit
 * la longueur. Tracée tête en haut : la rotation est appliquée au groupe.
 */
function cometPath(lengthDeg: number): string {
  const length = (Math.max(lengthDeg, 0) * Math.PI * ORBIT) / 180;
  const tipRadius = Math.max(HEAD * TIP, HEAD - MAX_SLOPE * length);
  // À longueur nulle, on garde la pente limite des queues courtes : le contour reste
  // paramétré de la même façon et l'interpolation vers la pause ne saute pas.
  const slope = length > 0 ? (tipRadius - HEAD) / length : -MAX_SLOPE;
  const spread = Math.sqrt(1 - slope * slope);

  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const s = (length * i) / STEPS;
    const r = HEAD + slope * s;
    const o = orbitAt(s);
    // Point de contact décalé vers la pointe selon la pente (enveloppe exacte).
    const bx = o.x - r * slope * o.tx;
    const by = o.y - r * slope * o.ty;
    outer.push([bx - r * spread * o.ty, by + r * spread * o.tx]);
    inner.push([bx + r * spread * o.ty, by - r * spread * o.tx]);
  }

  const head = orbitAt(0);
  const tip = orbitAt(length);
  const headFrom = inner[0] ?? [head.x, head.y];
  const headTo = outer[0] ?? [head.x, head.y];
  const tipFrom = outer[STEPS] ?? [tip.x, tip.y];
  const tipTo = inner[STEPS] ?? [tip.x, tip.y];
  const points: Point[] = [
    ...outer,
    ...arc(tip.x, tip.y, tipRadius, tipFrom, tipTo, Math.atan2(tip.ty, tip.tx)),
    ...inner.reverse(),
    ...arc(head.x, head.y, HEAD, headFrom, headTo, Math.atan2(-head.ty, -head.tx)),
  ];

  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
}

// -----------------------------------------------------------------------
// Animation

/** Durée d'un cycle (mouvement puis pause). */
const DURATION = "2s";
/** Part du cycle consacrée au tour ; le reste est la pause, tête immobile en haut. */
const ACTIVE = 0.99;
/** Images échantillonnées sur la partie active. Denses pour que l'interpolation
 *  linéaire de SMIL reste collée à l'orbite. */
const FRAMES = 54;
/** Courbe de rotation sur la partie active : `ease` CSS, comme la référence. */
const EASE = [0.25, 0.1, 0.25, 1] as const;
/**
 * Longueur de la queue (degrés) au fil du tour, `ease` entre deux étapes. Valeurs
 * de la référence loading-ui : naissance, étirement maximal à 38 %, résorption.
 */
const TAIL_KEYFRAMES: readonly (readonly [progress: number, lengthDeg: number])[] = [
  [0, 0],
  [0.05, 0],
  [0.1, 21],
  [0.2, 66],
  [0.38, 84],
  [0.59, 21],
  [0.95, 0],
  [1, 0],
];

/** Évalue une courbe cubic-bezier CSS (x1, y1, x2, y2) en `t` ∈ [0, 1]. */
function cubicBezier(t: number, [x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const coord = (u: number, p1: number, p2: number) =>
    3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3;
  let u = t;
  for (let i = 0; i < 10; i++) {
    const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dx) < 1e-7) break;
    u -= (coord(u, x1, x2) - t) / dx;
  }
  return coord(u, y1, y2);
}

/** Longueur de queue à l'avancement `progress` ∈ [0, 1] du tour. */
function tailLengthAt(progress: number): number {
  for (let i = 1; i < TAIL_KEYFRAMES.length; i++) {
    const [p0, l0] = TAIL_KEYFRAMES[i - 1] ?? [0, 0];
    const [p1, l1] = TAIL_KEYFRAMES[i] ?? [1, 0];
    if (progress <= p1) {
      const f = p1 > p0 ? (progress - p0) / (p1 - p0) : 1;
      return l0 + (l1 - l0) * cubicBezier(f, EASE);
    }
  }
  return 0;
}

// Images de la partie active, puis la même pose tenue jusqu'à la fin du cycle.
const PROGRESS = Array.from({ length: FRAMES + 1 }, (_, i) => i / FRAMES);
const KEY_TIMES = [...PROGRESS.map((p) => (p * ACTIVE).toFixed(4)), "1"].join(";");
const PATHS = PROGRESS.map((p) => cometPath(tailLengthAt(p)));
const ROTATIONS = PROGRESS.map((p) => `${(360 * cubicBezier(p, EASE)).toFixed(1)} 48 48`);
const PATH_VALUES = [...PATHS, PATHS[PATHS.length - 1]].join(";");
const ROTATION_VALUES = [...ROTATIONS, ROTATIONS[ROTATIONS.length - 1]].join(";");
const PATH_INITIAL = PATHS[0];
/** Comète figée (queue moyenne) pour le mouvement réduit, tournée en CSS. */
const PATH_STATIC = cometPath(60);

// -----------------------------------------------------------------------
// Types publics

/**
 * Taille du spinner (tokens `--spinner-size-*`).
 * - "xsmall" 8 px · "small" 16 px · "medium" 24 px · "large" 48 px · "xlarge" 96 px
 * - "fill" — occupe la taille de son conteneur (intégration dans un composant :
 *   le Button le dimensionne à la taille d'icône de sa densité)
 */
export type SpinnerSize = "xsmall" | "small" | "medium" | "large" | "xlarge" | "fill";

/**
 * Couleur du spinner.
 * - "inherit"  — reprend la couleur du texte parent (`currentColor`)
 * - "inverted" — pour fond foncé (`--spinner-color-inverted`)
 * - "comete"   — dégradé jaune du logo Comète, de la pointe (clair) vers la tête
 */
export type SpinnerAppearance = "inherit" | "inverted" | "comete";

export interface SpinnerProps {
  /** Taille. @default "medium" */
  size?: SpinnerSize;
  /** Couleur. @default "inherit" */
  appearance?: SpinnerAppearance;
  /** Label accessible pour les lecteurs d'écran. @default "Chargement" */
  "aria-label"?: string;
  /**
   * Décoratif : masque le spinner aux lecteurs d'écran (`aria-hidden`), sans
   * région live. À utiliser quand l'état de chargement est déjà annoncé par
   * le parent. @default false
   */
  decorative?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * Spinner — Comète Design System
 *
 * Indicateur de chargement indéterminé en forme de comète. Utilisé seul ou dans les composants
 * (`Button`, `TextField`, `Select`) pour signaler une attente.
 *
 * ```tsx
 * import { Spinner } from "@aexae/comete-design-system";
 *
 * <Spinner />
 * <Spinner size="large" />
 * <Spinner size="small" appearance="inverted" />
 * <Spinner size="large" appearance="comete" />
 * ```
 */
export function Spinner({
  size = "medium",
  appearance = "inherit",
  "aria-label": ariaLabel = "Chargement",
  decorative = false,
  className,
  style,
}: SpinnerProps): ReactElement {
  const classNames = [
    styles.spinner,
    styles[size],
    appearance === "inverted" && styles.inverted,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const gradientId = `${useId()}comet`;
  const fill = appearance === "comete" ? `url(#${gradientId})` : "currentColor";

  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "status", "aria-label": ariaLabel };

  return (
    <span className={classNames} style={style} {...a11y}>
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false" fill={fill}>
        {appearance === "comete" && (
          <defs>
            {/* Repère local de la comète (tête en haut, queue vers la gauche) : le
                dégradé tourne avec elle. Arrêts repris du logo (clair → 74 % soutenu). */}
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="9"
              y1="48"
              x2="48"
              y2="0"
            >
              <stop offset="0" className={styles.gradientLight} />
              <stop offset="0.74" className={styles.gradientDark} />
            </linearGradient>
          </defs>
        )}
        <g className={styles.comet}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            dur={DURATION}
            repeatCount="indefinite"
            values={ROTATION_VALUES}
            keyTimes={KEY_TIMES}
          />
          {/* Tête : vrai cercle, fixe dans le repère de la comète. Le contour animé est
              fait de segments (exigence de l'interpolation SMIL) : seul, il donnerait
              une tête facettée pendant la pause. La queue part tangente au cercle. */}
          <circle cx={CENTER} cy={CENTER - ORBIT} r={HEAD} />
          <path d={PATH_INITIAL}>
            <animate
              attributeName="d"
              dur={DURATION}
              repeatCount="indefinite"
              values={PATH_VALUES}
              keyTimes={KEY_TIMES}
            />
          </path>
        </g>
        <g className={styles.cometStatic}>
          <circle cx={CENTER} cy={CENTER - ORBIT} r={HEAD} />
          <path d={PATH_STATIC} />
        </g>
      </svg>
    </span>
  );
}

Spinner.displayName = "Spinner";
