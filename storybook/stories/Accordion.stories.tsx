// Accordion — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  Icon,
} from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: (
                  <div style={{ maxWidth: 300 }}>
                    <Accordion defaultValue={["a"]}>
                      <AccordionItem value="a">
                        <AccordionTrigger>Est-ce accessible ?</AccordionTrigger>
                        <AccordionContent>
                          Oui, conforme au pattern WAI-ARIA.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="b">
                        <AccordionTrigger>Est-ce personnalisable ?</AccordionTrigger>
                        <AccordionContent>
                          Oui, via les design tokens.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ),
                caption: "Sections repliables consultées séparément (FAQ, détails).",
              }}
              dontExample={{
                example: (
                  <div style={{ maxWidth: 300 }}>
                    <Accordion defaultValue={["a"]}>
                      <AccordionItem value="a">
                        <AccordionTrigger>Section unique</AccordionTrigger>
                        <AccordionContent>
                          Un contenu court, toujours pertinent.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ),
                caption: "Ne pas l'utiliser pour une seule section.",
              }}
              when={[
                "Regrouper du contenu long en sections repliables (FAQ, détails, réglages).",
                "Quand l'utilisateur n'a besoin que d'une partie du contenu à la fois.",
              ]}
              avoid={[
                "Naviguer entre des vues de même niveau → Tabs.",
                "Du contenu court toujours pertinent → l'afficher directement, sans repli.",
              ]}
              best={[
                "`multiple=false` par défaut (une section ouverte) ; `multiple` si les sections sont indépendantes.",
                "Bordures / encart via composition (Card), pas de prop d'apparence dédiée.",
              ]}
              accessibility={[
                "Chaque en-tête est un bouton ; l'état ouvert/fermé est annoncé aux lecteurs d'écran.",
                "Navigation au clavier ; le contenu suit son déclencheur dans l'ordre du DOM.",
              ]}
            />
          }
        />
      ),
    },
  },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    multiple: false,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

// -----------------------------------------------------------------------
// Données de démo

const FAQ = [
  {
    value: "accessible",
    question: "Is it accessible?",
    answer: "Yes. It adheres to the WAI-ARIA design pattern.",
  },
  {
    value: "styled",
    question: "Is it styled?",
    answer:
      "Yes. It ships with Comète design tokens — typography, spacing and colours.",
  },
  {
    value: "animated",
    question: "Is it animated?",
    answer: "The chevron rotates on toggle, driven purely by design tokens.",
  },
];

const WRAP: React.CSSProperties = { maxWidth: 384 };

// -----------------------------------------------------------------------
// Stories

/** Démo par défaut — un item ouvert à la fois, premier ouvert. */
export const Default: Story = {
  render: (args) => (
    <div style={WRAP}>
      <Accordion {...args} defaultValue={["accessible"]}>
        {FAQ.map((f) => (
          <AccordionItem key={f.value} value={f.value}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Multiple — `multiple` autorise plusieurs items ouverts simultanément. */
export const Multiple: Story = {
  render: () => (
    <div style={WRAP}>
      <Accordion multiple defaultValue={["accessible", "styled"]}>
        {FAQ.map((f) => (
          <AccordionItem key={f.value} value={f.value}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Disabled — `disabled` sur un `AccordionItem` désactive un item précis. */
export const Disabled: Story = {
  render: () => (
    <div style={WRAP}>
      <Accordion defaultValue={["accessible"]}>
        <AccordionItem value="accessible">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="styled" disabled>
          <AccordionTrigger>Is it styled? (disabled)</AccordionTrigger>
          <AccordionContent>Contenu inaccessible.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="animated">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            The chevron rotates on toggle.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Borders — ajoute une bordure externe + radius via composition (style/token),
 * en retirant le divider du dernier item. Aucune prop d'apparence dédiée.
 */
export const Borders: Story = {
  render: () => (
    <div style={WRAP}>
      <Accordion
        defaultValue={["accessible"]}
        style={{
          border: "var(--size0125) solid var(--border-default)",
          borderRadius: "var(--radius200)",
          overflow: "hidden",
        }}
      >
        {FAQ.map((f, i) => (
          <AccordionItem
            key={f.value}
            value={f.value}
            // Retire le divider bas du dernier item pour épouser le radius.
            style={i === FAQ.length - 1 ? { borderBottom: "none" } : undefined}
          >
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

/** Card — l'Accordion enveloppé dans un composant `Card`. */
export const InCard: Story = {
  name: "Card",
  render: () => (
    <div style={WRAP}>
      <Card appearance="outlined">
        <Accordion defaultValue={["accessible"]}>
          {FAQ.map((f) => (
            <AccordionItem key={f.value} value={f.value}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent>{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  ),
};

/** Avec icône de gauche — `startIcon` sur le trigger. */
export const WithStartIcon: Story = {
  render: () => (
    <div style={WRAP}>
      <Accordion defaultValue={["accessible"]}>
        <AccordionItem value="accessible">
          <AccordionTrigger
            startIcon={<Icon icon="Person" spacing="none" size={16} />}
          >
            Compte
          </AccordionTrigger>
          <AccordionContent>
            Informations personnelles et préférences.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="styled">
          <AccordionTrigger
            startIcon={<Icon icon="Settings" spacing="none" size={16} />}
          >
            Paramètres
          </AccordionTrigger>
          <AccordionContent>Réglages de l&apos;application.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/** Contrôlé — le parent pilote `value`. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<string[]>(["accessible"]);
    return (
      <div style={{ ...WRAP, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          Ouverts : {value.join(", ") || "(aucun)"}
        </span>
        <Accordion multiple value={value} onValueChange={setValue}>
          {FAQ.map((f) => (
            <AccordionItem key={f.value} value={f.value}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent>{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  },
};
