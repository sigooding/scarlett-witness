// node slim-reel.mjs your.reel.json [outDir=public/film/uploads]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";

const [input, out = "public/film/uploads"] = process.argv.slice(2);
if (!input) { console.error("usage: node slim-reel.mjs file.reel.json [outDir]"); process.exit(1); }
const EXT = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/ogg": "ogg", "audio/webm": "webm", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" };
mkdirSync(out, { recursive: true });
const urlBase = "/" + out.replace(/^public\//, "");
const seen = new Map(); let files = 0, bytes = 0;
const walk = v => {
  if (typeof v === "string") {
    const m = /^data:([^;,]+)(?:;[^,]*)?;base64,/.exec(v);
    if (!m) return v;
    const buf = Buffer.from(v.slice(m[0].length), "base64");
    const name = createHash("sha1").update(buf).digest("hex").slice(0, 12) + "." + (EXT[m[1]] || "bin");
    if (!seen.has(name)) { writeFileSync(`${out}/${name}`, buf); seen.set(name, buf.length); files++; bytes += buf.length; }
    return `${urlBase}/${name}`;
  }
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
  return v;
};
const slim = walk(JSON.parse(readFileSync(input, "utf8")));
const target = basename(input).replace(/\.reel\.json$|\.json$/, "") + ".slim.json";
writeFileSync(target, JSON.stringify(slim));
console.log(`${files} files (${(bytes / 1e6).toFixed(1)} MB) written to ${out}; ${target} is ${(readFileSync(target).length / 1e6).toFixed(2)} MB`);