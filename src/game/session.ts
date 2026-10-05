/**
 * Which screen the player was last on, so a reload puts them back there.
 *
 * A reload used to drop the player onto the newsstand even though the AUTO
 * checkpoint (slot 0, written on every scene arrival) still held their exact
 * scene. With HMR reloads in dev — or a browser refresh, or reopening the
 * packaged app — that reads as "the game restarted", when in fact nothing was
 * lost but the player's place in the UI.
 *
 * This module only records *where* the player was. Restoring a case goes
 * through the same `latestSave()` path as the newsstand's "▶ Resume" button,
 * so save handling is unchanged and manual slots are never touched.
 */

export const SESSION_KEY = "scarlet-reel-session";

export type StoredSession = { kind: "play"; storyId: string } | { kind: "studio" } | { kind: "gallery" };

const KINDS = ["play", "studio", "gallery"] as const;

/** The stored screen, or null when there is none (or it is unreadable/malformed
 *  — a bad value must never be enough to break startup). */
export function readSession(): StoredSession | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch {
    return null; // storage unavailable (private mode, disabled cookies)
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const { kind, storyId } = parsed as { kind?: unknown; storyId?: unknown };
  if (!KINDS.includes(kind as (typeof KINDS)[number])) return null;
  // A play session without a case id can't be restored — treat it as absent
  // rather than landing on a broken player.
  if (kind === "play") {
    return typeof storyId === "string" && storyId ? { kind: "play", storyId } : null;
  }
  return { kind } as StoredSession;
}

export function writeSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — sessions just won't survive a reload */
  }
}

/** Quitting to the newsstand is deliberate, so a reload must not bounce the
 *  player back into the case they just left. */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to do */
  }
}
