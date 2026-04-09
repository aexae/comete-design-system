// ModalDialog — Comète Design System
// Modale accessible avec overlay, header, body et footer.
import type { ReactElement, ReactNode } from "react";
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Button } from "../Button/Button.js";
import { Icon } from "../Icon/Icon.js";
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
  /** Classe CSS additionnelle sur le dialog. */
  className?: string;
}

// -----------------------------------------------------------------------
// Icône d'apparence

const APPEARANCE_ICON: Record<string, IconName | undefined> = {
  default: undefined,
  warning: "Warning",
  critical: "Error",
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
 * import { ModalDialog, Button, ButtonGroup } from "@naxit/comete-design-system";
 *
 * <ModalDialog
 *   title="Confirmer la suppression"
 *   appearance="critical"
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   footer={
 *     <ButtonGroup>
 *       <Button variant="subtle" onPress={() => setIsOpen(false)}>Annuler</Button>
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
  children,
  footer,
  isOpen,
  onOpenChange,
  onClose,
  isDismissable = true,
  className,
}: ModalDialogProps): ReactElement {
  const icon = APPEARANCE_ICON[appearance];

  const dialogClasses = [
    styles.dialog,
    styles[width],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      className={styles.overlay}
    >
      <AriaModal className={styles.modal}>
        <AriaDialog className={dialogClasses}>
          {/* Header */}
          <div className={styles.header}>
            {icon && (
              <Icon
                icon={icon}
                size={24}
                color={appearance === "warning" ? "warning" : "critical"}
                variant="filled"
                className={styles.headerIcon}
              />
            )}
            <AriaHeading slot="title" className={styles.title}>
              {title}
            </AriaHeading>
            {onClose && (
              <Button
                variant="subtle"
                iconBefore="CloseSmallFaded"
                aria-label="Fermer"
                onPress={onClose}
                className={styles.closeButton}
              />
            )}
          </div>

          {/* Body */}
          <div className={styles.body}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

ModalDialog.displayName = "ModalDialog";
