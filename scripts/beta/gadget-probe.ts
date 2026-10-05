/* Beta probe for INSPECTOR GADGET: THE CLOCKWORK CAPER — engine-level
 * structural audit, plus assertions for the new 🔭 OUT-OF-REACH
 * (Hotspot.remote) option this case was written to exercise.
 * Run: node scripts/beta/gadget-harness.mjs */
import { INSPECTOR_GADGET as story } from "../../src/data/inspectorGadget";
import {
  validateStory,
  createInitialState,
  meetsGating,
  applyConsequences,
  effectiveChoiceGating,
  collectFlags,
  stageFloor,
  stageWalkPoly,
  stageMarkerPointPoly,
} from "../../src/logic";
import type { GlobalState, SceneNode } from "../../src/types";

const S = story;
const sceneById = new Map(S.scenes.map((s) => [s.id, s]));
const byId = (id: string): SceneNode => {
  const s = sceneById.get(id);
  if (!s) throw new Error(`missing scene ${id}`);
  return s;
};

let pass = 0;
let fail = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { pass++; console.log(`  ✔ ${msg}`); }
  else { fail++; console.log(`  ✗ FAIL: ${msg}`); }
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ── 1. Validator ───────────────────────────────────────────── */
section("1. validateStory()");
const issues = validateStory(S);
if (issues.length === 0) console.log("  ✔ validator returned zero issues");
else for (const i of issues) console.log(`  ⚠ [${i.severity}] ${i.sceneId ?? "(story)"}: ${i.message}`);
ok(!issues.some((i) => i.severity === "error"), "no validator ERRORS");

/* ── 2. Wiring: every target resolves ───────────────────────── */
section("2. scene wiring");
ok(!!sceneById.get(S.startSceneId), `start scene "${S.startSceneId}" exists`);
for (const sc of S.scenes) {
  for (const c of sc.choices ?? []) {
    if (c.targetSceneId) ok(sceneById.has(c.targetSceneId), `${sc.id} → choice "${c.id}" target "${c.targetSceneId}"`);
    if (c.timedOutTargetSceneId) ok(sceneById.has(c.timedOutTargetSceneId), `${sc.id} → QTE timeout target "${c.timedOutTargetSceneId}"`);
  }
  for (const h of sc.hotspots ?? []) {
    if (h.action.targetSceneId) ok(sceneById.has(h.action.targetSceneId), `${sc.id} → hotspot "${h.id}" target "${h.action.targetSceneId}"`);
  }
}
const endings = S.scenes.filter((s) => s.isEnding);
ok(endings.length === 3, `3 endings (found ${endings.length})`);
ok(endings.every((e) => !!e.endingData?.tier), "every ending carries endingData.tier");

/* ── 3. 🔭 OUT-OF-REACH hotspot (the new option) ────────────── */
section("3. remote (out-of-reach) hotspot");
const plaza = byId("ig_plaza");
const clock = (plaza.hotspots ?? []).find((h) => h.id === "igh_clock")!;
ok(!!clock, "plaza has the tower-clock hotspot");
ok(clock.remote === true, "tower clock is marked remote (🔭 out of reach)");
ok(clock.cursor === "look", "tower clock answers 👁 look");
ok(clock.isRepeatable === true, "tower clock look is repeatable flavour");
const floor = stageFloor(plaza.stage);
ok(clock.bounds.y + clock.bounds.h < floor.top, `clock zone (bottom ${clock.bounds.y + clock.bounds.h}%) is fully ABOVE the walkable floor (top ${floor.top}%) — genuinely out of reach`);
// The engine's marker clamp would drag a NON-remote clock reticle down to the
// pavement; the remote flag is what keeps it on the clock face.
const poly = stageWalkPoly(plaza.stage, 100);
const clamped = stageMarkerPointPoly(clock, poly, 100);
ok(clamped.y >= floor.top, `sanity: without remote, the marker WOULD clamp to the floor (clamped y=${clamped.y.toFixed(1)} ≥ ${floor.top})`);
ok(clock.action.flagSet === "ig_clock_stuck", "remote look sets ig_clock_stuck");
const door = (plaza.hotspots ?? []).find((h) => h.id === "igh_door")!;
ok((door.gating?.requiresFlags ?? []).includes("ig_clock_stuck"), "service door is gated on the remote look's flag — remote zones feed the flag economy");
// Every OTHER plaza hotspot must be walkable (marker inside/at the floor).
for (const h of plaza.hotspots ?? []) {
  if (h.id === "igh_clock") continue;
  const m = stageMarkerPointPoly(h, poly, 100);
  ok(m.y >= floor.top - 0.01 && m.y <= floor.bottom + 0.01, `walkable marker for "${h.id}" sits on the floor (y=${m.y.toFixed(1)})`);
}

/* ── 4. Gold-path simulation ───────────────────────────────── */
section("4. gold path (HQ → plaza → lair → gold)");
let st: GlobalState = createInitialState(S);
// HQ: read the note, then leave (Clever +1).
const hq = byId("ig_hq");
const note = (hq.hotspots ?? []).find((h) => h.id === "igh_note")!;
st = { ...st, activeFlags: new Set([...st.activeFlags, note.action.flagSet!]) };
const quimbyClockBeat = (hq.dialogueBeats ?? []).find((b) => b.id === "igb_hq3")!;
ok(meetsGating(quimbyClockBeat.conditionRule, st), "Quimby's 'look UP' beat unlocks after reading the note");
const leave = (hq.choices ?? []).find((c) => c.id === "igc_go_plaza")!;
ok(meetsGating(effectiveChoiceGating(leave), st), "HQ exit choice is open");
st = applyConsequences(S, leave.consequences, st);
ok(st.meters.Clever >= 1, `Clever meter earned at HQ (now ${st.meters.Clever})`);
// Plaza: door must be LOCKED before the clues…
ok(!meetsGating(door.gating, st), "service door locked before looking at the clock / taking the glove");
// …look at the clock FROM THE FLOOR (remote), take the gauntlet…
st = { ...st, activeFlags: new Set([...st.activeFlags, clock.action.flagSet!]) };
const glove = (plaza.hotspots ?? []).find((h) => h.id === "igh_gauntlet")!;
ok(glove.action.type === "giveItem" && glove.action.itemGranted === "ig_gauntlet", "glove zone grants the gauntlet");
const gauntlet = S.items.find((i) => i.id === "ig_gauntlet")!;
st = { ...st, inventory: [...st.inventory, gauntlet], activeFlags: new Set([...st.activeFlags, glove.action.flagSet!]) };
ok(meetsGating(door.gating, st), "…and the service door OPENS with flag + item");
// Lair: all three choices reachable, Clever gate satisfied.
const lair = byId("ig_lair");
const qte = (lair.choices ?? []).find((c) => c.id === "igc_umbrella")!;
ok(qte.quickTime === true && (qte.timeLimitSeconds ?? 0) > 0, "GO-GO GADGET UMBRELLA is a QTE with a clock");
ok(qte.timedOutTargetSceneId === "ig_scramble", "QTE timeout routes to the scramble scene");
const clever = (lair.choices ?? []).find((c) => c.id === "igc_deduce")!;
ok(meetsGating(effectiveChoiceGating(clever), st), "Clever-gated silver choice is open on the gold path");
ok(byId(qte.targetSceneId!).endingData?.tier === "victory-gold", "QTE success lands on the gold ending");

/* ── 5. Flag & item accounting ─────────────────────────────── */
section("5. flag / item accounting");
const flags = collectFlags(S);
console.log(`  flags in story: ${[...flags].join(", ")}`);
const noted = Object.keys(S.flagNotes ?? {});
for (const f of noted) ok(flags.includes(f), `flagNote "${f}" refers to a real flag`);
const consumers = new Set<string>();
for (const sc of S.scenes) {
  for (const h of sc.hotspots ?? []) (h.gating?.requiresFlags ?? []).forEach((f) => consumers.add(f));
  for (const c of sc.choices ?? []) (c.gating?.requiresFlags ?? []).forEach((f) => consumers.add(f));
  for (const b of sc.dialogueBeats ?? []) (b.conditionRule?.requiresFlags ?? []).forEach((f) => consumers.add(f));
}
console.log(`  consumed flags: ${[...consumers].join(", ")} (the rest are Case-Progress colour)`);
ok(consumers.has("ig_clock_stuck") && consumers.has("ig_read_note"), "both plot-critical flags have consumers");
ok(S.items.every((i) => S.scenes.some((sc) => (sc.hotspots ?? []).some((h) => h.action.itemGranted === i.id))), "every item is granted somewhere");

console.log(`\n════════ RESULT: ${pass} passed, ${fail} failed ════════`);
if (fail > 0) process.exitCode = 1;
