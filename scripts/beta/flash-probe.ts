/**
 * FLASH PROBE — mounts the real <GamePlayer> with the South Park story in
 * happy-dom and watches the NPC actor elements: presence, positions, and
 * DOM churn (removals / re-adds) over several seconds of patrol time.
 * Diagnoses "NPCs keep flashing on and off".
 */
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
  if ((win as Record<string, unknown>)[key] === undefined) continue;
  try { (globalThis as Record<string, unknown>)[key] = win[key]; }
  catch { try { Object.defineProperty(globalThis, key, { value: (win as Record<string, unknown>)[key], configurable: true }); } catch { /* skip */ } }
}
globalThis.window = win as unknown as Window & typeof globalThis;
win.matchMedia = win.matchMedia?.bind(win) ?? ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
globalThis.matchMedia = win.matchMedia;

class EagerImage {
  naturalWidth = 512;
  naturalHeight = 512;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  set src(v: string) { this._src = v; queueMicrotask(() => this.onload && this.onload()); }
  get src() { return this._src; }
  addEventListener(t: string, fn: () => void) { if (t === "load") this.onload = fn; }
  removeEventListener() {}
}
(globalThis as Record<string, unknown>).Image = EagerImage;
(win as unknown as { Image: unknown }).Image = EagerImage;

const errors: string[] = [];
const realErr = console.error;
console.error = (...a: unknown[]) => { errors.push(a.map(String).join(" ").slice(0, 200)); };
process.on("uncaughtException", (e) => errors.push("uncaught " + String(e).slice(0, 300)));

const { StrictMode, createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { GamePlayer } = await import("../../src/game/Game");
const { ErrorBoundary } = await import("../../src/ErrorBoundary");
const { SOUTH_PARK } = await import("../../src/data/southPark");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const container = doc.getElementById("root")!;
let rootR: ReturnType<typeof createRoot> | null = null;
const mountFrom = async (sceneId?: string) => {
  try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
  rootR?.unmount();
  container.innerHTML = "";
  rootR = createRoot(container);
  rootR.render(
    createElement(StrictMode, null,
      createElement(ErrorBoundary, null, createElement(GamePlayer as never, {
        story: SOUTH_PARK, onExit: () => {}, typeSpeed: 34,
        ...(sceneId ? { playFromSceneId: sceneId } : {}),
      } as never)))
  );
  await sleep(1500);
};

await mountFrom();

const q = (sel: string) => container.querySelector(sel);
const qa = (sel: string) => [...container.querySelectorAll(sel)];
let mo: { observe: (t: Element, o: object) => void; disconnect: () => void } | null = null;
let removals = 0;
let additions = 0;
const seen = new Set<string>();
const watch = () => {
  removals = 0; additions = 0; seen.clear();
  mo?.disconnect();
  mo = new (globalThis as unknown as { MutationObserver: new (cb: (muts: MutationRecord[]) => void) => { observe: (t: Element, o: object) => void; disconnect: () => void } }).MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of Array.from(m.removedNodes)) {
        const el = n as HTMLElement;
        if (el.nodeType === 1 && (el.matches?.("[data-npc-id]") || el.querySelector?.("[data-npc-id]"))) {
          removals++;
          const npcEl = el.matches?.("[data-npc-id]") ? el : (el.querySelector("[data-npc-id]") as HTMLElement);
          seen.add("removed:" + (npcEl?.getAttribute("data-npc-id") ?? "?") + (el.matches?.("[data-npc-id]") ? "" : " (ancestor)"));
        }
      }
      for (const n of Array.from(m.addedNodes)) {
        const el = n as HTMLElement;
        if (el.nodeType === 1 && (el.matches?.("[data-npc-id]") || el.querySelector?.("[data-npc-id]"))) {
          additions++;
          const npcEl = el.matches?.("[data-npc-id]") ? el : (el.querySelector("[data-npc-id]") as HTMLElement);
          seen.add("added:" + (npcEl?.getAttribute("data-npc-id") ?? "?") + (el.matches?.("[data-npc-id]") ? "" : " (ancestor)"));
        }
      }
    }
  });
  mo.observe(container, { childList: true, subtree: true });
};
const report = (label: string) => {
  console.log("=== " + label + " ===");
  console.log("actor-removals:", removals, "actor-additions:", additions, seen.size ? "events: " + [...seen].slice(0, 12).join(" | ") : "");
  console.log("errors:", errors.length ? errors.slice(0, 6).join(" || ") : "none");
  errors.length = 0;
};


const posOf = (id: string) => {
  const el = q(`[data-npc-id="${id}"]`) as HTMLElement | null;
  return el ? `${el.style.left}/${el.style.top}` : null;
};

// ---- scenario 1: bus stop, then a conversation with Cartman (freeze path)
{
  const ids = ["sp_cartman_npc", "sp_kyle_npc"];
  watch();
  console.log("=== bus stop t0 ===", ids.map((id) => `${id}=${posOf(id)}`).join("  "));
  const samples: string[] = [];
  for (let t = 0; t < 12; t++) { await sleep(250); samples.push(ids.map((id) => (q(`[data-npc-id="${id}"]`) ? posOf(id) : "GONE")).join("|")); }
  console.log(samples.join("\n"));
  // walk to Cartman and talk (click the linked NPC actor)
  const cart = q('[data-npc-id="sp_cartman_npc"]') as HTMLElement;
  cart?.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  for (let i = 0; i < 40 && qa(".stage-marker[disabled]").length === 0; i++) await sleep(250);
  const during: string[] = [];
  for (let t = 0; t < 12; t++) { await sleep(250); during.push(ids.map((id) => (q(`[data-npc-id="${id}"]`) ? posOf(id) : "GONE")).join("|")); }
  console.log("=== during conversation (cartman frozen, kyle walking) ===");
  console.log(during.join("\n"));
  report("bus stop + conversation");
}

// ---- scenario 2: the pond cutscene (Kenny gag) mounts and plays
{
  await mountFrom("sp_pond");
  watch();
  const kenny = () => (q('[data-npc-id="sp_kenny_npc"]') ? posOf("sp_kenny_npc") : "GONE");
  const samples: string[] = [];
  for (let t = 0; t < 20; t++) { await sleep(250); samples.push(kenny()); }
  console.log("=== pond cutscene: kenny samples ===");
  console.log(samples.join("\n"));
  report("pond cutscene");
  console.log("crashed?", /the reel snapped|something broke/i.test(container.textContent || ""));
}

// ---- scenario 3: the wide-world cameo (200% reel + rick/morty)
{
  await mountFrom("sp_crash");
  watch();
  const ids = ["sp_rick_cameo", "sp_morty_cameo"];
  const samples: string[] = [];
  for (let t = 0; t < 20; t++) { await sleep(250); samples.push(ids.map((id) => (q(`[data-npc-id="${id}"]`) ? posOf(id) : "GONE")).join("|")); }
  console.log("=== crash cameo samples ===");
  console.log(samples.join("\n"));
  report("crash cameo (wide world)");
  console.log("crashed?", /the reel snapped|something broke/i.test(container.textContent || ""));
}

mo?.disconnect();
rootR?.unmount();
process.exit(0);
