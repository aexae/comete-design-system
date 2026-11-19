import { create } from "storybook/theming";

export const customTheme = create({
  base: "dark",
  brandTitle: "Comète | Design System",
  // brandImage: "/assets/logo.png",
  brandTarget: "_self",

  colorPrimary: "#22427c", // main
  colorSecondary: "#f8bf01", // secondary

  // UI (thème sombre basé sur la palette Comète)
  appBg: "#39558a", // main, reste dark
  appContentBg: "#7488ab", // light
  appBorderColor: "#e9effa", // lighter
  appBorderRadius: 8,

  // Couleurs de texte
  textColor: "#ffffff", // contrastText
  textInverseColor: "#22427c", // main
  textMutedColor: "#e9effa", // lighter

  // Toolbar
  barTextColor: "#ffffff",
  barSelectedColor: "#f8bf01", // secondary
  barBg: "#22427c", // main
  barHoverColor: "#7488ab", // light

  // Formulaires
  inputBg: "#22427c",
  inputBorder: "#7488ab",
  inputTextColor: "#ffffff",
  inputBorderRadius: 6,

  // Typography
  fontBase: '"Noto Sans", sans-serif',
  fontCode: '"Noto Sans Mono", monospace',
});
