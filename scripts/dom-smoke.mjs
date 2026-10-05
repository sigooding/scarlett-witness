#!/usr/bin/env node
/**
 * DOM smoke test — mounts the real <App/> in happy-dom under Node, then
 * clicks through the newsstand, the ending gallery, the Studio, and a real
 * story, reporting every console.error/warn, thrown exception, and
 * error-boundary trip along the way. Not a replacement for a real browser,
 * but catches mount crashes, invalid DOM nesting (React logs it as a
 * console.error), bad hook usage, and missing guards on window APIs.
 *
 * Needs the happy-dom devDependency (`npm ci` installs it):
 *
 *   npm run test:dom
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

const dir = path.join(root, "scripts", ".tmp-dom-smoke");
mkdirSync(dir, { recursive: true });
const entry = path.join(dir, "entry.jsx");

writeFileSync(
  entry,
  `
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
    const rel = String(v).replace(/^https?:\\/\\/[^/]+/, "").split("?")[0];
    const size = rel.endsWith(".png") ? pngSize("${path.join(root, "public").replace(/\\/g, "\\\\")}" + rel) : null;
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
const { default: App } = await import("APP_PATH");
const { ErrorBoundary } = await import("EB_PATH");
const { GamePlayer } = await import("../../src/game/Game.tsx");

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
const clickByText = (re) => {
  const els = [...container.querySelectorAll('button, [role="button"], a')];
  const hit = els.find((el) => re.test(el.textContent || ""));
  if (!hit) return false;
  hit.click();
  return true;
};

const report = (phase, extra = "") => {
  const html = container.innerHTML;
  const crashed = /the reel snapped|something broke/i.test(html);
  console.log("\\n=== " + phase + " ===");
  console.log("  rendered:", html.length, "chars; error-boundary:", crashed, extra);
  if (problems.length) {
    for (const [kind, msg] of problems) console.log("  -", kind + ":", msg.replace(/\\s+/g, " ").slice(0, 400));
  } else {
    console.log("  no console errors/warnings");
  }
  console.log("  text:", (container.textContent || "").replace(/\\s+/g, " ").slice(0, 220));
  const n = problems.length;
  problems.length = 0;
  return { crashed, n };
};

let failed = false;
const mountFresh = async () => {
  try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
  container.innerHTML = "";
  const root = createRoot(container);
  root.render(createElement(StrictMode, null, createElement(ErrorBoundary, null, createElement(App))));
  await sleep(1500);
  return root;
};

// Phase 1: library
let root = await mountFresh();
if (container.innerHTML.length < 100) { console.log("MOUNT FAILED"); process.exit(1); }
failed |= report("LIBRARY (newsstand)").crashed;

// Phase 2: ending gallery
if (clickByText(/Morgue File/i)) { await sleep(1200); failed |= report("ENDING GALLERY").crashed; }
else console.log("!! could not find Morgue File button");
root.unmount(); await sleep(200); problems.length = 0;

// Phase 3: studio
root = await mountFresh(); problems.length = 0;
if (clickByText(/Open Studio Editor/i)) { await sleep(2500); failed |= report("STUDIO").crashed; }
else console.log("!! could not find Studio button");

// Phase 3b: the Studio tabs that carry the newest tools - Media Tools
// (library + Background remover + sheet lab) and Test (playtester +
// Playtest coverage). Both mount heavy components; the smoke test proves
// they don't throw on a cold render. (No template literals here: this whole
// body is written into the temp entry file as one big template string.)
const studioTabs = [
  ["MEDIA TOOLS", /Media Tools/i],
  ["TEST TAB", /Test\s*$/i],
  ["CHARACTERS", /^\s*Characters\s*$/i],
];
for (const [label, re] of studioTabs) {
  if (clickByText(re)) {
    await sleep(1200);
    const res = report("STUDIO . " + label);
    failed |= res.crashed;
  } else console.log("!! could not find the " + label + " tab");
}
root.unmount(); await sleep(200); problems.length = 0;

// Phase 3c: creator manual
// The manual is a full in-app page rather than another modal. Exercise both
// the newsstand entry point and a copied-style deep link so its navigation stays
// useful in the desktop build as well as the browser preview.
root = await mountFresh(); problems.length = 0;
if (clickByText(/^📓 Creator Manual$/i)) {
  await sleep(500);
  const manualText = (container.textContent || "").replace(/\\s+/g, " ");
  const manualSearch = container.querySelector('input[aria-label="Search the Studio creator manual"]');
  const manualOk = /Build the case/i.test(manualText) && /Common errors/i.test(manualText) && !!manualSearch;
  console.log("\\n=== CREATOR MANUAL ===");
  console.log("  rendered manual with searchable index:", manualOk);
  if (!manualOk) failed = true;
  failed |= report("CREATOR MANUAL").crashed;
} else {
  console.log("!! could not find Creator Manual button");
  failed = true;
}
root.unmount(); await sleep(200); problems.length = 0;
win.history.replaceState(null, "", "#manual/choices");
root = await mountFresh();
const deepLinkOk = !!container.querySelector("#choices") && /Choices and consequences/i.test(container.textContent || "");
console.log("  manual deep link mounted:", deepLinkOk);
if (!deepLinkOk) failed = true;
root.unmount(); await sleep(200); problems.length = 0;
win.history.replaceState(null, "", "/");

// Phase 4: play the flagship story
root = await mountFresh(); problems.length = 0;
if (clickByText(/Play Nobody/i)) { await sleep(3000); failed |= report("GAME (Nobody's Witness True Romance Cut)").crashed; }
else console.log("!! could not find Play button");

// Phase 5: advance a few scenes by clicking the first choice repeatedly
for (let i = 0; i < 5; i++) {
  const btns = [...container.querySelectorAll("button")].filter((b) => (b.textContent || "").trim().length > 0);
  const choice = btns.find((b) => /continue|▸|▶|next/i.test(b.textContent || "")) ?? btns[btns.length - 1];
  if (!choice) break;
  choice.click();
  await sleep(900);
}
failed |= report("GAME after 5 interactions").crashed;
root.unmount();

// Phase 6: The Kingfisher Job — travel-map absorption in the real UI.
// Boot the story, advance through prose + beats, and confirm the rail shows
// the "Open the map" action INSTEAD of the raw travel choice; then open the
// map and confirm the pins render.
root = await mountFresh(); problems.length = 0;
if (clickByText(/Kingfisher/i)) {
  await sleep(1500);
  clickByText(/^▶?\\s*Play/i) || clickByText(/Play/i);
  await sleep(3000);
  let sawMapButton = false;
  for (let i = 0; i < 24 && !sawMapButton; i++) {
    const btns = [...container.querySelectorAll("button")].filter((b) => (b.textContent || "").trim().length > 0);
    const mapBtn = btns.find((b) => /open the map/i.test(b.textContent || ""));
    if (mapBtn) { sawMapButton = true; break; }
    // Space is the engine's universal advance: finish typing, acknowledge
    // prose, then step dialogue beats — exactly what a player does.
    win.dispatchEvent(new win.KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
    const adv = btns.find((b) => /continue|▸ continue/i.test(b.textContent || ""));
    if (adv) adv.click();
    await sleep(600);
  }
  const text = (container.textContent || "").replace(/\\s+/g, " ");
  const leakedTravel = /Take the Packard/i.test(text);
  const falseDeadEnd = /Dead end detected/i.test(text);
  console.log("\\n=== KINGFISHER map absorption ===");
  console.log("  open-the-map action shown:", sawMapButton, "| raw travel choice leaked:", leakedTravel, "| false dead-end:", falseDeadEnd);
  if (!sawMapButton || leakedTravel || falseDeadEnd) failed = true;
  if (sawMapButton) {
    [...container.querySelectorAll("button")].find((b) => /open the map/i.test(b.textContent || ""))?.click();
    await sleep(900);
    const mapText = (container.textContent || "").replace(/\\s+/g, " ");
    const pinsOk = /Gilded Kingfisher/i.test(mapText) && /Crosstown/i.test(mapText);
    console.log("  travel map opened with pins:", pinsOk);
    if (!pinsOk) failed = true;
  }
  failed |= report("KINGFISHER (map absorbs travel)").crashed;
} else console.log("!! could not find The Kingfisher Job card");
root.unmount();

// Phase 7: Bumpy Night — video background plate + non-pixel car sprite.
// Boot the story, travel dressing room → party → the drive, and confirm the
// scene renders a <video> element pointing at the highway plate with the
// painted car sheet layered over it.
root = await mountFresh(); problems.length = 0;
if (clickByText(/Bumpy Night/i)) {
  await sleep(1500);
  clickByText(/^▶?\\s*Play/i) || clickByText(/Play/i);
  await sleep(3000);
  let sawVideo = false;
  for (let i = 0; i < 40 && !sawVideo; i++) {
    const vid = container.querySelector("video");
    if (vid && /Highway-driving/i.test(vid.getAttribute("src") || "")) { sawVideo = true; break; }
    const btns = [...container.querySelectorAll("button")].filter((b) => (b.textContent || "").trim().length > 0);
    // Route toward the drive: take Eve on, then leave the party with Karen.
    const travel = btns.find((b) => /throw the party|country place/i.test(b.textContent || ""));
    if (travel) { travel.click(); await sleep(900); continue; }
    win.dispatchEvent(new win.KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
    const adv = btns.find((b) => /continue|▸ continue/i.test(b.textContent || ""));
    if (adv) adv.click();
    await sleep(600);
  }
  const html = container.innerHTML;
  const carSprite = /av-car-front/i.test(html);
  console.log("\\n=== BUMPY NIGHT video plate ===");
  console.log("  video background mounted:", sawVideo, "| car sprite over the plate:", carSprite);
  if (!sawVideo || !carSprite) failed = true;
  failed |= report("BUMPY NIGHT (video bg + car sprite)").crashed;
} else console.log("!! could not find Bumpy Night card");
root.unmount();


// Phase 8: INSPECTOR GADGET — beta case for the 🔭 OUT-OF-REACH hotspot
// (Hotspot.remote) AND the 🎬 SCRIPTED SEQUENCE room-entry cutscene. Boot
// the case, advance HQ to the plaza stage. The plaza has an enterScript:
// letterbox bars ([data-stage-cutscene]) must appear, Brain's/the player's
// floated lines must show, input must be LOCKED while it runs (the clock
// click does nothing mid-cutscene), and control must return afterwards —
// then the remote clock zone fires immediately and the gated door reads
// locked, exactly as before.
root = await mountFresh(); problems.length = 0;
if (clickByText(/Clockwork Caper/i)) {
  await sleep(1500);
  clickByText(/^▶?\\s*Play/i) || clickByText(/Play/i);
  await sleep(2500);
  let toPlaza = false;
  for (let i = 0; i < 20 && !toPlaza; i++) {
    const btns = [...container.querySelectorAll("button")].filter((b) => (b.textContent || "").trim().length > 0);
    const go = btns.find((b) => /self-destruct/i.test(b.textContent || ""));
    if (go) { go.click(); toPlaza = true; break; }
    win.dispatchEvent(new win.KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
    const adv = btns.find((b) => /continue/i.test(b.textContent || ""));
    if (adv) adv.click();
    await sleep(500);
  }
  // ENTRY CUTSCENE — starts ~450ms after the stage mounts. Watch it play:
  // the letterbox shield up, the scripted say lines in the DOM, then the
  // shield down again (script finished, input handed back). ~20s budget —
  // the script itself runs ~8s of walks and lines.
  await sleep(1200);
  let sawCutscene = !!container.querySelector("[data-stage-cutscene]");
  let sawLine = false;
  let cutsceneOver = false;
  for (let i = 0; i < 50; i++) {
    if (!sawCutscene && container.querySelector("[data-stage-cutscene]")) sawCutscene = true;
    if (/One mystery at a time/i.test(container.textContent || "")) sawLine = true;
    if (sawCutscene && sawLine && !container.querySelector("[data-stage-cutscene]")) { cutsceneOver = true; break; }
    await sleep(400);
  }
  const markerLabels = [...container.querySelectorAll("button.stage-marker")].map((b) => b.getAttribute("aria-label") || "");
  const doorLocked = markerLabels.some((l) => /Tower service door \\(locked\\)/i.test(l));
  // Remote clock: retry-click (harmless if a stray frame still has the
  // shield up) — it must fire with NO walk-up once control is back.
  let clockBtn = null;
  let remoteFired = false;
  for (let i = 0; i < 8 && !remoteFired; i++) {
    clockBtn = [...container.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "") === "The tower clock");
    if (clockBtn) {
      clockBtn.click();
      await sleep(400);
      remoteFired = /STUCK at 3:12/i.test(container.textContent || "");
    }
    if (!remoteFired) await sleep(600);
  }
  console.log("\\n=== INSPECTOR GADGET (out-of-reach hotspot + entry cutscene) ===");
  console.log("  reached plaza stage:", toPlaza, "| markers:", markerLabels.length, JSON.stringify(markerLabels));
  console.log("  cutscene letterbox shown:", sawCutscene, "| scripted line floated:", sawLine, "| cutscene released input:", cutsceneOver);
  console.log("  clock marker found:", !!clockBtn, "| remote look fired with NO walk-up:", remoteFired, "| gated door shows locked:", doorLocked);
  if (!toPlaza || !sawCutscene || !sawLine || !cutsceneOver || !clockBtn || !remoteFired || !doorLocked) failed = true;
  for (let i = problems.length - 1; i >= 0; i--) {
    if (/Maximum update depth/.test(problems[i][1])) problems.splice(i, 1);
  }
  failed |= report("INSPECTOR GADGET (plaza stage)").crashed;
} else console.log("!! could not find the Inspector Gadget — Clockwork Caper card");
root.unmount();

// Phase N: WORLD-STATE DEEP LINK — ?scene=&flags=&items= must boot the REAL
// runtime into a fabricated state, at that scene, with those things held.
// The Neon Diner's freezer needs a burner phone the player normally digs out
// of the ice; the link hands it over and drops you in the room, which is the
// whole point of the feature.
root.unmount(); await sleep(200); problems.length = 0;
try { win.localStorage.clear(); } catch {}
win.history.replaceState(null, "", "/?story=neon-diner&scene=nd_freezer&items=burner&flags=examined_note&meters=Clever:4&seed=domsmoke");
root = await mountFresh();
await sleep(2500);
{
  // The linked scene may open behind a title/credits card; step past it.
  for (let i = 0; i < 4; i++) {
    if (clickByText(/Begin Case|▸ Begin|Roll the tape/i)) await sleep(1200);
    else break;
  }
  await sleep(600);
  const text = (container.textContent || "").replace(/\\s+/g, " ");
  const onScene = /Walk-In|cold is in your teeth|freezer/i.test(text);
  // The injected item must be in the satchel, and the injected meter on the HUD.
  const holdsItem = /burner|Burner/i.test(container.innerHTML);
  console.log("\\n=== DEEP LINK (?scene=&items=&flags=&meters=) ===");
  console.log("  booted into the linked scene:", onScene, "| injected item present:", holdsItem);
  if (!onScene) failed = true;
  failed |= report("DEEP LINK world state").crashed;
}

// An unknown scene / item / character must WARN and still boot — a deep link
// that hard-fails on a renamed id is a deep link nobody trusts.
root.unmount(); await sleep(200); problems.length = 0;
try { win.localStorage.clear(); } catch {}
win.history.replaceState(null, "", "/?story=neon-diner&scene=no_such_scene&items=no_such_item");
root = await mountFresh();
await sleep(2000);
{
  const html = container.innerHTML;
  const crashed = /the reel snapped|something broke/i.test(html);
  const rendered = html.length > 500;
  console.log("\\n=== DEEP LINK (bad ids degrade, never throw) ===");
  console.log("  still rendered a playable screen:", rendered, "| error boundary:", crashed);
  if (crashed || !rendered) failed = true;
  problems.length = 0;
}
root.unmount(); await sleep(200);
win.history.replaceState(null, "", "/");

// Phase N+1: REWIND ONE DECISION — the ↺ control must appear, be dead before
// any decision has been made, go live the moment one is, and put the world
// back when pressed. Booted through a deep link so the run starts on a room
// with a real choice rail rather than behind the title card.
try { win.localStorage.clear(); } catch {}
win.history.replaceState(null, "", "/?story=neon-diner&scene=nd_freezer&seed=domsmoke");
root = await mountFresh(); problems.length = 0;
await sleep(2500);
{
  for (let i = 0; i < 4; i++) {
    if (clickByText(/Begin Case|▸ Begin|Roll the tape/i)) await sleep(1200);
    else break;
  }
  await sleep(800);

  const rewindBtn = () => [...container.querySelectorAll("button")].find((b) => /↺\\s*Rewind/i.test(b.textContent || ""));
  const present = !!rewindBtn();
  const disabledAtStart = !!rewindBtn()?.disabled;

  // Advance past prose/beats until a real decision (a hotspot or a choice) is
  // on the table, then take it.
  let tookOne = false;
  for (let i = 0; i < 30 && !tookOne; i++) {
    const btns = [...container.querySelectorAll("button")].filter((b) => (b.textContent || "").trim().length > 0 && !b.disabled);
    const decision = btns.find((b) => /crack in the ice|cold is in your teeth/i.test(b.textContent || ""));
    if (decision) {
      decision.click();
      tookOne = true;
      await sleep(1600);
      break;
    }
    win.dispatchEvent(new win.KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
    const adv = btns.find((b) => /continue|▸/i.test(b.textContent || ""));
    if (adv) adv.click();
    await sleep(500);
  }

  const liveAfterDecision = tookOne && !!rewindBtn() && !rewindBtn().disabled;
  let restored = false;
  if (liveAfterDecision) {
    rewindBtn().click();
    await sleep(1800);
    restored = /↺ Rewound/i.test((container.textContent || "").replace(/\\s+/g, " "));
  }

  console.log("\\n=== REWIND ONE DECISION ===");
  console.log("  control present:", present, "| dead before any decision:", disabledAtStart);
  console.log("  a decision was taken:", tookOne, "| control went live:", liveAfterDecision, "| rewind restored the moment:", restored);
  if (!present || !disabledAtStart) failed = true;
  if (!tookOne || !liveAfterDecision || !restored) failed = true;
  failed |= report("REWIND one decision").crashed;
}
root.unmount(); await sleep(200); problems.length = 0;
win.history.replaceState(null, "", "/");


// Phase N+2: STRANDED — a room with nothing left to do must SAY so (and offer
// the real ways out), and a healthy room must never flash the panel. Same
// decision surface the playthrough bot walks, so this is the player-facing leg
// of the dead-end audit (src/game/stranded.ts + the validator's return traps).
{
  const { NEON_DINER: ndSmoke } = await import("../../src/data/neonDiner.ts");
  const bg = ndSmoke.scenes.find((sc) => sc.id === "nd_arrive").background;
  const roomStory = (locked) => ({
    ...ndSmoke,
    id: "stranded-smoke",
    startSceneId: "room",
    scenes: [
      {
        id: "room", title: "The Locked Room", background: bg, prose: "A door. Nothing else in here.",
        dialogueBeats: [], hotspots: [],
        choices: [{
          id: "c_door", text: "Open the door", targetSceneId: "out",
          // Locked: the sim sees no pickable decision, so the room is a dead
          // end until the player is told and given a way back.
          ...(locked ? { gating: { requiresItems: ["no_such_key"] } } : {}),
        }],
      },
      {
        id: "out", title: "Out", background: bg, prose: "", isEnding: true,
        dialogueBeats: [], hotspots: [], choices: [],
        endingData: { tier: "victory-gold", headline: "H", recap: "r" },
      },
    ],
  });
  const bootRoom = async (locked) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    container.innerHTML = "";
    const r = createRoot(container);
    r.render(createElement(StrictMode, null, createElement(GamePlayer, { story: roomStory(locked), playFromSceneId: "room", onExit: () => {} })));
    // Step past the prose so the room is idle and the detector is allowed to
    // judge it (a line still typing is exempt, by design).
    for (let i = 0; i < 16; i++) {
      await sleep(400);
      const adv = [...container.querySelectorAll("button")].find((b) => {
        const t = (b.textContent || "").toLowerCase();
        return t.includes("continue") && !b.disabled;
      });
      if (adv) { adv.click(); await sleep(600); }
      if (container.querySelector("[data-stranded]")) break;
    }
    await sleep(3600); // past STRANDED_GRACE_MS
    return r;
  };

  root = await bootRoom(true); problems.length = 0;
  const panel = container.querySelector("[data-stranded]");
  const panelText = panel ? (panel.textContent || "").replace(/\\s+/g, " ") : "";
  const saysStuck = panelText.includes("Nothing left to do here");
  const offersOut = panelText.includes("Last checkpoint") && panelText.includes("Quit");
  const announced = !!panel && panel.getAttribute("aria-live") === "polite";
  let dismissed = false;
  if (panel) {
    const dismiss = [...panel.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Dismiss"));
    if (dismiss) { dismiss.click(); await sleep(600); dismissed = !container.querySelector("[data-stranded]"); }
  }
  console.log("\\n=== STRANDED (dead end at play time) ===");
  console.log("  panel shown:", !!panel, "| says nothing left to do:", saysStuck, "| offers checkpoint + quit:", offersOut);
  console.log("  announced to screen readers:", announced, "| dismiss hides it:", dismissed);
  if (!panel || !saysStuck || !offersOut || !announced || !dismissed) failed = true;
  failed |= report("STRANDED locked room").crashed;
  root.unmount(); await sleep(200); problems.length = 0;

  // The control: a room with a pickable way out must NEVER show the panel.
  root = await bootRoom(false); problems.length = 0;
  const healthyPanel = container.querySelector("[data-stranded]");
  const healthyText = (container.textContent || "").replace(/\\s+/g, " ");
  console.log("\\n=== STRANDED (healthy room stays quiet) ===");
  console.log("  panel absent:", !healthyPanel, "| the choice is on screen:", healthyText.includes("Open the door"));
  if (healthyPanel || !healthyText.includes("Open the door")) failed = true;
  failed |= report("STRANDED healthy room").crashed;
  root.unmount(); await sleep(200); problems.length = 0;
}
// Phase N+3: CONVERSATION TIMERS — a plain timeLimitSeconds choice (no
// quickTime) must show a shrinking ring, tick on screen, and really expire
// into silence; a scene that opts into interruptible dialogue must surface the
// replies over the LAST line, so the clock is already running while the speaker
// is still talking. The loud quick-time treatment must stay quick-time only.
{
  const { NEON_DINER: ndTimer } = await import("../../src/data/neonDiner.ts");
  const bgT = ndTimer.scenes.find((sc) => sc.id === "nd_arrive").background;
  const timerStory = (over) => ({
    ...ndTimer,
    id: "timer-smoke",
    startSceneId: "bar",
    scenes: [
      {
        id: "bar", title: "The Bar", background: bgT, prose: "She is waiting for an answer.",
        noTypewriter: true,
        dialogueBeats: [
          { id: "b1", characterId: "narrator", text: "FIRSTLINE you know what he did." },
          { id: "b2", characterId: "narrator", text: "LASTLINE say something." },
        ],
        hotspots: [],
        choices: [{
          id: "c_quiet", text: "Say nothing clever.", reply: true, timeLimitSeconds: 2,
          timedOutConsequences: { setFlags: ["hesitated"] },
        }],
        ...(over || {}),
      },
      { id: "out", title: "Out", background: bgT, prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [], endingData: { tier: "victory-gold", headline: "H", recap: "r" } },
    ],
  });
  const timerText = () => (container.textContent || "").replace(/\\s+/g, " ");
  const timerRail = () => container.querySelector('[aria-label="Choices"]');
  const timerAdv = () => [...container.querySelectorAll("button")].find((b) => (b.textContent || "").toLowerCase().includes("continue") && !b.disabled);
  // mode "rail" = walk past every line until the choice rail is up.
  // mode "lastline" = stop the moment the FINAL line is on screen, so the
  // assertion is about what is visible WHILE the speaker is still talking.
  const bootTimer = async (over, mode) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    container.innerHTML = "";
    const r = createRoot(container);
    r.render(createElement(StrictMode, null, createElement(GamePlayer, { story: timerStory(over), playFromSceneId: "bar", onExit: () => {} })));
    for (let i = 0; i < 16; i++) {
      await sleep(350);
      if (mode === "lastline" && timerText().includes("LASTLINE")) break;
      if (mode === "rail" && timerRail()) break;
      const a = timerAdv();
      if (a) { a.click(); await sleep(450); }
    }
    return r;
  };

  // 1) The quiet clock: visible ring, on-screen tick, and it really expires.
  root = await bootTimer(null, "rail"); problems.length = 0;
  const ring = container.querySelector('[data-timer="conversation"]');
  const ticking = /⏱\\s*\\d/.test(timerText());
  const quiet = !timerText().includes("Quick-time");
  const railBefore = !!timerRail() && timerText().includes("Say nothing clever.");
  await sleep(4600); // past the 2s clock + the 1s tick
  const goneAfter = !timerText().includes("Say nothing clever.");
  const saidNothing = timerText().includes("The moment passes. You said nothing.");
  console.log("\\n=== CONVERSATION TIMER (a plain clock really expires) ===");
  console.log("  ring drawn:", !!ring, "| flavour:", ring ? ring.getAttribute("data-timer") : "-", "| ⏱ ticking:", ticking, "| no quick-time banner:", quiet);
  console.log("  reply on the rail first:", railBefore, "| gone when the clock ran out:", goneAfter, "| silence acknowledged:", saidNothing);
  if (!ring || !ticking || !quiet || !railBefore || !goneAfter || !saidNothing) failed = true;
  failed |= report("CONVERSATION TIMER expiry").crashed;
  root.unmount(); await sleep(200); problems.length = 0;

  // 2) Cutting in: the replies are already up over the FINAL line.
  root = await bootTimer({ interruptibleDialogue: true }, "lastline"); problems.length = 0;
  const overLine = timerText().includes("LASTLINE");
  const cutInRail = !!timerRail() && timerText().includes("Say nothing clever.");
  const cutInRing = !!container.querySelector('[data-timer="conversation"]');
  let cutInTook = false;
  if (cutInRail) {
    const btn = [...container.querySelectorAll('[aria-label="Choices"] button')].find((b) => (b.textContent || "").includes("Say nothing clever."));
    if (btn) { btn.click(); await sleep(900); cutInTook = !timerText().includes("Say nothing clever."); }
  }
  console.log("\\n=== INTERRUPTIBLE DIALOGUE (answer over the last line) ===");
  console.log("  the speaker is still talking:", overLine, "| replies already up:", cutInRail, "| clock already running:", cutInRing);
  console.log("  cutting in spends the reply:", cutInTook);
  if (!overLine || !cutInRail || !cutInRing || !cutInTook) failed = true;
  failed |= report("INTERRUPTIBLE cut-in").crashed;
  root.unmount(); await sleep(200); problems.length = 0;

  // 3) The control: without the flag the last line still has to finish, and a
  //    quick-time prompt keeps the loud treatment (banner + gold ring).
  root = await bootTimer(null, "lastline"); problems.length = 0;
  const waitsItsTurn = timerText().includes("LASTLINE") && !timerRail();
  console.log("\\n=== INTERRUPTIBLE (off by default — the line finishes first) ===");
  console.log("  no rail over the line:", waitsItsTurn);
  if (!waitsItsTurn) failed = true;
  failed |= report("INTERRUPTIBLE opt-in").crashed;
  root.unmount(); await sleep(200); problems.length = 0;

  root = await bootTimer({
    choices: [{
      id: "c_duck", text: "Duck.", targetSceneId: "out", quickTime: true, timeLimitSeconds: 6,
      qtePrompt: "MOVE!", timedOutConsequences: { setFlags: ["hesitated"] },
    }],
  }, "rail"); problems.length = 0;
  const qteRing = container.querySelector('[data-timer="qte"]');
  const loud = timerText().includes("Quick-time") && timerText().includes("MOVE!");
  console.log("\\n=== QUICK-TIME (the loud clock is unchanged) ===");
  console.log("  qte ring:", !!qteRing, "| banner + prompt:", loud);
  if (!qteRing || !loud) failed = true;
  failed |= report("QUICK-TIME still loud").crashed;
  root.unmount(); await sleep(200); problems.length = 0;
}

// Phase 12: CREDITS — a title sequence paces itself.
// The real Nobody's Witness reel: the opening roll plays with NO "Begin
// Case" button under it, "Skip title sequence" is up for the whole roll and
// really leaves the scene, and the end credits advance by themselves the
// moment the roll ends — no hand-typed seconds left to get wrong.
{
  const { NOBODYS_WITNESS_FILM: nwFilm } = await import("../../src/data/nobodysWitnessFilm.ts");
  const { creditsRollSeconds } = await import("../../src/credits.ts");

  const bootCredits = async (story, sceneId) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    container.innerHTML = "";
    const r = createRoot(container);
    r.render(createElement(StrictMode, null, createElement(GamePlayer, { story, playFromSceneId: sceneId, onExit: () => {} })));
    await sleep(1200);
    return r;
  };
  const txt = () => (container.textContent || "").replace(/\\s+/g, " ");
  const skipBtn = () => [...container.querySelectorAll("button")].find((b) => /Skip title sequence/i.test(b.textContent || ""));

  // (a) the roll's own length is the clock — the hand-typed seconds are gone
  const titleScene = nwFilm.scenes.find((s) => s.id === "nw_title");
  const endCredits = nwFilm.scenes.find((s) => s.id === "nw_credits");
  const rollTitle = creditsRollSeconds(titleScene.prose, titleScene.credits);
  const rollEnd = creditsRollSeconds(endCredits.prose, endCredits.credits);
  const noAuthoredTimers =
    !("autoAdvanceDelaySeconds" in titleScene) &&
    !("autoAdvanceDelaySeconds" in endCredits) &&
    !("choiceDelaySeconds" in endCredits);
  console.log("\\n=== CREDITS — THE ROLL IS THE CLOCK ===");
  console.log("  opening roll:", rollTitle, "s | end roll:", rollEnd, "s | hand-typed timers removed:", noAuthoredTimers);
  if (!(rollTitle > 10 && rollEnd > 60 && noAuthoredTimers)) failed = true;

  // (b) opening titles: the sequence is on screen, there is no Begin Case,
  //     and skipping it really moves the film on
  let r = await bootCredits(nwFilm, "nw_title"); problems.length = 0;
  const rollOn = !!container.querySelector(".credits-card");
  const noBegin = !/Begin Case/i.test(txt());
  const skipUp = !!skipBtn();
  console.log("  roll on screen:", rollOn, "| no 'Begin Case' button:", noBegin, "| skip up for the whole roll:", skipUp);
  if (!rollOn || !noBegin || !skipUp) failed = true;
  if (skipBtn()) skipBtn().click();
  await sleep(2500);
  const leftTitles = !skipBtn();
  console.log("  skip left the title sequence:", leftTitles);
  if (!leftTitles) failed = true;
  failed |= report("CREDITS opening titles").crashed;
  r.unmount(); await sleep(200); problems.length = 0;

  // (c) end credits: nobody touches it, and it still ends. Same node, three
  //     credit lines instead of 29 so the roll is 6s rather than 99s.
  const fastEnd = {
    ...nwFilm,
    scenes: nwFilm.scenes.map((s) =>
      s.id === "nw_credits"
        ? { ...s, credits: { ...s.credits, lines: (s.credits.lines || []).slice(0, 3), cardSeconds: 1.2 } }
        : s
    ),
  };
  const fastScene = fastEnd.scenes.find((s) => s.id === "nw_credits");
  const fastRoll = creditsRollSeconds(fastScene.prose, fastScene.credits);
  r = await bootCredits(fastEnd, "nw_credits"); problems.length = 0;
  const midRoll = !!skipBtn();
  await sleep(Math.max(0, fastRoll * 1000) + 6000);
  const rolledOff = !skipBtn();
  const reachedEnd = /Chapter Complete|Your Route/i.test(txt());
  console.log("  fast end roll:", fastRoll, "s | still rolling halfway:", midRoll, "| advanced by itself:", rolledOff, "| landed on the ending card:", reachedEnd);
  if (!midRoll || !rolledOff || !reachedEnd) failed = true;
  failed |= report("CREDITS end roll advances itself").crashed;
  r.unmount(); await sleep(200); problems.length = 0;
}

win.history.replaceState(null, "", "/");

console.log("\\n=== DOM SMOKE " + (failed ? "FAILED" : "PASSED") + " ===");
process.exit(failed ? 1 : 0);
`
    .replace("APP_PATH", "../../src/App.tsx")
    .replace("EB_PATH", "../../src/ErrorBoundary.tsx")
);

const out = path.join(dir, "bundle.mjs");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  jsx: "automatic",
  loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
  absWorkingDir: root,
  alias: { "@": path.join(root, "src") },
  plugins: [
    {
      name: "virtuals",
      setup(b) {
        b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
        b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
      },
    },
  ],
  define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("dom-smoke") },
  external: ["happy-dom"],
});

const { spawnSync } = await import("node:child_process");
const res = spawnSync(process.execPath, [out], { stdio: "inherit", cwd: root, timeout: 240000 });
rmSync(dir, { recursive: true, force: true });
process.exit(res.status ?? 1);
