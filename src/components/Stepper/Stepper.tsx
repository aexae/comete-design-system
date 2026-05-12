// Stepper — Comète Design System
// Étapes numérotées avec états (upcoming / active / completed / error).
// - Orientation horizontale ou verticale (`orientation`).
// - Mode linear (séquentiel, lecture seule) ou non-linear (steps cliquables).
// - Status auto-calculé selon position vs `activeStep` ; `isError` est un
//   override explicite par étape.
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/index.js";
import styles from "./Stepper.module.css";

// -----------------------------------------------------------------------
// Types publics

/** Orientation du Stepper. */
export type StepperOrientation = "horizontal" | "vertical";

/** Statut visuel d'une étape. */
export type StepStatus = "upcoming" | "active" | "completed" | "error";

export interface StepperProps {
  /** Index (0-based) de l'étape active. */
  activeStep: number;
  /** Orientation du layout. @default "horizontal" */
  orientation?: StepperOrientation;
  /**
   * Mode linéaire : les étapes d'index < `activeStep` sont auto-marquées
   * comme complétées (utile pour les wizards séquentiels). En mode
   * non-linéaire, l'auto-complétion est désactivée et chaque étape doit
   * être marquée explicitement via la prop `isCompleted` de `<Step>`.
   * @default true
   */
  isLinear?: boolean;
  /**
   * Rend chaque étape comme un `<button>` cliquable qui appelle
   * `onStepChange(index)`. Indépendant de `isLinear` :
   * - linéaire + cliquable : cliquer revient en arrière dans un flux
   *   séquentiel ;
   * - non-linéaire + cliquable : navigation libre entre étapes
   *   (pattern MUI non-linear).
   * @default false
   */
  isClickable?: boolean;
  /**
   * Callback appelé quand l'utilisateur clique sur une étape.
   * Requis si `isClickable={true}` pour que les boutons aient un effet.
   */
  onStepChange?: (step: number) => void;
  /** Children : composants `<Step>`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
  /** Label accessible du Stepper (sur l'élément `<ol>`). */
  "aria-label"?: string;
}

export interface StepProps {
  /** Label visible de l'étape. */
  label: string;
  /**
   * Override explicite du statut « complété » de cette étape.
   * - **Linéaire** : si non fourni, dérivé automatiquement (toute étape
   *   d'index < `activeStep` est complétée).
   * - **Non-linéaire** : par défaut **rien n'est auto-complété** ; le parent
   *   doit passer `isCompleted` quand une étape a effectivement été validée
   *   (sinon l'utilisateur pourrait sauter à l'étape 3 et l'étape 2 serait
   *   affichée par erreur comme complétée).
   */
  isCompleted?: boolean;
  /**
   * Force l'état d'erreur sur cette étape (override du status calculé).
   * @default false
   */
  isError?: boolean;
  /**
   * Désactive l'étape : non cliquable en mode non-linear, opacité réduite.
   * @default false
   */
  isDisabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: CSSProperties;
}

// -----------------------------------------------------------------------
// Context interne — partage activeStep / isLinear / orientation à chaque Step.

interface StepperContextValue {
  activeStep: number;
  isLinear: boolean;
  isClickable: boolean;
  orientation: StepperOrientation;
  count: number;
  onStepChange?: (step: number) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error("<Step> doit être utilisé à l'intérieur de <Stepper>.");
  }
  return ctx;
}

// -----------------------------------------------------------------------
// Stepper — container

/**
 * Stepper — Comète Design System
 *
 * Affiche une progression en étapes numérotées. Inspiré du
 * [Material UI Stepper](https://mui.com/material-ui/react-stepper/).
 *
 * ```tsx
 * // Mode linear (par défaut)
 * <Stepper activeStep={1}>
 *   <Step label="Compte" />
 *   <Step label="Adresse" />
 *   <Step label="Paiement" />
 * </Stepper>
 *
 * // Mode non-linear avec étape en erreur
 * const [step, setStep] = useState(0);
 * <Stepper activeStep={step} isLinear={false} onStepChange={setStep}>
 *   <Step label="Compte" />
 *   <Step label="Adresse" isError />
 *   <Step label="Paiement" />
 * </Stepper>
 *
 * // Orientation verticale
 * <Stepper activeStep={1} orientation="vertical">
 *   <Step label="Compte" />
 *   <Step label="Adresse" />
 *   <Step label="Paiement" />
 * </Stepper>
 * ```
 */
export function Stepper({
  activeStep,
  orientation = "horizontal",
  isLinear = true,
  isClickable = false,
  onStepChange,
  children,
  className,
  style,
  "aria-label": ariaLabel,
}: StepperProps): ReactElement {
  // Comptage des Step valides pour pouvoir injecter `__index` et savoir le `last`.
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  const ctx = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      isLinear,
      isClickable,
      orientation,
      count,
      onStepChange,
    }),
    [activeStep, isLinear, isClickable, orientation, count, onStepChange],
  );

  return (
    <StepperContext.Provider value={ctx}>
      <ol
        className={[styles.stepper, className].filter(Boolean).join(" ")}
        style={style}
        data-orientation={orientation}
        aria-label={ariaLabel ?? "Progression"}
      >
        {items.map((child, index) =>
          // REASON : on injecte __index pour que chaque Step connaisse sa
          // position. Le clone évite à l'utilisateur d'avoir à passer manuellement
          // index ; le type est masqué par le cast `as ReactElement<StepInternal>`.
          cloneElement(child as ReactElement<StepInternalProps>, {
            __index: index,
            key: index,
          }),
        )}
      </ol>
    </StepperContext.Provider>
  );
}

Stepper.displayName = "Stepper";

// -----------------------------------------------------------------------
// Step — étape individuelle

/** Props internes (injectées par Stepper) — pas dans l'API publique. */
interface StepInternalProps extends StepProps {
  /** @internal Index injecté par Stepper via cloneElement. */
  __index?: number;
}

/**
 * Step — étape d'un Stepper.
 *
 * Le status visuel est calculé automatiquement depuis la position vs
 * `activeStep` du `<Stepper>` parent :
 * - index < activeStep → `completed`
 * - index === activeStep → `active`
 * - index > activeStep → `upcoming`
 * - `isError={true}` → `error` (override prioritaire)
 */
export function Step({
  label,
  isCompleted,
  isError = false,
  isDisabled = false,
  className,
  style,
  __index,
}: StepInternalProps): ReactElement {
  const {
    activeStep,
    isLinear,
    isClickable,
    orientation,
    count,
    onStepChange,
  } = useStepperContext();

  const index = __index ?? 0;
  const isLast = index === count - 1;
  // `isActive` est tracé indépendamment de `status` : une étape en erreur
  // qui est aussi l'étape courante doit pouvoir être stylée différemment
  // (graisse medium) sans changer son data-status.
  const isActive = index === activeStep;

  // Détermine si l'étape est complétée :
  // - override explicite via `isCompleted` (prioritaire) ;
  // - sinon, en mode linéaire seulement : auto-dérivé depuis activeStep ;
  // - en mode non-linéaire, aucune auto-complétion (l'utilisateur peut sauter
  //   à n'importe quelle étape sans valider les précédentes — le parent
  //   doit passer `isCompleted` explicitement pour les étapes validées).
  const isCompletedAuto = isLinear && index < activeStep;
  const effectiveCompleted = isCompleted ?? isCompletedAuto;

  // Priorité : error > completed > active > upcoming.
  const status: StepStatus = isError
    ? "error"
    : effectiveCompleted
      ? "completed"
      : index === activeStep
        ? "active"
        : "upcoming";

  // Couleur du connecteur APRÈS cette étape — coloré (brand) uniquement si la
  // step est `completed`. Les autres statuts (incl. erreur) laissent gris.
  const connectorStatus: "completed" | "default" =
    status === "completed" ? "completed" : "default";

  // Indicator content selon le status :
  // - completed : check `outlined` blanc sur cercle brand (le cercle vient
  //   de `.indicator[data-status="completed"]`).
  // - error : icône Warning `filled` en taille pleine (24px) — l'icône fait
  //   office d'indicateur, on retire le cercle de fond via le CSS pour
  //   matcher MUI (triangle rouge avec « ! » blanc directement, pas de
  //   cercle critical autour).
  // - upcoming / active : numéro de l'étape (1-based).
  const indicatorContent =
    status === "completed" ? (
      <Icon icon="Check" size={16} spacing="none" color="inverted" />
    ) : status === "error" ? (
      <Icon icon="Warning" size={24} color="critical" appearance="filled" />
    ) : (
      <span className={styles.indicatorNumber}>{index + 1}</span>
    );

  // Quand `isClickable` est activé sur le Stepper, on rend chaque étape
  // comme un <button> (même désactivé, même sans onStepChange) pour conserver
  // la sémantique cliquable. Si `onStepChange` n'est pas fourni, le clic ne
  // fait rien — le bouton reste cohérent visuellement.
  const renderAsButton = isClickable;

  // Contenu commun (indicateur + label).
  const inner = (
    <>
      <span
        className={styles.indicator}
        data-status={status}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
        aria-hidden="true"
      >
        {indicatorContent}
      </span>
      <span
        className={styles.label}
        data-status={status}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
      >
        {label}
      </span>
    </>
  );

  // Wrapper : <button> si `isClickable` (cliquable, même désactivé), <div>
  // statique sinon.
  const innerEl = renderAsButton ? (
    <button
      type="button"
      className={styles.stepContent}
      onClick={() => onStepChange?.(index)}
      disabled={isDisabled}
      aria-current={status === "active" ? "step" : undefined}
      aria-label={label}
    >
      {inner}
    </button>
  ) : (
    <div
      className={styles.stepContent}
      data-disabled={isDisabled || undefined}
      aria-current={status === "active" ? "step" : undefined}
    >
      {inner}
    </div>
  );

  return (
    <li
      className={[styles.stepItem, className].filter(Boolean).join(" ")}
      style={style}
      data-status={status}
      data-orientation={orientation}
      data-last={isLast || undefined}
    >
      {innerEl}
      {/* Connecteur après l'étape — caché sur la dernière */}
      {!isLast && (
        <span
          className={styles.connector}
          data-orientation={orientation}
          data-status={connectorStatus}
          aria-hidden="true"
        />
      )}
    </li>
  );
}

Step.displayName = "Step";
