// Drawer — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerProvider,
  Button,
  type DrawerPlacement,
  type DrawerSize,
  type DrawerStacking,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <DrawerProvider>
        <Story />
      </DrawerProvider>
    ),
  ],
  argTypes: {
    placement: {
      control: "select",
      options: ["left", "right", "top", "bottom"] satisfies DrawerPlacement[],
    },
    size: {
      control: "select",
      options: ["narrow", "medium", "wide", "extended", "full"] satisfies DrawerSize[],
    },
    stacking: {
      control: "select",
      options: ["overlay", "push"] satisfies DrawerStacking[],
    },
    swipeable: { control: "boolean" },
  },
  args: {
    placement: "left",
    size: "medium",
    stacking: "overlay",
    swipeable: false,
  },
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("5088:14152") },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof Drawer>;

// -----------------------------------------------------------------------
// Story helper

function DrawerStory({
  placement = "left",
  size = "medium",
  stacking = "overlay",
  swipeable = false,
}: {
  placement?: DrawerPlacement;
  size?: DrawerSize | string;
  stacking?: DrawerStacking;
  swipeable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button onPress={() => setIsOpen(true)}>
        Ouvrir le drawer ({placement}, {size})
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size={size}
        stacking={stacking}
        swipeable={swipeable}
        aria-label="Drawer exemple"
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Drawer {placement}
        </DrawerHeader>
        <DrawerBody>
          <p style={{ marginBottom: 16 }}>
            Placement : <strong>{placement}</strong> — Size : <strong>{size}</strong>
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          {Array.from({ length: 10 }, (_, i) => (
            <p key={i} style={{ marginTop: 12 }}>
              Paragraphe {i + 1} — contenu scrollable pour tester le body overflow.
            </p>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <Button appearance="subtle" onPress={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onPress={() => setIsOpen(false)}>
            Confirmer
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}

// -----------------------------------------------------------------------
// Stories

/** Drawer par défaut (left, medium). */
export const Default: Story = {
  render: (args) => (
    <DrawerStory
      placement={args.placement}
      size={args.size}
      stacking={args.stacking}
      swipeable={args.swipeable}
    />
  ),
};

/** Les 4 placements. */
export const Placements: Story = {
  name: "All placements",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 24 }}>
      {(["left", "right", "top", "bottom"] satisfies DrawerPlacement[]).map((p) => (
        <PlacementDemo key={p} placement={p} />
      ))}
    </div>
  ),
};

function PlacementDemo({ placement }: { placement: DrawerPlacement }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>{placement}</Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size="narrow"
        aria-label={`Drawer ${placement}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          {placement}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer {placement}</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Tous les presets de taille. */
export const Sizes: Story = {
  name: "Size presets",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 24 }}>
      {(["narrow", "medium", "wide", "extended", "full"] satisfies DrawerSize[]).map((s) => (
        <SizeDemo key={s} size={s} />
      ))}
    </div>
  ),
};

function SizeDemo({ size }: { size: DrawerSize }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>{size}</Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="right"
        size={size}
        aria-label={`Drawer ${size}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Size: {size}
        </DrawerHeader>
        <DrawerBody>
          <p>Ce drawer utilise la taille &quot;{size}&quot;.</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Fullscreen. */
export const Fullscreen: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onPress={() => setIsOpen(true)}>Fullscreen</Button>
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          size="full"
          aria-label="Drawer fullscreen"
        >
          <DrawerHeader onClose={() => setIsOpen(false)}>Fullscreen</DrawerHeader>
          <DrawerBody>
            <p>Ce drawer occupe 100% de l&apos;écran.</p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  },
};

/** Structure complète : Header + Body + Footer. */
export const WithStructure: Story = {
  name: "With structure",
  render: () => <DrawerStory placement="right" size="wide" />,
};

/** Drawers stackés en mode overlay — chaque drawer peut en ouvrir un autre. */
export const StackedOverlay: Story = {
  name: "Stacked (overlay)",
  render: () => {
    return (
      <div style={{ padding: 24 }}>
        <RecursiveDrawerTrigger depth={1} placement="left" />
      </div>
    );
  },
};

function RecursiveDrawerTrigger({
  depth,
  placement,
}: {
  depth: number;
  placement: DrawerPlacement;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>
        {depth === 1 ? "Ouvrir le drawer" : `Empiler drawer ${depth}`}
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        size="medium"
        aria-label={`Drawer ${depth}`}
      >
        <DrawerHeader onClose={() => setIsOpen(false)}>
          Drawer {depth}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer de niveau {depth}.</p>
          <div style={{ marginTop: 16 }}>
            <Button onPress={() => setChildOpen(true)}>
              Empiler drawer {depth + 1}
            </Button>
          </div>
        </DrawerBody>
      </Drawer>
      <Drawer
        isOpen={childOpen}
        onOpenChange={setChildOpen}
        placement={placement}
        size="medium"
        aria-label={`Drawer ${depth + 1}`}
      >
        <DrawerHeader onClose={() => setChildOpen(false)}>
          Drawer {depth + 1}
        </DrawerHeader>
        <DrawerBody>
          <p>Drawer de niveau {depth + 1}.</p>
          <div style={{ marginTop: 16 }}>
            <RecursiveDrawerTrigger depth={depth + 2} placement={placement} />
          </div>
        </DrawerBody>
      </Drawer>
    </>
  );
}

/** Deux drawers stackés en mode push. */
export const StackedPush: Story = {
  name: "Stacked (push)",
  render: () => {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onPress={() => setFirst(true)}>Ouvrir 1er drawer</Button>
        <Drawer
          isOpen={first}
          onOpenChange={setFirst}
          placement="left"
          size="medium"
          aria-label="Premier drawer"
        >
          <DrawerHeader onClose={() => setFirst(false)}>Drawer 1</DrawerHeader>
          <DrawerBody>
            <p>Premier drawer.</p>
            <Button onPress={() => setSecond(true)}>Ouvrir 2ème (push)</Button>
          </DrawerBody>
        </Drawer>
        <Drawer
          isOpen={second}
          onOpenChange={setSecond}
          placement="left"
          size="narrow"
          stacking="push"
          aria-label="Second drawer"
        >
          <DrawerHeader onClose={() => setSecond(false)}>Drawer 2 (push)</DrawerHeader>
          <DrawerBody>
            <p>Ce drawer pousse le premier.</p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  },
};

/** Swipeable (mobile). */
export const Swipeable: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onPress={() => setIsOpen(true)}>Ouvrir (swipeable)</Button>
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          placement="bottom"
          size="medium"
          swipeable
          aria-label="Drawer swipeable"
        >
          <DrawerHeader onClose={() => setIsOpen(false)}>
            Swipeable drawer
          </DrawerHeader>
          <DrawerBody>
            <p>Glissez vers le bas pour fermer.</p>
          </DrawerBody>
        </Drawer>
      </div>
    );
  },
};
