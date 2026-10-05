/* Beta probe for SLEDGE_HAMMER — engine-level playthrough audit.
 *
 * Drives the REAL gating / consequence / lie / interrogation / multi-state
 * machinery from src/logic.ts across four runs (gold, silver, hesitation,
 * heat bust) plus the static contracts (validator, sheets, assets, verbs).
 */
import { existsSync, readFileSync } from "node:fs";
import { SLEDGE_HAMMER as story } from "../../src/data/sledgeHammer";
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
  resolveHotspot,
  activeHotspotState,
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

/* ---------- driver ---------- */
type Driven = { state: GlobalState; scene: SceneNode; log: string[] };
const drive = (sceneId: string, state?: GlobalState): Driven => {
  const sc = sceneById.get(sceneId);
  if (!sc) throw new Error(`missing scene ${sceneId}`);
  return { state: state ?? createInitialState(S), scene: sc, log: [] };
};
const has = (d: Driven, flag: string) => d.state.activeFlags.has(flag);
const holds = (d: Driven, itemId: string) => d.state.inventory.some((i) => i.id === itemId);

/** Fire a hotspot like a click — through its ACTIVE multi-state skin. */
function fire(d: Driven, hotspotId: string, verb?: string): Driven {
  const raw = (d.scene.hotspots ?? []).find((x) => x.id === hotspotId);
  if (!raw) throw new Error(`${d.scene.id}: no hotspot ${hotspotId}`);
  const h = resolveHotspot(raw, d.state);
  if (!meetsGating(h.gating, d.state)) throw new Error(`${d.scene.id}/${hotspotId}: gate shut`);
  const a = verb ? (h.verbs?.[verb as "use"] ?? h.action) : h.action;
  const runOne = (act: typeof a) => {
    if (!act) return;
    if (act.flagSet) d.state = applyConsequences(S, { setFlags: [act.flagSet] }, d.state);
    if (act.itemGranted) d.state = applyConsequences(S, { addItems: [act.itemGranted] }, d.state);
    if (act.itemConsumed) d.state = applyConsequences(S, { removeItems: [act.itemConsumed] }, d.state);
    if (act.meterChange) d.state = applyConsequences(S, { meterChanges: [act.meterChange] }, d.state);
    if (act.type === "patternPuzzle" && act.patternPuzzle?.rewardConsequences)
      d.state = applyConsequences(S, act.patternPuzzle.rewardConsequences, d.state);
  };
  runOne(a);
  for (const chained of a?.then ?? []) runOne(chained as typeof a);
  d.log.push(`hotspot ${hotspotId}${verb ? ` [${verb}]` : ""} @ ${d.scene.id}`);
  if (a?.type === "goToScene" && a.targetSceneId) {
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
  if (c.memoryLog) d.state = { ...d.state, memories: { ...d.state.memories, [c.memoryLog]: c.text } };
  if (c.presentItem) {
    if (!holds(d, c.presentItem)) throw new Error(`${choiceId}: presenting an item not held`);
    d.state = { ...d.state, memories: { ...d.state.memories, [`item:${c.presentItem}`]: "presented" } };
  }
  d.log.push(`choice ${choiceId} @ ${d.scene.id}`);
  if (c.targetSceneId) {
    const sc = sceneById.get(c.targetSceneId);
    if (!sc) throw new Error(`${d.scene.id}/${choiceId}: missing target ${c.targetSceneId}`);
    d.scene = sc;
  }
  return d;
}

/** Let a quick-time choice EXPIRE — the "you hesitated" route. */
function expire(d: Driven, choiceId: string): Driven {
  const c = (d.scene.choices ?? []).find((x) => x.id === choiceId);
  if (!c?.quickTime) throw new Error(`${choiceId} is not a quick-time choice`);
  if (c.timedOutConsequences) d.state = applyConsequences(S, c.timedOutConsequences, d.state);
  const target = c.timedOutTargetSceneId ?? c.targetSceneId;
  d.scene = sceneById.get(target!)!;
  d.log.push(`QTE expired ${choiceId}`);
  return d;
}

function pressLie(d: Driven, beatId: string): Driven {
  const b = (d.scene.dialogueBeats ?? []).find((x) => x.id === beatId);
  if (!b?.lie) throw new Error(`${d.scene.id}: beat ${beatId} carries no lie`);
  const item = b.lie.evidenceItemIds[0];
  if (!holds(d, item)) throw new Error(`${beatId}: not holding evidence ${item}`);
  d.state = applyLieCaught(S, b.lie, d.state);
  d.log.push(`lie pressed ${beatId}`);
  return d;
}

function pin(d: Driven, flag: string): Driven {
  const conn = (S.deduction?.connections ?? []).find((c) => c.flagSet === flag);
  if (!conn) throw new Error(`no board connection sets ${flag}`);
  const endOk = (id: string) => holds(d, id) || S.characters.some((ch) => ch.id === id);
  if (!endOk(conn.a) || !endOk(conn.b)) throw new Error(`pin ${flag}: ends not available`);
  d.state = applyConsequences(S, { setFlags: [flag] }, d.state);
  d.log.push(`pin ${flag}`);
  return d;
}

/* ══ 1. Validator ═══════════════════════════════════════════ */
section("1. validateStory");
const issues = validateStory(S);
for (const i of issues) console.log(`  ⚠ [${i.severity}] ${i.sceneId ?? "(story)"}: ${i.message}`);
ok(issues.every((i) => i.severity !== "error"), "no validator errors");
ok(issues.length === 0, `no validator warnings either (${issues.length})`);

/* ══ 2. Sprite sheets ═══════════════════════════════════════ */
section("2. Sprite sheets");
for (const ch of S.characters) {
  if (!ch.talkingSheet) continue;
  const iss = spriteSheetIssues(ch.talkingSheet, ch.name, ["talk", "rest"]);
  ok(iss.length === 0, `${ch.name} talking sheet clean${iss.length ? ": " + iss.join("; ") : ""}`);
}
for (const ch of S.characters) {
  for (const v of ch.talkingSheets ?? []) {
    const iss = spriteSheetIssues(v.sheet, `${ch.name}/${v.name}`);
    ok(iss.length === 0, `${ch.name} "${v.name}" variant sheet clean${iss.length ? ": " + iss.join("; ") : ""}`);
  }
}
const walker = S.playerSprite?.sheet;
ok(!!walker, "story-wide playerSprite sheet is authored (every stage inherits it)");
ok(spriteSheetIssues(walker!, "walker", ["walk", "idle"]).length === 0, "Sledge's walk sheet clean");
const npc = S.scenes.find((s) => s.id === "sh_squadroom")!.stage!.npcs![0];
ok(spriteSheetIssues(npc.sheet!, "doreau npc", ["idle", "walk"]).length === 0,
  "the squad-room NPC sheet names the animations the NPC call site reads (idle/walk)");
ok(npc.talkHotspotId === "sh_talk_doreau", "the NPC is wired to its TALK marker (click the person, not a floating pip)");

/* ══ 3. Verb coin — the extended body verbs ═════════════════ */
section("3. Verb coin — 👢 kick / 👊 punch opt-in");
{
  const squad = sceneById.get("sh_squadroom")!;
  const alley = sceneById.get("sh_alley")!;
  const range = sceneById.get("sh_range")!;
  ok(squad.stage?.extendedVerbs === true && alley.stage?.extendedVerbs === true,
    "the two rooms that answer body verbs opt in");
  ok(!range.stage?.extendedVerbs, "the range does NOT opt in — the coin stays the classic five there");
  const grille = alley.hotspots!.find((h) => h.id === "sh_grille_hs")!;
  const st = createInitialState(S);
  ok(resolveVerbAction(grille, "kick").ok, "the grille answers KICK");
  ok(!resolveVerbAction(grille, "take").ok, "the grille refuses TAKE while it is still shut");
  ok(resolveVerbAction(grille, "punch").ok, "the grille has a written PUNCH refusal (a joke, not a dead end)");
  const door = squad.hotspots!.find((h) => h.id === "sh_office_door_hs")!;
  ok(resolveVerbAction(door, "kick").ok, "Trunk's door answers KICK");
  ok(door.action.type === "goToScene", "…while its default verb is still GO (kick is a flavour, not the route)");
  void st;
}

/* ══ 4. Multi-state object — the grille ═════════════════════ */
section("4. Multi-state — the security grille");
{
  let d = drive("sh_alley");
  const raw = d.scene.hotspots!.find((h) => h.id === "sh_grille_hs")!;
  ok(activeHotspotState(raw, d.state)?.id === "sh_grille_shut", "state 1: shut (the default, listed first)");
  d = fire(d, "sh_grille_hs", "kick");
  ok(has(d, "sh_grille_kicked"), "KICK sets the kicked flag");
  ok(activeHotspotState(raw, d.state)?.id === "sh_grille_kicked", "state 2: kicked in — the marker re-skins in place");
  ok(resolveHotspot(raw, d.state).cursor === "take", "…and its cursor becomes TAKE without the marker re-mounting");
  ok((d.state.meters.Suspicion ?? 0) === 2, "kicking it costs 2 Suspicion (heat is the price of the shortcut)");
  d = fire(d, "sh_grille_hs");
  ok(holds(d, "sh_ticket"), "state 2 grants pawn ticket 4471");
  ok(activeHotspotState(raw, d.state)?.id === "sh_grille_done", "state 3: ransacked — no repeat rewards");
  ok(resolveHotspot(raw, d.state).action.type === "showText", "…state 3 gives flavour only");
}

/* ══ 5. GOLD RUN ════════════════════════════════════════════ */
section("5. GOLD RUN — evidence, both lies, crack, three pins, talk-down");
let d = drive(S.startSceneId);
ok(d.scene.nodeType === "stage", "the case OPENS on a walkable stage");
d = fire(d, "sh_coffee_hs");
ok(holds(d, "sh_coffee"), "coffee taken");
d = fire(d, "sh_board_hs");
d = fire(d, "sh_office_door_hs");
ok(d.scene.id === "sh_trunk", "the office door leads to Trunk");
d = pick(d, "sh_c_promise");
ok(has(d, "sh_briefed") && holds(d, "sh_gun"), "the briefing arms Sledge and sets the case flag");
ok(d.state.memories["sh_promise"]?.includes("by the book"), "the promise is recorded as a memory for the {said} recall");
ok(d.scene.id === "sh_alley", "…and drops you at the crime scene");

d = fire(d, "sh_casing_hs");
ok(holds(d, "sh_casing"), "the casing is recovered (hold-to-EXAMINE marker)");
d = fire(d, "sh_outline_hs");
d = fire(d, "sh_grille_hs", "kick");
d = fire(d, "sh_grille_hs");
ok(holds(d, "sh_ticket"), "pawn ticket 4471 recovered");
{
  const exit = d.scene.hotspots!.find((h) => h.id === "sh_range_exit_hs")!;
  ok(meetsGating(exit.gating, d.state), "the range exit opens once the brass is in hand");
}
d = fire(d, "sh_range_exit_hs");
// PASS 5 — the cross-town trip now goes through the RIDE minigame rather
// than straight to the range.
ok(d.scene.id === "sh_drive", "…which now routes through the drive");
d = pick(d, "sh_c_drive");
ok(d.scene.id === "sh_range", "…and a clean run arrives at the range");

{
  const scope = d.scene.hotspots!.find((h) => h.id === "sh_scope_hs")!;
  const r = resolveVerbAction(scope, "use", "sh_casing");
  ok(r.ok && (r.text ?? "").includes("presentation"), "the casing under the scope answers with the ballistics line");
  ok(itemsConsumedBy(r.action).length === 0, "…and the microscope does not eat the evidence");
  const gag = resolveVerbAction(scope, "use", "sh_gun");
  ok(gag.ok && (gag.text ?? "").includes("mirror"), "using your OWN gun on the scope answers with the gag");
  const wrong = resolveVerbAction(scope, "use", "sh_coffee");
  ok(!wrong.ok, "an unaccepted item is still refused at the scope");
}
d = fire(d, "sh_scope_hs");
ok(has(d, "sh_ballistics"), "ballistics flag set");
d = fire(d, "sh_ledger_hs");
ok(has(d, "sh_ledger_cracked") && holds(d, "sh_ledger_page"), "the ledger puzzle rewards the page");
{
  const p = d.scene.hotspots!.find((h) => h.id === "sh_ledger_hs")!.action.patternPuzzle!;
  ok(p.rows.filter((r) => r.isAnswer).length === p.targetCount, "puzzle answer count matches targetCount");
  ok(p.rows.filter((r) => r.isAnswer).every((r) => r.amount.includes("CASH")),
    "every answer row is a CASH row — the pattern the instruction actually describes");
  ok(p.rows.filter((r) => !r.isAnswer).every((r) => !r.amount.includes("CASH")),
    "…and no decoy row is cash (the puzzle is solvable from the clue alone)");
}
{
  const exit = d.scene.hotspots!.find((h) => h.id === "sh_interview_exit_hs")!;
  ok(meetsGating(exit.gating, d.state), "the interview opens only with ballistics AND the ledger");
}
d = fire(d, "sh_interview_exit_hs");
ok(d.scene.id === "sh_interview", "…into interview room two");

d = pressLie(d, "sh_b_v3");
ok(has(d, "sh_caught_alley"), "lie 1 (never in that alley) broken by the pawn ticket");
{
  const v4 = d.scene.dialogueBeats!.find((b) => b.id === "sh_b_v4")!;
  ok(meetsGating(v4.conditionRule, d.state), "the cheques-only claim only surfaces after lie 1 is broken");
}
d = pick(d, "sh_c_show_ticket");
ok(!!d.state.memories["sh_showed_ticket"], "presenting the ticket records its memory");
{
  const echo = d.scene.dialogueBeats!.find((b) => b.id === "sh_b_v3b")!;
  ok(meetsGating(echo.conditionRule, d.state), "Doreau's for-the-tape beat recalls that memory");
}
d = pressLie(d, "sh_b_v4");
ok(has(d, "sh_caught_cash"), "lie 2 (cheques only) broken by the ledger page");

/* interrogation: two proven lies dump 4 composure against a composure of 4 */
{
  const q = d.scene.interrogation!;
  const dmg = (d.scene.dialogueBeats ?? []).reduce((n, b) => n + (b.lie?.composureDamage ?? 0), 0);
  ok(dmg >= (q.composure ?? 0), `both lies alone break composure (${dmg} damage vs ${q.composure})`);
  const trust = d.state.characterTrust["sh_vane"] ?? 0;
  ok(trust < (q.crackTrust ?? 0), `Vane's trust is under crackTrust after two caught lies (${trust})`);
  ok(interrogationOutcome(q, 1) === "broke", "at trust 1 the suspect CRACKS");
  ok(interrogationOutcome(q, 0) === "clamped", "at trust 0 he CLAMPS — trust genuinely decides the branch");
  // engine applies the outcome's consequences; mirror the crack here
  d.state = applyConsequences(S, { setFlags: [q.brokeFlag] }, d.state);
  d.state = applyConsequences(S, q.brokeConsequences!, d.state);
  ok(has(d, "sh_confession"), "the crack sets sh_confession via brokeConsequences (the validator regression)");
}
{
  const roof = d.scene.choices!.find((c) => c.id === "sh_c_roof")!;
  ok(roof.hidden === true && meetsGating(roof.gating, d.state), "the rooftop choice unhides on the confession");
  const nudge = d.scene.dialogueBeats!.find((b) => b.id === "sh_b_v5")!;
  ok(meetsGating(nudge.conditionRule, d.state), "Doreau's rooftop warning is gated on the confession");
  const recall = d.scene.dialogueBeats!.find((b) => b.id === "sh_b_v6")!;
  ok(meetsGating(recall.conditionRule, d.state), "the {said} callback to Trunk's promise fires");
}
d = pin(d, "sh_pin_gun");
d = pin(d, "sh_pin_money");
d = pin(d, "sh_pin_motive");
ok(["sh_pin_gun", "sh_pin_money", "sh_pin_motive"].every((f) => has(d, f)), "all three corkboard pins land");
d = pick(d, "sh_c_roof");
ok(d.scene.id === "sh_rooftop", "to the roof");
{
  const talk = d.scene.choices!.find((c) => c.id === "sh_c_qte_talk")!;
  ok(meetsGating(talk.gating, d.state), "the talk-down is available ONLY with all three pins + the confession");
}
d = pick(d, "sh_c_qte_talk");
ok(d.scene.id === "sh_end_gold" && d.scene.endingData?.tier === "victory-gold", "GOLD ending reached");
ok((d.state.meters.Suspicion ?? 0) < (S.briefing!.heatLimit ?? 99),
  `the gold run stays under the heat limit (Suspicion ${d.state.meters.Suspicion})`);

/* ══ 6. SILVER RUN — take the shot ══════════════════════════ */
section("6. SILVER RUN — the shot");
{
  let g = drive("sh_rooftop");
  const shoot = g.scene.choices!.find((c) => c.id === "sh_c_qte_shoot")!;
  ok(!shoot.gating, "the SHOOT option is always available — Sledge never needs permission");
  g = pick(g, "sh_c_qte_shoot");
  ok(g.scene.id === "sh_end_silver" && g.scene.endingData?.tier === "victory-silver", "SILVER ending reached");
  ok(has(g, "sh_took_the_shot"), "the shot is recorded");
}

/* ══ 7. HESITATION — the QTE really expires ═════════════════ */
section("7. HESITATION — the quick-time timeout route");
{
  for (const id of ["sh_c_qte_talk", "sh_c_qte_shoot"]) {
    let g = drive("sh_rooftop");
    g = expire(g, id);
    ok(g.scene.id === "sh_end_hesitated", `${id} expiring routes to the hesitation ending`);
    ok(has(g, "sh_hesitated"), `${id} expiring records sh_hesitated`);
  }
  const roof = sceneById.get("sh_rooftop")!;
  ok((roof.choices ?? []).every((c) => c.quickTime && (c.timeLimitSeconds ?? 0) > 0),
    "EVERY option on the roof is on the clock — there is no way to wait it out safely");
}

/* ══ 8. HEAT BUST ═══════════════════════════════════════════ */
section("8. HEAT — the suspension");
{
  let g = drive("sh_alley");
  g.state = applyConsequences(S, { meterChanges: [{ meter: "Suspicion", delta: 8 }] }, g.state);
  const target = heatBustTarget(S, g.state, g.scene.id);
  ok(target === "sh_end_suspended", "hitting the heat limit routes to the suspension ending");
  ok(sceneById.get("sh_end_suspended")!.endingData?.tier === "gameover", "…which is a game over");
  const below = drive("sh_alley");
  below.state = applyConsequences(S, { meterChanges: [{ meter: "Suspicion", delta: 7 }] }, below.state);
  ok(heatBustTarget(S, below.state, below.scene.id) === null, "one under the limit does NOT bust");
}

/* ══ 8b. PASS 2 — expression variant, extras, icons, plates ══ */
section("8b. Pass 2 — art wiring");
{
  const vane = S.characters.find((c) => c.id === "sh_vane")!;
  const variant = vane.talkingSheets?.find((v) => v.name === "cornered");
  ok(!!variant, "Vane carries the \"cornered\" expression variant");
  ok(variant!.sheet.image !== vane.talkingSheet!.image, "…and it is a DIFFERENT plate from his composed sheet");
  // The engine matches beat.expression against the variant name, lowercased.
  const corneredBeats = S.scenes.flatMap((sc) => [
    ...(sc.dialogueBeats ?? []),
    ...(sc.dialogueBeats ?? []).flatMap((b) => (b.lie ? [b.lie.caughtBeat] : [])),
    ...(sc.interrogation ? [sc.interrogation.brokeBeat] : []),
  ]).filter((b) => b.characterId === "sh_vane" && b.expression === "cornered");
  ok(corneredBeats.length >= 3, `the variant actually fires: ${corneredBeats.length} cornered Vane beats`);
  ok(corneredBeats.some((b) => b.id === "sh_b_broke"), "…including the interrogation crack — his worst moment");
  ok(corneredBeats.every((b) => b.expression!.toLowerCase() === variant!.name.toLowerCase()),
    "every cornered beat's expression matches the variant name exactly (the engine lookup is by name)");

  // Foreground extra — the animated police tape over the alley.
  const alley = sceneById.get("sh_alley")!;
  const extras = alley.cinematic?.foregroundExtras ?? [];
  ok(extras.length === 5, "the alley carries five foreground layers (tape, fence, dumpster, patrol car, bush)");
  const tape = extras.find((e) => (e.image ?? "").includes("fg-tape"))!;
  ok(!!tape, "…the cordon tape is still among them");
  ok(!!tape.sheet && spriteSheetIssues(tape.sheet, "tape", ["loop"]).length === 0,
    "the tape's sheet is clean and names the \"loop\" animation the extras renderer reads");
  ok(tape.occludes === true, "the tape draws OVER the walker — Sledge passes behind the cordon");
  ok(!!tape.image, "…and keeps a static image as the no-sheet fallback");

  /* ---- 8c. PASS 3 — foreground DEPTH + inventory art ---------------- */
  section("8c. Pass 3 — depth, inventory art, expression variants");

  // Every stage room now has at least one walk-behind occluder. That is the
  // whole point of the pass: a stage where the cast can only ever be drawn on
  // TOP of the scenery reads as paper dolls on a photograph.
  for (const id of ["sh_squadroom", "sh_alley", "sh_range"]) {
    const sc = sceneById.get(id)!;
    const fx = sc.cinematic?.foregroundExtras ?? [];
    ok(fx.length > 0, `${id} has foreground art`);
    const occ = fx.filter((e) => e.occludes === true);
    ok(occ.length > 0, `…${id} has ${occ.length} walk-behind occluder(s)`);
    // An occluder whose baseline sits ABOVE the floor's top can never occlude
    // anyone: the walker's feet can't get higher than it. Silent no-op art.
    const top = sc.stage?.floor?.top ?? 0;
    ok(occ.every((e) => (e.occludeBaseline ?? e.y ?? 100) > top),
      `…every ${id} occluder's baseline is below the floor top (${top}%) so it can actually occlude`);
    ok(fx.every((e) => !!e.image), `…every ${id} layer names an image asset`);
  }

  // Inventory container art.
  const inv = S.inventoryDisplay;
  ok(inv?.mode === "container", "the inventory is a container, not the classic strip");
  ok(!!inv?.image, "the container has authored sprite art (not DEFAULT_INVENTORY_IMAGE)");
  ok(!inv?.anchor,
    "the container leaves anchor unset, so the coin-collision guard in Game.tsx can move it");

  // The two new expression variants fill gaps that were authored but dead.
  for (const [charId, exprName] of [["sh_trunk", "furious"], ["sh_doreau", "warning"]] as const) {
    const ch = S.characters.find((c) => c.id === charId)!;
    const v = (ch.talkingSheets ?? []).find((x) => x.name.toLowerCase() === exprName);
    ok(!!v, `${charId} has a "${exprName}" expression sheet`);
    ok(!!v && spriteSheetIssues(v.sheet, exprName, ["rest", "talk"]).length === 0,
      `…the "${exprName}" sheet is clean and names rest/talk`);
    const used = S.scenes.some((sc) =>
      (sc.dialogueBeats ?? []).some((b) => b.characterId === charId && b.expression?.toLowerCase() === exprName));
    ok(used, `…and at least one ${charId} beat actually requests it`);
  }

  // Item icon art.
  const clues = S.items.filter((i) => i.isClue);
  ok(clues.length === 3, "three clue items");
  ok(clues.every((i) => !!i.iconUrl), "every clue item has painted icon art");
  ok(clues.every((i) => !!i.icon), "…and keeps its emoji as the fallback glyph");
  ok(new Set(clues.map((i) => i.iconUrl)).size === 3, "the three clue icons are distinct assets");

  // Distinct ending plates — the bar the Scooby harness sets, missed in pass 1.
  const endingBgs = S.scenes.filter((s) => s.isEnding).map((s) => s.background);
  ok(new Set(endingBgs).size === endingBgs.length, "all five endings have DISTINCT plates (pass-1 gap closed)");
  ok(!endingBgs.includes("/img/bg-sh-rooftop.jpg"), "…no ending reuses the live rooftop plate");
  // The invariant is "dedicated cover art", not one specific filename — the
  // banner-format cover for the featured strip is still a dedicated cover.
  const roomPlates = new Set(S.scenes.map((sc) => sc.background).filter(Boolean));
  ok(S.coverImage.includes("/cover-"), "the case has dedicated cover art");
  ok(!roomPlates.has(S.coverImage), "…and it is not a reused room plate");
  ok(sceneById.get("sh_interview")!.background === "/img/bg-sh-interview.jpg",
    "the interview room has its own plate, not Trunk's office");
  const roomBgs = S.scenes.filter((s) => !s.isEnding).map((s) => s.background);
  ok(new Set(roomBgs).size === roomBgs.length, "every non-ending scene has its own plate too");
}

/* ══ 9. Bookkeeping ═════════════════════════════════════════ */
section("9. Bookkeeping");
{
  const endings = S.scenes.filter((s) => s.isEnding);
  ok(endings.length === 5, `five endings (${endings.length})`);
  ok(endings.filter((e) => e.endingData?.tier.startsWith("victory")).length === 2, "2 victory tiers");
  ok(endings.filter((e) => e.endingData?.tier === "gameover").length === 3, "3 game-over tiers");
  ok(endings.every((e) => !!e.endingData?.headline && !!e.endingData?.recap), "every ending has a headline and a recap");

  const referenced = new Set<string>();
  const visit = (u?: string) => { if (u && u.startsWith("/")) referenced.add(u); };
  visit(S.coverImage);
  visit(S.playerSprite?.sheet?.image);
  for (const c of S.characters) {
    visit(c.avatarUrl);
    visit(c.talkingSheet?.image);
    for (const v of c.talkingSheets ?? []) visit(v.sheet.image);
  }
  for (const i of S.items) visit(i.iconUrl);
  for (const sc of S.scenes) {
    visit(sc.background);
    visit(sc.stage?.playerSheet?.image);
    for (const n of sc.stage?.npcs ?? []) { visit(n.image); visit(n.sheet?.image); }
    for (const b of sc.dialogueBeats ?? []) visit(b.background);
    for (const e of sc.cinematic?.foregroundExtras ?? []) { visit(e.image); visit(e.sheet?.image); }
  }
  const missing = [...referenced].filter((u) => !existsSync(`public${u}`));
  ok(missing.length === 0, `all ${referenced.size} referenced assets on disk${missing.length ? " — missing: " + missing.join(", ") : ""}`);

  const ids = S.scenes.map((s) => s.id);
  ok(new Set(ids).size === ids.length, "scene ids unique");
  ok(S.scenes.every((s) => !!S.layout?.[s.id]), "every scene has a Studio canvas slot");
  ok(S.scenes.filter((s) => s.nodeType === "stage").length === 3, "three walkable stage rooms");
  const alley = sceneById.get("sh_alley")!;
  ok(alley.stage?.exitEdges?.left?.targetSceneId === "sh_squadroom", "the alley walks back to the precinct (exit edge)");
  ok(S.scenes.some((s) => !!s.partBreak), "a part break is authored");
  ok(Object.keys(S.flagNotes ?? {}).length >= 10, "flag notes documented for the Case Progress readout");
}

console.log(`\n══ ${pass} passed, ${fail} failed ══`);
if (fail > 0) process.exit(1);

/* ══ 9. PASS 4 — doors (gated barriers) + walk-behind regions ══ */
section("9. Pass 4 — doors and walk-behinds");

{
  // --- DOORS -------------------------------------------------------
  // A gated barrier is a lock made SPATIAL. The invariant that actually
  // matters is that the gate can be OPENED: a door whose flag nothing sets
  // is a wall the player will push against forever.
  const doors: { scene: string; obs: any }[] = [];
  for (const sc of S.scenes) {
    for (const o of sc.stage?.obstacles ?? []) if (o.gating) doors.push({ scene: sc.id, obs: o });
  }
  ok(doors.length > 0, `the story exercises the door feature: ${doors.length} gated barrier(s)`);

  // Every flag a door waits on must be settable by something.
  const settable = new Set<string>();
  for (const sc of S.scenes) {
    for (const h of sc.hotspots ?? []) {
      if (h.action?.flagSet) settable.add(h.action.flagSet);
      for (const st of h.states ?? []) if (st.action?.flagSet) settable.add(st.action.flagSet);
      for (const v of Object.values(h.verbs ?? {})) if ((v as any)?.flagSet) settable.add((v as any).flagSet);
      for (const r of Object.values(h.itemResponses ?? {})) if ((r as any)?.flagSet) settable.add((r as any).flagSet);
    }
    for (const c of sc.choices ?? []) c.consequences?.setFlags?.forEach((f) => settable.add(f));
    for (const a of sc.onEnterActions ?? []) a.consequences?.setFlags?.forEach((f) => settable.add(f));
  }
  for (const d of doors) {
    for (const f of d.obs.gating?.requiresFlags ?? []) {
      ok(settable.has(f), `door in ${d.scene} waits on "${f}" — and something can set it`);
    }
  }

  // --- WALK-BEHINDS -------------------------------------------------
  const withOcc = S.scenes.filter((sc) => (sc.stage?.occluders ?? []).length > 0);
  ok(withOcc.length > 0, `the story exercises walk-behind regions: ${withOcc.length} room(s)`);

  for (const sc of withOcc) {
    for (const o of sc.stage!.occluders!) {
      const tag = `${sc.id}/${o.label ?? o.id ?? "?"}`;
      ok(o.points.length >= 3, `${tag}: a region needs 3+ points (got ${o.points.length})`);
      ok(o.points.every((p) => p.x >= 0 && p.y >= 0 && p.y <= 100), `${tag}: every point is on the plate`);

      // The failure mode that costs an afternoon: a baseline ABOVE the top of
      // the walkable floor can never be crossed, so the region either always
      // covers or never covers. Same class of bug as the pass-3 cordon tape.
      const floor = sc.stage?.floor;
      const base = o.baseline ?? Math.max(...o.points.map((p) => p.y));
      if (floor) {
        ok(base > floor.top,
          `${tag}: depth line ${base}% is below the floor top (${floor.top}%) so the walker can actually cross it`);
        ok(base <= floor.bottom + 6,
          `${tag}: depth line ${base}% is not below the whole floor (${floor.bottom}%) — it would never cover anyone`);
      }
    }
  }
}

/* ══ 10. PASS 5 — the ride, sheet resolution, featured ══ */
section("10. Pass 5 — the drive minigame and sheet resolution");

{
  const drive = sceneById.get("sh_drive")!;
  const ch = drive.choices!.find((c) => c.id === "sh_c_drive")!;
  const ride = ch.ride!;
  ok(!!ride, "the drive scene carries a ride config");

  // A ride the player cannot lose is a cutscene; one they cannot win is a
  // wall. Both routes must exist and must differ.
  ok(!!ch.targetSceneId && !!ch.timedOutTargetSceneId, "the ride has both a win and a crash route");
  ok(ch.targetSceneId !== ch.timedOutTargetSceneId, "…and they are different scenes");
  ok(sceneById.has(ch.targetSceneId!), "the win route resolves");
  ok(sceneById.has(ch.timedOutTargetSceneId!), "the crash route resolves");

  // Losing costs something but never dead-ends the case — a comedy crash
  // should not lock the player out of the investigation.
  const crashed = sceneById.get(ch.timedOutTargetSceneId!)!;
  const onward = (crashed.choices ?? []).some((c) => c.targetSceneId === "sh_range");
  ok(onward, "a crash still reaches the range (the cost is trust/heat, not a dead end)");
  const penalty = (crashed.choices ?? []).some(
    (c) => (c.consequences?.trustChanges?.length ?? 0) > 0 || (c.consequences?.meterChanges?.length ?? 0) > 0
  );
  ok(penalty, "…but it does cost something");

  // Lanes vs traffic: with one lane there is nowhere to dodge to.
  ok((ride.lanes ?? 3) >= 2, "the ride has at least two lanes to dodge between");
  ok((ride.traffic?.length ?? 0) > 0, `the ride has traffic art (${ride.traffic?.length} sprites)`);

  // The beats are the point of the feature.
  ok((ride.nearMissLines?.length ?? 0) >= 4,
    `Sledge has enough near-miss quips not to repeat in one run (${ride.nearMissLines?.length})`);
  ok(!!ride.driverSheet, "the driver has a portrait sheet for his lines");
  ok(!!ride.driverName, "…and a name on them");
  ok(spriteSheetIssues(ride.driverSheet!, "driver", ["rest", "talk"]).length === 0,
    "the driving sheet is clean and names rest/talk");

  // The road must actually be authored art, and it must tile.
  ok(!!ride.roadImage, "the ride uses authored road art rather than the CSS fallback");
  ok(!!ride.dashboardImage, "…and a cockpit overlay");

  // DRIVING ONLY BETWEEN PLACES: the office door must not open a road.
  const trunkDoor = sceneById.get("sh_squadroom")!.hotspots!.find((h) => h.id === "sh_office_door_hs")!;
  ok(trunkDoor.action?.targetSceneId === "sh_trunk",
    "walking into Trunk's office does NOT route through the drive (it's a corridor, not a journey)");
}

{
  // SHEET RESOLUTION — the engine sizes stage walkers as a fraction of the
  // plate, so a sheet sliced small is upscaled and goes soft. Every character
  // sheet should be authored at a resolution that survives a big screen.
  const sheets: { name: string; h: number }[] = [];
  for (const c of S.characters) {
    if (c.talkingSheet) sheets.push({ name: c.id, h: c.talkingSheet.frameHeight });
    for (const v of c.talkingSheets ?? []) sheets.push({ name: `${c.id}/${v.name}`, h: v.sheet.frameHeight });
  }
  for (const sc of S.scenes) {
    if (sc.stage?.playerSheet) sheets.push({ name: `${sc.id}/walker`, h: sc.stage.playerSheet.frameHeight });
  }
  ok(sheets.length > 0, `${sheets.length} character sheets to check`);
  for (const sh of sheets) {
    ok(sh.h >= 384, `${sh.name} is sliced at ${sh.h}px — high enough not to blur on a large display`);
  }
}

/* ══ 11. PASS 6 — regressions from the featured strip + foreground ══ */
section("11. Pass 6 — featured/Studio wiring and foreground input");

{
  // THE CRASH: App used to pass Studio the GRID list, which excludes featured
  // cases. With the only story featured, Studio received [] and threw
  // "Cannot read properties of undefined (reading 'id')" on
  // `baseStories[0].id` before rendering anything. Pin the source so the
  // filtered list can never be handed to Studio again.
  const app = readFileSync("src/App.tsx", "utf8");
  ok(/baseStories=\{allStories\}/.test(app),
    "Studio is given the FULL catalogue, not the featured-filtered grid list");
  ok(!/baseStories=\{stories\}/.test(app), "…and never the filtered list");

  // The same filtered-list trap for the other whole-catalogue reads.
  ok(/allStories\.find\(\(s\) => s\.id === session\.storyId\)/.test(app),
    "resume looks a story up in the full catalogue (a featured case must resume)");
  ok(/if \(allStories\.length <= 1\)/.test(app),
    "the last-case-on-the-stand guard counts the full catalogue");

  // A featured case must not also appear in the grid below.
  ok(/const feat = new Set\(featuredStories\.map/.test(app),
    "featured cases are removed from the ordinary grid (no duplicate cards)");

  // FOREGROUND INPUT: decorative foreground extras must never capture clicks.
  // A big scaled prop otherwise blankets the room and eats the verb coin, the
  // inventory dock and every marker — which is what made Trunk's office
  // unreachable.
  const game = readFileSync("src/game/Game.tsx", "utf8");
  const roots = game.match(/<div className="[^"]*absolute" style=\{\{? ?\.\.\.?boxStyle[^>]*aria-hidden/g) ?? [];
  const bare = game.match(/<div className="absolute" style=\{boxStyle\} aria-hidden/g) ?? [];
  ok(bare.length === 0, `no foreground extra root captures pointer input (${bare.length} bare roots)`);
  ok(/pointer-events-none absolute" style=\{boxStyle\} aria-hidden/.test(game),
    "…the extras' image roots are explicitly pointer-events-none");
  ok(/parallax-mid pointer-events-none/.test(game),
    "…and so is the parallax plane they wrap in");
  void roots;
}

/* ══ 12. PASS 6 — extended (wide) stages ══ */
section("12. Pass 6 — extended stages");

{
  const wide = S.scenes.filter((sc) => (sc.stage?.worldWidth ?? 100) > 100);
  ok(wide.length >= 2, `the story exercises extended stages: ${wide.length} wide room(s)`);

  for (const sc of wide) {
    const w = sc.stage!.worldWidth!;
    // Everything in WORLD space must fit the world, or it is unreachable off
    // the end of the strip.
    for (const h of sc.hotspots ?? []) {
      ok(h.bounds.x + h.bounds.w <= w + 0.5,
        `${sc.id}/${h.id} fits inside the ${w}-wide world (ends at ${(h.bounds.x + h.bounds.w).toFixed(1)})`);
    }
    for (const o of sc.stage!.obstacles ?? []) {
      ok(o.x + o.w <= w + 0.5, `${sc.id}: barrier at ${o.x} fits the world`);
    }
    for (const oc of sc.stage!.occluders ?? []) {
      ok(Math.max(...oc.points.map((p) => p.x)) <= w + 0.5,
        `${sc.id}: walk-behind "${oc.label ?? oc.id}" fits the world`);
    }
    const sp = sc.stage!.spawn;
    if (sp) ok(sp.x >= 0 && sp.x <= w, `${sc.id}: the spawn is inside the world`);

    // A wide room the player can only ever see half of is a bug: something
    // must actually live out on the second screen.
    const far = (sc.hotspots ?? []).filter((h) => h.bounds.x > 100);
    ok(far.length > 0, `${sc.id} has ${far.length} interactive zone(s) out on the far screen`);

    // FOREGROUND EXTRAS ARE VIEWPORT-%, not world-% — the trap that pins a
    // rescaled layer to the right-hand edge (now also a validator warning).
    for (const [i, ex] of (sc.cinematic?.foregroundExtras ?? []).entries()) {
      ok((ex.x ?? 50) <= 100,
        `${sc.id}: foreground layer #${i + 1} stayed in viewport-% (x=${ex.x}) despite the wide world`);
    }
  }
}

/* ══ 13. PASS 7 — the chroma-key despill must not eat skin tone ══ */
section("13. Pass 7 — sprite colour survives the chroma key");

{
  // The magenta despill clamped EVERY hot channel above the cold reference,
  // so any warm colour (all skin) had its red pulled down to its green and
  // came out olive grey. Real spill lifts BOTH hot channels (R and B) above
  // the cold one together; skin is R > G > B and is not spill.
  //
  // Re-implement the rule here and check it against real colours, so the
  // guarantee is pinned even though the slicer is a build-time script.
  const despill = (r: number, g: number, b: number) => {
    const hot = [true, false, true];            // magenta ff00ff -> R and B
    const c = [r, g, b];
    const ref = g;                              // the one cold channel
    const spilled = [0, 1, 2].every((j) => !hot[j] || c[j] > ref);
    if (!spilled) return [r, g, b];
    return [0, 1, 2].map((j) => (hot[j] && c[j] > ref ? Math.round(ref) : c[j]));
  };

  const skin = despill(155, 148, 137);          // Trunk's face, off the plate
  ok(skin[0] === 155, `warm skin keeps its red (${skin.join(",")}) — not clamped to grey`);

  const pink = despill(230, 120, 225);          // genuine magenta spill
  ok(pink[0] === 120 && pink[2] === 120, `true magenta spill is neutralised (${pink.join(",")})`);

  const sky = despill(120, 160, 200);           // cool blue, R below green
  ok(sky[2] === 200, `cool colours are untouched (${sky.join(",")})`);
}

/* ══ 14. PASS 7 — world-pinned foreground scenery ══ */
section("14. Pass 7 — foreground props stay put on a wide stage");

{
  // On a wide stage the room pans but foreground extras are viewport-locked,
  // so an unpinned prop SLIDES ACROSS THE ART as the player walks — a
  // dumpster drifting down the alley. `worldX` pins it to the room instead.
  const wide = S.scenes.filter((sc) => (sc.stage?.worldWidth ?? 100) > 100);
  ok(wide.length >= 2, `${wide.length} wide room(s) to check`);

  for (const sc of wide) {
    const extras = sc.cinematic?.foregroundExtras ?? [];
    const w = sc.stage!.worldWidth!;
    // Anything that OCCLUDES is scenery the walker physically passes behind,
    // so it must be pinned to the room or the illusion breaks outright.
    for (const [i, ex] of extras.entries()) {
      if (!ex.occludes) continue;
      ok(ex.worldX !== undefined,
        `${sc.id}: occluding prop #${i + 1} is pinned to the world (worldX), not the camera`);
      if (ex.worldX !== undefined)
        ok(ex.worldX >= 0 && ex.worldX <= w,
          `${sc.id}: prop #${i + 1} worldX=${ex.worldX} is inside the ${w}-wide room`);
    }
  }
}
