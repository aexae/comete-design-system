// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";


const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-designs",
    "@storybook/addon-vitest",
    "@chromatic-com/storybook",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return mergeConfig(config, {
      resolve: {
        alias: {
          "@": resolve(__dirname, "../../src"),
          "@naxit/comete-design-system": resolve(__dirname, "../../src"),
        },
        dedupe: ["react", "react-dom"],
      },
      optimizeDeps: {
        exclude: ["@naxit/comete-design-system"],
        include: [
          "react-aria-components",
          "@naxit/comete-icons",
          "@naxit/comete-logos",
          "@naxit/comete-illustrations",
        ],
      },
      server: {
        watch: {
          usePolling: true,
          interval: 500,
        },
        fs: {
          allow: [resolve(__dirname, "../.."), resolve(__dirname, "..")],
        },
      },
    });
  },
};

export default config;
