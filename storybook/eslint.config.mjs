import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import storybookPlugin from "eslint-plugin-storybook";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["node_modules", "storybook-static"] },

  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Stories — TypeScript avec type-checking
  {
    files: ["stories/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
    extends: tseslint.configs.recommendedTypeChecked,
    plugins: {
      // REASON: eslint-plugin-react 7.37.5 et eslint-plugin-jsx-a11y 6.10.2 ne déclarent pas
      // ESLint 10 et appellent des API de contexte supprimées (context.getFilename…).
      // fixupPluginRules les rétablit. À retirer quand les deux plugins supporteront ESLint 10.
      react: fixupPluginRules(reactPlugin),
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": fixupPluginRules(jsxA11yPlugin),
    },
    settings: {
      react: { version: "detect" },
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      ...jsxA11yPlugin.configs.recommended.rules,

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", disallowTypeAnnotations: true },
      ],

      "no-console": "warn",
      curly: ["error", "all"],
    },
  },

  // Règles spécifiques Storybook
  ...storybookPlugin.configs["flat/recommended"],
  {
    files: ["stories/**/*.stories.{ts,tsx}"],
    rules: {
      // REASON: Meta/StoryObj sont des types de @storybook/react, pas de runtime renderer
      "storybook/no-renderer-packages": "off",
      // REASON: Storybook Meta/StoryObj expose des types internes `any` (argTypes, parameters.design)
      // qui déclenchent des faux positifs avec le type-checking strict.
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },

  prettierConfig
);
