import { validateStory, type ValidationIssue } from "../src/logic";
import type { Story } from "../src/types";

/**
 * VALIDATOR AUDIT — probes validateStory() with a healthy reference story
 * corrupted one fault at a time, and asserts the fault is actually flagged.
 * Guard against the validator drifting into "0 issues for everything" — a
 * validator that reports clean on genuinely broken graphs is worthless.
 *
 * Run: npm run test:validate-audit  (pure node, no framework/DOM)
 */
function base(): Story {
  const story: Story = {
    id: "audit",
    title: "Audit",
    tagline: "t",
    coverImage: "/x.png",
    gameKind: "noir-rail",
    startSceneId: "a",
    briefing: { objective: "Win or lose.", winConditions: ["Reach the gold ending."], loseConditions: ["Reach the over ending."] },
    characters: [
      { id: "c1", name: "C1", role: "r", avatarUrl: "emoji:😀", trustMeter: 0 },
      { id: "c2", name: "C2", role: "r", avatarUrl: "emoji:😀", trustMeter: 0 },
    ],
    items: [
      { id: "i_key", name: "Key", icon: "🔑", description: "d", flavorText: "f" },
      { id: "i_photo", name: "Photo", icon: "📷", description: "d", flavorText: "f" },
    ],
    flagNotes: { a_done: "A done", b_done: "B done" },
    scenes: [
      {
        id: "a", title: "A", background: "/a.png", prose: "p",
        dialogueBeats: [{ id: "a1", characterId: "c1", text: "hello" }],
        hotspots: [],
        choices: [
          { id: "a_go", text: "go", targetSceneId: "b", attitudeTag: "Clever",
            consequences: { setFlags: ["a_done"], addItems: ["i_key"] } },
        ],
      },
      {
        id: "b", title: "B", background: "/b.png", prose: "p",
        dialogueBeats: [{ id: "b1", characterId: "c2", text: "hi", recalls: { mem_tag: "you said {said}" } }],
        hotspots: [
          { id: "b_take", label: "take", bounds: { x: 10, y: 10, w: 20, h: 20 }, cursor: "take", isRepeatable: false,
            action: { type: "giveItem", itemGranted: "i_photo", flagSet: "b_done" } },
          { id: "b_door", label: "door", bounds: { x: 40, y: 40, w: 20, h: 20 }, cursor: "use", isRepeatable: false,
            action: { type: "useItem", itemConsumed: "i_key", targetSceneId: "gold" } },
        ],
        choices: [
          { id: "b_mem", text: "say something", reply: true, attitudeTag: "Clever", memoryLog: "mem_tag" },
          { id: "b_over", text: "give up", targetSceneId: "over", attitudeTag: "Neutral",
            gating: { requiresFlags: ["b_done"] } },
        ],
      },
      { id: "gold", title: "Gold", background: "/g.png", prose: "p", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
        endingData: { tier: "victory-gold", headline: "H", recap: "r" } },
      { id: "over", title: "Over", background: "/o.png", prose: "p", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
        endingData: { tier: "gameover", headline: "H", recap: "r" } },
    ],
  };
  return JSON.parse(JSON.stringify(story)) as Story;
}

let pass = 0, fail = 0;
const issueCounts = (issues: ValidationIssue[]) => ({
  e: issues.filter((x) => x.severity === "error").length,
  w: issues.filter((x) => x.severity === "warning").length,
});
function expect(name: string, issues: ValidationIssue[], wantErr: number, wantWarn = 0) {
  const { e, w } = issueCounts(issues);
  if (e >= wantErr && w >= wantWarn) { pass++; console.log(`  ✓ ${name}  (${e}E/${w}W)`); }
  else { fail++; console.log(`  ✗ ${name}: expected ≥${wantErr}E/≥${wantWarn}W got ${e}E/${w}W`); issues.forEach((i) => console.log(`      [${i.severity}] ${i.message}`)); }
}

console.log("AUDIT validateStory — every injected fault must be flagged\n");

{ const s = base(); const v = validateStory(s); if (v.length) { console.log("  ✗ healthy base NOT clean:"); v.forEach((i)=>console.log(`    [${i.severity}] ${i.message}`)); fail++; } else { pass++; console.log("  ✓ healthy base clean (0 issues)"); } }

// ERROR-grade structural faults
expect("dangling choice target", errsOf(() => { const s = base(); s.scenes[0].choices![0].targetSceneId = "nope"; return s; }), 1);
expect("unknown beat character", errsOf(() => { const s = base(); s.scenes[0].dialogueBeats![0].characterId = "ghost"; return s; }), 1);
expect("unknown gate item", errsOf(() => { const s = base(); s.scenes[1].choices!.push({ id: "g", text: "x", targetSceneId: "gold", gating: { requiresItems: ["i_nope"] } }); return s; }), 1);
expect("unknown present item", errsOf(() => { const s = base(); s.scenes[0].choices!.push({ id: "p", text: "x", presentItem: "i_nope", targetSceneId: "gold" }); return s; }), 1);
expect("gate item never granted", errsOf(() => { const s = base(); s.items.push({ id: "i_never", name: "x", icon: "x", description: "d", flavorText: "f" }); s.scenes[1].choices!.push({ id: "g", text: "x", targetSceneId: "gold", gating: { requiresItems: ["i_never"] } }); return s; }), 1);
expect("no victory ending", errsOf(() => { const s = base(); s.scenes = s.scenes.filter((x) => x.id !== "gold"); return s; }), 1);
expect("required flag never set", errsOf(() => { const s = base(); s.scenes[1].choices!.push({ id: "g", text: "x", targetSceneId: "gold", gating: { requiresFlags: ["never_set"] } }); return s; }), 1);
expect("missing start scene", errsOf(() => { const s = base(); s.startSceneId = "missing"; return s; }), 1);
expect("no-exit non-ending scene", errsOf(() => { const s = base(); s.scenes[1].choices = []; s.scenes[1].hotspots = []; return s; }), 1);
expect("self auto-advance", errsOf(() => { const s = base(); s.scenes[1].autoAdvanceTargetSceneId = "b"; return s; }), 1);
expect("duplicate scene id", errsOf(() => { const s = base(); const x = JSON.parse(JSON.stringify(s.scenes[0])); x.id = "b"; s.scenes.push(x); return s; }), 1);
expect("wired-in note no route out", errsOf(() => { const s = base(); s.scenes.push({ id: "n1", title: "N", nodeType: "note", background: "/n.png", prose: "", dialogueBeats: [], hotspots: [], choices: [] }); s.scenes[1].choices!.push({ id: "to", text: "note", targetSceneId: "n1" }); return s; }), 1);
expect("duplicate item", errsOf(() => { const s = base(); s.items.push({ id: "i_key", name: "dup", icon: "x", description: "d", flavorText: "f" }); return s; }), 1);
expect("stage scene no way out", errsOf(() => { const s = base(); s.scenes.push({ id: "st", title: "S", nodeType: "stage", background: "/s.png", prose: "", stage: { floor: { top: 60, bottom: 90 }, spawn: { x: 50, y: 85 } }, dialogueBeats: [], hotspots: [], choices: [] }); return s; }), 1);
expect("stage talk marker no beats", errsOf(() => { const s = base(); s.scenes.push({ id: "st2", title: "S", nodeType: "stage", background: "/s.png", prose: "", stage: { floor: { top: 60, bottom: 90 }, spawn: { x: 50, y: 85 }, exitEdges: { left: { targetSceneId: "gold" } } }, dialogueBeats: [], hotspots: [{ id: "tk", label: "tk", bounds: { x: 10, y: 10, w: 20, h: 20 }, cursor: "talk", action: { type: "startDialogue" } }], choices: [] }); return s; }), 1);
expect("invalid hotspot bounds", errsOf(() => { const s = base(); s.scenes[1].hotspots!.push({ id: "bad", label: "bad", bounds: { x: 200, y: 200, w: 10, h: 10 }, cursor: "look", action: { type: "showText", text: "x" } }); return s; }), 1);
expect("recipe unknown ingredient", errsOf(() => { const s = base(); s.items.push({ id: "i_c", name: "c", icon: "c", description: "d", flavorText: "f", combinableWith: { targetItemId: "i_x", resultItemId: "i_y" } }); return s; }), 1);
expect("press-the-lie no evidence", errsOf(() => { const s = base(); s.scenes[0].dialogueBeats!.push({ id: "lie", characterId: "c1", text: "claim", lie: { contradictedFlag: "liar", evidenceItemIds: [], contradictedConsequences: {}, wrongConsequences: {}, caughtBeat: { id: "cb", characterId: "c2", text: "gotcha" } } }); return s; }), 1);

// WARNING-grade craft faults
expect("unreachable scene", warnsOf(() => { const s = base(); s.scenes.push({ id: "orphan", title: "O", background: "/o.png", prose: "p", isEnding: true, dialogueBeats: [], hotspots: [], choices: [], endingData: { tier: "gameover", headline: "H", recap: "r" } }); return s; }), 0, 1);
expect("flag set never read", warnsOf(() => { const s = base(); s.scenes[0].choices!.push({ id: "c", text: "x", targetSceneId: "b", consequences: { setFlags: ["dead_flag"] } }); return s; }), 0, 1);
expect("memory never recalled", warnsOf(() => { const s = base(); s.scenes[1].choices!.push({ id: "m", text: "x", reply: true, memoryLog: "dead_tag" }); return s; }), 0, 1);
expect("qte fake deadline", warnsOf(() => { const s = base(); s.scenes[0].choices!.push({ id: "q", text: "quick", targetSceneId: "b", quickTime: true, timeLimitSeconds: 5 }); return s; }), 0, 1);
// The same fault on the QUIET clock: a plain conversation timer whose silence
// costs nothing. This was invisible while the check was gated on quickTime.
expect("conversation timer fake deadline", warnsOf(() => { const s = base(); s.scenes[0].choices!.push({ id: "t", text: "timed", targetSceneId: "b", timeLimitSeconds: 7 }); return s; }), 0, 1);
expect("conversation timer with a silence branch is clean", warnsOf(() => { const s = base(); s.scenes[0].choices!.push({ id: "t", text: "timed", targetSceneId: "b", timeLimitSeconds: 7, timedOutConsequences: { setFlags: ["a_done"] } }); return s; }), 0, 0);
// Interruptible dialogue must not be a silent no-op.
expect("interruptible dialogue with no beats", warnsOf(() => { const s = base(); s.scenes[0].interruptibleDialogue = true; s.scenes[0].dialogueBeats = []; return s; }), 0, 1);
expect("interruptible dialogue blocked by a final cut", warnsOf(() => { const s = base(); s.scenes[0].interruptibleDialogue = true; s.scenes[0].dialogueBeats = [{ id: "a1", characterId: "c1", text: "hello", afterBeatTargetSceneId: "b" }]; return s; }), 0, 1);
expect("interruptible dialogue is clean on a plain conversation", warnsOf(() => { const s = base(); s.scenes[0].interruptibleDialogue = true; return s; }), 0, 0);
expect("flag note for nonexistent flag", warnsOf(() => { const s = base(); s.flagNotes!["nothing"] = "x"; return s; }), 0, 1);
expect("one-way stage door", warnsOf(() => { const s = base(); s.scenes.push({ id: "st3", title: "Side Room", nodeType: "stage", background: "/s.png", prose: "", stage: { floor: { top: 60, bottom: 90 }, spawn: { x: 50, y: 85 } }, dialogueBeats: [], hotspots: [{ id: "back", label: "GO — on", bounds: { x: 80, y: 40, w: 12, h: 50 }, cursor: "go", action: { type: "goToScene", targetSceneId: "b" } }], choices: [] }); s.scenes.push({ id: "st4", title: "Dead Side", nodeType: "stage", background: "/s.png", prose: "", stage: { floor: { top: 60, bottom: 90 }, spawn: { x: 50, y: 85 } }, dialogueBeats: [], hotspots: [{ id: "fwd", label: "GO — gold", bounds: { x: 80, y: 40, w: 12, h: 50 }, cursor: "go", action: { type: "goToScene", targetSceneId: "gold" } }], choices: [] }); s.scenes[2].hotspots!.push({ id: "in", label: "GO — dead side", bounds: { x: 10, y: 40, w: 12, h: 50 }, cursor: "go", action: { type: "goToScene", targetSceneId: "st4" } }); return s; }), 0, 1);
expect("spawn-on-exit trap", warnsOf(() => { const s = base(); s.scenes.push({ id: "st5", title: "Trap Room", nodeType: "stage", background: "/s.png", prose: "", stage: { floor: { top: 60, bottom: 90 }, spawn: { x: 8, y: 85 }, reach: 5, hotspotTrigger: "walkover" }, dialogueBeats: [], hotspots: [{ id: "door", label: "GO — gold", bounds: { x: 2, y: 40, w: 12, h: 50 }, cursor: "go", action: { type: "goToScene", targetSceneId: "gold" } }], choices: [] }); s.scenes[0].choices!.push({ id: "toTrap", text: "trap", targetSceneId: "st5" }); return s; }), 0, 1);
// Negative control: an ESPER region really does set the flag at runtime, so a
// gate on it must NOT read as "required flag never set".
expect("esper region counts as a producer", errsOf(() => { const s = base(); s.scenes[1].hotspots = [{ id: "esper", label: "USE — ESPER", bounds: { x: 20, y: 45, w: 18, h: 42 }, cursor: "use", action: { type: "esperPhoto", esperPhoto: { title: "E", instruction: "", photoImage: "", regions: [{ id: "r", label: "S", x: 0, y: 0, w: 10, h: 10, flagSet: "esper_flag", isTarget: true }] } } }, { id: "gate", label: "GO — gold", bounds: { x: 70, y: 40, w: 12, h: 50 }, cursor: "go", gating: { requiresFlags: ["esper_flag"] }, action: { type: "goToScene", targetSceneId: "gold" } }]; return s; }), 0);

console.log(`\n=== AUDIT RESULT: ${pass} passed, ${fail} failed ===`);
process.exitCode = fail ? 1 : 0;

function errsOf(fn: () => Story): ValidationIssue[] { return validateStory(fn()).filter((x) => x.severity === "error"); }
function warnsOf(fn: () => Story): ValidationIssue[] { return validateStory(fn()).filter((x) => x.severity === "warning"); }
