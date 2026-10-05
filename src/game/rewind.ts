/**
 * REWIND ONE DECISION.
 *
 * The ← key already rewinds one LINE within a scene. It cannot undo a
 * decision: a misclicked choice, a quick-time window you let lapse, a reply
 * you wish you hadn't said, or the items and flags a decision handed you three
 * scenes back. Until now the only recovery was a save file or restarting the
 * episode — brutal for players, and worse for authors, who had to replay the
 * first two branches of a conversation every time they wanted to test the
 * third.
 *
 * This is a bounded stack of world snapshots. It reuses the save machinery
 * wholesale: an entry IS a `GameSave` (the exact shape `buildSave` produces
 * and `restoreSave` consumes), so undoing a decision is "restore the snapshot
 * taken just before it" — items un-picked, flags un-set, meters and trust
 * rolled back, the journey log truncated, all by construction rather than by
 * a second, drift-prone inverse-effects implementation.
 *
 * Rules that make it a feature rather than a cheat:
 *
 *  · ONE DECISION, NOT ONE FRAME. A snapshot is pushed immediately BEFORE a
 *    decision commits (a choice, a QTE expiry, a state-changing hotspot) —
 *    never on every render, never on every line of dialogue.
 *  · CONSECUTIVE DUPLICATES COLLAPSE. Re-entering the same scene at the same
 *    step doesn't grow the stack.
 *  · ENDINGS ARE FINAL. A snapshot taken at an ending scene is refused, and
 *    the stack is sealed once an ending is reached, so rewind can never be
 *    used to re-roll an ending until you like the one you got. Quitting to
 *    the newsstand clears it.
 *  · IT IS RAM-ONLY. Nothing is persisted; a reload starts a fresh stack.
 *    Rewind is an undo, not a save system, and must never compete with slots.
 */

import type { GameSave } from "../types";

/** How many decisions deep rewind can reach. Deep enough to undo a bad
 *  conversation, shallow enough that the snapshots stay small in memory. */
export const REWIND_LIMIT = 25;

export interface RewindEntry {
  /** the world exactly as it stood before the decision */
  save: GameSave;
  /** what the player is about to do — shown on the Rewind button's tooltip */
  label: string;
  /** which scene the decision was made in (for the tooltip and tests) */
  sceneTitle: string;
  at: number;
}

export interface RewindStack {
  entries: RewindEntry[];
  /** set once an ending has been reached: no further pushes, no pops */
  sealed: boolean;
}

export const emptyRewind = (): RewindStack => ({ entries: [], sealed: false });

/** A cheap identity for "the same moment": scene + dialogue cursor + the
 *  size of every progress set. Two snapshots that agree on all of it describe
 *  the same decision point, so the second is redundant. */
function momentKey(save: GameSave): string {
  return [
    save.sceneId,
    save.beatIdx,
    save.proseAcknowledged ? 1 : 0,
    save.activeFlags?.length ?? 0,
    save.inventory?.length ?? 0,
    save.usedChoices?.length ?? 0,
    save.usedHotspots?.length ?? 0,
    save.journey?.length ?? 0,
    Object.values(save.meters ?? {}).join("/"),
    Object.entries(save.characterTrust ?? {}).sort().map(([k, v]) => `${k}:${v}`).join("/"),
  ].join("|");
}

/**
 * Push the world as it stands before a decision. Pure — returns a new stack.
 *
 * `isEnding` refuses a snapshot taken at an ending (there is no decision left
 * to undo there, and allowing it would let a player rewind out of the ending
 * they earned).
 */
export function pushRewind(
  stack: RewindStack,
  save: GameSave,
  label: string,
  opts?: { isEnding?: boolean; limit?: number; at?: number }
): RewindStack {
  if (stack.sealed) return stack;
  if (opts?.isEnding) return stack;
  const top = stack.entries[stack.entries.length - 1];
  if (top && momentKey(top.save) === momentKey(save)) {
    // Same moment, better label (the specific decision beats a generic
    // "arrived at the scene"): keep one entry, describe it accurately.
    if (label && top.label !== label) {
      const entries = stack.entries.slice(0, -1);
      entries.push({ ...top, label });
      return { ...stack, entries };
    }
    return stack;
  }
  const limit = opts?.limit ?? REWIND_LIMIT;
  const entries = [...stack.entries, { save, label, sceneTitle: save.sceneTitle ?? "", at: opts?.at ?? Date.now() }];
  // Bounded: the oldest decisions fall off the bottom.
  return { ...stack, entries: entries.length > limit ? entries.slice(entries.length - limit) : entries };
}

/** Pop the most recent snapshot. Returns the stack unchanged (and a null
 *  entry) when there is nothing to undo or the stack is sealed. */
export function popRewind(stack: RewindStack): { stack: RewindStack; entry: RewindEntry | null } {
  if (stack.sealed || !stack.entries.length) return { stack, entry: null };
  const entries = stack.entries.slice(0, -1);
  const entry = stack.entries[stack.entries.length - 1];
  return { stack: { ...stack, entries }, entry };
}

/** Seal the stack — an ending has been reached and the run is decided. */
export function sealRewind(stack: RewindStack): RewindStack {
  return stack.sealed ? stack : { ...stack, sealed: true };
}

/** Can the player undo a decision right now? */
export function canRewindDecision(stack: RewindStack): boolean {
  return !stack.sealed && stack.entries.length > 0;
}

/** What the Rewind control should say it will undo. */
export function rewindLabel(stack: RewindStack): string | null {
  if (!canRewindDecision(stack)) return null;
  const top = stack.entries[stack.entries.length - 1];
  return top.label || top.sceneTitle || "the last decision";
}
