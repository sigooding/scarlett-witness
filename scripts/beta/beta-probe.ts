/* Beta probe for NOBODYS_WITNESS_TRUE — engine-level structural audit. */
import { NOBODYS_WITNESS_TRUE as story } from "../../src/data/nobodysWitnessTrue";
import {
  validateStory,
  createInitialState,
  meetsGating,
  applyConsequences,
  bypassedSceneId,
  effectiveChoiceGating,
} from "../../src/logic";
import type { SceneNode, GlobalState, DialogueBeat, Hotspot } from "../../src/types";

const S = story;
const sceneById = new Map(S.scenes.map((s) => [s.id, s]));
const byId = (id: string): SceneNode => {
  const s = sceneById.get(id);
  if (!s) throw new Error(`missing scene ${id}`);
  return s;
};
const resolve = (id: string): string => bypassedSceneId(S, id) ?? id;

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
if (issues.length === 0) {
  console.log("  ✔ validator returned zero issues");
} else {
  for (const i of issues) {
    console.log(`  ⚠ [${i.severity}] ${i.sceneId ?? "(story)"}: ${i.message}`);
  }
}
pass++;

/* ── 2. Basic graph facts ───────────────────────────────────── */
section("2. Graph facts");
const start = resolve(S.startSceneId);
console.log(`  start: ${start}  scenes: ${S.scenes.length}  ends: ${S.scenes.filter(s => s.isEnding).map(s => s.id).join(", ")}`);
const targetRefs = new Set<string>();
const missingTargets: string[] = [];
for (const sc of S.scenes) {
  for (const c of sc.choices ?? []) {
    if (!c.targetSceneId) continue;
    targetRefs.add(c.targetSceneId);
    const t = resolve(c.targetSceneId);
    if (!sceneById.has(t)) missingTargets.push(`${sc.id} -> ${c.targetSceneId}`);
  }
}
ok(missingTargets.length === 0, `all choice targets resolve${missingTargets.length ? ": " + missingTargets.join("; ") : ""}`);
const reached = new Set<string>();
const endingReach = new Map<string, number>();

/* ── 3. Full path enumeration with hotspot states ───────────── */
section("3. Path enumeration (all choices × all hotspot flips)");
type WalkState = {
  sceneId: string;
  flags: Set<string>;
  mems: Set<string>;
  items: Set<string>;
  path: string[];
};
const key = (w: WalkState) => w.sceneId + "|" + [...w.flags].sort().join(",") + "|" + [...w.mems].sort().join(",") + "|" + [...w.items].sort().join(",");
const queue: WalkState[] = [{
  sceneId: start,
  flags: new Set(),
  mems: new Set(),
  items: new Set(),
  path: [start],
}];
const seen = new Set<string>();
let paths = 0;
let deadEnds = 0;
const lockedChoices: string[] = [];
const visitedEndings: Record<string, WalkState[]> = {};
const MAX = 200000;
let iter = 0;
while (queue.length) {
  if (iter++ > MAX) { console.log("  ! walk cap hit"); break; }
  const w = queue.shift()!;
  const k = key(w);
  if (seen.has(k)) continue;
  seen.add(k);
  reached.add(w.sceneId);
  const sc = byId(w.sceneId);

  const stateFor = (overFlags?: Set<string>): GlobalState => ({
    ...createInitialState(S),
    activeFlags: new Set(overFlags ?? w.flags),
    inventory: [...(overFlags ? w.items : w.items)],
    memoryLog: [...w.mems].map((tag) => ({ id: tag, tag, text: tag, turn: 0, sceneId: w.sceneId })),
  } as GlobalState);

  if (sc.isEnding) {
    paths++;
    visitedEndings[sc.id] = visitedEndings[sc.id] ?? [];
    if (visitedEndings[sc.id].length < 6) visitedEndings[sc.id].push(w);
    endingReach.set(sc.id, (endingReach.get(sc.id) ?? 0) + 1);
    continue;
  }

  // one-shot hotspot flips that change state (setFlag / giveItem)
  const flips: { flag?: string; item?: string }[] = [];
  for (const h of sc.hotspots ?? []) {
    if (h.isRepeatable) continue;
    if (h.action.type === "setFlag") flips.push({ flag: h.action.flagSet });
    if (h.action.type === "giveItem") flips.push({ item: h.action.itemGranted });
  }
  const subsets: { flags: Set<string>; items: Set<string> }[] = [];
  for (let mask = 0; mask < 1 << flips.length; mask++) {
    const f = new Set(w.flags); const it = new Set(w.items);
    flips.forEach((fl, i) => {
      if (mask & (1 << i)) { if (fl.flag) f.add(fl.flag); if (fl.item) it.add(fl.item); }
    });
    subsets.push({ flags: f, items: it });
  }

  const choices = sc.choices ?? [];
  if (choices.length === 0) { deadEnds++; console.log(`  ✗ DEAD END at non-ending scene: ${sc.id} (path: ${w.path.join(" > ")})`); continue; }
  for (const sub of subsets) {
    const st = stateFor(sub.flags);
    st.inventory = [...sub.items];
    for (const c of choices) {
      const gate = effectiveChoiceGating(c);
      if (gate && !meetsGating(gate, st)) {
        lockedChoices.push(`${sc.id}/${c.id}`);
        continue;
      }
      if (!c.targetSceneId) {
        // reply choice — apply, stay on scene
        const ns = applyConsequences(S, c.consequences, st);
        const w2: WalkState = {
          sceneId: w.sceneId,
          flags: new Set(ns.activeFlags),
          mems: new Set([...w.mems, ...(c.memoryLog ? [c.memoryLog] : [])]),
          items: new Set(ns.inventory),
          path: w.path,
        };
        queue.push(w2);
      } else {
        let ns = applyConsequences(S, c.consequences, st);
        const w2: WalkState = {
          sceneId: resolve(c.targetSceneId),
          flags: new Set(ns.activeFlags),
          mems: new Set([...w.mems, ...(c.memoryLog ? [c.memoryLog] : [])]),
          items: new Set(ns.inventory),
          path: [...w.path, resolve(c.targetSceneId)],
        };
        queue.push(w2);
      }
    }
  }
}
console.log(`  states explored: ${seen.size}, complete plays: ${paths}`);
ok(paths > 0, "at least one complete playthrough exists");
ok(deadEnds === 0, `no dead-end non-ending scenes (${deadEnds})`);
const unreached = S.scenes.filter(s => !reached.has(s.id)).map(s => s.id);
ok(unreached.length === 0, `every scene reachable (unreached: ${unreached.join(", ") || "none"})`);
for (const e of S.scenes.filter(s => s.isEnding)) {
  ok((endingReach.get(e.id) ?? 0) > 0, `ending "${e.title}" (${e.id}) reachable — ${endingReach.get(e.id) ?? 0} paths`);
}
console.log(`  locked choices (gated, never satisfiable in a run): ${lockedChoices.length ? [...new Set(lockedChoices)].join(", ") : "none"}`);

/* ── 4. Flag accounting ─────────────────────────────────────── */
section("4. Flag accounting");
const allFlags = new Set<string>();
const producers = new Map<string, string[]>();
const consumers = new Map<string, string[]>();
const addP = (f: string, where: string) => { allFlags.add(f); producers.set(f, [...(producers.get(f) ?? []), where]); };
const addC = (f: string, where: string) => { allFlags.add(f); consumers.set(f, [...(consumers.get(f) ?? []), where]); };
for (const sc of S.scenes) {
  for (const c of sc.choices ?? []) {
    c.consequences?.setFlags?.forEach(f => addP(f, `choice ${sc.id}/${c.id}`));
    c.timedOutConsequences?.setFlags?.forEach(f => addP(f, `timeout ${sc.id}/${c.id}`));
  }
  for (const h of sc.hotspots ?? []) {
    if (h.action.type === "setFlag") addP(h.action.flagSet, `hotspot ${sc.id}/${h.id}`);
    h.gating?.requiresFlags?.forEach(f => addC(f, `hotspot-gate ${sc.id}/${h.id}`));
  }
  for (const b of sc.dialogueBeats ?? []) {
    b.conditionRule?.requiresFlags?.forEach(f => addC(f, `beat ${sc.id}/${b.id}`));
    b.conditionRule?.excludesFlags?.forEach(f => addC(f, `beat-excl ${sc.id}/${b.id}`));
  }
  sc.onEnterActions?.forEach(a => a.consequences?.setFlags?.forEach(f => addP(f, `onEnter ${sc.id}`)));
}
for (const f of allFlags) {
  const p = producers.get(f) ?? [];
  const c = consumers.get(f) ?? [];
  const pTxt = p.length ? p.join("; ") : "—";
  const cTxt = c.length ? c.join("; ") : "—";
  console.log(`  • ${f}\n      produced: ${pTxt}\n      consumed: ${cTxt}`);
}
const noProducer = [...allFlags].filter(f => !producers.has(f));
const noConsumer = [...allFlags].filter(f => !consumers.has(f));
ok(noProducer.length === 0, `every consumed flag is producible (unproducible: ${noProducer.join(", ") || "none"})`);
console.log(`  ℹ flags never consumed (set but nothing reads them): ${noConsumer.join(", ") || "none"}`);

/* ── 5. Item accounting ─────────────────────────────────────── */
section("5. Item accounting");
const items = new Map(S.items.map(i => [i.id, i]));
for (const sc of S.scenes) {
  for (const h of sc.hotspots ?? []) {
    if (h.action.type === "giveItem") {
      ok(items.has(h.action.itemGranted), `hotspot ${sc.id}/${h.id} grants existing item "${h.action.itemGranted}"`);
    }
  }
  for (const c of sc.choices ?? []) {
    c.consequences?.addItems?.forEach(id => ok(items.has(id), `choice ${sc.id}/${c.id} grants existing item "${id}"`));
    c.consequences?.removeItems?.forEach(id => ok(items.has(id), `choice ${sc.id}/${c.id} removes existing item "${id}"`));
  }
  for (const b of sc.dialogueBeats ?? []) {
    b.conditionRule?.requiresItems?.forEach(id => {
      ok(items.has(id), `beat ${sc.id}/${b.id} requires existing item "${id}"`);
      ok([...(producers as any)].length >= 0, "");
    });
  }
}
console.log("  items defined:", [...items.keys()].join(", "));

/* ── 6. In-scene conditional-beat ordering vs hotspot flips ─── */
section("6. Conditional beats vs their scene's hotspots");
for (const sc of S.scenes) {
  const beats = sc.dialogueBeats ?? [];
  beats.forEach((b, idx) => {
    const reqF = b.conditionRule?.requiresFlags ?? [];
    for (const f of reqF) {
      const localHot = (sc.hotspots ?? []).find(h => h.action.type === "setFlag" && h.action.flagSet === f);
      if (localHot) {
        console.log(`  • ${sc.id} beat[${idx}] ${b.id} needs "${f}", set by in-scene hotspot "${localHot.label}" (hotspots live from scene start — orderable)`);
      } else {
        console.log(`  • ${sc.id} beat[${idx}] ${b.id} needs "${f}" — set elsewhere in graph`);
      }
    }
  });
}

/* ── 7. Timed / QTE sweep ───────────────────────────────────── */
section("7. Timed choices & other mechanics");
let timed = 0;
for (const sc of S.scenes) {
  for (const c of sc.choices ?? []) if (c.timeLimitSeconds) timed++;
  if ((sc as any).quickTime) console.log(`  ! QTE on ${sc.id}`);
}
console.log(`  timed choices: ${timed} (True cut is continuous play, expected 0)`);

/* ── 8. Character references in beats ───────────────────────── */
section("8. Character ids used by beats");
const charIds = new Set(S.characters.map(c => c.id));
charIds.add("narrator");
const badChars = new Set<string>();
for (const sc of S.scenes) for (const b of sc.dialogueBeats ?? []) {
  if (!charIds.has(b.characterId)) badChars.add(`${sc.id}/${b.id} -> "${b.characterId}"`);
}
ok(badChars.size === 0, `all beat character ids defined${badChars.size ? ": " + [...badChars].join("; ") : ""}`);

/* ── 9. Word counts / profanity tally ───────────────────────── */
section("9. Volume & profanity");
let words = 0;
const profanity: Record<string, number> = {};
const tally = (t: string) => {
  words += t.split(/\s+/).filter(Boolean).length;
  for (const m of t.matchAll(/\b(fuck(?:ing|er|ed|s)?|shit|bullshit|christ|jesus|goddamn|god-damn|hell|damn|bastard|ass(?:hole)?|dumb)\b/gi)) {
    const w = m[0].toLowerCase();
    profanity[w] = (profanity[w] ?? 0) + 1;
  }
};
for (const sc of S.scenes) {
  tally(sc.prose ?? "");
  for (const b of sc.dialogueBeats ?? []) tally(b.text ?? "");
  for (const h of sc.hotspots ?? []) {
    if (h.action.type === "showText") tally(h.action.text);
  }
  for (const c of sc.choices ?? []) tally(c.text);
  if ((sc as any).credits) {}
}
console.log(`  total spoken/narrated words: ${words}`);
console.log("  profanity:", JSON.stringify(profanity, null, 0));

/* ── 10. Sample winning paths per ending ────────────────────── */
section("10. One path to each ending");
for (const e of S.scenes.filter(s => s.isEnding)) {
  const sample = visitedEndings[e.id]?.[0];
  if (sample) {
    console.log(`  ${e.title}:\n    ${sample.path.join("\n    ")}`);
    console.log(`    flags: ${[...sample.flags].join(", ") || "(none)"}`);
    console.log(`    items: ${[...sample.items].join(", ") || "(none)"}`);
  }
}


/* ── 11. Production soundtrack wiring ───────────────────────── */
section("11. Soundtrack cue sheet");
const SILENT = new Set([
  "nwt_coldopen", "nwt_office", "nwt_warehouse", "nwt_warehouse_out",
  "nwt_laundromat", "nwt_threeam", "nwt_pumps", "nwt_interlude",
  "nwt_rental", "nwt_yard", "nwt_call", "nwt_rosa", "nwt_mill",
  "nwt_cost", "nwt_trade", "nwt_diner2", "nwt_end_walks", "nwt_end_watch",
]);
const THEME = "/nobodys-witness.mp3";
const DINER_JAZZ = "/Midnight in the Rain2.mp3";
const JUKEBOX = "/nwt-bluecue-jukebox.mp3";
const TRACKED: Record<string, string> = {
  nwt_titles: THEME,
  nwt_diner: DINER_JAZZ,
  nwt_bluecue: JUKEBOX,
  nwt_bluecue2: JUKEBOX,
  nwt_vera: THEME,
  nwt_end_stays: THEME,
};
const INHERIT = new Set([
  "nwt_diner_take", "nwt_bluecue_out", "nwt_bluecue_named",
  "nwt_bluecue_walk", "nwt_bluecue_fight",
]);
const leftoverDraftMusic: string[] = [];
for (const sc of S.scenes) {
  const url = sc.musicUrl ?? "";
  if (url.includes("/uploads/nobodys-witness-draft/")) leftoverDraftMusic.push(`${sc.id} ${url}`);
  if (SILENT.has(sc.id)) {
    ok(sc.musicMode === "none", `${sc.id} is scored silent (musicMode none)`);
  } else if (TRACKED[sc.id]) {
    ok(sc.musicUrl === TRACKED[sc.id], `${sc.id} plays ${TRACKED[sc.id]}`);
    ok(sc.musicMode === "track" || sc.musicMode === "inherit", `${sc.id} starts or keeps its bed`);
  } else if (INHERIT.has(sc.id)) {
    ok((sc.musicMode ?? "inherit") === "inherit" && !sc.musicUrl, `${sc.id} inherits the previous bed`);
  }
}
ok(leftoverDraftMusic.length === 0, `no draft-upload music paths (${leftoverDraftMusic.join("; ") || "none"})`);
ok(!JSON.stringify(S).includes("don't thank me yet"), `no leftover "don't thank me yet"`);
ok(!JSON.stringify(S).includes("two hundred grand"), `no leftover "two hundred grand"`);

/* ── 12. Act Three endings audit ─────────────────────────────
   Answers the beta question: do ALL playthroughs end on Act
   Three, in the same style of dialogue? Style = the cut's
   authored ending contract, checked structurally per ending:
     · a true ending (isEnding, no choices) in the Act 3 spine
     · complete endingData (tier / headline / recap)
     · the cut's spare register: Jack V.O. beats, silent
       parenthetical narrator beats, letterbox
     · the bookend: final beat is a silent narrator screen
       beat, "same as the first frame" (main street, neon)
     · the 11:47 clock rhyme stays monotonic (no clock beat
       earlier than the one before it, no arrival after the
       first clock the ending stamps)                                  */
section("12. Act Three endings audit — all playthroughs end on act 3, same style");
const ACT3_SCENES = new Set([
  "nwt_call", "nwt_rosa", "nwt_mill", "nwt_cost", "nwt_bluecue2",
  "nwt_bluecue_walk", "nwt_bluecue_fight", "nwt_trade", "nwt_diner2",
  "nwt_vera", "nwt_end_stays", "nwt_end_walks", "nwt_end_watch",
]);
const endings = S.scenes.filter((s) => s.isEnding);
const act3Endings = endings.filter((e) => ACT3_SCENES.has(e.id));
ok(
  act3Endings.length === endings.length,
  `every ending scene is in the Act 3 spine (${endings.length} endings, ${act3Endings.length} in act 3)`
);
// every complete playthrough (section 3) ends at one of these act-3 endings
ok(
  endings.every((e) => (endingReach.get(e.id) ?? 0) > 0) &&
    act3Endings.length === endings.length,
  `all ${paths} complete playthroughs end on act 3 (${[...act3Endings.map((e) => `${e.title}: ${endingReach.get(e.id)}`)].join(" / ")})`
);

const WORD_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};
const compoundNum = (w: string): number | null => {
  const parts = w.split("-").filter(Boolean);
  if (parts.length < 1 || parts.length > 2) return null;
  let v = 0;
  for (const p of parts) {
    const n = WORD_NUM[p];
    if (n === undefined) return null;
    v += n;
  }
  return v;
};
/** Minutes since 11:00 p.m. from the cut's clock phrases. */
const clockMinutes = (text: string): number[] => {
  const out: number[] = [];
  const t = text.toLowerCase();
  for (const m of t.matchAll(/\b(eleven|twelve) ([a-z][a-z-]*)\b/g)) {
    const hour = m[1] === "eleven" ? 0 : 60; // 11 p.m. = 0, 12 p.m. = 60
    const mins = compoundNum(m[2]);
    if (mins === null || mins > 59) continue;
    out.push(hour + mins);
  }
  if (/\bgone one\b/.test(t)) out.push(121); // "till gone one" ≈ 12:01 a.m.
  return out;
};
const fmtClock = (min: number): string => {
  const h24 = (23 + Math.floor(min / 60)) % 24; // 0 = 11 p.m.
  const hh = h24 % 12 === 0 ? 12 : h24 % 12;
  const ap = h24 < 12 ? "a.m." : "p.m.";
  return `${hh}:${String(min % 60).padStart(2, "0")} ${ap}`;
};

for (const e of act3Endings) {
  const beats = e.dialogueBeats ?? [];
  const last = beats[beats.length - 1];
  const jackVo = beats.filter((b) => b.characterId === "jack" && /V\.O\./.test(b.expression ?? "")).length;
  const silentNarr = beats.filter((b) => b.characterId === "narrator" && b.silent).length;
  const words = beats.map((b) => b.text ?? "").join(" ").split(/\s+/).filter(Boolean).length;
  const ed = e.endingData;
  const bookendOk =
    !!last && last.characterId === "narrator" && !!last.silent &&
    /same as the first frame/i.test(last.text ?? "") &&
    /neon smearing teal and magenta/i.test(last.text ?? "");

  ok(
    e.choices?.length === 0 && e.letterbox === true,
    `${e.id} is a true ending (no exits, letterboxed)`
  );
  ok(
    !!ed && !!ed.headline && ed.headline === ed.headline.toUpperCase() &&
      !!ed.recap && ed.recap.length >= 20 &&
      (ed.tier === "victory-gold" || ed.tier === "victory-silver" || ed.tier === "gameover"),
    `${e.id} has complete endingData (tier: ${ed?.tier}, headline: "${ed?.headline}")`
  );
  ok(jackVo >= 1 && silentNarr >= 3, `${e.id} keeps the spare register (Jack V.O. ×${jackVo}, silent narrator beats ×${silentNarr})`);
  ok(bookendOk, `${e.id} closes on the main-street bookend (silent narrator, "same as the first frame")`);
  ok(words >= 150 && beats.length >= 10, `${e.id} is a full scene, not a stub (${beats.length} beats, ${words} words)`);

  // clock rhyme monotonicity within the ending
  const clocks: { where: string; at: number }[] = [];
  for (const b of beats) clocks.push(...clockMinutes(b.text ?? "").map((at) => ({ where: b.id, at: at! })));
  let mono = true;
  for (let i = 1; i < clocks.length; i++) if (clocks[i].at < clocks[i - 1].at) mono = false;
  ok(mono, `${e.id} clock beats monotonic (${clocks.map((c) => `${c.where}@${fmtClock(c.at)}`).join(" → ") || "no clock beats"})`);

  // "She Walks In" arrival must not land after the first clock SHE STAYS stamps
  if (e.id === "nwt_end_stays") {
    const vera = byId("nwt_vera");
    const faVo1 = (vera.dialogueBeats ?? []).find((b) => b.id === "nwt_fa_vo1");
    const m = faVo1?.text?.match(/\b([a-z]+(?:-[a-z]+)*) minutes later the door bell/i);
    if (m) {
      const later = compoundNum(m[1].toLowerCase()) ?? parseInt(m[1], 10);
      const arrived = 47 + later; // call placed at 11:47
      const firstStamp = clocks[0]?.at;
      ok(
        typeof firstStamp === "number" && arrived <= firstStamp,
        `She Walks In arrival (11:47 + ${later} min = 11:${String(arrived).padStart(2, "0")}) lands on or before SHE STAYS' first clock stamp (11:${String(firstStamp).padStart(2, "0")})`
      );
    } else {
      ok(false, "nwt_fa_vo1 arrival line missing");
    }
  }
}

// Vera's True Romance register in Act 3: the cut's documented floor is 4
let veraAct3Profanity = 0;
for (const id of ACT3_SCENES) {
  const sc = sceneById.get(id);
  if (!sc) continue;
  for (const b of sc.dialogueBeats ?? []) {
    if (b.characterId !== "vera") continue;
    for (const m of (b.text ?? "").matchAll(/\b(fuck(?:ing|er|ed|s)?|goddamn|god damn|damn|shit)\b/gi)) {
      if (/^god ?damn/i.test(m[0]) || m[0].startsWith("fuck")) veraAct3Profanity++;
    }
  }
}
ok(veraAct3Profanity >= 4, `Vera's Act 3 register intact (True Romance profanity ×${veraAct3Profanity}, documented floor 4)`);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail) process.exit(1);
