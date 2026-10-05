#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  prep-icon.mjs — turn a flat-magenta item plate into an inventory
 *  icon.
 *
 *  Item icons are rendered with `object-cover` in the inventory dock,
 *  so a non-square icon gets cropped on its long axis. This script:
 *
 *    1. keys the magenta backdrop to transparent (feathered, de-fringed);
 *    2. trims to the subject;
 *    3. pads the result back out to a SQUARE with a small margin, so the
 *       dock's object-cover crop can never clip the object.
 *
 *  Usage:
 *    node scripts/hollow-signal/prep-icon.mjs \
 *      --in plates/hs-item-walkie.png \
 *      --out public/assets/hollow-signal/item-walkie.png [--size 256]
 *
 *  Shares the PNG codec approach of scripts/make-sprite-sheet.mjs and
 *  scripts/hollow-signal/prep-cabinet.mjs; no new dependencies.
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
  console.error("usage: node scripts/hollow-signal/prep-icon.mjs --in <plate.png> --out <icon.png> [--size 256]");
  process.exit(1);
}
/** output edge length, in px */
const size = Number(arg("size", 256));
/** margin inside the square, as a fraction of the edge */
const margin = Number(arg("margin", 0.06));
const tolerance = Number(arg("tolerance", 100));
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
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- key the magenta ---------- */
const { w, h, rgba } = decodePng(readFileSync(inPath));
let minX = w, minY = h, maxX = -1, maxY = -1;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
    const d = Math.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2);
    if (d <= tolerance) {
      rgba[o + 3] = 0;
      continue;
    }
    if (d < tolerance + softness) {
      const t = (d - tolerance) / softness;
      rgba[o + 3] = Math.round(rgba[o + 3] * t);
      // de-fringe the magenta cast out of the semi-transparent rim
      rgba[o + 1] = Math.max(rgba[o + 1], Math.min(r, b) - 6);
    }
    if (rgba[o + 3] > 8) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX < 0) {
  console.error("✗ nothing left after keying — is the plate really flat magenta?");
  process.exit(1);
}

/* ---------- trim, then letterbox into a square ---------- */
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;
const inner = Math.round(size * (1 - margin * 2));
const scale = Math.min(inner / cw, inner / ch);
const dw = Math.max(1, Math.round(cw * scale));
const dh = Math.max(1, Math.round(ch * scale));
const ox = Math.round((size - dw) / 2);
const oy = Math.round((size - dh) / 2);

const out = new Uint8Array(size * size * 4); // transparent
// Box-filter downscale: each destination pixel averages its source footprint,
// which keeps thin antenna/wire detail from aliasing away.
for (let y = 0; y < dh; y++) {
  const sy0 = minY + (y / dh) * ch;
  const sy1 = minY + ((y + 1) / dh) * ch;
  for (let x = 0; x < dw; x++) {
    const sx0 = minX + (x / dw) * cw;
    const sx1 = minX + ((x + 1) / dw) * cw;
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let sy = Math.floor(sy0); sy < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); sy++) {
      for (let sx = Math.floor(sx0); sx < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); sx++) {
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
        const so = (sy * w + sx) * 4;
        const sa = rgba[so + 3] / 255;
        // premultiply so transparent pixels don't drag colour in
        r += rgba[so] * sa; g += rgba[so + 1] * sa; b += rgba[so + 2] * sa;
        a += rgba[so + 3];
        n++;
      }
    }
    if (!n) continue;
    const av = a / n;
    const do_ = ((y + oy) * size + (x + ox)) * 4;
    const am = av / 255;
    out[do_] = am > 0 ? Math.min(255, Math.round(r / n / am)) : 0;
    out[do_ + 1] = am > 0 ? Math.min(255, Math.round(g / n / am)) : 0;
    out[do_ + 2] = am > 0 ? Math.min(255, Math.round(b / n / am)) : 0;
    out[do_ + 3] = Math.round(av);
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePng(size, size, out));
console.log(`✓ ${outPath}  ${size}×${size}  (subject ${cw}×${ch} → ${dw}×${dh})`);
