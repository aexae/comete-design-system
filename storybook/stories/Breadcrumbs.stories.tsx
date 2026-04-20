// Breadcrumbs — stories Storybook
import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { IconName } from "@naxit/comete-icons";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Icon,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
} from "@naxit/comete-design-system/components";

const FIGMA_FILE =
  "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) =>
  `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Interactive helper — cliquer sur un item le rend courant et cache les suivants

interface PageItem {
  label: string;
  iconBefore?: IconName;
}

function InteractiveBreadcrumbs({ pages }: { pages: PageItem[] }) {
  // Démarre sur la page la plus profonde
  const [currentIndex, setCurrentIndex] = useState(pages.length - 1);
  const visible = pages.slice(0, currentIndex + 1);

  return (
    <Breadcrumbs>
      {visible.map((page, i) => {
        const isCurrent = i === currentIndex;
        return (
          <BreadcrumbItem
            key={page.label}
            label={page.label}
            iconBefore={page.iconBefore}
            isCurrent={isCurrent}
            onClick={isCurrent ? undefined : () => setCurrentIndex(i)}
          />
        );
      })}
    </Breadcrumbs>
  );
}

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: figmaUrl("3132:44041") },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

// -----------------------------------------------------------------------
// Stories — cliquer sur un item intermédiaire le rend courant et masque les suivants

export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("3132:44041") } },
  render: () => (
    <InteractiveBreadcrumbs
      pages={[
        { label: "Accueil" },
        { label: "Clients" },
        { label: "Fiche client" },
      ]}
    />
  ),
};

/** Icône placée devant la première étape (Accueil). */
export const WithIcons: Story = {
  name: "With icons",
  parameters: { design: { type: "figma", url: figmaUrl("3018:11522") } },
  render: () => (
    <InteractiveBreadcrumbs
      pages={[
        { label: "Accueil", iconBefore: "Home" },
        { label: "Clients" },
        { label: "Fiche client" },
      ]}
    />
  ),
};

/**
 * Chaque étape intermédiaire est un seul élément cliquable (label + chevron)
 * qui ouvre un menu listant les sections sœurs.
 * Le bouton est stylé pour matcher parfaitement la typographie du breadcrumb link.
 */
export const WithMenu: Story = {
  name: "With menu",
  parameters: { design: { type: "figma", url: figmaUrl("3018:11522") } },
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem label="Accueil" href="/" />
      <li style={{ display: "flex", alignItems: "center", gap: "var(--space075)" }}>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-ui-xs)",
            lineHeight: "var(--line-height-ui-xs)",
            color: "var(--text-subtlest)",
          }}
        >
          /
        </span>
        <MenuTrigger>
          <AriaButton
            style={{
              // Match .link (BreadcrumbItem.module.css) exactly
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space075)",
              fontFamily: "var(--font-family-primary)",
              fontSize: "var(--font-size-ui-xs)",
              fontWeight: "var(--font-weight-regular)",
              lineHeight: "var(--line-height-ui-xs)",
              letterSpacing: "normal",
              color: "var(--text-subtle)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              outline: "none",
            }}
          >
            Gestion
            <Icon icon="KeyboardArrowDown" size={16} color="subtle" />
          </AriaButton>
          <MenuPopover width={220}>
            <Menu aria-label="Sections">
              <MenuItem id="gestion" iconBefore="Folder">Gestion</MenuItem>
              <MenuItem id="comptabilite" iconBefore="Work">Comptabilité</MenuItem>
              <MenuItem id="rh" iconBefore="Group">Ressources humaines</MenuItem>
            </Menu>
          </MenuPopover>
        </MenuTrigger>
      </li>
      <BreadcrumbItem label="Fiche client" isCurrent />
    </Breadcrumbs>
  ),
};

export const DeepHierarchy: Story = {
  name: "Deep hierarchy",
  parameters: { design: { type: "figma", url: figmaUrl("3132:44041") } },
  render: () => (
    <InteractiveBreadcrumbs
      pages={[
        { label: "Accueil" },
        { label: "Gestion" },
        { label: "Contrats" },
        { label: "2024" },
        { label: "Contrat #4521" },
      ]}
    />
  ),
};

