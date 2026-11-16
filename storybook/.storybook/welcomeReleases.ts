// Module virtuel `virtual:welcome-releases` : les dernières versions du design system et qui les a
// changées, lues dans l'historique git (chaque PR de composant porte sa version dans son titre,
// ex. « feat(page): … (1.0.0-alpha.175) (#350) »). Aucune donnée n'est écrite à la main.
//
// Sans historique git (checkout superficiel, archive), la liste est vide : la page retombe sur le
// lien vers le changelog.
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { Plugin } from "vite";

const ID = "virtual:welcome-releases";
const RESOLVED = `\0${ID}`;

export interface WelcomeChange {
  title: string;
  author: string;
}

export interface WelcomeRelease {
  version: string;
  /** Date ISO (AAAA-MM-JJ) du dernier commit de la version. */
  date: string;
  changes: WelcomeChange[];
}

// Seule la version entre parenthèses est celle de la release : un titre peut en citer une autre
// (« comete-illustrations 0.1.0-alpha.5 »).
const VERSION = /\((\d+\.\d+\.\d+-alpha\.\d+)\)/;

/** Titre lisible : sans version ni numéro de PR, sans le préfixe `type(scope):`. */
function cleanTitle(subject: string): string {
  return subject
    .replace(/\s*\((\d+\.\d+\.\d+-alpha\.\d+)\)/g, "")
    .replace(/\s*\(#\d+\)\s*$/, "")
    .replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, "")
    .trim();
}

export function readReleases(repoRoot: string, count = 3, perRelease = 4): WelcomeRelease[] {
  let log: string;
  try {
    log = execFileSync("git", ["log", "-n", "300", "--format=%an%x1f%as%x1f%s"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return [];
  }
  const byVersion = new Map<string, WelcomeRelease>();
  for (const line of log.split("\n")) {
    const [author, date, subject] = line.split("\x1f");
    if (!author || !date || !subject) continue;
    const version = VERSION.exec(subject)?.[1];
    // Les commits de release ne décrivent aucun changement.
    if (!version || /^chore\(release\)/.test(subject)) continue;
    const release = byVersion.get(version) ?? { version, date, changes: [] };
    if (release.changes.length < perRelease) {
      // « Axel Cremont » et « Axel » sont la même personne : on garde le prénom.
      release.changes.push({ title: cleanTitle(subject), author: author.split(" ")[0] ?? author });
    }
    byVersion.set(version, release);
  }
  return [...byVersion.values()].slice(0, count);
}

export function welcomeReleases(): Plugin {
  const root = resolve(import.meta.dirname, "../..");
  return {
    name: "welcome-releases",
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load: (id) =>
      id === RESOLVED ? `export default ${JSON.stringify(readReleases(root))};` : undefined,
  };
}
