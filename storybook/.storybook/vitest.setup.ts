import { setProjectAnnotations } from "@storybook/react-vite";
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
// Charge les design tokens (custom properties :root) dans les tests browser,
// sinon les fonds à base de var(--...) ne résolvent pas (bouton transparent).
import "@aexae/comete-design-tokens/css";

setProjectAnnotations([a11yAddonAnnotations]);
