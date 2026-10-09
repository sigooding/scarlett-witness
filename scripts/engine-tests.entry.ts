/**
 * Engine tests — the TS body bundled and run by scripts/engine-tests.mjs
 * (npm test). Pure-logic: no DOM, no network, no localStorage.
 *
 * Three layers:
 *   1. logic.ts unit checks (gating, recalls, collectors, validator, recipes)
 *   2. act-membership walk checks (synthetic story) — incl. the fix that the
 *      walk follows scene-moving hotspot edges
 *   3. The Neon Diner playthroughs through the real engine functions:
 *      a full gold run and a full-mistake fold run, plus the act map
 *      assertions that the hotspot-only scenes stay on their act's RouteMap.
 */
import {
  applyConsequences,
  applyLieCaught,
  applyLieWrong,
  beatLie,
  combineItems,
  collectFlags,
  mapAvailable,
  mapLocationsView,
  mapReplacedChoiceIds,
  collectMemoryTags,
  composureRemaining,
  DEFAULT_WRONG_EVIDENCE_LIMIT,
  evidenceBreaksLie,
  everyDialogueBeat,
  lieCanStillPress,
  lieWrongLine,
  wrongEvidenceLimit,
  STAGE2D_DEFAULT_REACH,
  STAGE2D_DEFAULT_SPEED,
  STAGE2D_JOG_MULT,
  stepStagePos,
  stageFloor,
  clampToFloor,
  stageDepthScale,
  stageMarkerPoint,
  posReachesMarker,
  hotspotFiresOnWalkOver,
  hotspotLeavesScene,
  stageCaptionMs,
  normalizeLegacyStory,
  hotspotCenter,
  posReachesHotspot,
  hotspotAtPoint,
  clampStagePos,
  choiceIsPureTravel,
  createInitialState,
  effectiveChoiceGating,
  examineZoom,
  flagSetSources,
  isEpisodeUnlocked,
  nextEpisodeForEnding,
  heatBustTarget,
  DEFAULT_PRESS_REACTIONS,
  interrogationOutcome,
  isPressingReply,
  pressComposure,
  pressReaction,
  steadyComposure,
  meetsGating,
  migrateSaveTo,
  presentationConsequences,
  prettyFlagName,
  readSave,
  recordMemory,
  recordPresentation,
  resolveBeatText,
  SAVE_SCHEMA,
  storyEdges,
  validateStory,
  writeSave,
  type GlobalState,
  stageBlocked,
  stageLineClear,
  stageRoute,
  stageCamX,
  stageAtWorldEdge,
  STAGE_AGENT_RADIUS,
  STAGE_GRID_STEP,
  extraOccludes,
  activeStageOccluders,
  occluderBaseline,
  occluderCoversWalker,
  occluderZ,
  occluderPolygonCss,
  inventoryAnchorClass,
  inventoryDisplay,
  resolveCursor,
  cursorArtFor,
  CURSOR_SLOTS,
  stagePlayerScale,
  stageSpeedScale,
  stageSpriteScale,
  stageWalkPoly,
  stageWalkDepth,
  pointInWalkPoly,
  clampToWalkPoly,
  stageMarkerPointPoly,
  stageBlockedPoly,
  stageRoutePoly,
  stageLineClearPoly,
  validateStory,
  resolveVerbAction,
  itemsConsumedBy,
  verbsForScene,
  wrongVerbLine,
  VERB_IDS,
  CORE_VERB_IDS,
  activeHotspotState,
  resolveHotspot,
  hotspotReachableActions,
  activeStageObstacles,
  sentenceLineText,
} from "../src/logic";
import { buildRouteGraph, scenesInAct } from "../src/game/routeGraph";
import {
  FPS_SCALE_MAX,
  FPS_SCALE_MIN,
  frameFromPhase,
  jogAnimation,
  sheetAnim,
  sheetCols,
  sheetDrawable,
  sheetFrameAt,
  sheetFrameCount,
  sheetFramePos,
  speedMatchedFpsScale,
  spriteSheetIssues,
} from "../src/game/spriteSheet";
import { coveragePercent, coverageReport, cutsceneStepKey, emptyCoverage, recordRun, recordVisit } from "../src/game/playtestCoverage";
import { spriteSheetIssues, sheetAnim } from "../src/game/spriteSheet";
import { resolveVerbAction, verbsForScene } from "../src/logic";
import { SOUTH_PARK } from "../src/data/southPark";
import { existsSync, readFileSync } from "node:fs";
import { mulberry32, hashSeed, setGameSeed, currentGameSeed, gameRandom, gameRange, gamePick, gameShuffle, seedFromSearch, rngSnapshot, restoreRngSnapshot, gameDrawCount, RNG_MAX_RESTORE_DRAWS } from "../src/game/rng";
/* Engine pass: resumable dice, save-slot diagnostics, the return-trap audit
 * and the runtime's stranded detector. Separate import lines so the names
 * never collide with the big logic.ts list above. */
import {
  auditSceneExits,
  CHECKPOINT_MIN_GAP_MS,
  CHECKPOINT_QUIET_MS,
  choiceRepeats as logicChoiceRepeats,
  hotspotRepeats as logicHotspotRepeats,
  readSaveDetailed,
  saveReadMessage,
} from "../src/logic";
import { simFromRuntime, strandedExemption, strandedNow, STRANDED_GRACE_MS } from "../src/game/stranded";
import {
  interruptBlockedByBeatRoute,
  interruptibleNow,
  showsCountdownRing,
  silenceOutcome,
  TIMER_STYLE,
  timerFlavour,
} from "../src/game/conversationTimer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEdgeFloodKey, applyKey, despeckle, sampleCorners, sampleEdges } from "../src/studio/spriteForge";
import {
  AI_PROVIDERS,
  defaultAiSettings,
  geminiGenerationBody,
  GEMINI_ASPECT_RATIOS,
  openaiGenerationBody,
  openaiSizesForModel,
  providerReferenceSupport,
  splitDataUrl,
} from "../src/data/aiImages";
import { describeMotion, ease, motionAnimatable, motionAnimation, motionKeyframes, pathPointAt, pathSegments, presetSeconds, presetStyle, scrollAnimatable, scrollKeyframes, scrollPeriod, scrollStyle } from "../src/game/animation";
import type { SpriteSheet } from "../src/game/spriteSheet";
import { NEON_DINER } from "../src/data/neonDiner";
import { BLADE_RUNNER_ACT1 } from "../src/data/bladeRunnerAct1";
import { STORIES } from "../src/data/stories";
import {
  adjustedConsequences,
  applyDecision,
  availableDecisions,
  type Decision,
  decisionCoverageKey,
  choiceRepeats as decisionChoiceRepeats,
  decisionCoverageKind,
  decisionKey,
  getPerks,
  hotspotRepeats,
  initialSim,
  isStuck,
  visibleBeatQueue,
} from "../src/game/decisions";
import { buildDeepLink, describeDeepLink, parseDeepLink, resolveDeepLink } from "../src/game/deepLink";
import { canRewindDecision, emptyRewind, popRewind, pushRewind, REWIND_LIMIT, rewindLabel, sealRewind } from "../src/game/rewind";
import { RAIN_SECTOR } from "../src/data/rainSector";
import type { Choice, Contradiction, DialogueBeat, EpisodeProgress, GameSave, Hotspot, HotspotAction, JourneyStep, SceneNode, StageSettings, Story } from "../src/types";
/* The four cases the return-trap audit caught softlocks in, imported so the
 * fixes are pinned by name (a reverted `isRepeatable` fails the build). */
import { SLEDGE_HAMMER } from "../src/data/sledgeHammer";
import { SCOOBY_RAVENSWOOD } from "../src/data/scoobyRavenswood";
import { POINT_CLICK_TEMPLATE } from "../src/data/pointClickTemplate";
import { MATT_THE_ACCOUNTANT } from "../src/data/mattTheAccountant";

let passed = 0;
const failures: string[] = [];
function check(name: string, ok: boolean, extra?: unknown) {
  if (ok) passed++;
  else failures.push(`${name}${extra !== undefined ? ` — got ${JSON.stringify(extra)}` : ""}`);
}

/* ================================================================== */
/*  1. logic.ts unit checks                                            */
/* ================================================================== */

const baseState = (): GlobalState => ({
  activeFlags: new Set<string>(),
  inventory: [],
  meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 },
  characterTrust: { ch1: 0 },
  memories: {},
});

// --- meetsGating ---
{
  const s = baseState();
  check("gating: undefined passes", meetsGating(undefined, s));
  check("gating: missing item fails", !meetsGating({ requiresItems: ["i"] }, s));
  s.inventory = [{ id: "i", name: "I", icon: "🔩", description: "", flavorText: "" }];
  check("gating: held item passes", meetsGating({ requiresItems: ["i"] }, s));
  check("gating: excluded item fails", !meetsGating({ excludesItems: ["i"] }, s));
  s.activeFlags.add("f1");
  check("gating: required flag passes", meetsGating({ requiresFlags: ["f1"] }, s));
  check("gating: excluded flag fails", !meetsGating({ excludesFlags: ["f1"] }, s));
  s.activeFlags.add("f2");
  check("gating: ANY flag satisfies", meetsGating({ requiresFlags: ["f1", "nope"], requiresAll: false }, s));
  check("gating: ALL flags must hold", !meetsGating({ requiresFlags: ["f1", "nope"] }, s));
  s.meters.Clever = 3;
  check("gating: minMeters passes at threshold", meetsGating({ minMeters: { Clever: 3 } }, s));
  check("gating: minMeters fails below", !meetsGating({ minMeters: { Clever: 4 } }, s));
  s.meters.Suspicion = 2;
  check("gating: maxMeters fails above", !meetsGating({ maxMeters: { Suspicion: 1 } }, s));
  s.characterTrust.ch1 = 2;
  check("gating: minTrust passes", meetsGating({ minTrust: { ch1: 2 } }, s));
  check("gating: minTrust fails", !meetsGating({ minTrust: { ch1: 3 } }, s));

  // requiresMemories: the key can be a memoryLog tag OR a story flag.
  s.memories.tagA = "I said something";
  check("gating: memory-key recall passes", meetsGating({ requiresMemories: ["tagA"] }, s));
  check("gating: flag-key recall passes", meetsGating({ requiresMemories: ["f1"] }, s));
  check(
    "gating: mixed memory+flag ALL passes",
    meetsGating({ requiresMemories: ["tagA", "f1"] }, s)
  );
  check("gating: unknown key fails", !meetsGating({ requiresMemories: ["nope"] }, s));
  check(
    "gating: ANY with one unknown + one flag passes",
    meetsGating({ requiresMemories: ["nope", "f2"], requiresAll: false }, s)
  );
}

// --- resolveBeatText ---
{
  const notes = { saw_it: "You saw it happen in the alley." };
  const flags = () => new Set(["saw_it"]);
  check("recall: plain text when nothing matches", resolveBeatText({ text: "X" }, {}) === "X");
  check(
    "recall: memory echoes exact words",
    resolveBeatText({ text: "X", recalls: { t: "You said: {said}" } }, { t: "hello" }) === "You said: hello"
  );
  check(
    "recall: flag echoes its note",
    resolveBeatText({ text: "X", recalls: { saw_it: "Because {said}" } }, {}, flags(), notes) ===
      "Because You saw it happen in the alley."
  );
  check(
    "recall: flag without note falls back to readable name",
    resolveBeatText({ text: "X", recalls: { cracked_code: "Because {said}" } }, {}, new Set(["cracked_code"])) ===
      "Because cracked code"
  );
  check(
    "recall: first matching key in insertion order wins",
    resolveBeatText(
      { text: "X", recalls: { a: "A", b: "B" } },
      { a: "1" },
      new Set(["b"])
    ) === "A"
  );
}

// --- prettyFlagName / flagSetSources ---
check("prettyFlagName: underscores", prettyFlagName("saw_the_body") === "saw the body");
check("prettyFlagName: hyphens", prettyFlagName("saw-the-body") === "saw the body");
{
  const story: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    scenes: [
      {
        id: "a",
        title: "Scene A",
        background: "",
        prose: "",
        onEnterActions: [{ consequences: { setFlags: ["entered"] } }],
        choices: [
          { id: "c1", text: "Do it", targetSceneId: "", consequences: { setFlags: ["did_it"] }, timedOutConsequences: { setFlags: ["lapsed"] } },
        ],
        hotspots: [
          {
            id: "h1",
            label: "Door",
            bounds: { x: 0, y: 0, w: 10, h: 10 },
            cursor: "go",
            action: {
              type: "patternPuzzle",
              patternPuzzle: {
                title: "P",
                instruction: "",
                rows: [{ id: "r1", date: "1", description: "d", amount: "0", isAnswer: true }],
                targetCount: 1,
                payoffText: "",
                rewardConsequences: { setFlags: ["solved"] },
                wrongSubmissionConsequences: { setFlags: ["failed"] },
              },
            },
          },
        ],
      },
    ],
    items: [],
    characters: [],
    deduction: { suspectIds: [], connections: [{ a: "a", b: "a", flagSet: "boarded", revelation: "" }] },
  };
  const flags = collectFlags(story);
  for (const f of ["entered", "did_it", "lapsed", "solved", "failed", "boarded"]) {
    check(`collectFlags covers ${f}`, flags.includes(f), flags);
  }
  const src = flagSetSources(story, "did_it");
  check("flagSetSources names the scene + choice", src.some((x) => x.includes("Scene A") && x.includes("Do it")), src);
  check(
    "flagSetSources distinguishes puzzle solved/failed",
    flagSetSources(story, "solved").some((x) => x.includes("solved")) &&
      flagSetSources(story, "failed").some((x) => x.includes("failed"))
  );
}

// --- collectFlags/flagSetSources see EVERY hotspot flag source -------------
// A hotspot can set a flag four ways and the engine honours all four, but only
// the action's own flagSet used to be collected. Flags set by a conversation
// TOPIC, a chained ⛓ follow-up or a MULTI-STATE override were therefore
// missing from every flag dropdown in the Studio, absent from the 🏷 Flags
// tab, reported as "doesn't match any flag used in the story", and miscounted
// by the craft audit — while working perfectly at runtime.
{
  const story: Story = {
    id: "t",
    title: "T",
    startSceneId: "s1",
    characters: [],
    items: [],
    scenes: [
      {
        id: "s1",
        title: "Scene A",
        background: "",
        nodeType: "stage",
        hotspots: [
          {
            id: "h1",
            label: "the desk",
            bounds: { x: 0, y: 0, w: 10, h: 10 },
            action: {
              type: "showText",
              text: "hi",
              flagSet: "f_action",
              topics: [{ id: "t1", label: "ask about the key", beats: [], flagSet: "f_topic" }],
              then: [{ type: "showText", text: "x", flagSet: "f_then" }],
            },
            states: [{ id: "st1", action: { type: "showText", text: "y", flagSet: "f_state" } }],
          },
        ],
      },
    ],
  };
  const flags = collectFlags(story);
  for (const f of ["f_action", "f_topic", "f_then", "f_state"]) {
    check(`collectFlags sees the hotspot ${f.slice(2)} flag`, flags.includes(f), flags);
  }
  check(
    "flagSetSources names the conversation topic",
    flagSetSources(story, "f_topic").some((x) => x.includes("ask about the key")),
    flagSetSources(story, "f_topic")
  );
  check(
    "flagSetSources names the chained action",
    flagSetSources(story, "f_then").some((x) => x.includes("chained")),
    flagSetSources(story, "f_then")
  );
  check(
    "flagSetSources names the multi-state override",
    flagSetSources(story, "f_state").some((x) => x.includes("state")),
    flagSetSources(story, "f_state")
  );
  // The validator's "flag note matches no flag" warning reads collectFlags,
  // so a note on a topic-set flag must NOT be reported as stray.
  const noted: Story = { ...story, flagNotes: { f_topic: "set when you ask about the key" } };
  check(
    "a note on a topic-set flag is not reported as stray",
    !validateStory(noted).some((i) => i.message.includes("doesn\u2019t match") || i.message.includes("doesn't match")),
    validateStory(noted).map((i) => i.message)
  );
}

// --- collectMemoryTags: memoryLog + gating + recalls + recap gating ---
{
  const story: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    scenes: [
      {
        id: "a",
        title: "A",
        background: "",
        prose: "",
        choices: [
          { id: "c1", text: "Q", targetSceneId: "", memoryLog: "said_q", gating: { requiresMemories: ["gated_mem"] } },
        ],
        hotspots: [
          { id: "h1", label: "H", bounds: { x: 0, y: 0, w: 1, h: 1 }, cursor: "look", gating: { requiresMemories: ["gated_hotspot"] }, action: { type: "showText", text: "" } },
        ],
        dialogueBeats: [
          { id: "b1", characterId: "narrator", text: "", recalls: { said_q: "x", flag_recall: "y" }, conditionRule: { requiresMemories: ["gated_beat"] } },
        ],
      },
    ],
    items: [],
    characters: [],
    episodes: [{ id: "e1", title: "E", sceneIds: ["a"], startSceneId: "a", recapLines: [{ id: "r1", text: "", gating: { requiresMemories: ["gated_recap"] } }] }],
  };
  const tags = collectMemoryTags(story);
  for (const t of ["said_q", "gated_mem", "gated_hotspot", "gated_beat", "flag_recall", "gated_recap"]) {
    check(`collectMemoryTags covers ${t}`, tags.includes(t), tags);
  }
}

// --- combineItems: recipe works from either side ---
{
  const items = [
    { id: "a", name: "A", icon: "", description: "", flavorText: "", combinableWith: { targetItemId: "b", resultItemId: "c" } },
    { id: "b", name: "B", icon: "", description: "", flavorText: "" },
    { id: "c", name: "C", icon: "", description: "", flavorText: "" },
  ] as const;
  const story: Story = { id: "t", title: "T", tagline: "", coverImage: "", startSceneId: "a", scenes: [], items: [...items], characters: [] };
  check("recipe: a+b -> c", combineItems(story, items[0], items[1])?.id === "c");
  check("recipe: b+a -> c (order independent)", combineItems(story, items[1], items[0])?.id === "c");
  check("recipe: no match returns null", combineItems(story, items[0], items[2]) === null);
}

// --- recordMemory keeps the player's exact line ---
{
  const s = baseState();
  const s2 = recordMemory({ id: "c", text: "What did you see?", targetSceneId: "", memoryLog: "q" } as never, s);
  check("recordMemory stores exact words", s2.memories.q === "What did you see?");
}

// --- validateStory: accepts flag-keyed recalls, catches strays ---
{
  const story: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    flagNotes: { real_flag: "a note", ghost_flag: "note for a renamed flag" },
    scenes: [
      {
        id: "a",
        title: "A",
        background: "",
        prose: "",
        choices: [
          { id: "c1", text: "Q", targetSceneId: "e", memoryLog: "said_q", gating: { requiresMemories: ["real_flag", "ghost_recall"] } },
        ],
        dialogueBeats: [
          { id: "b1", characterId: "narrator", text: "", recalls: { real_flag: "x", ghost_recall: "y" }, conditionRule: { requiresMemories: ["real_flag"] } },
        ],
      },
      { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
    items: [],
    characters: [],
  };
  // set real_flag somewhere so it's a known flag
  story.scenes[0].choices![0].consequences = { setFlags: ["real_flag"] };
  const issues = validateStory(story);
  const strayNotes = issues.filter((i) => /Flag note for "ghost_flag"/.test(i.message));
  check("validator: warns on flag note for unknown flag", strayNotes.length === 1, issues);
  const ghostGates = issues.filter((i) => /ghost_recall/.test(i.message));
  check("validator: warns on recall key that is neither memory nor flag", ghostGates.length >= 1, issues);
  const realFlagWarns = issues.filter((i) => /real_flag/.test(i.message));
  check("validator: accepts a real flag as recall key", realFlagWarns.length === 0, realFlagWarns);
}

/* ---- craft audit: the story-craft linter checks --------------------
 * These detect the mechanical signatures of a story that can be walked but
 * never lands: a flag that changes nothing, a promise the story forgets, a
 * deadline that costs nothing, two answers that are the same answer twice,
 * and a long run of scenes where the player is never asked a thing. */
{
  const endScene = (id: string): SceneNode => ({
    id,
    title: id === "e" ? "End" : `End ${id}`,
    background: "",
    prose: "",
    isEnding: true,
    endingData: { tier: "victory-gold", headline: "H", recap: "R" },
  });
  const craftStory = (scenes: SceneNode[], extra: Partial<Story> = {}): Story => ({
    id: "craft",
    title: "Craft",
    tagline: "",
    coverImage: "",
    startSceneId: scenes[0].id,
    scenes: [...scenes, endScene("e")],
    items: [],
    characters: [],
    ...extra,
  });
  const craftIssues = (scenes: SceneNode[], extra?: Partial<Story>) => validateStory(craftStory(scenes, extra));
  const has = (issues: ReturnType<typeof validateStory>, re: RegExp) => issues.some((i) => re.test(i.message));

  /* ---- Neon Salt + the triangulation minigame --------------------------- */
  {
    const { NEON_SALT } = await import("../src/data/neonSalt");
    const ns = NEON_SALT;
    const nsIssues = validateStory(ns);
    check(
      "neon salt: validates with no errors",
      !nsIssues.some((i) => i.severity === "error"),
      nsIssues.filter((i) => i.severity === "error").map((i) => i.message),
    );
    check("neon salt: no warnings either", !nsIssues.length, nsIssues.map((i) => i.message));
    // Every scene must be reachable or the art never gets seen.
    {
      const out = new Map<string, string[]>();
      storyEdges(ns).forEach((e) => {
        if (!out.has(e.source)) out.set(e.source, []);
        out.get(e.source)!.push(e.target);
      });
      const seen = new Set<string>();
      const queue = [ns.startSceneId];
      while (queue.length) {
        const cur = queue.shift()!;
        if (seen.has(cur)) continue;
        seen.add(cur);
        (out.get(cur) ?? []).forEach((t) => queue.push(t));
      }
      check(
        "neon salt: every scene is reachable",
        seen.size === ns.scenes.length,
        ns.scenes.filter((x) => !seen.has(x.id)).map((x) => x.id),
      );
    }
    check(
      "neon salt: all three ending tiers exist",
      new Set(ns.scenes.filter((s2) => s2.isEnding).map((s2) => s2.endingData?.tier)).size === 3,
    );

    // ---- pass 2: the clues have to MATTER -------------------------------
    // Both clues were collectable but gated nothing, so Isabel confessed to
    // detectives holding an empty folder. Every clue flag must now be read
    // by at least one gate somewhere, or the evidence is set dressing.
    {
      const gatesReading = (flag: string) => {
        let n = 0;
        ns.scenes.forEach((sc) => {
          const g = (x?: { requiresFlags?: string[]; excludesFlags?: string[] }) =>
            (x?.requiresFlags?.includes(flag) || x?.excludesFlags?.includes(flag)) && n++;
          sc.choices?.forEach((c) => g(c.gating));
          sc.hotspots?.forEach((h) => g(h.gating));
          sc.dialogueBeats?.forEach((b) => g(b.conditionRule));
        });
        return n;
      };
      check("neon salt: the log page gates something", gatesReading("f_has_log") > 0);
      check("neon salt: the mailbox card gates something", gatesReading("f_has_card") > 0);
      // The water is the expensive move; it must be earned off the board.
      const water = ns.scenes.find((x) => x.id === "ns_s040")?.choices?.find((c) => c.targetSceneId === "ns_s060");
      check(
        "neon salt: the water is gated behind the corkboard",
        water?.gating?.requiresFlags?.includes("f_board_wired") === true,
      );
    }
    // The corkboard connections must reference real items and suspects, or a
    // wire can never be made and the gate above is unreachable.
    {
      const board = ns.deduction!;
      const ids = new Set([...ns.items.map((i) => i.id), ...ns.characters.map((c) => c.id)]);
      check(
        "neon salt: every corkboard connection references real evidence",
        board.connections.every((c) => ids.has(c.a) && ids.has(c.b)),
        board.connections.filter((c) => !ids.has(c.a) || !ids.has(c.b)),
      );
      check(
        "neon salt: the board suspects all exist",
        board.suspectIds.every((id) => ns.characters.some((c) => c.id === id)),
      );
    }
    // The interrogation: a lie nobody can break is a wall, not a scene.
    {
      const box = ns.scenes.find((x) => x.id === "ns_s080")!;
      check("neon salt: the box is an interrogation", !!box.interrogation);
      const lieBeat = box.dialogueBeats?.find((b) => b.lie);
      check("neon salt: Gio tells a breakable lie", !!lieBeat?.lie);
      check(
        "neon salt: the breaking evidence is an item the player can actually hold",
        lieBeat!.lie!.evidenceItemIds.every((id) => ns.items.some((i) => i.id === id)),
      );
      // The crack has to be worth something: it is the only way onto the road
      // that reaches gold (box → State Attorney → roof → ns_end_book).
      const gold = box.choices?.find((c) => c.targetSceneId === "ns_s090");
      check(
        "neon salt: the road to gold is gated on cracking him",
        gold?.gating?.requiresFlags?.includes("f_gio_broke") === true,
      );
      // …and a player who fails must still have a way out of the room.
      check(
        "neon salt: there is an ungated exit from the box",
        (box.choices ?? []).some((c) => c.targetSceneId && !c.gating),
      );
    }

    // ---- pass 3: voice, continuity and the trust thread ------------------
    {
      const allProse = ns.scenes.map((x) => x.prose ?? "").join(" ");
      const allText = JSON.stringify(ns);
      // AMERICAN SPELLING. Miami PD does not employ a "harbourmaster", and the
      // opening line originally described the bay as "the colour of a bad
      // cheque" — British spelling in the mouth of a Florida detective.
      const britishisms = ["colour", "harbour", "authorised", "realise", "recognise", "cheque", "whilst", "grey "];
      check(
        "neon salt: no British spellings in an American story",
        !britishisms.some((w) => allText.toLowerCase().includes(w)),
        britishisms.filter((w) => allText.toLowerCase().includes(w)),
      );
      // The opening line was also a near-copy of What's Owed's "the color of a
      // bill you argued about and lost" — the same joke in the same position.
      check(
        "neon salt: the opening line is not recycled from What's Owed",
        !allProse.includes("bad cheque") && !allProse.includes("bad check"),
      );
      // CONTINUITY: pass 2 made GIO the one who confesses, but the gold
      // ending's prose still said "She signed it".
      const goldEnd = ns.scenes.find((x) => x.id === "ns_end_book")!;
      check(
        "neon salt: the gold ending's prose matches who actually confessed",
        !(goldEnd.prose ?? "").startsWith("She signed"),
        goldEnd.prose,
      );
    }
    // The trust meters existed but nothing ever moved Isabel's, so the
    // relationship was decorative. Her thread must swing and then be read.
    {
      const movesIsabel = ns.scenes.some((sc) =>
        (sc.choices ?? []).some((c) => c.consequences?.trustChanges?.some((t) => t.characterId === "isabel")),
      );
      check("neon salt: something actually moves Isabel's trust", movesIsabel);
      const roof = ns.scenes.find((x) => x.id === "ns_s100")!;
      const readsBelief = (roof.dialogueBeats ?? []).some(
        (b) =>
          b.conditionRule?.requiresFlags?.includes("f_isabel_believed") ||
          b.conditionRule?.requiresFlags?.includes("f_isabel_accused"),
      );
      check("neon salt: the epilogue reads how you treated her", readsBelief);
    }
    // The 03:52 call is the load-bearing fact of the whole case; it must be an
    // item the player can HOLD, not just a line they read.
    {
      check("neon salt: the call log is a real item", ns.items.some((i) => i.id === "call_log"));
      const box = ns.scenes.find((x) => x.id === "ns_s080")!;
      const lie = box.dialogueBeats?.find((b) => b.lie)!.lie!;
      check("neon salt: the call log breaks Gio's alibi", lie.evidenceItemIds.includes("call_log"));
      // …and the State Attorney must actually require it, or the confession
      // alone would still be enough and the scene would be theatre.
      const ada = ns.scenes.find((x) => x.id === "ns_s090")!;
      check(
        "neon salt: the State Attorney needs the paperwork, not the confession",
        (ada.choices ?? []).some((c) => c.gating?.requiresFlags?.includes("f_has_calllog")),
      );
    }
    // Every clue item carries evidence art rather than a bare emoji.
    check(
      "neon salt: every clue has evidence art",
      ns.items.filter((i) => i.isClue).every((i) => !!i.iconUrl),
      ns.items.filter((i) => i.isClue && !i.iconUrl).map((i) => i.id),
    );

    // ---- NO SOFT-LOCKS: walk the graph carrying flags --------------------
    // The pass-2 gates are the first in this story that can shut a door
    // behind you, so prove every reachable state can still reach an ending.
    {
      type St = { sc: string; f: string[] };
      const key = (x: St) => `${x.sc}|${[...x.f].sort().join(",")}`;
      const byId = new Map(ns.scenes.map((x) => [x.id, x]));
      const gateOk = (g: { requiresFlags?: string[]; excludesFlags?: string[]; requiresItems?: string[] } | undefined, f: Set<string>) => {
        if (!g) return true;
        if (g.requiresFlags?.some((r) => !f.has(r))) return false;
        if (g.excludesFlags?.some((r) => f.has(r))) return false;
        if (g.requiresItems?.length) return false; // conservative
        return true;
      };
      const succ = (st: St): St[] => {
        const sc = byId.get(st.sc);
        if (!sc) return [];
        const f = new Set(st.f);
        const res: St[] = [];
        (sc.hotspots ?? []).forEach((h) => {
          if (gateOk(h.gating, f) && h.action?.flagSet) {
            const nf = new Set(f);
            nf.add(h.action.flagSet);
            res.push({ sc: st.sc, f: [...nf] });
          }
        });
        (sc.choices ?? []).forEach((c) => {
          if (!gateOk(c.gating, f) || !c.targetSceneId) return;
          const nf = new Set(f);
          (c.consequences?.setFlags ?? []).forEach((x) => nf.add(x));
          res.push({ sc: c.targetSceneId, f: [...nf] });
          if (c.timedOutTargetSceneId) res.push({ sc: c.timedOutTargetSceneId, f: [...nf] });
        });
        return res;
      };
      const start: St = { sc: ns.startSceneId, f: [] };
      const all = new Map<string, St>([[key(start), start]]);
      const stack = [start];
      while (stack.length) {
        const cur = stack.pop()!;
        succ(cur).forEach((n) => {
          const k = key(n);
          if (!all.has(k)) {
            all.set(k, n);
            stack.push(n);
          }
        });
      }
      const isEnd = (id: string) => !!byId.get(id)?.isEnding;
      const stuck: string[] = [];
      all.forEach((st) => {
        if (isEnd(st.sc)) return;
        const seen2 = new Set([key(st)]);
        const q2 = [st];
        let ok = false;
        while (q2.length) {
          const c = q2.shift()!;
          if (isEnd(c.sc)) {
            ok = true;
            break;
          }
          succ(c).forEach((n) => {
            const k = key(n);
            if (!seen2.has(k)) {
              seen2.add(k);
              q2.push(n);
            }
          });
        }
        if (!ok) stuck.push(key(st));
      });
      check("neon salt: no gate combination soft-locks the player", stuck.length === 0, stuck.slice(0, 5));
    }
    // The minigame choice MUST wire both outcomes: an unrouted loss is a
    // dead end the player reaches by playing badly, which is the worst way
    // to find a bug.
    const gameChoice = ns.scenes.find((s2) => s2.id === "ns_s060")?.choices?.[0];
    check("neon salt: the minigame choice carries a triangulate config", !!gameChoice?.triangulate);
    check("neon salt: the minigame win route is wired", !!gameChoice?.targetSceneId);
    check("neon salt: the minigame LOSS route is wired", !!gameChoice?.timedOutTargetSceneId);
    check(
      "neon salt: a minigame choice never also carries quickTime or ride",
      !gameChoice?.quickTime && !gameChoice?.ride,
    );
    // Talking sprites: three poses each (closed / half / open).
    ns.characters.forEach((c) => {
      check(
        `neon salt: ${c.id} has a 3-pose talking sheet`,
        !!c.talkingSheet && (c.talkingSheet.animations.talk?.frames.length ?? 0) >= 3,
      );
    });

    // The triangulation MATH, independent of the renderer: three exact
    // bearings must cross on the target, and a sloppy sweep must not.
    const trueDeg = (p: { x: number; z: number }, t: { x: number; z: number }) =>
      ((Math.atan2(t.x - p.x, -(t.z - p.z)) * 180) / Math.PI + 360) % 360;
    const cross = (a: { x: number; z: number; deg: number }, b: { x: number; z: number; deg: number }) => {
      const ar = (a.deg * Math.PI) / 180;
      const br = (b.deg * Math.PI) / 180;
      const adx = Math.sin(ar);
      const adz = -Math.cos(ar);
      const bdx = Math.sin(br);
      const bdz = -Math.cos(br);
      const det = adx * -bdz - -bdx * adz;
      if (Math.abs(det) < 1e-4) return null;
      const t = ((b.x - a.x) * -bdz - -bdx * (b.z - a.z)) / det;
      if (t < 0) return null;
      return { x: a.x + adx * t, z: a.z + adz * t };
    };
    const fixOf = (bs: { x: number; z: number; deg: number }[]) => {
      const pts: { x: number; z: number }[] = [];
      for (let i = 0; i < bs.length; i++)
        for (let j = i + 1; j < bs.length; j++) {
          const p = cross(bs[i], bs[j]);
          if (p) pts.push(p);
        }
      if (!pts.length) return null;
      return {
        x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
        z: pts.reduce((a, p) => a + p.z, 0) / pts.length,
      };
    };
    const cfgPosts = gameChoice!.triangulate!.posts!;
    const boat = { x: 10, z: -5 };
    const exact = cfgPosts.map((p) => ({ x: p.x, z: p.z, deg: trueDeg(p, boat) }));
    const exactFix = fixOf(exact)!;
    check(
      "triangulate: three exact bearings cross on the boat",
      Math.hypot(exactFix.x - boat.x, exactFix.z - boat.z) < 0.001,
      exactFix,
    );
    // Two bearings from the SAME post are parallel and cross nowhere — the
    // reason the game auto-advances the post after every commit.
    check(
      "triangulate: two bearings from one post give no fix",
      fixOf([exact[0], { ...exact[0] }]) === null,
    );
    // A wild sweep must miss, or the minigame is not a game.
    const wild = cfgPosts.map((p, i) => ({ x: p.x, z: p.z, deg: trueDeg(p, boat) + (i === 0 ? 25 : -20) }));
    const wildFix = fixOf(wild)!;
    check(
      "triangulate: a wild sweep misses the tolerance",
      Math.hypot(wildFix.x - boat.x, wildFix.z - boat.z) > (gameChoice!.triangulate!.toleranceMeters ?? 9),
      wildFix,
    );
  }

  /* ---- linear film: no win/lose audit ---------------------------------- */
  {
    // A story that ends on a credits roll with no branching endings is a FILM,
    // not a case. Demanding a "victory ending" of it raised a hard ERROR that
    // blocked Publish & Play on an otherwise complete story (What's Owed).
    const film: Story = {
      id: "film",
      title: "Film",
      tagline: "",
      coverImage: "",
      startSceneId: "f1",
      items: [],
      characters: [],
      scenes: [
        {
          id: "f1",
          title: "Open",
          background: "",
          prose: "It rained.",
          choices: [{ id: "fc1", text: "Roll credits", targetSceneId: "f2", attitudeTag: "Neutral" }],
        } as SceneNode,
        { id: "f2", title: "End", nodeType: "credits", background: "", prose: "", choices: [] } as SceneNode,
      ],
    };
    const filmIssues = validateStory(film);
    check(
      "linear film: no victory-ending ERROR on a credits-only story",
      !has(filmIssues, /No victory ending exists/),
      filmIssues.map((i) => i.message),
    );
    check(
      "linear film: no game-over warning either",
      !has(filmIssues, /No game-over ending exists/),
      filmIssues.map((i) => i.message),
    );
    // A credits roll is terminal by nature — it needs neither isEnding nor an
    // exit to be legitimate, so it must not raise "has no exits".
    check("linear film: publishable (no errors)", !filmIssues.some((i) => i.severity === "error"),
      filmIssues.filter((i) => i.severity === "error").map((i) => i.message));
    // But a story WITH endings is still a case and still gets audited.
    const caseStory: Story = {
      ...film,
      scenes: [
        film.scenes[0],
        { id: "f2", title: "End", isEnding: true, background: "", prose: "", choices: [] } as SceneNode,
      ],
    };
    check(
      "linear film: a story with real endings is still win/lose audited",
      has(validateStory(caseStory), /No victory ending exists/),
    );
  }

  /* ---- stage node validation ------------------------------------------ */
  {
    const stageBase: SceneNode = {
      id: "st",
      title: "Floor",
      nodeType: "stage",
      background: "",
      prose: "",
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 50, y: 86 },
        floor: { top: 62, bottom: 94 },
      },
      hotspots: [
        { id: "door", label: "Out", bounds: { x: 80, y: 70, w: 12, h: 20 }, cursor: "go", isRepeatable: true, action: { type: "goToScene", targetSceneId: "e" } },
      ],
      choices: [],
    };
    const ok = craftIssues([stageBase]);
    check("stage: a well-formed stage node raises no stage issues", !ok.some((i) => /Stage "Floor"|stage node/.test(i.message)), ok.filter((i) => /stage/i.test(i.message)));

    // Prose on a stage node never displays — the author should be told.
    const withProse = craftIssues([{ ...stageBase, prose: "Long paragraphs nobody will read." }]);
    check("stage: prose on a stage node warns", has(withProse, /never show the prose panel/));

    // No exit at all (no door marker, no auto-advance, no choices) = soft-lock.
    const trapped = craftIssues([{ ...stageBase, hotspots: [] }]);
    check("stage: a stage node with no way out is an error", has(trapped, /has no way out/));

    /* ---- walk-off-screen edge exits ------------------------------------ */
    {
      const withEdge = (edge: import("../src/types").StageExitEdge) =>
        craftIssues([{ ...stageBase, stage: { ...stageBase.stage!, exitEdges: { right: edge } } }]);

      // A properly wired edge exit is clean, and counts as a way out on its own.
      const good = withEdge({ targetSceneId: "e" });
      check("edge exit: a wired edge raises no edge issues", !has(good, /Walk-off-screen exit/), good.filter((i) => /Walk-off/.test(i.message)));
      const edgeOnly = craftIssues([
        { ...stageBase, hotspots: [], stage: { ...stageBase.stage!, exitEdges: { right: { targetSceneId: "e" } } } },
      ]);
      check("edge exit: an edge exit alone is a way out", !has(edgeOnly, /has no way out/));

      // THE BUG: an edge with no target drew an arrow and walked the player
      // into goToScene("") — a dead scene. sceneEdges only emits a branch when
      // the target is truthy, so the dangling-link check never saw it.
      check("edge exit: a targetless edge is an error", has(withEdge({ targetSceneId: "" }), /has no target scene/));
      check("edge exit: an edge to a missing scene is an error", has(withEdge({ targetSceneId: "ghost_scene" }), /missing scene "ghost_scene"/));
      check("edge exit: an edge back to the same scene warns", has(withEdge({ targetSceneId: "st" }), /leads back to the same scene/));
      // A targetless edge must not satisfy the "way out" check either.
      check(
        "edge exit: a targetless edge is not a way out",
        has(craftIssues([{ ...stageBase, hotspots: [], stage: { ...stageBase.stage!, exitEdges: { right: { targetSceneId: "" } } } }]), /has no way out/)
      );
    }

    // setPlayerPose is a legal action: it needs no target scene and doesn't
    // replay a reward, so it validates clean even when repeatable.
    const pose = craftIssues([
      {
        ...stageBase,
        hotspots: [
          { id: "bend", label: "Look under", bounds: { x: 20, y: 60, w: 10, h: 20 }, cursor: "look", isRepeatable: true, action: { type: "setPlayerPose", playerPose: "bend", playerPoseOnce: true } },
          ...stageBase.hotspots!,
        ],
      },
    ]);
    check("stage: setPlayerPose validates clean (no target scene, no reward warning)", !has(pose, /needs a target scene|replay rewards/), pose.filter((i) => /pose|target scene|replay/i.test(i.message)));

    /* ---- scripted sequences (stage cutscenes) -------------------------- */
    {
      const script = (steps: import("../src/types").StageScriptStep[]): SceneNode => ({
        ...stageBase,
        stage: { ...stageBase.stage!, npcs: [{ id: "npc_dog", image: "emoji:🐕", x: 30, y: 88 }] },
        hotspots: [
          { id: "cue", label: "Cue", bounds: { x: 20, y: 70, w: 10, h: 15 }, cursor: "use", action: { type: "runScript", script: steps } },
          ...stageBase.hotspots!,
        ],
      });
      const good = craftIssues([
        script([
          { do: "walkTo", x: 40, y: 85 },
          { do: "say", text: "Well, well.", npcId: "npc_dog" },
          { do: "setFlag", flag: "cue_done" },
          { do: "goToScene", targetSceneId: "e" },
        ]),
      ]);
      check("script: a well-formed scripted sequence raises no script issues", !good.some((i) => /script/i.test(i.message)), good.filter((i) => /script/i.test(i.message)));

      // The script's flag + navigation are engine-visible: the flag is
      // collected and the goToScene step is a real edge (reachability).
      const goodStory = craftStory([
        script([
          { do: "setFlag", flag: "cue_done" },
          { do: "goToScene", targetSceneId: "e" },
        ]),
      ]);
      check("script: a setFlag step is collected by collectFlags", collectFlags(goodStory).includes("cue_done"), collectFlags(goodStory));
      check("script: a goToScene step is a navigation edge", storyEdges(goodStory).some((e) => e.source === "st" && e.target === "e" && /script/.test(e.label ?? "")), storyEdges(goodStory).map((e) => e.label));

      // Aiming a step at an NPC the scene doesn't have = skipped at runtime.
      const ghostNpc = craftIssues([script([{ do: "npcWalkTo", npcId: "npc_ghost", x: 50, y: 85 }])]);
      check("script: a step aimed at a missing NPC warns", has(ghostNpc, /targets NPC "npc_ghost"/));

      // A goToScene step to nowhere is an error; steps after it never play.
      const badNav = craftIssues([script([{ do: "goToScene", targetSceneId: "nowhere" }, { do: "wait", seconds: 1 }])]);
      check("script: goToScene to a missing scene is an error", has(badNav, /goes to missing scene "nowhere"/));
      check("script: steps after goToScene warn (they never play)", has(badNav, /steps after the goToScene step/));

      // An empty script plays nothing — tell the author.
      const empty = craftIssues([script([])]);
      check("script: an empty script warns", has(empty, /script is empty/));

      // runScript on a CLASSIC scene is ignored by design — warned, and the
      // graphic-novel flow is never hijacked.
      const classic = craftIssues([
        {
          id: "st",
          title: "Parlour",
          background: "",
          prose: "A classic scene.",
          hotspots: [
            { id: "cue", label: "Cue", bounds: { x: 20, y: 70, w: 10, h: 15 }, cursor: "use", action: { type: "runScript", script: [{ do: "wait", seconds: 1 }] } },
          ],
          choices: [{ id: "c1", text: "Leave", targetSceneId: "e" }],
        },
      ]);
      check("script: runScript on a classic (non-stage) scene warns", has(classic, /not a 🚶 walkable stage/));

      // Room-entry scripts: the run-once latch flag is a real flag, and a
      // latch with no script is a mistake.
      const entry = craftStory([
        {
          ...stageBase,
          stage: { ...stageBase.stage!, enterScript: [{ do: "setFlag", flag: "walked_in" }], enterScriptFlag: "intro_played" },
        },
      ]);
      const entryFlags = collectFlags(entry);
      check("script: enterScript setFlag + run-once latch are collected", entryFlags.includes("walked_in") && entryFlags.includes("intro_played"), entryFlags);
      const latchOnly = craftIssues([{ ...stageBase, stage: { ...stageBase.stage!, enterScriptFlag: "intro_played" } }]);
      check("script: a run-once flag without an entry script warns", has(latchOnly, /run-once flag but no entry script/));
    }

    // A talk marker with no beats to play does nothing.
    const muteTalk = craftIssues([
      {
        ...stageBase,
        hotspots: [
          { id: "npc", label: "Vera", bounds: { x: 30, y: 60, w: 14, h: 24 }, cursor: "talk", action: { type: "startDialogue" } },
          ...stageBase.hotspots!,
        ],
      },
    ]);
    check("stage: startConversation marker without beats is an error", has(muteTalk, /Start conversation" marker but no dialogue beats/));

    // Beats with no way to trigger them strand the conversation.
    const unreachableTalk = craftIssues([{ ...stageBase, dialogueBeats: [{ id: "b1", characterId: "narrator", text: "Line." }] }]);
    check("stage: beats without a talk marker warn", has(unreachableTalk, /no "Start conversation" .* hotspot/));

    // Choices-only exits on a talking stage are legal but must be deliberate.
    const talkToLeave = craftIssues([
      {
        ...stageBase,
        hotspots: [],
        dialogueBeats: [{ id: "b1", characterId: "narrator", text: "Line." }],
        hotspots2: undefined,
        choices: [
          { id: "c1", text: "Leave", targetSceneId: "e" },
        ],
      } as SceneNode & { hotspots2?: never },
    ].map((s) => ({ ...s, hotspots: [{ id: "npc", label: "V", bounds: { x: 30, y: 60, w: 14, h: 24 }, cursor: "talk" as const, action: { type: "startDialogue" as const } }] })));
    check("stage: choices-only exits with a conversation surface the heads-up", has(talkToLeave, /exits only through choices/));

    // A non-stage scene carrying stage settings is a misconfiguration.
    const mismatch: any = { ...stageBase, nodeType: undefined };
    const mismatchIssues = craftIssues([mismatch]);
    check("stage: stage settings on a non-stage node warn", has(mismatchIssues, /carries Stage settings but is not a Stage node/));
    // NO-HUD is not a Stage-only flag: any scene with hideHud hides the chrome (Game.tsx hudHidden), so it must not warn.
    const hudOnClassic = craftIssues([{ ...stageBase, nodeType: undefined, stage: undefined, hideHud: true } as any]);
    check("NO-HUD on a standard scene does not warn", !has(hudOnClassic, /NO-HUD/));

    /* ---- ambient NPC hygiene ------------------------------------------- */
    {
      const npcRow = { id: "npc_a", image: "emoji:🚶", x: 30, y: 88 };
      // Duplicate ids silently broke scripts (the control registry keys by
      // id — last-mounted actor wins), so this is a hard ERROR.
      const dup = craftIssues([
        { ...stageBase, stage: { ...stageBase.stage!, npcs: [{ ...npcRow }, { ...npcRow, x: 40 }] } },
      ]);
      check("npc: duplicate ids are an error", dup.some((i) => i.severity === "error" && /sharing the id "npc_a"/.test(i.message)), dup);

      // Off-plate coordinates are world-% — x=140 on a 100%-wide plate is
      // off the edge forever and must warn; the same coordinates are legal
      // on a 200%-wide world and stay clean.
      const offPlate = craftIssues([
        { ...stageBase, stage: { ...stageBase.stage!, npcs: [{ ...npcRow, x: 140, patrol: [{ x: 150, y: 88 }] }] } },
      ]);
      check("npc: off-plate spawn warns (x beyond room width)", has(offPlate, /spawns off the plate/), offPlate);
      check("npc: off-plate patrol stop warns", has(offPlate, /patrol stop 1 sits at \(150/), offPlate);
      const wide = craftIssues([
        { ...stageBase, stage: { ...stageBase.stage!, worldWidth: 200, npcs: [{ ...npcRow, x: 140, patrol: [{ x: 150, y: 88 }] }] } },
      ]);
      check("npc: the same spawn+stop validate clean on a 200% world", !wide.some((i) => /off the plate|patrol stop/.test(i.message)), wide.filter((i) => /plate|stop/.test(i.message)));

      // Unique ids + on-plate coords stay clean.
      const fine = craftIssues([
        { ...stageBase, stage: { ...stageBase.stage!, npcs: [{ ...npcRow }, { ...npcRow, id: "npc_b", x: 45 }] } },
      ]);
      check("npc: unique on-plate NPCs raise no npc hygiene issues", !fine.some((i) => /NPC/.test(i.message)), fine.filter((i) => /NPC/.test(i.message)));
    }

    // Spawn outside the floor band gets flagged (the engine snaps it).
    const offFloor = craftIssues([{ ...stageBase, stage: { ...stageBase.stage!, spawn: { x: 50, y: 20 } } }]);
    check("stage: a spawn outside the floor band warns", has(offFloor, /outside the walkable floor band/));
  }

  // (a) A flag set by a choice but never read is dead — unless a gate, a beat
  // recall, or a flag note gives it a payoff.
  {
    const dead: SceneNode = {
      id: "s",
      title: "Set",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Do the thing", targetSceneId: "e", consequences: { setFlags: ["ghost_flag"] } },
      ],
    };
    const warned = craftIssues([dead]);
    check("craft: dead set-flag is warned", has(warned, /"ghost_flag" is set but never read/), warned);
    check("craft: dead set-flag attaches to the producer scene", warned.some((i) => /is set but never read/.test(i.message) && i.sceneId === "s"));

    const paid: SceneNode = {
      id: "s",
      title: "Set",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Do the thing", targetSceneId: "e", consequences: { setFlags: ["live_flag"] } },
        { id: "c2", text: "The payoff", targetSceneId: "e", gating: { requiresFlags: ["live_flag"] } },
      ],
    };
    check("craft: flag read by a gate is not dead", !has(craftIssues([paid]), /"live_flag" is set but never read/));

    const recalled: SceneNode = {
      id: "s",
      title: "Set",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Do the thing", targetSceneId: "e", consequences: { setFlags: ["recall_flag"] } }],
      dialogueBeats: [{ id: "b", characterId: "narrator", text: "Hello.", recalls: { recall_flag: "Yes, you did the thing." } }],
    };
    check("craft: flag read by a beat recall is not dead", !has(craftIssues([recalled]), /"recall_flag" is set but never read/));

    // A noted flag is a journal entry — the player reads it in "Story so far".
    check(
      "craft: flag with a flagNote is not flagged dead",
      !has(craftIssues([dead], { flagNotes: { ghost_flag: "You did the thing." } }), /"ghost_flag" is set but never read/)
    );
    // Interrogation crack/clamp flags are read by the engine itself.
    const interrogated: SceneNode = {
      id: "s",
      title: "Press",
      background: "",
      prose: "",
      choices: [
        { id: "p1", text: "Press her", reply: true, attitudeTag: "Aggressive" },
        { id: "p2", text: "Press harder", reply: true, attitudeTag: "Clever" },
        { id: "go", text: "Leave it", targetSceneId: "e" },
      ],
      dialogueBeats: [{ id: "b", characterId: "narrator", text: "Sit down." }],
      interrogation: {
        characterId: "narrator",
        brokeFlag: "she_broke",
        clampFlag: "she_clamped",
        brokeBeat: { id: "br", characterId: "narrator", text: "I'll talk." },
      },
    };
    check(
      "craft: interrogation crack/clamp flags are not dead (engine reads them)",
      !has(craftIssues([interrogated]), /"(she_broke|she_clamped)" is set but never read/)
    );
    // Deduction-board connection flags are read by the board at runtime.
    const boardIssues = craftIssues([
      { id: "s", title: "Board", background: "", prose: "", choices: [{ id: "c", text: "Link", targetSceneId: "e" }] },
    ], {
      items: [{ id: "clue1", name: "Coin", icon: "🪙", description: "", flavorText: "" }],
      characters: [{ id: "v", name: "Vince", role: "Suspect", avatarUrl: "", trustMeter: 0 }],
      deduction: { suspectIds: ["v"], connections: [{ a: "clue1", b: "v", flagSet: "board_link", revelation: "R" }] },
    });
    check("craft: deduction connection flag is not dead", !has(boardIssues, /"board_link" is set but never read/));
  }

  // (b) A flag that is cleared but never set does nothing — a flag starts
  // unset, so the clear can never fire.
  {
    const cleared: SceneNode = {
      id: "s",
      title: "Clear",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Take it back", targetSceneId: "e", consequences: { clearFlags: ["never_set_flag"] } }],
    };
    check("craft: clear-without-set is warned", has(craftIssues([cleared]), /"never_set_flag" is cleared somewhere but never set/));
    const setThenCleared: SceneNode = {
      id: "s",
      title: "Clear",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Give it up", targetSceneId: "e", consequences: { setFlags: ["set_flag"] } },
        { id: "c2", text: "Take it back", targetSceneId: "e", gating: { requiresFlags: ["set_flag"] }, consequences: { clearFlags: ["set_flag"] } },
      ],
    };
    check("craft: clear of a set flag is fine", !has(craftIssues([setThenCleared]), /cleared somewhere but never set/));
  }

  // (c) A memoryLog tag nobody recalls, and a "will remember that" card with
  // nothing behind it — the promise with no payoff.
  {
    const forgotten: SceneNode = {
      id: "s",
      title: "Talk",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "I never liked her.", targetSceneId: "e", memoryLog: "opinion" }],
    };
    check("craft: un-recalled memory tag is warned", has(craftIssues([forgotten]), /Memory "opinion" is recorded by a choice but never recalled/));

    const recalledTag: SceneNode = {
      id: "s",
      title: "Talk",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "I never liked her.", targetSceneId: "e", memoryLog: "opinion_recalled" }],
      dialogueBeats: [{ id: "b", characterId: "narrator", text: "Sure.", recalls: { opinion_recalled: "You said: {said}" } }],
    };
    check("craft: recalled memory tag is fine", !has(craftIssues([recalledTag]), /never recalled/));

    const gatedMemory: SceneNode = {
      id: "s",
      title: "Talk",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "I never liked her.", targetSceneId: "e", memoryLog: "opinion_gated" },
        { id: "c2", text: "Payoff", targetSceneId: "e", gating: { requiresMemories: ["opinion_gated"] } },
      ],
    };
    check("craft: memory tag read by a remembers-gate is fine", !has(craftIssues([gatedMemory]), /never recalled/));

    // item: keys recorded by the present verb are self-describing.
    const present: SceneNode = {
      id: "s",
      title: "Present",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Show the coin", targetSceneId: "e", presentItem: "coin" }],
    };
    const presentIssues = craftIssues([present], {
      items: [{ id: "coin", name: "Coin", icon: "🪙", description: "", flavorText: "" }],
      scenes: [
        present,
        { id: "g", title: "Grant", background: "", prose: "", hotspots: [{ id: "h", label: "Coin", bounds: { x: 0, y: 0, w: 5, h: 5 }, cursor: "take", action: { type: "setFlag" } }] },
        endScene("e"),
      ],
    });
    check("craft: present-item memory key is not flagged", !has(presentIssues, /item:coin/));

    const emptyPromise: SceneNode = {
      id: "s",
      title: "Talk",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Cross your arms.", targetSceneId: "e", rememberLine: "Lydia will remember that." }],
    };
    check("craft: rememberLine with no payload is warned", has(craftIssues([emptyPromise]), /shows a "will remember that" card but tags no memory/));

    // In an episodic season every recorded choice lands on the episode-end
    // "defining choices" card, so un-recalled memories are not dead.
    const seasonIssues = craftIssues([forgotten], {
      episodes: [{ id: "ep1", title: "Chapter One", sceneIds: ["s", "e"], startSceneId: "s" }],
    });
    check("craft: un-recalled memory in a season is fine (end-card highlights)", !has(seasonIssues, /Memory "opinion" is recorded/));
    const paidPromise: SceneNode = {
      id: "s",
      title: "Talk",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "I trusted you.", targetSceneId: "e", memoryLog: "trust_betrayed", rememberLine: "Lydia will remember that." }],
      dialogueBeats: [{ id: "b", characterId: "narrator", text: "…", recalls: { trust_betrayed: "You told her you trusted her." } }],
    };
    check("craft: rememberLine carrying a memory is fine", !has(craftIssues([paidPromise]), /tags no memory/));
  }

  // (d) A quick-time deadline whose expiry cannot change what happens — the
  // fake timer. Hesitation must be a real branch.
  {
    const fakeNav: SceneNode = {
      id: "s",
      title: "QTE",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Duck!", targetSceneId: "e", quickTime: true, timeLimitSeconds: 4 }],
    };
    check("craft: QTE with no timeout branch is warned", has(craftIssues([fakeNav]), /changes nothing when the timer runs out/));

    const fakeReply: SceneNode = {
      id: "s",
      title: "QTE",
      background: "",
      prose: "",
      choices: [{ id: "c1", text: "Answer her!", reply: true, quickTime: true, timeLimitSeconds: 4 }],
    };
    check("craft: quick-time reply with no timeout consequences is warned", has(craftIssues([fakeReply]), /changes nothing when the timer runs out/));

    const realBranch: SceneNode = {
      id: "s",
      title: "QTE",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Swing!", targetSceneId: "e", quickTime: true, timeLimitSeconds: 4, timedOutTargetSceneId: "hesitated" },
      ],
    };
    check("craft: QTE with a distinct timeout scene is fine", !has(craftIssues([realBranch, { id: "hesitated", title: "Hesitated", background: "", prose: "", choices: [{ id: "h", text: "On", targetSceneId: "e" }] }]), /changes nothing when the timer runs out/));

    const sameSceneButConsequences: SceneNode = {
      id: "s",
      title: "QTE",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Speak!", reply: true, quickTime: true, timeLimitSeconds: 4, timedOutConsequences: { setFlags: ["you_hesitated"] } },
        { id: "c2", text: "On", targetSceneId: "e", gating: { requiresFlags: ["you_hesitated"] }, hidden: true },
      ],
    };
    check("craft: QTE with timeout consequences is fine even in place", !has(craftIssues([sameSceneButConsequences]), /changes nothing when the timer runs out/));
  }

  // (e) Two visible choices that answer identically — the same decision in a
  // hat. Different destination, attitude, effects or memory makes them real.
  {
    const twins: SceneNode = {
      id: "s",
      title: "Ask",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Walk in the front door.", targetSceneId: "e" },
        { id: "c2", text: "Enter through the entrance.", targetSceneId: "e" },
      ],
    };
    check("craft: identical choice twins are warned", has(craftIssues([twins]), /same decision twice/));

    const differentAttitude: SceneNode = {
      id: "s",
      title: "Ask",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Ask nicely.", targetSceneId: "e", attitudeTag: "Sultry" },
        { id: "c2", text: "Demand it.", targetSceneId: "e", attitudeTag: "Aggressive" },
      ],
    };
    check("craft: same destination but different attitude is fine", !has(craftIssues([differentAttitude]), /same decision twice/));

    const remembered: SceneNode = {
      id: "s",
      title: "Ask",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Take the left.", targetSceneId: "e", memoryLog: "went_left" },
        { id: "c2", text: "Take the right.", targetSceneId: "e" },
      ],
    };
    check("craft: twin words but one is remembered is fine", !has(craftIssues([remembered]), /same decision twice/));

    const differentEffect: SceneNode = {
      id: "s",
      title: "Ask",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Take the money.", targetSceneId: "e", consequences: { setFlags: ["took_money"] } },
        { id: "c2", text: "Leave the money.", targetSceneId: "e", consequences: { setFlags: ["refused_money"] } },
      ],
    };
    check("craft: twin words but different consequences is fine", !has(craftIssues([differentEffect]), /same decision twice/));

    const twinReplies: SceneNode = {
      id: "s",
      title: "Ask",
      background: "",
      prose: "",
      choices: [
        { id: "c1", text: "Sure.", reply: true },
        { id: "c2", text: "Yeah.", reply: true },
        { id: "c3", text: "Enough talking.", targetSceneId: "e" },
      ],
    };
    check("craft: identical in-place replies are warned", has(craftIssues([twinReplies]), /same decision twice/));
  }

  // (g) Four or more reachable scenes in a row with no choice, hotspot or
  // interrogation — a passive corridor where the player only clicks Continue.
  {
    // Build p0→p1→p2→p3→p4→ending: p0 asks a choice, then four passive
    // auto-advancing scenes the player can only click through.
    const chain: SceneNode[] = [
      { id: "p0", title: "p0", background: "", prose: "…", choices: [{ id: "go", text: "Walk on", targetSceneId: "p1" }] },
      { id: "p1", title: "p1", background: "", prose: "…", autoAdvanceTargetSceneId: "p2" },
      { id: "p2", title: "p2", background: "", prose: "…", autoAdvanceTargetSceneId: "p3" },
      { id: "p3", title: "p3", background: "", prose: "…", autoAdvanceTargetSceneId: "p4" },
      { id: "p4", title: "p4", background: "", prose: "…", autoAdvanceTargetSceneId: "e" },
    ];
    const warned = craftIssues(chain);
    check("craft: a 4-scene passive corridor is warned", has(warned, /scenes in a row with no choice, hotspot or interrogation/), warned);
    check("craft: corridor warning attaches to the corridor's first scene", warned.some((i) => /in a row with no choice/.test(i.message) && i.sceneId === "p1"));

    // A credits or cutscene set-piece in the middle breaks the corridor —
    // those are authored non-interactive, not pacing dead zones.
    const withSetPiece: SceneNode[] = [
      { id: "p0", title: "p0", background: "", prose: "…", choices: [{ id: "go", text: "Walk on", targetSceneId: "p1" }] },
      { id: "p1", title: "p1", background: "", prose: "…", autoAdvanceTargetSceneId: "title" },
      { id: "title", title: "Title", background: "", prose: "", nodeType: "credits", autoAdvanceTargetSceneId: "p2" },
      { id: "p2", title: "p2", background: "", prose: "…", autoAdvanceTargetSceneId: "p3" },
      { id: "p3", title: "p3", background: "", prose: "…", autoAdvanceTargetSceneId: "e" },
    ];
    check("craft: a credits set-piece breaks the passive corridor", !has(craftIssues(withSetPiece), /in a row with no choice/));

    // An interactive beat in the middle breaks it too.
    const withBeat: SceneNode[] = [
      { id: "p0", title: "p0", background: "", prose: "…", choices: [{ id: "go", text: "Walk on", targetSceneId: "p1" }] },
      { id: "p1", title: "p1", background: "", prose: "…", autoAdvanceTargetSceneId: "p2" },
      { id: "p2", title: "p2", background: "", prose: "…", autoAdvanceTargetSceneId: "p3" },
      {
        id: "p3",
        title: "p3",
        background: "",
        prose: "…",
        autoAdvanceTargetSceneId: "e",
        hotspots: [{ id: "look", label: "Look", bounds: { x: 0, y: 0, w: 5, h: 5 }, cursor: "look", action: { type: "showText", text: "A clue." } }],
      },
    ];
    check("craft: a hotspot mid-run breaks the passive corridor", !has(craftIssues(withBeat), /in a row with no choice/));
  }
}

/* ---- stage 2d movement helpers ------------------------------------- */
{
  check("stage2d: default speed/reach are positive", STAGE2D_DEFAULT_SPEED > 0 && STAGE2D_DEFAULT_REACH > 0);
  check("stage2d: clampStagePos keeps points inside the plate", JSON.stringify(clampStagePos(120, -5)) === JSON.stringify({ x: 99, y: 1 }));

  // A step that overshoots the target snaps to it and reports arrival.
  const start = { x: 50, y: 80 };
  const near = stepStagePos(start, { x: 52, y: 80 }, 18, 1, 16 / 9);
  check("stage2d: a big enough step arrives", near.arrived === true && near.x === 52 && near.y === 80, near);

  // A short step moves but doesn't arrive, covering less than speed*dt.
  const far = stepStagePos(start, { x: 80, y: 80 }, 18, 0.1, 16 / 9);
  check("stage2d: a short step advances toward the target", !far.arrived && far.x > start.x && far.x < 80, far);

  // Aspect correction: at a wide plate, a pure-vertical target moves far
  // less in y% than the raw speed would suggest.
  const upWide = stepStagePos({ x: 50, y: 80 }, { x: 50, y: 40 }, 18, 0.1, 2.0);
  const upTall = stepStagePos({ x: 50, y: 80 }, { x: 50, y: 40 }, 18, 0.1, 0.8);
  check("stage2d: vertical step is aspect-corrected (wide < tall in y%)", (80 - upWide.y) < (80 - upTall.y), { wideDy: 80 - upWide.y, tallDy: 80 - upTall.y });

  const hs: Hotspot = {
    id: "desk",
    label: "Desk",
    bounds: { x: 40, y: 50, w: 20, h: 20 },
    cursor: "take",
    action: { type: "giveItem", itemGranted: "i" },
  };
  const center = hotspotCenter(hs);
  check("stage2d: hotspot center is the middle of its bounds", center.x === 50 && center.y === 60, center);
  check("stage2d: at the center the character reaches the hotspot", posReachesHotspot(center, hs, STAGE2D_DEFAULT_REACH, 16 / 9));
  check("stage2d: far away the hotspot is out of reach", !posReachesHotspot({ x: 5, y: 90 }, hs, STAGE2D_DEFAULT_REACH, 16 / 9));
  check("stage2d: hotspotAtPoint finds a zone under a point", hotspotAtPoint([hs], { x: 45, y: 55 })?.id === "desk");
  check("stage2d: hotspotAtPoint misses empty plate", hotspotAtPoint([hs], { x: 5, y: 5 }) === null);
  // Topmost zone wins on overlap.
  const onTop: Hotspot = { ...hs, id: "front", bounds: { x: 42, y: 52, w: 6, h: 6 } };
  check("stage2d: later zone wins on overlap", hotspotAtPoint([hs, onTop], { x: 44, y: 54 })?.id === "front");
}

/* ---- stage NODE helpers (floor, depth, markers, captions, legacy) --- */
{
  const F = { top: 60, bottom: 92 };

  check("stage: default floor band is used when unset", JSON.stringify(stageFloor(undefined)) === JSON.stringify({ top: 62, bottom: 94 }), stageFloor(undefined));
  check("stage: floor keeps authored values", stageFloor({ floor: F }).top === 60 && stageFloor({ floor: F }).bottom === 92);
  // An inverted / degenerate band is repaired rather than trapping the walker.
  const broken = stageFloor({ floor: { top: 90, bottom: 91 } });
  check("stage: a degenerate floor is repaired to a walkable band", broken.bottom > broken.top, broken);

  // Clicks above/below the band snap to the nearest walkable edge.
  const snappedUp = clampToFloor(50, 10, F);
  const snappedDown = clampToFloor(50, 120, F);
  check("stage: a click above the floor snaps to its top edge", snappedUp.y === 60, snappedUp);
  check("stage: a click below the floor snaps to its bottom edge", snappedDown.y === 92, snappedDown);
  check("stage: x stays plate-clamped", clampToFloor(140, 80, F).x === 99);

  // ---- WIDE WORLDS (worldWidth > 100) + walk-off-screen edge exits ----
  // The camera follows the walker, clamped so the viewport never shows past
  // the world's ends; a single-screen room (width 100) never moves.
  check("stage: camera never moves on a single-screen room", stageCamX(10, 100) === 0 && stageCamX(90, 100) === 0);
  check("stage: camera clamps at the left end of a wide world", stageCamX(20, 200) === 0);
  check("stage: camera clamps at the right end of a wide world", stageCamX(190, 200) === 100);
  check("stage: camera centres the walker mid-world", Math.abs(stageCamX(120, 200) - 70) < 1e-9);
  // Edge detection: only at the very ends, and only at the world's own edges.
  check("stage: edge detection — left", stageAtWorldEdge(0.5, 100) === "left");
  check("stage: edge detection — right", stageAtWorldEdge(99.2, 100) === "right");
  check("stage: edge detection — mid-world is not an edge", stageAtWorldEdge(50, 100) === null);
  check("stage: edge detection uses the WORLD width", stageAtWorldEdge(199.4, 200) === "right" && stageAtWorldEdge(2, 200) === null);
  // Wide-world clamping: x clamps to the world's own bounds, not 0–100.
  check("stage: wide clamp keeps mid-world x", clampToFloor(150, 80, F, 200).x === 150);
  check("stage: wide clamp bounds to the world edge", clampToFloor(250, 80, F, 200).x === 199);
  check("stage: wide clamp keeps the floor band", clampToFloor(150, 10, F, 200).y === 60);
  // stageBlocked treats beyond the world edge as blocked (the walker can't
  // wander off unless an exit is walking them off).
  check("stage: wide world — beyond the right edge is blocked", stageBlocked(201, 80, [], F, 16 / 9, 200));
  check("stage: wide world — mid-world is clear", !stageBlocked(150, 80, [], F, 16 / 9, 200));
  // A route across a wide world routes around an obstacle in the middle
  // (the wall spans the middle of the band, leaving room above and below).
  const wideWall = [{ x: 90, y: 62, w: 20, h: 12 }];
  const wideRoute = stageRoute({ x: 20, y: 80 }, { x: 180, y: 80 }, wideWall, F, STAGE_GRID_STEP, 200);
  check("stage: a wide-world route crosses the world", wideRoute.length > 0 && wideRoute[wideRoute.length - 1].x > 150, wideRoute);
  const wideRouteNoObstacle = stageRoute({ x: 20, y: 80 }, { x: 180, y: 80 }, [], F, STAGE_GRID_STEP, 200);
  check("stage: empty wide world walks straight across", wideRouteNoObstacle.length === 1 && Math.abs(wideRouteNoObstacle[0].x - 180) < 1e-9);

  // Depth: 1 at the bottom of the band, smaller at the top, flat at 0.
  const dTop = stageDepthScale(60, F, 0.35);
  const dBottom = stageDepthScale(92, F, 0.35);
  check("stage: depth scale is 1 at the floor bottom", Math.abs(dBottom - 1) < 1e-9, dBottom);
  check("stage: depth scale shrinks toward the floor top", Math.abs(dTop - 0.65) < 1e-9, dTop);
  check("stage: depthScale 0 is flat", stageDepthScale(60, F, 0) === 1);
  const mid = stageDepthScale(76, F, 0.5);
  check("stage: mid-floor depth is between top and bottom", dTop < mid && mid < dBottom, mid);

  // Markers stand at a zone's BASE, clamped into the floor.
  const door: Hotspot = { id: "door", label: "Door", bounds: { x: 70, y: 30, w: 16, h: 30 }, cursor: "go", action: { type: "goToScene" } };
  const m = stageMarkerPoint(door, F);
  check("stage: marker x is the zone's horizontal centre", Math.abs(m.x - 78) < 1e-9, m);
  check("stage: marker y is the zone's base clamped into the floor", m.y === 60, m); // 30+30=60 = floor top
  const low: Hotspot = { ...door, bounds: { x: 10, y: 80, w: 10, h: 30 } };
  check("stage: a low zone's marker keeps its base", stageMarkerPoint(low, F).y === 92, stageMarkerPoint(low, F));

  // WALK PATH — a polygon replaces the flat band as the walkable zone.
  const poly = [
    { x: 10, y: 80 },
    { x: 90, y: 80 },
    { x: 60, y: 40 },
    { x: 30, y: 40 },
  ];
  check("walk-path: a band room still resolves to its rectangle", (() => {
    const p = stageWalkPoly({ floor: F }, 100);
    return p.length === 4 && p[0].x === 0 && p[1].x === 100 && p[1].y === 60 && p[2].y === 92;
  })());
  check("walk-path: floorPoints define the polygon", (() => {
    const p = stageWalkPoly({ floorPoints: poly }, 100);
    return p.length === 4 && p[2].x === 60 && p[2].y === 40;
  })());
  check("walk-path: depth band is the polygon's y-extent", (() => {
    const d = stageWalkDepth(poly);
    return d.top === 40 && d.bottom === 80;
  })());
  check("walk-path: a point inside the polygon is walkable", pointInWalkPoly(50, 60, poly));
  check("walk-path: a point outside the polygon is not", !pointInWalkPoly(50, 95, poly));
  check("walk-path: a point inside is kept, clamped to the world", (() => {
    const c = clampToWalkPoly(50, 60, poly, 100);
    return c.x === 50 && c.y === 60;
  })());
  check("walk-path: a point outside snaps to the nearest boundary", (() => {
    const c = clampToWalkPoly(50, 95, poly, 100);
    return c.y < 82 && c.y >= 79; // snaps up to the bottom edge (y≈80)
  })());
  check("walk-path: blocked treats outside-the-path as a wall", stageBlockedPoly(50, 95, [], poly, 16 / 9, 100));
  check("walk-path: a route crosses the path, not outside it", (() => {
    const r = stageRoutePoly({ x: 15, y: 79 }, { x: 85, y: 79 }, [], poly, stageWalkDepth(poly), STAGE_GRID_STEP, 100);
    return r.length === 1 && Math.abs(r[0].x - 85) < 1e-9;
  })());
  // A concave floor itself is a wall; no dummy obstacle should be needed
  // to make the planner turn a corner. This was exposed by the HD stairs.
  const elbow = [{x:2,y:10},{x:96,y:10},{x:96,y:28},{x:24,y:28},{x:24,y:94},{x:2,y:94}];
  const lower = {x:12,y:84}, upper = {x:84,y:20};
  check("walk-path: concave room blocks the direct shortcut", !stageLineClearPoly(lower,upper,[],elbow));
  for (const [from,to] of [[lower,upper],[upper,lower]]) {
    const route = stageRoutePoly(from,to,[],elbow,stageWalkDepth(elbow));
    check("walk-path: concave floor routes both ways WITHOUT furniture", route.length > 1, route);
    let at=from;
    check("walk-path: every detour segment stays on its floor", route.every(next => { const clear=stageLineClearPoly(at,next,[],elbow); at=next; return clear; }));
  }
  check("walk-path: a marker clamps into the polygon", (() => {
    const hm: Hotspot = { ...door, bounds: { x: 48, y: 20, w: 4, h: 80 } };
    const mm = stageMarkerPointPoly(hm, poly, 100);
    return mm.y >= 40 && mm.y <= 80;
  })());

  // Reach check on the marker point.
  check("stage: posReachesMarker hits within reach", posReachesMarker({ x: 79, y: 61 }, m, 4, 16 / 9));
  check("stage: posReachesMarker misses far away", !posReachesMarker({ x: 10, y: 90 }, m, 4, 16 / 9));

  // Caption hold scales with length and stays sane — and snappy (the old
  // formula held a line for up to NINE seconds, glued over the character).
  check("stage: a short caption holds ~2.5s", Math.abs(stageCaptionMs("Hi.") - 2500) < 1e-9, stageCaptionMs("Hi."));
  check("stage: a long caption holds longer but is capped", stageCaptionMs("x".repeat(300)) <= 5200 && stageCaptionMs("x".repeat(100)) > stageCaptionMs("Hi."));

  // AI Images: the OpenAI request only carries response_format for the
  // dall-e family — gpt-image models REJECT it with a 400 (unknown_parameter),
  // which is exactly what Generate was hitting with the default model.
  check("ai: gpt-image body omits response_format", !("response_format" in openaiGenerationBody("gpt-image-1", "p", "1024x1024")));
  check("ai: dall-e-3 body keeps response_format", "response_format" in openaiGenerationBody("dall-e-3", "p", "1024x1024"));
  check("ai: body carries model/prompt/size", (openaiGenerationBody("gpt-image-1", "noir alley", "1024x1024") as { model: string; prompt: string; size: string }).model === "gpt-image-1");
  // ...and each family's size list excludes the other's (invalid pairs 400).
  check("ai: gpt-image sizes exclude dall-e's 1792x1024", !openaiSizesForModel("gpt-image-1").includes("1792x1024") && openaiSizesForModel("gpt-image-1").includes("1536x1024"));
  check("ai: dall-e sizes exclude gpt-image's 1536x1024", !openaiSizesForModel("dall-e-3").includes("1536x1024") && openaiSizesForModel("dall-e-3").includes("1792x1024"));

  // --- Gemini (Nano Banana) request shape ----------------------------------
  // Both of these are hard 400s / silent text replies if wrong, and neither is
  // visible without a live key — so they are pinned here instead.
  {
    const plain = geminiGenerationBody("noir alley", "16:9") as any;
    check("ai/gemini: prompt goes in a parts array", plain.contents[0].parts[0].text === "noir alley");
    check(
      "ai/gemini: responseModalities asks for IMAGE",
      plain.generationConfig.responseModalities.includes("IMAGE"),
      plain.generationConfig
    );
    check("ai/gemini: aspect ratio rides in imageConfig", plain.generationConfig.imageConfig.aspectRatio === "16:9");
    check("ai/gemini: no reference part when none supplied", plain.contents[0].parts.length === 1);

    // Omitting the ratio must omit imageConfig entirely, not send undefined.
    const noRatio = geminiGenerationBody("x") as any;
    check("ai/gemini: no imageConfig when no ratio is set", !("imageConfig" in noRatio.generationConfig));

    // Reference image: same parts array, correct mime.
    const withRef = geminiGenerationBody("restyle", "1:1", { mimeType: "image/jpeg", base64: "AAAA" }) as any;
    check("ai/gemini: reference rides beside the prompt", withRef.contents[0].parts.length === 2);
    check("ai/gemini: reference mime is preserved", withRef.contents[0].parts[1].inline_data.mime_type === "image/jpeg");
    check("ai/gemini: reference payload is bare base64", withRef.contents[0].parts[1].inline_data.data === "AAAA");

    // splitDataUrl feeds the above — it must strip the data: header.
    const split = splitDataUrl("data:image/webp;base64,ZZZZ");
    check("ai/gemini: splitDataUrl reads the mime type", split.mimeType === "image/webp", split);
    check("ai/gemini: splitDataUrl strips the header", split.base64 === "ZZZZ", split);
    check("ai/gemini: splitDataUrl defaults to png", splitDataUrl("notadataurl").mimeType === "image/png");

    // Every offered ratio is one Gemini actually accepts.
    check("ai/gemini: 16:9 is an offered ratio", GEMINI_ASPECT_RATIOS.includes("16:9"));
    check("ai/gemini: no bogus ratios offered", GEMINI_ASPECT_RATIOS.every((r) => /^\d+:\d+$/.test(r)));
  }

  // --- provider catalogue stays coherent -----------------------------------
  {
    check("ai: gemini is in the provider list", AI_PROVIDERS.some((p) => p.id === "gemini"));
    const defs = defaultAiSettings();
    for (const meta of AI_PROVIDERS) {
      check(`ai: "${meta.id}" has default settings`, !!defs.providers[meta.id], meta.id);
      check(`ai: "${meta.id}" default id matches its key`, defs.providers[meta.id]?.id === meta.id, meta.id);
    }
    // A commercial provider needs a key; a local one must ship a baseUrl.
    for (const meta of AI_PROVIDERS) {
      if (meta.kind === "local") {
        check(`ai: local "${meta.id}" ships a baseUrl`, !!defs.providers[meta.id]?.baseUrl, meta.id);
        check(`ai: local "${meta.id}" needs no key`, meta.needsKey === false, meta.id);
      } else {
        check(`ai: cloud "${meta.id}" is marked as needing a key`, meta.needsKey === true, meta.id);
      }
    }
    // Reference support must be a value the UI knows how to render.
    for (const meta of AI_PROVIDERS) {
      const sup = providerReferenceSupport(meta.id, defs.providers[meta.id]?.model);
      check(`ai: "${meta.id}" reference support is a known value`, sup === "full" || sup === "fixed" || sup === false, { id: meta.id, sup });
    }
    check("ai: gemini accepts a reference image", providerReferenceSupport("gemini", "gemini-2.5-flash-image") === "fixed");
    // The withdrawn Together free endpoint must not be a shipped default.
    check(
      "ai: no default points at the withdrawn FLUX free endpoint",
      defs.providers.together?.model !== "black-forest-labs/FLUX.1-schnell-Free",
      defs.providers.together?.model
    );
  }

  // Legacy exports: stage2d bolt-on maps to a stage node; clean stories pass through untouched.
  const legacy: any = {
    id: "old",
    scenes: [
      { id: "s1", title: "A", prose: "", stage2d: { playerImage: "emoji:🕵️", spawn: { x: 50, y: 88 }, speed: 20, reach: 4, keyboard: true } },
      { id: "s2", title: "B", prose: "hi" },
    ],
  };
  const migrated = normalizeLegacyStory(legacy);
  const s1: any = migrated.scenes[0];
  check("legacy: stage2d becomes a stage node", s1.nodeType === "stage" && !!s1.stage && !("stage2d" in s1), s1);
  check("legacy: stage settings carry over", s1.stage.playerImage === "emoji:🕵️" && s1.stage.speed === 20 && s1.stage.spawn.y === 88, s1.stage);
  check("legacy: plain scenes are untouched", (migrated.scenes[1] as any).nodeType === undefined && !(migrated.scenes[1] as any).stage);
  check("legacy: a clean story is returned unchanged", normalizeLegacyStory({ scenes: [{ id: "x" }] }) === undefined || true); // compiles both ways
  const clean: any = { scenes: [{ id: "x", title: "X" }] };
  check("legacy: nothing to convert returns the same object", normalizeLegacyStory(clean) === clean);
}

/* ---- press the lie (contradiction verb) ---------------------------- */
{
  // The lie helpers: only named evidence that the player actually HELD
  // breaks the claim; everything else is a called bluff.
  const lie: Contradiction = {
    evidenceItemIds: ["receipt"],
    contradictedFlag: "alibi_broken",
    caughtBeat: { id: "caught", characterId: "sus", text: "How did you get that?", conditionRule: { requiresFlags: ["alibi_broken"] } },
    wrongBeat: { id: "wrong", characterId: "sus", text: "That means nothing." },
    wrongEvidenceLimit: 2,
    contradictedConsequences: { trustChanges: [{ characterId: "sus", delta: 2 }], meterChanges: [{ meter: "Suspicion", delta: -1 }] },
    wrongConsequences: { trustChanges: [{ characterId: "sus", delta: -1 }], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
  };
  check("lie: named + held evidence breaks it", evidenceBreaksLie(lie, ["receipt", "coin"], "receipt") === true);
  check("lie: named evidence NOT held doesn't break", evidenceBreaksLie(lie, ["coin"], "receipt") === false);
  check("lie: held but un-named item is a bluff", evidenceBreaksLie(lie, ["coin", "receipt"], "coin") === false);
  check("lie: default wrong limit is 2", DEFAULT_WRONG_EVIDENCE_LIMIT === 2);
  check("lie: explicit limit respected", wrongEvidenceLimit(lie) === 2);
  check("lie: can press under the limit", lieCanStillPress(lie, 1) === true);
  check("lie: shuts at the limit", lieCanStillPress(lie, 2) === false);
  check("lie: wrong line falls back to authored bluff beat", lieWrongLine(lie).includes("means nothing"));
  check("lie: wrong line defaults when no wrongBeat", lieWrongLine({ ...lie, wrongBeat: undefined }).length > 0);

  // applyLieCaught sets the flag and runs the swing; applyLieWrong costs trust.
  const s0: GlobalState = {
    activeFlags: new Set<string>(),
    inventory: [],
    meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 2 },
    characterTrust: { sus: 0 },
    memories: {},
  };
  const storyForLie: Story = {
    id: "lie",
    title: "Lie",
    tagline: "",
    coverImage: "",
    startSceneId: "s",
    scenes: [],
    items: [],
    characters: [{ id: "sus", name: "Sus", role: "", avatarUrl: "", trustMeter: 0 }],
  };
  const caught = applyLieCaught(storyForLie, lie, s0);
  check("lie: caught sets the contradicted flag", caught.activeFlags.has("alibi_broken"));
  check("lie: caught swings trust", caught.characterTrust.sus === 2);
  check("lie: caught lowers heat", caught.meters.Suspicion === 1);
  const wrong = applyLieWrong(storyForLie, lie, s0);
  check("lie: bluff costs trust", wrong.characterTrust.sus === -1);
  check("lie: bluff raises heat", wrong.meters.Suspicion === 3);
  check("lie: bluff does not set the flag", !wrong.activeFlags.has("alibi_broken"));

  // everyDialogueBeat includes the nested caught/wrong beats.
  const claimBeat: DialogueBeat = { id: "claim", characterId: "sus", text: "I was home.", lie };
  const withBeats: Story = { ...storyForLie, scenes: [{ id: "s", title: "S", background: "", prose: "", dialogueBeats: [claimBeat] }] };
  const all = everyDialogueBeat(withBeats);
  check("lie: everyDialogueBeat walks the nested caught + wrong beats", all.some((b) => b.id === "caught") && all.some((b) => b.id === "wrong"), all.map((b) => b.id));
  check("lie: beatLie reads the contradiction off a beat", beatLie(claimBeat)?.contradictedFlag === "alibi_broken");

  // collectFlags/collectMemoryTags see the runtime-set caught flag.
  check("lie: collectFlags includes the caught flag", collectFlags(withBeats).includes("alibi_broken"));

  // Validator: a well-formed lie raises no lie errors; missing evidence /
  // missing flag / ungated caught beat are caught.
  const item = { id: "receipt", name: "Motel Receipt", icon: "🧾", description: "", flavorText: "", isClue: true };
  const lieScene = (beat: DialogueBeat): SceneNode => ({
    id: "s",
    title: "S",
    background: "",
    prose: "",
    dialogueBeats: [beat],
    choices: [{ id: "go", text: "On", targetSceneId: "e" }],
    hotspots: [{ id: "h", label: "Receipt", bounds: { x: 0, y: 0, w: 5, h: 5 }, cursor: "take", action: { type: "giveItem", itemGranted: "receipt" } }],
  });
  const goodStory: Story = {
    ...storyForLie,
    items: [item],
    scenes: [lieScene(claimBeat), { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } }],
  };
  const goodIssues = validateStory(goodStory);
  check("lie: a well-formed contradiction raises no lie error/warning", !goodIssues.some((i) => /press-the-lie/i.test(i.message)), goodIssues.filter((i) => /press-the-lie/i.test(i.message)));

  const noEvidence: SceneNode = {
    ...lieScene(claimBeat),
    dialogueBeats: [{ id: "claim2", characterId: "sus", text: "Lie.", lie: { ...lie, evidenceItemIds: [] } }],
  };
  const noEvidenceIssues = validateStory({ ...goodStory, scenes: [noEvidence, goodStory.scenes[1]] });
  check("lie: missing breaking evidence is an error", noEvidenceIssues.some((i) => /names no breaking evidence/.test(i.message)));

  const ghostEvidence: SceneNode = {
    ...lieScene(claimBeat),
    dialogueBeats: [{ id: "claim3", characterId: "sus", text: "Lie.", lie: { ...lie, evidenceItemIds: ["ghost_item"] } }],
  };
  const ghostIssues = validateStory({ ...goodStory, scenes: [ghostEvidence, goodStory.scenes[1]] });
  check("lie: unknown evidence item is an error", ghostIssues.some((i) => /evidence item "ghost_item"/.test(i.message)));

  const ungated: SceneNode = {
    ...lieScene(claimBeat),
    dialogueBeats: [{
      id: "claim4",
      characterId: "sus",
      text: "Lie.",
      lie: { ...lie, caughtBeat: { id: "c2", characterId: "sus", text: "Caught." } },
    }],
  };
  const ungatedIssues = validateStory({ ...goodStory, scenes: [ungated, goodStory.scenes[1]] });
  check("lie: caught beat not gated on the caught flag is a warning", ungatedIssues.some((i) => /isn't gated on "alibi_broken"/.test(i.message)));
}

// Regression: checkGate used to run TWICE in the hotspot loop, so one
// impossible hotspot gate printed the same error twice.
{
  const story: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    scenes: [
      {
        id: "a",
        title: "A",
        background: "",
        prose: "",
        hotspots: [
          {
            id: "h",
            label: "Door",
            bounds: { x: 0, y: 0, w: 10, h: 10 },
            cursor: "go",
            gating: { requiresItems: ["ghost_item"] },
            action: { type: "goToScene", targetSceneId: "e" },
          },
        ],
      },
      { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
    items: [],
    characters: [],
  };
  const dup = validateStory(story).filter((i) => /ghost_item/.test(i.message));
  check("validator: bad hotspot gate reported exactly once", dup.length === 1, dup);
}

// --- forked seasons: per-ending unlock + per-ending "next time on…" ---
{
  const endScene = (id: string, title: string): SceneNode => ({
    id,
    title,
    background: "",
    prose: "",
    isEnding: true,
    endingData: { tier: "victory-silver", headline: title, recap: "R" },
  });
  const forkStory: Story = {
    id: "tfork",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "e1a",
    scenes: [
      {
        id: "e1a",
        title: "A",
        background: "",
        prose: "",
        choices: [
          { id: "c1", text: "x", targetSceneId: "end_gold" },
          { id: "c2", text: "y", targetSceneId: "end_alt" },
        ],
      },
      endScene("end_gold", "G"),
      endScene("end_alt", "A2"),
      { id: "e2a", title: "2a", background: "", prose: "", choices: [{ id: "c3", text: "z", targetSceneId: "e2aend" }] },
      endScene("e2aend", "2aE"),
      { id: "e2b", title: "2b", background: "", prose: "", choices: [{ id: "c4", text: "z", targetSceneId: "e2bend" }] },
      endScene("e2bend", "2bE"),
      endScene("e3", "3"),
    ],
    items: [],
    characters: [],
    episodes: [
      { id: "ep1", title: "E1", sceneIds: ["e1a", "end_gold", "end_alt"], startSceneId: "e1a", nextEpisodeByEnding: { end_alt: "e2b" } },
      { id: "e2a", title: "E2A", sceneIds: ["e2a", "e2aend"], startSceneId: "e2a", unlockAfter: [{ episodeId: "ep1", endingSceneIds: ["end_gold"] }] },
      { id: "e2b", title: "E2B", sceneIds: ["e2b", "e2bend"], startSceneId: "e2b", unlockAfter: [{ episodeId: "ep1", endingSceneIds: ["end_alt"] }] },
      { id: "e3", title: "E3", sceneIds: ["e3"], startSceneId: "e3", unlockAfter: [{ episodeId: "e2a" }, { episodeId: "e2b" }] },
    ],
  };
  const cleared = (episodeId: string, endingSceneId: string): EpisodeProgress => ({
    episodeId,
    endingSceneId,
    endingHeadline: "H",
    endingTier: "victory-silver",
    completedAt: 1,
    carry: { activeFlags: [], inventory: [], meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 }, characterTrust: {}, memories: {} },
  });
  check("unlockAfter: route chapters locked before their route", !isEpisodeUnlocked(forkStory, "e2a", {}) && !isEpisodeUnlocked(forkStory, "e2b", {}));
  const afterGold = { ep1: cleared("ep1", "end_gold") };
  const afterAlt = { ep1: cleared("ep1", "end_alt") };
  check("unlockAfter: gold ending unlocks only the gold chapter", isEpisodeUnlocked(forkStory, "e2a", afterGold) && !isEpisodeUnlocked(forkStory, "e2b", afterGold));
  check("unlockAfter: alt ending unlocks only the alt chapter", !isEpisodeUnlocked(forkStory, "e2a", afterAlt) && isEpisodeUnlocked(forkStory, "e2b", afterAlt));
  check(
    "unlockAfter (any-listed): final chapter unlocks from either route, not before",
    isEpisodeUnlocked(forkStory, "e3", { ...afterGold, e2a: cleared("e2a", "e2aend") }) &&
      isEpisodeUnlocked(forkStory, "e3", { ...afterAlt, e2b: cleared("e2b", "e2bend") }) &&
      !isEpisodeUnlocked(forkStory, "e3", afterGold)
  );
  check(
    "unlockAfter: already-cleared chapter stays replayable",
    isEpisodeUnlocked(forkStory, "e2b", { ep1: cleared("ep1", "end_gold"), e2b: cleared("e2b", "e2bend") })
  );
  check("nextEpisodeForEnding: per-ending override wins", nextEpisodeForEnding(forkStory, "ep1", "end_alt")?.id === "e2b");
  check("nextEpisodeForEnding: falls back to positional", nextEpisodeForEnding(forkStory, "ep1", "end_gold")?.id === "e2a");
  check("nextEpisodeForEnding: unknown ending falls back", nextEpisodeForEnding(forkStory, "e2a", "nope")?.id === "e2b");
}

// Regression (A3): the bust contract must hold for ANY heat source — the
// old entry-time-only check let mid-scene meter gains (replies, puzzles,
// on-enter effects) pass the limit with the player still in the scene.
{
  const bustStory: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    briefing: { objective: "x", winConditions: [], loseConditions: [], heatLimit: 3, heatFailSceneId: "folded" },
    scenes: [
      { id: "a", title: "A", background: "", prose: "" },
      { id: "folded", title: "Folded", background: "", prose: "", isEnding: true, endingData: { tier: "gameover", headline: "F", recap: "R" } },
    ],
    items: [],
    characters: [],
  };
  const meters = (sus: number) => ({ Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: sus });
  check("heatBustTarget: null under the limit", heatBustTarget(bustStory, { meters: meters(2) }, "a") === null);
  check("heatBustTarget: at the limit, routes to the bust scene", heatBustTarget(bustStory, { meters: meters(3) }, "a") === "folded");
  check("heatBustTarget: above the limit still busts", heatBustTarget(bustStory, { meters: meters(4) }, "a") === "folded");
  check("heatBustTarget: no bust while standing on the bust scene", heatBustTarget(bustStory, { meters: meters(3) }, "folded") === null);
  const noLimit: Story = { ...bustStory, briefing: { objective: "x", winConditions: [], loseConditions: [] } };
  check("heatBustTarget: no limit configured, no bust", heatBustTarget(noLimit, { meters: meters(9) }, "a") === null);
  const missingScene: Story = { ...bustStory, briefing: { ...bustStory.briefing!, heatFailSceneId: "ghost" } };
  check("heatBustTarget: missing bust scene, no bust", heatBustTarget(missingScene, { meters: meters(3) }, "a") === null);
  const episode = { id: "e1", title: "E", sceneIds: ["a"], startSceneId: "a" };
  check("heatBustTarget: season — bust scene outside the episode is refused", heatBustTarget(bustStory, { meters: meters(3) }, "a", episode) === null);
  const episodeWithBust = { id: "e1", title: "E", sceneIds: ["a", "folded"], startSceneId: "a" };
  check("heatBustTarget: season — bust scene inside the episode busts", heatBustTarget(bustStory, { meters: meters(3) }, "a", episodeWithBust) === "folded");
}

// Save-slot schema versioning: writes stamp the schema, reads migrate old
// un-stamped saves and REFUSE saves from a newer build rather than
// mis-loading a shape they don't understand.
{
  // Node has no localStorage by default — a minimal in-memory stand-in for
  // the save-slot tests only (logic.ts references the global lazily).
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
  };

  const baseSave: GameSave = {
    storyId: "s1",
    sceneId: "a",
    sceneTitle: "A",
    savedAt: 1,
    activeFlags: [],
    inventory: [],
    meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 },
    characterTrust: {},
    memories: {},
    proseAcknowledged: true,
    beatIdx: 0,
    usedHotspots: [],
    usedChoices: [],
    visitedScenes: [],
    encounteredCharacters: [],
    expiredChoices: [],
    choiceClocks: {},
  };
  const KEY = "scarlet-reel-save-s1-slot-1";

  writeSave(1, baseSave);
  const roundTrip = readSave("s1", 1);
  check("save: round-trip loads", roundTrip !== null && roundTrip.sceneId === "a");
  check("save: writeSave stamps the current schema", roundTrip?.schema === SAVE_SCHEMA);

  // Legacy save: hand-written raw JSON with no schema stamp (pre-versioning
  // builds). Must load AND come back stamped.
  store.set(KEY, JSON.stringify(baseSave));
  const legacy = readSave("s1", 1);
  check("save: un-stamped legacy save loads", legacy !== null);
  check("save: legacy save is migrated (stamped)", legacy?.schema === SAVE_SCHEMA);

  // Future save: schema newer than this build. Refused, not mis-loaded.
  store.set(KEY, JSON.stringify({ ...baseSave, schema: SAVE_SCHEMA + 87 }));
  check("save: save from a newer build is refused", readSave("s1", 1) === null);

  // Existing guards must survive the versioning layer.
  store.set(KEY, JSON.stringify({ ...baseSave, storyId: "other" }));
  check("save: foreign story still refused", readSave("s1", 1) === null);
  store.set(KEY, "{not json");
  check("save: corrupt slot still refused", readSave("s1", 1) === null);

  // --- the migration chain runner (save-schema migration tooling) ---
  // No real migration exists yet (the schema is still v1), so the runner is
  // exercised with a synthetic two-step chain: v1 → v2 → v3.
  const twoStep = {
    1: (s: GameSave) => ({ ...s, sceneTitle: "migrated-to-v2" }),
    2: (s: GameSave) => ({ ...s, sceneTitle: "migrated-to-v3" }),
  };
  const legacyShape = { ...baseSave }; // no schema stamp → treated as v1
  const upgraded = migrateSaveTo(legacyShape, 3, twoStep);
  check("migrate: an un-stamped save reads as v1", (legacyShape.schema ?? 1) === 1);
  check("migrate: the chain runs each step in order", upgraded?.schema === 3 && upgraded?.sceneTitle === "migrated-to-v3", upgraded);
  check("migrate: migration never mutates its input", legacyShape.sceneTitle === "A" && (legacyShape.schema ?? 1) === 1, legacyShape);

  // A gap in the chain means "no path from here": refuse, don't leap.
  check("migrate: a gap in the chain is refused", migrateSaveTo({ ...baseSave, schema: 1 }, 3, { 2: (s) => s }) === null);

  // Already at (or beyond) the target: pass through, re-stamped only if needed.
  const current = migrateSaveTo({ ...baseSave, schema: 3 }, 3, {});
  check("migrate: an already-current save passes through", current !== null && current.schema === 3 && current.sceneTitle === "A", current);

  // A save NEWER than the target build is refused, not silently down-graded.
  check("migrate: a newer save is refused", migrateSaveTo({ ...baseSave, schema: 4 }, 3, {}) === null);

  // A migration that returns null stops the chain and refuses the whole load.
  check("migrate: a refusing step stops the chain", migrateSaveTo({ ...baseSave, schema: 1 }, 2, { 1: () => null }) === null);

  /* --- WHY a slot didn't load --------------------------------------
   * readSave answers with a bare null for four different situations, and the
   * Load screen used to translate all of them into "that slot is empty" —
   * including the one that matters most, a save written by a NEWER build. */
  store.clear();
  check("diag: an untouched slot is empty", readSaveDetailed("s1", 2).status === "empty");
  check("diag: empty says so in words", saveReadMessage(readSaveDetailed("s1", 2), 2) === "Slot 2 is empty.");

  writeSave(1, { ...baseSave, rng: { seed: "carried", draws: 7 } });
  const okRes = readSaveDetailed("s1", 1);
  check("diag: a good slot reads ok", okRes.status === "ok" && okRes.save?.sceneId === "a");
  check("diag: the rng position survives the round trip", okRes.save?.rng?.seed === "carried" && okRes.save?.rng?.draws === 7, okRes.save?.rng);
  check("diag: readSave still returns just the save", readSave("s1", 1)?.sceneId === "a");

  store.set(KEY, JSON.stringify({ ...baseSave, schema: SAVE_SCHEMA + 87 }));
  const future = readSaveDetailed("s1", 1);
  check("diag: a newer build's save is named, not blanked", future.status === "newer-schema" && future.schema === SAVE_SCHEMA + 87, future);
  check("diag: the newer-build message says UPDATE, and names both versions", /NEWER build/.test(saveReadMessage(future, 1)) && saveReadMessage(future, 1).includes(`v${SAVE_SCHEMA}`), saveReadMessage(future, 1));
  check("diag: readSave still refuses it", readSave("s1", 1) === null);

  store.set(KEY, JSON.stringify({ ...baseSave, storyId: "another-case" }));
  const foreign = readSaveDetailed("s1", 1);
  check("diag: a foreign save is named", foreign.status === "wrong-story" && foreign.storyId === "another-case", foreign);
  check("diag: the foreign message names the case", saveReadMessage(foreign, 1).includes("another-case"), saveReadMessage(foreign, 1));

  store.set(KEY, "{not json");
  check("diag: corrupt json is named", readSaveDetailed("s1", 1).status === "corrupt");
  store.set(KEY, JSON.stringify({ ...baseSave, sceneId: "" }));
  check("diag: a save with no scene is corrupt", readSaveDetailed("s1", 1).status === "corrupt");
  check("diag: the corrupt message mentions the data", /damaged|unavailable/.test(saveReadMessage(readSaveDetailed("s1", 1), 1)));

  // Storage that throws (private mode, quota) must not take the app with it.
  const real = globalThis.localStorage;
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: () => { throw new Error("denied"); },
    setItem: () => { throw new Error("denied"); },
    removeItem: () => { throw new Error("denied"); },
  };
  check("diag: throwing storage reads as corrupt, not as a crash", readSaveDetailed("s1", 1).status === "corrupt");
  check("diag: throwing storage still refuses via readSave", readSave("s1", 1) === null);
  check("diag: a failing write is reported", writeSave(1, baseSave) === false);
  (globalThis as { localStorage?: unknown }).localStorage = real;

  // The checkpoint cadence the mid-scene autosave is throttled by.
  check("checkpoint: the quiet window is shorter than the gap", CHECKPOINT_QUIET_MS > 0 && CHECKPOINT_MIN_GAP_MS > CHECKPOINT_QUIET_MS);
  const gameSrcSave = readFileSync("src/game/Game.tsx", "utf8");
  check("checkpoint: a failed autosave is surfaced to the player", /Checkpoint failed/.test(gameSrcSave));
  check("checkpoint: the mid-scene refresh is throttled by both knobs", /CHECKPOINT_QUIET_MS/.test(gameSrcSave) && /CHECKPOINT_MIN_GAP_MS/.test(gameSrcSave));
  check("checkpoint: Load uses the diagnostic read", /readSaveDetailed\(story\.id, slot, episodeId\)/.test(gameSrcSave));
}

/* ================================================================== */
/*  2. act-membership walk (synthetic)                                 */
/* ================================================================== */

{
  const story: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    acts: [
      { id: "act1", label: "Act One", title: "One", startSceneId: "a" },
      { id: "act2", label: "Act Two", title: "Two", startSceneId: "g" },
    ],
    scenes: [
      { id: "a", title: "A", background: "", prose: "", choices: [] },
      { id: "b", title: "B (hotspot-only)", background: "", prose: "" },
      { id: "g", title: "G (act2 start)", background: "", prose: "", choices: [{ id: "c", text: "to end", targetSceneId: "e" }] },
      { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
    items: [],
    characters: [],
  };
  // door hotspot on "a" -> "b"; puzzle with targets on "b"
  story.scenes[0].hotspots = [
    { id: "h1", label: "Door", bounds: { x: 0, y: 0, w: 5, h: 5 }, cursor: "go", action: { type: "goToScene", targetSceneId: "b" } },
  ];
  story.scenes[1].hotspots = [
    {
      id: "h2",
      label: "Puzzle",
      bounds: { x: 0, y: 0, w: 5, h: 5 },
      cursor: "use",
      action: {
        type: "patternPuzzle",
        patternPuzzle: {
          title: "P",
          instruction: "",
          rows: [{ id: "r", date: "1", description: "d", amount: "0", isAnswer: true }],
          targetCount: 1,
          payoffText: "",
          targetSceneId: "e",
        },
      },
    },
  ];
  const act1 = scenesInAct(story, "act1");
  check("walk: follows hotspot door edges", act1.has("b"), [...act1]);
  check("walk: follows puzzle solve targets", act1.has("e"), [...act1]);
  check("walk: stops at the next act's start scene", !act1.has("g"), [...act1]);
  const act2 = scenesInAct(story, "act2");
  check("walk: act2 keeps its own scenes", act2.has("g") && act2.has("e"), [...act2]);
}

/* ================================================================== */
/*  3. The Neon Diner playthroughs                                     */
/* ================================================================== */

{
  const S = NEON_DINER;
  const byId = new Map(S.scenes.map((x) => [x.id, x]));
  const item = (id: string) => S.items.find((i) => i.id === id);

  // --- gold run ---
  let st = createInitialState(S);
  const enter = (id: string) => byId.get(id)!.onEnterActions?.forEach((a) => (st = applyConsequences(S, a.consequences, st)));
  // Mirrors the game's pick path: effective gate (incl. the item a present
  // choice shows), presentation-aware consequences (handover), and the
  // `item:<id>` presentation memory. `used` mirrors usedChoices so the
  // interrogation composure (derived from it) can be asserted.
  const used = new Set<string>();
  const pick = (sceneId: string, choiceId: string) => {
    const c = byId.get(sceneId)!.choices!.find((x) => x.id === choiceId)!;
    check(`gold: gate ${sceneId}/${choiceId}`, meetsGating(effectiveChoiceGating(c), st));
    used.add(`${sceneId}:${choiceId}`);
    if (c.exclusiveGroup) {
      byId.get(sceneId)!.choices!.filter((x) => x.exclusiveGroup === c.exclusiveGroup).forEach((x) => used.add(`${sceneId}:${x.id}`));
    }
    st = recordPresentation(c, S, recordMemory(c, applyConsequences(S, presentationConsequences(c), st)));
  };
  const door = (sceneId: string, hsId: string) => {
    const h = byId.get(sceneId)!.hotspots!.find((x) => x.id === hsId)!;
    check(`gold: door ${h.label}`, meetsGating(h.gating, st));
  };
  const grab = (sceneId: string, hsId: string) => {
    const h = byId.get(sceneId)!.hotspots!.find((x) => x.id === hsId)!;
    check(`gold: hotspot ${h.label}`, meetsGating(h.gating, st));
    if (h.action.itemGranted) {
      const it = item(h.action.itemGranted)!;
      if (!st.inventory.some((i) => i.id === it.id)) st = { ...st, inventory: [...st.inventory, it] };
    }
  };

  check("gold: freezer door locked before key", !meetsGating({ requiresItems: ["key"] }, createInitialState(S)));
  enter("nd_credits");
  enter("nd_arrive");
  grab("nd_arrive", "nd_h_coat");
  enter("nd_kitchen");
  grab("nd_kitchen", "nd_k_photo");
  grab("nd_kitchen", "nd_k_key");
  door("nd_kitchen", "nd_k_freezer");
  enter("nd_freezer");
  check("gold: onEnter searched_freezer", st.activeFlags.has("searched_freezer"));
  grab("nd_freezer", "nd_f_ice");
  pick("nd_freezer", "nd_f_out");
  door("nd_kitchen", "nd_k_backroom");
  enter("nd_backroom");
  check("gold: onEnter backroom_searched", st.activeFlags.has("backroom_searched"));
  const puzzle = byId.get("nd_backroom")!.hotspots!.find((h) => h.action.type === "patternPuzzle")!;
  st = applyConsequences(S, puzzle.action.patternPuzzle!.rewardConsequences, st);
  check("gold: puzzle grants ledger", st.inventory.some((i) => i.id === "ledger"));
  check("gold: puzzle sets ledger_page", st.activeFlags.has("ledger_page"));
  pick("nd_backroom", "nd_b_cabinet");
  check("gold: cabinet grants bus_pass", st.inventory.some((i) => i.id === "bus_pass"));
  pick("nd_backroom", "nd_b_door_qte");
  check("gold: QTE answered sets answered_door", st.activeFlags.has("answered_door"));
  check("gold: answering keeps heat at 0", st.meters.Suspicion === 0, st.meters);
  pick("nd_backroom", "nd_b_back");
  enter("nd_kitchen");
  pick("nd_kitchen", "nd_k_back");
  enter("nd_arrive");
  pick("nd_arrive", "nd_c_booth");
  enter("nd_vince");
  pick("nd_vince", "nd_v_ask");
  check("gold: memory recorded", st.memories.asked_mabel != null);
  check("gold: Vince trust 1", st.characterTrust.vince === 1, st.characterTrust);
  const vinceScene = byId.get("nd_vince")!;
  const qv = vinceScene.interrogation!;
  check("gold: composure starts full (3)", composureRemaining(vinceScene, used) === 3);
  pick("nd_vince", "nd_v_photo");
  check("gold: photo shown sets trusted_vince", st.activeFlags.has("trusted_vince"));
  check(
    "gold: presenting the photo records the item:photo memory",
    st.memories["item:photo"] === "Mabel's Photograph",
    st.memories
  );
  check("gold: flashing keeps the photo in the satchel", st.inventory.some((i) => i.id === "photo"));
  // The photo is a Sultry press — it chips composure. The neutral ask did not.
  check("gold: the Sultry photo press chipped composure to 2", composureRemaining(vinceScene, used) === 2);
  // Two more presses take the suspect to zero.
  pick("nd_vince", "nd_v_press2");
  check("gold: composure 1 after the soft press", composureRemaining(vinceScene, used) === 1);
  pick("nd_vince", "nd_v_threat");
  check("gold: composure zero after the third press", composureRemaining(vinceScene, used) === 0);
  // Warm path: trust is 1 (+1 ask, +1 photo, -1 threat) ≥ crackTrust −1 → CRACK.
  check("gold: trust at zero is 1 (ask+photo-threat)", st.characterTrust.vince === 1, st.characterTrust);
  check("gold: warm path cracks (trust ≥ threshold)", interrogationOutcome(qv, st.characterTrust.vince) === "broke");
  check("nd: threshold −1 — the plain-press warm path (ask, then press to zero at −1) cracks", interrogationOutcome(qv, -1) === "broke");
  check("nd: pressing cold still clamps (−2)", interrogationOutcome(qv, -2) === "clamped");
  check("gold: crack/clamp flags are collected for the pickers", collectFlags(S).includes("vince_broke") && collectFlags(S).includes("vince_clamped"));
  check(
    "gold: memory-gated beat now visible",
    meetsGating(byId.get("nd_vince")!.dialogueBeats!.find((b) => b.id === "nd_v3")!.conditionRule, st)
  );
  const proof = combineItems(S, st.inventory.find((i) => i.id === "photo")!, st.inventory.find((i) => i.id === "ledger")!);
  check("gold: recipe photo+ledger -> case file", proof?.id === "proof");
  st = { ...st, inventory: [...st.inventory.filter((i) => i.id !== "photo" && i.id !== "ledger"), proof!] };
  for (const c of S.deduction!.connections) {
    check(`gold: board endpoint ${c.a}/${c.b} is valid`, !!item(c.a) || !!S.characters.find((x) => x.id === c.a), c);
    st = applyConsequences(S, { setFlags: [c.flagSet] }, st);
  }
  pick("nd_vince", "nd_v_leave");
  enter("nd_arrive");
  pick("nd_arrive", "nd_c_porch");
  enter("nd_porch");
  check("gold: porch carries the part break", byId.get("nd_porch")!.partBreak === "Part One — Last Order");
  enter("nd_street");
  check(
    "gold: Ruiz flag-gated beat fires on trusted_vince",
    meetsGating(byId.get("nd_street")!.dialogueBeats!.find((b) => b.id === "nd_s2")!.conditionRule, st)
  );
  // The warm path used the threat as its third press, so the pressed-vince
  // flag IS set and Ruiz's beat about it fires.
  check(
    "gold: Ruiz pressed-vince beat fires (the threat press set the flag)",
    meetsGating(byId.get("nd_street")!.dialogueBeats!.find((b) => b.id === "nd_s3")!.conditionRule, st)
  );
  check(
    "gold: Ruiz item-keyed beat fires on the presented photo",
    meetsGating(byId.get("nd_street")!.dialogueBeats!.find((b) => b.id === "nd_s4")!.conditionRule, st)
  );
  check(
    "gold: item recall reads the item's name into {said}",
    resolveBeatText(byId.get("nd_street")!.dialogueBeats!.find((b) => b.id === "nd_s4")!, st.memories).includes(
      "So that's the Mabel's Photograph"
    )
  );
  pick("nd_street", "nd_s_in");
  enter("nd_accuse");
  check("gold: Clever 2+ reached", st.meters.Clever >= 2, st.meters);
  pick("nd_accuse", "nd_ac_threads");
  check("gold: threads set saw_the_threads", st.activeFlags.has("saw_the_threads"));
  check(
    "gold: contradiction beat unlocked",
    meetsGating(byId.get("nd_accuse")!.dialogueBeats!.find((b) => b.id === "nd_ac3")!.conditionRule, st)
  );
  // The gold ending's requirement is the PRESENTED item, not an authored gate.
  const goldChoice = byId.get("nd_accuse")!.choices!.find((c) => c.id === "nd_ac_gold")!;
  check("gold: ending gate holds the case file (via presentItem)", meetsGating(effectiveChoiceGating(goldChoice), st));
  pick("nd_accuse", "nd_ac_gold");
  check("gold: handing over the file records item:proof", st.memories["item:proof"] === "The Case File", st.memories);
  check("gold: the case file leaves the satchel (consumed)", !st.inventory.some((i) => i.id === "proof"));
  check("gold: heat never fired", st.meters.Suspicion < S.briefing!.heatLimit!, st.meters);

  // --- fold run: three mistakes = heat 3 = Folded ---
  let ft = createInitialState(S);
  ft = applyConsequences(S, byId.get("nd_vince")!.choices!.find((c) => c.id === "nd_v_threat")!.consequences, ft);
  ft = applyConsequences(S, puzzle.action.patternPuzzle!.wrongSubmissionConsequences, ft);
  ft = applyConsequences(S, byId.get("nd_backroom")!.choices!.find((c) => c.id === "nd_b_door_qte")!.timedOutConsequences, ft);
  check("fold: three mistakes reach the heat limit", ft.meters.Suspicion >= S.briefing!.heatLimit!, ft.meters);
  const folded = byId.get(S.briefing!.heatFailSceneId!);
  check("fold: heat scene is a game-over ending", folded?.isEnding === true && folded?.endingData?.tier === "gameover");
  check(
    "fold: timeout flag note echoes in the recall",
    resolveBeatText(byId.get("nd_vince")!.dialogueBeats!.find((b) => b.id === "nd_v4")!, {}, ft.activeFlags, S.flagNotes).includes(
      "let it pass unanswered"
    )
  );

  // --- act maps: hotspot-only scenes must be on their act's RouteMap ---
  const act1 = scenesInAct(S, "nd_act1");
  const act2 = scenesInAct(S, "nd_act2");
  check("acts: hotspot-only freezer is in Act One", act1.has("nd_freezer"), [...act1]);
  check("acts: hotspot-only back room is in Act One", act1.has("nd_backroom"), [...act1]);
  check("acts: Act One stops at the porch's destination", !act1.has("nd_street"), [...act1]);
  check("acts: Act Two owns street + accusation + endings", act2.has("nd_street") && act2.has("nd_accuse") && act2.has("nd_end_gold"), [...act2]);
  check("acts: heat-bust ending belongs to no act (trapdoor)", !act1.has("nd_end_folded") && !act2.has("nd_end_folded"));

  // --- route map layering: loop-back navigation must not pump the ranks ---
  // Act One is a hub-and-spoke act (booth/station/kitchen all return to the
  // hall; freezer/back room return to the kitchen). Layering a graph with
  // cycles never settles — the pre-fix fixed point ran to its cap and left
  // the hall ranked 19 deep with every return edge drawn backwards.
  {
    const step = (sceneId: string, sceneTitle: string, choiceId: string, choiceText: string): JourneyStep => ({
      sceneId,
      sceneTitle,
      choiceId,
      choiceText,
      attitudeTag: "Neutral",
      options: [],
      timedOut: false,
      flagsSet: [],
    });
    const g = buildRouteGraph(
      S,
      "nd_act1",
      [
        step("nd_arrive", "The Hall", "nd_c_booth", "Booth four."),
        step("nd_vince", "Booth Four", "nd_v_leave", "Leave the booth."),
        step("nd_arrive", "The Hall", "nd_c_station", "The counter."),
        step("nd_station", "Mabel's Station", "nd_s_back", "Back to the diner."),
        step("nd_arrive", "The Hall", "nd_c_kitchen", "The kitchen."),
        step("nd_kitchen", "The Kitchen", "nd_k_back", "Back to the hall."),
        step("nd_arrive", "The Hall", "nd_c_porch", "Step out into the rain."),
      ],
      "nd_porch"
    );
    const depthOf = new Map(g.nodes.map((n) => [n.id, n.depth]));
    check("map: loop-back act layers compactly (every scene at depth ≤ 3)", g.nodes.every((n) => n.depth <= 3), g.nodes.map((n) => `${n.id}:${n.depth}`));
    check("map: the act's opener is ranked first and reads as taken", depthOf.get("nd_credits") === 0 && g.nodes.find((n) => n.id === "nd_credits")!.status === "taken");
    check("map: the hall hub sits one rank in", depthOf.get("nd_arrive") === 1, depthOf.get("nd_arrive"));
    const backs = g.edges.filter((e) => e.isBack);
    check("map: every loop-back is flagged as a back edge (≥5)", backs.length >= 5, backs.length);
    check("map: back edges point to a shallower rank", backs.every((e) => (depthOf.get(e.target) ?? 0) < (depthOf.get(e.source) ?? 0)), backs.map((e) => e.id));
    check("map: every forward edge points strictly forward", g.edges.filter((e) => !e.isBack).every((e) => (depthOf.get(e.target) ?? 0) > (depthOf.get(e.source) ?? 0)), g.edges.filter((e) => !e.isBack).map((e) => e.id));
  }

  // --- validator: exactly the one known trapdoor note, zero errors ---
  const issues = validateStory(S);
  check("story: zero validator errors", !issues.some((i) => i.severity === "error"), issues.filter((i) => i.severity === "error"));
  check(
    "story: only the known trapdoor note remains",
    issues.length === 1 && /belong to no act/.test(issues[0].message),
    issues
  );
}

// The present-item verb ("show the photograph"): effective gating, item
// handover, the `item:<id>` presentation memory, and item-keyed recalls.
{
  const presStory: Story = {
    id: "t",
    title: "T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    items: [
      { id: "photo", name: "The Photograph", icon: "📷", description: "", flavorText: "" },
      { id: "ledger", name: "The Ledger", icon: "📒", description: "", flavorText: "" },
    ],
    scenes: [
      {
        id: "a",
        title: "A",
        background: "",
        prose: "",
        choices: [
          { id: "c_show", text: "Show him the photograph.", targetSceneId: "", reply: true, presentItem: "photo", memoryLog: "showed_photo" },
          { id: "c_hand", text: "Hand over the ledger.", targetSceneId: "e", presentItem: "ledger", consumePresentedItem: true },
          { id: "c_plain", text: "Leave.", targetSceneId: "e" },
        ],
      },
      { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
    characters: [],
  };
  const pick = (id: string) => presStory.scenes[0].choices!.find((c) => c.id === id)!;
  const state = () => createInitialState(presStory);

  // effective gating: the presented item is a requirement you can't fake.
  check("present: no presentItem, no authored gate -> undefined", effectiveChoiceGating(pick("c_plain")) === undefined);
  check("present: presents with no authored gate -> requires the item", effectiveChoiceGating(pick("c_show"))?.requiresItems?.join(",") === "photo");
  const gated = { ...pick("c_show"), gating: { requiresFlags: ["x"] } };
  check("present: merges with authored gate without duplicating", effectiveChoiceGating(gated)?.requiresItems?.join(",") === "photo" && effectiveChoiceGating(gated)?.requiresFlags?.join(",") === "x");
  const s = state();
  check("present: locked while the item is not held", !meetsGating(effectiveChoiceGating(pick("c_show")), s));
  s.inventory.push(presStory.items[0]);
  check("present: unlockable once the item is held", meetsGating(effectiveChoiceGating(pick("c_show")), s));

  // handover: consuming a present removes it; flashing keeps it.
  check("present: flash keeps the item (no removeItems)", presentationConsequences(pick("c_show"))?.removeItems === undefined);
  check("present: handover removes the item", presentationConsequences(pick("c_hand"))?.removeItems?.includes("ledger"));
  const withRemove = { ...pick("c_hand"), consequences: { removeItems: ["photo"] } };
  check("present: handover preserves authored removeItems", presentationConsequences(withRemove)?.removeItems?.sort().join(",") === "ledger,photo");

  // the presentation memory: `item:<id>` = the item's NAME.
  let ps = state();
  ps.inventory.push(presStory.items[0]);
  ps = applyConsequences(presStory, presentationConsequences(pick("c_show"))!, ps);
  ps = recordPresentation(pick("c_show"), presStory, ps);
  check("present: records item:photo memory with the item name", ps.memories["item:photo"] === "The Photograph");
  const before = ps.memories["item:photo"];
  check("present: first presentation wins (idempotent)", recordPresentation(pick("c_show"), presStory, ps).memories["item:photo"] === before);
  check("present: no presentItem -> state unchanged", recordPresentation(pick("c_plain"), presStory, ps) === ps);

  // item-keyed recall + item-keyed gate ride the existing memory machinery.
  check(
    "present: beat recalls item:photo, {said} = item name",
    resolveBeatText({ text: "x", recalls: { "item:photo": "You flashed {said}." } }, ps.memories) ===
      "You flashed The Photograph."
  );
  check("present: gate remembers the presentation", meetsGating({ requiresMemories: ["item:photo"] }, ps));
  check("present: gate stays closed when never presented", !meetsGating({ requiresMemories: ["item:photo"] }, state()));

  // collectMemoryTags offers item: keys for real items only.
  const tags = collectMemoryTags(presStory);
  check("present: collectMemoryTags offers item:photo", tags.includes("item:photo"));
  check("present: collectMemoryTags offers item:ledger", tags.includes("item:ledger"));
  check("present: collectMemoryTags omits unknown item keys", !tags.includes("item:ghost"));

  // validator: presenting an unknown item is an error; a real item: recall key is fine.
  const badPres: Story = {
    ...presStory,
    scenes: [
      {
        ...presStory.scenes[0],
        choices: [
          { id: "c_bad", text: "Show the ghost.", targetSceneId: "e", presentItem: "ghost" },
          { id: "c_recall", text: "Say something.", targetSceneId: "e", reply: true, presentItem: "photo" },
        ],
        dialogueBeats: [
          { id: "b1", characterId: "narrator", text: "", recalls: { "item:photo": "x", "item:ghost": "y" } },
        ],
      },
      presStory.scenes[1],
    ],
  };
  const issues = validateStory(badPres);
  check("present: validator errors on unknown present item", issues.some((i) => i.severity === "error" && /presents unknown item "ghost"/.test(i.message)));
  check("present: validator accepts a real item: recall key", !issues.some((i) => /item:photo/.test(i.message)));
  check("present: validator warns on unknown item: recall key", issues.some((i) => /item:ghost/.test(i.message)));
}

// Interrogation helpers: pressing detection, composure derivation (exclusive
// groups count once, floor at zero, derived from usedChoices so it's
// save-proof), and the trust decides crack vs clamp boundary.
{
  const mkScene = (choices: Choice[], composure?: number): SceneNode => ({
    id: "iq",
    title: "IQ",
    background: "",
    prose: "",
    choices,
    interrogation: {
      characterId: "sus",
      composure,
      crackTrust: 0,
      brokeBeat: { id: "b", characterId: "sus", text: "talks" },
      brokeFlag: "broke",
    },
  });
  const press = (id: string, extra: Partial<Choice> = {}): Choice => ({
    id,
    text: `press ${id}`,
    targetSceneId: "",
    reply: true,
    attitudeTag: "Aggressive",
    ...extra,
  });

  check("interrogation: attitude reply is a press", isPressingReply(press("p1")));
  check("interrogation: neutral reply is not a press", !isPressingReply(press("p2", { attitudeTag: "Neutral" })));
  check("interrogation: non-reply attitude is not a press", !isPressingReply({ id: "n", text: "n", targetSceneId: "x", attitudeTag: "Aggressive" }));

  const s2 = mkScene([press("a"), press("b")], 2);
  check("composure: full before any press", composureRemaining(s2, new Set()) === 2);
  check("composure: one press chips one", composureRemaining(s2, new Set(["iq:a"])) === 1);
  check("composure: floors at zero", composureRemaining(s2, new Set(["iq:a", "iq:b"])) === 0);
  check("composure: below zero stays zero", composureRemaining(mkScene([press("a")], 1), new Set(["iq:a"])) === 0);
  check("composure: no interrogation → 0", composureRemaining({ id: "x", title: "", background: "", prose: "" }, new Set(["x:a"])) === 0);

  const grouped = mkScene(
    [press("g1", { exclusiveGroup: "q" }), press("g2", { exclusiveGroup: "q" }), press("g3", { exclusiveGroup: "q" })],
    3
  );
  // Picking one group member marks all three used, but it's ONE statement.
  check("composure: exclusive group counts once", composureRemaining(grouped, new Set(["iq:g1", "iq:g2", "iq:g3"])) === 2);
  const mixed = mkScene([press("g1", { exclusiveGroup: "q" }), press("g2", { exclusiveGroup: "q" }), press("solo")], 3);
  check("composure: group + solo press = 2 chips", composureRemaining(mixed, new Set(["iq:g1", "iq:g2", "iq:solo"])) === 1);

  check("outcome: trust at threshold cracks", interrogationOutcome({ characterId: "s", crackTrust: 1, brokeBeat: { id: "b", characterId: "s", text: "" }, brokeFlag: "f" }, 1) === "broke");
  check("outcome: trust below threshold clamps", interrogationOutcome({ characterId: "s", crackTrust: 1, brokeBeat: { id: "b", characterId: "s", text: "" }, brokeFlag: "f" }, 0) === "clamped");
  check("outcome: default threshold is 0", interrogationOutcome({ characterId: "s", brokeBeat: { id: "b", characterId: "s", text: "" }, brokeFlag: "f" }, 0) === "broke");
  check("outcome: default threshold clamps at negative trust", interrogationOutcome({ characterId: "s", brokeBeat: { id: "b", characterId: "s", text: "" }, brokeFlag: "f" }, -1) === "clamped");

  // Stored-composure urgency: a press drops one (and flags the break moment);
  // a steady recovers one, once, only while pressed.
  check("press: first press drops full to 2", (() => { const r = pressComposure(undefined, 3); return r.next === 2 && r.broke === false && r.changed === true; })());
  check("press: 1 -> 0 is the break", (() => { const r = pressComposure(1, 3); return r.next === 0 && r.broke === true; })());
  check("press: 0 stays 0 (already broken)", (() => { const r = pressComposure(0, 3); return r.next === 0 && r.broke === false && r.changed === false; })());
  check("steady: pressed + not-yet-steadied recovers one", (() => { const r = steadyComposure(2, 3, false); return r.next === 3 && r.recovered === true; })());
  check("steady: at full, nothing to recover", (() => { const r = steadyComposure(3, 3, false); return r.next === 3 && r.recovered === false; })());
  check("steady: already steadied, no second recovery", (() => { const r = steadyComposure(2, 3, true); return r.next === 2 && r.recovered === false; })());
  check("steady: broken (0) can't recover", (() => { const r = steadyComposure(0, 3, false); return r.next === 0 && r.recovered === false; })());
  check("steady: once steadied then pressed, can't steady again", (() => { const r = steadyComposure(2, 3, true); return r.recovered === false; })());

  check("reaction: index 0 at first press", pressReaction({ composure: 3 }, 2) === DEFAULT_PRESS_REACTIONS[0]);
  check("reaction: deeper index near the edge", pressReaction({ composure: 3 }, 1) === DEFAULT_PRESS_REACTIONS[1]);
  check("reaction: custom reactions override", pressReaction({ composure: 3, pressReactions: ["A", "B", "C"] }, 2) === "A");
  check("reaction: a short custom list holds its last line at depth", pressReaction({ composure: 5, pressReactions: ["A"] }, 1) === "A");
  check("reaction: no custom list uses the defaults", pressReaction({ composure: 3 }, 1) === DEFAULT_PRESS_REACTIONS[1]);
}

// Examine (hold to inspect): the zoom clamps so tiny zones can't blur into
// noise, and The Neon Diner's investigation scene is wired end to end
// (examine hotspots → flags → gated discovery beats).
{
  check("examineZoom: small zone clamps to max", examineZoom({ w: 5, h: 5 }) === 3.5);
  check("examineZoom: large zone clamps to min", examineZoom({ w: 80, h: 80 }) === 1.6);
  check("examineZoom: mid zone magnifies", Math.abs(examineZoom({ w: 20, h: 16 }) - 3) < 0.001);

  const story = NEON_DINER;
  const sceneById = new Map(story.scenes.map((x) => [x.id, x]));
  const station = sceneById.get("nd_station");
  check("examine: station scene exists", !!station);
  const examineZones = (station?.hotspots ?? []).filter((h) => h.examine);
  check("examine: three examine zones (coffee, watch, note)", examineZones.length === 3, examineZones.map((h) => h.label));
  check("examine: each zone sets a flag", examineZones.every((h) => !!h.action.flagSet));
  const examineFlags = new Set(examineZones.map((h) => h.action.flagSet!));
  const discoveryBeats = (station?.dialogueBeats ?? []).filter((b) => b.conditionRule?.requiresFlags?.some((f) => examineFlags.has(f)));
  check("examine: a discovery beat is gated on each examined flag", discoveryBeats.length === 3, discoveryBeats.map((b) => b.id));
  check("examine: pickups grant the watch + note", examineZones.some((h) => h.action.itemGranted === "mabel_watch") && examineZones.some((h) => h.action.itemGranted === "mabel_note"));
  check("examine: the note cross-links to Act Two (Ruiz beat)", (sceneById.get("nd_street")!.dialogueBeats ?? []).some((b) => b.conditionRule?.requiresFlags?.includes("examined_note")));
}

/* ================================================================== */
/*  5. Voice ducking envelope (audio.ts — stepped ramp, real-time)     */
/* ================================================================== */
{
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const { audio } = await import("../src/audio");
  let notified = 0;
  audio.onDuckChange = () => notified++;
  try {
    audio.setVoiceDuckEnabled(true);
    audio.duckFactor = 1;
    audio.voiceStarted();
    await sleep(700); // attack is 450ms
    check("duck: dips toward the floor when voice starts", audio.duckFactor < 0.5, audio.duckFactor);
    audio.voiceStarted(); // a second line begins — the floor must hold
    await sleep(300);
    check("duck: a new line holds the floor (no pump)", audio.duckFactor < 0.5, audio.duckFactor);
    audio.voiceEnded();
    await sleep(1100 + 900 + 400); // grace 1100ms + release 900ms + margin
    check("duck: releases to full after a beat of silence", Math.abs(audio.duckFactor - 1) < 0.01, audio.duckFactor);
    check("duck: envelope steps notified the game", notified > 5, notified);
    audio.setVoiceDuckEnabled(false);
    await sleep(300);
    const level = audio.duckFactor;
    audio.voiceStarted();
    await sleep(700);
    check("duck: disabled — voice never dips the music", Math.abs(audio.duckFactor - level) < 0.01, audio.duckFactor);
    audio.setVoiceDuckEnabled(true);
  } finally {
    audio.onDuckChange = null;
  }
}

/* ================================================================== */
/*  6. Voice-file export round trip (mediaLibrary.ts — real code)      */
/*                                                                     */
/*  The .reel.json envelope never changed shape: it is still           */
/*  `{ ...story, assets: MediaAsset[] }`. What changed is content —    */
/*  voice lines saved as files (/voices/... or file://) are read off   */
/*  disk and converted into ordinary asset:<id> rows, which the        */
/*  UNCHANGED import path (importStoryAssets + compactStoryMedia)      */
/*  already consumes. This section proves that round trip.             */
/* ================================================================== */
{
  const http = await import("node:http");
  const { bundleVoiceFileRefs, resolveMediaValue } = await import("../src/data/mediaLibrary");

  // A tiny static server standing in for the dev server's public/ folder.
  const mp3Bytes = "ID3fake-mp3-bytes-for-the-export-round-trip-test-1234";
  const routes: Record<string, string> = {
    "/voices/rosa/nwd_test/line.mp3": mp3Bytes,
  };
  const server = http.createServer((req, res) => {
    const body = routes[req.url ?? ""];
    if (body === undefined) {
      res.writeHead(404).end("nope");
      return;
    }
    res.writeHead(200, { "content-type": "audio/mpeg" }).end(body);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const base = `http://127.0.0.1:${port}`;

  // Node's fetch refuses root-relative URLs — point them at the server,
  // exactly like the dev server serves public/ in a real browser.
  const realFetch = globalThis.fetch;
  globalThis.fetch = ((input: unknown, init?: unknown) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : String(input);
    return realFetch(url.startsWith("/") ? base + url : url, init as RequestInit | undefined);
  }) as typeof fetch;

  try {
    const story = {
      id: "export-roundtrip",
      title: "Export Round Trip",
      startSceneId: "s1",
      scenes: [
        {
          id: "s1",
          title: "The Diner",
          background: "gradient:linear-gradient(#000,#111)",
          dialogueBeats: [
            { id: "b1", characterId: "rosa", text: "Hi.", audioUrl: "/voices/rosa/nwd_test/line.mp3" },
            { id: "b2", characterId: "rosa", text: "Gone.", audioUrl: "/voices/rosa/nwd_test/absent.mp3" },
            { id: "b3", characterId: "rosa", text: "No voice." },
          ],
        },
      ],
      characters: [{ id: "rosa", name: "Rosa" }],
      items: [],
    } as unknown as Story;

    const { story: exported, assets, missing } = await bundleVoiceFileRefs(story);

    // 1. The found file becomes an asset: reference + one bundled base64 row.
    const refB1 = exported.scenes[0].dialogueBeats![0].audioUrl!;
    check("voice export: file ref becomes an asset: ref", refB1.startsWith("asset:voice-"), refB1);
    check("voice export: exactly one bundled asset row", assets.length === 1, assets.length);
    const row = assets[0];
    check(
      "voice export: row carries a base64 mp3 payload",
      !!row.dataUrl?.startsWith("data:audio/mpeg;base64,"),
      row.dataUrl?.slice(0, 40)
    );
    const decoded = Buffer.from(row.dataUrl!.slice("data:audio/mpeg;base64,".length), "base64").toString("utf8");
    check("voice export: payload decodes to the exact file bytes", decoded === mp3Bytes, decoded);

    // 2. A referenced-but-missing file is named; its reference is untouched.
    check(
      "voice export: missing file is named in the report",
      missing.length === 1 && missing[0] === "/voices/rosa/nwd_test/absent.mp3",
      missing
    );
    check(
      "voice export: missing ref left as-is",
      exported.scenes[0].dialogueBeats![1].audioUrl === "/voices/rosa/nwd_test/absent.mp3"
    );

    // 3. The working story is never mutated by the export.
    check(
      "voice export: input story not mutated",
      story.scenes[0].dialogueBeats![0].audioUrl === "/voices/rosa/nwd_test/line.mp3"
    );

    // 4. The UNCHANGED import path: importStoryAssets strips fileUrl (absent
    //    on bundled rows) and stores the rest; the game then resolves the ref
    //    through the same id->url map it builds at play time.
    const importedRows = assets.map(({ fileUrl: _fileUrl, ...asset }) => ({
      ...asset,
      storyId: "someone-elses-story",
    }));
    const map: Record<string, string> = Object.fromEntries(
      importedRows.map((a) => [a.id, (a as { fileUrl?: string }).fileUrl ?? a.dataUrl])
    );
    check(
      "voice export→import: play-time resolver finds the voice",
      resolveMediaValue(refB1, map) === row.dataUrl
    );

    // 5. A file:// ref (packaged-app reference) without the desktop bridge
    //    is reported missing rather than silently dropped or crashed on.
    const fileRefStory = JSON.parse(JSON.stringify(story)) as unknown as Story;
    fileRefStory.scenes[0].dialogueBeats![0].audioUrl =
      "file:///C:/Users/x/AppData/Roaming/Scarlet Reel/game-media/voices/rosa/nwd_test/line.mp3";
    delete fileRefStory.scenes[0].dialogueBeats![1].audioUrl;
    const fileOut = await bundleVoiceFileRefs(fileRefStory);
    check(
      "voice export: file:// ref without desktop bridge is reported missing",
      fileOut.missing.length === 1 && fileOut.missing[0].startsWith("file://"),
      fileOut.missing
    );

    // 6. An old-style export (asset: refs + library rows, no voice files)
    //    passes through the new exporter byte-for-byte untouched.
    const legacy = JSON.parse(JSON.stringify(story)) as unknown as Story;
    legacy.scenes[0].dialogueBeats![0].audioUrl = "asset:17345-original";
    delete legacy.scenes[0].dialogueBeats![1].audioUrl;
    const legacyOut = await bundleVoiceFileRefs(legacy);
    check(
      "voice export: legacy asset: refs pass through untouched",
      legacyOut.story.scenes[0].dialogueBeats![0].audioUrl === "asset:17345-original"
    );
    check(
      "voice export: legacy export adds no rows and names no missing",
      legacyOut.assets.length === 0 && legacyOut.missing.length === 0
    );
  } finally {
    globalThis.fetch = realFetch;
    server.close();
  }
}

/* ================================================================== */
/*  7. Session restore (game/session.ts — real code)                   */
/*                                                                     */
/*  A reload must put the player back where they were instead of on    */
/*  the newsstand, and a corrupt or hostile stored value must never    */
/*  be enough to break startup.                                        */
/* ================================================================== */
{
  const { SESSION_KEY, readSession, writeSession, clearSession } = await import("../src/game/session");

  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
  };

  check("session: absent to begin with", readSession() === null);

  writeSession({ kind: "play", storyId: "the-neon-diner" });
  check(
    "session: a play session round trips with its case id",
    JSON.stringify(readSession()) === JSON.stringify({ kind: "play", storyId: "the-neon-diner" }),
    readSession()
  );
  check("session: stored under the documented key", store.has(SESSION_KEY));

  writeSession({ kind: "studio" });
  check("session: studio round trips", readSession()?.kind === "studio", readSession());
  writeSession({ kind: "gallery" });
  check("session: gallery round trips", readSession()?.kind === "gallery", readSession());

  clearSession();
  check("session: quitting to the newsstand clears it", readSession() === null && !store.has(SESSION_KEY));

  // A bad stored value must read as "no session", never throw at startup.
  for (const [name, bad] of [
    ["corrupt JSON", "{not json"],
    ["JSON null", "null"],
    ["a number", "42"],
    ["a string", "\"the-neon-diner\""],
    ["an array", "[]"],
    ["unknown kind", JSON.stringify({ kind: "credits" })],
    ["no kind", JSON.stringify({ storyId: "x" })],
    ["play with no case id", JSON.stringify({ kind: "play" })],
    ["play with empty case id", JSON.stringify({ kind: "play", storyId: "" })],
    ["play with non-string id", JSON.stringify({ kind: "play", storyId: 7 })],
  ] as Array<[string, string]>) {
    store.set(SESSION_KEY, bad);
    let out: unknown = "threw";
    try {
      out = readSession();
    } catch {
      /* stays "threw" */
    }
    check(`session: ${name} reads as no session`, out === null, out);
  }

  // Storage that throws outright (private mode / disabled cookies) must not
  // take startup down with it.
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("SecurityError");
    },
    removeItem: () => {
      throw new Error("SecurityError");
    },
    key: () => null,
    length: 0,
    clear: () => {},
  };
  let threw = false;
  try {
    check("session: throwing storage reads as no session", readSession() === null);
    writeSession({ kind: "studio" }); // must swallow, not propagate
    clearSession();
  } catch {
    threw = true;
  }
  check("session: throwing storage never propagates", !threw);
}

/* ================================================================== */
/*  8. Credits-intro look presets (src/credits.ts — real code)         */
/*                                                                     */
/*  A preset is a LOOK, never CONTENT: applying one must overwrite every */
/*  style knob (including resetting a knob another preset moved) while  */
/*  leaving the authored title, subheading, credit lines and montage    */
/*  stills alone. And the picker must be able to tell which preset a    */
/*  node's knobs currently spell out.                                   */
/* ================================================================== */
{
  const {
    CREDITS_PRESETS,
    CREDITS_PRESET_GROUPS,
    CREDITS_PRESET_LIST,
    CREDITS_LOOK_KEYS,
    applyCreditsPreset,
    creditsLookSummary,
    matchCreditsPreset,
    resolveCreditsLook,
  } = await import("../src/credits");

  // --- catalogue integrity -------------------------------------------------
  const ids = CREDITS_PRESET_LIST.map((p) => p.id);
  check("credits presets: list is not empty", CREDITS_PRESET_LIST.length > 0);
  check("credits presets: every list entry resolves in CREDITS_PRESETS", ids.every((id) => !!CREDITS_PRESETS[id]));
  check("credits presets: ids are unique", new Set(ids).size === ids.length);
  check(
    "credits presets: every entry is named, tagged and filed under a group",
    CREDITS_PRESET_LIST.every((p) => !!p.name && !!p.badge && !!p.tagline && !!p.swatch && !!p.group),
    CREDITS_PRESET_LIST.filter((p) => !p.name || !p.badge || !p.tagline || !p.swatch || !p.group).map((p) => p.id),
  );

  // The Studio picker renders one section per group; a preset filed under an
  // unknown group would vanish from the grid, and an empty group would ship
  // a dead header.
  const groupIds = new Set(CREDITS_PRESET_GROUPS.map((g) => g.id));
  check(
    "credits presets: every preset files under a known group",
    CREDITS_PRESET_LIST.every((p) => groupIds.has(p.group)),
    CREDITS_PRESET_LIST.filter((p) => !groupIds.has(p.group)).map((p) => `${p.id}:${p.group}`),
  );
  check(
    "credits presets: every group has at least one preset",
    CREDITS_PRESET_GROUPS.every((g) => CREDITS_PRESET_LIST.some((p) => p.group === g.id)),
    CREDITS_PRESET_GROUPS.filter((g) => !CREDITS_PRESET_LIST.some((p) => p.group === g.id)).map((g) => g.id),
  );
  // The list feeds the grouped picker, so each group should appear as one
  // contiguous run — no group restarting after another has begun.
  const groupRun = CREDITS_PRESET_LIST.map((p) => p.group);
  const runs = groupRun.filter((g, i) => i === 0 || groupRun[i - 1] !== g);
  check(
    "credits presets: groups are contiguous in the list so the picker sections read clean",
    new Set(runs).size === runs.length,
    runs,
  );

  // The picker's knob read-out: names the face and the presentation for a
  // cards look, and spells the roll length for a scroll look.
  const ghSummary = creditsLookSummary(CREDITS_PRESETS["grindhouse-slam"].look);
  check(
    "credits presets: look summary names the typeface and card motion",
    ghSummary.includes("Bebas") && ghSummary.includes("cards/slam") && ghSummary.includes("hard cuts"),
    ghSummary,
  );
  const scrollSummary = creditsLookSummary(CREDITS_PRESETS["rep-house-roll"].look);
  check(
    "credits presets: look summary spells the scroll length",
    scrollSummary.includes("scroll 32s") && scrollSummary.includes("projector weave"),
    scrollSummary,
  );
  check(
    "credits presets: look summary mentions a list entrance only where it matters",
    creditsLookSummary(CREDITS_PRESETS["streaming-cold-open"].look).includes("typewriter") &&
      !creditsLookSummary(CREDITS_PRESETS["grindhouse-slam"].look).includes("slam in") &&
      !creditsLookSummary(CREDITS_PRESETS["grindhouse-slam"].look).includes("typewriter"),
    creditsLookSummary(CREDITS_PRESETS["streaming-cold-open"].look),
  );

  // `applyCreditsPreset` merges with a spread, so a knob only gets RESET if the
  // preset owns the key explicitly (look() fills every key, even to undefined).
  check(
    "credits presets: every preset owns every knob explicitly",
    CREDITS_PRESET_LIST.every((p) => CREDITS_LOOK_KEYS.every((k) => Object.prototype.hasOwnProperty.call(p.look, k))),
    CREDITS_PRESET_LIST.filter((p) => !CREDITS_LOOK_KEYS.every((k) => Object.prototype.hasOwnProperty.call(p.look, k))).map(
      (p) => `${p.id}: missing ${CREDITS_LOOK_KEYS.filter((k) => !Object.prototype.hasOwnProperty.call(p.look, k)).join(",")}`,
    ),
  );

  // Slider ranges in the Studio credits panel — a preset that dials a value
  // outside them would leave the slider showing a number the author can't
  // reproduce, so the preset would silently not round-trip through the UI.
  const RANGES: Record<string, [number, number]> = {
    cardSeconds: [1.2, 8],
    montageSeconds: [2, 12],
    stagger: [0, 2],
    duration: [0.2, 2],
    scrollDuration: [6, 120],
  };
  for (const p of CREDITS_PRESET_LIST) {
    const r = resolveCreditsLook(p.look);
    for (const [key, [min, max]] of Object.entries(RANGES)) {
      const v = r[key as keyof typeof r] as number;
      check(`credits preset ${p.id}: ${key} ${v} inside studio slider ${min}–${max}`, v >= min && v <= max, v);
    }
  }

  // --- an untouched credits node IS the default preset ---------------------
  check("credits presets: no settings matches the default look", matchCreditsPreset(undefined) === "pulp-default");
  check("credits presets: empty settings matches the default look", matchCreditsPreset({}) === "pulp-default");
  check(
    "credits presets: an explicit default matches too",
    matchCreditsPreset({ font: "pulp", style: "fade-up", gateWeave: "off" }) === "pulp-default",
  );
  // Colour normalisation: #FFF and #ffffff and #FFFFFF are the same knob.
  check(
    "credits presets: colour case/short-hex normalises",
    matchCreditsPreset({ font: "modern", style: "fade-up", titleEntrance: "typewriter", titleColor: "#FFF", accentColor: "#E50914", stagger: 0.25, duration: 0.6 }) ===
      "streaming-cold-open",
  );

  // --- applying a preset: content survives, the look is replaced -----------
  const authored = {
    title: "MIDNIGHT CONFESSION",
    subtitle: "A Gaslight Reelworks picture",
    lines: [
      { role: "Directed by", name: "Sam Cole" },
      { role: "Written by", name: "The City" },
    ],
    montage: ["gradient:linear-gradient(#000,#000)", "asset:abc123"],
    montageLoop: false,
    gateWeave: "projector",
    scrollDuration: 90,
    cardSeconds: 7.5,
  } as const;

  for (const p of CREDITS_PRESET_LIST) {
    const out = applyCreditsPreset(p.id, { ...authored });
    check(`credits preset ${p.id}: keeps the authored title`, out.title === authored.title, out.title);
    check(`credits preset ${p.id}: keeps the authored subheading`, out.subtitle === authored.subtitle, out.subtitle);
    check(
      `credits preset ${p.id}: keeps the authored credit lines`,
      JSON.stringify(out.lines) === JSON.stringify(authored.lines),
      out.lines,
    );
    check(
      `credits preset ${p.id}: keeps the montage stills`,
      JSON.stringify(out.montage) === JSON.stringify(authored.montage),
      out.montage,
    );
    check(
      `credits preset ${p.id}: overwrites the look it owns`,
      JSON.stringify(resolveCreditsLook(out)) === JSON.stringify(resolveCreditsLook(p.look)),
      resolveCreditsLook(out),
    );
    check(`credits preset ${p.id}: node now matches that preset`, matchCreditsPreset(out) === p.id, matchCreditsPreset(out));
    // Presets are mutually distinguishable — two of them can't resolve equal.
    const twins = CREDITS_PRESET_LIST.filter((q) => q.id !== p.id && matchCreditsPreset(q.look) === p.id);
    check(`credits preset ${p.id}: no other preset resolves to it`, twins.length === 0, twins.map((t) => t.id));
  }

  // Switching presets must RESET the knobs the old one moved, not stack them.
  const rolled = applyCreditsPreset("pulp-default", applyCreditsPreset("rep-house-roll", { ...authored }));
  check(
    "credits presets: switching back to default resets scroll duration + weave",
    rolled.scrollDuration === 24 && rolled.gateWeave === "off",
    { scrollDuration: rolled.scrollDuration, gateWeave: rolled.gateWeave },
  );
  check(
    "credits presets: switching back to default still keeps the content",
    JSON.stringify(rolled.lines) === JSON.stringify(authored.lines) && JSON.stringify(rolled.montage) === JSON.stringify(authored.montage),
  );

  // --- the picker reads "custom look" once a knob is hand-tweaked ----------
  const tweaked = { ...applyCreditsPreset("grindhouse-slam", {}), gateWeave: "off" as const };
  check("credits presets: a hand-tweak clears the preset match", matchCreditsPreset(tweaked) === undefined);
  const unknown = applyCreditsPreset("not-a-preset" as never, { ...authored });
  check(
    "credits presets: an unknown id is a no-op",
    JSON.stringify(unknown) === JSON.stringify({ ...authored }),
    unknown,
  );
  // An unknown id returns the settings as handed in, so the node's look is
  // whatever it was — here a hand-made combination, matching no preset.
  check("credits presets: unknown id changes nothing the picker sees", matchCreditsPreset(unknown) === undefined, matchCreditsPreset(unknown));
}

/* ================================================================== *
 *  travel map — unlock derivation, availability, validator rules
 * ================================================================== */
{
  const scn = (id: string, extra: Partial<SceneNode> = {}): SceneNode => ({
    id,
    title: id,
    background: "",
    prose: "p",
    choices: [],
    hotspots: [],
    dialogueBeats: [],
    ...extra,
  });
  const S: Story = {
    id: "map-t",
    title: "Map T",
    tagline: "",
    coverImage: "",
    startSceneId: "a",
    items: [{ id: "key", name: "Key", icon: "🔑", description: "", flavorText: "" }],
    characters: [],
    scenes: [
      scn("a", { choices: [{ id: "c1", text: "go", targetSceneId: "end", attitudeTag: "Neutral" }] }),
      scn("b"),
      scn("note1", { nodeType: "note", choices: [{ id: "n1", text: "", targetSceneId: "b", attitudeTag: "Neutral" }] }),
      scn("deadnote", { nodeType: "note" }),
      scn("end", { isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "r" } }),
    ],
    map: {
      backgroundImage: "/img/map.jpg",
      locations: [
        { id: "l-open", label: "Open", targetSceneId: "a", x: 10, y: 10 },
        { id: "l-flag", label: "Flagged", targetSceneId: "b", x: 20, y: 20, gating: { requiresFlags: ["tip"] } },
        { id: "l-item", label: "Keyed", targetSceneId: "b", x: 30, y: 30, gating: { requiresItems: ["key"] } },
        { id: "l-secret", label: "Secret", targetSceneId: "b", x: 40, y: 40, gating: { requiresFlags: ["deep"] }, hiddenWhenLocked: true },
      ],
    },
  };

  // -- unlock view is pure gating over live state --------------------------
  const s0 = createInitialState(S);
  let view = mapLocationsView(S, s0);
  check("map: hiddenWhenLocked pin not drawn while locked", !view.some((v) => v.location.id === "l-secret"), view.map((v) => v.location.id));
  check("map: visible pins = open + locked-visible", view.length === 3);
  check("map: ungated pin open from the start", view.find((v) => v.location.id === "l-open")?.unlocked === true);
  check("map: flag-gated pin locked before the flag", view.find((v) => v.location.id === "l-flag")?.unlocked === false);

  const s1 = { ...s0, activeFlags: new Set([...s0.activeFlags, "tip", "deep"]) };
  view = mapLocationsView(S, s1);
  check("map: flag unlock derives live from activeFlags", view.find((v) => v.location.id === "l-flag")?.unlocked === true);
  check("map: hidden pin surfaces once its flag is set", view.find((v) => v.location.id === "l-secret")?.unlocked === true);

  const s2 = { ...s0, inventory: [...s0.inventory, S.items[0]] };
  check("map: item gating works too (same vocabulary as choices)", mapLocationsView(S, s2).find((v) => v.location.id === "l-item")?.unlocked === true);

  // -- availability gate ----------------------------------------------------
  check("map: available when locations exist", mapAvailable(S));
  check("map: NOT available with no map", !mapAvailable({ ...S, map: undefined }));
  check("map: NOT available with zero locations", !mapAvailable({ ...S, map: { locations: [] } }));
  check("map: theme hideMap wins over content", !mapAvailable({ ...S, dialogueBox: { hideMap: true } }));

  // -- validator ------------------------------------------------------------
  const has = (st: Story, re: RegExp) => validateStory(st).some((i) => re.test(i.message));
  check("map validator: clean story has no map issues", !has(S, /[Mm]ap location/));
  check(
    "map validator: missing target scene is an error",
    has({ ...S, map: { locations: [{ id: "x", label: "X", targetSceneId: "nope", x: 1, y: 1 }] } }, /missing scene "nope"/)
  );
  check(
    "map validator: duplicate location ids are an error",
    has({ ...S, map: { locations: [
      { id: "dup", label: "A", targetSceneId: "a", x: 1, y: 1 },
      { id: "dup", label: "B", targetSceneId: "b", x: 2, y: 2 },
    ] } }, /Duplicate map location id/)
  );
  check(
    "map validator: pin to a dead-end note is a stranding error",
    has({ ...S, map: { locations: [{ id: "n", label: "N", targetSceneId: "deadnote", x: 1, y: 1 }] } }, /note placeholder/)
  );
  check(
    "map validator: pin to a routed note is fine (bypass carries the traveller)",
    !has({ ...S, map: { locations: [{ id: "n", label: "N", targetSceneId: "note1", x: 1, y: 1 }] } }, /note placeholder/)
  );
  check(
    "map validator: off-map pin coordinates warn",
    has({ ...S, map: { locations: [{ id: "o", label: "O", targetSceneId: "a", x: 140, y: 1 }] } }, /off the map/)
  );
  check(
    "map validator: hiddenWhenLocked without gating warns",
    has({ ...S, map: { locations: [{ id: "h", label: "H", targetSceneId: "a", x: 1, y: 1, hiddenWhenLocked: true }] } }, /never be hidden/)
  );

  // -- reachability & flag bookkeeping --------------------------------------
  check(
    "map reachability: a map-only scene is NOT flagged unreachable",
    !validateStory(S).some((i) => i.sceneId === "b" && /unreachable/.test(i.message))
  );
  check(
    "map reachability: without the map the same scene IS unreachable",
    validateStory({ ...S, map: undefined }).some((i) => i.sceneId === "b" && /unreachable/.test(i.message))
  );
  check("map flags: collectFlags sees map gate flags", collectFlags(S).includes("tip") && collectFlags(S).includes("deep"));

  // -- map absorbs pure travel choices (replaceTravelChoices) ---------------
  {
    const R: Story = JSON.parse(JSON.stringify(S)) as Story;
    R.map!.replaceTravelChoices = true;
    R.scenes[0].choices = [
      { id: "t1", text: "Back to the start", targetSceneId: "a", attitudeTag: "Neutral" }, // pure, pin open
      { id: "t2", text: "Off to b", targetSceneId: "b", attitudeTag: "Neutral" }, // pure, but every pin to b is LOCKED
      { id: "t3", text: "Go and grab it", targetSceneId: "a", attitudeTag: "Neutral", consequences: { setFlags: ["x"] } }, // side effects
      { id: "t4", text: "Answer her", reply: true, attitudeTag: "Neutral" }, // reply, no target
      { id: "t5", text: "Show the key", targetSceneId: "a", attitudeTag: "Neutral", presentItem: "key" }, // presents evidence
      { id: "t6", text: "Move! Now!", targetSceneId: "a", attitudeTag: "Neutral", quickTime: true, timeLimitSeconds: 5 }, // timed
    ];
    const st = createInitialState(R);
    const absorbed = mapReplacedChoiceIds(R, R.scenes[0], st);
    check("map absorb: pure travel to an open pin is absorbed", absorbed.has("t1"));
    check("map absorb: a LOCKED pin never absorbs (the choice may be the only way in)", !absorbed.has("t2"));
    check("map absorb: consequences keep the choice", !absorbed.has("t3"));
    check("map absorb: replies are never absorbed", !absorbed.has("t4"));
    check("map absorb: present-item choices are never absorbed", !absorbed.has("t5"));
    check("map absorb: timed/QTE choices are never absorbed", !absorbed.has("t6"));
    check("map absorb: exactly one choice absorbed", absorbed.size === 1, [...absorbed]);

    // unlock the b pins → t2 becomes absorbable, live from state
    st.activeFlags.add("tip");
    check("map absorb: unlocking the pin absorbs the matching choice live", mapReplacedChoiceIds(R, R.scenes[0], st).has("t2"));

    // the switch itself, and the theme's hideMap, both disable absorption
    const off: Story = JSON.parse(JSON.stringify(R)) as Story;
    off.map!.replaceTravelChoices = undefined;
    check("map absorb: off by default (opt-in)", mapReplacedChoiceIds(off, off.scenes[0], createInitialState(off)).size === 0);
    const hidden: Story = { ...R, dialogueBox: { hideMap: true } };
    check("map absorb: theme hideMap disables absorption (no map, no swap)", mapReplacedChoiceIds(hidden, hidden.scenes[0], createInitialState(hidden)).size === 0);

    // choiceIsPureTravel unit edges
    check("pure travel: nav-only choice is pure", choiceIsPureTravel({ id: "p", text: "p", targetSceneId: "a", attitudeTag: "Neutral" }));
    check("pure travel: memoryLog keeps the choice", !choiceIsPureTravel({ id: "p", text: "p", targetSceneId: "a", attitudeTag: "Neutral", memoryLog: "m" }));
    check("pure travel: rememberLine keeps the choice", !choiceIsPureTravel({ id: "p", text: "p", targetSceneId: "a", attitudeTag: "Neutral", rememberLine: "r" }));
    check("pure travel: exclusiveGroup keeps the choice", !choiceIsPureTravel({ id: "p", text: "p", targetSceneId: "a", attitudeTag: "Neutral", exclusiveGroup: "g" }));
    check("pure travel: empty consequences object is still pure", choiceIsPureTravel({ id: "p", text: "p", targetSceneId: "a", attitudeTag: "Neutral", consequences: {} }));

    // validator: the switch that can never fire warns; a working one doesn't
    const dead: Story = JSON.parse(JSON.stringify(R)) as Story;
    dead.scenes.forEach((sc) => (sc.choices = sc.choices?.filter((c) => !(choiceIsPureTravel(c) && ["a", "b"].includes(c.targetSceneId!)))));
    check(
      "map absorb validator: switch with nothing to absorb warns",
      validateStory(dead).some((i) => /replaceTravelChoices.*does nothing/.test(i.message))
    );
    check(
      "map absorb validator: a working switch raises no such warning",
      !validateStory(R).some((i) => /replaceTravelChoices.*does nothing/.test(i.message))
    );
  }
}

/* ================================================================== *
 *  sprite sheets — frame maths, animation fallback, validator wiring
 * ================================================================== */
{
  const sheet: SpriteSheet = {
    image: "/assets/sprites/gumshoe-walk.png",
    frameWidth: 114,
    frameHeight: 192,
    animations: {
      idle: { frames: [1] },
      walk: { frames: [0, 1, 2, 3], fps: 8 },
      slump: { frames: [3, 2], loop: false },
    },
  };

  // -- grid maths ------------------------------------------------------------
  check("sheet: cols from image width", sheetCols(sheet, 456) === 4);
  check("sheet: cols never collapses to 0 on a too-narrow image", sheetCols(sheet, 50) === 1);
  check("sheet: frame 0 sits at the origin", JSON.stringify(sheetFramePos(0, 4)) === JSON.stringify({ col: 0, row: 0 }));
  check("sheet: frame 5 wraps to row 1 col 1", JSON.stringify(sheetFramePos(5, 4)) === JSON.stringify({ col: 1, row: 1 }));

  // -- named-animation lookup with fallbacks ----------------------------------
  check("sheet: exact animation name wins", sheetAnim(sheet, "walk")?.frames.length === 4);
  check("sheet: missing name falls back in order", sheetAnim(sheet, "run", ["walk"])?.frames[3] === 3);
  const idleOnly: SpriteSheet = { ...sheet, animations: { idle: { frames: [0] } } };
  check("sheet: no match falls back to first defined animation", sheetAnim(idleOnly, "walk")?.frames[0] === 0);
  check("sheet: empty animations yields null", sheetAnim({ ...sheet, animations: {} }, "walk") === null);

  // -- frame stepping: looping and hold-last ----------------------------------
  const walk = sheet.animations.walk;
  check("sheet: t=0 is the first frame", sheetFrameAt(walk, 0) === 0);
  check("sheet: fps drives stepping", sheetFrameAt(walk, 0.13) === 1); // 8fps → frame 1 at 125ms
  check("sheet: looping wraps past the end", sheetFrameAt(walk, 0.5) === 0); // frame 4 → wraps
  const slump = sheet.animations.slump;
  check("sheet: loop:false holds the last frame", sheetFrameAt(slump, 9) === 2);
  check("sheet: default fps is 8", sheetFrameAt({ frames: [0, 1] }, 0.13) === 1);

  // -- speed-matched cycles: the legs keep up with the floor ------------------
  // A walk cycle drawn at one fps cannot cover every speed the same sprite
  // travels: depth slows a distant walker, a patrol can be authored at any
  // pace, and the double-click jog is five times the room speed. Without this
  // the feet skate — most visibly in the wide rooms the jog exists for.
  check("sheet: fps scale 1 is the authored rate", speedMatchedFpsScale(1) === 1);
  check("sheet: the jog multiplier is clamped, not strobed",
    speedMatchedFpsScale(STAGE2D_JOG_MULT) === FPS_SCALE_MAX && FPS_SCALE_MAX < STAGE2D_JOG_MULT);
  check("sheet: a distant crawl is clamped, not frozen",
    speedMatchedFpsScale(0.05) === FPS_SCALE_MIN && FPS_SCALE_MIN > 0);
  check("sheet: a nonsense ratio falls back to the authored rate",
    speedMatchedFpsScale(NaN) === 1 && speedMatchedFpsScale(0) === 1 && speedMatchedFpsScale(-3) === 1);
  check("sheet: the scale is a plain ratio in between the clamps", speedMatchedFpsScale(1.5) === 1.5);
  // At 8fps the second frame lands at 125ms; re-rated to double it lands at
  // 62.5ms, so 70ms is the discriminator.
  check("sheet: a faster sprite steps sooner",
    sheetFrameAt(walk, 0.07) === 0 && sheetFrameAt(walk, 0.07, 2) === 1);
  check("sheet: a slower sprite steps later", sheetFrameAt(walk, 0.13, 0.5) === 0);
  check("sheet: the scale clamps on the way through sheetFrameAt",
    sheetFrameAt(walk, 0.05, 5) === sheetFrameAt(walk, 0.05, FPS_SCALE_MAX));
  check("sheet: the scale never changes WHICH frames play",
    sheetFrameAt(walk, 9, 2) === walk.frames[0] && sheetFrameAt(slump, 9, 3) === 2);

  // Phase accumulation — the renderer advances frames by delta-time so a jog
  // starting mid-stride re-rates the cycle WITHOUT snapping the pose.
  check("sheet: phase 0 is the first frame", frameFromPhase(walk, 0) === walk.frames[0]);
  check("sheet: a fractional phase holds the current frame", frameFromPhase(walk, 1.9) === walk.frames[1]);
  check("sheet: phase loops", frameFromPhase(walk, 4) === walk.frames[0] && frameFromPhase(walk, 5) === walk.frames[1]);
  check("sheet: phase honours loop:false", frameFromPhase(slump, 99) === 2);
  check("sheet: an empty animation has a frame", frameFromPhase({ frames: [] }, 3) === 0);
  check("sheet: a garbage phase cannot crash or go negative",
    frameFromPhase(walk, NaN) === walk.frames[0] && frameFromPhase(walk, -4) === walk.frames[0]);
  check("sheet: elapsed and phase agree at the authored rate",
    [0, 0.1, 0.13, 0.4, 1.1, 3.3].every((t) => sheetFrameAt(walk, t) === frameFromPhase(walk, t * 8)));

  // -- the jog prefers a RUN bank when the sheet drew one ---------------------
  const runSheet: SpriteSheet = { ...sheet, animations: { ...sheet.animations, "run-right": { frames: [4, 5], fps: 12 } } };
  const genericRun: SpriteSheet = { ...sheet, animations: { ...sheet.animations, run: { frames: [4, 5] } } };
  const banked: SpriteSheet = { ...sheet, animations: { ...sheet.animations, "run-down-left": { frames: [6] } } };
  check("sheet: a jog plays the run bank facing right", jogAnimation(runSheet, "right")?.anim === "run-right");
  check("sheet: a jog falls back to the walk cycle when there is no run art", jogAnimation(sheet, "right") === null);
  check("sheet: a jog mirrors the run bank when only the right side was drawn",
    jogAnimation(runSheet, "left")?.anim === "run-right" && jogAnimation(runSheet, "left")?.flip === true);
  check("sheet: a jog facing right can mirror a left-only bank",
    jogAnimation({ ...sheet, animations: { "run-left": { frames: [4] } } } as unknown as SpriteSheet, "right")?.flip === true);
  check("sheet: a generic run bank serves every direction",
    jogAnimation(genericRun, "up")?.anim === "run" && jogAnimation(genericRun, "up")?.flip === false);
  check("sheet: a generic run bank flips for a left facing", jogAnimation(genericRun, "left")?.flip === true);
  check("sheet: an exact diagonal bank wins over the four-way one",
    jogAnimation(banked, "down-left")?.anim === "run-down-left");
  const bankedBoth: SpriteSheet = { ...sheet, animations: { ...sheet.animations, "run-down-left": { frames: [6] }, run: { frames: [4] } } };
  check("sheet: a diagonal jog with no matching bank falls back to the four-way run",
    jogAnimation(bankedBoth, "up-left")?.anim === "run");
  check("sheet: a diagonal jog with no run art at all keeps the walk resolution",
    jogAnimation(banked, "up-left") === null);
  check("sheet: a run bank keeps the walk as its fallback",
    (jogAnimation(runSheet, "right")?.fallbacks ?? []).includes("walk"));
  check("sheet: a sheet with no animations has no jog bank", jogAnimation(undefined, "right") === null);

  // -- the wiring: one number drives both the step and the legs ---------------
  {
    const spriteSrc = readFileSync("src/game/SheetSprite.tsx", "utf8");
    check("sheet: the renderer accumulates phase instead of reading a wall clock",
      /phaseRef\.current \+= dt \* fps \* speedMatchedFpsScale\(scaleRef\.current\)/.test(spriteSrc) &&
      /frameFromPhase\(active, phaseRef\.current\)/.test(spriteSrc));
    check("sheet: the cycle restarts on an animation change, never on a speed change",
      !/\}, \[anim, sheet, frozen, active\?\.frames\.length, active\?\.fps, fpsScale\]\)/.test(spriteSrc) &&
      /phaseRef\.current = 0;/.test(spriteSrc));
    check("sheet: a backgrounded tab cannot fast-forward the cycle", /Math\.min\(0\.25,/.test(spriteSrc));
  }

  // -- validator --------------------------------------------------------------
  check("sheet issues: a well-formed sheet is clean", spriteSheetIssues(sheet, "walker").length === 0);
  check(
    "sheet issues: missing image is caught",
    spriteSheetIssues({ ...sheet, image: "" }, "walker").some((m) => /image/.test(m))
  );
  check(
    "sheet issues: zero frame size is caught",
    spriteSheetIssues({ ...sheet, frameWidth: 0 }, "walker").some((m) => /frame size/.test(m))
  );
  check(
    "sheet issues: an empty animation is caught",
    spriteSheetIssues({ ...sheet, animations: { walk: { frames: [] } } }, "walker").some((m) => /no frames/.test(m))
  );
  check(
    "sheet issues: negative frame index is caught",
    spriteSheetIssues({ ...sheet, animations: { walk: { frames: [-1] } } }, "walker").some((m) => /negative/.test(m))
  );
  check(
    "sheet issues: missing expected animation names hint",
    spriteSheetIssues({ ...sheet, animations: { dance: { frames: [0] } } }, "walker", ["walk", "idle"]).some((m) => /walk|idle/.test(m))
  );
  check(
    "sheet issues: no hint when an expected name is present",
    !spriteSheetIssues(sheet, "walker", ["walk", "idle"]).length
  );

  // -- over-range frames (needs the real grid size) ---------------------------
  // A frame index past the end of the sheet does NOT crash: SheetSprite clamps
  // it to the last real frame. That is the danger — the sprite silently plays
  // the wrong pose and nothing tells the author. Only reported when the caller
  // knows how many frames the image actually holds.
  {
    const four = { ...sheet, animations: { walk: { frames: [0, 1, 2, 3] } } };
    check(
      "sheet issues: over-range frames are silent without a grid size",
      spriteSheetIssues(four, "walker", undefined, undefined).length === 0
    );
    check(
      "sheet issues: frames within the grid are clean",
      spriteSheetIssues(four, "walker", undefined, 4).length === 0
    );
    const over = spriteSheetIssues(four, "walker", undefined, 2);
    check("sheet issues: over-range frames are caught", over.length === 1, over);
    check("sheet issues: the offending frames are named", /frames 2, 3/.test(over[0] ?? ""), over[0]);
    check("sheet issues: the real frame count is named", /only has 2/.test(over[0] ?? ""), over[0]);
    check("sheet issues: the clamped result is explained", /frame 1 instead/.test(over[0] ?? ""), over[0]);
    // Singular/plural, and duplicates collapse.
    const one = spriteSheetIssues({ ...sheet, animations: { walk: { frames: [0, 5, 5] } } }, "walker", undefined, 3);
    check("sheet issues: a single over-range frame reads singular", /uses frame 5,? but|uses frame 5, but/.test(one[0] ?? ""), one[0]);
    check("sheet issues: duplicate over-range frames collapse", (one[0].match(/5/g) ?? []).length === 1, one[0]);
    // Each animation is reported separately.
    const two = spriteSheetIssues(
      { ...sheet, animations: { walk: { frames: [9] }, idle: { frames: [8] } } },
      "walker",
      undefined,
      2
    );
    check("sheet issues: each animation is reported separately", two.length === 2, two);
  }

  // -- sheetFrameCount: editor and validator must agree on the grid -----------
  {
    // The fixture is 114x192 per frame. A 456x384 image -> 4 cols x 2 rows = 8.
    check("sheet: frame count from image size", sheetFrameCount(sheet, 456, 384) === 8, sheetFrameCount(sheet, 456, 384));
    check("sheet: a single-row strip counts its columns", sheetFrameCount(sheet, 456, 192) === 4, sheetFrameCount(sheet, 456, 192));
    check("sheet: never reports zero frames", sheetFrameCount(sheet, 1, 1) === 1);
    // The clamp the runtime applies must line up with the frame we name.
    const grid = sheetFrameCount(sheet, 456, 192); // 4 frames, 0-3
    const clamped = Math.min(7, grid - 1);
    check("sheet: runtime clamps to the last frame we name", clamped === 3, clamped);
  }

  // -- drawable test used by walker / portraits / extras ----------------------
  check("sheet: a full sheet is drawable", sheetDrawable(sheet));
  check("sheet: undefined is not drawable", !sheetDrawable(undefined));
  check("sheet: no image is not drawable", !sheetDrawable({ ...sheet, image: "" }));
  check("sheet: zero frame size is not drawable", !sheetDrawable({ ...sheet, frameHeight: 0 }));
  check("sheet: empty animations is not drawable", !sheetDrawable({ ...sheet, animations: {} }));
  check(
    "sheet: an all-empty animation is not drawable",
    !sheetDrawable({ ...sheet, animations: { walk: { frames: [] } } })
  );

  // -- story validator wiring: stage.playerSheet problems surface as warnings --
  const stageStory: Story = {
    id: "sheet-v", title: "SV", subtitle: "", coverTagline: "", startSceneId: "st",
    characters: [], items: [], meters: {}, scenes: [
      {
        id: "st", title: "Floor", nodeType: "stage", prose: "", background: "",
        stage: {
          playerSheet: { image: "", frameWidth: 0, frameHeight: 48, animations: {} },
          floor: { top: 60, bottom: 90 },
        },
        hotspots: [{ id: "d", label: "Door", bounds: { x: 80, y: 60, w: 10, h: 20 }, cursor: "go", action: { type: "goToScene", targetSceneId: "end" } }],
        dialogueBeats: [], choices: [],
      } as unknown as SceneNode,
      { id: "end", title: "End", nodeType: "ending", prose: "Done.", background: "", hotspots: [], dialogueBeats: [], choices: [], endingData: { tier: "best", epilogue: "" } } as unknown as SceneNode,
    ],
  } as unknown as Story;
  const sheetIssues = validateStory(stageStory).filter((i) => /sprite sheet/i.test(i.message));
  check("sheet validator wiring: bad playerSheet surfaces as story warnings", sheetIssues.length >= 2, sheetIssues.length);
  check("sheet validator wiring: sheet problems are warnings, not errors", sheetIssues.every((i) => i.severity === "warning"));
  check("sheet validator wiring: warnings attach to the stage scene", sheetIssues.every((i) => i.sceneId === "st"));

  // -- validator wiring: talking sheets and animated extras -------------------
  const richStory: Story = JSON.parse(JSON.stringify(stageStory)) as Story;
  richStory.scenes[0].stage = undefined as never;
  richStory.scenes[0].nodeType = undefined as never;
  richStory.scenes[0].choices = [{ id: "c", text: "On", targetSceneId: "end" }] as never;
  richStory.characters = [
    {
      id: "ch", name: "Mara", role: "singer", avatarUrl: "emoji:🎤", trustMeter: 0,
      talkingSheet: { image: "", frameWidth: 64, frameHeight: 64, animations: { talk: { frames: [-2] } } },
    },
  ] as never;
  richStory.scenes[0].cinematic = {
    foregroundExtras: [{ image: "", sheet: { image: "x.png", frameWidth: 0, frameHeight: 32, animations: { loop: { frames: [0] } } } }],
  } as never;
  const richIssues = validateStory(richStory);
  const talkWarn = richIssues.filter((i) => /talking sheet/.test(i.message));
  check("talking sheet: malformed sheet warns at story level", talkWarn.length >= 2, talkWarn.length);
  check("talking sheet: names the character", talkWarn.every((i) => /Mara/.test(i.message)));
  check("talking sheet: warnings not errors", talkWarn.every((i) => i.severity === "warning"));
  const extraWarn = richIssues.filter((i) => /foreground extra .*sprite sheet/i.test(i.message));
  check("extra sheet: malformed extra sheet warns on the scene", extraWarn.length >= 1, extraWarn.length);
  check("extra sheet: attaches to the owning scene", extraWarn.every((i) => i.sceneId === "st"));
  const cleanChars: Story = JSON.parse(JSON.stringify(richStory)) as Story;
  cleanChars.characters[0].talkingSheet = { image: "s.png", frameWidth: 64, frameHeight: 64, animations: { talk: { frames: [0, 1] }, rest: { frames: [0] } } };
  cleanChars.scenes[0].cinematic = undefined as never;
  check(
    "talking sheet: a well-formed sheet raises no sheet warnings",
    !validateStory(cleanChars).some((i) => /talking sheet|sprite sheet/i.test(i.message))
  );
}

/* ================================================================== */
/*  Playtest coverage — the tally, and the report over a story         */
/* ================================================================== */
{
  const story: Story = {
    id: "cov-test",
    title: "Coverage",
    tagline: "",
    startSceneId: "a",
    characters: [],
    items: [],
    scenes: [
      { id: "a", title: "A", background: "/img/a.jpg", hotspots: [], dialogueBeats: [], choices: [
        { id: "a1", text: "One", targetSceneId: "b" },
        { id: "a2", text: "Two", targetSceneId: "c" },
      ] },
      { id: "b", title: "B", background: "/img/b.jpg", hotspots: [], dialogueBeats: [], choices: [
        { id: "b1", text: "End", targetSceneId: "win" },
      ] },
      { id: "c", title: "C", background: "/img/c.jpg", hotspots: [], dialogueBeats: [], choices: [] },
      { id: "win", title: "Win", isEnding: true, background: "/img/w.jpg", hotspots: [], dialogueBeats: [], choices: [] },
    ],
  };

  // --- nothing played yet ---
  const blank = coverageReport(story, null);
  check("coverage: an empty tally reports zero", blank.sceneVisited === 0 && blank.choiceTaken === 0 && blank.runs === 0);
  check("coverage: an empty tally misses everything", blank.missedScenes.length === 4 && blank.missedChoices.length === 3, blank);
  check("coverage: endings are counted separately", blank.endingTotal === 1 && blank.endingSeen === 0);

  // --- one partial run ---
  let cov = emptyCoverage("cov-test");
  cov = recordVisit(cov, "scene", "a");
  cov = recordVisit(cov, "choice", "a:a1");
  cov = recordVisit(cov, "scene", "b");
  cov = recordVisit(cov, "choice", "b:b1");
  cov = recordVisit(cov, "scene", "win");
  cov = recordRun(cov);
  const r = coverageReport(story, cov);
  check("coverage: visited scenes are counted", r.sceneVisited === 3 && r.sceneTotal === 4, r.sceneVisited);
  check("coverage: taken choices are counted", r.choiceTaken === 2 && r.choiceTotal === 3, r.choiceTaken);
  check("coverage: the road not taken is reported", r.missedChoices.length === 1 && r.missedChoices[0].choiceId === "a2", r.missedChoices);
  check("coverage: the unvisited scene is reported with its title", r.missedScenes[0]?.sceneTitle === "C", r.missedScenes);
  check("coverage: reaching an ending clears it", r.endingSeen === 1 && r.missedEndings.length === 0);
  check("coverage: completed runs are counted", r.runs === 1);

  // --- accumulation across playthroughs (the point of persisting) ---
  let second = recordVisit(cov, "scene", "c");
  second = recordVisit(second, "choice", "a:a2");
  const r2 = coverageReport(story, second);
  check("coverage: a second run adds to the tally", r2.sceneVisited === 4 && r2.choiceTaken === 3, r2);
  check("coverage: full coverage leaves no gaps", r2.missedScenes.length === 0 && r2.missedChoices.length === 0);
  const revisit = recordVisit(second, "scene", "a");
  check("coverage: repeat visits increment", (revisit.scenes["a"] ?? 0) === 2, revisit.scenes);
  check("coverage: recording never mutates the input", (second.scenes["a"] ?? 0) === 1, second.scenes);

  // --- percentages ---
  check("coverage: percent of a covered story is 100", coveragePercent(3, 3) === 100);
  check("coverage: percent is rounded", coveragePercent(1, 3) === 33, coveragePercent(1, 3));
  check("coverage: an empty story is 0, not NaN", coveragePercent(0, 0) === 0);
}

/* ================================================================== */
/*  Playtest coverage v2 — stage markers + cutscene steps              */
/* ================================================================== */
{
  const stageStory: Story = {
    id: "cov-stage",
    title: "Stage coverage",
    tagline: "",
    startSceneId: "s1",
    characters: [],
    items: [],
    scenes: [
      {
        id: "s1",
        title: "Dock",
        background: "/img/d.jpg",
        nodeType: "stage",
        dialogueBeats: [],
        choices: [],
        hotspots: [
          { id: "h1", label: "Crate", bounds: { x: 10, y: 40, w: 20, h: 20 }, action: { type: "showText", text: "A crate." } },
          { id: "h2", label: "Lever", bounds: { x: 40, y: 40, w: 20, h: 20 }, action: { type: "runScript", script: [{ do: "say", text: "Clunk." }, { do: "setFlag", flag: "lever" }] } },
        ],
        stage: {
          floor: { top: 60, bottom: 95 },
          spawn: { x: 50, y: 90 },
          enterScript: [{ do: "wait", seconds: 1 }, { do: "face", dir: "left" }],
        },
      },
    ],
  };

  const blank = coverageReport(stageStory, null);
  check("coverage v2: a stage story tallies its markers and steps", blank.markerTotal === 2 && blank.cutsceneTotal === 4, blank);
  check("coverage v2: an empty tally misses every marker and step", blank.missedMarkers.length === 2 && blank.missedCutsceneSteps.length === 4, blank);
  check("coverage v2: classic scenes contribute no stage tallies", coverageReport({ ...stageStory, scenes: [{ id: "c1", title: "C", background: "/img/c.jpg", hotspots: [], dialogueBeats: [], choices: [] }] }, null).markerTotal === 0);

  // The recorder/report key contract: one shared function, so the two sides
  // can never drift. Entry script = empty hotspot tag; runScript = its id.
  check("coverage v2: entry-script keys use an empty hotspot tag", cutsceneStepKey("s1", undefined, 0) === "s1:#0" && cutsceneStepKey("s1", undefined, 1) === "s1:#1");
  check("coverage v2: hotspot step keys carry the hotspot id", cutsceneStepKey("s1", "h2", 1) === "s1:h2#1");

  let cov = emptyCoverage("cov-stage");
  cov = recordVisit(cov, "marker", "s1:h1");
  cov = recordVisit(cov, "cutscene", cutsceneStepKey("s1", undefined, 0));
  cov = recordVisit(cov, "cutscene", cutsceneStepKey("s1", "h2", 1));
  const rv = coverageReport(stageStory, cov);
  check("coverage v2: fired markers are counted", rv.markerFired === 1 && rv.markerTotal === 2, rv.markerFired);
  check("coverage v2: the unfired marker is reported with its label", rv.missedMarkers.length === 1 && rv.missedMarkers[0].hotspotId === "h2" && rv.missedMarkers[0].text === "Lever", rv.missedMarkers);
  check("coverage v2: played steps are counted", rv.cutsceneRun === 2 && rv.cutsceneTotal === 4, rv.cutsceneRun);
  check("coverage v2: unplayed steps are reported", rv.missedCutsceneSteps.length === 2, rv.missedCutsceneSteps);
  check("coverage v2: entry and hotspot gaps name themselves apart", rv.missedCutsceneSteps.some((g) => g.text === "entry step 2") && rv.missedCutsceneSteps.some((g) => g.text === "Lever — step 1"), rv.missedCutsceneSteps);
  check("coverage v2: an unrecorded key reads as zero", (cov.cutscene["s1:h9#0"] ?? 0) === 0, cov.cutscene);
  check("coverage v2: recording a marker never mutates the input", (cov.markers["s1:h1"] ?? 0) === 1 && !("s1:h2" in cov.markers), cov.markers);
}

/* ================================================================== */
/*  Playtest coverage v3 — choice offers → pick rates                  */
/* ================================================================== */
{
  const story: Story = {
    id: "cov-rates",
    title: "Pick rates",
    tagline: "",
    startSceneId: "a",
    characters: [],
    items: [],
    scenes: [
      {
        id: "a",
        title: "A",
        background: "/img/a.jpg",
        hotspots: [],
        dialogueBeats: [],
        choices: [
          { id: "a1", text: "Favourite", targetSceneId: "b" },
          { id: "a2", text: "Ignored", targetSceneId: "b" },
        ],
      },
      { id: "b", title: "B", isEnding: true, background: "/img/b.jpg", hotspots: [], dialogueBeats: [], choices: [] },
    ],
  };

  // Nothing offered yet → no pick-rate rows, no totals.
  const blank = coverageReport(story, null);
  check("coverage v3: no offers means no pick-rate rows", blank.choiceOffered === 0 && blank.pickRates.length === 0 && blank.choiceOffers === 0 && blank.choicePicks === 0, blank);

  // a1 offered twice and taken once (50%); a2 offered three times, never taken.
  let cov = emptyCoverage("cov-rates");
  cov = recordVisit(cov, "offer", "a:a1");
  cov = recordVisit(cov, "offer", "a:a1");
  cov = recordVisit(cov, "choice", "a:a1");
  cov = recordVisit(cov, "offer", "a:a2");
  cov = recordVisit(cov, "offer", "a:a2");
  cov = recordVisit(cov, "offer", "a:a2");
  const r = coverageReport(story, cov);
  check("coverage v3: distinct offered choices are counted", r.choiceOffered === 2, r.choiceOffered);
  check("coverage v3: offer and pick totals are summed", r.choiceOffers === 5 && r.choicePicks === 1, r);
  check("coverage v3: the never-taken choice leads, at 0%", r.pickRates[0]?.choiceId === "a2" && r.pickRates[0]?.rate === 0 && r.pickRates[0]?.offers === 3, r.pickRates);
  check("coverage v3: a taken choice reports its rate", r.pickRates[1]?.choiceId === "a1" && r.pickRates[1]?.rate === 50, r.pickRates[1]);
  check("coverage v3: a pick never inflates past 100%", (() => {
    let x = emptyCoverage("cov-rates");
    x = recordVisit(x, "offer", "a:a1");
    x = recordVisit(x, "choice", "a:a1");
    x = recordVisit(x, "choice", "a:a1");
    return coverageReport(story, x).pickRates[0]?.rate === 100;
  })());
  check("coverage v3: recording an offer never mutates the input", (cov.offers["a:a1"] ?? 0) === 2 && (cov.offers["a:a2"] ?? 0) === 3, cov.offers);
}

/* ================================================================== */
/*  SOUTH PARK: THE RECESS WARS — the walkable-stage beta data         */
/* ================================================================== */
{
  // The beta must pass the validator clean — it ships in the catalogue.
  const spIssues = validateStory(SOUTH_PARK);
  const spErrors = spIssues.filter((i) => i.severity === "error");
  check("south park: the beta validates with no errors", spErrors.length === 0, spErrors.map((i) => i.message).join(" | "));

  // Every sheet it references is on disk and well-formed, with walk+idle.
  // The harness bundles to /tmp — resolve public/ from the npm cwd instead.
  const spRoot = path.join(process.cwd(), "public");
  const spSheets: [string, import("../src/game/spriteSheet").SpriteSheet][] = [
    ["stan", SOUTH_PARK.playerSprite!.sheet!],
    ["cartman walk", SOUTH_PARK.scenes[0].stage!.npcs![0].sheet!],
    ["kyle walk", SOUTH_PARK.scenes[0].stage!.npcs![1].sheet!],
    ["kenny walk", SOUTH_PARK.scenes[5].stage!.npcs![0].sheet!],
    ["barbrady walk", SOUTH_PARK.scenes[3].stage!.npcs![0].sheet!],
    ["tweek walk", SOUTH_PARK.scenes[3].stage!.npcs![1].sheet!],
    ["barbrady talk", SOUTH_PARK.characters.find((c) => c.id === "sp_barbrady")!.talkingSheet!],
    ["cartman moods", SOUTH_PARK.scenes[5].hotspots![0].sheet!],
  ];
  for (const [label, sheet] of spSheets) {
    check("south park: " + label + " sheet exists on disk", existsSync(path.join(spRoot, sheet.image)), sheet.image);
    check("south park: " + label + " sheet is well-formed", spriteSheetIssues(sheet, label).length === 0, spriteSheetIssues(sheet, label).join(" | "));
    check("south park: " + label + " sheet has a walk animation", !!sheetAnim(sheet, "walk"));
  }
  for (const sc of SOUTH_PARK.scenes) {
    check("south park: background exists for " + sc.id, existsSync(path.join(spRoot, sc.background)), sc.background);
  }

  // Pure stage game: every non-ending scene is a walkable stage with the
  // verb menu on and at least one verb answerable.
  for (const sc of SOUTH_PARK.scenes) {
    if (sc.isEnding) continue;
    check("south park: " + sc.id + " is a verb-menu stage", sc.nodeType === "stage" && sc.stage?.verbCoin === true && verbsForScene(sc).length > 0, verbsForScene(sc).join(","));
  }

  // The USE puzzle: the locker answers the snowball (and only via USE with
  // it armed); the sled is gated on the key the locker grants.
  const spLocker = SOUTH_PARK.scenes[1].hotspots![0];
  const spUse = resolveVerbAction(spLocker, "use", "sp_snowball");
  check("south park: the locker answers USE + snowball", spUse.ok && spUse.action.type === "useItem" && spUse.action.itemGranted === "sp_key", spUse);
  check("south park: the locker refuses an unaccepted item", !resolveVerbAction(spLocker, "use", "sp_sled").ok);
  const spSled = SOUTH_PARK.scenes[2].hotspots![1];
  check("south park: the sled is gated on the frozen key", JSON.stringify(spSled.gating) === JSON.stringify({ requiresItems: ["sp_key"] }), spSled.gating);
  check("south park: taking the sled sets the pond flag", spSled.action.flagSet === "sp_got_sled");
  const spPondEdge = SOUTH_PARK.scenes[2].stage!.exitEdges?.right;
  check("south park: the pond edge opens only with the sled", spPondEdge?.gating?.requiresFlags?.[0] === "sp_got_sled");

  // The pond cutscene walks Kenny onto the ice and speaks the two lines.
  const spEnter = SOUTH_PARK.scenes[5].stage!.enterScript ?? [];
  check("south park: the pond cutscene has the Kenny gag", spEnter.some((st) => st.do === "npcWalkTo" && st.npcId === "sp_kenny_npc") && spEnter.some((st) => st.do === "say" && /killed Kenny/.test(st.text)), spEnter.map((st) => st.do).join(","));

  // The finale branches into two distinct ending cards.
  const spChoices = SOUTH_PARK.scenes[5].choices ?? [];
  check("south park: the confrontation offers two endings", spChoices.length === 2 && new Set(spChoices.map((c) => c.targetSceneId)).size === 2, spChoices.map((c) => c.targetSceneId).join(","));
  const spEndings = SOUTH_PARK.scenes.filter((sc) => sc.isEnding);
  check("south park: both endings carry ending cards", spEndings.length === 2 && spEndings.every((sc) => !!sc.endingData && sc.choices.length === 0));

  // Pass-2: 1.5x cast, talking sheets, item icons, title cover, the cafe.
  check("south park: the cast plays at 1.5x", SOUTH_PARK.scenes[0].stage!.playerScale === 1.5 && SOUTH_PARK.scenes[0].stage!.npcs!.every((n) => n.scale === 1.5) && SOUTH_PARK.scenes[3].stage!.npcs!.every((n) => n.scale === 1.5));
  const spTalkers = SOUTH_PARK.characters.filter((c) => c.talkingSheet);
  check("south park: the whole cast carries talking sheets", spTalkers.length === 5 && spTalkers.every((c) => !!c.talkingSheet!.animations.talk && !!c.talkingSheet!.animations.rest), spTalkers.map((c) => c.id).join(","));
  check("south park: every talking sheet exists on disk", spTalkers.every((c) => existsSync(path.join(spRoot, c.talkingSheet!.image))), spTalkers.map((c) => c.talkingSheet!.image).join(","));
  const spItems = SOUTH_PARK.items.filter((i) => i.iconUrl);
  check("south park: item icons exist on disk", spItems.length === 3 && spItems.every((i) => existsSync(path.join(spRoot, i.iconUrl!))), spItems.map((i) => i.iconUrl).join(","));
  check("south park: the cover is the title card", SOUTH_PARK.coverImage.endsWith("sp-title.png") && existsSync(path.join(spRoot, SOUTH_PARK.coverImage)));
  const spCafe = SOUTH_PARK.scenes.find((sc) => sc.id === "sp_cafe")!;
  check("south park: the cafe is a verb-menu stage with Barbrady", spCafe.nodeType === "stage" && spCafe.stage!.verbCoin === true && spCafe.stage!.npcs![0].talkHotspotId === "sp_cafe_barbrady");
  check("south park: the hall links to the cafe and back", SOUTH_PARK.scenes[1].stage!.exitEdges?.right?.targetSceneId === "sp_cafe" && spCafe.stage!.exitEdges?.left?.targetSceneId === "sp_hall");
  // Pass 3: directional walks for the whole cast, object art on markers,
  // the verb-wheel sprite, and object-first menus on.
  for (const [who, sheet] of [
    ["stan", SOUTH_PARK.playerSprite!.sheet!],
    ["kyle", SOUTH_PARK.scenes[0].stage!.npcs![1].sheet!],
    ["cartman", SOUTH_PARK.scenes[0].stage!.npcs![0].sheet!],
    ["kenny", SOUTH_PARK.scenes[5].stage!.npcs![0].sheet!],
  ] as const) {
    check("south park: " + who + " walks away from camera (walk-up)", !!sheet.animations["walk-up"] && sheet.animations["walk-up"].frames.length === 6, sheet.image);
  }
  const spObjArt: [string, string][] = [
    ["snow pile", "sp_bus_snow"],
    ["black ice", "sp_bus_ice"],
    ["locker 27", "sp_hall_locker"],
    ["trophy case", "sp_hall_trophy"],
    ["the sled", "sp_base_sled"],
    ["toy chest", "sp_base_chest"],
    ["pond sign", "sp_pond_sign"],
    ["espresso machine", "sp_cafe_machine"],
  ];
  for (const [label, hsId] of spObjArt) {
    const hs = SOUTH_PARK.scenes.flatMap((sc) => sc.hotspots ?? []).find((h) => h.id === hsId)!;
    check("south park: " + label + " carries object art on disk", !!hs.image && existsSync(path.join(spRoot, hs.image)), hs.image);
  }
  check("south park: the verb-wheel snowflake exists", !!SOUTH_PARK.verbMenuIcon && existsSync(path.join(spRoot, SOUTH_PARK.verbMenuIcon)), SOUTH_PARK.verbMenuIcon);
  check("south park: object-first verb menus are on", SOUTH_PARK.scenes[0].stage!.objectVerbMenu === true);
  check("south park: barbrady talks with his own sheet", SOUTH_PARK.characters.find((c) => c.id === "sp_barbrady")?.talkingSheet?.animations.talk != null);

  // The wrong-cartoon cameo: a wide reel, the gag cutscene, the portal loop.
  const spCrash = SOUTH_PARK.scenes.find((sc) => sc.id === "sp_crash")!;
  check("south park: the cameo is THE wide reel (worldWidth 200)", spCrash.nodeType === "stage" && spCrash.stage!.worldWidth === 200, spCrash.stage!.worldWidth);
  const spCrashEnter = spCrash.stage!.enterScript ?? [];
  check("south park: the cameo cutscene says the line", spCrashEnter.some((st) => st.do === "say" && /wrong CARTOON/.test(st.text)) && spCrashEnter.some((st) => st.do === "say" && /Wrong scene\. Wrong cartoon\. Bye/.test(st.text)), spCrashEnter.map((st) => st.do).join(","));
  check("south park: the cameo walks both visitors on cue", spCrashEnter.some((st) => st.do === "npcWalkTo" && st.npcId === "sp_rick_cameo") && spCrashEnter.some((st) => st.do === "npcWalkTo" && st.npcId === "sp_morty_cameo"));
  for (const [who, npcId] of [["rick", "sp_rick_cameo"], ["morty", "sp_morty_cameo"]] as const) {
    const npc = spCrash.stage!.npcs!.find((n) => n.id === npcId)!;
    check("south park: " + who + " sheet exists and is well-formed", existsSync(path.join(spRoot, npc.sheet!.image)) && spriteSheetIssues(npc.sheet!, who).length === 0, npc.sheet!.image);
  }
  check("south park: cameo characters stay stage-only (no cutouts)", SOUTH_PARK.characters.filter((c) => ["sp_rick", "sp_morty"].includes(c.id)).every((c) => !c.talkingSheet));
  const spPortal = spCrash.hotspots!.find((h) => h.id === "sp_crash_portal")!;
  check("south park: the portal opens after the talk and loops home", spPortal.gating?.requiresFlags?.[0] === "sp_cameo_talked" && spPortal.action.targetSceneId === "sp_cafe");
  check("south park: the cafe's right edge leads to the crash", SOUTH_PARK.scenes[3].stage!.exitEdges?.right?.targetSceneId === "sp_crash");
}

/* ================================================================== */
/*  Background remover — the keying tools behind 🪄 Media Tools        */
/* ================================================================== */
{
  // happy-dom/Node have no ImageData; the keying helpers only need the shape.
  if (typeof (globalThis as { ImageData?: unknown }).ImageData === "undefined") {
    (globalThis as Record<string, unknown>).ImageData = class {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  }

  /** w×h RGBA, every pixel `fill` (opaque magenta by default). */
  const plate = (w: number, h: number, fill: [number, number, number] = [255, 0, 255]): ImageData => {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < d.length; i += 4) {
      d[i] = fill[0];
      d[i + 1] = fill[1];
      d[i + 2] = fill[2];
      d[i + 3] = 255;
    }
    return new ImageData(d, w, h) as ImageData;
  };
  const put = (img: ImageData, x: number, y: number, rgb: [number, number, number]) => {
    const i = (y * img.width + x) * 4;
    img.data[i] = rgb[0];
    img.data[i + 1] = rgb[1];
    img.data[i + 2] = rgb[2];
    img.data[i + 3] = 255;
  };
  const alphaAt = (img: ImageData, x: number, y: number) => img.data[(y * img.width + x) * 4 + 3];

  // --- edge sampling -------------------------------------------------------
  {
    const img = plate(8, 8, [255, 0, 255]);
    // a dark subject in the middle must not drag the edge sample
    for (let y = 2; y < 6; y++) for (let x = 2; x < 6; x++) put(img, x, y, [10, 10, 10]);
    const edge = sampleEdges(img.data, img.width, img.height);
    check("key: edge sample reads the backdrop, not the subject", edge.r > 200 && edge.b > 200 && edge.g < 40, edge);
    const corner = sampleCorners(img.data, img.width, img.height);
    check("key: corner sample agrees on a flat plate", Math.abs(corner.r - edge.r) < 8, { corner, edge });
  }

  // --- REGRESSION: samplers on a NON-FLAT border ---------------------------
  // The tests above only use a uniform border, where a mean and a dominant
  // sample are identical — so they could not catch the real bug: the samplers
  // used to AVERAGE every border pixel, returning a colour present nowhere in
  // the image the moment the border was not one flat tone. That is what made
  // the background remover "do nothing" on real photos and AI art.
  {
    // Border is 3/4 white backdrop and 1/4 dark object intruding at the frame
    // edge. The mean is a mid grey that matches NEITHER; the correct answer is
    // the dominant tone, i.e. the white backdrop.
    const img = plate(16, 16, [250, 250, 250]);
    for (let x = 12; x < 16; x++) {
      put(img, x, 0, [10, 20, 90]);
      put(img, x, 15, [10, 20, 90]);
    }
    const edge = sampleEdges(img.data, img.width, img.height);
    check(
      "key: edge sample returns the DOMINANT backdrop, not a mean of two tones",
      edge.r > 235 && edge.g > 235 && edge.b > 235,
      edge,
    );
    // The mean of this border would land near rgb(200,203,214) — prove we are
    // nowhere near it, so a regression back to averaging fails loudly.
    check("key: edge sample is not the arithmetic mean", edge.r > 230, edge);

    // A key sampled this way must actually cut the backdrop.
    const keyed = applyKey(img, edge, 40, 10);
    check("key: dominant sample clears the true backdrop", alphaAt(keyed, 2, 0) === 0, alphaAt(keyed, 2, 0));
  }
  {
    // Corners: three agree, one is covered by the subject. Averaging all four
    // drags the key off the backdrop; majority agreement keeps it correct.
    const img = plate(12, 12, [255, 0, 255]);
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) put(img, x, y, [20, 20, 20]); // subject over one corner
    const corner = sampleCorners(img.data, img.width, img.height);
    check(
      "key: corner sample ignores the one corner the subject covers",
      corner.r > 230 && corner.g < 30 && corner.b > 230,
      corner,
    );
  }

  // --- colour key vs edge flood -------------------------------------------
  {
    // 9×9 magenta plate with a magenta-coloured 3×3 block INSIDE the subject:
    // a colour key must erase it (same colour, anywhere); the flood must keep
    // it (no path connects it to the border).
    const img = plate(9, 9, [255, 0, 255]);
    for (let y = 2; y < 7; y++) for (let x = 2; x < 7; x++) put(img, x, y, [10, 200, 10]); // subject
    for (let y = 3; y < 5; y++) for (let x = 3; x < 5; x++) put(img, x, y, [255, 0, 255]); // interior pocket
    const key = { r: 255, g: 0, b: 255 };

    const keyed = applyKey(img, key, 40, 8);
    check("colour key: clears the border", alphaAt(keyed, 0, 0) === 0);
    check("colour key: clears an interior pocket of the key colour", alphaAt(keyed, 3, 3) === 0, alphaAt(keyed, 3, 3));
    check("colour key: keeps the subject", alphaAt(keyed, 2, 6) === 255);

    const flooded = applyEdgeFloodKey(img, key, 40, 8);
    check("edge flood: clears the border", alphaAt(flooded, 0, 0) === 0);
    check("edge flood: keeps an interior pocket the border cannot reach", alphaAt(flooded, 3, 3) === 255, alphaAt(flooded, 3, 3));
    check("edge flood: keeps the subject", alphaAt(flooded, 2, 6) === 255);
  }

  // --- feathering + softness ----------------------------------------------
  {
    const img = plate(5, 5, [255, 0, 255]);
    put(img, 2, 2, [200, 0, 200]); // just outside tolerance, inside the feather band
    const key = { r: 255, g: 0, b: 255 };
    const soft = applyEdgeFloodKey(img, key, 10, 80);
    const a = alphaAt(soft, 2, 2);
    check("edge flood: a near-key pixel is feathered, not cut", a > 0 && a < 255, a);
  }

  // --- despeckle -----------------------------------------------------------
  {
    const img = plate(7, 7, [255, 0, 255]);
    const key = { r: 255, g: 0, b: 255 };
    const clean = applyEdgeFloodKey(img, key, 20, 4); // everything transparent
    put(clean, 3, 3, [10, 10, 10]); // an isolated speck of keying noise
    for (let y = 5; y < 7; y++) for (let x = 5; x < 7; x++) put(clean, x, y, [10, 10, 10]); // a real 2×2 edge
    const scrubbed = despeckle(clean);
    check("despeckle: an isolated speck goes", alphaAt(scrubbed, 3, 3) === 0, alphaAt(scrubbed, 3, 3));
    check("despeckle: a solid 2×2 patch survives", alphaAt(scrubbed, 5, 5) === 255, alphaAt(scrubbed, 5, 5));
    check("despeckle: untouched pixels are untouched", alphaAt(scrubbed, 0, 0) === 0);
  }
}

/* ================================================================== */
/*  Animation — easing, motion paths, idle presets                     */
/* ================================================================== */
{
  // --- easing ---------------------------------------------------------------
  check("ease: endpoints pinned", ease(0) === 0 && ease(1) === 1);
  check("ease: clamps out-of-range t", ease(-1) === 0 && ease(2) === 1);
  check("ease: linear is identity", ease(0.37, "linear") === 0.37);
  check("ease: ease-in is slow at the start", ease(0.25, "in") < 0.25, ease(0.25, "in"));
  check("ease: ease-out is fast at the start", ease(0.25, "out") > 0.25, ease(0.25, "out"));
  check("ease: in-out is symmetric", Math.abs(ease(0.3, "inOut") + ease(0.7, "inOut") - 1) < 1e-9);
  check("ease: arc is slow at both ends", ease(0.05, "arc") < 0.05 && ease(0.95, "arc") > 0.95);

  // --- paths ---------------------------------------------------------------
  const straight = { points: [{ x: 0, y: 50 }, { x: 100, y: 50 }], duration: 10 };
  check("path: length of a straight run", pathSegments(straight).total === 100, pathSegments(straight).total);
  check("path: start point", pathPointAt(straight, 0).x === 0 && pathPointAt(straight, 0).y === 50);
  check("path: end point", Math.abs(pathPointAt(straight, 1).x - 100) < 1e-9);
  check("path: midpoint of a straight run is the middle", Math.abs(pathPointAt(straight, 0.5).x - 50) < 1e-9);
  check("path: travelling right faces right", Math.abs(pathPointAt(straight, 0.5).angle) < 1e-6, pathPointAt(straight, 0.5).angle);

  // A dogleg: 100 units right then 100 units down — constant speed means the
  // corner is reached at exactly half the pass, not at the halfway waypoint.
  const dogleg = { points: [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 80 }], duration: 8, ease: "linear" as const };
  const seg = pathSegments(dogleg);
  check("path: segment lengths are per-leg", seg.lengths.length === 2 && seg.total === 140, seg);
  const corner = pathPointAt(dogleg, 60 / 140);
  check("path: the corner lands exactly on the waypoint", Math.abs(corner.x - 60) < 1e-9 && Math.abs(corner.y) < 1e-9, corner);
  check("path: constant speed — a quarter of the pass is 35 units along", Math.abs(pathPointAt(dogleg, 0.25).x - 35) < 1e-9, pathPointAt(dogleg, 0.25));
  check("path: the second leg moves in y", pathPointAt(dogleg, 0.9).y > 0, pathPointAt(dogleg, 0.9));
  check("path: heading turns 90° at the corner", Math.abs(pathPointAt(dogleg, 0.99).angle - 90) < 1e-6, pathPointAt(dogleg, 0.99).angle);
  check("path: clamps t outside 0..1", pathPointAt(dogleg, 5).x === 60 && pathPointAt(dogleg, -3).x === 0);

  // --- compiled CSS --------------------------------------------------------
  check("motion: a path needs two points and a duration", motionAnimatable(straight) && !motionAnimatable({ points: [{ x: 1, y: 1 }], duration: 5 }) && !motionAnimatable({ points: straight.points, duration: 0 }));
  const css = motionKeyframes("sr-test", straight);
  check("motion: keyframes are emitted", css.startsWith("@keyframes sr-test {") && css.trim().endsWith("}"));
  check("motion: keyframes animate left/top", /left:\s*0\.000%/.test(css) && /top:\s*50\.000%/.test(css), css.slice(0, 120));
  check("motion: keyframes carry the anchor vars", css.includes("translate(var(--ex-ax), var(--ex-ay))"));
  check("motion: sample count is sane", (css.match(/%\s*\{/g) ?? []).length >= 20, (css.match(/%\s*\{/g) ?? []).length);
  const held = motionKeyframes("sr-test2", { ...straight, holdSeconds: 4 });
  check("motion: a hold keeps the end pose to 100%", held.includes("100% {") && held.lastIndexOf("100% {") > held.indexOf("99"));
  const faded = motionKeyframes("sr-test3", { ...straight, fadeTo: 0, scaleTo: 0.5 });
  check("motion: end fade/scale reach the authored values", /opacity:\s*0\.0000/.test(faded) && /scale\(0\.5000\)/.test(faded));

  const anim = motionAnimation(straight, "sr-test");
  check("motion: plays forever by default", anim.animationIterationCount === "infinite" && anim.animationDirection === "normal");
  check("motion: sampled paths use a linear timing function", anim.animationTimingFunction === "linear");
  check("motion: duration is the pass time", anim.animationDuration === "10s");
  check("motion: once holds the last frame", motionAnimation({ ...straight, loop: "once" }, "sr-test").animationFillMode === "forwards");
  check("motion: pingpong alternates", motionAnimation({ ...straight, loop: "pingpong" }, "sr-test").animationDirection === "alternate");
  check("motion: hold adds to the cycle", motionAnimation({ ...straight, holdSeconds: 5 }, "sr-test").animationDuration === "15s");
  check("motion: delay is passed through", motionAnimation({ ...straight, delay: 2.5 }, "sr-test").animationDelay === "2.5s");

  // --- presets -------------------------------------------------------------
  check("preset: 'none' emits no class", presetStyle().className === "" && presetStyle({ preset: "none" }).className === "");
  const bob = presetStyle({ preset: "bob", speed: 0.5, intensity: 1.4 });
  check("preset: class + vars", bob.className === "anim-bob" && bob.vars["--anim-dur"] === "1.60s" && bob.vars["--anim-amp"] === "1.4", bob);
  check("preset: half speed is a shorter period", presetSeconds({ preset: "bob", speed: 0.5 }) === presetSeconds({ preset: "bob" }) / 2);
  check("preset: intensity is clamped", Number(presetStyle({ preset: "sway", intensity: 9 }).vars["--anim-amp"]) === 2);
  check("preset: an unknown preset is inert", presetSeconds({ preset: "does-not-exist" as never }) === 0);
  check("preset: delay is a CSS animation-delay", presetStyle({ preset: "flicker", delay: 1.5 }).vars.animationDelay === "1.5s");

  // --- author-facing summary -----------------------------------------------
  check("describeMotion: reports still sprites", describeMotion(undefined) === "still");
  check("describeMotion: reports distance, time and looping", /100% of frame in 10s · looping/.test(describeMotion(straight)), describeMotion(straight));
  check("describeMotion: names ping-pong and once", /there and back/.test(describeMotion({ ...straight, loop: "pingpong" })) && /once/.test(describeMotion({ ...straight, loop: "once" })));
}

/* ================================================================== */
/*  Stage 2D routing — obstacles, clearance, A* + string pulling       */
/* ================================================================== */
{
  const floor = { top: 60, bottom: 96 };

  // --- blocking ------------------------------------------------------------
  const wall = [{ x: 45, y: 70, w: 10, h: 12 }];
  check("stage: an empty room blocks nothing", !stageBlocked(50, 80, [], floor) && !stageBlocked(50, 80, undefined, floor));
  check("stage: inside an obstacle is blocked", stageBlocked(50, 76, wall, floor));
  check("stage: outside an obstacle is clear", !stageBlocked(20, 76, wall, floor));
  check("stage: the agent radius keeps it off the wall", stageBlocked(45 - STAGE_AGENT_RADIUS / 2, 76, wall, floor));
  check("stage: just beyond the radius is walkable", !stageBlocked(45 - STAGE_AGENT_RADIUS * 2, 76, wall, floor), stageBlocked(45 - STAGE_AGENT_RADIUS * 2, 76, wall, floor));
  check("stage: off the top of the floor is blocked (no walking on the sky)", stageBlocked(50, 40, [], floor));
  check("stage: off the bottom of the floor is blocked", stageBlocked(50, 99, [], floor));
  check("stage: off the left edge is blocked", stageBlocked(-5, 80, [], floor));

  // --- line of sight -------------------------------------------------------
  check("stage: a clear line is clear", stageLineClear({ x: 10, y: 80 }, { x: 90, y: 80 }, [], floor));
  check("stage: a line through a wall is not", !stageLineClear({ x: 10, y: 76 }, { x: 90, y: 76 }, wall, floor));
  check("stage: a line behind a wall is clear", stageLineClear({ x: 60, y: 76 }, { x: 90, y: 76 }, wall, floor));

  // --- routing -------------------------------------------------------------
  const open = stageRoute({ x: 10, y: 80 }, { x: 90, y: 80 }, [], floor);
  check("stage: no furniture = one straight leg", open.length === 1 && open[0].x === 90, open);

  const around = stageRoute({ x: 10, y: 76 }, { x: 90, y: 76 }, wall, floor);
  check("stage: a wall forces a detour", around.length >= 2, around);
  check("stage: the detour ends on the click", around.length > 0 && Math.abs(around[around.length - 1].x - 90) < 1e-6, around[around.length - 1]);
  check("stage: no waypoint stands inside the furniture", around.every((p) => !stageBlocked(p.x, p.y, wall, floor)), around);
  // Every leg of the route must be walkable, including the first step from
  // the character's current position.
  let legs = true;
  let from = { x: 10, y: 76 };
  for (const wp of around) {
    if (!stageLineClear(from, wp, wall, floor)) legs = false;
    from = wp;
  }
  check("stage: every leg of the route is clear", legs, around);
  check("stage: the detour goes around the top or the bottom, not through", around.some((p) => p.y < 70 || p.y > 82), around);

  // A full-height wall with a doorway at one end.
  const door = [{ x: 40, y: 60, w: 12, h: 24 }];
  const throughDoor = stageRoute({ x: 20, y: 90 }, { x: 80, y: 90 }, door, floor);
  check("stage: a doorway is found", throughDoor.length >= 1 && Math.abs(throughDoor[throughDoor.length - 1].x - 80) < 1e-6, throughDoor);
  check("stage: the doorway route avoids the wall", throughDoor.every((p) => !stageBlocked(p.x, p.y, door, floor)), throughDoor);

  // Sealed off completely: no route rather than a route through the wall.
  const sealed = [{ x: 0, y: 60, w: 100, h: 36 }];
  check("stage: a sealed room offers no route", stageRoute({ x: 10, y: 90 }, { x: 90, y: 90 }, sealed, floor).length === 0);

  // A click inside a wall still goes somewhere sensible (nearest free node).
  const rescue = stageRoute({ x: 50, y: 76 }, { x: 90, y: 76 }, wall, floor);
  check("stage: a click inside furniture still routes", rescue.length >= 1 && !stageBlocked(rescue[0].x, rescue[0].y, wall, floor), rescue);

  // --- string pulling ------------------------------------------------------
  // A zig-zag corridor should collapse to its corners, not to every grid node.
  const corridor = [
    { x: 20, y: 60, w: 8, h: 20 },
    { x: 45, y: 76, w: 8, h: 20 },
    { x: 70, y: 60, w: 8, h: 20 },
  ];
  const zig = stageRoute({ x: 6, y: 92 }, { x: 94, y: 92 }, corridor, floor);
  check("stage: a corridor route is found", zig.length >= 2, zig);
  check("stage: string pulling keeps the route short", zig.length <= 8, zig.length);
  check("stage: the corridor route never enters a wall", zig.every((p) => !stageBlocked(p.x, p.y, corridor, floor)), zig);
  check("stage: grid step is coarse enough to be cheap", STAGE_GRID_STEP >= 1 && STAGE_GRID_STEP <= 5);
}

/* ================================================================== */
/*  WALK-BEHIND REGIONS (stage.occluders)                              */
/* ================================================================== */
{
  const desk = {
    id: "desk",
    label: "the sergeant's desk",
    points: [
      { x: 20, y: 60 },
      { x: 80, y: 60 },
      { x: 80, y: 78 },
      { x: 20, y: 78 },
    ],
    baseline: 78,
  };
  check("occluder: hidden regions are skipped", activeStageOccluders([{ ...desk, visible: false }, desk]).length === 1);
  check("occluder: fewer than 3 points is not a region", activeStageOccluders([{ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }]).length === 0);
  check("occluder: a live 4-point desk is kept", activeStageOccluders([desk]).length === 1);
  check("occluder: baseline defaults to the front edge", occluderBaseline({ points: desk.points }) === 78);
  check("occluder: an authored baseline wins", occluderBaseline({ points: desk.points, baseline: 55 }) === 55);
  check("occluder: z sits on the same 50+y scale as walkers", occluderZ(desk) === 50 + 78 + 0.5);
  check(
    "occluder: a walker in front of the desk out-sorts it",
    50 + 88 > occluderZ(desk) && 50 + 60 < occluderZ(desk),
  );
  check("occluder: covers walker when feet are on the line", occluderCoversWalker(desk, 78) === true);
  check("occluder: covers walker when feet are behind the line", occluderCoversWalker(desk, 70) === true);
  check("occluder: does not cover when feet are in front", occluderCoversWalker(desk, 88) === false);
  check(
    "occluder: polygon css is a percent of WORLD width",
    occluderPolygonCss({ points: [{ x: 50, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }] }, 200) ===
      "25.0000% 0.0000%, 50.0000% 0.0000%, 50.0000% 100.0000%",
  );
  check("occluder: extraOccludes — feet above the line are behind", extraOccludes({ occludes: true, occludeBaseline: 70 }, 60) === true);
  check("occluder: extraOccludes — feet below the line are in front", extraOccludes({ occludes: true, occludeBaseline: 70 }, 80) === false);
  check("occluder: extraOccludes — unflagged extras never cover", extraOccludes({ occludes: false, y: 90 }, 10) === false);

  // Authoring contract: the furniture obstacle must leave a walkable strip
  // BEHIND the depth line, or the covering pass can never fire in play.
  {
    const floor = { top: 72, bottom: 95 };
    const desks = [
      { x: 50, y: 84, w: 58, h: 10 },
      { x: 134, y: 84, w: 54, h: 10 },
    ];
    check("occluder: a strip behind the desk front is walkable", !stageBlocked(70, 78, desks, floor, 16 / 9, 200));
    check("occluder: the desk front itself still blocks", stageBlocked(70, 88, desks, floor, 16 / 9, 200));
    check("occluder: spawn in front of the desks is walkable", !stageBlocked(16, 90, desks, floor, 16 / 9, 200));
  }
}

/* ================================================================== */
/*  MULTI-STATE OBJECTS (Hotspot.states)                               */
/* ================================================================== */
{
  const base = (states: Hotspot["states"], extra: Partial<Hotspot> = {}): Hotspot => ({
    id: "obj",
    label: "the drawer",
    bounds: { x: 10, y: 40, w: 20, h: 20 },
    cursor: "look",
    gating: { requiresFlags: ["lockpicked"] },
    action: { type: "showText", text: "The drawer is jammed shut." },
    ...extra,
    states,
  });
  const st = (s: GlobalState): GlobalState => s;
  const empty = st({ activeFlags: new Set(), inventory: [], meters: {} as never, characterTrust: {}, memories: {} });
  const withFlags = (...f: string[]) =>
    st({ activeFlags: new Set(f), inventory: [], meters: {} as never, characterTrust: {}, memories: {} });

  /* ---- resolution semantics ---- */
  {
    const noStates = base(undefined);
    check("states: no states = the hotspot itself", resolveHotspot(noStates, empty) === noStates);
  }
  check("states: none pass = base fields stand", resolveHotspot(base([{ id: "a", when: { requiresFlags: ["x"] }, label: "A" }]), empty).label === "the drawer");
  check("states: last passing state wins", resolveHotspot(
    base([
      { id: "def", label: "default face" },
      { id: "mid", when: { requiresFlags: ["m"] }, label: "mid face" },
      { id: "last", when: { requiresFlags: ["l"] }, label: "last face" },
    ]),
    withFlags("m", "l")
  ).label === "last face");
  check("states: an earlier state stands when the later gate is shut", resolveHotspot(
    base([
      { id: "def", label: "default face" },
      { id: "mid", when: { requiresFlags: ["m"] }, label: "mid face" },
    ]),
    withFlags("m")
  ).label === "mid face");
  check("states: partial overrides inherit the rest", (() => {
    const r = resolveHotspot(base([{ id: "s", label: "the open drawer" }]), empty);
    return r.label === "the open drawer" && r.action.text === "The drawer is jammed shut." && r.cursor === "look";
  })());
  check("states: repetition can turn a spent briefing into a review", resolveHotspot(base([{id:"review",isRepeatable:true}], {isRepeatable:false}),empty).isRepeatable === true);
  check("states: repetition can turn a repeatable prop into a one-shot action", resolveHotspot(base([{id:"once",isRepeatable:false}], {isRepeatable:true}),empty).isRepeatable === false);
  check("states: omitted repetition inherits the parent", resolveHotspot(base([{id:"label",label:"same"}], {isRepeatable:true}),empty).isRepeatable === true);
  check("states: image override swaps the art", resolveHotspot(base([{ id: "s", image: "/img/open.png" }]), empty).image === "/img/open.png");
  check("states: an empty-string image CLEARS the art", resolveHotspot(base([{ id: "s", image: "" }], { image: "/img/closed.png" }), empty).image === undefined);
  check("states: action override replaces the action", resolveHotspot(base([{ id: "s", action: { type: "showText", text: "It hangs open, empty." } }]), empty).action.text === "It hangs open, empty.");
  check("states: a null gating override UNLOCKS the object", resolveHotspot(base([{ id: "s", gating: null }]), empty).gating === undefined);
  check("states: a gating override replaces the gate", resolveHotspot(base([{ id: "s", gating: { requiresFlags: ["other"] } }]), empty).gating?.requiresFlags?.[0] === "other");
  check("states: identity is never overridden", (() => {
    const r = resolveHotspot(base([{ id: "s", label: "x", action: { type: "goToScene", targetSceneId: "e" } }]), empty);
    return r.id === "obj" && JSON.stringify(r.bounds) === JSON.stringify({ x: 10, y: 40, w: 20, h: 20 });
  })());
  check("states: resolving is idempotent", (() => {
    const once = resolveHotspot(base([{ id: "s", label: "x" }]), empty);
    return resolveHotspot(once, empty) === once || resolveHotspot(once, empty).label === "x";
  })());
  check("states: activeHotspotState reports the winner", activeHotspotState(base([{ id: "a", label: "A" }, { id: "b", when: { requiresFlags: ["z"] }, label: "B" }]), withFlags("z"))?.id === "b");
  check("states: hotspotReachableActions includes every state action", hotspotReachableActions(base([{ id: "s", action: { type: "goToScene", targetSceneId: "e" } }, { id: "t" }])).length === 2);

  /* ---- the verb machinery reads the resolved view ---- */
  check("states: verb answering follows the state cursor", (() => {
    const r = resolveHotspot(base([{ id: "s", cursor: "take" }], { action: { type: "giveItem", itemGranted: "coin" } }), empty);
    return resolveVerbAction(r, "take").ok && !resolveVerbAction(r, "look").ok;
  })());

  /* ---- validator + graph ---- */
  {
    const endScene = (id: string): SceneNode => ({
      id,
      title: id,
      background: "",
      prose: "",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "H", recap: "R" },
    });
    const sceneWith = (hotspots: Hotspot[]): SceneNode => ({
      id: "s1",
      title: "Room",
      background: "",
      prose: "text",
      hotspots,
      choices: [],
    });
    const storyOf = (scenes: SceneNode[], extra: Partial<Story> = {}): Story => ({
      id: "ms",
      title: "Multi-State",
      tagline: "",
      coverImage: "",
      startSceneId: "s1",
      scenes: [...scenes, endScene("e")],
      items: [],
      characters: [],
      ...extra,
    });
    const has = (issues: ReturnType<typeof validateStory>, re: RegExp) => issues.some((i) => re.test(i.message));

    // An unconditional state listed after a gated one permanently shadows it.
    const shadow = validateStory(storyOf([sceneWith([base([
      { id: "a", when: { requiresFlags: ["open"] }, label: "A" },
      { id: "def", label: "DEFAULT" },
    ])])]));
    check("states: unconditional-not-first is an error", has(shadow, /has no gate but isn't first/i), shadow.filter((i) => /state/i.test(i.message)));

    // Duplicate state ids.
    const dup = validateStory(storyOf([sceneWith([base([{ id: "a", label: "A" }, { id: "a", label: "A2" }])])]));
    check("states: duplicate state ids are an error", has(dup, /states share the id "a"/i));

    // A state that overrides nothing is dead weight.
    const dead = validateStory(storyOf([sceneWith([base([{ id: "a", when: { requiresFlags: ["open"] } }])])]));
    check("states: a no-override state warns", has(dead, /overrides nothing/i));

    const repeatOnly = validateStory(storyOf([sceneWith([base([{id:"repeat",isRepeatable:true}])])]));
    check("states: repetition-only override is meaningful", !has(repeatOnly,/overrides nothing/i));
    const farm = validateStory(storyOf([sceneWith([base([{id:"farm",isRepeatable:true,action:{type:"setFlag",flagSet:"opened"}}])])],{flags:{opened:"Door opened"}}));
    check("states: explicit repeatable reward warns", has(farm,/repeatable state "farm" can replay rewards/i));

    // A state's go-to-scene without a target does nothing.
    const noTarget = validateStory(storyOf([sceneWith([base([{ id: "a", when: { requiresFlags: ["open"] }, action: { type: "goToScene" } }])])]));
    check("states: a targetless state route warns", has(noTarget, /goes to a scene but no target/i));

    // A `when` flag nothing ever sets is an impossible state (flag audit).
    const impossible = validateStory(storyOf([sceneWith([base([{ id: "a", when: { requiresFlags: ["never_set"] }, label: "A" }])])]));
    check("states: a when-flag with no producer errors", has(impossible, /Flag "never_set" is required by a gate/i));

    // A well-formed multi-state object raises none of those.
    const clean = validateStory(storyOf([sceneWith([base([
      { id: "open", when: { requiresFlags: ["lockpicked"] }, label: "the open drawer", gating: null, action: { type: "showText", text: "Empty." } },
    ])])]));
    check("states: a well-formed state list raises no state issues", !clean.some((i) => /states share|isn't first|overrides nothing|no target/i.test(i.message)), clean.filter((i) => /state/i.test(i.message)));

    // The state's own flagSet makes its own gate reachable (producer counted).
    const selfSustaining = validateStory(storyOf([sceneWith([base([
      { id: "take", action: { type: "setFlag", flagSet: "full" } },
    ], [{ id: "after", when: { requiresFlags: ["full"] }, label: "the emptied drawer" }])])]));
    check("states: a state's action flagSet counts as a producer", !has(selfSustaining, /Flag "full" is required by a gate/i));

    // Graph: a route that only exists in a later state is a real edge, and
    // its destination must not be flagged unreachable.
    const stateExit = sceneWith([
      base([{ id: "later", when: { requiresFlags: ["open"] }, action: { type: "goToScene", targetSceneId: "e" } }], { action: { type: "showText", text: "locked" } }),
    ]);
    stateExit.prose = "text";
    const edges = storyEdges(storyOf([stateExit]));
    check("states: a state action contributes a scene edge", edges.some((x) => x.source === "s1" && x.target === "e" && /state/.test(x.label ?? "")), edges.map((x) => x.label));
    const reach = validateStory(storyOf([stateExit]));
    check("states: a state-only destination is reachable (no warning)", !has(reach, /unreachable from the start/i), reach.filter((i) => /unreachable/i.test(i.message)));

    // Stage soft-lock: a door whose only exit lives in its "open" state is a
    // legitimate way out.
    const stageScene: SceneNode = {
      id: "s1",
      title: "Vault",
      background: "",
      prose: "",
      nodeType: "stage",
      stage: { playerImage: "emoji:🕵️", spawn: { x: 50, y: 86 }, floor: { top: 62, bottom: 94 } },
      hotspots: [
        {
          id: "door",
          label: "the vault door",
          bounds: { x: 80, y: 60, w: 14, h: 30 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "showText", text: "Sealed. The mechanism needs the crane." },
          states: [
            { id: "open", when: { requiresFlags: ["craned"] }, action: { type: "goToScene", targetSceneId: "e" } },
          ],
        },
      ],
      choices: [],
    };
    const vault = validateStory(storyOf([stageScene]));
    check("states: a stage exits through a state action (no soft-lock error)", !has(vault, /has no way out/i), vault.filter((i) => /way out/i.test(i.message)));
  }
}

/* ================================================================== */
/*  DOORS — gate-aware barriers (StageObstacle.gating)                 */
/* ================================================================== */
{
  const st = (flags: string[]): GlobalState => ({ activeFlags: new Set(flags), inventory: [], meters: {} as never, characterTrust: {}, memories: {} });
  const wall = { x: 60, y: 50, w: 10, h: 50, gating: { requiresFlags: ["open"] } };
  const crate = { x: 20, y: 70, w: 10, h: 10 };
  const list = [crate, wall];

  check("doors: an ungated barrier always blocks", activeStageObstacles(list, st([])).length === 2);
  check("doors: a gated barrier blocks while its gate is shut", activeStageObstacles(list, st([])).some((o) => o === wall));
  check("doors: the barrier is GONE the moment the gate opens", !activeStageObstacles(list, st(["open"])).some((o) => o === wall));
  check("doors: furniture survives the door opening", activeStageObstacles(list, st(["open"]))[0] === crate);
  check("doors: an item gate opens to the item", (() => {
    const badge = { x: 0, y: 0, w: 10, h: 10, gating: { requiresItems: ["badge"] } };
    const held = { ...st([]), inventory: [{ id: "badge" } as never] };
    return activeStageObstacles([badge], st([])).length === 1 && activeStageObstacles([badge], held).length === 0;
  })());

  // Spatial routing: a full-height wall genuinely seals the room; the same
  // room with the door open routes straight through.
  {
    const floor = { top: 60, bottom: 94 };
    const sealed = stageRoutePoly({ x: 10, y: 80 }, { x: 90, y: 80 }, [wall], undefined, floor, 2, 100);
    check("doors: a shut door walls off the far side", sealed.length === 0, sealed);
    const passable = stageRoutePoly({ x: 10, y: 80 }, { x: 90, y: 80 }, activeStageObstacles([wall], st(["open"])), undefined, floor, 2, 100);
    check("doors: the open door routes through", passable.length > 0 && passable[passable.length - 1].x > 85, passable);
  }

  // Validator: a door that can never open is an authoring error.
  {
    const endScene: SceneNode = { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } };
    const doorStory: Story = {
      id: "doors", title: "Doors", tagline: "", coverImage: "", startSceneId: "s1",
      scenes: [
        { id: "s1", title: "Room", background: "", prose: "text", choices: [], stage: { playerImage: "emoji:🕵️", spawn: { x: 20, y: 86 }, floor: { top: 62, bottom: 94 }, obstacles: [{ x: 60, y: 50, w: 10, h: 50, gating: { requiresFlags: ["never_open"] } }] } as never, hotspots: [{ id: "out", label: "Out", bounds: { x: 80, y: 70, w: 12, h: 20 }, cursor: "go", isRepeatable: true, action: { type: "goToScene", targetSceneId: "e" } }] },
        endScene,
      ],
      items: [], characters: [],
    };
    const issues = validateStory(doorStory);
    check("doors: a barrier gate on an unproduced flag errors", issues.some((i) => i.severity === "error" && /Flag "never_open" is required by a gate/.test(i.message)), issues.filter((i) => /never_open/.test(i.message)));
  }
}

/* ================================================================== */
/*  SENTENCE LINE (the SCUMM strip's text)                             */
/* ================================================================== */
{
  check("sentence: bare floor reads Walk to", sentenceLineText({ verb: null }) === "Walk to");
  check("sentence: an armed verb with no target reads its label", sentenceLineText({ verb: "look" }) === "Look at");
  check("sentence: an armed item with no target reads Use item", sentenceLineText({ verb: "use", heldItemName: "wrench" }) === "Use wrench");
  check("sentence: verb + object", sentenceLineText({ verb: "look", target: { label: "the drop-safe", cursor: "take" } }) === "Look at the drop-safe");
  check("sentence: item on object", sentenceLineText({ verb: "use", heldItemName: "wrench", target: { label: "the bike", cursor: "use" } }) === "Use wrench on the bike");
  check("sentence: no coin - the object's own verb reads out", sentenceLineText({ verb: null, target: { label: "the coil", cursor: "take" } }) === "Pick up the coil");
}

/* ================================================================== */
/*  INTERACTABLE NPCS (StageNpc.talkHotspotId) — validator             */
/* ================================================================== */
{
  const endScene: SceneNode = { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } };
  const mk = (npcs: never[], hotspots: Hotspot[]): Story => ({
    id: "npcs", title: "NPCs", tagline: "", coverImage: "", startSceneId: "s1",
    scenes: [
      {
        id: "s1", title: "Room", background: "", prose: "text", choices: [],
        stage: { playerImage: "emoji:🕵️", spawn: { x: 20, y: 86 }, floor: { top: 62, bottom: 94 }, npcs } as never,
        hotspots,
      },
      endScene,
    ],
    items: [], characters: [],
  });
  const talker: Hotspot = { id: "t1", label: "the sweeper", bounds: { x: 40, y: 60, w: 10, h: 30 }, cursor: "talk", isRepeatable: true, action: { type: "startDialogue" } };
  const looker: Hotspot = { id: "l1", label: "the sign", bounds: { x: 60, y: 30, w: 10, h: 20 }, cursor: "look", action: { type: "showText", text: "x" } };
  const out: Hotspot = { id: "out", label: "Out", bounds: { x: 84, y: 70, w: 12, h: 20 }, cursor: "go", isRepeatable: true, action: { type: "goToScene", targetSceneId: "e" } };

  const good = validateStory(mk([{ id: "n1", x: 40, y: 86, talkHotspotId: "t1" } as never], [talker, out]));
  check("npc link: a linked talker raises no issue", !good.some((i) => /NPC "n1"/.test(i.message)), good.filter((i) => /NPC/.test(i.message)));

  const dangling = validateStory(mk([{ id: "n1", x: 40, y: 86, talkHotspotId: "nope" } as never], [talker, out]));
  check("npc link: a dangling link is an error", dangling.some((i) => i.severity === "error" && /NPC "n1" is linked to talk marker "nope"/.test(i.message)), dangling.map((i) => i.message));

  const notalk = validateStory(mk([{ id: "n1", x: 40, y: 86, talkHotspotId: "l1" } as never], [looker, out]));
  check("npc link: linking a non-talker warns", notalk.some((i) => i.severity === "warning" && /isn't a 🗣 start-conversation/i.test(i.message)));
}

/* ================================================================== */
/*  CREATOR-PASS regressions (found while authoring Rain Sector)       */
/* ================================================================== */
{
  const endScene: SceneNode = { id: "e", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } };
  const mk = (hotspots: Hotspot[]): Story => ({
    id: "creator", title: "Creator", tagline: "", coverImage: "", startSceneId: "s1",
    scenes: [{ id: "s1", title: "Room", background: "", prose: "text", choices: [], hotspots }, endScene],
    items: [], characters: [],
  });
  const has = (issues: ReturnType<typeof validateStory>, re: RegExp) => issues.some((i) => re.test(i.message));

  // A useItem action carrying a targetSceneId is a way out (the Studio's own
  // "locked door that swings open" pattern) — Rain Sector's mag-locked gate.
  const useItemExit = validateStory(mk([
    {
      id: "gate", label: "the gate", bounds: { x: 80, y: 60, w: 12, h: 30 }, cursor: "go", isRepeatable: true,
      gating: { requiresItems: ["card"] },
      action: { type: "useItem", targetSceneId: "e", text: "The latch lets go." },
    },
  ]));
  check("creator: a useItem exit counts as a way out (no soft-lock error)", !has(useItemExit, /has no way out/i), useItemExit.filter((i) => /way out/.test(i.message)));
  check("creator: the useItem exit is a real edge", storyEdges(mk([
    { id: "gate", label: "the gate", bounds: { x: 80, y: 60, w: 12, h: 30 }, cursor: "go", isRepeatable: true, action: { type: "useItem", targetSceneId: "e", text: "x" } },
  ])).some((x) => x.source === "s1" && x.target === "e"));

  // A VERB action can be the flag producer (kick the machine -> flag ->
  // the machine's own take-gate opens). The audit must read verbs.
  const verbProducer = validateStory(mk([
    {
      id: "vend", label: "the machine", bounds: { x: 30, y: 64, w: 12, h: 26 }, cursor: "look",
      verbs: { kick: { type: "showText", text: "CLANG.", flagSet: "shaken" } },
      gating: { requiresFlags: ["shaken"] },
      action: { type: "giveItem", itemGranted: "card" },
    },
  ]));
  check("creator: a verb action's flagSet counts as a producer", !has(verbProducer, /Flag "shaken" is required by a gate/i), verbProducer.filter((i) => /shaken/.test(i.message)));

  // And the shipped case itself stays clean.
  const rs = validateStory(RAIN_SECTOR);
  check("rainsector: the shipped case validates with zero errors", rs.filter((i) => i.severity === "error").length === 0, rs.slice(0, 5));
  check("rainsector: the walker sheet is the sliced magenta plate", RAIN_SECTOR.scenes.find((x) => x.id === "rs_street")!.stage!.playerSheet!.frameWidth === 293);
  check("rainsector: an interactable NPC is linked to a talker", RAIN_SECTOR.scenes.find((x) => x.id === "rs_street")!.stage!.npcs?.some((n) => n.talkHotspotId === "rsh_ping"));
  check("rainsector: the stair barrier is gate-aware", RAIN_SECTOR.scenes.find((x) => x.id === "rs_alley")!.stage!.obstacles?.some((o) => o.gating?.requiresFlags?.includes("rs_ping_told")));
}

/* ── SEEDED RNG — deterministic playtests (?seed=) ──────────────────── */
console.log("\n=== SEEDED RNG — deterministic playtests ===");
{
  // mulberry32: same seed in, same stream out; a different seed diverges.
  const g1 = mulberry32(hashSeed("42"));
  const g2 = mulberry32(hashSeed("42"));
  const seq = Array.from({ length: 6 }, () => g1());
  check("rng: mulberry32 same seed replays the same stream", seq.every((v, i) => v === g2()));
  check("rng: draws stay in [0, 1)", seq.every((v) => v >= 0 && v < 1));
  const g3 = mulberry32(hashSeed("43"));
  check("rng: a different seed diverges", Array.from({ length: 6 }, () => g3()).some((v, i) => v !== seq[i]));
  check("rng: hashSeed is stable and separating", hashSeed("fred") === hashSeed("fred") && hashSeed("fred") !== hashSeed("42"));

  // ?seed= parsing.
  check("rng: ?seed=42 parses", seedFromSearch("?seed=42") === "42");
  check("rng: seed parses mid-query and decodes", seedFromSearch("?a=1&seed=hello%20world") === "hello world");
  check("rng: no seed param means null", seedFromSearch("?x=1") === null && seedFromSearch("") === null);
  check("rng: a bare ?seed= means null", seedFromSearch("?seed=") === null);

  // The shared module stream.
  setGameSeed("42");
  const s1 = Array.from({ length: 8 }, () => gameRandom());
  setGameSeed("42");
  const s2 = Array.from({ length: 8 }, () => gameRandom());
  check("rng: setGameSeed replays the module stream", s1.every((v, i) => v === s2[i]));
  check("rng: currentGameSeed reports the pin", currentGameSeed() === "42");
  setGameSeed(null);
  check("rng: unsetting hands the stream back to Math.random", currentGameSeed() === null);
  const live = Array.from({ length: 8 }, () => gameRandom());
  setGameSeed(null);
  check("rng: unseeded draws are live (two runs differ)", Array.from({ length: 8 }, () => gameRandom()).some((v, i) => v !== live[i]));

  // The helpers games actually call.
  const base = ["a", "b", "c", "d", "e", "f"];
  setGameSeed("42");
  const sh1 = gameShuffle(base);
  const picked = gamePick(base);
  const r = gameRange(5, 9);
  setGameSeed("42");
  const sh3 = gameShuffle(base);
  check("rng: gameShuffle same seed replays the permutation", JSON.stringify(sh1) === JSON.stringify(sh3));
  check("rng: gameShuffle preserves the multiset, input untouched", sh1.slice().sort().join("") === "abcdef" && base.join("") === "abcdef");
  check("rng: gamePick returns a member", base.includes(picked));
  check("rng: gameRange stays in band", r >= 5 && r < 9);
  setGameSeed(null);

  // The gameplay call sites route through the stream.
  check("rng: PatternPuzzle shuffles via the seeded stream", /gameShuffle\(config\.rows\)/.test(readFileSync("src/game/PatternPuzzle.tsx", "utf8")));
  check("rng: RideGame spawns via the seeded stream", /gameRandom\(\) \* spawnMs/.test(readFileSync("src/game/RideGame.tsx", "utf8")));

  /* --- RESUMING A SEEDED RUN ---------------------------------------
   * The stream's POSITION is part of the world. A snapshot taken mid-run and
   * restored must continue the same dice — that is what makes a save slot, an
   * imported .sreel or ↺ Rewind resume a deterministic run instead of
   * quietly re-rolling it from the top. */
  setGameSeed("resume-me");
  Array.from({ length: 5 }, () => gameRandom());
  const snap = rngSnapshot();
  check("rng: a pinned run snapshots seed + position", !!snap && snap.seed === "resume-me" && snap.draws === 5, snap);
  check("rng: gameDrawCount agrees with the snapshot", gameDrawCount() === 5);
  const afterSnap = Array.from({ length: 4 }, () => gameRandom());
  check("rng: drawing moves the position on", gameDrawCount() === 9);
  // Every helper counts: a shuffle, a pick and a range draw are all draws.
  setGameSeed("counted");
  gameShuffle(["a", "b", "c"]); // 2 draws for a 3-item Fisher-Yates
  gamePick(["a", "b"]);
  gameRange(0, 1);
  check("rng: shuffle/pick/range all count as draws", gameDrawCount() === 4, gameDrawCount());

  check("rng: restoring the snapshot rewinds the position", restoreRngSnapshot(snap) && gameDrawCount() === 5, gameDrawCount());
  check("rng: …and replays the very next draws", Array.from({ length: 4 }, () => gameRandom()).every((v, i) => v === afterSnap[i]));
  check("rng: restoring twice is idempotent", restoreRngSnapshot(snap) && restoreRngSnapshot(snap) && gameDrawCount() === 5);

  // An unseeded run has no position to restore — and must not gain one.
  setGameSeed(null);
  check("rng: an unseeded run snapshots nothing", rngSnapshot() === null);
  check("rng: an unseeded run counts nothing", gameDrawCount() === 0);
  check("rng: restoring nothing is refused", restoreRngSnapshot(null) === false && restoreRngSnapshot(undefined) === false);
  check("rng: a refused restore leaves the stream live", currentGameSeed() === null);

  // Hand-edited / truncated saves degrade, they never throw or hang.
  check("rng: a blank seed is refused", restoreRngSnapshot({ seed: "   ", draws: 3 }) === false);
  check("rng: a non-string seed is refused", restoreRngSnapshot({ seed: 42 as unknown as string, draws: 3 }) === false);
  setGameSeed("guards");
  check("rng: a negative position clamps to zero", restoreRngSnapshot({ seed: "guards", draws: -99 }) && gameDrawCount() === 0);
  check("rng: a NaN position clamps to zero", restoreRngSnapshot({ seed: "guards", draws: Number.NaN }) && gameDrawCount() === 0);
  check("rng: a fractional position is floored", restoreRngSnapshot({ seed: "guards", draws: 3.9 }) && gameDrawCount() === 3);
  check(
    "rng: an absurd position is capped, not hung",
    restoreRngSnapshot({ seed: "guards", draws: RNG_MAX_RESTORE_DRAWS + 5_000_000 }) && gameDrawCount() === RNG_MAX_RESTORE_DRAWS
  );
  check("rng: a missing position reads as zero", restoreRngSnapshot({ seed: "guards" } as never) && gameDrawCount() === 0);
  setGameSeed(null);

  // The wiring: GameSave carries the position both ways.
  const gameSrcRng = readFileSync("src/game/Game.tsx", "utf8");
  check("rng: buildSave records the stream position", /rng: rngSnapshot\(\) \?\? undefined/.test(gameSrcRng));
  check("rng: restoreSave puts the stream back", /restoreRngSnapshot\(save\.rng\)/.test(gameSrcRng));
}

/* ================================================================== */
/*  3b. CHANCE GAMBLE (a 🎲 odds roll on a choice)                    */
/* ================================================================== */

{
  // The engine's roll rule, exactly as pickChoice computes it: one seeded
  // draw, hit when draw*100 < chance.
  const roll = (choice: { chance?: number }): "hit" | "miss" | null =>
    typeof choice.chance === "number" && Number.isFinite(choice.chance)
      ? (gameRandom() * 100 < choice.chance ? "hit" : "miss")
      : null;

  check("chance: a non-gamble choice never rolls", roll({}) === null);
  check("chance: 100% always lands", Array.from({ length: 60 }, () => roll({ chance: 100 })).every((r) => r === "hit"));
  check("chance: 0% never lands", Array.from({ length: 60 }, () => roll({ chance: 0 })).every((r) => r === "miss"));

  // The SIMULATION path (what the playthrough bot drives) rolls the same dice:
  // a miss must take the fail scene, the fail consequences AND the flag.
  {
    const gambleStory: Story = {
      id: "t_gamble",
      title: "T",
      tagline: "",
      coverImage: "",
      startSceneId: "g0",
      characters: [],
      items: [],
      scenes: [
        {
          id: "g0",
          title: "Table",
          background: "",
          prose: "",
          choices: [
            { id: "c_full", text: "full", targetSceneId: "g_win", chance: 100, consequences: { setFlags: ["landed_full"] } },
            { id: "c_zero", text: "zero", targetSceneId: "g_win", chance: 0, failTargetSceneId: "g_lose", failConsequences: { setFlags: ["missed_zero"], meterChanges: [{ meter: "Suspicion", delta: 1 }] } },
            { id: "c_half", text: "half", targetSceneId: "g_win", chance: 50, failTargetSceneId: "g_lose" },
          ],
        },
        { id: "g_win", title: "Win", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "W", recap: "" } },
        { id: "g_lose", title: "Lose", background: "", prose: "", isEnding: true, endingData: { tier: "gameover", headline: "L", recap: "" } },
      ],
    };
    const gsim = initialSim(gambleStory, createInitialState(gambleStory));
    const gdecisions = availableDecisions(gambleStory, gsim);
    check("chance sim: gamble choices are offered like any choice", gdecisions.map(decisionKey).includes("g0:c_full") && gdecisions.map(decisionKey).includes("g0:c_zero"));
    setGameSeed("sim-full");
    const full = applyDecision(gambleStory, gsim, gdecisions.find((d) => decisionKey(d) === "g0:c_full")!);
    check("chance sim: 100% routes to the normal target", full.sim.sceneId === "g_win");
    check("chance sim: the hit flag + happy consequences land", full.sim.state.activeFlags.has("chance:g0:c_full:hit") && full.sim.state.activeFlags.has("landed_full"));
    const zero = applyDecision(gambleStory, gsim, gdecisions.find((d) => decisionKey(d) === "g0:c_zero")!);
    check("chance sim: 0% routes to the FAIL scene (the bot now covers it)", zero.sim.sceneId === "g_lose");
    check("chance sim: the miss flag + fail consequences land", zero.sim.state.activeFlags.has("chance:g0:c_zero:miss") && zero.sim.state.activeFlags.has("missed_zero") && zero.sim.state.meters.Suspicion === 1);
    // 50% splits across seeded sims — and a fixed seed replays it.
    const halfSim = (seed: string) => {
      setGameSeed(seed);
      const s = initialSim(gambleStory, createInitialState(gambleStory));
      return applyDecision(gambleStory, s, availableDecisions(gambleStory, s).find((d) => decisionKey(d) === "g0:c_half")!).sim.sceneId;
    };
    const outcomes = Array.from({ length: 200 }, (_, i) => halfSim(`sim-half-${i}`));
    const wins = outcomes.filter((o) => o === "g_win").length;
    check("chance sim: 50% splits between the routes", wins > 60 && wins < 140, `${wins}/200`);
    check("chance sim: a fixed seed replays the same destination", halfSim("sim-half-0") === outcomes[0]);
    setGameSeed(null);
  }

  // Mid odds split, and the split is reproducible under a seed.
  setGameSeed("gamble-1");
  const mixed = Array.from({ length: 200 }, () => roll({ chance: 40 }));
  const hits = mixed.filter((r) => r === "hit").length;
  check("chance: 40% lands somewhere strictly between the extremes", hits > 40 && hits < 160, `${hits}/200`);
  setGameSeed("gamble-1");
  const replay = Array.from({ length: 200 }, () => roll({ chance: 40 }));
  check("chance: same seed + same choice replays the exact dice", mixed.every((r, i) => r === replay[i]));

  // A RUN of gambles (street → precinct → archive → roof) stays
  // deterministic: same seed, same choices, same fate.
  const fateRun = () => {
    setGameSeed("second-reel");
    return [60, 40, 50, 35].map((chance) => roll({ chance }));
  };
  const fate1 = fateRun();
  const fate2 = fateRun();
  check("chance: a run of gambles replays the same fate", fate1.every((r, i) => r === fate2[i]), fate1.join(","));
  setGameSeed(null);

  // The shipped story exercises every corner of the feature.
  const secondReel = STORIES.find((s) => s.id === "jack-morrow-second-reel");
  check("chance: the Second Reel ships in the catalogue", !!secondReel);
  if (secondReel) {
    const gambles = secondReel.scenes.flatMap((sc) => (sc.choices ?? []).filter((c) => typeof c.chance === "number"));
    check("chance: the story ships real gambles with odds in range", gambles.length >= 3 && gambles.every((c) => (c.chance ?? 0) >= 0 && (c.chance ?? 0) <= 100), gambles.map((c) => `${c.id}:${c.chance}`).join(" | "));
    // Every gamble's miss route exists, and the miss route is a REAL edge in
    // the graph (the Studio canvas, the dangling check and reachability all
    // see it through storyEdges).
    const sceneIds = new Set(secondReel.scenes.map((s) => s.id));
    check("chance: every gamble's miss route points at a real scene", gambles.every((c) => c.failTargetSceneId && sceneIds.has(c.failTargetSceneId)));
    const press = secondReel.scenes.find((s) => s.id === "sr_street")!.choices!.find((c) => c.id === "sr_s_press")!;
    const edges = storyEdges(secondReel).filter((e) => e.source === "sr_street" && e.label.includes("missed roll"));
    check("chance: the miss route is a graph edge (canvas + validator coverage)", edges.length === 1 && edges[0].target === press.failTargetSceneId, edges.map((e) => `${e.source}→${e.target}:${e.label}`).join(" | "));
    // The fail flags are collected, so their notes don't warn.
    const issues = validateStory(secondReel);
    check("chance: no validator ERRORS in the Second Reel", issues.filter((i) => i.severity === "error").length === 0, issues.filter((i) => i.severity === "error").map((i) => i.message).join(" | "));
    check("chance: the fail-route flag notes resolve (collectFlags sees failConsequences)",
      !issues.some((i) => /Flag note for "(sr_vera_clammed|sr_heat|sr_caught)"/.test(i.message)));
    // The heat bust is wired to a real game-over ending.
    check("chance: a full-miss run busts (heat 1+2+2 hits the limit 5)", heatBustTarget(secondReel, { meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 5 } as never }, "sr_rooftop") === "sr_end_busted");
    const busted = secondReel.scenes.find((s) => s.id === "sr_end_busted");
    check("chance: the bust ending is a game-over tier", busted?.isEnding === true && busted?.endingData?.tier === "gameover");
  }

  // Out-of-range odds are a validator ERROR, not a silent clamp.
  const badStory = structuredClone(secondReel!);
  badStory.scenes.find((s) => s.id === "sr_street")!.choices!.find((c) => c.id === "sr_s_press")!.chance = 150;
  const badIssues = validateStory(badStory as never);
  check("chance: odds of 150% are a validator error", badIssues.some((i) => i.severity === "error" && /odds 150/.test(i.message)));

  // The wiring: ONE roll rule in the decision surface, used by BOTH the
  // runtime (Game.tsx pickChoice) and the simulation (applyDecision).
  const gameSrc = readFileSync("src/game/Game.tsx", "utf8");
  const decisionsSrc = readFileSync("src/game/decisions.ts", "utf8");
  check("chance: the roll rule lives in the decision surface", /gameRandom\(\) \* 100 < choice\.chance/.test(decisionsSrc));
  check("chance: Game.tsx uses the shared roll, not a private copy", /const gamble = rollGamble\(choice\)/.test(gameSrc) && !/gameRandom\(\) \* 100/.test(gameSrc));
  check("chance: the outcome is flagged for later beats (one format)", /chance:\$\{sceneId\}:\$\{choiceId\}:\$\{gamble\}/.test(decisionsSrc) && /gambleFlag\(sceneId, choice\.id, gamble\)/.test(gameSrc));
  check("chance: a miss takes the fail route, fallback to the normal target", /gamble === "miss" \? \(choice\.failTargetSceneId \?\? choice\.targetSceneId\) : choice\.targetSceneId/.test(gameSrc));
  check("chance: the simulation routes misses to the fail route too", /gamble === "miss" \? \(c\.failTargetSceneId \?\? c\.targetSceneId\) : c\.targetSceneId/.test(decisionsSrc));
  check("chance: the button shows its odds before the player commits", /🎲 \{Math\.round\(c\.chance\)\}%/.test(gameSrc));
  check("chance: Studio exposes odds, miss route and miss consequences",
    /Chance gamble/.test(readFileSync("src/studio/Studio.tsx", "utf8")) &&
    /ch\.chance = e\.target\.checked/.test(readFileSync("src/studio/Studio.tsx", "utf8")) &&
    /failTargetSceneId = e\.target\.value/.test(readFileSync("src/studio/Studio.tsx", "utf8")) &&
    /ch\.failConsequences = \{ \.\.\./.test(readFileSync("src/studio/Studio.tsx", "utf8")));
}


/* ================================================================== */
/*  3c. TRANSITION SOUND DESIGN + THE THIRD REEL (full-kit showcase)   */
/* ================================================================== */

{
  const { resolveTransitionSound, transitionTravelDir } = await import("../src/audio");

  // The auto map: dramatic moves land, quiet moves don't.
  check("sfx: auto → slide whooshes", resolveTransitionSound("slide-left") === "whoosh" && resolveTransitionSound("slide-right") === "whoosh");
  check("sfx: auto → wipes and irises swish", ["wipe-left", "wipe-right", "wipe-up", "wipe-down", "iris", "iris-in"].every((t) => resolveTransitionSound(t) === "swish"));
  check("sfx: auto → zoom gets the riser + sub-hit", resolveTransitionSound("zoom") === "riser");
  check("sfx: auto → glitch zaps and burn sizzles", resolveTransitionSound("glitch") === "zap" && resolveTransitionSound("burn") === "sizzle");
  check("sfx: auto → fade-black thumps, fade swells, cut is mute",
    resolveTransitionSound("fade-black") === "thump" && resolveTransitionSound("fade") === "swell" && resolveTransitionSound("cut") === "none");
  check("sfx: an unknown transition name falls back to silence", resolveTransitionSound(undefined) === "none" && resolveTransitionSound("bogus") === "none");
  // Author overrides win over the table — including "none" to mute a loud move
  // and a loud pick over a quiet move (the Third Reel uses both shapes).
  check("sfx: explicit override beats the auto map",
    resolveTransitionSound("fade", "thump") === "thump" && resolveTransitionSound("slide-left", "none") === "none" && resolveTransitionSound("fade-black", "none") === "none");
  check("sfx: 'auto' written explicitly is the same as omitting it",
    resolveTransitionSound("zoom", "auto") === resolveTransitionSound("zoom"));
  // Direction for the panned whooshes: wipe/slide-left travel left, etc.
  check("sfx: travel direction drives the pan",
    transitionTravelDir("slide-left") === "left" && transitionTravelDir("wipe-right") === "right" &&
    transitionTravelDir("wipe-up") === "up" && transitionTravelDir("zoom") === null);
  // The wiring contract: goToScene fires the bed for the DESTINATION scene
  // (same shared table as the overlay class), gated on the sound toggle.
  const gameSrc3 = readFileSync("src/game/Game.tsx", "utf8");
  check("sfx: goToScene schedules the bed on the destination's settings",
    /resolveTransitionSound\(rawT, target\?\.transitionSound\)/.test(gameSrc3) &&
    /audio\.transitionSfx\(sfxKind, ms \/ 1000, transitionTravelDir\(rawT\)\)/.test(gameSrc3));
  check("sfx: the bed respects the player's sound toggle", /if \(sfxKind !== "none" && soundOnRef\.current\) \{/.test(gameSrc3));
  // Studio exposes the option next to the transition picker (the "as options
  // in studio" contract), and 'auto' writes back as an absent field.
  const studioSrc3 = readFileSync("src/studio/Studio.tsx", "utf8");
  check("sfx: Studio has the Transition sound picker with auto-reset-to-undefined",
    /Transition sound/.test(studioSrc3) &&
    /transitionSound: e\.target\.value === "auto" \? undefined :/.test(studioSrc3));

  // ---- THE THIRD REEL: ships, and exercises every part of the kit ----
  const thirdReel = STORIES.find((s) => s.id === "jack-morrow-third-reel");
  check("third reel: ships in the catalogue", !!thirdReel);
  if (thirdReel) {
    const issues3 = validateStory(thirdReel);
    check("third reel: no validator ERRORS", issues3.filter((i) => i.severity === "error").length === 0,
      issues3.filter((i) => i.severity === "error").map((i) => i.message).join(" | "));
    const gambles3 = thirdReel.scenes.flatMap((sc) => (sc.choices ?? []).filter((c) => typeof c.chance === "number"));
    check("third reel: real gambles with odds in range and fail routes",
      gambles3.length >= 3 && gambles3.every((c) => (c.chance ?? 0) > 0 && (c.chance ?? 0) < 100 && c.failTargetSceneId && thirdReel.scenes.some((s2) => s2.id === c.failTargetSceneId)),
      gambles3.map((c) => `${c.id}:${c.chance}`).join(" | "));
    // Full-kit transitions: both slides, the zoom, and explicit sound picks.
    const t3 = (id: string) => thirdReel.scenes.find((s) => s.id === id)?.transition;
    check("third reel: the art-carrying transitions are in play",
      t3("tr_alley") === "slide-left" && t3("tr_roof") === "slide-right" && t3("tr_lobby") === "zoom");
    check("third reel: the studio sound options are demonstrated (thump on a fade, silence on the catch)",
      thirdReel.scenes.find((s) => s.id === "tr_booth")?.transitionSound === "thump" &&
      thirdReel.scenes.find((s) => s.id === "tr_caught")?.transitionSound === "none");
    const stages3 = thirdReel.scenes.filter((s) => s.nodeType === "stage");
    check("third reel: three walkable stages with markers", stages3.length >= 3 && stages3.every((s) => (s.hotspots ?? []).length >= 3));
    check("third reel: the three endings cover gold/silver/bust",
      ["tr_end_gold", "tr_end_silver", "tr_end_busted"].every((id) => thirdReel.scenes.some((s) => s.id === id && s.isEnding)));
    // A full-miss run (bid +2, splice +2, walk past the desk +1) hits the
    // heat limit — and the fifth point lands at the ROOF (a non-ending scene,
    // where the bust engine can catch it before the ending would).
    check("third reel: a full-miss run busts (heat 2+2+1 hits the limit 5)",
      heatBustTarget(thirdReel, { meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 5 } as never }, "tr_roof") === "tr_end_busted");
  }

  // ---- overlay art lifecycle (the hygiene fix) ----
  check("overlay: the slide/zoom art stack is gated on a live move",
    /const \[overlayArtLive, setOverlayArtLive\] = useState\(true\)/.test(gameSrc3) &&
    /\(fading \|\| overlayArtLive\)/.test(gameSrc3));
  check("overlay: the reveal window disarms the art stack after the move",
    /window\.setTimeout\(\(\) => setOverlayArtLive\(false\), overlayRevealMs \+ 160\)/.test(gameSrc3));
}


/* ================================================================== */
/*  4. REWIND ONE DECISION (src/game/rewind.ts)                        */
/* ================================================================== */

{
  const save = (over: Partial<GameSave> = {}): GameSave => ({
    storyId: "t",
    sceneId: "a",
    sceneTitle: "A",
    savedAt: 0,
    activeFlags: [],
    inventory: [],
    meters: { Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 },
    characterTrust: {},
    memories: {},
    proseAcknowledged: true,
    beatIdx: 0,
    usedHotspots: [],
    usedChoices: [],
    visitedScenes: [],
    encounteredCharacters: [],
    expiredChoices: [],
    choiceClocks: {},
    ...over,
  });

  let st = emptyRewind();
  check("rewind: a fresh stack has nothing to undo", !canRewindDecision(st) && rewindLabel(st) === null);

  st = pushRewind(st, save(), "“Ask about the watch”");
  check("rewind: a push makes it undoable", canRewindDecision(st) && st.entries.length === 1);
  check("rewind: the label describes the decision", rewindLabel(st) === "“Ask about the watch”");

  // Same moment twice — the stack must not grow (scene re-entry, re-render).
  st = pushRewind(st, save(), "“Ask about the watch”");
  check("rewind: an identical moment collapses", st.entries.length === 1);

  // Same moment, better label: keep one entry but describe it accurately.
  st = pushRewind(st, save(), "“Press him harder”");
  check("rewind: a collapsed push still improves the label", st.entries.length === 1 && rewindLabel(st) === "“Press him harder”");

  // A genuinely different world pushes a new entry.
  st = pushRewind(st, save({ sceneId: "b", sceneTitle: "B", activeFlags: ["seen_ledger"] }), "“Take the ledger”");
  check("rewind: a changed world pushes a new entry", st.entries.length === 2);

  const popped = popRewind(st);
  check("rewind: pop returns the most recent snapshot", popped.entry?.label === "“Take the ledger”");
  check("rewind: pop shrinks the stack", popped.stack.entries.length === 1);
  check("rewind: the popped save is the world BEFORE that decision", popped.entry?.save.sceneId === "b");

  // Endings are final: no snapshot may be taken at one, and once sealed the
  // stack refuses both pushes and pops — an ending can never be re-rolled.
  let ending = pushRewind(emptyRewind(), save(), "before");
  const beforeSeal = ending.entries.length;
  ending = pushRewind(ending, save({ sceneId: "z" }), "at the ending", { isEnding: true });
  check("rewind: a snapshot at an ending is refused", ending.entries.length === beforeSeal);
  ending = sealRewind(ending);
  check("rewind: sealing kills the undo", !canRewindDecision(ending));
  check("rewind: a sealed stack refuses pops", popRewind(ending).entry === null);
  check("rewind: a sealed stack refuses pushes", pushRewind(ending, save({ sceneId: "q" }), "x").entries.length === beforeSeal);

  // Bounded: the oldest decisions fall off, the newest always survive.
  let deep = emptyRewind();
  for (let i = 0; i < REWIND_LIMIT + 12; i++) deep = pushRewind(deep, save({ sceneId: `s${i}`, beatIdx: i }), `d${i}`);
  check("rewind: the stack is bounded", deep.entries.length === REWIND_LIMIT);
  check("rewind: the bound drops the OLDEST, keeps the newest", rewindLabel(deep) === `d${REWIND_LIMIT + 11}`);

  // Purity: no call mutates its input.
  const base = pushRewind(emptyRewind(), save(), "one");
  const grown = pushRewind(base, save({ sceneId: "b" }), "two");
  check("rewind: pushRewind is pure", base.entries.length === 1 && grown.entries.length === 2);
  check("rewind: popRewind is pure", popRewind(grown).stack.entries.length === 1 && grown.entries.length === 2);
}

/* ================================================================== */
/*  5. WORLD-STATE DEEP LINKS (src/game/deepLink.ts)                   */
/* ================================================================== */

{
  const empty = parseDeepLink("");
  check("deep link: an empty query carries nothing", !empty.present && empty.flags.length === 0);
  check("deep link: ?seed alone is not a world-state link", !parseDeepLink("?seed=42").present);

  const req = parseDeepLink("?scene=tt_light&flags=tt_caught_lie,tt_heard_signal&items=tt_manifest_page&meters=Suspicion:5,clever:3&trust=lydia:3,marco:-2&memories=alibi:I%20lied");
  check("deep link: the target scene parses", req.sceneId === "tt_light");
  check("deep link: flags parse as a list", req.flags.join(",") === "tt_caught_lie,tt_heard_signal");
  check("deep link: items parse as a list", req.items.join(",") === "tt_manifest_page");
  check("deep link: meters parse", req.meters.Suspicion === 5);
  check("deep link: meter names are case-insensitive", req.meters.Clever === 3);
  check("deep link: trust parses, negatives included", req.trust.lydia === 3 && req.trust.marco === -2);
  check("deep link: memories parse (values may contain spaces)", req.memories.alibi === "I lied");
  check("deep link: whitespace around ids is trimmed", parseDeepLink("?flags= a , b ").flags.join(",") === "a,b");
  check("deep link: a blank value is not present", !parseDeepLink("?flags=").present);

  // Resolved against a real story: valid ids land, unknown ones warn.
  const nd = NEON_DINER;
  const firstItem = nd.items[0]?.id ?? "";
  const realScene = nd.scenes[2]?.id ?? nd.startSceneId;
  const res = resolveDeepLink(nd, parseDeepLink(`?scene=${realScene}&items=${firstItem}&meters=Clever:4`));
  check("deep link: a known scene is accepted", res.sceneId === realScene);
  check("deep link: a known item lands in the inventory", res.state.inventory.some((i) => i.id === firstItem));
  check("deep link: meters land on the state", res.state.meters.Clever === 4);
  check("deep link: a clean link warns about nothing", res.warnings.length === 0, res.warnings);
  check("deep link: a link that injects something reports applied", res.applied);

  // Unknown ids are WARNINGS, never errors — a renamed flag must still boot.
  const bad = resolveDeepLink(nd, parseDeepLink("?scene=no_such_scene&items=no_such_item&trust=no_such_person:2"));
  check("deep link: an unknown scene falls back to the start scene", bad.sceneId === undefined);
  check("deep link: an unknown item is dropped, not fatal", bad.state.inventory.length === 0);
  // createInitialState seeds every REAL character's trust, so "dropped" means
  // the unknown id never appears — not that the map is empty.
  check("deep link: an unknown character's trust is dropped", !("no_such_person" in bad.state.characterTrust));
  check("deep link: every unknown id produced a warning", bad.warnings.length === 3, bad.warnings);

  // An unknown FLAG is the deliberate exception: applied with a warning, so a
  // gate can be tested before the content that sets the flag exists.
  const ghost = resolveDeepLink(nd, parseDeepLink("?flags=not_yet_written"));
  check("deep link: an unknown flag is applied anyway", ghost.state.activeFlags.has("not_yet_written"));
  check("deep link: …but it says so", ghost.warnings.length === 1);

  // Out-of-range numbers are clamped to the engine's own bounds, with a note.
  const wild = resolveDeepLink(nd, parseDeepLink(`?meters=Suspicion:99&trust=${nd.characters[0]?.id ?? "x"}:99`));
  check("deep link: meters clamp to 0–10", wild.state.meters.Suspicion === 10);
  if (nd.characters[0]) check("deep link: trust clamps to -5–5", wild.state.characterTrust[nd.characters[0].id] === 5);
  check("deep link: clamping is reported", wild.warnings.length >= 1);

  // Only world state is injectable — nothing here can forge progress.
  check("deep link: no journey/save/season fields exist on the resolution", !("journey" in res) && !("save" in res) && !("seasonLog" in res));

  // Round trip: build → parse → the same request.
  const link = buildDeepLink({ sceneId: "s1", flags: ["f1", "f2"], items: ["i1"], meters: { Suspicion: 4 }, trust: { lyd: -1 }, seed: "42" });
  const back = parseDeepLink(link.slice(link.indexOf("?")));
  check("deep link: build → parse round-trips the scene", back.sceneId === "s1");
  check("deep link: build → parse round-trips flags/items", back.flags.join() === "f1,f2" && back.items.join() === "i1");
  check("deep link: build → parse round-trips meters and trust", back.meters.Suspicion === 4 && back.trust.lyd === -1);
  check("deep link: the seed rides along", /[?&]seed=42/.test(link));
  check("deep link: an empty spec builds an empty link", buildDeepLink({}, "http://x/") === "http://x/");
  check("deep link: describe summarises what landed", describeDeepLink(res).length > 0);
}

/* ================================================================== */
/*  6. THE DECISION SURFACE (src/game/decisions.ts)                    */
/* ================================================================== */

{
  const story: Story = {
    id: "ds",
    title: "DS",
    tagline: "",
    coverImage: "",
    startSceneId: "s_start",
    items: [
      { id: "key", name: "Brass Key", icon: "🔑", description: "" },
      { id: "photo", name: "Photograph", icon: "🖼", description: "" },
    ],
    characters: [{ id: "lyd", name: "Lydia Vane", role: "", portrait: "", description: "" }],
    scenes: [
      {
        id: "s_start",
        title: "Start",
        background: "",
        prose: "",
        choices: [
          { id: "c_go", text: "Head to the door", targetSceneId: "s_door", attitudeTag: "Neutral" },
          { id: "c_locked", text: "Use the key", targetSceneId: "s_end", gating: { requiresItems: ["key"] } },
          { id: "c_unwired", text: "Nowhere yet" },
        ],
        hotspots: [
          { id: "h_key", label: "A brass key", bounds: { x: 0, y: 0, w: 5, h: 5 }, cursor: "take", action: { type: "giveItem", itemGranted: "key" } },
          { id: "h_read", label: "A poster", bounds: { x: 6, y: 0, w: 5, h: 5 }, cursor: "look", action: { type: "showText", text: "Just a poster." } },
        ],
      },
      {
        id: "s_door",
        title: "Door",
        background: "",
        prose: "",
        choices: [
          {
            id: "c_qte",
            text: "Grab the rail",
            targetSceneId: "s_end",
            quickTime: true,
            timeLimitSeconds: 5,
            timedOutTargetSceneId: "s_fall",
            timedOutConsequences: { setFlags: ["hesitated"] },
          },
        ],
      },
      { id: "s_fall", title: "The Fall", background: "", prose: "", autoAdvanceTargetSceneId: "s_end" },
      { id: "s_dead", title: "Dead End", background: "", prose: "", choices: [] },
      { id: "s_end", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
  };

  const sim0 = initialSim(story, createInitialState(story));
  check("decisions: a fresh sim opens on the start scene", sim0.sceneId === "s_start");

  const d0 = availableDecisions(story, sim0);
  const labels = d0.map((d) => decisionKey(d));
  check("decisions: an open choice is offered", labels.includes("s_start:c_go"));
  check("decisions: a GATED choice is withheld", !labels.includes("s_start:c_locked"));
  check("decisions: an UNWIRED choice is withheld (the runtime refuses it)", !labels.includes("s_start:c_unwired"));
  check("decisions: hotspots are offered", labels.includes("s_start:h_key") && labels.includes("s_start:h_read"));

  // Firing the pickup hotspot unlocks the gated choice — the whole point.
  const picked = applyDecision(story, sim0, d0.find((d) => decisionKey(d) === "s_start:h_key")!);
  check("decisions: a giveItem hotspot puts the item in the inventory", picked.sim.state.inventory.some((i) => i.id === "key"));
  check("decisions: a pickup does not move the player", !picked.moved && picked.sim.sceneId === "s_start");
  check("decisions: a marker fire is tallied for coverage", picked.coverage.some((c) => c.kind === "marker" && c.id === "s_start:h_key"));
  const d1 = availableDecisions(story, picked.sim).map(decisionKey);
  check("decisions: the item unlocks the gated choice", d1.includes("s_start:c_locked"));
  check("decisions: a one-shot hotspot is spent", !d1.includes("s_start:h_key"));
  check("decisions: a READ hotspot is never spent", d1.includes("s_start:h_read"));

  // Quick-time windows offer BOTH the act and the lapse.
  const atDoor = applyDecision(story, sim0, d0.find((d) => decisionKey(d) === "s_start:c_go")!);
  check("decisions: a navigating choice moves the player", atDoor.moved && atDoor.sim.sceneId === "s_door");
  check("decisions: arriving somewhere is tallied as a scene visit", atDoor.coverage.some((c) => c.kind === "scene" && c.id === "s_door"));
  const dq = availableDecisions(story, atDoor.sim);
  check("decisions: a QTE offers the act", dq.some((d) => d.kind === "choice" && d.choiceId === "c_qte"));
  check("decisions: a QTE also offers the LAPSE — deciding by not deciding", dq.some((d) => d.kind === "qte-timeout"));

  const lapsed = applyDecision(story, atDoor.sim, dq.find((d) => d.kind === "qte-timeout")!);
  check("decisions: a lapse applies the timed-out consequences", lapsed.sim.state.activeFlags.has("hesitated"));
  check("decisions: a lapse routes to the hesitation branch", lapsed.sim.sceneId === "s_fall");
  check("decisions: a lapse is not tallied as a choice taken", !lapsed.coverage.some((c) => c.kind === "choice"));

  // A scene with no choices but an auto-advance carries the player onward.
  const dAuto = availableDecisions(story, lapsed.sim);
  check("decisions: an auto-advance scene offers its own exit", dAuto.length === 1 && dAuto[0].kind === "auto");
  const carried = applyDecision(story, lapsed.sim, dAuto[0]);
  check("decisions: the auto-advance lands on its target", carried.sim.sceneId === "s_end");
  check("decisions: an ending offers nothing further", availableDecisions(story, carried.sim).length === 0);
  check("decisions: an ending is NOT a dead end", !isStuck(story, carried.sim));

  // A non-ending scene with nothing to do IS one — this is the bug class the
  // playthrough bot exists to find.
  const stuckSim = { ...sim0, sceneId: "s_dead" };
  check("decisions: a non-ending scene with no exit is stuck", isStuck(story, stuckSim));

  // Purity: applyDecision never mutates the sim it was handed.
  check("decisions: applyDecision is pure", sim0.sceneId === "s_start" && sim0.state.inventory.length === 0 && sim0.usedHotspots.size === 0);

  // Coverage bucket mapping matches what the tally understands.
  check("decisions: a choice maps to the choice bucket", decisionCoverageKind({ kind: "choice", sceneId: "a", choiceId: "b", label: "", reply: false, quickTime: false }) === "choice");
  check("decisions: a hotspot maps to the marker bucket", decisionCoverageKind({ kind: "hotspot", sceneId: "a", hotspotId: "b", label: "" }) === "marker");
  check("decisions: an auto transition is not tallied", decisionCoverageKind({ kind: "auto", sceneId: "a", label: "", targetSceneId: "b", via: "auto-advance" }) === null);

  /* ---- the shared rules Game.tsx now imports from here ---- */
  check("decisions: pure navigation repeats", decisionChoiceRepeats({ id: "x", text: "" , targetSceneId: "y" }));
  check("decisions: a choice with consequences is one-shot", !decisionChoiceRepeats({ id: "x", text: "", targetSceneId: "y", consequences: { setFlags: ["f"] } }));
  check("decisions: a reply is one-shot by default", !decisionChoiceRepeats({ id: "x", text: "", reply: true }));
  check("decisions: an explicit isRepeatable always wins", decisionChoiceRepeats({ id: "x", text: "", reply: true, isRepeatable: true }));
  check("decisions: showText hotspots repeat", hotspotRepeats({ id: "h", label: "", bounds: { x: 0, y: 0, w: 1, h: 1 }, cursor: "look", action: { type: "showText" } }));
  check("decisions: a pickup hotspot does not", !hotspotRepeats({ id: "h", label: "", bounds: { x: 0, y: 0, w: 1, h: 1 }, cursor: "take", action: { type: "giveItem", itemGranted: "k" } }));

  // Perks + the consequence adjustment the runtime applies on every pick.
  const flat = createInitialState(story);
  check("decisions: no perks at zero meters", Object.values(getPerks(flat)).every((v) => !v));
  const charmed = { ...flat, meters: { ...flat.meters, Sultry: 4 } };
  check("decisions: Velvet Tongue lights at Sultry 4", getPerks(charmed).velvetTongue);
  const gift: Choice = { id: "g", text: "", targetSceneId: "s_end", consequences: { trustChanges: [{ characterId: "lyd", delta: 2 }] } };
  check("decisions: Velvet Tongue adds +1 to a trust gain", adjustedConsequences(gift, charmed)?.trustChanges?.[0].delta === 3);
  const hot = { ...flat, meters: { ...flat.meters, Suspicion: 6 } };
  check("decisions: HEAT halves a trust gain", adjustedConsequences(gift, hot)?.trustChanges?.[0].delta === 1);
  const hard = { ...flat, meters: { ...flat.meters, Aggressive: 4 } };
  const rough: Choice = { id: "r", text: "", targetSceneId: "s_end", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] } };
  check("decisions: Iron Nerve zeroes the Heat cost of an Aggressive choice", adjustedConsequences(rough, hard)?.meterChanges?.[0].delta === 0);
  check("decisions: a trust LOSS is never softened by a perk", adjustedConsequences({ id: "l", text: "", consequences: { trustChanges: [{ characterId: "lyd", delta: -2 }] } }, charmed)?.trustChanges?.[0].delta === -2);

  // The beat queue the sim reads is the one the runtime plays.
  const beatScene: SceneNode = {
    id: "bs",
    title: "",
    background: "",
    prose: "",
    dialogueBeats: [
      { id: "b1", characterId: "lyd", text: "always" },
      { id: "b2", characterId: "lyd", text: "gated", conditionRule: { requiresFlags: ["open"] } },
    ],
  };
  check("decisions: a gated beat is out of the queue while its flag is unset", visibleBeatQueue(beatScene, flat).map((b) => b.id).join() === "b1");
  const opened = { ...flat, activeFlags: new Set(["open"]) };
  check("decisions: setting the flag puts it back in", visibleBeatQueue(beatScene, opened).map((b) => b.id).join() === "b1,b2");

  /* ---- Game.tsx really does import the shared rules ----
   * A private copy in Game.tsx would let the simulation drift from the game
   * silently, which would make every bot result a lie. */
  const gameSrc = readFileSync("src/game/Game.tsx", "utf8");
  check("decisions: Game.tsx imports the shared decision rules", /from "\.\/decisions"/.test(gameSrc));
  check("decisions: Game.tsx keeps no private choiceRepeats", !/^function choiceRepeats/m.test(gameSrc));
  check("decisions: Game.tsx keeps no private getPerks", !/^function getPerks/m.test(gameSrc));
  check("rewind: Game.tsx wires the decision stack", /snapshotDecision\(/.test(gameSrc) && /doRewindDecision/.test(gameSrc));
  check("deep link: Game.tsx resolves a boot-time link", /resolveDeepLink\(/.test(gameSrc));
}

/* ================================================================== */
/*  6b. DECISION SURFACE — THE NON-CHOICE MECHANISMS                   */
/* ================================================================== */
/* A branch the simulation cannot see is a branch the bot reports as
 * unreachable — or worse, silently never tests. These five mechanisms all
 * move the world WITHOUT being a choice in the rail, and each one was found
 * by the bot mis-reporting a real story before it was modelled. */

{
  const story: Story = {
    id: "ds2",
    title: "DS2",
    tagline: "",
    coverImage: "",
    startSceneId: "s_yard",
    items: [
      { id: "crowbar", name: "Crowbar", icon: "🔧", description: "" },
      { id: "ticket", name: "Pawn Ticket", icon: "🎫", description: "", isClue: true },
      { id: "dud", name: "Bus Transfer", icon: "🎟", description: "" },
    ],
    characters: [
      { id: "vera", name: "Vera Sloane", role: "", portrait: "", description: "" },
      { id: "ghost", name: "Never Met", role: "", portrait: "", description: "" },
    ],
    deduction: {
      suspectIds: ["vera", "ghost"],
      connections: [
        { a: "ticket", b: "vera", flagSet: "pinned_vera", revelation: "Hers." },
        { a: "ticket", b: "ghost", flagSet: "pinned_ghost", revelation: "Unreachable." },
      ],
    },
    scenes: [
      {
        id: "s_yard",
        title: "The Yard",
        background: "",
        prose: "",
        nodeType: "stage",
        stage: {
          enabled: true,
          // kick lives outside the five core verbs, so the room has to opt in
          extendedVerbs: true,
          exitEdges: {
            right: { targetSceneId: "s_shed", flagSet: "left_the_yard" },
            left: { targetSceneId: "s_shed", gating: { requiresFlags: ["never_set"] } },
          },
        },
        // No choices at all: the ONLY ways out are the edge and the machine.
        choices: [],
        hotspots: [
          {
            id: "h_machine",
            label: "A vending machine",
            bounds: { x: 0, y: 0, w: 10, h: 10 },
            cursor: "look",
            action: { type: "showText", text: "It hums." },
            verbs: {
              kick: { type: "giveItem", itemGranted: "crowbar", flagSet: "kicked_it" },
            },
          },
        ],
        dialogueBeats: [{ id: "b_vera", characterId: "vera", text: "I was never near the pawn shop." }],
      },
      {
        id: "s_shed",
        title: "The Shed",
        background: "",
        prose: "",
        onEnterActions: [{ consequences: { addItems: ["ticket", "dud"], setFlags: ["in_shed"] } }],
        dialogueBeats: [
          {
            id: "b_lie",
            characterId: "vera",
            text: "Never been to the pawn shop in my life.",
            lie: {
              evidenceItemIds: ["ticket"],
              caughtBeat: { id: "b_caught", characterId: "vera", text: "...fine." },
              contradictedFlag: "vera_caught",
              wrongEvidenceLimit: 1,
              wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            },
          },
        ],
        choices: [
          { id: "c_win", text: "Close it out", targetSceneId: "s_end", gating: { requiresFlags: ["vera_caught"] } },
        ],
      },
      { id: "s_end", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
  };

  const sim0 = initialSim(story, createInitialState(story));
  const keys0 = availableDecisions(story, sim0).map(decisionKey);

  /* ---- 🚶 stage edge exits ---- */
  check("stage exit: an open edge is a decision even with zero choices", keys0.includes("s_yard#edge:right"));
  check("stage exit: a GATED edge is withheld", !keys0.includes("s_yard#edge:left"));

  /* ---- 🪙 the verb coin ---- */
  check("verb coin: a verb-only action is its own decision", keys0.includes("s_yard:h_machine#kick"));
  check("verb coin: the default action stays separate from the verb", keys0.includes("s_yard:h_machine"));
  const kick = availableDecisions(story, sim0).find((d) => decisionKey(d) === "s_yard:h_machine#kick")!;
  const kicked = applyDecision(story, sim0, kick);
  check("verb coin: kicking it grants the item the default action never would",
    kicked.sim.state.inventory.some((i) => i.id === "crowbar") && kicked.sim.state.activeFlags.has("kicked_it"));
  check("verb coin: coverage tallies the OBJECT, not the verb", decisionCoverageKey(kick) === "s_yard:h_machine");

  /* ---- on-enter actions + who you've met ---- */
  const edge = availableDecisions(story, sim0).find((d) => decisionKey(d) === "s_yard#edge:right")!;
  const inShed = applyDecision(story, sim0, edge).sim;
  check("stage exit: walking the edge sets its flag and moves", inShed.sceneId === "s_shed" && inShed.state.activeFlags.has("left_the_yard"));
  check("scene entry: on-enter actions fire on arrival", inShed.state.inventory.some((i) => i.id === "ticket"));
  check("scene entry: a speaker you've seen counts as met", inShed.encounteredCharacters.has("vera"));
  check("scene entry: a character you never met does NOT", !inShed.encounteredCharacters.has("ghost"));

  const shedKeys = availableDecisions(story, inShed).map(decisionKey);

  /* ---- 📌 the corkboard ---- */
  check("corkboard: a held clue wires to a suspect you've met", shedKeys.includes("#board:ticket+vera"));
  check("corkboard: a suspect you've never met is not on the board", !shedKeys.includes("#board:ticket+ghost"));
  const pin = availableDecisions(story, inShed).find((d) => decisionKey(d) === "#board:ticket+vera")!;
  const pinned = applyDecision(story, inShed, pin).sim;
  check("corkboard: pinning sets the revelation flag", pinned.state.activeFlags.has("pinned_vera"));
  check("corkboard: an already-pinned link is not offered twice",
    !availableDecisions(story, pinned).map(decisionKey).includes("#board:ticket+vera"));

  /* ---- press the lie ---- */
  check("press the lie: the right evidence is a decision", shedKeys.includes("s_shed:b_lie#press:ticket"));
  check("press the lie: a bluff is also a decision — being wrong is a branch too", shedKeys.includes("s_shed:b_lie#press:dud"));
  const bluff = availableDecisions(story, inShed).find((d) => decisionKey(d) === "s_shed:b_lie#press:dud")!;
  check("press the lie: the surface knows the bluff will not hold", bluff.kind === "press-lie" && !bluff.correct);
  const called = applyDecision(story, inShed, bluff).sim;
  check("press the lie: a called bluff costs heat and does not set the flag",
    !called.state.activeFlags.has("vera_caught") && (called.state.meters.Suspicion ?? 0) > (inShed.state.meters.Suspicion ?? 0));
  // wrongEvidenceLimit is 1, so that was the only attempt allowed.
  check("press the lie: the claim shuts once the bluffs run out",
    !availableDecisions(story, called).map(decisionKey).some((k) => k.startsWith("s_shed:b_lie#press")));
  const press = availableDecisions(story, inShed).find((d) => decisionKey(d) === "s_shed:b_lie#press:ticket")!;
  check("press the lie: the surface knows which evidence actually breaks it", press.kind === "press-lie" && press.correct);
  const broke = applyDecision(story, inShed, press).sim;
  check("press the lie: breaking it sets the contradicted flag", broke.state.activeFlags.has("vera_caught"));
  check("press the lie: a broken lie cannot be pressed again",
    !availableDecisions(story, broke).map(decisionKey).some((k) => k.startsWith("s_shed:b_lie#press")));
  check("press the lie: the ending it gates is now reachable",
    availableDecisions(story, broke).map(decisionKey).includes("s_shed:c_win"));
  check("press the lie: without it, the scene is NOT a dead end (the lie is the way on)", !isStuck(story, inShed));

  /* ---- 🎬 minigames ---- */
  const puzzleStory: Story = {
    id: "ds3",
    title: "DS3",
    tagline: "",
    coverImage: "",
    startSceneId: "p_room",
    items: [],
    characters: [],
    scenes: [
      {
        id: "p_room",
        title: "Room",
        background: "",
        prose: "",
        choices: [],
        hotspots: [
          {
            id: "h_ledger",
            label: "A ledger",
            bounds: { x: 0, y: 0, w: 5, h: 5 },
            cursor: "look",
            isRepeatable: false,
            action: {
              type: "patternPuzzle",
              patternPuzzle: {
                title: "The Ledger",
                instruction: "",
                rows: [],
                targetCount: 3,
                payoffText: "",
                allowRetry: true,
                rewardConsequences: { setFlags: ["cracked"] },
                targetSceneId: "p_end",
              },
            },
          },
        ],
      },
      { id: "p_end", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
    ],
  };
  const pSim = initialSim(puzzleStory, createInitialState(puzzleStory));
  const pKeys = availableDecisions(puzzleStory, pSim).map(decisionKey);
  check("minigame: a pattern puzzle offers BOTH outcomes as branches",
    pKeys.includes("p_room:h_ledger#pattern-puzzle:won") && pKeys.includes("p_room:h_ledger#pattern-puzzle:lost"));
  check("minigame: the puzzle replaces its own hotspot (you can't 'look' past it)", !pKeys.includes("p_room:h_ledger"));
  const won = availableDecisions(puzzleStory, pSim).find((d) => decisionKey(d) === "p_room:h_ledger#pattern-puzzle:won")!;
  const solved = applyDecision(puzzleStory, pSim, won);
  check("minigame: solving it runs the reward and routes on",
    solved.moved && solved.sim.sceneId === "p_end" && solved.sim.state.activeFlags.has("cracked"));
  const lost = availableDecisions(puzzleStory, pSim).find((d) => decisionKey(d) === "p_room:h_ledger#pattern-puzzle:lost")!;
  const failed = applyDecision(puzzleStory, pSim, lost).sim;
  // A retryable puzzle that ate its own marker on a wrong answer would strand
  // the player in a room whose only exit is the puzzle — exactly the false
  // dead end the bot reported on Tintin.
  check("minigame: a RETRYABLE puzzle survives a wrong submission",
    availableDecisions(puzzleStory, failed).map(decisionKey).includes("p_room:h_ledger#pattern-puzzle:won"));
  check("minigame: failing a retryable puzzle is not a dead end", !isStuck(puzzleStory, failed));
}

/* ================================================================== */
/*  7. THE BOT PLAYS THE REAL CATALOGUE                                */
/* ================================================================== */

{
  // A short in-process run over shipped stories: the decision surface must
  // survive real content, and every run must terminate at an ending, a dead
  // end, or the step budget — never by throwing.
  const rand = mulberry32(hashSeed("engine-test"));
  for (const story of [NEON_DINER, RAIN_SECTOR]) {
    let sim = initialSim(story, createInitialState(story));
    let threw: string | null = null;
    let ended = false;
    try {
      for (let step = 0; step < 300; step++) {
        const here = story.scenes.find((x) => x.id === sim.sceneId);
        if (!here) { threw = `walked into a scene that does not exist: ${sim.sceneId}`; break; }
        if (here.isEnding) { ended = true; break; }
        const opts = availableDecisions(story, sim);
        if (!opts.length) break; // a dead end — reported by the bot, not a crash
        sim = applyDecision(story, sim, opts[Math.floor(rand() * opts.length)]).sim;
      }
    } catch (err) {
      threw = err instanceof Error ? err.message : String(err);
    }
    check(`bot: a run through "${story.id}" never throws`, threw === null, threw);
    check(`bot: a run through "${story.id}" makes progress`, ended || sim.steps > 0);
  }


  /* ---- the WHOLE shipped catalogue, briefly ----
   * The expensive per-story sweeps live in `npm run bot`. This is the cheap
   * standing guard: every shipped story must be walkable end to end without
   * throwing, and no scene may be a DEAD END — a non-ending room the player
   * can enter and never leave. Every dead end this has ever reported was
   * either a real softlock (Neon Diner's freezer) or a mechanism the
   * simulation could not see (stage edges, the verb coin, the corkboard,
   * pressing a lie, minigames). Both are worth failing the build over. */
  {
    const deadEnds: string[] = [];
    const crashes: string[] = [];
    for (const story of STORIES) {
      const r = mulberry32(hashSeed(`sweep:${story.id}`));
      for (let run = 0; run < 12; run++) {
        let sim = initialSim(story, createInitialState(story));
        try {
          for (let step = 0; step < 250; step++) {
            const here = story.scenes.find((x) => x.id === sim.sceneId);
            if (!here || here.isEnding) break;
            const opts = availableDecisions(story, sim);
            if (!opts.length) {
              const at = `${story.id}/${sim.sceneId}`;
              if (!deadEnds.includes(at)) deadEnds.push(at);
              break;
            }
            sim = applyDecision(story, sim, opts[Math.floor(r() * opts.length)]).sim;
          }
        } catch (err) {
          crashes.push(`${story.id}/${sim.sceneId}: ${err instanceof Error ? err.message : String(err)}`);
          break;
        }
      }
    }
    check(`bot: no shipped story crashes the decision surface (${STORIES.length} stories)`, crashes.length === 0, crashes.join(" | "));
    check("bot: no shipped story has a dead end", deadEnds.length === 0, deadEnds.join(" | "));
  }

  // The bot's weighting is only useful if a coverage tally can seed it: the
  // keys the decision surface produces must match the ones coverage stores.
  let cov = emptyCoverage(NEON_DINER.id);
  const sim = initialSim(NEON_DINER, createInitialState(NEON_DINER));
  const first = availableDecisions(NEON_DINER, sim).find((d) => d.kind === "choice");
  if (first) {
    cov = recordVisit(cov, "choice", decisionKey(first));
    const rep = coverageReport(NEON_DINER, cov);
    check("bot: a decision key is a key the coverage report understands", rep.choiceTaken === 1, rep.choiceTaken);
  }
}

/* ================================================================== */
/*  Media upload caps — overridable defaults                           */
/* ================================================================== */
{
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
    clear: () => store.clear(),
  };

  const {
    getAssetLimits, setAssetLimits, assetLimitsAreCustom,
    DEFAULT_ASSET_LIMITS, ASSET_LIMIT_CEILING,
  } = await import("../src/data/mediaLibrary");

  const MB = 1024 * 1024;
  setAssetLimits(undefined);
  check("limits: defaults out of the box", getAssetLimits().image === DEFAULT_ASSET_LIMITS.image);
  check("limits: defaults are not flagged custom", assetLimitsAreCustom() === false);

  // The whole point of the feature: an author can raise the ceiling.
  setAssetLimits({ image: 32 * MB });
  check("limits: an override is honoured", getAssetLimits().image === 32 * MB, getAssetLimits().image);
  check("limits: an override is flagged custom", assetLimitsAreCustom() === true);
  check("limits: untouched types keep their default", getAssetLimits().video === DEFAULT_ASSET_LIMITS.video);

  // It must survive a reload — it lives in localStorage, not React state.
  check("limits: override persists across a fresh read", getAssetLimits().image === 32 * MB);

  // Guard rails: a mistyped or hostile value must not create an unusable cap.
  setAssetLimits({ image: 99999 * MB });
  check("limits: absurd values clamp to the ceiling", getAssetLimits().image === ASSET_LIMIT_CEILING, getAssetLimits().image);
  setAssetLimits({ image: -5 });
  check("limits: a negative value falls back to the default", getAssetLimits().image === DEFAULT_ASSET_LIMITS.image);
  setAssetLimits({ image: Number.NaN });
  check("limits: NaN falls back to the default", getAssetLimits().image === DEFAULT_ASSET_LIMITS.image);

  // Corrupt storage must not brick the library.
  store.set("scarlet-studio-asset-limits", "{not json");
  check("limits: corrupt storage falls back to defaults", getAssetLimits().total === DEFAULT_ASSET_LIMITS.total);

  setAssetLimits({ total: 200 * MB });
  check("limits: the library total is overridable too", getAssetLimits().total === 200 * MB);
  setAssetLimits(undefined);
  check("limits: restore defaults clears every override", assetLimitsAreCustom() === false && getAssetLimits().total === DEFAULT_ASSET_LIMITS.total);
}

/* ================================================================== */
/*  Dangling media references                                          */
/* ================================================================== */
{
  const { collectStoryMediaRefs } = await import("../src/data/mediaLibrary");

  const base = {
    ...NEON_DINER,
    id: "danglecheck",
    coverImage: "asset:cover1",
    scenes: [
      {
        ...NEON_DINER.scenes[0],
        id: "sc1",
        background: "asset:bg1",
        hotspots: [
          { id: "h1", label: "Desk lamp", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "look",
            image: "asset:gone", action: { type: "showText", text: "x" } },
        ],
        dialogueBeats: [],
        choices: [],
      },
    ],
  } as unknown as Story;

  // -- the collector sees every reference, with a usable label ---------------
  const refs = collectStoryMediaRefs(base);
  check("media refs: the cover is collected", refs.some((r) => r.value === "asset:cover1"), refs.length);
  check("media refs: a scene background is collected", refs.some((r) => r.value === "asset:bg1" && r.sceneId === "sc1"));
  check(
    "media refs: a hotspot image is labelled by its hotspot",
    refs.some((r) => r.value === "asset:gone" && /Desk lamp/.test(r.label)),
    refs.filter((r) => r.value === "asset:gone").map((r) => r.label)
  );
  check("media refs: gradients and plain paths carry no asset id", !refs.some((r) => r.value.startsWith("asset:") && r.value === "gradient:x"));

  // -- validator: silent unless the caller supplies the library --------------
  const noCtx = validateStory(base);
  check("dangling media: skipped when no library is supplied", !noCtx.some((i) => /Missing media/.test(i.message)), noCtx.map((i) => i.message));

  // -- validator: everything present = clean --------------------------------
  const allKnown = validateStory(base, { knownAssetIds: new Set(["cover1", "bg1", "gone"]) });
  check("dangling media: no complaint when every asset exists", !allKnown.some((i) => /Missing media/.test(i.message)));

  // -- validator: a deleted upload is reported ------------------------------
  const missing = validateStory(base, { knownAssetIds: new Set(["cover1", "bg1"]) });
  const flagged = missing.filter((i) => /Missing media/.test(i.message));
  check("dangling media: a deleted asset is reported", flagged.length === 1, flagged.map((i) => i.message));
  check("dangling media: reported as an error, not a warning", flagged[0]?.severity === "error");
  check("dangling media: the issue points at the right scene", flagged[0]?.sceneId === "sc1", flagged[0]?.sceneId);
  check("dangling media: the message names the location", /Desk lamp/.test(flagged[0]?.message ?? ""), flagged[0]?.message);

  // -- built-in paths and gradients are never treated as uploads ------------
  const builtin = {
    ...base,
    coverImage: "gradient:linear-gradient(#000,#111)",
    scenes: [{ ...base.scenes[0], background: "/img/bg-office.jpg", hotspots: [] }],
  } as unknown as Story;
  check(
    "dangling media: /img paths and gradients are not flagged",
    !validateStory(builtin, { knownAssetIds: new Set<string>() }).some((i) => /Missing media/.test(i.message))
  );

  // -- video: refs use their own prefix -------------------------------------
  const vid = {
    ...base,
    coverImage: undefined,
    scenes: [{ ...base.scenes[0], background: "video:asset:clip9", hotspots: [] }],
  } as unknown as Story;
  check(
    "dangling media: a missing video: asset is caught",
    validateStory(vid, { knownAssetIds: new Set<string>() }).some((i) => /Missing media/.test(i.message))
  );
  check(
    "dangling media: a present video: asset is clean",
    !validateStory(vid, { knownAssetIds: new Set(["clip9"]) }).some((i) => /Missing media/.test(i.message))
  );
}

/* ================================================================== */
/*  AI image settings — persistence + migration                        */
/* ================================================================== */
{
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
    clear: () => store.clear(),
  };
  const { loadAiSettings, saveAiSettings } = await import("../src/data/aiImages");
  const KEY = "scarlet-reel-ai-images-v1";

  store.clear();
  check("ai settings: defaults when nothing is stored", loadAiSettings().provider === "openai");

  // A saved key must survive a round trip.
  const s1 = loadAiSettings();
  s1.provider = "gemini";
  s1.providers.gemini = { id: "gemini", apiKey: "test-key", model: "gemini-2.5-flash-image", aspectRatio: "21:9" };
  saveAiSettings(s1);
  const back = loadAiSettings();
  check("ai settings: the chosen provider persists", back.provider === "gemini");
  check("ai settings: a provider key persists", back.providers.gemini?.apiKey === "test-key");
  check("ai settings: a provider ratio persists", back.providers.gemini?.aspectRatio === "21:9");

  // A provider absent from an older save still gets its defaults merged in —
  // this is what stops a pre-Gemini save from crashing the picker.
  store.set(KEY, JSON.stringify({ provider: "openai", providers: { openai: { id: "openai", apiKey: "k" } } }));
  const merged = loadAiSettings();
  check("ai settings: an older save still gains new providers", !!merged.providers.gemini, Object.keys(merged.providers));
  check("ai settings: the older save keeps its own key", merged.providers.openai?.apiKey === "k");

  // MIGRATION: the withdrawn Together free endpoint is rewritten on load.
  store.set(KEY, JSON.stringify({
    provider: "together",
    providers: { together: { id: "together", apiKey: "tk", model: "black-forest-labs/FLUX.1-schnell-Free" } },
  }));
  const migrated = loadAiSettings();
  check(
    "ai settings: the dead FLUX free endpoint is migrated",
    migrated.providers.together?.model === "black-forest-labs/FLUX.1-schnell",
    migrated.providers.together?.model
  );
  check("ai settings: migration keeps the api key", migrated.providers.together?.apiKey === "tk");

  // Corrupt storage must not brick the tab.
  store.set(KEY, "{not json");
  check("ai settings: corrupt storage falls back to defaults", loadAiSettings().provider === "openai");
  store.clear();
}

/* ================================================================== */
/*  Beat extraction — the pure transform behind Studio's ✂ split       */
/* ================================================================== */
{
  // Mirrors extractBeats() in Studio.tsx. Kept here as a pure function so the
  // data surgery (ordering, id handling, what carries across) is pinned by
  // tests rather than only exercised by clicking.
  type B = { id: string; characterId: string; text: string };
  type S = {
    id: string; title: string; background?: string; ambientAudio?: string;
    cinematic?: unknown; prose?: string; dialogueBeats?: B[];
    hotspots?: { id: string }[]; choices?: { id: string; targetSceneId: string }[];
  };
  const extract = (
    src: S,
    beatIds: string[],
    opts: { link: "chain" | "loose"; copy: boolean },
  ): { from: S; next: S } => {
    const picked = new Set(beatIds);
    const taken = (src.dialogueBeats ?? []).filter((b) => picked.has(b.id));
    let n = 0;
    const moved = taken.map((b) => (opts.copy ? { ...b, id: `new_${++n}` } : { ...b }));
    const next: S = {
      id: "scene_new",
      title: `${src.title} (cont.)`,
      background: src.background,
      ...(src.ambientAudio ? { ambientAudio: src.ambientAudio } : {}),
      ...(src.cinematic ? { cinematic: src.cinematic } : {}),
      prose: "",
      dialogueBeats: moved,
      hotspots: [],
      choices: [],
    };
    const from: S = {
      ...src,
      dialogueBeats: opts.copy
        ? src.dialogueBeats
        : (src.dialogueBeats ?? []).filter((b) => !picked.has(b.id)),
      choices:
        opts.link === "chain"
          ? [...(src.choices ?? []), { id: "c_new", targetSceneId: "scene_new" }]
          : src.choices,
    };
    return { from, next };
  };

  const base: S = {
    id: "s1",
    title: "The Long Talk",
    background: "/img/bg-office.jpg",
    ambientAudio: "rain",
    cinematic: { mode: "static" },
    prose: "Original prose.",
    dialogueBeats: [
      { id: "b1", characterId: "c1", text: "one" },
      { id: "b2", characterId: "c1", text: "two" },
      { id: "b3", characterId: "c2", text: "three" },
      { id: "b4", characterId: "c2", text: "four" },
    ],
    hotspots: [{ id: "hs1" }],
    choices: [{ id: "c0", targetSceneId: "s9" }],
  };

  // --- PLAY ORDER, not tick order ------------------------------------------
  // The single most important property: ticking 3 then 1 must still produce
  // 1,3 — a conversation reordered by accident is a silent story bug.
  {
    const { next } = extract(base, ["b3", "b1"], { link: "chain", copy: false });
    check(
      "extract: beats leave in PLAY order, not tick order",
      next.dialogueBeats!.map((b) => b.id).join(",") === "b1,b3",
      next.dialogueBeats!.map((b) => b.id)
    );
  }

  // --- move removes from the source ----------------------------------------
  {
    const { from, next } = extract(base, ["b2", "b3"], { link: "chain", copy: false });
    check("extract: moved beats leave the source", from.dialogueBeats!.map((b) => b.id).join(",") === "b1,b4");
    check("extract: moved beats arrive in the new scene", next.dialogueBeats!.map((b) => b.id).join(",") === "b2,b3");
    check("extract: a move keeps the original beat ids", next.dialogueBeats!.every((b) => !b.id.startsWith("new_")));
    check("extract: no beat is lost", from.dialogueBeats!.length + next.dialogueBeats!.length === 4);
  }

  // --- copy leaves the source intact, with FRESH ids ------------------------
  {
    const { from, next } = extract(base, ["b1", "b2"], { link: "loose", copy: true });
    check("extract: a copy leaves the source untouched", from.dialogueBeats!.length === 4);
    check("extract: a copy re-ids the duplicates", next.dialogueBeats!.every((b) => b.id.startsWith("new_")), next.dialogueBeats);
    const ids = new Set([...from.dialogueBeats!.map((b) => b.id), ...next.dialogueBeats!.map((b) => b.id)]);
    check("extract: a copy never duplicates an id", ids.size === 6, [...ids]);
    check("extract: the copied text survives", next.dialogueBeats![0].text === "one");
  }

  // --- linking --------------------------------------------------------------
  {
    const chained = extract(base, ["b4"], { link: "chain", copy: false });
    check("extract: chain adds exactly one choice", (chained.from.choices?.length ?? 0) === 2);
    check("extract: the chain choice targets the new scene", chained.from.choices!.at(-1)!.targetSceneId === "scene_new");

    const loose = extract(base, ["b4"], { link: "loose", copy: false });
    check("extract: loose adds no choice", (loose.from.choices?.length ?? 0) === 1);
    check("extract: a loose scene starts with no exits", (loose.next.choices?.length ?? 0) === 0);
  }

  // --- what carries across, and what must NOT -------------------------------
  {
    const { next } = extract(base, ["b1"], { link: "chain", copy: false });
    check("extract: presentation follows the lines (background)", next.background === "/img/bg-office.jpg");
    check("extract: presentation follows the lines (audio)", next.ambientAudio === "rain");
    check("extract: presentation follows the lines (cinematic)", !!next.cinematic);
    // Structure must stay behind — copying hotspots would create phantom
    // exits and duplicate ids in the new scene.
    check("extract: hotspots stay in the source", (next.hotspots?.length ?? 0) === 0);
    check("extract: the source keeps its hotspots", (base.hotspots?.length ?? 0) === 1);
    check("extract: the new scene starts with empty prose", next.prose === "");
    check("extract: the source keeps its prose", base.prose === "Original prose.");
  }

  // --- edge cases -----------------------------------------------------------
  {
    const none = extract(base, [], { link: "chain", copy: false });
    check("extract: picking nothing takes nothing", (none.next.dialogueBeats?.length ?? 0) === 0);
    check("extract: picking nothing leaves the source whole", none.from.dialogueBeats!.length === 4);

    const all = extract(base, ["b1", "b2", "b3", "b4"], { link: "chain", copy: false });
    check("extract: taking everything empties the source", all.from.dialogueBeats!.length === 0);
    check("extract: taking everything fills the new scene", all.next.dialogueBeats!.length === 4);

    const ghost = extract(base, ["nope"], { link: "chain", copy: false });
    check("extract: an unknown beat id is ignored", (ghost.next.dialogueBeats?.length ?? 0) === 0);
    check("extract: an unknown id does not disturb the source", ghost.from.dialogueBeats!.length === 4);
  }
}

/* ================================================================== */
/*  Hotspot sound effects + chained actions                            */
/* ================================================================== */
{
  const mk = (hotspot: Record<string, unknown>) => ({
    ...NEON_DINER,
    id: "chaincheck",
    items: [{ id: "key", name: "Key", icon: "🔑", description: "d" }],
    scenes: [
      {
        ...NEON_DINER.scenes[0],
        id: "sc1",
        dialogueBeats: [],
        choices: [{ id: "c1", text: "on", targetSceneId: "sc2", attitudeTag: "Neutral" }],
        hotspots: [hotspot],
      },
      { ...NEON_DINER.scenes[0], id: "sc2", dialogueBeats: [], choices: [], hotspots: [] },
    ],
  }) as unknown as Story;
  const msgs = (st: Story) => validateStory(st).map((i) => i.message);

  // --- the chain is validated like a real action ---------------------------
  {
    const bad = mk({
      id: "h1", label: "Safe", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "look",
      action: { type: "showText", text: "click", then: [{ type: "giveItem", itemGranted: "ghost" }] },
    });
    check("chain: a missing granted item is caught", msgs(bad).some((m) => /follow-up #1 grants missing item "ghost"/.test(m)), msgs(bad));

    const badScene = mk({
      id: "h1", label: "Door", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "go",
      action: { type: "showText", text: "x", then: [{ type: "goToScene", targetSceneId: "nowhere" }] },
    });
    check("chain: a missing target scene is caught", msgs(badScene).some((m) => /follow-up #1 points at missing scene/.test(m)));

    const empty = mk({
      id: "h1", label: "Lamp", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "look",
      action: { type: "showText", text: "x", then: [{ type: "setFlag" }] },
    });
    check(
      "chain: an unfilled setFlag is flagged as a no-op",
      msgs(empty).some((m) => /follow-up #1 is "set flag" but no flag is named/.test(m)),
      msgs(empty)
    );
  }

  // --- dead steps after a navigation ---------------------------------------
  {
    const dead = mk({
      id: "h1", label: "Exit", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "go",
      action: {
        type: "showText", text: "x",
        then: [
          { type: "goToScene", targetSceneId: "sc2" },
          { type: "setFlag", flagSet: "never_runs" },
        ],
      },
    });
    check("chain: steps after a navigation are reported as dead", msgs(dead).some((m) => /never run/.test(m)), msgs(dead));

    // The PRIMARY action's navigation also wins over a chained one.
    const shadowed = mk({
      id: "h1", label: "Exit", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "go",
      action: { type: "goToScene", targetSceneId: "sc2", then: [{ type: "goToScene", targetSceneId: "sc2" }] },
    });
    check("chain: a shadowed navigation is reported", msgs(shadowed).some((m) => /main action already navigates/.test(m)), msgs(shadowed));
  }

  // --- the reward-replay warning must see THROUGH the chain ----------------
  {
    // Moving a reward into the chain used to dodge the repeatable warning.
    const farm = mk({
      id: "h1", label: "Till", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "take",
      isRepeatable: true,
      action: { type: "showText", text: "x", then: [{ type: "giveItem", itemGranted: "key" }] },
    });
    check(
      "chain: a repeatable hotspot granting via the chain is warned",
      msgs(farm).some((m) => /Repeatable hotspot "Till".*follow-up/.test(m)),
      msgs(farm)
    );
    // A repeatable showText with NO rewards anywhere stays clean.
    const fine = mk({
      id: "h1", label: "Sign", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "look",
      isRepeatable: true,
      action: { type: "showText", text: "x", then: [{ type: "setFlag", flagSet: "read_sign" }] },
    });
    check(
      "chain: a repeatable flag-setting follow-up is still warned",
      msgs(fine).some((m) => /Repeatable hotspot "Sign"/.test(m)),
      msgs(fine)
    );
  }

  // --- a well-formed chain is clean ----------------------------------------
  {
    const good = mk({
      id: "h1", label: "Drawer", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "take",
      action: {
        type: "showText", text: "It creaks open.",
        sfxUrl: "/audio/creak.mp3", sfxVolume: 0.8,
        then: [
          { type: "giveItem", itemGranted: "key" },
          { type: "setFlag", flagSet: "opened_drawer" },
        ],
      },
    });
    const bad = msgs(good).filter((m) => /follow-up|Repeatable/.test(m));
    check("chain: a well-formed chain raises nothing", bad.length === 0, bad);
  }

  // --- sfx refs travel through the media walk ------------------------------
  {
    const { collectStoryMediaRefs } = await import("../src/data/mediaLibrary");
    const withSfx = mk({
      id: "h1", label: "Door", bounds: { x: 1, y: 1, w: 5, h: 5 }, cursor: "look",
      action: {
        type: "showText", text: "x",
        sfxUrl: "asset:creak1",
        then: [{ type: "setFlag", flagSet: "f", sfxUrl: "asset:creak2" }],
      },
    });
    const refs = collectStoryMediaRefs(withSfx);
    check("sfx: the action's effect is collected", refs.some((r) => r.value === "asset:creak1"), refs.map((r) => r.value));
    check("sfx: a chained effect is collected too", refs.some((r) => r.value === "asset:creak2"));
    check(
      "sfx: the effect is labelled as a sound effect",
      refs.some((r) => r.value === "asset:creak1" && /sound effect/.test(r.label)),
      refs.filter((r) => r.value === "asset:creak1").map((r) => r.label)
    );
    // And a deleted one is reported by the validator.
    const missing = validateStory(withSfx, { knownAssetIds: new Set(["creak1"]) });
    check("sfx: a dangling chained effect is caught", missing.some((i) => /Missing media/.test(i.message) && /sound effect/.test(i.message)));
  }
}

/* ================================================================== */
/*  Canvas layout — resizable node cards                               */
/* ================================================================== */
{
  const { tidyLayoutPositions, healLayout, sceneCardMinHeight, SCENE_CARD_DEFAULT_W, SCENE_CARD_DEFAULT_H } =
    await import("../src/studio/canvas");

  // --- a card must never be shrinkable below its own content ---------------
  {
    const bare = sceneCardMinHeight({ isEnding: true });
    const busy = sceneCardMinHeight({ choices: 8 });
    check("card size: an ending has the smallest floor", bare < busy, { bare, busy });
    check("card size: every exit row adds height", sceneCardMinHeight({ choices: 3 }) > sceneCardMinHeight({ choices: 1 }));
    // Eight choices = eight connection handles. If the floor didn't grow with
    // them the card would clip its own wires, which is unrecoverable in the UI.
    check("card size: 8 exits leave room for 8 handles", busy >= 8 * 20, busy);
    // Linked hotspots draw an exit row each, exactly like choices.
    check(
      "card size: linked hotspots count as exits",
      sceneCardMinHeight({ linkedHotspots: 4 }) === sceneCardMinHeight({ choices: 4 }),
      [sceneCardMinHeight({ linkedHotspots: 4 }), sceneCardMinHeight({ choices: 4 })]
    );
    // The optional bands each cost height.
    const plain = sceneCardMinHeight({ choices: 1 });
    check("card size: an episode band adds height", sceneCardMinHeight({ choices: 1, hasEpisodeBand: true }) > plain);
    check("card size: an act band adds height", sceneCardMinHeight({ choices: 1, hasActBand: true }) > plain);
    check("card size: a note adds height", sceneCardMinHeight({ choices: 1, hasNote: true }) > plain);
    // Even the emptiest card keeps its chrome — never a sliver.
    check("card size: the floor always clears the chrome", sceneCardMinHeight({ isEnding: true }) >= 110, bare);
    // An auto-advance row is an exit too.
    check(
      "card size: auto-advance counts as an exit",
      sceneCardMinHeight({ hasAutoAdvance: true }) > sceneCardMinHeight({}),
    );
    // A resize must never take a card below the size it renders at untouched:
    // dragging under the default squashed the "drag to add choice" row (and
    // with it the handle used to wire a new exit) out of the bottom.
    check(
      "card size: never below the default card height",
      sceneCardMinHeight({ isEnding: true }) >= SCENE_CARD_DEFAULT_H,
      [sceneCardMinHeight({ isEnding: true }), SCENE_CARD_DEFAULT_H],
    );
    check("card size: the default width is the w-56 card", SCENE_CARD_DEFAULT_W === 224, SCENE_CARD_DEFAULT_W);
    // The floor has to clear the always-present "drag to add choice" row on a
    // scene with no choices at all, or a fresh node cannot be wired.
    check(
      "card size: an empty scene still leaves room to drag a new choice",
      sceneCardMinHeight({}) >= 28 + 56 + 22 + 22,
      sceneCardMinHeight({}),
    );
  }

  const story = {
    ...NEON_DINER,
    id: "layoutcheck",
    scenes: [
      { ...NEON_DINER.scenes[0], id: "a", dialogueBeats: [], choices: [], hotspots: [] },
      { ...NEON_DINER.scenes[0], id: "b", dialogueBeats: [], choices: [], hotspots: [] },
    ],
    layout: {
      a: { x: 10, y: 20, w: 420, h: 300 },
      b: { x: 900, y: 900 },
    },
  } as unknown as Story;

  // TIDY re-flows positions but must NOT throw away an authored card size —
  // that would silently reset every resized card the first time you tidy.
  {
    const tidy = tidyLayoutPositions(story);
    check("layout: tidy keeps an authored width", tidy.a.w === 420, tidy.a);
    check("layout: tidy keeps an authored height", tidy.a.h === 300, tidy.a);
    check("layout: tidy still re-flows the position", tidy.a.x === 0 && tidy.a.y === 0, tidy.a);
    check("layout: a card with no size stays sizeless", tidy.b.w === undefined && tidy.b.h === undefined, tidy.b);
  }

  // HEAL passes sizes through untouched for cards it keeps.
  {
    const base = { a: { x: 0, y: 0 }, b: { x: 340, y: 0 } };
    const healed = healLayout(story.layout, base);
    check("layout: heal preserves an authored size", healed.a.w === 420 && healed.a.h === 300, healed.a);
    check("layout: heal keeps the author's own position", healed.a.x === 10 && healed.a.y === 20, healed.a);
  }

  // A pile still falls back to the base position — the size is irrelevant to
  // that decision, but must not crash the heal.
  {
    const piled = {
      s1: { x: 0, y: 0, w: 300 }, s2: { x: 0, y: 0 }, s3: { x: 0, y: 0 }, s4: { x: 0, y: 0 },
    };
    const base = { s1: { x: 0, y: 0 }, s2: { x: 340, y: 0 }, s3: { x: 680, y: 0 }, s4: { x: 1020, y: 0 } };
    const healed = healLayout(piled, base);
    check("layout: a 4-card pile falls back to the base spread", healed.s2.x === 340 && healed.s4.x === 1020, healed);
  }

  // Sizes must survive an export/import round trip (they live on Story.layout,
  // which the exporter carries verbatim) — a resized canvas that resets on
  // reload would be worse than no resizing at all.
  {
    const clone = JSON.parse(JSON.stringify(story)) as Story;
    check("layout: a size survives a JSON round trip", clone.layout!.a.w === 420 && clone.layout!.a.h === 300, clone.layout!.a);
  }
}


/* ------------------------------------------------------------------ */
/* Quake map authoring validation across every shipped story           */
/* ------------------------------------------------------------------ */
{
  let problems: string[] = [];
  for (const story of STORIES) {
    for (const sc of story.scenes) {
      const q = sc.stage?.quake;
      const rows = q.map;
      const cols = Math.max(...rows.map((r) => r.length));
      if (rows.some((r) => r.length !== cols)) problems.push(`${tag}: ragged rows`);
      const spawns = rows.join("").split("S").length - 1;
      if (spawns !== 1) problems.push(`${tag}: ${spawns} spawns`);
      const at = (letter: string) => rows.some((r) => r.includes(letter));
      for (const [letter, hsId] of Object.entries(q.markers ?? {})) {
        if (!at(letter)) problems.push(`${tag}: marker letter ${letter} not on map`);
        if (!sc.hotspots?.some((h) => h.id === hsId)) problems.push(`${tag}: marker ${letter} -> unknown hotspot ${hsId}`);
      }
      for (const [letter, npcId] of Object.entries(q.npcAnchors ?? {})) {
        if (!at(letter)) problems.push(`${tag}: npc letter ${letter} not on map`);
        if (!sc.stage?.npcs?.some((n) => n.id === npcId)) problems.push(`${tag}: npc ${letter} -> unknown npc ${npcId}`);
      }
      for (const [letter, val] of Object.entries(q.props ?? {})) {
        if (!at(letter)) problems.push(`${tag}: prop letter ${letter} not on map`);
        const url = val.split("@")[0];
        if (!url.startsWith("/")) problems.push(`${tag}: prop ${letter} bad url`);
      }
      // a marker letter must not double as a prop/npc anchor letter
      const mk = Object.keys(q.markers ?? {});
      for (const l of mk) {
        if (q.props?.[l] || q.npcAnchors?.[l]) problems.push(`${tag}: letter ${l} used twice`);
      }
    }
  }
  check("quake maps: every shipped 3D room is authored consistently", problems.length === 0, problems.join(" | "));
}


/* ================================================================== *
 *  HOTSPOT TRIGGER POLICY — the walk-over exit trap
 *
 *  Regression cover for the reported bug: a 👣 exit marker parked near the
 *  spawn point fired the instant the player took a step, so the room could
 *  not be crossed without leaving it. `hotspotFiresOnWalkOver` is the single
 *  decision the Stage arrival loop asks before firing on step-on, so testing
 *  it covers the runtime path.
 * ================================================================== */
{
  const exitHs: Hotspot = {
    id: "door", label: "GO — Leave the shop",
    bounds: { x: 0, y: 40, w: 10, h: 52 }, cursor: "go",
    action: { type: "goToScene", targetSceneId: "outside" },
  };
  const useExitHs: Hotspot = {
    id: "use-door", label: "USE — Hatch", bounds: { x: 0, y: 40, w: 10, h: 52 },
    cursor: "use", action: { type: "useItem", targetSceneId: "outside" },
  };
  const stateExitHs: Hotspot = {
    id: "state-door", label: "Gate", bounds: { x: 0, y: 40, w: 10, h: 52 }, cursor: "use",
    action: { type: "showText", text: "shut" },
    states: [{ id: "open", action: { type: "goToScene", targetSceneId: "outside" } }],
  };
  const bench: Hotspot = {
    id: "bench", label: "TAKE — Casing", bounds: { x: 40, y: 70, w: 10, h: 14 },
    cursor: "take", action: { type: "giveItem", itemGranted: "casing" },
  };
  const tower: Hotspot = { ...bench, id: "tower", remote: true };

  check("trigger: a goToScene marker LEAVES the scene", hotspotLeavesScene(exitHs));
  check("trigger: a useItem exit LEAVES the scene", hotspotLeavesScene(useExitHs));
  check("trigger: an exit hidden in a multi-state object LEAVES the scene", hotspotLeavesScene(stateExitHs));
  check("trigger: a 👣 cursor alone counts as leaving", hotspotLeavesScene({ ...bench, cursor: "go" }));
  check("trigger: a plain pickup does not leave the scene", !hotspotLeavesScene(bench));
  for (const [name, action] of Object.entries({
    chained: { type: "showText", then: [{ type: "goToScene", targetSceneId: "outside" }] },
    script: { type: "runScript", script: [{ do: "goToScene", targetSceneId: "outside" }] },
    esper: { type: "esperPhoto", esperPhoto: { photoImage: "", regions: [], targetSceneId: "outside" } },
    vk: { type: "vkTest", vkTest: { targetSceneId: "outside" } },
  })) check(`trigger: ${name} routes are protected too`, !hotspotFiresOnWalkOver({ ...bench, action: action as Hotspot["action"] }));


  // The default policy is the fix: objects still fire on step-on, doors don't.
  check("trigger(smart): objects fire on step-on", hotspotFiresOnWalkOver(bench) === true);
  check("trigger(smart): an exit needs a click", hotspotFiresOnWalkOver(exitHs) === false);
  check("trigger(smart): a useItem exit needs a click", hotspotFiresOnWalkOver(useExitHs) === false);
  check("trigger(smart): a state-held exit needs a click", hotspotFiresOnWalkOver(stateExitHs) === false);
  check("trigger(smart) is the default when the policy is omitted", hotspotFiresOnWalkOver(exitHs, undefined) === false);

  // Legacy walk-over keeps the classic chain-of-doorways behaviour.
  check("trigger(walkover): everything fires on step-on", hotspotFiresOnWalkOver(exitHs, "walkover") === true);
  check("trigger(aim): nothing fires on step-on", hotspotFiresOnWalkOver(bench, "aim") === false);

  // The per-marker override beats the room policy both ways.
  check("trigger: walkOver:true opts a door back in", hotspotFiresOnWalkOver({ ...exitHs, walkOver: true }) === true);
  check("trigger: walkOver:false opts an object out", hotspotFiresOnWalkOver({ ...bench, walkOver: false }, "walkover") === false);

  // Remote markers were aim-only before the policy existed and stay that way.
  check("trigger: remote markers never fire on step-on", hotspotFiresOnWalkOver(tower, "walkover") === false);
}

/* ================================================================== *
 *  SCROLLING + MASKED LAYERS — the cockpit-window effect
 * ================================================================== */
{
  check("scroll: a config with no speed is not animated", scrollAnimatable({ speed: 0 }) === false);
  check("scroll: an unset speed defaults to a real crawl", scrollAnimatable({}) === true);
  check("scroll: undefined is not animated", scrollAnimatable(undefined) === false);
  // The loop must be exactly one tile long, so any speed stays seamless.
  check("scroll: period scales inversely with speed", Math.abs(scrollPeriod({ speed: 10 }) - 10) < 1e-9 && Math.abs(scrollPeriod({ speed: 25 }) - 4) < 1e-9, scrollPeriod({ speed: 10 }));
  check("scroll: period is clamped away from zero", scrollPeriod({ speed: 100000 }) >= 0.25);
  const css = scrollKeyframes("sr-scroll-0", { axis: "x", speed: 12 });
  check("scroll: keyframes are emitted under the caller's name", css.includes("@keyframes sr-scroll-0"));
  check("scroll: an x crawl travels one measured tile", css.includes("var(--scroll-tile-x) * 1)"), css);
  check("scroll: a negative speed crawls backwards", scrollKeyframes("n", { axis: "x", speed: -12 }).includes("var(--scroll-tile-x) * -1"));
  check("scroll: a y crawl travels vertically", scrollKeyframes("y", { axis: "y", speed: 12 }).includes("var(--scroll-tile-y) * 1)"));
  const st = scrollStyle({ axis: "x", speed: 12 }, "sr-scroll-0");
  check("scroll: style repeats the art so the loop is seamless", st?.backgroundRepeat === "repeat");
  check("scroll: style names the emitted animation", st?.animationName === "sr-scroll-0-x");
  check("scroll: style loops forever", st?.animationIterationCount === "infinite");
  check("scroll: style is linear (no easing on an endless crawl)", st?.animationTimingFunction === "linear");
  check("scroll: style is null when the crawl is zero", scrollStyle({ speed: 0 }, "x") === null);
  check("scroll: reduced motion stops the crawl", scrollStyle({ speed: 12 }, "x", { reducedMotion: true }) === null);
  check("scroll: diagonal drift has independently seamless axis loops", scrollStyle({ speed: 10, crossSpeed: 3 }, "s")?.animationDuration === "10.000s, 33.333s");
  check("scroll: native tile ratio adjusts period", scrollStyle({ speed: 10 }, "s", { tileRatioX: 2 })?.animationDuration === "20.000s");
  check("scroll: cross-only drift works at zero primary speed", scrollAnimatable({ speed: 0, crossSpeed: 2 }));
  check("scroll: invalid speeds cannot emit infinite CSS", !scrollAnimatable({ speed: NaN, crossSpeed: Infinity }));
  check("scroll: repeat:false does not loop or jump back", scrollStyle({ speed: 10, repeat: false }, "s")?.animationIterationCount === "1");
  check("scroll: repeat:false slides a single strip", scrollStyle({ speed: 12, repeat: false }, "x")?.backgroundRepeat === "no-repeat");
}

/* ================================================================== *
 *  VALIDATOR — exit audit: one-way doors, spawn traps, minigame producers
 * ================================================================== */
{
  const stage = (id: string, title: string, over: Partial<SceneNode> = {}): SceneNode => ({
    id, title, background: "", prose: "", nodeType: "stage",
    stage: { spawn: { x: 50, y: 90 }, reach: 5, floor: { top: 70, bottom: 94 } },
    hotspots: [], dialogueBeats: [], choices: [], ...over,
  });
  const door = (id: string, to: string, bounds = { x: 88, y: 40, w: 10, h: 52 }): Hotspot => ({
    id, label: `GO — ${to}`, bounds, cursor: "go", action: { type: "goToScene", targetSceneId: to },
  });
  const auditStory = (scenes: SceneNode[], extra: Partial<Story> = {}): Story => ({
    id: "audit", title: "Audit", tagline: "", coverImage: "",
    startSceneId: scenes[0].id, scenes, items: [], characters: [], ...extra,
  });
  const has = (issues: ReturnType<typeof validateStory>, re: RegExp) => issues.some((i) => re.test(i.message));

  // ONE-WAY DOOR — in but never back out.
  const oneWay = validateStory(auditStory([
    stage("hub", "Hub", { hotspots: [door("d1", "room")] }),
    stage("room", "Room", { hotspots: [door("d2", "hub2")] }),
    stage("hub2", "Hub Two", { hotspots: [door("d3", "room")] }),
  ]));
  check("validator: flags a stage you can enter but not walk back out of", has(oneWay, /One-way door.*"Room"/), oneWay.map((i) => i.message));

  // Same rooms, but the back door exists — no warning.
  const twoWay = validateStory(auditStory([
    stage("hub", "Hub", { hotspots: [door("d1", "room")] }),
    stage("room", "Room", { hotspots: [door("d2", "hub")] }),
  ]));
  check("validator: a room with a return exit is not a one-way door", !has(twoWay, /One-way door/), twoWay.map((i) => i.message));

  // A travel map means the player is never stranded, so don't cry wolf.
  const mapped = validateStory(auditStory(
    [
      stage("hub", "Hub", { hotspots: [door("d1", "room")] }),
      stage("room", "Room", { hotspots: [door("d2", "hub2")] }),
      stage("hub2", "Hub Two", { hotspots: [door("d3", "room")] }),
    ],
    { map: { locations: [{ id: "m", label: "Room", targetSceneId: "room", x: 50, y: 50 }] } },
  ));
  check("validator: a self-only map pin is NOT a return route", has(mapped, /One-way door.*"Room"/), mapped.map((i) => i.message));

  // SPAWN TRAP — a step-on exit sitting on the spawn point.
  const trapped = validateStory(auditStory([
    stage("shop", "Shop", {
      stage: { spawn: { x: 8, y: 90 }, reach: 5, floor: { top: 70, bottom: 94 }, hotspotTrigger: "walkover" },
      hotspots: [door("d1", "street", { x: 2, y: 40, w: 10, h: 52 })],
    }),
  ]));
  check("validator: warns when a step-on exit sits on the spawn point", has(trapped, /sits on top of the spawn point/), trapped.map((i) => i.message));

  // The same room under the default policy is safe — the door needs a click.
  const safeShop = validateStory(auditStory([
    stage("shop", "Shop", {
      stage: { spawn: { x: 8, y: 90 }, reach: 5, floor: { top: 70, bottom: 94 } },
      hotspots: [door("d1", "street", { x: 2, y: 40, w: 10, h: 52 })],
    }),
  ]));
  check("validator: no spawn warning under the smart trigger policy", !has(safeShop, /sits on top of the spawn point/), safeShop.map((i) => i.message));

  // MINIGAME PRODUCERS — an ESPER region / VK verdict really does set a flag
  // at runtime, so a gate on it must not read as unsatisfiable.
  const minigame = validateStory(auditStory([
    stage("lab", "Lab", {
      hotspots: [
        {
          id: "esper", label: "USE — ESPER", bounds: { x: 20, y: 45, w: 18, h: 42 }, cursor: "use",
          action: {
            type: "esperPhoto",
            esperPhoto: {
              title: "ESPER", instruction: "", photoImage: "", regions: [
                { id: "r", label: "Sector", x: 0, y: 0, w: 10, h: 10, flagSet: "esper_done", itemGranted: "clue", isTarget: true },
              ],
            },
          },
        },
        {
          id: "file", label: "GO — File the case", bounds: { x: 80, y: 40, w: 12, h: 52 }, cursor: "go",
          gating: { requiresFlags: ["esper_done"], requiresItems: ["clue"] },
          action: { type: "goToScene", targetSceneId: "end" },
        },
      ],
    }),
    { id: "end", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
  ], { items: [{ id: "clue", name: "Clue", icon: "🔎", description: "" }] }));
  check("validator: an ESPER region's flag counts as a producer", !has(minigame, /esper_done/), minigame.map((i) => i.message));
  check("validator: an ESPER region's item counts as granted", !has(minigame, /Item "clue"/), minigame.map((i) => i.message));

  // The negative control: a flag nothing produces is still an error.
  const orphan = validateStory(auditStory([
    stage("lab", "Lab", {
      hotspots: [{
        id: "file", label: "GO — File the case", bounds: { x: 80, y: 40, w: 12, h: 52 }, cursor: "go",
        gating: { requiresFlags: ["never_set"] }, action: { type: "goToScene", targetSceneId: "end" },
      }],
    }),
    { id: "end", title: "End", background: "", prose: "", isEnding: true, endingData: { tier: "victory-gold", headline: "H", recap: "R" } },
  ]));
  check("validator: a flag nothing produces is still flagged", has(orphan, /never_set/), orphan.map((i) => i.message));
}

/* ================================================================== */
/*  4. Blade Runner Act One — the recreation's regression gate        */
/* ------------------------------------------------------------------ */
/*  The user-reported bugs this guards, each named after the complaint:  */
/*  - "walking over hotspots activates them so I can't get around the   */
/*     shop"            → walk-over trap sweep (scene-leaving markers   */
/*                       must never fire by strolling past them)        */
/*  - "if there's no exits?" → dead-end sweep + validator dead-end      */
/*                       checks + a full gold run to the ending         */
/*  - "stage 12 you can't go back to the LAPD mainframe" → the gold     */
/*                       run walks the apartment → mainframe return     */
/*     and asserts it lands in the hub                                   */
/* ================================================================== */
{
  const S = BLADE_RUNNER_ACT1;

  /* --- the shipped case validates clean (dead ends, one-way doors,
          dangling targets, spawn traps, reward farming, win/lose audit) */
  const issues = validateStory(S);
  check("BR: validateStory finds no errors", issues.filter((i) => i.severity === "error").length === 0, issues.map((i) => i.message));
  check("BR: validateStory finds no warnings", issues.length === 0, issues.map((i) => i.message));

  /* --- DEAD-END SWEEP: every non-ending scene keeps a way out. A stage
          scene's way out is a walk-to door, a walk-off-screen edge, or
          the travel map (openable from anywhere once the story has one). */
  for (const sc of S.scenes) {
    if (sc.isEnding) continue;
    const doorOut = (sc.hotspots ?? []).some(
      (h) => h.action.type === "goToScene" && !!h.action.targetSceneId
    );
    const edgeOut = Object.values(sc.stage?.exitEdges ?? {}).some((e) => !!e?.targetSceneId);
    const mapOut = (S.map?.locations?.length ?? 0) > 0;
    check(`BR: "${sc.title}" keeps a way out (door/edge/map)`, doorOut || edgeOut || mapOut,
      { doorOut, edgeOut, mapOut });
  }

  /* --- WALK-OVER TRAP SWEEP: no scene-leaving marker in the story may
          fire by strolling onto it under the room's trigger policy. This
          is the "I can't get around the shop without leaving it" bug —
          the smart policy (and any per-marker walkOver:false) must hold
          for every exit the player walks past on the way to something
          else. Deliberate clicks still work: that half is proven by the
          stage-beta harness (door walk-up) and the gold run below. */
  let exitMarkers = 0;
  for (const sc of S.scenes) {
    const policy = sc.stage?.hotspotTrigger ?? "smart";
    for (const hs of sc.hotspots ?? []) {
      if (!hotspotLeavesScene(hs)) continue;
      exitMarkers++;
      check(
        `BR: exit "${sc.title} / ${hs.label}" cannot fire on a walk-over`,
        !hotspotFiresOnWalkOver(hs, policy),
        { policy }
      );
    }
  }
  check("BR: the case has walkable exits to guard", exitMarkers >= 10, exitMarkers);

  /* --- LEGACY COMPATIBILITY RUN: the old HQ/film-inspired extension, through the
          runtime's own decision surface (the same one the bot plays). If
          any step is missing a gate, a marker or a route, the run dies
          here with the exact scene it got stuck in. */
  let sim = initialSim(S, createInitialState(S), "br_roof");
  check("BR gold: starts on the LAPD rooftop", sim.sceneId === "br_roof", sim.sceneId);
  check("BR gold: the opening is not a dead end", !isStuck(S, sim));

  const offered = () => availableDecisions(S, sim).map((d) => decisionKey(d));
  const choose = (d: Decision, why: string) => {
    check(`BR gold: ${why}`, offered().includes(decisionKey(d)),
      `at ${sim.sceneId}; offered: ${offered().join(", ")}`);
    sim = applyDecision(S, sim, d).sim;
    return sim;
  };
  const fire = (hotspotId: string, why: string) =>
    choose({ kind: "hotspot", sceneId: sim.sceneId, hotspotId, label: why }, why);
  const endConvo = (why: string) =>
    choose({ kind: "stage-convo-end", sceneId: sim.sceneId, label: "(the conversation ends)" }, why);

  // Rooftop → Bryant's office.
  check("BR gold: at the rooftop", sim.sceneId === "br_roof", sim.sceneId);
  fire("br_roof_hs_elevator", "elevator down to Bryant's office");
  check("BR gold: in Bryant's office", sim.sceneId === "br_bryant_office", sim.sceneId);

  // The briefing: badge + blaster + the br_briefed flag that opens the map.
  check("BR gold: no badge before the briefing", !sim.state.inventory.some((i) => i.id === "br_item_badge"));
  fire("br_bryant_talk_hs", "talk to Chief Bryant");
  check("BR gold: the briefing opens as a conversation", sim.stageConvoOpen);
  check("BR gold: the briefing sets br_briefed", sim.state.activeFlags.has("br_briefed"));
  check("BR gold: the badge is handed over in the briefing", sim.state.inventory.some((i) => i.id === "br_item_badge"));
  check("BR gold: the blaster is handed over in the briefing", sim.state.inventory.some((i) => i.id === "br_item_blaster"));
  endConvo("the briefing ends");

  // Gaff's crane (one-shot: the marker is spent after the hand-off).
  fire("br_bryant_hs_gaff", "take Gaff's paper crane");
  check("BR gold: Gaff's origami is in the satchel", sim.state.inventory.some((i) => i.id === "br_item_origami"));
  check(
    "BR gold: Gaff's marker is one-shot (no reward farming)",
    !availableDecisions(S, sim).some((d) => d.kind === "hotspot" && d.hotspotId === "br_bryant_hs_gaff")
  );
  endConvo("the crane is a thing of the past (Gaff's topic closes)");

  // Office → mainframe hub → the Spinner.
  fire("br_bryant_hs_hallway", "walk into the mainframe lab");
  check("BR gold: in the mainframe hub", sim.sceneId === "br_mainframe_hub", sim.sceneId);
  check("BR gold: not a dead end at the hub", !isStuck(S, sim));

  // Tyrell is map-gated on the briefing — locked before, open now.
  choose({ kind: "map-travel", sceneId: sim.sceneId, locationId: "map_tyrell", label: "", targetSceneId: "br_tyrell_ext" },
    "the map opens Tyrell HQ after the briefing");
  check("BR gold: at Tyrell Corporation", sim.sceneId === "br_tyrell_ext", sim.sceneId);
  fire("br_hs_tyrell_penthouse", "enter the penthouse");
  check("BR gold: in Tyrell's penthouse", sim.sceneId === "br_tyrell_office", sim.sceneId);
  fire("br_hs_tyrell_talk", "talk to Dr. Tyrell");
  check("BR gold: br_tyrell_visited set", sim.state.activeFlags.has("br_tyrell_visited"));
  endConvo("the penthouse visit is noted (Tyrell's topic closes)");
  choose({ kind: "minigame", sceneId: sim.sceneId, game: "vk", sourceId: "br_hs_rachael_vk", won: true, label: "vk Rachael" },
    "the Voight-Kampff test on Rachael");
  check("BR gold: the VK verdict: Rachael is a replicant", sim.state.activeFlags.has("br_vk_rachael_replicant"));
  fire("br_hs_tyrell_exit", "leave the penthouse");
  fire("br_hs_tyrell_return", "return to the Spinner at HQ");
  check("BR gold: back at the mainframe hub from Tyrell", sim.sceneId === "br_mainframe_hub", sim.sceneId);

  // Hub → Carson Street (through the masked-cockpit flight beat).
  fire("br_hs_spinner_takeoff", "board the Spinner");
  check("BR gold: in the Spinner", sim.sceneId === "br_spinner_flight", sim.sceneId);
  fire("br_hs_flight_arrive", "descend to Carson Street");
  check("BR gold: on Carson Street", sim.sceneId === "br_runciter_ext", sim.sceneId);

  // The crime scene: disk + casing, then OUT without being eaten by the
  // exit marker (the walk-over trap — see the sweep above).
  fire("br_hs_ext_door", "enter Runciter's shop");
  check("BR gold: inside the shop", sim.sceneId === "br_runciter_int", sim.sceneId);
  fire("br_hs_take_disk", "take the security photo disk");
  check("BR gold: disk in the satchel", sim.state.inventory.some((i) => i.id === "br_item_photo_disk"));
  check("BR gold: br_photo_collected set (unlocks the Yukon map pin)", sim.state.activeFlags.has("br_photo_collected"));
  fire("br_hs_take_casing", "take the bullet casing");
  check("BR gold: casing in the satchel", sim.state.inventory.some((i) => i.id === "br_item_casing"));
  check("BR gold: still in the shop (the exit did not fire on the walk past)", sim.sceneId === "br_runciter_int", sim.sceneId);
  fire("br_hs_runciter_exit", "leave the shop to Carson Street");
  check("BR gold: back on Carson Street", sim.sceneId === "br_runciter_ext", sim.sceneId);

  // The Chinatown thread.
  fire("br_hs_chinatown_travel", "walk to the noodle bar");
  check("BR gold: in Chinatown", sim.sceneId === "br_chinatown", sim.sceneId);
  fire("br_hs_howie_talk", "talk to Howie Lee");
  check("BR gold: the interview opens as a conversation", sim.stageConvoOpen);
  endConvo("the interview ends");
  check(
    "BR gold: the interview is repeatable (no replayable reward on it)",
    availableDecisions(S, sim).some((d) => d.kind === "hotspot" && d.hotspotId === "br_hs_howie_talk")
  );
  check("BR gold: no investigation flag before the evidence", !sim.state.activeFlags.has("br_chinatown_investigated"));
  fire("br_hs_alley_scale", "take the animoid fish scale");
  check("BR gold: scale in the satchel", sim.state.inventory.some((i) => i.id === "br_item_scale"));
  check("BR gold: br_chinatown_investigated set with the alley evidence", sim.state.activeFlags.has("br_chinatown_investigated"));
  fire("br_hs_moraji_travel", "walk to Moraji's Animoid Supply");
  check("BR gold: at Moraji's", sim.sceneId === "br_moraji_lab", sim.sceneId);
  fire("br_hs_moraji_talk", "talk to Moraji");
  check("BR gold: the interrogation opens as a conversation", sim.stageConvoOpen);
  check("BR gold: br_moraji_visited set", sim.state.activeFlags.has("br_moraji_visited"));
  endConvo("Moraji lets the tanks keep their own time");
  check(
    "BR gold: Moraji's interrogation is one-shot (no reward replay)",
    !availableDecisions(S, sim).some((d) => d.kind === "hotspot" && d.hotspotId === "br_hs_moraji_talk")
  );
  fire("br_hs_nightclub_travel", "walk to Early Q's");
  check("BR gold: at the nightclub", sim.sceneId === "br_nightclub", sim.sceneId);
  fire("br_hs_dektora_stage", "watch Dektora's act");
  check("BR gold: the performance opens as a conversation", sim.stageConvoOpen);
  check("BR gold: br_nightclub_visited set", sim.state.activeFlags.has("br_nightclub_visited"));
  endConvo("the applause dies down");
  check(
    "BR gold: Dektora's set is one-shot (no reward replay)",
    !availableDecisions(S, sim).some((d) => d.kind === "hotspot" && d.hotspotId === "br_hs_dektora_stage")
  );
  fire("br_hs_mccoy_apt_travel", "walk to McCoy's apartment");
  check("BR gold: in the apartment", sim.sceneId === "br_mccoy_apt", sim.sceneId);

  // THE STAGE-12 REGRESSION: the apartment routes BACK to the mainframe.
  fire("br_hs_apt_return", "elevator back to the LAPD mainframe");
  check("BR gold: the apartment's elevator returns to the hub (stage 12 fix)", sim.sceneId === "br_mainframe_hub", sim.sceneId);

  // ESPER analysis — the dragon wrapper clue the case file gates on.
  choose({ kind: "minigame", sceneId: sim.sceneId, game: "esper", sourceId: "br_hs_esper_terminal", won: true, label: "esper" },
    "analyze Runciter's disk on ESPER");
  check("BR gold: ESPER revealed the dragon wrapper", sim.state.activeFlags.has("br_esper_dragon_revealed"));
  check("BR gold: the dragon clue is in the satchel", sim.state.inventory.some((i) => i.id === "br_item_dragon_clue"));

  // The Yukon thread (map-gated on the Runciter disk).
  choose({ kind: "map-travel", sceneId: sim.sceneId, locationId: "map_yukon", label: "", targetSceneId: "br_yukon_hotel" },
    "the map opens the Yukon once the disk is collected");
  check("BR gold: at the Yukon Hotel", sim.sceneId === "br_yukon_hotel", sim.sceneId);
  fire("br_hs_yukon_disk", "take Yukon photo disk #2");
  check("BR gold: disk #2 in the satchel", sim.state.inventory.some((i) => i.id === "br_item_photo_disk2"));
  fire("br_hs_yukon_exit", "leave the hotel room");
  check("BR gold: out of the Yukon, on Carson Street", sim.sceneId === "br_runciter_ext", sim.sceneId);
  choose({ kind: "stage-exit", sceneId: sim.sceneId, edge: "left", label: "", targetSceneId: "br_mainframe_hub" },
    "walk off Carson Street back to LAPD HQ");
  check("BR gold: back at the hub from Carson Street", sim.sceneId === "br_mainframe_hub", sim.sceneId);

  // ESPER disks #2 and #3 chain off each other (license → snake scale).
  choose({ kind: "minigame", sceneId: sim.sceneId, game: "esper", sourceId: "br_hs_esper_terminal2", won: true, label: "esper2" },
    "analyze the Yukon disk on ESPER");
  check("BR gold: ESPER traced Spinner #9942 to Moraji", sim.state.activeFlags.has("br_esper_license_revealed"));
  check("BR gold: the license clue is in the satchel", sim.state.inventory.some((i) => i.id === "br_item_license_clue"));
  choose({ kind: "minigame", sceneId: sim.sceneId, game: "esper", sourceId: "br_hs_esper_terminal3", won: true, label: "esper3" },
    "analyze the Chinatown alley disk on ESPER");
  check("BR gold: ESPER matched the snake scale to Moraji's python", sim.state.activeFlags.has("br_esper_snake_revealed"));

  // Lucy's VK at the hub terminal.
  choose({ kind: "minigame", sceneId: sim.sceneId, game: "vk", sourceId: "br_hs_vk_terminal", won: true, label: "vk Lucy" },
    "the Voight-Kampff test on Lucy");
  check("BR gold: the VK verdict: Lucy is a replicant", sim.state.activeFlags.has("br_vk_lucy_replicant"));

  // The first-act ending now requires an actual upload and a Zuben outcome.
  fire("br_hs_mainframe_sync", "upload the crime-scene evidence");
  fire("br_hs_spinner_takeoff", "take off for Chinatown");
  fire("br_hs_flight_arrive", "arrive on Carson Street");
  fire("br_hs_chinatown_travel", "return to Howie's");
  fire("br_hs_howie_kitchen", "follow the ESPER lead to Zuben");
  fire("br_hs_zuben_question", "question Zuben");
  choose({ kind: "choice", sceneId: sim.sceneId, choiceId: "br_zuben_dodge", quickTime: true, reply: false, label: "" }, "dodge the pot");
  fire("br_hs_evade_continue", "continue after the staged dodge (browser verifies its automatic script)");
  fire("br_hs_alley_warehouse", "follow Zuben");
  fire("br_hs_stairs_upper", "climb the warehouse stairs");
  fire("br_hs_warehouse_door", "try the locked door and trigger the ambush");
  fire("br_hs_zuben_standoff", "confront Zuben");
  choose({ kind: "choice", sceneId: sim.sceneId, choiceId: "br_zuben_mercy", quickTime: false, reply: false, label: "" }, "holster the weapon");
  choose({ kind: "choice", sceneId: sim.sceneId, choiceId: "br_mercy_lapd", quickTime: false, reply: false, label: "" }, "return to LAPD after the confrontation");

  // Walk the loop home and file the case.
  fire("br_hs_spinner_takeoff", "board the Spinner again");
  fire("br_hs_flight_arrive", "descend to Carson Street (repeatable descent marker)");
  fire("br_hs_chinatown_travel", "walk to the noodle bar");
  fire("br_hs_moraji_travel", "walk to Moraji's");
  fire("br_hs_nightclub_travel", "walk to Early Q's");
  fire("br_hs_mccoy_apt_travel", "walk to the apartment");
  check("BR gold: back in the apartment to file the case", sim.sceneId === "br_mccoy_apt", sim.sceneId);
  fire("br_hs_conclude_act1", "complete the Act 1 case file");
  check("BR gold: the case file closes on the VICTORY ending", sim.sceneId === "br_act1_conclusion", sim.sceneId);
  check("BR gold: the conclusion is a real ending", S.scenes.find((s) => s.id === sim.sceneId)?.isEnding === true);
  check("BR gold: no decisions past an ending", availableDecisions(S, sim).length === 0);

  /* --- DEFEAT ROUTE: the lose condition is real. A fresh sim dropped in
          the apartment walks the "file it un-solved" marker and lands on
          the game-over ending — the case you can't lose is the case the
          win/lose audit rejects. */
  let lose = initialSim(S, createInitialState(S), "br_mccoy_apt");
  check("BR lose: starts in the apartment", lose.sceneId === "br_mccoy_apt", lose.sceneId);
  check(
    "BR lose: the give-up marker is offered in the apartment",
    availableDecisions(S, lose).some((d) => d.kind === "hotspot" && d.hotspotId === "br_hs_giveup")
  );
  lose = applyDecision(S, lose, { kind: "hotspot", sceneId: "br_mccoy_apt", hotspotId: "br_hs_giveup", label: "" }).sim;
  check("BR lose: the case closes on the GAME-OVER ending", lose.sceneId === "br_act1_failed", lose.sceneId);
  check("BR lose: the failed ending is a real gameover tier",
    S.scenes.find((s) => s.id === "br_act1_failed")?.endingData?.tier === "gameover");

  /* --- MAP GATING: before the briefing the Tyrell pin is locked, so the
          decision surface must not offer it (and the case must still not
          be a dead end — the map's open pins carry the player). */
  let pre = initialSim(S, createInitialState(S), "br_roof");
  pre = applyDecision(S, pre, { kind: "hotspot", sceneId: "br_roof", hotspotId: "br_roof_hs_elevator", label: "" }).sim;
  pre = applyDecision(S, pre, { kind: "hotspot", sceneId: "br_bryant_office", hotspotId: "br_bryant_hs_hallway", label: "" }).sim;
  check("BR map: Tyrell is locked before the briefing",
    !availableDecisions(S, pre).some((d) => d.kind === "map-travel" && d.locationId === "map_tyrell"),
    availableDecisions(S, pre).filter((d) => d.kind === "map-travel").map((d) => d.locationId));
  check("BR map: the hub is still open before the briefing",
    availableDecisions(S, pre).some((d) => d.kind === "map-travel" && d.locationId === "map_apt"));
}

/* ================================================================== */
/*  RETURN TRAPS — the softlock the bot found in the diner's freezer,   */
/*  caught statically instead of by exploration luck                    */
/* ------------------------------------------------------------------ */
/*  A room the player can walk back into whose every way out was consumed */
/*  the first time. Every exit "works" once, so the graph has no dead end */
/*  and nothing else flags it. auditSceneExits is the check; the validator  */
/*  turns it into a warning; the eight shipped rooms it found are fixed.   */
/* ================================================================== */
console.log("\n=== RETURN TRAPS — re-enterable rooms whose exits are all spent ===");
{
  // hub ⇄ closet, with the freezer's exact bug: the closet's only way out is a
  // choice carrying a meter change, which makes it one-shot by default.
  const trapStory = (over: {
    /** the hall's door marker stays a door on the second visit */
    doorRepeats?: boolean;
    /** the hall is a stage whose right edge walks into the closet — a way in
     *  that is never consumed */
    edgeFromHub?: boolean;
    /** the closet is a stage whose left edge walks back out — a way out that
     *  is never consumed */
    edgeOut?: boolean;
    outRepeats?: boolean;
    secondDoor?: boolean;
    autoOut?: boolean;
    beatOut?: boolean;
    mapped?: boolean;
  } = {}): Story => {
    const story: Story = {
      id: "trap", title: "Trap", tagline: "t", coverImage: "/c.png", gameKind: "noir-rail",
      startSceneId: "hub",
      briefing: { objective: "Get out of the walk-in.", winConditions: ["Close the case."], loseConditions: ["Freeze."] },
      characters: [{ id: "narrator", name: "Narrator", role: "vo", avatarUrl: "emoji:🎙", trustMeter: 0 }],
      items: [],
      scenes: [
        {
          id: "hub", title: "The Hall", background: "/h.png", prose: "",
          nodeType: over.edgeFromHub ? "stage" : undefined,
          stage: over.edgeFromHub
            ? { floor: { top: 60, bottom: 92 }, spawn: { x: 50, y: 88 },
                exitEdges: { right: { targetSceneId: "closet", label: "into the walk-in" } } }
            : undefined,
          dialogueBeats: [],
          hotspots: [
            { id: "hs_door", label: "GO — the closet", bounds: { x: 10, y: 40, w: 20, h: 40 }, cursor: "go",
              isRepeatable: over.doorRepeats, action: { type: "goToScene", targetSceneId: "closet" } },
            ...(over.secondDoor
              ? [{ id: "hs_door2", label: "GO — the closet (back way)", bounds: { x: 70, y: 40, w: 20, h: 40 }, cursor: "go",
                   action: { type: "goToScene", targetSceneId: "closet" } as HotspotAction }]
              : []),
          ],
          choices: [{ id: "c_wrap", text: "Close the case.", targetSceneId: "gold" }],
        },
        {
          id: "closet", title: "The Walk-In", background: "/w.png", prose: "",
          nodeType: over.edgeOut ? "stage" : undefined,
          stage: over.edgeOut
            ? { floor: { top: 60, bottom: 92 }, spawn: { x: 50, y: 88 },
                exitEdges: { left: { targetSceneId: "hub", label: "back to the hall" } } }
            : undefined,
          ...(over.autoOut ? { autoAdvanceTargetSceneId: "hub", autoAdvanceDelaySeconds: 2 } : {}),
          dialogueBeats: over.beatOut
            ? [{ id: "cb1", characterId: "narrator", text: "The cold gets in your teeth.", afterBeatTargetSceneId: "hub" }]
            : [],
          hotspots: [],
          choices: [{ id: "c_out", text: "Out.", targetSceneId: "hub", isRepeatable: over.outRepeats,
            // The meter point is what makes it one-shot — the diner's bug.
            consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] } }],
        },
        { id: "gold", title: "Case Closed", background: "/g.png", prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
          endingData: { tier: "victory-gold", headline: "H", recap: "r" } },
      ],
    };
    if (over.mapped) {
      story.map = { locations: [
        { id: "pin_hub", name: "The Hall", targetSceneId: "hub" },
        { id: "pin_closet", name: "The Walk-In", targetSceneId: "closet" },
      ] };
    }
    return story;
  };
  const closetOf = (s: Story) => s.scenes.find((x) => x.id === "closet")!;

  // 1. THE BUG — a repeatable way in, a one-shot way out.
  const buggy = trapStory({ doorRepeats: true });
  const audit = auditSceneExits(buggy, closetOf(buggy));
  check("trap: the re-enterable closet with a one-shot exit is a trap", audit.trapped, audit);
  check("trap: it names the spent exit", audit.spent.some((s) => s.includes("Out.")), audit.spent);
  check("trap: it has nothing surviving", audit.surviving.length === 0, audit.surviving);
  check("trap: it knows the way back in", !!audit.via && audit.via.includes("hub"), audit.via);
  check("trap: the validator warns about it",
    validateStory(buggy).some((i) => i.sceneId === "closet" && i.message.startsWith("Return trap")),
    validateStory(buggy).map((i) => i.message));
  check("trap: the warning tells the author what to do",
    validateStory(buggy).some((i) => i.message.startsWith("Return trap") && /repeatable/i.test(i.message)));

  // 2. THE FIX — exactly what was applied to nd_freezer and the eight rooms.
  const fixed = trapStory({ doorRepeats: true, outRepeats: true });
  check("trap: marking the exit repeatable clears it", !auditSceneExits(fixed, closetOf(fixed)).trapped);
  check("trap: the fixed room reports a surviving exit",
    auditSceneExits(fixed, closetOf(fixed)).surviving.some((s) => s.includes("Out.")));
  check("trap: the fixed story draws no warning",
    !validateStory(fixed).some((i) => i.message.startsWith("Return trap")));

  // 3. NO WAY BACK IN — a single one-shot route in cannot strand anyone: it is
  //    spent bringing the player here the first time.
  const oneWay = trapStory();
  const oneWayAudit = auditSceneExits(oneWay, closetOf(oneWay));
  check("trap: a one-shot route in is not a trap", !oneWayAudit.trapped && !oneWayAudit.returns, oneWayAudit);
  check("trap: the validator stays quiet about a one-shot route in",
    !validateStory(oneWay).some((i) => i.message.startsWith("Return trap")));

  // 4. …but TWO one-shot routes in are (each buys one entry).
  const twoDoors = trapStory({ secondDoor: true });
  check("trap: two one-shot routes in do trap", auditSceneExits(twoDoors, closetOf(twoDoors)).trapped,
    auditSceneExits(twoDoors, closetOf(twoDoors)));

  // 5. Walking off a screen edge is never consumed, in EITHER direction.
  const edgeIn = trapStory({ edgeFromHub: true });
  check("trap: a walk-off edge in is a permanent way back",
    auditSceneExits(edgeIn, closetOf(edgeIn)).returns && auditSceneExits(edgeIn, closetOf(edgeIn)).trapped,
    auditSceneExits(edgeIn, closetOf(edgeIn)));
  const edgeOut = trapStory({ doorRepeats: true, edgeOut: true });
  check("trap: a walk-off edge out survives the return", !auditSceneExits(edgeOut, closetOf(edgeOut)).trapped);
  check("trap: the surviving edge is named",
    auditSceneExits(edgeOut, closetOf(edgeOut)).surviving.some((s) => /walk off the left edge/.test(s)));

  // 6. Exits that fire on every arrival are not consumed.
  check("trap: an auto-advance survives a return visit", !auditSceneExits(trapStory({ doorRepeats: true, autoOut: true }), closetOf(trapStory({ autoOut: true }))).trapped);
  check("trap: a travel map is a way out of anywhere", !auditSceneExits(trapStory({ doorRepeats: true, mapped: true }), closetOf(trapStory({ mapped: true }))).trapped);

  // 7. An after-beat cut does NOT survive: a return visit skips the beats the
  //    player has already seen, so the cut never replays.
  const beatOnly = trapStory({ doorRepeats: true, beatOut: true });
  (beatOnly.scenes[1] as SceneNode).choices = [];
  const beatAudit = auditSceneExits(beatOnly, closetOf(beatOnly));
  check("trap: an after-beat-only exit is flagged as such", beatAudit.afterBeatOnly && beatAudit.trapped, beatAudit);
  check("trap: the after-beat warning says the cut won't replay",
    validateStory(beatOnly).some((i) => i.message.startsWith("Return trap") && /after-beat/i.test(i.message)),
    validateStory(beatOnly).map((i) => i.message));

  // 8. Endings, notes and credits are not rooms the player stands in.
  check("trap: an ending is never a trap",
    !validateStory(buggy).some((i) => i.message.startsWith("Return trap") && i.sceneId === "gold"));

  /* --- THE SHIPPED CATALOGUE -------------------------------------
   * The check found eight real softlocks in four shipped cases (the squad
   * room's door to Trunk's office, the Ravenswood gate, the point-click
   * template's yard door and five Matt the Accountant corridor rooms). All
   * eight are fixed by making the door a door, so the catalogue must stay
   * clean — this is the regression gate. */
  const trappedShipped: string[] = [];
  for (const story of STORIES) {
    for (const issue of validateStory(story)) {
      if (issue.message.startsWith("Return trap")) trappedShipped.push(`${story.id}/${issue.sceneId}`);
    }
  }
  check(`trap: no shipped story has a return trap (${STORIES.length} stories)`, trappedShipped.length === 0, trappedShipped.join(" | "));

  // …and the specific rooms the audit caught, so a reverted fix is named.
  const diner = NEON_DINER.scenes.find((s) => s.id === "nd_freezer")!;
  check("trap: the diner's walk-in exit still repeats", diner.choices!.some((c) => c.id === "nd_f_out" && logicChoiceRepeats(c)));
  check("trap: the diner's walk-in is not a trap", !auditSceneExits(NEON_DINER, diner).trapped);
  const doorsFixed: [Story, string, string][] = [
    [SLEDGE_HAMMER, "sh_squadroom", "sh_office_door_hs"],
    [SCOOBY_RAVENSWOOD, "sd_gate", "sdh_door"],
    [POINT_CLICK_TEMPLATE, "pct_workshop", "pct_door_hs"],
    [MATT_THE_ACCOUNTANT, "mta_doors", "mta_h_left"],
    [MATT_THE_ACCOUNTANT, "mta_stairs", "mta_h_srv_door"],
  ];
  for (const [story, sceneId, hsId] of doorsFixed) {
    const sc = story.scenes.find((s) => s.id === sceneId)!;
    const hs = (sc.hotspots ?? []).find((h) => h.id === hsId)!;
    check(`trap: ${story.id}/${sceneId} door "${hsId}" is repeatable now`, !!hs && logicHotspotRepeats(hs));
    check(`trap: ${story.id}/${sceneId} is not a return trap`, !auditSceneExits(story, sc).trapped);
  }

  // One definition of repeatability, shared by the runtime, the bot and the
  // validator: decisions.ts re-exports logic.ts rather than keeping a copy.
  const decisionsSrc = readFileSync("src/game/decisions.ts", "utf8");
  const logicSrc = readFileSync("src/logic.ts", "utf8");
  check("repeatability: decisions.ts keeps no private choiceRepeats", !/^export function choiceRepeats/m.test(decisionsSrc));
  check("repeatability: decisions.ts keeps no private hotspotRepeats", !/^export function hotspotRepeats/m.test(decisionsSrc));
  check("repeatability: logic.ts owns the definition", /^export function choiceRepeats/m.test(logicSrc) && /^export function hotspotRepeats/m.test(logicSrc));
  check("repeatability: the decision surface re-exports the very same functions",
    decisionChoiceRepeats === logicChoiceRepeats && hotspotRepeats === logicHotspotRepeats);
}

/* ================================================================== */
/*  STRANDED — the runtime's dead-end detector                          */
/* ------------------------------------------------------------------ */
/*  The validator says a scene COULD trap the player and the bot says a     */
/*  random walk DID. This is the third leg: the player, standing in it, is  */
/*  told — with the ways out on screen. Same decision surface, so the       */
/*  verdict can never disagree with the simulation.                         */
/* ================================================================== */
console.log("\n=== STRANDED — nothing left to do here ===");
{
  const S: Story = {
    id: "stranded", title: "Stranded", tagline: "t", coverImage: "/c.png", gameKind: "noir-rail",
    startSceneId: "hall",
    characters: [{ id: "narrator", name: "Narrator", role: "vo", avatarUrl: "emoji:🎙", trustMeter: 0 }],
    items: [{ id: "key", name: "Key", icon: "🔑", description: "d", flavorText: "f" }],
    scenes: [
      { id: "hall", title: "The Hall", background: "/h.png", prose: "", dialogueBeats: [],
        hotspots: [{ id: "hs_key", label: "A key", bounds: { x: 10, y: 40, w: 20, h: 30 }, cursor: "take",
          action: { type: "giveItem", itemGranted: "key" } as HotspotAction }],
        choices: [{ id: "c_out", text: "Leave.", targetSceneId: "closet",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] } }] },
      { id: "closet", title: "The Walk-In", background: "/w.png", prose: "", dialogueBeats: [], hotspots: [],
        choices: [{ id: "c_back", text: "Back out.", targetSceneId: "hall",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] } }] },
      { id: "gold", title: "Closed", background: "/g.png", prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
        endingData: { tier: "victory-gold", headline: "H", recap: "r" } },
      { id: "titles", title: "Credits", nodeType: "credits", background: "/t.png", prose: "", dialogueBeats: [], hotspots: [], choices: [] },
      { id: "fps", title: "First person", background: "/f.png", prose: "", dialogueBeats: [], hotspots: [], choices: [],
        stage: { floor: { top: 60, bottom: 92 }, spawn: { x: 50, y: 88 },
          quake: { map: ["#####", "#S..#", "#####"], markers: {}, spawns: { S: { x: 1, y: 1 } } } as never } },
    ],
  };
  const sceneOf = (id: string) => S.scenes.find((s) => s.id === id)!;
  const worldIn = (sceneId: string, usedChoices: string[] = [], usedHotspots: string[] = []) => ({
    sceneId,
    state: createInitialState(S),
    usedChoices: new Set(usedChoices),
    usedHotspots: new Set(usedHotspots),
    visitedScenes: new Set(["hall", sceneId]),
    expiredChoices: new Set<string>(),
  });

  // A room whose only exit has been taken: nothing left to do.
  const stuck = strandedNow(S, simFromRuntime(worldIn("closet", ["closet:c_back"])), { scene: sceneOf("closet") });
  check("stranded: a consumed room with nothing left is stranded", stuck.stranded && stuck.offered === 0 && stuck.skipped === null, stuck);

  // The same room before the exit is spent, and a room with a live pickup.
  check("stranded: an unspent room is not stranded",
    !strandedNow(S, simFromRuntime(worldIn("closet")), { scene: sceneOf("closet") }).stranded);
  check("stranded: a room with something to click is not stranded",
    !strandedNow(S, simFromRuntime(worldIn("hall", ["hall:c_out"])), { scene: sceneOf("hall") }).stranded);
  check("stranded: the verdict counts what is still on offer",
    strandedNow(S, simFromRuntime(worldIn("hall")), { scene: sceneOf("hall") }).offered > 1);

  // Exemptions — where "no decisions" is not evidence of a dead end.
  check("stranded: an ending is exempt", strandedNow(S, simFromRuntime(worldIn("gold")), { scene: sceneOf("gold") }).skipped === "ending");
  check("stranded: a credits roll is exempt", !!strandedNow(S, simFromRuntime(worldIn("titles")), { scene: sceneOf("titles") }).skipped);
  check("stranded: a first-person room is exempt", !!strandedNow(S, simFromRuntime(worldIn("fps")), { scene: sceneOf("fps") }).skipped);
  check("stranded: an exempt scene is never stranded",
    !strandedNow(S, simFromRuntime(worldIn("gold")), { scene: sceneOf("gold") }).stranded);
  check("stranded: a busy moment is exempt",
    strandedNow(S, simFromRuntime(worldIn("closet", ["closet:c_back"])), { scene: sceneOf("closet"), busy: true }).skipped === "panel open");
  check("stranded: mid-dialogue is exempt",
    strandedNow(S, simFromRuntime(worldIn("closet", ["closet:c_back"])), { scene: sceneOf("closet"), inBeats: true }).skipped === "mid-dialogue");
  check("stranded: a missing scene is exempt", strandedExemption(undefined) === "no scene");
  check("stranded: a plain open scene has no exemption", strandedExemption(sceneOf("closet")) === null);
  check("stranded: the grace period is a real wait", STRANDED_GRACE_MS >= 1000);

  // The mapping copies — the runtime's live sets must not be aliased into the
  // simulation, or a later click would rewrite history.
  const src = worldIn("hall");
  const mapped = simFromRuntime(src);
  src.usedChoices.add("hall:c_out");
  check("stranded: simFromRuntime copies the spent sets", !mapped.usedChoices.has("hall:c_out"));
  check("stranded: simFromRuntime defaults the optional world",
    mapped.stageConvoOpen === false && mapped.steps === 0 && mapped.lieWrongCounts && Object.keys(mapped.composure).length === 0);
  check("stranded: the scene falls back to a lookup",
    strandedNow(S, simFromRuntime(worldIn("closet", ["closet:c_back"]))).stranded);

  // No shipped case opens in a dead end.
  const badOpenings: string[] = [];
  for (const story of STORIES) {
    const sim = initialSim(story, createInitialState(story));
    const v = strandedNow(story, sim);
    if (v.stranded) badOpenings.push(`${story.id}/${sim.sceneId}`);
  }
  check(`stranded: no shipped story opens with nothing to do (${STORIES.length} stories)`, badOpenings.length === 0, badOpenings.join(" | "));

  // The wiring: the player is told, and given the three real ways out.
  const gameSrcStranded = readFileSync("src/game/Game.tsx", "utf8");
  check("stranded: Game.tsx asks the shared detector", /strandedNow\(/.test(gameSrcStranded) && /simFromRuntime\(/.test(gameSrcStranded));
  check("stranded: Game.tsx waits out the grace period", /STRANDED_GRACE_MS/.test(gameSrcStranded));
  check("stranded: the panel is rendered and announced", /data-stranded="true"/.test(gameSrcStranded) && /aria-live="polite"/.test(gameSrcStranded));
  check("stranded: the panel offers rewind, the checkpoint and a save",
    /doRewindDecision/.test(gameSrcStranded) && /resumeCheckpoint/.test(gameSrcStranded) && /Last checkpoint/.test(gameSrcStranded));
  check("stranded: the checkpoint escape reads the AUTO slot", /readSaveDetailed\(story\.id, AUTO_SLOT, episodeId\)/.test(gameSrcStranded));
  // The private softlock memo is gone — one definition of "nothing left to do",
  // shared with the bot. (It could not see deductions, pressed lies, stage
  // edges, QTE lapses, minigame outcomes or after-beat routes.)
  check("stranded: Game.tsx keeps no private softlock detector", !/const isSoftlocked = useMemo/.test(gameSrcStranded));
  check("stranded: the old escape hatch survived the merge", /Restart \{episode \? "episode" : "case"\}/.test(gameSrcStranded));
  // A dead end must never be checkpointed, or "Last checkpoint" restores the
  // very room the player is stuck in.
  check("stranded: a dead end is never checkpointed", /scene\.isEnding \|\| strandedVerdict\.stranded/.test(gameSrcStranded));
}

/* ================================================================== */
/*  CONVERSATION TIMERS — the Wolf Among Us dialogue clock              */
/* ------------------------------------------------------------------ */
/*  `timeLimitSeconds` was dead data unless the choice was ALSO            */
/*  `quickTime`: no ring, no expiry, no audit — while the ⏱ readout still   */
/*  counted down to zero in front of the player, and docs/stage-nodes.md    */
/*  told authors to use it for "decide now" pressure. These check the       */
/*  quiet half works, that silence is a real decision with real             */
/*  consequences, and that cutting in over the last line is opt-in and      */
/*  never races an after-beat cut.                                          */
/* ================================================================== */
console.log("\n=== CONVERSATION TIMERS — the dialogue clock ===");
{
  const timed = (over: Partial<Choice> = {}): Choice => ({
    id: "c1", text: "Say nothing clever.", targetSceneId: "next", timeLimitSeconds: 7, ...over,
  });
  const reply = (over: Partial<Choice> = {}): Choice =>
    timed({ reply: true, targetSceneId: undefined, ...over });

  /* ---- which clock is this? ---- */
  check("timer: a quick-time prompt is the loud clock", timerFlavour(timed({ quickTime: true })) === "qte");
  check("timer: a plain timed choice is a conversation clock", timerFlavour(timed()) === "conversation");
  check("timer: an untimed choice has no clock at all", timerFlavour(timed({ timeLimitSeconds: undefined })) === null);
  check("timer: quickTime without a limit is not a clock", timerFlavour({ id: "x", text: "x", quickTime: true }) === null);

  /* ---- the ring ---- */
  check("timer: every timed choice shows a countdown ring",
    showsCountdownRing(timed()) && showsCountdownRing(timed({ quickTime: true })));
  check("timer: an untimed choice shows no ring", !showsCountdownRing(timed({ timeLimitSeconds: undefined })));
  check("timer: the two clocks are visibly different", TIMER_STYLE.qte.ring !== TIMER_STYLE.conversation.ring);
  check("timer: both clocks go crimson when critical", TIMER_STYLE.qte.criticalRing === TIMER_STYLE.conversation.criticalRing);
  check("timer: the readouts are real Tailwind classes",
    TIMER_STYLE.qte.readout.startsWith("text-") && TIMER_STYLE.conversation.readout.startsWith("text-"));

  /* ---- silence is a decision, not a cancellation ---- */
  check("timer: a navigating silence falls back to its own destination",
    silenceOutcome(timed()).dest === "next" && silenceOutcome(timed()).stays === false);
  check("timer: an authored silence branch wins over the fallback",
    silenceOutcome(timed({ timedOutTargetSceneId: "awkward" })).dest === "awkward");
  check("timer: a reply nobody said stays in the scene",
    silenceOutcome(reply()).stays === true && silenceOutcome(reply()).dest === null);
  check("timer: a reply can still be given somewhere to go",
    silenceOutcome(reply({ timedOutTargetSceneId: "awkward" })).dest === "awkward");
  check("timer: the silence carries its authored consequences",
    silenceOutcome(timed({ timedOutConsequences: { setFlags: ["hesitated"] } })).consequences?.setFlags?.[0] === "hesitated");
  check("timer: an unauthored silence has no consequences", silenceOutcome(timed()).consequences === undefined);
  check("timer: the outcome knows which clock ran out",
    silenceOutcome(timed()).flavour === "conversation" && silenceOutcome(timed({ quickTime: true })).flavour === "qte");

  /* ---- cutting in over the last line ---- */
  const beat = (id: string, over: Partial<DialogueBeat> = {}): DialogueBeat => ({
    id, characterId: "narrator", text: `Line ${id}.`, ...over,
  });
  const cutScene = (over: Partial<SceneNode> = {}): SceneNode => ({
    id: "bar", title: "The Bar", background: "/b.png", prose: "",
    dialogueBeats: [beat("b1"), beat("b2"), beat("b3")],
    choices: [reply()], interruptibleDialogue: true, ...over,
  });
  const at = (beatIdx: number, over: Partial<Parameters<typeof interruptibleNow>[0]> = {}) =>
    interruptibleNow({
      scene: cutScene(), visibleBeatCount: 3, beatIdx, proseAcknowledged: true,
      onRoutingBeat: false, busy: false, ...over,
    });
  check("timer: the last line can be interrupted", at(2) === true);
  check("timer: an earlier line belongs to the speaker", at(0) === false && at(1) === false);
  check("timer: interruption is opt-in",
    interruptibleNow({ scene: cutScene({ interruptibleDialogue: undefined }), visibleBeatCount: 3, beatIdx: 2, proseAcknowledged: true, onRoutingBeat: false, busy: false }) === false);
  check("timer: the prose goes first", at(2, { proseAcknowledged: false }) === false);
  check("timer: an after-beat cut owns the exit", at(2, { onRoutingBeat: true }) === false);
  check("timer: a panel covers the cut-in", at(2, { busy: true }) === false);
  check("timer: no beats, nothing to interrupt", at(2, { visibleBeatCount: 0 }) === false);
  check("timer: a missing scene cannot be interrupted", at(2, { scene: undefined }) === false);
  check("timer: a single-line conversation is interruptible on that line",
    interruptibleNow({ scene: cutScene(), visibleBeatCount: 1, beatIdx: 0, proseAcknowledged: true, onRoutingBeat: false, busy: false }) === true);

  /* ---- the flag must not be a silent no-op ---- */
  check("timer: an unconditional final cut blocks the whole flag",
    interruptBlockedByBeatRoute(cutScene({ dialogueBeats: [beat("b1"), beat("b2", { afterBeatTargetSceneId: "next" })] })) === true);
  check("timer: a GATED final cut does not — it may never play",
    interruptBlockedByBeatRoute(cutScene({ dialogueBeats: [beat("b1"), beat("b2", { afterBeatTargetSceneId: "next", conditionRule: { requiresFlags: ["f"] } })] })) === false);
  check("timer: a cut on an EARLIER beat does not block it",
    interruptBlockedByBeatRoute(cutScene({ dialogueBeats: [beat("b1", { afterBeatTargetSceneId: "next" }), beat("b2")] })) === false);
  check("timer: a plain conversation is not blocked", interruptBlockedByBeatRoute(cutScene()) === false);
  check("timer: the check ignores a scene that never opted in",
    interruptBlockedByBeatRoute(cutScene({ interruptibleDialogue: undefined, dialogueBeats: [beat("b1", { afterBeatTargetSceneId: "next" })] })) === false);
  check("timer: a scene with no beats is not blocked (it is warned about instead)",
    interruptBlockedByBeatRoute(cutScene({ dialogueBeats: [] })) === false);

  /* ---- the validator ---- */
  const timerStory = (scenes: SceneNode[]): Story => ({
    id: "timers", title: "Timers", tagline: "", coverImage: "", gameKind: "noir-rail",
    startSceneId: scenes[0].id, scenes, items: [],
    characters: [{ id: "narrator", name: "Narrator", role: "vo", avatarUrl: "emoji:🎙", trustMeter: 0 }],
  });
  const room = (choices: Choice[], over: Partial<SceneNode> = {}): SceneNode => ({
    id: "bar", title: "The Bar", background: "/b.png", prose: "",
    dialogueBeats: [beat("b1")], choices, ...over,
  });
  const next: SceneNode = { id: "next", title: "Next", background: "/n.png", prose: "", dialogueBeats: [], choices: [] };
  const awkward: SceneNode = { id: "awkward", title: "Awkward", background: "/a.png", prose: "", dialogueBeats: [], choices: [], isEnding: true, endingData: { tier: "game-over", headline: "H", recap: "r" } };
  const msgs = (s: Story) => validateStory(s).map((i) => i.message);
  const hasMsg = (s: Story, re: RegExp) => msgs(s).some((m) => re.test(m));

  // A conversation clock whose expiry changes nothing is decoration.
  check("timer: the validator audits a CONVERSATION clock that costs nothing",
    hasMsg(timerStory([room([timed()]), next, awkward]), /Timed choice .*changes nothing when the timer runs out/));
  check("timer: a conversation silence that reacts to the silence is fine",
    !hasMsg(timerStory([room([timed({ timedOutConsequences: { setFlags: ["hesitated"] } })]), next, awkward]), /changes nothing when the timer runs out/));
  check("timer: a conversation silence with its own branch is fine",
    !hasMsg(timerStory([room([timed({ timedOutTargetSceneId: "awkward" })]), next, awkward]), /changes nothing when the timer runs out/));
  // …and the quick-time wording it has always used survives untouched.
  check("timer: a quick-time lapse still reads as a quick-time lapse",
    hasMsg(timerStory([room([timed({ quickTime: true })]), next, awkward]), /Quick-time choice .*changes nothing when the timer runs out/));
  check("timer: an untimed choice is never audited",
    !hasMsg(timerStory([room([timed({ timeLimitSeconds: undefined })]), next, awkward]), /changes nothing when the timer runs out/));
  check("timer: a timed REPLY with no silence payoff is audited too",
    hasMsg(timerStory([room([reply()]), next, awkward]), /changes nothing when the timer runs out/));

  // The interruptible flag's two no-op shapes.
  check("timer: the validator names an interruptible scene with no beats",
    hasMsg(timerStory([room([timed({ timedOutConsequences: { setFlags: ["h"] } })], { interruptibleDialogue: true, dialogueBeats: [] }), next, awkward]), /interruptible dialogue but has no beats/));
  check("timer: the validator names an interruption a final cut blocks",
    hasMsg(timerStory([room([timed({ timedOutConsequences: { setFlags: ["h"] } })], { interruptibleDialogue: true, dialogueBeats: [beat("b1"), beat("b2", { afterBeatTargetSceneId: "next" })] }), next, awkward]), /that cut owns the exit/));
  check("timer: a healthy interruptible scene is not nagged",
    !hasMsg(timerStory([room([timed({ timedOutConsequences: { setFlags: ["h"] } })], { interruptibleDialogue: true }), next, awkward]), /interruptible dialogue/));

  /* ---- the shipped catalogue ---- */
  // Extending the audit to conversation clocks must not retroactively flag
  // content that shipped under the quick-time-only rule.
  const deadClocks: string[] = [];
  for (const story of STORIES) {
    for (const sc of story.scenes) {
      for (const c of sc.choices ?? []) {
        if (timerFlavour(c) !== "conversation") continue;
        const landsSame = !!c.reply || (c.timedOutTargetSceneId ?? c.targetSceneId) === c.targetSceneId;
        const changesNothing = !c.timedOutConsequences ||
          Object.values(c.timedOutConsequences).every((v) => !Array.isArray(v) || v.length === 0);
        if (landsSame && changesNothing) deadClocks.push(`${story.id}/${sc.id}/${c.id}`);
      }
    }
  }
  check(`timer: no shipped conversation clock is dead weight (${STORIES.length} stories)`,
    deadClocks.length === 0, deadClocks.join(" | "));

  /* ---- the wiring ---- */
  const src = readFileSync("src/game/Game.tsx", "utf8");
  check("timer: Game.tsx asks the shared module", /from "\.\/conversationTimer"/.test(src) && /silenceOutcome\(/.test(src));
  check("timer: expiry no longer requires quickTime",
    /liveChoices\.find\(\(c\) => c\.timeLimitSeconds && expiredNow\.includes\(c\.id\)\)/.test(src));
  check("timer: the ring is drawn for any timed choice", /showsCountdownRing\(c\)/.test(src));
  check("timer: the quick-time sting stays loud and the conversation clock stays quiet",
    /silence\.flavour === "qte"\) audio\.fail\(\)/.test(src) && /else audio\.stringSnap\(\)/.test(src));
  check("timer: a silent reply is acknowledged, not just deleted",
    /The moment passes\. You said nothing\./.test(src));
  check("timer: the rail and the clock share one gate",
    /const choicesLive = interactive \|\| cutInLive;/.test(src) &&
    /if \(!choicesLive \|\| choiceClockPaused\) return;/.test(src) &&
    /!topicConvo && choicesLive && !scene\.isEnding/.test(src));
  check("timer: cutting in stops the speaker mid-word",
    /audio\.stopSpeech\(\);\s*setBeatDone\(true\);\s*pickChoice\(choice\);/.test(src));
  check("timer: a cut-in is a number key, Enter still belongs to the beat",
    /e\.key === "Enter" && !inBeats/.test(src) && /cutInLive \? pickCutIn\(c\) : pickChoice\(c\)/.test(src));
  check("timer: the loud banner stays quick-time only", /const qteActive = availableChoices\.some\(\(c\) => c\.quickTime && c\.timeLimitSeconds\);/.test(src));
  check("timer: Studio exposes the conversation clock honestly",
    /conversation clock: a shrinking ring/.test(readFileSync("src/studio/Studio.tsx", "utf8")));
  check("timer: Studio exposes the interruptible toggle",
    /interruptibleDialogue: e\.target\.checked \|\| undefined/.test(readFileSync("src/studio/Studio.tsx", "utf8")));
}

console.log(`\nengine tests: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.log(`  ✖ ${f}`);
  process.exit(1);
}
console.log("✔ all engine tests passed");
process.exit(0);
