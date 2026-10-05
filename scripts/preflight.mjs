#!/usr/bin/env node
/**
 * PREFLIGHT — run this before every build you intend to ship (Steam or
 * anywhere else). It answers one question: is the catalogue production-ready?
 *
 *   node scripts/preflight.mjs        (or: npm run preflight)
 *
 * What it proves, story by story:
 *   1. VALIDATOR    — zero errors (warnings are listed but don't block).
 *   2. PLAYABILITY  — an engine-faithful walk (replies, hidden choices,
 *                     exclusive groups, one-shots, gating) terminates on an
 *                     ending, and the deep walk covers the graph.
 *   3. ENDINGS      — at least one victory and one game-over ending exist.
 *   4. ASSETS       — every image/audio path every story references exists
 *                     under public/ (the same guarantee `npm run check` gives,
 *                     but against the live compiled data, including beats'
 *                     replacement backgrounds, montages and keyframes).
 *   5. MUSIC        — the soundtrack state machine is traced across each
 *                     walk so a leaked track is visible at a glance.
 *
 * Exit code 0 = ship it. Anything else = fix first.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TMP = join(ROOT, ".preflight");
const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const GRN = (s) => `\x1b[32m${s}\x1b[0m`;
const GOLD = (s) => `\x1b[33m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

let failures = 0;
const fail = (msg) => { failures++; console.log(`  ${RED("FAIL")}  ${msg}`); };
const pass = (msg) => console.log(`  ${GRN("ok")}    ${msg}`);
const note = (msg) => console.log(`  ${DIM("·")}    ${msg}`);

/* ---------- 1. compile the real source (data + engine logic) ---------- */
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
// The repo is "type": "module", but tsc emits CommonJS here. A local
// package.json marks the emit dir as CommonJS so Node imports it cleanly.
writeFileSync(join(TMP, "package.json"), '{"type":"commonjs"}');
const tsc = spawnSync("npx", ["tsc", "src/data/stories.ts", "src/logic.ts", "src/studio/canvas.ts", "--outDir", TMP,
  "--module", "commonjs", "--target", "es2020", "--moduleResolution", "node",
  // resolveJsonModule: the catalogue imports at least one story as a raw
  // .reel.json (undertow). The repo tsconfig enables it; this standalone
  // invocation must too, or preflight dies on a file `tsc --noEmit` accepts.
  "--esModuleInterop", "--resolveJsonModule", "--skipLibCheck"], { stdio: "pipe", encoding: "utf8", cwd: ROOT });
if (tsc.status !== 0) {
  console.log(RED("Compile failed — TypeScript errors in the shipped data/logic:"));
  console.log(tsc.stdout || tsc.stderr);
  process.exit(1);
}
// tsc infers the root dir from the entry files, so the emitted tree may be
// .preflight/data/stories.js or .preflight/src/data/stories.js depending on
// entries. Locate the compiled modules instead of guessing.
const find = (dir, name) => {
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of readdirSync(cur, { withFileTypes: true })) {
      const p = join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name === name) return p;
    }
  }
  return null;
};
const storiesJs = find(TMP, "stories.js");
const logicJs = find(TMP, "logic.js");
if (!storiesJs || !logicJs) {
  console.log(RED("Compile produced no stories.js/logic.js — check the tsc invocation."));
  process.exit(1);
}
const { STORIES } = await import(storiesJs.replaceAll("\\", "/"));
const logic = await import(logicJs.replaceAll("\\", "/"));
const { validateStory, meetsGating, createInitialState, applyConsequences, sceneById, encodeStory, decodeStory, seasonEpisodes, unassignedScenes, effectiveChoiceGating } = logic;
const canvasJs = find(TMP, "canvas.js");
const canvas = canvasJs ? await import(canvasJs.replaceAll("\\", "/")) : null;

/* ---------- helpers (engine-faithful, mirrors Game.tsx) ---------- */
const choiceHasEffects = (c) => !!(c.consequences && Object.values(c.consequences).some((v) => Array.isArray(v) && v.length));
const choiceRepeats = (c) => (c.isRepeatable !== undefined ? c.isRepeatable : c.reply ? false : !choiceHasEffects(c));

/* Optional walk trace: PF_DEBUG=<storyId> prints the walker's steps, topic
 * flag-sets, scenery effects, hotspot routes and edge crossings to stderr. */
const PF_DEBUG_ID = process.env.PF_DEBUG ?? "";
const pfLog = (id, ...a) => { if (PF_DEBUG_ID && id === PF_DEBUG_ID) console.error(`[${id}]`, ...a); };
function walk(story, avoidEndings = true) {
  const idx = new Map(story.scenes.map((s, i) => [s.id, i]));
  let state = createInitialState(story);
  const used = new Set();
  const visited = [];
  let cur = story.startSceneId;
  // A scenic effect is one that changes the walker's state (flag / item /
  // meter). showText-only actions are flavour and must NOT stall the fixpoint.
  const actionEff = (action) => {
    if (!action) return null;
    const eff = {};
    if (action.itemGranted) eff.addItems = [action.itemGranted];
    if (action.flagSet) eff.setFlags = [action.flagSet];
    if (action.meterChange) eff.meterChanges = [action.meterChange];
    return Object.keys(eff).length ? eff : null;
  };
  for (let step = 0; step < 300; step++) {
    const sc = sceneById(story, cur);
    if (!sc) return { ending: null, visited, stuck: cur };
    visited.push(sc.id);
    pfLog(story.id, `step ${step} @ ${sc.id} flags={${[...state.activeFlags].join(",")}} items={${(state.inventory??[]).map(i=>i.id).join(",")}}`);
    if (sc.onEnterActions) for (const a of sc.onEnterActions) state = applyConsequences(story, a.consequences, state);
    if (sc.isEnding) return { ending: sc, visited, state };
    // effectiveChoiceGating folds a presentItem requirement into the gate, so
    // the walker can't "show" an item it never picked up (game parity).
    const gateOf = (c) => (effectiveChoiceGating ? effectiveChoiceGating(c) : c.gating);
    // Interaction passes — mirror a player working a room before leaving:
    // TOPIC dialogues first (a topic's flag can unlock a marker), then the
    // scenery clicks (giveItem / setFlag / meterChange land in the walker's
    // state, exactly what completeHotspot() does in Game.tsx), then direct
    // conversation replies (a linear stage talk can set a flag that unlocks
    // the room's exit), all looped to a fixpoint so "ask the bartender" →
    // "grab the keys" happens in ONE visit. Without the loop, a one-shot
    // door can carry the walker out of the room before the flag a topic or a
    // reply just set ever unlocks the marker it gates.
    for (let pass = 0, changed = true; changed && pass < 8; pass++) {
      changed = false;
      // Topic-list dialogues — a competent player asks every askable topic:
      // the marker's own flagSet lands, then each topic's flagSet (an earlier
      // topic's flag can unlock a later topic, hence the same fixpoint).
      for (const h of sc.hotspots ?? []) {
        if (h.action?.type !== "startDialogue" || !h.action.topics) continue;
        if (h.gating && !meetsGating(h.gating, state)) continue;
        if (h.action.flagSet) { state = applyConsequences(story, { setFlags: [h.action.flagSet] }, state); changed = true; }
        for (const t of h.action.topics) {
          const key = `${sc.id}:topic:${t.id}`;
          if (used.has(key)) continue;
          if (t.gating && !meetsGating(t.gating, state)) continue;
          used.add(key);
          changed = true;
          if (t.flagSet) { state = applyConsequences(story, { setFlags: [t.flagSet] }, state); pfLog(story.id, `  topic ${t.id} -> ${t.flagSet}`); }
        }
      }
      // Scenery pass — every visible non-routing hotspot. This mirrors what
      // a competent player actually does in the room, including stage verbs
      // (kick the vending machine) and multi-state objects (the tray that
      // appears once the kick lands). Static showText is skipped; any
      // flag/item/meter effect is applied once and looped to a fixpoint so a
      // kick's flag can unlock the state that grants the item.
      for (const h of sc.hotspots ?? []) {
        if (h.action?.targetSceneId || h.action?.patternPuzzle) continue; // routing & minigames handled below
        const applyEffect = (action, key, label) => {
          if (used.has(key)) return;
          const eff = actionEff(action);
          if (!eff) return;
          used.add(key);
          changed = true;
          state = applyConsequences(story, eff, state);
          pfLog(story.id, `  ${label} ${h.id} eff=${JSON.stringify(eff)}`);
        };
        // Default action (with the hotspot's own gate).
        if (meetsGating(h.gating, state))
          applyEffect(h.action, `${sc.id}:hs:${h.id}:default`, "hotspot");
        // Verb coin actions — an extended-verb action can set a flag or hand
        // over an item even when the default action is only flavour text.
        for (const [verb, vAction] of Object.entries(h.verbs ?? {})) {
          if (vAction?.targetSceneId || vAction?.patternPuzzle) continue;
          if (!meetsGating(h.gating, state)) continue;
          applyEffect(vAction, `${sc.id}:hs:${h.id}:verb:${verb}`, `verb:${verb}`);
        }
        // Multi-state object actions — a state can gate on a flag the verbs
        // above just set (kick -> tray), so this must run after verbs in the
        // same fixpoint pass and independently of the base hotspot's gate.
        for (const st of h.states ?? []) {
          const stateGate = st.gating === undefined ? h.gating : st.gating;
          if (st.when && !meetsGating(st.when, state)) continue;
          if (stateGate && !meetsGating(stateGate, state)) continue;
          applyEffect(st.action, `${sc.id}:hs:${h.id}:state:${st.id}`, `state:${st.id}`);
        }
      }
      // Direct conversation replies — a linear stage talk's answer choices
      // are not routing hotspots, but a "leave it bolted" reply can gate the
      // room's exit. A competent player works those answers before walking
      // out, so land them in the same fixpoint.
      for (const c of sc.choices ?? []) {
        if (!c.reply || c.targetSceneId) continue; // in-place replies only; navs handled below
        const key = `${sc.id}:${c.id}`;
        if (used.has(key)) continue;
        if (c.hidden && !meetsGating(gateOf(c), state)) continue;
        if (!meetsGating(gateOf(c), state)) continue;
        used.add(key);
        changed = true;
        state = applyConsequences(story, c.consequences, state);
        if (c.memoryLog) state = { ...state, memories: { ...state.memories, [c.memoryLog]: c.text } };
        pfLog(story.id, `  reply ${c.id} eff=${JSON.stringify(c.consequences ?? {})}`);
      }
    }
    // Press-the-lie pass — a competent player who HOLDS the breaking evidence
    // presses the lie when the beat plays: the caught flag + consequences
    // land in the walker's state, so contradiction-gated gold roads are
    // walked and verified instead of silently skipped.
    for (const b of sc.dialogueBeats ?? []) {
      const lie = b.lie;
      if (!lie?.contradictedFlag) continue;
      const key = `${sc.id}:lie:${b.id}`;
      if (used.has(key)) continue;
      const evid = lie.evidenceItemIds ?? [];
      if (evid.length && evid.some((id) => (state.inventory ?? []).some((it) => it.id === id))) {
        used.add(key);
        state = applyConsequences(story, { setFlags: [lie.contradictedFlag] }, state);
        if (lie.contradictedConsequences) state = applyConsequences(story, lie.contradictedConsequences, state);
      }
    }
    // A final dialogue beat can perform a cinematic cut without a dummy
    // choice. The runtime routes from the last visible beat after its
    // authored hold, before the scene's choices become interactive; the
    // walker must give that edge the same priority.
    const beatRoute = (sc.dialogueBeats ?? [])
      .filter((b) => b.afterBeatTargetSceneId && (!b.conditionRule || meetsGating(b.conditionRule, state)))
      .at(-1);
    if (beatRoute?.afterBeatTargetSceneId) {
      cur = beatRoute.afterBeatTargetSceneId;
      continue;
    }
    const usable = (sc.choices ?? []).filter((c) =>
      !used.has(`${sc.id}:${c.id}`) &&
      !(c.hidden && !meetsGating(gateOf(c), state)) &&
      meetsGating(gateOf(c), state));
    let navs = usable.filter((c) => c.targetSceneId && !c.reply && c.targetSceneId !== "");
    if (avoidEndings) {
      const ne = navs.filter((c) => !sceneById(story, c.targetSceneId)?.isEnding);
      if (ne.length) navs = ne;
    }
    const nav = navs.sort((a, b) => (idx.get(b.targetSceneId) ?? 0) - (idx.get(a.targetSceneId) ?? 0))[0];
    if (nav) {
      used.add(`${sc.id}:${nav.id}`);
      if (nav.exclusiveGroup) (sc.choices ?? []).filter((o) => o.exclusiveGroup === nav.exclusiveGroup).forEach((o) => used.add(`${sc.id}:${o.id}`));
      state = applyConsequences(story, nav.consequences, state);
      if (nav.memoryLog) state = { ...state, memories: { ...state.memories, [nav.memoryLog]: nav.text } };
      cur = nav.targetSceneId;
      continue;
    }
    // No navigation choice yet — on a stage node the exit is a walk-to door
    // hotspot, not a choice. Only consider hotspots that actually route
    // somewhere (give-item / show-text markers must not be mistaken for exits).
    // Non-repeatable exits are one-shot; repeatable doors/back-exits may be
    // crossed more than once (a room you must leave and re-enter). Prefer an
    // exit into a scene we haven't visited yet so “back to the street” isn't
    // chosen ahead of “up the stairs” the first time both are open.
    const routes = (sc.hotspots ?? []).filter((h) =>
      (h.action?.targetSceneId || h.action?.patternPuzzle?.targetSceneId) &&
      (h.isRepeatable || !used.has(`${sc.id}:${h.id}`)) &&
      meetsGating(h.gating, state));
    const hs = routes
      .map((h) => {
        const target = h.action?.targetSceneId || h.action?.patternPuzzle?.targetSceneId;
        return { h, target, fresh: !!target && !visited.includes(target) };
      })
      .sort((a, b) => (b.fresh ? 1 : 0) - (a.fresh ? 1 : 0))[0]?.h;
    if (hs) {
      if (!hs.isRepeatable) used.add(`${sc.id}:${hs.id}`);
      const target = hs.action.targetSceneId || hs.action.patternPuzzle?.targetSceneId;
      pfLog(story.id, `  route via hotspot ${hs.id} -> ${target}`);
      // A walker that "solves" a pattern puzzle earns what the player earns —
      // flags/items granted on solve can gate the road ahead.
      if (hs.action.patternPuzzle?.rewardConsequences)
        state = applyConsequences(story, hs.action.patternPuzzle.rewardConsequences, state);
      if (target) {
        cur = target;
        continue;
      }
    }
    const pick = usable.find((c) => c.reply);
    if (!pick && sc.autoAdvanceTargetSceneId) {
      cur = sc.autoAdvanceTargetSceneId;
      continue;
    }
    if (!pick) {
      // Stage WALK-OFF-SCREEN exits — the edge arrow IS an exit. An OPEN edge
      // routes the walker on; a gated-shut edge is not a way forward. Edges
      // are movement, not one-shots, so they never enter `used` (the walker
      // may legitimately cross an edge more than once; the step guard bounds
      // pathological ping-pong).
      const edges = sc.stage?.exitEdges ? Object.entries(sc.stage.exitEdges) : [];
      const edge = edges.find(([, e]) => e && meetsGating(e.gating, state));
      if (edge) {
        const [, e] = edge;
        if (e.flagSet) state = applyConsequences(story, { setFlags: [e.flagSet] }, state);
        cur = e.targetSceneId;
        continue;
      }
    }
    if (!pick) return { ending: null, visited, stuck: sc.id };
    used.add(`${sc.id}:${pick.id}`);
    if (pick.exclusiveGroup) (sc.choices ?? []).filter((o) => o.exclusiveGroup === pick.exclusiveGroup).forEach((o) => used.add(`${sc.id}:${o.id}`));
    state = applyConsequences(story, pick.consequences, state);
    if (pick.memoryLog) state = { ...state, memories: { ...state.memories, [pick.memoryLog]: pick.text } };
    if (!pick.reply && pick.targetSceneId) cur = pick.targetSceneId;
  }
  return { ending: null, visited, stuck: "step-guard" };
}

function assetRefs(story) {
  const refs = new Set();
  story.scenes.forEach((sc) => {
    if (sc.background?.startsWith("/")) refs.add(sc.background);
    (sc.dialogueBeats ?? []).forEach((b) => b.background?.startsWith("/") && refs.add(b.background));
    (sc.credits?.montage ?? []).forEach((m) => m.startsWith("/") && refs.add(m));
    (sc.cinematic?.foregroundAnimation?.frames ?? []).forEach((f) => refs.add(f));
    (sc.cinematic?.foregroundImage?.startsWith("/") && refs.add(sc.cinematic.foregroundImage));
    (sc.cinematic?.foregroundExtras ?? []).forEach((e) => {
      e.image?.startsWith("/") && refs.add(e.image);
      e.sheet?.image?.startsWith("/") && refs.add(e.sheet.image);
    });
    (sc.dialogueBeats ?? []).forEach((b) =>
      (b.cinematic?.foregroundExtras ?? []).forEach((e) => {
        e.image?.startsWith("/") && refs.add(e.image);
        e.sheet?.image?.startsWith("/") && refs.add(e.sheet.image);
      })
    );
    [sc.musicUrl, sc.sceneAudioUrl, sc.narrationAudioUrl].forEach((u) => u?.startsWith("/") && refs.add(u));
    (sc.dialogueBeats ?? []).forEach((b) => b.audioUrl?.startsWith("/") && refs.add(b.audioUrl));
    if (sc.stage) {
      sc.stage.playerImage?.startsWith("/") && refs.add(sc.stage.playerImage);
      (sc.stage.walkFrames ?? []).forEach((f) => f.startsWith("/") && refs.add(f));
      sc.stage.playerSheet?.image?.startsWith("/") && refs.add(sc.stage.playerSheet.image);
      (sc.stage.npcs ?? []).forEach((n) => {
        n.image?.startsWith("/") && refs.add(n.image);
        n.sheet?.image?.startsWith("/") && refs.add(n.sheet.image);
      });
    }
  });
  story.characters.forEach((c) => {
    c.avatarUrl?.startsWith("/") && refs.add(c.avatarUrl);
    (c.talkingFrames ?? []).forEach((f) => f.startsWith("/") && refs.add(f));
    c.talkingRest?.startsWith("/") && refs.add(c.talkingRest);
    c.talkingSheet?.image?.startsWith("/") && refs.add(c.talkingSheet.image);
  });
  story.items.forEach((i) => i.iconUrl?.startsWith("/") && refs.add(i.iconUrl));
  story.coverImage?.startsWith("/") && refs.add(story.coverImage);
  (story.acts ?? []).forEach((a) => a.titleCardImage?.startsWith("/") && refs.add(a.titleCardImage));
  (story.episodes ?? []).forEach((e) => [e.titleCardImage, e.posterImage, e.titleCardMusicUrl].forEach((u) => u?.startsWith("/") && refs.add(u)));
  return [...refs];
}

function musicTrace(story, order) {
  let playing = null;
  const spans = [];
  for (const id of order) {
    const sc = sceneById(story, id);
    const url = sc.musicUrl ?? sc.sceneAudioUrl ?? null;
    const mode = sc.musicMode ?? "inherit";
    if (mode === "none") playing = null;
    else if (url && (mode === "track" || playing !== url)) playing = url;
    if (playing) {
      const last = spans[spans.length - 1];
      if (last && last.track === playing) last.scenes.push(sc.title);
      else spans.push({ track: playing, scenes: [sc.title] });
    }
  }
  return spans;
}


/* ---------- sprite-sheet geometry ----------
 * A sheet's authored frameWidth must divide the actual PNG exactly. If the
 * art is regenerated at a different width the story keeps the OLD number and
 * every frame is sliced off-centre - portraits get cut mid-face. Nothing in
 * the type system or the runtime validator can see this, because only the
 * file on disk knows how wide it really is. */
function pngSize(abs) {
  try {
    const b = readFileSync(abs);
    if (b.length < 24 || b.readUInt32BE(12) !== 0x49484452) return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch { return null; }
}

function collectSheets(s) {
  const out = [];
  const add = (sheet, where) => {
    if (sheet && sheet.image && sheet.frameWidth) out.push({ ...sheet, where });
  };
  for (const c of s.characters ?? []) {
    add(c.talkingSheet, `${c.name}: talkingSheet`);
    for (const t of c.talkingSheets ?? []) add(t.sheet, `${c.name}: "${t.name}"`);
  }
  for (const sc of s.scenes ?? []) {
    add(sc.stage?.playerSheet, `${sc.id}: playerSheet`);
    for (const n of sc.stage?.npcs ?? []) add(n.sheet, `${sc.id}: npc ${n.id ?? ""}`);
    for (const [i, e] of (sc.cinematic?.foregroundExtras ?? []).entries())
      add(e.sheet, `${sc.id}: foreground #${i + 1}`);
  }
  return out;
}

function auditSheets(s) {
  const sheets = collectSheets(s);
  if (!sheets.length) return;
  const bad = [];
  for (const sh of sheets) {
    const size = pngSize(join(ROOT, "public", sh.image.replace(/^\//, "")));
    if (!size) continue;
    if (size.w % sh.frameWidth !== 0) {
      bad.push(`${sh.where} — frameWidth ${sh.frameWidth} does not divide the ${size.w}px sheet (${(size.w / sh.frameWidth).toFixed(2)} frames; try ${size.w % 3 === 0 ? size.w / 3 : size.w / 4})`);
    }
  }
  if (bad.length) bad.forEach((b) => fail(`sprite geometry: ${b}`));
  else pass(`${sheets.length} sprite sheet(s) slice cleanly`);
}

/* ---------- 2. audit every story ---------- */
console.log(`\n${GOLD("PREFLIGHT")} — ${STORIES.length} stories in the catalogue\n`);
for (const s of STORIES) {
  console.log(`▸ ${s.title} ${DIM(`[${s.id}]`)}`);
  const issues = validateStory(s);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  if (errors.length) fail(`${errors.length} validator error(s): ${errors.map((e) => e.message).join(" | ")}`);
  else pass(`validator clean${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
  warnings.slice(0, 4).forEach((w) => note(`warn: ${w.message.slice(0, 100)}`));

  auditSheets(s);

  const anyRun = walk(s, false);
  if (anyRun.ending) pass(`playable: walk ends on "${anyRun.ending.title}" [${anyRun.ending.endingData?.tier}] after ${anyRun.visited.length} scenes`);
  else fail(`no ending reachable (stuck at ${anyRun.stuck})`);
  // Episodic seasons: every episode is its own entry point — walk each one
  // and confirm the chapter itself terminates on an ending.
  const eps = Array.isArray(s.episodes) ? s.episodes : [];
  if (eps.length) {
    let epOk = true;
    for (const ep of eps) {
      const savedStart = s.startSceneId;
      s.startSceneId = ep.startSceneId;
      const run = walk(s, false);
      s.startSceneId = savedStart;
      if (run.ending && ep.sceneIds.includes(run.ending.id)) note(`episode ${ep.number ?? "?"} "${ep.title}" closes on "${run.ending.title}"`);
      else { epOk = false; fail(`episode "${ep.title}" walk fails (${run.ending ? `ends outside the episode at ${run.ending.id}` : `stuck at ${run.stuck}`})`); }
    }
    if (epOk) pass(`all ${eps.length} episodes playable and self-closing`);
  }
  // Coverage: union of deep walks from every entry point (story start + each
  // episode start), mirroring the validator's reachability seeding.
  const starts = [s.startSceneId, ...eps.map((e) => e.startSceneId)];
  const covered = new Set();
  starts.forEach((st) => {
    const savedStart = s.startSceneId;
    s.startSceneId = st;
    walk(s, true).visited.forEach((v) => covered.add(v));
    s.startSceneId = savedStart;
  });
  anyRun.visited.forEach((v) => covered.add(v));
  note(`deep walks cover ${covered.size}/${s.scenes.length} scenes`);
  if (covered.size < s.scenes.length) {
    const missed = s.scenes.filter((sc) => !covered.has(sc.id)).map((sc) => sc.title);
    if (missed.length) note(`not walked (still validator-reachable): ${missed.join(", ")}`);
  }

  const victories = s.scenes.filter((x) => x.isEnding && x.endingData?.tier?.startsWith("victory"));
  const gameovers = s.scenes.filter((x) => x.isEnding && x.endingData?.tier === "gameover");
  if (!victories.length) fail("no victory ending — the player cannot win");
  else if (!gameovers.length) note("no game-over ending (advisory)");
  else pass(`endings: ${victories.length} victory / ${gameovers.length} game-over`);

  const refs = assetRefs(s);
  const missing = refs.filter((a) => !existsSync(join(ROOT, "public", a)));
  if (missing.length) fail(`missing asset(s): ${missing.join(", ")}`);
  else pass(`${refs.length} referenced assets all on disk`);

  for (const span of musicTrace(s, [...new Set(anyRun.visited)])) {
    note(`music ${span.track} spans ${span.scenes.length} scene(s): ${span.scenes.slice(0, 3).join(", ")}${span.scenes.length > 3 ? "…" : ""}`);
  }
  console.log("");
}


/* ---------- 3. studio side ---------- */
console.log(`${GOLD("STUDIO SIDE")} — editor contracts\n`);
{
  // Share-link + JSON round trips: exactly what Studio's Share / commit /
  // export pipeline does to a story object.
  for (const s of STORIES) {
    const encoded = encodeStory(s);
    const decoded = decodeStory(encoded);
    const okRound = decoded && JSON.stringify(decoded) === JSON.stringify(s);
    if (!okRound) fail(`${s.title}: share-link encode/decode loses data`);
  }
  pass(`share-link round trip is lossless for all ${STORIES.length} stories`);

  // Episode bookkeeping the Episodes tab relies on.
  for (const s of STORIES) {
    if (!Array.isArray(s.episodes) || !s.episodes.length) continue;
    const orphans = unassignedScenes(s);
    if (orphans.length) fail(`${s.title}: ${orphans.length} scene(s) not in any episode (${orphans.map((o) => o.title).join(", ")})`);
    else pass(`${s.title}: every scene claimed by an episode (${seasonEpisodes(s).length} episodes)`);
    const claimed = seasonEpisodes(s).flatMap((e) => e.sceneIds);
    if (new Set(claimed).size !== claimed.length) fail(`${s.title}: a scene is claimed by two episodes`);
  }

  // Canvas layout helpers (the same functions Studio runs).
  if (canvas) {
    const draft = STORIES.find((x) => x.id === "nobodys-witness-draft");
    const base = draft.layout ?? {};
    // A pile (6 cards stacked at the origin) is repaired; a genuine drag is kept.
    const pile = {};
    draft.scenes.slice(0, 6).forEach((sc) => (pile[sc.id] = { x: 0, y: 0 }));
    const healed = canvas.healLayout(pile, base);
    const pileFixed = draft.scenes.slice(0, 6).every((sc) => {
      const p = healed[sc.id];
      const b = base[sc.id];
      return p && b && p.x === b.x && p.y === b.y;
    });
    if (pileFixed) pass("layout heal repairs a stacked pile (returns every card to its authored slot)");
    else fail("layout heal did not return piled cards to their authored slots");
    const dragged = { [draft.scenes[0].id]: { x: 9999, y: -42 } };
    const healedDrag = canvas.healLayout(dragged, base);
    if (healedDrag[draft.scenes[0].id].x === 9999) pass("layout heal keeps the author's own drags");
    else fail("layout heal clobbered a legitimate drag");
    // Tidy must produce a unique position for every scene of every story.
    let tidyOk = true;
    for (const s of STORIES) {
      const t = canvas.tidyLayoutPositions(s);
      const seen = new Set();
      Object.values(t).forEach((p) => seen.add(`${p.x},${p.y}`));
      if (Object.keys(t).length !== s.scenes.length || seen.size !== Object.keys(t).length) tidyOk = false;
    }
    if (tidyOk) pass("tidy layout gives every scene a unique slot in every story");
    else fail("tidy layout produced collisions or missed scenes");
  } else {
    fail("canvas module not compiled — studio layout tests skipped");
  }
  console.log("");
}

/* ---------- 4. wrap up ---------- */
rmSync(TMP, { recursive: true, force: true });
if (failures) {
  console.log(RED(`PREFLIGHT FAILED — ${failures} problem(s). Fix before shipping.`));
  process.exit(1);
}
console.log(GRN("PREFLIGHT PASSED — catalogue is production-ready. `npm run build` produces dist/index.html (single file).\n"));
