#!/usr/bin/env node
/**
 * IMAGE PICKER BETA HARNESS — mounts the REAL <ImagePicker/> (the one image
 * box every picture field in Studio uses: scene backgrounds, beat replacement
 * shots, depth maps, plates, cut-outs, sprites, masks, avatars) in happy-dom
 * and drives it through the real UI.
 *
 * Two things make this harness honest:
 *   - fake-indexeddb is installed FIRST, so the ⇧ Upload row is tested against
 *     a real IndexedDB — the asset really lands in the library and is really
 *     filed in the folder the field asked for;
 *   - the `virtual:builtin-images` list is stubbed with a small but complete
 *     library (ungrouped plates + two of the film's own depth-layer files), so
 *     both the ordinary picker and the depth-map picker are exercised —
 *     including the "show every group" switch that keeps the film's depth maps
 *     out of background lists without making them unreachable.
 *
 * Run: node scripts/beta/image-picker-harness.mjs   (or: npm run test:image-picker)
 */
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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

// The stub image library: the same { url, label, group } shape the
// `builtin-images` Vite plugin bakes in from public/img, public/assets and
// public/film/depth.
const STUB_IMAGES = [
  { url: "/img/bg-alley.jpg", label: "Alley" },
  { url: "/assets/ui/case.png", label: "Leather Case" },
  { url: "/film/depth/s1/377-the-hive-remembered/depth.png", label: "The Hive Remembered", group: "film-depth" },
  { url: "/film/depth/s1/377-the-hive-remembered/plate.png", label: "The Hive Remembered Plate", group: "film-depth" },
];

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
  define: { "process.env.NODE_ENV": '"development"', "import.meta.env": "{}" },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, (a) =>
          a.path === "virtual:builtin-images"
            ? { contents: `export default ${JSON.stringify(STUB_IMAGES)};` }
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
    "@": path.join(root, "src"),
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
