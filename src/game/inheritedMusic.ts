/* ------------------------------------------------------------------ *
 *  THE MUSIC A SCENE INHERITS
 *
 *  A scene with no music cue of its own keeps whatever the scenes before
 *  it left playing. Entered part-way through a story (an animatic of
 *  scenes 70 to 72, Resume, a chapter), nothing has played yet, so the
 *  track it inherits would never start: Nobody's Witness's piano "Bad
 *  Guy", which starts in scene 66 and runs under 67 to 72, was silent in
 *  an animatic from 70, and the sung one faded in over nothing
 *  (26 October 2026).
 *
 *  This walks the story's running order from its start (each scene's
 *  hand-off: the last beat's "after this beat", the scene's auto-advance,
 *  else its first choice) to the scene asked for, and returns the scene
 *  whose track would be playing there: a loop, so it can start from the
 *  top without anyone noticing. A song that plays once (musicLoop: false)
 *  is not returned, since it would be somewhere in its middle.
 * ------------------------------------------------------------------ */
import type { SceneNode } from "../types";

type Story = { scenes: SceneNode[]; startSceneId?: string };

const urlOf = (scene: SceneNode) => scene.musicUrl ?? scene.sceneAudioUrl;
const nextOf = (scene: SceneNode): string | undefined =>
  [...(scene.dialogueBeats ?? [])].reverse().find((b) => b.afterBeatTargetSceneId)?.afterBeatTargetSceneId ??
  scene.autoAdvanceTargetSceneId ??
  scene.choices?.find((c) => c.targetSceneId)?.targetSceneId;

/** The scene that set the looping track playing when `sceneId` is reached, or null (silence, a song, or not reachable). */
export function inheritedMusicScene(story: Story, sceneId: string): SceneNode | null {
  const byId = new Map(story.scenes.map((s) => [s.id, s]));
  let id: string | undefined = story.startSceneId ?? story.scenes[0]?.id;
  let playing: SceneNode | null = null;
  for (let steps = 0; id && steps <= story.scenes.length * 2; steps++) {
    if (id === sceneId) return playing && playing.musicLoop !== false ? playing : null;
    const scene = byId.get(id);
    if (!scene) return null;
    const url = urlOf(scene);
    if (scene.musicMode === "none") playing = null;
    else if (url && (scene.musicMode === "track" || (playing ? urlOf(playing) : undefined) !== url)) playing = scene;
    id = nextOf(scene);
  }
  return null;
}
