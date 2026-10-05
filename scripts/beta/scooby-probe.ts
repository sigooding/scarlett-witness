/* Beta probe for SCOOBY_RAVENSWOOD — engine-level playthrough audit. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { SCOOBY_RAVENSWOOD as story } from "../../src/data/scoobyRavenswood";
import {
  validateStory,
  createInitialState,
  meetsGating,
  applyConsequences,
  effectiveChoiceGating,
  interrogationOutcome,
  applyLieCaught,
  heatBustTarget,
  resolveVerbAction,
  itemsConsumedBy,
} from "../../src/logic";
import { spriteSheetIssues } from "../../src/game/spriteSheet";
import type { SceneNode, GlobalState } from "../../src/types";

const S = story;
const sceneById = new Map(S.scenes.map((s) => [s.id, s]));

let pass = 0;
let fail = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { pass++; console.log(`  ✔ ${msg}`); }
  else { fail++; console.log(`  ✗ FAIL: ${msg}`); }
};
const section = (t: string) => console.log(`\n──── ${t} ────`);

/* ---------- little driver ---------- */
type Driven = { state: GlobalState; scene: SceneNode; log: string[] };
const drive = (sceneId: string, state?: GlobalState): Driven => {
  const sc = sceneById.get(sceneId);
  if (!sc) throw new Error(`missing scene ${sceneId}`);
  return { state: state ?? createInitialState(S), scene: sc, log: [] };
};
const has = (d: Driven, flag: string) => d.state.activeFlags.has(flag);
const holds = (d: Driven, itemId: string) => d.state.inventory.some((i) => i.id === itemId);

/** Fire a hotspot like a click (gating honoured, action applied). */
function fire(d: Driven, hotspotId: string): Driven {
  const h = (d.scene.hotspots ?? []).find((x) => x.id === hotspotId);
  if (!h) throw new Error(`${d.scene.id}: no hotspot ${hotspotId}`);
  if (!meetsGating(h.gating, d.state)) throw new Error(`${d.scene.id}/${hotspotId}: gate shut`);
  const a = h.action;
  if (a.flagSet) d.state = applyConsequences(S, { setFlags: [a.flagSet] }, d.state);
  if (a.itemGranted) d.state = applyConsequences(S, { addItems: [a.itemGranted] }, d.state);
  if (a.meterChange) d.state = applyConsequences(S, { meterChanges: [a.meterChange] }, d.state);
  if (a.type === "patternPuzzle" && a.patternPuzzle?.rewardConsequences)
    d.state = applyConsequences(S, a.patternPuzzle.rewardConsequences, d.state);
  d.log.push(`hotspot ${hotspotId} @ ${d.scene.id}`);
  if (a.type === "goToScene" && a.targetSceneId) {
    const sc = sceneById.get(a.targetSceneId);
    if (!sc) throw new Error(`${d.scene.id}/${hotspotId}: missing target ${a.targetSceneId}`);
    d.scene = sc;
  }
  return d;
}
/** Pick a choice like a click (effective gating incl. presentItem honoured). */
function pick(d: Driven, choiceId: string): Driven {
  const c = (d.scene.choices ?? []).find((x) => x.id === choiceId);
  if (!c) throw new Error(`${d.scene.id}: no choice ${choiceId}`);
  const eff = effectiveChoiceGating(c);
  if (!meetsGating(eff, d.state))
    throw new Error(`${d.scene.id}/${choiceId}: gate shut (eff ${JSON.stringify(eff)})`);
  if (c.consequences) d.state = applyConsequences(S, c.consequences, d.state);
  if (c.memoryLog)
    d.state = { ...d.state, memories: { ...d.state.memories, [c.memoryLog]: c.text } };
  if (c.presentItem)
    d.state = {
      ...d.state,
      memories: { ...d.state.memories, [`item:${c.presentItem}`]: "presented" },
    };
  d.log.push(`choice ${choiceId} @ ${d.scene.id}`);
  const target = c.targetSceneId;
  if (target) {
    const sc = sceneById.get(target);
    if (!sc) throw new Error(`${d.scene.id}/${choiceId}: missing target ${target}`);
    d.scene = sc;
  }
  return d;
}
/** Present evidence against a beat's lie (the correct item). */
function pressLie(d: Driven, beatId: string): Driven {
  const b = (d.scene.dialogueBeats ?? []).find((x) => x.id === beatId);
  if (!b?.lie) throw new Error(`${d.scene.id}: beat ${beatId} carries no lie`);
  const item = b.lie.evidenceItemIds[0];
  if (!holds(d, item)) throw new Error(`${d.scene.id}/${beatId}: not holding evidence ${item}`);
  d.state = applyLieCaught(S, b.lie, d.state);
  d.log.push(`lie pressed ${beatId} with ${item}`);
  return d;
}
/** Pin a corkboard connection (requires both ends held/met). */
function pin(d: Driven, flag: string): Driven {
  const conn = (S.deduction?.connections ?? []).find((c) => c.flagSet === flag);
  if (!conn) throw new Error(`no board connection sets ${flag}`);
  const okA = holds(d, conn.a);
  const okB = S.characters.some((ch) => ch.id === conn.b);
  if (!okA || !okB) throw new Error(`pin ${flag}: ends not available (${okA}/${okB})`);
  d.state = applyConsequences(S, { setFlags: [flag] }, d.state);
  d.log.push(`pin ${flag}`);
  return d;
}

/* ══ 1. Validator ═══════════════════════════════════════════ */
section("1. validateStory");
const issues = validateStory(S);
for (const i of issues) console.log(`  ⚠ [${i.severity}] ${i.sceneId ?? "(story)"}: ${i.message}`);
ok(issues.every((i) => i.severity !== "error"), "no validator errors");

/* ══ 2. Sprite sheets ═══════════════════════════════════════ */
section("2. Sprite sheets");
const sheetChecks: [string, ReturnType<typeof spriteSheetIssues>][] = [];
for (const ch of S.characters) {
  if (ch.talkingSheet)
    sheetChecks.push([`${ch.name} talking`, spriteSheetIssues(ch.talkingSheet, ch.name, ["talk", "rest"])]);
  for (const v of ch.talkingSheets ?? [])
    sheetChecks.push([`${ch.name} variant "${v.name}"`, spriteSheetIssues(v.sheet, `${ch.name}/${v.name}`)]);
}
const walker = S.scenes.find((s) => s.stage?.playerSheet)?.stage?.playerSheet;
if (walker) sheetChecks.push(["stage walker", spriteSheetIssues(walker, "walker", ["walk", "idle"])]);
for (const [label, iss] of sheetChecks) ok(iss.length === 0, `${label} sheet clean${iss.length ? ": " + iss.join("; ") : ""}`);
ok(sheetChecks.length === 10, `10 sheet configs in the case (found ${sheetChecks.length})`);

/* variant wiring: an expression-variant only fires when a beat's expression
 * matches the variant name — check the threat/unmask beats are wired. */
const phantom = S.characters.find((c) => c.id === "sd_phantom")!;
const grimsby = S.characters.find((c) => c.id === "sd_grimsby")!;
ok(phantom.talkingSheets?.some((v) => v.name === "lunge") ?? false, "phantom carries the \"lunge\" variant");
ok(grimsby.talkingSheets?.some((v) => v.name === "caught") ?? false, "grimsby carries the \"caught\" (unmasked) variant");
const lungeBeats = S.scenes.flatMap((s) => (s.dialogueBeats ?? []).filter((b) => b.expression === "lunge" && b.characterId === "sd_phantom"));
ok(lungeBeats.length >= 2, `"lunge" beats wired to the phantom (found ${lungeBeats.length})`);
ok(lungeBeats.every((b) => (b.id === "sdb_c3" || b.id === "sdb_t1")), "lunge beats are the corridor chase + the trap");
const caughtTrapBeat = S.scenes.flatMap((s) => (s.dialogueBeats ?? []).filter((b) => b.expression === "caught" && b.characterId === "sd_grimsby"));
ok(caughtTrapBeat.length >= 1, "\"caught\" (unmasked) beat wired to grimsby — the glow-gutter moment");
ok((phantom.talkingSheet!.animations.talk!.frames ?? []).every((f) => f >= 0 && f <= 3), "phantom talk frames sit in the 4-frame grid");
ok(JSON.stringify(phantom.talkingSheets![0].sheet.animations.lunge!.frames) === "[3]", "lunge variant holds frame 3");

/* ══ 3. GOLD RUN ════════════════════════════════════════════ */
section("3. GOLD RUN — full case, both lies, crack, three pins, trap");
let d = drive(S.startSceneId);
ok(d.scene.nodeType === "stage", "start scene is the walkable stage");
d = fire(d, "sdh_sign");
d = fire(d, "sdh_window");
d = fire(d, "sdh_mailbox");
ok(holds(d, "sd_telegram"), "mailbox grants the second telegram");
d = fire(d, "sdh_cooler");
ok(holds(d, "sd_snack") && has(d, "sd_got_snack"), "van cooler grants the emergency Scooby Snack");
/* the verb-coin gaits, probed engine-directly: */
{
  const door = d.scene.hotspots!.find((h) => h.id === "sdh_door")!;
  const sign = d.scene.hotspots!.find((h) => h.id === "sdh_sign")!;
  const doorUse = resolveVerbAction(door, "use", "sd_snack");
  ok(doorUse.ok && doorUse.text?.includes("bait") === true, "snack-on-door answers with the bait gag (authored ⚙ use action)");
  const signUse = resolveVerbAction(sign, "use", "sd_snack");
  ok(signUse.ok && signUse.text?.includes("OFFENDED") === true, "snack-on-sign answers via the showText DEFAULT (say-line fallback)");
  ok(itemsConsumedBy(signUse.action).length === 0 && itemsConsumedBy(doorUse.action).length === 0,
    "neither say-line spends the snack (no more ate-my-item)");
  const wrongItem = resolveVerbAction(sign, "use", "sd_telegram");
  ok(!wrongItem.ok, "a wrong item is still refused on the sign");
}
d = fire(d, "sdh_door");
ok(d.scene.id === "sd_meet", "front door leads to the caretaker");
ok(holds(d, "sd_snack"), "snack still in the satchel walking through the door");

d = pick(d, "sdc_ask_phantom");
ok(has(d, "sd_asked_phantom"), "phantom question sets its flag");
d = pick(d, "sdc_ask_heirs");
ok(has(d, "sd_asked_heirs"), "heirs question sets its flag");
d = pick(d, "sdc_friendly");
const trustAfterFriendly = d.state.characterTrust["sd_grimsby"] ?? 0;
ok(trustAfterFriendly === 1, `friendly approach earns trust (now ${trustAfterFriendly})`);
d = pick(d, "sdc_show_telegram");
ok(holds(d, "sd_telegram") && has(d, "sd_showed_telegram"), "telegram presentable + remembered");
d = pressLie(d, "sdb_m5");
ok(has(d, "sd_caught_telegram"), "telegram lie broken by the postmark");
ok((d.state.meters["Clever"] ?? 0) >= 1, "Clever meter moved");

/* both answer beats are now visible */
const meetBeats = (d.scene.dialogueBeats ?? []).filter((b) => meetsGating(b.conditionRule, d.state));
ok(meetBeats.some((b) => b.id === "sdb_m_phantom") && meetBeats.some((b) => b.id === "sdb_m_heirs"),
  "both Q&A answers surface after their flags");
d = pick(d, "sdc_into_foyer");
ok(d.scene.id === "sd_foyer", "into the foyer");

d = fire(d, "sdh_slime");
ok(holds(d, "sd_slime") && has(d, "sd_found_slime"), "slime sample collected (hold-to-examine)");
d = fire(d, "sdh_portrait");
ok(has(d, "sd_peeked_eyes"), "peep-hole portraits discovered");
d = fire(d, "sdh_keys");
ok(holds(d, "sd_keys"), "caretaker's keys lifted");
const lockedCellar = (d.scene.hotspots ?? []).find((h) => h.id === "sdh_celldoor");
ok(!!lockedCellar && !meetsGating(lockedCellar.gating, d.state), "cellar door still locked pre-chase");
d = pick(d, "sdc_to_library");
ok(d.scene.id === "sd_library", "into the library");

/* ledger puzzle */
d = fire(d, "sdh_ledgerbook");
ok(has(d, "sd_cracked_ledger") && holds(d, "sd_ledger"), "ledger puzzle cracked → torn page granted");
const lieBeat = (d.scene.dialogueBeats ?? []).find((b) => b.id === "sdb_l3");
ok(!!lieBeat && meetsGating(lieBeat.conditionRule, d.state), "ledger lie beat visible once the page is held");

/* interrogation: warm-press run. Trust math BEFORE the ledger lie swing:
   friendly +1, telegram shown +1, telegram lie −1, soft press +1 → ≥1. */
d = pick(d, "sdc_press_where");
d = pick(d, "sdc_press_who");
d = pick(d, "sdc_press_soft");
d = pick(d, "sdc_press_sell");
const trustAtBreak = d.state.characterTrust["sd_grimsby"] ?? 0;
const q = d.scene.interrogation!;
const outcome = interrogationOutcome(q, trustAtBreak);
ok(outcome === "broke", `four warm presses crack Grimsby (trust ${trustAtBreak} vs crackTrust ${q.crackTrust})`);
d.state = applyConsequences(S, { setFlags: [q.brokeFlag] }, d.state);
ok(has(d, "sd_grimsby_broke"), "broke flag set — confession beat will join the queue");

d = pressLie(d, "sdb_l3");
ok(has(d, "sd_caught_ledger"), "ledger lie broken by the torn page");

d = pick(d, "sdc_l_corridor");
ok(d.scene.id === "sd_corridor", "upstairs corridor");
const qteVisible = (d.scene.choices ?? []).filter(
  (c) => c.quickTime && !meetsGating(c.gating ? { ...c.gating, requiresFlags: [] } : undefined, d.state) || (c.quickTime && !has(d, "sd_chase_done")),
);
ok(qteVisible.length >= 2, "both QTE escapes offered before the chase is done");
/* gold run carries the snack: the bribe option is visible and spends it */
ok(
  (d.scene.choices ?? []).some((c) => c.id === "sdc_snack_toss" && meetsGating(c.gating, d.state)),
  "snack-bribe escape offered while the snack is held",
);
d = pick(d, "sdc_snack_toss");
ok(d.scene.id === "sd_cellar" && has(d, "sd_chase_done") && has(d, "sd_snack_bribe"), "snack toss lands in the cellar, chase done + bribe remembered");
ok(!holds(d, "sd_snack"), "the bribe SPENDS the snack (authored consume) — one-time hero discount");

d = fire(d, "sdh_projector");
ok(holds(d, "sd_filmreel") && has(d, "sd_found_film"), "projector reel recovered");
d = fire(d, "sdh_rack");
ok(has(d, "sd_found_robe"), "costume rack examined");
d = fire(d, "sdh_crate");
ok(holds(d, "sd_manifest"), "steamship manifest recovered");
d = fire(d, "sdh_tunnel");

d = pin(d, "sd_pin_slime");
d = pin(d, "sd_pin_ledger");
d = pin(d, "sd_pin_film");
const spring = (S.scenes.find((s) => s.id === "sd_trap")!.choices ?? []).find((c) => c.id === "sdc_spring")!;
d = pick(d, "sdc_set_trap");
ok(d.scene.id === "sd_trap", "trap scene reached");
ok(meetsGating(spring.gating, d.state), "gold trap choice unlocked by the three pins");
d = pick(d, "sdc_spring");
ok(d.scene.id === "sd_end_unmask" && d.scene.isEnding, "unmasking ending reached");
ok(d.scene.endingData?.tier === "victory-gold", "…and it is the GOLD ending");
const trustEnd = d.state.characterTrust["sd_grimsby"] ?? 0;
ok(trustEnd >= 0, `trust arc ends at ${trustEnd} (warm path stayed warm)`);

/* ══ 4. COLD RUN ════════════════════════════════════════════ */
section("4. COLD RUN — blunt, bluffed, and caught by the phantom");
let c = drive(S.startSceneId);
c = fire(c, "sdh_door");
c = pick(c, "sdc_blunt");
ok((c.state.characterTrust["sd_grimsby"] ?? 0) < 0, "blunt approach costs trust");
/* two wrong presents against the telegram lie */
const m5 = (c.scene.dialogueBeats ?? []).find((b) => b.id === "sdb_m5")!;
for (let i = 0; i < (m5.lie!.wrongEvidenceLimit ?? 2); i++) {
  c.state = applyConsequences(S, m5.lie!.wrongConsequences ?? {}, c.state);
}
const suspAfterBluffs = c.state.meters["Suspicion"] ?? 0;
ok(suspAfterBluffs >= 3, `wrong evidence draws heat (Suspicion ${suspAfterBluffs})`);
c = pick(c, "sdc_into_foyer");
c = pick(c, "sdc_to_corridor");
/* QTE timeout: the engine routes to timedOutTargetSceneId */
const dive = (c.scene.choices ?? []).find((x) => x.id === "sdc_dive")!;
ok(!!dive.timedOutTargetSceneId && dive.timedOutTargetSceneId === "sd_end_caught", "timeout route wired to the caught ending");
c.state = applyConsequences(S, dive.timedOutConsequences ?? {}, c.state);
const caught = sceneById.get(dive.timedOutTargetSceneId!)!;
ok(caught.isEnding && caught.endingData?.tier === "gameover", "…and it is a game-over");
/* cold-press interrogation math: blunt run should CLAMP */
const coldTrust = -1; // blunt only
ok(interrogationOutcome(q, coldTrust) === "clamped", "cold press run clamps instead of cracking");

/* ══ 5. HEAT ════════════════════════════════════════════════ */
section("5. HEAT — the sheriff takes the night off");
let h = drive(S.startSceneId);
h.state = { ...h.state, meters: { ...h.state.meters, Suspicion: (S.briefing?.heatLimit ?? 8) - 1 } };
ok(heatBustTarget(S, h.state) === null, "one under the limit: no bust");
h.state = { ...h.state, meters: { ...h.state.meters, Suspicion: S.briefing?.heatLimit ?? 8 } };
ok(heatBustTarget(S, h.state) === "sd_end_busted", "at the limit the sheriff busts the gang");

/* ══ 6. Bookkeeping ═════════════════════════════════════════ */
section("6. Bookkeeping");
const endings = S.scenes.filter((s) => s.isEnding);
ok(endings.filter((s) => s.endingData?.tier.startsWith("victory")).length === 2, "two victory endings");
ok(endings.filter((s) => s.endingData?.tier === "gameover").length === 3, "three game-over endings");
for (const it of S.items) {
  const granted =
    S.scenes.some((s) => (s.hotspots ?? []).some((hh) => hh.action.itemGranted === it.id)) ||
    S.scenes.some((s) => (s.choices ?? []).some((cc) => cc.consequences?.addItems?.includes(it.id))) ||
    S.scenes.some((s) => (s.hotspots ?? []).some((hh) => hh.action.patternPuzzle?.rewardConsequences?.addItems?.includes(it.id)));
  ok(granted, `item ${it.name} (${it.id}) is granted somewhere`);
}

/* every referenced image exists under public/ */
const referenced = new Set<string>([S.coverImage]);
for (const s of S.scenes) {
  referenced.add(s.background);
  for (const b of s.dialogueBeats ?? []) if (b.background) referenced.add(b.background);
}
const missing = [...referenced].filter((u) => !u.startsWith("gradient:") && !existsSync(`public${u}`));
ok(missing.length === 0, `all ${referenced.size} referenced images on disk${missing.length ? " — missing: " + missing.join(", ") : ""}`);
/* every ending has its own plate (no two endings share a background) */
const endingBgs = endings.map((s) => s.background);
ok(new Set(endingBgs).size === endingBgs.length, "all five endings have distinct plates");

/* ══ 7. Slicer recovery regression (pass-2 fix) ══════════════ */
section("7. Slicer — bridged-plate recovery (pass-2 fix)");
{
  const tmp = mkdtempSync(`${tmpdir()}/slicer-regression-`);
  try {
    const out = `${tmp}/recovered.png`;
    const r = spawnSync(process.execPath, [
      "scripts/make-sprite-sheet.mjs",
      "--in", "plates/sd-phantom-talk.png", // the pass-1 bridged plate, committed as a fixture
      "--out", out,
      "--key", "ff00ff", "--height", "384", "--frames", "3",
    ], { encoding: "utf8" });
    ok(r.status === 0, "slicer exits 0 on the bridged plate");
    ok((r.stdout ?? "").includes("3 frame(s)"), `slicer finds 3 frames ("${(r.stdout ?? "").trim()}")`);
    ok((r.stderr ?? "").includes("bridged plate: split"), "recovery logged a waist split");
    ok(existsSync(out), "recovered sheet written");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

console.log(`\n══ ${pass} passed, ${fail} failed ══`);
if (fail > 0) process.exit(1);
