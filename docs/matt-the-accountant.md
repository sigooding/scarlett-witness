# 🎙 MATT THE ACCOUNTANT — and the 🧱 Quake-style 3D mode

One-act office comedy in the manner of a certain narrator-driven walking
game: an omnipotent **Narrator** describes what Matt — fat, bald, fourteen
years in accounts — is about to do, and Matt may or may not obey.

Play it from the catalogue (`matt-the-accountant`). The corridor scene
("Two Doors") is the first room shipped with the opt-in **3D Quake-style
mode**; untick it in Studio → 🚶 Walkable Stage → 🧱 3D Quake-style mode and
the same room, hotspots and enter script fall back to the classic 2D plate.

## The 1940s credits presets

Two looks joined `src/credits.ts` (Studio → credits node → Look presets):

- **Studio Era '40s** (`studio-forties`, Prestige & polish) — Cinzel ivory
  caps irising open out of black one stately card at a time, aged-brass
  labels, long dissolves, subtle gate weave. Matt's title card uses it via
  `applyCreditsPreset("studio-forties", …)`.
- **Newsreel '40s** (`newsreel-forties`, Worn print) — Newsreader ivory
  sliding over hard-cut stock shots, khaki stamps, projector weave.

They ship with a new card motion, **iris** — the 1940s optical-matte
circular wipe (`cardMotion: "iris"`, keyframes in `src/index.css`, listed in
Studio's Card motion select). Presets remain pure LOOK bundles: authored
title / lines / montage are never touched.

## 🧱 Quake-style mode (`StageSettings.quake`)

A stage node can opt in to a first-person billboard world
(`src/game/QuakeStage.tsx`, three.js):

- `map` — grid rows: `#` solid wall, `.` floor, `S` spawn, capital letters
  are anchors.
- `markers` — letter → hotspot id. The hotspot's action, gating and label
  are unchanged; only its POSITION moves from 2D bounds to a map cell. The
  marker renders as a billboard reticle (verb glyph + label in proximity).
- `npcAnchors` — letter → npc id; the npc's sprite sheet becomes a billboard
  (Matt's corridor parks the Narrator's microphone at `M`).
- Look/feel knobs: `wallColor` / `floorColor` / `ceilingColor` / `fogColor`,
  optional tiled `wallTexture` / `floorTexture`, `fov`, `moveSpeed`,
  `turnSpeed`, `mouseLook` (pointer lock), `markerScale`, `labelDistance`.
- `props` — letter → `"image@height@yawDeg"` set-dressing. Props are
  **static upright quads, never billboards** (a door stays a door while you
  strafe; only markers and characters face the camera): door slabs on the
  wall line, plants, brooms. yaw 0 faces south, 90 east.
- `handImage` — the Quake visible-weapon trick: a transparent PNG pinned to
  the bottom of the view (Matt's hand holding the Quarterly Report).

Controls in play: **W A S D** move (W always walks where the camera looks,
D strafes camera-right — pinned by the `quake:` engine tests), **← → / Q E**
turn, click a marker to interact.

**Editing the 3D:** Studio → 🚶 Walkable Stage → 🧱 3D Quake-style mode now
has a paintable grid editor (brushes: wall / floor / spawn / any anchor
letter, click-drag to paint, right-click resets to wall) kept in sync with
the ASCII textarea, plus **🚶 Walk-test the room in 3D** — the real
QuakeStage mounted in a Studio overlay (Esc closes), so a room can be
walked and dressed without entering Play. The enter script runs the same contract — `say` lines float as
captions (over the mic NPC), `setFlag` / `goToScene` / `walkTo` (grid
coordinates in 3D) behave as on the 2D stage.

**Sprite selection** is a pulldown + upload backed by the 3D sprite folder
`public/assets/sprites3d/` (catalogue in `src/data/sprites3d.ts`): each
prop letter gets a sprite pulldown with height + yaw fields; wall/floor
textures and the hand overlay are pulldowns too. **⬆ upload** writes the
file into `assets/sprites3d/` in the desktop app (electron
`scarlet-media:save-sprite3d`, name-validated) so it is committable, and
falls back to a media-library `asset:` reference in the browser — which
QuakeStage resolves at load for props, textures, NPCs and the hand.

**It breaks nothing by construction:** a stage without `quake` never mounts
the component, and on displays without WebGL (`webglAvailable()`) the scene
falls back to the classic 2D stage — the room is never unplayable.

## Assets (pass 1 of 5)

Generated plates in `plates/mta-*.png`, sliced headlessly with
`scripts/make-sprite-sheet.mjs` into `public/assets/sprites/mta-*.png`:

| Asset | Frames | Grid | Used as |
| --- | --- | --- | --- |
| `mta-matt-walk.png` | 4 (walk cycle) | 235×320 | story-wide `playerSprite` walker |
| `mta-matt-talk.png` | 3 (rest / talk / worried) | 392×384 | `matt` talkingSheet |
| `mta-narrator-talk.png` | 3 (dim / glow / bright) | 265×320 | Narrator talkingSheet + mic NPC |

Room plates and key art live in `public/img/matt/` (cubicle, two doors,
break room, boss office, stairwell, cover, portrait).

### Pass 3 — the escape route (3 rooms + a 6th ending)

Stairwell → **Server Room** (`mta_server`, cabinet billboards, the J-47
reveal) → **Parking Level B1** (`mta_parking`, cars + dumpster, concrete
walls) → **The Roof** (`mta_roof`, brick parapet, vent + antenna with the
Narrator's microphone). The roof offers the gold mic ending again and the
new silver ending **UNAUDITED** — throw the Quarterly Report over the edge
(hotspot `THROW`, gated on carrying the report; the ending consumes it).
All three rooms are authored 2D *and* 3D-ready with their own quake maps.
New sprites: `mta-server-cab`, `mta-car`, `mta-vent`, `mta-dumpster`,
`mta-antenna`; new textures: `tex-concrete`, `tex-brick`. A new engine
check validates every shipped quake map (row widths, exactly one spawn,
anchors on the map, markers → real hotspots, no letter double-use).

### Pass 2 — 3D-part sprites

All keyed via `make-sprite-sheet.mjs --frames 1` into
`public/assets/sprites/`: `mta-door-closed`, `mta-door-open`, `mta-exit-door`
(320h), `mta-plant`, `mta-broom` (160h), `mta-coffee` (192h), `mta-desk`
(224h), `mta-hand-report` (480h, the hand overlay). Tileable `tex-wall.png`
and `tex-carpet.png` in `public/img/matt/` feed `wallTexture` /
`floorTexture`. The corridor now dresses its wall line with door + plant
billboards and puts Matt's hand at the bottom of the view.
