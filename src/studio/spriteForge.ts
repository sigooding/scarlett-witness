/* ------------------------------------------------------------------ */
/*  spriteForge — shared pixel tools for sprite creation.              */
/*                                                                     */
/*  Pure canvas/ImageData helpers used by the ✂ Sprite Cutout Lab and  */
/*  the AI tab's one-click "auto sprite sheet" flow:                   */
/*    generate art on flat magenta → key the backdrop out → find the   */
/*    frames by the transparent gaps between them → crop, scale and    */
/*    bottom-align every frame to one uniform grid → emit the sheet    */
/*    PNG plus ready-made animations for its intended use.             */
/* ------------------------------------------------------------------ */

export type Rgb = { r: number; g: number; b: number };

export function parseHex(hex: string): Rgb {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export function toHex(c: Rgb): string {
  const p = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${p(c.r)}${p(c.g)}${p(c.b)}`;
}

/** Sample the four corners and return the colour the MAJORITY of them agree on.
 *
 *  Previously this averaged all four corners. That silently produced a colour
 *  present nowhere in the image whenever one corner differed — a figure whose
 *  shoulder reaches a corner, or a vignetted render — and the resulting key
 *  removed nothing. Now each corner is read from a small 5×5 median patch (so a
 *  single noisy pixel can't decide the key), corners are grouped by similarity,
 *  and the biggest group's mean wins. */
export function sampleCorners(data: Uint8ClampedArray, w: number, h: number): Rgb {
  if (w <= 0 || h <= 0) return { r: 255, g: 255, b: 255 };
  /** Median colour of a small patch anchored at a corner — noise-proof. */
  const patch = (cx: number, cy: number): Rgb => {
    const rs: number[] = [], gs: number[] = [], bs: number[] = [];
    for (let dy = 0; dy < 5; dy++) {
      for (let dx = 0; dx < 5; dx++) {
        const x = Math.min(w - 1, Math.max(0, cx + (cx === 0 ? dx : -dx)));
        const y = Math.min(h - 1, Math.max(0, cy + (cy === 0 ? dy : -dy)));
        const i = (y * w + x) * 4;
        rs.push(data[i]);
        gs.push(data[i + 1]);
        bs.push(data[i + 2]);
      }
    }
    const mid = (a: number[]) => a.sort((p, q) => p - q)[a.length >> 1];
    return { r: mid(rs), g: mid(gs), b: mid(bs) };
  };
  const corners = [patch(0, 0), patch(w - 1, 0), patch(0, h - 1), patch(w - 1, h - 1)];
  // Group corners that agree within a modest colour distance; largest wins.
  const TOL = 40;
  let best: Rgb[] = [corners[0]];
  for (const c of corners) {
    const group = corners.filter(
      (o) => Math.hypot(o.r - c.r, o.g - c.g, o.b - c.b) <= TOL
    );
    if (group.length > best.length) best = group;
  }
  const n = best.length;
  return {
    r: best.reduce((s, c) => s + c.r, 0) / n,
    g: best.reduce((s, c) => s + c.g, 0) / n,
    b: best.reduce((s, c) => s + c.b, 0) / n,
  };
}

/** Chroma-key `src` against `key`: fully transparent within `tolerance`
 * colour distance, feathered alpha across the `softness` band beyond it.
 * Also de-spills the key hue from semi-transparent edge pixels. */
export function applyKey(src: ImageData, key: Rgb, tolerance: number, softness: number, mode: "chroma" | "flat" = "chroma"): ImageData {
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  const d = out.data;
  const soft = Math.max(1, softness);
  // CHROMA distance, not raw RGB distance.
  //
  // Plain Euclidean distance to the key cannot separate a SHADOWED backdrop
  // from a dark subject, and image generators habitually paint soft shadows
  // onto the "flat" magenta they were told to leave alone. Measured on a real
  // failing sheet: a shadowed backdrop pixel (37,7,21) sat 308 from the key
  // while the subject's dark coat sat 340 — no tolerance exists that removes
  // the first without eating the second. The backdrop survived between the
  // figures, the frame detector saw one continuous blob instead of three, and
  // the talking animation died with every frame identical.
  //
  // Projecting the pixel onto the key's colour line splits brightness from
  // hue: `scale` is how far along the key direction the pixel lies (any
  // brightness of the key colour), and the residual is how far off that line
  // it sits (how UNLIKE the key colour it is). Keying on the residual means a
  // shadowed backdrop keys out at any brightness, while a dark coat — dark but
  // nowhere near magenta — is kept. Same measurement: residual 12 vs 300.
  const keyLen = Math.sqrt(key.r * key.r + key.g * key.g + key.b * key.b) || 1;
  const ur = key.r / keyLen, ug = key.g / keyLen, ub = key.b / keyLen;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    // Distance from the key's colour line (0 = exactly the key hue).
    const scale = r * ur + g * ug + b * ub;
    const rr = r - ur * scale, rg = g - ug * scale, rb = b - ub * scale;
    const chroma = Math.sqrt(rr * rr + rg * rg + rb * rb);
    // A pixel BRIGHTER than the key is never backdrop (the key is the
    // brightest the backdrop gets), so only clamp the darker side.
    const overshoot = Math.max(0, scale - keyLen);
    let dist = Math.sqrt(chroma * chroma + overshoot * overshoot);
    // RELATIVE chroma guard. Absolute chroma collapses near black — an almost
    // black pixel sits close to EVERY colour line — so a dark coat (7,10,6)
    // measures chroma 10, inside the same tolerance that clears shadowed
    // backdrop, and keying on chroma alone erases dark costume (measured: 98.7%
    // of a plate removed, the figure gone with it). Asking instead what
    // FRACTION of the pixel lies off the key hue is scale-free and separates
    // them cleanly on the plate that exposed this:
    //   backdrop  bright 0.00 · mid 0.05 · shadowed 0.30
    //   subject   navy 0.56 · near-black cloth 0.56 · hair 0.64 · coat 0.73
    // Above the cut is never backdrop, however dark the pixel is.
    const mag = Math.sqrt(r * r + g * g + b * b);
    if (mag > 0 && chroma / mag > 0.42) dist = Infinity;
    // Opt-in for genuinely flat, unshadowed plates: ordinary RGB distance
    // retains near-black brown props that resemble shadowed magenta in hue.
    // The default chroma projection is still needed for shadowed backdrops.
    if (mode === "flat") dist = Math.hypot(r - key.r, g - key.g, b - key.b);
    if (dist <= tolerance) {
      d[i + 3] = 0;
    } else if (dist <= tolerance + soft) {
      const a = (dist - tolerance) / soft; // 0..1 across the feather band
      d[i + 3] = Math.round(d[i + 3] * a);
      d[i] = Math.round(d[i] + (d[i] - key.r) * 0.25 * (1 - a));
      d[i + 1] = Math.round(d[i + 1] + (d[i + 1] - key.g) * 0.25 * (1 - a));
      d[i + 2] = Math.round(d[i + 2] + (d[i + 2] - key.b) * 0.25 * (1 - a));
    }
  }
  return out;
}

/** Optional edge-only colour-spill suppression after keying. A magenta-lit
 * rim on pale hair can be fully opaque, beyond the alpha feather band. Only
 * pixels within three pixels of transparency are adjusted; interior costume,
 * alpha, and colours unrelated to the chroma key remain untouched. */
export function despillEdges(data: Uint8ClampedArray, width: number, height: number, key: Rgb): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data), channels = [key.r, key.g, key.b];
  const max = Math.max(...channels), min = Math.min(...channels);
  if (max - min < 60) return out; // neutral/white keys have no colour spill
  const dominant = [0, 1, 2].filter(c => channels[c] >= max - 40);
  const others = [0, 1, 2].filter(c => !dominant.includes(c));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4;
    if (data[p + 3] < 8) continue;
    const reference = others.reduce((n, c) => n + data[p + c], 0) / others.length;
    const excess = Math.min(...dominant.map(c => data[p + c])) - reference - 12;
    if (excess <= 0) continue;
    let edge = data[p + 3] < 230;
    for (let dy = -3; dy <= 3 && !edge; dy++) for (let dx = -3; dx <= 3 && !edge; dx++) {
      const xx = x + dx, yy = y + dy;
      edge = xx < 0 || yy < 0 || xx >= width || yy >= height || data[(yy * width + xx) * 4 + 3] < 32;
    }
    if (edge) for (const c of dominant) out[p + c] = Math.max(0, data[p + c] - excess);
  }
  return out;
}

/** DOMINANT colour along the four edges — the auto key for photos and AI art.
 *
 *  This used to return the MEAN of every border pixel, which is wrong whenever
 *  the border isn't one flat colour: average a blue sky with a brown floor and
 *  you get a muddy grey that exists NOWHERE in the picture, so the key removes
 *  nothing and the tool looks broken. Averaging is also dragged badly off-target
 *  by a subject that touches the frame edge.
 *
 *  Instead the border pixels are bucketed into a coarse 16-step-per-channel
 *  colour cube, the heaviest bucket wins, and the returned colour is the mean of
 *  only the pixels IN that bucket — i.e. the true, most common backdrop colour,
 *  reported precisely. */
export function sampleEdgeDominant(data: Uint8ClampedArray, w: number, h: number): Rgb {
  if (w <= 0 || h <= 0) return { r: 255, g: 255, b: 255 };
  const STEP = 16; // bucket size per channel → 16×16×16 cube
  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 8) return; // ignore already-transparent border pixels
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const keyId = ((r / STEP) | 0) * 65536 + ((g / STEP) | 0) * 256 + ((b / STEP) | 0);
    const cell = buckets.get(keyId);
    if (cell) {
      cell.r += r;
      cell.g += g;
      cell.b += b;
      cell.n++;
    } else buckets.set(keyId, { r, g, b, n: 1 });
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    if (h > 1) add(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    add(0, y);
    if (w > 1) add(w - 1, y);
  }
  let best: { r: number; g: number; b: number; n: number } | null = null;
  for (const cell of buckets.values()) if (!best || cell.n > best.n) best = cell;
  if (!best) return { r: 255, g: 255, b: 255 };
  return { r: best.r / best.n, g: best.g / best.n, b: best.b / best.n };
}

/** Back-compat alias — every caller wants the dominant edge colour, not the
 *  mean. Kept so existing imports keep working. */
export const sampleEdges = sampleEdgeDominant;

/** Magic-wand key — the tool for "just remove the background of this photo".
 *
 *  `applyKey` keys EVERY pixel near the colour, so a white shirt vanishes with
 *  a white studio backdrop. This floods inward from the image border instead:
 *  only pixels *connected* to the edge survive as background, so anything the
 *  subject encloses (eyes, lettering, a pale jacket against a pale wall) is
 *  kept. Feathering works exactly like `applyKey`. */
export function applyEdgeFloodKey(src: ImageData, key: Rgb, tolerance: number, softness: number): ImageData {
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  const { data: d, width: w, height: h } = out;
  const soft = Math.max(1, softness);
  const cut = tolerance + soft;
  const hit = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const near = (i: number): boolean => {
    const p = i * 4;
    const dr = d[p] - key.r;
    const dg = d[p + 1] - key.g;
    const db = d[p + 2] - key.b;
    return dr * dr + dg * dg + db * db <= cut * cut;
  };

  // Seed the flood with every border pixel that matches the backdrop.
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = y * w + x;
      if (!hit[i] && near(i)) {
        hit[i] = 1;
        queue[tail++] = i;
      }
    }
  }
  for (let y = 1; y < h - 1; y++) {
    for (const x of [0, w - 1]) {
      const i = y * w + x;
      if (!hit[i] && near(i)) {
        hit[i] = 1;
        queue[tail++] = i;
      }
    }
  }

  // 4-way BFS — the classic flood fill, iterative so big images don't recurse.
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) {
      const n = i - 1;
      if (!hit[n] && near(n)) {
        hit[n] = 1;
        queue[tail++] = n;
      }
    }
    if (x < w - 1) {
      const n = i + 1;
      if (!hit[n] && near(n)) {
        hit[n] = 1;
        queue[tail++] = n;
      }
    }
    if (y > 0) {
      const n = i - w;
      if (!hit[n] && near(n)) {
        hit[n] = 1;
        queue[tail++] = n;
      }
    }
    if (y < h - 1) {
      const n = i + w;
      if (!hit[n] && near(n)) {
        hit[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  // Feather only the pixels the flood actually claimed.
  for (let i = 0; i < w * h; i++) {
    if (!hit[i]) continue;
    const p = i * 4;
    const dr = d[p] - key.r;
    const dg = d[p + 1] - key.g;
    const db = d[p + 2] - key.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= tolerance) {
      d[p + 3] = 0;
    } else {
      const a = Math.min(1, (dist - tolerance) / soft); // 0..1 across the band
      d[p + 3] = Math.round(d[p + 3] * a);
      d[p] = Math.round(d[p] + (d[p] - key.r) * 0.25 * (1 - a));
      d[p + 1] = Math.round(d[p + 1] + (d[p + 1] - key.g) * 0.25 * (1 - a));
      d[p + 2] = Math.round(d[p + 2] + (d[p + 2] - key.b) * 0.25 * (1 - a));
    }
  }
  return out;
}

/** Drop isolated opaque specks — the salt-and-pepper a key leaves in a busy
 *  backdrop. One pass: an opaque pixel with fewer than `minNeighbours` opaque
 *  neighbours out of 8 is treated as noise. Cheap enough to run on every
 *  preview render, unlike a full connected-component sweep. */
export function despeckle(src: ImageData, minNeighbours = 3): ImageData {
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  const { data: d, width: w, height: h } = out;
  const opaque = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3] > 32 ? 1 : 0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      if (d[p + 3] <= 32) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += opaque(x + dx, y + dy);
      if (n < minNeighbours) d[p + 3] = 0;
    }
  }
  return out;
}

/** How much of the image a key actually removed, plus how flat the backdrop is.
 *  Drives the honest "why didn't this work?" readout in the Background Remover:
 *  0% removed means the key colour is wrong (or tolerance too low), ~100% means
 *  it ate the subject, and a high `edgeSpread` means the backdrop simply isn't
 *  one flat colour, so no single key can ever cut it cleanly. */
export function keyStats(
  original: ImageData,
  keyed: ImageData,
  key: Rgb
): { removedPct: number; edgeSpread: number; keyIsNearEdge: boolean } {
  const a = original.data;
  const b = keyed.data;
  let wasOpaque = 0;
  let nowClear = 0;
  for (let i = 3; i < a.length; i += 4) {
    if (a[i] > 8) {
      wasOpaque++;
      if (b[i] <= 8) nowClear++;
    }
  }
  // Mean distance of border pixels from the chosen key — the "flatness" score.
  const { width: w, height: h } = original;
  let sum = 0;
  let n = 0;
  const acc = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    sum += Math.hypot(a[i] - key.r, a[i + 1] - key.g, a[i + 2] - key.b);
    n++;
  };
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 256))) {
    acc(x, 0);
    if (h > 1) acc(x, h - 1);
  }
  for (let y = 1; y < h - 1; y += Math.max(1, Math.floor(h / 256))) {
    acc(0, y);
    if (w > 1) acc(w - 1, y);
  }
  const edgeSpread = n ? sum / n : 0;
  return {
    removedPct: wasOpaque ? (nowClear / wasOpaque) * 100 : 0,
    edgeSpread,
    keyIsNearEdge: edgeSpread < 40,
  };
}

/** Bounding box of non-transparent pixels (with a small margin). */
export function contentBounds(img: ImageData): { x: number; y: number; w: number; h: number } | null {
  const { width: w, height: h, data } = img;
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const m = 2;
  return {
    x: Math.max(0, minX - m),
    y: Math.max(0, minY - m),
    w: Math.min(w - 1, maxX + m) - Math.max(0, minX - m) + 1,
    h: Math.min(h - 1, maxY + m) - Math.max(0, minY - m) + 1,
  };
}

/* ------------------------------------------------------------------ */
/*  One-click sheet assembly.                                          */
/* ------------------------------------------------------------------ */

/** What the sheet is FOR — decides the frame height and which named
 * animations get written, matching the engine's conventions:
 * talking portraits use talk+rest, walkers walk+idle, extras loop. */
export type ForgeKind = "talking" | "walk" | "loop" | "single";

export interface ForgedSheet {
  /** the finished transparent sheet PNG */
  dataUrl: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  animations: Record<string, { frames: number[]; fps?: number }>;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image failed to load"));
    img.src = url;
  });
}

/** Column ranges of non-transparent content, merging gaps smaller than
 * ~1% of the image width so brush noise doesn't split a frame in two.
 * Exported so the auto-build preview can show the detected runs live. */
export function frameRuns(img: ImageData): Array<[number, number]> {
  const { width: w, height: h, data } = img;
  // A column counts as occupied by DENSITY, not by a single surviving pixel.
  //
  // The old test broke out of the loop on the first pixel with alpha > 8, so
  // one stray speck — antialiasing crumbs, a shadow the generator painted onto
  // the backdrop, JPEG ringing — marked the whole column as subject. On a real
  // three-pose talking sheet that bridged the gaps between the figures, so the
  // cutter returned ONE run spanning the entire plate: a single frame, and a
  // talking animation whose every frame was identical.
  //
  // Requiring a small fraction of the column's height ignores specks while
  // staying far below the ~15% a genuine figure edge occupies.
  const minRun = Math.max(2, Math.round(h * 0.02));
  const occupied: boolean[] = new Array(w).fill(false);
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3] > 8 && ++n >= minRun) {
        occupied[x] = true;
        break;
      }
    }
  }
  const raw: Array<[number, number]> = [];
  let start: number | null = null;
  for (let x = 0; x < w; x++) {
    if (occupied[x] && start === null) start = x;
    if (!occupied[x] && start !== null) {
      raw.push([start, x]);
      start = null;
    }
  }
  if (start !== null) raw.push([start, w]);
  const gap = Math.max(8, Math.round(w * 0.01));
  const merged: Array<[number, number]> = [];
  for (const r of raw) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] < gap) last[1] = r[1];
    else merged.push([r[0], r[1]]);
  }
  // Drop slivers (stray specks the key missed) under 2% of the width.
  return merged.filter(([a, b]) => b - a >= w * 0.02);
}

/** Connected-silhouette slicing for pose sheets whose feet/props overlap in
 * x but do NOT touch in two dimensions. Each returned crop contains only its
 * assigned pixels, not a rectangular slice of the neighbouring actor. Small
 * detached details (e.g. a cane) join the nearest body; isolated border noise
 * is discarded. Inspect the preview: connected/occluded actors cannot be
 * reconstructed by this tool. Pure pixel math, no canvas or DOM required. */
export function spriteIslands(img: Pick<ImageData, "width" | "height" | "data">, expected?: number): Array<{ x: number; y: number; w: number; h: number; data: Uint8ClampedArray<ArrayBuffer> }> {
  const { width: w, height: h, data } = img;
  if (w < 1 || h < 1 || w * h > 16_777_216 || (expected !== undefined && (!Number.isInteger(expected) || expected < 1 || expected > 64))) return [];
  type Component = { id: number; count: number; x0: number; x1: number; y0: number; y1: number; cx: number };
  const labels = new Int32Array(w * h), queue = new Int32Array(w * h);
  const components: Component[] = [];
  for (let p = 0; p < w * h; p++) {
    if (labels[p] || data[p * 4 + 3] <= 8) continue;
    const id = components.length + 1;
    const c: Component = { id, count: 0, x0: w, x1: 0, y0: h, y1: 0, cx: 0 };
    let read = 0, write = 1; queue[0] = p; labels[p] = id;
    while (read < write) {
      const at = queue[read++], x = at % w, y = Math.floor(at / w);
      c.count++; c.cx += x; c.x0 = Math.min(c.x0, x); c.x1 = Math.max(c.x1, x); c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const next = ny * w + nx;
        if (!labels[next] && data[next * 4 + 3] > 8) { labels[next] = id; queue[write++] = next; }
      }
    }
    c.cx /= c.count; components.push(c);
  }
  components.sort((a, b) => b.count - a.count);
  const largest = components[0]?.count ?? 0;
  const bodies = expected === undefined
    ? components.filter(c => c.count >= Math.max(2, largest * .15))
    : components.slice(0, expected).filter(c => c.count >= Math.max(2, largest * .08));
  if (!bodies.length || bodies.length > 64 || (expected !== undefined && (bodies.length !== expected || components.filter(c => c.count >= Math.max(2, largest * .15)).length > expected))) return [];
  bodies.sort((a, b) => a.cx - b.cx);
  const groups = new Int32Array(components.length + 1).fill(-1);
  const boxes = bodies.map(b => ({ ...b }));
  bodies.forEach((b, i) => { groups[b.id] = i; });
  for (const c of components) {
    if (groups[c.id] >= 0 || c.count < Math.max(2, largest * .0001)) continue;
    // A thin stray at the image edge must not enlarge the final frame all
    // the way to the border and shrink an otherwise correctly-sized actor.
    if (c.x0 === 0 || c.y0 === 0 || c.x1 === w - 1 || c.y1 === h - 1) continue;
    let best = -1, distance = Infinity;
    bodies.forEach((b, i) => {
      const dy = Math.max(0, b.y0 - c.y1, c.y0 - b.y1);
      const score = Math.abs(c.cx - b.cx) + dy * .25;
      if (score < distance) { best = i; distance = score; }
    });
    const b = bodies[best];
    const gap = Math.hypot(Math.max(0, b.x0 - c.x1, c.x0 - b.x1), Math.max(0, b.y0 - c.y1, c.y0 - b.y1));
    if (gap > Math.max(8, (b.y1 - b.y0) * .18)) continue;
    groups[c.id] = best;
    const box = boxes[best]; box.x0 = Math.min(box.x0, c.x0); box.x1 = Math.max(box.x1, c.x1); box.y0 = Math.min(box.y0, c.y0); box.y1 = Math.max(box.y1, c.y1);
  }
  const frames = boxes.map(b => ({ x: b.x0, y: b.y0, w: b.x1 - b.x0 + 1, h: b.y1 - b.y0 + 1,
    data: new Uint8ClampedArray((b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1) * 4) }));
  for (let p = 0; p < labels.length; p++) {
    const group = labels[p] ? groups[labels[p]] : -1;
    if (group < 0) continue;
    const f = frames[group], target = ((Math.floor(p / w) - f.y) * f.w + p % w - f.x) * 4;
    f.data.set(data.subarray(p * 4, p * 4 + 4), target);
  }
  return frames;
}

/** Evenly-spaced frame bands across the CONTENT span of a keyed image —
 * the author's override when gap-detection finds the wrong number of
 * sprites (two figures touching merge into one run; a stray speck splits
 * one in two). Finds the first/last occupied column and divides that span
 * into `n` equal bands. Returns [] when nothing survived the key. */
export function evenFrameRuns(img: ImageData, n: number): Array<[number, number]> {
  const count = Math.max(1, Math.round(n));
  const { width: w, height: h, data } = img;
  let first = -1;
  let last = -1;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (first < 0) first = x;
        last = x;
        break;
      }
    }
  }
  if (first < 0) return [];
  const span = last + 1 - first;
  const band = span / count;
  const out: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) out.push([Math.round(first + i * band), Math.round(first + (i + 1) * band)]);
  return out;
}

/** Derived feathering for the auto-build strength slider: presets average
 * ~65% of the tolerance (gentle 25/35, normal 40/60, strong 50/90). */
export function softnessForStrength(tolerance: number): number {
  return Math.max(10, Math.round(tolerance * 0.65));
}

/** Decode a dropped/picked File into raw pixels + an object-url-free data
 * url. Shared by the auto-build preview (SheetEditor) and callers that want
 * to re-key the source per slider move instead of re-encoding passes. */
export async function fileToImageData(file: File): Promise<{ data: ImageData; url: string }> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("couldn't read that file"));
    reader.readAsDataURL(file);
  });
  const img = await loadImage(url);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, c.width, c.height), url };
}

function presetAnimations(kind: ForgeKind, n: number): ForgedSheet["animations"] {
  const all = Array.from({ length: n }, (_, i) => i);
  switch (kind) {
    case "talking":
      // Convention from the built-in casts: last frame = mouth closed (rest).
      return n >= 3
        ? { rest: { frames: [n - 1] }, talk: { frames: [0, 1, n - 1, 1], fps: 7 } }
        : { rest: { frames: [n - 1] }, talk: { frames: all, fps: 7 } };
    case "walk":
      return { walk: { frames: all, fps: 10 }, idle: { frames: [0] } };
    case "loop":
      return { loop: { frames: all, fps: 7 } };
    case "single":
      return { loop: { frames: [0] } };
  }
}

/** Optional keying overrides for forgeSpriteSheet. */
export interface ForgeOptions {
  /** Flat RGB key for unshadowed backdrops (retains dark props); default
   * chroma key also removes shadowed backdrop. Always match preview/build. */
  keyMode?: "chroma" | "flat";
  /** Separate disconnected silhouettes, even when their x-ranges overlap.
   * Cannot unmix figures actually touching in the source. */
  islands?: boolean;
  /** colour distance treated as backdrop (default 60). Lower = gentler —
   * keeps more of the art; higher = stronger — eats further into it. */
  tolerance?: number;
  /** feathered band beyond the tolerance (default 40) */
  softness?: number;
  /** OUTPUT FRAME HEIGHT CAP (px). 0 / undefined = the classic per-kind
   *  presets (256 loop / 480 single / 384 otherwise, which also UPSCALE
   *  small art — legacy behaviour, unchanged). Any other value: frames come
   *  out at `min(cap, tallest source frame)` — big art keeps its detail up
   *  to the cap, small art is never upscaled into blur. */
  targetHeight?: number;
  /** The exact backdrop colour to key. When omitted the corners are sampled —
   *  but any UI that shows a live preview MUST pass the same colour it previewed,
   *  or the build silently differs from what the author signed off. */
  key?: Rgb;
  /** Author-chosen sprite count. When set (and kind !== "single"), the
   *  content span is sliced into this many EVEN bands instead of the gap
   *  detection — the fix for "I uploaded 5 sprites and it found 4"
   *  (touching figures merge into one transparent-gap run). The preview
   *  shows the bands live, so authors see the split before applying. */
  frameCount?: number;
  /** Preserve relative pose heights (one common scale), bottom-align feet.
   * Stops a crouch/gesture from being stretched to the standing pose's height. */
  preserveScale?: boolean;
  /** Reduce coloured-key rim on opaque edges; keep interior colour and alpha. */
  despill?: boolean;
}

/** Shared with asset preparation/tests: no DOM, no independently stretched
 * poses. The legacy mode remains available for loosely drawn character plates. */
export function forgeFrameLayout(crops: Array<{ w: number; h: number }>, height: number, preserveScale = false) {
  const tallest = Math.max(1, ...crops.map(c => c.h));
  const sizes = crops.map(c => {
    const scale = height / (preserveScale ? tallest : Math.max(1, c.h));
    return { w: Math.max(1, Math.round(c.w * scale)), h: Math.max(1, Math.round(c.h * scale)) };
  });
  const frameWidth = Math.max(1, ...sizes.map(c => c.w));
  return { frameWidth, frameHeight: height, frames: sizes.map((c, i) => ({
    ...c, x: i * frameWidth + Math.round((frameWidth - c.w) / 2), y: height - c.h,
  })) };
}

/** Named strengths for the auto-key, surfaced anywhere auto-build runs. */
export const FORGE_STRENGTHS: { id: string; label: string; tolerance: number; softness: number }[] = [
  { id: "gentle", label: "gentle (keeps detail)", tolerance: 35, softness: 25 },
  { id: "normal", label: "normal", tolerance: 60, softness: 40 },
  { id: "strong", label: "strong (dirty backdrop)", tolerance: 90, softness: 50 },
];

/** Output sizes for the forged sheet, surfaced anywhere auto-build runs.
 *  `height` is the FRAME HEIGHT CAP passed to forgeSpriteSheet (0 = the
 *  classic per-kind presets). "source" is a huge cap that in practice means
 *  "keep every pixel the source has" — for authors who bring big art. */
export const FORGE_SIZES: { id: string; label: string; height: number }[] = [
  { id: "standard", label: "standard (light files · 256–480px)", height: 0 },
  { id: "hd", label: "HD (up to 512px)", height: 512 },
  { id: "big", label: "big (up to 1024px)", height: 1024 },
  { id: "source", label: "source size (no downscale)", height: 8192 },
];

/** The whole job in one call: key the backdrop, find the frames, crop and
 * scale them to a uniform bottom-aligned grid, and hand back the sheet PNG
 * with engine-ready animations. Throws with a readable message when the
 * image doesn't cut cleanly (e.g. the backdrop wasn't flat). */
export async function forgeSpriteSheet(imageUrl: string, kind: ForgeKind, options?: ForgeOptions): Promise<ForgedSheet> {
  const img = await loadImage(imageUrl);
  const stage = document.createElement("canvas");
  stage.width = img.naturalWidth;
  stage.height = img.naturalHeight;
  const sctx = stage.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("canvas unavailable");
  sctx.drawImage(img, 0, 0);
  const src = sctx.getImageData(0, 0, stage.width, stage.height);

  // Prefer an explicit key from the caller (the SheetEditor preview the author
  // actually tuned). Falling back to a fresh corner sample here used to mean the
  // built sheet was keyed differently from the preview the author approved.
  const keyColour = options?.key ?? sampleCorners(src.data, src.width, src.height);
  const keyed = applyKey(src, keyColour, options?.tolerance ?? 60, options?.softness ?? 40, options?.keyMode);
  if (options?.despill) keyed.data.set(despillEdges(keyed.data, keyed.width, keyed.height, keyColour));
  const keyedCanvas = document.createElement("canvas");
  keyedCanvas.width = src.width;
  keyedCanvas.height = src.height;
  keyedCanvas.getContext("2d")!.putImageData(keyed, 0, 0);

  const forced = kind !== "single" && options?.frameCount && options.frameCount > 0 ? Math.round(options.frameCount) : 0;
  if (options?.islands && kind !== "single") {
    const frames = spriteIslands(keyed, forced || undefined);
    if (!frames.length) throw new Error("Silhouettes could not be separated at this count. Check the source: touching figures need manual editing; do not force a misleading strip cut.");
    const cap = options.targetHeight ?? 0;
    const height = cap > 0 ? Math.max(64, Math.min(cap, Math.max(...frames.map(f => f.h)))) : kind === "loop" ? 256 : 384;
    const layout = forgeFrameLayout(frames, height, options.preserveScale);
    const canvas = document.createElement("canvas"); canvas.width = layout.frameWidth * frames.length; canvas.height = height;
    const ctx = canvas.getContext("2d")!; ctx.imageSmoothingQuality = "high";
    frames.forEach((f, i) => {
      const piece = document.createElement("canvas"); piece.width = f.w; piece.height = f.h;
      piece.getContext("2d")!.putImageData(new ImageData(f.data, f.w, f.h), 0, 0);
      const d = layout.frames[i]; ctx.drawImage(piece, d.x, d.y, d.w, d.h);
    });
    return { dataUrl: canvas.toDataURL("image/png"), frameWidth: layout.frameWidth, frameHeight: height,
      frameCount: frames.length, animations: presetAnimations(kind, frames.length) };
  }
  const runs =
    kind === "single"
      ? [[0, src.width] as [number, number]]
      : forced
        ? evenFrameRuns(keyed, forced)
        : frameRuns(keyed);
  if (!runs.length) throw new Error("no frames found — the backdrop didn't key out (is it a flat colour?)");

  // Crop each frame to its own content.
  const kctx = keyedCanvas.getContext("2d", { willReadFrequently: true })!;
  const crops: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (const [x0, x1] of runs) {
    const slice = kctx.getImageData(x0, 0, Math.max(1, x1 - x0), src.height);
    const b = contentBounds(slice);
    if (b) crops.push({ x: x0 + b.x, y: b.y, w: b.w, h: b.h });
  }
  if (!crops.length) throw new Error("frames were empty after cutting out the backdrop");

  // Uniform grid: everything scaled to one height, bottom-centre aligned.
  // The height comes from the author's output-size choice (a CAP — big art
  // keeps its pixels up to it, small art is never upscaled into blur), or
  // falls back to the classic per-kind presets when no cap is given.
  const cap = options?.targetHeight ?? 0;
  const targetH =
    cap > 0
      ? Math.max(64, Math.min(cap, Math.max(...crops.map((c) => c.h))))
      : kind === "loop" ? 256 : kind === "single" ? 480 : 384;
  const layout = forgeFrameLayout(crops, targetH, options?.preserveScale);
  const fw = layout.frameWidth;
  const sheet = document.createElement("canvas");
  sheet.width = fw * crops.length;
  sheet.height = targetH;
  const octx = sheet.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  crops.forEach((c, i) => {
    const dest = layout.frames[i];
    octx.drawImage(keyedCanvas, c.x, c.y, c.w, c.h, dest.x, dest.y, dest.w, dest.h);
  });

  return {
    dataUrl: sheet.toDataURL("image/png"),
    frameWidth: fw,
    frameHeight: targetH,
    frameCount: crops.length,
    animations: presetAnimations(kind, crops.length),
  };
}
