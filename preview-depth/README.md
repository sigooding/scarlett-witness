# Depth camera preview

A small throwaway app that plays **the real depth-map camera** on Nobody's Witness pictures, so a shot with cut-outs can
be watched instead of guessed at. It is not part of the game build (the game's Vite root never looks in here), and it
writes nothing into `src/` or `public/`.

    cd preview-depth
    npm install          # once: react + vite, this folder only
    npm run dev          # http://localhost:5179  (0.0.0.0, so the sandbox can proxy it)

`npm run dev` first runs `node shots.mjs`, which rebuilds `src/shots.json` from the repo's own data:

* every `pictureLook` entry in `src/film/studio-edits.json` that names a `depthMap` (the shot's **real** move —
  motion, amount, seconds, focus, focal point, mode, grade — is what the preview plays);
* the picture file the film uses for it, its scene folder, the people in `docs/film-depth-layers.json`
  (`peopleInShot`), its cut-out count, and the automatic review flags from
  `public/film/review/2026-10-22-auto-cutouts/README.md` where that batch made the picture.

## What it shows

Each card draws `<DepthParallaxLayer>` from `src/game/DepthParallax.tsx` — the same shader, plate, depth map and
cut-outs the film plays — over the picture, with the depth map inset in the corner. Click **▶** to run the move;
click the card for the big view (still, the move, the map, and the plate side by side). **Speed** only shortens
`depthSeconds` so a 14 s settle can be seen quickly; the geometry is untouched.

The grid runs at most **6** cameras at once (`MAX_LIVE`): a browser keeps about 16 WebGL contexts and silently drops
the oldest past that, which would leave the last cards blank. A finished push or truck stops its camera by itself.

Filters: **Cut-out shots** (has `depthCutouts`), **Flagged 22 Oct** (the automatic pass flagged it), **People in shot**
(listed in `peopleInShot`), **Every depth shot**.

## Reading a shot

* A cut-out that runs to the edge of its box is probably clipped — a straight edge on the person as the camera moves.
* Something in the plate that is still person-shaped moves with the room instead of with the person.
* The map should follow the scene: floor brightening toward the bottom of frame, walls flat, doorways and corridors
  going dark. A person whose depth disagrees with the map under their feet slides against the floor.

This is a look, not the film: the film adds the grade, grain, lens effects and the dialogue layer on top. Record the
real frames with `node tools/depth-frames.mjs <scene> <picture> /tmp/frames 16 2` before calling a shot done
(`docs/depth-camera.md` §5).
