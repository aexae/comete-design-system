// Stepper — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Stepper,
  Step,
  Button,
  ButtonGroup,
} from "@naxit/comete-design-system/components";

// Largeur du wrapper adaptée à l'orientation pour que le toggle `orientation`
// dans les controls reste lisible : 300px en vertical (compact), 600px en
// horizontal (laisse respirer les labels).
function getWrapperWidth(orientation?: "horizontal" | "vertical"): number {
  return orientation === "vertical" ? 300 : 600;
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    activeStep: { control: { type: "number", min: 0, step: 1 } },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    isLinear: { control: "boolean" },
    isClickable: { control: "boolean" },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof Stepper>;

// -----------------------------------------------------------------------
// Stories

/**
 * Stepper linéaire horizontal, étape active = 1 (`Adresse`).
 *
 * Active `isClickable` dans les controls pour rendre les étapes cliquables —
 * `onStepChange` est branché sur un state local pour que les clics
 * fonctionnent directement.
 */
export const Default: Story = {
  args: { activeStep: 1, isClickable: false },
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(args.activeStep);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper {...args} activeStep={step} onStepChange={setStep}>
            <Step label="Compte" />
            <Step label="Adresse" />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
        </div>
      );
    }
    // `key` force le remount quand le slider activeStep change dans les controls.
    return <Demo key={args.activeStep} />;
  },
};

/** Étape complétée + active + à venir. */
export const Progression: Story = {
  args: { activeStep: 2 },
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(args.activeStep);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper {...args} activeStep={step} onStepChange={setStep}>
            <Step label="Compte" />
            <Step label="Adresse" />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
        </div>
      );
    }
    return <Demo key={args.activeStep} />;
  },
};

/** Une étape en erreur. `isError` est prioritaire sur le status calculé. */
export const WithError: Story = {
  name: "With error",
  args: { activeStep: 2 },
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(args.activeStep);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper {...args} activeStep={step} onStepChange={setStep}>
            <Step label="Compte" />
            <Step label="Adresse" isError />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
        </div>
      );
    }
    return <Demo key={args.activeStep} />;
  },
};

/** Stepper vertical. */
export const Vertical: Story = {
  args: { activeStep: 1, orientation: "vertical" },
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(args.activeStep);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper {...args} activeStep={step} onStepChange={setStep}>
            <Step label="Compte" />
            <Step label="Adresse" />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
        </div>
      );
    }
    return <Demo key={args.activeStep} />;
  },
};

/** Stepper vertical avec une étape en erreur. */
export const VerticalWithError: Story = {
  name: "Vertical with error",
  args: { activeStep: 2, orientation: "vertical" },
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(args.activeStep);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper {...args} activeStep={step} onStepChange={setStep}>
            <Step label="Compte" />
            <Step label="Adresse" isError />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
        </div>
      );
    }
    return <Demo key={args.activeStep} />;
  },
};

/**
 * Stepper non-linéaire : chaque étape est cliquable et déclenche
 * `onStepChange`. Utile pour les wizards où l'utilisateur peut revenir
 * sur une étape précédente librement.
 *
 * **Important** : en mode non-linéaire, les étapes précédentes ne sont
 * **pas** auto-marquées « complétées » — c'est au parent de gérer quel
 * étape est réellement validée via la prop `isCompleted`. Ici, on tient
 * un `Set` des étapes complétées explicitement et on l'incrémente quand
 * l'utilisateur valide une étape.
 */
export const NonLinear: Story = {
  name: "Non-linear (clickable)",
  render: (args) => {
    function NonLinearDemo() {
      const steps = ["Compte", "Adresse", "Paiement", "Confirmation"];
      const [step, setStep] = useState(1);
      const [completed, setCompleted] = useState<Set<number>>(new Set());

      const validateCurrent = () => {
        setCompleted((prev) => new Set(prev).add(step));
      };
      const reset = () => {
        setCompleted(new Set());
        setStep(0);
      };

      return (
        <div
          style={{
            width: getWrapperWidth(args.orientation),
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Stepper
            orientation={args.orientation}
            activeStep={step}
            isLinear={false}
            isClickable
            onStepChange={setStep}
          >
            {steps.map((label, i) => (
              <Step key={label} label={label} isCompleted={completed.has(i)} />
            ))}
          </Stepper>
          <p style={{ margin: 0, color: "var(--text-subtle)" }}>
            Étape active : <strong>{steps[step]}</strong> ({step + 1} / 4) —
            clique sur n&apos;importe quelle étape pour y sauter, sans que
            les précédentes soient auto-validées.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={validateCurrent}
              disabled={completed.has(step)}
            >
              Valider l&apos;étape courante
            </button>
            <button type="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      );
    }
    return <NonLinearDemo />;
  },
};

/** Étape désactivée — non cliquable même en mode interactif. */
export const DisabledStep: Story = {
  name: "Disabled step",
  render: (args) => {
    function DisabledDemo() {
      const [step, setStep] = useState(0);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper
            orientation={args.orientation}
            activeStep={step}
            isLinear={false}
            isClickable
            onStepChange={setStep}
          >
            <Step label="Compte" />
            <Step label="Adresse" isDisabled />
            <Step label="Paiement" />
          </Stepper>
        </div>
      );
    }
    return <DisabledDemo />;
  },
};

/**
 * Linéaire + cliquable : auto-complétion préservée (les étapes précédentes
 * sont auto-marquées « complétées »), MAIS l'utilisateur peut cliquer sur
 * une étape précédente pour revenir en arrière. Utile pour les wizards
 * séquentiels où on veut permettre une revisite d'étape.
 */
export const LinearClickable: Story = {
  name: "Linear + clickable",
  render: (args) => {
    function Demo() {
      const [step, setStep] = useState(2);
      return (
        <div style={{ width: getWrapperWidth(args.orientation) }}>
          <Stepper
            orientation={args.orientation}
            activeStep={step}
            isClickable
            onStepChange={setStep}
          >
            <Step label="Compte" />
            <Step label="Adresse" />
            <Step label="Paiement" />
            <Step label="Confirmation" />
          </Stepper>
          <p style={{ marginTop: 16, color: "var(--text-subtle)" }}>
            Toutes les étapes &lt; {step + 1} sont auto-complétées. Clique sur
            une étape précédente pour y revenir.
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};

/** Wizard interactif : Précédent / Suivant. */
export const InteractiveWizard: Story = {
  name: "Interactive wizard",
  render: (args) => {
    function Wizard() {
      const steps = ["Compte", "Adresse", "Paiement", "Confirmation"];
      const [step, setStep] = useState(0);
      return (
        <div
          style={{
            width: getWrapperWidth(args.orientation),
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Stepper orientation={args.orientation} activeStep={step}>
            {steps.map((label) => (
              <Step key={label} label={label} />
            ))}
          </Stepper>
          <ButtonGroup>
            <Button
              appearance="outlined"
              isDisabled={step === 0}
              onPress={() => setStep((s) => Math.max(0, s - 1))}
            >
              Précédent
            </Button>
            <Button
              isDisabled={step === steps.length - 1}
              onPress={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              Suivant
            </Button>
          </ButtonGroup>
        </div>
      );
    }
    return <Wizard />;
  },
};
