#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  split-row.mjs — cut a keyed sprite sheet into individual square PNGs.
 *
 *  make-sprite-sheet.mjs is the right tool for anything the engine plays
 *  as an ANIMATION, because the engine wants one image plus a frame
 *  grid. But `CursorArt.image` wants one file PER cursor, so a row of
 *  five icons on one plate has to be cut apart.
 *
 *  Each frame is trimmed to its own content, then letterboxed into a
 *  square canvas — cursors are drawn at a fixed px size, so a square
 *  keeps every icon optically the same weight regardless of its aspect.
 *
 *  Usage:
 *    node scripts/hollow-signal/split-row.mjs \
 *      --in /tmp/cursor-sheet.png --frames 5 --size 128 \
 *      --out public/assets/hollow-signal/cursors \
 *      --names look,take,talk,use,go
 * ------------------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const inPath = arg("in");
const outDir = arg("out");
const frames = Number(arg("frames", 0));
const size = Number(arg("size", 128));
const margin = Number(arg("margin", 0.04));
const names = String(arg("names", "")).split(",").filter(Boolean);
if (!inPath || !outDir || !frames) {
  console.error("usage: node scripts/hollow-signal/split-row.mjs --in <sheet.png> --out <dir> --frames N [--size 128] [--names a,b,c]");
  process.exit(1);
}

/* ---------- minimal PNG codec ---------- */
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
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; colorType = data[9];
      if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
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
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
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
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const { w, h, rgba } = decodePng(readFileSync(inPath));
const fw = Math.floor(w / frames);
mkdirSync(outDir, { recursive: true });

for (let f = 0; f < frames; f++) {
  const x0 = f * fw;
  // trim this frame to its own content
  let minX = fw, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < fw; x++) {
      const a = rgba[((y * w) + x0 + x) * 4 + 3];
      if (a > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) { console.log(`  frame ${f}: empty, skipped`); continue; }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const inner = Math.round(size * (1 - margin * 2));
  const scale = Math.min(inner / cw, inner / ch);
  const dw = Math.max(1, Math.round(cw * scale));
  const dh = Math.max(1, Math.round(ch * scale));
  const ox = Math.round((size - dw) / 2);
  const oy = Math.round((size - dh) / 2);
  const out = new Uint8Array(size * size * 4);

  // box-filter downscale over premultiplied alpha
  for (let y = 0; y < dh; y++) {
    const sy0 = minY + (y / dh) * ch, sy1 = minY + ((y + 1) / dh) * ch;
    for (let x = 0; x < dw; x++) {
      const sx0 = minX + (x / dw) * cw, sx1 = minX + ((x + 1) / dw) * cw;
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = Math.floor(sy0); sy < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); sy++) {
        for (let sx = Math.floor(sx0); sx < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); sx++) {
          if (sx < 0 || sy < 0 || sx >= fw || sy >= h) continue;
          const so = ((sy * w) + x0 + sx) * 4;
          const sa = rgba[so + 3] / 255;
          r += rgba[so] * sa; g += rgba[so + 1] * sa; b += rgba[so + 2] * sa;
          a += rgba[so + 3]; n++;
        }
      }
      if (!n) continue;
      const av = a / n, am = av / 255;
      const d = ((y + oy) * size + (x + ox)) * 4;
      out[d] = am > 0 ? Math.min(255, Math.round(r / n / am)) : 0;
      out[d + 1] = am > 0 ? Math.min(255, Math.round(g / n / am)) : 0;
      out[d + 2] = am > 0 ? Math.min(255, Math.round(b / n / am)) : 0;
      out[d + 3] = Math.round(av);
    }
  }
  const name = names[f] || String(f);
  const file = `${outDir}/${name}.png`;
  writeFileSync(file, encodePng(size, size, out));
  console.log(`✓ ${file}  ${size}×${size}  (from ${cw}×${ch})`);
}
