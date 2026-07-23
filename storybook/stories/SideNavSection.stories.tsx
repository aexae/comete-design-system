// SideNav.Section — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function NavContext({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 256, background: "var(--background-surface-default)", padding: "var(--space075) var(--space100)" }}>
      {children}
    </div>
  );
}

function SideNavSectionStory(props: { title?: string; children?: ReactNode }) {
  return (
    <NavContext>
      <SideNav.Section title={props.title}>
        {props.children ?? (
          <>
            <SideNav.Item label="Accueil" iconBefore="Home" isSelected />
            <SideNav.Item label="Agents" iconBefore="Agent" />
            <SideNav.Item label="Sites" iconBefore="LocationOn" />
          </>
        )}
      </SideNav.Section>
    </NavContext>
  );
}

const meta = {
  title: "Navigation/SideNav/Section",
  component: SideNavSectionStory,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Regrouper des SideNavItem apparentés sous un titre de section dans une SideNav.",
                "Structurer une navigation latérale riche en plusieurs groupes.",
              ]}
              avoid={[
                "Un seul item isolé → SideNavItem directement.",
                "Une séparation visuelle simple → Divider.",
                "Des sections de contenu de page → Heading + Stack.",
              ]}
              best={[
                "Titre de section court et explicite ; ordre stable des groupes.",
                "Prévoir le rendu replié (titres masqués/condensés).",
              ]}
              accessibility={[
                "Le titre de section structure la navigation pour les lecteurs d'écran.",
                "Regrouper des items liés ; garder un ordre stable.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4328:18011") },
  },
  argTypes: {
    title: { control: "text" },
  },
  args: {
    title: "MANAGER",
  },
} satisfies Meta<typeof SideNavSectionStory>;

export default meta;
type Story = StoryObj<typeof SideNavSectionStory>;

/** Section avec label uppercase. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Section title="Manager">
  <SideNav.Item label="Accueil" iconBefore="Home" isSelected />
  <SideNav.Item label="Agents" iconBefore="Agent" />
  <SideNav.Item label="Sites" iconBefore="LocationOn" />
</SideNav.Section>`,
      },
    },
  },
};

/** Section sans titre (juste un groupe d'items). */
export const WithoutTitle: Story = {
  name: "Without title",
  args: { title: undefined },
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Section>
  <SideNav.Item label="Accueil" iconBefore="Home" />
  <SideNav.Item label="Recherche" iconBefore="Search" />
</SideNav.Section>`,
      },
    },
  },
};
