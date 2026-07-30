// SideNav.Skeleton — état de chargement de la navigation latérale
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SideNav, SideNavSkeleton } from "@aexae/comete-design-system/components";
import type { SideNavSkeletonProps } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { MainCouranteShell } from "./_appShell";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

const meta = {
  title: "Navigation/SideNav/Skeleton",
  component: SideNavSkeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Pendant le chargement asynchrone des entrées de navigation (droits, sections dynamiques).",
                "À rendre à la place des SideNav.Section / SideNav.Item tant que les données arrivent.",
              ]}
              avoid={[
                "Un spinner centré isolé → préférer un skeleton qui reprend la forme de la nav.",
                "Un état sans fin : basculer vers le contenu réel ou vers SideNav.Empty dès la réponse.",
              ]}
              best={[
                "Refléter le nombre d'items attendu (`count`) pour limiter le saut de mise en page.",
                "Garder la marque (SideNav.Header) et le footer réels si déjà connus ; ne charger que les rubriques.",
              ]}
              accessibility={[
                "Chaque placeholder porte `role=\"status\"` + `aria-label` (via Skeleton) pour signaler le chargement.",
                "Retirer le skeleton dès que le contenu est prêt pour ne pas laisser un état occupé permanent.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4319:15156") },
  },
  decorators: [
    (Story) => <MainCouranteShell nav={<Story />} />,
  ],
  argTypes: {
    count: { control: { type: "number", min: 1, max: 12 } },
    withSectionTitle: { control: "boolean" },
    withHeader: { control: "boolean" },
  },
  args: {
    count: 5,
    withSectionTitle: true,
    withHeader: false,
  },
} satisfies Meta<SideNavSkeletonProps>;

export default meta;
type Story = StoryObj<SideNavSkeletonProps>;

/**
 * Chargement des rubriques dans le template réel : la marque « Pro Sécurité »
 * et le footer restent, seul le corps de la navigation est en skeleton.
 */
export const Default: Story = {};

/**
 * Chargement fidèle à la structure réelle : trois groupes skeleton calqués sur
 * Manager (4) / MCE (2) / Administration (3), séparés par des dividers.
 */
export const MultipleSections: Story = {
  name: "Multiple sections",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <SideNavSkeleton count={4} />
      <SideNav.Divider />
      <SideNavSkeleton count={2} />
      <SideNav.Divider />
      <SideNavSkeleton count={3} />
    </>
  ),
};

/**
 * Brique unitaire — `SideNav.ItemSkeleton` : la silhouette d'un seul item
 * (pastille d'icône + barre de label, `hasDescription` pour une 2ᵉ ligne).
 * À composer manuellement pour un état de chargement sur mesure, ou via
 * `SideNav.Skeleton` qui en empile plusieurs.
 */
export const ItemSkeletons: Story = {
  name: "Item skeleton (unitaire)",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <SideNav.ItemSkeleton />
      <SideNav.ItemSkeleton />
      <SideNav.ItemSkeleton hasDescription />
    </>
  ),
};
