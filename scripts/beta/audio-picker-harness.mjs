#!/usr/bin/env node
/**
 * AUDIO PICKER BETA HARNESS — mounts the REAL sound boxes in happy-dom and
 * drives them through the real UI:
 *
 *   - the beat's "🔊 Sound effect on this beat" box (the real <AudioPicker/>),
 *   - the scene's "Ambient loop (synth preset + recorded loops)" field (the
 *     real <AmbientLayers/>), which adds recorded loops through the same box.
 *
 * Three things make this harness honest:
 *   - it feeds the picker the REAL list from `tools/builtin-audio.mjs` — the
 *     same scan the dev server and the build use — so "every sound available"
 *     is checked against what is actually on disk (the film's 148 one-shots
 *     and ambience in public/film/sfx, its music cues and voice takes, the
 *     other reels, public/uploads);
 *   - fake-indexeddb is installed FIRST, so the ⇧ Upload row is tested against
 *     a real IndexedDB — the sound really lands in the library and is really
 *     filed in the folder the field asked for;
 *   - it drives the film's own sounds: the sfx and ambience files that
 *     src/data/nobodysWitnessFilm.ts actually references.
 *
 * Run: node scripts/beta/audio-picker-harness.mjs   (or: npm run test:audio-picker)
 */
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanBuiltinAudio } from "../../tools/builtin-audio.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-audio-picker");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.mjs");
const probeOut = path.join(dir, "probe-bundle.mjs");

process.on("exit", () => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});

// The REAL library the dev server and the build bake into the app, so every
// count below is a statement about the repository, not about a stub.
const AUDIO = scanBuiltinAudio();
const FILM_SFX = AUDIO.filter((a) => a.folder === "film/sfx");
const FILM_MUSIC = AUDIO.filter((a) => a.folder === "film/audio");
// Sounds the film really uses (src/data/nobodysWitnessFilm.ts and its ambient
// loops) — both are on disk in this repository.
const CROSSING = "/film/sfx/crossing.mp3";
const AMB_HIVE = "/film/sfx/amb-hive.mp3";
const TITLE_SONG = "/film/audio/title-song.mp3";
if (!FILM_SFX.length || !FILM_MUSIC.length || AUDIO.every((a) => a.url !== CROSSING) || AUDIO.every((a) => a.url !== AMB_HIVE)) {
  console.error("audio picker harness: expected the film's sound effects and music in tools/builtin-audio.mjs's scan");
  process.exit(1);
}

// The entry shims the DOM globals FIRST and only then dynamically imports the
// (already-bundled) probe — a single esbuild pass would hoist react-dom's
// module evaluation above the shim.
writeFileSync(
  entry,
  `
// Real IndexedDB before anything else: the ⇧ Upload row goes through
// src/data/mediaLibrary.ts, which refuses uploads when indexedDB is missing.
await import("fake-indexeddb/auto");

import { Window } from "happy-dom";

const win = new Window({ url: "http://localhost:5173/" });
const doc = win.document;
doc.body.innerHTML = '<div id="root"></div>';

for (const key of [
  "document", "navigator", "location", "history", "customElements",
  "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLIFrameElement",
  "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
  "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
  "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
  "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent",
  "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
  "File", "FileReader", "Blob", "URL", "indexedDB", "IDBKeyRange", "IDBRequest", "IDBTransaction", "IDBDatabase",
]) {
  if (win[key] === undefined) continue;
  try { globalThis[key] = win[key]; }
  catch { try { Object.defineProperty(globalThis, key, { value: win[key], configurable: true }); } catch {} }
}
globalThis.window = win;
win.matchMedia = win.matchMedia?.bind(win) ?? ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
globalThis.matchMedia = win.matchMedia;
globalThis.HTMLElement = win.HTMLElement;
win.alert = () => {};
globalThis.alert = win.alert;

const probe = await import(${JSON.stringify(pathToFileURL(probeOut).href)});
await probe.run({ win, doc, container: doc.getElementById("root") });
`,
);

await build({
  entryPoints: [path.join(here, "audio-picker-probe.tsx")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: probeOut,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty" },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, (a) =>
          a.path === "virtual:builtin-audio"
            ? { contents: `export default ${JSON.stringify(AUDIO)};` }
            : { contents: "export default [];" },
        );
      },
    },
  ],
  banner: {
    js: `
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
`,
  },
  alias: {
    AUDIO_PICKER_PATH: path.join(root, "src", "studio", "AudioPicker.tsx"),
    AMBIENT_PATH: path.join(root, "src", "studio", "AmbientLayers.tsx"),
    MEDIA_PATH: path.join(root, "src", "data", "mediaLibrary.ts"),
    "@": path.join(root, "src"),
  },
  define: {
    "process.env.NODE_ENV": '"development"',
    "import.meta.env": "{}",
    __AUDIO_COUNT__: JSON.stringify(AUDIO.length),
    __FILM_SFX_COUNT__: JSON.stringify(FILM_SFX.length),
    __FILM_MUSIC_COUNT__: JSON.stringify(FILM_MUSIC.length),
    __FILM_SFX_SECTION__: JSON.stringify(FILM_SFX[0].section),
    __CROSSING__: JSON.stringify(CROSSING),
    __CROSSING_LABEL__: JSON.stringify(AUDIO.find((a) => a.url === CROSSING).label),
    __AMB_HIVE__: JSON.stringify(AMB_HIVE),
    __AMB_HIVE_LABEL__: JSON.stringify(AUDIO.find((a) => a.url === AMB_HIVE).label),
    __TITLE_SONG__: JSON.stringify(TITLE_SONG),
    __TITLE_SONG_LABEL__: JSON.stringify(AUDIO.find((a) => a.url === TITLE_SONG).label),
  },
  external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "happy-dom", "fake-indexeddb", "fake-indexeddb/auto"],
  logLevel: "warning",
});

console.log("probe bundle built — mounting the sound boxes in happy-dom…\n");
// Run the shim in its own process so a crashed or failed probe cannot be
// mistaken for a pass.
const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [entry], { stdio: "inherit", cwd: root, timeout: 240000 });
process.exit(res.status ?? 1);
