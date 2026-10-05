import { Window } from "happy-dom";

const win = new Window({ url: "http://localhost:5173/" });
const doc = win.document;
doc.body.innerHTML = '<div id="root"></div>';

// Wire happy-dom into the Node globals React expects.
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

// happy-dom has no network, so <img>/new Image() never fire "load" — which
// keeps SheetSprite (talking portraits, foreground extras, stage walkers)
// from ever mounting. Stub Image with an eager loader that reports the real
// PNG dimensions read straight from the file header when the src maps to a
// file under public/, so sprite grids compute exactly as in a browser.
import { readFileSync as __readPng } from "node:fs";
import { fileURLToPath as __f } from "node:url";
import __path from "node:path";
// the bundle runs from scripts/.tmp-sledge-dom/, so public/ is two levels up
const PUBLIC_DIR = __path.join(__path.dirname(__f(import.meta.url)), "..", "..", "public");
function pngSize(p) {
  try {
    const b = __readPng(p);
    if (b.length > 24 && b[12] === 0x49 && b[13] === 0x48 && b[14] === 0x44 && b[15] === 0x52)
      return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch {}
  return null;
}
class EagerImage {
  constructor() { this.naturalWidth = 0; this.naturalHeight = 0; this.onload = null; this.onerror = null; }
  set src(v) {
    this._src = v;
    const rel = String(v).replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    const size = rel.endsWith(".png") ? pngSize(PUBLIC_DIR + rel) : null;
    if (size) { this.naturalWidth = size.w; this.naturalHeight = size.h; }
    else { this.naturalWidth = 1024; this.naturalHeight = 512; }
    queueMicrotask(() => this.onload && this.onload());
  }
  get src() { return this._src; }
  addEventListener(t, fn) { if (t === "load") this.onload = fn; }
  removeEventListener() {}
}
globalThis.Image = EagerImage;
win.Image = EagerImage;

const problems = [];
const realErr = console.error;
const realWarn = console.warn;
console.error = (...a) => { problems.push(["console.error", a.map(String).join(" ")]); };
console.warn = (...a) => { problems.push(["console.warn", a.map(String).join(" ")]); realWarn(...a); };
process.on("uncaughtException", (e) => { problems.push(["uncaught", String(e && e.stack || e)]); });
process.on("unhandledRejection", (e) => { problems.push(["unhandled rejection", String(e && e.stack || e)]); });

const { StrictMode, createElement } = await import("react");
const { createRoot } = await import("react-dom/client");



// Shims for APIs happy-dom lacks that the app touches.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.ResizeObserver = globalThis.ResizeObserver;
}
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.IntersectionObserver = globalThis.IntersectionObserver;
}
class FakeAudio {
  constructor() { this.paused = true; this.volume = 1; this.currentTime = 0; this.duration = 0; }
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

const container = doc.getElementById("root");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { GamePlayer } = await import("../../src/game/Game.tsx");
const { SLEDGE_HAMMER: story } = await import("../../src/data/sledgeHammer.ts");

let failed = false;
const check = (label, cond, extra = "") => {
  console.log("  " + (cond ? "ok  " : "FAIL") + "  " + label + (extra ? " - " + extra : ""));
  if (!cond) failed = true;
};

async function boot(sceneId) {
  try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
  container.innerHTML = "";
  problems.length = 0;
  const r = createRoot(container);
  r.render(createElement(StrictMode, null,
    createElement(GamePlayer, { story, playFromSceneId: sceneId, onExit: () => {} })));
  for (let i = 0; i < 24; i++) {
    await sleep(400);
    if (container.querySelector("button.stage-marker") || (container.textContent || "").length > 400) break;
  }
  await sleep(1400);
  return r;
}
const boundaryTripped = () => /the reel snapped|something broke/i.test(container.innerHTML);
const sweep = (phase) => {
  const errs = problems.filter(([k]) => k !== "console.warn");
  const warns = problems.filter(([k]) => k === "console.warn");
  for (const [k, m] of [...errs, ...warns].slice(0, 6))
    console.log("     . " + k + ": " + String(m).replace(/\s+/g, " ").slice(0, 260));
  check(phase + ": no console errors", errs.length === 0, errs.length ? errs.length + " error(s)" : "");
  check(phase + ": no console warnings", warns.length === 0, warns.length ? warns.length + " warning(s)" : "");
  problems.length = 0;
};

for (const [sceneId, label] of [
  ["sh_squadroom", "SQUAD ROOM"],
  ["sh_alley", "ALLEY"],
  ["sh_range", "FIRING RANGE"],
]) {
  console.log("\n=== " + label + " (" + sceneId + ") ===");
  const r = await boot(sceneId);
  check(label + " mounts without tripping the error boundary", !boundaryTripped());
  check(label + " paints its plate", container.querySelectorAll("img").length > 0);
  sweep(label);
  r.unmount(); await sleep(200);
}

console.log("\n=== FOREGROUND EXTRA - the cordon tape ===");
{
  const r = await boot("sh_alley");
  check("the tape sheet is painted into the alley", /sh-fg-tape\.png/.test(container.innerHTML));
  sweep("foreground extra");
  r.unmount(); await sleep(200);
}

console.log("\n=== INTERVIEW ROOM - portraits and prose ===");
{
  const r = await boot("sh_interview");
  check("interview mounts without tripping the error boundary", !boundaryTripped());
  const txt = (container.textContent || "").replace(/\s+/g, " ");
  check("the scene renders its prose", txt.length > 200);
  // NOTE: portraits only mount once the dialogue beats begin - the scene
  // opens on prose. Asserting before advancing tests nothing but the delay.
  // advance past the prose into the dialogue beats
  for (let i = 0; i < 8; i++) {
    const btns = [...container.querySelectorAll("button")];
    const adv = btns.find((b) => /continue|▸|next|skip/i.test(b.textContent || ""));
    if (adv) adv.click();
    await sleep(500);
    if (/sh-mayor-(talk|cornered)\.png/.test(container.innerHTML)) break;
  }
  check("Vane's portrait mounts once the beats play", /sh-mayor-(talk|cornered)\.png/.test(container.innerHTML));
  const shown = [...new Set(container.innerHTML.match(/sh-[a-z0-9-]+\.(png|jpg)/g) || [])];
  check("the two-shot mounts BOTH speakers' sheets, not just the active one",
    shown.includes("sh-mayor-talk.png") && shown.includes("sh-doreau-talk.png"), shown.join(", "));
  check("the interview plate is the one authored for it",
    shown.includes("sh-interview.jpg"));
  sweep("interview");
  r.unmount(); await sleep(200);
}

console.log("\n=== ENDINGS ===");
for (const sc of story.scenes.filter((s) => s.isEnding)) {
  const r = await boot(sc.id);
  const txt = (container.textContent || "").replace(/\s+/g, " ");
  check('ending "' + sc.title + '" renders', !boundaryTripped() && txt.length > 120);
  const errs = problems.filter(([k]) => k !== "console.warn");
  if (errs.length) { for (const [k, m] of errs.slice(0, 3)) console.log("     . " + k + ": " + String(m).slice(0, 200)); failed = true; }
  problems.length = 0;
  r.unmount(); await sleep(150);
}

console.log("\n=== SLEDGE DOM " + (failed ? "FAILED" : "PASSED") + " ===");
process.exit(failed ? 1 : 0);
