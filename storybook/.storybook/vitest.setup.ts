// Charge les design tokens (custom properties :root) dans les tests browser,
// sinon les fonds à base de var(--...) ne résolvent pas (bouton transparent).
// Les annotations du preview et des addons (a11y inclus) sont appliquées
// automatiquement par @storybook/addon-vitest depuis Storybook 10.3.
import "@aexae/comete-design-tokens/css";
