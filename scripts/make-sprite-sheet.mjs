#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  make-sprite-sheet.mjs — turn a generated "plate" into a sheet.     *
 *                                                                     *
 *  The AI tab's flow is: generate art on flat magenta → key the       *
 *  backdrop out → find the frames by the transparent gaps between     *
 *  them → crop, scale and bottom-align every frame to one uniform     *
 *  grid → write the sheet PNG. That flow runs in the browser; this    *
 *  is the same pipeline on the command line, so sheets can be built   *
 *  (and rebuilt) from committed plates without opening Studio.        *
 *                                                                     *
 *  Usage:                                                             *
 *    node scripts/make-sprite-sheet.mjs                               \
 *      --in plates/tintin-talk.png                                    \
 *      --out public/assets/sprites/tt-tintin-talk.png                 \
 *      [--key ff00ff] [--auto] [--tolerance 90] [--softness 12]       \
 *      [--height 384] [--gap 8] [--frames 3]                          *
 *                                                                     *
 *  Prints the frame grid (`frameWidth × frameHeight`) to paste into   *
 *  a story's `talkingSheet` / `sheet` config.                         *
 * ------------------------------------------------------------------ */

import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const flag = (name) => argv.includes(`--${name}`);

const inPath = arg("in");
const outPath = arg("out");
if (!inPath || !outPath) {
  console.error("usage: node scripts/make-sprite-sheet.mjs --in <plate.png> --out <sheet.png> [--key ff00ff] [--auto] [--height 384] [--frames 3]");
  process.exit(1);
}
const height = Number(arg("height", 384));
const tolerance = Number(arg("tolerance", 90));
const softness = Number(arg("softness", 12));
const minGap = Number(arg("gap", 8));
const wantFrames = Number(arg("frames", 0));
/** recovery only: connected components under this many source px are treated
 *  as specks/fringe and dropped inside each recovered frame region. */
const despecklePx = Number(arg("despeckle", 2000));

/* ---------- minimal PNG codec (8-bit, non-interlaced) ---------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG file");
  let off = 8;
  let w = 0,
    h = 0,
    depth = 0,
    colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      if (depth !== 8) throw new Error(`unsupported bit depth ${depth} (only 8-bit is handled)`);
      if (data[12] !== 0) throw new Error("interlaced PNGs are not supported");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colour type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const px = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  // Flatten to RGBA.
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0, p = 0; i < w * h; i++, p += channels) {
    const o = i * 4;
    if (channels >= 3) {
      rgba[o] = px[p];
      rgba[o + 1] = px[p + 1];
      rgba[o + 2] = px[p + 2];
      rgba[o + 3] = channels === 4 ? px[p + 3] : 255;
    } else {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = px[p];
      rgba[o + 3] = channels === 2 ? px[p + 1] : 255;
    }
  }
  return { w, h, rgba };
}

function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

/* ---------- keying ---------- */
const parseHex = (hex) => {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16) || 0, g: parseInt(h.slice(2, 4), 16) || 0, b: parseInt(h.slice(4, 6), 16) || 0 };
};

function sampleCorners(px, w, h) {
  const at = (x, y) => {
    const i = (y * w + x) * 4;
    return { r: px[i], g: px[i + 1], b: px[i + 2] };
  };
  const spots = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
  return {
    r: spots.reduce((s, c) => s + c.r, 0) / 4,
    g: spots.reduce((s, c) => s + c.g, 0) / 4,
    b: spots.reduce((s, c) => s + c.b, 0) / 4,
  };
}

/** Chroma-key + feather + DESPILL. Everything within `tolerance` of the key
 *  goes transparent; the `softness` band beyond it ramps the alpha.
 *
 *  DESPILL is why this function isn't just the distance test. Anti-aliased
 *  art blends the subject into the key colour along every edge, so the pixels
 *  that survive the cut still carry the key in their RGB. On a chunky
 *  silhouette you never notice; on fine detail — chain-link mesh, railings,
 *  hair, stray leaves — nearly every pixel IS an edge pixel and the sprite
 *  renders with a magenta halo over the game's background.
 *
 *  The fix: for a key whose dominant channels are known (magenta = R+B, green
 *  = G), pull the offending channel(s) back down toward the neutral channel by
 *  however much the pixel leans toward the key. Colours that legitimately
 *  contain the key hue lose a little saturation; the halo disappears. */
function key(px, w, h, k, tol, soft) {
  const out = new Uint8Array(px);
  // Which channels does the key over-weight? (magenta ff00ff -> r,b)
  const kmax = Math.max(k.r, k.g, k.b);
  const hot = [k.r, k.g, k.b].map((c) => c >= kmax * 0.75 && kmax > 40);
  const cold = [0, 1, 2].filter((i) => !hot[i]);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i],
      g = out[i + 1],
      b = out[i + 2];
    const dr = r - k.r,
      dg = g - k.g,
      db = b - k.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= tol) {
      out[i + 3] = 0;
      continue;
    }
    if (dist <= tol + soft) out[i + 3] = Math.round(out[i + 3] * ((dist - tol) / soft));
    if (out[i + 3] === 0 || cold.length === 0) continue;

    // Despill: pull the key's hue out of pixels it bled into.
    //
    // The clamp must only fire on pixels that are ACTUALLY spilled. Real
    // magenta spill lifts BOTH hot channels (R and B) above the cold one
    // (G) together — that is what "leaning magenta" means. Skin, by
    // contrast, is R > G > B: its red is genuinely high but its blue sits
    // BELOW green, so it is not spill and must be left alone.
    //
    // The previous version clamped any hot channel above the cold average,
    // which caught every warm colour in the plate and flattened R down to
    // G — turning all skin tones a uniform olive grey. (Trunk's face went
    // from 155,148,137 to 174,174,148.)
    const c = [r, g, b];
    let ref = 0;
    for (const j of cold) ref += c[j];
    ref /= cold.length;
    const spilled = [0, 1, 2].every((j) => !hot[j] || c[j] > ref);
    if (!spilled) continue;
    // Feather the correction by how far above the cold reference the pixel
    // leans, so a lightly-tinted edge is nudged rather than hard-clamped.
    for (let j = 0; j < 3; j++) {
      if (hot[j] && c[j] > ref) out[i + j] = Math.round(ref);
    }
  }
  return out;
}

/* ---------- frame finding ---------- */
/** Columns that are (almost) entirely transparent separate the frames. */
function frameColumns(px, w, h) {
  const empty = [];
  for (let x = 0; x < w; x++) {
    let opaque = 0;
    for (let y = 0; y < h; y++) if (px[(y * w + x) * 4 + 3] > 16) opaque++;
    empty.push(opaque / h < 0.004);
  }
  const runs = [];
  let start = -1;
  for (let x = 0; x <= w; x++) {
    if (x < w && empty[x]) {
      if (start < 0) start = x;
    } else if (start >= 0) {
      if (x - start >= minGap) runs.push([start, x]);
      start = -1;
    }
  }
  // Frames sit between the gaps.
  const frames = [];
  let from = 0;
  for (const [a, b] of runs) {
    if (a - from > 4) frames.push([from, a]);
    from = b;
  }
  if (w - from > 4) frames.push([from, w]);
  return frames;
}

function contentBounds(px, w, h, x0, x1) {
  let minY = h,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = x0; x < x1; x++) {
      if (px[(y * w + x) * 4 + 3] > 8) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        break;
      }
    }
  }
  return maxY < 0 ? null : { top: minY, bottom: maxY };
}

/* ---------- run ---------- */
const plate = decodePng(readFileSync(inPath));
const keyColor = flag("auto") ? sampleCorners(plate.rgba, plate.w, plate.h) : parseHex(arg("key", "ff00ff"));
const keyed = key(plate.rgba, plate.w, plate.h, keyColor, tolerance, softness);

let cols = frameColumns(keyed, plate.w, plate.h);
if (!cols.length) cols = [[0, plate.w]];

/* ---------- recovery: bridged plates ---------------------------------
 * When N frames were asked for but FEWER runs were found, the figures were
 * joined by opaque pixels (a glow, a crossing arm, a soft shadow) and no
 * fully-transparent column gap separates them. Split the widest merged run
 * at its lowest-occupancy interior column — the "waist" of the bridge —
 * until the count is right or no run has a splittable interior, then
 * despeckle each recovered region so cut fringe and stray specks go away.
 * (`scripts/split-bridged-plate.mjs` remains the manual override for
 * pathological plates, and can --probe where the waists are.) */
function despeckleRegions(px, w, h, regions, minPx) {
  let dropped = 0;
  for (const [x0, x1] of regions) {
    const seen = new Uint8Array(w * h);
    let bestSize = 0;
    const comps = [];
    for (let y = 0; y < h; y++) {
      for (let x = x0; x < x1; x++) {
        const start = y * w + x;
        if (seen[start] || px[start * 4 + 3] <= 16) continue;
        const stack = [start];
        seen[start] = 1;
        const comp = [start];
        while (stack.length) {
          const c = stack.pop();
          const cx = c % w;
          const cy = (c - cx) / w;
          for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
            if (nx < x0 || nx >= x1 || ny < 0 || ny >= h) continue;
            const n = ny * w + nx;
            if (seen[n] || px[n * 4 + 3] <= 16) continue;
            seen[n] = 1;
            stack.push(n);
            comp.push(n);
          }
        }
        comps.push(comp);
        if (comp.length > bestSize) bestSize = comp.length;
      }
    }
    for (const comp of comps) {
      if (comp === comps.find((c) => c.length === bestSize)) continue; // keep a largest component
      if (comp.length < minPx) {
        for (const c of comp) px[c * 4 + 3] = 0;
        dropped++;
      }
    }
  }
  return dropped;
}
let recoveredSplits = 0;
if (wantFrames > 0 && cols.length < wantFrames) {
  const occ = new Int32Array(plate.w);
  for (let x = 0; x < plate.w; x++)
    for (let y = 0; y < plate.h; y++) if (keyed[(y * plate.w + x) * 4 + 3] > 16) occ[x]++;
  const minSeg = Math.max(24, Math.round((plate.w / wantFrames) * 0.15));
  while (cols.length < wantFrames) {
    let best = null; // [a, b, waistColumn, waistOccupancy]
    for (const run of cols) {
      const width = run[1] - run[0];
      const margin = Math.max(12, Math.round(width * 0.1));
      let minV = Infinity;
      let at = -1;
      for (let x = run[0] + margin; x <= run[1] - margin; x++)
        if (occ[x] < minV) { minV = occ[x]; at = x; }
      if (at < 0) continue;
      if (at - run[0] < minSeg || run[1] - at < minSeg) continue;
      if (!best || width > best[1] - best[0]) best = [run[0], run[1], at, minV];
    }
    if (!best) break;
    const [a, b, at, v] = best;
    cols = cols.flatMap((r) => (r[0] === a && r[1] === b ? [[a, at], [at, b]] : [r]));
    recoveredSplits++;
    console.error(`  ♻ bridged plate: split run ${a}–${b} at column ${at} (waist occupancy ${v}px)`);
  }
  if (recoveredSplits) {
    const dropped = despeckleRegions(keyed, plate.w, plate.h, cols, despecklePx);
    console.error(`  ♻ recovery: ${recoveredSplits} waist split(s), ${dropped} stray component(s) under ${despecklePx}px despeckled`);
  }
}

// Optional merge: keep the N widest frames when the count is given.
if (wantFrames > 0 && cols.length > wantFrames) {
  cols = [...cols]
    .sort((a, b) => b[1] - b[0] - (a[1] - a[0]))
    .slice(0, wantFrames)
    .sort((a, b) => a[0] - b[0]);
}

const frames = cols
  .map(([x0, x1]) => {
    const bounds = contentBounds(keyed, plate.w, plate.h, x0, x1);
    if (!bounds) return null;
    const srcH = bounds.bottom - bounds.top + 1;
    const scale = height / srcH;
    return { x0, x1, top: bounds.top, bottom: bounds.bottom, srcH, scale };
  })
  .filter(Boolean);

if (!frames.length) {
  console.error(`✖ no frames found in ${inPath} — try --auto, or a bigger --tolerance`);
  process.exit(2);
}

/* RESOLUTION GUARD — `--height` is the sheet's real pixel resolution, and it
 * is a CEILING on how sharp the sprite can ever be. The game now sizes stage
 * walkers as a fraction of the plate (stageSpritePx), so on a large display a
 * character can be asked to draw at 300–400px; a sheet sliced at 200 gets
 * upscaled and goes soft, which reads as "the sprites look wrong" long before
 * anyone suspects the slicing step. Warn when we're throwing pixels away, and
 * when we're inventing them. */
{
  const srcMax = Math.max(...frames.map((f) => f.srcH));
  if (height > srcMax * 1.05) {
    console.warn(
      `⚠ --height ${height} UPSCALES the source (tallest frame is ${srcMax}px): the sheet will be soft. ` +
        `Re-render the plate larger, or slice at --height ${srcMax}.`
    );
  }
  if (height < 256) {
    console.warn(
      `⚠ --height ${height} is low for a stage character. The engine scales walkers with the ` +
        `viewport, so 384–512 is the safe range; small sheets look fine in the editor and blur in play.`
    );
  }
}

const widest = Math.max(...frames.map((f) => Math.round((f.x1 - f.x0) * f.scale)));
const cellW = widest;
const sheetW = cellW * frames.length;
const sheet = new Uint8Array(sheetW * height * 4);

frames.forEach((f, fi) => {
  const srcW = f.x1 - f.x0;
  const outW = Math.round(srcW * f.scale);
  const offX = fi * cellW + Math.floor((cellW - outW) / 2);
  for (let y = 0; y < height; y++) {
    // nearest-neighbour from the source, bottom-aligned
    const sy = Math.min(f.bottom, f.top + Math.floor(y / f.scale));
    for (let x = 0; x < outW; x++) {
      const sx = Math.min(f.x1 - 1, f.x0 + Math.floor(x / f.scale));
      const s = (sy * plate.w + sx) * 4;
      const d = ((y * sheetW) + offX + x) * 4;
      sheet[d] = keyed[s];
      sheet[d + 1] = keyed[s + 1];
      sheet[d + 2] = keyed[s + 2];
      sheet[d + 3] = keyed[s + 3];
    }
  }
});

writeFileSync(outPath, encodePng(sheetW, height, sheet));
console.log(`✓ ${outPath}  ${frames.length} frame(s)  frameWidth: ${cellW}, frameHeight: ${height}  (sheet ${sheetW}×${height})`);
