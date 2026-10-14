// QuickActions — Comète Design System
// Menu d'actions rapides du FAB (pattern « speed dial ») : pastilles flottantes au-dessus
// d'un voile. Construit sur react-aria-components (ModalOverlay / Modal / Dialog), comme
// Drawer et Spotlight : portail, piège de focus, Échap et retour du focus sur le
// déclencheur viennent de là.
import type { CSSProperties, ReactElement } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import type { IconName } from "@aexae/comete-icons";
import { Icon } from "../Icon/index.js";
import styles from "./QuickActions.module.css";

// `process` n'est pas typé ici (le DS build avec `types: []`, sans @types/node).
// Déclaration locale minimale : le bundler du consommateur remplace
// `process.env.NODE_ENV` par une constante à la compilation.
declare const process: { env: { NODE_ENV?: string } };

/** Nombre maximal d'actions : au-delà, plus de place entre le FAB et la barre de page. */
const MAX_ACTIONS = 5;

/** Nombre maximal de tons distincts dans un même menu (garde-fou de composition). */
const MAX_DISTINCT_TONES = 2;

const TONE_RATIONALE =
  "La couleur porte la nature de l'action, pas son identité. Au-delà de deux tons dans un " +
  "même menu, elle cesse de signaler le danger et se met à distinguer les entrées entre elles.";

// -----------------------------------------------------------------------
// Types publics

/**
 * Nature d'une action — **pas son identité** : la palette sémantique des autres composants
 * (`Button` `color`, `Badge` `appearance`). Voir la règle de couleur de {@link QuickActions}.
 * Aucune restriction au niveau du type : le garde-fou est sur la **composition** (avertissement
 * en développement).
 */
export type QuickActionTone = "comete" | "critical" | "warning" | "success" | "information";

export interface QuickAction {
  /** Identifiant stable (clé de rendu). */
  id: string;
  /** Icône de la pastille d'icône (nom issu de `@aexae/comete-icons`). */
  icon: IconName;
  /** Libellé de l'action — et rien d'autre : pas de seconde ligne de description. */
  label: string;
  /**
   * Nature de l'action, pas son identité (`comete`, `critical`, `warning`, `success`,
   * `information`). La couleur ne va que sur la pastille d'icône, jamais sur la rangée.
   * @default "comete"
   */
  tone?: QuickActionTone;
  /** Appelé au choix de l'action ; le menu se referme ensuite. */
  onPress: () => void;
}

export interface QuickActionsProps {
  /** Les actions, de 2 à 5 (au-delà : avertissement en développement). */
  actions: QuickAction[];
  /** État ouvert / fermé (contrôlé). */
  isOpen: boolean;
  /** Callback au changement d'état (voile, Échap, choix d'une action). */
  onOpenChange: (open: boolean) => void;
  /** Nom accessible du menu. @default "Actions rapides" */
  "aria-label"?: string;
}

// -----------------------------------------------------------------------
// Composant

/**
 * QuickActions — menu d'actions rapides du FAB (`BottomNav.Action`) : des **pastilles
 * flottantes** au-dessus d'un voile, une par action (libellé à gauche, pastille d'icône
 * circulaire à droite).
 *
 * Le composant rend **uniquement la couche flottante** : le déclencheur reste à
 * l'appelant (`BottomNav.Action`, qui garde sa rotation en croix et son `aria-expanded`).
 *
 * ### Pourquoi un composant
 * Le pattern porte du **comportement** : voile, piège de focus, fermeture à Échap, retour
 * du focus sur le déclencheur à la fermeture, apparition décalée des rangées. Ne pas le
 * réassembler à la main à partir de `Button` + un `div` absolu + un écouteur `mousedown`.
 *
 * ### Règle de couleur (ADR 0002 — « une couleur, un sens »)
 * La couleur porte la **nature** de l'action, jamais son **identité**. `tone` reprend la
 * palette sémantique des autres composants (`Button` `color`, `Badge` `appearance`) :
 * `comete` (défaut), `critical`, `warning`, `success`, `information`. Le type ne restreint
 * rien — on n'interdit pas une valeur par crainte qu'elle soit mal employée.
 * - **Le garde-fou est sur la composition**, parce que c'est là qu'est le risque : en
 *   développement, un avertissement est émis quand un même menu utilise **plus de deux tons
 *   distincts**, ou quand **plus d'une** action porte `critical`. Le composant rend quand
 *   même : on avertit, on ne casse pas.
 * - Si chaque action reçoit sa teinte pour être reconnaissable, le rouge cesse de vouloir
 *   dire « danger » et se met à vouloir dire « scanner un équipement ».
 * - La couleur va **uniquement sur la pastille d'icône, jamais sur la rangée entière** :
 *   des rangées pleines saturées s'aplatissent vers le même gris sur un voile sombre en
 *   forte luminosité, et en deutéranopie un rouge et un vert pleins se confondent. Avec
 *   une pastille teintée, le texte reste noir sur fond clair et le **libellé** porte
 *   l'information.
 *
 * ### Ce que le composant ne fait pas
 * - **Pas de description** : une rangée porte un libellé et rien d'autre. Une action qui a
 *   besoin d'être expliquée n'est pas une action rapide, c'est une entrée de **tiroir**
 *   (`Drawer`).
 * - **Pas de bouton « Fermer »** : le FAB pivote déjà en croix et le voile est touchable.
 *   Une troisième façon de fermer coûterait une rangée dans la zone du pouce.
 * - **Plafond à 5 actions** : au-delà, il n'y a plus de place entre le FAB et la barre de
 *   page (avertissement en développement).
 *
 * ### Intégration avec `BottomNav.Action`
 * - Ne pas poser de `z-index` sur la barre basse : il créerait un contexte d'empilement
 *   où le FAB resterait **prisonnier sous le voile**, donc incliquable alors que c'est lui
 *   qui referme. Le FAB remonte de lui-même au-dessus du voile quand `aria-expanded="true"` ;
 *   son contour (socle) reste sous le voile, avec la barre.
 * - Tant que la couche est ouverte, React Aria rend le reste de la page **inerte** (FAB
 *   compris) : un tap sur le FAB traverse donc jusqu'au voile, qui **ferme** — sans jamais
 *   rouvrir. Les conteneurs de la couche sont transparents aux clics (seules les rangées les
 *   captent), et l'élément `aria-expanded` est exclu de la fermeture « clic à l'extérieur »
 *   pour le cas où le FAB ne serait pas inerte.
 * - La place est réservée en bas de la liste (variable `--quick-actions-offset`) pour que
 *   la dernière rangée ne passe pas sous le FAB.
 *
 * ```tsx
 * <BottomNav.Action icon="Add" aria-label="Actions rapides" isOpen={open} onPress={() => setOpen((o) => !o)} />
 * <QuickActions
 *   isOpen={open}
 *   onOpenChange={setOpen}
 *   actions={[
 *     { id: "report", icon: "Report", label: "Signaler une anomalie", tone: "critical", onPress: report },
 *     { id: "scan", icon: "Scanner", label: "Scanner un équipement", onPress: scan },
 *   ]}
 * />
 * ```
 */
export function QuickActions({
  actions,
  isOpen,
  onOpenChange,
  "aria-label": ariaLabel = "Actions rapides",
}: QuickActionsProps): ReactElement {
  if (process.env.NODE_ENV !== "production") {
    if (actions.length > MAX_ACTIONS) {
      // eslint-disable-next-line no-console
      console.warn(
        `QuickActions : ${actions.length} actions reçues, ${MAX_ACTIONS} au maximum — au-delà, ` +
          `il n'y a plus de place entre le FAB et la barre de page. Utiliser un tiroir (Drawer).`,
      );
    }
    const tones = new Set(actions.map((a) => a.tone ?? "comete"));
    if (tones.size > MAX_DISTINCT_TONES) {
      // eslint-disable-next-line no-console
      console.warn(
        `QuickActions : ${tones.size} tons distincts dans un même menu (${[...tones].join(", ")}). ` +
          TONE_RATIONALE,
      );
    }
    const criticalCount = actions.filter((a) => a.tone === "critical").length;
    if (criticalCount > 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `QuickActions : ${criticalCount} actions portent le ton "critical" — une seule au plus. ` +
          TONE_RATIONALE,
      );
    }
  }

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      // Le déclencheur (FAB, `aria-expanded`) flotte au-dessus du voile : un appui dessus ne
      // doit pas fermer le menu AVANT que son propre `onPress` ne le bascule — sinon il le
      // rouvrirait aussitôt.
      shouldCloseOnInteractOutside={(element) => !element.closest("[aria-expanded='true']")}
      className={styles.overlay}
    >
      <AriaModal className={styles.modal}>
        <AriaDialog aria-label={ariaLabel} className={styles.dialog}>
          <ul className={styles.list}>
            {actions.map((action, index) => (
              <li
                key={action.id}
                className={styles.item}
                // Apparition décalée : la rangée la plus proche du FAB (la dernière) d'abord.
                style={{ "--qa-index": actions.length - 1 - index } as CSSProperties}
              >
                <AriaButton
                  className={styles.row}
                  onPress={() => {
                    action.onPress();
                    onOpenChange(false);
                  }}
                >
                  <span className={styles.label}>{action.label}</span>
                  <span className={styles.tile} data-tone={action.tone ?? "comete"} aria-hidden="true">
                    <Icon icon={action.icon} size={24} className={styles.glyph} />
                  </span>
                </AriaButton>
              </li>
            ))}
          </ul>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

QuickActions.displayName = "QuickActions";
