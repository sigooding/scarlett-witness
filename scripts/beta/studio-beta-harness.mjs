#!/usr/bin/env node
/**
 * STUDIO-SIDE BETA HARNESS — a fresh, skeptical pass over the editor itself.
 *
 * Previous beta tests (docs/*-beta-test.md) exercised the *runtime* through
 * authored cases and their own assertions; per this pass their claims are
 * NOT trusted. This harness mounts the real <Studio/> in happy-dom and
 * drives the authoring flows end-to-end, then verifies the DATA — not the
 * UI — after every step:
 *
 *   Part 1  boot
 *   Part 2  ＋ New Story (blank contract, publish gate)
 *   Part 3  author a complete micro-case via the real UI
 *           (scene, title, character, item, beat, choice, ending, wiring)
 *   Part 4  Test tab / Playtester sees the authored graph
 *   Part 5  undo/redo restores exact snapshots
 *   Part 6  ⤓ Export produces a valid, faithful .reel.json
 *   Part 7  ⤒ Import round-trips the export
 *   Part 8  deletion integrity: scene referenced by a choice / an episode /
 *           a map pin / a stage edge-exit — what Check flags and what
 *           🛠 Repair actually repairs
 *   Part 9  ⧉ Duplicate Story rewires every scene reference
 *   Part 10 draft reload: unmount → remount reopens the same draft
 *
 * Verification imports validateStory()/storyEdges() straight from src/logic —
 * never the Studio's own rendering of them.
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-studio-beta");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.mjs");
const probeOut = path.join(dir, "probe-bundle.mjs");

let probeExitCode = 0;
// The probe runs inside a GENERATED entry.mjs, which is a separate module —
// it cannot close over anything in this file. It therefore reports its exit
// code by writing this sidecar file, which we read back below. (Passing
// `exit: (code) => { probeExitCode = code; }` as source text into the
// generated entry threw ReferenceError on EVERY run: the harness caught it,
// set the code to 1, and `npm test` could never pass however green the
// probe's own 74 checks were.)
const exitCodeFile = path.join(dir, "exit-code");
// The happy-dom rAF loop can keep the event loop alive after the probe has
// finished — hard-exit + clean the scratch dir (same trick as the other
// beta harnesses).
process.on("exit", () => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});

// The entry shims the DOM globals FIRST and only then dynamically imports
// the (already-bundled) probe — a single esbuild pass would hoist
// react-dom's module evaluation above the shim.
writeFileSync(
  entry,
  `
import { Window } from "happy-dom";
import { writeFileSync } from "node:fs";

const win = new Window({ url: "http://localhost:5173/" });
const doc = win.document;
doc.body.innerHTML = '<div id="root"></div>';

for (const key of [
  "document", "navigator", "location", "history", "customElements",
  "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLIFrameElement",
  "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
  "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
  "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
  "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent",
  "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
  "File", "FileReader", "Blob", "URL",
]) {
  if (win[key] === undefined) continue;
  try { globalThis[key] = win[key]; }
  catch { try { Object.defineProperty(globalThis, key, { value: win[key], configurable: true }); } catch {} }
}
globalThis.window = win;
win.matchMedia = win.matchMedia?.bind(win) ?? ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
globalThis.matchMedia = win.matchMedia;

// Studio flows ask confirm() before destructive ops — a beta probe always
// says yes so the destructive paths actually run.
win.confirm = () => true;
globalThis.confirm = win.confirm;
win.alert = () => {};
globalThis.alert = win.alert;

class EagerImage {
  constructor() { this.naturalWidth = 256; this.naturalHeight = 256; this.onload = null; this.onerror = null; }
  set src(v) { this._src = v; queueMicrotask(() => this.onload && this.onload()); }
  get src() { return this._src; }
  addEventListener(t, fn) { if (t === "load") this.onload = fn; }
  removeEventListener() {}
}
globalThis.Image = EagerImage;
win.Image = EagerImage;

const probe = await import(${JSON.stringify(pathToFileURL(probeOut).href)});
await probe.run({
  win,
  doc,
  container: doc.getElementById("root"),
  exit: (code) => { writeFileSync(${JSON.stringify(exitCodeFile)}, String(code)); },
});
`,
);

await build({
  entryPoints: [path.join(here, "studio-beta-probe.ts")],
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
        b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
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
    STUDIO_PATH: path.join(root, "src", "studio", "Studio.tsx"),
    EB_PATH: path.join(root, "src", "ErrorBoundary.tsx"),
    STORIES_PATH: path.join(root, "src", "data", "stories.ts"),
    LOGIC_PATH: path.join(root, "src", "logic.ts"),
    TYPES_PATH: path.join(root, "src", "types.ts"),
    "@": path.join(root, "src"),
  },
  external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "happy-dom", "@xyflow/react", "clsx", "tailwind-merge"],
  logLevel: "warning",
});

console.log("probe bundle built — mounting Studio in happy-dom…\n");
try {
  await import(pathToFileURL(entry).href);
} catch (err) {
  // The probe replaces console.error to capture React's output and never puts
  // it back, so a harness-level crash reported through console.error is
  // swallowed. Write straight to stderr instead.
  process.stderr.write("studio beta harness crashed:\n" + ((err && err.stack) || String(err)) + "\n");
  probeExitCode = 1;
}
if (existsSync(exitCodeFile)) probeExitCode = Number(readFileSync(exitCodeFile, "utf8")) || 0;
else {
  process.stderr.write("studio beta harness: the probe never reported an exit code.\n");
  probeExitCode = 1;
}
process.exit(probeExitCode);
