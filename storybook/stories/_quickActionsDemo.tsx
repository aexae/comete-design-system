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

/**
 * Actions du FAB en MCE — celles de l'AGENT sur le terrain, libellés de Link (`fab.declare_event`,
 * `fab.start_round`). Deux entrées, aucune « critical » : MCE n'a aucune notion de gravité ni
 * d'urgence, donc les deux sont du ton par défaut ; ce sont l'icône et le verbe qui distinguent,
 * pas la couleur. Pas de « Scanner un pointeau » (un pointeau ne se scanne qu'à l'intérieur d'une
 * ronde en cours : ce n'est pas une création) ni de « Voir les MCE remplis » (navigation →
 * page « Plus »).
 */
export const MCE_QUICK_ACTIONS: Omit<QuickAction, "onPress">[] = [
  { id: "event", icon: "Campaign", label: "Déclarer un évènement" },
  { id: "patrol", icon: "Patrol", label: "Démarrer une ronde" },
];

export function QuickActionsDemo({
  actions = MCE_QUICK_ACTIONS,
  onAction,
  initialOpen = false,
}: {
  actions?: Omit<QuickAction, "onPress">[];
  onAction?: (id: string) => void;
  /** Ouvre la couche dès le rendu (utile pour régler les actions dans les controls). */
  initialOpen?: boolean;
}): ReactNode {
  const [open, setOpen] = useState(initialOpen);
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
