// Types des modules virtuels fournis par les plugins Vite de `.storybook/`.
// (Les types sont répétés ici : une déclaration de module ambiant ne peut pas importer par chemin relatif.)
declare module "virtual:welcome-releases" {
  const releases: {
    version: string;
    /** Date ISO (AAAA-MM-JJ). */
    date: string;
    changes: { title: string; author: string }[];
  }[];
  export default releases;
}

// Feuille de tokens importée en side-effect (preview, setup des tests). Le paquet ne
// livre pas de types pour cette entrée CSS, et TypeScript 6 vérifie par défaut que les
// imports side-effect se résolvent (`noUncheckedSideEffectImports`).
declare module "@aexae/comete-design-tokens/css";
