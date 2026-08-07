// Déclaration minimale des API Node utilisées UNIQUEMENT par les tests
// (garde anti-drift qui lit des fichiers CSS). Le projet cible le navigateur et
// n'installe pas `@types/node` ; vitest s'exécute sous Node, donc ces modules
// existent au runtime. On ne déclare que ce qu'on utilise.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}
