import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import {
  Spotlight,
  Button,
  Stack,
  Text,
  type SpotlightPlacement,
} from "@naxit/comete-design-system";

// const FIGMA_FILE =
//   "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
// const figmaUrl = (nodeId: string) =>
//   `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta: Meta<typeof Spotlight> = {
  title: "Components/Spotlight",
  component: Spotlight,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ] satisfies SpotlightPlacement[],
    },
    offset: { control: { type: "number", min: 0, max: 32, step: 2 } },
    targetPadding: { control: { type: "number", min: 0, max: 16, step: 2 } },
    targetBorderRadius: { control: { type: "number", min: 0, max: 16, step: 2 } },
    pulse: { control: "boolean" },
    width: { control: { type: "number", min: 200, max: 600, step: 50 } },
  },
};
export default meta;

type Story = StoryObj<typeof Spotlight>;

// -----------------------------------------------------------------------
// 1. Default — simple spotlight

function DefaultRender() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 100 }}>
      <Button ref={targetRef} onPress={() => setIsOpen(true)}>
        Découvrir cette fonctionnalité
      </Button>
      <Spotlight
        targetRef={targetRef}
        title="Nouvelle fonctionnalité"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom"
      >
        <Text size="small">
          Cette fonctionnalité vous permet de gérer vos projets plus
          efficacement. Cliquez pour en savoir plus.
        </Text>
      </Spotlight>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultRender />,
};

// -----------------------------------------------------------------------
// 2. With Pulse

function PulseRender() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 100 }}>
      <Button ref={targetRef} color="brand" onPress={() => setIsOpen(true)}>
        Essayer maintenant
      </Button>
      <Spotlight
        targetRef={targetRef}
        title="Attention ici !"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom"
        pulse
      >
        <Text size="small">
          L&apos;animation pulse attire l&apos;attention de l&apos;utilisateur
          sur l&apos;élément cible.
        </Text>
      </Spotlight>
    </div>
  );
}

export const WithPulse: Story = {
  render: () => <PulseRender />,
};

// -----------------------------------------------------------------------
// 3. Custom Actions

function CustomActionsRender() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 100 }}>
      <Button ref={targetRef} appearance="outlined" onPress={() => setIsOpen(true)}>
        En savoir plus
      </Button>
      <Spotlight
        targetRef={targetRef}
        title="Actions personnalisées"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="right"
        actions={[
          { label: "Plus tard", onPress: () => setIsOpen(false), appearance: "subtle" },
          { label: "Compris !", onPress: () => setIsOpen(false) },
        ]}
      >
        <Text size="small">
          Vous pouvez fournir vos propres boutons d&apos;action via la prop{" "}
          <code>actions</code>.
        </Text>
      </Spotlight>
    </div>
  );
}

export const CustomActions: Story = {
  render: () => <CustomActionsRender />,
};

// -----------------------------------------------------------------------
// 4. Multi-step Tour

function TourRender() {
  const ref1 = useRef<HTMLButtonElement>(null);
  const ref2 = useRef<HTMLButtonElement>(null);
  const ref3 = useRef<HTMLButtonElement>(null);
  const refs = [ref1, ref2, ref3];

  const [step, setStep] = useState<number | null>(null);

  const titles = [
    "Étape 1 : Navigation",
    "Étape 2 : Recherche",
    "Étape 3 : Paramètres",
  ];
  const descriptions = [
    "Utilisez ce menu pour naviguer entre les sections de l'application.",
    "La barre de recherche vous permet de trouver rapidement ce que vous cherchez.",
    "Accédez à vos paramètres pour personnaliser votre expérience.",
  ];
  const placements: SpotlightPlacement[] = ["bottom", "bottom", "left"];

  return (
    <div style={{ padding: 100 }}>
      <Stack gap="200" direction="row">
        <Button ref={ref1} appearance="subtle">
          Navigation
        </Button>
        <Button ref={ref2} appearance="subtle">
          Recherche
        </Button>
        <Button ref={ref3} appearance="subtle">
          Paramètres
        </Button>
      </Stack>

      <div style={{ marginTop: 24 }}>
        <Button color="brand" onPress={() => setStep(0)}>
          Lancer le tour guidé
        </Button>
      </div>

      {step !== null && (
        <Spotlight
          targetRef={refs[step]}
          title={titles[step]}
          isOpen
          onOpenChange={(open) => {
            if (!open) setStep(null);
          }}
          placement={placements[step]}
          pulse
          activeStep={step}
          totalSteps={3}
          onPrev={() => setStep((s) => Math.max(0, (s ?? 1) - 1))}
          onNext={() => setStep((s) => Math.min(2, (s ?? 0) + 1))}
          onDone={() => setStep(null)}
          onSkip={() => setStep(null)}
        >
          <Text size="small">{descriptions[step]}</Text>
        </Spotlight>
      )}
    </div>
  );
}

export const Tour: Story = {
  name: "Multi-step Tour",
  render: () => <TourRender />,
};

// -----------------------------------------------------------------------
// 5. All Placements

function PlacementsRender() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<SpotlightPlacement>("bottom");

  const placements: SpotlightPlacement[] = [
    "top",
    "top-start",
    "top-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "left-start",
    "left-end",
    "right",
    "right-start",
    "right-end",
  ];

  return (
    <div style={{ padding: 200 }}>
      <Stack gap="200">
        <div
          ref={targetRef}
          style={{
            width: 200,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed var(--border-bold)",
            borderRadius: "var(--radius0375)",
          }}
        >
          <Text size="small" color="subtle">
            Cible
          </Text>
        </div>
        <Stack gap="100" direction="row" wrap>
          {placements.map((p) => (
            <Button
              key={p}
              appearance={p === placement ? "contained" : "outlined"}
              spacing="compact"
              onPress={() => {
                setPlacement(p);
                setIsOpen(true);
              }}
            >
              {p}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Spotlight
        targetRef={targetRef}
        title={`Placement : ${placement}`}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        width={280}
      >
        <Text size="small">
          Le dialog est positionné en <strong>{placement}</strong> par rapport à
          la cible.
        </Text>
      </Spotlight>
    </div>
  );
}

export const AllPlacements: Story = {
  render: () => <PlacementsRender />,
};
