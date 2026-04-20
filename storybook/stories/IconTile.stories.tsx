import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconTile,
  Stack,
  Cluster,
  Text,
} from "@naxit/comete-design-system/components";
import type {
  IconTileAppearance,
  IconTileSize,
  IconTileShape,
} from "@naxit/comete-design-system/components";
import type { IconName } from "@naxit/comete-icons";
import { iconRegistry } from "@naxit/comete-icons";

// -----------------------------------------------------------------------
// Constants

const ICON_OPTIONS = Object.keys(iconRegistry) as IconName[];

const APPEARANCES: IconTileAppearance[] = [
  "neutral",
  "brand",
  "information",
  "success",
  "warning",
  "critical",
  "accent",
];

const SIZES: IconTileSize[] = ["xsmall", "small", "medium", "large"];

const SHAPES: IconTileShape[] = ["square", "circle"];

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/IconTile",
  component: IconTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    icon: {
      control: "select",
      options: ICON_OPTIONS,
    },
    appearance: {
      control: "select",
      options: APPEARANCES,
    },
    size: {
      control: "select",
      options: SIZES,
    },
    shape: {
      control: "select",
      options: SHAPES,
    },
    label: { control: "text" },
  },
  args: {
    icon: "CalendarMonth",
    appearance: "neutral",
    size: "medium",
    shape: "square",
  },
} satisfies Meta<typeof IconTile>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

/** Playground avec tous les contrôles. */
export const Default: Story = {};

/** Toutes les apparences côte à côte. */
export const Appearances: Story = {
  render: () => (
    <Cluster gap="150" align="center">
      {APPEARANCES.map((appearance) => (
        <Stack key={appearance} gap="100" align="center">
          <IconTile icon="CalendarMonth" appearance={appearance} />
          <Text size="xsmall" as="span" color="subtlest">
            {appearance}
          </Text>
        </Stack>
      ))}
    </Cluster>
  ),
};

/** Toutes les tailles côte à côte. */
export const Sizes: Story = {
  render: () => (
    <Cluster gap="150" align="end">
      {SIZES.map((size) => (
        <Stack key={size} gap="100" align="center">
          <IconTile icon="CalendarMonth" appearance="information" size={size} />
          <Text size="xsmall" as="span" color="subtlest">
            {size}
          </Text>
        </Stack>
      ))}
    </Cluster>
  ),
};

/** Forme carrée (défaut) vs cercle. */
export const Shapes: Story = {
  render: () => (
    <Cluster gap="200" align="center">
      {SHAPES.map((shape) => (
        <Stack key={shape} gap="100" align="center">
          <IconTile icon="Person" appearance="brand" shape={shape} />
          <Text size="xsmall" as="span" color="subtlest">
            {shape}
          </Text>
        </Stack>
      ))}
    </Cluster>
  ),
};

/** Grille complète : toutes les apparences × toutes les tailles. */
export const AllCombinations: Story = {
  render: () => (
    <Stack gap="200">
      {APPEARANCES.map((appearance) => (
        <Cluster key={appearance} gap="150" align="center">
          <Text
            size="xsmall"
            as="span"
            color="subtlest"
            style={{ width: 80 }}
          >
            {appearance}
          </Text>
          {SIZES.map((size) => (
            <IconTile
              key={size}
              icon="CalendarMonth"
              appearance={appearance}
              size={size}
            />
          ))}
        </Cluster>
      ))}
    </Stack>
  ),
};

/** Exemples d'utilisation typiques (KPIs, catégories). */
export const UseCases: Story = {
  render: () => (
    <Cluster gap="200" align="center">
      <Stack gap="075" align="center">
        <IconTile icon="Group" appearance="brand" />
        <Text size="xsmall" as="span" color="subtlest">
          Utilisateurs
        </Text>
      </Stack>
      <Stack gap="075" align="center">
        <IconTile icon="CalendarMonth" appearance="success" />
        <Text size="xsmall" as="span" color="subtlest">
          Planning
        </Text>
      </Stack>
      <Stack gap="075" align="center">
        <IconTile icon="Warning" appearance="warning" shape="circle" />
        <Text size="xsmall" as="span" color="subtlest">
          Alertes
        </Text>
      </Stack>
      <Stack gap="075" align="center">
        <IconTile icon="LocationOn" appearance="critical" shape="circle" />
        <Text size="xsmall" as="span" color="subtlest">
          Sites
        </Text>
      </Stack>
      <Stack gap="075" align="center">
        <IconTile icon="Schedule" appearance="information" />
        <Text size="xsmall" as="span" color="subtlest">
          Horaires
        </Text>
      </Stack>
    </Cluster>
  ),
};
