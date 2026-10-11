# The depth-map camera: how to give a picture depth

A still picture plus a grayscale **depth map** (white = near the camera, black = far) lets the engine move a camera through
the picture: near things move more than far ones, so the frame reads as a shot with depth. The engine side is
`src/game/DepthParallax.tsx`; the film's settings live in `src/film/studio-edits.json` (`pictureLook`). This note is the
whole process, from a picture to a checked shot in the film, and what went wrong on the way. Read it before adding depth to
anything.

## 1. First decide whether the picture should have depth at all

* **Is there a person in it, or part of one (a hand, a face)?** Then it needs **cut-outs and a plate** (step 4), not a depth
  map alone: a depth map alone stretches a person like rubber as the camera moves. Add the picture to `peopleInShot` in
  `docs/film-depth-layers.json`; `npm run test:film-depth` fails if a picture on that list has a depth map without cut-outs.
* **Is it a reflection, a screen, or a flat close-up** (a puddle's reflection, a clock on a wall, a photograph)? Leave it
  alone. A reflection moving like the surface it is on looks wrong, and a flat thing has no depth to show.
* **Empty locations** (streets, rooms, buildings, corridors, landscapes) are where a depth map alone works well.

## 2. Make the depth map

Rules, whichever way it is made:

* the picture's shape (16:9 here), ideally its exact pixel size; grayscale; **white = near, black = far**;
* it follows the real scene: the floor or street gets nearer toward the bottom of the frame, walls are flat, a doorway or a
  corridor goes dark into the distance, objects are solid shapes;
* smooth surfaces, no grain (grain bends straight lines as the camera moves).

Ways to make one:

* **Your own** — Google's image tools ("make a depth map of this picture, white near, black far"), a depth app, or painted.
  The good maps in the film (`01-backstreet`, `383-the-empty-lane`, `81-static-in-a-window` and the others) were made like
  this. Put it at `public/film/depth/<scene folder>/<picture>/depth.png` (for a picture with people, at
  `source-depth.png` instead: see step 4).
* **Depth Anything** — `tools/make-depth-layers.py` runs Depth Anything V2 Small itself for any picture in
  `docs/film-depth-layers.json` that has no `depthSource`, and smooths the result so walls stay flat.
* **Never a guessed map.** On 10 October 2026 a tool that guessed depth without a model (a ramp from the horizon down plus
  texture and contrast cues, `tools/make-depth-map.py`) made 17 maps. They were blobby and did not follow the rooms (in
  `228-nine-oclock` the two men in the front seats came out farther away than the dashboard), and 16 of the 17 shots had
  people in them. All 17 were removed, and the tool with them.

**Check every map** before using it:

    python3 tools/review-depth-maps.py --depth-model <depth_anything_v2_vits.onnx> --people-model <u2net_human_seg.onnx> --out /tmp/review

It scores each map against Depth Anything's own estimate of the picture (`agree`: near 1 follows the scene; below about 0.75
look hard at it; negative is upside down), measures the hardest step in it (`edge`: above about 1 a map alone tears there),
flags people with no cut-outs, and writes picture-beside-map contact sheets. Look at the sheets: the score finds the bad ones,
your eye confirms them.

## 3. Choose the move

In `pictureLook` (or the Studio's 🧊 panel), for the picture:

| Field | What it does |
|---|---|
| `depthMap` | the map (required) |
| `depthMotion` | `push` (a dolly in toward `focalPoint`, then holds; the default), `truck` (a sideways slide around the still plane, then holds) or `drift` (a slow side-to-side loop). Push and truck ease out: they move most in their first seconds and settle into the hold, after a 0.6 s lead-in so the first frames do not lurch, so a shot that is on screen only a few seconds still shows its move |
| `depthAmount` | 0–1, default 0.4. Push: the far plane ends about 5% larger and the nearest about 14% at 0.4. Truck: a plane one unit of depth from the still plane slides about 3% of the frame width at 0.4. The film uses 0.16 to 0.8: on 10 October the director found the moves too subtle and every amount was raised, cut-out shots about 1.8 times (up to 0.8), map-only shots about 1.6 times (up to 0.6) |
| `depthSeconds` | how long the push or truck takes before it holds, or one drift loop (default 14) |
| `depthDirection`, `depthFocus` | truck and drift: which way first, and which depth holds still (default: the cut-outs' depth, else 0.5) |
| `focalPoint` | push: where the camera closes in ("x% y%") |
| `mode` | the film's usual camera under it. `pan` with `panDistance` 2 and `zoomDuration` equal to `depthSeconds` adds a slight drift that helps a restrained move read; `static` leaves the depth move alone. **Never `dolly`**: the engine skips the depth layer in dolly mode |

## 4. People: find them, cut them out, paint in behind them

1. **Find the people.**

       python3 tools/make-depth-layers.py --find-people --people-model <u2net_human_seg.onnx> --preview-dir /tmp/people <picture name or image path>

   It prints a suggested box (`[x, y, w, h]` in the picture's pixels) round each person and draws them on
   `<picture>-people.jpg`. Look at it: drop anything that is not a person in the scene (a face on a television, a
   photograph on an altar), add anyone it missed (a woman at the edge of frame, a figure half hidden) by reading the
   coordinates off the picture, and merge people who touch into one box (they move as one layer).
2. **Write them down** in `docs/film-depth-layers.json` under `"pictures"`:

       "200-the-number-114": {
        "picture": "public/film/img/s25/200-the-number-114.jpg",
        "depthSource": "public/film/depth/s25/200-the-number-114/source-depth.png",
        "cutouts": [{ "name": "jack", "box": [234, 395, 484, 658] }, { "name": "vera", "box": [793, 496, 367, 385] }]
       }

   `depthSource` is your own map with the people still in it; leave it out to have Depth Anything make one. Also add the
   picture to `peopleInShot`. When the first try needs it, a cut-out can also list
   `"exclude": [[x, y, w, h], ...]`: parts of its box where something that is not the person was taken with them. In
   `374-the-dead-television` it is the crate of bottles **in front of** Vera (left in, those bottles would move with her
   while the rest of the crate moved with the room; excluded, they stay in the plate at the crate's depth); in `144-empty`
   it is the corner of the drawer the hand is pulling.

   Where two boxes overlap, each pixel goes to the person whose matte claims it most strongly, and where both claim it
   outright, to the nearer of the two (the depth map's median under each), since the one in front hides the other: in
   `104-the-newsroom` the man at the middle desk keeps his head where it covers the woman behind the desk.
3. **Make the layers.**

       python3 tools/make-depth-layers.py --seg-model <BiRefNet.onnx> --inpaint-model <lama.onnx> [--depth-model <depth_anything.onnx>] 200-the-number-114

   It writes, in `public/film/depth/<scene>/<picture>/`: `cutout-N.png` (each person as a transparent PNG the size of the
   picture, BiRefNet), `plate.jpg` (the picture with the people painted out, LaMa) and `depth.png` (the map with the
   people filled in from around them, so the background does not bend round where they stood). It writes each cut-out's
   depth back into the JSON: the map's median under the person when there is a `depthSource`, else the ground's depth at
   their feet. It took about 25 seconds a picture on a processor (no graphics card) and up to 13 GB of memory on 10
   October; run a long list in the background.
4. **Look at what it made**: the plate should have nobody in it and a believable wall or street where they stood; each
   cut-out should be one whole person with clean edges. Lay the cut-outs over the picture in a colour each and put the
   plate beside it: a straight edge on a cut-out means its box is too small (widen it), a person still in the plate means
   their cut-out missed them (give them their own, tighter box), something in front of a person or held by them moving
   with them needs `exclude`. On 10 October four of the fourteen needed a second look: the newsroom's woman behind the
   desk (her own box), Vera under the shelf in `374` (a wider box, the bottles excluded), the hand in `144` (the drawer's
   corner excluded), and the laundry's woman on the right in `379`, half behind a sheet, whom BiRefNet would not take
   without the sheets round her. She stays in the plate (the picture's `note` says why): on that shot's drift (amount
   0.16 since the moves were made stronger; 0.09 before) her depth moves her a pixel or two against the sheets, so
   nothing stretches. Leaving someone in the plate is fine
   only on a move that small; check it with the recorded frames (section 5).
5. **Wire it**: give the picture a `pictureLook` entry with its move (step 3) if it has none, then

       python3 tools/make-depth-layers.py --wire 200-the-number-114

   (or add `--wire` to the run in step 3). It writes the made map, the plate and the cut-outs into the entry and keeps the
   move:

       "depthMap": "/film/depth/s25/200-the-number-114/depth.png",
       "depthPlate": "/film/depth/s25/200-the-number-114/plate.jpg",
       "depthCutouts": [{ "image": "/film/depth/s25/200-the-number-114/cutout-1.png", "depth": 0.922 }, ...]

   `depthMap` is the made `depth.png`, never `source-depth.png` (that one still has the people in it). The engine moves the
   plate through the depth map and each cut-out as one solid layer at its depth (up to four per picture).

## 5. Build and check

1. `node tools/build-film-story.mjs` — never hand-edit `src/data/nobodysWitnessFilm.ts`; it is generated, and hand edits
   drift from `studio-edits.json` and are lost on the next build.
2. `npm run test:film-depth` — every map, plate and cut-out exists with its picture's aspect, no dolly camera, the engine
   would draw it, and no picture in `peopleInShot` has depth without cut-outs.
3. **Watch it.** Play the scene, or record it: with `npm run dev` running,

       node tools/depth-frames.mjs nw_s25 200-the-number-114 /tmp/frames 16 2

   writes frames at exact times; put the first and the last side by side and look at the edges of people and objects, the
   straight lines (shutters, door frames) and the floor. Check once with reduced motion on (the still picture shows).
   The scene id is the one the picture plays in: `nw_` and the scene folder for most, but the raid's backdrops play in
   `nw_song_raid_N` nodes. The recorder stops when the film moves on and says after how long: a beat that ends its
   scene with an automatic cut, or a shot in a timed sequence, shows only the start of a long move (FILM.md lists them).

## 6. Six depth-only shots added in this session

**Correction (10 October, later):** the six were chosen as empty locations, but checking each map against its picture
showed people in five of them. Those five had the depth move removed (see "Review" below). Only `305-the-plaza` keeps
its depth move, and it has only small figures far off. The text below is the original write-up, kept for the record.

### Review (10 October, later): people in five of the six

A contact sheet of each picture beside its map showed:

| Picture | What is in frame | Depth move |
|---|---|---|
| `121-the-shutter` | a woman with a raised arm and two men at a stall | removed |
| `222-mud-and-impacts` | a man in a balaclava and a crouching man by a truck | removed |
| `329-the-lane-the-watch` | a woman's back and arm in the foreground | removed |
| `332-the-sedan-blocks-the-lane` | a man in a long coat in the street | removed |
| `388-through-the-crossing` | a figure in the crosswalk | removed |
| `305-the-plaza` | small figures far off | kept (`push`, 0.20) |

The removal deletes only `depthMap`, `depthMotion`, `depthAmount`, `depthSeconds` and `focalPoint` from each entry in
`src/film/studio-edits.json` (`pictureLook`). Their `mode: pan` / `panDistance` / `zoomDuration`, `lights`, `lensFlare` and
`colorGrade` stay. The build regenerated `src/data/nobodysWitnessFilm.ts`; `focalPoint` for those five fell back to the
build's default. It only drives the push move, so it no longer does anything there. The five maps stay in
`public/film/depth/` but are not wired. They can go back in once each has cut-outs and a plate (§4), or a real
Depth Anything map.

`npm run test:film-depth` did not catch this: it checks only pictures listed in `peopleInShot`, and these five were not
listed. Check people by eye on the contact sheet before wiring any depth-only shot.

The regeneration needs the sibling `nobodys-witness` checkout (`FILM_SRC`, see `tools/build-film-story.mjs`). It was run
with `FILM_SRC` pointing at a copy of `public/film/img`, `public/film/voice` and the three music files already in the repo.

Depth Anything could not be run on 10 October (its weights come from `release-assets.githubusercontent.com`, which the
sandbox could not reach), so no model-derived maps were made.

### Original write-up (six depth-only shots)

Six empty-location shots were given the depth-map camera in one pass. They are all **depth-only** — no `depthPlate`,
no `depthCutouts`, `mode: pan`, `depthMotion: push` — chosen because they are streets, a crossing, a plaza and a
storefront: locations where a depth map alone reads well and, per `peopleInShot`, there are no people in them to
stretch. They follow the wiring pattern of the existing empty-lane / empty-crossing shots (`01-backstreet`,
`383-the-empty-lane`, `314-the-empty-crossing`, …).

| Picture | Scene | Move | Amount | Seconds | Focal | `depth.png` |
|---|---|---|---|---|---|---|
| `332-the-sedan-blocks-the-lane` | s1  | push | 0.25 | 18 | 50% 60% | `public/film/depth/s1/332-the-sedan-blocks-the-lane/depth.png` |
| `329-the-lane-the-watch`         | s1  | push | 0.25 | 18 | 50% 58% | `public/film/depth/s1/329-the-lane-the-watch/depth.png` |
| `222-mud-and-impacts`            | s47 | push | 0.22 | 16 | 50% 55% | `public/film/depth/s47/222-mud-and-impacts/depth.png` |
| `388-through-the-crossing`       | s73 | push | 0.24 | 18 | 50% 58% | `public/film/depth/s73/388-through-the-crossing/depth.png` |
| `305-the-plaza`                  | s99a| push | 0.20 | 18 | 50% 55% | `public/film/depth/s99a/305-the-plaza/depth.png` |
| `121-the-shutter`                | s86 | push | 0.22 | 16 | 50% 50% | `public/film/depth/s86/121-the-shutter/depth.png` |

Each was wired in `src/film/studio-edits.json` (`pictureLook`), keeping its existing `lights` / `lensFlare` /
`colorGrade`, and `node tools/build-film-story.mjs` regenerated `src/data/nobodysWitnessFilm.ts`. `npm run
test:film-depth` passes for all six (map exists, exact 1920×1080, aspect matches, not the dolly camera, the engine
would draw the depth layer).

### How the maps were made (read this before shipping)

These six maps were **made by the director with image tools** — the method the rule permits alongside Depth Anything
("a depth app, or painted"), **not** by Depth Anything itself. Reason: in the environment this was done in, the Depth
Anything weights (and BiRefNet, LaMa and U2‑Net) all redirect to `objects.githubusercontent.com`, which was
network-blocked there, so `tools/make-depth-layers.py` and `tools/review-depth-maps.py` could not run. Each map was
generated from the actual picture as a grayscale depth field (white = near, black = far), then resized to the
picture's exact 1920×1080 and lightly Gaussian-blurred so surfaces stay grain-free, per §2.

They are therefore **stopgap maps** and should be re-validated before they ship:

* Run `tools/review-depth-maps.py` on a machine that *can* fetch the models — it scores each map against Depth
  Anything's own estimate of the picture (`agree`: near 1 follows the scene; below about 0.75 look hard at it) and
  measures the hardest step (`edge`: above about 1 a map alone tears there). A negative `agree` means the map is
  upside down.
* Watch the frames (`tools/depth-frames.mjs`, §5.3) and check the straight lines (shutters, door frames) and the
  floor. Check once with reduced motion on.
* If a map does not follow its picture, replace it with a real Depth Anything map (below) rather than shipping it.

### Replacing them with real Depth Anything maps (upgrade path)

Because they are depth-only, the upgrade is a one-command regeneration once the model is reachable — no cut-outs or
plates are involved:

1. Add each picture to `docs/film-depth-layers.json` under `"pictures"` (just its `"picture"` path; no `cutouts`, no
   `depthSource`):
   `"332-the-sedan-blocks-the-lane": { "picture": "public/film/img/s1/332-the-sedan-blocks-the-lane.jpg" }, …`
2. `python3 tools/make-depth-layers.py --depth-model <depth_anything_v2_vits.onnx> --wire 332-the-sedan-blocks-the-lane 329-the-lane-the-watch 222-mud-and-impacts 388-through-the-crossing 305-the-plaza 121-the-shutter`
   This overwrites each `depth.png` with the Depth Anything estimate (smoothed) and re-wires `pictureLook`, keeping the
   move. Then `npm run test:film-depth` and watch the frames again.

This keeps the rule intact: no guessed maps ship, and the director-made stopgaps are trivially replaced by
model-derived ones.

## Setting up the tools

    python3 -m venv /tmp/depth-venv && /tmp/depth-venv/bin/pip install numpy opencv-python-headless onnxruntime

Models (all run locally, nothing is uploaded):

| Model | Used for | Where |
|---|---|---|
| Depth Anything V2 Small (Apache-2.0) | depth when there is no `depthSource`; the reviewer's reference | `https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx` |
| BiRefNet general, Swin-tiny (MIT) | the cut-outs | `https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx` |
| LaMa (Apache-2.0) | painting the people out of the plate | `https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/inpainting_lama/inpainting_lama_2025jan.onnx` |
| U2-Net human segmentation (Apache-2.0) | finding the people; the reviewer's people check | `https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx` |

## What went wrong before, so it does not again

* **The first version (9 October)** warped the whole picture through one map in a figure-eight with a mouse lean. The
  shutters shimmered (the canvas shrank the picture without filtering), the map's grain bent straight lines, and the wall
  stretched round Vera and Jack. Fixed in the engine: cut-out layers, pre-scaled textures, a one-way move.
* **10 October:** about 60 maps were added in a day. The setup was right (sizes, wiring, tests), but 17 were guessed maps
  that did not follow their pictures and 31 shots had people with no cut-outs. The 17 were removed; the 14 good maps on
  shots with people now have cut-outs and plates (made from those maps, kept as `source-depth.png`).
* `pictureLook` reaches every place a picture is shown, including the prologue's backdrop; a scene's own `cinematic` set
  in the generated file by hand is lost on the next build.

## Montages (11 October 2026)

A montage (the opening titles, the end credits, 18, 53) shows its own stills in place of the scene's picture, so until
11 October **no depth move ever showed in one**: the titles' `depthMap` on the railway still was drawn under the
montage and never seen. Now `tools/build-film-story.mjs` gives each montage still that has a depth map (its
`pictureLook`, or the scene's own camera for the scene's own picture) to `credits.montageLooks`, and `CreditsMontage`
draws the depth camera on the still on screen and the one dissolving out (the same layer through the dissolve, so the
move never restarts), its move fitted to the hold (`depthSeconds` at most the hold plus 2 s); stills without a map keep
the slow zoom. The titles have 4 such stills (377, the railway, 80, 314) and the end credits 4 (01, 63, 200, 74).
