import type { GlobalState, Gating, Hotspot, SceneNode, Story } from "../types";
import { sceneRoutes } from "../sceneRoutes";
import {
  STAGE_GRID_STEP, activeStageObstacles, createInitialState, effectiveChoiceGating, mapAvailable, meetsGating,
  clampToWalkPoly, stageWalkStep, posReachesMarker, resolveHotspot, stageMarkerPointPoly, stageRoutePoly, stageWalkDepth, stageWalkPoly,
} from "../logic";

export interface StageExitProbe {
  id: string;
  target: string;
  label: string;
  open: boolean;
  reason?: string;
}

/** Probe actual free space along the route, not just its requested last point.
 * The router may append a goal that sits inside furniture. Merely comparing
 * that final coordinate to the marker falsely "proved" the blocked shop disk. */
export function stageHotspotApproachable(scene: SceneNode, hs: Hotspot, state: GlobalState): boolean {
  const st = scene.stage;
  if (!st || st.quake || hs.remote || hs.cursor === "look" || hs.action.type === "showText") return true;
  const width = st.worldWidth ?? 100, poly = stageWalkPoly(st, width), floor = stageWalkDepth(poly);
  const spawn = clampToWalkPoly(st.spawn?.x ?? 50, st.spawn?.y ?? floor.bottom - 2, poly, width);
  const npc = st.npcs?.find(n => n.talkHotspotId === hs.id && meetsGating(n.gating, state));
  const marker = npc ? clampToWalkPoly(npc.x, npc.y, poly, width) : stageMarkerPointPoly(hs, poly, width);
  const aspect = st.plateAspectRatio ?? 16 / 9, reach = st.reach ?? 3.5;
  if (posReachesMarker(spawn, marker, reach, aspect)) return true;
  if (st.speed === 0) return false;
  const obstacles = activeStageObstacles(st.obstacles, state);
  const route = stageRoutePoly(spawn, marker, obstacles, poly, floor, STAGE_GRID_STEP, width);
  let from = spawn, budget = 10000;
  for (const to of route) {
    while (budget-- > 0) {
      const next = stageWalkStep(from, to, 25, .02, obstacles, poly, aspect, width);
      if (posReachesMarker(next, marker, reach, aspect)) return true;
      if (next.arrived) { from = next; break; }
      if (next.x === from.x && next.y === from.y) return false;
      from = next;
    }
  }
  return false;
}

/** A geometry + current-state audit, not a fake playthrough. It deliberately
 * does NOT assume that possessing a map, beating a minigame or someday finding
 * an item makes a route usable NOW. Browser tests still exercise input/firing. */
export function stageExitProbes(story: Story, scene: SceneNode, state = createInitialState(story), includeMap = false): StageExitProbe[] {
  const ids = new Set(story.scenes.map(s => s.id));
  const resolved = {
    ...scene,
    hotspots: scene.hotspots?.map(h => ({ ...resolveHotspot(h, state), states: undefined })),
    dialogueBeats: scene.dialogueBeats?.filter(b => meetsGating(b.conditionRule, state)),
  };
  const reachable = (hs: Hotspot) => stageHotspotApproachable(scene, hs, state);
  const probes: StageExitProbe[] = [];
  for (const route of sceneRoutes(resolved)) {
    if (route.target === scene.id) continue;
    let gate: Gating | undefined;
    let walkable = true;
    if (route.path[0] === "hotspots") {
      const hs = route.ref as Hotspot;
      gate = hs.gating;
      walkable = reachable(hs);
    } else if (route.path[0] === "choices") {
      const choice = resolved.choices?.[Number(route.path[1])];
      if (choice) gate = effectiveChoiceGating(choice);
      // Stage choices are exposed by a reachable conversation, not on entry.
      if (scene.nodeType === "stage") walkable = (resolved.hotspots ?? []).some(h =>
        h.action.type === "startDialogue" && meetsGating(h.gating, state) && reachable(h));
    } else if (route.path[1] === "exitEdges") {
      gate = scene.stage?.exitEdges?.[route.path[2] as "left" | "right"]?.gating;
    }
    const reason = !ids.has(route.target) ? "missing target" : !meetsGating(gate, state)
      ? "locked in this state" : !walkable ? "no walkable approach from spawn" : undefined;
    probes.push({ id: route.id, target: route.target, label: route.label, open: !reason, reason });
  }
  if (includeMap && mapAvailable(story)) {
    for (const pin of story.map?.locations ?? []) {
      if (pin.targetSceneId === scene.id) continue;
      const reason = !ids.has(pin.targetSceneId) ? "missing target" : !meetsGating(pin.gating, state) ? "locked in this state" : undefined;
      probes.push({ id: `map:${pin.id}`, target: pin.targetSceneId, label: pin.label, open: !reason, reason });
    }
  }
  return probes;
}

export function stageReturnPath(story: Story, from: string, to: string, state?: GlobalState, includeMap = false): string[] | null {
  const queue: string[][] = [[from]], seen = new Set<string>([from]);
  const scenes = new Map(story.scenes.map(s => [s.id, s]));
  if (!scenes.has(from) || !scenes.has(to)) return null;
  for (let head = 0; head < queue.length; head++) {
    const path = queue[head], id = path[path.length - 1];
    if (id === to) return path;
    const scene = scenes.get(id)!;
    if (scene.isEnding || scene.nodeType === "credits") continue;
    for (const exit of stageExitProbes(story, scene, state, includeMap)) {
      if (!exit.open || seen.has(exit.target)) continue;
      seen.add(exit.target);
      queue.push([...path, exit.target]);
    }
  }
  return null;
}
