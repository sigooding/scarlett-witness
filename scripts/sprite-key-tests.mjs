/* ------------------------------------------------------------------ */
/*  SPRITE KEY TESTS — regression cover for the talking-sprite forge.   */
/*                                                                      */
/*  These lock down the two faults that silently destroyed What's Owed's */
/*  talking sprites. Both produced a FILE, so nothing threw and no       */
/*  existing harness noticed; the damage was only visible by playing the */
/*  story and seeing the cast never move their mouths.                   */
/*                                                                      */
/*    1. SHADOWED BACKDROP — generators paint soft shadow onto the flat  */
/*       magenta they were told to leave alone. Plain RGB distance can   */
/*       not separate shadowed magenta (308 from the key) from a dark    */
/*       coat (340), so the gaps between figures survived, the cutter    */
/*       saw one blob, and every frame came out identical.               */
/*    2. SPECK BRIDGING — one stray pixel marked a whole column as       */
/*       subject, bridging the gaps for the same net effect.             */
/*                                                                      */
/*  The guard against over-correcting matters just as much: keying on    */
/*  chroma ALONE erased dark costume (measured 98.7% of a plate gone).   */
/*                                                                      */
/*    node scripts/sprite-key-tests.mjs                                  */
/* ------------------------------------------------------------------ */
import { applyKey, frameRuns } from "./art-room/forge-sheet.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`); }
};

const MAGENTA = { r: 250, g: 3, b: 245 };

/** Build a synthetic 3-figure talking plate on magenta.
 *  `shadow` paints a darkened-magenta gradient across the gaps, exactly the
 *  failure the generators produce. */
function plate({ shadow = false, speck = false } = {}) {
  const w = 300, h = 100;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // backdrop, optionally shadowed toward the bottom of the frame
      const k = shadow ? 0.12 + 0.88 * (1 - y / h) : 1;
      data[i] = MAGENTA.r * k; data[i + 1] = MAGENTA.g * k; data[i + 2] = MAGENTA.b * k;
      data[i + 3] = 255;
      // three figures at x 20-80, 120-180, 220-280 — a very dark coat
      const inFigure = (x >= 20 && x < 80) || (x >= 120 && x < 180) || (x >= 220 && x < 280);
      if (inFigure && y > 20) { data[i] = 7; data[i + 1] = 10; data[i + 2] = 6; }
    }
  }
  // a single stray speck in the middle gap
  if (speck) {
    const i = (50 * w + 100) * 4;
    data[i] = 90; data[i + 1] = 90; data[i + 2] = 90; data[i + 3] = 255;
  }
  return { width: w, height: h, data };
}

const cut = (img) => frameRuns(applyKey(img, MAGENTA, 90, 45));
/** Share of originally-opaque subject pixels still opaque after keying. */
function subjectKept(img) {
  const keyed = applyKey(img, MAGENTA, 90, 45);
  let total = 0, kept = 0;
  for (let i = 0; i < img.data.length; i += 4) {
    // the synthetic coat colour
    if (img.data[i] === 7 && img.data[i + 1] === 10 && img.data[i + 2] === 6) {
      total++;
      if (keyed.data[i + 3] > 8) kept++;
    }
  }
  return total ? kept / total : 0;
}

console.log("\n=== SPRITE KEY / FRAME CUTTER ===\n");

ok("1.1 clean plate cuts into 3 frames", cut(plate()).length === 3, `got ${cut(plate()).length}`);
ok(
  "1.2 SHADOWED backdrop still cuts into 3 frames",
  cut(plate({ shadow: true })).length === 3,
  `got ${cut(plate({ shadow: true })).length} — shadow bridged the gaps`
);
ok(
  "1.3 a stray speck does not bridge two figures",
  cut(plate({ speck: true })).length === 3,
  `got ${cut(plate({ speck: true })).length} — one pixel merged the frames`
);
ok(
  "1.4 shadow AND speck together still cut cleanly",
  cut(plate({ shadow: true, speck: true })).length === 3
);

// The over-correction guard: chroma-only keying erases dark costume.
ok(
  "2.1 dark costume survives the key (clean plate)",
  subjectKept(plate()) > 0.95,
  `kept ${(subjectKept(plate()) * 100).toFixed(1)}%`
);
ok(
  "2.2 dark costume survives the key (shadowed plate)",
  subjectKept(plate({ shadow: true })) > 0.95,
  `kept ${(subjectKept(plate({ shadow: true })) * 100).toFixed(1)}%`
);

// Frames must be usable, not just counted.
const runs = cut(plate({ shadow: true }));
ok(
  "3.1 the three frames are evenly spaced",
  runs.length === 3 && runs.every(([a, b]) => b - a > 40 && b - a < 80),
  JSON.stringify(runs)
);

/* ---------------------------------------------------------------- */
/*  FOREGROUND FX ALPHA                                              */
/*                                                                    */
/*  The animated foreground overlays shipped as JPEGs — a format with */
/*  NO alpha channel — so every one was an opaque rectangle faking    */
/*  transparency with a CSS blend mode. The primary foreground layer  */
/*  had no blendMode at all, so there they drew as solid slabs.       */
/*  These guard the conversion to real alpha PNGs.                    */
/* ---------------------------------------------------------------- */
import { readFileSync, existsSync, readdirSync } from "node:fs";

console.log("=== FOREGROUND FX ALPHA ===\n");

const FX_DIR = "public/img/whats-owed/fx";

/** PNG colour type from the IHDR chunk: 6 = RGBA, 4 = grey+alpha. */
function pngColorType(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return b[25];
}
ok("4.1 the fx alpha directory exists", existsSync(FX_DIR));
const fxFiles = existsSync(FX_DIR) ? readdirSync(FX_DIR).filter((f) => f.endsWith(".png")) : [];
ok("4.2 every fx plate was converted", fxFiles.length === 14, `found ${fxFiles.length}`);
ok(
  "4.3 no fx plate is still a JPEG",
  existsSync(FX_DIR) && !readdirSync(FX_DIR).some((f) => /\.jpe?g$/i.test(f))
);
const nonRgba = fxFiles.filter((f) => ![4, 6].includes(pngColorType(`${FX_DIR}/${f}`)));
ok("4.4 every fx PNG carries an alpha channel", nonRgba.length === 0, nonRgba.join(", "));

// The real test: transparent pixels must EXIST, or the alpha is decorative.
const { decodePng } = await import("./art-room/forge-sheet.mjs");
const opaque = [];
for (const f of fxFiles) {
  const img = decodePng(readFileSync(`${FX_DIR}/${f}`));
  let clear = 0;
  for (let i = 3; i < img.data.length; i += 4) if (img.data[i] < 8) clear++;
  const share = clear / (img.width * img.height);
  if (share < 0.05) opaque.push(`${f} ${(share * 100).toFixed(1)}%`);
}
ok("4.5 every fx plate has genuinely transparent pixels", opaque.length === 0, opaque.join(", "));

console.log(`\n=== SPRITE KEY: ${pass} passed, ${fail} failed ===\n`);
process.exit(fail ? 1 : 0);
