// DataStateMessage — helper interne (non exporté publiquement)
// Rend l'état "vide" ou "erreur" de façon cohérente pour tous les composants
// de données (Table, List, Page.Body). S'appuie sur InformativeState +
// Illustration pour garantir un rendu unifié dans tout le design system.
import type { ReactElement, ReactNode } from "react";
import { InformativeState } from "../InformativeState/index.js";
import { Illustration } from "../Illustration/index.js";
import { Button } from "../Button/index.js";

export type DataStateKind = "empty" | "error";

export interface DataStateMessageProps {
  /** Nature de l'état. */
  kind: DataStateKind;
  /** Titre (sinon un libellé par défaut selon `kind`). */
  title?: string;
  /** Description (sinon un libellé par défaut selon `kind`). */
  description?: string;
  /** Callback "Réessayer" — affiche un bouton (surtout pour `error`). */
  onRetry?: () => void;
  /** Libellé du bouton de réessai. @default "Réessayer" */
  retryLabel?: string;
  /** Actions personnalisées (remplacent le bouton de réessai). */
  actions?: ReactNode;
  /** Taille de l'illustration. @default 128 */
  illustrationSize?: 128 | 256;
}

const DEFAULTS: Record<
  DataStateKind,
  { title: string; description: string; illustration: "Empty" | "ConnexionError" }
> = {
  empty: {
    title: "Aucune donnée",
    description: "Il n'y a rien à afficher pour le moment.",
    illustration: "Empty",
  },
  error: {
    title: "Une erreur est survenue",
    description: "Impossible de charger les données. Veuillez réessayer.",
    illustration: "ConnexionError",
  },
};

/**
 * Rend un état vide ou erreur cohérent (illustration + titre + description +
 * action optionnelle). Usage interne par les composants de données.
 */
export function DataStateMessage({
  kind,
  title,
  description,
  onRetry,
  retryLabel = "Réessayer",
  actions,
  illustrationSize = 128,
}: DataStateMessageProps): ReactElement {
  const preset = DEFAULTS[kind];
  const resolvedActions =
    actions ??
    (onRetry ? (
      <Button appearance="contained" color="comete" iconBefore="Autorenew" onPress={onRetry}>
        {retryLabel}
      </Button>
    ) : undefined);

  // Conteneur flex centré : InformativeState est plafonné par un `max-width`
  // sans `margin auto` → sans ce wrapper, le bloc se colle à gauche dès que le
  // conteneur (cellule de table, liste large, body de page) est plus large.
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <InformativeState
        title={title ?? preset.title}
        description={description ?? preset.description}
        image={<Illustration illustration={preset.illustration} size={illustrationSize} />}
        actions={resolvedActions}
      />
    </div>
  );
}

DataStateMessage.displayName = "DataStateMessage";
