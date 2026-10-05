/**
 * STRANDED — the runtime's dead-end detector.
 *
 * The validator says a scene *could* trap the player; the playthrough bot says
 * a random walk *did* trap it. Neither is standing next to the player when it
 * happens. When a room runs out of things to do — every exit consumed, every
 * reply spent, no auto-advance — the game used to just sit there: an empty
 * choice rail, no hint, and a player clicking the background hoping something
 * would fire. The honest recovery (Rewind, the auto checkpoint, quitting) was
 * in the menu, but nothing told you to look there.
 *
 * This module answers one question with the SAME decision surface the bot
 * uses, so the verdict can never disagree with the simulation:
 *
 *    strandedNow(story, sim, ctx) → is there nothing left to do here?
 *
 * `simFromRuntime` is the only mapping from <CasePlayer>'s live state into a
 * `SimState`, so the runtime and the bot read the world identically — one
 * definition, used by both (the rule Game.tsx already follows for perks,
 * repeatability and the beat queue).
 *
 * The detector is deliberately CONSERVATIVE. `availableDecisions` models
 * choices, replies, quick-time lapses, hotspots and their verbs, corkboard
 * deductions, pressing a lie, minigame outcomes, stage edges, map travel and
 * auto-transitions — but it does not model the first-person rooms, a credits
 * roll's Begin button or an insert shot's Continue. Those scenes are exempt,
 * and so is any moment the player is mid-line, mid-typing or has a panel open:
 * a false "you're stuck" is worse than no message at all. Game.tsx also waits
 * STRANDED_GRACE_MS before showing anything, so a scene that is about to
 * auto-advance never flashes the panel.
 */

import { availableDecisions, type SimState } from "./decisions";
import type { Episode, GlobalState, SceneNode, Story } from "../types";

/** How long the world must look empty before the player is told. Long enough
 *  that an auto-advance, an after-beat cut or a slow entry script has fired
 *  first; short enough that a genuinely stuck player isn't left wondering. */
export const STRANDED_GRACE_MS = 2500;

/** Everything the mapping needs from the running player. Field names match
 *  <CasePlayer>'s own so the call site reads as a handover, not a transform. */
export interface RuntimeWorld {
  sceneId: string;
  state: GlobalState;
  /** `${sceneId}:${choiceId}` */
  usedChoices: ReadonlySet<string>;
  /** `${sceneId}:${hotspotId}` */
  usedHotspots: ReadonlySet<string>;
  visitedScenes: ReadonlySet<string>;
  /** choice ids whose quick-time window lapsed in the CURRENT visit */
  expiredChoices: ReadonlySet<string>;
  /** live interrogation composure by scene id */
  composure?: Record<string, number>;
  /** STAGE nodes: a startDialogue marker has the conversation open */
  stageConvoOpen?: boolean;
  /** characters whose beats the player has actually seen */
  encounteredCharacters?: ReadonlySet<string>;
  /** PRESS THE LIE — bluffs called per beat id, this visit */
  lieWrongCounts?: Record<string, number>;
  /** decisions applied so far (the runtime doesn't count them; 0 is fine) */
  steps?: number;
}

/** The one mapping from live runtime state to the simulated world. */
export function simFromRuntime(w: RuntimeWorld): SimState {
  return {
    sceneId: w.sceneId,
    state: w.state,
    usedChoices: new Set(w.usedChoices),
    usedHotspots: new Set(w.usedHotspots),
    visitedScenes: new Set(w.visitedScenes),
    expiredChoices: new Set(w.expiredChoices),
    composure: { ...(w.composure ?? {}) },
    stageConvoOpen: !!w.stageConvoOpen,
    encounteredCharacters: new Set(w.encounteredCharacters ?? []),
    lieWrongCounts: { ...(w.lieWrongCounts ?? {}) },
    steps: w.steps ?? 0,
  };
}

export interface StrandedVerdict {
  stranded: boolean;
  /** how many decisions the surface still offered (0 when stranded) */
  offered: number;
  /** why the check declined to judge — an exempt scene or a busy moment */
  skipped: string | null;
}

const NOT_JUDGED = (skipped: string): StrandedVerdict => ({ stranded: false, offered: 0, skipped });

/** Scenes and moments the decision surface does not model, so "no decisions"
 *  there is not evidence of a dead end. */
export function strandedExemption(scene: SceneNode | undefined, busy?: boolean, inBeats?: boolean): string | null {
  if (!scene) return "no scene";
  if (scene.isEnding) return "ending";
  // Credits and cutscenes are driven by their own Begin/Continue chrome.
  if (scene.nodeType === "credits" || scene.nodeType === "cutscene") return `${scene.nodeType} node`;
  // Author placeholders the runtime bypasses; the player never stands in one.
  if (scene.nodeType === "note") return "note node";
  // First-person rooms walk their own exits (doors, keys, triggers) inside the
  // Quake-style stage — the choice/marker surface can't see any of it.
  if (scene.stage?.quake) return "first-person room";
  if (inBeats) return "mid-dialogue";
  if (busy) return "panel open";
  return null;
}

/** Is the player out of things to do? `ctx` carries the runtime's own chrome
 *  (an open overlay, a typing line) so the verdict is only ever delivered when
 *  the screen really is idle. */
export function strandedNow(
  story: Story,
  sim: SimState,
  ctx?: { scene?: SceneNode; busy?: boolean; inBeats?: boolean; episode?: Episode }
): StrandedVerdict {
  const scene = ctx?.scene ?? story.scenes.find((s) => s.id === sim.sceneId);
  const skipped = strandedExemption(scene, ctx?.busy, ctx?.inBeats);
  if (skipped) return NOT_JUDGED(skipped);
  const offered = availableDecisions(story, sim, ctx?.episode).length;
  return { stranded: offered === 0, offered, skipped: null };
}
