// InformativeState — Comete Design System
// Composant d'etat informatif (empty state) accessible.
import type { ReactElement, ReactNode } from "react";
import styles from "./InformativeState.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface InformativeStateProps {
  /** Titre principal affiché en gras. */
  title: string;
  /** Description optionnelle sous le titre. */
  description?: string;
  /**
   * Slot illustration affiché au-dessus du titre.
   * Accepte un composant `<Illustration>` ou tout ReactNode.
   */
  image?: ReactNode;
  /**
   * Slot actions affiché sous la description.
   * Accepte un `<ButtonGroup>` ou tout ReactNode.
   */
  actions?: ReactNode;
  /** Additional CSS class. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * InformativeState — Comete Design System
 *
 * Affiche un etat informatif (empty state) avec illustration,
 * titre, description et boutons d'action optionnels.
 *
 * ```tsx
 * import { InformativeState, Illustration, ButtonGroup, Button } from "@naxit/comete-design-system";
 *
 * <InformativeState
 *   title="Aucun élément"
 *   description="Commencez par créer un premier élément."
 *   image={<Illustration illustration="Empty" size={128} />}
 *   actions={
 *     <ButtonGroup>
 *       <Button appearance="contained" color="brand">Créer</Button>
 *     </ButtonGroup>
 *   }
 * />
 * ```
 */
export function InformativeState({
  title,
  description,
  image,
  actions,
  className,
  style,
}: InformativeStateProps): ReactElement {
  const classNames = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={classNames} style={style}>
      {image && <div className={styles.image}>{image}</div>}

      <div className={styles.stack}>
        <div className={styles.stackText}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {actions && <div className={styles.stackActions}>{actions}</div>}
      </div>
    </div>
  );
}

InformativeState.displayName = "InformativeState";
