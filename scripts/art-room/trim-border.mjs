/* ------------------------------------------------------------------ */
/*  trim-border — crop a raw sprite plate down to its keyed backdrop.   */
/*                                                                      */
/*  Image generators asked for "a filmstrip of three frames" sometimes  */
/*  draw the filmstrip: black sprocket bars, KODAK edge printing, the   */
/*  lot. Those borders are opaque, non-key pixels, so the frame cutter  */
/*  sees one giant blob spanning the whole plate and every talking      */
/*  frame comes out identical.                                          */
/*                                                                      */
/*  This finds the largest run of rows/columns where the KEY colour is  */
/*  dominant (the real backdrop) and crops to it, discarding decorative */
/*  borders before the sheet is forged.                                 */
/*                                                                      */
/*    node scripts/art-room/trim-border.mjs in.png out.png             */
/* ------------------------------------------------------------------ */
import fs from "node:fs";
import { decodePng, encodePng, sampleCorners } from "./forge-sheet.mjs";

export function trimToKeyRegion(img, key, share = 0.25) {
  const { width: w, height: h, data } = img;
  // Plain RGB distance here, deliberately NOT the keyer's chroma test: a black
  // sprocket bar projects to near-zero chroma, so a chroma test would call the
  // border "backdrop" and trim nothing. Trimming only needs to recognise the
  // backdrop at roughly full brightness, which straight distance does.
  const isKey = (i) =>
    Math.hypot(data[i] - key.r, data[i + 1] - key.g, data[i + 2] - key.b) <= 110;
  const rowOk = new Array(h), colOk = new Array(w);
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) if (isKey((y * w + x) * 4)) n++;
    rowOk[y] = n >= w * share;
  }
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = 0; y < h; y++) if (isKey((y * w + x) * 4)) n++;
    colOk[x] = n >= h * share;
  }
  // Trim INWARD FROM THE EDGES only, stopping at the first row/column where
  // the backdrop appears. Picking the "longest key-dominant run" instead would
  // happily crop to the empty gap BETWEEN two figures — the border is by
  // definition at the edges, so that is the only place to cut.
  let y0 = 0, y1 = h, x0 = 0, x1 = w;
  while (y0 < y1 && !rowOk[y0]) y0++;
  while (y1 > y0 && !rowOk[y1 - 1]) y1--;
  while (x0 < x1 && !colOk[x0]) x0++;
  while (x1 > x0 && !colOk[x1 - 1]) x1--;
  const nw = Math.max(1, x1 - x0), nh = Math.max(1, y1 - y0);
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++)
    data.copy(out, y * nw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x0 + nw) * 4);
  return { width: nw, height: nh, data: out, cropped: nw !== w || nh !== h };
}

/** The most common colour in the image, on a coarse grid.
 *
 *  sampleCorners() assumes the corners ARE the backdrop. When a generator
 *  draws a decorative film border, the corners are black sprocket bar and the
 *  sampled "key" comes back black — so nothing keys, nothing trims, and every
 *  frame merges. For a sprite plate the backdrop is by far the largest flat
 *  area, so the modal colour finds it whatever is drawn around the edge. */
export function dominantColor(img) {
  const { width: w, height: h, data } = img;
  const bins = new Map();
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      const k = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
      let b = bins.get(k);
      if (!b) bins.set(k, (b = { n: 0, r: 0, g: 0, b: 0 }));
      b.n++; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2];
    }
  }
  let best = null;
  for (const b of bins.values()) if (!best || b.n > best.n) best = b;
  return best ? { r: best.r / best.n, g: best.g / best.n, b: best.b / best.n } : { r: 255, g: 0, b: 255 };
}

if (process.argv[1] && process.argv[1].endsWith("trim-border.mjs")) {
  const [, , inPath, outPath] = process.argv;
  const src = decodePng(fs.readFileSync(inPath));
  // Prefer the corners (correct for a clean plate); fall back to the modal
  // colour when the corners disagree with the bulk of the image.
  const corner = sampleCorners(src.data, src.width, src.height);
  const modal = dominantColor(src);
  const far = Math.hypot(corner.r - modal.r, corner.g - modal.g, corner.b - modal.b) > 90;
  const key = far ? modal : corner;
  if (far) console.log(`· corners disagree with the plate — keying on the dominant colour rgb(${modal.r.toFixed(0)},${modal.g.toFixed(0)},${modal.b.toFixed(0)})`);
  const t = trimToKeyRegion(src, key);
  fs.writeFileSync(outPath, encodePng(t));
  console.log(
    t.cropped
      ? `✓ trimmed ${src.width}x${src.height} → ${t.width}x${t.height}`
      : `· no border found (${src.width}x${src.height} unchanged)`
  );
}
