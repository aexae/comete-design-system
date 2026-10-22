// ModalDialog — Comète Design System
// Modale accessible avec overlay, header, body et footer.
import type { ReactElement, ReactNode } from "react";
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
  Heading as AriaHeading,
  VisuallyHidden,
} from "react-aria-components";
import type { IconName } from "@aexae/comete-icons";
import { Button } from "../Button/Button.js";
import { Icon } from "../Icon/Icon.js";
import scrollbarStyles from "../../styles/scrollbar.module.css";
import styles from "./ModalDialog.module.css";

// -----------------------------------------------------------------------
// Types publics

export type ModalDialogAppearance = "default" | "warning" | "critical";
export type ModalDialogWidth = "xsmall" | "small" | "medium" | "large" | "xlarge";

export interface ModalDialogProps {
  /** Apparence visuelle. @default "default" */
  appearance?: ModalDialogAppearance;
  /** Largeur du dialog. @default "medium" */
  width?: ModalDialogWidth;
  /** Titre affiché dans le header. */
  title: string;
  /**
   * Affiche le header (titre, icône d'apparence, bouton fermer).
   *
   * À passer à `false` pour les surfaces dont le contenu commence directement
   * par sa propre commande — une palette de recherche, par exemple, où le
   * champ tient lieu d'en-tête et où `esc` remplace la croix.
   *
   * Le `title` reste **obligatoire** et reste rendu, simplement masqué
   * visuellement : c'est lui qui donne son nom accessible au dialog (React
   * Aria le lit via `slot="title"`). Le supprimer laisserait une modale sans
   * libellé pour les lecteurs d'écran.
   *
   * @default true
   */
  showHeader?: boolean;
  /**
   * Contenu **épinglé** au-dessus du body : il reste en place pendant que
   * le body défile. Pendant de `DrawerHeader` côté modale.
   *
   * Pour les surfaces dont la commande doit rester sous la main pendant
   * qu'on parcourt le résultat — le champ d'une palette de recherche, par
   * exemple. Le mettre dans `children` le ferait partir avec le contenu ;
   * l'isoler dans un conteneur défilant à soi lui donnerait l'ascenseur du
   * système et non celui du DS, les pseudo-éléments `::-webkit-scrollbar`
   * ne se transmettant pas aux descendants.
   */
  pinned?: ReactNode;
  /** Contenu du body. */
  children: ReactNode;
  /** Contenu du footer (typiquement un ButtonGroup). */
  footer?: ReactNode;
  /** État ouvert/fermé (contrôlé). */
  isOpen?: boolean;
  /** Callback au changement d'état. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Affiche un bouton fermer en haut à droite du header. */
  onClose?: () => void;
  /** Ferme le dialog quand l'utilisateur clique sur l'overlay. @default true */
  isDismissable?: boolean;
  /**
   * Confine la modale (voile compris) dans un conteneur plutôt que dans la
   * fenêtre. Utile pour présenter un cadre mobile dans une story, ou pour une
   * zone applicative qui doit rester visible autour.
   *
   * Le conteneur **doit être positionné** (`position: relative`) : sans ça, le
   * voile se recale sur le plus proche ancêtre positionné et déborde.
   *
   * Même procédé que `BottomNav.ActionMenu`.
   */
  container?: Element | null;
  /** Classe CSS additionnelle sur le dialog. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Icône d'apparence

const APPEARANCE_ICON: Record<string, IconName | undefined> = {
  default: undefined,
  warning: "Warning",
  critical: "EmergencyHome",
};

// -----------------------------------------------------------------------
// Composant

/**
 * ModalDialog — Comète Design System
 *
 * Affiche un contenu dans une couche modale au-dessus de la page.
 * Focus trap, fermeture Escape et clic overlay via React Aria.
 *
 * ```tsx
 * import { ModalDialog, Button, ButtonGroup } from "@aexae/comete-design-system";
 *
 * <ModalDialog
 *   title="Confirmer la suppression"
 *   appearance="critical"
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   footer={
 *     <ButtonGroup>
 *       <Button appearance="subtle" onPress={() => setIsOpen(false)}>Annuler</Button>
 *       <Button color="critical" onPress={handleDelete}>Supprimer</Button>
 *     </ButtonGroup>
 *   }
 * >
 *   <p>Cette action est irréversible.</p>
 * </ModalDialog>
 * ```
 */
export function ModalDialog({
  appearance = "default",
  width = "medium",
  title,
  showHeader = true,
  pinned,
  children,
  footer,
  isOpen,
  onOpenChange,
  onClose,
  isDismissable = true,
  container,
  className,
  style,
}: ModalDialogProps): ReactElement {
  const icon = APPEARANCE_ICON[appearance];

  const dialogClasses = [
    styles.dialog,
    styles[width],
    // Sans header, le corps doit reprendre à son compte le retrait haut que
    // le header fournissait — sinon le contenu se colle au bord supérieur.
    !showHeader && styles.noHeader,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      UNSTABLE_portalContainer={container ?? undefined}
      className={[styles.overlay, container ? styles.contained : undefined]
        .filter(Boolean)
        .join(" ")}
    >
      <AriaModal className={styles.modal}>
        <AriaDialog className={dialogClasses} style={style}>
          {/* Header */}
          {showHeader ? (
            <div className={styles.header}>
              {icon && (
                <Icon
                  icon={icon}
                  size={24}
                  color={appearance === "warning" ? "warning" : "critical"}
                  appearance="filled"
                  className={styles.headerIcon}
                />
              )}
              <AriaHeading slot="title" className={styles.title}>
                {title}
              </AriaHeading>
              {onClose && (
                <Button
                  appearance="subtle"
                  iconBefore="CloseSmall"
                  aria-label="Fermer"
                  onPress={onClose}
                  className={styles.closeButton}
                />
              )}
            </div>
          ) : (
            /* Header masqué : le titre RESTE rendu, hors écran. C'est lui que
               React Aria lit via `slot="title"` pour nommer le dialog — le
               retirer laisserait la modale sans libellé accessible. */
            <VisuallyHidden>
              <AriaHeading slot="title">{title}</AriaHeading>
            </VisuallyHidden>
          )}

          {/* Bloc épinglé : hors de la zone qui défile */}
          {pinned && <div className={styles.pinned}>{pinned}</div>}

          {/* Body */}
          <div className={[styles.body, scrollbarStyles.scrollable, scrollbarStyles.themed].join(" ")}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

ModalDialog.displayName = "ModalDialog";
