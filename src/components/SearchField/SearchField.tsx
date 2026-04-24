// SearchField — Comète Design System
// Champ de recherche avec icône EditorSearch, clearable par défaut.
import type { ReactElement } from "react";
import { Icon } from "../Icon/Icon.js";
import { TextField } from "../TextField/TextField.js";
import type { TextFieldProps } from "../TextField/TextField.js";

// -----------------------------------------------------------------------
// Types publics

export interface SearchFieldProps
  extends Omit<TextFieldProps, "elemBefore" | "type"> {
  /** Classe CSS additionnelle. */
  className?: string;
  /** Styles inline additionnels. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------
// Composant

/**
 * SearchField — Comète Design System
 *
 * Champ de recherche standardisé. Encapsule TextField avec les conventions
 * du design system :
 * - Icône `EditorSearch` en elemBefore
 * - `isClearable` activé par défaut
 * - Placeholder "Rechercher" par défaut
 * - `aria-label` "Rechercher" par défaut
 *
 * ```tsx
 * import { SearchField } from "@naxit/comete-design-system";
 *
 * <SearchField placeholder="Rechercher un agent…" />
 * <SearchField isCompact />
 * ```
 */
export function SearchField({
  placeholder = "Rechercher",
  isClearable = true,
  "aria-label": ariaLabel = "Rechercher",
  ...rest
}: SearchFieldProps): ReactElement {
  return (
    <TextField
      placeholder={placeholder}
      isClearable={isClearable}
      aria-label={ariaLabel}
      elemBefore={<Icon icon="EditorSearch" />}
      type="search"
      {...rest}
    />
  );
}

SearchField.displayName = "SearchField";
