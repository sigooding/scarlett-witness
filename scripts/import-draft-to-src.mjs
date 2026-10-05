#!/usr/bin/env node
/**
 * Bake a self-contained Studio export (.reel.json) into the shipped newsstand.
 *
 * A Studio export keeps every custom upload as a base64 row in `assets[]` and
 * references them from the story as `asset:<id>` / `video:asset:<id>`. Those
 * refs only resolve against the importing browser's IndexedDB, which is why an
 * imported copy is fragile (and why progress/media can vanish with storage).
 * A shipped story instead points at real files under `public/`.
 *
 * This script does the translation:
 *   1. writes every bundled asset to `public/uploads/<slug>/<id><ext>`,
 *   2. rewrites each `asset:` / `video:asset:` reference to that file path,
 *   3. emits `src/<out>` as a typed Story module registered on the newsstand.
 *
 * Already-portable references (`/img/`, `/assets/`, `/voices/`, `gradient:`)
 * pass through untouched. The story's `id` is preserved so existing saves keep
 * working.
 *
 *   node scripts/import-draft-to-src.mjs <input.reel.json>
 *
 * The input path is required: large .reel.json drafts are no longer kept in
 * the repo, so export a fresh copy from Studio and point at the file.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!input || !existsSync(input)) {
  console.error(
    "Usage: node scripts/import-draft-to-src.mjs <input.reel.json>\n" +
      "Export a fresh copy from Studio — .reel.json drafts are no longer kept in the repo."
  );
  process.exit(1);
}

const SLUG = "nobodys-witness-draft";
const OUT_TS = path.join(root, "src/data/nobodysWitnessDraft.ts");
const CONST_NAME = "NOBODYS_WITNESS_DRAFT";
const UPLOAD_DIR = path.join(root, "public/uploads", SLUG);
const PUBLIC_PREFIX = `/uploads/${SLUG}`;

const bundle = JSON.parse(readFileSync(input, "utf8"));
const { assets = [], ...story } = bundle;
if (!story.id || !story.scenes?.length) {
  console.error("Input is not a valid .reel.json story bundle (needs id + scenes).");
  process.exit(1);
}

const EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};
const FALLBACK = { image: ".png", audio: ".mp3", video: ".mp4" };

const refFor = new Map(); // asset id -> public path
let written = 0,
  skipped = 0;
mkdirSync(UPLOAD_DIR, { recursive: true });

for (const asset of assets) {
  const m = /^data:([^;,]+);base64,([\s\S]*)$/.exec(asset.dataUrl ?? "");
  if (!m) {
    skipped++;
    continue;
  }
  const mime = m[1];
  const ext = EXT[mime] ?? FALLBACK[asset.type] ?? ".bin";
  const rel = `${asset.id}${ext}`;
  const dest = path.join(UPLOAD_DIR, rel);
  if (!existsSync(dest)) {
    writeFileSync(dest, Buffer.from(m[2], "base64"));
    written++;
  }
  refFor.set(asset.id, `${PUBLIC_PREFIX}/${rel}`);
}

// Rewrite asset references anywhere in the story to real file paths.
let rewritten = 0,
  dangling = 0;
const walk = (v) => {
  if (typeof v === "string") {
    if (v.startsWith("video:asset:")) {
      const p = refFor.get(v.slice("video:asset:".length));
      p ? (rewritten++, (v = "video:" + p)) : dangling++;
      return v;
    }
    if (v.startsWith("asset:")) {
      const p = refFor.get(v.slice("asset:".length));
      p ? (rewritten++, (v = p)) : dangling++;
    }
    return v;
  }
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = walk(val);
    return out;
  }
  return v;
};
const portable = walk(story);

const header = `import type { Story } from "../types";

/**
 * ${portable.title ?? SLUG} — generated from ${path.basename(input)}.
 *
 * DO NOT EDIT BY HAND: regenerate with
 *   node scripts/import-draft-to-src.mjs
 * Bundled media lives under public${PUBLIC_PREFIX}; every reference in this
 * module is a portable path so the story ships as part of the newsstand and
 * never depends on a browser's IndexedDB.
 */
export const ${CONST_NAME}: Story = `;

writeFileSync(OUT_TS, header + JSON.stringify(portable, null, 2) + ";\n");

console.log(
  JSON.stringify(
    {
      input: path.basename(input),
      storyId: portable.id,
      scenes: portable.scenes.length,
      episodes: portable.episodes?.length ?? 0,
      acts: portable.acts?.length ?? 0,
      assetsBundled: assets.length,
      assetFilesWritten: written,
      assetFilesAlreadyPresent: assets.length - written - skipped,
      refsRewritten: rewritten,
      danglingRefs: dangling,
      skippedAssets: skipped,
      out: path.relative(root, OUT_TS),
    },
    null,
    2
  )
);
if (dangling > 0) {
  console.error("WARNING: some asset: references had no bundled row.");
  process.exit(1);
}
