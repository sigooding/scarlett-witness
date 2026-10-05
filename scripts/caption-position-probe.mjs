#!/usr/bin/env node
/**
 * CAPTION PROBE — boots the real <App/>, plays the walking-stage story
 * (South Park: The Recess Wars), clicks a LOOK marker, and asserts the stage caption bar:
 *   1. it renders pinned to the TOP of the plate (above the walker), not
 *      at bottom-[16%] where the character roams;
 *   2. it is GONE again within stageCaptionMs's new snappy budget
 *      (≤ ~5.2s + animation slack), not the old 9s.
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const dir = path.join(root, "scripts", ".tmp-caption-probe");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.jsx");

// Clean the scratch dir even when the child keeps the event loop alive.
process.on("exit", () => {
  try {
    require("node:fs").rmSync(dir, { recursive: true, force: true });
  } catch {}
});

writeFileSync(
  entry,
  `
import { Window } from "happy-dom";

const win = new Window({ url: "http://localhost:5173/" });
const doc = win.document;
doc.body.innerHTML = '<div id="root"></div>';

for (const key of [
  "document", "navigator", "location", "history", "customElements",
  "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLIFrameElement",
  "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
  "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
  "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
  "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent",
  "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
]) {
  if (win[key] === undefined) continue;
  try { globalThis[key] = win[key]; }
  catch { try { Object.defineProperty(globalThis, key, { value: win[key], configurable: true }); } catch {} }
}
globalThis.window = win;
win.matchMedia = win.matchMedia?.bind(win) ?? ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
globalThis.matchMedia = win.matchMedia;

class EagerImage {
  constructor() { this.naturalWidth = 256; this.naturalHeight = 128; this.onload = null; this.onerror = null; }
  set src(v) { this._src = v; queueMicrotask(() => this.onload && this.onload()); }
  get src() { return this._src; }
  addEventListener(t, fn) { if (t === "load") this.onload = fn; }
  removeEventListener() {}
}
globalThis.Image = EagerImage;
win.Image = EagerImage;
class FakeAudio {
  constructor() { this.paused = true; }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  load() {}
  addEventListener() {}
  removeEventListener() {}
  cloneNode() { return new FakeAudio(); }
}
globalThis.Audio = FakeAudio; win.Audio = FakeAudio;
try { win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; win.HTMLMediaElement.prototype.pause = function () {}; } catch {}
try { win.HTMLCanvasElement.prototype.getContext = function () { return null; }; } catch {}
win.scrollTo = () => {}; globalThis.scrollTo = win.scrollTo;

const problems = [];
console.error = (...a) => { problems.push(["console.error", a.map(String).join(" ")]); };
console.warn = (...a) => { problems.push(["console.warn", a.map(String).join(" ")]); };
process.on("uncaughtException", (e) => { problems.push(["uncaught", String((e && e.stack) || e)]); });
process.on("unhandledRejection", (e) => { problems.push(["unhandled rejection", String((e && e.stack) || e)]); });

const { StrictMode, createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { default: App } = await import("APP_PATH");
const { ErrorBoundary } = await import("EB_PATH");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const container = doc.getElementById("root");
const rootR = createRoot(container);
rootR.render(createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(App))));
await sleep(2500);

let failed = false;
const ok = (name, cond, extra) => {
  console.log((cond ? "  ok   " : "  FAIL ") + name + (cond ? "" : "  -> " + String(extra).slice(0, 240)));
  if (!cond) failed = true;
};

// Boot South Park: The Recess Wars (starts on a stage with LOOK show-text markers).
const q = (sel) => [...container.querySelectorAll(sel)];
const card = q('[role="button"], button').find((b) => /South Park/i.test(b.textContent || ""));
ok("story card found", !!card);
if (!card) process.exit(1);
card.click(); await sleep(3500);

// Advance any prose/beat overlay until stage markers are clickable.
for (let i = 0; i < 30; i++) {
  const markers = q("button").filter((b) => /stage-marker/i.test(b.className || ""));
  if (markers.length) break;
  const btns = q("button").filter((b) => (b.textContent || "").trim());
  const adv = btns.find((b) => /continue|▸|▶/i.test(b.textContent || ""));
  if (adv) adv.click();
  win.dispatchEvent(new win.KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
  await sleep(500);
}
const markers = q("button").filter((b) => /stage-marker/i.test(b.className || ""));
ok("stage markers rendered", markers.length > 0, markers.length);

// Click a LOOK marker that fires a show-text caption from where we stand.
const look = markers.find((b) => /look|sign|vend/i.test(b.getAttribute("aria-label") || "") ) ?? markers[0];
const plate = container.querySelector(".fx-grain") || container.firstElementChild;
look.click();

// Wait for the caption to appear.
let caption = null;
for (let i = 0; i < 24 && !caption; i++) {
  await sleep(500);
  caption = container.querySelector(".stage-caption");
}
ok("caption appears after LOOK", !!caption);
if (caption) {
  const style = caption.getAttribute("style") || "";
  const cls = caption.className || "";
  ok("caption pinned to the TOP of the plate", /top-\\[13%\\]/.test(cls), cls);
  ok("caption no longer at bottom-[16%] (over the character)", !/bottom-\\[16%\\]/.test(cls), cls);
  const rect = caption.getBoundingClientRect();
  const plateRect = plate ? plate.getBoundingClientRect() : { top: 0, height: 720 };
  const relTop = plateRect.height ? (rect.top - plateRect.top) / plateRect.height : -1;
  // happy-dom does no real layout (plate rect height 0) — when geometry is
  // unavailable, the class assertions above carry the check.
  ok("caption sits in the top band of the plate (top < 35%)", relTop < 0 || relTop < 0.35, "relTop=" + relTop.toFixed(3));

  // Hold time: measure how long the caption stays. New cap is 5.2s + slack.
  const t0 = Date.now();
  let held = 0;
  while (Date.now() - t0 < 11000) {
    await sleep(250);
    if (!container.querySelector(".stage-caption")) { held = Date.now() - t0; break; }
  }
  ok("caption clears within ~5.5s (was up to 9s)", held > 0 && held <= 5600, "held=" + held + "ms");
}

ok("no console errors during the run", problems.length === 0, problems.map((p) => p.join(": ")).join(" | ").slice(0, 400));
console.log(failed ? "\\nCAPTION PROBE FAILED" : "\\nCAPTION PROBE PASSED");
rootR.unmount();
process.exit(failed ? 1 : 0);
`,
);

const out = path.join(dir, "bundle.mjs");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  outfile: out,
  logLevel: "warning",
  absWorkingDir: root,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
  define: { "process.env.NODE_ENV": '"development"', "import.meta.env": "{}", __SCARLET_REEL_BUILD_ID__: JSON.stringify("caption-probe") },
  external: ["happy-dom"],
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
      },
    },
  ],
  alias: {
    APP_PATH: path.join(root, "src", "App.tsx"),
    EB_PATH: path.join(root, "src", "ErrorBoundary.tsx"),
  },
});

const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [out], { stdio: "inherit", cwd: root, timeout: 180000 });
process.exitCode = res.status ?? 1;
