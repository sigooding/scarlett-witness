/**
 * CONVERSATION TIMERS — the Wolf Among Us dialogue clock.
 *
 * Telltale's signature pressure isn't the action prompt; it's an ordinary
 * conversation with a ring shrinking around each reply, where letting it run
 * out means your character says NOTHING and the moment passes without you.
 * The engine had the loud half of that and not the quiet half: a countdown
 * only rendered, only expired and only got audited when the choice was also
 * flagged `quickTime` — so `timeLimitSeconds` on a plain dialogue choice was
 * dead data. Worse than dead: the ⏱ readout rendered for ANY timed choice, so
 * an author who followed docs/stage-nodes.md ("give them timeLimitSeconds for
 * the 'decide now' pressure") watched a clock tick to zero and do nothing.
 *
 * Two mechanics live here, both pure so the runtime, the bot and the validator
 * read them identically (the rule stranded.ts follows):
 *
 *   1. A CONVERSATION TIMER — any `timeLimitSeconds` choice shows a ring and
 *      expires. Expiry is a decision, not a cancellation: the authored
 *      timeout consequences apply ("react to the silence"), the timeout
 *      destination routes when there is one, and a reply simply disappears
 *      from the rail because you never said it. The quick-time banner, the
 *      heartbeat sting and shaky cam stay `quickTime`-only — a conversation
 *      under a clock should feel like a conversation, not an action set piece.
 *
 *   2. INTERRUPTIBLE DIALOGUE — opt-in per scene
 *      (`scene.interruptibleDialogue`): the replies surface over the FINAL
 *      line instead of waiting for it to finish, so the clock is already
 *      running while the other character is still talking. Cutting in is the
 *      point; picking a reply mid-line applies its consequences and the
 *      response beat it unlocks plays next, exactly as it does when the reply
 *      is picked after the line.
 *
 * Both are deliberately narrow. Earlier lines belong to the speaker — only the
 * last visible beat can be interrupted, so a conversation still plays as a
 * conversation. And an after-beat cut on that final line owns the exit
 * (`onRoutingBeat`): surfacing choices over an insert shot that is about to
 * route away would offer the player a decision the scene has already made.
 */

import type { Choice, Consequences, SceneNode } from "../types";

/** Which clock a timed choice carries. `qte` is the loud action prompt
 *  (banner, heartbeat, shaky cam); `conversation` is the quiet dialogue ring. */
export type TimerFlavour = "qte" | "conversation";

/** The clock on this choice, or null when it isn't timed. */
export function timerFlavour(c: Pick<Choice, "timeLimitSeconds" | "quickTime">): TimerFlavour | null {
  if (!c.timeLimitSeconds) return null;
  return c.quickTime ? "qte" : "conversation";
}

/** Does this choice render a shrinking countdown ring? Every timed choice
 *  does now — the ring used to require `quickTime`, which left a conversation
 *  timer invisible while its ⏱ readout still counted down. */
export function showsCountdownRing(c: Pick<Choice, "timeLimitSeconds">): boolean {
  return !!c.timeLimitSeconds;
}

/** Ring and readout treatment. A conversation clock is cool and quiet; the
 *  quick-time prompt keeps the gold-to-crimson alarm it has always had. The
 *  readout classes are written out in full so Tailwind's scanner can see them. */
export const TIMER_STYLE: Record<TimerFlavour, { ring: string; criticalRing: string; readout: string }> = {
  qte: { ring: "#e8b23c", criticalRing: "#e23b4e", readout: "text-gold" },
  conversation: { ring: "#59d8e8", criticalRing: "#e23b4e", readout: "text-cyan-neon" },
};

/** What the world does when a timed choice's clock runs out. Silence is a
 *  decision, so it gets the same machinery a pick does: consequences, a
 *  destination, a journey entry — and a rewind snapshot, because "the window
 *  closed" is exactly the moment players most want back. */
export interface SilenceOutcome {
  /** where the silence routes, or null to stay in the scene */
  dest: string | null;
  /** the authored "react to the silence" effects */
  consequences: Consequences | undefined;
  /** true when the option just disappears (a reply nobody said) */
  stays: boolean;
  /** was this a quick-time lapse (loud) or a conversation clock (quiet)? */
  flavour: TimerFlavour;
}

/** Resolve an expired clock. Matches the quick-time convention the engine has
 *  always used — `timedOutTargetSceneId ?? targetSceneId` — so a reply (which
 *  has no target) stays put unless the author gave the silence somewhere to
 *  go, and a navigating choice falls back to its own destination. */
export function silenceOutcome(c: Choice): SilenceOutcome {
  const dest = c.timedOutTargetSceneId ?? c.targetSceneId ?? null;
  return {
    dest,
    consequences: c.timedOutConsequences,
    stays: !dest,
    flavour: c.quickTime ? "qte" : "conversation",
  };
}

/** Everything the interrupt decision needs from the running player. Field
 *  names match <CasePlayer>'s own so the call site reads as a handover. */
export interface InterruptContext {
  scene: SceneNode | undefined;
  /** how many beats will actually play, gating applied */
  visibleBeatCount: number;
  /** the beat currently on screen */
  beatIdx: number;
  /** the scene's prose has been acknowledged — choices must not race the prose */
  proseAcknowledged: boolean;
  /** the final visible beat carries a valid after-beat cut and we're on it:
   *  the cut owns this exit, so replies must not surface over it */
  onRoutingBeat: boolean;
  /** a menu, modal or fade is covering the scene */
  busy: boolean;
}

/** Can the player cut in over the line that's playing? Only the final visible
 *  beat of an opted-in scene, only once the prose is out of the way, and never
 *  over an after-beat cut or behind a panel. */
export function interruptibleNow(ctx: InterruptContext): boolean {
  if (!ctx.scene?.interruptibleDialogue) return false;
  if (ctx.busy || !ctx.proseAcknowledged || ctx.onRoutingBeat) return false;
  if (ctx.visibleBeatCount === 0) return false;
  return ctx.beatIdx >= ctx.visibleBeatCount - 1;
}

/** A scene that opts into interruptible dialogue but whose final visible beat
 *  always routes away can never actually be interrupted — the cut owns the
 *  exit. Reported by the validator so the flag isn't a silent no-op. Pure so
 *  the engine tests can assert the rule without a DOM. */
export function interruptBlockedByBeatRoute(scene: SceneNode): boolean {
  if (!scene.interruptibleDialogue) return false;
  const beats = scene.dialogueBeats ?? [];
  if (beats.length === 0) return false;
  // Only an UNCONDITIONED after-beat cut on the last beat always wins: a
  // gated one may not play at all, in which case a different beat is last and
  // the interruption still happens.
  const last = beats[beats.length - 1];
  return !!last.afterBeatTargetSceneId && !last.conditionRule;
}
