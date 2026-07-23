// DocsTabsPage — page Docs autodocs personnalisée à 3 onglets (Code / Design /
// Guidelines), façon Zeroheight. Le tab "Code" reprend le contenu autodocs
// standard (titre, description, primary, controls, stories). Les tabs "Design"
// et "Guidelines" ne s'affichent que si leur contenu est fourni via le meta.
import type { ReactNode } from "react";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@aexae/comete-design-system/components";

export interface DocsTabsPageProps {
  /** Contenu du tab Design — embed Figma, tokens, anatomie. Optionnel. */
  design?: ReactNode;
  /** Contenu du tab Guidelines — when to use / à éviter / bonnes pratiques. Optionnel. */
  guidelines?: ReactNode;
}

/**
 * DocsTabsPage — remplace la page autodocs par défaut par une page à onglets.
 * Utilisée via `parameters.docs.page` dans le meta d'un composant.
 */
export function DocsTabsPage({
  design,
  guidelines,
}: DocsTabsPageProps): ReactNode {
  return (
    <>
      <Title />
      <Tabs defaultSelectedKey="code">
        <TabList aria-label="Documentation">
          <Tab id="code">Code</Tab>
          {design ? <Tab id="design">Design</Tab> : null}
          {guidelines ? <Tab id="guidelines">Guidelines</Tab> : null}
        </TabList>
        <TabPanel id="code">
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </TabPanel>
        {design ? <TabPanel id="design">{design}</TabPanel> : null}
        {guidelines ? (
          <TabPanel id="guidelines">{guidelines}</TabPanel>
        ) : null}
      </Tabs>
    </>
  );
}
