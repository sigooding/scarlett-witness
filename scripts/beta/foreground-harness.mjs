#!/usr/bin/env node
/**
 * FOREGROUND & SPRITE-SHEET BETA HARNESS — the 10-point checklist pass over
 * the layered-foreground feature set (sprite-sheet layers, animation
 * presets, the full-screen frame player, layer stack edits, blend modes,
 * composite parity across Studio preview / Stage tab / game playback,
 * parallax + walk-behind occlusion, undo/redo, persistence round-trip and
 * the skull-pie object-first verb menu).
 *
 * Same trick as studio-beta-harness.mjs: bundles
 * scripts/beta/foreground-probe.ts with esbuild, mounts the REAL <Studio/>
 * (and then the REAL <GamePlayer>) in happy-dom, and drives only real UI
 * affordances — verifying the DATA (autosaved draft) and the RENDERED DOM
 * after every step, never internal handles.
 *
 * Two extras over the studio-beta shim:
 *   - fake-indexeddb is installed FIRST so media uploads really persist
 *     (the sheet images are genuine PNGs the probe generates itself);
 *   - the Image stub reads the PNG IHDR so sheets report their true pixel
 *     size (the frame-grid maths is then exercised for real: 1/2/5 columns).
 *
 * Run: node scripts/beta/foreground-harness.mjs   (or: npm run test:foreground)
 */
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-foreground-beta");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.mjs");
const probeOut = path.join(dir, "probe-bundle.mjs");

let probeExitCode = 0;
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
// Real IndexedDB before anything else: media uploads go through
// src/data/mediaLibrary.ts, which no-ops (and drops data URLs!) when
// indexedDB is missing — the whole sheet-authoring flow needs it.
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

// Decode a data:image/png;base64 URL just enough to read the IHDR — the
// probe generates genuine PNGs, and the frame-grid maths (cols = natural
// width / frameWidth) must run against the REAL pixel size, not a stub.
const pngDims = (url) => {
  const m = /^data:image\\/png;base64,(.+)$/.exec(String(url));
  if (!m) return null;
  try {
    const b = Buffer.from(m[1], "base64");
    if (b.length < 24 || b.toString("ascii", 12, 16) !== "IHDR") return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch { return null; }
};

class EagerImage {
  constructor() {
    this.naturalWidth = 256;
    this.naturalHeight = 256;
    this.onload = null;
    this.onerror = null;
  }
  set src(v) {
    this._src = v;
    const d = pngDims(v);
    if (d) { this.naturalWidth = d.w; this.naturalHeight = d.h; }
    queueMicrotask(() => this.onload && this.onload());
  }
  get src() { return this._src; }
  addEventListener(t, fn) { if (t === "load") this.onload = fn; }
  removeEventListener() {}
}
globalThis.Image = EagerImage;
win.Image = EagerImage;

// Audio / canvas / scroll shims (Part B mounts the real <GamePlayer>): same
// shape as the stage beta — media elements "play" instantly, canvas 2D is
// unavailable (the sheet forge degrades gracefully, never crashes).
class FakeAudio {
  paused = true;
  volume = 1;
  currentTime = 0;
  duration = 0;
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  load() {}
  addEventListener() {}
  removeEventListener() {}
  cloneNode() { return new FakeAudio(); }
}
globalThis.Audio = FakeAudio;
win.Audio = FakeAudio;
try { win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; } catch {}
try { win.HTMLMediaElement.prototype.pause = function () {}; } catch {}
try { win.HTMLCanvasElement.prototype.getContext = function () { return null; }; } catch {}
win.scrollTo = () => {};
globalThis.scrollTo = win.scrollTo;

// DEBUG: who writes non-JSON to draft keys?
const rawSetItem = win.localStorage.setItem.bind(win.localStorage);
win.localStorage.setItem = (k, v) => {
  if (process.env.FGB_DEBUG && String(k).startsWith("scarlet-studio-draft-") && String(v) === "true") {
    console.log("SETITEM TRUE:", k, new Error("trace").stack?.split("\\n").slice(1, 6).join(" | "));
  }
  return rawSetItem(k, v);
};

const probe = await import(${JSON.stringify(pathToFileURL(probeOut).href)});
await probe.run({ win, doc, container: doc.getElementById("root"), exit: (code) => { probeExitCode = code; } });
`,
);

await build({
  entryPoints: [path.join(here, "foreground-probe.ts")],
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
    GAME_PATH: path.join(root, "src", "game", "Game.tsx"),
    EB_PATH: path.join(root, "src", "ErrorBoundary.tsx"),
    STORIES_PATH: path.join(root, "src", "data", "stories.ts"),
    LOGIC_PATH: path.join(root, "src", "logic.ts"),
    SPRITESHEET_PATH: path.join(root, "src", "game", "spriteSheet.ts"),
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
  console.error("foreground beta harness crashed:");
  console.error(err);
  probeExitCode = 1;
}
process.exit(probeExitCode);
