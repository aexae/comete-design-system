// Switch — stories Storybook
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "@aexae/comete-design-system/components";
import { DocsTabsPage } from "../.storybook/DocsTabsPage";
import { GuidelinesFlat } from "./_guidelines";
import { Labeled, Legend } from "./_labeled";

// -----------------------------------------------------------------------
// Figma links

const FIGMA_FILE = "https://www.figma.com/design/YO9cW75K8aLcM5BbojZAqB/Com%C3%A8te-Design-System";
const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;

// -----------------------------------------------------------------------
// Meta

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "L'interrupteur permet d'activer ou de désactiver un réglage avec un effet immédiat. Il est privilégié par rapport à la case à cocher lorsque le changement prend effet sans validation supplémentaire.",
      },
      page: () => (
        <DocsTabsPage
          guidelines={
            <GuidelinesFlat
              doExample={{
                example: <Switch defaultChecked>Notifications</Switch>,
                caption: "Réglage on/off à effet immédiat, avec un label clair.",
              }}
              dontExample={{
                example: (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Switch>Quotidien</Switch>
                    <Switch>Hebdomadaire</Switch>
                  </div>
                ),
                caption: "Ne pas gérer un choix exclusif avec plusieurs Switch.",
              }}
              when={[
                "Basculer un réglage on/off à effet immédiat (préférences, activation d'une option).",
                "Quand l'état s'applique sans étape de validation.",
              ]}
              avoid={[
                "Un choix qui nécessite une soumission de formulaire → Checkbox.",
                "Un choix parmi plusieurs options exclusives → Radio ou ToggleButtonGroup.",
              ]}
              best={[
                "Label décrivant clairement l'état activé ; apparence sémantique (`success`/`warning`/`critical`) avec parcimonie.",
                "Mode contrôlé (`isChecked` + `onChange`) pour rester synchronisé avec l'état applicatif.",
              ]}
              accessibility={[
                "Toujours un label (ou `aria-label`) décrivant ce que le switch active.",
                "L'état activé/désactivé doit être perceptible autrement que par la seule couleur.",
              ]}
            />
          }
        />
      ),
    },
    layout: "centered",
    design: { type: "figma", url: figmaUrl("4925:9034") },
  },
  argTypes: {
    appearance: {
      control: "select",
      options: ["default", "success", "warning", "critical"],
    },
    isChecked: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
    isDisabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    appearance: "default",
    children: "Label",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

// -----------------------------------------------------------------------
// Stories

/** Interrupteur simple avec un label. */
export const Default: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4925:9035") } },
  args: {
    children: "Notifications",
  },
};

/** État coché initial (non contrôlé). */
export const Checked: Story = {
  parameters: { design: { type: "figma", url: figmaUrl("4925:9042") } },
  args: {
    children: "Notifications",
    defaultChecked: true,
  },
};

/** Sans label — utiliser `aria-label` pour l'accessibilité. */
export const WithoutLabel: Story = {
  args: {
    "aria-label": "Activer les notifications",
    defaultChecked: true,
    children: "",
  },
  render: (args) => <Switch {...args} />,
};

/** Contrôlé — le parent gère l'état. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [enabled, setEnabled] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Switch isChecked={enabled} onChange={setEnabled}>
          Notifications {enabled ? "activées" : "désactivées"}
        </Switch>
        <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          État courant : {String(enabled)}
        </span>
      </div>
    );
  },
};

/** Les 4 apparences sémantiques × états off / indéterminé / on. */
export const Appearances: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto",
        gap: 16,
        alignItems: "center",
      }}
    >
      <span />
      <Legend>Off</Legend>
      <Legend>Indéterminé</Legend>
      <Legend>On</Legend>

      <Legend>default</Legend>
      <Switch appearance="default" aria-label="default off" />
      <Switch appearance="default" aria-label="default indeterminate" isIndeterminate />
      <Switch appearance="default" aria-label="default on" defaultChecked />

      <Legend>success</Legend>
      <Switch appearance="success" aria-label="success off" />
      <Switch appearance="success" aria-label="success indeterminate" isIndeterminate />
      <Switch appearance="success" aria-label="success on" defaultChecked />

      <Legend>warning</Legend>
      <Switch appearance="warning" aria-label="warning off" />
      <Switch appearance="warning" aria-label="warning indeterminate" isIndeterminate />
      <Switch appearance="warning" aria-label="warning on" defaultChecked />

      <Legend>critical</Legend>
      <Switch appearance="critical" aria-label="critical off" />
      <Switch appearance="critical" aria-label="critical indeterminate" isIndeterminate />
      <Switch appearance="critical" aria-label="critical on" defaultChecked />
    </div>
  ),
};

/** État désactivé — coché et non coché. */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Switch isDisabled>Désactivé (off)</Switch>
      <Switch isDisabled defaultChecked>
        Désactivé (on)
      </Switch>
      <Switch isDisabled isIndeterminate>
        Désactivé (indéterminé)
      </Switch>
    </div>
  ),
};

/** État indéterminé — le pouce devient une petite barre horizontale. */
export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Labeled align="flex-start" label="default">
        <Switch isIndeterminate appearance="default">
          Notifications (partiel)
        </Switch>
      </Labeled>
      <Labeled align="flex-start" label="success">
        <Switch isIndeterminate appearance="success">
          Sync (partiel)
        </Switch>
      </Labeled>
      <Labeled align="flex-start" label="warning">
        <Switch isIndeterminate appearance="warning">
          Alerte (partiel)
        </Switch>
      </Labeled>
      <Labeled align="flex-start" label="critical">
        <Switch isIndeterminate appearance="critical">
          Erreur (partiel)
        </Switch>
      </Labeled>
    </div>
  ),
};

/** Groupe de switches empilés — cas typique dans un panneau de préférences. */
export const InPreferences: Story = {
  render: function PreferencesStory() {
    const [pref, setPref] = useState({
      notifications: true,
      autoSave: true,
      analytics: false,
    });
    const set = (k: keyof typeof pref) => (v: boolean) => setPref((prev) => ({ ...prev, [k]: v }));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
        <Switch isChecked={pref.notifications} onChange={set("notifications")}>
          Notifications push
        </Switch>
        <Switch appearance="success" isChecked={pref.autoSave} onChange={set("autoSave")}>
          Sauvegarde automatique
        </Switch>
        <Switch appearance="warning" isChecked={pref.analytics} onChange={set("analytics")}>
          Partage des données d&apos;utilisation
        </Switch>
      </div>
    );
  },
};
