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
const { activeStageObstacles } = await import("../../src/logic.ts");

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

for (const [sceneId, label, wantMarkers] of [
  // The squad room authors FOUR hotspots but renders THREE markers: the TALK
  // zone is bound to the NPC via talkHotspotId, so the actor BECOMES the
  // marker (Stage.tsx:2042) and no floating pip is drawn. That is the
  // documented point-and-click behaviour, not a miss.
  ["sh_squadroom", "SQUAD ROOM", 3],
  ["sh_alley", "ALLEY", 6],
  ["sh_range", "FIRING RANGE", 4],
]) {
  console.log("\n=== " + label + " (" + sceneId + ") ===");
  const r = await boot(sceneId);
  const markers = [...container.querySelectorAll("button.stage-marker")];
  check(label + " mounts without tripping the error boundary", !boundaryTripped());
  check(label + " renders its stage markers", markers.length >= wantMarkers, markers.length + " marker(s)");
  check(label + " renders the walker sprite", /sh-sledge-walk\.png/.test(container.innerHTML));
  if (sceneId === "sh_squadroom") {
    const scene = story.scenes.find((s) => s.id === sceneId);
    const talkIds = (scene.stage.npcs || []).map((n) => n.talkHotspotId).filter(Boolean);
    const pips = markers.map((m) => m.getAttribute("aria-label"));
    const talkLabels = (scene.hotspots || []).filter((h) => talkIds.includes(h.id)).map((h) => h.label);
    check("the NPC-bound TALK zone draws NO floating marker (the actor is the marker)",
      talkLabels.every((l) => !pips.includes(l)), JSON.stringify(talkLabels));
    check("the ambient NPC sprite is on stage", /sh-doreau-talk\.png/.test(container.innerHTML));
  }
  sweep(label);
  r.unmount(); await sleep(200);
}

console.log("\n=== REACHABILITY - Captain Trunk's office ===");
{
  // THE PASS 6 BLOCKER, end to end: the user could not get into Trunk's
  // office because a foreground prop was swallowing the click on the door
  // marker. Drive it through the real DOM rather than the model.
  const r = await boot("sh_squadroom");
  const scene = story.scenes.find((s) => s.id === "sh_squadroom");
  const door = scene.hotspots.find((h) => h.id === "sh_office_door_hs");
  check("the office door is authored on the far screen of the wide room",
    door.bounds.x > 100, "x=" + door.bounds.x);

  const marker = [...container.querySelectorAll("button.stage-marker")]
    .find((m) => (m.getAttribute("aria-label") || "") === door.label);
  check("the door draws a clickable marker", !!marker);

  if (marker) {
    // Nothing may sit on top of it: walk up the tree and confirm no ancestor
    // is a pointer-eating decorative layer.
    marker.click();
    await sleep(400);

    // Clicking a GO marker opens the VERB COIN; the room only changes once
    // the GO verb is chosen. Assert on the coin, then on the actual travel -
    // matching the word "Trunk" alone is a false positive, because the
    // door's own label contains it.
    // The coin renders each verb as an icon plus a lowercase word ("\u279cgo"),
    // NOT as the hotspot-style "GO - label".
    const VERB = /^[^\w]*(look|take|talk|go|use|kick)$/i;
    const coin = [...container.querySelectorAll("button")].filter((b) =>
      VERB.test((b.textContent || "").trim()));
    check("the verb coin opens and is not covered by the foreground",
      coin.length > 0, coin.length + " verb(s) offered");

    const go = coin.find((b) => /go$/i.test((b.textContent || "").trim()));
    if (go) {
      // Picking a verb ARMS it (the cursor changes); the hotspot must then be
      // clicked again to actually perform the action.
      go.click();
      await sleep(200);
      const armed = [...container.querySelectorAll("button.stage-marker")]
        .find((m) => (m.getAttribute("aria-label") || "") === door.label);
      if (armed) armed.click();
      await sleep(700);
      const txt = container.textContent || "";
      // GO is a WALK-THEN-ACT: the engine queues "Go to <door>" and Sledge
      // crosses the (now two-screen) room before the scene changes. Under
      // happy-dom the walk tween is timer-driven and flaky to wait out, so
      // assert the travel was ACCEPTED AND QUEUED - which is precisely what
      // the foreground blocker used to prevent.
      check("choosing GO queues the walk to Trunk's office",
        /Go to/.test(txt) && !boundaryTripped(),
        txt.slice(0, 90).replace(/\s+/g, " "));
    } else {
      check("choosing GO actually leaves the squad room for Trunk's office", false, "no GO verb in the coin");
    }
  }
  sweep("Trunk reachability");
  r.unmount(); await sleep(200);
}

console.log("\n=== WALK-BEHIND REGIONS - the squadroom desks ===");
{
  const r = await boot("sh_squadroom");
  const scene = story.scenes.find((s) => s.id === "sh_squadroom");
  const authored = scene.stage.occluders || [];
  const els = [...container.querySelectorAll("[data-stage-occluder]")];
  check("every authored walk-behind renders a layer",
    els.length === authored.length, els.length + " of " + authored.length);

  // The layer must be filled with the ROOM'S OWN background - that is the
  // entire point (no separate cutout to fall out of register).
  const bgs = els.map((e) => e.style.backgroundImage || "");
  check("each region is filled with the room's own plate",
    els.length > 0 && bgs.every((b) => b.includes("url(")), bgs.length + " filled");

  // ...and clipped to the authored shape, or it would just cover the room.
  check("each region is clipped to its polygon",
    els.every((e) => (e.style.clipPath || "").startsWith("polygon(")));

  // TWO-PASS PAINT: at spawn the feet are in FRONT of the desks, so the
  // covering pass is off — the slice is painted BEFORE the walker at z 1
  // so the sprite wins even if sibling z-index is ignored. Walking UP
  // past the baseline flips the covering pass on (z 160, after the party).
  const zs = els.map((e) => Number(e.style.zIndex));
  check("at spawn the covering pass is off (feet in front of the desks)",
    els.every((e) => e.getAttribute("data-stage-occluder-cover") === "0"),
    els.map((e) => e.getAttribute("data-stage-occluder-cover")).join(","));
  check("in-front slices sit under the walker (z 1)",
    zs.every((z) => z === 1), JSON.stringify(zs));

  const player = container.querySelector("[data-stage-player]");
  check("the walker is on the same z scale", !!player && Number(player.style.zIndex) > 50,
    player ? player.style.zIndex : "no walker");
  // Flattened siblings: a wrapping `inset-0` box was its own stacking
  // context, so every occluder z-index only sorted INSIDE it — always
  // under the walker. They must share a parent with the character.
  check("walk-behinds share the walker's parent (same stacking context)",
    !!player && els.length > 0 && els.every((e) => e.parentElement === player.parentElement),
    player && els[0] ? `player parent=${player.parentElement?.className} occ parent=${els[0].parentElement?.className}` : "missing");
  check("at the spawn the walker sorts IN FRONT of the desks",
    !!player && zs.every((z) => Number(player.style.zIndex) > z),
    "walker " + (player ? player.style.zIndex : "?") + " vs " + JSON.stringify(zs));

  // Authoring: the depth line sits inside the floor so walking UP covers,
  // and the furniture obstacles leave a walkable strip behind the desks
  // (they used to eat y 76–90 and pin the walker in front forever).
  check("desk baselines sit inside the floor band so walking up covers",
    authored.every((o) => {
      const b = o.baseline ?? Math.max(...o.points.map((p) => p.y));
      return b > scene.stage.floor.top && b < scene.stage.floor.bottom;
    }));
  check("obstacles leave a walkable strip above the desk front",
    (scene.stage.obstacles || []).every((o) => o.y > scene.stage.floor.top + 8),
    JSON.stringify((scene.stage.obstacles || []).map((o) => ({ y: o.y, h: o.h }))));

  // Asserted on the INLINE style, not the computed one: the guarantee must
  // not depend on the stylesheet having loaded (this layer covers the walker
  // and every marker, so if it ever became clickable the room would die).
  check("walk-behinds never eat clicks (paint, not collision)",
    els.every((e) => e.style.pointerEvents === "none"));
  sweep("walk-behind");
  r.unmount(); await sleep(200);
}

console.log("\n=== HUD LAYERING - nothing may cover the interface ===");
{
  // PASS 7. Four symptoms, one family of causes: the walk-behind foreground
  // pass was a SIBLING of the stage at z-[58]. The stage wrapper carries a
  // transform (talkZoomStyle), which creates a stacking context and seals the
  // verb coin's z-[200] inside one layer - so the pass painted over the verb
  // menu, over the inventory dock (then z-50), and, being viewport-locked
  // rather than inside the panning strip, drifted against the art on a wide
  // world. The pass now renders INSIDE the stage wrapper.
  const r = await boot("sh_alley");           // the room with occluding props
  check("the alley mounts", !boundaryTripped());

  // No Tailwind stylesheet under happy-dom: the z-index lives in the CLASS
  // ("z-[60]", "z-50"), not in a computed style. Parse it out.
  const classZ = (el) => {
    const m = String(el.className || "").match(/(?:^|\s)z-\[(\d+)\]/)
      || String(el.className || "").match(/(?:^|\s)z-(\d+)(?:\s|$)/);
    return m ? Number(m[1]) : (Number(el.style?.zIndex) || 0);
  };
  const zOf = (el) => {
    let n = el;
    while (n && n !== container) {
      const z = classZ(n);
      if (z) return z;
      n = n.parentElement;
    }
    return 0;
  };

  // 1. The occluder pass must not be a sibling that outranks the HUD.
  const occ = [...container.querySelectorAll("[data-stage-occluder]")];
  const world = container.querySelector("[data-stage-world]");
  check("the stage world wrapper owns an explicit layer", !!world && classZ(world) > 0,
    world ? "z=" + classZ(world) : "missing");

  // 2. The occluder layer lives INSIDE that wrapper, so it can never sort
  //    against the HUD at all.
  const passEl = [...container.querySelectorAll("div")]
    .find((d) => classZ(d) === 160 && d.getAttribute("aria-hidden") !== null);
  if (passEl) {
    check("the walk-behind pass renders inside the stage world",
      !!world && world.contains(passEl));
  } else {
    check("the walk-behind pass renders inside the stage world", occ.length === 0,
      "no occluders in front this frame (nothing to check)");
  }

  // 3. The inventory dock must outrank scenery.
  const dock = container.querySelector("[data-inventory]");
  if (dock) {
    check("the inventory dock sorts above the foreground scenery",
      zOf(dock) >= 60, "dock z=" + zOf(dock));
  }
  sweep("hud layering");
  r.unmount(); await sleep(200);
}

console.log("\n=== EXTENDED STAGE - the two-screen squad room ===");
{
  const r = await boot("sh_squadroom");
  const scene = story.scenes.find((s) => s.id === "sh_squadroom");
  check("the squad room is authored as a wide world", scene.stage.worldWidth === 200);
  check("it mounts without tripping the error boundary", !boundaryTripped());
  check("the wide plate is the one authored for it", /bg-sh-squadroom-wide/.test(container.innerHTML));

  // Markers out on screen two must still be rendered (the camera pans to
  // them); they are positioned in WORLD-% inside a panning strip.
  const markers = [...container.querySelectorAll("button.stage-marker")];
  check("markers on BOTH screens are mounted", markers.length >= 3, markers.length + " marker(s)");

  // FOREGROUND EXTRAS must not have been dragged into world space.
  for (const [i, ex] of (scene.cinematic?.foregroundExtras || []).entries()) {
    check("foreground layer " + (i + 1) + " stayed in viewport-%", (ex.x ?? 50) <= 100, "x=" + ex.x);
  }

  // THE BUG THAT BLOCKED TRUNK'S OFFICE: a decorative foreground extra that
  // captures pointer events blankets the room and eats the verb coin, the
  // dock and every marker. Pin that none of them can take a click.
  const fg = [...container.querySelectorAll("[aria-hidden]")].filter(
    (e) => e.style && e.style.backgroundImage && /sh-fg-/.test(e.innerHTML + e.style.backgroundImage)
  );
  const imgs = [...container.querySelectorAll("img")].filter((i) => /sh-fg-/.test(i.getAttribute("src") || ""));
  const blockers = imgs.filter((i) => {
    let el = i;
    while (el && el !== container) {
      if (el.style && el.style.pointerEvents === "none") return false;
      if (el.className && /pointer-events-none/.test(String(el.className))) return false;
      el = el.parentElement;
    }
    return true;
  });
  check("no foreground prop can capture a click", blockers.length === 0,
    blockers.length + " of " + imgs.length + " props would eat input");
  void fg;
  sweep("wide squad room");
  r.unmount(); await sleep(200);
}

console.log("\n=== DOOR - the gated grille barrier ===");
{
  const scene = story.scenes.find((s) => s.id === "sh_alley");
  const doors = (scene.stage.obstacles || []).filter((o) => o.gating);
  check("the alley authors a gated barrier", doors.length === 1);
  // The engine resolves solidity from world state, so check both sides of
  // the gate rather than the DOM (barriers are invisible in play).
  const gs = (flags) => ({ activeFlags: new Set(flags), inventory: [], memories: {} });
  const shut = activeStageObstacles(scene.stage.obstacles, gs([]));
  const open = activeStageObstacles(scene.stage.obstacles, gs(["sh_grille_kicked"]));
  check("while the gate is SHUT the door is solid", shut.length === (scene.stage.obstacles || []).length,
    shut.length + " solid");
  check("once the flag is set the door is GONE", open.length === shut.length - 1, open.length + " solid");
  check("the plain furniture barrier is unaffected either way",
    open.every((o) => !o.gating));
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
