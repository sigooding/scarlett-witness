#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  plate-opt.mjs — one ImageMagick front-door for scene/cover plates.
 *
 *  The AI tab and Studio upload film-still scene backgrounds as PNGs /
 *  JPEGs that are far larger than the browser ever needs (Glass Road's
 *  raw 1672×941 PNGs were ~3 MB each and totalled 38 MB). Nothing in the
 *  engine shrunk them, so every case shipped that weight to the player.
 *  This is the missing step: a small, repeatable, ImageMagick-based
 *  normaliser that resizes, re-encodes, strips metadata and reports the
 *  bytes it saved — the same pipeline we ran by hand on Glass Road.
 *
 *  Requires ImageMagick (`convert` / `identify`) at BUILD time only — the
 *  game ships the output and needs nothing at runtime. Same convention as
 *  art-room/fx-alpha.mjs.
 *
 *  Usage:
 *    # Re-encode one or more plates in place (longest edge <= 1500px, q82):
 *    node scripts/art-room/plate-opt.mjs path/a.png path/b.jpg
 *
 *    # Explicit control:
 *    node scripts/art-room/plate-opt.mjs \
 *        --quality 78 --max 1400 --ext jpg public/assets/foo/*.png
 *
 *    # WebP (smaller, where the runtime can ship it — same filename, .webp):
 *    node scripts/art-room/plate-opt.mjs --ext webp public/assets/foo/bg.png
 *
 *    # Scan an assets dir and list every image over a size threshold:
 *    node scripts/art-room/plate-opt.mjs --check public/assets --fail-over 400
 *
 *  Exit codes: 0 = ok. With --check, 1 when any file exceeds --fail-over.
 *  With an explicit list, files are overwritten (same ext) or written next
 *  to the source (new ext); the originals are never deleted, only replaced.
 * ------------------------------------------------------------------ */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, basename, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const IMG_EXT = /\.(png|jpe?g|webp|gif|tiff?|bmp)$/i;

function die(msg) {
  console.error(`plate-opt: ${msg}`);
  process.exitCode = 1;
}

/** Require ImageMagick up front with an actionable error (mirrors zone-map.mjs). */
function requireMagick() {
  const r = spawnSync("convert", ["-version"], { stdio: "ignore" });
  if (r.status !== 0) {
    die("ImageMagick `convert` was not found on PATH. Install it — e.g. `apt install imagemagick` (Debian/Ubuntu) or `brew install imagemagick` (macOS). This is a build-time asset tool only; the game needs nothing at runtime.");
    return false;
  }
  return true;
}

function convert(args) {
  const r = spawnSync("convert", args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr?.trim() || `convert failed: ${args.join(" ")}`);
}

function runConvert(args) {
  try {
    convert(args);
    return true;
  } catch (e) {
    die(`failed to convert: ${e.message}`);
    return false;
  }
}

function kb(p) {
  return (statSync(p).size / 1024).toFixed(0) + "KB";
}

function collectFiles(paths) {
  const out = [];
  for (const p of paths) {
    if (!existsSync(p)) {
      console.warn(`plate-opt: skipping missing path "${p}"`);
      continue;
    }
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const f of readdirSync(p)) {
        const full = join(p, f);
        if (statSync(full).isFile() && IMG_EXT.test(f)) out.push(full);
      }
    } else if (IMG_EXT.test(p)) {
      out.push(p);
    }
  }
  return out;
}

/* ------------------------------- check ----------------------------- */
function runCheck(dir, failOverKb) {
  if (!requireMagick()) return;
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return die(`--check target "${dir}" is not a directory`);
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(d, e.name)) : IMG_EXT.test(e.name) ? [join(d, e.name)] : []
    );
  const files = walk(dir);
  const rows = files
    .map((f) => {
      const r = spawnSync("identify", ["-format", "%w %h", f], { encoding: "utf8" });
      const [w = "?", h = "?"] = r.status === 0 ? r.stdout.trim().split(/\s+/) : ["?", "?"];
      return { f, kb: statSync(f).size / 1024, w, h };
    })
    .filter((x) => x.kb > (failOverKb ?? 400));
  rows.sort((a, b) => b.kb - a.kb);
  console.log(`plate-opt --check ${dir}  (reporting images over ${failOverKb ?? 400} KB)\n`);
  if (!rows.length) {
    console.log("  ✓ no oversized plates found.");
    return;
  }
  let total = 0;
  for (const r of rows) {
    console.log(`  ${String(r.kb.toFixed(0)).padStart(6)}KB  ${r.w}×${r.h}  ${r.f}`);
    total += r.kb;
  }
  console.log(`\n  ${rows.length} plate(s), ~${total.toFixed(0)} KB combined — run plate-opt on them to shrink.`);
  process.exitCode = 1; // signals CI: act on the report
}

/* ---------------------------- normalize ---------------------------- */
function runOptimize(files, { quality, max, ext }) {
  if (!files.length) return console.log("plate-opt: no matching image files.");
  if (!requireMagick()) return;
  const target = (ext ?? "auto").toLowerCase();
  let before = 0;
  let after = 0;
  const log = [];
  for (const src of files) {
    try {
      const cur = extname(src).toLowerCase();
      const keep = target === "auto" || (target === "jpg" && cur === ".jpeg");
      const outExt = keep ? cur : target === "jpg" ? ".jpg" : target === "png" ? ".png" : target === "webp" ? ".webp" : cur;
      const out = outExt === cur ? src : join(dirname(src), basename(src, extname(src)) + outExt);
      const b = statSync(src).size;
      before += b;
      const args = [src];
      args.push("-auto-orient", "-strip", "-resize", `${max}x${max}>`, "-quality", String(quality));
      if (target === "png") args.push("-define", "png:compression-level=9");
      args.push(out);
      if (!runConvert(args)) return;
      const a = statSync(out).size;
      after += a;
      log.push([src, out, b, a]);
    } catch (e) {
      die(`${e.message}`);
      return;
    }
  }
  const saved = before - after;
  console.log(`plate-opt · ${files.length} plate(s) · q${quality} · max ${max}px\n`);
  for (const [src, out, b, a] of log) {
    const pct = b ? ((1 - a / b) * 100).toFixed(0) : 0;
    console.log(`  ${String((a / 1024).toFixed(0)).padStart(6)}KB  (-${pct}%)  ${out === src ? "(in place)" : "-> " + out}  ${src}`);
  }
  console.log(`\n  total ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB   (${saved > 0 ? "-" : "+"}${(Math.abs(saved) / 1024).toFixed(0)} KB)`);
}

/* ------------------------------ args ------------------------------- */
const argv = process.argv.slice(2);
const val = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
// Flags that carry a value — their following token is not a file path.
const VALUED = new Set(["check", "fail-over", "quality", "max", "ext"]);
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    if (VALUED.has(a.slice(2))) i += 1; // skip this flag's value
    continue;
  }
  positional.push(a);
}

if (argv.includes("--check")) {
  const dir = val("check", null);
  runCheck(dir ?? "public/assets", Number(val("fail-over", "400")));
} else {
  const files = collectFiles(positional);
  runOptimize(files, {
    quality: Number(val("quality", "82")),
    max: Number(val("max", "1500")),
    ext: val("ext", "auto"),
  });
}
