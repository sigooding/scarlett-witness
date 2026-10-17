// Puts a new picture (a retake or a new shot) into the film without ever making it smaller.
//
//   FFMPEG=/path/to/ffmpeg node tools/install-film-picture.mjs <source image> public/film/img/<scene>/<name>.jpg
//
// The director asked on 17 October 2026 that pictures are never downscaled. So the source is only ever cropped to an exact
// 16:9 (centred, the fewest pixels possible) and, if that leaves it under the house size of 1920×1080, enlarged to 1920×1080
// (Lanczos). A source that is 1920 wide or more keeps every pixel it has after the crop: a 2752×1536 picture installs at
// 2752×1536, not 1920×1080. A 16:9 JPEG that big is copied byte for byte (no re-encode). Anything else is written as JPEG at
// ffmpeg's best quality (-q:v 1). The depth camera only needs a picture's map and plates to share its aspect, not its size
// (scripts/film-depth.entry.ts), so a bigger picture works everywhere a 1920×1080 one does.
//
// A picture already at the destination is first copied to public/film/img/archive/<scene>/<name>--v<N>.jpg (next free N);
// the archive is never written over. The tool refuses if the result would have fewer pixels than the cropped source.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const HOUSE_W = 1920, HOUSE_H = 1080;

const [src, destArg] = process.argv.slice(2);
if (!src || !destArg) {
  console.error("usage: node tools/install-film-picture.mjs <source image> public/film/img/<scene>/<name>.jpg");
  process.exit(2);
}
const dest = resolve(root, destArg);
const imgRoot = resolve(root, "public/film/img");
const rel = relative(imgRoot, dest);
if (rel.startsWith("..") || rel.startsWith("archive") || extname(dest).toLowerCase() !== ".jpg") {
  console.error(`destination must be a .jpg under public/film/img/ (not the archive): ${destArg}`);
  process.exit(2);
}

/** Width and height of an image, read from ffmpeg's stream line. */
function size(path) {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-i", path], { encoding: "utf8" });
  const m = /Video: (\w+).*?, (\d{2,5})x(\d{2,5})/.exec(r.stderr || "");
  if (!m) throw new Error(`cannot read the size of ${path} (is FFMPEG set?)\n${r.stderr}`);
  return { codec: m[1], w: +m[2], h: +m[3] };
}

const s = size(src);
// The exact 16:9 crop that keeps the most pixels.
let cw = s.w, ch = Math.round((s.w * 9) / 16);
if (ch > s.h) { ch = s.h; cw = Math.round((s.h * 16) / 9); }
const enlarge = cw < HOUSE_W;
const out = enlarge ? { w: HOUSE_W, h: HOUSE_H } : { w: cw, h: ch };
if (out.w * out.h < cw * ch) throw new Error(`refusing to shrink ${cw}×${ch} to ${out.w}×${out.h}`);

if (existsSync(dest)) {
  const dir = resolve(imgRoot, "archive", dirname(rel));
  mkdirSync(dir, { recursive: true });
  const stem = basename(dest, ".jpg");
  let n = 1;
  while (existsSync(resolve(dir, `${stem}--v${n}.jpg`))) n++;
  copyFileSync(dest, resolve(dir, `${stem}--v${n}.jpg`));
  console.log(`archived the old picture as ${relative(root, resolve(dir, `${stem}--v${n}.jpg`))}`);
}
mkdirSync(dirname(dest), { recursive: true });

if (s.codec === "mjpeg" && cw === s.w && ch === s.h && !enlarge) {
  copyFileSync(src, dest);
} else {
  const vf = [`crop=${cw}:${ch}:${Math.floor((s.w - cw) / 2)}:${Math.floor((s.h - ch) / 2)}`];
  if (enlarge) vf.push(`scale=${HOUSE_W}:${HOUSE_H}:flags=lanczos`);
  const r = spawnSync(ffmpeg, ["-v", "error", "-y", "-i", src, "-vf", vf.join(","), "-q:v", "1", "-frames:v", "1", dest], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr);
}
const d = size(dest);
if (d.w * d.h < cw * ch) throw new Error(`installed picture is ${d.w}×${d.h}, smaller than the source's ${cw}×${ch}`);
console.log(`${relative(root, dest)}: ${s.w}×${s.h} → ${d.w}×${d.h}${enlarge ? " (enlarged to the house size)" : cw === s.w && ch === s.h ? " (full size)" : " (cropped to 16:9, full size)"}`);
