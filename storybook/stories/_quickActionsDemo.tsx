// Démo partagée de QuickActions : barre basse + FAB + couche d'actions rapides, dans un
// écran plein viewport (à jouer en viewport mobile). Fichier NON indexé par Storybook.
import { useState, type ReactNode } from "react";
import {
  BottomNav,
  BottomNavItem,
  QuickActions,
  type QuickAction,
} from "@aexae/comete-design-system/components";
import css from "./BottomNav.stories.module.css";

/** Actions rapides MCE — `critical` seulement pour le signalement (nature, pas identité). */
export const MCE_QUICK_ACTIONS: Omit<QuickAction, "onPress">[] = [
  { id: "report", icon: "Report", label: "Signaler une anomalie", tone: "critical" },
  { id: "scan", icon: "Scanner", label: "Scanner un équipement", tone: "default" },
  { id: "round", icon: "Patrol", label: "Démarrer une ronde", tone: "default" },
  { id: "log", icon: "MenuBook", label: "Nouvelle main courante", tone: "default" },
];

export function QuickActionsDemo({
  actions = MCE_QUICK_ACTIONS,
  onAction,
}: {
  actions?: Omit<QuickAction, "onPress">[];
  onAction?: (id: string) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={css["fullScreen"]}>
      {/* Pas de z-index sur la barre : le FAB y resterait prisonnier sous le voile. */}
      <BottomNav>
        <BottomNavItem
          label="Accueil"
          icon="Home"
          isSelected={!open && selected === "Accueil"}
          onClick={() => setSelected("Accueil")}
        />
        <BottomNavItem
          label="Ma fiche"
          icon="Assignment"
          isSelected={!open && selected === "Ma fiche"}
          onClick={() => setSelected("Ma fiche")}
        />
        <BottomNav.Action
          icon="Add"
          aria-label="Actions rapides"
          isOpen={open}
          onPress={() => setOpen((o) => !o)}
        />
        <BottomNavItem
          label="Planning"
          icon="CalendarMonth"
          isSelected={!open && selected === "Planning"}
          onClick={() => setSelected("Planning")}
        />
        <BottomNavItem
          label="MCE"
          icon="FormEdit"
          isSelected={!open && selected === "MCE"}
          onClick={() => setSelected("MCE")}
        />
      </BottomNav>
      <QuickActions
        isOpen={open}
        onOpenChange={setOpen}
        actions={actions.map((a) => ({ ...a, onPress: () => onAction?.(a.id) }))}
      />
    </div>
  );
}
