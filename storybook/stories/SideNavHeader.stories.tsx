// SideNav.Header — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav, Logo } from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function NavContext({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 256, background: "var(--background-surface-default)" }}>
      {children}
    </div>
  );
}

function SideNavHeaderStory(props: {
  logo?: ReactNode;
  companyName?: string;
  description?: string;
}) {
  return (
    <NavContext>
      <SideNav.Header {...props} />
    </NavContext>
  );
}

const meta = {
  title: "Navigation/SideNav/Header",
  component: SideNavHeaderStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4402:2954") },
  },
  argTypes: {
    companyName: { control: "text" },
    description: { control: "text" },
  },
  args: {
    logo: <Logo format="icon" />,
    companyName: "Pro Sécurité",
    description: "Main Courante",
  },
} satisfies Meta<typeof SideNavHeaderStory>;

export default meta;
type Story = StoryObj<typeof SideNavHeaderStory>;

/** Header complet avec logo Comète, nom de société et description. */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Header
  logo={<Logo format="icon" />}
  companyName="Pro Sécurité"
  description="Main Courante"
/>`,
      },
    },
  },
};

/** Logo custom (image client). */
export const CustomLogo: Story = {
  name: "Custom logo",
  args: {
    logo: <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--background-brand-bold-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>PS</div>,
    companyName: "Pro Sécurité",
    description: "Espace manager",
  },
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Header
  logo={<img src="/client-logo.png" alt="Pro Sécurité" width={32} height={32} />}
  companyName="Pro Sécurité"
  description="Espace manager"
/>`,
      },
    },
  },
};

/** Sans logo. */
export const WithoutLogo: Story = {
  name: "Without logo",
  args: { logo: undefined, companyName: "Mon Application" },
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Header companyName="Mon Application" />`,
      },
    },
  },
};

/** Sans description. */
export const WithoutDescription: Story = {
  name: "Without description",
  args: { description: undefined },
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Header logo={<Logo format="icon" />} companyName="Pro Sécurité" />`,
      },
    },
  },
};
