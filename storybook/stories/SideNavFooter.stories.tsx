// SideNav.Footer — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav, Logo, Text } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function NavContext({ children }: { children: ReactNode }) {
  return (
    <div style={{
      width: 256, height: 200, background: "var(--background-surface-default)",
      display: "flex", flexDirection: "column", border: "1px solid var(--border-default)"
    }}>
      {children}
    </div>
  );
}

function SideNavFooterStory(props: { children?: ReactNode }) {
  return (
    <NavContext>
      <SideNav.Footer>{props.children ?? <Logo size={14} />}</SideNav.Footer>
    </NavContext>
  );
}

const meta = {
  title: "Navigation/SideNav/Footer",
  component: SideNavFooterStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4404:3856") },
  },
} satisfies Meta<typeof SideNavFooterStory>;

export default meta;
type Story = StoryObj<typeof SideNavFooterStory>;

/** Footer avec le logo Comète. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Footer>
  <Logo size={14} />
</SideNav.Footer>`,
      },
    },
  },
};

/** Footer avec texte. */
export const WithText: Story = {
  name: "With text",
  args: { children: <Text size="small" as="span" color="subtlest">© 2026 Comète</Text> },
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Footer>
  <Text size="small" as="span" color="subtlest">© 2026 Comète</Text>
</SideNav.Footer>`,
      },
    },
  },
};
