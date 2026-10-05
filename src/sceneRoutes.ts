import type { Choice, Hotspot, HotspotAction, SceneNode, StageScriptStep, Story } from "./types";

type RoutePath = (string | number)[];
export interface StoryEdge {
  id: string;
  source: string;
  target: string;
  kind: "choice" | "hotspot" | "auto";
  ref: Choice | Hotspot | SceneNode;
  label: string;
  attitude: string;
  /** Exact authored field. Display, rewiring and deletion share this address;
   * a timeout, puzzle result or after-beat cut is NOT its parent's main exit. */
  path: RoutePath;
  handle: string;
}

/** All authored scene routes, with stable ids and editable field addresses.
 * No gates are evaluated here: Studio/validation must also see locked routes. */
export function sceneRoutes(sc: SceneNode): StoryEdge[] {
  const edges: StoryEdge[] = [];
  const add = (
    suffix: string, target: string | undefined, kind: StoryEdge["kind"],
    ref: StoryEdge["ref"], label: string, path: RoutePath,
    attitude = kind === "hotspot" ? "Hotspot" : "Neutral", handle?: string,
  ) => {
    if (!target) return;
    const id = `e-${sc.id}-${suffix}`;
    edges.push({ id, source: sc.id, target, kind, ref, label, attitude, path, handle: handle ?? `route:${id}` });
  };
  add("auto", sc.autoAdvanceTargetSceneId, "auto", sc, `⏱ auto ${sc.autoAdvanceDelaySeconds ?? 0}s`, ["autoAdvanceTargetSceneId"], "Neutral", "auto");
  sc.dialogueBeats?.forEach((b, i) => {
    add(`b-${b.id}`, b.afterBeatTargetSceneId, "auto", sc, `🎬 after beat${b.afterBeatMode === "continue" ? " (▸)" : " (auto)"}`, ["dialogueBeats", i, "afterBeatTargetSceneId"]);
  });
  sc.choices?.forEach((c, i) => {
    add(`c-${c.id}`, c.targetSceneId, "choice", c, c.text.slice(0, 26), ["choices", i, "targetSceneId"], c.attitudeTag ?? "Neutral", `choice:${c.id}`);
    add(`c-${c.id}-timeout`, c.timedOutTargetSceneId, "choice", c, `${c.text.slice(0, 22)} (timed out)`, ["choices", i, "timedOutTargetSceneId"]);
    add(`c-${c.id}-miss`, c.failTargetSceneId, "choice", c, `${c.text.slice(0, 22)} (missed roll)`, ["choices", i, "failTargetSceneId"]);
  });
  const script = (steps: StageScriptStep[] | undefined, prefix: string, path: RoutePath, ref: StoryEdge["ref"], label: string, kind: StoryEdge["kind"]) => {
    steps?.forEach((step, i) => {
      if (step.do === "goToScene") add(`${prefix}-${i}`, step.targetSceneId, kind, ref, label, [...path, i, "targetSceneId"]);
    });
  };
  const action = (a: HotspotAction, path: RoutePath, prefix: string, hs: Hotspot, extra = "", handle?: string) => {
    add(prefix, a.targetSceneId, "hotspot", hs, `⌖ ${hs.label.slice(0, 22)}${extra}`, [...path, "targetSceneId"], "Hotspot", handle);
    if (a.type === "patternPuzzle") {
      add(`${prefix}-solve`, a.patternPuzzle?.targetSceneId, "hotspot", hs, `🔍 ${hs.label.slice(0, 20)} (solved)`, [...path, "patternPuzzle", "targetSceneId"]);
      add(`${prefix}-wrong`, a.patternPuzzle?.wrongTargetSceneId, "hotspot", hs, `🔍 ${hs.label.slice(0, 20)} (failed)`, [...path, "patternPuzzle", "wrongTargetSceneId"]);
    }
    if (a.type === "arcadeGame") {
      add(`${prefix}-win`, a.arcadeGame?.targetSceneId, "hotspot", hs, `🕹 ${hs.label.slice(0, 20)} (won)`, [...path, "arcadeGame", "targetSceneId"]);
      add(`${prefix}-lose`, a.arcadeGame?.loseTargetSceneId, "hotspot", hs, `🕹 ${hs.label.slice(0, 20)} (lost)`, [...path, "arcadeGame", "loseTargetSceneId"]);
    }
    if (a.type === "runScript") script(a.script, `${prefix}-script`, [...path, "script"], hs, `🎬 ${hs.label.slice(0, 20)} (script)`, "hotspot");
    a.then?.forEach((step, i) => action(step, [...path, "then", i], `${prefix}-then-${i}`, hs, " (then)"));
  };
  sc.hotspots?.forEach((h, i) => {
    const path = ["hotspots", i];
    const prefix = `h-${h.id}`;
    action(h.action, [...path, "action"], prefix, h, "", `hotspot:${h.id}`);
    h.states?.forEach((s, si) => {
      if (s.action) action(s.action, [...path, "states", si, "action"], `${prefix}-state-${s.id}`, h, " (state)");
    });
    Object.entries(h.verbs ?? {}).forEach(([verb, a]) => {
      if (a) action(a, [...path, "verbs", verb], `${prefix}-verb-${verb}`, h, ` (${verb})`);
    });
  });
  script(sc.stage?.enterScript, "enterscript", ["stage", "enterScript"], sc, "🎬 entry script", "auto");
  (["left", "right"] as const).forEach((side) => {
    add(`edge-${side}`, sc.stage?.exitEdges?.[side]?.targetSceneId, "hotspot", sc, `➜ walk off ${side} edge`, ["stage", "exitEdges", side, "targetSceneId"]);
  });
  return edges;
}

export function storyEdges(story: Story): StoryEdge[] { return story.scenes.flatMap(sceneRoutes); }

/** Mutate a draft's *current* route, looked up by stable id rather than an old
 * array index. An open menu can outlive a reorder; it must never edit a sibling. */
export function setSceneRouteTarget(scene: SceneNode, edgeId: string, target?: string): boolean {
  const route = sceneRoutes(scene).find((r) => r.id === edgeId);
  if (!route) return false;
  const path = route.path;
  // The paths above are internal, never supplied by an imported document.
  let parent: Record<string | number, unknown> = scene as unknown as Record<string, unknown>;
  for (const segment of path.slice(0, -1)) {
    const value = parent[segment];
    if (!value || typeof value !== "object") return false;
    parent = value as Record<string | number, unknown>;
  }
  const field = path[path.length - 1];
  if (target !== undefined) { parent[field] = target; return true; }

  if (field === "autoAdvanceTargetSceneId") {
    delete scene.autoAdvanceTargetSceneId;
    delete scene.autoAdvanceDelaySeconds;
    delete scene.autoAdvanceHideTimer;
  } else if (field === "afterBeatTargetSceneId") {
    delete parent.afterBeatTargetSceneId;
    delete parent.afterBeatMode;
    delete parent.afterBeatDelaySeconds;
  } else if (path[1] === "exitEdges") {
    delete scene.stage!.exitEdges![path[2] as "left" | "right"];
  } else if (path[path.length - 3] === "script" || path[1] === "enterScript") {
    // An empty goToScene script step is invalid; unlinking removes the step,
    // not the earlier movement/speech/flag actions.
    let steps: unknown = scene;
    for (const segment of path.slice(0, -2)) steps = (steps as Record<string | number, unknown>)[segment];
    (steps as StageScriptStep[]).splice(path[path.length - 2] as number, 1);
  } else if (path[0] === "choices" && field === "targetSceneId") {
    if (scene.nodeType === "note") scene.choices!.splice(path[1] as number, 1);
    else parent[field] = ""; // Keep the choice and its reconnectable handle.
  } else {
    delete parent[field];
  }
  return true;
}

/** Every authored action, including states, verbs and follow-ups. Shared by
 * Studio's flag/clone audits so a nested puzzle isn't invisible to tooling. */
export function visitHotspotActions(hotspot: Hotspot, visit: (action: HotspotAction, where: string) => void): void {
  const walk = (action: HotspotAction, where: string) => {
    visit(action, where);
    action.then?.forEach((a, i) => walk(a, `${where} · chained action ${i + 1}`));
  };
  walk(hotspot.action, `hotspot “${hotspot.label}”`);
  hotspot.states?.forEach((s) => { if (s.action) walk(s.action, `“${hotspot.label}” in state “${s.id}”`); });
  Object.entries(hotspot.verbs ?? {}).forEach(([verb, a]) => { if (a) walk(a, `${verb} “${hotspot.label}”`); });
}
