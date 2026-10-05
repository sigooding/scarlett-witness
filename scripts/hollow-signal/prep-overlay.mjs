#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  prep-overlay.mjs — key a flat-magenta plate into a FULL-FRAME
 *  foreground overlay.
 *
 *  Unlike prep-icon.mjs this deliberately does NOT trim: a foreground
 *  layer has to keep the exact frame it was painted in, or it stops
 *  registering with the background it sits over. What it does instead:
 *
 *    1. keys the magenta to transparent with a feathered edge;
 *    2. DE-FRINGES properly. Dark silhouettes on magenta leave a purple
 *       halo, because the anti-aliased rim is a blend of subject and
 *       key. For every partly-transparent pixel we pull R and B down
 *       toward G (magenta is exactly "R and B high, G low"), which
 *       removes the cast without touching opaque interior pixels.
 *    3. reports the alpha coverage, so a plate whose "empty" middle
 *       wasn't actually empty is obvious immediately.
 *
 *  Usage:
 *    node scripts/hollow-signal/prep-overlay.mjs \
 *      --in plates/hs-fg-woods.png \
 *      --out public/assets/hollow-signal/fg-woods.png
 * ------------------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { inflateSync, deflateSync } from "node:zlib";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const inPath = arg("in");
const outPath = arg("out");
if (!inPath || !outPath) {
  console.error("usage: node scripts/hollow-signal/prep-overlay.mjs --in <plate.png> --out <overlay.png>");
  process.exit(1);
}
const tolerance = Number(arg("tolerance", 110));
const softness = Number(arg("softness", 40));

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
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- key, in place, full frame ---------- */
const { w, h, rgba } = decodePng(readFileSync(inPath));
let opaque = 0;
let partial = 0;

/*
 *  Proper magenta chroma-key with SPILL SUPPRESSION.
 *
 *  A naive "distance from #FF00FF, then de-fringe only translucent pixels"
 *  fails badly on fine silhouettes: pine needles and grass blades are almost
 *  entirely anti-aliased rim, so nearly every pixel is a magenta/subject
 *  blend, yet most are still near-opaque. Alpha-gated de-fringing skips them
 *  and the whole layer comes out purple.
 *
 *  Magenta is exactly "R and B high, G low", so the clean channel is G.
 *  For each pixel let spill = mean(R,B) - G:
 *    - spill <= 0            → no key colour at all: fully opaque subject.
 *    - spill >= keyStrength  → pure backdrop: fully transparent.
 *    - in between            → a blend: alpha scales down with spill, AND we
 *                              clamp R and B back toward G to remove the cast.
 *  Suppression runs on EVERY pixel, not just translucent ones, which is what
 *  actually cleans the needles.
 */
const keyStrength = Number(arg("key-strength", 150));
const floor = Number(arg("floor", 26));

for (let i = 0; i < w * h; i++) {
  const o = i * 4;
  const r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
  const spill = (r + b) / 2 - g;

  if (spill <= floor) {
    // No meaningful key colour — leave the subject untouched.
    opaque++;
    continue;
  }
  if (spill >= keyStrength) {
    rgba[o + 3] = 0;
    continue;
  }
  // A blend. Alpha falls off as the pixel gets closer to pure key colour.
  const t = (spill - floor) / (keyStrength - floor); // 0 = subject, 1 = key
  rgba[o + 3] = Math.round(rgba[o + 3] * (1 - t));
  partial++;
  // Suppress the magenta cast: pull R and B down to the clean channel.
  if (rgba[o] > g) rgba[o] = g;
  if (rgba[o + 2] > g) rgba[o + 2] = g;
  if (rgba[o + 3] > 250) opaque++;
}

void tolerance;
void softness;


mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePng(w, h, rgba));

const cover = ((opaque / (w * h)) * 100).toFixed(1);
console.log(`✓ ${outPath}  ${w}×${h}  ${cover}% opaque, ${partial} feathered px`);
if (Number(cover) > 60) {
  console.log(`  ⚠ ${cover}% opaque is high for a foreground overlay — is its middle actually clear?`);
}
