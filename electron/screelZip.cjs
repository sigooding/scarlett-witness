/**
 * `.screel` case bundles — a zip (STORE, no compression) of:
 *
 *   story.json   the case JSON (asset: refs, no inlined dataUrls)
 *   media.json   [{ id, name, type, size, uploadedAt, folder?, file }]
 *   media/<id>-<name>.<ext>   the binary files
 *
 * JSON stays the source of truth; the zip is just a folder with a zipper.
 * `.reel.json` (inlined base64 assets) remains importable forever.
 *
 * No third-party zip library — STORE is enough (jpg/mp3/mp4 are already
 * compressed) and keeps the writer tiny enough to live in the Electron main
 * process without a bundler.
 */

const zlib = require("node:zlib");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  const bytes = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function slugPart(value, fallback = "asset") {
  return (
    String(value || fallback)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

function extensionFor(name, mimeType) {
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

function mimeFrom(name, type, mime) {
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

function packZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(String(file.name), "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(0, 8); // STORE
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    const localFile = Buffer.concat([local, name, data]);
    localParts.push(localFile);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(Buffer.concat([central, name]));
    offset += localFile.length;
  }
  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDir, eocd]);
}

function findEocd(buf) {
  // EOCD is 22 bytes plus an optional comment. Scan back from the end.
  const min = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i;
  }
  return -1;
}

function unpackZip(buf) {
  const bytes = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  const eocd = findEocd(bytes);
  if (eocd < 0) throw new Error("Not a zip (no end-of-central-directory).");
  const count = bytes.readUInt16LE(eocd + 10);
  let p = bytes.readUInt32LE(eocd + 16);
  const files = [];
  for (let i = 0; i < count; i++) {
    if (bytes.readUInt32LE(p) !== 0x02014b50) throw new Error("Corrupt zip (bad central directory).");
    const method = bytes.readUInt16LE(p + 10);
    const compSize = bytes.readUInt32LE(p + 20);
    const nameLen = bytes.readUInt16LE(p + 28);
    const extraLen = bytes.readUInt16LE(p + 30);
    const commentLen = bytes.readUInt16LE(p + 32);
    const localOff = bytes.readUInt32LE(p + 42);
    const name = bytes.slice(p + 46, p + 46 + nameLen).toString("utf8").replace(/\\/g, "/");
    p += 46 + nameLen + extraLen + commentLen;

    if (bytes.readUInt32LE(localOff) !== 0x04034b50) throw new Error(`Corrupt zip (bad local header for ${name}).`);
    const localNameLen = bytes.readUInt16LE(localOff + 26);
    const localExtraLen = bytes.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + localNameLen + localExtraLen;
    let data = bytes.slice(dataStart, dataStart + compSize);
    if (method === 8) {
      data = zlib.inflateRawSync(data);
    } else if (method !== 0) {
      throw new Error(`Unsupported zip compression (${method}) for ${name}.`);
    }
    files.push({ name, data });
  }
  return files;
}

function isZipBuffer(buf) {
  if (!buf || buf.length < 4) return false;
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07);
}

function packScreel({ storyJson, assets }) {
  const json = typeof storyJson === "string" ? storyJson : JSON.stringify(storyJson);
  const list = Array.isArray(assets) ? assets : [];
  const mediaJson = [];
  const files = [{ name: "story.json", data: Buffer.from(json, "utf8") }];
  const used = new Set(["story.json", "media.json"]);
  for (const asset of list) {
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
    const data = Buffer.from(String(asset.base64 || ""), "base64");
    files.push({ name: filename, data });
    mediaJson.push({
      id: String(asset.id || ""),
      name: String(asset.name || filename),
      type: asset.type === "audio" || asset.type === "video" || asset.type === "image" ? asset.type : "image",
      ...(asset.folder ? { folder: String(asset.folder) } : {}),
      size: Number(asset.size) || data.length,
      uploadedAt: Number(asset.uploadedAt) || Date.now(),
      file: filename,
    });
  }
  files.splice(1, 0, { name: "media.json", data: Buffer.from(JSON.stringify(mediaJson, null, 2), "utf8") });
  return packZip(files);
}

function unpackScreel(buf) {
  const files = unpackZip(buf);
  const map = new Map(files.map((f) => [f.name.replace(/\\/g, "/"), f]));
  const storyFile = map.get("story.json");
  if (!storyFile) throw new Error("Not a Scarlet Reel case (.screel): missing story.json.");
  const storyJson = storyFile.data.toString("utf8");
  let manifest = [];
  const mediaFile = map.get("media.json");
  if (mediaFile) {
    try {
      const parsed = JSON.parse(mediaFile.data.toString("utf8"));
      if (Array.isArray(parsed)) manifest = parsed;
    } catch {
      throw new Error("Not a Scarlet Reel case (.screel): media.json is not valid JSON.");
    }
  }
  const assets = [];
  for (const row of manifest) {
    const rel = String(row?.file || "").replace(/\\/g, "/");
    const file = map.get(rel);
    if (!file || !row?.id) continue;
    const mime = mimeFrom(row.name, row.type, row.mime);
    assets.push({
      id: String(row.id),
      name: String(row.name || rel),
      type: row.type === "audio" || row.type === "video" || row.type === "image" ? row.type : "image",
      ...(row.folder ? { folder: String(row.folder) } : {}),
      size: Number(row.size) || file.data.length,
      uploadedAt: Number(row.uploadedAt) || 0,
      dataUrl: `data:${mime};base64,${file.data.toString("base64")}`,
    });
  }
  return { storyJson, assets };
}

module.exports = {
  crc32,
  packZip,
  unpackZip,
  isZipBuffer,
  packScreel,
  unpackScreel,
  slugPart,
  extensionFor,
};
