import type { FpsActorState, FpsSpriteKind, FpsWeapon } from "./types";

/** Pure view math, shared with the regression tests. Omission retains v1's
 * exact weapon framing for existing drafts and portable reels. */
export function weaponViewTransform(aspect: number, view?: FpsWeapon["view"]) {
  const scale = view?.scale ?? 1;
  return {
    width: Math.min(1.65, 1.1 / Math.max(0.65, aspect / 1.5)) * scale,
    height: 1.7 * scale,
    x: view?.x ?? 0.32,
    y: view?.y ?? -0.55,
  };
}

/** An alerted guard which has stopped is idle, not sliding its feet forever. */
export function actorAnimation(
  actor: Pick<FpsActorState, "hp" | "attackAt">,
  kind: FpsSpriteKind,
  attackInterval: number,
  moving: boolean,
  now: number,
): "idle" | "walk" | "attack" | "death" {
  if (actor.hp <= 0) return "death";
  if (kind !== "enemy") return "idle";
  if (actor.attackAt - now > attackInterval - 0.23) return "attack";
  return moving ? "walk" : "idle";
}
