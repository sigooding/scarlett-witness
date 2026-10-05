/* Measures what a colour key actually does to a plate: how much came off, and
 * crucially how much of the SUBJECT it destroyed. Produces the real numbers the
 * Art Room demo quotes, so the teaching text is never hand-waved.
 *
 * The subject-damage figure is the point: a backdrop whose corners agree can
 * still be un-keyable, because the same colour appears inside the artwork. */
import fs from "node:fs";
import { decodePng, sampleCorners, applyKey } from "./forge-sheet.mjs";

for (const path of process.argv.slice(2)) {
  const img = decodePng(fs.readFileSync(path));
  const { width: w, height: h, data } = img;
  const key = sampleCorners(data, w, h);

  // Edge spread: mean distance of border pixels from the chosen key.
  let sum = 0, n = 0;
  const acc = (x, y) => {
    const i = (y * w + x) * 4;
    sum += Math.hypot(data[i] - key.r, data[i + 1] - key.g, data[i + 2] - key.b);
    n++;
  };
  for (let x = 0; x < w; x++) { acc(x, 0); if (h > 1) acc(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { acc(0, y); if (w > 1) acc(w - 1, y); }
  const spread = sum / n;

  const keyed = applyKey(img, key, 90, 45);
  let cleared = 0, total = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 8) { total++; if (keyed.data[i] <= 8) cleared++; }
  }
  const pct = (cleared / total) * 100;

  // SUBJECT DAMAGE, measured properly: holes the key punched INSIDE the art.
  // A removed pixel that cannot be reached from the image border by walking
  // through other removed pixels is not backdrop — it's a bite taken out of the
  // subject (the key colour also occurring in the artwork). This is exactly the
  // difference between COLOUR KEY and EDGE FLOOD, so it is the honest number.
  const removed = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] > 8 && keyed.data[i * 4 + 3] <= 8) removed[i] = 1;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (i) => { if (removed[i] && !seen[i]) { seen[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  let holes = 0;
  for (let i = 0; i < w * h; i++) if (removed[i] && !seen[i]) holes++;
  // Express holes against the surviving subject, not the whole plate.
  let kept = 0;
  for (let i = 0; i < w * h; i++) if (keyed.data[i * 4 + 3] > 8) kept++;
  const dmg = kept + holes > 0 ? (holes / (kept + holes)) * 100 : 0;
  const verdict = dmg > 8
    ? `RISKY — key punches ${dmg.toFixed(0)}% of the subject into holes`
    : spread < 30 ? "FLAT (ideal — clean cut)" : "slightly graded";

  console.log(
    `${path.split("/").pop().padEnd(28)} spread=${spread.toFixed(1).padStart(5)} ` +
    `removed=${pct.toFixed(1).padStart(5)}% subject-damage=${dmg.toFixed(1).padStart(5)}%  ${verdict}`
  );
}
