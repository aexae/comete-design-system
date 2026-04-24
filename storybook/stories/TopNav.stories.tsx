// TopNav — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TopNav,
  Logo,
  Button,
  Avatar,
  Text,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Navigation/TopNav",
  component: TopNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4323:3313") },
    backgrounds: {                                                                                  
      default: "dark",                                                                              
      values: [
        { name: "dark", value: "var(--white-4)" },                                                         
        { name: "light", value: "var(--black-4)" },                    
      ],
    },
  },
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------
// Stories

/** Desktop/tablet : logo + nom + actions. Réduire le viewport pour voir le mode mobile. */
export const Default: Story = {
    decorators: [
      () => (
        <div style={{ background: "var(--black-4)", height: "100vh", width: "100vw"}}>
          <TopNav logo={<Logo size={24} format="icon" product="link" />} appName="Pro Sécurité" title="Accueil">
            <Button iconBefore="Search" appearance="subtle" spacing="compact" />
            <Avatar initials="AC" size="medium" />
          </TopNav>
        </div>                                                                                        
      ),                                                          
    ],
  };

/** Mobile avec back button. Réduire le viewport sous 600px. */
export const WithBack: Story = {
    decorators: [
      () => (
        <div style={{ background: "var(--black-4)", height: "100vh", width: "100vw"}}>
          <TopNav
            logo={<Logo size={24} format="icon" product="link" />}
            appName="Pro Sécurité"
            title="Détail agent"
            onBack={() => window.history.back()}
          >
            <Button iconBefore="Search" appearance="subtle" spacing="compact" />
            <Avatar initials="AC" size="medium" />
          </TopNav>
          <Text style={{ padding: "var(--space200)" }}>
            Réduisez la largeur de la fenêtre sous 600px pour voir le mode mobile avec back button.
          </Text>
        </div>                                                                                        
      ),                                                          
    ],
};
