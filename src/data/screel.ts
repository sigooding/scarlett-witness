/**
 * `.screel` case bundles — zip of `story.json` + `media/` (STORE, no
 * compression). JSON stays the source of truth; the zip is just a folder
 * with a zipper. `.reel.json` (inlined base64 assets) remains importable.
 *
 * This module is the renderer/browser copy of `electron/screelZip.cjs`.
 * Pack here is STORE-only so a browser can download a `.screel` without
 * Node. Unpack understands STORE; Electron's opener also inflates DEFLATE
 * if someone re-zips the folder with OS tools.
 */

import type { MediaAsset, Story } from "../types";

export type ScreelAsset = {
  id: string;
  name: string;
  type: MediaAsset["type"];
  folder?: string;
  size: number;
  uploadedAt: number;
  mime?: string;
  base64: string;
};

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
}
function u32(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
}
function readU16(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8);
}
function readU32(b: Uint8Array, i: number): number {
  return (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
}
function concat(parts: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const utf8 = {
  encode: (s: string) => new TextEncoder().encode(s),
  decode: (b: Uint8Array) => new TextDecoder().decode(b),
};

export function slugPart(value: string, fallback = "asset"): string {
  return (
    String(value || fallback)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

export function extensionFor(name?: string, mimeType?: string): string {
  const ext = String(name || "").match(/(\.[a-zA-Z0-9]{1,8})$/)?.[1]?.toLowerCase() ?? "";
  if (ext && ext.length <= 12) return ext;
  const mime = String(mimeType || "");
  if (/png/i.test(mime)) return ".png";
  if (/jpe?g/i.test(mime)) return ".jpg";
  if (/webp/i.test(mime)) return ".webp";
  if (/gif/i.test(mime)) return ".gif";
  if (/mpeg|mp3/i.test(mime)) return ".mp3";
  if (/wav/i.test(mime)) return ".wav";
  if (/ogg|opus/i.test(mime)) return ".ogg";
  if (/mp4/i.test(mime)) return ".mp4";
  if (/webm/i.test(mime)) return ".webm";
  return "";
}

function mimeFrom(name?: string, type?: string, mime?: string): string {
  if (mime && /^[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+$/.test(mime)) return mime;
  const ext = extensionFor(name, "");
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".ogg") return "audio/ogg";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (type === "audio") return "audio/mpeg";
  if (type === "video") return "video/mp4";
  if (type === "image") return "image/png";
  return "application/octet-stream";
}

export function isZipBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);
}

export function packZip(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = utf8.encode(file.name);
    const data = file.data;
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    localParts.push(local);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    centralParts.push(central);
    offset += local.length;
  }
  const centralDir = concat(centralParts);
  const eocd = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return concat([...localParts, centralDir, eocd]);
}

function findEocd(bytes: Uint8Array): number {
  const min = Math.max(0, bytes.length - 22 - 0xffff);
  for (let i = bytes.length - 22; i >= min; i--) {
    if (readU32(bytes, i) === 0x06054b50) return i;
  }
  return -1;
}

export function unpackZip(bytes: Uint8Array): Array<{ name: string; data: Uint8Array }> {
  const eocd = findEocd(bytes);
  if (eocd < 0) throw new Error("Not a zip (no end-of-central-directory).");
  const count = readU16(bytes, eocd + 10);
  let p = readU32(bytes, eocd + 16);
  const files: Array<{ name: string; data: Uint8Array }> = [];
  for (let i = 0; i < count; i++) {
    if (readU32(bytes, p) !== 0x02014b50) throw new Error("Corrupt zip (bad central directory).");
    const method = readU16(bytes, p + 10);
    const compSize = readU32(bytes, p + 20);
    const nameLen = readU16(bytes, p + 28);
    const extraLen = readU16(bytes, p + 30);
    const commentLen = readU16(bytes, p + 32);
    const localOff = readU32(bytes, p + 42);
    const name = utf8.decode(bytes.subarray(p + 46, p + 46 + nameLen)).replace(/\\/g, "/");
    p += 46 + nameLen + extraLen + commentLen;
    if (readU32(bytes, localOff) !== 0x04034b50) throw new Error(`Corrupt zip (bad local header for ${name}).`);
    if (method !== 0) throw new Error(`Unsupported zip compression (${method}) for ${name}.`);
    const localNameLen = readU16(bytes, localOff + 26);
    const localExtraLen = readU16(bytes, localOff + 28);
    const dataStart = localOff + 30 + localNameLen + localExtraLen;
    files.push({ name, data: bytes.subarray(dataStart, dataStart + compSize) });
  }
  return files;
}

export function packScreel(storyJson: string, assets: ScreelAsset[]): Uint8Array {
  const mediaJson: Array<{
    id: string;
    name: string;
    type: MediaAsset["type"];
    folder?: string;
    size: number;
    uploadedAt: number;
    file: string;
  }> = [];
  const files: Array<{ name: string; data: Uint8Array }> = [{ name: "story.json", data: utf8.encode(storyJson) }];
  const used = new Set(["story.json", "media.json"]);
  for (const asset of assets) {
    const ext = extensionFor(asset.name, asset.mime);
    const stem = slugPart(String(asset.name || "asset").replace(/\.[^.]+$/, ""), "asset");
    const idPart = slugPart(asset.id, "id");
    let filename = `media/${idPart}-${stem}${ext}`;
    let n = 2;
    while (used.has(filename)) {
      filename = `media/${idPart}-${stem}-${n}${ext}`;
      n += 1;
    }
    used.add(filename);
    const binary = Uint8Array.from(atob(asset.base64), (ch) => ch.charCodeAt(0));
    files.push({ name: filename, data: binary });
    mediaJson.push({
      id: asset.id,
      name: asset.name || filename,
      type: asset.type,
      ...(asset.folder ? { folder: asset.folder } : {}),
      size: asset.size || binary.length,
      uploadedAt: asset.uploadedAt || Date.now(),
      file: filename,
    });
  }
  files.splice(1, 0, { name: "media.json", data: utf8.encode(JSON.stringify(mediaJson, null, 2)) });
  return packZip(files);
}

export function unpackScreel(bytes: Uint8Array): { storyJson: string; assets: MediaAsset[] } {
  const files = unpackZip(bytes);
  const map = new Map(files.map((f) => [f.name.replace(/\\/g, "/"), f]));
  const storyFile = map.get("story.json");
  if (!storyFile) throw new Error("Not a Scarlet Reel case (.screel): missing story.json.");
  const storyJson = utf8.decode(storyFile.data);
  let manifest: Array<Record<string, unknown>> = [];
  const mediaFile = map.get("media.json");
  if (mediaFile) {
    const parsed = JSON.parse(utf8.decode(mediaFile.data));
    if (!Array.isArray(parsed)) throw new Error("Not a Scarlet Reel case (.screel): media.json is not a list.");
    manifest = parsed as Array<Record<string, unknown>>;
  }
  const assets: MediaAsset[] = [];
  for (const row of manifest) {
    const rel = String(row.file || "").replace(/\\/g, "/");
    const file = map.get(rel);
    if (!file || !row.id) continue;
    const type = row.type === "audio" || row.type === "video" || row.type === "image" ? row.type : "image";
    const name = String(row.name || rel);
    const mime = mimeFrom(name, type, typeof row.mime === "string" ? row.mime : undefined);
    let bin = "";
    const data = file.data;
    for (let i = 0; i < data.length; i += 0x8000) {
      bin += String.fromCharCode(...data.subarray(i, i + 0x8000));
    }
    assets.push({
      id: String(row.id),
      name,
      type,
      ...(typeof row.folder === "string" && row.folder ? { folder: row.folder } : {}),
      size: Number(row.size) || data.length,
      uploadedAt: Number(row.uploadedAt) || 0,
      dataUrl: `data:${mime};base64,${btoa(bin)}`,
    });
  }
  return { storyJson, assets };
}

function bytesLookLikeJson(bytes: Uint8Array): boolean {
  let i = 0;
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) i = 3;
  while (i < bytes.length && (bytes[i] === 0x20 || bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d)) i += 1;
  return bytes[i] === 0x7b || bytes[i] === 0x5b; // { or [
}

/** Parse a `.screel` zip OR a legacy `.reel.json` into a story + assets. */
export function parseCaseBytes(bytes: Uint8Array, filename = ""): { story: Story; assets: MediaAsset[] } {
  const name = filename.toLowerCase();
  if (isZipBytes(bytes) || name.endsWith(".screel")) {
    const unpacked = unpackScreel(bytes);
    const story = JSON.parse(unpacked.storyJson) as Story;
    if (!story?.id || !Array.isArray(story.scenes)) throw new Error("That .screel is missing a story.");
    const { assets: embedded, ...clean } = story as Story & { assets?: MediaAsset[] };
    return { story: clean, assets: unpacked.assets.length ? unpacked.assets : embedded ?? [] };
  }
  if (!bytesLookLikeJson(bytes) && name && !/\.json$/i.test(name)) {
    throw new Error("That file isn't a Scarlet Reel case.");
  }
  const text = utf8.decode(bytes);
  const parsed = JSON.parse(text) as Story & { assets?: MediaAsset[] };
  if (!parsed?.id || !Array.isArray(parsed.scenes)) throw new Error("That file isn't a valid reel.");
  const { assets, ...story } = parsed;
  return { story, assets: Array.isArray(assets) ? assets : [] };
}

export function dataUrlToScreelAsset(asset: MediaAsset): ScreelAsset {
  const comma = asset.dataUrl.indexOf(",");
  const header = comma >= 0 ? asset.dataUrl.slice(0, comma) : "";
  const mime = header.match(/^data:([^;,]+)/)?.[1];
  const base64 = comma >= 0 ? asset.dataUrl.slice(comma + 1) : asset.dataUrl;
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    folder: asset.folder,
    size: asset.size,
    uploadedAt: asset.uploadedAt,
    mime,
    base64,
  };
}

export function suggestedCaseName(story: { id: string; title?: string }, ext: "screel" | "reel.json" = "screel"): string {
  const clean = String(story.title || story.id)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  return `${clean || story.id}.${ext}`;
}
