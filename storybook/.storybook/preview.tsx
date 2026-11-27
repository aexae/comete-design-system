import { DocsContainer } from "@storybook/addon-docs/blocks";
import { DocsTabsPage } from "./DocsTabsPage";
import { ThemeProvider } from "@aexae/comete-design-system/providers";
import "@aexae/comete-design-tokens/css";
import "./preview.css";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
// NOTE: useEffect and useGlobals must both come from storybook/preview-api when
// used together in a decorator. Mixing React hooks with Storybook hooks in the
// same function causes a runtime error.
import { useGlobals } from "storybook/preview-api";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { themes } from "storybook/theming";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

// ----------------------------------------------------------------------
// Presets viewport Comète — nommés selon nos usages métier (sécurité privée).
// Proposés en tête de la liste, avant les presets Storybook par défaut.
// NB : ce sont des tailles de canvas Storybook (config outillage), pas des
// design tokens. Les *breakpoints* responsives des composants sont
// `BREAKPOINTS` (watch → tv, src/tokens/breakpoints.ts), miroir des tokens
// `--breakpoint-*` de @aexae/comete-design-tokens (>= 0.49.0).

const COMETE_VIEWPORTS = {
  cometeMobileAgent: {
    name: "Mobile agent (Link / On Time)",
    styles: { width: "375px", height: "667px" },
    type: "mobile" as const,
  },
  cometeTabletManager: {
    name: "Tablette manager",
    styles: { width: "768px", height: "1024px" },
    type: "tablet" as const,
  },
  cometeDesktopExploitation: {
    name: "Desktop exploitation",
    styles: { width: "1440px", height: "900px" },
    type: "desktop" as const,
  },
};

// ----------------------------------------------------------------------

const withThemeProvider: Decorator = (Story) => {
  const [globals] = useGlobals(); // eslint-disable-line react-hooks/rules-of-hooks
  const mode = (globals["theme"] as "light" | "dark") ?? "light";

  // NOTE: Set synchronously (not in useEffect) — Storybook's useEffect has
  // different timing guarantees and was not reliably updating the DOM attribute.
  document.documentElement.setAttribute("data-theme", mode);

  return (
    <ThemeProvider mode={mode}>
      <Story />
    </ThemeProvider>
  );
};

// ----------------------------------------------------------------------
// Les stories reproduisent les routes de l'app (`href="/agents"`). Suivies pour
// de vrai, elles chargeraient la racine du serveur Storybook à la place de la
// story : un clic sur un item de SideNav ou de BottomNav quitterait la page.
// On les neutralise au niveau du document, donc APRÈS les handlers React (qui
// sélectionnent l'item) et y compris dans les portals (Drawer). Les ancres des
// pages Docs (`#…`) et les liens externes ne sont pas touchés.

if (typeof document !== "undefined") {
  document.addEventListener("click", (event) => {
    const anchor = (event.target as Element | null)?.closest?.("a[href]");
    if (anchor?.getAttribute("href")?.startsWith("/")) event.preventDefault();
  });
}

// ----------------------------------------------------------------------

const preview: Preview = {
  decorators: [withThemeProvider],

  // NOTE: initialGlobals (not globals) is the correct type in Storybook 8+.
  initialGlobals: {
    theme: "light",
  },

  globalTypes: {
    theme: {
      name: "Theme",
      description: "Theme global for components",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "light" },
          { value: "dark", icon: "moon", title: "dark" },
        ],
      },
    },
  },

  parameters: {
    docs: {
      // Page Docs par défaut à onglets (Code / Design / Guidelines). Les tabs
      // Design/Guidelines n'apparaissent que si un composant les fournit en
      // surchargeant `docs.page` dans son meta.
      page: () => <DocsTabsPage />,
      container: (props: ComponentProps<typeof DocsContainer>) => {
        const initial = document.documentElement.getAttribute("data-theme") === "dark";
        const [isDark, setIsDark] = useState(initial); // eslint-disable-line react-hooks/rules-of-hooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const onGlobalsUpdated = (event: { globals: Record<string, unknown> }) => {
            setIsDark(event.globals["theme"] === "dark");
          };
          props.context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
          return () => {
            props.context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
          };
        }, [props.context.channel]);
        // Propage le thème Comète au <html> : le contenu Docs hors stories
        // (ex. GuidelinesFlat dans l'onglet Guidelines) doit résoudre les tokens
        // light/dark même quand aucune story n'est montée (le décorateur, lui, ne
        // s'exécute que pour les stories du tab Code).
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
        return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
      },
    },
    // WORKAROUND: "todo" au lieu de "error" — violations de contraste connues dans
    // @aexae/comete-design-tokens (success, critical, information : ratio < 4.5:1 WCAG AA).
    // Repasser à "error" une fois les tokens corrigés.
    a11y: {
      test: "todo",
    },
    viewport: {
      options: { ...COMETE_VIEWPORTS, ...INITIAL_VIEWPORTS },
    },
    layout: "centered",
    // Ordre de la sidebar : l'accueil d'abord, puis les familles du plus fondamental au plus composé.
    options: {
      storySort: {
        // Littéral obligatoire (Storybook lit `storySort` statiquement) : garder synchronisé avec
        // `storyOrder.ts`, qui sert à ordonner les cartes de la page d'accueil.
        order: [
          "Welcome",
          "Foundation",
          "Patterns",
          "Layout",
          "Navigation",
          "Components",
          "Templates",
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
