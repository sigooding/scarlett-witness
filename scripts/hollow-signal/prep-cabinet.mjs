#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  prep-cabinet.mjs — turn a generated arcade-cabinet plate into a
 *  usable game asset.
 *
 *  The plate is drawn on flat magenta with its MONITOR filled flat
 *  green. This script does two jobs in one pass:
 *
 *    1. keys the magenta backdrop to transparent (the cutout), and
 *       keys the green monitor to transparent too — so the screen is a
 *       real HOLE the engine can render the mini-game through.
 *    2. measures the green rectangle and reports it as PERCENTAGES of
 *       the trimmed cabinet box, which is exactly the shape the story's
 *       `screenRect` (and Studio's editor) wants.
 *
 *  Usage:
 *    node scripts/hollow-signal/prep-cabinet.mjs \
 *      --in plates/hs-cabinet-c.png \
 *      --out public/assets/hollow-signal/arcade-cabinet.png
 *
 *  Reuses the PNG codec approach of scripts/make-sprite-sheet.mjs; no
 *  new dependencies.
 * ------------------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { inflateSync, deflateSync } from "node:zlib";

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const inPath = arg("in");
const outPath = arg("out");
if (!inPath || !outPath) {
  console.error("usage: node scripts/hollow-signal/prep-cabinet.mjs --in <plate.png> --out <asset.png>");
  process.exit(1);
}
/** how far a pixel may sit from the key colour and still be keyed */
const tolerance = Number(arg("tolerance", 100));
/** feather width, in the same distance units, for a soft edge */
const softness = Number(arg("softness", 26));

/* ---------- minimal PNG codec (8-bit, non-interlaced) ---------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG file");
  let off = 8;
  let w = 0, h = 0, depth = 0, colorType = 0;
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
      if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`);
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
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0, p = 0; i < w * h; i++, p += channels) {
    const o = i * 4;
    if (channels >= 3) {
      rgba[o] = px[p]; rgba[o + 1] = px[p + 1]; rgba[o + 2] = px[p + 2];
      rgba[o + 3] = channels === 4 ? px[p + 3] : 255;
    } else {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = px[p];
      rgba[o + 3] = channels === 2 ? px[p + 1] : 255;
    }
  }
  return { w, h, rgba };
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- keying ---------- */
const { w, h, rgba } = decodePng(readFileSync(inPath));

/** Distance from a colour, weighted so a hue match matters more than
 *  brightness — the plate's magenta has soft shading at the edges. */
const dist = (r, g, b, kr, kg, kb) =>
  Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2);

/** Is this pixel the flat green monitor? Green keys are recognised by
 *  green dominating both other channels, which shading preserves. */
const isScreen = (r, g, b) => g > 110 && g > r * 1.7 && g > b * 1.7;

let minX = w, minY = h, maxX = -1, maxY = -1; // screen bounds
let cMinX = w, cMinY = h, cMaxX = -1, cMaxY = -1; // cabinet bounds

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];

    if (isScreen(r, g, b)) {
      rgba[o + 3] = 0; // punch the monitor out
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      continue;
    }

    // magenta backdrop → transparent, with a feathered edge
    const d = dist(r, g, b, 255, 0, 255);
    if (d <= tolerance) {
      rgba[o + 3] = 0;
    } else {
      if (d < tolerance + softness) {
        const t = (d - tolerance) / softness;
        rgba[o + 3] = Math.round(rgba[o + 3] * t);
        // de-fringe: pull magenta cast out of the semi-transparent rim
        rgba[o + 1] = Math.max(rgba[o + 1], Math.min(r, b) - 6);
      }
      if (rgba[o + 3] > 8) {
        if (x < cMinX) cMinX = x;
        if (y < cMinY) cMinY = y;
        if (x > cMaxX) cMaxX = x;
        if (y > cMaxY) cMaxY = y;
      }
    }
  }
}

if (maxX < 0) {
  console.error("✗ no green monitor area found — is the screen filled flat green?");
  process.exit(1);
}
// The screen hole is inside the cabinet, so include it in the cabinet box.
cMinX = Math.min(cMinX, minX); cMinY = Math.min(cMinY, minY);
cMaxX = Math.max(cMaxX, maxX); cMaxY = Math.max(cMaxY, maxY);

/* ---------- trim to the cabinet ---------- */
const tw = cMaxX - cMinX + 1;
const th = cMaxY - cMinY + 1;
const out = new Uint8Array(tw * th * 4);
for (let y = 0; y < th; y++) {
  for (let x = 0; x < tw; x++) {
    const src = ((y + cMinY) * w + (x + cMinX)) * 4;
    const dst = (y * tw + x) * 4;
    out[dst] = rgba[src];
    out[dst + 1] = rgba[src + 1];
    out[dst + 2] = rgba[src + 2];
    out[dst + 3] = rgba[src + 3];
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePng(tw, th, out));

/* ---------- report the screen rect, as % of the trimmed cabinet ---------- */
/** one decimal place — the value is already a percentage */
const pct = (n) => Math.round(n * 10) / 10;
const rect = {
  x: pct(((minX - cMinX) / tw) * 100),
  y: pct(((minY - cMinY) / th) * 100),
  w: pct(((maxX - minX + 1) / tw) * 100),
  h: pct(((maxY - minY + 1) / th) * 100),
};

console.log(`✓ ${outPath}  ${tw}×${th}`);
console.log(`  screenRect (percent of the cabinet image):`);
console.log(`  ${JSON.stringify(rect)}`);
