// Cleans the rim some generated plates carry, without touching the framing or the aspect.
//
//   node tools/trim-plate-borders.mjs [--dry] [--inset 2.5] [dir …]
//
// Two things showed up in the second-pass plates and both read as a light leak at the frame edge in a night
// scene:
//   * a hard white paper border (a model painting "a watercolour on paper" leaves the sheet edge in), and
//   * a soft pale vignette, the same thing painted rather than cropped, fading over the outer 10–20 px.
//
// A fuzz-trim eats into the art on the soft case, so each plate is measured instead: the mean luminance of the
// outer rim against a band a little further in. A rim materially paler than the picture is cropped by `--inset`
// percent and scaled back to its own size, which removes the leak and changes nothing else. Plates that are
// already clean are left byte-for-byte alone. Every changed plate keeps its untrimmed original in `alt/`.
//
// Run it after new plates land, then wire them in:
//   node tools/trim-plate-borders.mjs && node tools/retake-reel-pictures.mjs hangar
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const INSET = args.includes("--inset") ? Number(args[args.indexOf("--inset") + 1]) : 2.5;
const DIRS = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--inset");
const ROOTS = DIRS.length
  ? DIRS
  : ["public/reels/hangar/img/hangar-v2/shots", "public/reels/hangar/img/hangar-v2/backgrounds"];

const has = bin => {
  try {
    execFileSync(bin, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const IM = has("magick") ? "magick" : has("convert") ? "convert" : null;
const IDENTIFY = has("magick") ? "magick" : has("identify") ? "identify" : null;
if (!IM || !IDENTIFY) {
  console.error("needs ImageMagick (magick/convert/identify) on the PATH");
  process.exit(1);
}

const mean = (file, crop) =>
  Number(execFileSync(IM, [file, "-crop", crop, "+repage", "-colorspace", "Gray", "-format", "%[fx:mean*255]", "info:"]).toString());

/** Rim brightness against a band just inside it, both sides and top/bottom. */
function rim(file) {
  const [w, h] = execFileSync(IDENTIFY, ["-format", "%w %h", file]).toString().trim().split(" ").map(Number);
  const b = Math.max(4, Math.round(w * 0.008));
  const inset = Math.round(w * 0.04);
  const outer = (mean(file, `${w}x${b}+0+0`) + mean(file, `${w}x${b}+0+${h - b}`) + mean(file, `${b}x${h}+0+0`) + mean(file, `${b}x${h}+${w - b}+0`)) / 4;
  const inner = (mean(file, `${w - 2 * inset}x${b}+${inset}+${inset}`) + mean(file, `${b}x${h - 2 * inset}+${inset}+${inset}`) + mean(file, `${b}x${h - 2 * inset}+${w - inset - b}+${inset}`)) / 3;
  return { w, h, outer, inner, ratio: inner > 1 ? outer / inner : 1 };
}

let changed = 0;
let seen = 0;
for (const dir of ROOTS) {
  const abs = resolve(root, dir);
  if (!existsSync(abs)) continue;
  for (const name of readdirSync(abs).sort()) {
    if (!/\.(jpe?g|png)$/i.test(name)) continue;
    const file = join(abs, name);
    if (!statSync(file).isFile()) continue;
    seen++;
    const r = rim(file);
    const pale = r.outer > 60 && r.ratio > 1.55;
    if (!pale) continue;
    const note = `rim ${r.outer.toFixed(0)} vs inner ${r.inner.toFixed(0)} (${r.ratio.toFixed(2)}x)  ${r.w}x${r.h} −${INSET}%`;
    console.log(`${dir.split("/").pop()}/${name.padEnd(34)} ${note}`);
    if (DRY) {
      changed++;
      continue;
    }
    const alt = resolve(root, "public/reels/hangar/img/hangar-v2/alt");
    execFileSync(IM, [file, join(alt, name.replace(/\.(jpe?g|png)$/i, "--untrimmed.jpg"))]);
    const dx = Math.round(r.w * (INSET / 100));
    const dy = Math.round(r.h * (INSET / 100));
    execFileSync(IM, [
      file,
      "-crop", `${r.w - 2 * dx}x${r.h - 2 * dy}+${dx}+${dy}`, "+repage",
      "-resize", `${r.w}x${r.h}!`,
      "-quality", "92",
      file,
    ]);
    changed++;
  }
}

console.log(`\n${seen} plate(s) checked, ${changed} cleaned${DRY ? " (dry run)" : ""}`);
if (changed && !DRY) console.log("next: node tools/retake-reel-pictures.mjs hangar");
