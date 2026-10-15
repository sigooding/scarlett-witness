# scarlett-witness

`FILM.md` explains how the Nobody's Witness film is built from PlayFrame's material; read it before changing the film.

## Depth maps (the depth-map camera)

Read `docs/depth-camera.md` before adding or changing any depth map, plate or cut-out. Three rules learned the hard way on 10 October 2026:

1. **No guessed depth maps.** A depth map must come from a real depth model (Depth Anything via `tools/make-depth-layers.py`) or be made by the director (e.g. with Google's image tools). Maps built from horizon ramps, texture or contrast cues did not follow their pictures and were all removed.
2. **No depth map alone on a picture with people in it** (or a hand, a face): it stretches them. Cut the people out and paint in behind them with `tools/make-depth-layers.py`, and list the picture in `peopleInShot` in `docs/film-depth-layers.json`; `npm run test:film-depth` enforces it.
3. **Never hand-edit `src/data/nobodysWitnessFilm.ts`.** Change `src/film/studio-edits.json` (`pictureLook` for a picture's camera and depth) and run `node tools/build-film-story.mjs`.

Check maps with `tools/review-depth-maps.py` and watch the move with `tools/depth-frames.mjs` before calling a shot done.

## The Studio's image library

`tools/builtin-images.mjs` is what every image box in the Studio can offer: `public/img` and `public/assets`, the
film's own pictures (`public/film/img`, group `film-img`, labelled by scene) and its depth layers
(`public/film/depth`, group `film-depth`, labelled by the shot they belong to). Grouped files are listed by the
fields that ask for them, by a field already pointing into them, or behind the picker's "Show every group too".
Uploads go straight into the box (`⇧ Upload an image…`, or drop a file on it) and are filed under the folder the
field asks for. `npm run test:image-picker` drives the real picker over the real scan. A list longer than
`ROW_WINDOW` (250 rows) is shown as a window with a "Show all" button and no per-row thumbnail — the film's 800+
pictures made an unwindowed list cost seconds to open.

## Studio editing speed

`npm run perf:studio` (`scripts/studio-perf.mjs`) prints what one edit really costs on Nobody's Witness: the
per-keystroke deep clone, the undo fingerprint, the validator, the autosave's serialise/compact — then mounts the
real `<Studio/>` in happy-dom and times a typing burst, the autosave behind it and opening an image picker, and
counts media-library reads with the code that asked for them. happy-dom's absolute milliseconds are pessimistic
(no paint); compare two versions of the same code, not two machines.

## Animatic export

`docs/animatic-export.md`: `npm run export:animatic -- --from nw_s65 --to nw_s65`, or 🎞 Export animatic on the home screen under `npm run dev`. Do not edit `src/` while an export runs from a dev server (Vite reloads the page and the capture breaks).

## No saxophones

The director wants no saxophone anywhere in Nobody's Witness: not in the screenplay, the effects or the music cues. Do not generate or place one.

## The film and the Studio

Read `docs/film-backend.md`. Everything Nobody's Witness uses (depth maps and their suggested move, beat sound effects, recorded ambience layers, loop switch, reading pace, particles, montage looks) is a Scene or Beat field the Studio can set, and the media walker `visitStoryMediaFields` (`src/data/storyMedia.ts`) is the one place resolve, collect and export agree. If you add a media field to a Scene or Beat, visit it there and add a check to `scripts/film-backend.entry.ts`. `npm run test:film-backend` and `npm run test:film-backend:browser` guard it.
