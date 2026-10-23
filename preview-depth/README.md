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

## If you are an agent (no mouse, maybe no eyes)

This folder is here so a shot with cut-outs can be *watched* instead of guessed at. Everything the app draws comes from
the repo's own data, so most of it is readable without a browser:

| You want | Do this |
|---|---|
| The inventory: every depth shot, its real move, its cut-outs, its 22 Oct flags | `node shots.mjs` then read `src/shots.json` |
| A shortlist as text, with a URL per shot | `node shots.mjs --list [cuts\|people\|flagged\|experiments\|all]` (default `cuts`) |
| One shot on screen | open `http://localhost:5179/?shot=<name>&play=1` (URL-encode the name), or `?filter=<id>` |
| The rendered move as images | Playwright is already a dependency of `tools/depth-frames.mjs`; see the snippet below |

Deep links: `?shot=<name>` opens that shot's big view (still, move, map, plate), `?play=1` starts the move immediately,
`?filter=experiments|cuts|flagged|people|all` picks the grid. `DEPTH_PREVIEW_URL` overrides the base URL in `--list`.

    npm install          # preview-depth only
    npm run dev          # 0.0.0.0:5179
    # then, from a folder that has playwright installed (the repo root does):
    node -e 'import("playwright").then(async ({chromium}) => {
      const b = await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
      const p = await b.newPage({viewport:{width:1280,height:720}});
      await p.goto("http://localhost:5179/?shot=200-the-number-114&play=1");
      await p.waitForTimeout(4000);
      await p.screenshot({path:"/tmp/200-big.png"}); await b.close(); });'

Three things to keep in mind:

* **It is a look, not a delivery.** No grade, grain or dialogue layer. Judge geometry and cut-out edges here; record the
  shipped frames with `tools/depth-frames.mjs` (game dev server, port 5173) before calling a shot done.
* **Six cameras at most** (`MAX_LIVE`) — a browser keeps about 16 WebGL contexts and silently drops the oldest, so a
  screenshot of the whole grid past six cards would show blanks. Screenshot one card at a time.
* **SwiftShader is slow.** Software WebGL needs a few seconds per live card; a still (no `play=1`) is immediate.

The tool is only as current as `shots.json`: it is rebuilt by `npm run dev` / `npm run shots`, so re-run it after
changing `src/film/studio-edits.json` or `docs/film-depth-layers.json`.
