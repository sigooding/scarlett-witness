#!/usr/bin/env node
/**
 * IMAGE PICKER BETA HARNESS — mounts the REAL <ImagePicker/> (the one image
 * box every picture field in Studio uses: scene backgrounds, beat replacement
 * shots, depth maps, plates, cut-outs, sprites, masks, avatars) in happy-dom
 * and drives it through the real UI.
 *
 * Two things make this harness honest:
 *   - it feeds the picker the REAL list from `tools/builtin-images.mjs` — the
 *     same scan the dev server and the build use — so "every available image"
 *     is checked against what is actually on disk (the film's 800+ pictures
 *     under public/film/img and its depth layers under public/film/depth,
 *     plus /img and /assets wherever those exist);
 *   - fake-indexeddb is installed FIRST, so the ⇧ Upload row is tested against
 *     a real IndexedDB — the asset really lands in the library and is really
 *     filed in the folder the field asked for.
 *
 * Run: node scripts/beta/image-picker-harness.mjs   (or: npm run test:image-picker)
 */
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanBuiltinImages, labelFor } from "../../tools/builtin-images.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-image-picker");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.mjs");
const probeOut = path.join(dir, "probe-bundle.mjs");

// The happy-dom rAF loop can keep the event loop alive after the probe has
// finished — hard-exit + clean the scratch dir (same trick as the other
// beta harnesses).
process.on("exit", () => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});

// The REAL library the dev server and the build bake into the app, so every
// count below is a statement about the repository, not about a stub.
const BUILTINS = scanBuiltinImages();
const FILM_PICTURES = BUILTINS.filter((b) => b.group === "film-img");
const FILM_LAYERS = BUILTINS.filter((b) => b.group === "film-depth");
// A picture the film really uses (src/data/nobodysWitnessFilm.ts), and its
// depth map — both are on disk in this repository.
const HIVE_PICTURE = "/film/img/s1/377-the-hive-remembered.jpg";
const HIVE_DEPTH = "/film/depth/s1/377-the-hive-remembered/depth.png";
if (!FILM_PICTURES.length || !FILM_LAYERS.length || BUILTINS.every((b) => b.url !== HIVE_PICTURE)) {
  console.error("image picker harness: expected the film's pictures and depth layers in tools/builtin-images.mjs's scan");
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
  entryPoints: [path.join(here, "image-picker-probe.tsx")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: probeOut,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, (a) =>
          a.path === "virtual:builtin-images"
            ? { contents: `export default ${JSON.stringify(BUILTINS)};` }
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
    IMAGE_PICKER_PATH: path.join(root, "src", "studio", "ImagePicker.tsx"),
    MEDIA_PATH: path.join(root, "src", "data", "mediaLibrary.ts"),
    BUILTIN_IMAGES_PATH: path.join(root, "tools", "builtin-images.mjs"),
    "@": path.join(root, "src"),
  },
  define: {
    "process.env.NODE_ENV": '"development"',
    "import.meta.env": "{}",
    __BUILTIN_COUNT__: JSON.stringify(BUILTINS.length),
    __FILM_PICTURE_COUNT__: JSON.stringify(FILM_PICTURES.length),
    __FILM_LAYER_COUNT__: JSON.stringify(FILM_LAYERS.length),
    __HIVE_PICTURE__: JSON.stringify(HIVE_PICTURE),
    __HIVE_DEPTH__: JSON.stringify(HIVE_DEPTH),
    __HIVE_PICTURE_LABEL__: JSON.stringify(BUILTINS.find((b) => b.url === HIVE_PICTURE).label),
    __HIVE_DEPTH_LABEL__: JSON.stringify(BUILTINS.find((b) => b.url === HIVE_DEPTH).label),
  },
  external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "happy-dom", "fake-indexeddb", "fake-indexeddb/auto"],
  logLevel: "warning",
});

console.log("probe bundle built — mounting the image picker in happy-dom…\n");
// Run the shim in its own process so a crashed or failed probe cannot be
// mistaken for a pass (an unhandled rejection inside the shim would otherwise
// let this process exit 0).
const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [entry], { stdio: "inherit", cwd: root, timeout: 240000 });
process.exit(res.status ?? 1);
