/**
 * THE DECISION SURFACE — the runtime's branching logic, as pure functions.
 *
 * Everything a player can DO at a given moment (pick a choice, let a
 * quick-time window lapse, fire a hotspot, be carried out by an auto-advance
 * or an after-beat route, get folded by heat) used to be knowable only by
 * mounting the 8.6k-line <CasePlayer> React tree and clicking. That made the
 * engine untestable end-to-end: a branch could only be checked by a human
 * playing it.
 *
 * This module answers two questions with no React, no DOM, no audio and no
 * storage:
 *
 *    availableDecisions(story, sim)      → what can happen here?
 *    applyDecision(story, sim, decision) → what does the world look like after?
 *
 * `Game.tsx` imports the shared rules from here (perks, repeatability,
 * consequence adjustment, the visible-beat queue) so the simulation can never
 * silently drift from the thing players actually play — there is one
 * definition, used by both.
 *
 * The automated playthrough bot (scripts/playthrough-bot.mjs) is just a loop
 * over these two functions.
 */

import {
  applyConsequences,
  applyLieCaught,
  applyLieWrong,
  bypassedSceneId,
  choiceRepeats,
  combineItems,
  effectiveChoiceGating,
  evidenceBreaksLie,
  heatBustTarget,
  hotspotRepeats,
  interrogationOutcome,
  isPressingReply,
  itemsConsumedBy,
  lieCanStillPress,
  mapAvailable,
  meetsGating,
  pressComposure,
  presentationConsequences,
  recordMemory,
  recordPresentation,
  resolveHotspot,
  resolveVerbAction,
  sceneById,
  VERB_LABEL,
  verbsForScene,
} from "../logic";
import { gameRandom } from "./rng";
import type {
  Choice,
  Consequences,
  DialogueBeat,
  Episode,
  GlobalState,
  MeterKey,
  SceneNode,
  Story,
  VerbId,
} from "../types";

/* ------------------------------------------------------------------ */
/*  Perks — meter thresholds that bend consequences                    */
/* ------------------------------------------------------------------ */

export interface Perks {
  velvetTongue: boolean;
  ironNerve: boolean;
  sharpEye: boolean;
  heat: boolean;
}

/** The perk set a world state currently qualifies for. */
export function getPerks(state: GlobalState): Perks {
  return {
    velvetTongue: state.meters.Sultry >= 4,
    ironNerve: state.meters.Aggressive >= 4,
    sharpEye: state.meters.Clever >= 4,
    heat: state.meters.Suspicion >= 6,
  };
}

/**
 * A choice's consequences after the perk layer:
 *   · Velvet Tongue (Sultry 4+) — positive trust gains get +1
 *   · HEAT (Suspicion 6+)       — positive trust gains are halved
 *   · Iron Nerve (Aggressive 4+) — Aggressive choices stop costing Suspicion
 * Starts from `presentationConsequences` so an item handover survives.
 */
export function adjustedConsequences(
  choice: Choice,
  state: GlobalState,
  base?: Consequences
): Consequences | undefined {
  const perks = getPerks(state);
  let cons = base ?? presentationConsequences(choice);
  if (cons?.trustChanges && (perks.velvetTongue || perks.heat)) {
    cons = {
      ...cons,
      trustChanges: cons.trustChanges.map((t) => {
        let d = t.delta;
        if (d > 0 && perks.velvetTongue) d += 1;
        if (d > 0 && perks.heat) d = Math.max(1, Math.floor(d / 2));
        return { ...t, delta: d };
      }),
    };
  }
  if (cons?.meterChanges && perks.ironNerve && choice.attitudeTag === "Aggressive") {
    cons = {
      ...cons,
      meterChanges: cons.meterChanges.map((m) =>
        m.meter === "Suspicion" && m.delta > 0 ? { ...m, delta: 0 } : m
      ),
    };
  }
  return cons;
}

/* ------------------------------------------------------------------ */
/*  The chance gamble                                                  */
/* ------------------------------------------------------------------ */

/**
 * CHANCE GAMBLE — one gameplay draw decides whether a 🎲 choice lands.
 * This is the SINGLE roll rule: <CasePlayer>'s pickChoice and the
 * playthrough bot's applyDecision both call it, so the runtime and the
 * simulation can never disagree about which way the dice went. The draw is
 * part of the seeded stream, so a `?seed=` run (or a bot session) replays
 * the exact dice; unseeded, it's live Math.random.
 */
export function rollGamble(choice: Pick<Choice, "chance">): "hit" | "miss" | null {
  return typeof choice.chance === "number" && Number.isFinite(choice.chance)
    ? (gameRandom() * 100 < choice.chance
        ? "hit"
        : "miss")
    : null;
}

/** The flag a landed gamble writes, so later beats/gates can branch on HOW
 * the dice went, not just which scene the player ended up in. */
export function gambleFlag(sceneId: string, choiceId: string, gamble: "hit" | "miss"): string {
  return `chance:${sceneId}:${choiceId}:${gamble}`;
}

/* ------------------------------------------------------------------ */
/*  Repeatability                                                      */
/* ------------------------------------------------------------------ */
/* The rules themselves live in logic.ts (pure story logic, and the validator
 * needs them to audit return traps — decisions.ts imports logic.ts, so keeping
 * them here would put them out of its reach). Re-exported unchanged: every
 * existing importer of `choiceRepeats` / `hotspotRepeats` from this module
 * keeps working, and there is still exactly one definition. */
export { choiceRepeats, hotspotRepeats };

/* ------------------------------------------------------------------ */
/*  The beat queue                                                     */
/* ------------------------------------------------------------------ */

/** The dialogue beats that would actually play in this scene for this state:
 *  authored beats whose gate passes, each broken lie's caught beat spliced in
 *  after its claim, then the interrogation's broke/clamped beats. Mirrors the
 *  queue <CasePlayer> builds on entry. */
export function visibleBeatQueue(scene: SceneNode, state: GlobalState): DialogueBeat[] {
  const queue: DialogueBeat[] = [];
  for (const b of scene.dialogueBeats ?? []) {
    if (!meetsGating(b.conditionRule, state)) continue;
    queue.push(b);
    if (b.lie && state.activeFlags.has(b.lie.contradictedFlag)) queue.push(b.lie.caughtBeat);
  }
  const iq = scene.interrogation;
  if (iq) {
    const extra = [
      state.activeFlags.has(iq.brokeFlag) ? iq.brokeBeat : null,
      iq.clampFlag && iq.clampedBeat && state.activeFlags.has(iq.clampFlag) ? iq.clampedBeat : null,
    ].filter((b): b is DialogueBeat => !!b && meetsGating(b.conditionRule, state));
    queue.push(...extra);
  }
  return queue;
}

/* ------------------------------------------------------------------ */
/*  Simulated world                                                    */
/* ------------------------------------------------------------------ */

/** Everything the decision surface needs to know. A subset of <CasePlayer>'s
 *  state: no timers, no typing, no audio — the parts that decide *what can
 *  happen*, not *how it looks*. */
export interface SimState {
  sceneId: string;
  state: GlobalState;
  /** `${sceneId}:${choiceId}` */
  usedChoices: Set<string>;
  /** `${sceneId}:${hotspotId}` */
  usedHotspots: Set<string>;
  visitedScenes: Set<string>;
  /** choice ids whose window lapsed in the CURRENT scene visit */
  expiredChoices: Set<string>;
  /** live interrogation composure, by scene id */
  composure: Record<string, number>;
  /** STAGE nodes: has a startDialogue marker opened the conversation? */
  stageConvoOpen: boolean;
  /** Characters whose beats the player has actually seen — only these appear
   *  as suspects on the corkboard. */
  encounteredCharacters: Set<string>;
  /** PRESS THE LIE — how many bluffs have been called on each claim, by beat
   *  id. At `wrongEvidenceLimit` the claim shuts for the scene. */
  lieWrongCounts: Record<string, number>;
  /** how many decisions have been applied (loop guard for the bot) */
  steps: number;
}

/** A fresh simulation at the story's (or an episode's) opening scene. */
export function initialSim(story: Story, state: GlobalState, startSceneId?: string): SimState {
  const sceneId = bypassedSceneId(story, startSceneId ?? story.startSceneId);
  const blank: SimState = {
    sceneId,
    state,
    usedChoices: new Set(),
    usedHotspots: new Set(),
    visitedScenes: new Set([sceneId]),
    expiredChoices: new Set(),
    composure: {},
    stageConvoOpen: false,
    encounteredCharacters: new Set(),
    lieWrongCounts: {},
    steps: 0,
  };
  // The opening scene gets the same entry treatment as any other: its
  // on-enter actions fire and its speakers count as met.
  return enterScene({ ...blank, visitedScenes: new Set() }, story, sceneId);
}

/* ------------------------------------------------------------------ */
/*  Decisions                                                          */
/* ------------------------------------------------------------------ */

export type Decision =
  | { kind: "combine"; sceneId: string; a: string; b: string; label: string }
  /** the player picks a choice (navigating or a conversational reply) */
  | { kind: "choice"; sceneId: string; choiceId: string; label: string; reply: boolean; quickTime: boolean; targetSceneId?: string }
  /** the player lets a quick-time window lapse — deciding by not deciding */
  | { kind: "qte-timeout"; sceneId: string; choiceId: string; label: string; targetSceneId?: string }
  /** the player fires a hotspot / stage marker. `verb` is set when the
   *  activation went through the VERB COIN (look / take / kick / use…),
   *  `itemId` when an item was used on the object. */
  | { kind: "hotspot"; sceneId: string; hotspotId: string; label: string; targetSceneId?: string; verb?: VerbId; itemId?: string }
  /** 📌 CORKBOARD — wire a held clue to a suspect you've met. The revelation
   *  sets a flag that late choices and endings gate on, so an unmodelled
   *  board makes whole finales look unreachable. */
  | { kind: "deduction"; sceneId: string; clueId: string; suspectId: string; flagSet: string; label: string }
  /** PRESS THE LIE — challenge a beat's false claim with a held item. Both
   *  the right evidence (breaks it) and a bluff (gets called) are decisions. */
  | { kind: "press-lie"; sceneId: string; beatId: string; itemId: string; label: string; correct: boolean }
  /** A minigame's OUTCOME — solving or failing the pattern puzzle, winning or
   *  crashing the ride. The bot can't play the minigame itself, but both of
   *  its outcomes are ordinary branches with consequences and a target scene,
   *  so it decides the result and the world moves on exactly as it would. */
  | {
      kind: "minigame";
      sceneId: string;
      game: "pattern-puzzle" | "ride" | "arcade" | "esper" | "vk";
      /** the hotspot (puzzle) or choice (ride) that launched it */
      sourceId: string;
      won: boolean;
      label: string;
      targetSceneId?: string;
    }
  /** 🚶 STAGE — the player walks off the left/right edge of the room */
  | { kind: "stage-exit"; sceneId: string; edge: "left" | "right"; label: string; targetSceneId: string }
  /** 🚶 STAGE — the conversation has played out and hands the floor back */
  | { kind: "stage-convo-end"; sceneId: string; label: string }
  /** 🗺 TRAVEL MAP — the destination computer (openable from ANY scene)
   *  routes the Spinner to an UNLOCKED pin. Locked pins never surface: the
   *  map shows them as locked, the player can't travel them. Without this
   *  kind the bot reads map-only scenes as unreachable and map-hubbed
   *  stories as dead-ended — exactly how the Blade Runner case looked. */
  | { kind: "map-travel"; sceneId: string; locationId: string; label: string; targetSceneId: string }
  /** the scene carries the player onward by itself */
  | { kind: "auto"; sceneId: string; label: string; targetSceneId: string; via: "auto-advance" | "after-beat" }
  /** heat boiled over — the city folds the player out of the scene */
  | { kind: "heat-bust"; sceneId: string; label: string; targetSceneId: string };

/** A stable key for a decision, used for tallies and weighting. Matches the
 *  playtest-coverage key shapes so the bot can weight itself with a real
 *  coverage record. */
export function decisionKey(d: Decision): string {
  if (d.kind === "combine") return `#combine:${[d.a, d.b].sort().join("+")}`;
  if (d.kind === "choice") return `${d.sceneId}:${d.choiceId}`;
  if (d.kind === "qte-timeout") return `${d.sceneId}:${d.choiceId}#timeout`;
  if (d.kind === "hotspot") {
    // The verb is part of the identity: "look at the machine" and "kick the
    // machine" are different branches of the same object.
    const suffix = d.verb ? `#${d.verb}${d.itemId ? `+${d.itemId}` : ""}` : "";
    return `${d.sceneId}:${d.hotspotId}${suffix}`;
  }
  if (d.kind === "stage-exit") return `${d.sceneId}#edge:${d.edge}`;
  if (d.kind === "map-travel") return `${d.sceneId}#map:${d.locationId}`;
  if (d.kind === "deduction") return `#board:${d.clueId}+${d.suspectId}`;
  if (d.kind === "press-lie") return `${d.sceneId}:${d.beatId}#press:${d.itemId}`;
  if (d.kind === "minigame") return `${d.sceneId}:${d.sourceId}#${d.game}:${d.won ? "won" : "lost"}`;
  return `${d.sceneId}#${d.kind}`;
}

/** The coverage bucket a decision belongs to (`null` = not tallied). */
export function decisionCoverageKind(d: Decision): "choice" | "marker" | null {
  if (d.kind === "choice") return "choice";
  if (d.kind === "hotspot") return "marker";
  if (d.kind === "minigame") return d.game === "ride" ? "choice" : "marker";
  return null;
}

/** The key the COVERAGE TALLY stores this decision under, which is not always
 *  `decisionKey`: coverage counts a marker per object, while the decision
 *  surface distinguishes the verbs used on it. Returns null when the decision
 *  isn't tallied at all. */
export function decisionCoverageKey(d: Decision): string | null {
  if (d.kind === "choice") return `${d.sceneId}:${d.choiceId}`;
  if (d.kind === "hotspot") return `${d.sceneId}:${d.hotspotId}`;
  // A minigame is tallied against whatever launched it — the puzzle's marker
  // or the ride's choice.
  if (d.kind === "minigame") return `${d.sceneId}:${d.sourceId}`;
  return null;
}

/**
 * Everything that can happen at this moment, in the runtime's own order of
 * precedence:
 *
 *   1. an ending is terminal — nothing follows it
 *   2. a heat bust supersedes the scene (the runtime routes on it immediately)
 *   3. choices the player can actually pick (gate passed, not spent, not
 *      expired, not hidden-and-locked)
 *   4. hotspots / stage markers whose gate passes and which aren't spent
 *   5. failing all of the above, the scene's own exit: an after-beat route or
 *      an auto-advance
 */
export function availableDecisions(story: Story, sim: SimState, episode?: Episode): Decision[] {
  const scene = sceneById(story, sim.sceneId);
  if (!scene) return [];
  if (scene.isEnding) return [];

  const bust = heatBustTarget(story, sim.state, sim.sceneId, episode);
  if (bust) {
    return [{ kind: "heat-bust", sceneId: sim.sceneId, label: "Too much heat — the city closes in", targetSceneId: bust }];
  }

  const out: Decision[] = [];
  const isStage = scene.nodeType === "stage";

  // ---- choices -----------------------------------------------------
  // A stage node's choices only exist while a startDialogue marker has the
  // conversation open — walking the floor is not a dialogue.
  const choicesLive = !isStage || sim.stageConvoOpen;
  if (choicesLive) {
    for (const c of scene.choices ?? []) {
      if (sim.expiredChoices.has(c.id)) continue;
      if (!choiceRepeats(c) && sim.usedChoices.has(`${sim.sceneId}:${c.id}`)) continue;
      const gate = effectiveChoiceGating(c);
      if (!meetsGating(gate, sim.state)) continue; // locked (hidden or shown-disabled) — not pickable
      if (!c.reply && !c.targetSceneId) continue; // unwired: the runtime refuses it with a toast
      if (c.reply && c.targetSceneId) {
        // a reply that also navigates is an authoring error the validator
        // flags; the runtime treats `reply` as authoritative.
      }
      if (c.ride) {
        // A ride choice launches the steerable minigame rather than
        // navigating: it wins to targetSceneId, or crashes to
        // timedOutTargetSceneId with the timed-out consequences — the same
        // "you hesitated" convention a QTE expiry uses. Both are branches.
        out.push({
          kind: "minigame",
          sceneId: sim.sceneId,
          game: "ride",
          sourceId: c.id,
          won: true,
          label: `${c.text} — and make it`,
          ...(c.targetSceneId ? { targetSceneId: c.targetSceneId } : {}),
        });
        out.push({
          kind: "minigame",
          sceneId: sim.sceneId,
          game: "ride",
          sourceId: c.id,
          won: false,
          label: `${c.text} — and crash`,
          ...(c.timedOutTargetSceneId ?? c.targetSceneId ? { targetSceneId: c.timedOutTargetSceneId ?? c.targetSceneId } : {}),
        });
        continue;
      }
      out.push({
        kind: "choice",
        sceneId: sim.sceneId,
        choiceId: c.id,
        label: c.text,
        reply: !!c.reply,
        quickTime: !!c.quickTime,
        targetSceneId: c.reply ? undefined : c.targetSceneId,
      });
      // Letting a quick-time window close IS a decision — the runtime applies
      // its timed-out consequences and routes to the hesitation branch.
      if (c.quickTime && c.timeLimitSeconds) {
        out.push({
          kind: "qte-timeout",
          sceneId: sim.sceneId,
          choiceId: c.id,
          label: `(let "${c.text}" lapse)`,
          targetSceneId: c.timedOutTargetSceneId ?? c.targetSceneId,
        });
      }
    }
  }

  // ---- hotspots ----------------------------------------------------
  // MULTI-STATE objects are resolved first: a lever up and a lever down are
  // the same hotspot with different actions, and the player acts on the one
  // in front of them right now.
  const verbs = isStage ? verbsForScene(scene) : [];
  const heldItems = sim.state.inventory.map((i) => i.id);
  for (const raw of scene.hotspots ?? []) {
    if (isStage && sim.stageConvoOpen) continue; // in conversation: the floor is frozen
    const hs = resolveHotspot(raw, sim.state);
    if (!hotspotRepeats(hs) && sim.usedHotspots.has(`${sim.sceneId}:${hs.id}`)) continue;
    if (!meetsGating(hs.gating, sim.state)) continue;

    if (hs.action.type === "arcadeGame" && hs.action.arcadeGame) {
      // Same treatment as the pattern puzzle: the bot can't play a climber,
      // but winning and losing are ordinary branches with consequences and
      // optional destinations, so it decides the outcome instead.
      const cfg = hs.action.arcadeGame;
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "arcade",
        sourceId: hs.id,
        won: true,
        label: `beat "${cfg.title || hs.label}"`,
        ...(cfg.targetSceneId ? { targetSceneId: cfg.targetSceneId } : {}),
      });
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "arcade",
        sourceId: hs.id,
        won: false,
        label: `lose "${cfg.title || hs.label}"`,
        ...(cfg.loseTargetSceneId ? { targetSceneId: cfg.loseTargetSceneId } : {}),
      });
      continue;
    }

    if (hs.action.type === "patternPuzzle" && hs.action.patternPuzzle) {
      // The bot can't drag rows around, but both OUTCOMES of the puzzle are
      // ordinary branches (reward/wrong consequences, a target scene), so it
      // decides the result instead. Skipping this leaves the scenes behind a
      // puzzle permanently unreachable — which is exactly how the demo case
      // read as a dead end.
      const cfg = hs.action.patternPuzzle;
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "pattern-puzzle",
        sourceId: hs.id,
        won: true,
        label: `solve "${cfg.title || hs.label}"`,
        ...(cfg.targetSceneId ? { targetSceneId: cfg.targetSceneId } : {}),
      });
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "pattern-puzzle",
        sourceId: hs.id,
        won: false,
        label: `fail "${cfg.title || hs.label}"`,
        ...(cfg.wrongTargetSceneId ? { targetSceneId: cfg.wrongTargetSceneId } : {}),
      });
      continue;
    }

    if (hs.action.type === "esperPhoto" && hs.action.esperPhoto) {
      const cfg = hs.action.esperPhoto;
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "esper",
        sourceId: hs.id,
        won: true,
        label: `esper "${cfg.title || hs.label}"`,
        ...(cfg.targetSceneId ? { targetSceneId: cfg.targetSceneId } : {}),
      });
      continue;
    }

    if (hs.action.type === "vkTest" && hs.action.vkTest) {
      const cfg = hs.action.vkTest;
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "vk",
        sourceId: hs.id,
        won: true,
        label: `vk-replicant "${cfg.title || hs.label}"`,
        ...(cfg.replicantTargetSceneId || cfg.targetSceneId ? { targetSceneId: cfg.replicantTargetSceneId || cfg.targetSceneId } : {}),
      });
      out.push({
        kind: "minigame",
        sceneId: sim.sceneId,
        game: "vk",
        sourceId: hs.id,
        won: false,
        label: `vk-human "${cfg.title || hs.label}"`,
        ...(cfg.humanTargetSceneId || cfg.targetSceneId ? { targetSceneId: cfg.humanTargetSceneId || cfg.targetSceneId } : {}),
      });
      continue;
    }

    out.push({
      kind: "hotspot",
      sceneId: sim.sceneId,
      hotspotId: hs.id,
      label: hs.label,
      targetSceneId: hs.action.type === "showText" ? undefined : hs.action.targetSceneId,
    });

    // VERB COIN — "look at the bench" and "kick the machine" are separate
    // branches of one object, and a puzzle can hang on the unusual verb (Rain
    // Sector's key card only falls out of the vending machine if you KICK it).
    // Enumerating them is what lets the bot find those.
    for (const verb of verbs) {
      const res = resolveVerbAction(hs, verb);
      if (!res.ok || !res.action) continue;
      if (res.action === hs.action && hs.cursor === verb) continue; // already offered above
      out.push({
        kind: "hotspot",
        sceneId: sim.sceneId,
        hotspotId: hs.id,
        label: `${VERB_LABEL[verb]} ${hs.label}`,
        verb,
        targetSceneId: res.action.type === "showText" ? undefined : res.action.targetSceneId,
      });
    }
    // USE <held item> ON <object> — only items the object actually accepts,
    // so the bot doesn't enumerate the whole satchel against every marker.
    if (verbs.includes("use")) {
      for (const itemId of heldItems) {
        const res = resolveVerbAction(hs, "use", itemId);
        if (!res.ok || !res.action) continue;
        out.push({
          kind: "hotspot",
          sceneId: sim.sceneId,
          hotspotId: hs.id,
          label: `use ${itemId} on ${hs.label}`,
          verb: "use",
          itemId,
          targetSceneId: res.action.type === "showText" ? undefined : res.action.targetSceneId,
        });
      }
    }
  }

  // Crafting is real gameplay, not a dead end behind an unmodelled item.
  const inventory = sim.state.inventory;
  for (let i = 0; i < inventory.length; i++) {
    for (let j = i + 1; j < inventory.length; j++) {
      if (combineItems(story, inventory[i], inventory[j])) out.push({ kind: "combine", sceneId: sim.sceneId, a: inventory[i].id, b: inventory[j].id, label: `combine ${inventory[i].name} + ${inventory[j].name}` });
    }
  }

  // ---- 📌 corkboard deductions --------------------------------------
  // The board is always reachable from the HUD, so wiring a clue to a suspect
  // is available in any scene. Only connections the author actually wrote
  // count, and only when the player holds the clue and has met the suspect —
  // the same two conditions the board itself enforces. Bad pairings are just
  // a "those don't sing together" buzz with no state change, so they aren't
  // decisions.
  for (const conn of story.deduction?.connections ?? []) {
    if (sim.state.activeFlags.has(conn.flagSet)) continue; // already pinned
    const suspects = new Set(story.deduction?.suspectIds ?? []);
    for (const [clueId, suspectId] of [
      [conn.a, conn.b],
      [conn.b, conn.a],
    ] as const) {
      if (!suspects.has(suspectId) || !sim.encounteredCharacters.has(suspectId)) continue;
      const clue = sim.state.inventory.find((i) => i.id === clueId && i.isClue);
      if (!clue) continue;
      out.push({
        kind: "deduction",
        sceneId: sim.sceneId,
        clueId,
        suspectId,
        flagSet: conn.flagSet,
        label: `📌 wire ${clue.name} to ${story.characters.find((c) => c.id === suspectId)?.name ?? suspectId}`,
      });
      break;
    }
  }

  // ---- press the lie -----------------------------------------------
  // A beat carrying a `lie` can be challenged with a held item while it is on
  // screen. Both outcomes are real branches: the right evidence sets the
  // contradicted flag (which downstream choices and endings gate on), and a
  // bluff costs heat/trust and burns one of a limited number of attempts.
  // Modelled here because otherwise a whole tier of endings is unreachable.
  for (const beat of visibleBeatQueue(scene, sim.state)) {
    const lie = beat.lie;
    if (!lie) continue;
    if (sim.state.activeFlags.has(lie.contradictedFlag)) continue; // already broken
    if (!lieCanStillPress(lie, sim.lieWrongCounts[beat.id] ?? 0)) continue; // they shut you down
    for (const item of sim.state.inventory) {
      const correct = evidenceBreaksLie(lie, heldItems, item.id);
      out.push({
        kind: "press-lie",
        sceneId: sim.sceneId,
        beatId: beat.id,
        itemId: item.id,
        label: `press the lie with ${item.name}`,
        correct,
      });
    }
  }

  // ---- 🚶 stage: walk-off-screen edge exits ------------------------
  // The LucasArts edge arrow. A whole exit mechanism that lives on the stage
  // settings rather than in `choices`, so a room can legitimately have an
  // empty choice list and still not be a dead end.
  if (isStage && !sim.stageConvoOpen) {
    for (const edge of ["left", "right"] as const) {
      const exit = scene.stage?.exitEdges?.[edge];
      if (!exit?.targetSceneId || !sceneById(story, exit.targetSceneId)) continue;
      if (!meetsGating(exit.gating, sim.state)) continue; // a yellow (locked) arrow
      out.push({
        kind: "stage-exit",
        sceneId: sim.sceneId,
        edge,
        label: exit.label ? `walk ${edge} — ${exit.label}` : `walk off ${edge}`,
        targetSceneId: exit.targetSceneId,
      });
    }
  }

  // ---- 🗺 travel map: the destination computer ----------------------
  // The map opens from ANY scene (the T key), so an unlocked pin is a branch
  // everywhere — including from a stage, where it is the only exit in the
  // original Blade Runner's hub design. Locked pins stay out of the list:
  // the player sees them as locked, and travelling one is not a choice.
  // (A stage conversation freezes the floor — the map can't open mid-chat.)
  if (mapAvailable(story) && !(isStage && sim.stageConvoOpen)) {
    for (const loc of story.map?.locations ?? []) {
      if (!loc.targetSceneId || !sceneById(story, loc.targetSceneId)) continue;
      if (bypassedSceneId(story, loc.targetSceneId) === sim.sceneId) continue; // "you are here"
      if (!meetsGating(loc.gating, sim.state)) continue;
      out.push({
        kind: "map-travel",
        sceneId: sim.sceneId,
        locationId: loc.id,
        label: `travel: ${loc.label}`,
        targetSceneId: loc.targetSceneId,
      });
    }
  }

  // ---- 🚶 stage: the conversation running out ----------------------
  // A stage conversation with no usable closing choices left auto-closes and
  // hands the floor back to the player — the room is not stuck, the *chat*
  // is over. Modelling it keeps a talked-out marker from reading as a dead end.
  if (isStage && sim.stageConvoOpen && !out.some((d) => d.kind === "choice")) {
    out.push({ kind: "stage-convo-end", sceneId: sim.sceneId, label: "(the conversation ends)" });
    return out;
  }

  // ---- the scene's own exit ----------------------------------------
  const hasUsableChoice = out.some((d) => d.kind === "choice");
  if (!hasUsableChoice) {
    const beats = visibleBeatQueue(scene, sim.state);
    const last = beats[beats.length - 1];
    const beatTarget = last?.afterBeatTargetSceneId;
    if (beatTarget && sceneById(story, beatTarget)) {
      out.push({ kind: "auto", sceneId: sim.sceneId, label: "…the scene carries on", targetSceneId: beatTarget, via: "after-beat" });
    } else {
      const auto = scene.autoAdvanceTargetSceneId;
      if (auto && auto !== sim.sceneId && sceneById(story, auto)) {
        out.push({ kind: "auto", sceneId: sim.sceneId, label: "…the scene moves on", targetSceneId: auto, via: "auto-advance" });
      }
    }
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Applying a decision                                                */
/* ------------------------------------------------------------------ */

export interface DecisionEffect {
  sim: SimState;
  /** did the player leave the scene? */
  moved: boolean;
  /** coverage entries this decision earned, in the shape recordVisit wants */
  coverage: { kind: "scene" | "choice" | "marker"; id: string }[];
  /** human-readable trace lines (what the bot prints / the log shows) */
  notes: string[];
}

function enterScene(sim: SimState, story: Story, rawId: string): SimState {
  const sceneId = bypassedSceneId(story, rawId);
  const scene = sceneById(story, sceneId);
  const revisit = sim.visitedScenes.has(sceneId);
  let state = sim.state;
  // ON-ENTER ACTIONS fire on FIRST entry only — reapplying them on every
  // backtrack is progression farming, and the runtime guards against it the
  // same way.
  if (scene && !revisit) {
    for (const a of scene.onEnterActions ?? []) {
      if (a.conditionRule && !meetsGating(a.conditionRule, state)) continue;
      state = applyConsequences(story, a.consequences, state);
    }
  }
  // "Who you met" is computed against the POST-onEnter state, so a beat that
  // only unlocks because of a same-scene trust bump still counts.
  const met = new Set(sim.encounteredCharacters);
  for (const beat of scene?.dialogueBeats ?? []) {
    if (meetsGating(beat.conditionRule, state)) met.add(beat.characterId);
  }
  return {
    ...sim,
    sceneId,
    state,
    visitedScenes: new Set(sim.visitedScenes).add(sceneId),
    encounteredCharacters: met,
    // per-visit state resets exactly as scene entry does in the runtime
    expiredChoices: new Set(),
    stageConvoOpen: false,
    // a claim shut by bluffs is shut for the SCENE, so the counters reset
    // when the player leaves it
    lieWrongCounts: {},
  };
}

/** Apply one decision. Pure: `sim` is never mutated. */
export function applyDecision(story: Story, sim: SimState, decision: Decision): DecisionEffect {
  const scene = sceneById(story, sim.sceneId);
  const notes: string[] = [];
  const coverage: DecisionEffect["coverage"] = [];
  let next: SimState = { ...sim, steps: sim.steps + 1 };

  const move = (target: string) => {
    next = enterScene(next, story, target);
    coverage.push({ kind: "scene", id: next.sceneId });
  };

  switch (decision.kind) {
    case "combine": {
      const a = next.state.inventory.find((i) => i.id === decision.a);
      const b = next.state.inventory.find((i) => i.id === decision.b);
      const result = a && b && combineItems(story, a, b);
      if (!a || !b || !result) return { sim: next, moved: false, coverage, notes: ["no matching recipe"] };
      next = { ...next, state: applyConsequences(story, { removeItems: [a.id, b.id], addItems: [result.id] }, next.state) };
      return { sim: next, moved: false, coverage, notes: [`crafted ${result.name}`] };
    }

    case "heat-bust": {
      notes.push(`heat bust → ${decision.targetSceneId}`);
      move(decision.targetSceneId);
      return { sim: next, moved: true, coverage, notes };
    }

    case "auto": {
      notes.push(`${decision.via} → ${decision.targetSceneId}`);
      move(decision.targetSceneId);
      return { sim: next, moved: true, coverage, notes };
    }

    case "stage-exit": {
      const exit = scene?.stage?.exitEdges?.[decision.edge];
      // Stepping off the edge can set a flag (the room remembers you left).
      if (exit?.flagSet) next = { ...next, state: applyConsequences(story, { setFlags: [exit.flagSet] }, next.state) };
      notes.push(`walked off ${decision.edge} → ${decision.targetSceneId}`);
      move(decision.targetSceneId);
      return { sim: next, moved: true, coverage, notes };
    }

    case "map-travel": {
      // The Spinner's destination computer: a plain route, exactly like the
      // runtime's TravelMap onTravel (goToScene, no consequences of its own).
      notes.push(`travel map → ${decision.targetSceneId}`);
      move(decision.targetSceneId);
      return { sim: next, moved: true, coverage, notes };
    }

    case "deduction": {
      notes.push(`pinned ${decision.clueId} → ${decision.suspectId} (${decision.flagSet})`);
      return {
        sim: { ...next, state: applyConsequences(story, { setFlags: [decision.flagSet] }, next.state) },
        moved: false,
        coverage,
        notes,
      };
    }

    case "press-lie": {
      const beat = visibleBeatQueue(scene!, next.state).find((b) => b.id === decision.beatId);
      const lie = beat?.lie;
      if (!lie) return { sim: next, moved: false, coverage, notes: ["missing lie"] };
      if (decision.correct) {
        notes.push(`pressed the lie with ${decision.itemId} — it broke`);
        return { sim: { ...next, state: applyLieCaught(story, lie, next.state) }, moved: false, coverage, notes };
      }
      // A called bluff: pay the cost and burn one of the limited attempts.
      notes.push(`bluffed with ${decision.itemId} — called`);
      return {
        sim: {
          ...next,
          state: applyLieWrong(story, lie, next.state),
          lieWrongCounts: { ...next.lieWrongCounts, [decision.beatId]: (next.lieWrongCounts[decision.beatId] ?? 0) + 1 },
        },
        moved: false,
        coverage,
        notes,
      };
    }

    case "minigame": {
      if (decision.game === "pattern-puzzle") {
        const raw = (scene?.hotspots ?? []).find((h) => h.id === decision.sourceId);
        const hs = raw && resolveHotspot(raw, next.state);
        const cfg = hs?.action.patternPuzzle;
        if (!cfg) return { sim: next, moved: false, coverage, notes: ["missing puzzle"] };
        const cons = decision.won ? cfg.rewardConsequences : cfg.wrongSubmissionConsequences;
        next = { ...next, state: applyConsequences(story, cons, next.state) };
        coverage.push({ kind: "marker", id: `${sim.sceneId}:${hs!.id}` });
        // A solved puzzle consumes its marker just as the one-shot hotspot
        // that launched it would — but a RETRYABLE puzzle keeps the board up
        // after a wrong submission, so failing it must not lock the player
        // out of the only route forward.
        const spent = decision.won || !cfg.allowRetry;
        if (spent && !hotspotRepeats(hs!)) {
          next = { ...next, usedHotspots: new Set(next.usedHotspots).add(`${sim.sceneId}:${hs!.id}`) };
        }
        notes.push(`pattern puzzle "${cfg.title}" ${decision.won ? "solved" : "failed"}`);
        const dest = decision.won ? cfg.targetSceneId : cfg.wrongTargetSceneId;
        if (dest && sceneById(story, dest)) {
          move(dest);
          return { sim: next, moved: true, coverage, notes };
        }
        return { sim: next, moved: false, coverage, notes };
      }
      if (decision.game === "arcade") {
        const raw = (scene?.hotspots ?? []).find((h) => h.id === decision.sourceId);
        const hs = raw && resolveHotspot(raw, next.state);
        const cfg = hs?.action.arcadeGame;
        if (!cfg) return { sim: next, moved: false, coverage, notes: ["missing arcade cabinet"] };
        const cons = decision.won ? cfg.rewardConsequences : cfg.loseConsequences;
        next = { ...next, state: applyConsequences(story, cons, next.state) };
        coverage.push({ kind: "marker", id: `${sim.sceneId}:${hs!.id}` });
        // Only WINNING spends the cabinet. Losing an arcade game must leave it
        // playable — walking away and putting another quarter in is the whole
        // idea, and a one-shot marker would strand a flag behind a lost run.
        if (decision.won && !hotspotRepeats(hs!)) {
          next = { ...next, usedHotspots: new Set(next.usedHotspots).add(`${sim.sceneId}:${hs!.id}`) };
        }
        notes.push(`arcade "${cfg.title || hs!.label}" ${decision.won ? "beaten" : "lost"}`);
        const dest = decision.won ? cfg.targetSceneId : cfg.loseTargetSceneId;
        if (dest && sceneById(story, dest)) {
          move(dest);
          return { sim: next, moved: true, coverage, notes };
        }
        return { sim: next, moved: false, coverage, notes };
      }
      if (decision.game === "esper") {
        const raw = (scene?.hotspots ?? []).find((h) => h.id === decision.sourceId);
        const hs = raw && resolveHotspot(raw, next.state);
        const cfg = hs?.action.esperPhoto;
        if (!cfg) return { sim: next, moved: false, coverage, notes: ["missing esper config"] };
        for (const reg of cfg.regions) {
          if (reg.flagSet) {
            next = { ...next, state: applyConsequences(story, { setFlags: [reg.flagSet] }, next.state) };
          }
          if (reg.itemGranted) {
            next = { ...next, state: applyConsequences(story, { addItems: [reg.itemGranted] }, next.state) };
          }
        }
        if (cfg.rewardConsequences) {
          next = { ...next, state: applyConsequences(story, cfg.rewardConsequences, next.state) };
        }
        coverage.push({ kind: "marker", id: `${sim.sceneId}:${hs!.id}` });
        if (!hotspotRepeats(hs!)) {
          next = { ...next, usedHotspots: new Set(next.usedHotspots).add(`${sim.sceneId}:${hs!.id}`) };
        }
        notes.push(`esper "${cfg.title || hs!.label}" completed`);
        if (cfg.targetSceneId && sceneById(story, cfg.targetSceneId)) {
          move(cfg.targetSceneId);
          return { sim: next, moved: true, coverage, notes };
        }
        return { sim: next, moved: false, coverage, notes };
      }
      if (decision.game === "vk") {
        const raw = (scene?.hotspots ?? []).find((h) => h.id === decision.sourceId);
        const hs = raw && resolveHotspot(raw, next.state);
        const cfg = hs?.action.vkTest;
        if (!cfg) return { sim: next, moved: false, coverage, notes: ["missing vk config"] };
        if (decision.won) {
          if (cfg.replicantFlagSet) {
            next = { ...next, state: applyConsequences(story, { setFlags: [cfg.replicantFlagSet] }, next.state) };
          }
          if (cfg.rewardConsequences) {
            next = { ...next, state: applyConsequences(story, cfg.rewardConsequences, next.state) };
          }
        } else {
          if (cfg.humanFlagSet) {
            next = { ...next, state: applyConsequences(story, { setFlags: [cfg.humanFlagSet] }, next.state) };
          }
        }
        coverage.push({ kind: "marker", id: `${sim.sceneId}:${hs!.id}` });
        if (!hotspotRepeats(hs!)) {
          next = { ...next, usedHotspots: new Set(next.usedHotspots).add(`${sim.sceneId}:${hs!.id}`) };
        }
        notes.push(`vk "${cfg.title || hs!.label}" ${decision.won ? "replicant" : "human"}`);
        const dest = decision.won ? (cfg.replicantTargetSceneId || cfg.targetSceneId) : (cfg.humanTargetSceneId || cfg.targetSceneId);
        if (dest && sceneById(story, dest)) {
          move(dest);
          return { sim: next, moved: true, coverage, notes };
        }
        return { sim: next, moved: false, coverage, notes };
      }
      // ride
      const c = (scene?.choices ?? []).find((x) => x.id === decision.sourceId);
      if (!c) return { sim: next, moved: false, coverage, notes: ["missing ride choice"] };
      coverage.push({ kind: "choice", id: `${sim.sceneId}:${c.id}` });
      if (!choiceRepeats(c)) next = { ...next, usedChoices: new Set(next.usedChoices).add(`${sim.sceneId}:${c.id}`) };
      const cons = adjustedConsequences(c, next.state, decision.won ? presentationConsequences(c) : c.timedOutConsequences);
      next = { ...next, state: recordPresentation(c, story, recordMemory(c, applyConsequences(story, cons, next.state))) };
      notes.push(`ride "${c.text}" ${decision.won ? "won" : "crashed"}`);
      const dest = decision.won ? c.targetSceneId : c.timedOutTargetSceneId ?? c.targetSceneId;
      if (dest && sceneById(story, dest)) {
        move(dest);
        return { sim: next, moved: true, coverage, notes };
      }
      return { sim: next, moved: false, coverage, notes };
    }

    case "stage-convo-end": {
      // The floor comes back: markers live again, the dialogue panel closes.
      notes.push("the conversation ended");
      return { sim: { ...next, stageConvoOpen: false }, moved: false, coverage, notes };
    }

    case "hotspot": {
      const raw = (scene?.hotspots ?? []).find((h) => h.id === decision.hotspotId);
      if (!raw) return { sim: next, moved: false, coverage, notes: ["missing hotspot"] };
      const hs = resolveHotspot(raw, next.state);
      // A verb-coin activation resolves to the action the object answers with
      // for that verb (and item); without a verb it's the object's default.
      let act = hs.action;
      if (decision.verb) {
        const res = resolveVerbAction(hs, decision.verb, decision.itemId);
        if (!res.ok || !res.action) {
          // A refusal ("that doesn't work here") is feedback, not a state
          // change — exactly what the runtime does.
          return { sim: next, moved: false, coverage, notes: [`${decision.verb} refused on "${hs.label}"`] };
        }
        act = res.action;
      }
      let st = next.state;
      if (act.itemGranted) st = applyConsequences(story, { addItems: [act.itemGranted] }, st);
      if (act.flagSet) st = applyConsequences(story, { setFlags: [act.flagSet] }, st);
      if (act.meterChange) st = applyConsequences(story, { meterChanges: [act.meterChange] }, st);
      // Consumption is author-explicit: only a useItem action with
      // itemConsumed set ever empties the satchel (see itemsConsumedBy).
      const spent = itemsConsumedBy(act);
      if (spent.length) st = applyConsequences(story, { removeItems: spent }, st);
      // CHAINED ACTIONS — mirror the runtime's completeHotspot: one click can
      // set a flag AND grant the items on the `then` chain (Bryant hands the
      // badge and blaster through exactly this path). Only STATE effects
      // chain, plus a final navigation that runs when the primary action did
      // not move us (a chained navigation racing the primary would double-
      // route — the runtime guards the same way).
      let chainTarget: string | undefined;
      for (const step of act.then ?? []) {
        if (step.itemGranted) st = applyConsequences(story, { addItems: [step.itemGranted] }, st);
        if (step.flagSet) st = applyConsequences(story, { setFlags: [step.flagSet] }, st);
        if (step.meterChange) st = applyConsequences(story, { meterChanges: [step.meterChange] }, st);
        if (step.targetSceneId && step.type !== "showText") {
          chainTarget = step.targetSceneId;
          break;
        }
      }
      next = { ...next, state: st };
      coverage.push({ kind: "marker", id: `${sim.sceneId}:${hs.id}` });
      // A verb action is flavour and stays on the object — only one that
      // TAKES something or MOVES the player consumes its marker.
      const markUsed = !decision.verb || act.type === "giveItem" || act.type === "goToScene";
      if (markUsed && !hotspotRepeats(hs)) {
        next = { ...next, usedHotspots: new Set(next.usedHotspots).add(`${sim.sceneId}:${hs.id}`) };
      }
      notes.push(`${decision.verb ? `${decision.verb} ` : ""}"${hs.label}" (${act.type})`);
      if (act.type === "startDialogue") {
        next = { ...next, stageConvoOpen: true };
        return { sim: next, moved: false, coverage, notes };
      }
      if (act.targetSceneId && act.type !== "showText") {
        move(act.targetSceneId);
        return { sim: next, moved: true, coverage, notes };
      }
      if (chainTarget && sceneById(story, chainTarget)) {
        move(chainTarget);
        return { sim: next, moved: true, coverage, notes };
      }
      return { sim: next, moved: false, coverage, notes };
    }

    case "qte-timeout": {
      const c = (scene?.choices ?? []).find((x) => x.id === decision.choiceId);
      if (!c) return { sim: next, moved: false, coverage, notes: ["missing choice"] };
      notes.push(`let "${c.text}" lapse`);
      let st = next.state;
      if (c.timedOutConsequences) st = applyConsequences(story, c.timedOutConsequences, st);
      next = { ...next, state: st, expiredChoices: new Set(next.expiredChoices).add(c.id) };
      const dest = c.timedOutTargetSceneId ?? c.targetSceneId;
      if (dest && dest !== sim.sceneId && sceneById(story, dest)) {
        move(dest);
        return { sim: next, moved: true, coverage, notes };
      }
      return { sim: next, moved: false, coverage, notes };
    }

    case "choice": {
      const c = (scene?.choices ?? []).find((x) => x.id === decision.choiceId);
      if (!c || !scene) return { sim: next, moved: false, coverage, notes: ["missing choice"] };
      coverage.push({ kind: "choice", id: `${sim.sceneId}:${c.id}` });
      notes.push(`choice "${c.text}"`);

      // spend it (and its exclusive siblings)
      if (!choiceRepeats(c) || c.reply) {
        const used = new Set(next.usedChoices);
        used.add(`${sim.sceneId}:${c.id}`);
        if (c.exclusiveGroup) {
          (scene.choices ?? [])
            .filter((s) => s.exclusiveGroup === c.exclusiveGroup)
            .forEach((s) => used.add(`${sim.sceneId}:${s.id}`));
        }
        next = { ...next, usedChoices: used };
      }

      if (c.reply) {
        // Interrogation pressure: an attitude-tagged reply spends composure;
        // at zero, trust decides crack vs clamp.
        const q = scene.interrogation;
        let outcome: "broke" | "clamped" | null = null;
        let composureNext: number | null = null;
        if (q && isPressingReply(c)) {
          const initial = q.composure ?? 3;
          const live = next.composure[sim.sceneId] ?? initial;
          const resolved =
            next.state.activeFlags.has(q.brokeFlag) || (!!q.clampFlag && next.state.activeFlags.has(q.clampFlag));
          if (!resolved && live > 0) {
            const pr = pressComposure(live, initial);
            composureNext = pr.next;
            if (pr.broke) {
              const projected = recordPresentation(
                c,
                story,
                recordMemory(c, applyConsequences(story, presentationConsequences(c), next.state))
              );
              outcome = interrogationOutcome(q, projected.characterTrust[q.characterId] ?? 0);
            }
          }
        }
        let st = recordPresentation(c, story, recordMemory(c, applyConsequences(story, presentationConsequences(c), next.state)));
        if (q && outcome && !st.activeFlags.has(q.brokeFlag) && !(q.clampFlag && st.activeFlags.has(q.clampFlag))) {
          const flag = outcome === "broke" ? q.brokeFlag : q.clampFlag;
          if (flag) st = { ...st, activeFlags: new Set(st.activeFlags).add(flag) };
          const cons = outcome === "broke" ? q.brokeConsequences : q.clampConsequences;
          if (cons) st = applyConsequences(story, cons, st);
          notes.push(`interrogation: ${outcome}`);
        }
        next = {
          ...next,
          state: st,
          composure: composureNext !== null ? { ...next.composure, [sim.sceneId]: outcome ? 0 : composureNext } : next.composure,
        };
        return { sim: next, moved: false, coverage, notes };
      }

      // CHANCE GAMBLE — the same single roll the runtime makes in
      // pickChoice: a miss swaps in the fail route + fail consequences
      // BEFORE anything else reads the choice, so the bot exercises the
      // "it didn't work" path exactly as a player would.
      const gamble = rollGamble(c);
      const effective = gamble === "miss" ? { ...c, consequences: c.failConsequences } : c;
      const cons = adjustedConsequences(effective, next.state);
      let st = recordPresentation(c, story, recordMemory(c, applyConsequences(story, cons, next.state)));
      if (gamble) {
        st = { ...st, activeFlags: new Set(st.activeFlags).add(gambleFlag(sim.sceneId, c.id, gamble)) };
      }
      next = { ...next, state: st };
      const dest = gamble === "miss" ? (c.failTargetSceneId ?? c.targetSceneId) : c.targetSceneId;
      if (dest && sceneById(story, dest)) {
        if (gamble) notes.push(`${gamble === "hit" ? "🎲 hit" : "🎲 miss"} at ${Math.round(c.chance ?? 0)}%`);
        move(dest);
        return { sim: next, moved: true, coverage, notes };
      }
      notes.push("dangling target — the runtime refuses this choice");
      return { sim: next, moved: false, coverage, notes };
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Diagnostics the bot reports on                                     */
/* ------------------------------------------------------------------ */

/** Is this a place a playthrough can get stuck? An ending is a legitimate
 *  stop; anything else with no decisions left is a dead end. */
export function isStuck(story: Story, sim: SimState, episode?: Episode): boolean {
  const scene = sceneById(story, sim.sceneId);
  if (!scene) return true;
  if (scene.isEnding) return false;
  return availableDecisions(story, sim, episode).length === 0;
}

/** Meters as a compact record — handy for reports and deep links. */
export function meterSummary(state: GlobalState): Record<MeterKey, number> {
  return { ...state.meters };
}
