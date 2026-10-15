# The film and the Studio (12 October 2026)

Nobody's Witness is a compiled Story like any other. Everything it uses can be made from the Studio, with these exceptions: the cutscene and soundtrack timing fit, and the cut-out depth layers, live in `src/film/studio-edits.json` and `tools/`. `npm run test:film-backend` (43 checks) and `npm run test:film-backend:browser` (the Studio, an export and the player, about a minute) guard the rest.

## What the film uses

| In the film | Where it is in the Studio | Notes |
|---|---|---|
| Scene and credits nodes (153 and 4) | Scenes tab | Every field the film sets is a field of `Scene`. |
| Depth map on a picture (`cinematic.depthMap`, `depthMotion`, `depthAmount`, `depthSeconds`) | Scene tab, Depth-map camera | A new map starts on the suggested move (truck, 0.4, 14 s, pan). The depth map, clean plate and cut-out pickers also list the film's own files under `public/film/depth` (group `film-depth` in `vite.config.ts`'s image plugin, `groups` on `ImagePicker`), labelled by shot. Each of the three takes an upload straight from the box (`⇧ Upload an image…`, filed in the `depth maps` folder) and is handed `storyId` so a map made after the Python pass belongs to the case being edited. `scripts/beta/image-picker-harness.mjs` (`npm run test:image-picker`) guards the list, the hidden-group switch and the upload path. |
| Sound effect on a beat (`sfxUrl`, `sfxVolume`) | Beats tab, "Sound effect on this beat" | Uploaded files become `asset:` references. |
| Ambient loop, synth preset and recorded loops (`ambientAudio` = `preset+file:<url>`) | Scene tab, Look, atmosphere and camera, "Ambient loop" | New layers editor (`src/studio/AmbientLayers.tsx`, parsing in `ambientParts.ts`). |
| Music loops (`musicLoop`) | Scene tab, "Loop this track" | A song never restarts when this is off. |
| Animatic reading pace (`readPace`) | Scene tab | Same formula as `readingSeconds` in `src/game/animatic.tsx`. |
| Particles (`particleConfig`: density, opacity, wind) | Scene tab sliders | Never worked before 12 October; the film does not use it (the builder no longer writes it). |
| Montage stills and their camera looks (`montageLooks`) | Beats tab, montage | Re-keyed when uploaded stills are resolved. |

## What was wrong, found by this audit

1. The export dropped every `sfxUrl` and `file:` ambience (135 files in the film): `visitStoryMediaFields` now visits both, so resolve, collect and export agree.
2. The validator warned 143 times on the film because it read `amb-office.mp3` layers as unknown presets; it now reads layers.
3. `particleConfig` was stored and never applied; `Particles` now takes density, opacity and wind.
4. Uploaded stills in a montage lost their look when resolved.
5. Nothing in the Studio could add a recorded ambience layer, a beat sound effect, the reading pace or the loop switch.
6. Two engine tests were stale (a timer-gate regex, and checks that need `public/assets`, which is not in the repository).

## Facts for later

* The whole-film export is about 387 MB and takes about two minutes; from 300 files up (`LARGE_EXPORT_FILES` in `src/studio/exportBundle.ts`) the Studio asks before it starts, and a cancelled export changes nothing.
* The cutscene and soundtrack timing fit, and the cut-outs, still live in `studio-edits.json` and `tools/`; the Studio cannot make them.
* `scripts/dom-smoke.mjs` and `scripts/browser/studio.spec.ts` were stale (the Neon Diner and Family Guy are no longer in the catalogue) and are fixed: both seed those stories as the writer's own, and the Studio spec answers Family Guy's missing pictures and sounds with placeholders. Run the browser specs with `PLAYWRIGHT_CHROMIUM_PATH` set to the installed Chromium when Playwright's own download is not there.
* Never hand-edit `src/data/nobodysWitnessFilm.ts`; change `src/film/studio-edits.json` and run `node tools/build-film-story.mjs`.
