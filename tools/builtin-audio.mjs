/**
 * THE STUDIO'S AUDIO LIBRARY — one scan of every sound the project ships.
 *
 * `virtual:builtin-audio` exposes this list to the app (see vite.config.ts), so
 * the Studio's sound pickers can offer the film's own one-shots and ambience,
 * its music cues and its voice takes, plus anything imported into
 * public/uploads. A browser cannot enumerate a folder over HTTP — there is no
 * directory listing — so the list has to be built in Node at dev/build time.
 *
 * Kept out of vite.config.ts so it can be run and checked on its own (the
 * audio-picker harness bakes this exact scan in, and
 * scripts/film-backend.entry.ts asserts every sound effect the film references
 * is in it). Plain JS + JSDoc: this file is imported by vite.config.ts and by
 * Node scripts through esbuild, where TypeScript annotations are a liability.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The extensions the scan has always collected. Deliberately not `.webm`:
 *  the film's lip-sync reference lives in public/film/video and is a picture
 *  with a soundtrack, not a sound effect. */
export const AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"];

/** Where audio lives, relative to public/, and the URL prefix it is served
 *  under. One root today (the whole of public/), but written as a list because
 *  that is how the image scanner works and how this would grow. */
export function audioRoots() {
  return [{ dir: "public", prefix: "" }];
}

/** This repo's root. `import.meta.url` is right for vite.config.ts and for
 *  scripts run from the repo, but a bundled harness runs from a temp dir — so
 *  an explicit root always wins, and the fallback prefers the working
 *  directory when it looks like the repo. */
export function defaultRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const fromHere = path.resolve(here, "..");
  if (fs.existsSync(path.join(fromHere, "public"))) return fromHere;
  return process.cwd();
}

/** The section heading a folder belongs under, in the order the picker lists
 *  them. The film's sound effects come first: that is what every "sound on
 *  this beat" field is looking for, and where the film's 166 references live
 *  (ambience and one-shots share the folder). */
const SECTIONS = [
  { rank: 0, name: "Your uploads", test: () => false },
  { rank: 1, name: "Film one-shots & ambience (film/sfx)", test: (f) => f === "film/sfx" },
  { rank: 2, name: "Alternate takes (film/sfx/alternates)", test: (f) => f.startsWith("film/sfx/") },
  { rank: 3, name: "Film music cues (film/audio)", test: (f) => f === "film/audio" },
  { rank: 4, name: "Film voice takes (film/voice)", test: (f) => f === "film/voice" || f.startsWith("film/voice/") },
  { rank: 5, name: "More film audio", test: (f) => f.startsWith("film") },
  { rank: 6, name: "Game one-shots (sfx)", test: (f) => f === "sfx" || f.startsWith("sfx/") },
  { rank: 7, name: "Music & audio (audio)", test: (f) => f === "audio" || f.startsWith("audio/") },
  { rank: 8, name: "Character takes (voices)", test: (f) => f.startsWith("voices") },
  { rank: 9, name: "Already in public/uploads", test: (f) => f.startsWith("uploads") },
  { rank: 10, name: "Other reels (reels)", test: (f) => f.startsWith("reels") },
];

/** Section for a folder relative to public/ ("film/sfx", "reels/hangar/…"). */
export function sectionFor(folder) {
  const hit = SECTIONS.slice(1).find((s) => s.test(folder));
  return { name: hit ? hit.name : "Other audio", rank: hit ? hit.rank : 99 };
}

/** A row's label: the file name without its extension. Unchanged from the
 *  labels the Studio has always shown for these files (the voice picker reads
 *  them), so a label never shifts under an author's feet. */
export function labelFor(name) {
  return name.replace(/\.[^.]+$/, "");
}

/**
 * Every audio file under the roots, as
 * `{ url, label, folder, section, person?, scene? }`, uploads-free and sorted
 * root-major, then by section rank, then by label.
 *
 * `person`/`scene` are filled in for the `voices/<person>/<scene>/<line>` tree
 * so a character's own takes can be grouped ahead of everything else.
 */
export function scanBuiltinAudio(root = defaultRoot()) {
  const exts = AUDIO_EXTS;
  const out = [];
  for (const { dir, prefix } of audioRoots()) {
    const base = path.join(root, dir);
    const walk = (current, rel) => {
      let entries;
      try {
        entries = fs.readdirSync(current, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(path.join(current, entry.name), relPath);
          continue;
        }
        const ext = (entry.name.toLowerCase().match(/\.[^.]+$/) ?? [""])[0];
        if (!exts.includes(ext)) continue;
        const parts = relPath.split("/");
        const folders = parts.slice(0, -1);
        const folder = folders.join("/");
        const { name, rank } = sectionFor(folder);
        const item = {
          url: `${prefix}/${relPath}`,
          label: labelFor(parts[parts.length - 1]),
          folder,
          section: name,
          rank,
        };
        if (folders[0] === "voices" && folders[1]) {
          item.person = folders[1];
          item.scene = folders[2];
        }
        out.push(item);
      }
    };
    walk(base, "");
  }
  out.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label) || a.url.localeCompare(b.url));
  return out;
}
