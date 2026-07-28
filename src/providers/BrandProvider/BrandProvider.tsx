import { useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { brandThemeToCss } from "./generateBrandTheme.js";

export interface BrandProviderProps {
  children: ReactNode;
  /**
   * Couleur de marque du client, en HEX (`#rgb` ou `#rrggbb`). Elle pilote toute
   * la famille de tokens `brand-*` (surfaces d'identité : Card, Bleed, IconTile, Text).
   * Les éléments interactifs (`comete-*`) ne sont pas affectés (École A).
   */
  seed: string;
  /**
   * Identifiant du tenant. S'il est fourni, l'override est scopé à
   * `[data-brand="<name>"]` (plusieurs marques peuvent coexister sur une page).
   * Sinon, l'override s'applique à `:root` (un seul tenant par déploiement).
   */
  name?: string;
}

/**
 * BrandProvider — applique la **charte couleur d'un client** au runtime en
 * surchargeant la famille de tokens `brand-*` générée depuis une seule couleur HEX.
 *
 * ```tsx
 * <BrandProvider seed="#FF6A00" name="acme">
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * </BrandProvider>
 * ```
 *
 * Le `<style>` est rendu dans l'arbre (SSR-safe). La génération est pure et
 * mémoïsée par `seed`/`name`. Une couleur HEX invalide est ignorée (aucun override).
 *
 * @see docs/adr/0001-theming-couleur-multi-tenant.md
 */
export function BrandProvider({ children, seed, name }: BrandProviderProps): ReactElement {
  const css = useMemo(() => {
    const scope = name ? `[data-brand="${name}"]` : ":root";
    try {
      return brandThemeToCss(seed, { scope });
    } catch {
      // HEX invalide → pas d'override, on conserve le bleu Comète par défaut.
      return "";
    }
  }, [seed, name]);

  const style = css ? <style>{css}</style> : null;

  if (name) {
    // `display: contents` : le wrapper porte data-brand sans impacter la mise en page.
    return (
      <div data-brand={name} style={{ display: "contents" }}>
        {style}
        {children}
      </div>
    );
  }

  return (
    <>
      {style}
      {children}
    </>
  );
}
