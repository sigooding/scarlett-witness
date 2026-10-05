/**
 * `.screel` pack/unpack — zip of story.json + media/, plus a `.reel.json`
 * still-parses check. Exercises the Electron CJS writer (the one that
 * actually hits disk) and the renderer TS copy (browser import / blob).
 *
 *   node scripts/screel-tests.mjs
 */
import { buildSync } from "esbuild";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import zlib from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const require = createRequire(import.meta.url);
const cjs = require(path.join(root, "electron/screelZip.cjs"));

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const png1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const story = {
  id: "test-case",
  title: "The Test Case",
  tagline: "A zip with a zipper.",
  coverImage: "asset:cover-1",
  startSceneId: "s1",
  scenes: [{ id: "s1", title: "Alley", body: "Rain.", background: "asset:cover-1", choices: [] }],
  items: [],
  characters: [],
};

const assets = [
  {
    id: "cover-1",
    name: "cover.png",
    type: "image",
    mime: "image/png",
    size: Buffer.from(png1x1, "base64").length,
    uploadedAt: 1,
    base64: png1x1,
  },
  {
    id: "voice-1",
    name: "line.mp3",
    type: "audio",
    mime: "audio/mpeg",
    folder: "voices",
    size: 4,
    uploadedAt: 2,
    base64: Buffer.from("fffb9000", "hex").toString("base64"),
  },
];

console.log("\n=== SCREEL PACK / UNPACK ===\n");

const zip = cjs.packScreel({ storyJson: JSON.stringify(story), assets });
ok("1.1 pack produces a zip (PK header)", zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 0x03 && zip[3] === 0x04);
ok("1.2 isZipBuffer agrees", cjs.isZipBuffer(zip) === true);
ok("1.3 JSON is NOT a zip", cjs.isZipBuffer(Buffer.from("{\"id\":\"x\"}")) === false);

const unpacked = cjs.unpackScreel(zip);
const roundStory = JSON.parse(unpacked.storyJson);
ok("1.4 story.json round-trips the id", roundStory.id === "test-case" && roundStory.startSceneId === "s1");
ok("1.5 two media files come back", unpacked.assets.length === 2, `got ${unpacked.assets.length}`);
ok("1.6 cover keeps its png bytes", unpacked.assets[0].dataUrl.endsWith(png1x1));
ok("1.7 voice keeps its folder", unpacked.assets[1].folder === "voices");
ok("1.8 story.json has no inlined dataUrls", !unpacked.storyJson.includes("data:image"));

const files = cjs.unpackZip(zip);
const names = files.map((f) => f.name).sort();
ok(
  "1.9 zip contains story.json, media.json, two media files",
  names.includes("story.json") && names.includes("media.json") && names.filter((n) => n.startsWith("media/")).length === 2,
  names.join(", ")
);

// STORE only — compression method 0 in the first local header.
ok("1.10 writer uses STORE (method 0)", zip.readUInt16LE(8) === 0);

// Corrupt zip is refused, not silently parsed as JSON.
let threw = false;
try {
  cjs.unpackScreel(Buffer.from("not a zip"));
} catch {
  threw = true;
}
ok("1.11 garbage is refused", threw);

threw = false;
try {
  cjs.unpackScreel(cjs.packZip([{ name: "readme.txt", data: Buffer.from("hi") }]));
} catch (err) {
  threw = /story\.json/.test(String(err));
}
ok("1.12 a zip without story.json is refused", threw);

// DEFLATE (method 8) still unpacks — someone re-zipped the folder with OS tools.
const raw = zlib.deflateRawSync(Buffer.from(JSON.stringify(story)));
ok("1.13 zlib deflateRaw produced bytes", raw.length > 0);
const inflated = cjs.unpackZip(
  // Use our unpacker on a zip we store; then also pack a method-8 entry via a tiny helper.
  (() => {
    // Local header with method 8 for a single story.json, plus empty media.json STORE.
    const storyBytes = Buffer.from(JSON.stringify(story));
    const comp = zlib.deflateRawSync(storyBytes);
    const crc = cjs.crc32(storyBytes);
    const name = Buffer.from("story.json");
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8); // DEFLATE
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(storyBytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    const localFile = Buffer.concat([local, name, comp]);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(storyBytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    const cd = Buffer.concat([central, name]);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(1, 8);
    eocd.writeUInt16LE(1, 10);
    eocd.writeUInt32LE(cd.length, 12);
    eocd.writeUInt32LE(localFile.length, 16);
    return Buffer.concat([localFile, cd, eocd]);
  })()
);
ok("1.14 DEFLATE story.json inflates", JSON.parse(inflated[0].data.toString()).id === "test-case");

/* ---- renderer TS copy, via esbuild ---- */
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-screel-"));
const outfile = path.join(dir, "screel.mjs");
buildSync({
  entryPoints: [path.join(root, "src/data/screel.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outfile,
  logLevel: "silent",
});
const ts = await import(pathToFileURL(outfile).href);

const tsZip = ts.packScreel(JSON.stringify(story), assets);
ok("2.1 TS pack is a zip", ts.isZipBytes(tsZip));
const tsUnpacked = ts.unpackScreel(tsZip);
ok("2.2 TS unpack sees both assets", tsUnpacked.assets.length === 2);
ok("2.3 CJS pack → TS unpack", ts.unpackScreel(zip).assets.length === 2);
ok("2.4 TS pack → CJS unpack", cjs.unpackScreel(Buffer.from(tsZip)).assets[0].id === "cover-1");

const parsedJson = ts.parseCaseBytes(
  Buffer.from(JSON.stringify({ ...story, assets: [{ id: "cover-1", name: "cover.png", type: "image", dataUrl: "data:image/png;base64," + png1x1, size: 1, uploadedAt: 1 }] })),
  "case.reel.json"
);
ok("2.5 .reel.json still parses", parsedJson.story.id === "test-case" && parsedJson.assets.length === 1);

const parsedScreel = ts.parseCaseBytes(zip, "case.screel");
ok("2.6 parseCaseBytes accepts .screel", parsedScreel.story.title === "The Test Case" && parsedScreel.assets.length === 2);

let parseThrew = false;
try {
  ts.parseCaseBytes(Buffer.from("hello"), "notes.txt");
} catch {
  parseThrew = true;
}
ok("2.7 random files are refused", parseThrew);

ok("2.8 suggested name uses the title", ts.suggestedCaseName(story) === "The Test Case.screel");

// Write a real file and read it back — the path Electron Save uses.
const onDisk = path.join(dir, "The Test Case.screel");
writeFileSync(onDisk, zip);
const fromDisk = cjs.unpackScreel(readFileSync(onDisk));
ok("2.9 disk round-trip keeps the cover", fromDisk.assets[0].id === "cover-1");

rmSync(dir, { recursive: true, force: true });

console.log(`\n=== SCREEL: ${pass} passed, ${fail} failed ===\n`);
process.exit(fail ? 1 : 0);
