# Brief: a keyframe editor for the film (one picture per beat)

**For:** a coding agent working in `sigooding/scarlett-witness` (the Scarlet Reel engine and its Studio).
**Written:** 26 October 2026, from the director's note.

> can we have a option in scarlett reel for a film - it plays as just a keyframe editor per beat not scenes and i just add
> the images. (still has all the options but no choices window) at the moment it zooms on scene then jumps to beats -
> which doesnt work. use what we have in beat order and i just choose from all created images and option to upload
> images. all effects still accessable.

**The director backs everything up before this starts.** Work on a new branch of your own; never on `main`. Do not merge:
the director reviews it first.

---

## What to build, in one paragraph

The keyframe editor is a new Studio mode for a film, where a film means a story compiled by `tools/build-film-story.mjs`,
today Nobody's Witness.

- **The list:** every beat of the film, in the order the film plays them, as one flat list of keyframes. Scenes appear only
  as labels.
- **The picker:** for the selected beat, the director picks its picture from every image already made, or uploads a new
  one.
- **The effects:** every effect a picture or beat can have today stays available: camera, depth map, grade, transition,
  sound effect, and the rest.
- **Saving:** the choices go into `src/film/studio-edits.json`, so they survive a rebuild.
- **Playback:** a matching mode plays the film beat by beat.
  - Each beat opens on its own picture and its own camera move.
  - There is no separate scene opening, where the scene's picture zooms and then jumps to the first beat's.
  - There is never a choices window.

## Read these first

1. `CLAUDE.md`, all of it. Its rules bind you:
   - never make a film picture smaller;
   - install pictures with `tools/install-film-picture.mjs`;
   - the depth-map rules;
   - never hand-edit `src/data/nobodysWitnessFilm.ts`.
2. `FILM.md`: how the film is built.
3. `docs/film-backend.md`: what the Studio can already set on the film.
4. `docs/depth-camera.md`: before you touch anything depth-related.
5. **In `tools/build-film-story.mjs`:**
   - how a scene's `steps` become scene nodes and `dialogueBeats`;
   - `bgFields()`;
   - `lookFor()` / `pictureLook`;
   - how the `pictures` and `sfx` entries of `studio-edits.json` are applied (search for `file.pictures` and
     `file.sfx`).
6. **In `src/studio/`:**
   - `ImagePicker.tsx`: the picker every image box uses, with upload; its list comes from `tools/builtin-images.mjs`,
     group `film-img` being the film's pictures;
   - `CinematicControls.tsx`: camera, depth, grade;
   - `AudioPicker.tsx`;
   - how `Studio.tsx` edits a beat (the Beats tab).
7. `src/game/Game.tsx`: how a scene node starts, with its `prose` and its own `background`/`cinematic`; how a beat's
   `background` replaces it; where the choices panel is shown.
8. `src/game/inheritedMusic.ts`: it walks the film's running order. The editor's list follows the same links.
9. `tools/vite-animatic-export.mjs`: an existing dev-server plugin. Copy its shape for the save endpoint.

## The data: use what exists, invent nothing

**Every keyframe edit is written to keys that `studio-edits.json` and the builder already have:**

| The director changes | Written as | Applied by |
|---|---|---|
| the picture on a beat | `pictures: [{ scene, find, file }]` (`file` is a path under `public/film`, e.g. `/img/s77/85-the-desk-lamp.jpg`) | the `file.pictures` loop in the builder |
| the camera and look of a picture (move, focal point, zoom, depth map and its move, grade, lights…) | `pictureLook["<file name without extension>"]`: the same fields as `CinematicSettings` in `src/types.ts` | `lookFor()` in the builder |
| the sound effect on a beat | `sfx: [{ scene, find, file, volume }]` (`file` names a file in `public/film/sfx/`, without `.mp3`) | the `file.sfx` loop in the builder |

**How to fill in those entries:**
- **`scene` and `find`.**
  - `scene` is the scene node's id without its continuation suffix: `nw_s77a`, not `nw_s77a_b`.
  - `find` is a piece of the beat's text that occurs in no other beat of that scene and its continuations. Take the first
    few words and lengthen until unique.
  - Check uniqueness before saving, and refuse to save if there is none.
- **A picture used on two beats shares one look.** That is how the film works today; say so in the panel.
- **A sound outside `public/film/sfx/`** is copied there first, by the endpoint below. Never overwrite a file there.
- **Replace, don't duplicate.** An existing entry with the same `scene` and `find` is replaced, not added again.
- **Leave everything else alone.** Do not touch keys the editor doesn't own (`cutscenes`, `soundtracks`, `beats`,
  `dropBeats` and the rest). Keep the file's formatting exactly: `JSON.stringify(data, null, 1)` plus a final newline, non-ASCII characters
  written as they are. Check that a save with no changes leaves the file byte-identical.

**The save endpoint** (new `tools/vite-keyframe-save.mjs`, `vite dev` only, added to `vite.config.ts` like
`animaticExportPlugin`):
- **`POST /__keyframes/save`** with `{ pictures, pictureLook, sfx }`:
  1. merges them into `src/film/studio-edits.json` as above;
  2. runs `node tools/build-film-story.mjs`;
  3. returns its output, warnings included, and the editor shows them.
- **`POST /__keyframes/upload`:**
  - Saves an uploaded image **byte for byte** to `public/film/img/uploads/<name>`.
  - If the name is taken, add `-2`, `-3`; never overwrite.
  - If the image is not 16:9 or is under 1920×1080, run it through `tools/install-film-picture.mjs` instead. That tool
    only crops to 16:9 and enlarges; it never shrinks.
  - Never resize, recompress or optimise.
- **In a production build** (no dev server), the mode is read-only for saving. Show "Run `npm run dev` to save keyframes"
  instead of a Save button.
- **Do not edit `src/` while an animatic export runs** from the dev server (`CLAUDE.md`).

## The editor (Studio, new tab "Keyframes", shown for a film story)

1. **The list.**
   - **One row per beat,** in playing order: start at the film's start scene, walk each node's beats, then follow the
     link onward:
     - the last beat's `afterBeatTargetSceneId`;
     - else the node's `autoAdvanceTargetSceneId`;
     - else its first choice's target.
   - **Include** song and cutscene nodes (`nw_song_*`, the inn raid) and their timed shots.
   - **No flowchart and no zooming into a scene:** a flat list, windowed like `ROW_WINDOW` in the image picker. There are
     about 1,700 beats.
   - **Each row shows:**
     - the scene mark (`animaticMark`, e.g. 77A) and the beat's number in the scene;
     - the speaker, and the first line of the text;
     - a thumbnail of the picture the beat SHOWS: its own `background`, or the one carried from an earlier beat, marked
       "carried";
     - icons for a sound effect, a depth map and an unsaved change.
   - **Filters:** a scene filter, a text search, and "beats with no picture of their own".
2. **The selected keyframe:**
   - **Preview.** A large preview of the beat as it will play, with its camera move. Reuse the player's picture layer
     (`DepthParallaxLayer`, the cinematic classes); do not write a second renderer.
   - **Picture.** The existing `ImagePicker`, opened on the film's pictures (`film-img`), with "Show every group" and
     "⇧ Upload an image…" as they are. Uploading goes through `/__keyframes/upload`.
   - **Camera and look.** The existing `CinematicControls` for this picture's `pictureLook`.
   - **The beat's other fields.** Transition and its speed, hold and revert, and the sound effect (the existing
     `AudioPicker`) and its volume.
   - **A collapsed "Scene" section** for the beat's scene node: ambient layers, music, particles, reading pace, using the
     controls the Scene tab already has. These are saved the way the Scene tab saves them today. If they cannot reach
     `studio-edits.json`, show them read-only and say so.
3. **Keys:** ↑/↓ move between keyframes; Space plays the selected beat; Ctrl+S saves.
4. **Undo:** keep the edits in memory until Save, with undo, and show the count of unsaved changes. Leaving the tab with
   unsaved changes asks first.

## Playing as keyframes ("Play as keyframes", a switch in the Studio and on the film's play button; URL `?keyframes=1`)

**Find in `Game.tsx` what makes a scene "zoom on the scene, then jump to the beats":** the scene node's own `background`,
`cinematic` and heading `prose` play before its first beat puts up its own picture. When the switch is on:
- **Opening a scene node:** it opens straight on its first beat's picture and that beat's camera. The scene's own
  picture, camera and heading are not shown as a step of their own. The heading may show as a small caption over the
  first beat.
- **Each beat:** it starts its own camera move from its first frame. A beat with no picture keeps the picture before it,
  as now.
- **The choices panel:** never shown. The player follows the single onward link above.
- **Everything else as normal:** voices, sound effects, music and its fades, ambience, particles, the depth camera,
  captions.

**When the switch is off, nothing about normal play may change.** The existing tests prove it.

## Checks before you say it works

1. **A new test, `npm run test:keyframes`** (`scripts/keyframes.entry.ts`, run like `scripts/film-backend-tests.mjs`):
   - **The list:**
     - the row count equals the film's dialogue beats reached from the start scene;
     - the first row is scene 1's first beat;
     - scene 77A comes between 77 and 78;
     - no row is a choice.
   - **The merge,** on a temporary copy of `studio-edits.json`:
     - a picture, a look and a sound effect land in the right keys;
     - an existing entry is replaced, not doubled;
     - every other key is byte-identical.
   - **A non-unique `find`** is refused.
   - **The upload:**
     - never overwrites;
     - keeps the bytes of a 1920×1080 or larger 16:9 JPEG.
2. **These pass, before and after:**
   - `npm run test:film-backend`
   - `npm run test:film-depth`
   - `npm run test:image-picker`
   - `npm run test:audio-picker`
   - `npm run lint`
   - `npx tsc --noEmit -p .`
3. **In a browser** (`npm run dev`, Chromium; launch with `executablePath: "/opt/pw-browsers/chromium"` if Playwright's
   own browser is missing):
   1. open the Studio, open the film, open Keyframes;
   2. pick another picture for a beat in scene 77 and save; the rebuild runs;
   3. play as keyframes from scene 77: that beat shows the new picture from its first frame, and no beat starts on the
      scene's own picture;
   4. upload an image and put it on a beat;
   5. change a camera move and see it in the preview and in play;
   6. turn the switch off and play scene 77 normally: it plays as before.
4. **Undo your test edits** to `studio-edits.json` and rebuild, so the branch carries no picture changes the director did
   not make. Check with `git diff src/film/studio-edits.json src/data/nobodysWitnessFilm.ts`: empty.

## Don't

- Don't change any picture, line, sound or timing of the film as part of this work.
- Don't hand-edit `src/data/nobodysWitnessFilm.ts`.
- Don't resize, recompress or rename anything under `public/film/img/`.
- Don't put a depth map alone on a picture with people in it (`docs/depth-camera.md`).
- Don't rewrite the Studio's other tabs. Add the new tab, and reuse their controls.
- Don't merge to `main`.

## Report

- **In `FILM.md`,** add a short section at the top: what the mode is, where it saves, how to play as keyframes.
- **In your last message to the director:**
  - the branch;
  - what works;
  - what doesn't, with what you could not test said plainly;
  - the test output.
