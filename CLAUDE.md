# scarlett-witness

`FILM.md` explains how the Nobody's Witness film is built from PlayFrame's material; read it before changing the film.

## Depth maps (the depth-map camera)

Read `docs/depth-camera.md` before adding or changing any depth map, plate or cut-out. Three rules learned the hard way on 10 October 2026:

1. **No guessed depth maps.** A depth map must come from a real depth model (Depth Anything via `tools/make-depth-layers.py`) or be made by the director (e.g. with Google's image tools). Maps built from horizon ramps, texture or contrast cues did not follow their pictures and were all removed.
2. **No depth map alone on a picture with people in it** (or a hand, a face): it stretches them. Cut the people out and paint in behind them with `tools/make-depth-layers.py`, and list the picture in `peopleInShot` in `docs/film-depth-layers.json`; `npm run test:film-depth` enforces it.
3. **Never hand-edit `src/data/nobodysWitnessFilm.ts`.** Change `src/film/studio-edits.json` (`pictureLook` for a picture's camera and depth) and run `node tools/build-film-story.mjs`.

Check maps with `tools/review-depth-maps.py` and watch the move with `tools/depth-frames.mjs` before calling a shot done.

## Animatic export

`docs/animatic-export.md`: `npm run export:animatic -- --from nw_s65 --to nw_s65`, or 🎞 Export animatic on the home screen under `npm run dev`. Do not edit `src/` while an export runs from a dev server (Vite reloads the page and the capture breaks).

## No saxophones

The director wants no saxophone anywhere in Nobody's Witness: not in the screenplay, the effects or the music cues. Do not generate or place one.
