import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // Fichiers ignorés
  {
    ignores: ["node_modules", "dist", "build", "storybook", "storybook-static", "coverage", "tools"],
  },

  // Base JS + globals pour tous les fichiers
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript avec type-checking — sources uniquement
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: tseslint.configs.recommendedTypeChecked,
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
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
      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // Accessibilité
      ...jsxA11yPlugin.configs.recommended.rules,

      // TypeScript
      // NOTE: no-unsafe-assignment is disabled because CSS module imports (via tcm-generated .d.ts
      // with `export = styles`) can be seen as an error type by some IDE TypeScript services even
      // though tsc and pnpm lint resolve them correctly. The other no-unsafe-* rules cover real risks.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", disallowTypeAnnotations: true },
      ],
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // Général
      "no-console": "warn",
      curly: ["error", "all"],
    },
  },

  // Fichiers de configuration (TypeScript sans type-checking)
  {
    files: ["*.config.{ts,mts}", "*.setup.{ts,js}"],
    extends: tseslint.configs.recommended,
    languageOptions: {
      parserOptions: { project: false },
    },
    rules: {
      "no-console": "off",
    },
  },

  // Prettier — doit être en dernier
  prettierConfig
);
