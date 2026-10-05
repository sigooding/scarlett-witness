import type { AssetType, CinematicSettings, DialogueBeat, HotspotAction, Story } from "../types";

export interface StoryMediaField {
  value: string;
  label: string;
  sceneId: string | null;
  kind: AssetType;
  /** Mutates only this media-bearing field, never prose that happens to look like a URL. */
  set: (value: string) => void;
}

/** One schema walk for collection, playback resolution and portable exports.
 * Callers that write must clone the story first. Plain dialogue, notes, ids,
 * puzzle answers and other strings are deliberately not visited. */
export function visitStoryMediaFields(story: Story, visit: (field: StoryMediaField) => void): void {
  let sceneId: string | null = null;
  const field = (owner: object | undefined, key: string | number, label: string, kind: AssetType = "image") => {
    if (!owner) return;
    const obj = owner as Record<string | number, unknown>;
    const value = obj[key];
    if (typeof value !== "string" || !value || value.startsWith("emoji:") || value.startsWith("gradient:")) return;
    visit({ value, label, sceneId, kind: value.startsWith("video:") ? "video" : kind, set: (next) => { obj[key] = next; } });
  };
  const frames = (values: string[] | undefined, label: string) => values?.forEach((_, i) => field(values, i, label));
  const cinematic = (c: CinematicSettings | undefined, label: string) => {
    if (!c) return;
    field(c, "foregroundImage", `${label} foreground image`);
    frames(c.foregroundAnimation?.frames, `${label} foreground animation frame`);
    c.foregroundExtras?.forEach((e, i) => {
      field(e, "image", `${label} foreground extra #${i + 1}`);
      field(e, "maskImage", `${label} foreground extra #${i + 1} alpha mask`);
      field(e.sheet, "image", `${label} foreground extra #${i + 1} sheet`);
    });
    c.parallaxLayers?.forEach((e, i) => field(e, "image", `${label} parallax layer #${i + 1}`));
  };
  const beat = (b: DialogueBeat | undefined, label: string) => {
    if (!b) return;
    field(b, "audioUrl", `${label} voice clip`, "audio");
    field(b, "background", `${label} background`);
    cinematic(b.cinematic, label);
    // A nested reaction can carry its own plate, foregrounds and voice.
    if (b.lie?.caughtBeat && b.lie.caughtBeat !== b) beat(b.lie.caughtBeat, `${label} caught beat`);
    if (b.lie?.wrongBeat && b.lie.wrongBeat !== b) beat(b.lie.wrongBeat, `${label} bluff beat`);
  };
  const action = (a: HotspotAction | undefined, label: string) => {
    if (!a) return;
    field(a, "audioUrl", `${label} voice clip`, "audio");
    field(a, "sfxUrl", `${label} sound effect`, "audio");
    field(a.arcadeGame, "cabinetImage", `${label} arcade cabinet art`);
    field(a.esperPhoto, "photoImage", `${label} ESPER photograph`);
    a.esperPhoto?.regions.forEach((r, i) => field(r, "enhancedImage", `${label} ESPER enhancement #${i + 1}`));
    field(a.vkTest, "eyeImage", `${label} VK iris image`);
    a.topics?.forEach((t) => t.beats.forEach((b, i) => beat(b, `${label} topic "${t.label}" beat #${i + 1}`)));
    a.then?.forEach((step, i) => action(step, `${label} chained action #${i + 1}`));
  };
  for (const sc of story.scenes) {
    sceneId = sc.id;
    field(sc, "background", "scene background");
    field(sc, "musicUrl", "scene music", "audio");
    field(sc, "sceneAudioUrl", "scene audio", "audio");
    field(sc, "narrationAudioUrl", "narration audio", "audio");
    // Bare ambient ids (rain, wind, none…) name synth presets, not files.
    if (sc.ambientAudio?.startsWith("mp3:")) field(sc, "ambientAudio", "recorded ambience", "audio");
    field(sc.stage, "playerImage", "stage walker image");
    field(sc.stage, "objectMenuIcon", "stage verb-menu icon");
    field(sc.stage?.playerSheet, "image", "stage walker sheet");
    frames(sc.stage?.walkFrames, "stage walk frame");
    sc.stage?.npcs?.forEach((n) => {
      field(n, "image", `stage NPC "${n.id}" image`);
      field(n.sheet, "image", `stage NPC "${n.id}" sheet`);
    });
    field(sc.stage?.quake, "wallTexture", "first-person wall texture");
    field(sc.stage?.quake, "floorTexture", "first-person floor texture");
    field(sc.stage?.quake, "handImage", "first-person hand image");
    const fps = sc.stage?.quake?.fps;
    field(fps, "skyImage", "first-person sky");
    field(fps?.effects, "impactImage", "first-person impact effect");
    frames(fps?.effects?.explosionImages, "first-person explosion frame");
    fps?.materials?.forEach(m => field(m, "image", `first-person material "${m.id}"`));
    fps?.sprites?.forEach(s => { field(s, "image", `first-person sprite "${s.id}"`); field(s, "brokenImage", `first-person broken sprite "${s.id}"`); field(s.sheet, "image", `first-person sheet "${s.id}"`); });
    fps?.weapons?.forEach(w => { field(w, "image", `first-person weapon "${w.id}"`); field(w.sheet, "image", `first-person weapon sheet "${w.id}"`); });
    // Props have an optional @height suffix that is geometry, not part of the URL.
    const props = sc.stage?.quake?.props;
    if (props) for (const key of Object.keys(props)) {
      const raw = props[key];
      const suffix = /@-?\d+(?:\.\d+)?(?:@-?\d+(?:\.\d+)?)?$/.exec(raw)?.[0] ?? "";
      const value = suffix ? raw.slice(0, -suffix.length) : raw;
      if (value && !value.startsWith("emoji:")) visit({ value, label: `first-person prop "${key}"`, sceneId, kind: "image", set: (next) => { props[key] = next + suffix; } });
    }
    cinematic(sc.cinematic, "scene");
    frames(sc.credits?.montage, "credits montage image");
    sc.hotspots?.forEach((h) => {
      const label = `hotspot "${h.label || h.id}"`;
      field(h, "image", `${label} image`);
      field(h.sheet, "image", `${label} sprite sheet`);
      action(h.action, label);
      Object.entries(h.verbs ?? {}).forEach(([verb, a]) => action(a, `${label} ${verb} verb`));
      if (h.itemAudio) Object.keys(h.itemAudio).forEach((key) => field(h.itemAudio, key, `${label} item-reply clip`, "audio"));
      h.states?.forEach((st, i) => {
        field(st, "image", `${label} state #${i + 1} image`);
        action(st.action, `${label} state #${i + 1}`);
      });
    });
    sc.choices?.forEach((choice) => {
      const ride = choice.ride;
      if (!ride) return;
      const label = `choice "${choice.id}" ride`;
      for (const key of ["vehicleImage", "roadImage", "horizonImage", "dashboardImage", "crashImage"])
        field(ride, key, `${label} ${key}`);
      frames(ride.traffic, `${label} traffic`);
      field(ride.driverSheet, "image", `${label} driver sheet`);
    });
    sc.dialogueBeats?.forEach((b, i) => beat(b, `dialogue beat #${i + 1}`));
    beat(sc.interrogation?.brokeBeat, "interrogation broken beat");
    beat(sc.interrogation?.clampedBeat, "interrogation clamped beat");
  }
  sceneId = null;
  story.items.forEach((it) => field(it, "iconUrl", `item "${it.name || it.id}" icon`));
  story.characters.forEach((c) => {
    const label = `character "${c.name || c.id}"`;
    field(c, "avatarUrl", `${label} portrait`);
    frames(c.talkingFrames, `${label} talking frame`);
    field(c, "talkingRest", `${label} talking rest frame`);
    field(c.talkingSheet, "image", `${label} talking sheet`);
    c.talkingSheets?.forEach((v) => field(v.sheet, "image", `${label} outfit "${v.name}" sheet`));
  });
  story.acts?.forEach((a) => field(a, "titleCardImage", `act "${a.title || a.id}" title card`));
  story.episodes?.forEach((ep) => {
    const label = `episode "${ep.title || ep.id}"`;
    field(ep, "titleCardImage", `${label} title card`);
    field(ep, "posterImage", `${label} poster`);
    field(ep, "titleCardMusicUrl", `${label} title music`, "audio");
    ep.recapLines?.forEach((r) => field(r, "image", `${label} recap image`));
  });
  field(story, "coverImage", "story cover image");
  field(story, "verbMenuIcon", "story verb-menu icon");
  field(story.dialogueBox, "backgroundImage", "dialogue box background");
  field(story.map, "backgroundImage", "travel map background");
  field(story.inventoryDisplay, "image", "inventory container image");
  field(story.inventoryDisplay?.sheet, "image", "inventory container sheet");
  field(story.playerSprite, "image", "story-wide player image");
  field(story.playerSprite?.sheet, "image", "story-wide player sheet");
  Object.entries(story.cursorArt ?? {}).forEach(([verb, art]) => {
    field(art, "image", `"${verb}" cursor image`);
    field(art?.sheet, "image", `"${verb}" cursor sheet`);
  });
}
