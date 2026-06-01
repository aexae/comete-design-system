import { DocsContainer } from "@storybook/addon-docs/blocks";
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
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

// ----------------------------------------------------------------------

const withThemeProvider: Decorator = (Story) => {
  const [globals] = useGlobals(); // eslint-disable-line react-hooks/rules-of-hooks
  const mode = (globals["theme"] as "light" | "dark") ?? "light";

  // NOTE: Set synchronously (not in useEffect) — Storybook's useEffect has
  // different timing guarantees and was not reliably updating the DOM attribute.
  document.documentElement.setAttribute("data-theme", mode);

  return <ThemeProvider mode={mode}><Story /></ThemeProvider>;
};

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
      container: (props: ComponentProps<typeof DocsContainer>) => {
        const initial = document.documentElement.getAttribute("data-theme") === "dark";
        const [isDark, setIsDark] = useState(initial); // eslint-disable-line react-hooks/rules-of-hooks
        useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
          const onGlobalsUpdated = (event: { globals: Record<string, unknown> }) => {
            setIsDark(event.globals["theme"] === "dark");
          };
          props.context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
          return () => { props.context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated); };
        }, [props.context.channel]);
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
      options: INITIAL_VIEWPORTS,
    },
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
