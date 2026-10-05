import type { SpriteSheet } from "./spriteSheet";

export type StageDirection = "left" | "right" | "up" | "down" | "up-left" | "up-right" | "down-left" | "down-right";

/** Existing four-way sheets keep their original dominant-axis headings.
 * Adding any diagonal walk clip opts a sheet into eight-way movement. These
 * are authored frame banks, not generated rotations of a side-on photograph. */
export function hasDiagonalWalk(sheet?: SpriteSheet): boolean {
  return ["up-left", "up-right", "down-left", "down-right"].some(d => !!sheet?.animations?.[`walk-${d}`]?.frames.length);
}

export function stageDirection(dx: number, dy: number, previous: StageDirection = "right", diagonals = false): StageDirection {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || (dx === 0 && dy === 0)) return previous;
  const x = dx < 0 ? "left" : "right", y = dy < 0 ? "up" : "down";
  if (diagonals && Math.min(Math.abs(dx), Math.abs(dy)) > Math.max(Math.abs(dx), Math.abs(dy)) * Math.tan(Math.PI / 8)) return `${y}-${x}`;
  return Math.abs(dx) >= Math.abs(dy) ? x : y;
}

/** Prefer explicitly drawn headings. Mirror only if the opposite horizontal
 * heading exists (or using the legacy right-facing base clip). Missing
 * diagonals fall back to their vertical angle, then the old base animation.
 * Missing idle clips still request idle and fall back to walk, allowing
 * SheetSprite.freezeOnFallback to prevent moonwalking at rest. */
export function stageDirectionAnimation(sheet: SpriteSheet | undefined, dir: StageDirection, moving: boolean): { anim: string; fallbacks: string[]; flip: boolean } {
  const phase = moving ? "walk" : "idle";
  const left = dir === "left" || dir.endsWith("-left");
  const candidates: { anim: string; flip: boolean }[] = [{ anim: `${phase}-${dir}`, flip: false }];
  if (left) candidates.push({ anim: `${phase}-${dir.replace("left", "right")}`, flip: true });
  else if (dir === "right" || dir.endsWith("-right")) candidates.push({ anim: `${phase}-${dir.replace("right", "left")}`, flip: true });
  if (dir.includes("-")) candidates.push({ anim: `${phase}-${dir.split("-")[0]}`, flip: false });
  candidates.push({ anim: phase, flip: left });
  const found = candidates.find(c => sheet?.animations?.[c.anim]?.frames.length);
  if (found) return { ...found, fallbacks: moving ? ["idle"] : ["walk"] };
  // Keep the requested name absent rather than relabelling a walk fallback as
  // idle: otherwise the renderer would animate a stationary character.
  if (!moving) {
    const walk = stageDirectionAnimation(sheet, dir, true);
    return { anim: "idle", fallbacks: [walk.anim, ...walk.fallbacks], flip: walk.flip };
  }
  return { anim: phase, fallbacks: ["idle"], flip: left };
}
