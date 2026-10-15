import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MediaPreloader, mediaPreloader, shouldPreloadMedia } from "../src/mediaPreload";
import { audio } from "../src/audio";
import { nextSceneMediaPlan } from "../src/game/scenePreload";
import { DraftAutosave, draftKey } from "../src/studio/draftAutosave";
import { sceneRoutes, setSceneRouteTarget, storyEdges } from "../src/sceneRoutes";
import { cloneScene, cloneStory } from "../src/studio/cloneStory";
import { removeStoryScene, storyStructure } from "../src/studio/storyEdits";
import { FAMILY_GUY } from "../src/data/familyGuy";
import { applyConsequences, collectFlags, createInitialState, deepClone, flagSetSources, resolveHotspot, resolveVerbAction, validateStory } from "../src/logic";
import { availableDecisions, applyDecision, initialSim, type Decision, type SimState } from "../src/game/decisions";
import { coverageReport } from "../src/game/playtestCoverage";
import { buildDeepLink, parseDeepLink, resolveDeepLink } from "../src/game/deepLink";
import type { SceneNode, Story } from "../src/types";

let checks = 0;
const check = (value: unknown, message: string) => { assert.ok(value, message); checks++; };
const eq = (a: unknown, b: unknown, message: string) => { assert.deepEqual(a, b, message); checks++; };
const defer = <T,>() => { let resolve!: (v: T) => void; let reject!: (e: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const fresh = () => deepClone(FAMILY_GUY);
const room = (id: string): SceneNode => ({ id, title: id, background: `/room-${id}.webp`, prose: "", dialogueBeats: [{ id: `b-${id}`, characterId: "narrator", text: id, audioUrl: `/${id}.wav` }], choices: [], hotspots: [] });

// The DOM media doubles are controllable: reserve before resolve, take before
// loadeddata, reject an old play after a new one, and finish in either order.
class ImageDouble {
  static all: ImageDouble[] = [];
  src = ""; complete = false; naturalWidth = 0; decoding = ""; fetchPriority = "";
  onload: (() => void) | null = null; onerror: (() => void) | null = null; decodes = 0;
  constructor() { ImageDouble.all.push(this); }
  decode() { this.decodes++; return Promise.resolve(); }
  removeAttribute() { this.src = ""; }
  loaded() { this.complete = true; this.naturalWidth = 960; this.onload?.(); }
}
class AudioDouble extends EventTarget {
  static all: AudioDouble[] = [];
  src = ""; preload = ""; volume = 1; paused = true; ended = false; currentTime = 0; readyState = 0;
  loads = 0; pauses = 0; plays: ReturnType<typeof defer<void>>[] = [];
  constructor(src = "") { super(); this.src = src; AudioDouble.all.push(this); }
  load() { this.loads++; }
  pause() { this.pauses++; this.paused = true; }
  play() { this.paused = false; const p = defer<void>(); this.plays.push(p); return p.promise; }
  removeAttribute() { this.src = ""; }
  loaded() { this.readyState = 2; this.dispatchEvent(new Event("loadeddata")); }
}
Object.assign(globalThis, { Image: ImageDouble, Audio: AudioDouble, window: globalThis });
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { connection: { saveData: false, effectiveType: "4g" } } });

console.log("\nPreload / audio ownership and races");
const delayed = defer<string>();
let resolutions = 0;
const preloader = new MediaPreloader(() => { resolutions++; return delayed.promise; }, { images: 2, audio: 2 });
const pending1 = preloader.warmImage("asset:plate");
const pending2 = preloader.warmImage("asset:plate");
eq(pending1, pending2, "duplicate in-flight image returns same work"); eq(resolutions, 1, "IndexedDB resolved once");
delayed.resolve("/plate.webp"); await tick();
eq(ImageDouble.all.length, 1, "one image decoder"); ImageDouble.all[0].loaded(); await pending1;
eq(ImageDouble.all[0].decodes, 1, "image is decoded before ready");
void preloader.warmImage("/two.webp"); void preloader.warmImage("/three.webp");
eq(ImageDouble.all[0].src, "", "LRU releases oldest image");
const before = AudioDouble.all.length; void preloader.warmAudio("/line.wav");
const warmed = AudioDouble.all[before]; eq(warmed.plays.length, 0, "warming never plays or unlocks");
const taken = preloader.takeAudio("/line.wav"); eq(taken, warmed, "transfer in-flight audio without a second fetch");
preloader.clear(); eq(warmed.pauses, 0, "eviction never pauses transferred audio"); check(!!warmed.src, "transferred source stays attached"); warmed.loaded();
const count = ImageDouble.all.length + AudioDouble.all.length;
await Promise.all([preloader.warmImage("gradient:red"), preloader.warmImage("video:/film.mp4"), preloader.warmAudio("data:image/png;base64,x")]);
eq(ImageDouble.all.length + AudioDouble.all.length, count, "no speculative gradients, video, or wrong media type");
const late = defer<string>(); const cancelled = new MediaPreloader(() => late.promise); const cancelledWork = cancelled.warmAudio("asset:late");
cancelled.clear(); late.resolve("/cancelled.wav"); await cancelledWork; await tick(); eq(AudioDouble.all.length + ImageDouble.all.length, count, "late resolution cannot resurrect an evicted entry");
for (let i = 0; i < 30; i++) void mediaPreloader.warmAudio(`/bounded-${i}.wav`);
eq(AudioDouble.all.filter((a) => a.src.startsWith("/bounded-")).length, 6, "audio fanout stays bounded");
mediaPreloader.clear();
check(shouldPreloadMedia(), "ordinary connection allowed");
(globalThis.navigator as any).connection.saveData = true; check(!shouldPreloadMedia(), "data saver respected");
(globalThis.navigator as any).connection = { effectiveType: "2g" }; check(!shouldPreloadMedia(), "2G respected");
(globalThis.navigator as any).connection = { effectiveType: "4g" };

const retry = new MediaPreloader();
void retry.warmAudio("/network.wav"); const brokenAudio = AudioDouble.all.at(-1)!;
brokenAudio.dispatchEvent(new Event("error"));
check(!retry.takeAudio("/network.wav"), "failed warm audio is not handed to playback");
void retry.warmAudio("/network.wav"); check(AudioDouble.all.at(-1) !== brokenAudio, "a later preload retries failed audio");
void retry.warmImage("/network.webp"); const brokenImage = ImageDouble.all.at(-1)!; brokenImage.onerror?.();
void retry.warmImage("/network.webp"); check(ImageDouble.all.at(-1) !== brokenImage, "a later preload retries failed images");
retry.clear();

let starts = 0;
const originalStarted = audio.voiceStarted.bind(audio);
audio.voiceStarted = () => { starts++; };
void mediaPreloader.warmAudio("/prepared.wav"); const prepared = AudioDouble.all.at(-1)!;
const playback = audio.playClip("/prepared.wav"); eq(prepared.plays.length, 1, "playClip adopts warmed decoder");
eq(prepared.volume, audio.volumes.voice * audio.volumes.master, "warmed voice respects mixer");
audio.setVolume("master", 0); eq(prepared.volume, 0, "live mute applies to warmed voice"); audio.setVolume("master", 0.8);
audio.stopSpeech(); prepared.plays[0].resolve(); check(!(await playback), "dismissal wins over late play success"); eq(starts, 0, "late success never ducks new scene music");
const old = audio.playClip("/old.wav"); const oldEl = AudioDouble.all.at(-1)!;
const newer = audio.playClip("/new.wav"); const newEl = AudioDouble.all.at(-1)!;
oldEl.plays[0].reject({ name: "NotAllowedError" }); await old;
newEl.plays[0].resolve(); await newer;
audio.unlock(); eq(oldEl.plays.length, 1, "stale autoplay rejection cannot arm an old retry");
eq(starts, 1, "only live clip owns the duck"); audio.stopSpeech();
const blocked = audio.playClip("/blocked.wav"); const blockedEl = AudioDouble.all.at(-1)!;
blockedEl.plays[0].reject({ name: "NotAllowedError" }); await blocked;
audio.unlock(); eq(blockedEl.plays.length, 2, "real gesture retries current blocked voice");
audio.stopSpeech(); blockedEl.plays[1].resolve(); await tick(); eq(starts, 1, "dismissed retry cannot revive voice");
audio.voiceStarted = originalStarted; mediaPreloader.clear();

console.log("Revision-safe Studio autosave");
const stored = new Map<string, string>();
const writes = { setItem: (k: string, v: string) => { stored.set(k, v); } };
const compactions: ReturnType<typeof defer<Story>>[] = [];
let compactCalls = 0;
const drafts = new DraftAutosave(writes, () => { compactCalls += 1; const d = defer<Story>(); compactions.push(d); return d.promise; }, 60_000);
// Compaction exists for embedded media, and only runs when there IS any — so
// these race tests carry an inline image, exactly as a first save of an
// uploaded picture would.
const a = fresh(); a.title = "first"; a.coverImage = "data:image/png;base64,AAAA"; drafts.queue(a); const firstSave = drafts.flush();
const b = { ...a, title: "latest" }; drafts.queue(b); const latestSave = drafts.flush();
compactions[1].resolve(b); await latestSave; compactions[0].resolve(a); await firstSave;
eq(JSON.parse(stored.get(draftKey(a.id))!).title, "latest", "slow compaction cannot overwrite newer revision");
const c = { ...a, title: "focused exit" }; drafts.queue(c); check(drafts.flushSync(), "synchronous recovery succeeds before navigation");
eq(JSON.parse(stored.get(draftKey(a.id))!).title, c.title, "last 800 ms survives immediate unload");
const other = { ...a, id: "other", title: "other case" }; drafts.queue(other);
const othersSave = drafts.flush(); compactions[3].resolve(other); compactions[2].resolve(c); await othersSave;
eq(JSON.parse(stored.get(draftKey(a.id))!).title, c.title, "story switch keeps the original's latest edit");
eq(JSON.parse(stored.get(draftKey(other.id))!).title, other.title, "other story saves independently");
drafts.queue(a); const discardedSave = drafts.flush(); drafts.discard(a.id); stored.delete(draftKey(a.id)); compactions[4].resolve(a); await discardedSave;
check(!stored.has(draftKey(a.id)), "discarded draft is not resurrected by in-flight compaction");
// The common save is a clean draft: every upload is already an `asset:<id>`
// reference, so there is nothing to compact — and compacting it used to
// re-read every row of the media library and rebuild a second copy of the
// story just to write the first one.
const clean = fresh(); clean.title = "clean";
const callsBefore = compactCalls;
drafts.queue(clean); check(await drafts.flush(), "a clean draft saves");
eq(compactCalls, callsBefore, "a draft with no embedded media is written without compacting");
eq(JSON.parse(stored.get(draftKey(clean.id))!).title, "clean", "…and the draft really is on disk");
const withMedia = fresh(); withMedia.title = "media"; withMedia.coverImage = "data:image/png;base64,BBBB";
drafts.queue(withMedia); const mediaSave = drafts.flush();
eq(compactCalls, callsBefore + 1, "a draft holding an inline image is compacted before it is written");
compactions[compactions.length - 1].resolve({ ...withMedia, coverImage: "asset:one" }); await mediaSave;
eq(JSON.parse(stored.get(draftKey(withMedia.id))!).coverImage, "asset:one", "the compacted story is what lands");

const failing = new DraftAutosave({ setItem: () => { throw new Error("Quota exceeded"); } }, async (s) => s, 60_000);
let status = ""; failing.subscribe((s) => { status = s.state; }); failing.queue(a);
check(!failing.flushSync(), "failed safety snapshot blocks exit"); check(!(await failing.flush()), "quota error does not report success"); eq(status, "error", "quota errors are surfaced");
eq(failing.snapshot(a.id), a, "failed draft remains available for export/retry"); failing.discard(a.id);

console.log("Exact routes, copy/delete integrity and undo boundaries");
const graph = fresh(); const lab = graph.scenes.find((s) => s.id === "fg_basement")!;
lab.hotspots![1].states!.push({ id: "second-state", when: { requiresFlags: ["other"] }, action: { type: "goToScene", targetSceneId: "fg_yard" } });
const stateRoute = sceneRoutes(lab).find((r) => r.target === "fg_countdown")!;
lab.hotspots![1].states!.reverse(); check(setSceneRouteTarget(lab, stateRoute.id, "fg_gold"), "state-route identity survives reorder");
eq(lab.hotspots![1].states![1].action!.patternPuzzle!.targetSceneId, "fg_gold", "only selected state rewired");
eq(lab.hotspots![1].states![0].action!.targetSceneId, "fg_yard", "sibling state unchanged");
const qte = graph.scenes.find((s) => s.id === "fg_countdown")!;
const timeout = sceneRoutes(qte).find((r) => r.path.at(-1) === "timedOutTargetSceneId")!;
setSceneRouteTarget(qte, timeout.id, undefined);
eq(qte.choices![0].targetSceneId, "fg_reset", "deleting timeout preserves success");
check(!qte.choices![0].timedOutTargetSceneId, "timeout alone removed");
// Every possible branch route in a compact synthetic room, with siblings
// intentionally sharing destinations. Clearing one must not clear the other.
const complex = room("complex"); complex.nodeType = "stage";
complex.autoAdvanceTargetSceneId = "fg_gold";
complex.dialogueBeats![0].afterBeatTargetSceneId = "fg_gold";
complex.choices = [{ id: "success", text: "Go", targetSceneId: "fg_gold", timedOutTargetSceneId: "fg_gold", quickTime: true }];
complex.hotspots = [{ id: "object", label: "Object", bounds: { x: 1, y: 1, w: 5, h: 5 }, action: { type: "patternPuzzle", patternPuzzle: { title: "Puzzle", instruction: "Pick", rows: [], targetCount: 1, targetSceneId: "fg_gold", wrongTargetSceneId: "fg_gold" }, then: [{ type: "goToScene", targetSceneId: "fg_gold" }] }, verbs: { look: { type: "runScript", script: [{ do: "goToScene", targetSceneId: "fg_gold" }, { do: "goToScene", targetSceneId: "fg_gold" }] } } }];
complex.stage = { enterScript: [{ do: "goToScene", targetSceneId: "fg_gold" }], exitEdges: { left: { targetSceneId: "fg_gold" } } };
const routes = sceneRoutes(complex); eq(new Set(routes.map((r) => r.handle)).size, routes.length, "all route handles unique");
for (const route of routes) {
  const copy = deepClone(complex); check(setSceneRouteTarget(copy, route.id, "fg_silver"), `${route.label}: rewire exists`);
  eq(sceneRoutes(copy).filter((r) => r.target === "fg_silver").length, 1, `${route.label}: exactly one branch changed`);
}
graph.scenes.push(complex);
const originalJson = JSON.stringify(graph); let counter = 0;
const clone = cloneStory(graph, () => `unique${counter++}`);
check(storyEdges(clone).every((r) => clone.scenes.some((s) => s.id === r.target)), "full copy remaps nested branches and scripts");
eq(JSON.stringify(graph), originalJson, "copy never mutates source");
for (const sc of clone.scenes) for (const npc of sc.stage?.npcs ?? []) if (npc.talkHotspotId) check(sc.hotspots?.some((h) => h.id === npc.talkHotspotId), "copied NPC points to copied conversation");
const copiedRoom = cloneScene(fresh().scenes.find((s) => s.id === "fg_living")!);
check(copiedRoom.hotspots?.some((h) => h.id === copiedRoom.stage?.npcs?.[0].talkHotspotId), "single-node copy keeps NPC linkage");
const beforeDelete = deepClone(graph); removeStoryScene(graph, "fg_gold");
check(storyEdges(graph).every((r) => r.target !== "fg_gold"), "deletion clears every incoming route, including sibling script steps");
check(!graph.map?.locations.some((l) => l.targetSceneId === "fg_gold"), "deleted map pins removed");
check(storyStructure(graph) !== storyStructure(beforeDelete), "deletion always breaks the text coalesce window");
const typed = deepClone(beforeDelete); typed.title += " typed";
eq(storyStructure(typed), storyStructure(beforeDelete), "typing alone may coalesce");
eq(coverageReport(FAMILY_GUY, null).sceneTotal, 12, "bypassed QA notes don't reduce playable coverage");
check(collectFlags(FAMILY_GUY).includes("fg_tuned"), "state-puzzle flags appear in Studio");
check(flagSetSources(FAMILY_GUY, "fg_tuned").some((s) => s.includes("state") && s.includes("solved")), "flag source names nested puzzle");

console.log("Lookahead plans — rail, adventure, gates, entry effects and limits");
const source = room("from"), destination = room("to");
source.choices = [{ id: "c", text: "My promise", memoryLog: "promise", targetSceneId: "note", consequences: { setFlags: ["branch"] } }];
const note = { ...room("note"), nodeType: "note" as const, choices: [{ id: "bypass", text: "", targetSceneId: "to" }] };
destination.onEnterActions = [{ conditionRule: { requiresFlags: ["branch"] }, consequences: { setFlags: ["entered"] } }];
destination.dialogueBeats = [{ id: "gated", characterId: "narrator", text: "Remember", audioUrl: "/right.wav", conditionRule: { requiresFlags: ["entered"], requiresMemories: ["promise"] } }, ...destination.dialogueBeats!];
const planStory = { ...fresh(), startSceneId: "from", scenes: [source, note, destination] };
const state = createInitialState(planStory); const stateBefore = [...state.activeFlags];
const plan = nextSceneMediaPlan({ story: planStory, scene: source, state, beatIndex: 0 });
eq(plan.sceneIds, ["to"], "bypass notes while preloading real next room"); check(plan.audio.includes("/right.wav"), "branch memory and entry gate choose correct opening voice");
eq([...state.activeFlags], stateBefore, "planning never applies consequences to gameplay");
source.nodeType = "stage"; source.choices = []; source.hotspots = [{ id: "door", label: "Door", bounds: { x: 0, y: 0, w: 5, h: 5 }, gating: { requiresFlags: ["key"] }, action: { type: "goToScene", targetSceneId: "to" } }];
planStory.map = undefined;
check(!nextSceneMediaPlan({ story: planStory, scene: source, state }).sceneIds.length, "locked adventure door not prefetched");
state.activeFlags.add("key"); check(nextSceneMediaPlan({ story: planStory, scene: source, state }).sceneIds.includes("to"), "unlocked adventure door preloaded during current line");
check(!nextSceneMediaPlan({ story: planStory, scene: source, state, usedHotspots: new Set(["from:door"]) }).sceneIds.length, "spent hotspot ignored");
source.nodeType = undefined; source.hotspots = [];
source.choices = Array.from({ length: 20 }, (_, i) => ({ id: `c${i}`, text: "Go", targetSceneId: `r${i}` })); planStory.scenes.push(...Array.from({ length: 20 }, (_, i) => room(`r${i}`)));
const bounded = nextSceneMediaPlan({ story: planStory, scene: source, state }); eq(bounded.sceneIds.length, 4, "fanout caps next rooms at four"); check(bounded.images.length <= 8 && bounded.audio.length <= 6, "plan respects decoder budget");

console.log("Family Guy — authored graph, all endings and retryable puzzle");
check(!validateStory(FAMILY_GUY).some((i) => i.severity === "error"), "Family Guy has no validation errors");
const machine = FAMILY_GUY.scenes.find((s) => s.id === "fg_basement")!.hotspots!.find((h) => h.id === "fg_machine")!;
const installedState = applyConsequences(FAMILY_GUY, { setFlags: ["fg_installed"] }, createInitialState(FAMILY_GUY));
const installed = resolveHotspot(machine, installedState);
check(!installed.acceptsItems?.length, "installed machine drops the consumed-item picker");
check(resolveVerbAction(installed, "use").ok, "installed machine answers direct USE without an item");
eq(machine.acceptsItems, ["fg_powered_remote"], "resolved item override leaves the authored base untouched");
const badStateItem = fresh(); badStateItem.scenes.find((s) => s.id === "fg_basement")!.hotspots![1].states![0].acceptsItems = ["missing-item"];
check(validateStory(badStateItem).some((i) => i.severity === "error" && i.message.includes('accepts unknown item "missing-item"')), "state item overrides are validated");
const media = new Set(JSON.stringify(FAMILY_GUY).match(/\/assets\/family-guy\/[^"\\]+/g) ?? []);
// public/assets (the art of the stories that are not in the catalogue) is not in the repository: skipped, not failed.
if (existsSync("public/assets")) for (const value of media) check(existsSync(`public${value}`), `shipped local media exists: ${value}`);
else console.log("  (Family Guy: public/assets is not in the repository; its shipped-media checks are skipped)");
function step(sim: SimState, match: (d: Decision) => boolean): SimState {
  const choices = availableDecisions(FAMILY_GUY, sim); const d = choices.find(match);
  assert.ok(d, `No requested decision in ${sim.sceneId}: ${choices.map((x) => x.label).join(" | ")}`);
  checks++; return applyDecision(FAMILY_GUY, sim, d).sim;
}
const pick = (sim: SimState, id: string) => step(sim, (d) => d.kind === "choice" && d.choiceId === id);
const hotspot = (sim: SimState, id: string) => step(sim, (d) => d.kind === "hotspot" && d.hotspotId === id && d.verb !== "look");
for (const ending of ["gold", "silver", "timeout", "red"] as const) {
  let sim = initialSim(FAMILY_GUY, createInitialState(FAMILY_GUY));
  sim = step(sim, (d) => d.kind === "choice"); sim = step(sim, (d) => d.kind === "choice");
  sim = hotspot(sim, "fg_take_remote"); sim = hotspot(sim, "fg_take_batteries");
  sim = step(sim, (d) => d.kind === "combine"); check(sim.state.inventory.some((i) => i.id === "fg_powered_remote"), "craft the powered remote");
  if (ending === "gold") {
    sim = step(sim, (d) => d.kind === "stage-exit" && d.edge === "right");
    sim = hotspot(sim, "fg_receipt_hs"); sim = hotspot(sim, "fg_pub_door");
    sim = step(sim, (d) => d.kind === "press-lie" && d.correct);
    sim = pick(sim, "fg_pub_lab");
  } else sim = hotspot(sim, "fg_lab_door");
  eq(sim.sceneId, "fg_basement", "note bypass lands in lab");
  sim = hotspot(sim, "fg_machine"); check(!sim.state.inventory.some((i) => i.id === "fg_powered_remote"), "install consumes crafted item");
  sim = step(sim, (d) => d.kind === "minigame" && !d.won);
  check(availableDecisions(FAMILY_GUY, sim).some((d) => d.kind === "minigame" && d.won), "wrong puzzle answer remains retryable");
  sim = step(sim, (d) => d.kind === "minigame" && d.won); eq(sim.sceneId, "fg_countdown", "nested puzzle enters countdown");
  if (ending === "timeout") sim = step(sim, (d) => d.kind === "qte-timeout");
  else if (ending === "red") sim = pick(sim, "fg_red_button");
  else { sim = pick(sim, "fg_blue_button"); sim = step(sim, (d) => d.kind === "auto"); sim = step(sim, (d) => d.kind === "choice"); }
  eq(sim.sceneId, `fg_${ending === "timeout" || ending === "red" ? "fail" : ending}`, `${ending} reaches intended ending`);
  eq(availableDecisions(FAMILY_GUY, sim), [], "endings seal navigation");
}
const url = buildDeepLink({ storyId: FAMILY_GUY.id, sceneId: "fg_verdict", flags: new Set(["fg_caught"]), items: new Set(["fg_receipt_item"]), seed: "ship" });
check(url.includes("story="), "branch links identify the custom story");
const link = resolveDeepLink(FAMILY_GUY, parseDeepLink(url));
eq(link.sceneId, "fg_verdict", "deep link resolves target"); check(link.state.activeFlags.has("fg_caught"), "deep link restores selected gate state");

console.log(`\nStudio ship regressions: ${checks} passed, 0 failed`);
