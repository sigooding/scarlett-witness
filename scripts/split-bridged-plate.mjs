#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  split-bridged-plate.mjs — salvage a talk plate whose figures the  *
 *  gap-finder can't separate.                                        *
 *                                                                     *
 *  make-sprite-sheet.mjs keys the magenta backdrop and then splits   *
 *  frames at fully-transparent column gaps. When two figures are     *
 *  joined by even a thin sliver of pixels (a glow, an arm crossing   *
 *  the gap, a soft shadow), that finder sees ONE huge frame and      *
 *  --frames just keeps the N widest runs.                            *
 *                                                                     *
 *  This companion takes EXPLICIT split columns instead:              *
 *                                                                     *
 *    node scripts/split-bridged-plate.mjs \                          *
 *      --in plates/plate.png --out public/assets/sprites/x.png \     *
 *      --cols 24,398,430,884,884,1365 [--height 384]                 *
 *                                                                     *
 *  (--cols is x0,x1 pairs per frame, the cut column shared by both   *
 *  sides). It also despeckles: 4-connected components smaller than   *
 *  --minpx (default 3000 source px) are dropped, so the bridge       *
 *  sliver disappears when it belongs to neither figure.              *
 *                                                                     *
 *  Find the split columns first with the probe baked in: run with    *
 *  --probe to print, for every merged run, the columns whose keyed   *
 *  occupancy is lowest — the argmin column is the waist to cut at.   *
 * ------------------------------------------------------------------ */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const inPath = arg("in");
const outPath = arg("out");
const colsArg = arg("cols", "");
const height = Number(arg("height", 384));
const minPx = Number(arg("minpx", 3000));
const tol = Number(arg("tolerance", 90));
const soft = Number(arg("softness", 12));
const key = arg("key", "ff00ff");
if (!inPath || (argv.includes("--probe") ? false : (!outPath || !colsArg))) {
  console.error("usage: split-bridged-plate.mjs --in plate.png [--probe | --out sheet.png --cols a,b,c,d,e,f] [--height 384] [--minpx 3000]");
  process.exit(1);
}

/* ---------- PNG codec (same as make-sprite-sheet.mjs) ---------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG file");
  let off = 8, w = 0, h = 0, ch = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      if (data[8] !== 8) throw new Error(`unsupported bit depth ${data[8]}`);
      ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[data[9]];
      if (!ch) throw new Error(`unsupported colour type ${data[9]}`);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const px = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[i] = v & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0, p = 0; i < w * h; i++, p += ch) {
    const o = i * 4;
    if (ch >= 3) {
      rgba[o] = px[p]; rgba[o + 1] = px[p + 1]; rgba[o + 2] = px[p + 2];
      rgba[o + 3] = ch === 4 ? px[p + 3] : 255;
    } else {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = px[p];
      rgba[o + 3] = ch === 2 ? px[p + 1] : 255;
    }
  }
  return { w, h, rgba };
}
let CT = null;
function crc32(buf) {
  if (!CT) {
    CT = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CT[n] = c; }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CT[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}
function encodePng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
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
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- key ---------- */
const k = {
  r: parseInt(key.slice(0, 2), 16) || 0,
  g: parseInt(key.slice(2, 4), 16) || 0,
  b: parseInt(key.slice(4, 6), 16) || 0,
};
const plate = decodePng(readFileSync(inPath));
const { w, h, rgba } = plate;
for (let i = 0; i < rgba.length; i += 4) {
  const dr = rgba[i] - k.r, dg = rgba[i + 1] - k.g, db = rgba[i + 2] - k.b;
  const d = Math.sqrt(dr * dr + dg * dg + db * db);
  if (d <= tol) rgba[i + 3] = 0;
  else if (d <= tol + soft) rgba[i + 3] = Math.round(rgba[i + 3] * ((d - tol) / soft));
}

/* ---------- probe: merged runs + their lowest-occupancy columns ---------- */
if (argv.includes("--probe")) {
  const occ = new Int32Array(w);
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (rgba[(y * w + x) * 4 + 3] > 16) occ[x]++;
  const runs = [];
  let s = -1;
  for (let x = 0; x <= w; x++) {
    const on = x < w && occ[x] > 0;
    if (on && s < 0) s = x;
    if (!on && s >= 0) { runs.push([s, x - 1]); s = -1; }
  }
  const widths = runs.map(([a, b]) => b - a).sort((p, q) => p - q);
  const median = widths[Math.floor(widths.length / 2)] || 0;
  console.log(`plate ${w}×${h}, runs: ${JSON.stringify(runs)} (median width ${median})`);
  for (const [a, b] of runs) {
    if (b - a <= median * 1.6) continue;
    let max = 0;
    for (let x = a; x <= b; x++) max = Math.max(max, occ[x]);
    let best = -1, bestV = 1e9;
    const lows = [];
    for (let x = a + 20; x < b - 20; x++) {
      if (occ[x] < bestV) { bestV = occ[x]; best = x; }
      if (occ[x] < max * 0.15) lows.push(x);
    }
    console.log(`  merged run ${a}–${b}: argmin column ${best} (occupancy ${bestV}, run max ${max}) — cut there`);
  }
  process.exit(0);
}

/* ---------- explicit ranges ---------- */
const nums = colsArg.split(",").map((n) => Number(n));
const ranges = [];
for (let i = 0; i + 1 < nums.length; i += 2) ranges.push([nums[i], nums[i + 1]]);

/* despeckle inside each range: drop tiny connected components */
for (const [x0, x1] of ranges) {
  const seen = new Uint8Array(w * h);
  for (let y0 = 0; y0 < h; y0++) for (let x0b = x0; x0b < x1; x0b++) {
    const start = y0 * w + x0b;
    if (seen[start] || rgba[start * 4 + 3] <= 16) continue;
    const stack = [start];
    seen[start] = 1;
    const comp = [start];
    while (stack.length) {
      const c = stack.pop();
      const cx = c % w, cy = (c - cx) / w;
      for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
        if (nx < x0 || nx >= x1 || ny < 0 || ny >= h) continue;
        const n = ny * w + nx;
        if (seen[n] || rgba[n * 4 + 3] <= 16) continue;
        seen[n] = 1;
        stack.push(n);
        comp.push(n);
      }
    }
    if (comp.length < minPx) for (const c of comp) rgba[c * 4 + 3] = 0;
  }
}

/* ---------- crop / scale / bottom-align onto the grid ---------- */
const bounds = ranges.map(([x0, x1]) => {
  let minY = h, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = x0; x < x1; x++) {
    if (rgba[(y * w + x) * 4 + 3] > 8) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return { top: minY, bottom: maxY };
});
const frames = ranges.map(([x0, x1], i) => ({
  x0, x1, top: bounds[i].top, bottom: bounds[i].bottom,
  scale: height / (bounds[i].bottom - bounds[i].top + 1),
}));
const cellW = Math.max(...frames.map((f) => Math.round((f.x1 - f.x0) * f.scale)));
const sheetW = cellW * frames.length;
const sheet = new Uint8Array(sheetW * height * 4);
frames.forEach((f, fi) => {
  const outW = Math.round((f.x1 - f.x0) * f.scale);
  const offX = fi * cellW + Math.floor((cellW - outW) / 2);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(f.bottom, f.top + Math.floor(y / f.scale));
    for (let x = 0; x < outW; x++) {
      const sx = Math.min(f.x1 - 1, f.x0 + Math.floor(x / f.scale));
      const s = (sy * w + sx) * 4;
      const d = (y * sheetW + offX + x) * 4;
      sheet[d] = rgba[s]; sheet[d + 1] = rgba[s + 1]; sheet[d + 2] = rgba[s + 2]; sheet[d + 3] = rgba[s + 3];
    }
  }
});
writeFileSync(outPath, encodePng(sheetW, height, sheet));
console.log(`✓ ${outPath}  ${frames.length} frame(s)  frameWidth: ${cellW}, frameHeight: ${height}  (sheet ${sheetW}×${height})`);
