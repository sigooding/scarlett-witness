import type { Story } from "../types";

/* ------------------------------------------------------------------ */
/*  Canvas layout helpers                                              */
/*                                                                    */
/*  Pure functions so the two things Studio does to the canvas —      */
/*  healing a broken draft layout and tidying a mess into act rows —  */
/*  are testable outside the component (see scripts/preflight.mjs).   */
/* ------------------------------------------------------------------ */

/** Merge a stored draft's layout onto the built-in floor, repairing piles.
 *
 * Two failure modes are repaired:
 *   1. MISSING positions (a draft saved before the story had a layout, or
 *      before scenes were added) — those cards stack at the origin.
 *   2. PILED positions (many scenes sharing one coordinate).
 *
 * The built-in layout is the floor; the author's own distinct drags always
 * win, so real work is never lost — only unreadable piles fall back. */
export type LayoutEntry = { x: number; y: number; w?: number; h?: number };

export function healLayout(
  storedLayout: Record<string, LayoutEntry> | undefined,
  baseLayout: Record<string, LayoutEntry>
): Record<string, LayoutEntry> {
  const merged: Record<string, LayoutEntry> = { ...baseLayout };
  const byPos = new Map<string, number>();
  Object.values(storedLayout ?? {}).forEach((p) => {
    const k = `${Math.round(p.x)},${Math.round(p.y)}`;
    byPos.set(k, (byPos.get(k) ?? 0) + 1);
  });
  // A coordinate claimed by four or more cards is a pile, not a composition.
  const pileKeys = new Set([...byPos.entries()].filter(([, n]) => n >= 4).map(([k]) => k));
  Object.entries(storedLayout ?? {}).forEach(([sid, p]) => {
    const k = `${Math.round(p.x)},${Math.round(p.y)}`;
    const basePos = baseLayout[sid];
    if (!pileKeys.has(k) || (basePos && basePos.x === p.x && basePos.y === p.y)) merged[sid] = p;
  });
  return merged;
}

/** Deterministic "tidy" positions: one row band per act (when the story has
 *  acts), scenes in authoring order left → right, wrapping at six per row.
 *  The fastest cure for a canvas that has become one pile of cards. */
export function tidyLayoutPositions(story: Story): Record<string, LayoutEntry> {
  const acts = story.acts ?? [];
  const starts = new Set(acts.map((a) => a.startSceneId));
  const groups: { label?: string; scenes: Story["scenes"] }[] = [];
  story.scenes.forEach((sc) => {
    if (starts.has(sc.id)) groups.push({ label: acts.find((a) => a.startSceneId === sc.id)?.label, scenes: [sc] });
    else if (!groups.length) groups.push({ scenes: [sc] });
    else groups[groups.length - 1].scenes.push(sc);
  });
  const PER_ROW = 6;
  const X_STEP = 340;
  const Y_STEP = 460;
  const layout: Record<string, LayoutEntry> = {};
  let y = 0;
  groups.forEach((g) => {
    g.scenes.forEach((sc, i) => {
      // Tidy re-flows POSITIONS only. An author-set card size is a deliberate
      // choice about that scene (a long note needs room), so carry w/h across
      // — rebuilding the entry from scratch would silently reset every
      // resized card the first time someone tidied the canvas.
      const prev = story.layout?.[sc.id];
      layout[sc.id] = {
        x: (i % PER_ROW) * X_STEP,
        y: y + Math.floor(i / PER_ROW) * Y_STEP,
        ...(prev?.w ? { w: prev.w } : {}),
        ...(prev?.h ? { h: prev.h } : {}),
      };
    });
    y += Math.ceil(g.scenes.length / PER_ROW) * Y_STEP + 80;
  });
  return layout;
}

/* ------------------------------------------------------------------ *
 *  Card sizing                                                        *
 * ------------------------------------------------------------------ */

/** The width an unresized scene card renders at (Tailwind `w-56`). A resize
 *  must never take a card NARROWER than the default it started at — that only
 *  crushes the choice text. */
export const SCENE_CARD_DEFAULT_W = 224;

/** The absolute floor for a scene card, whatever its content. Even the
 *  emptiest ending still draws a header, a preview strip and a counts row, and
 *  a card shorter than that is squeezing rows that are already at their
 *  natural size. */
export const SCENE_CARD_DEFAULT_H = 150;

/** The smallest height a scene card can be drawn at without squashing its own
 *  content. Derived from what the card actually renders rather than a single
 *  constant, because the two extremes pull in opposite directions: an ending
 *  with no exits should be shrinkable, while a scene with eight choices needs
 *  room for eight connection handles — and a clipped handle is a wire the
 *  author cannot reach.
 *
 *  Rows are measured GENEROUSLY (their real rendered height, not an optimistic
 *  one). An under-estimate here is what let a drag squash the "drag to add
 *  choice" row: the formula thought the card still had slack, so the resizer
 *  kept going and flex squeezed the last row out of the layout.
 *
 *  Pixel figures mirror the Tailwind padding on SceneFlowNode's rows. */
export function sceneCardMinHeight(input: {
  isEnding?: boolean;
  choices?: number;
  linkedHotspots?: number;
  hasAutoAdvance?: boolean;
  hasEpisodeBand?: boolean;
  hasActBand?: boolean;
  hasNote?: boolean;
}): number {
  const exitRows = input.isEnding
    ? 1 // "ending — no outgoing connections"
    : (input.choices ?? 0) +
      (input.linkedHotspots ?? 0) +
      (input.hasAutoAdvance ? 1 : 0) +
      1; // the always-present "drag to add choice" row
  const content =
    28 + // header (10px pulp caps + py-1 + border)
    56 + // background preview strip (min-h-14)
    22 + // hotspot/beat counts row
    (input.hasEpisodeBand ? 18 : 0) +
    (input.hasActBand ? 18 : 0) +
    (input.hasNote ? 26 : 0) +
    exitRows * 22 + // each exit row carries a connection handle
    8; // borders
  return Math.max(SCENE_CARD_DEFAULT_H, content);
}
