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
