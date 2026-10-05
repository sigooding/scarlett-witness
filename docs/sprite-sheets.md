# 🎞 SPRITE SHEETS — one image, a grid of frames, named animations

A **sprite sheet** packs every frame of an animation into ONE image on a
grid. Frames are counted **left→right, top→bottom, starting at 0**. Each
named animation lists the frame numbers it plays, with per-animation `fps`
(default 8) and `loop` (default true; `false` holds the last frame).
`pixelated: true` keeps pixel art crisp. One sheet asset also exports
smaller and faster than a folder of loose frame files.

```ts
{
  image: "/assets/sprites/gumshoe-walk.png",   // url or asset: reference
  frameWidth: 114, frameHeight: 192,           // ONE frame, in source pixels
  animations: {
    idle: { frames: [1] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: true,
}
```

Rendering is CSS `background-position` stepping (src/game/SheetSprite.tsx) —
no canvas, zero work while an animation holds a single frame. The data model
and frame maths live in src/game/spriteSheet.ts (pure, Node-testable).

## The four places a sheet plugs in

| Field | Animation names the engine looks up | Studio editor |
| --- | --- | --- |
| `scene.stage.playerSheet` — the stage walker | `walk` while moving, `idle` at rest | Scene tab → 🚶 Walkable Stage → 🎞 Sprite-sheet walker |
| `scene.stage.npcs[].sheet` — an ambient NPC (idle / patrol) | `idle` at rest, `walk` while patrolling (each falls back to the other) | Scene tab → 🚶 Walkable Stage → 🚶 Ambient NPCs |
| `character.talkingSheet` — talking portrait | `talk` while the active speaker, `rest` otherwise | Characters tab → 🗣 Talking animation → 🎞 Sprite-sheet portrait |
| `foregroundExtra.sheet` — animated prop (flickering neon, a rain-lashed flag) | `loop`, played on repeat | 🎬 Cinematics → foreground extra → 🎞 Animate with a sprite sheet |

**Fallback is graceful everywhere.** A missing name falls back to the other
convention name, then to the first animation defined — and when the REST
pose is the one missing (`idle` / `rest`), the fallback animation is
**frozen on its first frame** rather than played, so a sheet with only
"walk" stands still instead of moonwalking in place.

**Sheets are additive.** `playerSheet` overrides `walkFrames`/`playerImage`
only while set; `talkingSheet` takes over from `talkingFrames`/`talkingRest`
only while set (the keyframe fields stay saved and come back the moment the
sheet is cleared); an extra's `sheet` replaces its static `image` in play
but keeps it as the fallback.

## Making a sheet from a generated plate (command line)

The AI tab's flow is: generate the character N times on one row over flat
magenta → key the backdrop out → find the frames by the transparent gaps →
crop, scale and bottom-align them to one grid → write the sheet. That flow
runs in the browser; `scripts/make-sprite-sheet.mjs` is the same pipeline on
the command line, so sheets can be built (and rebuilt) headlessly:

```bash
node scripts/make-sprite-sheet.mjs \
  --in plates/tintin-talk.png \
  --out public/assets/sprites/tt-tintin-talk.png \
  --key ff00ff --height 384 --frames 3
# ✓ public/assets/sprites/tt-tintin-talk.png  3 frame(s)  frameWidth: 224, frameHeight: 384
```

It prints the `frameWidth × frameHeight` grid to paste straight into a story's
`talkingSheet` / `sheet` config. `--auto` samples the backdrop from the
corners instead of taking a `--key`; `--tolerance`, `--softness` and `--gap`
tune the key and the minimum gap that separates two frames.

**Bridged plates recover automatically.** When `--frames N` is given and the
gap-finder returns *fewer* than N runs, the figures were joined by opaque
pixels — a glow, a crossing arm, a soft shadow — so no fully-transparent
column gap separates them. The script splits the widest merged run at its
lowest-occupancy interior column (the bridge's "waist"), repeating until the
count is right or nothing can split further, then despeckles each recovered
region (4-connected components under `--despeckle` px, default 2000) so cut
fringe and stray specks disappear. Recovery narrates to stderr:

    ♻ bridged plate: split run 49–1392 at column 1019 (waist occupancy 47px)
    ♻ recovery: 3 waist split(s), 3 stray component(s) under 2000px despeckled

Both phantom sheets in the Scooby case were built through this path — the
pass-1 plate (one bridge) and the pass-2 four-frame plate (fully merged into
one run, split three times). `scripts/split-bridged-plate.mjs` remains the
manual override for pathological plates: `--probe` reports where the waists
are, `--cols` cuts explicitly.

## The Sheet slicer (Media Tools tab)

Studio → Media Tools tab → **🎞 Sheet slicer**: pick any uploaded image, set the
frame size, scrub the preview to find frame numbers, name the animations,
then copy the JSON or re-enter the same settings where the sheet lives. The
same editor (src/studio/SheetEditor.tsx) is embedded at all three call
sites, each with its own naming preset.

## Demo assets in the catalogue

**Tintin and the Meridian Light** ships a full cast of ligne-claire cutouts
(`public/assets/sprites/tt-*.png`), all generated as magenta plates and sliced
with the script above:

| Asset | Frames | Grid | Used as |
| --- | --- | --- | --- |
| `tt-tintin-talk.png` | 3 (mouth closed / open / half) | 224×384 | `character.talkingSheet` — Tintin, stage left |
| `tt-snowy-talk.png` | 3 | 183×384 | `character.talkingSheet` — Snowy, stage right, flipped |
| `tt-haddock-talk.png` | 3 | 262×384 | `character.talkingSheet` — the Captain |
| `tt-curator-talk.png` | 3 | 249×384 | `character.talkingSheet` — M. Alembert |
| `tt-krespel-talk.png` | 3 | 273×384 | `character.talkingSheet` — Dr. Krespel, stage left |
| `tt-snowy-walk.png` | 4 (trot cycle) | 197×128 | foreground extra (`SNOWY_WALK`) on the quay and at Berth 4 |
| `tt-astrolabe.png` | 2 (plain / gleam) | 135×160 | foreground extra (`ASTROLABE`) in the lamp room and the silver ending |

Talking sheets share a 384px-tall grid so heads stay level across the cast;
every speaker is placed left or right and flipped to face their scene partner,
so each conversation reads as a two-shot (see `src/data/tintinMeridian.ts`).



- `public/assets/sprites/gumshoe-walk.png` — 4-frame noir detective walk
  cycle (114×192/frame), the walker in *Anatomy of a Lie*'s stage scene.
- `public/assets/sprites/club-neon.png` — 3-frame CLUB sign flicker
  (115×256/frame), an animated foreground extra in *Anatomy of a Lie*'s
  "The Ready-Made Alibi" (note the uneven frame list `[0,0,0,1,0,0,2,…]`
  for a faulty-tube rhythm).

## Engine bookkeeping (the RUNNING.md media rule)

`playerSheet.image`, `talkingSheet.image` and every extra's `sheet.image`
are media-bearing fields: wired into all three `mediaLibrary.ts` walkers
(visit / resolve / compact), the voice-pack bundler mirror, the
import/export round-trip seed (`scripts/ie-roundtrip/export-side.ts`) and
preflight's asset-exists check. `spriteSheetIssues()` validates every sheet
and surfaces problems as Check-tab **warnings** (never errors), each call
site passing the animation names it expects.

## Upload size caps (Media Tools ▸ Library ▸ ⚙ limits)

The per-file and whole-library ceilings are **defaults, not hard limits**.
They ship conservative because a browser draft keeps every asset in IndexedDB
and a `.reel.json` export embeds them as base64 (about +33% on top of the raw
bytes), so a library of native-resolution plates makes a draft that is slow to
save and awkward to share.

If that trade-off is wrong for your project — big painted backdrops, or
source-resolution sheets — raise them. The editor is under the usage bar in
Media Tools ▸ Library. Values are clamped to a 512MB guard rail and stored in
`localStorage` per machine, **never in the story file**, because they describe
this machine's tolerance rather than a property of the case.

Rough sizing, for a 1376×768 painted plate:

| | size |
|---|---|
| PNG on disk | ~2.3MB |
| stored in IndexedDB (base64) | ~3.0MB |
| plates before the default 60MB cap | ~26 |

The desktop app also copies uploads to a real folder on disk, so it tolerates a
far larger library than a browser draft does.
