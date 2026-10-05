import { sceneRoutes, setSceneRouteTarget } from "../sceneRoutes";
import type { Story } from "../types";

/** Mutates a draft only. Removing a node clears every incoming route, never
 * silently reroutes the player's choices into an unrelated room. Empty
 * choice stubs remain visible for the author to rewire. */
export function removeStoryScene(draft: Story, id: string): void {
  draft.scenes = draft.scenes.filter((s) => s.id !== id);
  if (draft.startSceneId === id) draft.startSceneId = draft.scenes.find((s) => s.nodeType !== "note")?.id ?? "";
  for (const scene of draft.scenes) {
    // Removing a nested script step can change the following indices.
    for (const route of sceneRoutes(scene).reverse()) {
      if (route.target === id) setSceneRouteTarget(scene, route.id, undefined);
    }
    if (scene.stage?.entrySpawns) delete scene.stage.entrySpawns[id];
  }
  if (draft.layout) delete draft.layout[id];
  if (draft.briefing?.heatFailSceneId === id) delete draft.briefing.heatFailSceneId;
  if (draft.map) draft.map.locations = draft.map.locations.filter((l) => l.targetSceneId !== id);
  draft.acts?.forEach((a) => { if (a.startSceneId === id) a.startSceneId = ""; });
  draft.episodes?.forEach((e) => {
    e.sceneIds = e.sceneIds.filter((s) => s !== id);
    if (e.startSceneId === id) e.startSceneId = e.sceneIds[0] ?? "";
    if (e.nextEpisodeByEnding) delete e.nextEpisodeByEnding[id];
    if (e.nextTimeByEnding) delete e.nextTimeByEnding[id];
    e.unlockAfter?.forEach((u) => { if (u.endingSceneIds) u.endingSceneIds = u.endingSceneIds.filter((s) => s !== id); });
  });
}

/** Text keystrokes may coalesce; adding/deleting/reordering/rewiring must
 * always be its own undo step, even inside the text debounce window. */
export function storyStructure(story: Story): string {
  return JSON.stringify([
    story.id, story.startSceneId,
    story.scenes.map((s) => [s.id, s.nodeType, s.isEnding,
      s.choices?.map((c) => c.id), s.dialogueBeats?.map((b) => b.id), s.hotspots?.map((h) => [h.id, h.states?.map((v) => v.id)]),
      sceneRoutes(s).map((r) => [r.path, r.target])]),
    story.characters.map((c) => c.id), story.items.map((i) => i.id),
    story.acts?.map((a) => [a.id, a.startSceneId]), story.episodes?.map((e) => [e.id, e.sceneIds]),
  ]);
}
