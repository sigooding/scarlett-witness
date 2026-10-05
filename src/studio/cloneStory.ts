import { sceneRoutes, setSceneRouteTarget, visitHotspotActions } from "../sceneRoutes";
import type { DialogueBeat, SceneNode, Story } from "../types";

type MakeId = () => string;
const randomId: MakeId = () => Math.random().toString(36).slice(2, 9);

/** Clone a node's LOCAL identities together: an NPC's conversation must point
 * at the new hotspot, not the old marker it was copied from. */
export function cloneScene(source: SceneNode, makeId: MakeId = randomId): SceneNode {
  const copy = JSON.parse(JSON.stringify(source)) as SceneNode;
  const newId = `scene_${makeId()}`;
  for (const route of sceneRoutes(copy)) if (route.target === source.id) setSceneRouteTarget(copy, route.id, newId);
  refreshLocalIds(copy, makeId);
  copy.id = newId;
  return copy;
}

function refreshLocalIds(scene: SceneNode, makeId: MakeId) {
  const beat = (b: DialogueBeat) => {
    b.id = `b_${makeId()}`;
    if (b.lie) { beat(b.lie.caughtBeat); if (b.lie.wrongBeat) beat(b.lie.wrongBeat); }
  };
  const hotspots = new Map<string, string>();
  scene.hotspots?.forEach((h) => {
    const id = `hs_${makeId()}`;
    hotspots.set(h.id, id);
    h.id = id;
    h.states?.forEach((s) => { s.id = `state_${makeId()}`; });
    visitHotspotActions(h, (a) => a.topics?.forEach((t) => {
      t.id = `topic_${makeId()}`;
      t.beats.forEach(beat);
    }));
  });
  scene.stage?.npcs?.forEach((n) => {
    if (n.talkHotspotId) n.talkHotspotId = hotspots.get(n.talkHotspotId) ?? n.talkHotspotId;
  });
  scene.choices?.forEach((c) => { c.id = `c_${makeId()}`; });
  scene.dialogueBeats?.forEach(beat);
  if (scene.interrogation) {
    beat(scene.interrogation.brokeBeat);
    if (scene.interrogation.clampedBeat) beat(scene.interrogation.clampedBeat);
  }
}

/** Independent story graph. Scene references are remapped through the SAME
 * route addresses used by the canvas, including state/verb/chain puzzles,
 * failure routes, scripts and walk-off exits. World ids (items/characters/
 * flags) remain story-local; media intentionally shares the asset library. */
export function cloneStory(source: Story, makeId: MakeId = randomId): Story {
  const copy = JSON.parse(JSON.stringify(source)) as Story;
  const ids = new Map(copy.scenes.map((s) => [s.id, `${s.id}_copy_${makeId()}`]));
  const remap = (id: string) => ids.get(id) ?? id;
  copy.id = `case_${makeId()}`;
  copy.title = `${source.title.replace(/\s*\(copy\).*$/, "")} (copy)`;
  copy.startSceneId = remap(copy.startSceneId);
  if (copy.layout) copy.layout = Object.fromEntries(Object.entries(copy.layout).map(([id, p]) => [remap(id), { ...p, x: p.x + 80, y: p.y + 90 }]));
  for (const scene of copy.scenes) {
    // Do this before ids change: route ids and indices still identify the
    // original fields. Rewiring must not change a sibling's destination.
    for (const route of sceneRoutes(scene)) setSceneRouteTarget(scene, route.id, remap(route.target));
    if (scene.stage?.entrySpawns) scene.stage.entrySpawns = Object.fromEntries(Object.entries(scene.stage.entrySpawns).map(([id, pos]) => [remap(id), pos]));
    scene.id = remap(scene.id);
    refreshLocalIds(scene, makeId);
  }
  copy.map?.locations.forEach((p) => { p.targetSceneId = remap(p.targetSceneId); });
  copy.acts?.forEach((a) => { a.id = `act_${makeId()}`; a.startSceneId = remap(a.startSceneId); });
  if (copy.briefing?.heatFailSceneId) copy.briefing.heatFailSceneId = remap(copy.briefing.heatFailSceneId);
  const episodeIds = new Map(copy.episodes?.map((e) => [e.id, `ep_${makeId()}`]) ?? []);
  copy.episodes?.forEach((e) => {
    e.id = episodeIds.get(e.id)!;
    e.startSceneId = remap(e.startSceneId);
    e.sceneIds = e.sceneIds.map(remap);
    e.unlockAfter?.forEach((u) => {
      u.episodeId = episodeIds.get(u.episodeId) ?? u.episodeId;
      u.endingSceneIds = u.endingSceneIds?.map(remap);
    });
    if (e.nextEpisodeByEnding) e.nextEpisodeByEnding = Object.fromEntries(Object.entries(e.nextEpisodeByEnding).map(([ending, ep]) => [remap(ending), episodeIds.get(ep) ?? ep]));
    if (e.nextTimeByEnding) e.nextTimeByEnding = Object.fromEntries(Object.entries(e.nextTimeByEnding).map(([ending, lines]) => [remap(ending), lines]));
  });
  delete copy.assets;
  return copy;
}
