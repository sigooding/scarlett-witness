/**
 * IMPORT/EXPORT ROUND TRIP — AUTHOR'S MACHINE (process 1 of 2).
 *
 * Runs the REAL functions from src/data/mediaLibrary.ts against a REAL
 * IndexedDB implementation (fake-indexeddb), not a stand-in map:
 *
 *   uploadDataUrlAsset -> compactStoryMedia -> loadStoryAssetsForExport
 *
 * and writes the exact `.reel.json` envelope that App.tsx hands to
 * `downloadReel()` (`{ ...story, assets }`). The recipient side runs in a
 * SEPARATE process, so its IndexedDB is genuinely empty — that is what makes
 * this a real "shared to someone else's machine" test rather than a same-
 * process re-read.
 */
import { writeFileSync } from "node:fs";
import {
  compactStoryMedia,
  loadAssets,
  loadStoryAssetsForExport,
  uploadDataUrlAsset,
} from "../../src/data/mediaLibrary";
import { NEON_DINER } from "../../src/data/neonDiner";
import type { DialogueBeat, Story } from "../../src/types";

const outPath = process.argv[2];
const truthPath = process.argv[3];
if (!outPath || !truthPath) throw new Error("usage: export-side <payload path> <ground-truth path>");

/** A distinct, recognisable payload per field so the recipient side can prove
 *  each reference resolved to *its own* bytes and not a neighbour's. */
const png = (label: string) =>
  `data:image/png;base64,${Buffer.from(`PNG:${label}`).toString("base64")}`;
const mp3 = (label: string) =>
  `data:audio/mpeg;base64,${Buffer.from(`MP3:${label}`).toString("base64")}`;

const failures: string[] = [];
function check(name: string, ok: boolean, extra?: unknown) {
  if (!ok) failures.push(`${name}${extra !== undefined ? ` — got ${JSON.stringify(extra)}` : ""}`);
}

/* ------------------------------------------------------------------ */
/*  1. Seed the library the way the "Upload" buttons do                */
/* ------------------------------------------------------------------ */

const STORY_ID = "ie-roundtrip-case";

/** Ground truth for the round trip: for every field we seeded, the exact bytes
 *  we uploaded and the `asset:<id>` reference the story was given. Captured
 *  here — before any export code runs — so the recipient side's expectation is
 *  independent of the code under test. */
const manifest: Array<{ label: string; dataUrl: string; ref: string }> = [];

async function up(type: "image" | "audio", label: string, value: string): Promise<string> {
  const res = await uploadDataUrlAsset(STORY_ID, `${label}.png`, type, value);
  if (!res.success || !res.assetId) throw new Error(`upload failed for ${label}: ${res.error}`);
  const ref = `asset:${res.assetId}`;
  manifest.push({ label, dataUrl: value, ref });
  return ref;
}

const story: Story = JSON.parse(JSON.stringify(NEON_DINER)) as Story;
story.id = STORY_ID;
story.title = "Import/Export Round Trip";

const scene0 = story.scenes[0];
const scene1 = story.scenes[1] ?? story.scenes[0];

// Scene-level media, including the cinematic layer stack.
scene0.background = await up("image", "scene0-bg", png("scene0-bg"));
scene0.musicUrl = await up("audio", "scene0-music", mp3("scene0-music"));
scene0.sceneAudioUrl = await up("audio", "scene0-sceneAudio", mp3("scene0-sceneAudio"));
scene0.narrationAudioUrl = await up("audio", "scene0-narration", mp3("scene0-narration"));
scene0.cinematic = {
  ...scene0.cinematic,
  foregroundImage: await up("image", "scene0-fg", png("scene0-fg")),
  foregroundAnimation: {
    mode: "frames",
    frames: [
      await up("image", "scene0-frame0", png("scene0-frame0")),
      await up("image", "scene0-frame1", png("scene0-frame1")),
    ],
  },
  foregroundExtras: [{ image: await up("image", "scene0-extra", png("scene0-extra")) }],
  parallaxLayers: [{ image: await up("image", "scene0-parallax", png("scene0-parallax")), depth: 0.5 }],
};
scene0.credits = { ...(scene0.credits ?? {}), montage: [await up("image", "scene0-montage", png("scene0-montage"))] };
scene0.hotspots = [
  ...(scene0.hotspots ?? []),
  {
    id: "hs-ie",
    label: "Round trip",
    bounds: { x: 10, y: 10, w: 20, h: 20 },
    cursor: "look",
    action: { type: "showText", text: "Round trip." },
    image: await up("image", "scene0-hotspot", png("scene0-hotspot")),
  },
  // MULTI-STATE + hotspot VOICE media: every state image and every action
  // clip (base, verb, per-item, per-state) must survive the export →
  // import → resolve round trip exactly like any other media field.
  {
    id: "hs-ie-states",
    label: "The many-faced drawer",
    bounds: { x: 40, y: 10, w: 20, h: 20 },
    cursor: "look",
    action: {
      type: "showText",
      text: "Shut.",
      audioUrl: await up("audio", "hs-states-base", mp3("hs-states-base")),
    },
    verbs: { take: { type: "showText", text: "No.", audioUrl: await up("audio", "hs-states-take", mp3("hs-states-take")) } },
    itemAudio: { coin: await up("audio", "hs-states-coin", mp3("hs-states-coin")) },
    states: [
      {
        id: "st-open",
        when: { requiresFlags: ["opened"] },
        label: "The open drawer",
        image: await up("image", "scene0-drawer-open", png("scene0-drawer-open")),
        action: {
          type: "showText",
          text: "Empty.",
          audioUrl: await up("audio", "hs-states-open", mp3("hs-states-open")),
        },
      },
    ],
  },
];

// Stage-node walker media: single sprite, loose walk frames, and the sprite sheet.
scene0.stage = {
  ...(scene0.stage ?? {}),
  playerImage: await up("image", "stage-player", png("stage-player")),
  walkFrames: [await up("image", "stage-walk0", png("stage-walk0"))],
  playerSheet: {
    image: await up("image", "stage-sheet", png("stage-sheet")),
    frameWidth: 32,
    frameHeight: 48,
    animations: { idle: { frames: [0] }, walk: { frames: [0, 1, 2, 3], fps: 10 } },
  },
  npcs: [
    {
      id: "npc-ie",
      image: await up("image", "stage-npc", png("stage-npc")),
      x: 60,
      y: 88,
      facing: "left",
      patrol: [{ x: 72, y: 88, pause: 2 }],
      sheet: {
        image: await up("image", "stage-npc-sheet", png("stage-npc-sheet")),
        frameWidth: 32,
        frameHeight: 48,
        animations: { idle: { frames: [0] }, walk: { frames: [0, 1], fps: 8 } },
      },
    },
  ],
};

// Dialogue beats (incl. a per-beat background override).
const beats: DialogueBeat[] = [
  {
    id: "beat-ie",
    characterId: story.characters[0]?.id ?? "narrator",
    text: "Round trip.",
    audioUrl: await up("audio", "beat0-voice", mp3("beat0-voice")),
    background: await up("image", "beat0-bg", png("beat0-bg")),
  },
];

// Per-beat cinematic layer (a beat can carry its own whole cinematic stack).
beats[0].cinematic = {
  foregroundImage: await up("image", "beat0-fg", png("beat0-fg")),
  foregroundAnimation: { mode: "frames", frames: [await up("image", "beat0-frame0", png("beat0-frame0"))] },
  foregroundExtras: [
    {
      image: await up("image", "beat0-extra", png("beat0-extra")),
      sheet: {
        image: await up("image", "beat0-xsheet", png("beat0-xsheet")),
        frameWidth: 32,
        frameHeight: 32,
        animations: { loop: { frames: [0, 1, 2], fps: 12 } },
      },
    },
  ],
  parallaxLayers: [{ image: await up("image", "beat0-parallax", png("beat0-parallax")), depth: 0.2 }],
};
scene1.dialogueBeats = beats;

// Episodes: title card, poster, card music and "previously on…" stills.
story.episodes = [
  {
    id: "ep-ie",
    title: "The Round Trip",
    sceneIds: story.scenes.map((s) => s.id),
    startSceneId: story.scenes[0].id,
    titleCardImage: await up("image", "ep0-card", png("ep0-card")),
    posterImage: await up("image", "ep0-poster", png("ep0-poster")),
    titleCardMusicUrl: await up("audio", "ep0-music", mp3("ep0-music")),
    recapLines: [{ id: "recap-ie", text: "Last time…", image: await up("image", "ep0-recap", png("ep0-recap")) }],
  },
];

// Items, characters, acts, episodes, cover, dialogue box.
story.items[0] = { ...story.items[0], iconUrl: await up("image", "item0-icon", png("item0-icon")) };
story.characters[0] = {
  ...story.characters[0],
  avatarUrl: await up("image", "char0-avatar", png("char0-avatar")),
  talkingFrames: [await up("image", "char0-talk0", png("char0-talk0"))],
  talkingRest: await up("image", "char0-talkRest", png("char0-talkRest")),
  talkingSheet: {
    image: await up("image", "char0-talksheet", png("char0-talksheet")),
    frameWidth: 64,
    frameHeight: 64,
    animations: { rest: { frames: [0] }, talk: { frames: [0, 1], fps: 6 } },
  },
};
story.acts = [
  {
    ...(story.acts?.[0] ?? { id: "act-ie", label: "Act One", title: "The Round Trip", startSceneId: scene0.id }),
    titleCardImage: await up("image", "act0-card", png("act0-card")),
  },
];
story.coverImage = await up("image", "cover", png("cover"));
story.dialogueBox = { ...(story.dialogueBox ?? {}), backgroundImage: await up("image", "dlgbox-bg", png("dlgbox-bg")) };
story.map = {
  title: "Round-Trip City",
  backgroundImage: await up("image", "map-bg", png("map-bg")),
  locations: [{ id: "rt-loc", label: "The Docks", targetSceneId: scene0.id, x: 50, y: 50 }],
};
// Story-wide presentation art (the 🎮 In-Game Theme tab): the inventory
// container, the story-wide walker and two custom cursors. These used to be
// MISSING from the media walk — uploaded art previews fine in the Studio but
// arrived in the game as literal `asset:` refs and rendered nothing.
story.inventoryDisplay = {
  mode: "container",
  image: await up("image", "inv-container", png("inv-container")),
  sheet: {
    image: await up("image", "inv-sheet", png("inv-sheet")),
    frameWidth: 64,
    frameHeight: 64,
    animations: { loop: { frames: [0, 1], fps: 6 } },
  },
};
story.playerSprite = {
  image: await up("image", "walker", png("walker")),
  sheet: {
    image: await up("image", "walker-sheet", png("walker-sheet")),
    frameWidth: 32,
    frameHeight: 48,
    animations: { idle: { frames: [0] }, walk: { frames: [0, 1], fps: 10 } },
  },
};
story.cursorArt = {
  look: { image: await up("image", "cursor-look", png("cursor-look")), size: 32 },
  talk: {
    sheet: {
      image: await up("image", "cursor-talk-sheet", png("cursor-talk-sheet")),
      frameWidth: 32,
      frameHeight: 32,
      animations: { loop: { frames: [0, 1, 2], fps: 8 } },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  2. compactStoryMedia: data URLs -> asset: refs (localStorage-safe) */
/* ------------------------------------------------------------------ */

// The story holds `asset:` references (never raw base64) from the moment a
// field is set, so this is also the input-not-mutated baseline.
const beforeCompact = JSON.stringify(story);
writeFileSync(truthPath, JSON.stringify(manifest));

const compacted = await compactStoryMedia(story);
check("compact: input story is not mutated", JSON.stringify(story) === beforeCompact);
const compactedJson = JSON.stringify(compacted);

check(
  "compact: no uploaded payload leaks into the persisted story",
  manifest.every((m) => !compactedJson.includes(m.dataUrl)),
  manifest.filter((m) => compactedJson.includes(m.dataUrl)).map((m) => m.label)
);
check(
  "compact: every seeded field kept its asset: reference",
  manifest.every((m) => compactedJson.includes(m.ref)),
  manifest.filter((m) => !compactedJson.includes(m.ref)).map((m) => m.label)
);
check("compact: no raw base64 payload survives in the persisted story", !/;base64,/.test(compactedJson));
check(
  "compact: references actually point at stored rows",
  (compactedJson.match(/asset:/g) ?? []).length >= manifest.length,
  (compactedJson.match(/asset:/g) ?? []).length
);
const stored = await loadAssets(STORY_ID);
check("compact: one IndexedDB row per upload", stored.length === manifest.length, stored.length);

/* ------------------------------------------------------------------ */
/*  2b. compactStoryMedia migration coverage                           */
/*                                                                     */
/*  A legacy draft / old export can still embed RAW base64 in any media */
/*  field. compactStoryMedia must migrate every one of them to an       */
/*  asset: ref, otherwise the base64 survives into localStorage and     */
/*  blows the quota. Seeds a distinct data: URL into every field        */
/*  visitStoryMediaRefs visits and asserts none survive.                */
/* ------------------------------------------------------------------ */

const legacy: Story = JSON.parse(JSON.stringify(NEON_DINER)) as Story;
legacy.id = "ie-compact-coverage";
legacy.title = "Compact Coverage";
const seeded: string[] = [];
const raw = (label: string) => {
  const v = png(`legacy-${label}`);
  seeded.push(v);
  return v;
};

const L0 = legacy.scenes[0];
L0.background = raw("s-bg");
L0.musicUrl = mp3("legacy-s-music");
L0.sceneAudioUrl = mp3("legacy-s-sceneAudio");
L0.narrationAudioUrl = mp3("legacy-s-narration");
seeded.push(L0.musicUrl!, L0.sceneAudioUrl!, L0.narrationAudioUrl!);
L0.cinematic = {
  foregroundImage: raw("s-fg"),
  foregroundAnimation: { mode: "frames", frames: [raw("s-frame")] },
  foregroundExtras: [{ image: raw("s-extra"), sheet: { image: raw("s-xsheet"), frameWidth: 32, frameHeight: 32, animations: { loop: { frames: [0, 1] } } } }],
  parallaxLayers: [{ image: raw("s-parallax"), depth: 0.4 }],
};
L0.credits = { ...(L0.credits ?? {}), montage: [raw("s-montage")] };
L0.hotspots = [
  {
    id: "hs-legacy",
    label: "Legacy",
    bounds: { x: 10, y: 10, w: 20, h: 20 },
    cursor: "look",
    action: { type: "showText", text: "Legacy." },
    image: raw("s-hotspot"),
  },
];
const legacyBeats: DialogueBeat[] = [
  {
    id: "beat-legacy",
    characterId: legacy.characters[0]?.id ?? "narrator",
    text: "Legacy.",
    audioUrl: mp3("legacy-beat-voice"),
    background: raw("beat-bg"),
    cinematic: {
      foregroundImage: raw("beat-fg"),
      foregroundAnimation: { mode: "frames", frames: [raw("beat-frame")] },
      foregroundExtras: [{ image: raw("beat-extra") }],
      parallaxLayers: [{ image: raw("beat-parallax"), depth: 0.3 }],
    },
  },
];
L0.dialogueBeats = legacyBeats;
seeded.push(legacyBeats[0].audioUrl!);
legacy.items[0] = { ...legacy.items[0], iconUrl: raw("item-icon") };
legacy.characters[0] = {
  ...legacy.characters[0],
  avatarUrl: raw("char-avatar"),
  talkingFrames: [raw("char-talk")],
  talkingRest: raw("char-rest"),
  talkingSheet: {
    image: raw("char-talksheet"),
    frameWidth: 64,
    frameHeight: 64,
    animations: { talk: { frames: [0, 1] } },
  },
};
legacy.acts = [
  {
    ...(legacy.acts?.[0] ?? { id: "act-legacy", label: "Act One", title: "Legacy", startSceneId: L0.id }),
    titleCardImage: raw("act-card"),
  },
];
legacy.episodes = [
  {
    id: "ep-legacy",
    title: "Legacy",
    sceneIds: legacy.scenes.map((sc) => sc.id),
    startSceneId: legacy.scenes[0].id,
    titleCardImage: raw("ep-card"),
    posterImage: raw("ep-poster"),
    titleCardMusicUrl: mp3("legacy-ep-music"),
    recapLines: [{ id: "recap-legacy", text: "Before…", image: raw("ep-recap") }],
  },
];
seeded.push(legacy.episodes[0].titleCardMusicUrl!);
legacy.coverImage = raw("cover");
legacy.dialogueBox = { ...(legacy.dialogueBox ?? {}), backgroundImage: raw("dlgbox") };
legacy.map = { locations: [{ id: "lg-loc", label: "Old Pier", targetSceneId: legacy.scenes[0].id, x: 20, y: 80 }], backgroundImage: raw("map-bg") };
legacy.scenes[0].stage = {
  ...(legacy.scenes[0].stage ?? {}),
  playerSheet: {
    image: raw("stage-sheet"),
    frameWidth: 32,
    frameHeight: 48,
    animations: { idle: { frames: [0] }, walk: { frames: [0, 1], fps: 8 } },
  },
};

const compactedLegacy = await compactStoryMedia(legacy);
const legacyJson = JSON.stringify(compactedLegacy);
check("compact-migrate: no raw base64 survives in ANY media field", !/;base64,/.test(legacyJson));
check(
  "compact-migrate: every seeded payload was migrated, not dropped",
  seeded.every((v) => !legacyJson.includes(v)),
  seeded.filter((v) => legacyJson.includes(v)).length
);
check(
  "compact-migrate: a video: data URL becomes video:asset:",
  !/video:data:/.test(legacyJson)
);
// A video background must migrate too (different type/limits than an image).
const vidStory = JSON.parse(JSON.stringify(legacy)) as Story;
vidStory.id = "ie-compact-video";
vidStory.scenes[0].background = `video:data:video/mp4;base64,${Buffer.from("MP4BYTES").toString("base64")}`;
const compactedVid = await compactStoryMedia(vidStory);
check(
  "compact-migrate: video background becomes a video:asset: reference",
  compactedVid.scenes[0].background.startsWith("video:asset:"),
  compactedVid.scenes[0].background.slice(0, 40)
);

/* ------------------------------------------------------------------ */
/*  3. loadStoryAssetsForExport + the exact download envelope          */
/* ------------------------------------------------------------------ */

const assets = await loadStoryAssetsForExport(compacted);
check("export: bundler returns a row for every reference", assets.length === stored.length, assets.length);
check(
  "export: every bundled row carries its base64 payload",
  assets.every((a) => typeof a.dataUrl === "string" && a.dataUrl.startsWith("data:")),
  assets.filter((a) => !a.dataUrl?.startsWith("data:")).map((a) => a.id)
);

// Exactly what App.tsx's export button does: `{ ...s, assets: caseAssets }`.
const payload = { ...compacted, assets };
writeFileSync(outPath, JSON.stringify(payload));

const bytes = Buffer.byteLength(JSON.stringify(payload));
const storyOnlyBytes = Buffer.byteLength(JSON.stringify(compacted));

console.log(
  JSON.stringify({
    ok: failures.length === 0,
    failures,
    uploads: manifest.length,
    storedRows: stored.length,
    bundledAssets: assets.length,
    assetRefsInStory: (compactedJson.match(/asset:/g) ?? []).length,
    payloadBytes: bytes,
    storyOnlyBytes,
    // The compacted story (what localStorage keeps) must stay small; the
    // payload (what the .reel.json carries) holds the media.
    compactedIsSmall: storyOnlyBytes < 1024 * 1024,
  })
);
process.exitCode = failures.length ? 1 : 0;
