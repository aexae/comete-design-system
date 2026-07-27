// Page.Header — stories isolées du sous-composant
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Page,
  Avatar,
  Button,
  Stack,
  Divider,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

function Gutters({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingInline: "var(--space300)" }}>{children}</div>
  );
}

const meta = {
  title: "Layout/Page/Header",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              when={[
                "En-tête d'une page applicative : titre + actions (`trailing`) et affordance de navigation (`leading`).",
                "Pour ancrer le titre et le contexte en haut d'une Page.",
              ]}
              avoid={[
                "La barre supérieure globale de l'application → TopNav.",
                "Un en-tête de menu latéral → SideNav.",
                "Une barre de page unifiée titre + navigation → Page.Bar.",
              ]}
              best={[
                "Un seul titre par page ; placer les actions principales dans `trailing`.",
                "Réserver `leading` à une seule affordance de navigation (hamburger, retour).",
              ]}
              accessibility={[
                "Le titre porte le `h1` de la page.",
                "Le `trailing` reste accessible au clavier dans un ordre de tabulation logique.",
              ]}
            />
          }
        />
      ),
    },
    layout: "fullscreen",
    design: { type: "figma", url: figmaUrl("4559:6522") },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof Page>;

// -----------------------------------------------------------------------
// Stories

/**
 * **Header — Desktop** : titre + avatar trailing.
 * Pattern standard pour les pages principales (Agents, Sites, Pointages…).
 * Le trailing est aligné à droite et ne rétrécit pas.
 */
export const Desktop: Story = {
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Agents"
          trailing={<Avatar size="medium" initials="AC" />}
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Header — Avec actions** : titre + boutons d'action + avatar.
 * Utilisé quand la page propose des actions principales (Modifier, Archiver…).
 */
export const WithActions: Story = {
  name: "With actions",
  render: () => (
    <Gutters>
      <Page>
        <Page.Header
          title="Accueil"
          trailing={
            <Stack direction="row" gap="100" align="center">
              <Button appearance="subtle" density="compact" iconBefore="ChevronLeft" aria-label="Mois précédent" />
              <span style={{ fontFamily: "var(--font-family-primary)", fontSize: "var(--font-size-ui-xs)", fontWeight: 500, color: "var(--text-default)", whiteSpace: "nowrap" }}>
                Avril 2026
              </span>
              <Button appearance="subtle" density="compact" iconBefore="ChevronRight" aria-label="Mois suivant" />
              <Avatar size="medium" initials="AC" />
            </Stack>
          }
        />
        <Divider />
      </Page>
    </Gutters>
  ),
};

/**
 * **Header — Minimal** : titre seul, sans trailing.
 * Pour les pages simples (paramètres, profil, onboarding…).
 */
export const Minimal: Story = {
  render: () => (
    <Gutters>
      <Page>
        <Page.Header title="Paramètres" />
        <Divider />
      </Page>
    </Gutters>
  ),
};
