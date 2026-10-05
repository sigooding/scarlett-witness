/* ------------------------------------------------------------------ */
/*  Headless sprite-sheet forge — builds the Art Room demo's assets.    */
/*                                                                      */
/*  A faithful Node port of src/studio/spriteForge.ts (applyKey,        */
/*  sampleCorners, frameRuns, contentBounds + the uniform bottom-       */
/*  aligned grid), so the sheet shipped with the demo is cut by the     */
/*  SAME algorithm the in-app editor runs. Pure zlib PNG codec — no     */
/*  native deps.                                                        */
/* ------------------------------------------------------------------ */
import fs from "node:fs";
import zlib from "node:zlib";

/* ---------- PNG decode (8-bit, colour types 2/6, non-interlaced) ---- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("interlaced PNG unsupported");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} unsupported`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`colour type ${colorType} unsupported`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(w * h * 4);
  const prev = Buffer.alloc(stride);
  const line = Buffer.alloc(stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    raw.copy(line, 0, rp, rp + stride);
    rp += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = v & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const s = x * channels, d = (y * w + x) * 4;
      out[d] = line[s];
      out[d + 1] = line[s + 1];
      out[d + 2] = line[s + 2];
      out[d + 3] = channels === 4 ? line[s + 3] : 255;
    }
    line.copy(prev);
  }
  return { width: w, height: h, data: out };
}

/* ---------- PNG encode (RGBA, filter 0) ----------------------------- */
function encodePng({ width, height, data }) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (type, body) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(body.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), body]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
let CRC_T = null;
function crc32(buf) {
  if (!CRC_T) {
    CRC_T = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_T[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

/* ---------- forge algorithm (ported 1:1 from spriteForge.ts) -------- */
function sampleCorners(data, w, h) {
  const patch = (cx, cy) => {
    const rs = [], gs = [], bs = [];
    for (let dy = 0; dy < 5; dy++)
      for (let dx = 0; dx < 5; dx++) {
        const x = Math.min(w - 1, Math.max(0, cx + (cx === 0 ? dx : -dx)));
        const y = Math.min(h - 1, Math.max(0, cy + (cy === 0 ? dy : -dy)));
        const i = (y * w + x) * 4;
        rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
      }
    const mid = (a) => a.sort((p, q) => p - q)[a.length >> 1];
    return { r: mid(rs), g: mid(gs), b: mid(bs) };
  };
  const corners = [patch(0, 0), patch(w - 1, 0), patch(0, h - 1), patch(w - 1, h - 1)];
  let best = [corners[0]];
  for (const c of corners) {
    const g = corners.filter((o) => Math.hypot(o.r - c.r, o.g - c.g, o.b - c.b) <= 40);
    if (g.length > best.length) best = g;
  }
  const n = best.length;
  return {
    r: best.reduce((s, c) => s + c.r, 0) / n,
    g: best.reduce((s, c) => s + c.g, 0) / n,
    b: best.reduce((s, c) => s + c.b, 0) / n,
  };
}

/** CHROMA key — kept in lockstep with src/studio/spriteForge.ts applyKey().
 *  Raw RGB distance cannot separate a SHADOWED backdrop from a dark subject
 *  (measured: shadowed magenta 308 from the key, a dark coat 340), which merged
 *  every talking frame into one blob. Projecting onto the key's colour line
 *  keys any BRIGHTNESS of the key hue while keeping dark non-key pixels. */
function applyKey(img, key, tolerance, softness) {
  const d = Buffer.from(img.data);
  const soft = Math.max(1, softness);
  const keyLen = Math.hypot(key.r, key.g, key.b) || 1;
  const ur = key.r / keyLen, ug = key.g / keyLen, ub = key.b / keyLen;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const scale = r * ur + g * ug + b * ub;
    const chroma = Math.hypot(r - ur * scale, g - ug * scale, b - ub * scale);
    const overshoot = Math.max(0, scale - keyLen);
    let dist = Math.hypot(chroma, overshoot);
    // Relative chroma guard — mirrors spriteForge.ts. Absolute chroma collapses
    // near black, so without this the keyer erases dark costume along with the
    // shadowed backdrop.
    const mag = Math.hypot(r, g, b);
    if (mag > 0 && chroma / mag > 0.42) dist = Infinity;
    if (dist <= tolerance) d[i + 3] = 0;
    else if (dist <= tolerance + soft) {
      const a = (dist - tolerance) / soft;
      d[i + 3] = Math.round(d[i + 3] * a);
    }
  }
  return { width: img.width, height: img.height, data: d };
}

function frameRuns(img) {
  const { width: w, height: h, data } = img;
  // Column occupancy by DENSITY — one stray speck used to bridge the gaps
  // between figures and merge every frame into one. Mirrors spriteForge.ts.
  const minRun = Math.max(2, Math.round(h * 0.02));
  const occupied = new Array(w).fill(false);
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = 0; y < h; y++)
      if (data[(y * w + x) * 4 + 3] > 8 && ++n >= minRun) { occupied[x] = true; break; }
  }
  const raw = [];
  let start = null;
  for (let x = 0; x < w; x++) {
    if (occupied[x] && start === null) start = x;
    if (!occupied[x] && start !== null) { raw.push([start, x]); start = null; }
  }
  if (start !== null) raw.push([start, w]);
  const gap = Math.max(8, Math.round(w * 0.01));
  const merged = [];
  for (const r of raw) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] < gap) last[1] = r[1];
    else merged.push([r[0], r[1]]);
  }
  return merged.filter(([a, b]) => b - a >= w * 0.02);
}

function contentBounds(img, x0, x1) {
  const { width: w, height: h, data } = img;
  let minX = x1, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++)
    for (let x = x0; x < x1; x++)
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Box-sample scale of a sub-rect into a target size (good downscale quality). */
function drawScaled(src, sx, sy, sw, sh, dst, dx, dy, dw, dh) {
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const gx0 = sx + (x * sw) / dw, gx1 = sx + ((x + 1) * sw) / dw;
      const gy0 = sy + (y * sh) / dh, gy1 = sy + ((y + 1) * sh) / dh;
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = Math.floor(gy0); yy < Math.max(Math.floor(gy0) + 1, Math.ceil(gy1)); yy++)
        for (let xx = Math.floor(gx0); xx < Math.max(Math.floor(gx0) + 1, Math.ceil(gx1)); xx++) {
          if (xx < 0 || yy < 0 || xx >= src.width || yy >= src.height) continue;
          const i = (yy * src.width + xx) * 4;
          const al = src.data[i + 3] / 255;
          r += src.data[i] * al; g += src.data[i + 1] * al; b += src.data[i + 2] * al;
          a += src.data[i + 3]; n++;
        }
      if (!n) continue;
      const di = ((dy + y) * dst.width + (dx + x)) * 4;
      const aa = a / n;
      const norm = aa > 0 ? (a / 255) : 1;
      dst.data[di] = Math.round(r / norm);
      dst.data[di + 1] = Math.round(g / norm);
      dst.data[di + 2] = Math.round(b / norm);
      dst.data[di + 3] = Math.round(aa);
    }
  }
}

export { decodePng, encodePng, sampleCorners, applyKey, frameRuns, contentBounds, drawScaled };

/* ---------- run ----------------------------------------------------- */
if (process.argv[1] && process.argv[1].endsWith('forge-sheet.mjs')) {
const [, , inPath, outPath, targetHArg] = process.argv;
const src = decodePng(fs.readFileSync(inPath));
const key = sampleCorners(src.data, src.width, src.height);
console.log(`source ${src.width}x${src.height} · key rgb(${key.r.toFixed(0)},${key.g.toFixed(0)},${key.b.toFixed(0)})`);

const keyed = applyKey(src, key, 90, 45);
let cleared = 0, total = 0;
for (let i = 3; i < src.data.length; i += 4) { if (src.data[i] > 8) { total++; if (keyed.data[i] <= 8) cleared++; } }
console.log(`removed ${((cleared / total) * 100).toFixed(1)}% of the plate`);

const runs = frameRuns(keyed);
console.log(`detected ${runs.length} frames:`, runs.map(([a, b]) => `${a}-${b}`).join(" "));

const crops = [];
for (const [x0, x1] of runs) { const b = contentBounds(keyed, x0, x1); if (b) crops.push(b); }
const targetH = Number(targetHArg) || 512;
const scaleOf = (c) => targetH / c.h;
const widths = crops.map((c) => Math.max(1, Math.round(c.w * scaleOf(c))));
const fw = Math.max(...widths);
const sheet = { width: fw * crops.length, height: targetH, data: Buffer.alloc(fw * crops.length * targetH * 4) };
crops.forEach((c, i) => {
  const w = widths[i];
  drawScaled(keyed, c.x, c.y, c.w, c.h, sheet, i * fw + Math.round((fw - w) / 2), 0, w, targetH);
});
fs.writeFileSync(outPath, encodePng(sheet));
console.log(`✓ ${outPath} — ${crops.length} frames, ${fw}x${targetH} each (sheet ${sheet.width}x${sheet.height})`);
}
