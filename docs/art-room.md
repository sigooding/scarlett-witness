# The art room — ImageMagick asset tooling

Some authoring assets need build-time processing the browser can't (or
shouldn't) do. These helpers shell out to **ImageMagick** (`convert`,
`identify`). They are development/build-time tools only — the game ships the
finished files and needs nothing at runtime.

Install ImageMagick once on the machine doing the art pass:

```sh
sudo apt install imagemagick      # Debian / Ubuntu
brew install imagemagick          # macOS
```

## `scripts/art-room/plate-opt.mjs` — the scene/cover plate normaliser

The AI tab / Studio upload film-still backgrounds as big PNGs and JPEGs that
are far larger than the browser ever needs (Glass Road's raw 1672×941 PNGs
were ~3 MB each and totalled 38 MB). Nothing used to shrink them, so every
case shipped that weight to the player. This is the missing step: resize to a
sane longest edge, re-encode, strip metadata, and report the bytes saved.

```sh
# Re-encode plates in place (default: longest edge <= 1500px, quality 82)
node scripts/art-room/plate-opt.mjs public/assets/my-case/*.png

# Explicit controls
node scripts/art-room/plate-opt.mjs \
    --quality 78 --max 1400 --ext jpg public/assets/my-case/bg*.png

# WebP output (same base name, .webp)
node scripts/art-room/plate-opt.mjs --ext webp public/assets/my-case/bg.png

# A CI/authoring guard: report (and fail on) every image over a size
node scripts/art-room/plate-opt.mjs --check public/assets --fail-over 400
```

Rules of thumb:
- **Scene plates and covers** are photographic → use `.jpg` (or `.webp`). They
  are `cover`-cropped by the engine, so 1500px across is plenty.
- **Sprite sheets, portraits and anything needing transparency** must stay
  `.png` (or `.webp` with alpha). `plate-opt --ext png` still strips metadata
  and recompresses them, but never flattens alpha.
- Always re-point a story's strings when you change an extension (see Glass
  Road: `src/data/glassRoad.ts` references `/assets/glass-road/*.jpg`).

Wired up as `npm run art:plates` and `npm run art:plates:check`.

## `scripts/art-room/fx-alpha.mjs` — alpha from luminance

Shipped foreground FX plates (smoke, neon, steam, foliage) are JPEGs with no
alpha. `fx-alpha` derives an alpha channel from luminance and re-encodes as
PNG so the primary foreground layer can sit on top of a scene without a black
or white slab:

```sh
node scripts/art-room/fx-alpha.mjs --light in.jpg out.png   # smoke/glow on black
node scripts/art-room/fx-alpha.mjs --dark   in.jpg out.png   # foliage on white
```

See the header of the script for the full contract.

## `scripts/beta/zone-map.mjs` — stage floor / obstacle overlays

Draws a stage room's walkable floor band, obstacles and spawn point over its
plate as a debug PNG (orange floor band, red obstacles, spawn triangle), so a
room can be sanity-checked visually before wiring hotspots:

```sh
node scripts/beta/zone-map.mjs <story-id> <scene-id>
```

## Hand-rolled (no ImageMagick) pipeline

`scripts/art-room/forge-sheet.mjs`, `trim-border.mjs` and
`scripts/make-sprite-sheet.mjs` do chroma-keying and sprite-sheet building in
pure Node (no external binary) — that is the path that runs in the browser
too. ImageMagick is for the jobs that are simpler to express as one convert
command.
