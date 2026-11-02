// SideNav.Footer — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SideNav, Logo } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { SideNavOnly, MainCouranteNav } from "./_appShell";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

/** Seul le pied est montré : ni l'en-tête ni le corps de la nav. */
function NavContext({ children }: { children: ReactNode }) {
  return <SideNavOnly focus="footer" footer={children} nav={<MainCouranteNav />} />;
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
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "Pied d'une SideNav : logo secondaire, version, mentions, accès compte.",
                "Contenu ancré en bas du menu latéral.",
              ]}
              avoid={[
                "Des items de navigation principaux → SideNavSection/Item.",
                "Un pied de page global → un footer de Page.",
                "Une barre d'actions → ButtonGroup.",
              ]}
              best={[
                "Contenu léger et discret ; s'adapter à l'état replié.",
                "À utiliser au sein de SideNav ; réserver aux infos secondaires.",
              ]}
              accessibility={[
                "Contenu secondaire ; rester atteignable au clavier.",
                "Liens/actions avec un nom accessible même en mode replié.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4404:3856") },
  },
} satisfies Meta<typeof SideNavFooterStory>;

export default meta;
type Story = StoryObj<typeof SideNavFooterStory>;

/**
 * Footer avec le logo Comète. Pour une marque discrète (opacité réduite, non interactive),
 * l'envelopper dans `SideNav.FooterBrand` ; sa prop `rail` donne la variante affichée en
 * mode rail (le logo complet déborderait de 80 px).
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<SideNav.Footer>
  <Logo size={14} />
</SideNav.Footer>

// Marque discrète, avec sa variante rail
<SideNav.Footer>
  <SideNav.FooterBrand rail={<Logo size={24} format="icon" />}>
    <Logo size={14} />
  </SideNav.FooterBrand>
</SideNav.Footer>`,
      },
    },
  },
};
